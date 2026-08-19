import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();
const vSchema = mongoose.Schema({ videotitle: String, filename: String, filepath: String, filetype: String, filesize: String, videochanel: String, Like: Number, Dislike: Number, views: Number, uploader: String }, { timestamps: true, strict: false });
const VideoFiles = mongoose.models.videofiles || mongoose.model('videofiles', vSchema);
const pubDir = path.resolve('../frontend/public/video');
async function run() {
  try {
    await mongoose.connect(process.env.DB_URL);
    const publicFiles = fs.readdirSync(pubDir).filter(f => f.endsWith('.mp4'));
    const videos = await VideoFiles.find({});
    let safeDbFiles = [];
    for (let v of videos) {
       const isSafe = publicFiles.includes(v.filename) || v.videotitle === 'vdo' || (v.filepath && v.filepath.includes('vdo'));
       if (!isSafe) {
          console.log('Deleting unsafe video:', v.videotitle);
          await VideoFiles.findByIdAndDelete(v._id);
          if (v.filepath && v.filepath.startsWith('uploads')) {
              try {
                  const fullPath = path.resolve(v.filepath);
                  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
                  console.log('Deleted file from uploads:', v.filepath);
              } catch (e) { console.error('Could not delete file:', e); }
          }
       } else {
          safeDbFiles.push(v.filename || 'vdo.mp4');
       }
    }
    for (let f of publicFiles) {
       if (!safeDbFiles.includes(f)) {
          console.log('Inserting new public video:', f);
          await VideoFiles.create({
            videotitle: f.replace('.mp4', ''),
            filename: f,
            filepath: `/video/${f}`,
            filetype: 'video/mp4',
            filesize: '100000',
            videochanel: 'Sree\'s Vlog',
            views: Math.floor(Math.random() * 1000),
            uploader: 'sree'
          });
       }
    }
    console.log('Finished replacing videos!');
  } catch (err) {
    console.error('FATAL ERROR:', err);
  }
  process.exit(0);
}
run();
