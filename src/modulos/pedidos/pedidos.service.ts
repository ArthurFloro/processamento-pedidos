import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Pedido, StatusPedido } from './entidades/pedido.entity';
import { EventoOutbox } from './entidades/evento-outbox.entity';

@Injectable()
export class ServicoDePedidos {
  constructor(private dataSource: DataSource) {}

  async realizarCheckout(
    idDoUsuario: string,
    chaveIdempotencia: string,
  ): Promise<Pedido> {
    // Barreira de Idempotência: Verifica se a chave já foi processada com sucesso
    const pedidoExistente = await this.dataSource.manager.findOne(Pedido, {
      where: { chaveIdempotencia },
    });

    if (pedidoExistente) {
      // Se o pedido já existe, retorna o pedido existente sem criar um novo
      return pedidoExistente;
    }

    // iniciando o controle transacional (ACID)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Simulação: Neste ponto buscaríamos o Carrinho no banco, somaríamos os itens e limparíamos o carrinho.
      const valorSimuladoCarrinho = 299.9;

      // criando pedido
      const novoPedido = queryRunner.manager.create(Pedido, {
        idDoUsuario,
        valorTotal: valorSimuladoCarrinho,
        status: StatusPedido.PENDENTE,
        chaveIdempotencia,
      });
      await queryRunner.manager.save(novoPedido);

      // Transactional Outbox: Salva a intenção de processamento na mesma transação
      const evento = queryRunner.manager.create(EventoOutbox, {
        topicoDaFila: 'fila-de-pagamento',
        cargaUtilitaria: {
          idDoPedido: novoPedido.id,
          idDoUsuario: novoPedido.idDoUsuario,
          valorTotal: novoPedido.valorTotal,
        },
      });

      await queryRunner.manager.save(evento);

      // COnfimar ambas as operações (pedido e evento) na mesma transação
      await queryRunner.commitTransaction();
      return novoPedido;
    } catch (error) {
      // Se a luz piscar ou o banco cair aqui, NADA é salvo. Sem pedidos fantasmas.
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
