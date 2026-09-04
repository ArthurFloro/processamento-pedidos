import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { Estoque } from './modulos/pedidos/entidades/estoque.entity';
import { EventoOutbox } from './modulos/pedidos/entidades/evento-outbox.entity';
import { Pedido } from './modulos/pedidos/entidades/pedido.entity';
import { ControladorDePedidos } from './modulos/pedidos/pedidos.controller';
import { ServicoDePedidos } from './modulos/pedidos/pedidos.service';
import { ServicoDeOutbox } from './modulos/outbox/outbox.service';
import { ProcessadorDePagamentos } from './modulos/pagamentos/pagamentos.processor';
import { ScheduleModule } from '@nestjs/schedule';
import { ControladorDeFilas } from './modulos/filas/filas.controller';

@Module({
  imports: [
    // Carregando o .env globalmente
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configuração Assíncrona do TypeORM (PostgreSQL)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        entities: [Estoque, EventoOutbox, Pedido],
        // synchronize: true deve ser 'false' em produção.
        // Aqui mantemos 'true' temporariamente para acelerar o setup das fases iniciais.
        synchronize: true,
      }),
    }),

    // Configuração Assíncrona do BullMQ
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
    }),

    // Inicia o agendador de tarefas
    ScheduleModule.forRoot(),

    // 2. Registra a fila específica
    BullModule.registerQueue({
      name: 'fila-de-pagamento',
      defaultJobOptions: {
        attempts: 3, // tentará 3 vezes antes de ir para a DLQ
        backoff: {
          type: 'exponential',
          delay: 2000, // atraso base: 2s, depois 4s...
        },
      },
    }),
  ],
  controllers: [ControladorDePedidos, ControladorDeFilas, AppController],
  providers: [
    AppService,
    ServicoDeOutbox,
    ProcessadorDePagamentos,
    ServicoDePedidos,
    {
      // habilitando validação global de DTOs
      provide: 'APP_PIPE',
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
