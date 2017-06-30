---
layout: post
title: "Linux 基础"
description: Linux 基础技能
category: Linux
---

本文试图说明linux的基本技能，主要说明linux环境下c编程，shell；着重于基础概念，并不是作为进阶的工具，主要起到一个抛砖抛砖引玉的作用，能够通过对这些基本的技能的学习初步掌握解决问题的基本技能。此文章并不深入讨论各个技术点的细节，只是总结出技能之间的依赖关系，归纳出一般的学习步骤，希望对自己的思路有一个清晰的认识。

## Linux 基础
[鸟哥的私房菜PDF]({{ site.url }}/download/linux-introduction.pdf)
## linux C 编程基础
  c 语言编程的基本语法这里不再赘述，基本大同小异，这里主要研究，在工程的条件下，如果快速的编译c代码，像一些面向对象的编程语言都有提供相应的工具入maven，gradle；c也有自己独特的方式。
 * [Linux C编程一站式学习](https://akaedu.github.io/book/index.html)

### 指针

对星号`*`的总结
在我们目前所学到的语法中，星号*主要有三种用途：
* 表示乘法，例如`int a = 3, b = 5, c;  c = a * b;`，这是最容易理解的。
* 表示定义一个指针变量，以和普通变量区分开，例如`int a = 100;  int *p = &a;`。
* 表示获取指针指向的数据，是一种间接操作，例如`int a, b, *p = &a;  *p = 100;  b = *p;`。
* 参考：
   * [大话C 语言指针](http://c.biancheng.net/cpp/html/72.html)

### 宏定义

* [GCC-Macros](https://gcc.gnu.org/onlinedocs/cpp/Macros.html#Macros)
* [GCC-HEADER-FILES](https://gcc.gnu.org/onlinedocs/cpp/Header-Files.html)

### Makefile

* [跟我一起写Makefile](http://wiki.ubuntu.org.cn/%E8%B7%9F%E6%88%91%E4%B8%80%E8%B5%B7%E5%86%99Makefile)

## Shell

* [Shell编程基础](http://wiki.ubuntu.org.cn/Shell%E7%BC%96%E7%A8%8B%E5%9F%BA%E7%A1%80)

## Android NDK

## 参考资料

* [宏的基本概念](http://www.geeksforgeeks.org/interesting-facts-preprocessors-c/)

## 集成开发工具

* [What is the best C & C++ IDE?](https://www.quora.com/What-is-the-best-C-C++-IDE)
* [Clion License Server](http://www.sdbeta.com/mf/2017/0414/177253.html)
  弹出注册窗口选择Activate》License Server》输入`http://xidea.online`，然后点击`Activete`完成认证即可

## C/C++ Library

* [awesome-cpp](https://github.com/fffaraz/awesome-cpp)
* [A list of open source C++ libraries](http://en.cppreference.com/w/cpp/links/libs)