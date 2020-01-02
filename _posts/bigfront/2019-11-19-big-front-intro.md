---
layout: post
title: "面向后端开发者的前端技术栈概要"
description: front react
category: big-front
---

主要说明前端基础概要，作为索引不断优化补充知识结构，前端技术逐渐走向工程化模式，随着框架的增多，所需的原理知识也不断增多，给一些后端学习带来一些困扰，本文主要说明如何循序渐进，本文结构也遵照认知过程逐渐说明各个技术间的关系，并逐渐深入。本文只是对技术要点进行有规律提取，方便以后进行重点了解，本文主要针对对象是后端开发，可能有时需要独自完成管理后台的开发，前端技术在不断演化，已经逐渐向工程化迈进，不再是简单脚本语言，因此对后端开发提出了新的要求，新的框架的衍生，比如react为开发者建立单页应用提供便利，但也为后端开发者增加了学习成本，因此本文有必要对前端知识做一个系统地描述，以帮助自身形成一个完整的知识体系，并且能够跟随趋势进行技术迭代更新。

# HTML && CSS
* [HTML](https://www.w3schools.com/html/default.asp) 使用xml语法，标记语言，熟悉其基本结构，`element`，`attribute`，在`html`中使用样式`css`的三种方式，css使用`class`，`id`进行样式共享
* [CSS](https://www.w3schools.com/css/default.asp) 描述html 元素如何展示，了解css基本语法`selector:{property:value;}`,重点理解几种selector使用方式，[CSS Combinators](https://www.w3schools.com/css/css_combinators.asp)不同样式定义同一selector的加载顺序，[CSS Pseudo-classes](https://www.w3schools.com/css/css_pseudo_classes.asp)描述元素特定行为下的状态，与[CSS Pseudo-elements](https://www.w3schools.com/css/css_pseudo_elements.asp)描述元素部分样式,理解`CSS box model`这是进行元素内容布局的关键

## 深入理解CSS布局模型
* [Learn to Code HTML & CSS](https://learn.shayhowe.com/html-css/) 可以作为前端基础入门教程，一步一步解释各个组件的功能
* [Learn to Code Advanced HTML & CSS](https://learn.shayhowe.com/advanced-html-css/) css 布局高级技巧进阶，新概念的引入必定有其实际的应用价值，由应用引入新的概念更能帮助读者理解css具体的设计思路，更能应用到实际开发当中
* [学习CSS布局](https://zh.learnlayout.com/) 了解`position`,`display`，`float`等关键属性影响布局的原理

**NOTE:** 通过如上的示例学习，css如何进行html标签定位，理解盒模型的应用，如何利用这些属性美化布局，理解html布局的一些技巧，布局复杂页面

# JavaScript
熟悉[JavaScript](https://www.w3schools.com/js/default.asp)基本结构，了解javascipt对象定义，主要与java等语言的区别，因为其为脚本语言，大多在浏览器内运行，需要结合HTML DOM，因为数据Dom对象至关重要，jquery为我们提供dom相关的便捷操作
* [JQuery](https://learn.shayhowe.com/advanced-html-css/jquery/) 了解jquery在操作dom相关的便利性，主要包括`Selectors`,`Traversing(遍历)`，`Manipulation （元素操作）`，`Events`，`Effect`

了解javaScript如何操作dom对象,作为脚本语言如何动态改变html的`element`,`attribute`,`css style`,监听改变并并处理相应的handler
* [ECMAScript 6 入门](http://es6.ruanyifeng.com/) 掌握ES6新增特性`export`,`import`,`class`
* [A re-introduction to JavaScript (JS tutorial)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript)

**NOTE:** 基于以上技术，可以采用相关的模块，快速掌握以上基本技术[AdminLTE](https://github.com/ColorlibHQ/AdminLTE)

* [javaScript 模块化 commonJs规范说明](https://javascript.ruanyifeng.com/nodejs/module.html) Node 应用由模块组成，采用 CommonJS 模块规范

# 框架篇
针对通过的操作进行抽象，简化开发，例如css规则定义可以适当的抽象，总结出一套固有的ui主题样式，这样的框架即是`bootstrap css`
* JQuery 简化`javascript`操作`dom`
* Bootstrap  `CSS` UI 框架

## React
构建单页面应用，创建可重用的组件，理解[JSX](https://www.w3schools.com/react/react_jsx.asp)，注意jsx引用大段html必须将其加入父亲标签内，不然会报错.组件创建的两种方式，组件之间的基于`import`，`export`实现引用;组件之间通过html的attribute实现prop传递，并且`prop`是只读的；认识component内建对象`state`，并且state对象变更会触发component的rerender，理解组件的生命周期;react事件监听与html的不同，方法采用驼峰式命名，以便于与html事件区分，事件处理方法采用`{}`包围;react中使用`css`的几种方式
* [React](https://zh-hans.reactjs.org/) 介绍React基本概念
* [从零开始学 ReactJS](https://github.com/carlleton/reactjs101) 了解react基本概念以及相关的技术栈，项目编译打包等工具`webpack`的结合，了解模块化管理

> React关键概念系列文章

* [从 React 学习线路图说开去](https://www.html.cn/archives/10111) react 学习路线总览
* [React入门教程 – 概述和实际演练](https://www.html.cn/archives/9710) 根据demo理解react的核心概念
* [2018年学习 React.js 的综合指南](https://www.html.cn/archives/9415) 理解组件之间的数据流传递与状态改变导致的dom更新
* [webpack和babel前端工程化实践demo](https://www.html.cn/archives/9427) 了解前端工程化实践的demo，理解wepack，babel的基本功能
  * [webpack](https://www.html.cn/archives/9436)  webpack 基本使用说明，包括入口点，loader配置，插件配置

### 案例演示
* [calculator](https://github.com/ahfarmer/calculator) 演示了基于react的基本的spa应用构建，展示prop属性传递与state变更刷新，以及事件的处理

## React 生态组件
React生态组件很多，了解它们需要知道在不使用它们会给开发带来那些不便利性，从而理解这些组件引入之后给开发带来的好处

### React-Router
React-Router为单页应用，页面嵌套提供统一的路由配置，路由的原理在于根据路径解析除具体组件，并在相应的父组件中渲染出来，形成层层渲染的模式。相对与传统的多页面应用，减少不必要的重复定义，重点理解[this.prop.children](https://www.reactjscn.com/docs/glossary.html#propschildren)与嵌套路由的组合使用，理解`嵌套路由`的渲染时基于父容器在其内部渲染你相关组件，了解`withRouter`的用法
* [React-router入门Demo](https://github.com/reactjs/react-router-tutorial) 从基本组件慢慢说明其用法，适合新手入门使用
* [A Simple React Router v4 Tutorial](https://blog.pshrmn.com/simple-react-router-v4-tutorial/) 理解react-router实现路由的基本原理

### MobX
利用观察者模式进行数据状态维护的框架
* [MobX：MobX 和 React 十分钟快速入门](https://www.zcfy.cc/article/mobx-ten-minute-introduction-to-mobx-and-react-4306.html?t=new)
* [使用mobx开发高性能react应用](https://foio.github.io/mobx-react/) 说明mobx构建react应用的最佳实践，帮助理解observe模式
* [react-mobx-realworld-example-app](https://github.com/gothinkster/react-mobx-realworld-example-app) 完整示范react-mobx的具体使用，重点理解`provider`和`inject`的使用

## Vue
比较与React的区别，了解各个框架使用难点与特性。这些框架试图改变以往的前端的开发思维，逐步向后端工程化逼近，编程的思想越加趋近。模块化思维，分层思想逐渐整合，相当利用js本身组合`CSS`,`HTML`构建了一套属于自己的GUI系统

包学会浅入浅出Vue，三篇文章从开发角度简要介绍vue的核心特性，快速形成基本的开发思维
* [包学会之浅入浅出Vue.js：开学篇](https://cloud.tencent.com/developer/article/1020337) 了解创建vue单页面应用，路由，组件的基本概念，路由的原理就是对所设定的容器，根据路由配置动态变更其内容，不影响主体框架本身
* [包学会之浅入浅出Vue.js：升学篇](https://cloud.tencent.com/developer/article/1020338) 了解事件监听与触发机制的本质，slot插槽
* [包学会之浅入浅出Vue.js：结业篇](https://cloud.tencent.com/developer/article/1020416)

### 关键特性
为了实现页面相应性，vue实例属性需要与页面绑定，当属性值发生变化时，相应的页面也会发生变更，以下时vue与html原生标签绑定的几种方案
* 实现页面普通属性绑定，主要是文本绑定
* 表单输入实现双向数据绑定，`v-model`
* 计算属性与侦听器，如果是复杂计算，需要使用计算属性绑定
* Class与style绑定，`v-bind`，vue对其专门做了增强，表达式结果的类型除了字符串之外，还可以是对象或数组
* 事件处理，`v-on`,可以之间在上面谢js代码，也可以接收方法名称
* 组件
  * 属性prop传递，可通过`v-bind`传递
  * 子组件与父组件通信，类似react的状态提升，原生组件的点击方法回调。通过回调父组件方法的方式`<button v-on:click="$emit('enlarge-text')">`，调用父组件的方法，也就是子组件将事件抛出，让父组件接收通知调用相应的方法来实现
  * slot
    * 具名插槽 就是明确指明插槽名称，方便template显式替代插槽内容
    * 作用域插槽	访问子组件绑定的prop
  * 组件访问refs
* 路由 
* 状态管理
### 示例教程
* [Vue 2.x Todo 教程](https://www.zmrenwu.com/courses/vue2x-todo-tutorial/) 本教程一步一步说明vue相关的核心概念，理解vue核心参数方法，计算属性，父子组件参数传递与通信机制，比较原生android组件的联系与区别，理解相互之间事件触发机制，参数传递
## 工程工具
* [前端工程化概述](https://segmentfault.com/a/1190000005594760) 梳理前端工程化工具的应用，理解这些工具如何协同工作，提升开发效率
* [NPM](https://www.npmjs.cn/) 重点理解[npm scripts 使用指南](http://www.ruanyifeng.com/blog/2016/10/npm_scripts.html)
* [Webpack]()

## 开发框架
* [Ant Design 实战教程（beta 版）](https://www.yuque.com/ant-design/course/intro)

## 应用项目
* [基于websocket实现的即时聊天vue版本](https://github.com/comsince/vue-chat)