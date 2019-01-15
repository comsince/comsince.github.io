---
layout: wiki
title: "【大数据】- Hadoop安装简介"
categories: [Hadoop]
description: hadoop 安装说明
keywords: Hadoop,Linux
---

## 安装Java环境
## 安装Hadoop
实际是解压hadoop安装文件到`/usr/local`
```
sudo tar -zxf ~/下载/hadoop-2.6.0.tar.gz -C /usr/local    # 解压到/usr/local中
cd /usr/local/
sudo mv ./hadoop-2.6.0/ ./hadoop            # 将文件夹名改为hadoop
```

将其加入环境变量，在`~/.bashrc`中配置
```
export PATH=$PATH:/usr/local/hadoop/sbin:/usr/local/hadoop/bin

```


## Hadoop 三种模式安装

### 单机模式
直接使用hadoop的命令行工具即可

```
./bin/hadoop jar ./share/hadoop/mapreduce/hadoop-mapreduce-examples-2.9.0.jar grep ./input ./output 'dfs[a-z.]+'
```
* [Hadoop安装教程_单机/伪分布式配置](http://www.powerxing.com/install-hadoop/)

### 伪分布模式

* core-site.xml

```
    <configuration>
            <property>
                 <name>hadoop.tmp.dir</name>
                 <value>file:/usr/local/hadoop/tmp</value>
                 <description>Abase for other temporary directories.</description>
            </property>
            <property>
                 <name>fs.defaultFS</name>
                 <value>hdfs://localhost:9000</value>
            </property>
    </configuration>
```

* hdfs-site.xml

```
    <configuration>
            <property>
                 <name>dfs.replication</name>
                 <value>1</value>
            </property>
            <property>
                 <name>dfs.namenode.name.dir</name>
                 <value>file:/usr/local/hadoop/tmp/dfs/name</value>
            </property>
            <property>
                 <name>dfs.datanode.data.dir</name>
                 <value>file:/usr/local/hadoop/tmp/dfs/data</value>
            </property>
    </configuration>
```

* NameNode 的格式化

```
./bin/hdfs namenode -format
```

* 开启 NameNode 和 DataNode 守护进程

```
./sbin/start-dfs.sh
```

执行命令时，这是可能会宝无法连接，这时我们需要安装ssh server以及ssh免密登录

* 安装 SSH server

```
sudo apt-get install openssh-server
//测试localshost
ssh localhost
```

* ssh keygen

```
cd ~/.ssh/           # 若没有该目录，请先执行一次ssh localhost
ssh-keygen -t rsa    # 会有提示，都按回车就可以
cat ./id_rsa.pub >> ./authorized_keys  # 加入授权
```

#### 运行Hadoop伪分布式实例

* 创建用户目录
```
hdfs dfs -mkdir -p /user/hadoop 这里的用户名尽量和当前登录用户名一致
```

* 启动Yarn

### 分布式集群配置
虚拟机建立用户最好用同一个用户名，这样ssh登录时能够统一化

```
sudo useradd -m hadoop -s /bin/bash
sudo passwd hadoop
sudo adduser hadoop sudo

```


### 问题分析

* 分布式集群模式下，主机hostname设置问题

* 虚拟机使用桥接模式，使用独立分配的IP，这样才能实现主机与虚拟机互通
```
sudo vim /etc/hostname
```
 在配置ip-host时尽量保持一致，不然maste与slave节点无法通信，导致job无法执行下去

 **NOTE:** 注意分析各个组件的log，可以帮助分析问题原因

## Windows 配置Hadoop环境

### Win7 启用桥接模式
使用桥接网络，如果需要进行ca认证，需按照如下步骤进行配置
* [启用802.1x网络认证模式](https://wenku.baidu.com/view/e31fb43d80eb6294dd886cf9.html)
  在计算机管理里面启用如下两个服务`WLAN AUTOConfig`,`Wired AutoConfig`

![image](/images/wiki/802.1-windows.png)

* 用户身份认证：身份认证->其他设置->选择用户身份验证->输入用户名密码保存

![image](/images/wiki/identity-setting.png)

### 关闭防火墙
### 安装cygwin
* cygwin 中文乱码，使用GBK编码
在Cygwin终端上右键-->Options…-->Text-->修改Locale 为 zh_CN，Character Set 为 GBK，问题便得到解决
### [安装SSH](http://blog.faq-book.com/?p=2731)

**NOTE:** 注意配置时新建一个账户名跟hadoop集群一直的账号，为后面设置免登陆做准备

```
ssh-host-config
net start sshd或 cygrunsrv  –start  sshd
```

### 配置ssh免登陆

### 安装Hadoop
* Java 环境
注意在高级设置里面制定JAVA_HOME的路径，不然会包找不到java_home

### 问题汇总
* 错误: 找不到或无法加载主类 org.apache.hadoop.util.VersionInfo
* 解决办法：you can also add the following to your ~/.bashrc

```
export HADOOP_CLASSPATH=$(cygpath -pw $(hadoop classpath)):$HADOOP_CLASSPATH
```

* bashrc完整配置如下

```
export PATH=$PATH:/cygdrive/c/hadoop/sbin:/cygdrive/c/hadoop/bin
export JAVA_HOME=/cygdrive/c/Java/jdk1.8.0_161
export HADOOP_CLASSPATH=$(cygpath -pw $(hadoop classpath)):$HADOOP_CLASSPATH
```

* [问题参考](https://stackoverflow.com/questions/19363402/classpath-issue-in-hadoop-on-cygwin-while-running-hadoop-version-command)

### 如果没有问题表示你已经安装成功，否则就放弃吧

## Hadoop Eclipse

* [使用Eclipse编译运行MapReduce程序](http://www.powerxing.com/hadoop-build-project-using-eclipse/)


## CentOs

### 安装vitual Box 增强工具
＊　请先确保下面的软件已经安装
```
yum install gcc make perl
rpm -qvh kernel-devel-2.6.32.358.el6.x86_64 下载安装
```
* [kernel-devel-2.6.32.358.el6.x86_64下载地址](http://rpm.pbone.net/index.php3/stat/4/idpl/20428577/dir/scientific_linux_6/com/kernel-devel-2.6.32-358.el6.x86_64.rpm.html)
* [共享目录说明](http://daimin.github.io/posts/virtualbox-share-dir.html)

首先共享文件夹，需要安装增强工具包。

* 运行centos虚拟机，打开设备菜单中点击安装增强功能，悬浮鼠标在右下角的光盘图标上，可以看到当前光盘中是VBoxGuestAdditions.iso，这个是安装增强功能的镜像文件。
* 进入centos，在/media下面mkdir cdrom，然后执行`mount -t iso9660 /dev/cdrom /media/cdrom`，挂载光驱到文件系统，打开/media/cdrom，这里可以看到VBoxLinuxAdditions.run，这个是我们需要运行的文件，这里就可以安装增强工具了。
* 不过首先要安装`yum install kernel-devel kernel-headers`以及`yum install gcc和yum install make`，这样安装了还是不行，需要链接一下安装的kernel库，ln -s /usr/src/kernels/2.6.32-431.11.2.el6.x86_64/ /usr/src/linux。
* 最后在挂载光驱中执行`./VBoxLinuxAdditions.run`，等待完成就OK，这里可能有几个错误，不过没有关系，它主要是因为UI系统的功能没有安装成功，如果你没有安装x11的话。

OK，安装增强工具完成，开始设置共享文件夹

### 关闭防火墙

```
关闭命令：  service iptables stop 
永久关闭防火墙：chkconfig iptables off
```

* 查看路由表

```
netstat -rn
添加路由表
route add default gw 172.17.140.1
```

### 免密码登陆
* 使用root登录修改配置文件 `/etc/ssh/sshd_config`
```
RSAAuthentication yes
PubkeyAuthentication yes
AuthorizedKeysFile  .ssh/authorized_keys
```
* 重启sshd服务
```
service sshd restart
```

在 CentOS 6.x 中，可以通过如下命令关闭防火墙：

```
sudo service iptables stop   # 关闭防火墙服务
sudo chkconfig iptables off  # 禁止防火墙开机自启，就不用手动关闭了
```

* Hadoop NameNode HA

   * [zookeeper安装](http://www.linuxprobe.com/zookeeper-cluster-deploy.html)

```
格式化ZK
./bin/hdfs zkf -formatZK
./bin/hdfs start journalnode
格式化前必须先启动journalnode
./bin/hdfs namenode -format
./sbin/start-dfs.sh

```   


**NOTE:** 集群模式下yarn的resourcemanager要在当前安装机器中启动，如果namenode和resourcemanager不在一台机器上   

### Mysql 安装

* 卸载原有的mysql

```
rpm -qa | grep mysql
rpm -e --nodeps mysql-libs-5.1.66-2.el6_3.x86_64


```

* 安装mysql-server 和client

```
rpm -ivh MySQL-client-5.6.24-1.el6.x86_64.rpm
rpm -ivh MySQL-server-5.6.24-1.el6.x86_64.rpm
```

* 启动Mysql

```
service mysql start
```

* 免密登陆，修改密码

相关配置文件/usr/my.conf
增加免授权登录`skip-grant-tables`

* 重启mysql

```
 service mysql restart
```

```
1.  root@Tony_ts_tian init.d]# mysql -u root  
2.  mysql> use mysql  
3.  mysql> UPDATE user SET Password=PASSWORD('root') where USER='root';  
4.  mysql> flush privileges;  
5.  mysql> quit 
```

授权root用户任何地方都可以登录
```
初始化密码
SET PASSWORD = PASSWORD('123456');
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '123456' WITH GRANT OPTION;
FLUSH PRIVILEGES;

```


* 忘记密码

将服务停掉# service mysql stop
执行`mysqld_safe --user=root --skip-grant-tables --skip-networking & `


### Java安装

* 查看并卸载原有的java

```
rpm -qa | grep java
yum -y remove java-1.6.0-openjdk-1.6.0.0-1.50.1.11.5.el6_3.x86_64
```

* 设置环境变量

```
export JAVA_HOME=/opt/softwares/java/jdk1.8.0_131
export JRE_HOME=$JAVA_HOME/jre
export CLASSPATH=.:$JAVA_HOME/lib:$JRE_HOME/lib:$CLASSPATH
export PATH=$JAVA_HOME/bin:$JRE_HOME/bin:$PATH
```


### Telnet Server 安装

```
如下三个包先安装
telnet-0.17-47.el6_3.1.x86_64.rpm  telnet-server-0.17-47.el6_3.1.x86_64.rpm  xinetd-2.3.14-38.el6.x86_64.rpm
rpm -ivh *.rpm
启动telnet
service xinetd start
```

## Hadoop 编译安装
* protobuffer ububtu环境安装

```
$ sudo ./configure
$ sudo make
$ sudo make check
$ sudo make install
$ protoc --version

```


**Note：** protoc: error while loading shared libraries: libprotoc.so.8: cannot open shared object file: No such file or directory

```
$ sudo ldconfig
$ protoc --version
```

* Hadoop 加载本地库的问题
  * 查看程序依赖库

  ```
  ./libhadoop.so: /lib64/libc.so.6: version `GLIBC_2.14' not found (required by ./libhadoop.so)
        linux-vdso.so.1 =>  (0x00007fff855ff000)
        libdl.so.2 => /lib64/libdl.so.2 (0x00007f8301888000)
        libc.so.6 => /lib64/libc.so.6 (0x00007f83014f3000)
        /lib64/ld-linux-x86-64.so.2 (0x0000003f1b800000)
  ```

　* 检查GLIBC安装版本
  ```
  strings /lib64/libc.so.6 |grep GLIBC
  ```
  * 安装GLIBC_2.14

  ```
    glibc-2.14.1-6.x86_64.rpm
    glibc-common-2.14.1-6.x86_64.rpm
    glibc-devel-2.14.1-6.x86_64.rpm
    glibc-headers-2.14.1-6.x86_64.rpm

    $ sudo rpm -Fhv glibc*
  ```
  * [下载地址](ftp://ftp.pbone.net/mirror/archive.fedoraproject.org/fedora/linux/updates/15/x86_64/)
  * [说明文档](https://blog.argcv.com/articles/4601.c)

  * check hadoop native 

  ```
    ./bin/hadoop checknative
    18/02/02 02:36:57 WARN bzip2.Bzip2Factory: Failed to load/initialize native-bzip2 library system-native, will use pure-Java version
    18/02/02 02:36:57 INFO zlib.ZlibFactory: Successfully loaded & initialized native-zlib library
    Native library checking:
    hadoop:  true /opt/app/hadoop/lib/native/libhadoop.so.1.0.0
    zlib:    true /lib64/libz.so.1
    snappy:  false 
    lz4:     true revision:99
    bzip2:   false 
    openssl: false Cannot load libcrypto.so (libcrypto.so: cannot open shared object file: No such file or directory)!
  ```




```

```

   
## 常用工具
* [EditPlus 在线注册](http://www.jb51.net/tools/editplus/)

* [Security CR 终端设置](https://my.oschina.net/ijaychen/blog/193486)