import mongoose from "mongoose";
import dotenv from "dotenv";
import video from "./Modals/video.js";

dotenv.config();

const DBURL = process.env.DB_URL;

const sampleVideos = [
  {
    videotitle: "Big Buck Bunny",
    filename: "BigBuckBunny.mp4",
    filetype: "video/mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    filesize: "158MB",
    videochanel: "Blender Foundation",
    uploader: "AdminId",
    Like: 15400,
    Dislike: 210,
    views: 1205000,
  },
  {
    videotitle: "Elephant Dream",
    filename: "ElephantsDream.mp4",
    filetype: "video/mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    filesize: "100MB",
    videochanel: "Blender Foundation",
    uploader: "AdminId",
    Like: 4500,
    Dislike: 50,
    views: 540000,
  },
  {
    videotitle: "For Bigger Blazes",
    filename: "ForBiggerBlazes.mp4",
    filetype: "video/mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    filesize: "15MB",
    videochanel: "Google",
    uploader: "AdminId",
    Like: 990,
    Dislike: 32,
    views: 15000,
  },
  {
    videotitle: "For Bigger Escape",
    filename: "ForBiggerEscapes.mp4",
    filetype: "video/mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    filesize: "20MB",
    videochanel: "Google",
    uploader: "AdminId",
    Like: 890,
    Dislike: 12,
    views: 23000,
  },
  {
    videotitle: "For Bigger Fun",
    filename: "ForBiggerFun.mp4",
    filetype: "video/mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    filesize: "22MB",
    videochanel: "Google",
    uploader: "AdminId",
    Like: 300,
    Dislike: 5,
    views: 4000,
  },
  {
    videotitle: "For Bigger Joyrides",
    filename: "ForBiggerJoyrides.mp4",
    filetype: "video/mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    filesize: "18MB",
    videochanel: "Google",
    uploader: "AdminId",
    Like: 50,
    Dislike: 1,
    views: 300,
  },
  {
    videotitle: "For Bigger Meltdowns",
    filename: "ForBiggerMeltdowns.mp4",
    filetype: "video/mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    filesize: "30MB",
    videochanel: "Google",
    uploader: "AdminId",
    Like: 1200,
    Dislike: 30,
    views: 56000,
  },
  {
    videotitle: "Sintel",
    filename: "Sintel.mp4",
    filetype: "video/mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    filesize: "250MB",
    videochanel: "Blender Foundation",
    uploader: "AdminId",
    Like: 54000,
    Dislike: 800,
    views: 8900000,
  },
  {
    videotitle: "Subaru Outback On Street And Dirt",
    filename: "SubaruOutbackOnStreetAndDirt.mp4",
    filetype: "video/mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    filesize: "40MB",
    videochanel: "Garage TV",
    uploader: "AdminId",
    Like: 3400,
    Dislike: 110,
    views: 320000,
  },
  {
    videotitle: "Tears of Steel",
    filename: "TearsOfSteel.mp4",
    filetype: "video/mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    filesize: "350MB",
    videochanel: "Blender Foundation",
    uploader: "AdminId",
    Like: 89000,
    Dislike: 1200,
    views: 12500000,
  },
  {
    videotitle: "Volkswagen GTI Review",
    filename: "VolkswagenGTIReview.mp4",
    filetype: "video/mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    filesize: "55MB",
    videochanel: "Garage TV",
    uploader: "AdminId",
    Like: 5600,
    Dislike: 400,
    views: 670000,
  },
  {
    videotitle: "We Are Going On Bullrun",
    filename: "WeAreGoingOnBullrun.mp4",
    filetype: "video/mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    filesize: "48MB",
    videochanel: "Garage TV",
    uploader: "AdminId",
    Like: 4500,
    Dislike: 200,
    views: 450000,
  }
];

const seedDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(DBURL);
    console.log("Connected successfully!");

    console.log("Clearing existing videos...");
    await video.deleteMany({});

    console.log("Inserting 12 High Quality public seed videos...");
    await video.insertMany(sampleVideos);

    console.log("Seed data inserted successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
