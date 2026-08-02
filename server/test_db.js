const mongoose = require("mongoose");
const DBURL = "mongodb://shlokapulipati_db_youtube:Shlok%402007@ac-o7dmywm-shard-00-00.8ntuh0w.mongodb.net:27017,ac-o7dmywm-shard-00-01.8ntuh0w.mongodb.net:27017,ac-o7dmywm-shard-00-02.8ntuh0w.mongodb.net:27017/?ssl=true&replicaSet=atlas-lyyldq-shard-0&authSource=admin&appName=Cluster0";

console.log("Connecting to MongoDB...");
mongoose
  .connect(DBURL)
  .then(() => {
    console.log("Mongodb connected successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Mongodb connection error:", error);
    process.exit(1);
  });
