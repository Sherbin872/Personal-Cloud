import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  folderName: { type: String, default: "root" }, // ✅ New field
  fileName: String,
  fileSize: Number,
  fileType: String,
  s3Url: String,
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model("File", fileSchema);
