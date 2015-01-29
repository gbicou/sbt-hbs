resolvers += Resolver.sbtPluginRepo("releases")

libraryDependencies ++= Seq(
  "org.scala-sbt" % "scripted-plugin" % sbtVersion.value
)

addSbtPlugin("me.lessis" % "bintray-sbt" % "0.1.2")

addSbtPlugin("com.github.gseitz" % "sbt-release" % "0.8.5")

