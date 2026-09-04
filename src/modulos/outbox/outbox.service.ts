import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bullmq';
import { DataSource } from 'typeorm';
import { EventoOutbox } from '../pedidos/entidades/evento-outbox.entity';

@Injectable()
export class ServicoDeOutbox {
  private readonly logger = new Logger(ServicoDeOutbox.name);

  constructor(
    private dataSource: DataSource,
    @InjectQueue('fila-de-pagamento') private filaDePagamento: Queue,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async publicarEventosPendentes() {
    const eventosPendentes = await this.dataSource.manager.find(EventoOutbox, {
      where: { publicado: false },
      take: 50, // Processa em lotes para evitar sobrecarga
    });

    for (const evento of eventosPendentes) {
      try {
        // Envia para o Redis via BullMQ
        await this.filaDePagamento.add(
          evento.topicoDaFila,
          evento.cargaUtilitaria,
          {
            jobId: evento.id, // o ID do evento atua como chave de desduplicação no BullMQ
          },

          // Marca como publicado no banco
        );

        evento.publicado = true;
        await this.dataSource.manager.save(evento);

        this.logger.log(
          `Evento ${evento.id} publicado na ${evento.topicoDaFila}.`,
        );
      } catch (error) {
        this.logger.error(`Falha ao publicar evento ${evento.id}:`, error);
      }
    }
  }
}
