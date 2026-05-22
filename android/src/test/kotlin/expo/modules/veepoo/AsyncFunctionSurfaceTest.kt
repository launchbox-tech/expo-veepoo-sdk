package expo.modules.veepoo

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/**
 * Native-side companion to `src/__tests__/native-async-surface.test.ts`: parses
 * the same `.kt` sources from the source-set root and asserts the count and the
 * AsyncFunction names match the JS-side golden fixture. Running this in Gradle
 * (`./gradlew :gaozh1024-expo-veepoo-sdk:test`) catches a refactor that drops a
 * method even when the JS suite hasn't been run yet.
 *
 * No SDK or Android runtime needed — pure file parsing, so this test stays in
 * the `test` (JVM-only) source set, not `androidTest`.
 */
class AsyncFunctionSurfaceTest {
  private val sourceRoot: File =
    findProjectRoot().resolve("android/src/main/kotlin/expo/modules/veepoo")

  private val asyncFunctionRegex = Regex("""\bAsyncFunction\s*\(\s*"([^"]+)"""")

  /** Walk up from the working dir to the repo root (the dir holding `package.json`). */
  private fun findProjectRoot(): File {
    var current: File = File(System.getProperty("user.dir")!!).absoluteFile
    while (!current.resolve("package.json").exists()) {
      val parent = current.parentFile ?: error("repo root not found from ${System.getProperty("user.dir")}")
      current = parent
    }
    return current
  }

  private fun collectNames(root: File): List<String> {
    val out = mutableListOf<String>()
    root.walkTopDown()
      .filter { it.isFile && it.extension == "kt" }
      .forEach { file ->
        asyncFunctionRegex.findAll(file.readText()).forEach { match ->
          out += match.groupValues[1]
        }
      }
    return out
  }

  @Test
  fun `every AsyncFunction is declared in exactly one file`() {
    val names = collectNames(sourceRoot)
    val duplicates = names.groupingBy { it }.eachCount().filterValues { it > 1 }
    assertTrue(
      "Duplicate AsyncFunction names: $duplicates",
      duplicates.isEmpty(),
    )
  }

  @Test
  fun `surface matches the golden fixture`() {
    val fixtureFile = findProjectRoot().resolve(
      "src/__tests__/fixtures/native-async-surface.golden.json"
    )
    val fixture = fixtureFile.readText()
    val expected = Regex(""""([^"]+)"""")
      .findAll(fixture)
      .map { it.groupValues[1] }
      .filter { it != "description" && it != "names" && !it.contains(" ") }
      .toSortedSet()

    val actual = collectNames(sourceRoot).toSortedSet()
    assertEquals(expected, actual)
  }
}
