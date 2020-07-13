---
layout: wiki
title: 【数据库】- MySQ基本安装
categories: [mysql]
description: 
keywords: mysql
---

#  CentOS 6.5/6.6 安装（install）mysql 5.7 最完整版教程

## Step1: 检测系统是否自带安装mysql

```
# yum list installed | grep mysql
```

## Step2: 删除系统自带的mysql及其依赖
命令：
```
# yum -y remove mysql-libs.x86_64
```

## Step3: 给CentOS添加rpm源，并且选择较新的源
命令：
```
# wget dev.mysql.com/get/mysql-community-release-el6-5.noarch.rpm
# yum localinstall mysql-community-release-el6-5.noarch.rpm
# yum repolist all | grep mysql
# yum-config-manager --disable mysql55-community
# yum-config-manager --disable mysql56-community
# yum-config-manager --enable mysql57-community-dmr
# yum repolist enabled | grep mysql
```

**NOTE:**这里可以查看要安装的mysql版本，可以启动禁用选择的版本

## Step4:安装mysql 服务器
命令：
```
# yum install mysql-community-server
```

Step5: 启动mysql
命令:
```
# service mysqld start
```

## Step6: 查看mysql是否自启动,并且设置开启自启动
命令:
```
# chkconfig --list | grep mysqld
# chkconfig mysqld on
```

## Step7: mysql安全设置
命令：
```
# mysql_secure_installation
```

**NOTE:** 这里提供对话式的选择配置设置，也可以使用如下命令更改root用户密码 `mysqladmin -u root password 'root'`


# Myql备份与恢复

## 备份

```shell
mysqldump -uroot -p wfchat > wfchat.sql
```


# 参考资料
* [CentOS 6.5/6.6 安装（install）mysql 5.7 最完整版教程](https://segmentfault.com/a/1190000003049498)
* [MySQL 备份和恢复机制](https://juejin.im/entry/5a0aa2026fb9a045132a369f)
