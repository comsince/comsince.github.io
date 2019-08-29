---
layout: post
title: "云原生-微服务未来发展"
description: docker IM cloud native
category: cloud-native
---

技术推进总是在不断总结前面已有的基础上不断完善，知识的结构也会越来越清晰，越来越多的业务会伴随着微服务技术的成熟而不断衍生出来。技术的演进是由规律可循的，下一代技术的提升
也是在总结前面的经验基础上形成一种标准，从主机托管到虚拟机技术成熟在到容器技术不断发展，一切技术的演进总是在解决一个问题，不断将问题的解决方案抽象出来不断的下沉到基础系统
尽量减少开发者技术难度，不断聚焦需要提升的业务，从而使众多传统公司向互联网转型。

# 什么是云

## 基于虚拟机的云计算
![image](https://skyao.io/learning-cloudnative/introduction/images/cloud-history-3.png)
## 基于容器的编排大战
![image](https://skyao.io/learning-cloudnative/introduction/images/cloud-history-4.png)
# 什么是原生

## 云原生
### CNCF定义
* 应用容器化(software stack to be Containerized)
* 面向微服务架构(Microservices oriented)
* 应用支持容器的编排调度(Dynamically Orchestrated)

云原生包含了一组应用的模式，用于帮助企业快速，持续，可靠，规模化地交付业务软件。云原生由微服务架构，DevOps 和以容器为代表的敏捷基础架构组成。援引宋净超同学的一张图片来描述云原生所需要的能力与特征
![image](https://skyao.io/learning-cloudnative/introduction/images/cloud-native-definition-cncf-original.png)

* 新的定义
![image](https://skyao.io/learning-cloudnative/introduction/images/cloud-native-cncf-new-definition.png)

## 技术实现变迁

### 最初的网络计算机交互
![image](https://static001.infoq.cn/resource/image/09/74/090582484a744fa1cd9b2ea1c4671474.png)

### 微服务出现
应用封装类库的方式集成与业务无关的逻辑,即是SOA服务实现
![image](https://static001.infoq.cn/resource/image/03/18/03188c6719267ad14d884004ae9eb518.png)

### 微服务框架分离
在开发微服务时也是类似的，工程师们聚焦在业务逻辑上，不需要浪费时间去编写服务基础设施代码或管理系统用到的软件库和框架。

![image](https://static001.infoq.cn/resource/image/a3/4d/a3d89ea2f9729a313af93c832912cd4d.png)

### SiderCar
![image](https://static001.infoq.cn/resource/image/df/c4/df38768795a3d138fe4d167f485952c4.png)

### 服务网格
在这样的模型里，每个服务都会有一个边车代理与之配对。服务间通信都是通过边车代理进行的，于是我们就会得到如下的部署图。

![image](https://static001.infoq.cn/resource/image/c4/84/c457de10e1e2d7f7ee8910506590cc84.png)

## 云原生带来什么
技术从来都不是突然出现，总是在不断积累前面的经验产生的。云计算厂商不断跟随不断促进云原生的进步，是因为云原生所构建的生态，越来越让云计算厂商处于一个优势地位，让这些成为开发的基础设施，形成一种统一的规范，这样更有利于平台的建设。云原生可以让开发者从以前租赁虚拟机变成只需要关注云计算平台提供的服务，使这种服务更加标准，从而使DevOps更加标准化，从开发，测试，发布整个流程形成一个闭环，使开发者不用离开平台即可走完整个开发流程，极大加快了软件的开发，帮助云计算厂商收敛服务，提供标准化服务。

* 以下基于SOA服务化的项目架构

![image](https://www.kuboard.cn/assets/img/image-20190731230110206.fbb88459.png)
**NOTE:** 该图的左侧是 DevOps 平台，涵盖构建、测试、包管理、部署及运维、监控及评估。右侧是运行时平台，分成互联网层、展现层、微服务层、数据层。k8s成功将DevOps与运行平台完美结合，这是前所未有的改变

# 参考资料

围绕云原生的话题出现各种开源项目，容器化技术成熟以及k8s成为容器编排事实标准，传统SOA向service mesh转变催生各种技术名词的诞生
* [畅谈云原生（上）：云原生应用应该是什么样子？](https://skyao.io/talk/201902-cloudnative-freely-talk/)
* [畅谈云原生（下）](https://skyao.io/talk/201902-cloudnative-freely-talk2/)
* [模式之服务网格](https://www.infoq.cn/article/pattern-service-mesh)
* [cloud-native学习笔记](https://skyao.io/learning-cloudnative/)
