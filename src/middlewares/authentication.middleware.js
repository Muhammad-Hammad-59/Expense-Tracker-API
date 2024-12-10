import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";


const authMiddleware = async (req, res, next) =>{

    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findOne({ _id: decoded.user._id });

        
    if (!user) {
        throw new Error();
      }
       

        // req.userId = decoded.user._id;

        // if (!decoded.user || !decoded.user._id) {
        //     throw new Error('Invalid token');
        //   }
         

        // console.log(`userid in middleware = ${decoded.user._id}`)

        // return res.status(201).json(
        //     {
        //         message:"testing in middleware",
        //         decoded
        //     }
        // )

        req.token = token;
        req.user = user;
         

        next();

    } catch (error) {
        
        return res.status(401).json(
            {
                success: false,
                message: "Please Authenticate"
                 
                
            }
        )

    }

}


// const authMiddleware = async (req, res, next) => {
//     try {
//       const token = req.header('Authorization').replace('Bearer ', '');
//       const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//       const user = await User.findOne({ _id: decoded.userId });
//       console.log(`token value: ${token}  user value: ${user}`)
//       if (!user) {
//         throw new Error();
//       }
  
//       req.token = token;
//       req.user = user;
//       console.log(`token value: ${token}  user value: ${user}`)
//       next();
//     } catch (error) {
//       res.status(401).send({ error: error.message });
//     }
//   };

export default authMiddleware;