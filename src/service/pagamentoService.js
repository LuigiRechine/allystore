import { Pagamento } from '@/src/model/pagamento';

export class PagamentoService {
    constructor(repository) {
        this.repository = repository;
    }

    async cadastrar(valor, metodo, status, codigoTransacao, pedidoId) {
        if(!valor)
            throw new Error("O valor é obrigatório.");
        if(!metodo)
            throw new Error("O método é obrigatório.");
        if(!status)
            throw new Error("O status é obrigatório.");
        if(!codigoTransacao)
            throw new Error("O código de transação é obrigatório.");
        if(!pedidoId)
            throw new Error("O pedido é obrigatório.");
        return await this.repository.salvar(new Pagamento(valor, metodo, status, codigoTransacao, pedidoId, null));
    }

    async listar() {
        return await this.repository.listarTodos();
    }

    async buscarPorId(id) {
        const pagamento = await this.repository.buscarPorId(id);
        if(!pagamento) throw new Error("Pagamento não encontrado.");
        return pagamento;
    }

    async atualizar(id, valor, metodo, status, codigoTransacao, pedidoId) {
        if(!id)
            throw new Error("ID é obrigatório para atualização.");
        if(!valor || !metodo || !status || !codigoTransacao || !pedidoId)
            throw new Error("Valor, método, status, código de transação e pedido são obrigatórios.");

        await this.buscarPorId(id);
        const pagamentoAtualizado = new Pagamento(valor, metodo, status, codigoTransacao, pedidoId, null, undefined, id);
        return await this.repository.atualizar(id, pagamentoAtualizado);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await this.repository.excluir(id);
    }
}