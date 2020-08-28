---
layout: post
title: "即时聊天系统在Windows上单机测试部署实践"
description: IM Windows
category: IM
---

# Windows开发调试说明
## 环境准备
* __服务端__：IDEA,JDK,Zookeeper
* __WEB端__：Node.js,npm
* __zookeeper__  
     dubbo使用了zookeeper作为注册中心，因此需要安装zookeeper，windows安装自行百度。
* 调试服务，只需要启动`spring-boot-dubbo-push-connector`和`spring-boot-web-push-group`服务
* 本地测试请修改这些配置

    > spring-boot-dubbo-push-connector中application.properties

    ```
    # wss ssl 配置,本地测试可以删除
    #push.ssl.keystore=classpath:github.comsince.cn.jks
    #push.ssl.truststore=classpath:github.comsince.cn.trustkeystore.jks
    #push.ssl.password=123456
    ```
    > spring-boot-web-push-group中application.properties

    ```
    ## https 证书，本地测试请注销这些配置,如果使用nignx转发，请到nginx配置相关证书
    #server.ssl.key-store: classpath:github.comsince.cn.pfx
    #server.ssl.key-store-password: effjgv2y
    #server.ssl.keyStoreType: PKCS12
    ```
    > spring-boot-web-push-group中c3p0-config.xml


    ```
    自行修改对应数据库信息和host表
    <!--MySQL数据库地址 注意的这里的mysql,由于阿里云限制，这里mysql要设置为localhost地址127.0.0.1-->
    <property name="jdbcUrl">jdbc:mysql://mysql:3306/wfchat?useSSL=false&amp;serverTimezone=GMT%2B8&amp;allowPublicKeyRetrieval=true&amp;useUnicode=true&amp;characterEncoding=utf8</property>
    <!--MySQL数据库用户名-->
    <property name="user">root</property>
    <!--MySQL数据库密码-->
    <property name="password">root</property>
    ```
    
* __前端配置__

    > vue-chat\src\constant\index.js

    ```
    //export const WS_PROTOCOL = 'wss';
    export const WS_PROTOCOL = 'ws';
    
    //export const WS_IP = 'github.comsince.cn';
    export const WS_IP = 'localhost';
    
    //export const HTTP_HOST = "https://"+WS_IP + ":8443/"
    export const HTTP_HOST = "http://"+WS_IP + ":8081/"
    ```


## 启动顺序
* spring-boot-web-push-group
* spring-boot-dubbo-push-connector

## 常见问题

* Mysql连接报乱码错误，百度查询解决方案，通常设置时区可以解决。
* PublishMessageHandler-Exception Windows的文件路径问题，修改ClassUtil.java中的getClassNameByFile传入的filePath格式和路径。