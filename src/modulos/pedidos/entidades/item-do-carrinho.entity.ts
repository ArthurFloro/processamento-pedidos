import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Carrinho } from './carrinho.entity';

@Entity('itens_do_carrinho')
export class ItemDoCarrinho {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  isDoProduto!: string;

  @Column('int')
  quantidade!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precoUnitario!: number;

  // Relacionamento N:1 com o Carrinho.
  // 'onDelete: CASCADE' garante que se o carrinho for deletado (ex: após checkout), os itens também somem.
  @ManyToOne(() => Carrinho, (carrinho) => carrinho.itens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idDoCarrinho' })
  carrinho!: Carrinho;
}
