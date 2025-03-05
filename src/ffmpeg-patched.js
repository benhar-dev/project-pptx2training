import ffmpeg from "fluent-ffmpeg";

function PatchedFfmpeg(...args) {
  const instance = ffmpeg(...args);

  // Save a reference to the original availableFormats method
  const originalAvailableFormats = instance.availableFormats;

  // Enhance the availableFormats method
  instance.availableFormats = function (callback) {
    originalAvailableFormats.call(this, (err, data) => {
      const lavfi = {
        canDemux: true,
        canMux: true,
        description: "Lavfi",
      };
      callback(err, { ...data, lavfi });
    });
  };

  return instance;
}

PatchedFfmpeg.prototype = Object.create(ffmpeg.prototype);
PatchedFfmpeg.prototype.constructor = PatchedFfmpeg;

export default PatchedFfmpeg;
