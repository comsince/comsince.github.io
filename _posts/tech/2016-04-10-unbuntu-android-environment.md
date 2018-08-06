---
layout: post
title: "Unbuntu android 环境初始配置"
description: Unbuntu android 环境初始配置,java environment,Android SDK,ADB 配置，虚拟机安装
category: tech
---

## 一.配置JDK

```
	$sudo gedit /etc/profile
	这里配置的系统环境变量
```
* 配置java environment

```
	JAVA_HOME=/home/liujicheng/java/jdk1.6.0_12
	export JRE_HOME=/home/liujicheng/java/jdk1.6.0_12/jre
	export CLASSPATH=.:$JAVA_HOME/lib:$JRE_HOME/lib:$CLASSPATH
	export PATH=$JAVA_HOME/bin:$JRE_HOME/bin:$PATH

```


```
#scala home
export SCALA_HOME=~/Share/jdk/scala-2.10.4

#maven
export MAVEN_HOME=~/Share/web/apache-maven-3.3.9

#android
export ANDROID_SDK_HOME=~/Share/android/SDK
export NDK_HOME=$ANDROID_SDK_HOME/ndk-bundle

#java home
#export JAVA_HOME=~/Share/jdk/jdk1.7.0_17
export JAVA_HOME=~/Share/jdk/jdk1.8.0_131
export JRE_HOME=$JAVA_HOME/jre
export CLASSPATH=.:$JAVA_HOME/lib:$JRE_HOME/lib:$CLASSPATH
export PATH=$JAVA_HOME/bin:$JRE_HOME/bin:$ANDROID_SDK_HOME/platform-tools:$NDK_HOME:$MAVEN_HOME/bin:$SCALA_HOME/bin:$PATH

#go
export GOPATH=~/Share/GitWorkPlace/go

```

## 二.配置Android SDK
在配置环境变量时如有不理解请参考如下的说明文档[环境变量配置说明](http://www.cnblogs.com/bluestorm/archive/2012/10/12/2721210.html)

```
	sudo gedit ~/.profile
	export PATH=$PATH:$JAVA_HOME/bin:$JAVA_HOME/jre/bin:/home/cmm/android-sdk-linux/tools:/home/cmm/android-sdk-linux/platform-tools
	$ source ~/.profile


	这是配置个人环境变量
	android studio 出现无法找到android_home环境变量的问题解决方法：
	配置android_home环境变量
```

采用profile的方式配置如下：

```
export ANDROID_SDK_HOME=/home/user/Share/android/SDK
export JAVA_HOME=/home/user/Share/jdk/jdk1.8.0_131
export JRE_HOME=$JAVA_HOME/jre
export CLASSPATH=.:$JAVA_HOME/lib:$JRE_HOME/lib:$CLASSPATH
export PATH=$JAVA_HOME/bin:$JRE_HOME/bin:$ANDROID_SDK_HOME/platform-tools:$PATH
```

调用如下命令：
```
source ~/.profile
```

## 三.ADB 配置

*  64位系统，Ubuntu11.04，搭建JDK，Android环境，把android SDK复制过来后，里面的adb和其它命令的都不能使用。
错误提示：android-sdk-linux_86/platform-tools/adb: 没有那个文件或目录。
解决方案：由于是64bit的系统，而Android sdk只有32bit的程序，需要安装ia32-libs，才能使用。

* 运行如下命令：

```
sudo apt-get install libc6:i386 libncurses5:i386 libstdc++6:i386 lib32z1 libbz2-1.0:i386
```

* 详情参考[Android studio 安装](https://developer.android.com/studio/install.html)

## 四.魅族手机链接unbutu的问题

### 4.1 选择链接方式

手机那边下拉菜单栏，点击”作为媒体设备连接“，在进入的菜单里选择第四个”内置光盘“。（或者进入设置，选择”关于手机“，选择”USB计算机连接“，选择”连接方式“，选择”内置光盘“）这样之后电脑就有反应了

### 4.2 获取配置说明

电脑这边，设备选择”mx4“，双击进入文件夹”MX4 USB Reference Manual“，双击进入文件夹”简体”，打开文件夹“MX4_MTP_参考说明书.txt”，复制以下内容：

```
# Meizu MX4 (MTP+ADB)

ATTR{idVendor}=="2a45", ATTR{idProduct}=="0c02", SYMLINK+="libmtp-%k",

MODE="660", GROUP="audio", ENV{ID_MTP_DEVICE}="1", ENV{ID_MEDIA_PLAYER}="1"

# Meizu MX4 (MTP)

ATTR{idVendor}=="2a45", ATTR{idProduct}=="2008", SYMLINK+="libmtp-%k",

MODE="660", GROUP="audio", ENV{ID_MTP_DEVICE}="1", ENV{ID_MEDIA_PLAYER}="1"

# Meizu MX4 (MTP+ADB+ACM)

ATTR{idVendor}=="2a45", ATTR{idProduct}=="200A", SYMLINK+="libmtp-%k",

MODE="660", GROUP="audio", ENV{ID_MTP_DEVICE}="1", ENV{ID_MEDIA_PLAYER}="1"

# Meizu MX4 (MTP+ACM)

ATTR{idVendor}=="2a45", ATTR{idProduct}=="2012", SYMLINK+="libmtp-%k",

MODE="660", GROUP="audio", ENV{ID_MTP_DEVICE}="1", ENV{ID_MEDIA_PLAYER}="1"
```


### 4.3 配置linux规则

用root权限打开文件/lib/udev/rules.d/69-libmtp.rules
```
root@Lin-Ubuntu:/home/lin# gedit /lib/udev/rules.d/69-libmtp.rules
```

编辑文件，将刚才复制的那一段内容粘贴到文件里的合适位置，并保存。

[具体详见下面的链接](http://jingyan.baidu.com/article/a3761b2ba329571576f9aa09.html)

adb 配置问题可参考内置光盘的内容，注意，在链接的时候一定要选择媒体设备MTP


## 五.安装虚拟机
### 5.1 deb安装：
```
	sudo dpkg -i package.deb
```

**Note:** unbutu 16.0.4无法安装deb文件，可以参考[virtualBox](https://www.virtualbox.org/wiki/Linux_Downloads)官方网站手动安装

出现以下问题:
```

下列软件包有未满足的依赖关系：
 virtualbox-5.1 : 依赖: libvpx1 (>= 1.0.0) 但无法安装它
                  推荐: libsdl-ttf2.0-0 但是它将不会被安装
E: 无法修正错误，因为您要求某些软件包保持现状，就是它们破坏了软件包间的依赖关系。
```

请使用apt-get 单独安装，[libvpxx1](https://packages.ubuntu.com/trusty/amd64/libvpx1/download) 需要手动下载安装

### 5.2 系统激活

### 5.3 系统全屏化
如果手动在设置中安装增强功能无效，可以在下面的虚拟光驱中选择VBoxGuestAdditions文件（注意系统是32位还是64位的）点击安装即可
### 5.4 共享目录设置

这里其实可以在`设备`->`共享文件夹`->选择宿主主机共享目录，使用固定分配即可
```
	VBoxManage sharedfolder add "win-dev" -name "share" -hostpath "/home/liaojinlong/Share"
```

注意：执行此命令时，确保当前运行的虚拟机系统关闭
win 7 执行一下命令
```
	net use z: \\vboxsvr\共享的目录名  这里就是share
```
如果显示命令执行成功，表示共享目录创建成功
**NOTE:** 注意z: 和 \\中间有空格

这里其实是映射网络驱动，可以在文件功能中使用`映射网络`驱动

### 5.5 Vmwware 作为独立主机获取局域网ip地址方法
其实方法简单，只需要在设置->网络这个选项卡中的连接方式中选择“桥接网卡”，混杂模式选择“允许虚拟电脑”
这样Vmware虚拟机就会重新获取局域网ip，作为一个独立的主机了
[具体问题详见此](http://zhidao.baidu.com/link?url=Em-j_y9WCHw306GLsxrU22hr_sq3FIHt7CPRFPvMfrxMH5vSmJO9Oz1NLNt2rVlCOR16OOFfL9yqB0RG_LKBoa)

### 5.6 [windows 远程登录Ubuntu](http://jingyan.baidu.com/article/a501d80cf71bc3ec630f5e0c.html)


### 5.7 Linux 文件夹共享

* 设置主机共享文件夹目录，并命名共享文件夹目录名称为`Share`
* 启用vm 虚拟机增强功能
* `sudo modprobe vboxsf`  /挂载vboxsf模块，否则出现‘mounting failed with the error:no such device’错误提示,如果出现错误，重启虚拟机
* `sudo mount -t vboxsf Share ~/Share/` 注意在虚拟机目录建立`Share`文件夹

**NOTE:**　参考资料

* [VirtualBox─Linux系统虚拟机共享文件夹](http://www.linuxidc.com/Linux/2014-05/101736.htm)
* [启用文件共享](https://askubuntu.com/questions/456400/why-cant-i-access-a-shared-folder-from-within-my-virtualbox-machine)

## 六. 安装Chrome
* [Ubuntu 14.04 下安装google的浏览器——Chrome](http://jingyan.baidu.com/article/a681b0de18071e3b1843463b.html)


## 七. 常用技巧汇总

* 得到当前目前全路径

```
	pwd 
	/home/user/java/jdk1.6.0_45
```
* 运行appt时无法访问的问题

```
	sudo apt-get install g++-multilib
	sudo apt-get install ia32-libs
```

* 获取文件写权限

```
	sudo gedit /etc/profile
```
*　刷新当前环境变量

```
	source /etc/profile
```


### 7.1 gitHub 基本命令
* 分支转换

```
	git branch --set-upstream-to=origin/flyme-3.6.x
	git branch -a
```
* 强制回退

```
	git reset --hard origin/flyme-3.6.x
```
* 设置当前分支依赖远程仓库地址，命令来给本地代码库关联一个远程仓库

```
	$ git remote add origin git@example.com:User/project_name.git
```
* 如何修改已设置好的git远程仓库地址

```
	$ git remote rm origin
	$ git remote add origin git@new-example.com:Newuser/new_project_name.git
```

## 7.2 unbutu常用命令

* 安装卸载系统app

```
	卸载：adb uninstall com.meizu.mzsnssyncservice
	安装：adb install -r Sns_eng.apk
```
* 强制关闭进程命令

```
	xkill
```
* 查看隐藏文件

```
	crtl+h
```
* 就可以用root的权限图形操作任何文件，删除，编辑，拷贝

```
	sudo nautilus
```
* 要修改文件夹内所有的文件和文件夹及子文件夹属性为可写可读可执行

```
	sudo chmod -R 777 upload
```
* 递归更改文件权限

```
	chmod 777 -R ./sdk/
```
* 解压文件

```
	sudo tar xvzf jdk-8u5-linux-x64.tar.gz
```
* push xxx.apk 到system/app

```
	先 adb shell, 然后 mount -o remount rw /system/，
	然后退出shell，adb push xxx.apk  /system/app
```

* 解决failed to copy 'Gallery-m71-eng-debug.apk' to '/system/priv-app/Gallery.apk': Read-only file system

```
	adb remount
```
* 当运行一个命令的时候出现rm failed for CoeeRoat.apk, Read-only file system

```
	adb shell mount -o remount rw /system  挂载设备
```
* push内置应用到system目录

```
	adb shell mount -o remount rw /system
	adb push clock.apk /system/app/clock.apk
```
* 删除内置应用

```
	adb shell mount -o remount rw /system
	adb shell
	cd system/app
	rm -rf clock.apk
```
* bat 文件

```
	adb shell mount -o remount,rw /dev/block/mtdblock3 /system
	adb push sssss  /system/bin/rota
	adb shell sync
	adb shell chown root.shell /system/bin/rota
	adb shell chmod 6755 /system/bin/rota
	adb shell rm -r /system/xbin/sssss
	adb shell sync
	adb shell ln -s /system/bin/sssss /system/xbin/sssss
	adb shell sync
	adb shell mount -o remount,ro /dev/block/mtdblock3 /system
	pause
```
* 查看property

```
	getprop | grep "ro.product.model"
```

* 搜索命令

```
	grep -nr "windowTranslucentNavigation" .
```

* 解决无法链接手机的问题

```
	sudo ./adb devices
```

* 打开系统监视器

```
	gnome-system-monitor
```

* [Linux 内存监控工具汇总](https://9iphp.com/linux/1247.html)

* 强制杀死进程

```
kill -9 pid
```


