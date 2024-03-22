const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const ResponsibilityType = mongoose.Schema({
  task: [{ type: String }],
  supervision: [{ type: String }],
});

const EmploymentType = mongoose.Schema({
  type: { type: String },
  value: { type: String },
});


const ExperienceRequirementType = mongoose.Schema({
  title: { type: String },
  data: [{ type: String }],
});

const AdditionalInformationType = mongoose.Schema({
  title: { type: String },
  data: [{ type: String }],
});

const JobBenefitsType = mongoose.Schema({
  title: { type: String },
  data: [{ type: String }],
});

const ExperienceType = mongoose.Schema({
  duration: { type: Number },
  Extype: { type: String },
  value: { type: String },
});

const HiringOrganizationType = mongoose.Schema({
  title: { type: String },
  link: { type: String },
  hasLink: { type: Boolean },
});

const CityType = mongoose.Schema({
  name: { type: String },
  value: { type: String },
});

const articleSchema = new Schema(
  {
    title: {
      type: String,
    },
    job_id: {
      type: String,
      required: true,
    },
    business: {
      type: String,
    },
    location: [
      {
        type: String,
      },
    ],
    Hsalary: {
      type: Number,
      default: 0,
    },
    visits: {
      type: Number,
      default: 0,
    },
    Ysalary: {
      type: Number,
    },
    salaryType: {
      type: String,
    },
    city: {
      type: CityType,
    },
    sub: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    negotiated: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      required: true,
    },
    responsibilities: {
      type: ResponsibilityType,
    },
    experienceRequirements: [
      {
        type: ExperienceRequirementType,
      },
    ],
    additionalInformations: [
      {
        type: AdditionalInformationType,
      },
    ],
    jobBenefits: [
      {
        type: JobBenefitsType,
      },
    ],
    employmentGroup: [
      {
        type: String,
      },
    ],
    languages: {
      lang: {
        type: String,
      },
      language: {
        type: String,
      },
    },
    job_audience: {
      type: String,
    },
    educationRequirements: [
      {
        type: String,
      },
    ],
    experience: {
      type: ExperienceType,
    },
    workEnvironment: [
      {
        type: String,
      },
    ],
    workConditions: [
      {
        type: String,
      },
    ],
    startAt: {
      type: String,
    },
    vacancy: {
      type: String,
    },
    workHours: {
      type: String,
    },
    employmentRegime: {
      type: String,
    },
    specialCommitments: {
      commitsArray: [{ type: String }],
      commitsString: { type: String },
    },
    employmentType: {
      type: EmploymentType,
    },
    hiringOrganization: {
      type: HiringOrganizationType,
    },
    howToApply: {
      type: String,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
    },
    expiredDate:{
      type:Date
    },
    targetDevices: [{
      type: Schema.Types.ObjectId,
      ref: "Device",
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    deletedBy: {
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

/!* make a function for experience periode */;

module.exports = mongoose.model("Article", articleSchema);
