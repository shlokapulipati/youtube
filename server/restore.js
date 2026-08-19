import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const videochema = mongoose.Schema({
  videotitle: { type: String },
  filename: { type: String },
  filetype: { type: String, default: "video/mp4" },
  filepath: { type: String },
  filesize: { type: String },
  videochanel: { type: String, default: "My Channel" },
  Like: { type: Number, default: 0 },
  Dislike: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  uploader: { type: String }
});
const VideoFiles = mongoose.models.videofiles || mongoose.model("videofiles", videochema);

const restore = async () => {
    await mongoose.connect(process.env.DB_URL);
    
    // Clear the blender sample videos.
    await VideoFiles.deleteMany({});
    
    const files = fs.readdirSync("./uploads");
    for (const file of files) {
        if (!file.endsWith(".mp4")) continue;
        const stats = fs.statSync(`./uploads/${file}`);
        // Extract original name from multer timestamp (Format: 2026-08-05T16-23-31.317Z-Video Project 1.mp4)
        const parts = file.split('-');
        let title = file;
        if(parts.length >= 6) {
           title = parts.slice(5).join('-').replace('.mp4', '');
        }
        await VideoFiles.create({
            videotitle: title,
            filename: file,
            filetype: "video/mp4",
            filepath: `uploads/${file}`,
            filesize: stats.size.toString(),
            videochanel: "Sree's Vlog",
        });
    }
    console.log("Restored", files.length, "user videos from uploads directory!");
    process.exit(0);
}
restore();
