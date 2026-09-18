// Разрешения на микрофон — для shadowing, произношения и голосовых упражнений.
// Запускается один раз после `npx cap add ios|android`.
const fs = require("fs");
const which = process.argv[2];

if (which === "ios") {
  const p = "ios/App/App/Info.plist";
  let s = fs.readFileSync(p, "utf8");
  const add = {
    NSMicrophoneUsageDescription: "Микрофон нужен, чтобы записывать твою речь в упражнениях на произношение и shadowing.",
    NSSpeechRecognitionUsageDescription: "Распознавание речи проверяет, насколько точно ты произносишь слова и фразы.",
  };
  for (const [k, v] of Object.entries(add)) {
    if (!s.includes(`<key>${k}</key>`)) s = s.replace(/<dict>/, `<dict>\n\t<key>${k}</key>\n\t<string>${v}</string>`);
  }
  fs.writeFileSync(p, s);
  console.log("iOS: разрешения добавлены в Info.plist");
}

if (which === "android") {
  const p = "android/app/src/main/AndroidManifest.xml";
  let s = fs.readFileSync(p, "utf8");
  for (const perm of ["android.permission.RECORD_AUDIO", "android.permission.MODIFY_AUDIO_SETTINGS"]) {
    if (!s.includes(perm)) s = s.replace(/<\/manifest>/, `    <uses-permission android:name="${perm}" />\n</manifest>`);
  }
  fs.writeFileSync(p, s);
  console.log("Android: разрешения добавлены в AndroidManifest.xml");
}
