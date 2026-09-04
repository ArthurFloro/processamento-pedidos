import { Controller, Post } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Estoque } from '../pedidos/entidades/estoque.entity';

@Controller('admin/estoque')
export class ControladorDeEstoque {
  constructor(private dataSource: DataSource) {}

  @Post('seed')
  async popularEstoque() {
    const repositorio = this.dataSource.getRepository(Estoque);
    let estoque = await repositorio.findOne({
      where: {
        idDoProduto: 'produto-123',
      },
    });

    if (!estoque) {
      estoque = repositorio.create({
        idDoProduto: 'produto-123',
        quantidadeDisponivel: 2,
      });
      await repositorio.save(estoque);
      return {
        mensagem: 'Estoque criado com 2 unidades!',
        estoque,
      };
    }

    estoque.quantidadeDisponivel = 2;
    await repositorio.save(estoque);
    return {
      mensagem: 'Estoque resetado para 2 unidades!',
      estoque,
    };
  }
}
