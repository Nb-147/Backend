import { userModel } from "./models/userModel";

export class UsuariosManager{
    static async getUserBy(filtro={}){
        return await userModel.findOne(filtro).lean()
    }

    static async addUser(usuario={}){
        let nuevoUsuario=await usuariosModelo.create(usuario)
        return nuevoUsuario.toJSON()
    }
}