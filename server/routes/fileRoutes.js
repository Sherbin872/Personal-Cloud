import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { uploadFile, uploadMiddleware, listFiles, deleteFile,getUserFolders } from "../controllers/fileController.js";


const router = express.Router();

router.post("/upload", verifyToken, uploadMiddleware, uploadFile);
router.get("/", verifyToken, listFiles);
router.delete("/:id", verifyToken, deleteFile);
router.get("/folders", verifyToken, getUserFolders);


export default router;
