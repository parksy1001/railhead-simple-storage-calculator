import React, { useState, useEffect, useMemo, useRef } from 'react';
import {OEM_CONFIG} from "./config/OEM";
import {calcDvrMbps} from "./calc/calcDvrMbps";
import {
  DVR_CAM_RES_INDEX,
  parseDvrOutResIdx,
  DVR_FPS_INDEX
} from "./calc/dvrMaps";


import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { 
  Server, 
  Camera, 
  HardDrive, 
  Trash2, 
  Plus, 
  Activity,
  Settings2,
  Clock,
  Zap,
  Database,
  Monitor,
  Layers,
  RotateCcw,
  Info,
  Edit2,
  Save,
  X,
  TrendingUp
} from 'lucide-react';
const QUALITY_INDEX = { "Basic": 0, "Standard": 1, "High": 2, "Very High": 3 };

const isAnalogType = (type) => type?.includes("(Analog Camera)");
const isIpType = (type) => type?.includes("(IP Camera)");
const HDD_SIZE_OPTIONS = [  2, 4, 6, 8, 10, 12, 14, 18]; // TB

const FPS_POOL = {
  NVR: [30, 15, 10, 5, 4, 3, 2, 1],
  DVR: [30,20, 15, 10,9,8,7,6,5,4,3,2,1] 
};

const getFpsOptions = (recorderType, recorderModel) => {
  const pool = FPS_POOL[recorderType] || [];
  const maxFps = recorderModel?.maxFps ?? Math.max(...pool);

  return pool.filter(fps => fps <= maxFps);
};

const FPS_SCALE = { 1:10, 2:14, 3:17, 4:20, 5:22, 10:32, 15:39, 30:55, 60:60 };
  const getGroupLabel = (group, index) => {
  return group.title?.trim() || "";
};

const OEM_KEY =
  process.env.REACT_APP_OEM ?? "default";
  if(!OEM_CONFIG[OEM_KEY]){
    console.warn(
      '[OEM] unknown OEM key "${OEM_KEY}", fallback to default'
    );
  }

const OEM =
  OEM_CONFIG[OEM_KEY] || OEM_CONFIG.default;


const SummaryRow = ({ label, icon, color, cfg, mbps, recorderType }) => (
  <div className="grid grid-cols-12 text-[9px] font-bold text-slate-500 py-0.5">
    <div className={`col-span-1 flex items-center gap-1 ${color}`}>
      {icon}
      <span>{label}</span>
    </div>
    <div className="col-span-2 text-center">{cfg.codec}</div>
    <div className="col-span-3">{cfg.outResLabel ?? cfg.outRes ?? cfg.res?.label ?? cfg.res ?? "-"}</div>
    <div className="col-span-1 text-center">{cfg.fps}</div>
    <div className="col-span-2 text-center">{cfg.qual}</div>
    <div className="col-span-1 text-center">{cfg.hours}H</div>
    <div className="col-span-2 text-right">{mbps.toFixed(1)} Mbps</div>
  </div>
);

const RES_BIAS = {
  "3840x2160":0,"3328x1872":0,"2944x2944":0,"2944x1472":0,
  "2560x2048":0,"2560x1024":0,"2208x2208":0,"1920x1080":0,
  "1920x1536":0,"1472x1472":0,"1280x1024":2,"1280x720":2,
  "768x768":1,"768x384":2,"736x736":1,"640x512":8,
  "640x360":8,"640x256":9,"352x240":10
};

const BITRATE_TABLE = {
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
const RAID_MIN_DISKS = {
  None: 1,
  RAID1: 2,
  RAID5: 4,
  RAID6: 4,
  RAID10: 4
};
const calcGroupMbps = (cfg, recorderType) => {
  // 1. 카메라 그룹 자체에 mode가 설정되어 있다면 그것을 우선 사용 (Hybrid 대응)
  // 2. 없다면 기존 방식대로 recorderType 사용
  const mode = cfg.mode || recorderType;

  if (mode === "DVR") {
      const outRes =
      cfg.outRes ??
      (typeof cfg.res === "object" ? cfg.res.value : undefined);

      cfg.outRes = outRes; 
      
      return calcDvrMbps({
        camResIdx: DVR_CAM_RES_INDEX[cfg.type],
        outRes,
        quality: cfg.qual,
        fps: cfg.fps,
        codec: cfg.codec,
        useIC: cfg.useIC
      });
  }

  // 기존 NVR 계산
  return calcBandwidthMbps({
    res: cfg.res,
    fps: cfg.fps,
    qual: cfg.qual,
    codec: cfg.codec,
    useIC: cfg.useIC
  });
};

const calcBandwidthMbps = ({ res, fps, qual, codec, useIC }) => {
  const resKey = res?.value;
  const baseList = BITRATE_TABLE[resKey];
  if (!baseList) return 0;

  const qIdx = QUALITY_INDEX[qual];
  const baseKbps = baseList[qIdx];

  const scale = FPS_SCALE[fps] ?? FPS_SCALE[30];
  const bias = RES_BIAS[resKey] ?? 0;

  let kbps = baseKbps * (scale + bias) / (FPS_SCALE[30] + bias);

  if (codec === "H.265") kbps /= 2;

  // ✅ Group별 Intelligent Codec
  if (useIC) {
    if (codec === "H.265") kbps *= 0.687;
    if (codec === "H.264") kbps *= 0.625;
  }
  return kbps / 1000; // Mbps
};
  
const calcGroupPeakMbps = (group, recorderType) => {
  const t = calcGroupMbps({
    ...group.time,
    type : group.type,
    useIC: group.useIC
  }, recorderType);
  const e = calcGroupMbps({
    ...group.event,
    type : group.type,
    useIC: group.useIC
  }, recorderType);
  const d = group.useDualTrackRecording
  ? calcGroupMbps({
      ...group.dual,
      type: group.type,
      useIC: group.useIC
    }, recorderType)
  : 0;

  return Math.max(t, e, d) * group.qty;
};


const NVR_MODELS = OEM.NVR_MODELS;
  
const CAMERA_TYPES = {
  NVR: {
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
},
  DVR : {
  "D1 (Analog Camera)": [
    {label:"Very High(720x480)",value : "Very High"},
    {label : "High(720x240)", value : "High"},
    {label : "Standard(360x240)", value : "Standard"}
  ],
  "960H (Analog Camera)": [
    {label:"Very High(960x480)", value : "Very High"},
    {label : "High(960x240)", value : "High"},
    {label : "Standard(480x240)", value : "Standard"}
  ],
  "1MP (Analog Camera)": [
    {label:"Very High(1280x720)", value : "Very High"},
    {label : "High(720x480)", value : "High"},
    {label : "Standard(360x240)", value : "Standard"}
  ],
  "2MP (Analog Camera)": [
    {label:"Very High(1920x1080)", value : "Very High"},
    {label : "High(1280x720)", value : "High"},
    {label : "Standard(640x360)", value : "Standard"}
  ],
  "3MP (Analog Camera)": [
    {label:"Very High(1920x1536)", value : "Very High"},
    {label : "High(1280x720)", value : "High"},
    {label : "Standard(720x480)", value : "Standard"}
  ],
  "4MP (Analog Camera)": [
    {label:"Very High(2560x1440)", value : "Very High"},
    {label : "High(1280x720)", value : "High"},
    {label : "Standard(640x360)", value : "Standard"}
  ],
  "5MP (Analog Camera)": [
    {label:"Very High(2560x1920)", value : "Very High"},
    {label : "High(1280x720)", value : "High"},
    {label : "Standard(640x360)", value : "Standard"}
  ],
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
},
};

const DUAL_ALLOWED_RESOLUTIONS = {
  "2MP (IP Camera)": ["640x360", "352x240"],
  "4MP (IP Camera)": ["640x360"],
  "5MP (IP Camera)": ["640x480"],
  "6MP (IP Camera)": ["640x360"],
  "8MP (IP Camera)": ["640x360"],
  "5MP Fisheye_In (IP Camera)": ["640x512"],
  "5MP Fisheye_Out (IP Camera)": ["640x512", "640x256"],
  "12MP Fisheye (IP Camera)": ["768x768", "736x736", "768x384"],
};

const DUAL_ALLOWED_ANALOG_RESOLUTIONS = {
  "D1 (Analog Camera)": ["Standard"],      // 360x240
  "960H (Analog Camera)": ["Standard"],    // 480x240
  "1MP (Analog Camera)": ["Standard"],     // 360x240
  "2MP (Analog Camera)": ["Standard"],     // 640x360
  "3MP (Analog Camera)": ["Standard"],     // 720x480
  "4MP (Analog Camera)": ["Standard"],     // 640x360
  "5MP (Analog Camera)": ["Standard"],     // 640x360
};

const isDualResolutionAllowed = (camType, resValue) => {
  if (isAnalogType(camType)) {
    const allowed = DUAL_ALLOWED_ANALOG_RESOLUTIONS[camType];
    if (!allowed) return true;

    return allowed.includes(resValue);
  }

  if (isIpType(camType)) {
    const allowed = DUAL_ALLOWED_RESOLUTIONS[camType];
    if (!allowed) return true;

    return allowed.includes(resValue);
  }

  return true;
};

const isDualQualityAllowed = (camType, quality) => {
  if (isAnalogType(camType)) {
    return ["Standard", "Basic"].includes(quality);
  }

  return true;
};

const getDefaultDualResolution = (recorderType, camType) => {
  const resList = CAMERA_TYPES[recorderType]?.[camType] || [];

  if (isAnalogType(camType)) {
    const allowed = DUAL_ALLOWED_ANALOG_RESOLUTIONS[camType] || [];
    return resList.find(r => allowed.includes(r.value)) || resList[0] || null;
  }

  if (isIpType(camType)) {
    const allowed = DUAL_ALLOWED_RESOLUTIONS[camType] || [];
    return resList.find(r => allowed.includes(r.value)) || resList[0] || null;
  }

  return resList[0] || null;
};

const RAID_INFO = {
  "None": "Uses all disk capacity independently. No data redundancy or protection is provided.",
  "RAID1": "Mirrors data across disks to create an exact copy for redundancy. (50% usable capacity)",
  "RAID5": "Distributes parity information across disks to tolerate a single disk failure. (N-1 usable capacity, minimum 4 disks required)",
  "RAID6": "Uses dual parity to tolerate up to two simultaneous disk failures. (N-2 usable capacity, minimum 4 disks required)",
  "RAID10": "Combines mirroring and striping to provide high performance and fault tolerance. (50% usable capacity, minimum 4 disks required)"
};

// const cameraTypeOptions = useMemo(() => {

//   if (!selectedRecorder) return [];

//   if (selectedRecorder.isHybrid) {
//     return [
//       ...Object.keys(CAMERA_TYPES.NVR),
//       ...Object.keys(CAMERA_TYPES.DVR)
//     ];
//   }

//   return Object.keys(CAMERA_TYPES[recorderType] || {});

// }, [recorderType, selectedRecorder]);

const QUALITY_MULTIPLIER = { "Very High": 1.2, "High": 1.0, "Standard": 0.8, "Basic": 0.5 };

const PRESET_SCENES = [
  { id: "Shopping", name: "Shopping Mall", time: {resIndex :0, fps: 30, qual: "High", codec: "H.265", hours: 4 }, event: {resIndex :0, fps: 30, qual: "Very High", codec: "H.265", hours: 8} },
  { id: "Hotel/Casino", name: "Hetel/Casino", time: {resIndex :0, fps: 10, qual: "Very High", codec: "H.265", hours: 12 }, event: {resIndex :0, fps: 30, qual: "Very High", codec: "H.265", hours: 12 } } ,
  { id: "Residence", name: "Residence",time: {resIndex :1,  fps: 10, qual: "High", codec: "H.265", hours: 6 }, event: {resIndex :0,  fps: 30, qual: "Very High", codec: "H.265", hours: 12 } },
  { id: "Education", name: "Education",time: {resIndex :1,  fps: 10, qual: "High", codec: "H.265", hours: 6 }, event: {resIndex :0,  fps: 20, qual: "Very High", codec: "H.265", hours: 6 } }, 
  { id: "Retail", name: "Retail",time: {resIndex :0,  fps: 10, qual: "Standard", codec: "H.265", hours: 4 }, event: {resIndex :0,  fps: 30, qual: "Very High", codec: "H.265", hours: 4 } }, 
  { id: "Logistics", name: "Logistics",time: {resIndex :0,  fps: 10, qual: "Standard", codec: "H.265", hours: 10 }, event: {resIndex :0,  fps: 30, qual: "Very High", codec: "H.265", hours: 4 } } 
];

const getHddQtyOptions = (nvr) => {
  const max = nvr.hdd;

  if (nvr.evenHddOnly) {
    return Array.from(
      { length: Math.floor(max / 2) },
      (_, i) => (i + 1) * 2
    );
  }

  return Array.from({ length: max }, (_, i) => i + 1);
};

const getResPixels = (resStr) => {
  const match = resStr.match(/(\d+)x(\d+)/);
  if (!match) return 2073600;
  return parseInt(match[1]) * parseInt(match[2]);
};

export default function App() {
// Recorder Type
const [recorderType, setRecorderType] = useState("NVR"); // "NVR" | "DVR"

const recorderModels = useMemo(() => {
  if (recorderType === "NVR") return OEM.NVR_MODELS;
  if (recorderType === "DVR") return OEM.DVR_MODELS || [];
  return [];
}, [recorderType]);


const [selectedRecorder, setSelectedRecorder] = useState(null);
// [추가] Hybrid 모드 판단 및 입력 소스 선택 State
const isHybridModel = recorderType === 'DVR' && selectedRecorder?.isHybrid;
const [hybridInputType, setHybridInputType] = useState('DVR');
useEffect(() => {
  setHybridInputType('DVR');
}, [selectedRecorder, recorderType]);

// [핵심] 현재 UI가 바라봐야 할 모드 (Hybrid면 선택값, 아니면 장비값)
const currentInputMode = isHybridModel ? hybridInputType : recorderType;

const [camType, setCamType] = useState("");
const [camQty, setCamQty] = useState(1);

const getCalcMode = (cameraType) => {
  const isIpCamera = cameraType?.includes("(IP Camera)");
  const isAnalogCamera = cameraType?.includes("(Analog Camera)");

  if (recorderType === "NVR") {
    return isIpCamera ? "NVR" : null;
  }

  if (recorderType === "DVR") {
    if (selectedRecorder?.isHybrid) {
      if (isIpCamera) return "NVR";
      if (isAnalogCamera) return "DVR";
      return null;
    }

    return isAnalogCamera ? "DVR" : null;
  }

  return null;
};

const calcMbps = (cfg, ic) => {
  const calcMode = getCalcMode(camType);
  if (!calcMode) return 0;

  return calcGroupMbps({
    ...cfg,
    type: camType,
    useIC: ic
  }, calcMode);
};


const getResolutionText = (cfg) => {
  if (cfg.outResLabel) return cfg.outResLabel;
  if (cfg.res?.label) return cfg.res.label;
  if (cfg.outRes) return cfg.outRes;
  return "-";
};


const exportToPDF = () => {
  const doc = new jsPDF("p", "mm", "a4");

  let y = 15;

  /* =====================
     TITLE
  ====================== */
  doc.setFontSize(16);
  doc.text("Storage Calculator Result", 105, y, { align: "center" });
  y += 8;

  doc.setFontSize(10);
  doc.text(`Recorder Model : ${selectedRecorder.name||"-"}`, 14, y);
  doc.text(`Generated : ${new Date().toLocaleDateString()}`, 150, y);
  y += 6;

  /* =====================
     NVR SUMMARY
  ====================== */
  doc.setFontSize(12);
  doc.text("Recorder Summary", 14, y);
  y += 3;

  autoTable(doc,{
    startY: y,
    head: [["Item", "Value"]],
    body: [
      ["Recorder Model", selectedRecorder.name||"-"],
      ["Channels Used", `${totals.totalCh} / ${selectedRecorder.ch}`],
      [
        "Total Throughput (Mbps)",
        `${totals.maxThroughputMbps.toFixed(0)} / ${selectedRecorder.maxMbps}`,
      ],
      ["HDD", `${hddQty} EA × ${hddSize} TB`],
      ["RAID Mode", raidOption],
      ["Usable Storage (TB)", totals.usableTB.toFixed(1)],
      ["Estimated Retention (Days)", totals.estimatedDays.toFixed(0)],
    ],
    theme: "grid",
    styles: { fontSize: 9 },
     columnStyles: {
    0: { cellWidth: 60 },
    1: { cellWidth: 40 },},
    headStyles: {
    fillColor: [225, 235, 255],
    textColor: [30, 64, 175],
    fontStyle: "bold"
  },
  });

  y = doc.lastAutoTable.finalY + 8;

  /* =====================
     CAMERA GROUPS
  ====================== */
  doc.setFontSize(12);
  doc.text("Camera Groups", 14, y);
  y += 3;

  const tableBody = [];

  let grandQty = 0;
  let grandHours = 0;
  let grandMbps = 0;
  let grandDaily = 0;

  cameras.forEach((c, idx) => {
    const calcMode = getCalcMode(c.type);
    
    const tMbps = calcMode? calcGroupMbps({ ...c.time, type: c.type, useIC: c.useIC }, calcMode) : 0;
    const eMbps = calcMode? calcGroupMbps({ ...c.event, type: c.type, useIC: c.useIC }, calcMode) : 0;
    const dMbps =calcMode && c.useDualTrackRecording && c.dual? calcGroupMbps({ ...c.dual, type: c.type, useIC: c.useIC }, calcMode): 0;
    const tDaily = (tMbps * 3600 * c.time.hours * c.qty) / 8 / 1024;
    const eDaily = (eMbps * 3600 * c.event.hours * c.qty) / 8 / 1024;
    const dDaily = (dMbps * 3600 * c.dual.hours * c.qty) / 8 / 1024;

    tableBody.push([
     getGroupLabel(c, idx),
      c.type,
      c.qty,
      c.sceneLabel,
      "Time",
      c.time.codec,
      getResolutionText(c.time),
      c.time.fps,
      c.time.qual,
      c.time.hours,
      tMbps.toFixed(1),
      tDaily.toFixed(1),
    ]);

    tableBody.push([
    getGroupLabel(c, idx),
      c.type,
      c.qty,
      c.sceneLabel,
      "Event",
      c.event.codec,
      getResolutionText(c.event),
      c.event.fps,
      c.event.qual,
      c.event.hours,
      eMbps.toFixed(1),
      eDaily.toFixed(1),
    ]);

    if (c.useDualTrackRecording && c.dual) {
  tableBody.push([
    getGroupLabel(c, idx),
    c.type,
    c.qty,
    c.sceneLabel,
    "Dual",
    c.dual.codec,
    getResolutionText(c.dual),
    c.dual.fps,
    c.dual.qual,
    c.dual.hours,
    dMbps.toFixed(1),
    dDaily.toFixed(1),
  ]);
}
    const groupHours = c.time.hours + c.event.hours + (c.useDualTrackRecording && c.dual ? c.dual.hours : 0);
    const groupMbps = tMbps + eMbps + dMbps;
    const groupDaily = tDaily + eDaily + dDaily;

    tableBody.push([
    getGroupLabel(c, idx),
      c.type,
      c.qty,
      c.sceneLabel,
      "SUM",
      "-",
      "-",
      "-",
      "-",
      groupHours,
      "-",
      groupDaily.toFixed(1),
    ]);

    grandQty += c.qty;
    grandHours += groupHours * c.qty;
    grandMbps += groupMbps * c.qty;
    grandDaily += groupDaily;
  });

  tableBody.push([
    "TOTAL",
    "-",
    grandQty,
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    grandDaily.toFixed(1),
  ]);

  autoTable(doc,{
    startY: y,
    head: [[
      "Group Title",
      "Camera",
      "Qty",
      "Scene",
      "Rec",
      "Codec",
      "Resolution",
      "FPS",
      "Qual",
      "Hours",
      "Mbps",
      "Daily GB",
    ]],
    body: tableBody,
    theme: "grid",
    styles: { fontSize: 8 },
    headStyles: {
    fillColor: [225, 235, 255],
    textColor: [30, 64, 175],  
    fontStyle: "bold"
  },
  });

  doc.save(`Storage Calculator_${selectedRecorder.name||"-"}_${new Date().toLocaleDateString()}.pdf`);
};

const exportToExcel = () => {
  const rows = [];

  /* =====================
     NVR SUMMARY
  ====================== */
  rows.push(["RECORDER SUMMARY"]);
  rows.push(["Item", "Value"]);
  rows.push(["NVR Model", selectedRecorder.name||"-"]);
  rows.push(["Channels Used", `${totals.totalCh} / ${selectedRecorder.ch}`]);
  rows.push([
    "Total Throughput (Mbps)",
    `${totals.maxThroughputMbps.toFixed(0)} / ${selectedRecorder.maxMbps}`,
  ]);
  rows.push(["HDD", `${hddQty} EA × ${hddSize} TB`]);
  rows.push(["RAID Mode", raidOption]);
  rows.push(["Usable Storage (TB)", totals.usableTB.toFixed(1)]);
  rows.push(["Estimated Retention (Days)", totals.estimatedDays.toFixed(0)]);
  rows.push([]);

  /* =====================
     CAMERA GROUPS
  ====================== */
  rows.push(["CAMERA GROUPS"]);
  rows.push([
    "Group Title",
    "Camera",
    "Qty",
    "Scene",
    "Rec",
    "Codec",
    "Resolution",
    "FPS",
    "Qual",
    "Hours",
    "Mbps",
    "Daily GB",
  ]);

  let grandQty = 0;
  let grandHours = 0;
  let grandMbps = 0;
  let grandDaily = 0;


  cameras.forEach((c, idx) => {
const calcMode = getCalcMode(c.type);

const tMbps = calcMode
  ? calcGroupMbps({
      ...c.time,
      type: c.type,
      useIC: c.useIC
    }, calcMode)
  : 0;

const eMbps = calcMode
  ? calcGroupMbps({
      ...c.event,
      type: c.type,
      useIC: c.useIC
    }, calcMode)
  : 0;

  const dMbps =calcMode && c.useDualTrackRecording && c.dual? calcGroupMbps({ ...c.dual, type: c.type, useIC: c.useIC }, calcMode): 0;

    const tDaily = (tMbps * 3600 * c.time.hours * c.qty) / 8 / 1024;
    const eDaily = (eMbps * 3600 * c.event.hours * c.qty) / 8 / 1024;
    const dDaily = (dMbps * 3600 * c.dual.hours * c.qty) / 8 / 1024;

    rows.push([
      getGroupLabel(c, idx),
      c.type,
      c.qty,
      c.sceneLabel,
      "Time",
      c.time.codec,
      getResolutionText(c.time),
      c.time.fps,
      c.time.qual,
      c.time.hours,
      tMbps.toFixed(1),
      tDaily.toFixed(1),
    ]);

    rows.push([
   getGroupLabel(c, idx),
      c.type,
      c.qty,
      c.sceneLabel,
      "Event",
      c.event.codec,
      getResolutionText(c.event),
      c.event.fps,
      c.event.qual,
      c.event.hours,
      eMbps.toFixed(1),
      eDaily.toFixed(1),
    ]);

    if (c.useDualTrackRecording) {
  rows.push([
    getGroupLabel(c, idx),
    c.type,
    c.qty,
    c.sceneLabel,
    "Dual",
    c.dual.codec,
    getResolutionText(c.dual),
    c.dual.fps,
    c.dual.qual,
    c.dual.hours,
    dMbps.toFixed(1),
    dDaily.toFixed(1),
  ]);
}

    // Group TOTAL
    const groupHours = c.time.hours + c.event.hours + (c.useDualTrackRecording && c.dual ? c.dual.hours : 0);
    const groupMbps = tMbps + eMbps + dMbps;
    const groupDaily = tDaily + eDaily + dDaily;

    rows.push([
   getGroupLabel(c, idx),
      c.type,
      c.qty,
      c.sceneLabel,
      "TOTAL",
      "-",
      "-",
      "-",
      "-",
      groupHours,
      "-",
      groupDaily.toFixed(1),
    ]);

    grandQty += c.qty;
    grandHours += groupHours * c.qty;
    grandMbps += groupMbps * c.qty;
    grandDaily += groupDaily;
  });

  // GRAND TOTAL
  rows.push([]);
  rows.push([
    "TOTAL",
    "-",
    grandQty,
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    grandDaily.toFixed(1),
  ]);

  /* =====================
     SHEET
  ====================== */
  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws["!cols"] = [
    { wch: 6 },
    { wch: 10 },
    { wch: 5 },
    { wch: 10 },
    { wch: 6 },
    { wch: 7 },
    { wch: 14 },
    { wch: 5 },
    { wch: 6 },
    { wch: 6 },
    { wch: 7 },
    { wch: 9 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "VA Simulation");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([buffer], { type: "application/octet-stream" }),
    `Storage Calculator_${selectedRecorder.name||"-"}_${new Date().toLocaleDateString()}.xlsx`
  );
};
useEffect(() => {
  if (recorderModels.length > 0) {
    setSelectedRecorder(recorderModels[0]);
  } else {
    setSelectedRecorder(null);
  }
}, [recorderModels]);

useEffect(() => {
  if (!camType) return;

  const resList = CAMERA_TYPES[recorderType]?.[camType];
  if (!resList || resList.length === 0) return;

  
setTimeConfig(prev => {
  if (recorderType === "DVR") {
    const list = resList;
    const found = list.find(r => r.value === prev.res?.value);
    return { ...prev, res: found || list[0] };
  }
  // NVR
  return { ...prev, res: resList.includes(prev.res) ? prev.res : resList[0] };
});

setEventConfig(prev => {
  if (recorderType === "DVR") {
    const list = resList;
    const found = list.find(r => r.value === prev.res?.value);
    return { ...prev, res: found || list[0] };
  }
  return { ...prev, res: resList.includes(prev.res) ? prev.res : resList[0] };
});

setDualConfig(prev => {
  const found = resList.find(r => r.value === prev.res?.value);

  if (
    found &&
    (!isIpType(camType) || isDualResolutionAllowed(camType, found.value))
  ) {
    return { ...prev, res: found };
  }

  return {
    ...prev,
    res: getDefaultDualResolution(recorderType, camType),
    qual: !isDualQualityAllowed(camType, prev.qual)? "Standard": prev.qual
  };
});

}, [recorderType, camType]);


  const [raidOption, setRaidOption] = useState("None");
  const [hddSize, setHddSize] = useState(4);
  const [hddQty, setHddQty] = useState(1);
  const [targetDays, setTargetDays] = useState(30);
  const [cameras, setCameras] = useState([]);
  const [groupTitle, setGroupTitle] = useState("Group 1");
  const [nextGroupNumber, setNextGroupNumber] = useState(2);
  const deployedGroupsRef = useRef(null);
  const shouldScrollToBottomRef = useRef(false);
  
  // Camera Group Settings (Add/Edit)
  const [editingId, setEditingId] = useState(null);
  const [formBackup, setFormBackup] = useState(null);
  
const normalizeRes = (r) =>
  typeof r === "string" ? { label: r, value: r } : r;

const getDefaultRes = () => {
  const types = CAMERA_TYPES[recorderType];
  if (!types) return null;
  const firstType = Object.keys(types)[0];
  const r = types[firstType]?.[0];
  return recorderType === "DVR" ? r : r; 
};

const [timeConfig, setTimeConfig] = useState({
  res: getDefaultRes(),
  fps: 15,
  qual: "Standard",
  codec: "H.265",
  hours: 22
});

const [eventConfig, setEventConfig] = useState({
  res: getDefaultRes(),
  fps: 30,
  qual: "High",
  codec: "H.265",
  hours: 2
});

const [dualConfig, setDualConfig] = useState({
  res: getDefaultDualResolution(recorderType, camType),
  fps: 15,
  qual: "Standard",
  codec: "H.265",
  hours: timeConfig.hours + eventConfig.hours
});
  const [activeSceneId, setActiveSceneId] = useState("");
  const [showRaidTooltip, setShowRaidTooltip] = useState(false);
  const [showStorageTooltip, setShowStorageTooltip] = useState(false);
  const [useIC, setUseIC] = useState(false); // ✅ Intelligent Codec (Group 단위)
  const [useDualTrackRecording, setUseDualTrackRecording] = useState(false);
  
  useEffect(() => {
  const options = getFpsOptions(recorderType, selectedRecorder);
  const maxAllowed = Math.max(...options);

  if (timeConfig.fps > maxAllowed) {
    setTimeConfig(prev => ({ ...prev, fps: maxAllowed }));
  }
  if (eventConfig.fps > maxAllowed) {
    setEventConfig(prev => ({ ...prev, fps: maxAllowed }));
  }
  if (dualConfig.fps > maxAllowed) {
    setDualConfig(prev => ({ ...prev, fps: maxAllowed }));
  }
}, [recorderType, selectedRecorder, timeConfig.fps, eventConfig.fps, dualConfig.fps]);
  
  useEffect(() => {
  if (recorderType !== "NVR") return;
  if(!selectedRecorder) return;

  // ① NVR 기준 HDD Qty 옵션 계산
  const options = getHddQtyOptions(selectedRecorder);

  // DR-8xxx → 기본값 2
  if (selectedRecorder.evenHddOnly) {
    if (!options.includes(hddQty)) {
      setHddQty(options.includes(2) ? 2 : options[0]);
      return; // hddQty 바뀌면 effect 재실행
    }
  } 
  // 그 외 모델
  else {
    if (!options.includes(hddQty)) {
      setHddQty(options[0]);
      return;
    }
  }

  // ② RAID 최소 디스크 수 검증
  if (raidOption !== "None" && hddQty < RAID_MIN_DISKS[raidOption]) {
    setRaidOption("None");
  }

}, [recorderType, selectedRecorder, hddQty, raidOption]);

useEffect(() => {
  const types = Object.keys(CAMERA_TYPES[recorderType] || {}).filter(type => {
    if (recorderType === "DVR" && !selectedRecorder?.isHybrid) {
      return !type.includes("(IP Camera)");
    }
    return true;
  });

  const defaultCamType = types[0] || "";
  const defaultRes = CAMERA_TYPES[recorderType]?.[defaultCamType]?.[0] || null;

  setGroupTitle("Group 1");
  setNextGroupNumber(2);

  setActiveSceneId("");
  setCamType(defaultCamType);
  setCamQty(1);

  setUseDualTrackRecording(false);
  setUseIC(false);

  setTimeConfig({
    res: defaultRes,
    fps: 15,
    qual: "Standard",
    codec: "H.265",
    hours: 22
  });

  setEventConfig({
    res: defaultRes,
    fps: 30,
    qual: "High",
    codec: "H.265",
    hours: 2
  });

  setDualConfig({
    res: getDefaultDualResolution(recorderType, defaultCamType),
    fps: 15,
    qual: "Standard",
    codec: "H.265",
    hours: 24
  });

  setEditingId(null);
  setFormBackup(null);
}, [recorderType, selectedRecorder]);

useEffect(() => {
  setDualConfig(prev => ({
    ...prev,
    hours: timeConfig.hours + eventConfig.hours
  }));
}, [timeConfig.hours, eventConfig.hours]);


const totals = useMemo(() => {
  let totalDailyGB = 0;
  let totalCh = 0;
  let maxThroughputMbps = 0;

  cameras.forEach(c => {
    totalCh += c.qty;
    const calcMode = getCalcMode(c.type);
    const tMbps = calcMode? calcGroupMbps({ ...c.time, type: c.type, useIC: c.useIC}, calcMode) : 0;
    const eMbps = calcMode ? calcGroupMbps({ ...c.event, type: c.type, useIC: c.useIC }, calcMode): 0;

    const timeDaily =
      (tMbps * 3600 * c.time.hours * c.qty) / 8 / 1024;
    const eventDaily =
      (eMbps * 3600 * c.event.hours * c.qty) / 8 / 1024;
    
    const dMbps = c.useDualTrackRecording
      ? calcGroupMbps({ ...c.dual, type: c.type, useIC: c.useIC }, calcMode): 0;

    const dualDaily = c.useDualTrackRecording
      ? (dMbps * 3600 * c.dual.hours * c.qty) / 8 / 1024 : 0;

    totalDailyGB += timeDaily + eventDaily + dualDaily;
    maxThroughputMbps += Math.max(tMbps, eMbps, dMbps) * c.qty;
  });

  const rawTotalTB = hddSize * hddQty;
  let effectiveTB = rawTotalTB;

  if (raidOption === "RAID1" && hddQty >= 2) effectiveTB = rawTotalTB / 2;
  if (raidOption === "RAID5" && hddQty >= 3) effectiveTB = rawTotalTB - hddSize;
  if (raidOption === "RAID6" && hddQty >= 4) effectiveTB = rawTotalTB - hddSize * 2;
  if (raidOption === "RAID10" && hddQty >= 4) effectiveTB = rawTotalTB / 2;

  const usableTB = effectiveTB;
  const estimatedDays =
    totalDailyGB > 0 ? (usableTB * 1024) / totalDailyGB : 0;

  return {
    totalDailyGB,
    totalCh,
    maxThroughputMbps,
    usableTB,
    estimatedDays
  };
}, [cameras, hddSize, hddQty, raidOption, recorderType, selectedRecorder]);


  const handleNvrChange = (e) => {
    const model = recorderModels.find(m => m.name === e.target.value);
    if (model) {
      setSelectedRecorder(model);
      setRaidOption("None");
      setHddQty(1);
      setCameras([]);
      setEditingId(null);
      setActiveSceneId("");
    }
  };

  const handlePresetChange = (e) => {
  const sceneId = e.target.value;
  setActiveSceneId(sceneId);
  if (!sceneId) return;

  const scene = PRESET_SCENES.find(s => s.id === sceneId);
  if (!scene) return;
  const resList = CAMERA_TYPES[recorderType][camType];
  const pickRes = (idx) =>
    resList[Math.min(idx, resList.length - 1)];

  setTimeConfig(tc => ({
    ...tc,
    res: pickRes(scene.time.resIndex),
    fps: scene.time.fps,
    qual: scene.time.qual,
    codec: scene.time.codec,
    hours: scene.time.hours
  }));

  setEventConfig(ec => ({
    ...ec,
    res: pickRes(scene.event.resIndex),
    fps: scene.event.fps,
    qual: scene.event.qual,
    codec: scene.event.codec,
    hours: scene.event.hours
  }));
};

const handleAddOrUpdateCamera = () => {
  // ① Channel limit 체크
  const capacityLimit = editingId 
    ? totals.totalCh - cameras.find(c => c.id === editingId).qty + camQty
    : totals.totalCh + camQty;
  
  if (capacityLimit > selectedRecorder.ch) {
    alert("Cannot add cameras because the NVR channel limit has been exceeded.");
    return;
  }
  
  const defaultGroupName = `Group ${cameras.length + 1}`;

  if (!groupTitle.trim()) {
    alert("Please enter a group title.");
    return;
  }

  const normalizedGroupTitle = groupTitle.trim().toLowerCase();

  const isDuplicateGroupTitle = cameras.some(c =>
    c.id !== editingId &&
    c.title?.trim().toLowerCase() === normalizedGroupTitle
  );

  if (isDuplicateGroupTitle) {
    alert("Group title already exists. Please enter a different group title.");
    return;
  }
  // ② 추가될 카메라 그룹 구성
  const newGroup = {
    id: editingId || Math.random().toString(36).substr(2, 9),
    title: groupTitle.trim(),
    type: camType,
    mode: getCalcMode(camType),
    qty: camQty,
    sceneId : activeSceneId,
    useIC,
    useDualTrackRecording,
    sceneLabel: PRESET_SCENES.find(s => s.id === activeSceneId)?.name || "User",
    time: getCalcMode(camType) === "DVR"
  ? {
      outRes: timeConfig.res?.value ?? timeConfig.outRes,
      outResLabel: timeConfig.res?.label ?? timeConfig.outRes,
      fps: timeConfig.fps,
      qual: timeConfig.qual,
      codec: timeConfig.codec,
      hours: timeConfig.hours
    }
  : {
      res: timeConfig.res,
      fps: timeConfig.fps,
      qual: timeConfig.qual,
      codec: timeConfig.codec,
      hours: timeConfig.hours
    },

    event: getCalcMode(camType) === "DVR"
  ? {
      outRes: eventConfig.res?.value ?? eventConfig.outRes,
      outResLabel: eventConfig.res?.label ?? eventConfig.outRes,
      fps: eventConfig.fps,
      qual: eventConfig.qual,
      codec: eventConfig.codec,
      hours: eventConfig.hours
    }
  : {
      res: eventConfig.res,
      fps: eventConfig.fps,
      qual: eventConfig.qual,
      codec: eventConfig.codec,
      hours: eventConfig.hours
    },
    
  dual: getCalcMode(camType) === "DVR"
  ? {
      outRes: dualConfig.res?.value ?? dualConfig.outRes,
      outResLabel: dualConfig.res?.label ?? dualConfig.outRes,
      fps: dualConfig.fps,
      qual: dualConfig.qual,
      codec: dualConfig.codec,
      hours: dualConfig.hours
    }
  : {
      res: dualConfig.res,
      fps: dualConfig.fps,
      qual: dualConfig.qual,
      codec: dualConfig.codec,
      hours: dualConfig.hours
    }
  };

  // ③ Bandwidth 계산
  const newGroupMbps = calcGroupPeakMbps(newGroup, recorderType);

  const currentMbps = editingId
    ? totals.maxThroughputMbps - calcGroupPeakMbps(
        cameras.find(c => c.id === editingId),
        recorderType
      )
    : totals.maxThroughputMbps;

  const expectedTotalMbps = currentMbps + newGroupMbps;

  // 🚫 Bandwidth HARD LIMIT
  if (expectedTotalMbps > selectedRecorder.maxMbps) {
    alert(
  `Cannot add camera group due to NVR bandwidth limitation.\n\n` +
  `Expected Throughput: ${expectedTotalMbps.toFixed(0)} Mbps\n` +
  `NVR Limit: ${selectedRecorder.maxMbps} Mbps`
);

    return;
  }

  // ④ 실제 추가
  if (editingId) {
    setCameras(cameras.map(c => c.id === editingId ? newGroup : c));
    setEditingId(null);
  } else {
    shouldScrollToBottomRef.current = true;
    setCameras([...cameras, newGroup]);
    setGroupTitle(`Group ${nextGroupNumber}`);
    setNextGroupNumber(prev => prev + 1);
  }

  resetInputForm();
};

  useEffect(() => {
    if (shouldScrollToBottomRef.current && deployedGroupsRef.current) {
      deployedGroupsRef.current.scrollTop = deployedGroupsRef.current.scrollHeight;
      shouldScrollToBottomRef.current = false;
    }
  }, [cameras]);

  const handleEdit = (camera) => {
    setFormBackup({
      groupTitle,
      camType,
      camQty,
      timeConfig,
      eventConfig,
      dualConfig,
      useIC,
      useDualTrackRecording,
      activeSceneId,
    });
    setEditingId(camera.id);
    setGroupTitle(camera.title || "");
    setCamType(camera.type);
    setCamQty(camera.qty);
    setUseIC(camera.useIC ?? false); // ✅ 추가
    setUseDualTrackRecording(camera.useDualTrackRecording ?? false);
setDualConfig(camera.dual ?? {
  res: getDefaultRes(),
  fps: 15,
  qual: "Standard",
  codec: "H.265",
  hours: 24
});
    setTimeConfig({ ...camera.time });
    setEventConfig({ ...camera.event });
    setActiveSceneId(camera.sceneId||"");
  };

  const getDefaultCameraType = () => {
  const types = Object.keys(CAMERA_TYPES[recorderType] || {}).filter(type => {
    if (recorderType === "DVR" && !selectedRecorder?.isHybrid) {
      return !type.includes("(IP Camera)");
    }
    return true;
  });

  return types[0] || "";
};

const getDefaultConfigsByType = (type) => {
  const defaultRes = CAMERA_TYPES[recorderType]?.[type]?.[0] || getDefaultRes();

  return {
    time: {
      res: defaultRes,
      fps: 15,
      qual: "Standard",
      codec: "H.265",
      hours: 22
    },
    event: {
      res: defaultRes,
      fps: 30,
      qual: "High",
      codec: "H.265",
      hours: 2
    },
    dual: {
      res: defaultRes,
      fps: 15,
      qual: "Standard",
      codec: "H.265",
      hours: 24
    }
  };
};


  const resetInputForm = () => {
    if (formBackup) {
      setGroupTitle(formBackup.groupTitle);
      setCamType(formBackup.camType);
      setCamQty(formBackup.camQty);
      setTimeConfig(formBackup.timeConfig);
      setEventConfig(formBackup.eventConfig);
      setDualConfig(formBackup.dualConfig);
      setUseIC(formBackup.useIC);
      setUseDualTrackRecording(formBackup.useDualTrackRecording ?? false);
      setActiveSceneId(formBackup.activeSceneId);
    } else{
      setGroupTitle(`Group ${nextGroupNumber}`);
    }
    setEditingId(null);
    setFormBackup(null);
  
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to reset all settings?")) {
      setCameras([]);
      setHddQty(1);
      setRaidOption("None");
      setActiveSceneId("");
    }
  };

  if (!selectedRecorder) {
  return (
    <div className="min-h-screen flex items-center justify-center text-slate-400">
      Initializing recorder configuration...
    </div>
  );
}

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20 font-sans text-slate-900">
      {/* {editingId && (<div className="fixed inset-0 bg-slate-900/40 z-[55]" />)} */}
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg text-white">
              <Server size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black text-blue-600 uppercase leading-none mb-1">Active Recorder</p>
              <h1 className="text-sm font-black text-slate-800 leading-none">{selectedRecorder.name||"-"}</h1>
            </div>
          </div>

          <div className="hidden md:flex flex-1 justify-center gap-12">
            <div className="text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Channels</span>
              <span className={`text-sm font-black ${totals.totalCh > selectedRecorder.ch ? 'text-rose-500' : 'text-slate-700'}`}>
                {totals.totalCh} <span className="text-[10px] opacity-30">/ {selectedRecorder.ch}</span>
              </span>
            </div>
            <div className="text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Available Storage</span>
              <span className="text-sm font-black text-emerald-600">{totals.usableTB.toFixed(1)} <span className="text-[9px]">TB</span></span>
            </div>
            <div className="text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Throughput</span>
              <span className={`text-sm font-black ${totals.maxThroughputMbps > selectedRecorder.maxMbps ? 'text-rose-500' : 'text-blue-600'}`}>
                {totals.maxThroughputMbps.toFixed(0)} <span className="text-[10px] opacity-30">/ {selectedRecorder.maxMbps} Mbps</span>
              </span>
            </div>
          </div>
         <button
  onClick={exportToExcel}
  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg"
>
  Export Excel
</button>
<button
  onClick={exportToPDF}
  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-lg"
>
  Export PDF
</button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 bg-slate-900 text-white px-4 py-1.5 rounded-lg shadow-md">
                <div className="text-center">
         
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Est. Retention</p>
                    <p className={`text-sm font-black ${totals.estimatedDays < targetDays ? 'text-rose-400' : 'text-blue-400'}`}>
                    {totals.estimatedDays.toFixed(0)} <span className="text-[9px] font-normal text-white">Days</span>
                    </p>
                </div>
                <div className="w-px h-6 bg-slate-700"></div>
                <div className="text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Target</p>
                    <p className="text-sm font-black">{targetDays} <span className="text-[9px] font-normal opacity-50">Days</span></p>
                </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: System Config */}
        <div className="lg:col-span-3 space-y-6">
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Settings2 size={14} /> System Setup
                </h2>
                <button onClick={handleClearAll} className="text-slate-300 hover:text-slate-600 transition-colors">
                    <RotateCcw size={14} />
                </button>
            </div>
            {/* Recorder Type */}
<div>
  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">
    Recorder Type
  </label>

  <div className="grid grid-cols-2 gap-2">
    {["NVR", "DVR"].map(type => (
      <button
        key={type}
        onClick={() => {
          setRecorderType(type)
          setCameras([]);
          setEditingId(null);
          setActiveSceneId("");
        }}
        className={`
          py-2 rounded-lg text-xs font-black tracking-widest
          transition-all border
          ${
            recorderType === type
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
          }
        `}
      >
        {type}
      </button>
    ))}
  </div>
</div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Recorder Model</label>
                <select 
                    className="w-full bg-blue-50/50 border border-blue-100 rounded-lg p-2 text-xs font-bold text-blue-700 outline-none" 
                    value={selectedRecorder.name||"-"} 
                    onChange={handleNvrChange}
                >
                  {recorderModels.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">HDD Qty (EA)</label>
                  
                    <select
  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
  value={hddQty}
  onChange={e => setHddQty(Number(e.target.value))}
>
{selectedRecorder &&
  getHddQtyOptions(selectedRecorder).map(qty => (
    <option key={qty} value={qty}>{qty}</option>
))}

</select>
                    
                  
                </div>
<div className="relative">
  <div className="flex items-center gap-1 mb-1">
    <label className="text-[9px] font-black text-slate-400 uppercase">
      Size (TB)
    </label>

    <button
      type="button"
      onMouseEnter={() => setShowStorageTooltip(true)}
      onMouseLeave={() => setShowStorageTooltip(false)}
      className="text-red-600"
    >
      <Info size={10} />
    </button>
  </div>

{showStorageTooltip && (
  <div className="absolute bottom-full left-0 mb-2 w-72 z-50 bg-slate-800 text-white text-[10px] font-bold p-3 rounded-lg shadow-xl leading-relaxed">

    <div className="text-blue-400 font-black text-[11px] mb-2">
      Size Info
    </div>

    <div className="font-normal text-white text-[10px] leading-relaxed">
      Supported storage drive sizes vary depending on the NVR model.
      Please refer to the Product Compatibility section in the Partner Portal
      to select a compatible drive size.
    </div>

  </div>
)}

  <select
    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
    value={hddSize}
    onChange={e => setHddSize(Number(e.target.value))}
  >
                  {HDD_SIZE_OPTIONS.map(size => (
                    <option key={size} value={size}>
                    {size} TB
                  </option>
                    ))}
                  </select>

                </div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase">RAID Mode</label>
                  <button 
                    onMouseEnter={() => setShowRaidTooltip(true)} 
                    onMouseLeave={() => setShowRaidTooltip(false)}
                    className="text-red-600"
                  >
                    <Info size={10} />
                  </button>
                </div>
                {showRaidTooltip && (
                  <div className="absolute bottom-full left-0 mb-2 w-full z-10 bg-slate-800 text-white text-[10px] p-3 rounded-lg shadow-xl leading-relaxed">
                    <p className="font-bold text-blue-300 mb-1">{raidOption} Info</p>
                    {RAID_INFO[raidOption]}
                  </div>
                )}
    <select
  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
  value={raidOption}
  onChange={e => setRaidOption(e.target.value)}
>
  {selectedRecorder.raids.map(r => (
    <option
      key={r}
      value={r}
      disabled={hddQty < RAID_MIN_DISKS[r]}
    >
      {r}
    </option>
  ))}
</select>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Target Retention</label>
                  <span className="text-[10px] font-black text-blue-600">{targetDays} Days</span>
                </div>
                <input type="range" min="1" max="120" value={targetDays} onChange={e => setTargetDays(Number(e.target.value))} className="w-full h-1 bg-slate-100 rounded-lg appearance-none accent-blue-600 cursor-pointer" />
              </div>
            </div>
          </section>

          {/* Metrics Visualized */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg space-y-6">
             <div>
               <div className="flex items-center justify-between mb-2">
                 <span className="text-[9px] font-black uppercase text-slate-500">Storage Usage (Est.)</span>
                 <Database size={14} className="text-blue-500" />
               </div>
               <div className="flex justify-between items-end mb-2">
                  <p className="text-xl font-black">{(totals.totalDailyGB * targetDays / 1024).toFixed(1)} <span className="text-xs font-normal opacity-40">TB Required</span></p>
                  <p className="text-[10px] font-bold text-slate-400">Target {targetDays}D</p>
               </div>
               <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${totals.estimatedDays < targetDays ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                    style={{width: `${Math.min(100, (totals.totalDailyGB * targetDays / 1024) / totals.usableTB * 100)}%`}}
                  ></div>
               </div>
             </div>

             <div>
               <div className="flex items-center justify-between mb-2">
                 <span className="text-[9px] font-black uppercase text-slate-500">Bandwidth Load</span>
                 <TrendingUp size={14} className="text-amber-500" />
               </div>
               <div className="flex justify-between items-end mb-2">
                  <p className="text-xl font-black">{totals.maxThroughputMbps.toFixed(0)} <span className="text-xs font-normal opacity-40">Mbps</span></p>
                  <p className="text-[10px] font-bold text-slate-400">{(totals.maxThroughputMbps / selectedRecorder.maxMbps * 100).toFixed(0)}%</p>
               </div>
               <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${totals.maxThroughputMbps > selectedRecorder.maxMbps ? 'bg-rose-500' : 'bg-amber-500'}`} 
                    style={{width: `${Math.min(100, totals.maxThroughputMbps / selectedRecorder.maxMbps * 100)}%`}}
                  ></div>
               </div>
             </div>
          </div>
        </div>

        {/* Right: Camera Management */}
        <div className="lg:col-span-9 space-y-6">
        {/*
          <section
            className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 relative ${
              editingId? 'z-[60] border-blue-400 ring-2 ring-blue-500/10': 'border-slate-200'
              }`}
          >
          */}
        <section className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 ${editingId ? 'border-blue-400 ring-2 ring-blue-500/10' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
<div className="flex items-center gap-3">
  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
    editingId ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
  }`}>
    {editingId ? <Edit2 size={16} /> : <Camera size={18} />}
  </div>

  <h2 className="gap-1 text-sm font-black text-slate-800">
    {editingId ? 'Edit Camera Group' : 'Add Camera Group'}
  </h2>

  {/* Group Title Input */}
  <div className="ml-3 flex items-center gap-1 border-l border-slate-100 pl-3">
    <span className="text-[9px] font-black text-slate-400 uppercase whitespace-nowrap">
      Group Title
    </span>
    <input
      type="text"
      placeholder="Enter group title"
      value={groupTitle}
      onChange={e => setGroupTitle(e.target.value)}
      className="
        w-36
        bg-slate-100
        border border-slate-200
        rounded-md
        px-2 py-1
        text-[10px]
        font-bold
        text-slate-500
        outline-none
        focus:ring-1 focus:ring-blue-500
      "
    />
  </div>

  {/* Scene Preset (기존) */}
  <div className="ml-2 flex items-center gap-1 border-l border-slate-200 pl-2">
    <span className="text-[9px] font-black text-slate-400 uppercase whitespace-nowrap">
      Scene Preset
    </span>
    <select
      className="bg-slate-100 border-none rounded-md px-2 py-1 text-[10px] font-black text-slate-600 outline-none cursor-pointer"
      value={activeSceneId}
      onChange={handlePresetChange}
    >
      <option value="">Custom Setup</option>
      {PRESET_SCENES.map(s => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  </div>
</div>

              
              <div className="ml-4 flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Camera</span>
                  <select className="bg-transparent text-xs font-bold outline-none w-[100px] truncate" value={camType} 
                  onChange={e => {
  const nextCamType = e.target.value;

  setCamType(nextCamType);
  setActiveSceneId("");

  setDualConfig(prev => ({
    ...prev,
    res: getDefaultDualResolution(recorderType, nextCamType),
    qual: isAnalogType(nextCamType) && !isDualQualityAllowed(nextCamType, prev.qual)? "Standard" : prev.qual
  }));
}}
                  >
                    {Object.keys(CAMERA_TYPES[recorderType] || {}).filter(type => {
                      if (recorderType === "DVR" && !selectedRecorder?.isHybrid) {
                        return !type.includes("(IP Camera)");
                      }
                      return true;
                    }).map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                    ))}
                  </select>
                </div>
                <div className="w-px h-4 bg-slate-200"></div>
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Qty</span>
                  <input type="number" min="1" className="w-10 bg-transparent text-xs font-bold text-center outline-none" value={camQty} onChange={e => setCamQty(Number(e.target.value))} />
                </div>
              </div>
            </div>
{/* Intelligent Codec Option */}
<div className="flex justify-end gap-6 px-4 py-1 mb-1">
  {selectedRecorder?.supportDualTrack === true && (
  <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
    <input
      type="checkbox"
      checked={useDualTrackRecording}
      onChange={e => {
  const checked = e.target.checked;
  setUseDualTrackRecording(checked);

  if (checked) {
    setDualConfig(prev => ({
      ...prev,
      res: getDefaultDualResolution(recorderType, camType),
      qual: isAnalogType(camType) && !isDualQualityAllowed(camType, prev.qual) ? "Standard" : prev.qual
    }));
  }
}}
      className="accent-purple-600"
    />
    <span className="text-[10px] font-black text-slate-600 uppercase">
      Use Dual Track Recording
    </span>
  </label>
  )}

  <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
    <input
      type="checkbox"
      checked={useIC}
      onChange={e => setUseIC(e.target.checked)}
      className="accent-emerald-600"
    />
    <span className="text-[10px] font-black text-slate-600 uppercase">
      Use Intelligent Codec
    </span>
  </label>
</div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden mb-4">
              <div className="grid grid-cols-12 bg-white border-b border-slate-200 py-2 px-4">
                <div className="col-span-2 text-[9px] font-black text-slate-400 ">Recording</div>
                <div className="col-span-2 text-[9px] font-black text-slate-400 text-center">Codec</div>
                <div className="col-span-3 text-[9px] font-black text-slate-400 text-center">Resolution</div>
                <div className="col-span-1 text-[9px] font-black text-slate-400 text-center">FPS</div>
                <div className="col-span-2 text-[9px] font-black text-slate-400 text-center">Quality</div>
                <div className="col-span-1 text-[9px] font-black text-slate-400 text-center">Hours</div>
                <div className="col-span-1 text-[9px] font-black text-slate-400 text-right">Mbps</div>
              </div>
              
              <div className="grid grid-cols-12 items-center py-3 px-4 bg-white/50">
                <div className="col-span-2 flex items-center gap-2">
                  <Clock size={14} className="text-blue-500" />
                  <span className="text-xs font-black text-blue-600 uppercase">Time</span>
                </div>
                <div className="col-span-2 px-2">
                  <select className="w-full bg-white border border-slate-200 rounded-md py-1 px-1.5 text-[11px] font-bold text-center" value={timeConfig.codec} onChange={e => setTimeConfig({...timeConfig, codec: e.target.value})}>
                    <option>H.265</option><option>H.264</option>
                  </select>
                </div>
                <div className="col-span-3 px-2">
                  <select className="w-full bg-white border border-slate-200 rounded-md py-1 px-1.5 text-[11px] font-bold text-center" value={timeConfig.res?.value} onChange={e => { const selected = CAMERA_TYPES[recorderType][camType].find(r => r.value === e.target.value);
                   setTimeConfig({ ...timeConfig, res: selected });
  }}
>
  {CAMERA_TYPES[recorderType]?.[camType]
    ?.map(r => (
      <option key={r.value} value={r.value}>
        {r.label}
      </option>
    ))}
</select>
                </div>
                <div className="col-span-1 px-2">
                  <select
  className="w-full bg-white border border-slate-200 rounded-md py-1 px-1.5 text-[11px] font-bold text-center"
  value={timeConfig.fps}
  onChange={e => setTimeConfig({ ...timeConfig, fps: Number(e.target.value) })}
>
  {getFpsOptions(recorderType, selectedRecorder).map(fps => (
    <option key={fps} value={fps}>{fps}</option>
  ))}
</select>
                </div>
                <div className="col-span-2 px-2">
                  <select className="w-full bg-white border border-slate-200 rounded-md py-1 px-1.5 text-[11px] font-bold text-center" value={timeConfig.qual} onChange={e => setTimeConfig({...timeConfig, qual: e.target.value})}>
                    {Object.keys(QUALITY_MULTIPLIER).map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
                <div className="col-span-1 px-2">
                  <input type="number"
  min={0}
  max={24 - eventConfig.hours}
  value={timeConfig.hours}
  onChange={e => {
    const v = Number(e.target.value);
    setTimeConfig({
      ...timeConfig,
      hours: Math.min(v, 24 - eventConfig.hours)
    });
  }}
    className="
    w-full
    bg-white
    border border-slate-200
    rounded-md
    h-[28px]
    px-1.5
    text-[11px]
    font-bold
    text-center
    leading-none
    focus:outline-none
    focus:ring-1 focus:ring-blue-500
  "

/>

                </div>
                <div className="col-span-1 text-right">
                  <span className="text-[10px] font-black text-slate-600 text-center">{calcMbps(timeConfig, useIC).toFixed(1)}</span>
                </div>
              </div>

              <div className="h-px bg-slate-200 mx-4"></div>

              <div className="grid grid-cols-12 items-center py-3 px-4 bg-white/50">
                <div className="col-span-2 flex items-center gap-2">
                  <Zap size={14} className="text-amber-500" />
                  <span className="text-xs font-black text-amber-600 uppercase">Event</span>
                </div>
                <div className="col-span-2 px-2">
                  <select className="w-full bg-white border border-slate-200 rounded-md py-1 px-1.5 text-[11px] font-bold text-center" value={eventConfig.codec} onChange={e => setEventConfig({...eventConfig, codec: e.target.value})}>
                    <option>H.265</option><option>H.264</option>
                  </select>
                </div>
                <div className="col-span-3 px-2">
                  <select className="w-full bg-white border border-slate-200 rounded-md py-1 px-1.5 text-[11px] font-bold text-center" value={eventConfig.res?.value} onChange={e => { const selected = CAMERA_TYPES[recorderType][camType].find(r => r.value === e.target.value);
    setEventConfig({ ...eventConfig, res: selected });
  }}
>
  {CAMERA_TYPES[recorderType]?.[camType]
    ?.map(r => (
      <option key={r.value} value={r.value}>
        {r.label}
      </option>
    ))}
</select>
                </div>
                <div className="col-span-1 px-2">
                  <select
  className="w-full bg-white border border-slate-200 rounded-md py-1 px-1.5 text-[11px] font-bold text-center text-center"
  value={eventConfig.fps}
  onChange={e => setEventConfig({ ...eventConfig, fps: Number(e.target.value) })}
>
  {getFpsOptions(recorderType, selectedRecorder).map(fps => (
    <option key={fps} value={fps}>{fps}</option>
  ))}
</select>
                </div>
                <div className="col-span-2 px-2">
                  <select className="w-full bg-white border border-slate-200 rounded-md py-1 px-1.5 text-[11px] font-bold text-center" value={eventConfig.qual} onChange={e => setEventConfig({...eventConfig, qual: e.target.value})}>
                    {Object.keys(QUALITY_MULTIPLIER).map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
                <div className="col-span-1 px-2">
                  <input
  type="number"
  min={0}
  max={24 - timeConfig.hours}
  value={eventConfig.hours}
  onChange={e => {
    const v = Number(e.target.value);
    setEventConfig({
      ...eventConfig,
      hours: Math.min(v, 24 - timeConfig.hours)
    });
  }}
      className="
    w-full
    bg-white
    border border-slate-200
    rounded-md
    h-[28px]
    px-1.5
    text-[11px]
    font-bold
    text-center
    leading-none
    focus:outline-none
    focus:ring-1 focus:ring-blue-500
  "
/>

                </div>
                <div className="col-span-1 text-right">
                  <span className="text-[10px] font-black text-slate-600">{calcMbps(eventConfig, useIC).toFixed(1)}</span>
                </div>
              </div>
              {useDualTrackRecording && (
  <>
    <div className="h-px bg-slate-200 mx-4"></div>

    <div className="grid grid-cols-12 items-center py-3 px-4 bg-white/50">
      <div className="col-span-2 flex items-center gap-2">
        <Layers size={14} className="text-purple-500" />
        <span className="text-xs font-black text-purple-600 uppercase">
          Dual
        </span>
      </div>

      <div className="col-span-2 px-2">
        <select
          className="w-full bg-white border border-slate-200 rounded-md py-1 px-1.5 text-[11px] font-bold text-center"
          value={dualConfig.codec}
          onChange={e => setDualConfig({ ...dualConfig, codec: e.target.value })}
        >
          <option>H.265</option>
          <option>H.264</option>
        </select>
      </div>

      <div className="col-span-3 px-2">
        <select
          className="w-full bg-white border border-slate-200 rounded-md py-1 px-1.5 text-[11px] font-bold text-center"
          value={dualConfig.res?.value}
          onChange={e => {
            const selected = CAMERA_TYPES[recorderType][camType].find(r => r.value === e.target.value);
            setDualConfig({ ...dualConfig, res: selected });
          }}
        >
          {CAMERA_TYPES[recorderType]?.[camType]?.map(r => {
            const disabled = !isDualResolutionAllowed(camType, r.value);

  return (
    <option
      key={r.value}
      value={r.value}
      disabled={disabled}
    >
      {disabled ? `(Not Supported) ${r.label}` : r.label}
    </option>
  );
})}
        </select>
      </div>

      <div className="col-span-1 px-2">
        <select
          className="w-full bg-white border border-slate-200 rounded-md py-1 px-1.5 text-[11px] font-bold text-center"
          value={dualConfig.fps}
          onChange={e => setDualConfig({ ...dualConfig, fps: Number(e.target.value) })}
        >
          {getFpsOptions(recorderType, selectedRecorder).map(fps => (
            <option key={fps} value={fps}>{fps}</option>
          ))}
        </select>
      </div>

      <div className="col-span-2 px-2">
        <select
          className="w-full bg-white border border-slate-200 rounded-md py-1 px-1.5 text-[11px] font-bold text-center"
          value={dualConfig.qual}
          onChange={e => setDualConfig({ ...dualConfig, qual: e.target.value })}
        >
          {Object.keys(QUALITY_MULTIPLIER).map(q => {
  const disabled = !isDualQualityAllowed(camType, q);

  return (
    <option key={q} value={q} disabled={disabled}>
      {disabled ? `(Not Supported) ${q}` : q}
    </option>
  );
})}
        </select>
      </div>

      <div className="col-span-1 px-2">
        <input
          type="number"
          value={dualConfig.hours}
          disabled
          className="w-full bg-slate-100 border border-slate-200 rounded-md h-[28px] px-1.5 text-[11px] font-bold text-center"
        />
      </div>

      <div className="col-span-1 text-right">
        <span className="text-[10px] font-black text-slate-600">
          {calcMbps(dualConfig, useIC).toFixed(1)}
        </span>
      </div>
    </div>
  </>
)}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleAddOrUpdateCamera} 
                className={`flex-1 py-3.5 rounded-xl font-black text-xs tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 uppercase ${editingId ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-900 hover:bg-black text-white'}`}
              >
                {editingId ? <><Save size={16} /> Update Group</> : <><Plus size={16} /> Add to list</>}
              </button>
              {editingId && (
                <button 
                  onClick={resetInputForm}
                  className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-xs uppercase transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </section>

          {/* Deployed Groups Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
<div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
    Deployed Groups
  </span>

  <div className="flex items-center gap-2 text-[10px] font-black">
    <span className="text-blue-600">
      {cameras.length} Groups
    </span>
    <span className="text-slate-300">·</span>
    <span className="text-slate-700">
      {totals.totalDailyGB.toFixed(1)} GB
      <span className="text-[8px] text-slate-400 font-bold ml-1">
        / Day
      </span>
    </span>
  </div>
</div>

              <div
                ref={deployedGroupsRef}
                className={`divide-y divide-slate-50 max-h-[400px] ${
                  editingId ? "overflow-hidden" : "overflow-y-auto"
                }`}
              >
                 {cameras.map(c => {
                    const calcMode = getCalcMode(c.type);
                    const tMbps = calcMode
                    ? calcGroupMbps({
                      ...c.time,
                      type: c.type,
                      useIC: c.useIC
                    }, calcMode)
                      : 0;

                    const eMbps = calcMode
                      ? calcGroupMbps({
                          ...c.event,
                          type: c.type,
                          useIC: c.useIC
                        }, calcMode)
                      : 0;
                    const dMbps = calcMode && c.useDualTrackRecording && c.dual? calcGroupMbps({ ...c.dual, type: c.type, useIC: c.useIC }, calcMode): 0;

const dailyGB = (((tMbps * 3600 * c.time.hours) + (eMbps * 3600 * c.event.hours) + (dMbps * 3600 * (c.dual?.hours || 0))) * c.qty) / 8 / 1024;
                   const isEditing = editingId === c.id;

                   return (
                     <div
                        key={c.id}
                        className={`px-6 py-4 flex items-center justify-between transition-colors ${
                          editingId ? '' : 'hover:bg-slate-50'} ${
                            isEditing ? 'bg-blue-100 shadow-[-4px_0_0_0_#3b82f6_inset]' : ''
                            }`}
                      >
                       <div className="flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isEditing ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Layers size={18} />
                          </div>
                          <div>
                             <p className="text-xs font-black text-slate-800">
  {c.title && (
    <span className="text-slate-900 mr-1">
      {c.title}
    </span>
  )}

  <span className="text-blue-900 ml-6">
    {c.type} × {c.qty}
  </span>

  <span className="text-[11px] text-slate-800 ml-2">
    ({c.sceneLabel})
  </span>

  {c.useIC && (
  <span className="text-[9px] font-bold text-emerald-600 mt-0.5">
    - Use Intelligent Codec</span>

)}
</p>
                             <div className="mt-2 border border-slate-100 rounded-lg bg-slate-50 px-3 py-2">
  {/* Header */}
  <div className="grid grid-cols-12 text-[8px] font-black text-slate-400 uppercase mb-1">
    <div className="col-span-1">Rec</div>
    <div className="col-span-2 text-center">Codec</div>
    <div className="col-span-3">Resolution</div>
    <div className="col-span-1 text-center">FPS</div>
    <div className="col-span-2 text-center">Quality</div>
    <div className="col-span-1 text-center">Hours</div>
    <div className="col-span-2 text-right">Mbps</div>
  </div>

  <SummaryRow
    label="TIME"
    icon={<Clock size={10} />}
    color="text-blue-500"
    cfg={c.time}
    mbps={tMbps}
    recorderType={recorderType}
  />

  <SummaryRow
    label="EVENT"
    icon={<Zap size={10} />}
    color="text-amber-500"
    cfg={c.event}
    mbps={eMbps}
    recorderType={recorderType}
  />
{c.useDualTrackRecording && (
  <SummaryRow
    label="DUAL"
    icon={<Layers size={10} />}
    color="text-purple-500"
    cfg={c.dual}
    mbps={dMbps}
    recorderType={recorderType}
  />
)}
</div>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="text-right mr-3">
                             <p className="text-sm font-black text-slate-700">{dailyGB.toFixed(1)} GB</p>
                             <p className="text-[8px] font-bold text-slate-300 uppercase">Per Day</p>
                          </div>
                          
                          <button
                            onClick={() => handleEdit(c)}
                            disabled={!!editingId}
                            className={`p-1.5 rounded-md transition-all ${
                              editingId
                              ? 'text-slate-200 cursor-not-allowed'
                              : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50'
                            }`}
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => setCameras(cameras.filter(item => item.id !== c.id))}
                            disabled={!!editingId}
                            className={`p-1.5 rounded-md transition-all ${
                              editingId
                              ? 'text-slate-200 cursor-not-allowed'
                              : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'
                            }`}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                       </div>
                     </div>
                   );
                 })}
                 {cameras.length === 0 && (
                   <div className="py-12 text-center text-slate-300">
                     <Monitor size={48} className="mx-auto mb-2 opacity-20" />
                     <p className="text-[10px] font-bold uppercase tracking-widest">No cameras added</p>
                   </div>
                 )}
              </div>
          </section>
        </div>
      </main>
    </div>
  );
}