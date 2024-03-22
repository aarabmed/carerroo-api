require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const validate = require('../utils/inputErrors');

const {authorities, valideAuthority}= require('../utils/authority')
const {loginInputs, signupInputs} = require('./inputs/account')


//! ----- LOGIN A USER ----------
exports.userLogin = async (req, res, next) => {
    const userName = req.body.userName;
    const password = req.body.password;

    const {userNameProperties,passwordProperties} = loginInputs

    const isError = [
        await validate(userName,userNameProperties),
        await validate(password,passwordProperties),
    ].filter(e=>e!==true);

    if(isError.length){
        return res.status(500).json({
            errors:isError,
            message:'Invalid Input!'
        })
    }


    const user = await User.findOne({userName});

    if(!user){
        return res.json({
            date:[],
            status:404,
            message:`the user name <<${userName}>> does not exist in our database`
        })
    }

    const isPasswordValid = await bcrypt.compare(password,user.password);

    if(!isPasswordValid){
        return res.json({
            date:null,
            status:401,
            message:"invalid password"
        })
    }

    const {authority,_id,avatar,email}= user;
    const userId =_id.toString();
    const token = await jwt.sign({userId,userName},process.env.JWT_SECRETCODE,{expiresIn:'120 min'})
    // user.validToken = true;
    await user.save();
    const data = {
        userId,
        userName,
        token,
        authority,
        avatar,
        validToken:true,
        email
    }

    const securedData = {token,authority}    
    
    req.session.set("userSession", securedData);

    
    await req.session.save();
    
    return res.json({
        data,
        status:200,
        message:`${userName} is logged in successfully`
    })

} 



//! -----LOG OUT A USER ----------
exports.userLogout = async (req, res, next) => {
    
    req.session.destroy();
    return res.status(200).json({
        message:'User logged out successfully'
    })
    
} 


//! -----SET NEW PASSWORD ----------
exports.updateUserPassword = async (req, res, next) => {
    
    const oldPassword = req.body.oldPassword;
    const password = req.body.password;
    const userId = req.params.id
    const currentUserId=req.body.currentUserId;

    const currentUser = await User.findOne({_id:currentUserId})

    if(currentUser._id!==userId){
        return res.status(403).json({
            date:null,
            message:'Not authorised to edit other users password'
        })  
    }
    
    const {passwordProperties} = signupInputs;
    const isError = [
        await validate(new_password,passwordProperties),
    ].filter(e=>e!==true);

    if(isError.length){
        return res.status(500).json({
            errors:isError,
            message:'Invalid Input!'
        })
    }

    const user = await User.findOne({_id:userId})
    if(!user){
        return res.status(404).json({
            message:'no user have been found, try again'
        })
    }

    const checkPassword = await bcrypt.compare(oldPassword,user.password)
    if(!checkPassword){
        return res.status(500).json({
            message:'Old password is incorrect'
        })
    }
    const hashPassword = await bcrypt.hash(password,12)
    user.password = hashPassword;

    const newUser = await user.save();
    if(!newUser){
        return res.status(500).json({
            message:'Error while updating the password'
        })
    }
    return res.status(200).json({
        data:{userName:newUser.userName,authority:newUser.authority,avatar:newUser.avatar,updatedAt:newUser.updatedAt.toISOString()},
        message:'password updated successfully'
    })
}




//! ----- Create A NEW USER ----------
exports.signUp = async (req, res, next) => {
    const userName = req.body.userName;
    const password = req.body.password;  
    const email = req.body.email;  

    const user = await User.find({authority:{$eq:"SUPER_ADMIN"}})

    const {userNameProperties,emailProperties,passwordProperties} = signupInputs;

    if(!user.length){
        const isError = [
            await validate(userName,userNameProperties),
            await validate(password,passwordProperties),
            await validate(email,emailProperties),
        ].filter(e=>e!==true);

        if(isError.length){
            return res.status(500).json({
                errors:isError,
                message:'Invalid Input!'
            }) 
        }

        const hashPassword = await bcrypt.hash(password,12)
        const newUser = await new User({
            userName,
            password:hashPassword,
            status:true,
            email,
            authority:'SUPER-ADMIN',
        }).save()
        
        if(!newUser){
            return res.status(500).json({
                data:null,
                message:'Error while saving data'
            }) 
        }
        return res.status(201).json({
            data:{user:newUser.userName},
            message:`The new Super user "${newUser.userName}" has been created successfully`
        }) 
       
    }

    return res.status(401).json({
        date:null,
        message:'You are not Unauthorized!'
    })
}
