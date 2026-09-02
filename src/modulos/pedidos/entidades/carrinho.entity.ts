import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ItemDoCarrinho } from './item-do-carrinho.entity';

@Entity('carrinhos')
export class Carrinho {
  @PrimaryColumn('uuid')
  id!: string;

  // Assumindo que o usuário tem apenas um carrinho ativo por vez
  @Column({ unique: true })
  idDoUsuario!: string;

  // Relacionamento 1:N com os itens
  // `cascade`: true permite salvar o carrinho e os itens de uma só vez
  @OneToMany(() => ItemDoCarrinho, (item) => item.carrinho, { cascade: true })
  itens!: ItemDoCarrinho[];

  @CreateDateColumn()
  criadoEm!: Date;

  @UpdateDateColumn()
  atualizadoEm!: Date;
}
