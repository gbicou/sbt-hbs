import bintray.Keys._

sbtPlugin := true

organization := "com.bicou.sbt"

name := "sbt-hbs"

version := "0.0.2-SNAPSHOT"

scalaVersion := "2.10.4"

libraryDependencies ++= Seq(
  "org.webjars" % "mkdirp" % "0.5.0"
)

resolvers ++= Seq(
  "Typesafe Releases Repository" at "http://repo.typesafe.com/typesafe/releases/",
  Resolver.url("sbt snapshot plugins", url("http://repo.scala-sbt.org/scalasbt/sbt-plugin-snapshots"))(Resolver.ivyStylePatterns),
  Resolver.sonatypeRepo("snapshots"),
  "Typesafe Snapshots Repository" at "http://repo.typesafe.com/typesafe/snapshots/",
  Resolver.mavenLocal
)

addSbtPlugin("com.typesafe.sbt" %% "sbt-js-engine" % "1.0.2")

publishMavenStyle := false

seq(bintraySettings:_*)

repository in bintray := "sbt-plugins"

bintrayOrganization in bintray := None

licenses += ("MIT", url("http://opensource.org/licenses/MIT"))

pomExtra := (
  <scm>
    <url>git@github.com:bicouy0/sbt-hbs.git</url>
    <connection>scm:git:git@github.com:bicouy0/sbt-hbs.git</connection>
  </scm>
  <developers>
    <developer>
      <id>bicouy0</id>
      <name>Benjamin Viellard</name>
      <url>https://github.com/bicouy0</url>
    </developer>
  </developers>
)

scriptedSettings

scriptedBufferLog := false

scriptedLaunchOpts <+= version apply { v => s"-Dproject.version=$v" }
