---
layout: post
title: "Jcenter注册与账户信息说明"
description: 本文主要讲解Jcenter注册，以及如何创建group发布自己的library，以及在注册过程中的注意事项
category: tech
---


##  概述
本文主要讲解Jcenter注册，以及如何创建group发布自己的library，以及在注册过程中的注意事项，为以后使用gradle插件实现自动发布做准备

## 一.注册

* 打开如下网址[注册](https://bintray.com/signup)

![image](/images/tech/register-jcenter/register.png)

**NOTE:** 填写上面的信息，点击注册即可

## 二.创建群组
![image](/images/tech/register-jcenter/create_group.png)

**NOTE:**　注册成功后会引导你进行group群组创建,不要在企业试用版下创建group，这个group只有一个月的试用期；你可以申请完bintray账户后,单独申请一个Group

## 三.创建Repository

### 3.1 进入个人主页主导repository的创建入口

![image](/images/tech/register-jcenter/repository.png)

### 3.2 点击"Add new Repository",进入详细的页面

![image](/images/tech/register-jcenter/add_repository.png)

**NOTE:** 选择```Maven```类型的仓库

## 四. 账号信息

### 4.1 群组获取
群组即是你注册时填写的group名称

### 4.2 API_KEY获取

![image](/images/tech/register-jcenter/api_key.png)
