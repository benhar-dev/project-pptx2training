import ffmpeg from "./ffmpeg-patched.js";
import { getAudioDuration } from "./ffmpeg-utils.js";
import { createTempFilePath } from "./file-utils.js";

async function processSlide(video, audio, filepath) {
  let videoDuration, audioDuration;
  try {
    videoDuration = await getAudioDuration(video.filepath);
    audioDuration = await getAudioDuration(audio.filepath);
  } catch (error) {
    throw new Error(
      `Failed to fetch durations for video or audio: ${error.message}`
    );
  }

  return new Promise((resolve, reject) => {
    let command = ffmpeg();

    try {
      if (videoDuration > audioDuration) {
        command = command
          .addInput(video.filepath) // Video input
          .addInput(audio.filepath) // Audio input
          .complexFilter([
            `aevalsrc=0:d=${videoDuration - audioDuration} [silence]`, // Generate silence of required length
            `[1:a][silence] concat=n=2:v=0:a=1 [extendedAudio]`, // Concatenate original audio with silence
          ])
          .outputOptions([
            "-map 0:v", // Map video from the first input
            "-map [extendedAudio]", // Map the extended audio
            "-c:v",
            "libx264", // Video codec configuration
            "-preset",
            "fast", // Encoder preset
            "-crf",
            "23", // Constant Rate Factor for quality
            "-c:a",
            "aac", // Audio codec
            "-ar",
            "44100", // Audio sample rate
            "-ac",
            "2", // Audio channels
          ]);
      } else if (audioDuration > videoDuration) {
        command = command
          .input(video.filepath)
          .input(audio.filepath)
          .outputOptions([
            `-filter_complex [0:v]tpad=stop_mode=clone:stop_duration=${
              audioDuration - videoDuration
            }[v];[v][1:a]concat=n=1:v=1:a=1`,
            "-c:v",
            "libx264",
            "-preset",
            "fast",
            "-crf",
            "23",
            "-c:a",
            "aac",
            "-ar",
            "44100",
            "-ac",
            "2",
          ]);
      } else {
        command = command
          .addInput(video.filepath)
          .addInput(audio.filepath)
          .outputOptions([
            "-c:v",
            "libx264",
            "-preset",
            "fast",
            "-crf",
            "23",
            "-c:a",
            "aac",
            "-ar",
            "44100",
            "-ac",
            "2",
          ]);
      }
    } catch (err) {
      reject(new Error(`Error setting up FFmpeg command: ${err.message}`));
      return;
    }

    command
      .saveToFile(filepath)
      .on("end", () => resolve())
      .on("error", (err) => reject(new Error(`FFmpeg error: ${err.message}`)));
  });
}

async function combineSlideAudioWithVideo(audios, videos) {
  let createdVideos = [];
  for (const video of videos) {
    const audio = audios.find((a) => a.slide === video.slide);
    if (!audio) {
      console.error(`No corresponding audio for video slide ${video.slide}`);
      new Error(`No corresponding audio for video slide ${video.slide}`);
    }
    console.log(`- processing slide ${video.slide}`);
    try {
      const combinedVideoFilePath = createTempFilePath(
        `combinedVideo_${video.slide}`,
        "mp4"
      );
      await processSlide(video, audio, combinedVideoFilePath);
      createdVideos.push({ filepath: combinedVideoFilePath });
    } catch (err) {
      console.error(`Failed to process slide ${video.slide}: ${err.message}`);
      new Error(`Failed to process slide ${video.slide}: ${err.message}`);
    }
  }
  return createdVideos;
}

export { combineSlideAudioWithVideo };
