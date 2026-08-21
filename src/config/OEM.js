export const OEM_CONFIG = {
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
    DVR_MODELS: [
      { name : "TR-4616R", supportDualTrack: true, recorderType :"DVR",isHybrid : true, ch : 16, analogCh : 16, ipCh : 8, hdd: 4, raids: ["None", "RAID1"], maxMbps: 90},
      { name : "TR-4616", supportDualTrack: true, recorderType :"DVR",isHybrid : true, ch : 16, analogCh : 16, ipCh : 8, hdd: 4, raids: ["None"], maxMbps: 90},
      { name : "TR-2616", supportDualTrack: true, recorderType :"DVR", isHybrid : true, ch : 16, analogCh : 16, ipCh : 8, hdd: 2, raids: ["None"], maxMbps: 90},
      { name : "TR-2608", supportDualTrack: true, recorderType :"DVR", isHybrid : true, ch : 8, analogCh : 8, ipCh : 4, hdd: 2, raids: ["None"], maxMbps: 70},
      { name : "TR-2604", supportDualTrack: true, recorderType :"DVR", isHybrid : true, ch : 4, analogCh : 4, ipCh : 2, hdd: 2, raids: ["None"], maxMbps: 35},
      { name : "TR-4516R", supportDualTrack: true, recorderType :"DVR", ch : 16, hdd: 4, raids: ["None", "RAID1"], maxMbps: 70},
      { name : "TR-4516", supportDualTrack: true, recorderType :"DVR", ch : 16, hdd: 4, raids: ["None"], maxMbps: 70},
      { name : "TR-4508R", supportDualTrack: true, recorderType :"DVR", ch : 8, hdd: 4, raids: ["None", "RAID1"], maxMbps: 70},
      { name : "TR-4508", supportDualTrack: true, recorderType :"DVR", ch : 8, hdd: 4, raids: ["None"], maxMbps: 70},
      { name : "TR-2516", supportDualTrack: true, recorderType :"DVR", ch : 16, hdd: 2, raids: ["None"], maxMbps: 70, maxFps : 15},
      { name : "TR-2508", supportDualTrack: true, recorderType :"DVR", ch : 8, hdd: 2, raids: ["None"], maxMbps: 70},
      { name : "TR-2504", supportDualTrack: true, recorderType :"DVR", ch : 4, hdd: 2, raids: ["None"], maxMbps: 70},
      { name : "TR-1508", supportDualTrack: true, recorderType :"DVR", ch : 8, hdd: 1, raids: ["None"], maxMbps: 70},
      { name : "TR-1504", supportDualTrack: true, recorderType :"DVR", ch : 4, hdd: 1, raids: ["None"], maxMbps: 70},
     ]
  },

  OEM_1: {
    CUSTOMER_NAME: "JSS",
    BRAND: "Japan Security Systems",
    LOGO_TEXT: "JSS Storage Calculator",

    NVR_MODELS: [
        { name: "JS-RW5064",recorderType :"NVR",   ch: 64, hdd: 8, evenHddOnly : true, raids: ["None", "RAID1", "RAID5", "RAID10"], maxMbps: 400   },
        { name: "JS-RW5032(A)",recorderType :"NVR",   ch: 32, hdd: 6, evenHddOnly : false, raids: ["None", "RAID1"], maxMbps: 230 },
        { name: "JS-RW5016(A)", recorderType :"NVR",  ch: 16, hdd: 2, evenHddOnly : false,  raids: ["None"], maxMbps: 180 },
        { name: "JS-RW5008(A)",recorderType :"NVR",   ch: 8, hdd: 2, evenHddOnly : false,  raids: ["None"], maxMbps: 140 },
        { name: "JS-RW5004(A)", recorderType :"NVR",  ch: 4, hdd: 2, evenHddOnly : false,  raids: ["None"], maxMbps: 70 },
        { name: "PF-RW104", recorderType :"NVR",  ch: 4, hdd: 1, evenHddOnly : false,  raids: ["None"], maxMbps: 20 },
    ],
    DVR_MODELS: [
      { name : "TR-4516R", recorderType :"DVR", ch : 16, hdd: 4, raids: ["None", "RAID1"], maxMbps: 70},
      { name : "TR-4516", recorderType :"DVR", ch : 16, hdd: 4, raids: ["None"], maxMbps: 70},
      { name : "TR-4508R", recorderType :"DVR", ch : 8, hdd: 4, raids: ["None", "RAID1"], maxMbps: 70},
      { name : "TR-4508", recorderType :"DVR", ch : 8, hdd: 4, raids: ["None"], maxMbps: 70},
      { name : "TR-2516", recorderType :"DVR", ch : 16, hdd: 2, raids: ["None"], maxMbps: 70, maxFps : 15},
      { name : "TR-2508", recorderType :"DVR", ch : 8, hdd: 2, raids: ["None"], maxMbps: 70},
      { name : "TR-2504", recorderType :"DVR", ch : 4, hdd: 2, raids: ["None"], maxMbps: 70},
      { name : "TR-1508", recorderType :"DVR", ch : 8, hdd: 1, raids: ["None"], maxMbps: 70},
      { name : "TR-1504", recorderType :"DVR", ch : 4, hdd: 1, raids: ["None"], maxMbps: 70},
     ]
  },

  OEM_2: {
    CUSTOMER_NAME: "DDW",
    BRAND: "Dodwell",
    LOGO_TEXT: "DDW Storage Calculator",

    NVR_MODELS: [
        { name: "PDR-8564D", recorderType :"NVR",  ch: 64, hdd: 8, evenHddOnly : true, raids: ["None", "RAID1", "RAID5", "RAID10"], maxMbps: 400   },
        { name: "PDR-8532D", recorderType :"NVR",  ch: 32, hdd: 8, evenHddOnly : true, raids: ["None", "RAID1", "RAID5", "RAID6", "RAID10"], maxMbps: 230 },
        { name: "PDR-6532R(HP)", recorderType :"NVR",  ch: 32, hdd: 6, evenHddOnly : false, raids: ["None", "RAID1"], maxMbps: 230 },
        { name: "PDR-6516R(HP)",recorderType :"NVR",   ch: 16, hdd: 6, evenHddOnly : false, raids: ["None", "RAID1"], maxMbps: 180 },
        { name: "PDR-2508(HP)", recorderType :"NVR",  ch: 8, hdd: 2, evenHddOnly : false,  raids: ["None"], maxMbps: 140 },
        { name: "PDR-2504(HP)",recorderType :"NVR",   ch: 4, hdd: 2, evenHddOnly : false,  raids: ["None"], maxMbps: 70 },
    ],
  },

  OEM_3: {
    CUSTOMER_NAME: "Type 1",
    BRAND: "Blank",
    LOGO_TEXT: "Storage Calculator",

    NVR_MODELS: [
        { name: "NR-8564", recorderType :"NVR",  ch: 64, hdd: 8, evenHddOnly : true, raids: ["None", "RAID1", "RAID5", "RAID10"], maxMbps: 400   },
        { name: "NR-8532", recorderType :"NVR",  ch: 32, hdd: 8, evenHddOnly : true, raids: ["None", "RAID1", "RAID5", "RAID6", "RAID10"], maxMbps: 230 },
        { name: "NR-8516", recorderType :"NVR",  ch: 16, hdd: 8, evenHddOnly : true, raids: ["None", "RAID1", "RAID5", "RAID6", "RAID10"], maxMbps: 180 },
        { name: "NR-6532", recorderType :"NVR",  ch: 32, hdd: 6, evenHddOnly : false, raids: ["None", "RAID1"], maxMbps: 230 },
        { name: "NR-6516", recorderType :"NVR",  ch: 16, hdd: 6, evenHddOnly : false, raids: ["None", "RAID1"], maxMbps: 180 },
        { name: "NR-6508", recorderType :"NVR",  ch: 8, hdd: 6, evenHddOnly : false,  raids: ["None", "RAID1"], maxMbps: 140 },
        { name: "NR-3516", recorderType :"NVR",  ch: 16, hdd: 4, evenHddOnly : false,  raids: ["None"], maxMbps: 180 },
        { name: "NR-2516", recorderType :"NVR",  ch: 16, hdd: 2, evenHddOnly : false,  raids: ["None"], maxMbps: 180 },
        { name: "NR-2508", recorderType :"NVR",  ch: 8, hdd: 2, evenHddOnly : false,  raids: ["None"], maxMbps: 140 },
        { name: "NR-2504", recorderType :"NVR",  ch: 4, hdd: 2, evenHddOnly : false,  raids: ["None"], maxMbps: 70 },
        { name: "NR-1508", recorderType :"NVR",  ch: 8, hdd: 1, evenHddOnly : false,  raids: ["None"], maxMbps: 40 },
        { name: "NR-1504", recorderType :"NVR",  ch: 4, hdd: 1, evenHddOnly : false,  raids: ["None"], maxMbps: 20 },
    ],
  },
};
