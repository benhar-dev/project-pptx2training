import ffmpeg from "./ffmpeg-patched.js";
import { getAudioDuration } from "./ffmpeg-utils.js";

async function processSlide(video, audio, slideNumber) {
  const videoDuration = await getAudioDuration(video.filepath);
  const audioDuration = await getAudioDuration(audio.filepath);

  return new Promise((resolve, reject) => {
    let command = ffmpeg();

    if (videoDuration > audioDuration) {
      // Extend audio with silence
      command = command
        .addInput(video.filepath)
        .addInput(audio.filepath)
        .complexFilter([
          `[1:a] aevalsrc=0:d=${videoDuration - audioDuration} [silence]`,
          `[0:a][silence] concat=n=2:v=0:a=1 [extendedAudio]`,
        ])
        .outputOptions(["-map 0:v", "-map [extendedAudio]"]);
    } else if (audioDuration > videoDuration) {
      // Extend video with last frame
      command = command
        .input(video.filepath)
        .input(audio.filepath)
        .outputOptions([
          `-filter_complex [0:v]tpad=stop_mode=clone:stop_duration=${
            audioDuration - videoDuration
          }[v];[v][1:a]concat=n=1:v=1:a=1`,
        ]);
    } else {
      // No need to adjust, just combine as is
      command = command
        .addInput(video.filepath)
        .addInput(audio.filepath)
        .outputOptions(["-map 0:v", "-map 1:a"]);
    }

    command
      .saveToFile(`output_slide_${slideNumber}.mp4`)
      .on("end", () => resolve())
      .on("error", (err) => reject(err));
  });
}

async function combineSlideAudioWithVideo(audios, videos) {
  // Process each pair of slides
  for (const video of videos) {
    const audio = audios.find((a) => a.slide === video.slide);
    if (audio) {
      await processSlide(video, audio, video.slide);
    }
  }
}

export { combineSlideAudioWithVideo };
