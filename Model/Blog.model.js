import mongoose from "mongoose";


const BlogSchema = mongoose.Schema(
  {
    Title: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
    },
    categories: {
      type: [String],
      required: true,
    },
    subcategory: {
      type: [String],
      required: true,
    },
    BlogImage: {
      type: String, // cloudinary link attach here
      // required : true
    },
    thumbnail: {
      type: String, // cloudinary link attach here
      // required : true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to the User model
    },
    coachqualificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoachQualification", // reference to the CoachQualification model
    },
    coachprofileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoachProfile", // reference to the CoachProfile model
    },
  },
  { timestamps: true }
);
// BlogSchema.plugin(mongoosePaginate);

const Blog = mongoose.model("Blog", BlogSchema);

export default Blog;
