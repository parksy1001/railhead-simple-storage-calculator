import { DVR_REAL_BITRATE } from "./dvrBitrateTable";

const DVR_QUALITY_INDEX = {
  "Basic" : 0,
  "Standard" : 1,
  "High" : 2,
  "Very High": 3
};

const DVR_OUT_RES_INDEX = {
  "Standard" : 0,
  "High" : 1,
  "Very High": 2
};

const DVR_FPS_INDEX = {
  1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5,
  7: 6, 8: 7, 9: 8, 10: 9, 15: 10, 20: 11, 30: 12
};

export function calcDvrMbps({
  camResIdx,        
  outRes,
  quality,
  fps,
  codec,
  useIC,
  isPAL = false
}) {
  const resIdx = DVR_OUT_RES_INDEX[outRes];
  const qulIdx = DVR_QUALITY_INDEX[quality];
  const fpsIdx = DVR_FPS_INDEX[fps];

  if (
    camResIdx == null ||
    resIdx == null ||
    qulIdx == null ||
    fpsIdx == null
  ) return 0;

  let kbps =
    DVR_REAL_BITRATE[camResIdx][resIdx][qulIdx][fpsIdx] * 1000;

  // PAL 보정
  if (isPAL) kbps *= 1.2;

  // H.265
  if (codec === "H.265") kbps *= 0.5;

  // Intelligent Codec
  if (useIC) kbps *= 0.7;

  return kbps / 1024; // Mbps
}
