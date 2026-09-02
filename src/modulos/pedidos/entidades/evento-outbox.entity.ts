import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('eventos_outbox')
export class EventoOutbox {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  topicoDaFila!: string;

  @Column('jsonb')
  cargaUtilitaria!: any;

  @Column({ default: false })
  publicado!: boolean;

  @CreateDateColumn()
  criadoEm!: Date;
}
