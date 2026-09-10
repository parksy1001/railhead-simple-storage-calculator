export const RECORDER_MODEL = [
    { name: "LDVR4K",  ch: 16, hdd: 2, evenHddOnly : false, raids: ["None", "RAID1"], maxMbps: 160  },
]

export const RESOLUTIONS = {
  RES_3840_2160: "3840x2160",
  RES_3328_1872: "3328x1872",
  RES_2944_2944: "2944x2944",
  RES_2944_1472: "2944x1472",
  RES_2592_1944: "2592x1944",
  RES_2592_1456 : "2592x1456",
  RES_2560_2048: "2560x2048",
  RES_2560_1024: "2560x1024",
  RES_2208_2208: "2208x2208",
  RES_1920_1440: "1920x1440",
  RES_1920_1080: "1920x1080",
  RES_1920_1536: "1920x1536",
  RES_1472_1472: "1472x1472",
  RES_1280_1024: "1280x1024",
  RES_1280_720: "1280x720",
  RES_1280_960: "1280x960",
  RES_768_768: "768x768",
  RES_768_384: "768x384",
  RES_736_736: "736x736",
  RES_640_512: "640x512",
  RES_640_480: "640x480",
  RES_640_360: "640x360",
  RES_640_256: "640x256",
  RES_352_240: "352x240",
};



export const CAMERA_RESOLUTION_PROFILES = {
  NORMAL_2MP: {
    resolutions: [
      RESOLUTIONS.RES_1920_1080,
      RESOLUTIONS.RES_1280_720,
      RESOLUTIONS.RES_640_360,
      RESOLUTIONS.RES_352_240,
    ],
    dualAllowed: [
      RESOLUTIONS.RES_640_360,
      RESOLUTIONS.RES_352_240,
    ],
  },

  FISHEYE_5MP: {
    resolutions: [
      RESOLUTIONS.RES_2560_2048,
      RESOLUTIONS.RES_2560_1024,
      RESOLUTIONS.RES_1920_1536,
      RESOLUTIONS.RES_1280_1024,
      RESOLUTIONS.RES_640_512,
      RESOLUTIONS.RES_640_256
    ],
    dualAllowed: [
      RESOLUTIONS.RES_640_512,
      RESOLUTIONS.RES_640_256
    ],
  },
};

export const CAMERA_MODEL = {
  "RVS-CAM-DOME-2": CAMERA_RESOLUTION_PROFILES.NORMAL_2MP,
  "RVS-CAM-WEDGE-2": CAMERA_RESOLUTION_PROFILES.NORMAL_2MP,
  "RVS-CAM-MODULE-2": CAMERA_RESOLUTION_PROFILES.NORMAL_2MP,
  "RVS-CAM-CVT": CAMERA_RESOLUTION_PROFILES.NORMAL_2MP,
  "RVS-CAM-3605MP-2": CAMERA_RESOLUTION_PROFILES.FISHEYE_5MP,
};

export const QUALITY_INDEX = { "Basic": 0, "Standard": 1, "High": 2, "Very High": 3 };

export const HDD_SIZE_OPTIONS = [
  0.125,
  0.25,
  0.5,
  1,
  2,
  4,
  8,
  16
];

export const FPS_POOL =  [30, 15, 10, 5, 4, 3, 2, 1];

export const FPS_SCALE = { 1:10, 2:14, 3:17, 4:20, 5:22, 10:32, 15:39, 30:55, 60:60 };


export const RES_BIAS = {
  [RESOLUTIONS.RES_3840_2160]:0,
  [RESOLUTIONS.RES_3328_1872]:0,
  [RESOLUTIONS.RES_2944_2944]:0,
  [RESOLUTIONS.RES_2944_1472]:0,
  [RESOLUTIONS.RES_2560_2048]:0,
  [RESOLUTIONS.RES_2560_1024]:0,
  [RESOLUTIONS.RES_2208_2208]:0,
  [RESOLUTIONS.RES_1920_1080]:0,
  [RESOLUTIONS.RES_1920_1536]:0,
  [RESOLUTIONS.RES_1472_1472]:0,
  [RESOLUTIONS.RES_1280_1024]:2,
  [RESOLUTIONS.RES_1280_720]:2,
  [RESOLUTIONS.RES_768_768]:1,
  [RESOLUTIONS.RES_768_384]:2,
  [RESOLUTIONS.RES_736_736]:1,
  [RESOLUTIONS.RES_640_512]:8,
  [RESOLUTIONS.RES_640_360]:8,
  [RESOLUTIONS.RES_640_256]:9,
  [RESOLUTIONS.RES_352_240]:10
};

export const BITRATE_TABLE = {
  [RESOLUTIONS.RES_3840_2160]:[9216,12288,15360,18432],
  [RESOLUTIONS.RES_3328_1872]:[8192,10922,13654,16384],
  [RESOLUTIONS.RES_2944_2944]:[9472,12630,15788,18944],
  [RESOLUTIONS.RES_2592_1944]:[8192,10922,13654,16384],
  [RESOLUTIONS.RES_2592_1456]:[5980,9966,12458,14950],
  [RESOLUTIONS.RES_2944_1472]:[7832,10444,13056,15666],
  [RESOLUTIONS.RES_2560_2048]:[8192,10922,13654,16384],
  [RESOLUTIONS.RES_2560_1024]:[5530,9216,11520,13824],  
  [RESOLUTIONS.RES_2208_2208]:[8104,10806,13508,16208],
  [RESOLUTIONS.RES_1920_1080]:[4096,8192,10240,12288],
  [RESOLUTIONS.RES_1920_1536]:[5632,9386,11734,14080],
  [RESOLUTIONS.RES_1472_1472]:[4736,6315,7894,9472],
  [RESOLUTIONS.RES_1280_1024]:[2820,5642,7782,9728],
  [RESOLUTIONS.RES_1280_720]:[2048,4096,6144,8192],
  [RESOLUTIONS.RES_768_768] :[1422,2846,4268,5692],
  [RESOLUTIONS.RES_768_384]:[880,1760,2640,3520],
  [RESOLUTIONS.RES_736_736]:[1418,2836,4254,5672],
  [RESOLUTIONS.RES_640_512]:[972,1944,2918,3890],
  [RESOLUTIONS.RES_640_360]:[768,1536,2304,3072],
  [RESOLUTIONS.RES_640_256]:[496,992,1488,1984],
  [RESOLUTIONS.RES_1920_1440]:[5632,9386,11734,14080],
  [RESOLUTIONS.RES_1280_960]:[2820,5642,7782,9728],
  [RESOLUTIONS.RES_640_480]:[896,1792,2688,3584],
  [RESOLUTIONS.RES_352_240]:[256,512,768,1024]
};
export const RAID_MIN_DISKS = {
  None: 1,
  RAID1: 2,
  RAID5: 4,
  RAID6: 4,
  RAID10: 4
};


export const RAID_INFO = {
  "None": "Uses all disk capacity independently. No data redundancy or protection is provided.",
  "RAID1": "Mirrors data across disks to create an exact copy for redundancy. (50% usable capacity)",
  "RAID5": "Distributes parity information across disks to tolerate a single disk failure. (N-1 usable capacity, minimum 4 disks required)",
  "RAID6": "Uses dual parity to tolerate up to two simultaneous disk failures. (N-2 usable capacity, minimum 4 disks required)",
  "RAID10": "Combines mirroring and striping to provide high performance and fault tolerance. (50% usable capacity, minimum 4 disks required)"
};


export const QUALITY_MULTIPLIER = { "Very High": 1.2, "High": 1.0, "Standard": 0.8, "Basic": 0.5 };

export const PRESET_SCENES = [
  { id: "Shopping", name: "Shopping Mall", time: {resIndex :0, fps: 30, qual: "High", codec: "H.265", hours: 4 }, event: {resIndex :0, fps: 30, qual: "Very High", codec: "H.265", hours: 8} },
  { id: "Hotel/Casino", name: "Hetel/Casino", time: {resIndex :0, fps: 10, qual: "Very High", codec: "H.265", hours: 12 }, event: {resIndex :0, fps: 30, qual: "Very High", codec: "H.265", hours: 12 } } ,
  { id: "Residence", name: "Residence",time: {resIndex :1,  fps: 10, qual: "High", codec: "H.265", hours: 6 }, event: {resIndex :0,  fps: 30, qual: "Very High", codec: "H.265", hours: 12 } },
  { id: "Education", name: "Education",time: {resIndex :1,  fps: 10, qual: "High", codec: "H.265", hours: 6 }, event: {resIndex :0,  fps: 20, qual: "Very High", codec: "H.265", hours: 6 } }, 
  { id: "Retail", name: "Retail",time: {resIndex :0,  fps: 10, qual: "Standard", codec: "H.265", hours: 4 }, event: {resIndex :0,  fps: 30, qual: "Very High", codec: "H.265", hours: 4 } }, 
  { id: "Logistics", name: "Logistics",time: {resIndex :0,  fps: 10, qual: "Standard", codec: "H.265", hours: 10 }, event: {resIndex :0,  fps: 30, qual: "Very High", codec: "H.265", hours: 4 } } 
];
