const AWS = require('aws-sdk');
const request = require('request-promise')
const Jimp = require('jimp')

module.exports=async(imgUrl,title,id)=>{
    let status = true;

    const s3 = new AWS.S3({
        region:'us-west-1',
        accessKeyId: process.env.S3ACCESSID,
        secretAccessKey: process.env.S3SECRETKEY,
    });
    
    
    const options = {
        uri: imgUrl,
        encoding: null
    };
    
    try {
        const body = await request(options);

        const imagePath = imgUrl.substring(imgUrl.lastIndexOf('/')+1)
        const imageName = `${id}-${imagePath}`;

        const originalImage = await s3.upload({
            Bucket: 'azcourses',
            Key: imageName,
            Body: body,
        }).promise();

        const jimp = await Jimp.read(body)
        const newBuffer = await jimp.resize(Jimp.AUTO,180).quality(80).getBufferAsync(jimp.getMIME())
        



        const thumbnail = await s3.upload({
            Bucket: 'azcourses',
            Key: 'thumbnail-'+imageName,
            Body: newBuffer,
        }).promise();

    
        const image = {
            url:originalImage.Location,
            thumbnailUrl:thumbnail.Location,
            name:title.replace(/[^a-zA-Z]/g,' ').replace(/\s+/g,' ')
        }

        return {
            data:image,
            status:status
        }
        
    } catch (error) {
        return {
            data:error,
            status:false
        }
    }
    
}