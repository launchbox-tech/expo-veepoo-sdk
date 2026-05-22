import XCTest

/// Native-side companion to `src/__tests__/native-async-surface.test.ts`: parses
/// the `.swift` sources under `ios/VeepooSDK/` and asserts that the AsyncFunction
/// names match the JS-side golden fixture. Pure file parsing — no XCTest
/// runtime dependency on the VeepooBleSDK framework, so this can run as a
/// standalone unit-test scheme without staging the vendored binaries.
///
/// Run via `pod lib lint` or by attaching a test target in the consumer Xcode
/// project; the podspec exposes this directory via the `test_spec 'Tests'`
/// block so `pod install --include-tests` is enough.
final class AsyncFunctionSurfaceTests: XCTestCase {
  private static let excludedBasenames: Set<String> = ["VeepooSDKSimulator.swift"]

  /// Walk up from the test bundle's location to find the repo root (the dir
  /// holding `package.json`). Works equally from a CocoaPods Test host and
  /// from `xcodebuild test`.
  private func repoRoot() throws -> URL {
    var current = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
    let fm = FileManager.default
    while !fm.fileExists(atPath: current.appendingPathComponent("package.json").path) {
      let parent = current.deletingLastPathComponent()
      if parent.path == current.path {
        throw XCTSkip("repo root with package.json not found from \(#filePath)")
      }
      current = parent
    }
    return current
  }

  private func collectAsyncFunctionNames(under root: URL) throws -> [String] {
    let fm = FileManager.default
    let enumerator = fm.enumerator(at: root, includingPropertiesForKeys: [.isRegularFileKey])!
    var names: [String] = []
    let regex = try NSRegularExpression(pattern: #"\bAsyncFunction\s*\(\s*"([^"]+)""#)
    for case let url as URL in enumerator {
      guard url.pathExtension == "swift" else { continue }
      if Self.excludedBasenames.contains(url.lastPathComponent) { continue }
      let source = try String(contentsOf: url, encoding: .utf8)
      let range = NSRange(source.startIndex..<source.endIndex, in: source)
      regex.enumerateMatches(in: source, range: range) { match, _, _ in
        guard let match = match,
              match.numberOfRanges >= 2,
              let nameRange = Range(match.range(at: 1), in: source) else { return }
        names.append(String(source[nameRange]))
      }
    }
    return names
  }

  func testEveryAsyncFunctionIsDeclaredInExactlyOneFile() throws {
    let root = try repoRoot()
    let names = try collectAsyncFunctionNames(under: root.appendingPathComponent("ios/VeepooSDK"))
    let duplicates = Dictionary(grouping: names, by: { $0 })
      .filter { $0.value.count > 1 }
      .mapValues { $0.count }
    XCTAssertTrue(duplicates.isEmpty, "Duplicate AsyncFunction names: \(duplicates)")
  }

  func testSurfaceMatchesGoldenFixture() throws {
    let root = try repoRoot()
    let fixtureURL = root.appendingPathComponent("src/__tests__/fixtures/native-async-surface.golden.json")
    let data = try Data(contentsOf: fixtureURL)
    let obj = try JSONSerialization.jsonObject(with: data) as? [String: Any] ?? [:]
    let expectedArray = obj["names"] as? [String] ?? []
    let expected = Set(expectedArray)

    let actual = Set(try collectAsyncFunctionNames(under: root.appendingPathComponent("ios/VeepooSDK")))

    let missing = expected.subtracting(actual).sorted()
    let extra = actual.subtracting(expected).sorted()
    XCTAssertTrue(missing.isEmpty, "Missing on iOS: \(missing)")
    XCTAssertTrue(extra.isEmpty, "Extra on iOS: \(extra)")
  }
}
