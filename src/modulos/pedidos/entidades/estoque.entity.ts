import { Column, Entity, PrimaryGeneratedColumn, VersionColumn } from 'typeorm';

@Entity('estoque')
export class Estoque {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  idDoProduto!: string;

  @Column('int')
  quantidadeDisponivel!: number;

  // Optimistic Locking: o TypeORM incrementa automaticamente.
  // Se 2 processos tentarem atualizar a mesma versão, o segundo falhará.

  @VersionColumn()
  versao!: number;
}
