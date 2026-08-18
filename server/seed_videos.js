import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const videochema = mongoose.Schema(
  {
    videotitle: { type: String, required: true },
    filename: { type: String, required: true },
    filetype: { type: String, required: true },
    filepath: { type: String, required: true },
    filesize: { type: String, required: true },
    videochanel: { type: String, required: true },
    Like: { type: Number, default: 0 },
    Dislike: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    uploader: { type: String },
  },
  {
    timestamps: true,
  }
);

const VideoFiles = mongoose.models.videofiles || mongoose.model("videofiles", videochema);

const sampleVideos = [
  {
    videotitle: "Big Buck Bunny",
    filename: "BigBuckBunny.mp4",
    filetype: "video/mp4",
    filepath: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    filesize: "158000000",
    videochanel: "Blender Foundation",
    views: 1205002,
    uploader: "blender_official",
  },
  {
    videotitle: "Elephant Dream",
    filename: "ElephantsDream.mp4",
    filetype: "video/mp4",
    filepath: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    filesize: "400000000",
    videochanel: "Blender Foundation",
    views: 540002,
    uploader: "blender_official",
  },
  {
    videotitle: "For Bigger Blazes",
    filename: "ForBiggerBlazes.mp4",
    filetype: "video/mp4",
    filepath: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    filesize: "20000000",
    videochanel: "Google",
    views: 15000,
    uploader: "google_dev",
  },
  {
    videotitle: "For Bigger Escape",
    filename: "ForBiggerEscapes.mp4",
    filetype: "video/mp4",
    filepath: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    filesize: "25000000",
    videochanel: "Google",
    views: 23000,
    uploader: "google_dev",
  },
  {
    videotitle: "For Bigger Fun",
    filename: "ForBiggerFun.mp4",
    filetype: "video/mp4",
    filepath: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    filesize: "23000000",
    videochanel: "Google",
    views: 4000,
    uploader: "google_dev",
  },
  {
    videotitle: "For Bigger Joyrides",
    filename: "ForBiggerJoyrides.mp4",
    filetype: "video/mp4",
    filepath: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    filesize: "10000000",
    videochanel: "Google",
    views: 302,
    uploader: "google_dev",
  },
  {
    videotitle: "For Bigger Meltdowns",
    filename: "ForBiggerMeltdowns.mp4",
    filetype: "video/mp4",
    filepath: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    filesize: "30000000",
    videochanel: "Google",
    views: 56002,
    uploader: "google_dev",
  },
  {
    videotitle: "Sintel",
    filename: "Sintel.mp4",
    filetype: "video/mp4",
    filepath: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    filesize: "500000000",
    videochanel: "Blender Foundation",
    views: 8900000,
    uploader: "blender_official",
  },
  {
    videotitle: "Subaru Outback On Street And Dirt",
    filename: "SubaruOutbackOnStreetAndDirt.mp4",
    filetype: "video/mp4",
    filepath: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    filesize: "20000000",
    videochanel: "Garage Channel",
    views: 120002,
    uploader: "cars_official",
  },
  {
    videotitle: "Tears of Steel",
    filename: "TearsOfSteel.mp4",
    filetype: "video/mp4",
    filepath: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    filesize: "800000000",
    videochanel: "Blender Foundation",
    views: 13000000,
    uploader: "blender_official",
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to MongoDB");

    // Clear existing videos
    await VideoFiles.deleteMany({});
    console.log("Cleared existing video collection");

    // Insert new sample videos
    await VideoFiles.insertMany(sampleVideos);
    console.log(`Successfully inserted ${sampleVideos.length} external videos!`);

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed database:", error);
    process.exit(1);
  }
};

seedDatabase();
