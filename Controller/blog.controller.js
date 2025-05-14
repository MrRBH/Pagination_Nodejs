import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudniary.js";
import Blog from "../Model/Blog.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

export const Blogpost = asyncHandler(async (req, res) => {
  const { Title, Description, categories, subcategory, userid } = req.body;

  console.log(req.body);

  // Validation
  if (!Title || !Description || !categories || !subcategory) {
    throw new ApiError(400, "All fields are required");
  }

  

  // UserID fetch
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized user");
  }
  if (userId === userid)
    throw new ApiError(403, "You are not authorized to perform this action");

  const coachqualificationId = await CoachQualification.findOne({
    userid: userid,
  });
  if (!coachqualificationId) {
    throw new ApiError(404, "Coach qualification not found");
  }
  console.log({ CoachQualificationId: coachqualificationId._id });
  const coachprofileId = await CoachProfile.findOne({ userid: userid });
  if (!coachprofileId) {
    throw new ApiError(404, "Coach profile not found");
  }
  console.log({ CoachProfileID: coachprofileId._id });

  // Blog Image Upload
  const blogImagePath = req.files?.BlogImage[0]?.path;
  console.log({ B: blogImagePath });
  if (!blogImagePath) {
    throw new ApiError(400, "Blog image is required");
  }

  let blogImageFile;
  try {
    blogImageFile = await uploadOnCloudinary(blogImagePath);
    console.log({
      "Uploaded successfully blogImage on Cloudinary ...":
        blogImageFile.secure_url,
    });
  } catch (error) {
    throw new ApiError(
      500,
      "Failed to upload blog image on Cloudinary",
      error.message
    );
  }

  // Thumbnail Image Upload
  const thumbnailPath = req.files?.thumbnail[0]?.path;
  console.log({ T: thumbnailPath });

  if (!thumbnailPath) {
    throw new ApiError(400, "Thumbnail image is required");
  }

  let thumbnailFile;
  try {
    thumbnailFile = await uploadOnCloudinary(thumbnailPath);
    console.log({
      "Uploaded successfully thumbnail on Cloudinary ...":
        thumbnailFile.secure_url,
    });
  } catch (error) {
    throw new ApiError(
      500,
      "Failed to upload thumbnail on Cloudinary",
      error.message
    );
  }

  // Save to Database
  const newBlog = await Blog.create({
    Title,
    Description,
    categories,
    subcategory: subcategories, // Save as an array
    BlogImage: blogImageFile.secure_url,
    thumbnail: thumbnailFile.secure_url,
    userId: userid, // Ensure the user ID is saved
    coachqualificationId: coachqualificationId._id,
    coachprofileId: coachprofileId._id, // Ensure the coach profile ID is saved
  });
  console.log(newBlog);

  res
    .status(201)
    .json(new ApiResponse(201, newBlog, "Blog Created successfully"));
});
export const EditBlog = asyncHandler(async (req, res) => {
  const {
    id: blogId,
    Title,
    Description,
    categories,
    subcategory,
    userid,
  } = req.body;

  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized user");
  }
  if (userId !== userid)
    throw new ApiError(403, "You are not authorized to perform this action");

  // Validate Blog ID
  if (!blogId) {
    throw new ApiError(400, "Blog ID is required");
  }

  // Check if `blogId` is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    throw new ApiError(400, "Invalid Blog ID format");
  }

  // Category and Subcategory Validation
  if (!Object.keys(categoriesAndsubcategory).includes(categories)) {
    console.log({ CAT: categories });
    throw new ApiError(400, "Invalid category");
  }

  // Ensure subcategory is an array if it's a single value
  let subcategories = Array.isArray(subcategory) ? subcategory : [subcategory];

  let validSubcategories = categoriesAndsubcategory[categories];
  let isValid = subcategories.every((item) =>
    validSubcategories.includes(item)
  );

  if (!isValid) {
    throw new ApiError(400, "Invalid subcategory");
  }

  // Blog Image Upload
  const blogImagePath = req.files?.BlogImage[0]?.path;
  if (!blogImagePath) {
    throw new ApiError(400, "Blog image is required");
  }

  let blogImageFile;
  try {
    blogImageFile = await uploadOnCloudinary(blogImagePath);
    console.log({
      "Uploaded blog image to Cloudinary": blogImageFile.secure_url,
    });
  } catch (error) {
    throw new ApiError(500, "Failed to upload blog image on Cloudinary");
  }

  // Thumbnail Image Upload
  const thumbnailPath = req.files?.thumbnail[0]?.path;
  if (!thumbnailPath) {
    throw new ApiError(400, "Thumbnail image is required");
  }

  let thumbnailFile;
  try {
    thumbnailFile = await uploadOnCloudinary(thumbnailPath);
    console.log({
      "Uploaded thumbnail to Cloudinary": thumbnailFile.secure_url,
    });
  } catch (error) {
    throw new ApiError(500, "Failed to upload thumbnail on Cloudinary");
  }

  // Update the blog
  const updatedBlog = await Blog.findByIdAndUpdate(
    blogId, // Pass the `blogId` directly
    {
      Title,
      Description,
      categories,
      subcategory: subcategories, // Save as an array
      BlogImage: blogImageFile.secure_url,
      thumbnail: thumbnailFile.secure_url,
    },
    { new: true } // Return the updated document
  );

  if (!updatedBlog) {
    return res.json(
      new ApiResponse(
        404,
        null,
        "Blog not updated successfully. Something went wrong."
      )
    );
  }

  res.json(new ApiResponse(200, updatedBlog, "Blog updated successfully"));
});


//   show all blogs of the user
export const blogList = asyncHandler(async (req, res) => {
  // const userId = req.user?.id;
  // if (!userId) {
  //   throw new ApiError(401, "Unauthorized user"); 
  // }

  const limit = parseInt(req.query.limit) || 10;
  const lastCreatedAt = req.query.lastCreatedAt;
  const direction = req.query.direction || "forward"; // default to forward

  const query = {}; // all blogs

  if (lastCreatedAt) {
    query.createdAt =
      direction === "backward"
        ? { $gt: new Date(lastCreatedAt) } // newer than lastCreatedAt 
        : { $lt: new Date(lastCreatedAt) }; // older than lastCreatedAt
  }

  const blogs = await Blog.find(query)
    .sort({ createdAt: direction === "backward" ? 1 : -1 }) // ascending for newer, descending for older
    .limit(limit);

  if (!blogs || blogs.length === 0) {
    return res.json(new ApiError(404, blogs, "No blogs found"));
  }

  const hasMore = blogs.length === limit;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        blogs,
        hasMore,
      },
      `Blogs retrieved successfully (${direction})`
    )
  );
});

// Route: GET /api/blog
export const singleBlog = asyncHandler(async (req, res) => {
  const { userid, blogId } = req.body;
  console.log(req.body);

  if (!blogId) {
    throw new ApiError(400, "Blog ID is required");
  }
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized user");
  }
  console.log(userId);

  if (userId !== userid)
    throw new ApiError(403, "You are not authorized to perform this action");

  const blog = await Blog.findById(blogId); // Fetch blog by ID
  if (!blog) {
    return res.json(new ApiResponse(404, null, "Blog not found"));
  }

  res.json(new ApiResponse(200, blog, "Blog retrieved successfully"));
});
export const DeleteBlog = asyncHandler(async (req, res) => {
  const { id: blogId, userid } = req.body;
  console.log(blogId);
  if (!blogId) {
    throw new ApiError(400, "Blog ID is required");
  }
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized user");
  }
  if (userId !== userid)
    throw new ApiError(403, "You are not authorized to perform this action");
  const blog = await Blog.findByIdAndDelete(blogId);
  // console.log(blog);
  if (!blog) {
    return res.json(new ApiResponse(404, null, "Blog not found"));
  }
  res.json(new ApiResponse(200, {}, "Blog deleted successfully"));
});
