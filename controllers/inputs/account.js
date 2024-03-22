
exports.loginInputs ={
    userNameProperties:{
        inputName:'userName',
        validation:[
            {
                isEmpty:true
            }
        ]
    },
    passwordProperties:{
        inputName:'password',
        validation:[
            {
                isEmpty:true
            }
        ]
    },
    emailProperties:{
        inputName:'email',
        validation:[
            {
                isEmail:true
            }
        ]
    }
}



exports.signupInputs ={
    userNameProperties:{
        inputName:'userName',
        validation:[
            {
                isEmpty:false
            },
            {
                isLength:{min:5,max:20}
            },
            {  
                Match:{
                    isMatch:true,
                    matchRegex:'[!@#$%^&*(),.?":{}|<>]'
                }
            }
        ]
    },
    passwordProperties:{
        inputName:'password',
        validation:[
            {
                isEmpty:false
            },
            {
                isLength:{min:9}
            },
            {
                isRegEx: new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])')
            }
        ]
    },
    emailProperties:{
        inputName:'email',
        validation:[
            {
                isEmail:true
            }
        ]
    },
    oldPasswordProperties:{
        inputName:'oldPassword',
        validation:[
            {
                isEmpty:false
            }
        ]
    },
    statusProperties:{
        inputName:'status',
        validation:[
            {
                isBoolean:true
            },
        ]
    },
}

