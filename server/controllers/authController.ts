import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {User} from "../models/user.js";
import bcrypt from "bcrypt";
import { console } from "inspector/promises";
import { AuthRequest } from "../middlewares/auth.js";



//Helper to generate JWT Token
const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: "30d",
    });
}



//Register a new user
//POST /api/auth/register

export const registerUser = async (req: Request, res: Response) : Promise<void> => {
    try{
        const { name, email, password, phone, role } = req.body;
        if(!name || !email || !password){
            res.status(400).json({ message: "Please provide all required fields" });
            return;
        }
        
        const userExists = await User.findOne({ email });
        if(userExists){
            res.status(400).json({ message: "User already exists" });
            return;
        }
        
        //Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        //Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role
        });

        if(user){
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user.id.toString())
            });
        }
        else{
            res.status(400).json({ message: "Invalid user data" });
        }
    }
    
    catch (error:any) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

//Authenticate a user and get token
//POST /api/auth/login

export const loginUser = async (req: Request, res: Response) : Promise<void> => {
    try{
        const { email, password } = req.body;
        if(!email || !password){
            res.status(400).json({ message: "Please provide all required fields" });
            return;
        }

        //Check for User
        const user = await User.findOne({ email });
        if(!user){
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }

        //Check if password matches
        const isMatch = await bcrypt.compare(password, user.password || "");
        if(!isMatch){
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(user.id.toString())
        });

    }
    catch (error:any) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

//Get User Profile
//POST /api/auth/me
//@access private

export const getMe = async (req: AuthRequest, res: Response) : Promise<void> => {
    try{
        if(!req.user){
            res.status(401).json({ message: "Not Authorized" });
            return;
        }
        res.json(req.user)
    }
    catch (error:any) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}