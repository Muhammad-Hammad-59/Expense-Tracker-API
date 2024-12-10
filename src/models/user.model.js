import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name: {
         type: String, 
         required: true 
        },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true, 
    },
    password: { 
        type: String, 
        required: true 
    },
    age: { type: Number, 
        default: 18 
    },
    
  },
  {timestamps: true}
);

export const User = mongoose.model('User', userSchema);