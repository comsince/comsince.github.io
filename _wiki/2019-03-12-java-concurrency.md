---
layout: wiki
title: "【基础技术】- Java 并发核心要点"
categories: [基础技术]
description: java concurrency
keywords: concurency 
---

# 概述

## 技术工程化进阶

* 基础技术力求能够在掌握基本原理的情况下，手写demo实现，不需要达到工程实践的基础
* 基本原理掌握后，需要进行工程化实践，利用封装，提供框架实现。需要不断重构优化

# 核心要点

* 线程间通信wait/notify机制
* 锁相关问题
  synchronize 内置锁
  显式锁 ReentrantLock
* AQS以及基于AQS的并发工具
* 线程池


* 基于reentrantlock的并发容器实现，LinkListBlokQueue，ArrayListBlokQueue

# 参考资料
* [并发编程详解](http://mp.weixin.qq.com/mp/homepage?__biz=MzIxNTQ3NDMzMw==&hid=2&sn=8f06e890dc3abda4a4919995bd3773b4&scene=18#wechat_redirect)