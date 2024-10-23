import ffmpeg from "fluent-ffmpeg";
import axios from "axios";

// Function to convert MP4 to GIF with validation checks
export const convertVideoToGif = (
  jobId: any,
  originalFileName: string,
  filePath: string,
  outputFilePath: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log(`Converting file ${filePath} to GIF`);
    // Step 1: Get video metadata to check duration and dimensions
    ffmpeg.ffprobe(filePath, async (err, metadata) => {
      if (err) {
        console.error("Error getting video metadata:", err);
        return reject(new Error("Failed to retrieve video metadata"));
      }

      // Extract duration and dimensions
      const duration = metadata.format.duration;
      const videoStream = metadata.streams.find(
        (stream) => stream.codec_type === "video"
      );

      if (!videoStream) {
        await saveFailureToJsonServer(
          jobId,
          originalFileName,
          filePath,
          "No video stream found in the file"
        );
        return reject(new Error("No video stream found in the file"));
      }

      const { width, height } = videoStream;

      // Check if duration exceeds 10 seconds
      if (duration && duration > 40) {
        await saveFailureToJsonServer(
          jobId,
          originalFileName,
          filePath,
          "Video exceeds maximum duration of 10 seconds",
          duration,
          width,
          height
        );
        return reject(
          new Error("Video exceeds maximum duration of 10 seconds")
        );
      }

      if (width === undefined || height === undefined) {
        await saveFailureToJsonServer(
          jobId,
          originalFileName,
          filePath,
          "Video dimensions are not available",
          duration,
          width,
          height
        );
        return reject(new Error("Video dimensions are not available"));
      }
      // Check if dimensions exceed 1024x768
      if (width > 1024 || height > 768) {
        await saveFailureToJsonServer(
          jobId,
          originalFileName,
          filePath,
          "Video dimensions exceed 1024x768"
        );
        return reject(new Error("Video dimensions exceed 1024x768"));
      }

      // Step 2: Proceed with conversion if validations pass
      ffmpeg(filePath)
        .output(outputFilePath)
        .size("?x400") // Set height to 400px, auto-calculate width
        .fps(5) // Set FPS to 5
        .on("end", async () => {
          console.log(`Conversion completed for ${filePath}`);

          try {
            // Make a POST request to JSON Server to save the file metadata on success
            const response = await axios.post(
              `${process.env.API_URL}/json/files`,
              {
                jobId: jobId,
                originalFileName: originalFileName,
                filePath: filePath,
                convertedFilePath: outputFilePath,
                duration,
                width,
                height,
                status: "completed",
                createdTime: new Date().toISOString(),
              }
            );

            console.log(
              `Uploaded metadata to JSON Server with ID: ${response.data.id}`
            );
            resolve();
          } catch (error) {
            console.error("Error uploading metadata to JSON Server:", error);
            reject(error); // Reject the promise if the upload fails
          }
        })
        .on("error", async (err) => {
          console.error(`Error converting file ${filePath}`, err);

          try {
            // Make a POST request to JSON Server to save the file metadata on failure
            await saveFailureToJsonServer(
              jobId,
              originalFileName,
              filePath,
              err.message
            );

            console.log(
              `Uploaded failure metadata to JSON Server for Job ID: ${jobId}`
            );
          } catch (uploadError) {
            console.error(
              "Error uploading failure metadata to JSON Server:",
              uploadError
            );
          }

          reject(err); // Reject the promise with the conversion error
        })
        .run();
    });
  });
};

// Helper function to save failure metadata to JSON Server
const saveFailureToJsonServer = async (
  jobId: any,
  originalFileName: string,
  filePath: string,
  reason: string,
  duration: number = 0,
  width: number = 0,
  height: number = 0
) => {
  try {
    await axios.post(`${process.env.API_URL}/json/files`, {
      jobId: jobId,
      originalFileName: originalFileName,
      filePath: filePath,
      convertedFilePath: null, // No converted file path on failure
      status: "failed",
      reason: reason,
      width,
      duration,
      height,
      createdTime: new Date().toISOString(),
    });

    console.log(
      `Saved failure metadata for Job ID: ${jobId} with reason: ${reason}`
    );
  } catch (error) {
    console.error("Error saving failure metadata to JSON Server:", error);
  }
};
