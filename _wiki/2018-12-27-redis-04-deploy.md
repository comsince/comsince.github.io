---
layout: wiki
title: "【内存数据库】- Redis部署篇 - 单机与集群部署方案"
categories: [中间件]
description: 消息中间件说明
keywords: Kafka,RocketMq
---

## 单机版Redis安装

### 安装单机版redis

大家可以自己去官网下载，当然也可以用课程提供的压缩包

```
wget http://downloads.sourceforge.net/tcl/tcl8.6.1-src.tar.gz
tar -xzvf tcl8.6.1-src.tar.gz
cd  /usr/local/tcl8.6.1/unix/
./configure  
make && make install
```

使用redis-3.2.8.tar.gz（截止2017年4月的最新稳定版）
```
tar -zxvf redis-3.2.8.tar.gz
cd redis-3.2.8
make && make test && make install
```

### redis的生产环境启动方案

要把redis作为一个系统的daemon进程去运行的，每次系统启动，redis进程一起启动

* redis utils目录下，有个redis_init_script脚本
* 将redis_init_script脚本拷贝到linux的/etc/init.d目录中，将redis_init_script重命名为redis_6379，6379是我们希望这个redis实例监听的端口号
* 修改redis_6379脚本的第6行的REDISPORT，设置为相同的端口号（默认就是6379）
* 创建两个目录：/etc/redis（存放redis的配置文件），/var/redis/6379（存放redis的持久化文件）
* 修改redis配置文件（默认在根目录下，redis.conf），拷贝到/etc/redis目录中，修改名称为6379.conf
* 修改redis.conf中的部分配置为生产环境

```
daemonize	yes							让redis以daemon进程运行
pidfile		/var/run/redis_6379.pid 	设置redis的pid文件位置
port		6379						设置redis的监听端口号
dir 		/var/redis/6379				设置持久化文件的存储位置
```
* 启动redis，执行`cd /etc/init.d, chmod 777 redis_6379，./redis_6379 start`
* 确认redis进程是否启动，`ps -ef | grep redis`
* 让redis跟随系统启动自动启动

在redis_6379脚本中，最上面，加入两行注释

```
# chkconfig:   2345 90 10
# description:  Redis is a persistent key-value database
```

设置开机启动

```
chkconfig redis_6379 on
```

### redis cli的使用

redis-cli SHUTDOWN，连接本机的6379端口停止redis进程

redis-cli -h 127.0.0.1 -p 6379 SHUTDOWN，制定要连接的ip和端口号

redis-cli PING，ping redis的端口，看是否正常

redis-cli，进入交互式命令行


## Redis Cluster

redis cluster集群，要求至少3个master，去组成一个高可用，健壮的分布式的集群，每个master都建议至少给一个slave，3个master，3个slave，最少的要求

正式环境下，建议都是说在6台机器上去搭建，至少3台机器

保证，每个master都跟自己的slave不在同一台机器上，如果是6台自然更好，一个master+一个slave就死了

3台机器去搭建6个redis实例的redis cluster,注意每台机器都要执行以下命令，对应不同端口要创建不同的目录

```
mkdir -p /etc/redis 存放redis的conf文件
mkdir -p /etc/redis-cluster
mkdir -p /var/log/redis
mkdir -p /var/redis/7001
```

### redis conf配置文件

```
port 7001
cluster-enabled yes
cluster-config-file /etc/redis-cluster/node-7001.conf
cluster-node-timeout 15000
daemonize	yes							
pidfile		/var/run/redis_7001.pid 						
dir 		/var/redis/7001		
logfile /var/log/redis/7001.log
bind 192.168.31.187	注意端口不要绑定成本地回环地址	
appendonly yes
```

至少要用3个master节点启动，每个master加一个slave节点，先选择6个节点，启动6个实例

将上面的配置文件，在/etc/redis下放6个，一个机器两个配置文件，开启两个端口的redis，分别为: 7001.conf，7002.conf，7003.conf，7004.conf，7005.conf，7006.conf

### 准备生产环境的启动脚本

在/etc/init.d下，放6个启动脚本，分别为: redis_7001, redis_7002, redis_7003, redis_7004, redis_7005, redis_7006

* [集群相关配置文件](/download/redis/)

每个启动脚本内，都修改对应的端口号

### 分别在3台机器上，启动6个redis实例

```
/etc/init.d/redis_700* start
```

将每个配置文件中的slaveof给删除


## 集群部署

下面方框内的内容废弃掉

### 安装ruby redis客户端

```
yum install -y ruby
yum install -y rubygems
由于ruby版本的问题强制安装3.0版本
gem install redis -v 3.0.0
```
### 创建集群

```
cp /usr/local/redis-3.2.8/src/redis-trib.rb /usr/local/bin
redis-trib.rb create --replicas 1 172.16.42.139:7001 172.16.42.139:7002 172.16.42.72:7003 172.16.42.72:7004 172.16.42.85:7005 172.16.42.85:7006
```
--replicas: 每个master有几个slave

6台机器，3个master，3个slave，尽量自己让master和slave不在一台机器上

输入yes

* 检查集群状态

模拟集群中一个基点挂点，看其slave是否做故障转移

```
redis-cli -h centos-haoop1 -p 7001 SHUTDOWN
```

```
redis-trib.rb check 192.168.31.187:7001
```