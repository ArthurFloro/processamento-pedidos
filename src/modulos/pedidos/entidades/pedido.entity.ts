import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum StatusPedido {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  RESERVADO = 'RESERVADO',
  FATURADO = 'FATURADO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
}

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  idDoUsuario!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  valorTotal!: number;

  @Column({ type: 'enum', enum: StatusPedido, default: StatusPedido.PENDENTE })
  status!: StatusPedido;

  // Garante idempotência bloqueando duplicações no nível do PostgreSQL
  @Column({ unique: true })
  chaveIdempotencia!: string;

  @CreateDateColumn()
  criadoEm!: Date;

  @UpdateDateColumn()
  atualizadoEm!: Date;
}
