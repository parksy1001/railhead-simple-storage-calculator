
export const DVR_CAM_RES_INDEX = {
  
  "D1 (Analog Camera)":0,
  "960H (Analog Camera)":1,
  "1MP (Analog Camera)": 2,   // D1
  "2MP (Analog Camera)": 3,   // HD
  "3MP (Analog Camera)": 4,   // 960H
  "4MP (Analog Camera)": 5,   // FullHD
  "5MP (Analog Camera)": 6    // 3M18 (IDIS 기준)
};

export const DVR_OUT_RES_INDEX = {
  "Standard": 0,
  "High": 1,
  "Very High": 2
};

export const parseDvrOutResIdx = (resStr) => {
  if (!resStr) return 0;
  if (resStr.startsWith("Very High")) return 2;
  if (resStr.startsWith("High")) return 1;
  return 0;
};

export const DVR_FPS_INDEX = {
  30: 12,
  25: 11,
  20: 10,
  15: 9,
  12: 8,
  10: 7,
  8: 6,
  6: 5,
  5: 4,
  4: 3,
  3: 2,
  2: 1,
  1: 0
};

