import { Transaction } from '../models/transaction.mode.js';
import mongoose from 'mongoose';

export const addTransaction= async (req,res)=>{

    try {
        const { userId, type, amount, category, description } = req.body;

        if( !userId || !type || !amount || !category || !description ){

            return res.status(401).json({
                success: false,
                message: "Missing required fields"
            });

        }

        const newtransaction= new Transaction({
            userId: req.user._id,
            
            type,
            amount,
            category,
            description: description || ''
        });

        const savetransaction= await newtransaction.save();


        return res.status(201).json({
            success: true,
            message: "Transaction added successfully",
            transaction: savetransaction
            
        })

    }catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create transaction',
            error: error.message 
        });
    }
}


export const updateTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { type, amount, category, description } = req.body;
        const userid = req.user._id;



        // Validate transaction ID
        if (!mongoose.Types.ObjectId.isValid(transactionId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid transaction ID'
            });
        }

        // Validate input fields
        const updateData = {};
        
        if (type) {
            // Validate transaction type
            if (!['income', 'expense'].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid transaction type. Must be income or expense.'
                });
            }
            updateData.type = type;
        }

        if (amount !== undefined) {
            // Validate amount
            if (typeof amount !== 'number' || amount < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount must be a non-negative number'
                });
            }
            updateData.amount = amount;
        }

        if (category) {
            // Validate category
            if (typeof category !== 'string' || category.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Category must be a non-empty string'
                });
            }
            updateData.category = category.trim();
        }

        if (description !== undefined) {
            // Allow empty description
            updateData.description = description.trim();
        }

        // // Prevent updating userId
        // if (!userId) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Cannot update user ID'
        //     });
        // }

        // Find and update transaction
        const updatedTransaction = await Transaction.findByIdAndUpdate(
           {_id:transactionId, userId:userid} ,
            updateData,
            { 
                new: true,           // Return the modified document
                runValidators: true, // Run model validation
                context: 'query'     // Important for validation context
            }
        );

        // Check if transaction exists
        if (!updatedTransaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found or not authorized to update.',
            });
        }

        // Successful response
        res.status(200).json({
            success: true,
            message: 'Transaction updated successfully',
            transaction: updatedTransaction
        });

    } catch (error) {
        // Handle specific mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        // Log the error for server-side tracking
        console.error('Error updating transaction:', error);

        // Generic server error
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


export const deleteTransaction= async (req,res)=>{

    try {
        
        const { transactionId } =req.params;
        const userid = req.user._id;
        

        const findtransactionbyId=await Transaction.findById(transactionId);
 

        if(!findtransactionbyId){
           return res.status(404).json({
            success: false,
            message: "transaction not found",

           })
        }

        if (findtransactionbyId.userId.toString() !== userid.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only delete your own transactions"
            });
        }

        const deleteTransactionResponse= await Transaction.findOneAndDelete({
            _id:transactionId,
            userId:userid
        });

        return res.status(201).json({
            success: true,
            message: 'transaction having id ${transactionId} deleted',
            deleteTransactionResponse
        })

    } catch (error) {
        console.log(`Error in delete transaction`)

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}


export const listallTransaction= async (req,res)=>{
    try {
         
        const allTransaction= await Transaction.find({userId: req.user._id});

        if(allTransaction.length===0){
            console.log("no transaction found");

            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            })
        }

        return res.status(201).json({
            success: true,
            message: "Transaction fetch successfully",
            trnasaction: allTransaction
        })

    } catch (error) {
         
        console.log(`Error in fetch Transaction: ${error.message}`);

        return res.status(500).json({
            success: false,
            message: 'internal server error',
            error: error.message
        })

    }
}


export const getTransactions = async (req, res) => {
    try {
      const { month, year, category,type } = req.query;
 
      // Build query object dynamically
      let query = {};

      query.userId=req.user._id;
      
      // Filter by month and year if provided
      if (month && year) {
 
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      // Create start and end dates for the specified month
      const startDate = new Date(Date.UTC(yearNum, monthNum - 1, 1));
      const endDate = new Date(Date.UTC(yearNum, monthNum, 0));

      query.createdAt = {
        $gte: startDate,
        $lt: endDate
      };

      }
      
      // Filter by category if provided
      if (category) {
        query.category = category;
      }

      if (type) {
        query.type = type;
      }
      
      // Retrieve transactions based on query
      const transactions = await Transaction.find(query)
        .sort({ date: -1 }) // Sort by date in descending order
        .lean(); // Convert to plain JavaScript object
      
      // Calculate summary statistics
      const summary = await Transaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            transactionCount: { $sum: 1 }
          }
        }
      ]);
      
      res.status(200).json({
        count: transactions.length,
        transactions,
        summary: summary[0] || { totalAmount: 0, transactionCount: 0 }
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error retrieving transactions', 
        error: error.message 
      });
    }
  };


// export const deleteTransaction = async (req, res) => {
//     try {
//         const { transactionId } = req.params;

//         // Validate transaction ID
//         if (!mongoose.Types.ObjectId.isValid(transactionId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid transaction ID'
//             });
//         }

//         // Find and delete the transaction
//         const deletedTransaction = await Transaction.findByIdAndDelete(transactionId);

//         // Check if transaction exists
//         if (!deletedTransaction) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Transaction not found'
//             });
//         }

//         // Successful deletion response
//         res.status(200).json({
//             success: true,
//             message: 'Transaction deleted successfully',
//             deletedTransaction: {
//                 _id: deletedTransaction._id,
//                 type: deletedTransaction.type,
//                 amount: deletedTransaction.amount,
//                 category: deletedTransaction.category
//             }
//         });

//     } catch (error) {
//         // Log the error for server-side tracking
//         console.error('Error deleting transaction:', error);

//         // Generic server error response
//         res.status(500).json({
//             success: false,
//             message: 'Internal server error',
//             error: error.message
//         });
//     }
// };