import path from "path";
import os from "os";

function createTempFilePath(prefix = "tmp", extension = "tmp") {
  const tempFilePath = path.join(
    os.tmpdir(),
    `${prefix}_${Math.random().toString(36).substring(2, 15)}.${extension}`
  );

  return tempFilePath;
}
export { createTempFilePath };
