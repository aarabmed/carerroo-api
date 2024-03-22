

const User = require('../models/user')
const validate = require('../utils/inputErrors');
const {signupInputs} = require('./inputs/account')
const bcrypt = require('bcrypt');
const {authorities, valideAuthority}= require('../utils/authority');
const toBoolean = require('../utils/toBoolean');




//! ----- CREATE A NEW USER ----------
exports.newUser = async (req, res, next) => {
    const userId = req.body.currentUserId??'';
    const userName = req.body.userName;
    const password = req.body.password;
    const newAuthority = req.body.role;
    const email = req.body.email;
    const avatar = req.body.avatar
    const {userNameProperties,passwordProperties,emailProperties} = signupInputs

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        const error = {message:"Unauthorised, undefined user"}
        error.code = 400
        return res.status(400).json({
            error
        })
    }

    
    const isError = [
        await validate(userName,userNameProperties),
        await validate(password,passwordProperties),
        await validate(email,emailProperties),
    ].filter(e=>e!==true);
    
    let { authority } = await User.findById({_id:userId})

    const isAuthorised = authorities.includes(authority)
    const isValideAuthority = valideAuthority.includes(newAuthority)
    if(!isValideAuthority){
        isError.push({authority:`Error !!, authority of type ${newAuthority.toUpperCase()} is invalid`})
    }

    if(!isAuthorised){
        isError.push({error:`Unauthoried!!, an account of type ${authority} can not create an account of type ${newAuthority.toUpperCase()}`})
    }

    if(authority==='ADMIN'&&newAuthority==='SUPER_ADMIN'){
         isError.push({error:`Unauthorised!!, you can not create a SUPER-ADMIN account with an account type ADMIN`})
    }

    if(isError.length){
        return res.json({
            status:500,
            errors:isError,
            message:'Invalid Input!'
        }) 
    }

    const userExisted = await User.findOne({userName});

    if(userExisted){
        return res.status(403).json({
            message:`The user ${userName} already exists`
        })
    }

    const hashPassword = await bcrypt.hash(password,12)

    const user = await new User({
        userName,
        password:hashPassword,
        avatar:`/assets/avatars/${avatar}.png`,
        status:true,
        email,
        authority:newAuthority.toUpperCase(),
        validToken:false
    })



    
    const createdUser = await user.save()
    const data = {
        userName : createdUser.userName,
        authority: createdUser.authority,
        createdAt: createdUser.createdAt.toISOString(),
        status:createdUser.status,
        email:createdUser.email,
        userId : createdUser._id,
        avatar:createdUser.avatar
    }
    return res.status(201).json({
        message:'user Created successfully',
        data
    })
}


//! ----- RETRIEVE A SINGLE USER ----------
exports.getUser = async (req, res, next) => {
    const userId = req.params.id;  
    const user = await User.findOne({_id:userId,deleted:false})
    if(!user){
        return res.status(404).json({
            date:null,
            message:'No user have been found with the provided ID, try again'
        })
    }

    const data= {
        userName:user.userName,
        authority:user.authority,
        status:user.status,
        avatar:user.avatar,
        email:user.email,
        createdAt:user.createdAt.toISOString(),
        updatedAt:user.updatedAt.toISOString()
    }

    return res.status(200).json({
        user:data,
        message:'Operation succeeded'
    })
}



//! ----- RETRIEVE ALL USERS ----------
exports.getAllUsers = async (req, res, next) => {
    const userId = req.userId
    const users = await User.find({deleted:false,_id:{$ne:{_id:userId}}});
    if(!users.length){
        return res.status(404).json({
            date:null,
            message:'no user have been found, try again'
        })
    }

    const data = users.map(user=>({
                            ...user._doc,
                            createdAt:user.createdAt.toISOString(),
                            updatedAt:user.updatedAt.toISOString()
                        }))
    return res.status(200).json({
        data,
        message:'Operation succeeded'
    })
}





//! ----- EDIT A USER ----------

exports.updateUser = async (req, res, next) => {
    const oldPassword = req.body.password
    const newPassword = req.body.new_password
    const userName = req.body.userName;
    const avatar = req.body.avatar;
    const email = req.body.email;
    const role = req.body.role;
    const currentUserId=req.body.currentUserId

    const {userNameProperties,emailProperties,passwordProperties} = signupInputs;

    const currentUser = await User.findOne({_id:currentUserId})

    const isValideAuthority = valideAuthority.includes(role)
    if(!isValideAuthority){
        isError.push({authority:`Error !!, authority of type ${newAuthority.toUpperCase()} is invalid`})
    }
    
    const isError = [
        newPassword?await validate(new_password,passwordProperties):true,
        await validate(userName,userNameProperties),
        await validate(email,emailProperties),
    ].filter(e=>e!==true);

    if(isError.length){
        return res.status(500).json({
            errors:isError,
            message:'Invalid Input!'
        })
    }


    const checkPassword = await bcrypt.compare(oldPassword,currentUser.password)
    if(!checkPassword){
        return res.status(500).json({
            message:'Current password is incorrect!'
        })
    }


    if(newPassword){
        const hashPassword = await bcrypt.hash(newPassword,12)
        currentUser.password = hashPassword;
    }

    currentUser.userName = userName;
    currentUser.avatar = avatar;
    currentUser.email = email

    if(currentUser.authority==='ADMIN' && role !=='SUPER_ADMIN'){
        currentUser.authority = role
    }
    const newUser = await currentUser.save();   

    if(!newUser){
        return res.status(500).json({
            message:'Error while updating the user'
        })
    }

    return res.status(200).json({
        user:{userId:newUser._id,userName:newUser.userName,email:newUser.email,authority:newUser.authority,avatar:newUser.avatar,updatedAt:newUser.updatedAt.toISOString()},
        message:'User updated successfully'
    })
}

//! ----- SET USER STATUS ----------
exports.setUserStatus = async (req, res, next) => {
    const status = toBoolean(req.body.status);
    const userId = req.params.id;
    const currentUserId=req.body.currentUserId

    const {statusProperties} = signupInputs;

    const isError = [
        await validate(status,statusProperties),
    ].filter(e=>e!==true);

    if(isError.length){
        return res.status(500).json({
            errors:isError,
            data:null
        })
    }

    const user = await User.findOne({_id:userId})
    if(!user){
        return res.status(404).json({
            message:'no user have been found, try again'
        })
    }

    const currentUser = await User.findOne({_id:currentUserId})
    const userAuthority = authorities.find(elm=>elm===currentUser.authority)
    if(userAuthority){  
        if(userAuthority===user.authority||userAuthority==='ADMIN'&&user.authority==='SUPER_ADMIN'){
            return res.status(403).json({
                date:null,
                message:`You can not ${status?'activate':'desactivate'} a user with the same or higher prevelige`
            })
        }

        if(userAuthority==='ADMIN'&&user.authority==='REGULAR'||userAuthority==='SUPER_ADMIN'&&user.authority==='REGULAR'||userAuthority==='SUPER_ADMIN'&&user.authority==='ADMIN'){
            user.status = status;
            user.statusUpdatedBy = currentUser._id
            const newUser = await user.save();    
            if(!newUser){
                return res.status(500).json({
                    message:`Error while ${status?'activating':'desactivating'} the user`,
                    data:null

                })
            }
            return res.status(200).json({
                data:{userName:newUser.userName,updatedAt:newUser.updatedAt.toISOString()},
                message:`User ${status?'activated':'desactivated'} successfully`
            })
        }
    } 
    return res.status(403).json({
        date:null,
        message:`Not authorised to ${status?'activate':'desactivate'} a user`
    })
}

//! ----- UPGRADE A USER ----------
exports.upgradeUser = async (req, res, next) => {
    const role = req.body.role;
    const currentUserId=req.body.currentUserId
    const userId = req.params.id;
    let isError=[]
    const authority = valideAuthority.find(elm=>elm===role)
    
    
    if(!authority)isError.push({authority:'Authority selected is not valid!'})

    if(isError.length){
        return res.status(500).json({
            errors:isError,
            data:null
        })
    }

    const user = await User.findOne({_id:userId})
    if(!user){
        return res.status(404).json({
            message:'no user have been found, try again'
        })
    }

    const currentUser = await User.findOne({_id:currentUserId})
    const currentUserAuthority = authorities.find(elm=>elm===currentUser.authority)

    if(currentUserAuthority){  
        if(currentUserAuthority===user.authority){
            return res.status(403).json({
                date:null,
                message:'You can not upgrade a user with the same prevelige' 
            })
        }

        if(currentUserAuthority==='ADMIN'&&user.authority==='SUPER_ADMIN'){
            return res.status(403).json({
                date:null,
                message:'You can not upgrade a user with higher prevelige' 
            })
        }

        if(currentUserAuthority==='ADMIN'&&user.authority==='REGULAR'||currentUserAuthority==='SUPER_ADMIN'&&user.authority==='REGULAR'||currentUserAuthority==='SUPER_ADMIN'&&user.authority==='ADMIN'){
            user.authority = role
            user.updatedBy = currentUserId
            const newUser = await user.save();    
            if(!newUser){
                return res.status(500).json({
                    message:'Error while upgrading the user',
                    data:null
                })
            }
            return res.status(200).json({
                data:{authority:newUser.authority,updatedAt:newUser.updatedAt.toISOString()},
                message:'User upgraded successfully'
            })
        }
    } 
    return res.status(403).json({
        date:null,
        message:'Not authorised to upgrade a user'
    })
}

//! ----- DOWNGRADE A USER ----------
exports.downgradeUser = async (req, res, next) => {
    const role = req.body.role;
    const currentUserId=req.body.currentUserId
    const userId = req.params.id;
    let isError=[]
    const authority = valideAuthority.find(elm=>elm===role)
    
    if(!authority)isError.push({authority:'Authority selected is not valid!'})

    if(isError.length){
        return res.status(500).json({
            errors:isError,
            data:null
        })
    }

    const user = await User.findOne({_id:userId})
    if(!user){
        return res.status(404).json({
            message:'no user have been found, try again'
        })
    }

    const currentUser = await User.findOne({_id:currentUserId})
    const currentUserAuthority = authorities.find(elm=>elm===currentUser.authority)
    
    if(currentUserAuthority){  
        if(currentUserAuthority===user.authority){
            return res.status(403).json({
                date:null,
                message:'You can not downgrade a user with the same prevelige' 
            })
        }

        if(currentUserAuthority==='ADMIN'&&user.authority==='SUPER_ADMIN'){
            return res.status(403).json({
                date:null,
                message:'You can not downgrade a user with higher prevelige' 
            })
        }

        if(currentUserAuthority==='ADMIN'&&user.authority==='REGULAR'||currentUserAuthority==='SUPER_ADMIN'&&user.authority==='REGULAR'||currentUserAuthority==='SUPER_ADMIN'&&user.authority==='ADMIN'){
            user.authority = role
            user.updatedBy = currentUserId
            const newUser = await user.save();    
            if(!newUser){
                return res.status(500).json({
                    message:'Error while upgrading the user',
                    data:null
                })
            }
            return res.status(200).json({
                data:{authority:newUser.authority,updatedAt:newUser.updatedAt.toISOString()},
                message:'User downgraded successfully'
            })
        }
    } 
    return res.status(403).json({
        date:null,
        message:'Not authorised to downgrade a user'
    })
}


//! ----- DELETE A USER ----------
exports.deleteUser = async (req, res, next) => {
    const userId = req.params.id;
    const currentUserId = req.body.currentUserId

    const currentUser = await User.findOne({_id:currentUserId})
    const user = await User.findOne({_id:userId})
    const authority = authorities.find(elm=>elm===currentUser.authority)
    
    if(authority){
        
        if(authority===user.authority||(authority==='ADMIN'&&user.authority==='SUPER_ADMIN')){
            return res.status(403).json({
                date:null,
                message:'Can not delete a user with the same or higher prevelige' 
            })
        }

        if(authority==='ADMIN'&&user.authority==='REGULAR'||authority==='SUPER_ADMIN'&&user.authority==='REGULAR'||authority==='SUPER_ADMIN'&&user.authority==='ADMIN'){
            
            user.deleted = true;
            user.deletedBy = currentUser._id
            const deletedUser = await user.save(); 
            return res.status(200).json({
                date:deletedUser,
                message:'User deleted successfully'
            })
        }
    }

    return res.status(403).json({
        date:null,
        message:'Not authorised to delete a user'
    })
}


exports.superAdmin = async (req, res, next) => {
    
    const user = await User.find({authority:{$eq:"SUPER_ADMIN"}})
    
    if(!user.length){
            return res.status(404).json({
                date:false,
                message:'No super account existed yet'
            })
    }

    return res.status(200).json({
        date:true,
        message:'A super account already existed'
    })  
}

