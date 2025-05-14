import { Router } from "express";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/multer.middleware.js";
import { blogList, Blogpost, DeleteBlog, EditBlog, singleBlog } from "../Controller/Blog.controller.js";

const router = Router();

router.post(
  "/blog",
  verifyJWT,
  upload.fields([
    { name: "BlogImage", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  Blogpost
);
router.put(
  "/editblog",
  verifyJWT,
  upload.fields([
    { name: "BlogImage", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  EditBlog
);
router.get("/blogs", verifyJWT, blogList);
router.get("/blog", verifyJWT, singleBlog);
router.delete("/DeleteBlog", verifyJWT, DeleteBlog);

export default router;
