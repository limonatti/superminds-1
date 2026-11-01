import Foundation
import Vision
import AppKit
let dir = CommandLine.arguments[1], output = CommandLine.arguments[2]
let files = try FileManager.default.contentsOfDirectory(atPath: dir).filter { $0.hasSuffix(".jpg") }.sorted()
for file in files {
 let destination = URL(fileURLWithPath: output).appendingPathComponent(file+".json")
 if FileManager.default.fileExists(atPath: destination.path) { continue }
 try autoreleasepool {
  let url = URL(fileURLWithPath:dir).appendingPathComponent(file)
  guard let img=NSImage(contentsOf:url),let cg=img.cgImage(forProposedRect:nil,context:nil,hints:nil) else {return}
  let request=VNRecognizeTextRequest(); request.recognitionLevel = .accurate; request.recognitionLanguages=["en-US"]; request.usesLanguageCorrection=false
  try VNImageRequestHandler(cgImage:cg,options:[:]).perform([request])
  let rows=(request.results ?? []).compactMap { o -> [String:Any]? in
   guard let t=o.topCandidates(1).first else{return nil}
   return ["text":t.string,"x":o.boundingBox.minX,"y":1-o.boundingBox.maxY,"w":o.boundingBox.width,"h":o.boundingBox.height,"confidence":t.confidence]
  }
  try JSONSerialization.data(withJSONObject: rows).write(to:destination)
 }
 print(file)
}
