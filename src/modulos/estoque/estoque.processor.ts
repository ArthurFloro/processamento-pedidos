import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ServicoEstoque } from './estoque.service';
import { Job } from 'bullmq';

export interface PayloadDoEstoque {
  idDoPedido: string;
}

@Processor('fila-de-estoque')
export class ProcessadorDeEstoque extends WorkerHost {
  private readonly logger = new Logger(ProcessadorDeEstoque.name);

  constructor(private readonly servicoDeEstoque: ServicoEstoque) {
    super();
  }

  async process(job: Job<PayloadDoEstoque, any, string>): Promise<any> {
    this.logger.log(
      `Iniciando reserva de estoque para o Pedido ID: ${job.data.idDoPedido}`,
    );

    try {
      await this.servicoDeEstoque.reservarEstoque(job.data.idDoPedido);
      return { status: 'RESERVADO' };
    } catch (error) {
      // Se for falta de estoque (regra de negócio), não queremos que o BullMQ faça retry.
      if (error instanceof Error && error.message.includes('SEM_ESTOQUE')) {
        this.logger.error(
          `Reserva falhou permanentemente para o Pedido ${job.data.idDoPedido}: ${error.message}`,
        );
        // Retornar um error não tratável falha o job imediatamente sem retry. No futuro, engatilha compensação.
        throw error;
      }

      // Se for error de Optimistic Lock ou falha no DB, o error sobe e o BullMQ aplica o Retry automático.
      this.logger.warn(
        `Falha transitória ou de concorrência no Pedido ${job.data.idDoPedido}. Tentando novamente em breve...`,
      );
      throw error;
    }
  }
}
