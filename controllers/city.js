const Article = require("../models/article")


//! ----- RETRIEVE ALL CITIES ----------
exports.getAllCities = async (req, res, next) => {
  let city = req.query.city ? req.query.city.replace(/[^a-zA-Z0-9]/g, "") : "";
  const CityLength = new RegExp("^(?![-._])([a-zA-Z _.-]{2,})");

  if (CityLength.test(city)) {
    const pipeline = [
      {
        $match:{$and:[
          {"city.name":{$regex:`^${city}`,$options:'i'}},
          {'sub':{$ne:null}},
          { "status": true },
          {'platform':{$ne:''}},
        ]}
      },
      {
        $group:{
          _id: "$city.name",
        }
      },
      {
        $group:{
          _id: null,
          cities:{$push:"$_id"}
        }
      },
      {
        $project:{
          'cities':true,'_id':false
        }
      }
    ]
    
    const data = await  Article.aggregate(pipeline).option({allowDiskUse: true})
    return res.status(200).json({
      cities: data[0].cities,
      message: "Operation succeeded",
    });
  }

  return res.status(422).json({
    cities: [],
    message: "no city to display",
  });
};
