---
layout: post
title: "go语言学习指南"
description: go语言学习资源与进度总结，同时也是促使自己关注社区动态与发展
category: go
---


本文主要就go语言的学习发展，总结自己在学习的道路上遇到的问题，同时对学习资源进行归纳总结，以方便共同学习

## 概述
  近年来语言的飞速发展，的确给大家带来一种应接不暇的现象，究竟如何取舍，的确是让人挺纠结的。自从Google宣布，kotlin 作为android开发的首选语言，java的地位能否像以前一样不得而知，但是基于jvm的语言(Groovy,Kotlin)的发展也让大家看到每种语言在处理特定问题的优势；gradle基于groovy,开发新一代的构建工具，个人觉得你极大提高了生产力，在持续集成领域，无疑增加了一剂猛药。可以看到groovy在领域特定语言上的优势。

  * 客户端
    客户端领域需要一种高效，快速实现业务的语言
  * 服务端
    J2EE开发不断的发展，在起初搭建项目时，过多而又繁琐的配置，让人觉得java越来越臃肿；微服务的出现似乎要打破这种令人窒息的垂直架构，转而向分布式系统进发，spring boot的诞生就可以看出来；此前各种RPC框架的也在服务化打下良好的基础
    docker虚拟化技术，似乎需要一种简洁的方式来实现web端的开发，是否有一种语言能够做到轻量级，答案是go语言

## 一.学习指引
   语言的发展总是相互学习，因此对比式的方法能帮助我们快速理解新语言的新特性
   * [对比java看go语言的基本特性](http://www.flysnow.org/2016/12/28/from-java-to-golang.html)

### 1.1 Go 语言安装

**NOTE:** 这里解释一下安装过程中出现的问题，方便以后追溯
go安装，推荐gvm方式安装，类似node的npm，ruby的rvm 

* go get 无法下载github项目，可以使用如下类似的命令手动下载项目

```
git clone https://github.com/revel/examples.git $GOPATH/src/github.com/revel/examples
```      

## 二.基本要点
   
   * [官方网站go学习站点](https://tour.go-zh.org/list) 带你一步一步的认识go语言基本特性
   * [build-web-application-with-golang](https://github.com/astaxie/build-web-application-with-golang/blob/master/zh/preface.md)   
   * [Go 语言学习资料与社区索引](https://github.com/Unknwon/go-study-index)
   * [ An Introduction to Programming in Go](https://www.golang-book.com/books/intro)

### 2.1 [基本数据结构](https://gobyexample.com)

* array
* slice
  两者定义的的区别
* point
* [Map](https://tour.golang.org/moretypes/22) map取值的多值返回特性

Test that a key is present with a two-value assignment:
```
elem, ok = m[key]
```

 ```
 package main

import "fmt"

func main() {
  m := make(map[string]int)

  m["Answer"] = 42
  fmt.Println("The value:", m["Answer"])

  m["Answer"] = 48
  fmt.Println("The value:", m["Answer"])

  delete(m, "Answer")
  fmt.Println("The value:", m["Answer"])

  v, ok := m["Answer"]
  fmt.Println("The value:", v, "Present?", ok)
}
 ```

 * Func
 [多值返回](https://tour.go-zh.org/basics/6)
 函数也是值。他们可以像其他值一样传递，比如，函数值可以作为函数的参数或者返回值

```
package main

import (
  "fmt"
  "math"
)

func compute(fn func(float64, float64) float64) float64 {
  return fn(3, 4)
}

func add (fn func(int,int) int) int{
  return fn(1,2)
}

func main() {
  
  fmt.Println(compute(func(x, y float64) float64 {
    return math.Sqrt(x*x + y*y)
  }))
  
  fmt.Println(add(func(x,y int) int {
    return x+y
  }))
}

```

 * 闭包
 闭包是由函数及其相关引用环境组合而成的实体(即：闭包=函数+引用环境)

 ```
 package main

import "fmt"

func adder() func(int) int {
  sum := 0
  return func(x int) int {
    sum += x
    return sum
  }
}

func main() {
  one := adder()
  fmt.Println(one(1))
  
}
 ```


* method

Go 没有类。然而，仍然可以在结构体类型上定义方法。方法接收者 出现在 func 关键字和方法名之间的参数中

```
package main

import (
  "fmt"
  "math"
)

type Vertex struct {
  X, Y float64
}

func (v *Vertex) Abs() float64 {
  return math.Sqrt(v.X*v.X + v.Y*v.Y)
}

func main() {
  v := &Vertex{3, 4}
  fmt.Println(v.Abs())
}
```

method和func在定义上有类似之处

### 2.2 面向对象

#### 2.2.1 [struct](https://github.com/astaxie/build-web-application-with-golang/blob/master/zh/02.5.md)

由于go语言中没有对象的概念，需要借助method和struct实现多态的特性

```
package main

  import (
    "fmt"
    "math"
  )

  type Rectangle struct {
    width, height float64
  }

  type Circle struct {
    radius float64
  }

  func (r Rectangle) area() float64 {
    return r.width*r.height
  }

  func (c Circle) area() float64 {
    return c.radius * c.radius * math.Pi
  }


  func main() {
    r1 := Rectangle{12, 2}
    r2 := Rectangle{9, 4}
    c1 := Circle{10}
    c2 := Circle{25}

    fmt.Println("Area of r1 is: ", r1.area())
    fmt.Println("Area of r2 is: ", r2.area())
    fmt.Println("Area of c1 is: ", c1.area())
    fmt.Println("Area of c2 is: ", c2.area())
  }

```

#### 2.2.2 [interface](https://github.com/astaxie/build-web-application-with-golang/blob/master/zh/02.6.md)

go语言没有implement关键字，接口的实现利用method实现

```
type Human struct {
    name string
    age int
    phone string
  }

  type Student struct {
    Human //匿名字段Human
    school string
    loan float32
  }

  type Employee struct {
    Human //匿名字段Human
    company string
    money float32
  }

  //Human对象实现Sayhi方法
  func (h *Human) SayHi() {
    fmt.Printf("Hi, I am %s you can call me on %s\n", h.name, h.phone)
  }

  // Human对象实现Sing方法
  func (h *Human) Sing(lyrics string) {
    fmt.Println("La la, la la la, la la la la la...", lyrics)
  }

  //Human对象实现Guzzle方法
  func (h *Human) Guzzle(beerStein string) {
    fmt.Println("Guzzle Guzzle Guzzle...", beerStein)
  }

  // Employee重载Human的Sayhi方法
  func (e *Employee) SayHi() {
    fmt.Printf("Hi, I am %s, I work at %s. Call me on %s\n", e.name,
      e.company, e.phone) //此句可以分成多行
  }

  //Student实现BorrowMoney方法
  func (s *Student) BorrowMoney(amount float32) {
    s.loan += amount // (again and again and...)
  }
  //Employee实现SpendSalary方法
  func (e *Employee) SpendSalary(amount float32) {
    e.money -= amount // More vodka please!!! Get me through the day!
  }

  // 定义interface
  type Men interface {
    SayHi()
    Sing(lyrics string)
    Guzzle(beerStein string)
  }

  type YoungChap interface {
    SayHi()
    Sing(song string)
    BorrowMoney(amount float32)
  }

  type ElderlyGent interface {
    SayHi()
    Sing(song string)
    SpendSalary(amount float32)
  }
```

**NOTE:** go语言中没有类的概念，想实现面向对象的设计，需要依赖type自定义类型，然后利用method方法实现

```
type MyInterface interface{
    someMethod() 
}
type MyType struct{}
var _ MyInterface = &MyType{}
上面方法会报错，因为其并没有定义someMethod方法，代表其没有实现MyInterface接口
实现MyInterface的 method如下
func (myType *MyType) someMethod()
```

* 空interface

  任意的类型都实现了空interface(我们这样定义：interface{})，也就是包含0个method的interface
  一个函数把interface{}作为参数，那么他可以接受任意类型的值作为参数，如果一个函数返回interface{},那么也就可以返回任意类型的值

* 隐式接口

  有点类型java interface的继承关系，用于扩展接口方法

* 反射


## 三.高级进阶

### 3.1 网络编程

### 3.2 开源框架

   开源项目是进一步学习一门语言的敲门砖，每当你感觉技术瓶颈的时候，开源项目总能改你带来意外的惊喜，因此学习别人的代码也是在促进自己进步。这里推荐的开源项目包括一种框架提供解决问题的整体方案；一个独立项目能够独立完成一项业务需求即可
* [Revel Web开发重量级框架](https://github.com/revel/revel)
* [GoIn 高性能网络框架](https://github.com/gin-gonic/gin)



## 参考资料

* [如何同步 Github fork 出来的分支](https://jinlong.github.io/2015/10/12/syncing-a-fork/)
* [How To Install Ruby on Rails on Ubuntu & LinuxMint using RVM ](https://tecadmin.net/install-ruby-on-rails-on-ubuntu/)

