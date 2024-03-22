const Province = require("../models/province");
const City = require("../models/city");
const validate = require("../utils/inputErrors");
const { signupInputs } = require("./inputs/account");
const bcrypt = require("bcrypt");
const { authorities, valideAuthority } = require("../utils/authority");
const toBoolean = require("../utils/toBoolean");
const isValidID = require("../utils/IDvalidator");
const ObjectID = require("mongodb").ObjectId;
const fetch = require("node-fetch");
const fs = require("fs");
const Article = require("../models/article");

const path = require("path");

var options = {
  allowDiskUse: true,
};


//! ----- CREATE A NEW USER ----------
exports.createProvince = async (req, res, next) => {
  const name = req.body.name;
  const state_code = req.body.state_code;
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;
  const term = req.body.term;

  const cities = req.body.cities
    ? Array.isArray(req.body.cities)
      ? req.body.cities
      : JSON.parse(req.body.cities)
    : [];

  const Position = {
    lat: latitude,
    lon: longitude,
  };

  try {
    const province = await new Province({
      name,
      state_code,
      position: Position,
      status: true,
      term,
      cities,
      createdBy: ObjectID("63725ac1b836b92f215fd7a3"),
    }).save();

    return res.status(201).json({
      message: "new province have been created successfully",
      data: province,
    });
  } catch (error) {
    return res.status(500).json({
      message: "failed to add new province, reason: " + error.toString(),
    });
  }
};

//! ----- RETRIEVE A SINGLE PROVINCE ----------
exports.getSingleProvince = async (req, res, next) => {
  const provinceValue = req.params.province;
  const pipeline = [
    {$match:{'city.value':{$regex:provinceValue.toUpperCase()}}},
    {$group:{_id:'$city.name'}},
    {$project:{'name':'$_id','_id':'$_id'}},
    {$sort:{'name':1}}
  ]

  const cities = await Article.aggregate(pipeline).option(options);


  return res.status(200).json({
    cities: cities,
    message: "Operation succeeded",
  });
};

//! ----- RETRIEVE ALL PROVINCES ----------
exports.getAllProvinces = async (req, res, next) => {
  const provinces = await Province.find({}, { cities: 0 });

  return res.status(200).json({
    provinces: provinces,
    message: "Operation succeeded",
  });
};

//! ----- DELETE A USER ----------
exports.addCitiesToProvince = async (req, res, next) => {
  const interval = 500;
  var promise = Promise.resolve();
  const provinceId = req.params.id;

  const filePath = path.join(process.cwd(), "/resources/cities-YU.json");

  const axios = require("axios");
  const { term, cities } = await Province.findById(provinceId).populate(
    "cities",
  );

  let duplicateItems = 0;
  function capitalize(str) {
    return str
      .toLowerCase()
      .split(",")[0]
      .split(" ")
      .map((e) => e.charAt(0).toUpperCase() + e.slice(1))
      .join(" ");
  }
  cities.forEach(async (city, index) => {
    // if(index>1260){
    promise = promise.then(async function () {
      const name = city.name;
      const params = {
        access_key: "89b218600b13b10a2ddaafab78eec60f",
        query: name,
        region: "Northwest Territories",
        country: "CA",
      };
      try {
        const response = await axios.get(
          "http://api.positionstack.com/v1/forward",
          { params },
        );
        if (!response) {
          console.log("ress:", response.data);
        }
        if (response.data.data.length > 1) {
          duplicateItems += 1;
        }
        if (response.data.data.length) {
          const cityPosition = {
            lat: response.data.data[0].latitude,
            lon: response.data.data[0].longitude,
          };

          const newName = capitalize(name) + ", " + name.split(",")[1].trim();
          await City.findOneAndUpdate(
            { _id: ObjectID(city._id) },
            { $set: { name: newName, position: cityPosition } },
          );
        }
      } catch (error) {
        return res.status(422).json({
          error: error.toString(),
          message: name,
        });
      }

      return new Promise(function (resolve) {
        setTimeout(resolve, interval);
      });
    });
    //}
  });

  promise.then(function () {
    return res.status(200).json({
      message: "Cities have been added successfully",
    });
  });
};
