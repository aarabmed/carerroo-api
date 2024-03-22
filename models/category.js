const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//!============= Category
const categorySchema = new Schema(
  {
    title: {
      type: String,
    },
    slug: {
      type: String,
    },
    code: {
      type: String,
    },
    status: {
      type: Boolean,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    subCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
      },
    ],
  },
  { timestamps: true },
);

//!============= SubCategory
const subCategorySchema = new Schema(
  {
    title: {
      type: String,
    },
    slug: {
      type: String,
    },
    code: {
      type: String,
    },
    status: {
      type: Boolean,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = {
  Category: mongoose.model("Category", categorySchema),
  SubCategory: mongoose.model("SubCategory", subCategorySchema),
};

