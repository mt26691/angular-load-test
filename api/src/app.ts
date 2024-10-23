import express from "express";
import multer from "multer";
import path from "path";
import Bull from "bull"; // Import Bull
import fs from "fs";
import jsonServer from "json-server";
import dotenv from "dotenv";
import cors from "cors"; // Import CORS

dotenv.config();

console.log("Redis Host:", process.env.REDIS_HOST);
console.log("API URL:", process.env.API_URL);

const router = jsonServer.router(path.join(__dirname, "..", "db.json")); // Path to db.json file
// Use JSON Server router for the "/api/json" endpoint

// Initialize Bull queue (connected to Redis)
const conversionQueue = new Bull("mp4-to-gif-queue", {
  redis: { host: process.env.REDIS_HOST, port: 6379 },
});

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*", // Allow all origins
  })
);

// Serve static files from the "uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/json", router);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".mp4") {
      return cb(new Error("Only MP4 files are allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: 10000000 }, // 10 MB limit for video file
});

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Route to handle file upload and conversion job submission
app.post("/v1/convert", upload.single("file"), async (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  // Get file path and set output file path for GIF
  const filePath = req.file.path;
  const outputFilePath = `uploads/${Date.now()}-output.gif`;

  try {
    // Add the job to the Bull queue
    const job = await conversionQueue.add({
      filePath: filePath, // Path of the uploaded MP4
      outputFilePath: outputFilePath, // Path where GIF will be saved
    });

    // Return the job ID so the client can track it
    res.json({
      message: "Job added to queue successfully",
      jobId: job.id,
      status: "Job Queued",
    });
  } catch (error) {
    console.error("Error adding job to the queue:", error);
    res.status(500).send("Error queuing the job");
  }
});

app.get("/job/:id", async (req: any, res: any) => {
  const job = await conversionQueue.getJob(req.params.id);
  if (!job) {
    return res.status(404).send("Job not found");
  }

  const state = await job.getState(); // Get the current state of the job (waiting, active, completed, etc.)
  const progress = job.progress(); // Get job progress if applicable

  res.json({
    jobId: job.id,
    state: state,
    progress: progress,
    result: job.returnvalue, // This contains the result if the job is completed
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
