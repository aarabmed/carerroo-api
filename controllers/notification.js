const Article = require("../models/article")
const Device = require("../models/device");
const moment = require('moment')
const mongoose = require("mongoose");
const path = require('path')
const  admin = require("firebase-admin");


exports.getNotifications = async (req, res, next) => {
  const deviceToken = req.params.token
  
  if(typeof(deviceToken)!=="string"){
    return res.status(500).json({
      message: "failed to find the corresponding device",
    });
  }

  const device = await Device.findOne({token:deviceToken})
  
  if (device) {
    const ids = device.interestList.map(e=>mongoose.Types.ObjectId(e))
    const twoDaysAgo = moment().subtract(2, 'days').format('YYYY-MM-DD')

    const lastCheck =   moment(device.lastActiveDate).isAfter(twoDaysAgo) ?moment(device.lastActiveDate).format('YYYY-MM-DDTHH:mm:ss.ssssssZ'):twoDaysAgo

    console.log('lastCheck:',twoDaysAgo)
    console.log('typof:',typeof(twoDaysAgo))
    device.lastActiveDate = moment().format('YYYY-MM-DDTHH:mm:ss.ssssssZ')

    const pipeline = [
      {
        $match: {
          $and: [
            {
              sub:{$in:ids}
            },
            {
              status:true
            },
            {
              deleted:false,
            },
            {
              updatedAt:{$gte:lastCheck}
            }
          ],
        }
      },
      {
        $sort: {
          updatedAt: -1,
        },
      },
      {
        $lookup:{
          from: 'subCategories',
          localField: "sub",
          foreignField: "_id",
          pipeline:[{$project:{
            title:"$title"
          }}],
          as: 'subs'
        },
      },
      {
        $project: {
          jobTitle: "$title",
          companyName: "$business",
          job_id: "$job_id",
          jobLocation: "$city.value",
          platform: "$platform",
          date: new Date().toJSON(),
          seen:{$toBool: false},
          sub:{$arrayElemAt:['$subs.title',0]}
        },
      },
      {
        $group:{
          _id:"$sub",
          articles:{
            $addToSet:{
              _id:"$_id",
              jobTitle:"$jobTitle",
              companyName: "$companyName",
              job_id: "$job_id",
              jobLocation: "$jobLocation",
              platform: "$platform",
              date: "$date",
              seen: "$seen",
            }
          },
          count: {
            $count: {}
          }
        }
      }
    ];


    const results = await Article.aggregate(pipeline).allowDiskUse(true);
    
    if (!results) {
      return res.status(500).json({
        data: null,
        message: "Error while retreiving latest notifications",
      });
    }
    
    await device.save()
    return res.status(200).json({
      notifications: results,
      numberResults: results.length,
      message:"notifications have been retrieved successfully"
    });
  }
  return res.status(500).json({
      message: "failed to find the corresponding device",
  });
};

 
exports.sendNotifications = async (req, res, next) => {
  //const deviceToken = req.body.token
  //let interestList = [""]//req.body.interestList
  const serviceAccount = path.join(process.cwd(), "/resources/careerroapp-firebase-adminsdk-aiq28-05fc776304.json");

    if(admin.apps.length === 0){
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
    }
    
    const message = {
      android:{
        priority: "high",
      },
      data:{},
      topic: '63bddefdf85a47baa50ad68b'
    };
    
    admin.messaging().send(message)
      .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
        return res.status(200).json({
          message: "notification has been sent succussfuly",
          result:response
        });
      })
      .catch((error) => {
        return res.status(500).json({
          message: error.errorInfo.message,
          result:null
        });
      });
  
    
};

/* */


/*

  const results =[
      {
          "_id": "Secondary school teachers",
          "articles": [
              {
                  "_id": "6545d4c6c49460b2c6a3b052",
                  "jobTitle": "vocational high school teacher",
                  "job_id": "article-39469769",
                  "jobLocation": "Sherbrooke (QC)",
                  "platform": "jobillico",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              }
          ],
          "count": 1
      },
      {
          "_id": "Cooks",
          "articles": [
 
              {
                  "_id": "6546c3a8b4609ee888501c12",
                  "jobTitle": "cook",
                  "job_id": "article-39483101",
                  "jobLocation": "Sudbury (ON)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "65474239681b64a375a6f2c9",
                  "jobTitle": "short order cook",
                  "job_id": "article-39484798",
                  "jobLocation": "Rocky View (AB)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "6546b340d8e6438ae2844c23",
                  "jobTitle": "cook",
                  "job_id": "article-39482981",
                  "jobLocation": "Toronto (ON)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "65465328c3a78c86e8a2b935",
                  "jobTitle": "first cook",
                  "job_id": "article-39479327",
                  "jobLocation": "Toronto (ON)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "65467d592a35dc7493dd1702",
                  "jobTitle": "cook",
                  "job_id": "article-39482413",
                  "jobLocation": "Weyburn (SK)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "65459550817324b450c954ad",
                  "jobTitle": "cook",
                  "job_id": "article-39468639",
                  "jobLocation": "Halifax (NS)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "6546a788842f856d32174059",
                  "jobTitle": "cook",
                  "job_id": "article-39482725",
                  "jobLocation": "Weyburn (SK)",
                  "platform": "saskjobs",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "65459c58591606a5d57e8f7b",
                  "jobTitle": "cook",
                  "job_id": "article-39468901",
                  "jobLocation": "Mississauga (ON)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "654718085351c420e8377a98",
                  "jobTitle": "cook",
                  "job_id": "article-39483769",
                  "jobLocation": "Québec (QC)",
                  "platform": "jobillico",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "65468b6a1127efdbcc12912a",
                  "jobTitle": "cook",
                  "job_id": "article-39482580",
                  "jobLocation": "Toronto (ON)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "654673f787ce67ea712e111b",
                  "jobTitle": "cook",
                  "job_id": "article-39482182",
                  "jobLocation": "Winfield (BC)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "6545bad3d7b17c75cf51ae2e",
                  "jobTitle": "pizza cook",
                  "job_id": "article-39469433",
                  "jobLocation": "Chestermere (AB)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "65466a99556c0a8acdba16e3",
                  "jobTitle": "cook",
                  "job_id": "article-39481613",
                  "jobLocation": "Whitecourt (AB)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "654728ca4fd54f4e1009f163",
                  "jobTitle": "cook",
                  "job_id": "article-39484179",
                  "jobLocation": "Chibougamau (QC)",
                  "platform": "jobillico",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "6546c3a8b4609ee888501c0f",
                  "jobTitle": "cook",
                  "job_id": "article-39483107",
                  "jobLocation": "Barrie (ON)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "6547493fa446b77334a5399a",
                  "jobTitle": "cook",
                  "job_id": "article-39485279",
                  "jobLocation": "Invermere (BC)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "6546891056af79e9e6c61671",
                  "jobTitle": "cook",
                  "job_id": "article-39482573",
                  "jobLocation": "McAdam (NB)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "65470c5132ddcd42fc8462c3",
                  "jobTitle": "cook",
                  "job_id": "article-39483759",
                  "jobLocation": "Chestermere (AB)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "65468209a62500321ecb75c9",
                  "jobTitle": "cook",
                  "job_id": "article-39482420",
                  "jobLocation": "Calgary (AB)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "6545f578b1db964f6321a452",
                  "jobTitle": "cook, ethnic foods",
                  "job_id": "article-39471938",
                  "jobLocation": "Leamington (ON)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "6546406997c93bffa2b0a81e",
                  "jobTitle": "cook",
                  "job_id": "article-39475540",
                  "jobLocation": "Chapais (QC)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "654707a04d398817a598346b",
                  "jobTitle": "ethnic food cook",
                  "job_id": "article-39483743",
                  "jobLocation": "Winnipeg (MB)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "6546891056af79e9e6c61672",
                  "jobTitle": "cook",
                  "job_id": "article-39482574",
                  "jobLocation": "Brampton (ON)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "6545bad3d7b17c75cf51ae2d",
                  "jobTitle": "line cook",
                  "job_id": "article-39469435",
                  "jobLocation": "Brandon (MB)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "6545a36067b6280f30fc4f75",
                  "jobTitle": "ethnic food cook",
                  "job_id": "article-39468904",
                  "jobLocation": "Acton (ON)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "65458e4981efad2cf24d4bdf",
                  "jobTitle": "cook",
                  "job_id": "article-39468623",
                  "jobLocation": "Surrey (BC)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "6546370dd12cce1331206544",
                  "jobTitle": "cook",
                  "job_id": "article-39473135",
                  "jobLocation": "Fox Creek (AB)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "6546396bc71720cb3eb6e9ad",
                  "jobTitle": "cook",
                  "job_id": "article-39473617",
                  "jobLocation": "Edmonton (AB)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "654692709ee3b95aebfa1d5e",
                  "jobTitle": "cook",
                  "job_id": "article-39482596",
                  "jobLocation": "Sylvan Lake (AB)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "6545d4c6c49460b2c6a3b065",
                  "jobTitle": "cook",
                  "job_id": "article-39469873",
                  "jobLocation": "Québec (QC)",
                  "platform": "jobillico",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "6545c430b1960a5f6c11fdcb",
                  "jobTitle": "cook",
                  "job_id": "article-39469690",
                  "jobLocation": "Kamloops (BC)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "65459550817324b450c954ae",
                  "jobTitle": "cook",
                  "job_id": "article-39468638",
                  "jobLocation": "Edmonton (AB)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              },
              {
                  "_id": "6545f0b823960d2753c1a781",
                  "jobTitle": "cook",
                  "job_id": "article-39471930",
                  "jobLocation": "Calgary (AB)",
                  "platform": "jobbank",
                  "date": "2023-11-12T20:17:49.688Z",
                  "seen": false
              }
          ],
          "count": 33
      }
  ] */
/*   const results =[
    {
        "_id": "Cooks",
        "articles": [
          {
            "_id": "6545f310734fec7b9dbd69f4",
            "jobTitle": "cook",
            "job_id": "article-39471934",
            "jobLocation": "Leamington (ON)",
            "platform": "jobbank",
            "date": "2023-11-12T20:17:49.688Z",
            "seen": false
          },
          {
            "_id": "65470c5132ddcd42fc8462c4",
            "jobTitle": "cook",
            "job_id": "article-39483758",
            "jobLocation": "Calgary (AB)",
            "platform": "jobbank",
            "date": "2023-11-12T20:17:49.688Z",
            "seen": false
          },
          {
            "_id": "654657dd502663cfaa6121e9",
            "jobTitle": "cook",
            "job_id": "article-39480292",
            "jobLocation": "Keswick (ON)",
            "platform": "jobbank",
            "date": "2023-11-12T20:17:49.688Z",
            "seen": false
          },
          {
            "_id": "6546f03020d25e390cd52b27",
            "jobTitle": "line cook",
            "job_id": "article-39483407",
            "jobLocation": "Edmonton (AB)",
            "platform": "jobbank",
            "date": "2023-11-12T20:17:49.688Z",
            "seen": false
          },
          {
            "_id": "65466cf53fb89df721ba70a1",
            "jobTitle": "cook",
            "job_id": "article-39481771",
            "jobLocation": "Calgary (AB)",
            "platform": "jobbank",
            "date": "2023-11-12T20:17:49.688Z",
            "seen": false
          }
        ],
        "count": 5
    }
  ]  
  return res.status(200).json({
    notifications: results,
    numberResults: results.length,
    message:"notifications have been retrieved successfully"
  }); 
*/
/* 
{
  "_id": "6545f310734fec7b9dbd69f4",
  "jobTitle": "cook",
  "job_id": "article-39471934",
  "jobLocation": "Leamington (ON)",
  "platform": "jobbank",
  "date": "2023-11-12T20:17:49.688Z",
  "seen": false
},
{
  "_id": "65470c5132ddcd42fc8462c4",
  "jobTitle": "cook",
  "job_id": "article-39483758",
  "jobLocation": "Calgary (AB)",
  "platform": "jobbank",
  "date": "2023-11-12T20:17:49.688Z",
  "seen": false
},
{
  "_id": "654657dd502663cfaa6121e9",
  "jobTitle": "cook",
  "job_id": "article-39480292",
  "jobLocation": "Keswick (ON)",
  "platform": "jobbank",
  "date": "2023-11-12T20:17:49.688Z",
  "seen": false
},
{
  "_id": "6546f03020d25e390cd52b27",
  "jobTitle": "line cook",
  "job_id": "article-39483407",
  "jobLocation": "Edmonton (AB)",
  "platform": "jobbank",
  "date": "2023-11-12T20:17:49.688Z",
  "seen": false
},
{
  "_id": "65466cf53fb89df721ba70a1",
  "jobTitle": "cook",
  "job_id": "article-39481771",
  "jobLocation": "Calgary (AB)",
  "platform": "jobbank",
  "date": "2023-11-12T20:17:49.688Z",
  "seen": false
},
 */
/* 

if (device) {
    const ids = device.interestList.map(e=>ObjectId(e))
    const twoDaysAgo = moment().subtract(2, 'days').format('YYYY-MM-DD')
    console.log('twoDaysAgo:',twoDaysAgo)
    console.log('device-LastActiveDate:',device.lastActiveDate)

    const lastCheck = '2023-11-04' //moment(device.lastActiveDate).isAfter(twoDaysAgo) ?device.lastActiveDate:twoDaysAgo

    device.lastActiveDate = moment().format('YYYY-MM-DDTHH:mm:ss.ssssssZ')

    const pipeline = [
      {
        $match: {
          $and: [
            {
              sub:{$in:ids}
            },
            {
              status:true
            },
            {
              deleted:false,
            },
            {
              updatedAt:{$gte:lastCheck}
            }
          ],
        }
      },
      {
        $sort: {
          updatedAt: -1,
        },
      },
      {
        $lookup:{
          from: 'subCategories',
          localField: "sub",
          foreignField: "_id",
          pipeline:[{$project:{
            title:"$title"
          }}],
          as: 'subs'
        },
      },
      {
        $project: {
          jobTitle: "$title",
          companyName: "$business",
          job_id: "$job_id",
          jobLocation: "$city.value",
          platform: "$platform",
          date: new Date().toJSON(),
          seen:{$toBool: false},
          sub:{$arrayElemAt:['$subs.title',0]}
        },
      },
      {
        $group:{
          _id:"$sub",
          articles:{
            $addToSet:{
              _id:"$_id",
              jobTitle:"$jobTitle",
              companyName: "$business",
              job_id: "$job_id",
              jobLocation: "$jobLocation",
              platform: "$platform",
              date: "$date",
              seen: "$seen",
            }
          },
          count: {
            $count: {}
          }
        }
      }
    ];
  

    const results = await Article.aggregate(pipeline).allowDiskUse(true);
    
    if (!results) {
      return res.status(500).json({
        data: null,
        message: "Error while retreiving latest notifications",
      });
    }
    
    await device.save()
    return res.status(200).json({
      notifications: results,
      numberResults: results.length,
      message:"notifications have been retrieved successfully"
    });
  }
*/