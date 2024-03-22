const { withIronSession  } = require('next-iron-session'); 




function WithuAuthSession(handler){
    return withIronSession(handler,{
        cookieName: "userSession",
        password: process.env.USER_SESSION,
        ttl:60*120,
        cookieOptions: {
            secure: false,
            httpOnly: true,
            sameSite: "lax",
        }}
    )
};

function WithPublicSession(handler){
    return withIronSession(handler,{
        cookieName: "public",
        password: process.env.PUBLIC_SESSION,
        ttl:60*6,
        cookieOptions: {
            secure: false,
            httpOnly: true,
            sameSite: "lax",
        }}
    )
};


 
module.exports={WithuAuthSession,WithPublicSession}