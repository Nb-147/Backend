import mongoose from "mongoose"

export const connDB=async(url="", db="")=>{
    try {
        await mongoose.connect(url, {dbName: db})
        console.log(`DB connected!`)
    } catch (error) {
        console.log(`Error connecting to DB: ${error.message}`)
    }
}