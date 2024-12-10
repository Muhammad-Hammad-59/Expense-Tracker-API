import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
 

export const dbconnecition=async ()=>{
    try {
        console.log(`database url: ${process.env.MONGODB_URL}`)
       const dbResponseOnConnection= await mongoose.connect(`mongodb://localhost:27017/${DB_NAME}`) 
       if(dbResponseOnConnection){
        console.info(`Database connected`)
       }
    
    } catch (error) {
        console.info(`Error in database connection! ${error.message}`)
    }
}

  