import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

export interface PayloadDoPagamento {
  idDoPedido: string;
  idDoUsuario: string;
  valorTotal: number;
}

@Processor('fila-de-pagamento')
export class ProcessadorDePagamentos extends WorkerHost {
  private readonly logger = new Logger(ProcessadorDePagamentos.name);

  async process(job: Job<PayloadDoPagamento, any, string>): Promise<any> {
    this.logger.log(
      `Iniciando processamento do pagamento para o Pedido ID: ${job.data.idDoPedido}`,
    );

    // Simulação de tempo de processamento de um Gateway de Pagamento
    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.logger.log(
      `Pagamento aprovado para o Pedido ID: ${job.data.idDoPedido}`,
    );

    return { status: 'APROVADO' };
  }
}
