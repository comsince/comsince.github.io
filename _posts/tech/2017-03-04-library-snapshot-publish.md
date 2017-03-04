---
layout: post
title: "Android开源库测试发布流程"
description: 本文主要是要向大家分享如何使用JFrog Artifactory，Bintray实现Library库从开发阶段snapshot版本到release版本发布的经验
category: tech
---

## 概述
本文主要是要向大家分享如何使用JFrog Artifactory，Bintray实现Library库从开发阶段snapshot版本到release版本发布的经验

## 一 工具介绍

### 1.1 JFrog Bintray

Bintray 是一个非常好的库托管平台，深受开发者的喜爱，有很多优秀的开源库，都托管在此；Gradle默认是支持jcenter自动依赖下载的，我们完全可以依赖其发布我们自己的开源库

关于Bintray的注册可以参考[Register_Jcenter](https://comsince.github.io/2017/03/04/jcenter-register/)这篇文章

**NOTE:** 注意你的用户名和apikey它将是你以后需要频繁使用的参数

### 1.2 JFrog Artifactory

上面我们知道Bintray是非常好的库托管平台，开始其支持发布release版本的库。但是其不支持快照版本的发布，显然artifactory为我们提供了很好的选择。 


## 二 申请流程

### 2.1 申请加入oss.jfrog.org

* 首先你要申请将你的开源库发布到jcenter中，如下图所示:
![image](/images/tech/library-snapshot-publish/oss_stage_snapshot.png)

* 点击红色箭头的，跳转到如下界面
![image](/images/tech/library-snapshot-publish/send_stage_request.png)
  注意填写正确你的GroupId，将来你上传到Jfrog Atifactory时，必须要与这个groupId才能上传正确，不然会报403错误   
  点击sendRequest后，需要等待半天时间，如果国内是白天，美国时间毕竟也是晚上，所以一般第二天可以收到申请通过的消息
  
## 三 发布快照版本到Artifactory

当你成功收到bintray发来的如下信息后，如下图：
![image](/images/tech/library-snapshot-publish/stage_approved.png)
就代表如下信息已经生成了

### 3.1 登录

* 登录oss.jfrog.org
  相信这个问题会一直困扰大家，其实你在jcenter申请成功后，bingtray的username和apikey就已经自动成为你登录这个网站的用户名和密码
* 这个groupId已经自动添加到oss-release-local 和 the oss-snapshot-local 两个仓库中，如下图:

![image](/images/tech/library-snapshot-publish/artifactory-repository.png)

### 3.2 Gradle插件集成

* 发布插件到JFrog Artifactory
  如果你想通过Artifactory Gradle Plugin 发布开源库，可以利用如下插件实现[Gradle_Plugin_For_Publish](https://comsince.github.io/2017/02/21/gradle-plugin-for-publish/)

### 3.3 完成快照版本发布

* 发布完成后，可以到这里查看，如下图

![iamge](/images/tech/library-snapshot-publish/library-publish-result.png)

### 3.3 发布到Jcenter
Release版本发布
如果快照版本测试通过，这时就要将其发布到jcenter供开发者使用，官网提供了如下两种方式：
* 使用Jinkins Artifitory Plugin
* 调用发布API
这里我们使用第二种方式，直接调用api的方式，首先看下面的build信息，注意buildnumber

![image](/images/tech/library-snapshot-publish/snapshot_build_success_info.png)

使用curl命令如下:
```
curl -X POST --header "content-length:0" -u bintrayUser:apiKey http://oss.jfrog.org/api/plugins/build/promote/snapshotsToBintray/${buildName}/${buildNum}
```

buildName和buildNum可以在这里查看
![image](/images/tech/library-snapshot-publish/build_info.png)

发布Gradle_Plugin_For_Publish至Jcenter命令如下:

```
curl -X POST --header "content-length:0" -u bintrayUser:apiKey http://oss.jfrog.org/api/plugins/build/promote/snapshotsToBintray/Gradl
e_Plugin_For_Publish/1488605898350

成功信息如下：Build Gradle_Plugin_For_Publish/1488605898350 has been successfully promoted
```

此时你的snapshot版本就自动发布到jcenter中去了


## 参考文档

* [官方文档-如果发布快照版本到oss.jfrog.org](https://www.jfrog.com/confluence/display/RTF/Deploying+Snapshots+to+oss.jfrog.org#DeployingSnapshotstooss.jfrog.org-PromotingaBuildUsingRESTAPI)