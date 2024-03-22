const { Category } = require("../models/category");

const User = require("../models/user");
const validate = require("../utils/inputErrors");
const { authorities } = require("../utils/authority");
const isBoolean = require("../utils/toBoolean");

const {
  nameProperties,
  statusProperties,
  titleProperties,
  slugProperties,
} = require("./inputs/category");

//! ----- RETRIEVE A SINGLE CATEGORY ----------
exports.getCategory = async (req, res, next) => {
  const id = req.params.id;
  const category = await Category.findById({ _id: id }).populate([
    {
      path: "subCategory",
      select: " name status slug title updatedAt",
      model: "SubCategory",
    },
  ]);

  return res.status(200).json({
    category: category,
    message: "Opperation successed",
  });
};

//! ----- RETRIEVE ALL CATEGORIES ----------
exports.getAllCategories = async (req, res, next) => {
  const options = {
    allowDiskUse: false,
  };
  const pipeline = [
    {
      $lookup: {
        from: "subCategories",
        localField: "subCategories",
        pipeline: [
          {
            $project: {
              _id: "$_id",
              title: "$title",
              slug: "$slug",
              code: "$code",
            },
          },
        ],
        foreignField: "_id",
        as: "subcategories",
      },
    },
    {
      $project: {
        _id: "$_id",
        title: "$title",
        slug: "$slug",
        code: "$code",
        subcategories: "$subcategories",
      },
    },
  ];

  const categories = await Category.aggregate(pipeline).option(options);

  return res.status(200).json({
    categories,
    message: "Opperation successed",
  });
};

//! ----- CREATE A NEW CATEGORY ----------
exports.createCategory = async (req, res, next) => {
  const currentUserId = req.body.currentUserId;
  const name = req.body.name.trim();
  const slug = req.body.slug.trim();
  const title = req.body.title.trim();
  const customId = req.body.customId;

  const isError = [
    await validate(name, nameProperties),
    await validate(slug, slugProperties),
    await validate(title, titleProperties),
  ].filter((e) => e !== true);

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  const newName = name.trim().split(" ").map(capitalize).join(" ");
  const newSlug = slug.trim().split(" ").join("-").toLowerCase();
  const newTitle = title.trim().split(" ").map(capitalize).join(" ");

  if (isError.length) {
    return res.status(500).json({
      errors: isError,
      category: null,
    });
  }

  const CategoryInDB = await Category.find({ name: name }, { deleted: false });

  if (CategoryInDB.length) {
    return res.status(500).json({
      category: null,
      errors: {
        message: "A category by this name has been already in DataBase ",
      },
    });
  }

  const category = new Category({
    name: newName,
    title: newTitle,
    slug: newSlug,
    createdBy: currentUserId,
    customId,
  });

  const savedCategory = await category.save();

  if (!savedCategory) {
    return res.status(500).json({
      category: null,
      errors: { message: "Server failed to create the new category" },
    });
  }else{
    return res.status(201).json({
      category: savedCategory,
      message: "Category saved successfully",
    });
  }
  
};

//! ----- EDIT A CATEGORY ----------
exports.updateCategory = async (req, res, next) => {
  const currentUserId = req.body.currentUserId;
  const categoryId = req.params.id;
  const name = req.body.name.trim();
  const title = req.body.title.trim();
  const slug = req.body.slug.trim();
  const status = isBoolean(req.body.status.trim());

  const isError = [
    await validate(name, nameProperties),
    await validate(slug, slugProperties),
    await validate(status, statusProperties),
    await validate(title, titleProperties),
  ].filter((e) => e !== true);

  if (isError.length) {
    return res.status(500).json({
      errors: isError,
      category: null,
    });
  }

  const category = await Category.findOne({ _id: categoryId });

  if (!category) {
    return res.status(404).json({
      category: null,
      errors: { message: "Category not found" },
    });
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  const newName = name.trim().split(" ").map(capitalize).join(" ");
  const newSlug = slug.trim().split(" ").join("-").toLowerCase();
  const newTitle = title.trim().split(" ").map(capitalize).join(" ");

  category.name = newName;
  category.slug = newSlug;
  category.status = status;
  category.title = newTitle;
  category.updatedBy = currentUserId;

  const updatedCategory = await category.save();
  if (!updatedCategory) {
    return res.status(500).json({
      errors: { message: "Server failed while editing the category" },
      category: null,
    });
  }

  return res.status(200).json({
    category: updatedCategory,
    message: "Category updated successfully",
  })
};



//! ----- DELETE A CATEGORY ----------
exports.deleteCategory = async (req, res, next) => {
  const categoryId = req.params.id;
  const currentUserId = req.body.currentUserId;

  const currentUser = await User.findById(currentUserId);

  if (authorities.includes(currentUser.authority)) {
    const category = await Category.findOne({ _id: categoryId });

    if (!category) {
      return res.status(404).json({
        category: null,
        errors: { message: "Category not found" },
      });
    }

    category.deleted = true;
    category.deletedBy = currentUserId;

    const deletedCategory = await category.save();


    if (!deletedCategory) {
      return res.status(500).json({
        category: null,
        errors: { message: "Server failed to delete the category" },
      });
    }

    return res.status(200).json({
      category: deletedCategory,
      message: `Category ${category.name} has been deleted successfully`,
    });
  }

  return res.status(403).json({
    category: null,
    errors: { message: "Not authorised to delete a category" },
  });
};
