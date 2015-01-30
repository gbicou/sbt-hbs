import JsEngineKeys._

lazy val root = (project in file(".")).enablePlugins(SbtWeb)

JsEngineKeys.engineType := JsEngineKeys.EngineType.Node

val check = taskKey[Unit]("check that file contents are handlebars partial")

check := {
  val contents = IO.read(file("target/web/stage/_test.js"))
  if (!contents.contains("Handlebars.partials['_test'] = template(")) {
    sys.error(s"Expected template declaration: $contents")
  }
}
