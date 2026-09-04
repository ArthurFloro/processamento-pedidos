import {
  Controller,
  Get,
  Post,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PayloadDoPagamento } from '../pagamentos/pagamentos.processor';

@Controller('admin/filas')
export class ControladorDeFilas {
  constructor(
    @InjectQueue('fila-de-pagamento')
    private filaDePagamento: Queue<PayloadDoPagamento>,
  ) {}

  @Get('dlq')
  async listarDeadLetterQueue() {
    // Busca todos os jobs que falharam permanentemente
    const jobsFalhos = await this.filaDePagamento.getFailed();

    return jobsFalhos.map((job) => ({
      jobId: job.id,
      pedidoId: job.data.idDoPedido,
      motivoDaFalha: job.failedReason,
      dataDaFalha: new Date(job.finishedOn!).toISOString(),
    }));
  }

  @Post('dlq/:jobId/reprocessar')
  async reprocessarJobNaDlq(@Param('jobId') jobId: string) {
    const job = await this.filaDePagamento.getJob(jobId);

    if (!job) {
      throw new NotFoundException('Job não encontrado na fila.');
    }

    // O método retry() reinicia o contador de tentativas e devolve o job para a fila pendente
    await job.retry();

    return {
      mensagem: `Job ${jobId} reenviado para a fila de processamento com sucesso.`,
    };
  }
}
