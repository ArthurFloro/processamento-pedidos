import { IsNotEmpty, IsString } from 'class-validator';

export class CriarPedido {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty({ message: 'O id do usuário é obrigatório' })
  idDoUsuario!: string;
}
