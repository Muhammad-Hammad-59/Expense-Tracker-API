import mongoose from "mongoose";
const { Schema } = mongoose;

const transactionSchema= new mongoose.Schema(
    {
        userId: {
            type: String,
            required:true,
            
        },
        type: {
            type: String,
            enum: ['income', 'expense'], // Restrict to 'income' or 'expense'
            required: true,
          },
          amount: {
            type: Number,
            required: true,
            min: 0, // Ensure no negative values
          },
          category: {
            type: String,
            required: true,
            trim: true,
          },
          description: {
            type: String,
            trim: true, // Remove extra spaces
            default: '', // Optional field, default empty string
          },
         
    },
    {
        timestamps:true,
    }
)


export const Transaction= mongoose.model('Transaction',transactionSchema);