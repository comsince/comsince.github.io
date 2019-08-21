---
layout: post
title: "Centos 操作说明"
description: Linux 基础技能
category: Linux
---


说明CentOS操作过程中需要注意的问题，本centos为最小化安装

# 图形界面安装

* [CentOS 7安装GNOME图形界面](https://blog.csdn.net/yqxhgzy/article/details/78954963)

# 主机与虚拟机互通问题
一般情况需要设置两个网卡，一个使用NAT，一个使用HostOnly模式
**NOTE:** vitrual box在启用网卡时必须关闭虚拟机
## 参考资料
* [VirtualBox虚拟机配置CentOS7网络](https://blog.csdn.net/flynetcn/article/details/78506511)

# 最小化安装出现ifconfig找不到的问题
## 问题排查
* 能ping通的话，说明网卡有启用，并能获取IP地址来上网。（如果不能可以通过vi /etc/sysconfig/network-scripts/ifcfg-enp0s3 ，把ONBOOT改为yes。BOOTPROTO改为dhcp，或者改为手动获取IP地址，详见在centos7网络配置） 注：修改完后需要重启网卡（命令：service network restart）
* 能通ip addr 查到获取的IP地址，证明网卡是启用。如果获取不了请修改网络配置文件。注：修改完后需要重启网卡（命令：service network restart）
* 通过cat /etc/sysconfig/network-scripts/ifcfg-enp0s3 查看网卡是否启用，如果没有使用vi /etc/sysconfig/network-scripts/ifcfg-enp0s3 修改网络配置文件。
## 解决方法

```shell
$ yum provides ifconfig 
然后执行 
$ yum install net-tools
```

## 参考资料
* [ifconfig缺少问题解决方案](https://www.cnblogs.com/cy60/p/9287856.html)