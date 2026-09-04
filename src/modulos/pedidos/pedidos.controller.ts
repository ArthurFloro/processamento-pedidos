import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ServicoDePedidos } from './pedidos.service';
import { CriarPedido } from './dto/criar-pedido';

@Controller('pedidos')
export class ControladorDePedidos {
  constructor(private readonly servicoDePedidos: ServicoDePedidos) {}

  @Post('checkout')
  async checkout(
    @Body() dadosDoPedido: CriarPedido,
    @Headers('idempotency-key') chaveIdempotencia: string,
  ) {
    if (!chaveIdempotencia) {
      throw new Error(
        'O cabeçalho "idempotency-key" é obrigatório para garantir a idempotência da operação.',
      );
    }

    const pedido = await this.servicoDePedidos.realizarCheckout(
      dadosDoPedido.idDoUsuario,
      chaveIdempotencia,
    );

    return {
      mensagem:
        'Checkout registrado com sucesso. Procesamento assíncrono em iniciado.',
      pedido,
    };
  }
}
