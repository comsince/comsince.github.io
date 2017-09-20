---
layout: post
title: "Java 编程技术预览【Android Java Web】"
description: Linux 基础技能
category: overview
---

本文试图说明linux的基本技能，主要说明linux环境下c编程，shell；着重于基础概念，并不是作为进阶的工具，主要起到一个抛砖抛砖引玉的作用，能够通过对这些基本的技能的学习初步掌握解决问题的基本技能。此文章并不深入讨论各个技术点的细节，只是总结出技能之间的依赖关系，归纳出一般的学习步骤，希望对自己的思路有一个清晰的认识。

## Linux 基础

* [鸟哥的私房菜PDF](/download/linux-introduction.pdf)

## linux C 编程基础
  c 语言编程的基本语法这里不再赘述，基本大同小异，这里主要研究，在工程的条件下，如果快速的编译c代码，像一些面向对象的编程语言都有提供相应的工具入maven，gradle；c也有自己独特的方式。
 * [Linux C编程一站式学习](https://akaedu.github.io/book/index.html)
 * [Awesome-C](https://github.com/aleksandar-todorovic/awesome-c)
 

## C/C++ 基础

* [Learn c](https://www.tutorialspoint.com/cprogramming/index.htm)
* [Learn c++](https://www.tutorialspoint.com/cplusplus/index.htm)

### 指针

对星号`*`的总结
在我们目前所学到的语法中，星号*主要有三种用途：
* 表示乘法，例如`int a = 3, b = 5, c;  c = a * b;`123456
，这是最容易理解的。
* 表示定义一个指针变量，以和普通变量区分开，例如`int a = 100;  int *p = &a;`。
* 表示获取指针指向的数据，是一种间接操作，例如`int a, b, *p = &a;  *p = 100;  b = *p;`。
* 参考：
   * [大话C 语言指针](http://c.biancheng.net/cpp/html/72.html)

* [char* const args[] defintion [duplicate]](https://stackoverflow.com/questions/15576291/char-const-args-defintion)

以下说明c编译的相关知识
   由于c没有import自动关联编译的，需要[Header File](https://gcc.gnu.org/onlinedocs/cpp/Header-Files.html)进行类型声明，接口暴露

* [The C Preprocessor](https://gcc.gnu.org/onlinedocs/cpp/index.html#Top)

### 宏定义

* [GCC-Macros](https://gcc.gnu.org/onlinedocs/cpp/Macros.html#Macros)
* [GCC-HEADER-FILES](https://gcc.gnu.org/onlinedocs/cpp/Header-Files.html)

### Makefile
C没有像gradle和maven的编译工具，需要使用makefile来组织编译，不过以后可以使用CMake

* [GNU make](https://www.gnu.org/software/make/manual/make.html)
* [GNU Make 译文](/download/gun_make.pdf)
* [跟我一起写Makefile](http://wiki.ubuntu.org.cn/%E8%B7%9F%E6%88%91%E4%B8%80%E8%B5%B7%E5%86%99Makefile)

### CMake

提供跨平台的编译工具，makefile自动生成，只需用cmake配置规则

* [CMake 入门实战](http://www.hahack.com/codes/cmake/)

## Shell

* [Linux online manpage](http://man7.org/linux/man-pages/)
* [Shell编程基础](http://wiki.ubuntu.org.cn/Shell%E7%BC%96%E7%A8%8B%E5%9F%BA%E7%A1%80)

## Android NDK

### NDK Build Problem

* 问题

```
Android NDK: Your APP_BUILD_SCRIPT points to an unknown file:
```

* 解决办法

如果是一个android工程的话，执行如下命令：
```
ndk-build NDK_PROJECT_PATH=./main/cpp  NDK_LOG=1
```
如果设置NDK工程目录，ndk默认会从该目录起寻找该目录下jni目录，如果没有找到就报如下错误：
```
Your APP_BUILD_SCRIPT points to an unknown file: ./main/cpp/jni/Android.mk    
```
这是你可以指定android.mk的路径,如下`APP_BUILD_SCRIPT=./main/cpp/Android.mk`

## 参考资料

* [宏的基本概念](http://www.geeksforgeeks.org/interesting-facts-preprocessors-c/)

### 集成开发工具

* [What is the best C & C++ IDE?](https://www.quora.com/What-is-the-best-C-C++-IDE)
* [Clion License Server](http://www.sdbeta.com/mf/2017/0414/177253.html)
  弹出注册窗口选择Activate》License Server》输入`http://xidea.online`，然后点击`Activete`完成认证即可

### C/C++ Library

* [awesome-cpp](https://github.com/fffaraz/awesome-cpp)
* [A list of open source C++ libraries](http://en.cppreference.com/w/cpp/links/libs)


## SQL

* [W3CSQL](https://www.w3schools.com/sql/default.asp)

## Java 高级主题

### Java I/O

* [Java IO](http://ifeve.com/java-io/)
* [java I/O书籍](/download/JavaIO.pdf)

### Java Networking

* [Java 网络编程]()
* [Essential Netty in Action 《Netty 实战(精髓)》](https://www.kancloud.cn/kancloud/essential-netty-in-action)

### Java Connurency

* [Java并发编程实战](/download/Java-concurency-in-practice.pdf)

### Java Reflection

* [Java 动态代理机制分析及扩展](https://www.ibm.com/developerworks/cn/java/j-lo-proxy1/index.html)

## Server

 远程登录命令
 
### SSH

 ```
 ssh user@host
 ```
### SCP

#### 命令格式：

```
scp [参数] [原路径] [目标路径]
```

#### 命令参数：

    -1 强制scp命令使用协议ssh1
    -2 强制scp命令使用协议ssh2
    -4 强制scp命令只使用IPv4寻址
    -6 强制scp命令只使用IPv6寻址
    -B 使用批处理模式（传输过程中不询问传输口令或短语）
    -C 允许压缩。（将-C标志传递给ssh，从而打开压缩功能）
    -p 留原文件的修改时间，访问时间和访问权限。
    -q 不显示传输进度条。
    -r 递归复制整个目录。
    -v 详细方式显示输出。scp和ssh(1)会显示出整个过程的调试信息。这些信息用于调试连接，验证和配置问题。
    -c cipher 以cipher将数据传输进行加密，这个选项将直接传递给ssh。
    -F ssh_config 指定一个替代的ssh配置文件，此参数直接传递给ssh。
    -i identity_file 从指定文件中读取传输时使用的密钥文件，此参数直接传递给ssh。
    -l limit 限定用户所能使用的带宽，以Kbit/s为单位。
    -o ssh_option 如果习惯于使用ssh_config(5)中的参数传递方式，
    -P port 注意是大写的P, port是指定数据传输用到的端口号
    -S program 指定加密传输时所使用的程序。此程序必须能够理解ssh(1)的选项。



#### 使用说明
从本地服务器复制到远程服务器

* 复制文件:

```
$scp local_file remote_username@remote_ip:remote_folder
$scp local_file remote_username@remote_ip:remote_file
$scp local_file remote_ip:remote_folder
$scp local_file remote_ip:remote_file
```

指定了用户名，命令执行后需要输入用户密码；如果不指定用户名，命令执行后需要输入用户名和密码；

* 复制目录:

```
$scp -r local_folder remote_username@remote_ip:remote_folder
$scp -r local_folder remote_ip:remote_folder
```

第1个指定了用户名，命令执行后需要输入用户密码； 第2个没有指定用户名，命令执行后需要输入用户名和密码；

**NOTE:** 从远程复制到本地的scp命令与上面的命令一样，只要将从本地复制到远程的命令后面2个参数互换顺序就行了

#### 使用示例
#### 实例1：从远处复制文件到本地目录

```
 $scp root@10.6.159.147:/opt/soft/demo.tar /opt/soft/
``` 
说明： 从10.6.159.147机器上的/opt/soft/的目录中下载demo.tar 文件到本地/opt/soft/目录中

#### 实例2：从远处复制到本地

```
$scp -r root@10.6.159.147:/opt/soft/test /opt/soft/
```

说明： 从10.6.159.147机器上的/opt/soft/中下载test目录到本地的/opt/soft/目录来。

#### 实例3：上传本地文件到远程机器指定目录

```
$scp /opt/soft/demo.tar root@10.6.159.147:/opt/soft/scptest
```

说明： 复制本地opt/soft/目录下的文件demo.tar 到远程机器10.6.159.147的opt/soft/scptest目录

#### 实例4：上传本地目录到远程机器指定目录

```
$scp -r /opt/soft/test root@10.6.159.147:/opt/soft/scptest
```

说明： 上传本地目录 /opt/soft/test到远程机器10.6.159.147上/opt/soft/scptest的目录中


#### 参考资料

* [scp](https://www.computerhope.com/unix/scp.htm)
* [cp 跨机远程拷贝](http://linuxtools-rst.readthedocs.io/zh_CN/latest/tool/scp.html)

### MAVEN

```
 // 跳过测试
 mvn clean package -Dmaven.test.skip=true

 // mvn jetty run
 mvn jetty:run -Djetty.port=80
```

#### 参考资料
* [Maven实战](/download/maven.pdf)

### NGINX

#### Nginx Ubuntu 安装

这里根据官网的步骤总结出来

#### 下载nginx_signing.key

```
wget https://nginx.org/keys/nginx_signing.key
```

#### 将nginx_signing.key添加到apt程序中

```
sudo apt-key add nginx_signing.key
```

#### 在`/etc/apt/sources.list` 尾部添加下面的代码

```
deb http://nginx.org/packages/ubuntu/ xenial nginx
deb-src http://nginx.org/packages/ubuntu/ xenial nginx
```

上面的xenial是nginx在Ubuntu平台下发布版本的代码名称，也就是说不同版本的Ubuntu代码名称是不一样的，下面列举了各个Ubuntu版本的代码名称,[具体详见](https://nginx.org/en/linux_packages.html#distributions)

#### 更新源并安装nginx

```
apt-get update
apt-get install nginx
```

**NOTE:** 如果以前安装nginx失败一定要完全卸载后在重新安装，不然会出现很多错误,nginx卸载方法如下

* 删除nginx，–purge包括配置文件

```
sudo apt-get --purge remove nginx
```

* 自动移除全部不使用的软件包

```
sudo apt-get autoremove
```

* 罗列出与nginx相关的软件

```
dpkg --get-selections|grep nginx
```

执行结果如下：unbutu16.04

```
nginx						install
nginx-common			    deinstall
```

* 删除查询出与nginx有关的软件

```
sudo apt-get --purge remove nginx
sudo apt-get --purge remove nginx-common
```

* 查看nginx正在运行的进程，如果有就kill掉

```
ps -ef |grep nginx
```

结果如下：

```
root      5309  2614  0 17:03 ?        00:00:00 nginx: master process nginx
nginx     5310  5309  0 17:03 ?        00:00:00 nginx: worker process
```

* kill nginx进程

```
sudo kill  -9  5309 5310
```

* 查看nginx配置

```
sudo nginx -t
```
结果如下：

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

#### 参考资料

* [彻底删除nginx](http://blog.csdn.net/u010571844/article/details/50819704)
* [Nginx 初步](https://moonbingbing.gitbooks.io/openresty-best-practices/content/ngx/nginx.html)
* [Nginx - 代理、缓存](http://blog.csdn.net/zjf280441589/article/details/51501408)


### MySql

* 检查mysql本地是否安装

```
sudo netstat -tap | grep mysql
```

* 安装mysql

```
sudo apt-get install mysql-server mysql-client
```

#### 参考资料

* [Linux(Ubuntu)下MySQL的安装与配置](http://blog.csdn.net/lizuqingblog/article/details/18423751)
* [Mysql初始化root密码和允许远程访问](http://www.cnblogs.com/cnblogsfans/archive/2009/09/21/1570942.html)


### Redis

```
wget http://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz
cd redis-stable
sudo make install //将redis安装到usr目录
```

* [Redis Quick Start](https://redis.io/topics/quickstart)

### Zookeeper

* [ZooKeeper Getting Started Guide](https://zookeeper.apache.org/doc/r3.1.2/zookeeperStarted.html#ch_GettingStarted)

### TomCat

* [Tomcat Home](http://tomcat.apache.org/download-70.cgi)

## 微服务架构系列文章

## 基础组件

### 消息队列

* [activemq](http://activemq.apache.org/getting-started.html)

**NOTE:** ActiveMQ 5.15.0 Release 支持java8以上版本

### 权限框架

* [跟我学Shiro](/download/kaitao-shiro.pdf)

### 分布式数据库
为提升系统性能，实现高并发的需要有事需要实现数据库读写分离，需要使用数据库中间件
读写分离需要配置主从数据同步
* [MySQL5.6 数据库主从（Master/Slave）同步安装与配置详解](http://blog.csdn.net/xlgen157387/article/details/51331244/)
* [Sharing-JDBC](http://shardingjdbc.io/docs/00-overview)

### 分布式RPC框架

### 容器

### 调用链

* [Dapper，大规模分布式系统的跟踪系统](https://bigbully.github.io/Dapper-translation/)
* [美团分布式会话跟踪系统架构设计与实践](https://tech.meituan.com/mt-mtrace.html)
* [京东分布式服务跟踪系统-CallGraph](http://zhuanlan.51cto.com/art/201701/528304.htm)

### 微服务实战
* [微服务实战：从架构到发布（一）](https://segmentfault.com/a/1190000004634172)
* [微服务实战：从架构到发布（二）](https://segmentfault.com/a/1190000004655274)

### 书籍

* [亿级流量网站架构核心技术 跟开涛学搭建高可用高并发系统](/download/kaitao-distribute-system.pdf)