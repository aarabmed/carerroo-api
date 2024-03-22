const ObjectId = require("mongodb").ObjectId;
const moment  = require('moment')
const Category = require('../models/category')
const IsObjectID = require('../utils/IDvalidator') 

exports.secureQuery = (query)=>{
  if(query && Array.isArray(query)){
    return query[0]
  }
  if(query && typeof(query)==="string"){
    return query
  }
  return ""
}

exports.getPagination = (page, size) => {
  const limit = size ? size : 10;
  const offset = page ? (page - 1) * limit : 0;
  // tt = 100
  /// 40 = 5-1 * 10
  return { limit, offset };
};


function isJsonString(str) {
  try {
      JSON.parse(str) ;
  } catch (e) {
      return false;
  }
  return true;
}

const sortValues = ["recent", "popular"];

exports.matchStage = async (query) => {
  const {cat,sub,wr, wg, ys, exp, wb, lg, wc, pd, loc, emt , jt, pf,hr } = query;
  let matchPipeline = [{'sub':{$ne:null}},{ "status": true },{'platform':{$ne:''}},{"deleted":false},{$or:[{expiredDate:{$gte:new Date()}},{expiredDate:null}]}];

  /*   
    //wp = employmentPeriod
    emt = employmentType
    jt = jobType
    hr = hourlyRate
    wr = employmentRegime 
    wg = employmentGroup
    ys  = yearlySalary
    exp = workExperience
    //wb  = workBenifits // $elemMatch()
    lg  = language at work
    wc = workCommitements
    pd  = date posted
    sub = sub-category
    loc = location
    pf = platform 
  */



  // location filter //
   if (loc && typeof loc === "string") {
    const newLocation = loc.split(',')[0]
    const regValue = new RegExp(".*" + newLocation + ".*");
    matchPipeline.push({ $or: [{ "city.name": regValue }, { location: regValue }] });
  }

  // platform filter //
  if (pf && typeof pf === "string") {
    matchPipeline.push({ platform: {$regex:pf}});
  }

  // sub-category filter //

  const subcategories = sub && isJsonString(sub) ? JSON.parse(sub) : sub;

  if(subcategories){
    if (Array.isArray(subcategories) && subcategories.length) {
      const subs = subcategories.map((e) => ObjectId(e));
      matchPipeline.push({ sub: { $in: subs } });
    }
    if(typeof(subcategories)==="string"){
      if(IsObjectID(subcategories)){
        matchPipeline.push({ sub: ObjectId(subcategories) });
      }else{
        matchPipeline.push({ code: {$eq:subcategories}});
      }
    }
  }


   // sub-category filter //

   const category = cat && isJsonString(cat) ? JSON.parse(cat) : cat;

   if(category && typeof(subcategories) ==='string' && subcategories.length===0 ){

     if(typeof(category)==="string"){
      let targetCategory= {subCategories:[]}
      if(IsObjectID(category)){
        targetCategory = await Category.findById(category)
      }else{
        targetCategory = await Category.findOne({code:{$eq:category}})
      }
      if(targetCategory){
        matchPipeline.push({ sub: {$in: targetCategory.subCategories} });
      }
     }
   }




  //hourly rate ///
  const hourlyRate = hr && isJsonString(hr) ? JSON.parse(hr) : hr;
  if (Array.isArray(hourlyRate) && hourlyRate.length) {
    if(hourlyRate.length>1){
      matchPipeline.push({
        salaryBase: { $elemMatch: { $gte: hourlyRate[0], $lte: hourlyRate[1] } },
      });
    }else{
      matchPipeline.push({
        salaryBase: { $elemMatch: { $eq: hourlyRate[0]} },
      });
    }
  }


  // work contract filter //

  if (emt && typeof emt === "string") {
    const wtTypes = ["pe", "te", "se", "ca"]; //pr= permanant, te= temporary, se= seasonal, ca= casual
    if (wtTypes.includes(emt)) {
      matchPipeline.push({ "employmentType.type": emt });
    }
  }

  // employmentRegime filter //
  if (wr && typeof wr === "string") {
    const wrTypes = ["pt", "ft"]; // pt = part-time, ft=full-time
    if (wrTypes.includes(wr)) {
      matchPipeline.push({ "employmentRegime.type": wr });
    }
  }

  // jobType filter //
  if (jt && typeof jt === "string") {
    const jobTypes = ["ot", "st", "in", "ap"]; // ot= other, st=student, in=intership, ap=apprentice
    if (jobTypes.includes(jt)) {
      matchPipeline.push({ "jobType.type": jt });
    }
  }

  // yearlySalary filter //
  if (ys && typeof ys === "string") {
    if (ys === "T") {
      matchPipeline.push({
        Ysalary: { $elemMatch: { $gte: 20000, $lte: 39999 } },
      });
    }
    if (ys === "F") {
      matchPipeline.push({
        Ysalary: { $elemMatch: { $gte: 40000, $lte: 59999 } },
      });
    }
    if (ys === "S") {
      matchPipeline.push({
        Ysalary: { $elemMatch: { $gte: 60000, $lte: 79999 } },
      });
    }
    if (ys === "E") {
      matchPipeline.push({
        Ysalary: { $elemMatch: { $gte: 80000, $lte: 99999 } },
      });
    }
    if (ys === "H") {
      matchPipeline.push({
        Ysalary: { $elemMatch: { $gte: 100000 } },
      });
    }
  }

  // work conditions filter //
  const parsedWC = wc && isJsonString(wc) ? JSON.parse(wc) : wc;
  if (Array.isArray(wc) && parsedWC.length) {
    const conditions = [
      { code: "d", value: "Day" },
      { code: "m", value: "Morning" },
      { code: "e", value: "Evening" },
      { code: "w", value: "Weekend" },
      { code: "s", value: "Shift" },
      { code: "em", value: "Early Morning" },
      { code: "n", value: "Night" },
      { code: "f", value: "Flexible Hours" },
      { code: "o", value: "Overtime" },
      { code: "oc", value: "On Call" },
    ];

    const workConditions = conditions
      .filter((e) => parsedWC.includes(e.code))
      .map((e) => e.value);
    if (workConditions.length) {
      matchPipeline.push({
        "specialCommitments.commitsArray": {
          $elemMatch: {
            $in: workConditions,
          },
        },
      });
    }
  }

  // Experience filter //
  if ( typeof exp === "string" && exp && parseInt(exp)) {
    const experience = Number(exp);
    if (experience === 0) {
      matchPipeline.push({
        experience: { $elemMatch: { duration: { $eq: 0 } } },
      });
    }

    if (experience === 1) {
      matchPipeline.push({
          "experience.duration": { $gt: 1, $lt: 12 },
          "experience.Extype": "months",
      });
    }

    if (experience === 2) {
      matchPipeline.push({
        $or: [
          {
            "experience.duration": { $gt: 12, $lte:24 },
            "experience.Extype": "months",
          },
          {
            "experience.duration": { $eq: 2 },
            "experience.Extype": "years",
          }
        ]
      })
    }

    if (experience === 3) {
      matchPipeline.push({
        experience: {
          $elemMatch: {
            duration: { $gte: 3 },
            Extype: "years",
          },
        },
      });
    }
  }

  // language at work filter //
  if (lg && typeof lg === "string") {
    const languages = ["en", "fr", "b",];
    if (languages.includes(lg)) {
      if (lg === "b") {
        matchPipeline.push({
          "languages.lang": "b"
        });
      } else {
        matchPipeline.push({
          $or: [{ "languages.lang": lg }, { "languages.lang": "m" }],
        });
      }
    }
  }


  // date posted filter //
  const days = ["2", "7", "15", "30", "+30"];
  if (pd && typeof pd === "string") {
    console.log('pd:',pd)
    if(days.includes(pd)){
      if (pd === "+30") {
        const articleAge = moment().subtract(30, "days").format("YYYY-MM-DD");
        matchPipeline.push({ date: { $lt: new Date(articleAge) } });
      } else {
        const daysNumber = Number(pd);
        const articleAge = moment()
          .subtract(daysNumber, "days")
          .format('YYYY-MM-DD')+'T00:00:00';
          console.log('article:',articleAge)
          matchPipeline.push({ date: { $gte: articleAge } });
      }
    }
  }


  // employmentGroup filter //
  if (wg && typeof wg === "string") {
    const wgType = [
      {
        type: "inp",
        value: "Indigenous people",
      },
      {
        type: "pwd",
        value: "Persons with disabilities",
      },
      {
        type: "nc",
        value: "Newcomers",
      },
      {
        type: "ow",
        value: "Older workers",
      },
      {
        type: "vet",
        value: "Veterans",
      },
      {
        type: "yth",
        value: "Youth",
      },
      {
        type: "vim",
        value: "Visible minorities",
      },
      {
        type: "oth",
        value: "others",
      },
    ];

    let newWg = wgType.filter((e) => wg === e.type).map(e=>e.value)

    if (newWg.length) {
      matchPipeline.push({ employmentGroup: { $in: newWg } });
    }
  }


  // work benifits filter //
  const listbenifits = [
    { title: "ob", value: "Other benefits" },
    { title: "hb", value: "Health benefits" },
    { title: "lb", value: "Long term benefits" },
    { title: "fb", value: "Financial benefits" },
  ];

  const newWB = typeof wb === "string"  && isJsonString(wb) ? JSON.parse(wb) : wb
  if (Array.isArray(newWB)) {
    const workBenifits = listbenifits.filter((e) => newWB.includes(e.title)).map(e=>e.value)
    if (workBenifits.length) {
      matchPipeline.push({
        jobBenefits: {
          $elemMatch: {
            title: {$in : workBenifits},
          },
        },
      });
    }
  }
 

 
  function isNumeric(value) {
    return /^\d+$/.test(value) || /^\d+\.\d+$/.test(value);
  }

  
  return {
    $match: matchPipeline.length
      ? {
          $and: matchPipeline,
        }
      : {},
  };
};

exports.matchPreview = async (query,exclude) => {
  let matchPipeline = [{'sub':{$ne:null}},{ "status": true },{'platform':{$ne:''}},{"deleted":false},{$or:[{expiredDate:{$gte:new Date()}},{expiredDate:null}]}];

  console.log('query:',query)
  query[exclude] = null
  const {cat,sub,wr, wg, ys, exp, wb, lg, wc, pd, loc, emt , jt, pf } = query;
  
  console.log('new query',query)
  


  // location filter //
   if (loc && typeof loc === "string") {
    const newLocation = loc.split(',')[0]
    const regValue = new RegExp(".*" + newLocation + ".*");
    matchPipeline.push({ $or: [{ "city.name": regValue }, { location: regValue }] });
  }

  // platform filter //
  console.log('typof:',typeof(pf))
  if (pf && typeof pf === "string") {
    matchPipeline.push({ platform: {$regex:pf}});
  }

  // sub-category filter //

  const subcategories = sub && isJsonString(sub) ? JSON.parse(sub) : sub;

  if(subcategories){
    if (Array.isArray(subcategories) && subcategories.length) {
      const subs = subcategories.map((e) => ObjectId(e));
      matchPipeline.push({ sub: { $in: subs } });
    }
    if(typeof(subcategories)==="string"){
      if(IsObjectID(subcategories)){
        matchPipeline.push({ sub: ObjectId(subcategories) });
      }else{
        matchPipeline.push({ code: {$eq:subcategories}});
      }
    }
  }


   // sub-category filter //

   const category = cat && isJsonString(cat) ? JSON.parse(cat) : cat;

   if(category && typeof(subcategories) ==='string' && subcategories.length===0 ){

     if(typeof(category)==="string"){
      let targetCategory= {subCategories:[]}
      if(IsObjectID(category)){
        targetCategory = await Category.findById(category)
      }else{
        targetCategory = await Category.findOne({code:{$eq:category}})
      }
      if(targetCategory){
        matchPipeline.push({ sub: {$in: targetCategory.subCategories} });
      }
     }
   }





  // work contract filter //

  if (emt && typeof emt === "string") {
    const wtTypes = ["pe", "te", "se", "ca"]; //pr= permanant, te= temporary, se= seasonal, ca= casual
    if (wtTypes.includes(emt)) {
      matchPipeline.push({ "employmentType.type": emt });
    }
  }

  // employmentRegime filter //
  if (wr && typeof wr === "string") {
    const wrTypes = ["pt", "ft"]; // pt = part-time, ft=full-time
    if (wrTypes.includes(wr)) {
      matchPipeline.push({ "employmentRegime.type": wr });
    }
  }

  // jobType filter //
  if (jt && typeof jt === "string") {
    const jobTypes = ["ot", "st", "in", "ap"]; // ot= other, st=student, in=intership, ap=apprentice
    if (jobTypes.includes(jt)) {
      matchPipeline.push({ "jobType.type": jt });
    }
  }

  // yearlySalary filter //
  if (ys && typeof ys === "string") {
    if (ys === "T") {
      matchPipeline.push({
        Ysalary: { $elemMatch: { $gte: 20000, $lte: 39999 } },
      });
    }
    if (ys === "F") {
      matchPipeline.push({
        Ysalary: { $elemMatch: { $gte: 40000, $lte: 59999 } },
      });
    }
    if (ys === "S") {
      matchPipeline.push({
        Ysalary: { $elemMatch: { $gte: 60000, $lte: 79999 } },
      });
    }
    if (ys === "E") {
      matchPipeline.push({
        Ysalary: { $elemMatch: { $gte: 80000, $lte: 99999 } },
      });
    }
    if (ys === "H") {
      matchPipeline.push({
        Ysalary: { $elemMatch: { $gte: 100000 } },
      });
    }
  }

  // work conditions filter //
  const parsedWC = wc && isJsonString(wc) ? JSON.parse(wc) : wc;
  if (Array.isArray(wc) && parsedWC.length) {
    const conditions = [
      { code: "d", value: "Day" },
      { code: "m", value: "Morning" },
      { code: "e", value: "Evening" },
      { code: "w", value: "Weekend" },
      { code: "s", value: "Shift" },
      { code: "em", value: "Early Morning" },
      { code: "n", value: "Night" },
      { code: "f", value: "Flexible Hours" },
      { code: "o", value: "Overtime" },
      { code: "oc", value: "On Call" },
    ];

    const workConditions = conditions
      .filter((e) => parsedWC.includes(e.code))
      .map((e) => e.value);
    if (workConditions.length) {
      matchPipeline.push({
        "specialCommitments.commitsArray": {
          $elemMatch: {
            $in: workConditions,
          },
        },
      });
    }
  }

  // Experience filter //
  if ( typeof exp === "string" && exp && parseInt(exp)) {
    const experience = Number(exp);
    if (experience === 0) {
      matchPipeline.push({
        experience: { $elemMatch: { duration: { $eq: 0 } } },
      });
    }

    if (experience === 1) {
      matchPipeline.push({
          "experience.duration": { $gt: 1, $lt: 12 },
          "experience.Extype": "months",
      });
    }

    if (experience === 2) {
      matchPipeline.push({
        $or: [
          {
            "experience.duration": { $gt: 12, $lte:24 },
            "experience.Extype": "months",
          },
          {
            "experience.duration": { $eq: 2 },
            "experience.Extype": "years",
          }
        ]
      })
    }

    if (experience === 3) {
      matchPipeline.push({
        experience: {
          $elemMatch: {
            duration: { $gte: 3 },
            Extype: "years",
          },
        },
      });
    }
  }

  // language at work filter //
  if (lg && typeof lg === "string") {
    const languages = ["en", "fr", "b",];
    if (languages.includes(lg)) {
      if (lg === "b") {
        matchPipeline.push({
          "languages.lang": "b"
        });
      } else {
        matchPipeline.push({
          $or: [{ "languages.lang": lg }, { "languages.lang": "m" }],
        });
      }
    }
  }


  // date posted filter //
  const days = ["2", "7", "15", "30", "+30"];
  if (pd && typeof pd === "string") {
    console.log('pd:',pd)
    if(days.includes(pd)){
      if (pd === "+30") {
        const articleAge = moment().subtract(30, "days").format("YYYY-MM-DD");
        matchPipeline.push({ date: { $lt: new Date(articleAge) } });
      } else {
        const daysNumber = Number(pd);
        const articleAge = moment()
          .subtract(daysNumber, "days")
          .format('YYYY-MM-DD')+'T00:00:00';
          console.log('article:',articleAge)
          matchPipeline.push({ date: { $gte: articleAge } });
      }
    }
  }


  // employmentGroup filter //
  if (wg && typeof wg === "string") {
    const wgType = [
      {
        type: "inp",
        value: "Indigenous people",
      },
      {
        type: "pwd",
        value: "Persons with disabilities",
      },
      {
        type: "nc",
        value: "Newcomers",
      },
      {
        type: "ow",
        value: "Older workers",
      },
      {
        type: "vet",
        value: "Veterans",
      },
      {
        type: "yth",
        value: "Youth",
      },
      {
        type: "vim",
        value: "Visible minorities",
      },
      {
        type: "oth",
        value: "others",
      },
    ];

    let newWg = wgType.filter((e) => wg === e.type).map(e=>e.value)

    if (newWg.length) {
      matchPipeline.push({ employmentGroup: { $in: newWg } });
    }
  }


  // work benifits filter //
  const listbenifits = [
    { title: "ob", value: "Other benefits" },
    { title: "hb", value: "Health benefits" },
    { title: "lb", value: "Long term benefits" },
    { title: "fb", value: "Financial benefits" },
  ];

  const newWB = typeof wb === "string"  && isJsonString(wb) ? JSON.parse(wb) : wb
  if (Array.isArray(newWB)) {
    const workBenifits = listbenifits.filter((e) => newWB.includes(e.title)).map(e=>e.value)
    if (workBenifits.length) {
      matchPipeline.push({
        jobBenefits: {
          $elemMatch: {
            title: {$in : workBenifits},
          },
        },
      });
    }
  }
 
  console.log('matchPipeline.length:',matchPipeline)
  
  const matchPiplineData = {
    $and: matchPipeline,
  }
  return {
    $match: matchPipeline.length ?  matchPiplineData  :{},
  };
};

exports.sortStage = (sort) => {
    if (sort !== undefined || sort !== "" && sortValues.includes(sort)) {
      if (sort === "recent") {
        return {
          $sort: {
            createdAt: -1,
          },
        }
      }
      if (sort === "popular") {
        return {
          $sort: {
            visits: -1,
          },
        };
      }
    }else{
      return {
        $sort: {
          createdAt: -1,
        },
      }
    }
}

exports.isEmpty = (value) => {
  return Object.keys(value).length === 0;
};

exports.Capitalize = (str)=> {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
