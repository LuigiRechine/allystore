import { Imagem } from '@/src/model/imagem';

export class ImagemService {
    constructor(repository) {
        this.repository = repository;
    }

    async cadastrar(url, tipo, produtoId, ordem = 0) {
        if(!url)
            throw new Error("A URL é obrigatória.");
        if(!tipo)
            throw new Error("O tipo é obrigatório.");
        if(!produtoId)
            throw new Error("O produto é obrigatório.");
        return await this.repository.salvar(new Imagem(url, tipo, produtoId, null, ordem));
    }

    async listar() {
        return await this.repository.listarTodos();
    }

    async buscarPorId(id) {
        const imagem = await this.repository.buscarPorId(id);
        if(!imagem) throw new Error("Imagem não encontrada.");
        return imagem;
    }

    async atualizar(id, url, tipo, produtoId, ordem) {
        if(!id)
            throw new Error("ID é obrigatório para atualização.");
        if(!url || !tipo || !produtoId)
            throw new Error("URL, tipo e produto são obrigatórios.");

        await this.buscarPorId(id);
        const imagemAtualizada = new Imagem(url, tipo, produtoId, null, ordem, id);
        return await this.repository.atualizar(id, imagemAtualizada);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await this.repository.excluir(id);
    }
}