
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {WithuAuthSession} = require('../utils/session')

module.exports=WithuAuthSession(async (req,res,next)=>{

        const sessionExist = req.session.get('userSession')
    
        if(!sessionExist){
            const error = {message:'You are not Authenticated'};
            error.code=401;
            res.setHeader("cache-control", "no-store, max-age=0");
            return res.status(401).json({error})
        }

        const {token} = sessionExist;
        let decodedToken ;
        const key = process.env.JWT_SECRETCODE


        if(token&&key){


            try {
                decodedToken = jwt.verify(token,key)                
            } 

            catch (err) {

                const error = {message:'You are not Authenticated'};
                error.code=401;
                return res.status(401).json({error})

            }
        }
        
        

        if(!decodedToken){
            const error = {message:'You are not Authenticated'};
            error.code=401;
            return res.status(401).json({error})
        }  
      

        req.isAuth = true
        req.userId = decodedToken.userId
        next()
    
})