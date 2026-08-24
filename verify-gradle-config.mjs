import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const androidDir = path.join(rootDir, 'android');

console.log('='.repeat(60));
console.log(' Android Gradle & Java Compatibility Validator');
console.log('='.repeat(60));

if (!fs.existsSync(androidDir)) {
  console.error(`❌ Android directory not found at: ${androidDir}`);
  process.exit(1);
}

// Find all build.gradle files in android/
function findGradleFiles(dir, fileList = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.name === '.gradle' || item.name === 'build' || item.name === 'node_modules') continue;
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      findGradleFiles(fullPath, fileList);
    } else if (item.name.endsWith('.gradle')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const gradleFiles = findGradleFiles(androidDir);

console.log(`\nFound ${gradleFiles.length} Gradle script file(s) to verify:`);
gradleFiles.forEach((f) => console.log(`  - ${path.relative(rootDir, f)}`));

let hasErrors = false;
const issues = [];
const agpVersions = new Map();
const javaVersions = new Map();

// Helper to extract AGP versions
for (const filePath of gradleFiles) {
  const relPath = path.relative(rootDir, filePath);
  const content = fs.readFileSync(filePath, 'utf8');

  // Match classpath 'com.android.tools.build:gradle:X.Y.Z'
  const agpMatch = content.match(/com\.android\.tools\.build:gradle:([0-9.]+)/);
  if (agpMatch) {
    agpVersions.set(relPath, agpMatch[1]);
  }

  // Match JavaVersion references (e.g. JavaVersion.VERSION_17, JavaVersion.VERSION_21)
  const javaMatches = content.match(/JavaVersion\.(VERSION_[0-9_]+)/g);
  if (javaMatches) {
    const uniqueJava = [...new Set(javaMatches.map((m) => m.replace('JavaVersion.', '')))];
    javaVersions.set(relPath, uniqueJava);
  }
}

console.log('\n--- 1. Android Gradle Plugin (AGP) Consistency ---');
if (agpVersions.size === 0) {
  console.log('⚠️  No explicit AGP classpath dependencies detected.');
} else {
  const distinctAgp = [...new Set(agpVersions.values())];
  agpVersions.forEach((ver, file) => {
    console.log(`  • ${file} -> AGP ${ver}`);
  });

  if (distinctAgp.length > 1) {
    hasErrors = true;
    issues.push(`AGP version mismatch detected: [${distinctAgp.join(', ')}] across modules.`);
    console.log(`  ❌ MISMATCH: Multiple AGP versions found: ${distinctAgp.join(', ')}`);
  } else {
    console.log(`  ✅ AGP version is consistent (${distinctAgp[0]}) across all buildscript configurations.`);
  }
}

console.log('\n--- 2. Java Compatibility Version Consistency ---');
if (javaVersions.size === 0) {
  console.log('⚠️  No explicit JavaVersion configurations found.');
} else {
  const allEncounteredJava = [];
  javaVersions.forEach((versions, file) => {
    console.log(`  • ${file} -> ${versions.join(', ')}`);
    allEncounteredJava.push(...versions);
  });

  const distinctJava = [...new Set(allEncounteredJava)];
  if (distinctJava.length > 1) {
    hasErrors = true;
    issues.push(`JavaVersion mismatch detected: [${distinctJava.join(', ')}] across modules.`);
    console.log(`  ❌ MISMATCH: Multiple Java versions detected: ${distinctJava.join(', ')}`);
  } else {
    console.log(`  ✅ Java compatibility is uniform (${distinctJava[0]}) across all modules.`);
  }
}

// Check Gradle Wrapper properties
console.log('\n--- 3. Gradle Wrapper Distribution ---');
const wrapperPropsPath = path.join(androidDir, 'gradle', 'wrapper', 'gradle-wrapper.properties');
if (fs.existsSync(wrapperPropsPath)) {
  const wrapperContent = fs.readFileSync(wrapperPropsPath, 'utf8');
  const distMatch = wrapperContent.match(/distributionUrl=.*gradle-([0-9.]+)-(all|bin)\.zip/);
  if (distMatch) {
    console.log(`  • Wrapper Gradle Version: ${distMatch[1]} (${distMatch[2]})`);
    console.log('  ✅ Gradle wrapper configured.');
  } else {
    console.log('  ⚠️  Could not parse Gradle distributionUrl version.');
  }
} else {
  console.log('  ⚠️  gradle-wrapper.properties not found.');
}

console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.error('❌ VALIDATION FAILED with the following issues:');
  issues.forEach((issue) => console.error(`  - ${issue}`));
  console.log('='.repeat(60) + '\n');
  process.exit(1);
} else {
  console.log('✅ ALL CHECKS PASSED: Android Gradle and Java versions are consistent.');
  console.log('='.repeat(60) + '\n');
  process.exit(0);
}
