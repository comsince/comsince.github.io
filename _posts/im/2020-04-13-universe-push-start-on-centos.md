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

# 对象存储
私有化对象存储可以采用[minio](http://docs.minio.org.cn/docs/)

## 本地化安装

```shell
wget http://dl.minio.org.cn/server/minio/release/linux-amd64/minio
chmod +x minio
## 前台启动
./minio server data/
## 后台启动
nohup ./minio server miniodata/ >/data/minio.log 2>&1 &
## 修改参数启动
MINIO_ACCESS_KEY=test MINIO_SECRET_KEY=test nohup ./minio  server  miniodata/  > /opt/minio/minio.log 2>&1 &
## 启动https 注意accesskey 和secretkey 保持不变
MINIO_ACCESS_KEY=test MINIO_SECRET_KEY=test nohup ./minio  server --address ":443" /data/miniodata/  > /data/minio.log 2>&1 &

```

**NOTE:** 更多高级配置,参见[MinIO Server config.json (v18) 指南](http://docs.minio.org.cn/docs/master/minio-server-configuration-guide)

## 聊天作为对象存储服务
MinIO 默认的策略是分享地址的有效时间最多是7天，要突破这种限制，可以在 bucket 中进行策略设置。点击对应的 bucket ，edit policy 添加策略 *.*
**NOTE:** 另外上传的文件必须带文件后缀,不然无法下载

* [为MinIO Server设置Nginx代理](http://docs.minio.org.cn/docs/master/setup-nginx-proxy-with-minio)

* 客户端可以使用相应的SDK进行上传,到指定的bucket
* 上传成功后需要将设置对应的外网访问地址

## 管理后台操作
* 创建不同的bucket用于存储不同的文件类型，如下

```java

    public static String MINIO_BUCKET_GENERAL_NAME = "minio-bucket-general-name";
    public static String MINIO_BUCKET_GENERAL_DOMAIN = MINIO_UPLOAD_ENDPOINT+"/"+MINIO_BUCKET_GENERAL_NAME;
    public static String MINIO_BUCKET_IMAGE_NAME = "minio-bucket-image-name";
    public static String MINIO_BUCKET_IMAGE_DOMAIN = MINIO_UPLOAD_ENDPOINT+"/"+MINIO_BUCKET_IMAGE_NAME;
    public static String MINIO_BUCKET_VOICE_NAME = "minio-bucket-voice-name";
    public static String MINIO_BUCKET_VOICE_DOMAIN = MINIO_UPLOAD_ENDPOINT+"/"+MINIO_BUCKET_VOICE_NAME;
    public static String MINIO_BUCKET_VIDEO_NAME = "minio-bucket-video-name";
    public static String MINIO_BUCKET_VIDEO_DOMAIN =  MINIO_UPLOAD_ENDPOINT+"/"+MINIO_BUCKET_VIDEO_NAME;
    public static String MINIO_BUCKET_FILE_NAME = "minio-bucket-file-name";
    public static String MINIO_BUCKET_FILE_DOMAIN = MINIO_UPLOAD_ENDPOINT+"/"+MINIO_BUCKET_FILE_NAME;
    public static String MINIO_BUCKET_PORTRAIT_NAME = "minio-bucket-portrait-name";
    public static String MINIO_BUCKET_PORTRAIT_DOMAIN = MINIO_UPLOAD_ENDPOINT+"/"+MINIO_BUCKET_PORTRAIT_NAME;
    public static String MINIO_BUCKET_FAVORITE_NAME = "minio-bucket-favorite-name";
    public static String MINIO_BUCKET_FAVORITE_DOMAIN = MINIO_UPLOAD_ENDPOINT+"/"+MINIO_BUCKET_FAVORITE_NAME;
```

## 参考资料
* [MinIO Quickstart Guide](http://docs.minio.org.cn/docs/)

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
**NOTE:** 
* [免费证书生成工具转换为jks](https://blog.sprov.xyz/2019/05/06/crt-or-pem-to-jks/)
* [KeyManager 多平台免费下载](https://keymanager.org/)
* [如何将PEM证书转换成JKS证书](https://biteeniu.github.io/ssl/convert_pem_to_jks/)


### certbot证书配置

#### unbutu 安装


```shell
sudo apt-get update
sudo apt-get install software-properties-common
sudo add-apt-repository universe
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
```

#### 生成证书

生成证书可以使用nginx 自动绑定生成的方式，这里采用standalone方式，这个是后需要将你要生成证书的域名设置DNS解析

```shell
certbot certonly --standalone -d media.comsince.cn --staple-ocsp -m ljlong_2008@126.com --agree-tos

Saving debug log to /var/log/letsencrypt/letsencrypt.log
Plugins selected: Authenticator standalone, Installer None
Obtaining a new certificate
Performing the following challenges:
http-01 challenge for media.comsince.cn
Waiting for verification...
Cleaning up challenges

IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/media.comsince.cn/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/media.comsince.cn/privkey.pem
   Your cert will expire on 2020-09-11. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot
   again. To non-interactively renew *all* of your certificates, run
   "certbot renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le

```

#### 证书续期问题

```shell
$certbot renew

Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Processing /etc/letsencrypt/renewal/chat.comsince.cn.conf
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

OCSP check failed for /etc/letsencrypt/archive/chat.comsince.cn/cert1.pem (are we offline?)
Cert is due for renewal, auto-renewing...
Plugins selected: Authenticator nginx, Installer nginx
Starting new HTTPS connection (1): acme-v02.api.letsencrypt.org
Renewing an existing certificate
Performing the following challenges:
http-01 challenge for chat.comsince.cn
Waiting for verification...
Cleaning up challenges

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
new certificate deployed with reload of nginx server; fullchain is
/etc/letsencrypt/live/chat.comsince.cn/fullchain.pem
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Congratulations, all renewals succeeded. The following certs have been renewed:
  /etc/letsencrypt/live/chat.comsince.cn/fullchain.pem (success)
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

#### 参考资料

* [certbot安装](https://certbot.eff.org/lets-encrypt/ubuntubionic-other)
* [使用Certbot生成Let's Encrypt证书](http://docs.minio.org.cn/docs/master/generate-let-s-encypt-certificate-using-concert-for-minio)


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