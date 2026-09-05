🛒 Sistema de Processamento Assíncrono de Pedidos
Plataforma de e-commerce baseada em uma arquitetura distribuída, orientada a eventos e altamente resiliente, desenvolvida com NestJS, PostgreSQL, Redis e BullMQ.

🚀 Tecnologias Utilizadas
Node.js & TypeScript

NestJS — Framework backend moderno e modular

PostgreSQL — Banco relacional como fonte de verdade (Source of Truth)

Redis — Armazenamento em memória de alta performance para mensageria

BullMQ — Gerenciamento de filas e workers assíncronos

Docker & Docker Compose — Orquestração completa da infraestrutura

🏛️ Arquitetura e Decisões de Design
O sistema foi projetado com foco em resiliência, consistência e escalabilidade. As principais decisões arquiteturais incluem:

1. 🔁 Idempotência em Camadas
Utilização de cabeçalho Idempotency-Key para identificar requisições únicas.

Constraints de unicidade no PostgreSQL.

Validação de status nos Workers para evitar processamento duplicado.

2. 📦 Transactional Outbox Pattern
Garantia de atomicidade entre a gravação do pedido no banco e a publicação do evento no Redis.

Previne falhas de dual write e mantém a consistência entre banco e fila.

3. 🔒 Optimistic Locking
Controle de concorrência no estoque utilizando colunas de versão (@VersionColumn) com TypeORM.

Evita condições de corrida (race conditions) em operações simultâneas.

4. 🧱 Resiliência e Dead Letter Queue (DLQ)
Filas configuradas com retry exponencial.

Utilização da DLQ nativa do BullMQ para tratamento de falhas transitórias e permanentes.

⚙️ Como Executar o Projeto
1. Subir a Infraestrutura com Docker
Certifique-se de ter o Docker instalado e execute na raiz do projeto:

bash
docker-compose up -d
2. Instalar Dependências
bash
npm install
3. Iniciar a API em Modo de Desenvolvimento
bash
npm run start:dev
🧪 Como Executar os Testes
Testes Unitários
bash
npm run test
Testes End-to-End (E2E) — incluindo validação de idempotência
bash
npm run test:e2e
✅ Como Validar e Testar o Fluxo Completo
Inicie a infraestrutura e a aplicação:

bash
docker-compose up -d
npm run start:dev
Dispare um fluxo de checkout utilizando o comando cURL com uma chave de idempotência inédita:

bash
curl -X POST http://localhost:3000/pedidos/checkout \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: teste-final-observabilidade" \
  -d '{"idDoUsuario": "user-senior"}'
Observe os logs estruturados no terminal (formato JSON), com rastreamento temporal e identificadores claros para auditoria.

Valide a execução dos testes automatizados:

bash
npm run test
npm run test:e2e
📌 Conclusão
Este sistema demonstra a aplicação de boas práticas de engenharia de software em arquiteturas distribuídas, com ênfase em:

Consistência de dados

Tolerância a falhas

Observabilidade

Escalabilidade horizontal

Ele está pronto para ser utilizado como base para soluções de e-commerce de alta disponibilidade.

