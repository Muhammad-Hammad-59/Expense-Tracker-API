import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const registerUser = async ( req , res ) => {

    try {

        const { name, email, password, age }=req.body;

        console.log(` name: ${name}  email: ${email}  password: ${password}  age: ${age}`)

        if( !name || !email || !password || !age) {

            return res.status(401).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const uniqueUser = await User.findOne({ email });

        console.log(`user unique or not ${uniqueUser} `)

        if( uniqueUser ) {
            
            return res.status(400).json({
                success: false,
                message: "email already exist"
            })
        }


        const salt =  bcrypt.genSaltSync();
        const hashPassword =  bcrypt.hashSync(password, salt);
        console.log(hashPassword);

        const newUser = new User ( {
            name,
            email,
            password: hashPassword,
            age
        } )

        const userResponse = await newUser.save();

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: userResponse  // Return the user details (excluding password)
        });







    } catch (error) {
        return res.status(403).json({
            success: false,
            message: "error in user registration"
        })
    }
}


export const loginUser = async ( req , res ) => {

    try {
        
        const { email , password } = req.body;

        if ( !email || !password ){

            return res.status(402).json(
                {
                    success: false,
                    message: "all field require",
                }
            )

        }

        const user = await User.findOne( {email} )
        console.log(` email: ${user}`)

        if (!user) {
            return res.status(401).json(
                { 
                    message: 'Invalid credentials' 
                }
            )
            
          }

        const isValid = await bcrypt.compare(password , user.password);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
              
            });
        } 

        const token = jwt.sign(
            {user},
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        )

        console.log(`token value = ${token}`)

        res.status(200).json({ 
            message: 'Login successful',
            userId: user._id,
            token
          });

    } catch (error) {
        
        return res.status(401).json(
            {
                success: false,
                message: 'Login failed',
                error: error.message 
            }
        )

    }

}