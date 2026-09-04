import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Pedido, StatusPedido } from '../pedidos/entidades/pedido.entity';
import { Estoque } from '../pedidos/entidades/estoque.entity';

@Injectable()
export class ServicoEstoque {
  private readonly logger = new Logger(ServicoEstoque.name);

  constructor(private dataSource: DataSource) {}

  async reservarEstoque(idDoPedido: string): Promise<void> {
    // Iniciamos uma transação ACID. Se o estoque falhar, o pedido não avança.
    await this.dataSource.transaction(async (manager) => {
      const pedido = await manager.findOne(Pedido, {
        where: {
          id: idDoPedido,
        },
      });

      if (!pedido) throw new Error('Pedido não encontrado');

      // Idempotência: Se já foi reservado (por um job duplicado), ignoramos.
      if (pedido.status !== StatusPedido.PAGO) {
        this.logger.warn(
          `Pedido ${pedido.id} não está PAGO. Status atual: ${pedido.status}. Processamento ignorado.`,
        );
        return;
      }
      // Para fins de teste da nossa arquitetura, utilizaremos um produto simulado (produto-123)
      const estoque = await manager.findOne(Estoque, {
        where: {
          idDoProduto: 'produto-123',
        },
      });

      if (!estoque) {
        throw new Error('Produto não cadastrado no estoque');
      }

      if (estoque.quantidadeDisponivel < 1) {
        // Falha que não deve sofrer retry (Erro de Negócio)
        throw new Error(
          'SEM_ESTOQUE: Estoque insuficiente para realizar a reserva.',
        );
      }

      // Decrementa o estoque simulando a compra de 1 unidade
      estoque.quantidadeDisponivel -= 1;
      // O TypeORM valida automaticamente a @VersionColumn aqui.
      // Se houver concorrência milissegundos antes, isso lançará o OptimisticLockVersionMismatchError.
      await manager.save(estoque);

      // Atualiza o estado do pedido para o próximo passo
      pedido.status = StatusPedido.RESERVADO;
      await manager.save(pedido);

      this.logger.log(
        `Estoque reservado com sucesso para o Pedido ${pedido.id}. Restam: ${estoque.quantidadeDisponivel} unidades.`,
      );
    });
  }
}
