import express from "express"

import { addTransaction, deleteTransaction, updateTransaction, listallTransaction, getTransactions} from "../controllers/addtransaction.controller.js";
import authMiddleware from "../middlewares/authentication.middleware.js";

const router=express.Router();
router.use(authMiddleware)

router.get('/trnasactionlist',listallTransaction)
router.get('/filtertransaction',getTransactions)
router.post('/create',addTransaction);
router.put('/:transactionId' , updateTransaction);
router.delete('/:transactionId',deleteTransaction)


export default router;

