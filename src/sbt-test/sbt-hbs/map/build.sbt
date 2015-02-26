import JsEngineKeys._

lazy val root = (project in file(".")).enablePlugins(SbtWeb)

JsEngineKeys.engineType := JsEngineKeys.EngineType.Node

HbsKeys.map := true

val check = taskKey[Unit]("check that file contents are handlebars template")

check := {
  val contents = IO.read(file("target/web/stage/test.js"))
  if (!contents.contains("# sourceMappingURL=")) {
    sys.error(s"Expected source mapping URL: $contents")
  }
}
