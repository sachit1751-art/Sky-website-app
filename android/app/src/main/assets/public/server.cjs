var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express2 = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);

// api/index.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_express = __toESM(require("express"), 1);
var import_supabase_js = require("@supabase/supabase-js");
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);

// api/backendData.ts
var BACKEND_SPEC_CATEGORIES = [
  {
    id: "display",
    title: "Display",
    tagline: '6.79" FHD+ IPS LCD, 90Hz',
    highlights: [
      { label: "Screen Size", value: '6.79" FHD+', description: "1080 \xD7 2460 pixels resolution with ~396 ppi density" },
      { label: "Refresh Rate", value: "90Hz", description: "AdaptiveSync dynamic refresh rate support" },
      { label: "Panel Type", value: "IPS LCD", description: "Large immersive screen with rich contrast" },
      { label: "Protection", value: "Gorilla Glass", description: "Corning Gorilla Glass front protection" }
    ],
    details: "6.79-inch FHD+ (1080 \xD7 2460) IPS LCD display featuring a 90Hz AdaptiveSync refresh rate and Corning Gorilla Glass protection for smooth scrolling and reliable daily durability."
  },
  {
    id: "performance",
    title: "Processor & GPU",
    tagline: "Snapdragon 4 Gen 2 (4nm) + Adreno 613",
    highlights: [
      { label: "Processor", value: "Snapdragon 4 Gen 2", description: "Qualcomm SM4450 4nm octa-core architecture" },
      { label: "CPU Cores", value: "2x 2.20GHz + 6x 1.95GHz", description: "Cortex-A78 & Cortex-A55 performance cores" },
      { label: "GPU", value: "Adreno 613", description: "Qualcomm Adreno graphics processing unit" },
      { label: "Network", value: "5G Dual SIM", description: "High-speed 5G cellular connectivity" }
    ],
    details: "Powered by Qualcomm Snapdragon 4 Gen 2 (SM4450) built on an energy-efficient 4nm process, paired with Adreno 613 GPU for smooth everyday multitasking, efficient thermals, and high-speed 5G connectivity."
  },
  {
    id: "camera",
    title: "Camera System",
    tagline: "50MP Dual Rear + 8MP Front",
    highlights: [
      { label: "Main Camera", value: "50MP", description: "High-resolution primary wide sensor with PDAF" },
      { label: "Depth Sensor", value: "2MP", description: "Auxiliary depth sensor for portrait mode" },
      { label: "Front Camera", value: "8MP", description: "Crisp selfie and video calling camera" },
      { label: "Video Capture", value: "1080p @ 30fps", description: "Full HD video recording support" }
    ],
    details: "50MP high-resolution primary camera paired with a 2MP depth sensor, alongside an 8MP front selfie camera supporting 1080p video recording at 30fps."
  },
  {
    id: "battery",
    title: "Battery & Power",
    tagline: "5000mAh with 18W Charging",
    highlights: [
      { label: "Capacity", value: "5000mAh", description: "High-capacity battery for all-day usage" },
      { label: "Charging", value: "18W", description: "Fast charging support via USB-C" },
      { label: "Port Type", value: "USB-C", description: "Reversible USB Type-C 2.0 interface" },
      { label: "Endurance", value: "All-Day", description: "Extended battery life for media and work" }
    ],
    details: "Massive 5000mAh battery providing reliable all-day battery endurance, supported by 18W fast charging over USB Type-C."
  },
  {
    id: "storage",
    title: "Memory & Storage",
    tagline: "Up to 8GB RAM + 256GB Storage",
    highlights: [
      { label: "RAM", value: "4GB / 6GB / 8GB", description: "LPDDR4X high-speed unified memory" },
      { label: "Storage", value: "128GB / 256GB", description: "High-speed internal storage options" },
      { label: "Expandable", value: "+ microSDXC", description: "Dedicated expandable microSD card storage" },
      { label: "Multitasking", value: "RAM Extension", description: "Smooth app retention and fast caching" }
    ],
    details: "Configurable with 4GB, 6GB, or 8GB of RAM and 128GB or 256GB of internal storage, with dedicated expandable storage support via microSDXC card."
  },
  {
    id: "protection",
    title: "Protection & Connectivity",
    tagline: "Gorilla Glass, IP53, IR Blaster & 3.5mm",
    highlights: [
      { label: "Protection", value: "Gorilla Glass + IP53", description: "Dust and splash resistant rating" },
      { label: "Biometrics", value: "Side Fingerprint", description: "Fast power-key fingerprint sensor" },
      { label: "Audio & IR", value: "3.5mm + IR Blaster", description: "Dedicated headphone jack and infrared remote" },
      { label: "Device Tree", value: "sm4450-sky", description: "Open-source device repository source" }
    ],
    details: "Built with Corning Gorilla Glass front protection, IP53 dust and splash resistance, side-mounted fingerprint scanner, 3.5mm headphone jack, built-in IR blaster, and USB Type-C."
  }
];
var BACKEND_TEAM_MEMBERS = [
  {
    id: "amit_owner",
    name: "Amit",
    role: "Founder + Developer",
    type: "core",
    handle: "@amitsharma0706",
    avatarUrl: "/admins/amitsharma0706/pfp.jpg",
    telegramUrl: "https://t.me/amitsharma0706",
    bio: "Founder and primary architect of the SKY project. He established the development team, pioneered the custom ROM journey, and successfully led crowdfunding initiatives for the main device tree and AOSPA development."
  },
  {
    id: "lostark13",
    name: "Tushar Bharti",
    role: "Core Developer + Maintainer",
    type: "core",
    handle: "@lostark13",
    avatarUrl: "/admins/lostark13/pfp.jpg",
    githubUrl: "https://github.com/lostark13",
    telegramUrl: "https://t.me/lostark13",
    bio: "Core developer handling device trees, kernel architecture, Lineage/Bliss builds, and overall SKY project development."
  },
  {
    id: "redducc",
    name: "Sushmit",
    role: "Core Developer + Maintainer",
    type: "core",
    handle: "@redducc",
    avatarUrl: "/admins/redducc/pfp.jpg",
    githubUrl: "https://github.com/redducc",
    telegramUrl: "https://t.me/redducc",
    bio: "Core developer maintaining DT/kernel work, PenguinOS, Paranoid Android, and core system builds for SKY."
  },
  {
    id: "topexguy",
    name: "Sarim Rasool (TopexGuy)",
    role: "Developer + Maintainer",
    type: "developer",
    handle: "@TopexGuy",
    avatarUrl: "/admins/TopexGuy/pfp.jpg",
    githubUrl: "https://github.com/TopexGuy",
    telegramUrl: "https://t.me/theToplexy",
    bio: "Developer & Maintainer contributing development work to MGLRU, OSS Kernel, PixelOS, VoltageOS, and iode."
  },
  {
    id: "kaif_00z",
    name: "kAiF",
    role: "Developer + Maintainer + Co-Coordinator",
    type: "developer",
    handle: "@kAiF_00z",
    avatarUrl: "/admins/kAiF_00z/pfp.jpg",
    githubUrl: "https://github.com/kAiF_00z",
    telegramUrl: "https://t.me/kAiF_00z",
    bio: "Developer & Maintainer for SKY project ecosystem, Project Infinity X, and ASCP."
  },
  {
    id: "someone3_124",
    name: "Sachit",
    role: "Project Owner + Developer",
    type: "developer",
    handle: "@someone3_124",
    avatarUrl: "/admins/Sachit/pfp.jpg",
    githubUrl: "https://github.com/sachit1751-art",
    telegramUrl: "https://t.me/someone3_124",
    bio: "Developer who built the SKY website and digital platform, application architecture, UI components, and animations."
  },
  {
    id: "jendermine",
    name: "Jendermine",
    role: "Developer + Maintainer",
    type: "developer",
    handle: "@jendermine",
    avatarUrl: "/admins/jendermine/pfp.jpg",
    githubUrl: "https://github.com/jendermine",
    telegramUrl: "https://t.me/jendermine",
    bio: "Active developer and maintainer for PixelOS, audio HAL, and camera pipeline integrations."
  },
  {
    id: "sheshuv",
    name: "Sheshu Vadrevu",
    role: "Developer",
    type: "developer",
    handle: "@sheshuv",
    githubUrl: "https://github.com/sheshuv",
    telegramUrl: "https://t.me/sheshuv",
    bio: "Developer contributing to recovery tree, low-level tooling, and SKY core implementations."
  },
  {
    id: "zi00duck",
    name: "Bruch (Donald)",
    role: "Developer",
    type: "developer",
    handle: "@zi00duck",
    avatarUrl: "/admins/zi00duck/pfp.jpg",
    githubUrl: "https://github.com/zi00duck",
    telegramUrl: "https://t.me/zi00duck",
    bio: "Developer focused on custom recovery builds and low-level development."
  },
  {
    id: "wtfxetra",
    name: "X E T R A",
    role: "Developer",
    type: "developer",
    handle: "@wtfxetra",
    avatarUrl: "/admins/wtfxetra/pfp.jpg",
    githubUrl: "https://github.com/wtfxetra",
    telegramUrl: "https://t.me/wtfxetra",
    bio: "Developer contributing to SKY web interface."
  },
  {
    id: "altafyafai",
    name: "Altaf Yafai",
    role: "Maintainer + Moderator",
    type: "maintainer",
    handle: "@AltafYafai",
    avatarUrl: "/admins/AltafYafai/pfp.jpg",
    githubUrl: "https://github.com/AltafYafai",
    telegramUrl: "https://t.me/AltafYafai786",
    bio: "Device maintainer and community moderator across SKY support groups."
  },
  {
    id: "arrowsploit",
    name: "Arrowsploit",
    role: "Maintainer",
    type: "maintainer",
    handle: "@arrowsploit",
    avatarUrl: "/admins/arrowsploit/pfp.jpg",
    githubUrl: "https://github.com/arrowsploit",
    telegramUrl: "https://t.me/arrowsploit",
    bio: "Official maintainer for AxionAOSP and SKY device releases."
  },
  {
    id: "lua_c8xd",
    name: "Lua",
    role: "Maintainer",
    type: "maintainer",
    handle: "@C8_XD",
    telegramUrl: "https://t.me/C8_XD",
    bio: "Official maintainer for LunarisAOSP on Redmi 12 5G / POCO M6 Pro 5G."
  },
  {
    id: "sanamrajneesh",
    name: "S R",
    role: "Maintainer",
    type: "maintainer",
    handle: "@sanamrajneesh",
    avatarUrl: "/admins/sanamrajneesh/pfp.jpg",
    githubUrl: "https://github.com/sanamrajneesh",
    telegramUrl: "https://t.me/sanamrajneesh",
    bio: "Maintainer for Shutterburg and custom ROM builds."
  },
  {
    id: "solocaptainblaze",
    name: "Dhanush [Dattebayoo]",
    role: "Maintainer",
    type: "maintainer",
    handle: "@solocaptainblaze",
    avatarUrl: "/admins/solocaptainblaze/pfp.jpg",
    githubUrl: "https://github.com/solocaptainblaze",
    telegramUrl: "https://t.me/solocaptainblaze",
    bio: "Official maintainer for EverestOS on SKY."
  },
  {
    id: "chenriquelira",
    name: "Henrique",
    role: "Maintainer",
    type: "maintainer",
    handle: "@chenriquelira",
    githubUrl: "https://github.com/chenriquelira",
    telegramUrl: "https://t.me/chenriquelira",
    bio: "Official maintainer for SKY project releases."
  },
  {
    id: "mijumourya",
    name: "Mourya Baruah",
    role: "Maintainer",
    type: "maintainer",
    handle: "@Mijumourya",
    avatarUrl: "/admins/Mijumourya/pfp.jpg",
    githubUrl: "https://github.com/Mijumourya",
    telegramUrl: "https://t.me/Mijumourya",
    bio: "Official maintainer for crDroid and Project Blaze."
  },
  {
    id: "xprateek",
    name: "Prateek",
    role: "Maintainer",
    type: "maintainer",
    handle: "@xprateek",
    avatarUrl: "/admins/xprateek/pfp.jpg",
    githubUrl: "https://github.com/xprateek",
    telegramUrl: "https://t.me/xprateek",
    bio: "Official maintainer for SKY device builds."
  },
  {
    id: "makhk",
    name: "Hari [HK]",
    role: "Maintainer",
    type: "maintainer",
    handle: "@makhk",
    avatarUrl: "/admins/makhk/pfp.jpg",
    githubUrl: "https://github.com/makhk",
    telegramUrl: "https://t.me/makhk",
    bio: "Official maintainer for SKY project builds."
  },
  {
    id: "vedvery5",
    name: "Vedant Ghadi",
    role: "Moderator",
    type: "moderator",
    handle: "@Vedvery5",
    avatarUrl: "/admins/Vedvery5/pfp.jpg",
    githubUrl: "https://github.com/Vedvery5",
    telegramUrl: "https://t.me/Vedvery5",
    bio: "Community moderator for SKY channels and social platforms."
  },
  {
    id: "hipexscape",
    name: "Atarashii (Atrashi)",
    role: "Ex-Maintainer",
    type: "ex",
    handle: "@hipexscape",
    avatarUrl: "/admins/hipexscape/pfp.jpg",
    githubUrl: "https://github.com/hipexscape",
    telegramUrl: "https://t.me/hipexscape",
    bio: "Former recovery maintainer for the SKY project."
  },
  {
    id: "suvojeet_sengupta",
    name: "Suvojeet Sengupta",
    role: "Ex-Maintainer",
    type: "ex",
    handle: "@suvojeet_sengupta",
    avatarUrl: "/admins/suvojeet_sengupta/pfp.jpg",
    githubUrl: "https://github.com/suvojeet_sengupta",
    telegramUrl: "https://t.me/suvojeet_sengupta",
    bio: "Former device maintainer for SKY project releases."
  },
  {
    id: "venkat3620",
    name: "Venkat3620",
    role: "Ex-Maintainer",
    type: "ex",
    handle: "@Venkat3620",
    telegramUrl: "https://t.me/Venkat3620",
    bio: "Former maintainer for kernel updates and PenguinOS release builds."
  },
  {
    id: "mo_faza",
    name: "mo_faza",
    role: "Tester",
    type: "tester",
    handle: "@mo_faza",
    telegramUrl: "https://t.me/mo_faza",
    bio: "Recurring build tester providing QA feedback and logcat analyses."
  },
  {
    id: "agnes",
    name: "Agnes",
    role: "Tester",
    type: "tester",
    handle: "@Agnes",
    telegramUrl: "https://t.me/Agnes",
    bio: "Dedicated build tester across SKY custom ROM updates."
  },
  {
    id: "sagarp3",
    name: "Sagar (Sagarp3)",
    role: "Tester",
    type: "tester",
    handle: "@Sagarp3",
    telegramUrl: "https://t.me/Sagarp3",
    bio: "Build tester for ROM stability, camera testing, and performance verification."
  }
];
var BACKEND_CORE_VALUES = [
  {
    title: "Openness",
    description: "100% transparent codebases and hardware architecture. No hidden backdoors, no telemetry tracking, and zero proprietary lock-in."
  },
  {
    title: "Development",
    description: "Empowering developers with full root privileges, unlocked bootloaders, and comprehensive hardware documentation from day one."
  },
  {
    title: "Community",
    description: "Built by enthusiasts, for enthusiasts. Project direction and features are discussed and voted on directly by our active global community."
  },
  {
    title: "People First",
    description: "Technology should serve humans, not harvest them. SKY is designed with privacy as an absolute right, not a premium addon."
  }
];
var BACKEND_COMMUNITY_CHANNELS = [
  {
    name: "GitHub Repository",
    description: "Explore our open-source codebase, contribute code, and view issue trackers.",
    url: "https://github.com/sm4450-development",
    icon: "github",
    badge: "100% Open Source"
  },
  {
    name: "Telegram Community",
    description: "Join the main discussion group with thousands of active SKY developers and users.",
    url: "https://t.me/Redmi125GSupport",
    icon: "telegram",
    badge: "Active Group"
  },
  {
    name: "Announcement Channel",
    description: "Stay updated with official device announcements, progress updates, and releases.",
    url: "https://t.me/Redmi125GChannel",
    icon: "chat",
    badge: "Official Updates"
  },
  {
    name: "Developer Network",
    description: "Collaborate with device maintainers, test builds, and contribute hardware drivers.",
    url: "https://t.me/Redmi125GSupport",
    icon: "globe",
    badge: "Contributors"
  }
];
var BACKEND_COMMUNITY_FAQS = [
  {
    id: "bootloader-unlock",
    question: "How do I unlock the bootloader on Redmi 12 5G / Poco M6 Pro 5G (sky)?",
    answer: 'Enable Developer Options on your device by tapping "Build Number" 7 times in Settings > About Phone. Next, enable "OEM Unlocking" and "USB Debugging". Link your account in "Mi Unlock Status", reboot into Fastboot mode (Power + Volume Down), and execute the unlock utility on your PC. Unlocking wipes your internal storage, so make sure to backup beforehand.',
    category: "flashing",
    tags: ["Bootloader", "Fastboot", "Unlock", "Setup"]
  },
  {
    id: "clean-flash-vs-dirty-flash",
    question: "What is the difference between a Clean Flash and a Dirty Flash?",
    answer: 'A Clean Flash involves wiping System, Vendor, Product, Data, and formatting Data (typing "yes" in recovery) before installing a new ROM. This is mandatory when switching between different ROMs or upgrading major Android versions. A Dirty Flash (only flashing the ROM zip + wiping Dalvik/Cache) is only safe when updating to a newer build of the exact same ROM.',
    category: "flashing",
    tags: ["Recovery", "Format Data", "Wiping", "Updates"]
  },
  {
    id: "gapps-vs-vanilla",
    question: "What is the difference between GApps and Vanilla ROM builds?",
    answer: "GApps builds come pre-packaged with core Google Mobile Services, Play Store, and setup wizard. Vanilla builds are de-googled and strictly contain open-source AOSP components. Vanilla builds offer lighter resource usage and battery savings; you can flash third-party GApps (such as NikGApps Core). For Vanilla builds, after flashing the ROM and wiping/formatting data, reboot to recovery again, flash the GApps package, and reboot to system.",
    category: "compatibility",
    tags: ["Google Play", "Vanilla", "GApps", "microG"]
  },
  {
    id: "firmware-requirement",
    question: "Do I need to flash a specific firmware (FW) before flashing custom ROMs?",
    answer: `Yes! Most custom ROMs for "sky" require the latest stable HyperOS / MIUI firmware base for modem, Bluetooth, and vendor partition compatibility. Check each ROM's release notes or maintainer instructions to verify if a matching firmware zip must be flashed prior to installing the ROM.`,
    category: "compatibility",
    tags: ["Firmware", "Modem", "HyperOS", "Vendor"]
  },
  {
    id: "play-integrity-banking",
    question: "Do banking apps and UPI work on custom ROMs for SKY?",
    answer: "Most official builds include verified Play Integrity (Device / Basic integrity) fingerprints out-of-the-box, allowing Google Wallet and banking apps to operate seamlessly. If using an unofficial build or rooting with KernelSU/Magisk/APatch, ensure you configure Zygisk and PlayIntegrityFix modules to pass attestation checks.",
    category: "general",
    tags: ["Banking", "Play Integrity", "UPI", "SafetyNet", "Root"]
  },
  {
    id: "bootloop-fix",
    question: "My device is stuck in a bootloop after flashing. What should I do?",
    answer: '1. Ensure you formatted data in recovery (Format Data > type "yes")\u2014a dirty flash from a previous ROM is the #1 cause of bootloops.\n2. Verify you flashed the recommended Recovery (TWRP / OrangeFox / OFOX) compatible with Android 15/16/17.\n3. If your storage is encrypted, flash the ROM zip and reboot directly to recovery once before booting system.',
    category: "troubleshooting",
    tags: ["Bootloop", "Recovery", "Format Data", "Fastboot"]
  },
  {
    id: "report-bugs",
    question: "How do I properly report bugs to ROM maintainers?",
    answer: "When reporting bugs on Telegram or GitHub: always provide your current ROM version, Kernel version, clean flash confirmation, steps to reproduce, and attach a logcat (`adb logcat -d > logcat.txt`) captured right when the issue occurs. Avoid pinging maintainers without logs.",
    category: "troubleshooting",
    tags: ["Bug Report", "Logcat", "Maintainers", "Telegram"]
  },
  {
    id: "custom-kernels",
    question: "Can I flash custom kernels on custom ROMs?",
    answer: `You can flash custom kernels designed specifically for codename "sky" running Qualcomm Snapdragon 4 Gen 2 (SM4450). Always make a full boot & dtbo backup in recovery prior to flashing any third-party kernel, and ensure the kernel matches your ROM's Android version (A15 / A16 / A17).`,
    category: "compatibility",
    tags: ["Kernel", "Snapdragon 4 Gen 2", "Overclock", "SM4450"]
  }
];
var BACKEND_APP_CONFIG = {
  appName: "SKY ROMs",
  tagline: "Built for Everyone",
  targetDevice: "POCO M6 Pro 5G / Redmi 12 5G",
  codename: "sky / sky_in",
  chipset: "Qualcomm Snapdragon 4 Gen 2 (SM4450 4nm)",
  gpu: "Adreno 613",
  githubOrg: "https://github.com/sm4450-development",
  telegramSupport: "https://t.me/Redmi125GSupport",
  telegramChannel: "https://t.me/Redmi125GChannel",
  version: "2.5.0",
  apiEndpoints: {
    roms: "/api/roms",
    specs: "/api/specs",
    team: "/api/team",
    community: "/api/community",
    feedback: "/api/feedback",
    publicData: "/api/public/data"
  }
};

// api/index.ts
import_dotenv.default.config({ override: true });
var app = (0, import_express.default)();
app.set("trust proxy", 1);
app.use(import_express.default.json({ limit: "1mb" }));
app.use("/api", (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});
var supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
var supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
var isValidKey = (key) => {
  if (!key) return false;
  const trimmed = key.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return false;
  if (trimmed === supabaseUrl) return false;
  return trimmed.length >= 10;
};
var effectiveServiceKey = (() => {
  if (isValidKey(supabaseServiceKey)) {
    return supabaseServiceKey.trim();
  }
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
  if (isValidKey(anonKey)) {
    console.warn("[Supabase Fallback Warning]: SUPABASE_SERVICE_ROLE_KEY is set to the Supabase URL or is missing. Falling back to VITE_SUPABASE_ANON_KEY.");
    return anonKey.trim();
  }
  return "";
})();
function ensureSupabaseConfig() {
  if (!supabaseUrl || !isValidKey(effectiveServiceKey)) {
    throw new Error("Server Configuration Error: A valid Supabase key (service role or anon fallback) is required for server-side operations.");
  }
}
var _supabaseAdminInstance = null;
var getSupabaseAdmin = () => {
  ensureSupabaseConfig();
  if (!_supabaseAdminInstance) {
    _supabaseAdminInstance = (0, import_supabase_js.createClient)(supabaseUrl, effectiveServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return _supabaseAdminInstance;
};
var supabaseAdmin = new Proxy({}, {
  get: (target, prop) => {
    const client = getSupabaseAdmin();
    const value = client[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  }
});
function isValidUUID(str) {
  if (!str || typeof str !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str.trim());
}
function mapAdminToClient(data) {
  if (!data) return null;
  return {
    id: data.id,
    userId: data.id,
    email: data.email,
    name: data.name,
    displayName: data.display_name,
    username: data.username,
    role: data.role,
    active: !!data.active,
    approvalStatus: data.approval_status,
    isSuperAdmin: !!(data.is_super_admin || data.role === "superadmin"),
    bio: data.bio || "",
    avatarUrl: data.avatar_url || "",
    githubUrl: data.github_url || "",
    telegramUrl: data.telegram_url || "",
    telegramUsername: data.telegram_username || "",
    websiteUrl: data.website_url || "",
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}
function mapAdminToDb(data) {
  if (!data) return null;
  const dbData = {};
  if (data.id !== void 0) dbData.id = data.id;
  if (data.userId !== void 0) dbData.id = data.userId;
  if (data.email !== void 0) dbData.email = data.email;
  if (data.name !== void 0) dbData.name = data.name;
  if (data.displayName !== void 0) dbData.display_name = data.displayName;
  if (data.username !== void 0) dbData.username = data.username;
  if (data.role !== void 0) dbData.role = data.role;
  if (data.active !== void 0) dbData.active = data.active;
  if (data.approvalStatus !== void 0) dbData.approval_status = data.approvalStatus;
  if (data.isSuperAdmin !== void 0) dbData.is_super_admin = data.isSuperAdmin;
  if (data.bio !== void 0) dbData.bio = data.bio;
  if (data.avatarUrl !== void 0) dbData.avatar_url = data.avatarUrl;
  if (data.githubUrl !== void 0) dbData.github_url = data.githubUrl;
  if (data.telegramUrl !== void 0) dbData.telegram_url = data.telegramUrl;
  if (data.telegramUsername !== void 0) dbData.telegram_username = data.telegramUsername;
  if (data.websiteUrl !== void 0) dbData.website_url = data.websiteUrl;
  return dbData;
}
function mapRomToClient(data) {
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    title: data.title || "",
    version: data.version || "",
    androidVersion: data.android_version,
    status: data.status,
    maintainer: data.maintainer,
    maintainerUrl: data.maintainer_url || "",
    maintainerHandle: data.maintainer_handle || "",
    maintainerId: data.maintainer_id || null,
    url: data.url || "",
    description: data.description || "",
    changelog: Array.isArray(data.changelog) ? data.changelog : [],
    isPinned: !!data.is_pinned,
    logoUrl: data.logo_url || "",
    extraLinks: Array.isArray(data.extra_links) ? data.extra_links : [],
    downloadCount: typeof data.download_count === "number" ? data.download_count : 0,
    stabilityTrends: Array.isArray(data.stability_trends) ? data.stability_trends : [],
    batteryEfficiency: typeof data.battery_efficiency === "number" ? data.battery_efficiency : 3,
    screenshots: Array.isArray(data.screenshots) ? data.screenshots : [],
    device: data.device || "sky",
    variant: data.variant || "Official",
    sourceUrl: data.source_url || "",
    communityUrl: data.community_url || "",
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}
function mapRomToDb(data) {
  if (!data) return null;
  const dbData = {};
  if (data.id !== void 0) dbData.id = data.id;
  if (data.name !== void 0) dbData.name = data.name;
  if (data.title !== void 0) dbData.title = data.title;
  if (data.version !== void 0) dbData.version = data.version;
  if (data.androidVersion !== void 0) dbData.android_version = data.androidVersion;
  if (data.status !== void 0) dbData.status = data.status;
  if (data.maintainer !== void 0) dbData.maintainer = data.maintainer;
  if (data.maintainerUrl !== void 0) dbData.maintainer_url = data.maintainerUrl;
  if (data.maintainerHandle !== void 0) dbData.maintainer_handle = data.maintainerHandle;
  if (data.maintainerId !== void 0) dbData.maintainer_id = data.maintainerId;
  if (data.url !== void 0) dbData.url = data.url;
  if (data.description !== void 0) dbData.description = data.description;
  if (data.changelog !== void 0) dbData.changelog = data.changelog;
  if (data.isPinned !== void 0) dbData.is_pinned = data.isPinned;
  if (data.logoUrl !== void 0) dbData.logo_url = data.logoUrl;
  if (data.extraLinks !== void 0) dbData.extra_links = data.extraLinks;
  if (data.downloadCount !== void 0) dbData.download_count = data.downloadCount;
  if (data.stabilityTrends !== void 0) dbData.stability_trends = data.stabilityTrends;
  if (data.batteryEfficiency !== void 0) dbData.battery_efficiency = data.batteryEfficiency;
  if (data.screenshots !== void 0) dbData.screenshots = data.screenshots;
  if (data.device !== void 0) dbData.device = data.device;
  if (data.variant !== void 0) dbData.variant = data.variant;
  if (data.sourceUrl !== void 0) dbData.source_url = data.sourceUrl;
  if (data.communityUrl !== void 0) dbData.community_url = data.communityUrl;
  if (data.createdAt !== void 0) dbData.created_at = data.createdAt;
  if (data.updatedAt !== void 0) dbData.updated_at = data.updatedAt;
  return dbData;
}
var pinnedFeedbackIds = /* @__PURE__ */ new Set();
function mapFeedbackToClient(data) {
  if (!data) return null;
  let rawDeviceInfo = data.device_info !== void 0 ? data.device_info : data.deviceInfo !== void 0 ? data.deviceInfo : data.diagnostics || null;
  if (typeof rawDeviceInfo === "string") {
    try {
      rawDeviceInfo = JSON.parse(rawDeviceInfo);
    } catch {
    }
  }
  return {
    id: data.id,
    userId: data.user_id || data.userId || null,
    type: data.type || "general",
    category: data.category || "general",
    title: data.title || "",
    description: data.description || data.message || "",
    // Support message fallback
    contact: data.contact || null,
    deviceInfo: rawDeviceInfo,
    status: data.status || "pending",
    adminResponse: data.admin_response || data.adminResponse || null,
    upvotes: typeof data.upvotes === "number" ? data.upvotes : 0,
    isPinned: !!data.is_pinned || !!data.isPinned || typeof data.id === "string" && pinnedFeedbackIds.has(data.id),
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt
  };
}
function mapFeedbackToDb(data) {
  if (!data) return null;
  const devInfo = data.deviceInfo !== void 0 ? data.deviceInfo : data.device_info !== void 0 ? data.device_info : data.diagnostics || null;
  const formattedDevInfo = typeof devInfo === "object" && devInfo !== null ? JSON.stringify(devInfo) : devInfo || null;
  return {
    id: data.id,
    user_id: data.userId || data.user_id || null,
    // Support user_id for production
    type: data.type || "general",
    category: data.category || "general",
    title: data.title || "",
    description: data.description || "",
    message: data.description || data.message || "",
    // Support message NOT NULL for production
    contact: data.contact || null,
    device_info: formattedDevInfo,
    // Support device_info for migration
    diagnostics: devInfo || {},
    // Support diagnostics for production (jsonb NOT NULL DEFAULT '{}')
    status: data.status || "pending",
    admin_response: data.adminResponse || data.admin_response || null,
    upvotes: typeof data.upvotes === "number" ? data.upvotes : 0,
    created_at: data.createdAt || data.created_at || (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: data.updatedAt || data.updated_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function getAdminRecord(uid) {
  if (!isValidUUID(uid)) return null;
  const { data, error } = await supabaseAdmin.from("admins").select("*").eq("id", uid).maybeSingle();
  if (error) throw new Error(`Database error fetching admin profile: ${error.message}`);
  return mapAdminToClient(data);
}
async function getAdminRecordByEmail(email) {
  const clean = email.trim().toLowerCase();
  const { data, error } = await supabaseAdmin.from("admins").select("*").eq("email", clean).maybeSingle();
  if (error) throw new Error(`Database error searching admin by email: ${error.message}`);
  return mapAdminToClient(data);
}
async function setAdminRecord(uid, data) {
  if (!isValidUUID(uid)) {
    throw new Error("Invalid user ID provided for admin record.");
  }
  const existingRecord = await getAdminRecord(uid);
  const mergedData = {
    ...existingRecord || {},
    ...data,
    userId: uid,
    id: uid
  };
  const dbPayload = mapAdminToDb(mergedData);
  if (!dbPayload.email) {
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(uid);
    if (authError || !authUser.user?.email) {
      throw new Error(`Cannot update admin ${uid}: Supabase Auth user email missing.`);
    }
    dbPayload.email = authUser.user.email.trim().toLowerCase();
  }
  dbPayload.id = uid;
  dbPayload.updated_at = (/* @__PURE__ */ new Date()).toISOString();
  const { data: upsertedData, error } = await supabaseAdmin.from("admins").upsert(dbPayload).select().single();
  if (error) throw new Error(`Database error setting admin record: ${error.message}`);
  return mapAdminToClient(upsertedData);
}
async function getAllAdminRecords() {
  const { data, error } = await supabaseAdmin.from("admins").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(`Database error listing admins: ${error.message}`);
  return (data || []).map(mapAdminToClient);
}
async function deleteAdminRecord(uid) {
  if (!isValidUUID(uid)) return;
  const { error } = await supabaseAdmin.from("admins").delete().eq("id", uid);
  if (error) throw new Error(`Database error deleting admin record: ${error.message}`);
}
async function logAdminAction(adminUid, action, details, ipAddress) {
  try {
    let adminEmail = null;
    if (isValidUUID(adminUid)) {
      const admin = await getAdminRecord(adminUid);
      adminEmail = admin?.email || null;
    }
    await supabaseAdmin.from("admin_logs").insert({
      admin_uid: isValidUUID(adminUid) ? adminUid : null,
      admin_email: adminEmail,
      action: String(action).slice(0, 100),
      details: details || {},
      ip_address: ipAddress || null
    });
  } catch (err) {
    console.error("[Admin Log Warning]: Failed to insert log entry:", err.message);
  }
}
async function getRomRecord(romIdOrName) {
  if (!romIdOrName) return null;
  const clean = romIdOrName.trim();
  if (isValidUUID(clean)) {
    const { data: data2, error: error2 } = await supabaseAdmin.from("roms").select("*").eq("id", clean).maybeSingle();
    if (!error2 && data2) return mapRomToClient(data2);
  }
  const { data, error } = await supabaseAdmin.from("roms").select("*").ilike("name", clean).maybeSingle();
  if (error) throw new Error(`Database error fetching ROM: ${error.message}`);
  return mapRomToClient(data);
}
async function getAllRomRecords() {
  const { data, error } = await supabaseAdmin.from("roms").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(`Database error listing ROMs: ${error.message}`);
  return (data || []).map(mapRomToClient);
}
async function setRomRecord(romId, data) {
  let targetId = isValidUUID(romId) ? romId.trim() : void 0;
  if (!targetId && data.name) {
    const existingByName = await getRomRecord(data.name);
    if (existingByName && existingByName.id && isValidUUID(existingByName.id)) {
      targetId = existingByName.id;
    }
  }
  if (!targetId) {
    targetId = crypto.randomUUID();
  }
  const existing = await getRomRecord(targetId);
  const dbPayload = mapRomToDb(data);
  dbPayload.id = targetId;
  dbPayload.updated_at = (/* @__PURE__ */ new Date()).toISOString();
  if (existing && existing.createdAt) {
    dbPayload.created_at = existing.createdAt;
  } else if (!dbPayload.created_at) {
    dbPayload.created_at = (/* @__PURE__ */ new Date()).toISOString();
  }
  const { data: upsertedData, error } = await supabaseAdmin.from("roms").upsert(dbPayload).select().single();
  if (error) throw new Error(`Database error saving ROM record: ${error.message}`);
  return mapRomToClient(upsertedData);
}
async function deleteRomRecord(romIdOrName) {
  if (!romIdOrName) return;
  let targetId = romIdOrName.trim();
  if (!isValidUUID(targetId)) {
    const existing = await getRomRecord(romIdOrName);
    if (existing && existing.id) {
      targetId = existing.id;
    } else {
      return;
    }
  }
  const { error } = await supabaseAdmin.from("roms").delete().eq("id", targetId);
  if (error) throw new Error(`Database error deleting ROM: ${error.message}`);
}
var inMemoryFeedback = [];
var inMemoryVotes = /* @__PURE__ */ new Map();
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
async function getAllFeedbackRecords() {
  try {
    const { data, error } = await supabaseAdmin.from("feedback").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    const dbItems = (data || []).map(mapFeedbackToClient).filter(Boolean);
    const dbIds = new Set(dbItems.map((item) => item.id));
    const merged = [...dbItems];
    for (const item of inMemoryFeedback) {
      const clientItem = mapFeedbackToClient(item);
      if (clientItem && !dbIds.has(clientItem.id)) {
        merged.push(clientItem);
      }
    }
    merged.sort((a, b) => {
      const aPinned = a.isPinned ? 1 : 0;
      const bPinned = b.isPinned ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return merged;
  } catch (err) {
    console.warn(`[Supabase Feedback List Fallback]: Listing feedback from memory due to: ${err.message}`);
    const items = inMemoryFeedback.map(mapFeedbackToClient).filter(Boolean);
    items.sort((a, b) => {
      const aPinned = a.isPinned ? 1 : 0;
      const bPinned = b.isPinned ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return items;
  }
}
async function saveFeedbackRecord(entry) {
  const dbPayload = mapFeedbackToDb(entry);
  if (!dbPayload.id) {
    dbPayload.id = generateUUID();
  }
  try {
    const { data, error } = await supabaseAdmin.from("feedback").insert(dbPayload).select().single();
    if (error) throw error;
    return mapFeedbackToClient(data);
  } catch (err) {
    console.warn(`[Supabase Feedback Save Fallback]: Saving feedback in memory due to: ${err.message}`);
    const idx = inMemoryFeedback.findIndex((item) => item.id === dbPayload.id);
    if (idx !== -1) {
      inMemoryFeedback[idx] = dbPayload;
    } else {
      inMemoryFeedback.push(dbPayload);
    }
    return mapFeedbackToClient(dbPayload);
  }
}
async function deleteFeedbackRecord(id) {
  if (!isValidUUID(id)) return;
  inMemoryFeedback = inMemoryFeedback.filter((item) => item.id !== id);
  inMemoryVotes.delete(id);
  try {
    const { error } = await supabaseAdmin.from("feedback").delete().eq("id", id);
    if (error) throw error;
  } catch (err) {
    console.warn(`[Supabase Feedback Delete Fallback]: Handled feedback deletion from memory due to: ${err.message}`);
  }
}
async function upvoteFeedbackRecord(id, voterKey, action) {
  if (!isValidUUID(id)) {
    throw new Error("Invalid feedback ID");
  }
  try {
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc("vote_feedback", {
      p_feedback_id: id,
      p_voter_key: voterKey,
      p_action: action
    });
    if (rpcError) throw rpcError;
    if (rpcResult && !rpcResult.success) {
      throw new Error(rpcResult.message || "Failed to process vote");
    }
    const { data: feedbackRow, error: fbErr } = await supabaseAdmin.from("feedback").select("*").eq("id", id).single();
    if (fbErr || !feedbackRow) {
      throw new Error("Feedback item not found after voting");
    }
    const finalUpvotes = typeof rpcResult?.upvotes === "number" ? rpcResult.upvotes : feedbackRow.upvotes;
    const finalVoted = typeof rpcResult?.voted === "boolean" ? rpcResult.voted : false;
    return {
      feedback: mapFeedbackToClient(feedbackRow),
      upvotes: finalUpvotes,
      voted: finalVoted,
      message: rpcResult?.message || "Vote updated successfully"
    };
  } catch (err) {
    console.warn(`[Supabase Feedback Vote Fallback]: Processing vote in-memory due to: ${err.message}`);
    let fbItem = inMemoryFeedback.find((item) => item.id === id);
    if (!fbItem) {
      try {
        const { data: dbItem } = await supabaseAdmin.from("feedback").select("*").eq("id", id).single();
        if (dbItem) {
          fbItem = dbItem;
          inMemoryFeedback.push(dbItem);
        }
      } catch {
      }
    }
    if (!fbItem) {
      throw new Error("Feedback item not found");
    }
    if (!inMemoryVotes.has(id)) {
      inMemoryVotes.set(id, /* @__PURE__ */ new Set());
    }
    const voters = inMemoryVotes.get(id);
    const hasVoted = voters.has(voterKey);
    let resultVoted = false;
    if (action === "downvote" || action === "toggle" && hasVoted) {
      if (hasVoted) {
        voters.delete(voterKey);
      }
      resultVoted = false;
    } else {
      if (!hasVoted) {
        voters.add(voterKey);
      }
      resultVoted = true;
    }
    const newCount = voters.size;
    fbItem.upvotes = newCount;
    fbItem.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    return {
      feedback: mapFeedbackToClient(fbItem),
      upvotes: newCount,
      voted: resultVoted,
      message: "Vote processed successfully"
    };
  }
}
var INITIAL_SUPERADMIN_UID = "b847cc2e-74b5-4b1f-bd21-a3c6d717973e";
async function seedInitialSuperadmin() {
  if (!supabaseUrl || !isValidKey(supabaseServiceKey)) {
    return;
  }
  try {
    const { data: existingAdmin } = await supabaseAdmin.from("admins").select("*").eq("id", INITIAL_SUPERADMIN_UID).maybeSingle();
    if (!existingAdmin) {
      const payload = {
        id: INITIAL_SUPERADMIN_UID,
        email: "admin@skyroms.com",
        name: "Superadmin",
        display_name: "Superadmin",
        username: "superadmin",
        role: "superadmin",
        active: true,
        approval_status: "approved",
        is_super_admin: true
      };
      await supabaseAdmin.from("admins").insert(payload);
    }
    const targetEmail = "sachit1771@gmail.com";
    const targetPassword = process.env.INITIAL_SUPERADMIN_PASSWORD;
    let targetUid = "";
    if (targetPassword && targetPassword.trim().length >= 8) {
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = listData?.users?.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
      if (existingUser) {
        targetUid = existingUser.id;
        await supabaseAdmin.auth.admin.updateUserById(targetUid, {
          password: targetPassword,
          email_confirm: true
        });
      } else {
        const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: targetEmail,
          password: targetPassword,
          email_confirm: true,
          user_metadata: { name: "Sachit" }
        });
        if (!createError && createData?.user) {
          targetUid = createData.user.id;
        }
      }
      if (targetUid) {
        await supabaseAdmin.from("admins").upsert({
          id: targetUid,
          email: targetEmail,
          name: "Sachit",
          display_name: "Sachit",
          username: "sachit1771",
          role: "superadmin",
          active: true,
          approval_status: "approved",
          is_super_admin: true,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }, { onConflict: "id" });
      }
    } else {
      console.log("[Superadmin Seed Info]: Skipping superadmin seed because INITIAL_SUPERADMIN_PASSWORD is not configured in environment variables.");
    }
  } catch (err) {
    console.warn("[Superadmin Seed Error]:", err.message);
  }
}
seedInitialSuperadmin().catch(() => {
});
var registrationLimiter = (0, import_express_rate_limit.default)({
  windowMs: 60 * 60 * 1e3,
  max: 10,
  message: { error: "Too many registration attempts from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});
var feedbackLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 20,
  message: { error: "Too many feedback submissions, please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});
var voteLimiter = (0, import_express_rate_limit.default)({
  windowMs: 5 * 60 * 1e3,
  max: 30,
  message: { error: "Too many voting attempts from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});
async function resolveToken(token) {
  if (!token || token === "undefined" || token === "null" || token.trim() === "") return null;
  try {
    ensureSupabaseConfig();
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token.trim());
    if (error || !user) {
      return null;
    }
    return { uid: user.id, email: user.email?.toLowerCase(), name: user.user_metadata?.name };
  } catch (err) {
    return null;
  }
}
async function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed authorization header." });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const user = await resolveToken(token);
    if (!user) {
      return res.status(401).json({ error: "Authentication failed: Invalid or expired session token." });
    }
    const admin = await getAdminRecord(user.uid);
    if (!admin) {
      return res.status(403).json({ error: "Access denied. Administrator profile not found." });
    }
    if (admin.active !== true || admin.approvalStatus !== "approved") {
      return res.status(403).json({ error: "Access denied. Account is inactive or awaiting approval." });
    }
    const allowedRoles = ["maintainer", "developer", "moderator", "admin", "superadmin"];
    if (!allowedRoles.includes(admin.role)) {
      return res.status(403).json({ error: "Access denied. Invalid administrator role." });
    }
    req.userUid = user.uid;
    req.email = admin.email || user.email;
    req.adminProfile = admin;
    req.isSuperAdmin = admin.role === "superadmin" || admin.isSuperAdmin === true;
    next();
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error during authorization." });
  }
}
async function verifySuperAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed authorization header." });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const user = await resolveToken(token);
    if (!user) {
      return res.status(401).json({ error: "Authentication failed: Invalid or expired session token." });
    }
    const admin = await getAdminRecord(user.uid);
    if (!admin) {
      return res.status(403).json({ error: "Access denied. Superadmin profile not found." });
    }
    if (admin.active !== true || admin.approvalStatus !== "approved") {
      return res.status(403).json({ error: "Access denied. Superadmin account is inactive or not approved." });
    }
    if (admin.role === "superadmin" || admin.isSuperAdmin === true) {
      req.userUid = user.uid;
      req.email = admin.email || user.email;
      req.adminProfile = admin;
      req.isSuperAdmin = true;
      next();
    } else {
      return res.status(403).json({ error: "Access denied. Superadmin privileges required." });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error during superadmin authorization." });
  }
}
app.get("/api/health", async (req, res) => {
  if (!supabaseUrl || !isValidKey(effectiveServiceKey)) {
    return res.status(503).json({
      status: "unhealthy",
      supabaseConnected: false,
      error: "Supabase credentials (service role or anon fallback) are missing or invalid."
    });
  }
  try {
    const { data, error } = await supabaseAdmin.from("profiles").select("id").limit(1);
    if (error) {
      return res.status(503).json({
        status: "degraded",
        supabaseConnected: false,
        error: "Supabase database query failed."
      });
    }
    return res.status(200).json({
      status: "ok",
      supabaseConnected: true,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    return res.status(503).json({
      status: "unhealthy",
      supabaseConnected: false,
      error: "Failed to connect to Supabase database."
    });
  }
});
app.get("/sitemap.xml", async (req, res) => {
  try {
    const roms = await getAllRomRecords();
    const domain = "https://sky-roms.vercel.app";
    const staticUrls = ["", "/roms", "/guides", "/team", "/faq", "/status"];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
    staticUrls.forEach((path2) => {
      xml += `  <url>
    <loc>${domain}${path2}</loc>
    <changefreq>daily</changefreq>
    <priority>${path2 === "" ? "1.0" : "0.8"}</priority>
  </url>
`;
    });
    (roms || []).forEach((rom) => {
      const romSlug = encodeURIComponent(rom.name || "");
      xml += `  <url>
    <loc>${domain}/roms?search=${romSlug}</loc>
    <lastmod>${(rom.updatedAt || rom.createdAt || (/* @__PURE__ */ new Date()).toISOString()).split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });
    xml += `</urlset>`;
    res.setHeader("Content-Type", "application/xml");
    return res.status(200).send(xml);
  } catch (err) {
    res.setHeader("Content-Type", "application/xml");
    return res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?><error>${err.message}</error>`);
  }
});
app.get("/feed.xml", async (req, res) => {
  try {
    const roms = await getAllRomRecords();
    const domain = "https://sky-roms.vercel.app";
    let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
`;
    xml += `    <title>SKY ROM Ecosystem Releases</title>
`;
    xml += `    <link>${domain}/roms</link>
`;
    xml += `    <description>Latest Custom ROMs and Kernel releases for POCO M6 Pro 5G / Redmi 12 5G (sky / sky_in).</description>
`;
    xml += `    <language>en-us</language>
`;
    xml += `    <lastBuildDate>${(/* @__PURE__ */ new Date()).toUTCString()}</lastBuildDate>
`;
    (roms || []).slice(0, 20).forEach((rom) => {
      xml += `    <item>
`;
      xml += `      <title>${rom.name} (Android ${rom.androidVersion || "15"})</title>
`;
      xml += `      <link>${domain}/roms?search=${encodeURIComponent(rom.name || "")}</link>
`;
      xml += `      <description>${(rom.description || "Custom ROM build for SKY ecosystem. Maintainer: " + (rom.maintainer || "Community")).replace(/&/g, "&amp;")}</description>
`;
      xml += `      <pubDate>${new Date(rom.createdAt || Date.now()).toUTCString()}</pubDate>
`;
      xml += `      <guid>${domain}/roms#${encodeURIComponent(rom.name || "")}</guid>
`;
      xml += `    </item>
`;
    });
    xml += `  </channel>
</rss>`;
    res.setHeader("Content-Type", "application/xml");
    return res.status(200).send(xml);
  } catch (err) {
    res.setHeader("Content-Type", "application/xml");
    return res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?><error>${err.message}</error>`);
  }
});
app.get("/api/admin/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed authorization header." });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const user = await resolveToken(token);
    if (!user) {
      return res.status(401).json({ error: "Invalid or expired session token." });
    }
    const admin = await getAdminRecord(user.uid);
    if (!admin) {
      return res.status(404).json({ error: "Admin profile not found." });
    }
    const allowedRoles = ["pending", "maintainer", "developer", "moderator", "admin", "superadmin"];
    if (!allowedRoles.includes(admin.role)) {
      return res.status(403).json({ error: "Access denied. Invalid administrator role." });
    }
    return res.status(200).json({ success: true, admin });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Authentication failed." });
  }
});
app.post("/api/admin/log", verifyAdmin, async (req, res) => {
  const { action, details } = req.body;
  if (!action || typeof action !== "string") {
    return res.status(400).json({ error: "Action string is required." });
  }
  try {
    const ip = req.headers["x-forwarded-for"] || req.ip;
    await logAdminAction(req.userUid, action, details, ip);
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to record audit log." });
  }
});
app.get("/api/admin/diagnostics", verifyAdmin, async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      diagnostics: {
        isFeedbackInMemoryFallback: inMemoryFeedback.length > 0 || process.env.SUPABASE_SERVICE_ROLE_KEY === process.env.SUPABASE_URL,
        inMemoryFeedbackCount: inMemoryFeedback.length,
        supabaseConfigured: !!(process.env.SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY),
        isServiceRoleKeyFallback: process.env.SUPABASE_SERVICE_ROLE_KEY === process.env.SUPABASE_URL,
        uptime: process.uptime(),
        nodeVersion: process.version,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to fetch diagnostics." });
  }
});
app.post("/api/admin/register", registrationLimiter, async (req, res) => {
  const { email, password, name, username, telegramUsername } = req.body;
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "A valid email address is required." });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }
  const cleanEmail = email.trim().toLowerCase();
  const displayName = typeof name === "string" && name.trim() ? name.trim() : cleanEmail.split("@")[0];
  const displayUsername = typeof username === "string" && username.trim() ? username.trim() : cleanEmail.split("@")[0];
  const displayTelegram = typeof telegramUsername === "string" && telegramUsername.trim() ? telegramUsername.trim() : "";
  try {
    ensureSupabaseConfig();
    const existingAdmin = await getAdminRecordByEmail(cleanEmail);
    if (existingAdmin) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: { name: displayName }
    });
    if (authError || !authData?.user) {
      console.error("[Supabase Auth Registration Error]:", authError?.message);
      return res.status(500).json({ error: `Registration failed: ${authError?.message || "Failed to create auth user."}` });
    }
    const userUid = authData.user.id;
    try {
      const { error: profileErr } = await supabaseAdmin.from("profiles").insert({
        id: userUid,
        email: cleanEmail,
        display_name: displayName,
        username: displayUsername
      });
      if (profileErr) throw profileErr;
      await setAdminRecord(userUid, {
        userId: userUid,
        name: displayName,
        displayName,
        email: cleanEmail,
        username: displayUsername,
        telegramUsername: displayTelegram,
        role: "pending",
        active: false,
        approvalStatus: "pending",
        isSuperAdmin: false
      });
      const ip = req.headers["x-forwarded-for"] || req.ip;
      await logAdminAction(userUid, "REGISTER_ADMIN", { email: cleanEmail, role: "pending", active: false }, ip);
      return res.status(200).json({
        success: true,
        uid: userUid,
        isSuperAdmin: false,
        message: "Registration submitted successfully. Awaiting superadmin approval."
      });
    } catch (dbError) {
      console.error("[Registration Rollback Triggered]:", dbError.message);
      try {
        await supabaseAdmin.from("profiles").delete().eq("id", userUid);
      } catch (profileDelErr) {
        console.warn("[Registration Rollback Profile Warning]:", profileDelErr);
      }
      try {
        await supabaseAdmin.auth.admin.deleteUser(userUid);
      } catch (authDelErr) {
        console.warn("[Registration Rollback Auth Warning]:", authDelErr);
      }
      return res.status(500).json({
        error: `Registration failed during profile creation. Account rolled back: ${dbError.message}`
      });
    }
  } catch (error) {
    console.error("[Registration Handler Error]:", error.message);
    return res.status(500).json({ error: error.message || "Registration process failed." });
  }
});
app.get("/api/admin/admins", verifySuperAdmin, async (req, res) => {
  try {
    const admins = await getAllAdminRecords();
    return res.status(200).json({ success: true, admins });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to fetch admin list." });
  }
});
app.get("/api/admin/requests", verifySuperAdmin, async (req, res) => {
  try {
    const all = await getAllAdminRecords();
    const requests = all.filter((a) => a.approvalStatus === "pending");
    return res.status(200).json({ success: true, requests });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to fetch registration requests." });
  }
});
var ALLOWED_ASSIGNABLE_ROLES = ["maintainer", "developer", "moderator"];
app.post("/api/admin/approve", verifySuperAdmin, async (req, res) => {
  const adminId = req.body.adminId || req.body.adminUid;
  const assignedRole = req.body.role || req.body.assignedRole;
  if (!adminId || !isValidUUID(adminId)) {
    return res.status(400).json({ error: "Valid Admin ID required." });
  }
  if (!assignedRole || !ALLOWED_ASSIGNABLE_ROLES.includes(assignedRole)) {
    return res.status(400).json({
      error: `Invalid assigned role '${assignedRole}'. Allowed assignable roles: ${ALLOWED_ASSIGNABLE_ROLES.join(", ")}`
    });
  }
  try {
    const updated = await setAdminRecord(adminId, {
      approvalStatus: "approved",
      active: true,
      role: assignedRole,
      isSuperAdmin: false
    });
    const ip = req.headers["x-forwarded-for"] || req.ip;
    await logAdminAction(req.userUid, "APPROVE_ADMIN", { adminId, role: assignedRole }, ip);
    return res.status(200).json({
      success: true,
      admin: updated,
      message: `Administrator approved successfully with role: ${assignedRole}`
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to approve administrator." });
  }
});
app.post("/api/admin/reject", verifySuperAdmin, async (req, res) => {
  const adminId = req.body.adminId || req.body.adminUid;
  if (!adminId || !isValidUUID(adminId)) {
    return res.status(400).json({ error: "Valid Admin ID required." });
  }
  try {
    const updated = await setAdminRecord(adminId, {
      approvalStatus: "rejected",
      active: false
    });
    const ip = req.headers["x-forwarded-for"] || req.ip;
    await logAdminAction(req.userUid, "REJECT_ADMIN", { adminId }, ip);
    return res.status(200).json({ success: true, admin: updated });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to reject administrator." });
  }
});
app.post("/api/admin/deactivate", verifySuperAdmin, async (req, res) => {
  const adminId = req.body.adminId || req.body.adminUid;
  if (!adminId || !isValidUUID(adminId)) {
    return res.status(400).json({ error: "Valid Admin ID required." });
  }
  if (adminId === req.userUid) {
    return res.status(400).json({ error: "You cannot deactivate your own superadmin account." });
  }
  try {
    const updated = await setAdminRecord(adminId, {
      active: false
    });
    const ip = req.headers["x-forwarded-for"] || req.ip;
    await logAdminAction(req.userUid, "DEACTIVATE_ADMIN", { adminId }, ip);
    return res.status(200).json({ success: true, admin: updated });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to deactivate administrator." });
  }
});
app.post("/api/admin/reactivate", verifySuperAdmin, async (req, res) => {
  const adminId = req.body.adminId || req.body.adminUid;
  if (!adminId || !isValidUUID(adminId)) {
    return res.status(400).json({ error: "Valid Admin ID required." });
  }
  try {
    const updated = await setAdminRecord(adminId, {
      active: true,
      approvalStatus: "approved"
    });
    const ip = req.headers["x-forwarded-for"] || req.ip;
    await logAdminAction(req.userUid, "REACTIVATE_ADMIN", { adminId }, ip);
    return res.status(200).json({ success: true, admin: updated });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to reactivate administrator." });
  }
});
app.post("/api/admin/delete-admin", verifySuperAdmin, async (req, res) => {
  const adminId = req.body.adminId || req.body.adminUid;
  if (!adminId || !isValidUUID(adminId)) {
    return res.status(400).json({ error: "Valid Admin ID required." });
  }
  if (adminId === req.userUid) {
    return res.status(400).json({ error: "You cannot delete your own superadmin account." });
  }
  try {
    await deleteAdminRecord(adminId);
    try {
      await supabaseAdmin.from("profiles").delete().eq("id", adminId);
    } catch (profileDelErr) {
      console.warn("[Delete Admin Profile Warning]:", profileDelErr);
    }
    try {
      await supabaseAdmin.auth.admin.deleteUser(adminId);
    } catch (authDelErr) {
      console.warn("[Delete Admin Auth Warning]:", authDelErr);
    }
    const ip = req.headers["x-forwarded-for"] || req.ip;
    await logAdminAction(req.userUid, "DELETE_ADMIN", { adminId }, ip);
    return res.status(200).json({ success: true, message: "Admin deleted successfully." });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to delete administrator." });
  }
});
app.get("/api/admin/logs", verifySuperAdmin, async (req, res) => {
  try {
    const { data: logs, error } = await supabaseAdmin.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error(`Database error fetching logs: ${error.message}`);
    const formattedLogs = (logs || []).map((log) => ({
      id: log.id,
      adminUid: log.admin_uid,
      adminEmail: log.admin_email,
      action: log.action,
      details: log.details,
      ipAddress: log.ip_address,
      timestamp: log.created_at
    }));
    return res.status(200).json({ success: true, logs: formattedLogs });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to fetch audit logs." });
  }
});
app.get("/api/admin/backup", verifyAdmin, async (req, res) => {
  try {
    const roms = await getAllRomRecords();
    const admins = await getAllAdminRecords();
    const feedback = await getAllFeedbackRecords();
    let logs = [];
    try {
      const { data } = await supabaseAdmin.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(200);
      if (data) {
        logs = data.map((log) => ({
          id: log.id,
          adminUid: log.admin_uid,
          adminEmail: log.admin_email,
          action: log.action,
          details: log.details,
          ipAddress: log.ip_address,
          timestamp: log.created_at
        }));
      }
    } catch {
    }
    const backupPayload = {
      backupVersion: "1.0",
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      exportedBy: req.adminProfile?.email || "unknown",
      data: {
        roms,
        admins,
        feedback,
        logs
      }
    };
    const ip = req.headers["x-forwarded-for"] || req.ip;
    await logAdminAction(req.userUid, "EXPORT_BACKUP", { exportedBy: req.adminProfile?.email }, ip);
    return res.status(200).json({ success: true, backup: backupPayload });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to generate system backup." });
  }
});
app.get("/api/roms", async (req, res) => {
  try {
    const roms = await getAllRomRecords();
    return res.status(200).json({ success: true, roms });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to fetch ROMs list." });
  }
});
app.get("/api/roms/:idOrName", async (req, res) => {
  try {
    const rom = await getRomRecord(req.params.idOrName);
    if (!rom) {
      return res.status(404).json({ error: "ROM not found in catalog." });
    }
    return res.status(200).json({ success: true, rom });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to fetch ROM details." });
  }
});
app.get(["/api/specs", "/api/device"], (req, res) => {
  return res.status(200).json({
    success: true,
    device: {
      name: "POCO M6 Pro 5G / Redmi 12 5G",
      codename: "sky / sky_in",
      chipset: "Qualcomm Snapdragon 4 Gen 2 (SM4450 4nm)",
      gpu: "Adreno 613",
      battery: "5000mAh with 18W Fast Charging",
      display: '6.79" FHD+ IPS LCD 90Hz AdaptiveSync',
      camera: "50MP Primary + 2MP Depth, 8MP Front",
      protection: "Corning Gorilla Glass + IP53 Dust/Splash Resistance"
    },
    categories: BACKEND_SPEC_CATEGORIES
  });
});
app.get("/api/team", async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      members: BACKEND_TEAM_MEMBERS
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch team members list." });
  }
});
app.get("/api/community", (req, res) => {
  return res.status(200).json({
    success: true,
    channels: BACKEND_COMMUNITY_CHANNELS,
    faqs: BACKEND_COMMUNITY_FAQS,
    values: BACKEND_CORE_VALUES
  });
});
app.get("/api/faqs", (req, res) => {
  return res.status(200).json({
    success: true,
    faqs: BACKEND_COMMUNITY_FAQS
  });
});
app.get("/api/config", (req, res) => {
  return res.status(200).json({
    success: true,
    config: BACKEND_APP_CONFIG
  });
});
app.get("/api/public/data", async (req, res) => {
  try {
    const roms = await getAllRomRecords();
    return res.status(200).json({
      success: true,
      roms,
      specs: BACKEND_SPEC_CATEGORIES,
      team: BACKEND_TEAM_MEMBERS,
      communityChannels: BACKEND_COMMUNITY_CHANNELS,
      faqs: BACKEND_COMMUNITY_FAQS,
      coreValues: BACKEND_CORE_VALUES,
      config: BACKEND_APP_CONFIG,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (e) {
    return res.status(500).json({
      error: "Failed to fetch unified public dataset."
    });
  }
});
function checkRomPermission(adminProfile, existingRom, incomingData) {
  const role = adminProfile?.role;
  const userId = adminProfile?.id;
  if (adminProfile?.active !== true || adminProfile?.approvalStatus !== "approved") {
    return { allowed: false, error: "Access denied. Account is inactive or not approved." };
  }
  const isSuper = role === "superadmin" || adminProfile?.isSuperAdmin === true;
  const isAdmin = role === "admin";
  if (isSuper || isAdmin) {
    const merged = {
      ...existingRom,
      ...incomingData,
      id: existingRom?.id || incomingData.id || crypto.randomUUID()
    };
    return { allowed: true, mergedData: merged };
  }
  const isUpdate = !!existingRom;
  if (role === "maintainer" || role === "developer") {
    if (!isUpdate) {
      if (incomingData.status === "published" || incomingData.status === "Official") {
        return { allowed: false, error: "Unauthorized: Maintainers/Developers cannot publish official builds directly." };
      }
      if (incomingData.isPinned === true) {
        return { allowed: false, error: "Unauthorized: Only administrators can pin ROM entries." };
      }
      const newRom = {
        ...incomingData,
        maintainerId: userId,
        downloadCount: 0,
        isPinned: false
      };
      return { allowed: true, mergedData: newRom };
    } else {
      if (existingRom.maintainerId && existingRom.maintainerId !== userId) {
        return { allowed: false, error: "Unauthorized: You can only modify your own ROM submissions." };
      }
      if (incomingData.maintainerId && incomingData.maintainerId !== userId) {
        return { allowed: false, error: "Unauthorized: You cannot transfer ROM ownership." };
      }
      if (incomingData.status === "published" && existingRom.status !== "published") {
        return { allowed: false, error: "Unauthorized: Maintainers/Developers cannot publish ROMs directly." };
      }
      if (incomingData.isPinned !== void 0 && incomingData.isPinned !== existingRom.isPinned) {
        return { allowed: false, error: "Unauthorized: Only administrators can modify pinning status." };
      }
      if (incomingData.downloadCount !== void 0 && incomingData.downloadCount !== existingRom.downloadCount) {
        return { allowed: false, error: "Unauthorized: You cannot modify download metrics." };
      }
      const merged = {
        ...existingRom,
        ...incomingData,
        id: existingRom.id,
        maintainerId: userId,
        downloadCount: existingRom.downloadCount,
        isPinned: existingRom.isPinned
      };
      return { allowed: true, mergedData: merged };
    }
  }
  if (role === "moderator") {
    if (!isUpdate) {
      return { allowed: false, error: "Unauthorized: Moderators cannot create new ROM entries." };
    } else {
      const forbiddenKeys = [
        "id",
        "maintainerId",
        "maintainer",
        "maintainerUrl",
        "maintainerHandle",
        "url",
        "downloadCount",
        "isPinned",
        "createdAt",
        "updatedAt"
      ];
      for (const key of forbiddenKeys) {
        if (incomingData[key] !== void 0 && incomingData[key] !== existingRom[key]) {
          return { allowed: false, error: `Unauthorized: Moderators cannot modify the '${key}' field.` };
        }
      }
      const merged = {
        ...existingRom,
        ...incomingData,
        id: existingRom.id,
        maintainerId: existingRom.maintainerId,
        maintainer: existingRom.maintainer,
        maintainerUrl: existingRom.maintainerUrl,
        maintainerHandle: existingRom.maintainerHandle,
        url: existingRom.url,
        downloadCount: existingRom.downloadCount,
        isPinned: existingRom.isPinned
      };
      return { allowed: true, mergedData: merged };
    }
  }
  return { allowed: false, error: "Access denied. Unrecognized or unauthorized administrator role." };
}
app.post("/api/admin/roms", verifyAdmin, async (req, res) => {
  try {
    const romData = req.body;
    if (!romData || typeof romData !== "object") {
      return res.status(400).json({ error: "Invalid ROM data payload." });
    }
    if (!romData.name || typeof romData.name !== "string" || romData.name.trim().length < 2) {
      return res.status(400).json({ error: "ROM name is required (minimum 2 characters)." });
    }
    if (!romData.androidVersion || typeof romData.androidVersion !== "string") {
      return res.status(400).json({ error: "Android version string is required." });
    }
    if (!romData.maintainer || typeof romData.maintainer !== "string") {
      return res.status(400).json({ error: "Maintainer name is required." });
    }
    const validStatuses = ["Official", "Unofficial", "draft", "pending", "approved", "published", "rejected"];
    if (romData.status && !validStatuses.includes(romData.status)) {
      return res.status(400).json({ error: `Invalid status value '${romData.status}'. Allowed: ${validStatuses.join(", ")}` });
    }
    const incomingId = romData.id;
    const existing = incomingId ? await getRomRecord(incomingId) : romData.name ? await getRomRecord(romData.name) : null;
    const check = checkRomPermission(req.adminProfile, existing, romData);
    if (!check.allowed) {
      const ip2 = req.headers["x-forwarded-for"] || req.ip;
      await logAdminAction(req.userUid, "DENIED_ROM_MUTATION", {
        romId: incomingId || existing?.id || "new",
        reason: check.error,
        role: req.adminProfile?.role
      }, ip2);
      return res.status(403).json({ error: check.error || "Access denied." });
    }
    const payload = {
      ...check.mergedData,
      createdAt: existing ? existing.createdAt : romData.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const targetId = existing?.id || (isValidUUID(incomingId) ? incomingId : crypto.randomUUID());
    const savedRom = await setRomRecord(targetId, payload);
    const ip = req.headers["x-forwarded-for"] || req.ip;
    await logAdminAction(req.userUid, existing ? "UPDATE_ROM" : "CREATE_ROM", {
      romId: savedRom?.id || targetId,
      name: payload.name,
      status: payload.status,
      role: req.adminProfile?.role
    }, ip);
    return res.status(200).json({
      success: true,
      id: savedRom?.id || targetId,
      rom: savedRom,
      message: `ROM ${existing ? "updated" : "created"} successfully.`
    });
  } catch (e) {
    console.error("[Admin Save ROM Error]:", e);
    return res.status(500).json({ error: e.message || "Failed to save ROM record." });
  }
});
app.delete("/api/admin/roms/:id", verifyAdmin, async (req, res) => {
  try {
    const romId = req.params.id;
    if (!romId) {
      return res.status(400).json({ error: "ROM ID parameter is required." });
    }
    const existing = await getRomRecord(romId);
    if (!existing) {
      return res.status(404).json({ error: "ROM not found in database." });
    }
    const role = req.adminProfile?.role;
    const isSuper = req.isSuperAdmin;
    const isAdmin = role === "admin";
    if (!isSuper && !isAdmin) {
      if (role === "maintainer" || role === "developer") {
        if (existing.maintainerId && existing.maintainerId !== req.userUid) {
          return res.status(403).json({ error: "You can only delete your own ROM entries." });
        }
        if (existing.status !== "draft") {
          return res.status(403).json({ error: "You can only delete draft ROM entries." });
        }
      } else {
        const ip2 = req.headers["x-forwarded-for"] || req.ip;
        await logAdminAction(req.userUid, "DENIED_ROM_DELETION", { romId, name: existing.name, role }, ip2);
        return res.status(403).json({ error: "Unauthorized: You do not have permission to delete ROMs." });
      }
    }
    await deleteRomRecord(romId);
    const ip = req.headers["x-forwarded-for"] || req.ip;
    await logAdminAction(req.userUid, "DELETE_ROM", { romId, name: existing.name, role }, ip);
    return res.status(200).json({ success: true, message: "ROM deleted successfully." });
  } catch (e) {
    console.error("[Admin Delete ROM Error]:", e);
    return res.status(500).json({ error: e.message || "Failed to delete ROM." });
  }
});
app.post("/api/feedback", feedbackLimiter, async (req, res) => {
  try {
    const { type, title, description, category, contact, deviceInfo } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Title is required." });
    }
    const validatedTitle = title.trim().slice(0, 200);
    if (!description || typeof description !== "string" || !description.trim()) {
      return res.status(400).json({ error: "Description is required." });
    }
    const validatedDescription = description.trim().slice(0, 2e3);
    const allowedTypes = ["general", "bug", "request", "feedback", "report"];
    const validatedType = typeof type === "string" && allowedTypes.includes(type.trim().toLowerCase()) ? type.trim().toLowerCase() : "general";
    const validatedCategory = typeof category === "string" && category.trim() ? category.trim().slice(0, 50) : "general";
    const validatedContact = typeof contact === "string" && contact.trim() ? contact.trim().slice(0, 100) : null;
    let validatedDeviceInfo = null;
    if (deviceInfo !== void 0 && deviceInfo !== null) {
      if (typeof deviceInfo === "object") {
        validatedDeviceInfo = deviceInfo;
      } else if (typeof deviceInfo === "string") {
        try {
          validatedDeviceInfo = JSON.parse(deviceInfo);
        } catch {
          return res.status(400).json({ error: "Diagnostics context is not a valid JSON structure." });
        }
      } else {
        return res.status(400).json({ error: "Diagnostics context must be a valid JSON object." });
      }
    }
    let authenticatedUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];
      const decodedUser = await resolveToken(token);
      if (decodedUser && decodedUser.uid) {
        authenticatedUserId = decodedUser.uid;
      }
    }
    const feedbackEntry = {
      id: crypto.randomUUID(),
      userId: authenticatedUserId,
      type: validatedType,
      category: validatedCategory,
      title: validatedTitle,
      description: validatedDescription,
      message: validatedDescription,
      // Fallback NOT NULL constraint column for production DB
      diagnostics: validatedDeviceInfo || {},
      // Fallback NOT NULL constraint column for production DB
      contact: validatedContact,
      deviceInfo: validatedDeviceInfo,
      status: "pending",
      adminResponse: null,
      upvotes: 1,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const saved = await saveFeedbackRecord(feedbackEntry);
    const rawIp = req.headers["x-forwarded-for"] || req.ip || "anonymous";
    const voterKey = authenticatedUserId ? `auth:${authenticatedUserId}` : `anon:${rawIp.split(",")[0].trim()}`;
    try {
      await supabaseAdmin.from("feedback_votes").insert({
        feedback_id: saved.id,
        voter_key: voterKey,
        vote_type: "upvote",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (voteErr) {
      console.warn("[Feedback Initial Vote Warning]:", voteErr?.message || voteErr);
    }
    return res.status(200).json({
      success: true,
      id: saved.id,
      feedback: saved,
      message: "Thank you! Your feedback has been recorded successfully."
    });
  } catch (e) {
    console.error("[Feedback Submission Error]:", e);
    return res.status(500).json({ error: "Unable to save feedback right now. Please try again." });
  }
});
app.get("/api/feedback", async (req, res) => {
  try {
    const all = await getAllFeedbackRecords();
    const publicList = all.map((f) => ({
      id: f.id,
      type: f.type,
      category: f.category,
      title: f.title,
      description: f.description,
      status: f.status,
      adminResponse: f.adminResponse,
      upvotes: typeof f.upvotes === "number" ? f.upvotes : 0,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt
    }));
    return res.status(200).json({ success: true, feedback: publicList });
  } catch (e) {
    console.error("[Public Feedback Fetch Error]:", e);
    return res.status(500).json({ error: e.message || "Failed to load feedback entries." });
  }
});
app.post("/api/feedback/:id/upvote", voteLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body || {};
    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: "Valid Feedback ID parameter is required." });
    }
    let voterKey = "";
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];
      const user = await resolveToken(token);
      if (user && user.uid) {
        voterKey = `auth:${user.uid}`;
      }
    }
    if (!voterKey) {
      const rawIp = req.headers["x-forwarded-for"] || req.ip || "unknown_ip";
      voterKey = `anon:${rawIp.split(",")[0].trim()}`;
    }
    const result = await upvoteFeedbackRecord(id, voterKey, action || "upvote");
    return res.status(200).json({
      success: true,
      id,
      upvotes: result.upvotes,
      voted: result.voted,
      message: result.message
    });
  } catch (e) {
    console.error("[Feedback Vote Error]:", e);
    return res.status(500).json({ error: e.message || "Failed to process vote." });
  }
});
app.get("/api/admin/feedback", verifyAdmin, async (req, res) => {
  try {
    const feedbackList = await getAllFeedbackRecords();
    return res.status(200).json({ success: true, count: feedbackList.length, feedback: feedbackList });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to fetch feedback list." });
  }
});
app.patch("/api/admin/feedback/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse, isPinned } = req.body;
    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: "Valid Feedback ID parameter is required." });
    }
    const { data: existing, error: fetchErr } = await supabaseAdmin.from("feedback").select("*").eq("id", id).maybeSingle();
    if (fetchErr || !existing) {
      return res.status(404).json({ error: "Feedback record not found." });
    }
    if (isPinned !== void 0) {
      if (isPinned) {
        pinnedFeedbackIds.add(id);
      } else {
        pinnedFeedbackIds.delete(id);
      }
    }
    const updated = {
      ...mapFeedbackToClient(existing),
      status: status !== void 0 ? status : existing.status,
      adminResponse: adminResponse !== void 0 ? adminResponse : existing.admin_response,
      isPinned: isPinned !== void 0 ? isPinned : pinnedFeedbackIds.has(id) || !!existing.is_pinned,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const saved = await saveFeedbackRecord(updated);
    const ip = req.headers["x-forwarded-for"] || req.ip;
    await logAdminAction(req.userUid, "UPDATE_FEEDBACK", { feedbackId: id, status, isPinned, title: existing.title }, ip);
    return res.status(200).json({ success: true, feedback: saved });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to update feedback entry." });
  }
});
app.delete("/api/admin/feedback/:id", verifySuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: "Valid Feedback ID parameter is required." });
    }
    await deleteFeedbackRecord(id);
    const ip = req.headers["x-forwarded-for"] || req.ip;
    await logAdminAction(req.userUid, "DELETE_FEEDBACK", { feedbackId: id }, ip);
    return res.status(200).json({ success: true, message: "Feedback entry deleted successfully." });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to delete feedback entry." });
  }
});
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: `API route '${req.originalUrl}' not found.` });
});
app.use((err, req, res, next) => {
  console.error("[Unhandled Express Error]:", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: err.message || "Internal Server Error" });
});
var api_default = app;

// server.ts
var PORT = 3e3;
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: process.cwd()
    });
    api_default.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    api_default.use(import_express2.default.static(distPath));
    api_default.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  api_default.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
