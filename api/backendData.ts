import { TeamMember, SpecCategory, CoreValue, CommunityChannel, FAQItem } from '../shared/types';

export const BACKEND_SPEC_CATEGORIES: SpecCategory[] = [
  {
    id: 'display',
    title: 'Display',
    tagline: '6.79" FHD+ IPS LCD, 90Hz',
    highlights: [
      { label: 'Screen Size', value: '6.79" FHD+', description: '1080 × 2460 pixels resolution with ~396 ppi density' },
      { label: 'Refresh Rate', value: '90Hz', description: 'AdaptiveSync dynamic refresh rate support' },
      { label: 'Panel Type', value: 'IPS LCD', description: 'Large immersive screen with rich contrast' },
      { label: 'Protection', value: 'Gorilla Glass', description: 'Corning Gorilla Glass front protection' }
    ],
    details: '6.79-inch FHD+ (1080 × 2460) IPS LCD display featuring a 90Hz AdaptiveSync refresh rate and Corning Gorilla Glass protection for smooth scrolling and reliable daily durability.'
  },
  {
    id: 'performance',
    title: 'Processor & GPU',
    tagline: 'Snapdragon 4 Gen 2 (4nm) + Adreno 613',
    highlights: [
      { label: 'Processor', value: 'Snapdragon 4 Gen 2', description: 'Qualcomm SM4450 4nm octa-core architecture' },
      { label: 'CPU Cores', value: '2x 2.20GHz + 6x 1.95GHz', description: 'Cortex-A78 & Cortex-A55 performance cores' },
      { label: 'GPU', value: 'Adreno 613', description: 'Qualcomm Adreno graphics processing unit' },
      { label: 'Network', value: '5G Dual SIM', description: 'High-speed 5G cellular connectivity' }
    ],
    details: 'Powered by Qualcomm Snapdragon 4 Gen 2 (SM4450) built on an energy-efficient 4nm process, paired with Adreno 613 GPU for smooth everyday multitasking, efficient thermals, and high-speed 5G connectivity.'
  },
  {
    id: 'camera',
    title: 'Camera System',
    tagline: '50MP Dual Rear + 8MP Front',
    highlights: [
      { label: 'Main Camera', value: '50MP', description: 'High-resolution primary wide sensor with PDAF' },
      { label: 'Depth Sensor', value: '2MP', description: 'Auxiliary depth sensor for portrait mode' },
      { label: 'Front Camera', value: '8MP', description: 'Crisp selfie and video calling camera' },
      { label: 'Video Capture', value: '1080p @ 30fps', description: 'Full HD video recording support' }
    ],
    details: '50MP high-resolution primary camera paired with a 2MP depth sensor, alongside an 8MP front selfie camera supporting 1080p video recording at 30fps.'
  },
  {
    id: 'battery',
    title: 'Battery & Power',
    tagline: '5000mAh with 18W Charging',
    highlights: [
      { label: 'Capacity', value: '5000mAh', description: 'High-capacity battery for all-day usage' },
      { label: 'Charging', value: '18W', description: 'Fast charging support via USB-C' },
      { label: 'Port Type', value: 'USB-C', description: 'Reversible USB Type-C 2.0 interface' },
      { label: 'Endurance', value: 'All-Day', description: 'Extended battery life for media and work' }
    ],
    details: 'Massive 5000mAh battery providing reliable all-day battery endurance, supported by 18W fast charging over USB Type-C.'
  },
  {
    id: 'storage',
    title: 'Memory & Storage',
    tagline: 'Up to 8GB RAM + 256GB Storage',
    highlights: [
      { label: 'RAM', value: '4GB / 6GB / 8GB', description: 'LPDDR4X high-speed unified memory' },
      { label: 'Storage', value: '128GB / 256GB', description: 'High-speed internal storage options' },
      { label: 'Expandable', value: '+ microSDXC', description: 'Dedicated expandable microSD card storage' },
      { label: 'Multitasking', value: 'RAM Extension', description: 'Smooth app retention and fast caching' }
    ],
    details: 'Configurable with 4GB, 6GB, or 8GB of RAM and 128GB or 256GB of internal storage, with dedicated expandable storage support via microSDXC card.'
  },
  {
    id: 'protection',
    title: 'Protection & Connectivity',
    tagline: 'Gorilla Glass, IP53, IR Blaster & 3.5mm',
    highlights: [
      { label: 'Protection', value: 'Gorilla Glass + IP53', description: 'Dust and splash resistant rating' },
      { label: 'Biometrics', value: 'Side Fingerprint', description: 'Fast power-key fingerprint sensor' },
      { label: 'Audio & IR', value: '3.5mm + IR Blaster', description: 'Dedicated headphone jack and infrared remote' },
      { label: 'Device Tree', value: 'sm4450-sky', description: 'Open-source device repository source' }
    ],
    details: 'Built with Corning Gorilla Glass front protection, IP53 dust and splash resistance, side-mounted fingerprint scanner, 3.5mm headphone jack, built-in IR blaster, and USB Type-C.'
  }
];

export const BACKEND_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'amit_owner',
    name: 'Amit',
    role: 'Founder + Developer',
    type: 'core',
    handle: '@amitsharma0706',
    avatarUrl: '/admins/amitsharma0706/pfp.jpg',
    telegramUrl: 'https://t.me/amitsharma0706',
    bio: 'Founder and primary architect of the SKY project. He established the development team, pioneered the custom ROM journey, and successfully led crowdfunding initiatives for the main device tree and AOSPA development.'
  },
  {
    id: 'lostark13',
    name: 'Tushar Bharti',
    role: 'Core Developer + Maintainer',
    type: 'core',
    handle: '@lostark13',
    avatarUrl: '/admins/lostark13/pfp.jpg',
    githubUrl: 'https://github.com/lostark13',
    telegramUrl: 'https://t.me/lostark13',
    bio: 'Core developer handling device trees, kernel architecture, Lineage/Bliss builds, and overall SKY project development.'
  },
  {
    id: 'redducc',
    name: 'Sushmit',
    role: 'Core Developer + Maintainer',
    type: 'core',
    handle: '@redducc',
    avatarUrl: '/admins/redducc/pfp.jpg',
    githubUrl: 'https://github.com/redducc',
    telegramUrl: 'https://t.me/redducc',
    bio: 'Core developer maintaining DT/kernel work, PenguinOS, Paranoid Android, and core system builds for SKY.'
  },
  {
    id: 'topexguy',
    name: 'Sarim Rasool (TopexGuy)',
    role: 'Developer + Maintainer',
    type: 'developer',
    handle: '@TopexGuy',
    avatarUrl: '/admins/TopexGuy/pfp.jpg',
    githubUrl: 'https://github.com/TopexGuy',
    telegramUrl: 'https://t.me/theToplexy',
    bio: 'Developer & Maintainer contributing development work to MGLRU, OSS Kernel, PixelOS, VoltageOS, and iode.'
  },
  {
    id: 'kaif_00z',
    name: 'kAiF',
    role: 'Developer + Maintainer + Co-Coordinator',
    type: 'developer',
    handle: '@kAiF_00z',
    avatarUrl: '/admins/kAiF_00z/pfp.jpg',
    githubUrl: 'https://github.com/kAiF_00z',
    telegramUrl: 'https://t.me/kAiF_00z',
    bio: 'Developer & Maintainer for SKY project ecosystem, Project Infinity X, and ASCP.'
  },
  {
    id: 'someone3_124',
    name: 'Sachit',
    role: 'Project Owner + Developer',
    type: 'developer',
    handle: '@someone3_124',
    avatarUrl: '/admins/Sachit/pfp.jpg',
    githubUrl: 'https://github.com/sachit1751-art',
    telegramUrl: 'https://t.me/someone3_124',
    bio: 'Developer who built the SKY website and digital platform, application architecture, UI components, and animations.'
  },
  {
    id: 'jendermine',
    name: 'Jendermine',
    role: 'Developer + Maintainer',
    type: 'developer',
    handle: '@jendermine',
    avatarUrl: '/admins/jendermine/pfp.jpg',
    githubUrl: 'https://github.com/jendermine',
    telegramUrl: 'https://t.me/jendermine',
    bio: 'Active developer and maintainer for PixelOS, audio HAL, and camera pipeline integrations.'
  },
  {
    id: 'sheshuv',
    name: 'Sheshu Vadrevu',
    role: 'Developer',
    type: 'developer',
    handle: '@sheshuv',
    githubUrl: 'https://github.com/sheshuv',
    telegramUrl: 'https://t.me/sheshuv',
    bio: 'Developer contributing to recovery tree, low-level tooling, and SKY core implementations.'
  },
  {
    id: 'zi00duck',
    name: 'Bruch (Donald)',
    role: 'Developer',
    type: 'developer',
    handle: '@zi00duck',
    avatarUrl: '/admins/zi00duck/pfp.jpg',
    githubUrl: 'https://github.com/zi00duck',
    telegramUrl: 'https://t.me/zi00duck',
    bio: 'Developer focused on custom recovery builds and low-level development.'
  },
  {
    id: 'wtfxetra',
    name: 'X E T R A',
    role: 'Developer',
    type: 'developer',
    handle: '@wtfxetra',
    avatarUrl: '/admins/wtfxetra/pfp.jpg',
    githubUrl: 'https://github.com/wtfxetra',
    telegramUrl: 'https://t.me/wtfxetra',
    bio: 'Developer contributing to SKY web interface.'
  },
  {
    id: 'altafyafai',
    name: 'Altaf Yafai',
    role: 'Maintainer + Moderator',
    type: 'maintainer',
    handle: '@AltafYafai',
    avatarUrl: '/admins/AltafYafai/pfp.jpg',
    githubUrl: 'https://github.com/AltafYafai',
    telegramUrl: 'https://t.me/AltafYafai786',
    bio: 'Device maintainer and community moderator across SKY support groups.'
  },
  {
    id: 'arrowsploit',
    name: 'Arrowsploit',
    role: 'Maintainer',
    type: 'maintainer',
    handle: '@arrowsploit',
    avatarUrl: '/admins/arrowsploit/pfp.jpg',
    githubUrl: 'https://github.com/arrowsploit',
    telegramUrl: 'https://t.me/arrowsploit',
    bio: 'Official maintainer for AxionAOSP and SKY device releases.'
  },
  {
    id: 'lua_c8xd',
    name: 'Lua',
    role: 'Maintainer',
    type: 'maintainer',
    handle: '@C8_XD',
    telegramUrl: 'https://t.me/C8_XD',
    bio: 'Official maintainer for LunarisAOSP on Redmi 12 5G / POCO M6 Pro 5G.'
  },
  {
    id: 'sanamrajneesh',
    name: 'S R',
    role: 'Maintainer',
    type: 'maintainer',
    handle: '@sanamrajneesh',
    avatarUrl: '/admins/sanamrajneesh/pfp.jpg',
    githubUrl: 'https://github.com/sanamrajneesh',
    telegramUrl: 'https://t.me/sanamrajneesh',
    bio: 'Maintainer for Shutterburg and custom ROM builds.'
  },
  {
    id: 'solocaptainblaze',
    name: 'Dhanush [Dattebayoo]',
    role: 'Maintainer',
    type: 'maintainer',
    handle: '@solocaptainblaze',
    avatarUrl: '/admins/solocaptainblaze/pfp.jpg',
    githubUrl: 'https://github.com/solocaptainblaze',
    telegramUrl: 'https://t.me/solocaptainblaze',
    bio: 'Official maintainer for EverestOS on SKY.'
  },
  {
    id: 'chenriquelira',
    name: 'Henrique',
    role: 'Maintainer',
    type: 'maintainer',
    handle: '@chenriquelira',
    githubUrl: 'https://github.com/chenriquelira',
    telegramUrl: 'https://t.me/chenriquelira',
    bio: 'Official maintainer for SKY project releases.'
  },
  {
    id: 'mijumourya',
    name: 'Mourya Baruah',
    role: 'Maintainer',
    type: 'maintainer',
    handle: '@Mijumourya',
    avatarUrl: '/admins/Mijumourya/pfp.jpg',
    githubUrl: 'https://github.com/Mijumourya',
    telegramUrl: 'https://t.me/Mijumourya',
    bio: 'Official maintainer for crDroid and Project Blaze.'
  },
  {
    id: 'xprateek',
    name: 'Prateek',
    role: 'Maintainer',
    type: 'maintainer',
    handle: '@xprateek',
    avatarUrl: '/admins/xprateek/pfp.jpg',
    githubUrl: 'https://github.com/xprateek',
    telegramUrl: 'https://t.me/xprateek',
    bio: 'Official maintainer for SKY device builds.'
  },
  {
    id: 'makhk',
    name: 'Hari [HK]',
    role: 'Maintainer',
    type: 'maintainer',
    handle: '@makhk',
    avatarUrl: '/admins/makhk/pfp.jpg',
    githubUrl: 'https://github.com/makhk',
    telegramUrl: 'https://t.me/makhk',
    bio: 'Official maintainer for SKY project builds.'
  },
  {
    id: 'vedvery5',
    name: 'Vedant Ghadi',
    role: 'Moderator',
    type: 'moderator',
    handle: '@Vedvery5',
    avatarUrl: '/admins/Vedvery5/pfp.jpg',
    githubUrl: 'https://github.com/Vedvery5',
    telegramUrl: 'https://t.me/Vedvery5',
    bio: 'Community moderator for SKY channels and social platforms.'
  },
  {
    id: 'hipexscape',
    name: 'Atarashii (Atrashi)',
    role: 'Ex-Maintainer',
    type: 'ex',
    handle: '@hipexscape',
    avatarUrl: '/admins/hipexscape/pfp.jpg',
    githubUrl: 'https://github.com/hipexscape',
    telegramUrl: 'https://t.me/hipexscape',
    bio: 'Former recovery maintainer for the SKY project.'
  },
  {
    id: 'suvojeet_sengupta',
    name: 'Suvojeet Sengupta',
    role: 'Ex-Maintainer',
    type: 'ex',
    handle: '@suvojeet_sengupta',
    avatarUrl: '/admins/suvojeet_sengupta/pfp.jpg',
    githubUrl: 'https://github.com/suvojeet_sengupta',
    telegramUrl: 'https://t.me/suvojeet_sengupta',
    bio: 'Former device maintainer for SKY project releases.'
  },
  {
    id: 'venkat3620',
    name: 'Venkat3620',
    role: 'Ex-Maintainer',
    type: 'ex',
    handle: '@Venkat3620',
    telegramUrl: 'https://t.me/Venkat3620',
    bio: 'Former maintainer for kernel updates and PenguinOS release builds.'
  },
  {
    id: 'mo_faza',
    name: 'mo_faza',
    role: 'Tester',
    type: 'tester',
    handle: '@mo_faza',
    telegramUrl: 'https://t.me/mo_faza',
    bio: 'Recurring build tester providing QA feedback and logcat analyses.'
  },
  {
    id: 'agnes',
    name: 'Agnes',
    role: 'Tester',
    type: 'tester',
    handle: '@Agnes',
    telegramUrl: 'https://t.me/Agnes',
    bio: 'Dedicated build tester across SKY custom ROM updates.'
  },
  {
    id: 'sagarp3',
    name: 'Sagar (Sagarp3)',
    role: 'Tester',
    type: 'tester',
    handle: '@Sagarp3',
    telegramUrl: 'https://t.me/Sagarp3',
    bio: 'Build tester for ROM stability, camera testing, and performance verification.'
  }
];

export const BACKEND_CORE_VALUES: CoreValue[] = [
  {
    title: 'Openness',
    description: '100% transparent codebases and hardware architecture. No hidden backdoors, no telemetry tracking, and zero proprietary lock-in.'
  },
  {
    title: 'Development',
    description: 'Empowering developers with full root privileges, unlocked bootloaders, and comprehensive hardware documentation from day one.'
  },
  {
    title: 'Community',
    description: 'Built by enthusiasts, for enthusiasts. Project direction and features are discussed and voted on directly by our active global community.'
  },
  {
    title: 'People First',
    description: 'Technology should serve humans, not harvest them. SKY is designed with privacy as an absolute right, not a premium addon.'
  }
];

export const BACKEND_COMMUNITY_CHANNELS: CommunityChannel[] = [
  {
    name: 'GitHub Repository',
    description: 'Explore our open-source codebase, contribute code, and view issue trackers.',
    url: 'https://github.com/sm4450-development',
    icon: 'github',
    badge: '100% Open Source'
  },
  {
    name: 'Telegram Community',
    description: 'Join the main discussion group with thousands of active SKY developers and users.',
    url: 'https://t.me/Redmi125GSupport',
    icon: 'telegram',
    badge: 'Active Group'
  },
  {
    name: 'Announcement Channel',
    description: 'Stay updated with official device announcements, progress updates, and releases.',
    url: 'https://t.me/Redmi125GChannel',
    icon: 'chat',
    badge: 'Official Updates'
  },
  {
    name: 'Developer Network',
    description: 'Collaborate with device maintainers, test builds, and contribute hardware drivers.',
    url: 'https://t.me/Redmi125GSupport',
    icon: 'globe',
    badge: 'Contributors'
  }
];

export const BACKEND_COMMUNITY_FAQS: FAQItem[] = [
  {
    id: 'bootloader-unlock',
    question: 'How do I unlock the bootloader on Redmi 12 5G / Poco M6 Pro 5G (sky)?',
    answer: 'Enable Developer Options on your device by tapping "Build Number" 7 times in Settings > About Phone. Next, enable "OEM Unlocking" and "USB Debugging". Link your account in "Mi Unlock Status", reboot into Fastboot mode (Power + Volume Down), and execute the unlock utility on your PC. Unlocking wipes your internal storage, so make sure to backup beforehand.',
    category: 'flashing',
    tags: ['Bootloader', 'Fastboot', 'Unlock', 'Setup']
  },
  {
    id: 'clean-flash-vs-dirty-flash',
    question: 'What is the difference between a Clean Flash and a Dirty Flash?',
    answer: 'A Clean Flash involves wiping System, Vendor, Product, Data, and formatting Data (typing "yes" in recovery) before installing a new ROM. This is mandatory when switching between different ROMs or upgrading major Android versions. A Dirty Flash (only flashing the ROM zip + wiping Dalvik/Cache) is only safe when updating to a newer build of the exact same ROM.',
    category: 'flashing',
    tags: ['Recovery', 'Format Data', 'Wiping', 'Updates']
  },
  {
    id: 'gapps-vs-vanilla',
    question: 'What is the difference between GApps and Vanilla ROM builds?',
    answer: 'GApps builds come pre-packaged with core Google Mobile Services, Play Store, and setup wizard. Vanilla builds are de-googled and strictly contain open-source AOSP components. Vanilla builds offer lighter resource usage and battery savings; you can flash third-party GApps (such as NikGApps Core). For Vanilla builds, after flashing the ROM and wiping/formatting data, reboot to recovery again, flash the GApps package, and reboot to system.',
    category: 'compatibility',
    tags: ['Google Play', 'Vanilla', 'GApps', 'microG']
  },
  {
    id: 'firmware-requirement',
    question: 'Do I need to flash a specific firmware (FW) before flashing custom ROMs?',
    answer: 'Yes! Most custom ROMs for "sky" require the latest stable HyperOS / MIUI firmware base for modem, Bluetooth, and vendor partition compatibility. Check each ROM\'s release notes or maintainer instructions to verify if a matching firmware zip must be flashed prior to installing the ROM.',
    category: 'compatibility',
    tags: ['Firmware', 'Modem', 'HyperOS', 'Vendor']
  },
  {
    id: 'play-integrity-banking',
    question: 'Do banking apps and UPI work on custom ROMs for SKY?',
    answer: 'Most official builds include verified Play Integrity (Device / Basic integrity) fingerprints out-of-the-box, allowing Google Wallet and banking apps to operate seamlessly. If using an unofficial build or rooting with KernelSU/Magisk/APatch, ensure you configure Zygisk and PlayIntegrityFix modules to pass attestation checks.',
    category: 'general',
    tags: ['Banking', 'Play Integrity', 'UPI', 'SafetyNet', 'Root']
  },
  {
    id: 'bootloop-fix',
    question: 'My device is stuck in a bootloop after flashing. What should I do?',
    answer: '1. Ensure you formatted data in recovery (Format Data > type "yes")—a dirty flash from a previous ROM is the #1 cause of bootloops.\n2. Verify you flashed the recommended Recovery (TWRP / OrangeFox / OFOX) compatible with Android 15/16/17.\n3. If your storage is encrypted, flash the ROM zip and reboot directly to recovery once before booting system.',
    category: 'troubleshooting',
    tags: ['Bootloop', 'Recovery', 'Format Data', 'Fastboot']
  },
  {
    id: 'report-bugs',
    question: 'How do I properly report bugs to ROM maintainers?',
    answer: 'When reporting bugs on Telegram or GitHub: always provide your current ROM version, Kernel version, clean flash confirmation, steps to reproduce, and attach a logcat (`adb logcat -d > logcat.txt`) captured right when the issue occurs. Avoid pinging maintainers without logs.',
    category: 'troubleshooting',
    tags: ['Bug Report', 'Logcat', 'Maintainers', 'Telegram']
  },
  {
    id: 'custom-kernels',
    question: 'Can I flash custom kernels on custom ROMs?',
    answer: 'You can flash custom kernels designed specifically for codename "sky" running Qualcomm Snapdragon 4 Gen 2 (SM4450). Always make a full boot & dtbo backup in recovery prior to flashing any third-party kernel, and ensure the kernel matches your ROM\'s Android version (A15 / A16 / A17).',
    category: 'compatibility',
    tags: ['Kernel', 'Snapdragon 4 Gen 2', 'Overclock', 'SM4450']
  }
];

export const BACKEND_APP_CONFIG = {
  appName: 'SKY ROMs',
  tagline: 'Built for Everyone',
  targetDevice: 'POCO M6 Pro 5G / Redmi 12 5G',
  codename: 'sky / sky_in',
  chipset: 'Qualcomm Snapdragon 4 Gen 2 (SM4450 4nm)',
  gpu: 'Adreno 613',
  githubOrg: 'https://github.com/sm4450-development',
  telegramSupport: 'https://t.me/Redmi125GSupport',
  telegramChannel: 'https://t.me/Redmi125GChannel',
  version: '2.5.0',
  apiEndpoints: {
    roms: '/api/roms',
    specs: '/api/specs',
    team: '/api/team',
    community: '/api/community',
    feedback: '/api/feedback',
    publicData: '/api/public/data'
  }
};
