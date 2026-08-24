import fs from 'node:fs';
import path from 'node:path';

function syncVersion() {
  const rootDir = process.cwd();
  const packageJsonPath = path.join(rootDir, 'package.json');
  const buildGradlePath = path.join(rootDir, 'android', 'app', 'build.gradle');

  if (!fs.existsSync(packageJsonPath)) {
    console.error('package.json not found at:', packageJsonPath);
    process.exit(1);
  }

  if (!fs.existsSync(buildGradlePath)) {
    console.error('build.gradle not found at:', buildGradlePath);
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = pkg.version || '1.0.0';

  // Compute a deterministic versionCode from semver (e.g. 1.2.3 -> 1002003 or integer parsing)
  const semverParts = version.split('-')[0].split('.').map((p) => parseInt(p, 10) || 0);
  const major = semverParts[0] || 0;
  const minor = semverParts[1] || 0;
  const patch = semverParts[2] || 0;
  const calculatedVersionCode = Math.max(1, major * 10000 + minor * 100 + patch);

  let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');

  // Replace versionName
  buildGradleContent = buildGradleContent.replace(
    /versionName\s+["'][^"']+["']/,
    `versionName "${version}"`
  );

  // Replace versionCode
  buildGradleContent = buildGradleContent.replace(
    /versionCode\s+\d+/,
    `versionCode ${calculatedVersionCode}`
  );

  fs.writeFileSync(buildGradlePath, buildGradleContent, 'utf8');

  console.log(`Synced version from package.json to android/app/build.gradle:`);
  console.log(`  - versionName: "${version}"`);
  console.log(`  - versionCode: ${calculatedVersionCode}`);
}

syncVersion();
