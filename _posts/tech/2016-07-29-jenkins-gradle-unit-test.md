---
layout: post
title: "Jenkins+Gradle Plugin+Android Unit Test"
description: jenkin api and gradle plugin for Android unit test
category: tech
---

## 一. 概述
Android 自动化单元测试一直困扰着广大开发者，可以说是一种从入门到"放弃"的技术方案，本片文章将从下面几个方面说明我在利用自动化构建工具促进Android自动化测试的经验

* Jenkins自动化构建
* Gradle Plugin自动构建任务功能
* Android Unit Test 测试概述与说明

![自动化测试架构设计说明](/images/android/Jenkins-Gradle-Android-Unit-Test.png)

## 二. Jenkins
### 2.1 Jenkins 环境搭建
* [Jenkins Install](https://wiki.jenkins-ci.org/display/JENKINS/Installing+Jenkins)
* [Jenkins Server Start](http://stackoverflow.com/questions/14869311/start-stop-and-restart-jenkins-service-on-windows)   
* [Securing Jenkins](https://wiki.jenkins-ci.org/display/JENKINS/Securing+Jenkins) 
* [Basic auth 权限认证](https://wiki.jenkins-ci.org/display/JENKINS/Authenticating+scripted+clients) 为解决Jenkins下载APK权限认证问题

**NOTE:** Windows部署jenkins注意关闭网络防火墙，不然其他机器无法访问

### 2.2 Jenkins Job And Plugin
#### 2.2.1 [Remote access API](https://wiki.jenkins-ci.org/display/JENKINS/Remote+access+API)
* retrieve information from Jenkins for programmatic consumption
* trigger a new build

   ```
    curl -X POST http://username:token@jenkins.rnd.meizu.com/view
    /StandAlone/job/StandAlone_InternetPlatform_Common/build?token=common
   ```
* create/copy jobs

#### 2.2.2 Jenkins Aritfactory Plugin
* [Artifactory Plugin](https://wiki.jenkins-ci.org/display/JENKINS/Artifactory+Plugin)
  jenkins 良好的扩展性，有很多相关的插件供开发者使用，artifactory plugin 可以集成artifactory自定发包的功能，这里我们主要使用artifactory插件的功能默认读取管理员账户的信息调用gradle插件自动发布aar包

* [Emial Notification Plugin]()
   提供编译信息及时发送代码发布者功能

## 三 Gradle 
### 3.1 Gradle Plugin
   利用gradle plugin良好的扩展性，进行基本的流程规范，目前测试的基本流程如下：
   开发者上传代码->触发jenkin自动化测试任务->自动进行打包测试apk->调用ATS测试平台进行单元测试->上传测试结果->自动发布aar


### 3.2 利用gradle实现单元测试插件
* [Platform_Gradle插件项目](http://gitlab.meizu.com/liaojinlong/Platform_Gradle)

### 3.3 AndroidJunitRunner实现测试结果分析上报项目
* [Library for androidJunitRuner and Test Reporter](http://gitlab.meizu.com/liaojinlong/Platform-AndroidJunitRunner/tree/master/AndroidJunitTestReportLib#README)

### 3.4 基本参数说明
   Gradle Plugin 默认读取以下配置进行相关的单元测试,gradle通过读取gradle properties属性进行命令配置

#### 3.4.1 设置Library测试包名

```
   -PtestClass=xx.xx.xxx.xxx
```

#### 3.4.2 设置Jenkins地址,默认为魅族jenkins服务地址，这个功能主要用来测试自己搭建的jenkins服务器

```
  -Phost=http://xxx.xxx.xxx.xxx
```

### 3.5 TASK
* 编译并上传目标和测试apk

```
  ./gradlew clean uploadTestApk  
```

此任务包含两种Application和Library两种构建任务，Application 任务不需要发布aar.完整的执行library测试发布的命令如下:

```
./gradlew clean uploadTestApk -PtestClass=com.example.android.library -Phost=http://172.17.202.107:8080
```


### 3.6 Type of Gradle Plugin 补充说明Gradle插件设计
#### 3.6.1 [Build script](https://github.com/adavis/caster-io-samples/tree/master/GradlePluginBasics)
You can include the source for the plugin directly in the build script. This has the benefit that the plugin is automatically compiled and included in the classpath of the build script without you having to do anything. However, the plugin is not visible outside the build script, and so you cannot reuse the plugin outside the build script it is defined in. 
#### 3.6.2 [buildSrc project](https://github.com/adavis/caster-io-samples/tree/master/GradlePluginIntermediate)
You can put the source for the plugin in the rootProjectDir/buildSrc/src/main/groovy directory. Gradle will take care of compiling and testing the plugin and making it available on the classpath of the build script. The plugin is visible to every build script used by the build. However, it is not visible outside the build, and so you cannot reuse the plugin outside the build it is defined in.
 See Chapter 41, Organizing Build Logic for more details about the buildSrc project.
#### 3.6.3 [Standalone project](https://github.com/adavis/caster-io-samples/tree/master/sample-plugin)
You can create a separate project for your plugin. This project produces and publishes a JAR which you can then use in multiple builds and share with others. Generally, this JAR might include some custom plugins, or bundle several related task classes into a single library. Or some combination of the two. 

### 3.7 write custom android gradle plugin
* [Create a Standalone Gradle plugin for Android - a step-by-step guide ](https://afterecho.uk/blog/create-a-standalone-gradle-plugin-for-android-a-step-by-step-guide.html)
* [Create a Standalone Gradle plugin for Android - part 2 ](https://afterecho.uk/blog/create-a-standalone-gradle-plugin-for-android-part-2.html)
* [Create a Standalone Gradle plugin for Android - part 3 ](https://afterecho.uk/blog/create-a-standalone-gradle-plugin-for-android-part-3.html)


## 四 Android Test Support Library
### 4.1 Android Test 现有技术支持
* [Getting startedf with testing](https://developer.android.com/training/testing/start/index.html)
  介绍Android 测试的两种测试，本地模拟测试和真机测试
* [A collection of samples demonstrating different frameworks and techniques for automated testing](https://github.com/googlesamples/android-testing)
* [Android Testing Support Library](https://google.github.io/android-testing-support-library/docs/index.html)

### 4.2 Android 单元测试类型
#### 4.2.1 本地单元测试

  * Dependence build.gradle

```
	dependencies {
	    // Required -- JUnit 4 framework
	    testCompile 'junit:junit:4.12'
	    // Optional -- Mockito framework
	    testCompile 'org.mockito:mockito-core:1.10.19'
	}
```
#### 4.2.2 真机模拟测试

  * Dependence build.gradle

```
    androidTestCompile 'com.android.support:support-annotations:23.0.1'
    androidTestCompile 'com.android.support.test:runner:0.4.1'
    androidTestCompile 'com.android.support.test:rules:0.4.1'
    // Optional -- Hamcrest library
    androidTestCompile 'org.hamcrest:hamcrest-library:1.3'
    // Optional -- UI testing with Espresso
    androidTestCompile 'com.android.support.test.espresso:espresso-core:2.2.1'
    // Optional -- UI testing with UI Automator
    androidTestCompile 'com.android.support.test.uiautomator:uiautomator-v18:2.1.1'

```

  * build.gradle defaultConfig

```
	android {
	    defaultConfig {
		testInstrumentationRunner "android.support.test.runner.AndroidJUnitRunner"
	    }
	}

```

## 参考文档

* [Android 单元测试工具概览](https://github.com/codepath/android_guides/wiki/Android-Testing-Options)
* [美团技术博客-Android单元测试研究与实践](http://tech.meituan.com/Android_unit_test.html)
* [Unit Testing with Robolectric](https://github.com/codepath/android_guides/wiki/Unit-Testing-with-Robolectric)