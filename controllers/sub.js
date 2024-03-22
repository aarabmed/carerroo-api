const { SubCategory, Category } = require("../../models/category");
const User = require("../../models/user");


const {
  nameProperties,
  statusProperties,
  bgColorProperties,
  titleProperties,
  descriptionProperties,
  imageProperties,
  slugProperties,
} = require("../inputs/subCategory");


//! ----- RETRIEVE A SINGLE SUB-CATEGORY ----------
exports.getSubCategory = async (req, res, next) => {
  const id = req.params.id;
  const SingleSubCategory = await SubCategory.findById(
    { _id: id },
    { status: true },
  );

  return res.status(200).json({
    subCategory: SingleSubCategory,
    message: "Opperation successed",
  });
};

//! ----- RETRIEVE ALL SUB-CATEGORIES ----------
exports.getAllSubCategories = async (req, res, next) => {
  const AllsubCategories = await SubCategory.find({ status: true  });

  if (!AllsubCategories) {
    return res.status(404).json({
      subCategories: [],
      message: "No sub category existed yet",
    });
  }
  return res.status(200).json({
    subCategories: AllsubCategories,
    message: "Opperation successed",
  });
};

/* 
  //! ----- CREATE A NEW SUB-CATEGORY ----------
  exports.createSubCategory = async (req, res, next) => {
    const currentUserId = req.body.currentUserId;
    const categoryId = req.body.category;
    const name = req.body.name.trim();
    const slug = req.body.slug.trim();
    const title = req.body.title.trim();
    const subCode = req.body.subCode;

    const isError = [
      await validate(name, nameProperties),
      await validate(slug, slugProperties),
      await validate(title, titleProperties),
    ].filter((e) => e !== true);

    if (isError.length) {
      return res.status(500).json({
        errors: isError,
        data: null,
      });
    }

    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const newName = name.trim().split(" ").map(capitalize).join(" ");
    const newSlug = slug.trim().split(" ").join("-").toLowerCase();
    const newTitle = title.trim().split(" ").map(capitalize).join(" ");

    const subCategory = await new SubCategory({
      name: newName,
      title: newTitle,
      slug: newSlug,
      code: subCode,
      category: categoryId,
      createdBy: currentUserId,
    });

    const savedSubCategory = await subCategory.save();

    if (!savedSubCategory) {
      return res.status(500).json({
        subCategory: null,
        errors: { message: "Server failed to save the new sub category" },
      });
    }

    await Category.findByIdAndUpdate(
      { _id: categoryId },
      { $push: { subCategory: savedSubCategory._id } },
    );

    return res.status(201).json({
      subCategory: savedSubCategory,
      message: "Sub Category saved successfully",
    });
  };

  //! ----- EDIT A CATEGORY ----------
  exports.updateSubCategory = async (req, res, next) => {
    const currentUserId = req.body.currentUserId;
    const subCategoryId = req.params.id;
    const title = req.body.title.trim();
    const name = req.body.name.trim();
    const status = isBoolean(req.body.status.trim());
    const slug = req.body.slug.trim();
    const bgColor = req.body.backgroundColor.trim();
    const description = req.body.description.trim();
    const subCategoryImage = req.body.image;

    const isError = [
      await validate(name, nameProperties),
      await validate(slug, slugProperties),
      await validate(title, titleProperties),
      await validate(status, statusProperties),
      await validate(bgColor, bgColorProperties),
      await validate(description, descriptionProperties),
    ].filter((e) => e !== true);

    if (isError.length) {
      return res.status(500).json({
        errors: isError,
        data: null,
      });
    }

    const subCategory = await SubCategory.findOne({ _id: subCategoryId });

    if (!subCategory) {
      return res.status(404).json({
        subCategory: null,
        errors: { message: "Category not found" },
      });
    }

    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    const newName = name.trim().split(" ").map(capitalize).join(" ");
    const newSlug = slug.trim().split(" ").join("-").toLowerCase();
    const newTitle = title.trim().split(" ").map(capitalize).join(" ");

    subCategory.name = newName;
    subCategory.description = description;
    subCategory.slug = newSlug;
    subCategory.title = newTitle;
    subCategory.status = status;
    subCategory.updatedBy = currentUserId;

    const isObject = (value) => typeof value === "object" && value !== null;

    if (isObject(subCategoryImage)) {
      imagekit.upload(
        {
          file: subCategoryImage.buffer, //required
          fileName: subCategoryImage.fileName, //required
          folder: subCategoryImage.folderName,
        },
        async function (error, result) {
          if (error)
            return res.status(500).json({
              errors: error.message,
              card: null,
            });

          const uploadImage = {
            fileId: result.fileId,
            name: result.name,
            filePath: result.filePath,
            url: result.url,
            height: result.height,
            width: result.width,
            thumbnailUrl: result.thumbnailUrl,
          };

          subCategory.image = uploadImage;
          const updatedSubCategory = await subCategory.save();

          if (!updatedSubCategory) {
            return res.status(500).json({
              errors: { message: "Error while editing the sub category" },
            });
          }
          return res.status(200).json({
            subCategory: updatedSubCategory,
            message: "Sub Category updated successfully",
          });
        },
      );
    }

    const updatedSubCategory = await subCategory.save();

    if (!updatedSubCategory) {
      return res.status(500).json({
        errors: { message: "Error while editing the sub category" },
      });
    }
    return res.status(200).json({
      subCategory: updatedSubCategory,
      message: "Sub Category updated successfully",
    });
  };

  //! ----- DELETE A CATEGORY ----------
  exports.deleteSubCategory = async (req, res, next) => {
    const subCategoryId = req.params.id;
    const currentUserId = req.body.currentUserId;

    const currentUser = await User.findById(currentUserId);

    if (authorities.includes(currentUser.authority)) {
      const subCategory = await subCategory.findOne({ _id: subCategoryId });

      if (!subCategory) {
        return res.status(404).json({
          subCategory: null,
          errors: { message: "Sub category not found" },
        });
      }

      subCategory.deleted = true;
      subCategory.deletedBy = currentUserId;
      const deletedSubCategory = await subCategory.save();

      if (!deletedSubCategory) {
        return res.status(500).json({
          subCategory: null,
          errors: { message: "Server failed to delete the sub category" },
        });
      }

      return res.status(200).json({
        subCategory: deletedSubCategory,
        message: `Sub-Category ${subCategory.name} has been disabled successfully`,
      });
    }

    return res.status(403).json({
      subCategory: null,
      errors: { message: "Not authorised to delete a sub category" },
    });
  }; 
*/
