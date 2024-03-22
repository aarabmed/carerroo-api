const Device = require("../models/device");
const  admin = require("firebase-admin");
const path = require('path');
const moment = require('moment')


exports.subscribeToNotification = async (req, res, next) => {
  
    const deviceToken = req.body.token
  
    let interestList = typeof(req.body.interestList)==="string"?JSON.parse(req.body.interestList):req.body.interestList
    console.log('req.body-token:',req.body.token)
    console.log('interestList:',interestList)
    
    const serviceAccount = path.join(process.cwd(), "/resources/careerroapp-firebase-adminsdk-aiq28-05fc776304.json");
    
    
    const fireBase = admin.apps.length ? admin.app() : admin.initializeApp({credential: admin.credential.cert(serviceAccount)})

  
        

    const succeeedSubscription = []
    const failedSubscription = []
    const device = await Device.findOne({token:deviceToken})
    if(device){
        const newInterestList = interestList.filter(e=>!device.interestList.includes(e))
        const removeInterestList = device.interestList.filter(e=>!interestList.includes(e))
        if(newInterestList.length){
          newInterestList.map(option=>{
            fireBase.messaging().subscribeToTopic(deviceToken, option)
            .then((response) => {
              // See the MessagingTopicManagementResponse reference documentation
              // for the contents of response.
              console.log('Successfully subscribed to topic:', response);
              
            })
            .catch((error) => {
              console.log('Error subscribing to topic:', error);
            });
          })
        


          Promise.allSettled(newInterestList).then(async (results)=>{
            results.forEach(res=>{
              if (res.status==='fulfilled'){
                  succeeedSubscription.push(res.value)
              }else{
                  failedSubscription.push(res.reason)
              }
            })
            device.interestList = interestList
            await device.save();

            if(removeInterestList.length){
                Promise.allSettled(interestList).then(async (results)=>{
                  results.forEach(res=>{
                    if (res.status==='fulfilled'){
                        succeeedSubscription.push(res.value)
                    }else{
                      failedSubscription.push(res.reason)
                    }
                  })
                  return res.status(200).json({
                      message: "opperation succeed",
                      data: {succeeedSubscription,failedSubscription}
                  });
                }).catch(error=>{
                  console.log('errors:',error)
                })
            }else{
              return res.status(200).json({
                message: "opperation succeed",
                data: {succeeedSubscription,failedSubscription}
              });
            } 
          }).catch(error=>{
            console.log('errors:',error)
          })
        }

        if(removeInterestList.length){
          removeInterestList.map(option=>{
              fireBase.messaging().unsubscribeFromTopic(deviceToken, option)
            .then((response) => {
              // See the MessagingTopicManagementResponse reference documentation
              // for the contents of response.
              console.log('Successfully subscribed to topic:', response);
              
            })
            .catch((error) => {
              console.log('Error subscribing to topic:', error);
            });
          }) 
          
          Promise.allSettled(interestList).then(async (results)=>{
            results.forEach(res=>{
              if (res.status==='fulfilled'){
                  succeeedSubscription.push(res.value)
              }else{
                failedSubscription.push(res.reason)
              }
            })
            device.interestList = interestList
            await device.save();
            return res.status(200).json({
                message: "opperation succeed",
                data: {succeeedSubscription,failedSubscription}
            });
          }).catch(error=>{
            console.log('errors:',error)
          })
        }
    }

    if (Array.isArray(interestList) && interestList.length && interestList.length<=2){
      interestList.map(option=>{
         fireBase.messaging().subscribeToTopic(deviceToken, option)
        .then((response) => {
          // See the MessagingTopicManagementResponse reference documentation
          // for the contents of response.
          console.log('Successfully subscribed to topic:', response);
          
        })
        .catch((error) => {
          console.log('Error subscribing to topic:', error);
        });
      })

      Promise.allSettled(interestList).then(async (results)=>{
        results.forEach(res=>{
          if (res.status==='fulfilled'){
              succeeedSubscription.push(res.value)
          }else{
              failedSubscription.push(res.reason)
          }
        })
        await new Device({
          token:deviceToken,
          lastActiveDate: moment().format('YYYY-MM-DDTHH:mm:ss.ssssssZ'),
          interestList: interestList,
        }).save();
        return res.status(200).json({
          message: "opperation succeed",
          data: {succeeedSubscription,failedSubscription}
        });
      }).catch(error=>{
        console.log('errors:',error)
      })
    }else{
      return res.status(500).json({
        message: "opperation failed, interestList must be a valid array",
        data: {}
      });
    }
  
};


exports.unsubscribeFromNotification = async (req, res, next) => {
    const deviceToken = req.body.token

    let interestList = req.body.interestList?JSON.parse(req.body.interestList):[]

    console.log('req.body-token:',req.body.token)
    console.log('interestList:',interestList)
    const serviceAccount = path.join(process.cwd(), "/resources/careerroapp-firebase-adminsdk-aiq28-05fc776304.json");

    let fireBase
    
    if (admin.apps.length === 0) {
      fireBase =  admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
    }

    if (interestList.length){      
          const succeeedSubscription = []
          const failedSubscription = []

          interestList.map(topic=>{
            fireBase.messaging().unsubscribeFromTopic(deviceToken, topic)
            .then((response) => {
              // See the MessagingTopicManagementResponse reference documentation
              // for the contents of response.
              console.log('Successfully unsubscribed from topic:', response);

            })
            .catch((error) => {
              console.log('Error while unsubscribing from topic:', error);
            });
          })

          Promise.allSettled(interestList).then(async (results)=>{
            results.forEach(res=>{
              if (res.status==='fulfilled'){
                  succeeedSubscription.push(res.value)
              }else{
                failedSubscription.push(res.reason)
              }
            })
            await Device.findOneAndRemove({token:deviceToken})
            return res.status(200).json({
                message: "opperation succeed",
                data: {succeeedSubscription,failedSubscription}
            });
          }).catch(error=>{
            console.log('errors:',error)
          })  
    }else{
        return res.status(500).json({
          message: "opperation failed, interestList is empty",
          data: {}
        });
    }  
};


exports.checkNotificationStatus = async (req, res, next) => {
  const token = req.body.token;
  if(token){
    try{
        await Device.findOneAndRemove({ token: token });
        return res.status(201).json({
          message: "device have been deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
          message: "failed to remove the device, reason: " + error.toString(),
        });
    }
  }else{
    return res.status(500).json({
      message: "failed to remove the device",
    });
  }
};

/*
exports.markNotificationsAsOld = async (req, res, next) => {
  const token = req.body.token;
  const device = await Device.findOne({ token: token });
  if (device) {

    device.notifications = device.notifications.map(e=>(e.new===true?{...e,new:false}:e))
    await device.save()
    return res.status(200).json({
      message: "notifications are mark as old, successfully",
    });
  }
  return res.status(500).json({
    message: "failed to mark notifications as old",
  });
  
};


exports.markNotificationsAsRead = async (req, res, next) => {
  const token = req.body.token;
  const id = req.body.id
  const device = await Device.findOne({ token: token });
  if (device) {

    device.notifications = device.notifications.map(e=>(e.id===id?{...e,viewed:true}:e))
    device.lastActiveAt= moment().format('YYYY-MM-DD')
    await device.save()
    return res.status(200).json({
      message: "notification mark as read successfully",
    });
  }
  return res.status(500).json({
    message: "failed to mark notification as read",
  });
  
}; */
