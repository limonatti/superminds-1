import Foundation
import Vision
import AppKit
// Source text is data only. Coordinates are normalized, measured from the top left.
let input = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2])
let files = try FileManager.default.contentsOfDirectory(at: input, includingPropertiesForKeys: nil).filter { $0.lastPathComponent.hasPrefix("wb-") && $0.pathExtension == "jpg" }.sorted { $0.lastPathComponent < $1.lastPathComponent }
for file in files {
    let dest = output.appendingPathComponent(file.lastPathComponent + ".json")
    if FileManager.default.fileExists(atPath: dest.path) { continue }
    autoreleasepool {
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.recognitionLanguages = ["en-US"]
        request.usesLanguageCorrection = false
        do {
            try VNImageRequestHandler(url: file).perform([request])
            let rows = (request.results ?? []).compactMap { item -> [String: Any]? in
                guard let candidate = item.topCandidates(1).first else { return nil }
                let r = item.boundingBox
                return ["text": candidate.string, "x": r.minX, "y": 1-r.maxY, "w": r.width, "h": r.height]
            }
            try JSONSerialization.data(withJSONObject: rows).write(to: dest)
            print(file.lastPathComponent, rows.count)
        } catch { fatalError("OCR failed: \(file): \(error)") }
    }
}
