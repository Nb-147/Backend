import User from "./models/user.js";

export class UsersManager {
    static async getUserBy(filter = {}) {
        return await User.findOne(filter).lean();
    }

    static async addUser(user = {}) {
        let newUser = await User.create(user);
        return newUser.toJSON();
    }
}