import bcrypt from "bcrypt"

export const generaHash = async (password) => await bcrypt.hash(password, 10);
export const validaHash=(pass, hash)=>bcrypt.compareSync(pass, hash)

// export const procesaErrores=(res, error)=>{
//     console.log(error);
//     res.setHeader('Content-Type','application/json');
//     return res.status(500).json(
//         {
//             error:`Unexpected server error - Try later, or contact your administrator`,
//             //detalle:`${error.message}`
//         }
//     )
// }