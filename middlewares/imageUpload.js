const multer = require('multer');




const fileFilter = (req, file, cb)=>{
    if(file.mimetype === 'image/png' || 
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg'){
        cb(null, true);
    }else{
        const error = new Error("Invalid file")
        error.message = "The file you uploaded is not a valid image, we support only (jpeg, jpg, png) types"
        error.code = 'INVALID_FILE_TYPE'
        error.field= file.fieldname
        cb(error,false)
    }
}

module.exports=(value)=> (req, res, next) =>{
    const uploadFiles = multer({storage:multer.memoryStorage(),limits:{fileSize:1572864},fileFilter:fileFilter}).single(value);
    uploadFiles( req, res, err => {
        if (err) {
            let messageError = ''
            if(err.code === "LIMIT_FILE_SIZE"){
                messageError = "Image too large, you can only upload images up to 1.5 MB"
            }
            if(err.code === "INVALID_FILE_TYPE"){
                messageError = err.message
            }
            
            return res.status(413).json({
                message:messageError
            })
            
        }

        if(!req.file){
            req.body.image = null 
           return next()
        }

        const ImageFolder = req.file.fieldname.replace('Image','')    
        const image = {
            buffer:req.file.buffer,
            fileName:req.file.originalname,
            folderName:ImageFolder,
        }
        req.body.image = image
        next();
    });
}