---
layout: post
title: "面向java语言开发者的go语言指南(译文)"
description: 本文旨在通过帮助那些java开发者快速了解go语言的基本特性
category: go
---


此文章旨在帮助java开发者快速了解并使用Go. 最开始我们引入一些java开发者容易熟知的特性，然后在给出一些关于go语言构建模块的详细解释，最后给出一个在java语言中没有直接对应的结构的例子

## 概述
原文链接：[Go for Java programmers](http://www.nada.kth.se/~snilsson/go_for_java_programmers/)

## Hello Stack(例子)

为了引起你的兴趣，我们用一个简单但是相对完整并且常用的例子来开始我们的学习，这个例子和[Stack.java](http://www.nada.kth.se/~snilsson/go_for_java_programmers/src/collection/Stack.java)对应

```
// Package collection implements a stack of strings.
package collection

// The zero value for Stack is an empty stack ready to use.
type Stack struct {
    data []string
}

// Push adds x to the top of the stack.
func (s *Stack) Push(x string) {
    s.data = append(s.data, x)
}

// Pop removes and returns the top element of the stack.
// It’s a run-time error to call Pop on an empty stack.
func (s *Stack) Pop() string {
    n := len(s.data) - 1
    res := s.data[n]
    s.data[n] = "" // to avoid memory leak
    s.data = s.data[:n]
    return res
}

// Size returns the number of elements in the stack.
func (s *Stack) Size() int {
    return len(s.data)
}
```

[stack.go](http://www.nada.kth.se/~snilsson/go_for_java_programmers/src/collection/stack.go)

* 出现在最上层的声明是文件的声明，他们是用纯文本写的
* 声明变量的话，你必须在类型type后面写上变量的名称
* `struct`和java的类类似，但是结构体的成员不能是方法和变量
* `(s *stack)`代码片段声明了方法receiver `s` 类似java的this
* 操作符 `:=` 兼有声明和初始化变量的功能，它的类型会从初始化表达式中自动推导出来

下面是一个Hello world程序，展示了如果使用`collectiong.Stack`的抽象数据类型

```
package collection_test

import (
    "fmt"
    "go_for_java_programmers/collection"
)

func ExampleStack() {
    var s collection.Stack
    s.Push("world!")
    s.Push("Hello, ")
    for s.Size() > 0 {
        fmt.Print(s.Pop())
    }
    fmt.Println()
    // Output: Hello, world!
}

```

这个测试包`collection_test`是和`collection`包在相同的目录下，第一个包含`("fmt")`的引入声明属于标准包；第二个代表我们要引入来自`"go_for_java_programmers/collection"`目录的包。访问这些包的代码区域都是通过其相应的短命名`fmt`和`colletion`

## 概念差异

* Go没有类，构造器等概念，代替java实体方法，类型的继承，多态，Go提供了`structs` 和 `interface`

* Go提供指向所有类型的指针，不仅仅是对象和数组。对于所有类型 `T` 都有一个对应的指针类型 `*T`,代表指向指针类型`T`的具体值

* Go 运行在任何类型上使用方法，方法上的`receiver`,和java的`this`指针类似，可以是一个值，或者是一个指针

* 数组在Go中代表数值，当数组被用作函数的参数时，函数接收到的是这数组的拷贝，不是指向其的指针。然而，在实践中函数通常用`slices`作为参数，slices 代表没有声明的数组。

* Strings 由语言层面支持，一个string看来像是字节slice，但是是始终不变的

* Hash 表也是语言层面支持，它们叫做maps

* 独立的线程执行，`goroutines` 它们之间通过channels交互，`channels`,也是有语言层面支持

* 这些类型(maps，slices，和channels)都是通过引用传递，不是通过值传递。也就是说，传递一个map给函数并不会拷贝这个map；如果这个函数改变了这个map，这个改变也会被调用者所知道。在java中，这可以被认为是这个map的引用

* Go提供两种级别的访问权限，类似java的public和private。如果函数的名称首字母大写的话，代表其访问权限是public的，否则就是private，只能在同级间访问

* 与javaException不同的是，Go使用`error`类型来表示诸如文件结束等错误事件，运行时`panics` 代表诸如数组越界等运行时错误

* Go 不支持隐式类型转换，混合不同类型的操作需要显式的类型转换

* Go 不支持方法重载，在同一范围内函数和方法必须使用唯一的名称

* Go 使用`nil`代表空指针，而java使用null代表空指针

## 关键字

### 声明

声明关键字是和java刚好是反向的，你必须将变量名称放在类型的后面.类型声明从左至右可能可读性稍微好点。

```
Go	                          Approximate Java equivalent
var v1 int	                  int v1 = 0;
var v2 *int	                  Integer v2 = null;
var v3 string	                  String v3 = "";
var v4 [10]int	                  int[] v4 = new int[10]; // v4 is a value in Go.
var v5 []int	                  int[] v5 = null;
var v6 *struct { a int }  	  C v6 = null; // Given: class C { int a; }
var v7 map[string]int	          HashMap<String,Integer> v7 = null;
var v8 func(a int) int	          F v8 = null; // interface F { int f(int a); }
```

变量声明是变量名称在关键字之前。关键字是(const,type,var，function)其中之一。你也可以使用一个关键字后面并行的跟着多个变量声明。

```
var (
    n int
    x float64
)
```

当声明一个函数，你必须给你每一个变量提供一个名称而不是一个名称对应多个参数；你也不能忽略一种一些名称并且提供其他的。你也可以将一些变量归类为同一种类型:

```
func f(i, j, k int, s, t string)
```

一个变量可以在其声明的时候初始化。当这完成时，可以指明这个变量的类型，但也是不是必须的。当类型没有指定时，其默认是初始化值的类型。

```
var v9 = *v2
```

如果一个变量没有显式的初始化，那么其类型必须指定。在这种情况下，其将会被隐式的初始化为零值类型(0，nil等)。在Go中没有未初始化的变量。

### 短声明

在函数中，短声明的语法是 `:=`.

```
v10 := v1
```
这和下面的声明是一样的

```
var v10 = v1
```

### 函数类型

在Go中，函数是一等公民.Go的函数类型表示一系列参数和返回类型的函数集合

```
type binOp func(int, int) int

var op binOp
add := func(i, j int) int { return i + j }

op = add
n = op(100, 200)  // n = 100 + 200
```

### 多重赋值

Go 允许多重赋值。右边的表达式在被赋值到左边的任何一个操作数都会被计算出来。

```
i, j = j, i  // Swap i and j.
```

函数可以有多个返回值，在括号中表示出来。返回值也支持自定义变量，并且可以存储变量值

```
func f() (i int, pj *int) { ... }
v1, v2 = f()
```

### 缺省标识

缺省标识符，用一个下划线`_`表示，表示多值返回时忽略其中的一个返回变量：

```
v1, _ = f()  // Ignore second value returned by f().
```

### 分号和格式化

与其担心分号和格式化，我们可以使用`gofmt`程序来将其格式化为go风格。当然这种风格最开始看起来有点奇怪，但它和其他风格的样式也是一样的优秀，这种风格也会被大家熟知，最终会走向令人舒服的风格。

Go代码很少使用分号。技术上，所有的Go的描述都是以分号结束的。Go隐式的在每一非空白行后加入分号，除非这一行明显没有结束。这种结果就会导致在某种情况下Go不允许越线.如下，你不能这样写：

```
func g()
{            // INVALID; "{" should be on previous line.
}
```

这些写会导致在`g()`后面自动插入分号，就会被理解为是一个函数声明，而不是函数定义。同样，你也不能像下面这样写

```
if n == 0 {
}
else {       // INVALID; "else {" should be on previous line.
}
```

分号将会被插入到`else`前面的 `}`后，这将会导致语法错误。

### 条件声明

Go 在条件语句`if`,`for`表达式声明,`switch`条件值声明周围并没有加上括号。另外一方面，它需要在`if`和`for`的body体重加上大括号。

```
if a < b { f() }
if (a < b) { f() }           // Parentheses are unnecessary.
if (a < b) f()               // INVALID
for i = 0; i < 10; i++ {}
for (i = 0; i < 10; i++) {}  // INVALID
```

此外，`if`和`switch` 支持可选初始化声明，这通常被用作设置一个局部变量

```
if err := file.Chmod(0664); err != nil {
    log.Print(err)
    return err
}
```


### For 声明

Go 没有`while`和`do-while`声明。`for`可以使用单一条件声明，这和`while`类似。省略整个条件语句将会出现无限循环。

`for`声明可以包含`range`语句用于遍历`strings`,`arrays`,`slices`,`map`,或者`channels`.以下书写

```
for i := 0; i < len(a); i++ { ... }
```
可以循环`a`的元素，我们也可以使用如下方式

```
for i, v := range a { ... }
```

i 代表循环遍历`array`,`slice`,`string`成功返回的元素的索引，v代表其值.对于`strings`,i代表字节的索引，v代表Unicode code `runne`(rune是in32的别名)类型的指针。遍历maps将会产生键值对，channels仅产生一个迭代值。

### Breadk 和 continue

和java一样，Go允许`break`和`continue`指定一个标签，但是这个标签只能依赖`for`,`switch`,`select`声明。

### Switch 声明