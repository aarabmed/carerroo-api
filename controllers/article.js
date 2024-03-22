const Article = require("../models/article");
const User = require("../models/user");
const mongoose = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId;

const isObjectId = require("../utils/IDvalidator")
const {
  getPagination,
  matchStage,
  secureQuery,
  sortStage,
  matchPreview,
  isEmpty,
  
} = require("../utils/helpers");
const { authorities } = require("../utils/authority");



const isValidID = require("../utils/IDvalidator");



var options = {
  allowDiskUse: true,
};


//! ----- RETRIEVE A SINGLE Article ----------
exports.getArticle = async (req, res, next) => {
  const id = req.params.id.replace(/[^a-zA-Z0-9-]/g, "");

  const mainPipeline = [
    {
      $match: {
        _id: ObjectId(id) 
      }
    },
    {
      $project: {
        _id: "$_id",
        projection:{
          title: "$title",
          visits:"$visits",
          date: "$createdAt",
          job_id: "$job_id",
          sub:"$sub",
          location: "$city.value",
          business: "$business",
          salaryType: "$salaryType",
          yearlySalary: "$Ysalary",
          jobSalary: "$jobSalary",
          negotiable: "$negotiable",
          verified: "$verified",
          platform: "$platform",
          commission:"$commission",
          jobType:"$jobType.value",
          additionalInfos:"$additionalInformations",
          externalLink:"$externalLink",
          group:"$employmentGroup",
          regime:"$employmentRegime.value",
          periode: "$employmentType.value",
          expire:"$expiredDate",
          instructions:"$instructions",
          benefits:"$jobBenefits",
          target:"$job_audience",
          locations:"$location",
          languages:"$languages",
          responsibilities:"$responsibilities",
          commitments:"$specialCommitments",
          vacancy:"$vacancy",
          workHours:"$workHours",
          enviroment:"$workplaceEnvironment",
          zip:"$zipCode",
          address:"$address",
          education:"$educationRequirements",
          experience:"$experience",
          howToApply:"$howToApply",
          externalLink:"$externalLink",
          specialization:"$experienceRequirements",
          organization:"$hiringOrganization",
          startAt:"$startAt",
          slug:"$slug"
        }
      },
    },
  ];

  const  article = await Article.aggregate(mainPipeline).option(options);

   console.log('')
 

  
  if (article) {
     const pipeline = [
      {
        $match: {
          $and: [
            { "status": true },
            {'platform':{$ne:''}},
            {"deleted":false},
            {$or:[{expiredDate:{$gte:new Date()}},{expiredDate:null}]},
            {
              sub: ObjectId(article[0].projection.sub),
            },
            {
              "city.value": {$regex:article[0].projection.location.split(' ')[0]},
            },
            {
              status: true,
            },
            {
              _id: {
                $ne: ObjectId(article[0]._id),
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: "$_id",
          title: "$title",
          customId: "$customId",
          job_id: "$job_id",
          business: "$business",
          jobSalary: "$jobSalary",
          visits:"$visits"
        },
      },
      {
        $sort: {
          visits: -1.0,
        },
      },
      {
        $limit: 6.0,
      },
    ];

    const pipelineAlt = [
      {
        $match: {
          $and: [
            { "status": true },
            {'platform':{$ne:''}},
            {"deleted":false},
            {$or:[{expiredDate:{$gte:new Date()}},{expiredDate:null}]},
            {
              sub: ObjectId(article[0].projection.sub),
            },
            {
              status: true,
            },
            {
              _id: {
                $ne: ObjectId(article[0]._id),
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: "$_id",
          title: "$title",
          customId: "$customId",
          job_id: "$job_id",
          business: "$business",
          jobSalary: "$jobSalary",
          visits:"$visits"
        },
      },
      {
        $sort: {
          visits: -1.0,
        },
      },
      {
        $limit: 6.0,
      },
    ];

    let similarArticles = await Article.aggregate(pipeline).option(options);
    if (!similarArticles) {
      similarArticles = await Article.aggregate(pipelineAlt).option(options);
    } 
    await Article.findOneAndUpdate({_id:id},{$inc:{"visits":1}})
    return res.status(200).json({
      article: article[0],
      similar_articles: similarArticles,
      message: "Operation succeed ",
    });
  }
 
  return res.status(404).json({
    article: null,
    message: "no article to display",
  });
};

//! ----- RETRIEVE ARTICLES ----------
exports.getAllArticles = async (req, res, next) => {
  const { query } = req;
  const page = Number(query.page) || 1;
  const size = Number(query.size) || 15;

  const { limit, offset } = getPagination(page, size);
  const { sort } = query;

 
  const Sort = sortStage(sort);
  const Match = matchStage(query);
  
  const pipeline = [
    Match,
    {
      $facet: {
        data: [
          
          Sort,
          {
            $project: {
              title: "$title",
              date: "$date",
              job_id: "$job_id",
              location: "$city.value",
              business: "$business",
              salaryType: "$salaryType",
              yearlySalary: "$Ysalary",
              hourlySalary: "$Hsalary",
              negotiated: "$negotiated",
              verified: "$verified",
              jobSalary: "$jobSalary",
              platform: "$platform",
              locations:"$location",
            },
          },
          {
            $skip: offset,
          },
          {
            $limit: limit,
          },
        ],
        metadata: [
          {
            $count: "total",
          },
        ],
      },
    },
    {
      $project: {
        data: 1.0,
        totalPages: {
          $ceil: {
            $divide: [
              {
                $arrayElemAt: ["$metadata.total", 0],
              },
              limit,
            ],
          },
        },
        totalResults: "$metadata.total",
        currentPage: {
          $cond: [
            {
              $arrayElemAt: ["$metadata.total", 0.0], //50
            },
            {
              $add: [
                {
                  $divide: [offset, limit],
                },
                1.0,
              ],
            },
            0.0,
          ],
        },
      },
    },
    {
      $project: {
        data: 1.0,
        totalPages: "$totalPages",
        currentPage: "$currentPage",
        hasNextPage: {
          $gt: ["$totalPages", "$currentPage"],
        },
        hasPreviousPage: {
          $and: [
            {
              $gt: ["$currentPage", 1.0],
            },
            {
              $gte: ["$totalPages", "$currentPage"],
            },
          ],
        },
        nextPage: {
          $cond: [
            {
              $or: [
                {
                  $eq: ["$totalPages", "$currentPage"],
                },
                {
                  $gt: ["$currentPage", "$totalPages"],
                },
              ],
            },
            null,
            {
              $add: ["$currentPage", 1.0],
            },
          ],
        },
        prevPage: {
          $cond: [
            {
              $and: [
                {
                  $gt: ["$currentPage", 1.0],
                },
                {
                  $gte: ["$totalPages", "$currentPage"],
                },
              ],
            },
            {
              $subtract: ["$currentPage", 1.0],
            },
            null,
          ],
        },
        numberResults: {
          $arrayElemAt: ["$totalResults", 0],
        },
      },
    },
  ];


  
  const results = await Article.aggregate(pipeline).allowDiskUse(true);

  if (!results) {
    return res.status(500).json({
      data: null,
      message: "Error while retreiving data from database",
    });
  }

  return res.status(200).json({
    articles: results[0].data,
    currentPage: results[0].currentPage,
    hasNextPage: results[0].hasNextPage,
    hasPreviousPage: results[0].hadPreviousPage,
    totalPages: results[0].totalPages,
    prevPage: results[0].prevPage,
    nextPage: results[0].nextPage,
    numberResults: results[0].numberResults ? results[0].numberResults : 0,
  });
};

//! ----- RETRIEVE FAVORIT ARTICLES ----------
exports.getFavoriteArticles = async (req, res, next) => {
  const { query } = req;
  const ids = query.ids ? JSON.parse(query.ids) : [];
  if (ids && Array.isArray(ids)) {
    try {
      const articlesIds = ids.map((e) => ObjectId(e));
      const pipeline = [
        {
          $match: {
            _id: { $in: articlesIds },
          },
        },

        {
          $project: {
            title: "$title",
            date: "$date",
            job_id: "$job_id",
            location: "$city.value",
            business: "$business",
            salaryType: "$salaryType",
            yearlySalary: "$Ysalary",
            hourlySalary: "$Hsalary",
            negotiated: "$negotiated",
            verified: "$verified",
          },
        },

        {
          $limit: 30,
        },
      ];

      var options = {
        allowDiskUse: false,
      };

      const articles = await Article.aggregate(pipeline).option(options);

      return res.status(200).json({
        articles: articles,
        message: "success",
      });
    } catch (error) {
      return res.status(500).json({
        data: null,
        message: "Error while retreiving data from database",
      });
    }
  } else {
    return res.status(200).json({
      articles: [],
      message: "success",
    });
  }
};

exports.onSearch = async (req, res, next) => {
  const { query } = req;
  const { q } = query;
  const page = Number(query.page) || 1;
  const size = Number(query.size) || 20;

  const newQ = secureQuery(q);
  const { limit, offset } = getPagination(page, size);
  const escapedQ = newQ.replace(/[-\/\\^$*+?._()|[\]{}]/g, "\\$&");
  const queryLength = new RegExp("^(?![-._])([a-zA-Z _.-]{3,})");


  if (!queryLength.test(escapedQ)) {
    return res.status(200).json({
      articles: [],
      currentPage: 0,
      hasNextPage: false,
      hadPreviousPage: false,
      totalPages: null,
      prevPage: null,
      nextPage: null,
      numberResults: 0,
    });
  }

  

  const Match = await matchStage(query);
  const Sort = sortStage(query.sort);

 

  const  pipeline = [
        Match,
        {
          $facet: {
            data: [
              Sort,
              {
                $project: {
                  title: "$title",
                  date: "$date",
                  job_id: "$job_id",
                  location: "$city.value",
                  salaryType: "$salaryType",
                  business: "$business",
                  hourlySalary: "$Hsalary",
                  yearlySalary: "$Ysalary",
                  verified: "$verified",
                  negotiated: "$negotiated",
                  jobSalary: "$jobSalary",
                  platform: "$platform",
                  locations:"$location",
                  
                },
              },
              {
                $skip: offset,
              },
              {
                $limit: limit,
              },
              
            ],
            metadata: [
              {
                $count: "total",
              },
            ],
          },
        },
         {
          $project: {
            data: 1.0,
            totalPages: {
              $ceil: {
                $divide: [
                  {
                    $arrayElemAt: ["$metadata.total", 0.0],
                  },
                  limit,
                ],
              },
            },
            totalResults: "$metadata.total",
            currentPage: {
              $cond: [
                {
                  $arrayElemAt: ["$metadata.total", 0.0],
                },
                {
                  $add: [
                    {
                      $divide: [offset, limit],
                    },
                    1.0,
                  ],
                },
                0.0,
              ],
            },
          },
        },
        {
          $project: {
            data: 1.0,
            totalPages: "$totalPages",
            currentPage: "$currentPage",
            hasNextPage: {
              $gt: ["$totalPages", "$currentPage"],
            },
            hadPreviousPage: {
              $and: [
                {
                  $gt: ["$currentPage", 1.0],
                },
                {
                  $gte: ["$totalPages", "$currentPage"],
                },
              ],
            },
            nextPage: {
              $cond: [
                {
                  $or: [
                    {
                      $eq: ["$totalPages", "$currentPage"],
                    },
                    {
                      $gt: ["$currentPage", "$totalPages"],
                    },
                  ],
                },
                null,
                {
                  $add: ["$currentPage", 1.0],
                },
              ],
            },
            prevPage: {
              $cond: [
                {
                  $and: [
                    {
                      $gt: ["$currentPage", 1.0],
                    },
                    {
                      $gte: ["$totalPages", "$currentPage"],
                    },
                  ],
                },
                {
                  $subtract: ["$currentPage", 1.0],
                },
                null,
              ],
            },
            numberResults: {
              $arrayElemAt: ["$totalResults", 0.0],
            },
          },
        }, 
      ];

 
  

  if (escapedQ.length>2) {
    pipeline.unshift({
      $search: {
        index: "title_index",
        autocomplete: {
          query: escapedQ,
          path: 'title'
        },
      },
    });
  }

  if (!isEmpty(Sort)) {
    pipeline.splice(2, 0, Sort);
  }

  var options = {
    allowDiskUse: true,
  };

  const results = await Article.aggregate(pipeline).option(options);

  
  return res.status(200).json({
    articles: results[0].data,
    currentPage: results[0].currentPage,
    hasNextPage: results[0].hasNextPage,
    hasPreviousPage: results[0].hadPreviousPage,
    totalPages: results[0].totalPages,
    prevPage: results[0].prevPage,
    nextPage: results[0].nextPage,
    numberResults: results[0].numberResults ? results[0].numberResults : 0,
  });
};


exports.searchPreview = async (req, res, next) => {
  const {query} = req
  const { q } = query;
  const newQ = secureQuery(q);

  const Match = await matchStage(query)
  const escapedQ = newQ.replace(/[-\/\\^$*+?._()|[\]{}]/g, "\\$&");


  const  pipeline = [
    {
      $facet: {
        'metadata':[
          Match,
          {
            $count: "total",
          },
        ]
      },
    }, 
    {
      $project: {
        counter:{ $arrayElemAt: ["$metadata.total", 0.0]}
      }
    },
  ];


  console.log('escapedQ:',escapedQ)
  if (escapedQ.length>2) {
    pipeline.unshift({
      $search: {
        index: "title_index",
        autocomplete: {
          query: escapedQ,
          path: 'title'
        },
      },
    });
  }
  
  const results = await Article.aggregate(pipeline).option(options);
  
  console.log('results:',results)
  return res.status(200).json({
    counter:results[0].counter,
  });
  
}

//! ----- CREATE AN ARTICLE----------
exports.createArticle = async (req, res, next) => {
  let isError = [];

  if (isError.length) {
    return res.status(500).json({
      errors: isError,
      card: null,
    });
  }

  return res.status(200).json({
    article: "",
    message: "article add successfully",
  });
};

//! ----- EDIT AN ARTICLE ----------
exports.updateArticle = async (req, res, next) => {
  let isError = [];

  return res.status(200).json({
    message: "course updated successfully",
  });
};

//! ----- DELETE A ARTICLE ----------
exports.deleteArticle = async (req, res, next) => {
  const currentUserId = req.body.currentUserId;
  const articleId = req.params.id;

  if (isValidID(currentUserId)) {
    const currentUser = await User.findById(currentUserId);
    if (authorities.includes(currentUser.authority)) {
      if (isValidID(articleId)) {
        const article = await Article.findByIdAndUpdate(
          { _id: articleId },
          { deleted: true, deletedBy: currentUser._id },
        );
        if (!article) {
          return res.status(500).json({
            errors: { message: "Error while deleting the Article" },
          });
        }
        return res.status(200).json({
          data: article,
          message: "Article deleted successfully",
        });
      }
      return res.status(422).json({
        data: null,
        message: "invalid article id",
      });
    }
    return;
  }

  return res.status(403).json({
    errors: { message: "Not authorised to delete an article" },
  });
};

exports.sitemapGenerator = async (req, res, next) => {
  const articles = await Article.find({
    indexed: false,
    status: true,
    deleted: false,
  });
  const interval = 500;
  var promise = Promise.resolve();
  const baseUrl = "https://careeroo.com";

  const filePath = path.join(process.cwd(), "/resources/dynamic-urls.json");

  articles.forEach(async (article, index) => {
    promise = promise.then(async function () {
      fs.readFile(filePath, function (err, file) {
        if (err) {
          console.log("Error: " + err);
          return;
        }

        article.indexed = true;
        const urls = JSON.parse(file);

        urls.data.push(`${baseUrl}/job/${article.slug}`);
        let res = JSON.stringify(urls, null, 4);
        fs.writeFileSync(filePath, res);
      });

      await article.save();

      return new Promise(function (resolve) {
        setTimeout(resolve, interval);
      });
    });
  });

  promise.then(function () {
    return res.status(200).json({
      message: "index finished successfully",
    });
  });
};
