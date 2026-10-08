# AllyStore

## Sobre o projeto

O **AllyStore** é uma plataforma de e-commerce desenvolvida como um projeto acadêmico, com o objetivo de oferecer uma solução para o gerenciamento de lojas virtuais.

O sistema conta com um front-end e um back-end funcionais, permitindo a integração entre a interface do usuário, a lógica da aplicação e o banco de dados.

## Funcionalidades

* Gerenciamento de lojas virtuais.
* Cadastro e gerenciamento de usuários.
* Cadastro e gerenciamento de produtos.
* Organização de produtos por categorias.
* Gerenciamento de variações de produtos, como tamanho e cor.
* Controle de estoque.
* Gerenciamento de carrinhos de compras.
* Gerenciamento de pedidos e pagamentos.

## Tecnologias utilizadas

### Front-end

* Next.js
* React
* TypeScript
* CSS

### Back-end

* Node.js
* TypeScript
* Prisma ORM

### Banco de dados

* MySQL

## Banco de dados

O banco de dados foi desenvolvido utilizando MySQL, com o Prisma ORM para o mapeamento e gerenciamento das entidades.

As principais entidades do sistema são:

| Entidade        | Descrição                                                         |
| --------------- | ----------------------------------------------------------------- |
| Loja            | Armazena as informações das lojas cadastradas.                    |
| Usuário         | Armazena os dados dos usuários do sistema.                        |
| Administrador   | Representa os usuários com permissões administrativas.            |
| Lojista         | Representa os usuários responsáveis pelo gerenciamento das lojas. |
| Cliente         | Armazena os dados dos clientes.                                   |
| Categoria       | Organiza os produtos em categorias.                               |
| Produto         | Armazena as informações dos produtos.                             |
| ProdutoVariacao | Representa variações de produtos, como tamanho e cor.             |
| Imagem          | Armazena imagens relacionadas aos produtos.                       |
| Estoque         | Controla as quantidades disponíveis e reservadas.                 |
| Carrinho        | Representa os carrinhos de compras dos clientes.                  |
| ProdutoCarrinho | Relaciona produtos e quantidades aos carrinhos.                   |
| Pedido          | Armazena os pedidos realizados.                                   |
| ProdutoPedido   | Relaciona produtos aos pedidos.                                   |
| Pagamento       | Armazena informações sobre os pagamentos dos pedidos.             |

## Como executar o projeto

### Pré-requisitos

Antes de iniciar, é necessário ter instalado:

* [Node.js](https://nodejs.org/)
* [MySQL](https://www.mysql.com/)
* [Git](https://git-scm.com/)

### 1. Clone o repositório

```bash
git clone https://github.com/LuigiRechine/allystore
```

Entre na pasta do projeto:

```bash
cd allystore
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto e configure a variável de conexão com o banco de dados:

```env
DATABASE_URL="mysql://USUARIO:SENHA@localhost:3306/NOME_DO_BANCO"
```

Substitua os valores pelos dados correspondentes ao seu ambiente.

### 4. Configure o Prisma

Gere o Prisma Client:

```bash
npx prisma generate
```

Execute as migrações do banco de dados:

```bash
npx prisma migrate dev
```

### 5. Execute a aplicação

Utilize o comando correspondente aos scripts definidos no `package.json` para iniciar o front-end e o back-end.

## Objetivo acadêmico

O projeto tem como objetivo aplicar conhecimentos de desenvolvimento web, programação orientada a objetos, modelagem de banco de dados, integração entre front-end e back-end e utilização de ferramentas modernas de desenvolvimento.

## Desenvolvedor

**Luigi Rechinelli**
