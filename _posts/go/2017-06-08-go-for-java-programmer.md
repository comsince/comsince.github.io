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

在`swithch`的一个声明中，`case`标签并不会默认的执行，但是你可以在后面加上`fallthrough`让其默认执行

```
switch n {
case 0:  // empty case body
case 1:
    f()  // f is not called when n == 0.
}
```

但是`case`可以有多个值。

```
switch n {
case 0, 1:
    f()  // f is called if n == 0 || n == 1.
}
```

case 后的值可以是任何支持等价比较操作的任何类型，例如`strings`或者`pointers`. 一个缺失`switch`表达式与`true`表达式相等。

```
switch {
case n < 0:
    f1()
case n == 0:
    f2()
default:
    f3()
}
```

### ++ 和 -- 声明

`++`和`--`只能应用在后缀操作符中并且只能用在声明中，不能用在表达式中。例如你不能这样写`n= i++`.

### defer 声明

`defer`声明指定一个函数延期到其周围的函数返回后在执行。这个延期的函数将会执行，而忽略周围的函数在那个路劲返回。当延迟声明执行时，延迟函数的参数，将会被计算和保存以备将来使用。

```
f, err := os.Open("filename")
defer f.Close()  // f will be closed when this function returns.
```


## 常量

在Go中常量可能是没有类型的。这适用于数字，没有类型类型的常量表达式，并且`const`声明可以没有类型，初始化表达式也可以不指定类型。一个从没有指定类型的常量传递过来的值当其被赋给一个指定类型的变量其也会被指定类型。这允许常量应用的相对灵活即使Go没有隐式类型转换。

```
var a uint
f(a + 1)    // The untyped numeric constant 1 becomes typed as uint.
f(a + 1e3)  // 1e3 is also typed as uint.
```

go语言并没有在无类型数字常量大小强加任何限制。只是常量类型在使用时类型被指定有一定额限制。

```
const huge = 1 << 100
var n int = huge >> 98
```

如果在常量声明时没有指定类型并且相应的表达式被计算为无类型的数字常量，这个常量将会被相应地转为如下类型: `rune`,`int`,`float64`,`complex128`,这也取决于这些值是如下类型 字符串，整型，浮点数，或者复杂的常量。

```
c := 'å'      // rune (alias for int32)
n := 1 + 2    // int
x := 2.7      // float64
z := 1 + 2i   // complex128
```

Go 没有枚举类型。相应的你可以在单个`const`声明中使用名为`iota` 来获取一系列递增的值。当一个初始化的表达式省略了`const`,它将重用先前的表达式。

```
const (
    red = iota  // red == 0
    blue        // blue == 1
    green       // green == 2
)
```

## 结构体

结构体与java的类相对应，但是结构体的成员不能是方法，只能是变量。指向结构体的指针类似于java的引用变量。与java相反，结构体只能被定义为直接值。两者都可以使用`.`来访问结构体中的成员。

```
type MyStruct struct {
    s string
    n int64
}

var x MyStruct      // x is initialized to MyStruct{"", 0}.
var px *MyStruct    // px is initialized to nil.
px = new(MyStruct)  // px points to the new struct MyStruct{"", 0}.

x.s = "Foo"
px.s = "Bar"
```

在Go语言中，方法可以应用于任何类型，不仅仅是结构体；你也可以参考`Mehthods 和 interfaces`

## 指针

如果你有一个整型，一个结构体或者一个数组，赋予它们对象内容的拷贝。为了达到java引用变量的效果，Go使用指针来实现。对于任意类型`T`，都有一个对应的指针类型 `*T`, 表示指向类型`T的值的指针。

为了给指针变量分配空间，使用内建的方法`new`,它需要一个类型，并且返回指向其存储空间的指针。这个分配的空间是一个0初始化的类型。例如，`new(int)` 为其分配一个新的`int`的空间，将其初始胡为`0`，并且返回它类型`*int`的地址.

在Java代码`T p = new T()`,T表示一个雷并且有a和b两个整型变量，对应go中的实现:

```
type T struct { a, b int }
var p *T = new(T)
```

或者更加常用的

```
p := new(T)
```

如下声明`var v T`，表示声明一个变量其类型为T,这在Java中没有对应的实现。其中的值可以使用组合方法来创建并初始化，例如：

```
v := T{1, 2}
```

这也和下面的类似

```
var v T
v.a = 1
v.b = 2
```


对于操作类型`T`的变量`x`,地址操作符`&x`表示获取`x`的地址值，同时也表示类型`*T`的值。例如：

```
p := &T{1, 2} // p has type *T
```

操作指针类型的的变量`x`,指针间接`*x`表示指向`x`的值。指针间接很少使用；Go，像java一种，也可以自动获取变量的地址值：

```
p := new(T)
p.a = 1 // equivalent to (*p).a = 1
```

## 切片

一个切片在概念上可以认为其是拥有如下三个字段的结构体：指向数组的指针，长度，和容量。切片支持使用`[]`操作符访问底层数组的元素。内建的`len`函数返回切片的长度。`cap`函数返回切片的容量。

对于给定的数组，或者另外一个切片，一个新的切片可以通过`a[i:j]`来创建。这将指向`a`的切片，索引从i开始，j结束。它的长度为`j-i`. 如果`i`缺省，切片索引从0开始，如果`j`缺省，切片以`len(a)`结束。这个新的切片指向同一个数组，它们都指向`a`.也就是说，新的slice改变其中的元素对于`a`也是可见的。新的切片的容量即是a-j.数组的容量仍然不变。

```
var s []int
var a [10]int

s = a[:]  // short for s = a[0:len(a)]
```

如果你创建了一个类型为`[100]byte`(一个100字节的数组，也可能是一个buffer)的值传递给一个函数而不是一个拷贝，你可以声明一个函数参数为类型`[]byte`，并且传递一个数组的切片作为参数。切片也可以使用`make`来创建

切片结合内建函数`append`使用可以提供和Java `ArrayList`一样的功能。

```
s0 := []int{1, 2}
s1 := append(s0, 3)      // append a single element
s2 := append(s1, 4, 5)   // append multiple elements
s3 := append(s2, s0...)  // append a slice
```

`slice`关键字可以使用在string上。其返回一个新的string其值是原始string的分割子string。


## 创建值

`Map` 和 `channel`的值可以使用内建的函数`makel`来分配。例如，调用

```
make(map[string]int)
```

返回一个新的类型为`map[string]int`的值。和`new`不同的是，`make`返回的是一个真实的对象，不是一个地址。但是事实上`maps`和`channels`始终是引用类型。

对于`maps`,`make`使用一个容量的参数作为第二个可选的参数。对于`channels`,也有第二个可选的参数用于设置`channel`的缓存区容量；默认是0如果不使用缓冲的话。

`make`函数也可以额用于创建切片。在中情况下它为底层数组分配一块内存并且返回指向它的切片。它有一个必要的参数，代表切片元素的数量。第二个可选参数是这个切片的容量。

```
m := make([]int, 10, 20)  // Same as new([20]int)[:10]
```


## 方法和接口

### 方法

一个方法看似一个传统的函数定义，除此以外他还有一个`receiver`.这个`receiver`和java实例方法的`this`指针。

```
type MyType struct { i int }

func (p *MyType) Get() int {
    return p.i
}

var pm = new(MyType)
var n = pm.Get()
```

上面定义了一个`Get`方法，其和`MyType`绑定在一起。这个`receiver`在函数体中被命名为`p`。

`Methods`被定义在`named types`之上。如果你将其转换一个不同的类型，新的值也将拥有新的类型的方法，而不是旧的类型的方法。

你也可以在内建类型上定义方法，可以通过内建类型派生定义一个新的命名的类型。这个新的类型是和内建类型是不同的。

```
type MyInt int

func (p MyInt) Get() int {
    return int(p)  // The conversion is required.
}

func f(i int) {}
var v MyInt

v = v * v          // The operators of the underlying type still apply.
f(int(v))          // int(v) has no defined methods.
f(v)               // INVALID
```

### 接口

