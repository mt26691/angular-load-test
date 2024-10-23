import Bull from "bull";
import { convertVideoToGif } from "./videoConverter";
import dotenv from "dotenv";

dotenv.config();

// Initialize the queue and point it to the Redis server
const conversionQueue = new Bull("mp4-to-gif-queue", {
  redis: { host: process.env.REDIS_HOST, port: 6379 },
});

console.log("Worker is running on process", process.pid);
console.log("Redis Host:", process.env.REDIS_HOST);
console.log("API URL:", process.env.API_URL);

// Process jobs from the queue
conversionQueue.process(async (job) => {
  const { filePath, outputFilePath, originalFileName } = job.data;

  try {
    await convertVideoToGif(job.id, originalFileName, filePath, outputFilePath);
    console.log(`Job ${job.id} completed successfully.`);
  } catch (error: any) {
    console.error(`Job ${job.id} failed with error: ${error?.message}`);
  }
});
