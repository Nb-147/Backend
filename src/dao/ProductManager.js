import { productsModel } from "./models/productsModel.js";

export class ProductManager {
    static async get(page = 1, limit = 20) {
        return await productsModel.paginate({}, { lean: true, page, limit });
    }

    static async getBy(filtro = {}) {
        return await productsModel.findOne(filtro);
    }

    static async create(product) {
        return await productsModel.create(product);
    }

    static async update(id, product) {
        return await productsModel.findByIdAndUpdate(id, product, { new: true });
    }
}