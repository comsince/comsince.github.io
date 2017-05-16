---
layout: post
title: "持续集成在开源项目中的应用"
description: 探讨持续集成开github开源项目中的应用
category: tech
---

## 一. 概述

将简单而重复的劳动尽量的交由机器自动执行，提高行业效率，工业智能制造显然已经讲这种自动化的思想运用的淋漓尽致；软件工程也希望运用这种思想持续规范软件开发，测试，发布流程
因此有了以下三种概念

### 持续集成 
持续集成的目的，就是让产品可以快速迭代，同时还能保持高质量。它的核心措施是，代码集成到主干之前，必须通过自动化测试。只要有一个测试用例失败，就不能集成。

### 持续交付
持续交付（Continuous delivery）指的是，频繁地将软件的新版本，交付给质量团队或者用户，以供评审。如果评审通过，代码就进入生产阶段。

### 持续部署
持续部署（continuous deployment）是持续交付的下一步，指的是代码通过评审以后，自动部署到生产环境。


## 二. 名词解释
### Unit Test 
     利用单元测试，验证代码正确性以及覆盖率等数据
### [CoverAlls](https://coveralls.io)
      代码覆盖率统计平台，支持可视化显示代码测试的覆盖率数据
### Artifactory SnapShot-Repo
      免费的snapshot代码仓库托管平台
### Bintray Jcenter
      提供正式版本的开源库托管平台
### [Travis](https://travis-ci.org/)
      开源的持续集成平台
### [GitHub](https://github.com)
      开源的代码托管平台
### Gradle
      自动化编译工具，比maven更加强大，可自动定制插件实现持续集成中功能


具体的流程图如下:
![image](/images/tech/continuous-intergration/continuous-overall.png)

## 三. 流程说明
在这个模型中，触发集成的操作始终试一次用户的代码提交，之后再经过单元测试->发布单元测试代码覆盖率报告->发布SNAPSHOT版本库->手工测试通过,发布Release版本库
可以看出出来需要持续集成平台和代码覆盖率平台支持外，很大一部分工作，需要定制插件实现测试，发布等流程。综合起来看，需要以下插件支持

* 单元测试覆盖率插件Jacoco
* [版本库自动发布发布插件，需要同时支持artifactory和jcenter发布](https://github.com/comsince/Gradle_Plugin_For_Publish)
* [覆盖率报告上传插件](https://github.com/comsince/coveralls-gradle-plugin)

## 四 演示说明
以下将以这个[开源项目](https://github.com/comsince/snowplow-android-tracker) 说明各个平台的使用

### 4.1. 代码覆盖率统计平台
   代码覆盖率插件上传覆盖率报告后，此平台可以进行代码覆盖率趋势查看以及各个类测试率报告如下：
   ![image](/images/tech/continuous-intergration/coverall-snow-android-tracker.png)
### 4.2. 持续集成平台Travis
   Travis和Jenkins都是比较常用的持续集成平台，但是Travis与Github天然集成，成为许多开源项目的首选的持续集成工具
   以下是一次编译的日志
   ![image](/images/tech/continuous-intergration/travis-build-log.png)

   Travis有强大的配置功能具体，详见其文档说明,以下是其Android编译配置

```
	sudo: required
	language: android
	jdk: oraclejdk8

	env:
	  matrix:
	    - ANDROID_SDKS=android-19 ANDROID_TARGET=android-19 ANDROID_ABI=armeabi-v7a ANDROID_TRAVIS=1
	  global:
	    - secure: "pkt0Y6LdYl2Fgd7h8Q/6RQvqWdRU0sUz5irvZwtonbEH7DPxMgZNv/hXQrrjT9PoaM4RGNPyLX3/FrUSeSnY+OLKfdbDhhWFkY/Wjd+h9JAw2vnzy7VG9/s7l7jDYcQXIZlBwSBsbwHjCKhtismXL6FDWcKl19GlFH8IkKKBSmRFKO7okBKDe2nk9u0MY/J9uuZLvvQTosWV1Gvm+TjMiLbGuQdjpKdq7Kn6MA+8PwHl/9ja1e3bSd0aXZuOm4KD55DyHUQoI/ZkgutFwx2yJqtTJNQsfLJ8E9IfHusZQIHe5QBVOJiwOTlYQXysbp+8j2Iw2uQ25bHTlu5ceCT+BymOsGAe/Ku/93Td88w3zAE4Wk9Ti7uXYyDSFLnwnAWJrunk8kCNUzpuPX39o/un6aZQGCRKYDTuIkGn0vHkxG0HfiCAoBMdb6HQ3JEcC9s/wIQZk6q8rx+o5GweYUKm8Y6VgJN/fZX7C5OO+N+4DAz48oO1xB1SRKloL0Db9X9wCovBa5I+FmuCrecPmXWzFPDMe19xas0PcrxLpQjTrTrB8InL62dYaZT2LjGE7WA2cjSqYSVpmCzLBpOknd7ce5N6xxapjCxNUZQSS+rxigB6DquNA2i7FJT26OoPYH3GuA7iOl34VGWj1IZQ7VQwxWNBT6Zy0IM/vchIvvi7Ddo="
	android:
	  components:
	    - tools
	    - platform-tools
	    - build-tools-23.0.3
	    - android-23
	    - extra-android-support
	    - extra-google-m2repository
	    - extra-google-google_play_services
	    - extra-android-m2repository

	before_script:
	  - echo no | android create avd --force -n test -t $ANDROID_TARGET --abi $ANDROID_ABI
	  - emulator -avd test -no-skin -no-audio -no-window &
	  - chmod +x ./ci/wait_for_emulator
	  - ./ci/wait_for_emulator
	  - adb shell input keyevent 82 &

	script:
	  - ./gradlew createDebugCoverageReport coveralls

	deploy:
	  skip_cleanup: true
	  provider: script
	  script: ./.travis/deploy.sh $TRAVIS_TAG
	  on:
	    tags: true
```

## 六 总结
然后在开源项目配置编译以及代码覆盖率连接，就可以实时查看项目状态
![image](/images/tech/continuous-intergration/project-readme.png)
## 参考文档

* [持续集成是什么](http://www.ruanyifeng.com/blog/2015/09/continuous-integration.html)
* [让你的Github项目持续集成，基于Travis-CI Coveralls](https://www.jerrylou.me/%E5%B7%A5%E5%85%B7/howto-github-travisci-coveralls-20170120.html)
