const AWS = require('aws-sdk');

exports.signUrl=(imgUrl)=>{    
    AWS.config = new AWS.Config({
        region:'us-west-1',
    	accessKeyId: process.env.S3ACCESSID,
        secretAccessKey: process.env.S3SECRETKEY,
        signatureVersion: "v4",
    });
    const s3 = new AWS.S3()
    
    const option = {
        Bucket: 'azcourses',
        Key:imgUrl.substring(45),
        Expires: 900, // 15min
    }
    
    return s3.getSignedUrl('getObject', option)
}