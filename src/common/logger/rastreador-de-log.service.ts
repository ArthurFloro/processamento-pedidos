import { Logger } from '@nestjs/common';

export class RastradorDeLog {
  private static readonly logger = new Logger('SistemaPedidos');

  static logExecucao(etapa: string, mensagem: string, detalhes?: any) {
    const logEstruturado = {
      timestamp: new Date().toISOString(),
      etapa,
      idDoPedido,
      mensagem,
      detalhes: detalhes || {},
    };
    this.logger.log(JSON.stringify(logEstruturado));
  }

  static logErro(
    etapa: string,
    idDoPedido: string,
    erro: Error,
    detalhes?: any,
  ) {
    const logErroEstruturado = {
      timestamp: new Date().toISOString(),
      etapa,
      idDoPedido,
      erro: erro.message,
      pilha: erro.stack,
      detalhes: detalhes || {},
    };
    this.logger.error(JSON.stringify(logErroEstruturado));
  }
}
