import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { DataSource } from 'typeorm';
import { Pedido, StatusPedido } from '../pedidos/entidades/pedido.entity';

export interface PayloadDoPagamento {
  idDoPedido: string;
  idDoUsuario: string;
  valorTotal: number;
}

@Processor('fila-de-pagamento')
export class ProcessadorDePagamentos extends WorkerHost {
  private readonly logger = new Logger(ProcessadorDePagamentos.name);

  // Injetamos a conexão do TypeORM para checar o estado real do pedido
  constructor(
    private dataSource: DataSource,
    // Injetamos a fila da PRÓXIMA etapa do processo
    @InjectQueue('fila-de-estoque') private filaDeEstoque: Queue,
  ) {
    super();
  }

  async process(job: Job<PayloadDoPagamento, any, string>): Promise<any> {
    const tentativaAtual = job.attemptsMade + 1;
    this.logger.log(
      `[Tentativa ${tentativaAtual}] Processando pagamento para o Pedido ID: ${job.data.idDoPedido}`,
    );

    // Barreira de Idempotência do Worker: Valida se o pedido já não foi pago antes
    const pedido = await this.dataSource.manager.findOne(Pedido, {
      where: { id: job.data.idDoPedido },
    });

    if (!pedido) {
      throw new Error('Pedido não encontrado no banco de dados');
    }

    if (pedido.status !== StatusPedido.PENDENTE) {
      this.logger.warn(
        `Pedido ${pedido.id} já se encontra no status ${pedido.status}. Processamento ignorado.`,
      );
      return { status: 'IGNORADO_POR_IDEMPOTENCIA' };
    }

    // 2. Simulação 1: Erro persistente para forçar a ida para a DLQ
    if (job.data.idDoUsuario === 'usuario-falha-certa') {
      this.logger.error('Falha crítica simulada (ex: Cartão Bloqueado).');
      throw new Error('Pagamento recusado pela operadora.');
    }

    // 3. Simulação 2: Erro transitório para testar o Retry com Backoff
    // Vai falhar na 1ª tentativa, mas terá sucesso na 2ª.
    if (job.attemptsMade === 0) {
      this.logger.warn('Timeout simulado de rede com o Gateway de Pagamentos.');
      throw new Error('Timeout de comunicação.');
    }

    // Simulação de tempo de processamento de um Gateway de Pagamento
    await new Promise((resolve) => setTimeout(resolve, 2000));

    pedido.status = StatusPedido.PAGO;
    await this.dataSource.manager.save(pedido);

    this.logger.log(
      `Pagamento APROVADO! Pedido ID: ${pedido.id} atualizado para PAGO.`,
    );

    // COREOGRAFIA: Pagamento aprovado, mandamos para o worker de Estoque trabalhar!
    // Usamos o id do pedido como jobId no BullMQ para evitar que o estoque seja duplicado na fila
    await this.filaDeEstoque.add(
      'reservar-estoque',
      { idDoPedido: pedido.id },
      { jobId: `estoque-${pedido.id}` },
    );
    return { status: 'APROVADO' };
  }
}
