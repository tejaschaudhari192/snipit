/**
 * Script to trigger GitHub Actions Android build and provide direct APK download link.
 */
const appJson = require('../app.json');
const version = appJson.expo.version;
const build = appJson.expo.android?.versionCode ?? 1;

console.log("==================================================================");
console.log(`🚀 Building Snipit Android APK v${version} (Build ${build})`);
console.log("==================================================================\n");

console.log("🔗 Workflow Dashboard:");
console.log("   https://github.com/tejaschaudhari192/snipit/actions/workflows/build-android.yml\n");

console.log("📦 Direct APK Download URLs (Available after workflow completes):");
console.log("   • 🌐 Universal Default Link    : https://github.com/tejaschaudhari192/snipit/releases/download/mobile-latest/snipit.apk (Used by In-App Updates)");
console.log(`   • ⚡ Modern Phones (arm64-v8a) : https://github.com/tejaschaudhari192/snipit/releases/download/mobile-latest/Snipit-v${version}-arm64-v8a-release.apk`);
console.log(`   • 📱 Older Phones (armeabi-v7a) : https://github.com/tejaschaudhari192/snipit/releases/download/mobile-latest/Snipit-v${version}-armeabi-v7a-release.apk`);
console.log(`   • 📦 Versioned Universal APK   : https://github.com/tejaschaudhari192/snipit/releases/download/mobile-latest/Snipit-v${version}-universal-release.apk\n`);

console.log("💡 Tip: Any git push to 'main' automatically triggers the build and");
console.log("   publishes both APK links! You can also trigger it manually at");
console.log("   the dashboard link above.\n");
