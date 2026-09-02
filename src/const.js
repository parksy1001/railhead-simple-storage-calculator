export const RECORDER_LIST = {
  default: {
    CUSTOMER_NAME: "BRAND",
    BRAND: "IDIS",
    LOGO_TEXT: "IDIS Storage Calculator",

    NVR_MODELS: [
        { name: "DR-8564", supportDualTrack: false, recorderType :"NVR",  ch: 64, hdd: 8, evenHddOnly : true, raids: ["None", "RAID1", "RAID5", "RAID10"], maxMbps: 400   },
        { name: "DR-8532", supportDualTrack: true, recorderType :"NVR",  ch: 32, hdd: 8, evenHddOnly : true, raids: ["None", "RAID1", "RAID5", "RAID6", "RAID10"], maxMbps: 230 },
        { name: "DR-8516", supportDualTrack: true, recorderType :"NVR",  ch: 16, hdd: 8, evenHddOnly : true, raids: ["None", "RAID1", "RAID5", "RAID6", "RAID10"], maxMbps: 180 },
        { name: "DR-6532", supportDualTrack: true, recorderType :"NVR",  ch: 32, hdd: 6, evenHddOnly : false, raids: ["None", "RAID1"], maxMbps: 230 },
        { name: "DR-6516", supportDualTrack: true, recorderType :"NVR",  ch: 16, hdd: 6, evenHddOnly : false, raids: ["None", "RAID1"], maxMbps: 180 },
        { name: "DR-6508", supportDualTrack: true, recorderType :"NVR",  ch: 8, hdd: 6, evenHddOnly : false,  raids: ["None", "RAID1"], maxMbps: 140 },
        { name: "DR-3516", supportDualTrack: true, recorderType :"NVR",  ch: 16, hdd: 4, evenHddOnly : false,  raids: ["None"], maxMbps: 180 },
        { name: "DR-2516", supportDualTrack: true, recorderType :"NVR",  ch: 16, hdd: 2, evenHddOnly : false,  raids: ["None"], maxMbps: 180 },
        { name: "DR-2508", supportDualTrack: true, recorderType :"NVR",  ch: 8, hdd: 2, evenHddOnly : false,  raids: ["None"], maxMbps: 140 },
        { name: "DR-2504", supportDualTrack: true, recorderType :"NVR",  ch: 4, hdd: 2, evenHddOnly : false,  raids: ["None"], maxMbps: 70 },
        { name: "DR-1508", supportDualTrack: true, recorderType :"NVR",  ch: 8, hdd: 1, evenHddOnly : false,  raids: ["None"], maxMbps: 40 },
        { name: "DR-1504", supportDualTrack: true, recorderType :"NVR",  ch: 4, hdd: 1, evenHddOnly : false,  raids: ["None"], maxMbps: 20 },
        { name: "IR-310D", supportDualTrack: false, recorderType :"NVR",  ch: 64, hdd: 8, evenHddOnly : false,  raids: ["None", "RAID1", "RAID5", "RAID10"], maxMbps: 400   },

    ],
  },
};


export const CAMERA_TYPES = {
    "2MP (IP Camera)": [
    { label: "1920x1080", value: "1920x1080" },
    { label: "1280x720", value: "1280x720" },
    { label: "640x360", value: "640x360" },
    { label: "352x240", value: "352x240" },
  ],
  "4MP (IP Camera)": [
    { label: "2592x1456", value: "2592x1456" },
    { label: "1920x1080", value: "1920x1080" },
    { label: "1280x720", value: "1280x720" },
    { label: "640x360", value: "640x360" },
  ],
  "5MP (IP Camera)": [
    { label: "2592x1944", value: "2592x1944" },
    { label: "1920x1440", value: "1920x1440" },
    { label: "1280x960", value: "1280x960" },
    { label: "640x480", value: "640x480" },
  ],
  "6MP (IP Camera)": [
    { label: "3328x1872", value: "3328x1872" },
    { label: "1920x1080", value: "1920x1080" },
    { label: "1280x720", value: "1280x720" },
    { label: "640x360", value: "640x360" },
  ],
  "8MP (IP Camera)": [
    { label: "3840x2160", value: "3840x2160" },
    { label: "1920x1080", value: "1920x1080" },
    { label: "1280x720", value: "1280x720" },
    { label: "640x360", value: "640x360" },
  ],
  "5MP Fisheye_In (IP Camera)": [
    { label: "2560x2048", value: "2560x2048" },
    { label: "640x512", value: "640x512" },
  ],
  "5MP Fisheye_Out (IP Camera)": [
    { label: "2560x2048", value: "2560x2048" },
    { label: "2560x1024", value: "2560x1024" },
    { label: "1920x1536", value: "1920x1536" },
    { label: "1280x1024", value: "1280x1024" },
    { label: "640x512", value: "640x512" },
    { label: "640x256", value: "640x256" },
  ],
  "12MP Fisheye (IP Camera)": [
    { label: "2944x2944", value: "2944x2944" },
    { label: "2944x1472", value: "2944x1472" },
    { label: "2208x2208", value: "2208x2208" },
    { label: "1472x1472", value: "1472x1472" },
    { label: "768x768", value: "768x768" },
    { label: "736x736", value: "736x736" },
    { label: "768x384", value: "768x384" },
  ],
};

export const DUAL_ALLOWED_RESOLUTIONS = {
  "2MP (IP Camera)": ["640x360", "352x240"],
  "4MP (IP Camera)": ["640x360"],
  "5MP (IP Camera)": ["640x480"],
  "6MP (IP Camera)": ["640x360"],
  "8MP (IP Camera)": ["640x360"],
  "5MP Fisheye_In (IP Camera)": ["640x512"],
  "5MP Fisheye_Out (IP Camera)": ["640x512", "640x256"],
  "12MP Fisheye (IP Camera)": ["768x768", "736x736", "768x384"],
};

export const QUALITY_INDEX = { "Basic": 0, "Standard": 1, "High": 2, "Very High": 3 };

export const HDD_SIZE_OPTIONS = [  2, 4, 6, 8, 10, 12, 14, 18]; // TB

export const FPS_POOL = {
  NVR: [30, 15, 10, 5, 4, 3, 2, 1],
};

export const FPS_SCALE = { 1:10, 2:14, 3:17, 4:20, 5:22, 10:32, 15:39, 30:55, 60:60 };


export const RES_BIAS = {
  "3840x2160":0,"3328x1872":0,"2944x2944":0,"2944x1472":0,
  "2560x2048":0,"2560x1024":0,"2208x2208":0,"1920x1080":0,
  "1920x1536":0,"1472x1472":0,"1280x1024":2,"1280x720":2,
  "768x768":1,"768x384":2,"736x736":1,"640x512":8,
  "640x360":8,"640x256":9,"352x240":10
};

export const BITRATE_TABLE = {
  "3840x2160":[9216,12288,15360,18432],
  "3328x1872":[8192,10922,13654,16384],
  "2944x2944":[9472,12630,15788,18944],
  "2592x1944":[8192,10922,13654,16384],
  "2592x1456":[5980,9966,12458,14950],
  "2944x1472":[7832,10444,13056,15666],
  "2560x2048":[8192,10922,13654,16384],
  "2560x1024":[5530,9216,11520,13824],  
  "2208x2208":[8104,10806,13508,16208],
  "1920x1080":[4096,8192,10240,12288],
  "1920x1536":[5632,9386,11734,14080],
  "1472x1472":[4736,6315,7894,9472],
  "1280x1024":[2820,5642,7782,9728],
  "1280x720":[2048,4096,6144,8192],
  "768x768":[1422,2846,4268,5692],
  "768x384":[880,1760,2640,3520],
  "736x736":[1418,2836,4254,5672],
  "640x512":[972,1944,2918,3890],
  "640x360":[768,1536,2304,3072],
  "640x256":[496,992,1488,1984],
  "1920x1440":[5632,9386,11734,14080],
  "1280x960":[2820,5642,7782,9728],
  "640x480":[896,1792,2688,3584],
  "352x240":[256,512,768,1024]
};
export const RAID_MIN_DISKS = {
  None: 1,
  RAID1: 2,
  RAID5: 4,
  RAID6: 4,
  RAID10: 4
};