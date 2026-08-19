import axios from "axios";

const verify = async () => {
  try {
    const res = await axios.get("http://localhost:5000/video/getall");
    console.log(`Success! Backend returned ${res.data.length} videos`);
  } catch (error) {
    console.error("Backend error:", error.message);
  }
};

verify();
