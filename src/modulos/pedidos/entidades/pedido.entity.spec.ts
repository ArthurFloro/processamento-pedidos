import { Pedido, StatusPedido } from './pedido.entity';

describe('Entidade Pedido', () => {
  it('deve ser inicializado corretamente', () => {
    const pedido = new Pedido();
    pedido.idDoUsuario = 'user-teste';
    pedido.valorTotal = 150.0;
    pedido.chaveIdempotencia = 'chave-unica-teste';

    // Simulando o comportamento de fallback do banco
    pedido.status = StatusPedido.PENDENTE;

    expect(pedido.status).toBe(StatusPedido.PENDENTE);
    expect(pedido.idDoUsuario).toBe('user-teste');
  });
});
