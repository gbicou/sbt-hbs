import bintray.Keys._

sbtPlugin := true

organization := "com.bicou.sbt"

name := "sbt-hbs"

scalaVersion := "2.10.4"

resolvers += Resolver.typesafeRepo("releases")

libraryDependencies ++= Seq(
  "org.webjars" % "mkdirp" % "0.5.0"
)

addSbtPlugin("com.typesafe.sbt" %% "sbt-js-engine" % "1.0.2")

publishMavenStyle := false

bintraySettings

repository in bintray := "sbt-plugins"

bintrayOrganization in bintray := None

licenses += ("MIT", url("http://opensource.org/licenses/MIT"))

scriptedSettings

scriptedBufferLog := false

scriptedLaunchOpts += ("-Dproject.version=" + version.value )

