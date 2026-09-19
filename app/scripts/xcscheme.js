// Общая схема Xcode для сборки без запуска Xcode (нужна CI).
// На маке Xcode делает такую схему сам при первом открытии проекта,
// поэтому скрипт безвреден: если схема уже есть, он ничего не трогает.
const fs = require("fs");
const path = require("path");

const proj = "ios/App/App.xcodeproj";
const dir = path.join(proj, "xcshareddata", "xcschemes");
const file = path.join(dir, "App.xcscheme");

if (fs.existsSync(file)) {
  console.log("iOS: схема App уже есть");
  process.exit(0);
}

const pbx = fs.readFileSync(path.join(proj, "project.pbxproj"), "utf8");
const m = pbx.match(/([0-9A-F]{24}) \/\* App \*\/ = \{\s*isa = PBXNativeTarget;/);
if (!m) {
  console.error("iOS: не нашёл таргет App в project.pbxproj");
  process.exit(1);
}
const blueprint = m[1];

const scheme = `<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion = "1500" version = "1.7">
   <BuildAction parallelizeBuildables = "YES" buildImplicitDependencies = "YES">
      <BuildActionEntries>
         <BuildActionEntry buildForTesting = "YES" buildForRunning = "YES" buildForProfiling = "YES" buildForArchiving = "YES" buildForAnalyzing = "YES">
            <BuildableReference
               BuildableIdentifier = "primary"
               BlueprintIdentifier = "${blueprint}"
               BuildableName = "App.app"
               BlueprintName = "App"
               ReferencedContainer = "container:App.xcodeproj">
            </BuildableReference>
         </BuildActionEntry>
      </BuildActionEntries>
   </BuildAction>
   <TestAction buildConfiguration = "Debug" selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv = "YES">
      <Testables>
      </Testables>
   </TestAction>
   <LaunchAction buildConfiguration = "Debug" selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB" launchStyle = "0" useCustomWorkingDirectory = "NO" ignoresPersistentStateOnLaunch = "NO" debugDocumentVersioning = "YES" debugServiceExtension = "internal" allowLocationSimulation = "YES">
      <BuildableProductRunnable runnableDebuggingMode = "0">
         <BuildableReference
            BuildableIdentifier = "primary"
            BlueprintIdentifier = "${blueprint}"
            BuildableName = "App.app"
            BlueprintName = "App"
            ReferencedContainer = "container:App.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </LaunchAction>
   <ProfileAction buildConfiguration = "Release" shouldUseLaunchSchemeArgsEnv = "YES" savedToolIdentifier = "" useCustomWorkingDirectory = "NO" debugDocumentVersioning = "YES">
      <BuildableProductRunnable runnableDebuggingMode = "0">
         <BuildableReference
            BuildableIdentifier = "primary"
            BlueprintIdentifier = "${blueprint}"
            BuildableName = "App.app"
            BlueprintName = "App"
            ReferencedContainer = "container:App.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </ProfileAction>
   <AnalyzeAction buildConfiguration = "Debug">
   </AnalyzeAction>
   <ArchiveAction buildConfiguration = "Release" revealArchiveInOrganizer = "YES">
   </ArchiveAction>
</Scheme>
`;

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(file, scheme);
console.log("iOS: схема App создана");
