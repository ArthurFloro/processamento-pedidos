import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('ControladorDePedidos (e2e) - Idempotência', () => {
  let app: INestApplication;
  // Geramos uma chave única para cada vez que rodarmos o teste
  const chaveDeTeste = `chave-e2e-${Date.now()}`;

  beforeAll(async () => {
    const moduloFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduloFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve processar o checkout e barrar requisições duplicadas (Idempotência)', async () => {
    const payload = { idDoUsuario: 'user-teste-e2e' };

    // 1ª Requisição: O sistema deve processar e criar o pedido normalmente
    const resposta1 = await request(app.getHttpServer())
      .post('/pedidos/checkout')
      .set('Idempotency-Key', chaveDeTeste)
      .send(payload)
      .expect(201);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const idDoPedidoOriginal = resposta1.body.pedido.id;
    expect(idDoPedidoOriginal).toBeDefined();

    // 2ª Requisição (Duplicada): Mesmo payload e mesma chave
    // O sistema deve retornar sucesso (201), mas devolver o MESMO recurso, sem duplicar
    const resposta2 = await request(app.getHttpServer())
      .post('/pedidos/checkout')
      .set('Idempotency-Key', chaveDeTeste)
      .send(payload)
      .expect(201);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const idDoPedidoDuplicado = resposta2.body.pedido.id;

    // A PROVA REAL: O ID da segunda chamada precisa ser exatamente igual ao da primeira
    expect(idDoPedidoDuplicado).toBe(idDoPedidoOriginal);
  });
});
