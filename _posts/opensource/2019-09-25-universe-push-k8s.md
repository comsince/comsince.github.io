---
layout: post
title: 支持k8s集群部署的分布式即时聊天系统
category: opensource
description: 
---

[![Build Status](https://travis-ci.org/comsince/universe_push.svg?branch=master)](https://travis-ci.org/comsince/universe_push)
[![GitHub license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/comsince/universe_push/blob/master/LICENCE)
[![Gitee stars](https://gitee.com/comsince/universe_push/badge/star.svg?theme=white)](https://gitee.com/comsince/universe_push)
[![GitHub stars](https://img.shields.io/github/stars/comsince/universe_push?style=social)](https://github.com/comsince/universe_push)

## 适合快速部署的聊天系统
这是一个聊天系统的简单架构，解决大量用户需要即时通讯的解决方案，基于RPC框架Dubbo,SpringBoot构建微服务应用，提供Docker快速部署的解决方案。
提供Android客户端类似微信功能，包括`好友添加`，`私聊`，`群聊`，等基本功能

![image](https://user-gold-cdn.xitu.io/2019/9/20/16d4d5136e26d163?w=270&h=480&f=gif&s=2938622)

> __<font color="#dd0000">扫码体验APK下载</font>__

![image](https://user-gold-cdn.xitu.io/2019/9/20/16d4d513b16a76dd?w=256&h=256&f=png&s=4365)

**NOTE:** 本apk基于[android-chat](https://github.com/comsince/android-chat)构建替换为java协议栈开发
* 请选择其中任何一个帐号密码进行登录即可

```properties
帐号：13800000000, 13800000001, 13800000002
密码：556677
```

## 服务说明
聊天系统为了适应大规模用户的链接请求，将服务分为`链接服务`和`消息服务`，它们都是独立的，可以单独部署也可以集群部署
### 链接服务[push-connector]
用于解决用户的链接请求，支撑百万级用户的链接，可单击部署，可集群部署，目前为了快速部署，暂时不启用集群部署。如果你存在大规模用户链接，可以启动集群模式,参考[K8s自动伸缩模式](#k8s_deployment)
### 消息服务[push-group]
用于用户处理用户管理，会话管理，离线消息处理，群组管理等功能，是整个即时通讯系统的业务处理模块

## 自动化构建
增加持续集成的好处
* 随时随地发布软件
* 任何一次构建都能触发一次发布
* 只需发布一次artifact,即可随时发布

**NOTE:** 以下是发布持续交付工作流图

![image](https://user-gold-cdn.xitu.io/2019/9/20/16d4d512ccec970e?w=1760&h=770&f=png&s=170824)

## 如何启动服务
本机部署只需要两个`SpringBoot`服务，一个`Mysql`服务，一个`zookeeper`服务,链接服务`push-connector`集群模式还需要`kafka`支持

### 部署前准备
* 安装`docker`与`docker-composer`,如果需要在k8s中部署，请准备好相关的环境
* 确保编译此项目`mvn clean package -Dmaven.test.skip=true`

### 生产模式
这种模式下，所有的镜像都会从Docker Hub下载，只需要复制`docker-compose.yml`,在该目录下执行`docker-compose up`即可.
如果要查看完整的部署步骤，请参考这里[基于Docker的即时通讯系统的持续集成发布说明](https://www.comsince.cn/2019/08/07/docker-continuous/#%E4%BB%8Edocker-hub%E4%B8%8B%E8%BD%BD%E9%95%9C%E5%83%8F%E5%8F%91%E5%B8%83im%E7%B3%BB%E7%BB%9F)

### 开发模式
如果你希望自己编译镜像，你必须克隆此代码，并在本地编译此项目。然后执行`docker-compose -f docker-compose.yml -f docker-compose-dev.yml up`  

### K8S中部署
如果想在k8s中部署，我们也提供yml配置，执行以下命令即可，详情参考[即时通讯服务在k8s容器的部署说明](https://www.comsince.cn/2019/08/12/cloud-native-intro/)
```shell
kubectl apply -f https://www.comsince.cn/download/cloud-native/universe-kube-deployment.yml
```
或者下载代码执行,`push-connector`支持扩展，以适应海量长连接，集群模式需要`kafka`支持，如果kafka没有启动成功，可以手动重启`push-connector`
```shell
kubectl apply -f ./universe-kube-deployment.yml
```

![image](https://user-gold-cdn.xitu.io/2019/9/20/16d4d512ccfd97f6?w=1920&h=1080&f=png&s=170236)

**NOTE:** 如果你希望直接脚本部署，[参考脚本部署](README-Linux.md)


## 欢迎为此项目作出贡献
该项目是开源项目，欢迎提出建议或者提供意见反馈

## 感谢
此项目时在参考其他项目基础上完成，在此表示感谢
* [t-io](https://github.com/tywo45/t-io)
* [wildfirechat](https://gitee.com/wildfirechat/server)


