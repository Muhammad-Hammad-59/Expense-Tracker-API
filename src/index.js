import 'dotenv/config';
import { dbconnecition } from './db/index.js';
import express from "express"

import transactionRoutes from './routes/transaction.route.js'
import userRoutes from './routes/user.route.js';

const app=express();

app.use(express.json());

dbconnecition().then(()=>{
    app.listen(4000,()=>{
        console.log("server listning on port no 4000")
    })
}).catch((err)=>{
    console.log("MONGO db connection failed !!! ", err);
})




// Mount transaction routes
app.use( '/api/transactions' , transactionRoutes );

app.use( '/api/users' , userRoutes );




