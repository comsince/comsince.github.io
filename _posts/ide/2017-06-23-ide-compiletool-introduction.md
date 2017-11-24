---
layout: post
title: "IDE集成工具与编译工具常见问题说明"
description: IDE 集成工具说明，包括Android studio，IntelliJ IDEA
category: ide
---

本文主要说明IDE集成开发工具：Android Studio,IntelliJ IDEA;编译工具：gradle，maven；主要说明其在开发过程中遇到的问题及解决方案。


## Android Studio

### 编译问题

#### 如何解决Unsupported major.minor version 52.0问题

* 错误日志

```
* What went wrong:
A problem occurred evaluating project ':wcdb'.
> java.lang.UnsupportedClassVersionError: 
  com/android/build/gradle/LibraryPlugin : Unsupported major.minor version 52.0
```

* 原因分析

ou get this error because a Java 7 VM tries to load a class compiled for Java 8
Java 8 has the class file version 52.0 but a Java 7 VM can only load class files up to version 51.0
In your case the Java 7 VM is your gradle build and the class is com.android.build.gradle.AppPlugin

主要是因为需要制定编译的java版本，由于系统环境变量可能设置为java7版本，可以在自己的项目中指定java版本，如下添加gradle.properties

* 解决方法

```
org.gradle.java.home=/home/user/Program/jdk1.8.0_131
```

这样，即使使用gradlew编译也会默认使用java版本，不会使用java7。

* 参考资料
  * [如何解决Unsupported major.minor version 52.0问题](http://www.jianshu.com/p/5eebd3c609d6)
  * [CircleCI Android Unsupported major.minor version 52.0](https://stackoverflow.com/questions/38209522/circleci-android-unsupported-major-minor-version-52-0)


### GLIBCXX_3 升级问题
 
 * 错误日志

 ```
  /usr/lib/x86_64-linux-gnu/libstdc++.so.6: version `GLIBCXX_3.4.18' not found
 ```

 * 问题排查

 如下命令列出libstdc++ 版本列表

 ```
 strings /usr/lib/x86_64-linux-gnu/libstdc++.so.6 | grep GLIBCXX
 GLIBCXX_3.4
GLIBCXX_3.4.1
GLIBCXX_3.4.2
GLIBCXX_3.4.3
GLIBCXX_3.4.4
GLIBCXX_3.4.5
GLIBCXX_3.4.6
GLIBCXX_3.4.7
GLIBCXX_3.4.8
GLIBCXX_3.4.9
GLIBCXX_3.4.10
GLIBCXX_3.4.11
GLIBCXX_3.4.12
GLIBCXX_3.4.13
GLIBCXX_3.4.14
GLIBCXX_3.4.15
GLIBCXX_3.4.16
GLIBCXX_DEBUG_MESSAGE_LENGTH
 ```

* 参考资料
  * [GLIBCXX_3.4.20 not found, how to fix this error](https://askubuntu.com/questions/575505/glibcxx-3-4-20-not-found-how-to-fix-this-error)

使用如下命令：

```
sudo apt-get install libstdc++6
```

```
sudo add-apt-repository ppa:ubuntu-toolchain-r/test 
sudo apt-get update
sudo apt-get upgrade
sudo apt-get dist-upgrade
```

出现如下错误：
```
unable to install `/etc/os-release.dpkg-new' as `/etc/os-release': Device or resource busy
```

* 解决方案
增加 /etc/os-release 的读写权限


## Android Studio 字体显示异常

* 解决办法

![image](/images/ide/android-studo-preference.png)
* 参考资料

  * [Ugly font rendering with Android Studio on Java8](https://askubuntu.com/questions/771931/ugly-font-rendering-with-android-studio-on-java8)


## Intellij IDE

### Ubuntu 16.04 idea 无法输入汉字的问题

* 解决办法

在IDEA的bin目录下的idea.sh文件的前面加上

```
export XMODIFIERS=@im=fcitx
export QT_IM_MODULE=fcitx
```

* [ubuntu搜狗输入法，idea下无法输入中文 ](http://edolphin.site/2016/10/26/ubuntu-ieda-input-chinese/)


## Gradle 依赖加入@aar无法传递依赖

* 现象
  例如`compile ('com.meizu.flyme.internet:push-ups:1.0.2-20171121.085103-2@aar')`依赖关系无法传递
* 解决方法
  
```
compile ('com.meizu.flyme.internet:push-ups:1.0.2-20171121.085103-2@aar'){
        transitive=true
    }
```

* [参考](https://stackoverflow.com/questions/22795455/transitive-dependencies-not-resolved-for-aar-library-using-gradle)
    