import Foundation
import PDFKit
import AppKit
// Render the COMPLETE PDF page, including text and vector layers.
let pdf=PDFDocument(url:URL(fileURLWithPath:CommandLine.arguments[1]))!
let output=CommandLine.arguments[2]
let pages=CommandLine.arguments[3].split(separator:",").compactMap{Int($0)}
for number in pages {
  autoreleasepool {
    let page=pdf.page(at:number-1)!,bounds=page.bounds(for:.mediaBox)
    let width=1600, height=Int(Double(width)*bounds.height/bounds.width)
    let color=CGColorSpaceCreateDeviceRGB()
    let context=CGContext(data:nil,width:width,height:height,bitsPerComponent:8,bytesPerRow:0,space:color,bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
    context.setFillColor(CGColor.white);context.fill(CGRect(x:0,y:0,width:width,height:height))
    context.scaleBy(x:Double(width)/bounds.width,y:Double(height)/bounds.height)
    context.translateBy(x:-bounds.minX,y:-bounds.minY)
    page.draw(with:.mediaBox,to:context)
    let image=NSBitmapImageRep(cgImage:context.makeImage()!)
    try! image.representation(using:.jpeg,properties:[.compressionFactor:0.9])!.write(to:URL(fileURLWithPath:output).appendingPathComponent(String(format:"%03d.jpg",number)))
  }
}
