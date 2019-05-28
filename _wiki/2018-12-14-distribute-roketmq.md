---
layout: wiki
title: "【分布式基础组件】- 消息中间件概览"
categories: [中间件]
description: 消息中间件说明
keywords: Kafka,RocketMq
---

## RocketMq

* [启动broker出现oom问题](https://segmentfault.com/a/1190000016341895)

将
```
JAVA_OPT="${JAVA_OPT} -server -Xms4g -Xmx4g -Xmn2g 
-XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=320m"
```
改为：
```
JAVA_OPT="${JAVA_OPT} -server -Xms256m -Xmx256m -Xmn125m 
-XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=320m"
```
可以看出之前的默认设置是4g内存，如果你的机器没有这么大只是自己搭建着玩就把它设置小一点就行了。
顺便将tools.sh的内存也改成256m，不然运行消息的发送和接收的demo的时候也会报错。



## Kafka

## Kafka集群安装
### server.properties配置

```properties
#broker的全局唯一编号，不能重复
broker.id=0

##用来监听链接的端口，producer或consumer将在此端口建立连接
port=9092

# 处理网络请求的线程数量
num.network.threads=3

# 用来处理磁盘IO的现成数量
num.io.threads=8

# 接受套接字的缓冲区大小
socket.send.buffer.bytes=102400

#接受套接字的缓冲区大小
socket.receive.buffer.bytes=102400

# 请求套接字的缓冲区的大小
socket.request.max.bytes=104857600

# kafka运行日志存放的路径注意日志地址的配置，有可能由于空间占满，导致kafka异常退出
log.dirs=/home/tuzq/software/kafka/servers/logs/kafka

# topic在当前broker上的分片个数
num.partitions=2

# 用来恢复和清理data下数据的线程数量
num.recovery.threads.per.data.dir=1

# segment文件保留的最长时间，超时将被删除
log.retention.hours=168

#滚动生成新的segment文件的最大时间
log.roll.hours=168

# 日志文件中每个segment的大小，默认为1G
log.segment.bytes=1073741824

# 周期性检查文件的时间,这里是300秒，即5分钟
log.retention.check.interval.ms=300000

##日志清理是否打开
log.cleaner.enable=true

#broker需要使用zookeeper保存meta数据,可以在zookeeper后面追加node节点存储
zookeeper.connect=hadoop11:2181,hadoop12:2181,hadoop13:2181

# zookeeper链接超时时间
zookeeper.connection.timeout.ms=6000

# partition buffer中，消息的条数达到阈值，将触发flush到磁盘
log.flush.interval.messages=10000

# 消息buffer的时间，达到阈值，将触发flush到磁盘
log.flush.interval.ms=3000

#删除topic需要server.properties中设置delete.topic.enable=true否则只是标记删除
delete.topic.enable=true

#此处的host.name为本机IP(重要)，如果不改，则客户端会抛出：Producer connection to localhost:9092 unsuccessful 错误！ (如果是hadoop2机器，下面配置成hadoop2)
host.name=hadoop1

#外网访问配置(如果是hadoop2的，下面是192.168.106.92)
advertised.host.name=192.168.106.91
```

### 启动broker

* 以守护进程启动  
 
```shell
./bin/kafka-server-start.sh  -daemon  config/server.properties  &
```

* 启动kafka  

```
[root@hadoop1 kafka]# bin/kafka-server-start.sh config/server.properties 1>/dev/null 2>&1 &
[1] 9412
[root@hadoop1 kafka]# jps
4624 DataNode
4241 DFSZKFailoverController
9475 Jps
9412 Kafka
5093 NodeManager
3981 JournalNode
4974 ResourceManager
4095 NameNode
```

### 基本操作
#### 创建topic
```shell
[root@eb2c2d938924 kafka_2.12-0.11.0.0]# bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 \
> --partitions 1 --topic HelloWorld
```

#### 列出topic

```shell
[root@Server1 kafka_2.12-0.11.0.0]# bin/kafka-topics.sh --list --zookeeper localhost:2181
```

#### 创建producer

```shell
[root@Server1 kafka_2.12-0.11.0.0]# bin/kafka-console-producer.sh --broker-list localhost:9092 --topic HelloWorld
```

### 创建consumer

```shell
[root@Server1 kafka_2.12-0.11.0.0]# bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topicelloWorld --from-beginning
```


### 常见问题

* 防止空间不足导致kafka异常退出

```java
Caused by: java.io.IOException: 设备上没有空间
        at java.lang.Thread.run(Thread.java:722)
        at kafka.server.KafkaRequestHandler.run(KafkaRequestHandler.scala:62)
        at kafka.server.KafkaApis.handle(KafkaApis.scala:80)
        at kafka.server.KafkaApis.handleProducerRequest(KafkaApis.scala:428)
        at kafka.server.ReplicaManager.appendRecords(ReplicaManager.scala:312)
        at kafka.server.ReplicaManager.appendToLocalLog(ReplicaManager.scala:375)
        at scala.collection.AbstractTraversable.map(Traversable.scala:105)
        at scala.collection.TraversableLike$class.map(TraversableLike.scala:244)
        at scala.collection.AbstractIterable.foreach(Iterable.scala:54)
        at scala.collection.IterableLike$class.foreach(IterableLike.scala:72)
        at scala.collection.AbstractIterator.foreach(Iterator.scala:1157)
        at scala.collection.Iterator$class.foreach(Iterator.scala:727)
        at scala.collection.TraversableLike$$anonfun$map$1.apply(TraversableLike.scala:244)
        at scala.collection.TraversableLike$$anonfun$map$1.apply(TraversableLike.scala:244)
        at kafka.server.ReplicaManager$$anonfun$appendToLocalLog$2.apply(ReplicaManager.scala:375)
        at kafka.server.ReplicaManager$$anonfun$appendToLocalLog$2.apply(ReplicaManager.scala:389)
        at kafka.cluster.Partition.appendRecordsToLeader(Partition.scala:438)
        at kafka.utils.CoreUtils$.inReadLock(CoreUtils.scala:219)
        at kafka.utils.CoreUtils$.inLock(CoreUtils.scala:213)
        at kafka.cluster.Partition$$anonfun$11.apply(Partition.scala:439)
        at kafka.cluster.Partition$$anonfun$11.apply(Partition.scala:451)
        at kafka.log.Log.append(Log.scala:362)
```

##  参考资料
* [Kafka集群安装配置，kafka后台运行的方式，Kafka配置文件中的参数说明](http://www.voidcn.com/article/p-exgsfumz-nh.html)
* [十分钟入门RocketMQ ](http://jm.taobao.org/2017/01/12/rocketmq-quick-start-in-10-minutes/)
* [分布式开放消息系统(RocketMQ)的原理与实践](https://www.jianshu.com/p/453c6e7ff81c)
* [消息队列之 RocketMQ](https://juejin.im/post/5af02571f265da0b9e64fcfd)