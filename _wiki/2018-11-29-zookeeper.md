---
layout: wiki
title: "Zookeeper 集群部署方案"
categories: [中间件]
description: 消息中间件说明
keywords: Kafka,RocketMq
---

## zookeeper集群搭建

将课程提供的zookeeper-3.4.5.tar.gz使用WinSCP拷贝到/usr/local目录下。
对zookeeper-3.4.5.tar.gz进行解压缩：tar -zxvf zookeeper-3.4.5.tar.gz。
对zookeeper目录进行重命名：mv zookeeper-3.4.5 zk

## 配置zookeeper相关的环境变量[可选]

```
vi ~/.bashrc
export ZOOKEEPER_HOME=/usr/local/zk
export PATH=$ZOOKEEPER_HOME/bin
source ~/.bashrc
```
```
cd zk/conf
cp zoo_sample.cfg zoo.cfg
```
vi zoo.cfg
修改：dataDir=/usr/local/zk/data
新增：

```
server.1=centos-hadoop1:2888:3888
server.2=centos-hadoop2:2888:3888
server.3=centos-hadoop3:2888:3888
```
```
cd zk
mkdir data
cd data
```
vi myid
0

在另外两个节点上按照上述步骤配置ZooKeeper，使用scp将zk和.bashrc拷贝到eshop-cache02和eshop-cache03上即可。唯一的区别是标识号分别设置为1和2。

* 分别在三台机器上执行：`zkServer.sh start`
* 检查ZooKeeper状态：`zkServer.sh status`，应该是一个leader，两个follower
* jps：检查三个节点是否都有QuromPeerMain进程