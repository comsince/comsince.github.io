---
layout: post
title: "go语言学习指南"
description: go语言学习资源与进度总结，同时也是促使自己关注社区动态与发展
category: go
---


本文主要就go语言的学习发展，总结自己在学习的道路上遇到的问题，同时对学习资源进行归纳总结，以方便共同学习

## 概述
  近年来语言的飞速发展，的确给大家带来一种应接不暇的现象，究竟如何取舍，的确是让人挺纠结的。自从Google宣布，kotlin 作为android开发的首选语言，java的地位能否像以前一样不得而知，但是基于jvm的语言(Groovy,Kotlin)的发展也让大家看到每种语言在处理特定问题的优势；gradle基于groovy,开发新一代的构建工具，个人觉得你极大提高了生产力，在持续集成领域，无疑增加了一剂猛药。可以看到groovy在领域特定语言上的优势。

  * 客户端
    客户端领域需要一种高效，快速实现业务的语言
  * 服务端
    J2EE开发不断的发展，在起初搭建项目时，过多而又繁琐的配置，让人觉得java越来越臃肿；微服务的出现似乎要打破这种令人窒息的垂直架构，转而向分布式系统进发，spring boot的诞生就可以看出来；此前各种RPC框架的也在服务化打下良好的基础
    docker虚拟化技术，似乎需要一种简洁的方式来实现web端的开发，是否有一种语言能够做到轻量级，答案是go语言

## 一.学习指引
   语言的发展总是相互学习，因此对比式的方法能帮助我们快速理解新语言的新特性
   * [对比java看go语言的基本特性](http://www.flysnow.org/2016/12/28/from-java-to-golang.html)

### 1.1 Go 语言安装

**NOTE:** 这里解释一下安装过程中出现的问题，方便以后追溯
go安装，推荐gvm方式安装，类似node的npm，ruby的rvm 

* go get 无法下载github项目，可以使用如下类似的命令手动下载项目

```
git clone https://github.com/revel/examples.git $GOPATH/src/github.com/revel/examples
```      

## 二.基本要点
   
   * [官方网站go学习站点](https://tour.go-zh.org/list) 带你一步一步的认识go语言基本特性
   * [build-web-application-with-golang](https://github.com/astaxie/build-web-application-with-golang/blob/master/zh/preface.md)   
   * [Go 语言学习资料与社区索引](https://github.com/Unknwon/go-study-index)
   * [ An Introduction to Programming in Go](https://www.golang-book.com/books/intro)

### 2.1 [基本数据结构](https://gobyexample.com)

   * array
   * slice
   * point

### 2.2 面向对象

#### 2.2.1 [struct]()

#### 2.2.2 [interface](https://github.com/astaxie/build-web-application-with-golang/blob/master/zh/02.6.md)

* 空interface
   任意的类型都实现了空interface(我们这样定义：interface{})，也就是包含0个method的interface
   一个函数把interface{}作为参数，那么他可以接受任意类型的值作为参数，如果一个函数返回interface{},那么也就可以返回任意类型的值

## 三.高级进阶
   开源项目是进一步学习一门语言的敲门砖，每当你感觉技术瓶颈的时候，开源项目总能改你带来意外的惊喜，因此学习别人的代码也是在促进自己进步。这里推荐的开源项目包括一种框架提供解决问题的整体方案；一个独立项目能够独立完成一项业务需求即可
* [revel](https://github.com/revel/revel)



## 参考资料

* [如何同步 Github fork 出来的分支](https://jinlong.github.io/2015/10/12/syncing-a-fork/)

