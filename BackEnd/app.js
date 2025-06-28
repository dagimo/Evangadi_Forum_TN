require("dotenv").config();
console.log("App.js: Starting server setup...");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 2112;

// Global middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
console.log("App.js: Middlewares configured.");

// DB connection and table schemas
const dbConnection = require("./Db/dbConfig");
const {
  users,
  questions,
  answers,
  createAnswerVotes,
  createAnswerComments,
} = require("./Table/schema");

// Routes
const userRoutes = require("./Routes/userRoute");
const questionRoutes = require("./Routes/questionRoute");
const answersRoute = require("./Routes/answerRoute");
const authMiddleware = require("./MiddleWare/authMiddleWare");

// Route middleware
console.log("App.js: Setting up routes...");
app.use("/api/users",userRoutes);
app.use("/api/answer", authMiddleware,answersRoute);
app.use("/api/question", authMiddleware,questionRoutes);
app.use("/api/answer/:answerid", authMiddleware,answersRoute);

// Start server and create tables
async function start() {
  console.log("App.js: Starting database connection and server listening...");
  let dbConnected = false;
  
  try {
    await dbConnection.query("SELECT 'test'"); // Test DB connection
    dbConnected = true;
    console.log("App.js: Database test query successful.");
    
    // Create tables
    await dbConnection.query(users);
    await dbConnection.query(questions);
    await dbConnection.query(answers);
    //added tables
    await dbConnection.query(createAnswerVotes);
    await dbConnection.query(createAnswerComments);
    // console.log("✅ Connected to PostgreSQL database");
    // console.log("✅ Migrations completed successfully.");
  } catch (error) {
    console.log("❌ Error during DB setup:", error.message);
    console.error("App.js: Error during DB setup or startup:", error); 
  }
  
  // Start server regardless of database connection
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    if (!dbConnected) {
      console.warn("⚠️ Note: Database is not connected. Some features may not work.");
    }
  });
}

start();
