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
          .addInput(video.filepath)
          .addInput(audio.filepath)
          .complexFilter([
            `[1:a] aevalsrc=0:d=${videoDuration - audioDuration} [silence]`,
            `[0:a][silence] concat=n=2:v=0:a=1 [extendedAudio]`,
          ])
          .outputOptions(["-map 0:v", "-map [extendedAudio]"]);
      } else if (audioDuration > videoDuration) {
        command = command
          .input(video.filepath)
          .input(audio.filepath)
          .outputOptions([
            `-filter_complex [0:v]tpad=stop_mode=clone:stop_duration=${
              audioDuration - videoDuration
            }[v];[v][1:a]concat=n=1:v=1:a=1`,
          ]);
      } else {
        command = command
          .addInput(video.filepath)
          .addInput(audio.filepath)
          .outputOptions(["-map 0:v", "-map 1:a"]);
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
