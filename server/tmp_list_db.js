import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const vSchema = mongoose.Schema({ videotitle: String, filename: String, filepath: String, filetype: String, filesize: String, videochanel: String, Like: Number, Dislike: Number, views: Number, uploader: String }, { timestamps: true, strict: false });
const VideoFiles = mongoose.models.videofiles || mongoose.model('videofiles', vSchema);
async function run() {
  await mongoose.connect(process.env.DB_URL);
  const videos = await VideoFiles.find({});
  console.log(JSON.stringify(videos.map(v => ({ _id: v._id, title: v.videotitle, file: v.filename, path: v.filepath })), null, 2));
  process.exit(0);
}
run();
