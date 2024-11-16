import bcrypt from "bcrypt"

export const generaHash = async (password) => await bcrypt.hash(password, 10);
export const validaHash=(pass, hash)=>bcrypt.compareSync(pass, hash)