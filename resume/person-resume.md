---
layout: wiki
title: "【Overview】- 个人简介"
categories: [Android, Tech]
description: 个人Github博客内容说明汇总
keywords: Java,Web
---

# 简介

我是(comsince)目前就职于[魅族科技](http://www.meizu.com),目前负责魅族推送服务与第三方推送SDK。喜欢研究技术，乐于分享，喜欢研究开源项目，并善于使用其解决项目中实际问题，研究不仅限于移动端领域，目前主要研究服务端领域，致力于分布式高并发高可用服务实践。始终认为不断完善与丰富知识体系，不断的分享与实践是对个人成长乃至团队共同进步的关键  
* [个人技术博客](https://comsince.github.io)

# 技术栈
* __Android 开发__：4年安卓开发经验，具有完整的项目实践经验，熟练掌握安卓开发流程，熟悉多线程，网络IO。熟练使用gradle构建工具，对安卓开发，测试，集成有自己独到的见解。

* __服务端开发__: 熟悉服务端基本开发流程，熟练使用SSM框架构建web应用。熟悉常见的开源框架，并深入了解过分布式RPC框架的实现原理

# 技能领域

* __Android Application Development__
* __Android 推送架构__
* __J2EE 分布式高可用高并发__
* __分布式搜索Solr__


# 工作经验

## 魅族Flyme开放推送
* 负责魅族推送开放平台客户端推送服务开发，第三方推送SDK开发与维护
* 从零开始构建魅族推送SDK，完善魅族第三方推送接入生态，建立[魅族推送开发小组](https://github.com/MEIZUPUSH)
* 针对推送服务长连接多次进行优化，降低待机功耗，提高消息到达率，实现日均在在线用户2000多万，日均15亿的推送，并不断保持增长
* 为提高PushSDK接入简易性以及安全性，不断重构代码，实现魅族应用商店Top100应用高达80%的接入率，包括`百度浏览器`，`今日头条`，`腾讯新闻`,`京东`,`美团`等头部应用
* 规范PushSDK接入包，测试，正式发布流程

在进行魅族PushSDK推送过程中，也更加认识到开源协作的力量，更加坚信走开源道路，将自己在开发中遇到的问题以代码和文档的形式分享给社区，也为我们推送做出了很大贡献

**关键词:** <button class="btn btn-outline" type="button">推送</button> 
<button class="btn btn-outline" type="button">长连接</button>
<button class="btn btn-outline" type="button">电量优化</button>
<button class="btn btn-outline" type="button">接入率</button>
<button class="btn btn-outline" type="button">自动发布</button> 

## 全局搜索项目
基于Flyme各项业务包括`应用商店`，`游戏中心`，`主题美化`，`用户反馈`需要实现应用内垂直搜索业务，进而集中基于solr统一实现应用内搜索功能
* 为各个业务提供RPC高性能搜索接口
* 托管各个业务的核心数据到solr，进行集中搜索

项目基于魅族自研的RPC框架kiev实现分布式服务，利用solr-cloud构建集群集中管理数据，实现搜索规则即时修改生效，为其他业务提供个性化的搜索业务，基于此项目也让我更加深刻了解到[分布式搜索服务的整个流程与实现方案](https://comsince.github.io/wiki/2018-12-14-solr-06-enterprise-practice/)

**关键词:** 
<button class="btn btn-outline" type="button">Solr</button>
<button class="btn btn-outline" type="button">RPC远程调用</button>
<button class="btn btn-outline" type="button">魅族Kiev</button>
<button class="btn btn-outline" type="button">Spring框架</button>  


# 开源项目

* __[Gradle_Plugin_For_Publish](https://github.com/comsince/Gradle_Plugin_For_Publish)__: Android 开源库发布插件，梳理Maven Center，与Jcenter的发布流程，提炼出关键配置，以插件的形式开放给开发者，只在帮助开发者快捷发布开源库

* __[ups_meizu_pushsdk](https://github.com/comsince/ups_meizu_pushsdk)__: 基于魅族统一推送平台构建的统一PushSDK，旨在实现魅族，小米，华为等PushSDK的统一接入,帮助开发者一次接入即可省去对接各个平台的工作，快捷高效

* __[universe_push](https://gitee.com/comsince/universe_push)__:基于T-io的即时消息分发系统，采用Dubbo，SpringBoot的分布式架构，可以衍生出推送，聊天，群组通讯的基础架构 ，内附NIO PushSdk方便android 设备接入 

# 联系方式

* __邮箱__：`ljlong_2008@126.com`
* [github](https://github.com/comsince)
* [gitee](https://gitee.com/comsince)