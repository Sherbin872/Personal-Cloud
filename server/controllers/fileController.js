import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import multer from "multer";
import File from "../models/File.js";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Multer for file uploads
const upload = multer({ dest: "uploads/" });
export const uploadMiddleware = upload.single("file");

// AWS S3 v3 configuration
console.log("🔑 AWS_ACCESS_KEY_ID:", !!process.env.AWS_ACCESS_KEY_ID);
console.log("🔒 AWS_SECRET_ACCESS_KEY:", !!process.env.AWS_SECRET_ACCESS_KEY);
console.log("🌍 AWS_REGION:", process.env.AWS_REGION);

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Upload file to S3
export const uploadFile = async (req, res) => {
  let filePath = null;
  try {
    console.log("➡️ Upload route hit");
    const folder = req.body.folder || "root";
    const userId = req.userId;

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const file = req.file;
    filePath = file.path; // save for cleanup

    const fileContent = fs.readFileSync(file.path);

    const isCSV =
      file.mimetype === "text/csv" || file.originalname.endsWith(".csv");

    const s3Key = `${userId}/${folder}/${file.originalname}`;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET,
      Key: s3Key,
      Body: fileContent,
      ContentType: isCSV ? "text/plain" : file.mimetype,
      ContentDisposition: "inline",
    };

    await s3.send(new PutObjectCommand(uploadParams));

    const fileUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    const savedFile = await File.create({
      userId,
      folderName: folder,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      s3Url: fileUrl,
    });

    res.json(savedFile);
  } catch (error) {
    console.error("🔥 Upload Error:", error);
    res.status(500).json({ message: error.message });
  } finally {
    // 🧹 Always try to delete local file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("🧹 Local file deleted:", filePath);
    }
  }
};


export const getUserFolders = async (req, res) => {
  try {
    const userId = req.userId;
    const files = await File.find({ userId });
    const folders = [...new Set(files.map((f) => f.folderName))];
    res.json({ folders, files });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// List all user files
export const listFiles = async (req, res) => {
  const files = await File.find({ userId: req.userId });
  res.json(files);
};

// Delete file from S3 + DB
export const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    const deleteParams = {
      Bucket: process.env.S3_BUCKET,
      Key: `${req.userId}/${file.fileName}`,
    };
    await s3.send(new DeleteObjectCommand(deleteParams));

    await File.findByIdAndDelete(req.params.id);
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
