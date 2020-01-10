---
layout: post
title: 2019技术总结与开源项目成果展示
category: wordpress
description: 
---

这一年可能是我最清闲的一年，也可能是我最煎熬的一年，也可能是我寻找机会的一年，这一年我停下脚步思考，我的方向在哪里，在我忙碌中，我抬起头看了下这几年到底有哪些收获与遗憾

# 干货
**NOTE:** 我对干货的理解是直接展示你的代码，这比什么都重要。
长此以往，我学习一个新的技术，总是在不断寻找源码，因为只有在源码里我才能找到那些原理的本质，在面对诸如Oauth原理，tcp链接这些原理，大多数人容易迷失在这些概念中，没有找到具体的方案落地实现。最终导致对一项技术仅仅停留在原理层面，久而久之，渐渐的就忘记了。  
因此对于`干货`的理解，就是我对代码的理解，幸好在这个开源世界里，方案的实施必定伴随者相应的开源项目。这也就是为什么我喜欢开源，愿意开源，因为我的绝大数技术来源于开源，我必定会尽我所能，回报开源社区。

# 面试宝典
这一年看到太多的视频跟文章介绍面试过程中问题，重要知识点。当然这些知识点本身需要自己去梳理，但是在日常学习中，更多的是在于自己能否在项目中理解。理论指导实践，但实践也可以帮助自己验证理论，只有这样才能深刻理解这些概念。死记硬背，面试可能爽一时，但是最终给自己带来成就感的是你在自己项目中的运用。

# 技术广度

这一年来，我在不断扩展自己的知识广度，甚至来说，在不断扩充自己的技术栈，这有点像大家说的`全栈`。我个人还是不那么迷信全栈，因为我知道一个人精力是有限的，不可能对每一个技术投入百分之百的精力。现在我做的事情其实是在权衡，我更适合那个方向的开发工程师。正如之前我刚毕业做的是`java开发工程师`，之后转成了`Android开发工程师`，现在又重拾Java。但总的说来，我还是搞java的，这个本质并没有变，也还是专注业务的，实现技术服务于业务。  
  这一年从`java`到`docker`到`kubenetes`，从`android`到前端`vue`每当进入一个领域，深知各个领域需要深入，必定要付出巨大的代价。这一年，我在不断将技术落地，将我所学习的技术，用同一项目展示出来，同时又能兼顾我喜欢的领域，`即时通讯领域`。我在这个领域能够将我所了解的技术，进行统一的整合，形成一个现在[即时通讯项目](https://github.com/comsince/universe-push)


# 开源项目

**NOTE:** 最后分享以下上面提到即时通讯项目,这个项目对于java开发者来说，深入学习即时通讯领域相关知识是极其方便的，同时这也是一个产品级的实现

## [即时通讯服务端](https://github.com/comsince/universe_push)
基于t-io的即时消息通讯系统，采用Dubbo，SpringBoot的分布式架构，可以衍生出推送，群组通讯的基础架构 ，支持docker,k8s快速部署。Android版本支持私聊，群聊，支持voip通话，支持语音，短视频，图片，位置发送。web客户端使用vue，基于websocket进行通讯
## 即时通讯客户端
### [Android 版本](https://github.com/comsince/android-chat)

#### 项目预览
![image](/images/opensource/chat-show.gif)

> __<font color="#dd0000">扫码体验APK下载</font>__

![image](/images/opensource/qr-chat.png)

**NOTE:** 本apk基于[android-chat](https://github.com/comsince/android-chat)构建替换为java协议栈开发
* 请选择其中任何一个帐号密码进行登录即可

```properties
帐号：13800000000, 13800000001, 13800000002
密码：556677
```
### Web版本
* [Vue版本-github地址](https://github.com/comsince/vue-chat)

#### 项目预览
* 消息提示

![image](/images/wordpress//vue-chat-unread.png)

* 文字消息

![image](/images/wordpress//vue-chat.png)

* 图片消息

![image](/images/wordpress//vue-chat-pic.png)

* 视频消息

![image](/images/wordpress//vue-chat-video.png)

#### 项目演示
* [项目演示地址](http://www.comsince.cn/chat/index.html)
* 请选择其中任何一个帐号密码进行登录即可
```properties
帐号：13800000000, 13800000001, 13800000002
密码：556677
```

