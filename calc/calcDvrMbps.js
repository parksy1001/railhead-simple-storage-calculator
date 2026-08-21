import { DVR_REAL_BITRATE } from "./dvrBitrateTable";
import {
  DVR_CAM_RES_INDEX,
  parseDvrOutResIdx,
  DVR_FPS_INDEX
} from "./dvrMaps";

const QUALITY_INDEX = {
  "Basic": 0,
  "Standard": 1,
  "High": 2,
  "Very High": 3
};

export const calcDvrMbps = ({
  camType,
  outRes,
  qual,
  fps,
  codec,
  useIC
}) => {
  const camResIdx = DVR_CAM_RES_INDEX[camType];
  if (camResIdx === undefined) return 0;

  const outResIdx = parseDvrOutResIdx(outRes);
  const qualityIdx = QUALITY_INDEX[qual] ?? 1;
  const fpsIdx = DVR_FPS_INDEX[fps] ?? 12;

  let mbps =
    DVR_REAL_BITRATE
      ?. [camResIdx]
      ?. [outResIdx]
      ?. [qualityIdx]
      ?. [fpsIdx] ?? 0;

  if (codec === "H.265") mbps *= 0.5;

  if (useIC) {
    if (codec === "H.265") mbps *= 0.687;
    if (codec === "H.264") mbps *= 0.625;
  }

  return mbps;
};
