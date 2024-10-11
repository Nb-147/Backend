import jwt from "jsonwebtoken"
import { config } from "../config/config.js";


export const auth=(req, res, next)=>{
    if(!req.headers.authorization){
        res.setHeader('Content-Type','application/json');
        return res.status(401).json({error:`Unauthorized`})
    }

    console.log(req.headers.authorization)
    let token=req.headers.authorization.split(" ")[1]

    try {
        let usuario=jwt.verify(token, config.SECRET)
        req.user=usuario 
    } catch (error) {
        res.setHeader('Content-Type','application/json');
        return res.status(401).json({error:`Unauthorized`, detalle:error.message})
    }

    next()
}