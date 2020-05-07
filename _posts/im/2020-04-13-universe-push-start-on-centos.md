---
layout: post
title: "即时聊天系统在Centos上单机部署实践"
description: docker IM cloud native
category: IM
---

本文主要说明基于[universe-push](https://github.com/comsince/universe-push)在`centos`单机上的部署流程，如果大家购买相关mysql服务，可以选择部署相关服务

# MySQL安装

* [【数据库】- MySQL基本安装](/wiki/2019-07-01-mysql-00-install/)  

**NOTE:** 不同版本的Centos安装可能存在差异，安装过程中注意错误提示

## 密码策略

当然如果不需要密码策略，可以禁用：
在/etc/my.cnf文件添加
```shell
validate_password = off
重启生效
systemctl restart mysqld
```


# 系统软件安装

* 安装nc

```shell
yum install nc
```

**NOTE:** 我们提供一个安装目录，如下，里面包含`jdk`，`zookeeper`，以及应该安装包，一级目录如下：

```shell
├── boot
├── jdk
└── zookeeper-3.4.6
```

# Java环境配置

* 编辑`~/.bash_profile`

```shell
export JAVA_HOME=/data/jdk
export JRE_HOME=$JAVA_HOME/jre
export CLASSPATH=.:$JAVA_HOME/lib:$JRE_HOME/lib:$CLASSPATH
export PATH=$JAVA_HOME/bin:$JRE_HOME/bin:$PATH
```

* 执行以下命令生效配置

```shell
source ~/.bash_profile 
```
* 检查是否安装成功

```shell
[root@VM_0_2_centos data]# java -version
java version "1.8.0_131"
Java(TM) SE Runtime Environment (build 1.8.0_131-b11)
Java HotSpot(TM) 64-Bit Server VM (build 25.131-b11, mixed mode)
```

# Zookeeper安装与启动

* zookeeper已经打包在整个安装配置文件中，只需要启动zookeeper就行

```shell
[root@VM_0_2_centos data]# ./zookeeper-3.4.6/bin/zkServer.sh start
JMX enabled by default
Using config: /data/zookeeper-3.4.6/bin/../conf/zoo.cfg
Starting zookeeper ... STARTED

执行jps,查看zookeeper进程

[root@VM_0_2_centos data]# jps
25462 Jps
25211 QuorumPeerMain

```

# 项目部署结构说明

**NOTE:** 以下为`boot`目录下的文件结构，主要说明两个服务的目录结构，以及如何启动服务

## 项目结构目录概览
```shell
├── download #android Apk
│   ├── chat-debug-0.7.2.apk
│   ├── chat-debug.0.7.3.apk
│   ├── chat-debug.0.7.4.apk
│   ├── chat-debug.0.7.5.apk
│   └── chat-debug.apk
├── push-connector # 信令消息服务器目录，支持TCP,WSS链接
│   ├── jvm.ini #jvm参数配置
│   ├── lib
│   │   └── spring-boot-dubbo-push-connector-1.0.0-SNAPSHOT.jar
│   ├── logs # 日志
│   └── push-connector # 启动脚本
└── push-group # 业务相关逻辑服务，包括http登录接口
    ├── jvm.ini #jvm参数配置
    ├── lib
    │   └── spring-boot-web-push-group-1.0.0-SNAPSHOT.jar
    ├── logs # 日志
    └── push-group # 启动脚本

```

## 项目配置


**NOTE:** 以下证书配置都是基于我申请的域名得到的证书，如果本地部署可能导入证书错误，无法访问，实际编译的时候去掉相关配置

### push-group证书配置

暂时去掉，在application.properties

```yaml
## https 证书，本地测试请注销这些配置
#server.ssl.key-store: classpath:2436378_github.comsince.cn.pfx
#server.ssl.key-store-password: effjgv2y
#server.ssl.keyStoreType: PKCS12

```

### push-connector

```yaml
# wss ssl 配置,本地测试可以删除
#push.ssl.keystore=classpath:github.comsince.cn.jks
#push.ssl.truststore=classpath:trustkeystore.jks
#push.ssl.password=123456
```
**NOTE:** [免费证书生成工具转换为jks](https://blog.sprov.xyz/2019/05/06/crt-or-pem-to-jks/)
* [KeyManager 多平台免费下载](https://keymanager.org/)
* [如何将PEM证书转换成JKS证书](https://biteeniu.github.io/ssl/convert_pem_to_jks/)

### mysql链接配置

**NOTE:** 在`push-group`的resource目录的`c3p0-config.xml`中配置


### zookeeper,mysql host配置

由于代码中使用了zookeeper,mysql相关的host,你可以在你启动的机器中配置相关host.修改`/etc/hosts`

```
your centos ip zookeeper
127.0.0.1 mysql

```

## 项目编译

```shell
进行universe-push工程目录下，执行如下命令打包
mvn clean package -Dmaven.test.skip=true
```

* 成功如下提示

```shell
[INFO] 
[INFO] comsince ........................................... SUCCESS [  0.736 s]
[INFO] tio-core ........................................... SUCCESS [  9.127 s]
[INFO] push-stub .......................................... SUCCESS [  2.071 s]
[INFO] push-common ........................................ SUCCESS [  1.060 s]
[INFO] push-sdk ........................................... SUCCESS [  0.001 s]
[INFO] push-aio-sdk ....................................... SUCCESS [  0.231 s]
[INFO] push-nio-sdk ....................................... SUCCESS [  2.049 s]
[INFO] sofa-bolt-sdk ...................................... SUCCESS [  0.707 s]
[INFO] spring-boot-dubbo-push-connector ................... SUCCESS [  4.394 s]
[INFO] spring-boot-dubbo-push-subscribe ................... SUCCESS [  0.248 s]
[INFO] spring-boot-web-push-api ........................... SUCCESS [  1.149 s]
[INFO] spring-boot-web-push-group ......................... SUCCESS [  9.126 s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 32.301 s
[INFO] Finished at: 2020-04-13T16:33:58+08:00
[INFO] Final Memory: 85M/814M
[INFO] ------------------------------------------------------------------------

```

## 更新项目jar包

**NOTE:** 以`push-connector`为例上传远程服务上，以更新服务

```shell
scp spring-boot-dubbo-push-connector/target/spring-boot-dubbo-push-connector.jar root@aliyun:/data/boot/push-connector/lib
```

## 项目启动

## 启动push-group

```shell
./push-connector start
```

## 启动push-connector

```shell
./push-group start
```

## 云服务网络配置

**NOTE:** 如果使用了腾讯云与阿里云，请开启相关的入端口`8081`，`8443`，`6789`，`9326`


# 安装包下载

**NOTE:** 由于安装包大，所以请在[百度云盘](https://pan.baidu.com/s/1zbcUPdN_r87Gzeqrwyl6vA)下载，提取码`6xft`

# 演示登录

输入任意手机号，输入超级验证码`66666`登录即可