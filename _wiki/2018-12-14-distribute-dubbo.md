---
layout: wiki
title: "【分布式基础组件】- Dubbo概览"
categories: [开发框架]
description: Dubbo RPC 框架
keywords: Dubbo RPC
---

本文主要探讨dubbo的设计思想，如果对框架整体性把握，设计出高扩展性的通用框架，例如Netty基于职责链模式设计出可自定义扩展的网络框架，方便开发者自己自定义协议，在框架设计之初考虑框架的扩展性，方便开发者自定义实现功能成为框架首要考虑的问题。
* 组合型框架  
elasticJob 利用quartz实现单机定时任务，利用zookeeper进行任务分布式执行，此类框架重在基于现有框架进行组合，解决特定问题，所以我们需要了解框架利用什么技术解决了什么问题是分析这类框架的关键
* 技术提取  
对于基础提取可以弥补基础的缺失，对于框架在特定问题领域的设计模式实现方案，可以不断深入理解并学习。整个rpc的实现原理就是客户端与服务端远程通信，整个dubbo就是基于netty的高性能异步网络框架结合spring相关技术提供诸如本地方法调用的方式，大大简化了开发，并且在微服务领域对特定问题例如注册中心，监控做了统一封装，那么dubbo的核心流程还是调用，从服务端暴露服务接口给客户端调用，这些rpc矿建所要关心的核心流程。

# 解析说明
由于dubbo模块众多，可以从最基础的网络通信模块开始，分析底层模块的设计思想再逐层向上，dubbo的整体代码结构可以看出其基本结构，逻辑职责清晰的情况下对模块进行清晰划分，定义合理的接口来对外暴露功能

* Dubbo-SPI机制
  Dubbo自定义的spi机制贯穿整个dubbo整个核心模块，它是各个模块自由组合形成一个整体的基石。dubbo尽量是基于接口编程，允许用户自定义扩展，这些前提都是dubbo的SPI作为基础。利用URL携带参数通过生成自适应代码，动态获取当前的实现类，到达实现的动态查找功能。Dubbo的模块具有高度自治的功能，各个独立模块可以罗列出来进行使用，模块之间的关联仅仅通过接口实现，从而达到只依赖接口，不依赖具体实现，从而实现用户自定义扩展。
* dubbo-remoting
	* 传输层 Transporter
	* 交换层 exchanger

* dubbo-registry
	* 订阅层 registry
	* dubbo-remoting-zookeeper 封装zookeeper相关操作

* 协议层 Protocol

* 动态配置中心config-center
  dubbo外部化配置动态获取，并重建dubbo client 和server
* 集群 Cluster
  * Directory 服务目录，托管所有的cosumer，provider，configrator数据
  * Router
  

## 远程调用模块
这里主要是传输层协议，以下是传输层定义的接口,传输层基于该接口扩展出基于Netty，mina等实现方案
```java
public interface Transporter {

    /**
     * Bind a server.
     *
     * @param url     server url
     * @param handler
     * @return server
     * @throws RemotingException
     * @see org.apache.dubbo.remoting.Transporters#bind(URL, ChannelHandler...)
     */
    @Adaptive({Constants.SERVER_KEY, Constants.TRANSPORTER_KEY})
    Server bind(URL url, ChannelHandler handler) throws RemotingException;

    /**
     * Connect to a server.
     *
     * @param url     server url
     * @param handler
     * @return client
     * @throws RemotingException
     * @see org.apache.dubbo.remoting.Transporters#connect(URL, ChannelHandler...)
     */
    @Adaptive({Constants.CLIENT_KEY, Constants.TRANSPORTER_KEY})
    Client connect(URL url, ChannelHandler handler) throws RemotingException;

}
```

* 以client的接口定义为例，其拥有channel，resetable，idlesensiable，endpoint所有功能，要想实现这些接口所有功能，必须聚合所有的能力对象，这就是对象聚合
对于接口，不同的职责最好在不同接口定义，以方便要聚合的对象单独对其实现，例如client功能对channel对象进行聚合，以便实现channel接口提供的能力

### NettyClient设计
![image](/images/wiki/dubbo/nettyclient.png)  

* 构造函数

```java
//构造函数包括请求的url，以及事件处理的handler,NettyClient接收url作为参数构建bootstrap，
//进而启动链接，handler是事件回调，用来通知用户
public NettyClient(final URL url, final ChannelHandler handler) throws RemotingException {
        super(url, wrapChannelHandler(url, handler));
}
```
### NettyChannel
![image](/images/wiki/dubbo/nettychannel.png)  
NettyClient的核心功能主要依赖于nettyChannel的核心实现 

## RPC Protocol

```java
public interface Protocol {

    /**
     * Get default port when user doesn't config the port.
     *
     * @return default port
     */
    int getDefaultPort();

    /**
     * Export service for remote invocation: <br>
     * 1. Protocol should record request source address after receive a request:
     * RpcContext.getContext().setRemoteAddress();<br>
     * 2. export() must be idempotent, that is, there's no difference between invoking once and invoking twice when
     * export the same URL<br>
     * 3. Invoker instance is passed in by the framework, protocol needs not to care <br>
     *
     * @param <T>     Service type
     * @param invoker Service invoker
     * @return exporter reference for exported service, useful for unexport the service later
     * @throws RpcException thrown when error occurs during export the service, for example: port is occupied
     */
    @Adaptive
    <T> Exporter<T> export(Invoker<T> invoker) throws RpcException;

    /**
     * Refer a remote service: <br>
     * 1. When user calls `invoke()` method of `Invoker` object which's returned from `refer()` call, the protocol
     * needs to correspondingly execute `invoke()` method of `Invoker` object <br>
     * 2. It's protocol's responsibility to implement `Invoker` which's returned from `refer()`. Generally speaking,
     * protocol sends remote request in the `Invoker` implementation. <br>
     * 3. When there's check=false set in URL, the implementation must not throw exception but try to recover when
     * connection fails.
     *
     * @param <T>  Service type
     * @param type Service class
     * @param url  URL address for the remote service
     * @return invoker service's local proxy
     * @throws RpcException when there's any error while connecting to the service provider
     */
    @Adaptive
    <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException;

    /**
     * Destroy protocol: <br>
     * 1. Cancel all services this protocol exports and refers <br>
     * 2. Release all occupied resources, for example: connection, port, etc. <br>
     * 3. Protocol can continue to export and refer new service even after it's destroyed.
     */
    void destroy();

}
```

* 服务引用的过程是实质是DubboProtocol利用NettyClient导出Invoker，供反射调用

```java
public interface Invoker<T> extends Node {

    /**
     * get service interface.
     *
     * @return service interface.
     */
    Class<T> getInterface();

    /**
     * invoke.
     *
     * @param invocation
     * @return result
     * @throws RpcException
     */
    Result invoke(Invocation invocation) throws RpcException;

}
```

* 集群服务管理所有的invoker

# 扩展机制
类似Java SPI机制的自定义扩展机制

## ExtensionLoader关键说明
* 不同SPI接口的对应不用ExtendsionLoader，缓存在`private static final ConcurrentMap<Class<?>, ExtensionLoader<?>> EXTENSION_LOADERS = new ConcurrentHashMap<>();`
* 不同实现类对应不同的实例，缓存在`private static final ConcurrentMap<Class<?>, Object> EXTENSION_INSTANCES = new ConcurrentHashMap<>();`
* `getAdaptiveExtension` 获取自适应扩展，同一SPI接口对应同一个adaptiveExtension，缓存在`private final Holder<Object> cachedAdaptiveInstance = new Holder<>();`,为了避免自适应代码无限循环，
使用@Adaptive标注的类不在通过代码生成的方式获取，而是获取改自适应的类，缓存在`cachedAdaptiveClass`
* wrapperClass策略，缓存在`cachedWrapperClasses`中，采用装饰器模式为原有功能增加一些新特性
* `Activate`机制用于从众多实现中选取group指定的实现

## 根据ExtensionName获取扩展
* 实现类似ioc的注入功能，基本数据类型与disInject除外


## 自适应扩展

自适应的核心是要解决同一接口类的不同扩展在不同情况下需要引用不同的实现类的问题。自适应代码的生成，本质是要通过参数获取自适应类的key，从而可以调用`getExtension`方法获取实际的实现类，从而进行相应的逻辑处理

* adaptive 生成成代码

```java
import org.apache.dubbo.common.extension.ExtensionLoader;
public class Protocol$Adaptive implements org.apache.dubbo.rpc.Protocol {
    public org.apache.dubbo.rpc.Exporter export(org.apache.dubbo.rpc.Invoker arg0) throws org.apache.dubbo.rpc.RpcException {
        if (arg0 == null) throw new IllegalArgumentException("org.apache.dubbo.rpc.Invoker argument == null");
        if (arg0.getUrl() == null) throw new IllegalArgumentException("org.apache.dubbo.rpc.Invoker argument getUrl() == null");
        org.apache.dubbo.common.URL url = arg0.getUrl();
        String extName = ( url.getProtocol() == null ? "dubbo" : url.getProtocol() );
        if(extName == null) throw new IllegalStateException("Failed to get extension (org.apache.dubbo.rpc.Protocol) name from url (" + url.toString() + ") use keys([protocol])");
        org.apache.dubbo.rpc.Protocol extension = (org.apache.dubbo.rpc.Protocol)ExtensionLoader.getExtensionLoader(org.apache.dubbo.rpc.Protocol.class).getExtension(extName);
        return extension.export(arg0);
    }
    public org.apache.dubbo.rpc.Invoker refer(java.lang.Class arg0, org.apache.dubbo.common.URL arg1) throws org.apache.dubbo.rpc.RpcException {
        if (arg1 == null) throw new IllegalArgumentException("url == null");
        org.apache.dubbo.common.URL url = arg1;
        String extName = ( url.getProtocol() == null ? "dubbo" : url.getProtocol() );
        if(extName == null) throw new IllegalStateException("Failed to get extension (org.apache.dubbo.rpc.Protocol) name from url (" + url.toString() + ") use keys([protocol])");
        org.apache.dubbo.rpc.Protocol extension = (org.apache.dubbo.rpc.Protocol)ExtensionLoader.getExtensionLoader(org.apache.dubbo.rpc.Protocol.class).getExtension(extName);
        return extension.refer(arg0, arg1);
    }
    public void destroy()  {
        throw new UnsupportedOperationException("The method public abstract void org.apache.dubbo.rpc.Protocol.destroy() of interface org.apache.dubbo.rpc.Protocol is not adaptive method!");
    }
    public int getDefaultPort()  {
        throw new UnsupportedOperationException("The method public abstract int org.apache.dubbo.rpc.Protocol.getDefaultPort() of interface org.apache.dubbo.rpc.Protocol is not adaptive method!");
    }
}


public class Transporter$Adaptive implements org.apache.dubbo.remoting.Transporter {
    public org.apache.dubbo.remoting.Server bind(org.apache.dubbo.common.URL arg0, org.apache.dubbo.remoting.ChannelHandler arg1) throws org.apache.dubbo.remoting.RemotingException {
        if (arg0 == null) throw new IllegalArgumentException("url == null");
        org.apache.dubbo.common.URL url = arg0;
        String extName = url.getParameter("server", url.getParameter("transporter", "netty"));
        if(extName == null) throw new IllegalStateException("Failed to get extension (org.apache.dubbo.remoting.Transporter) name from url (" + url.toString() + ") use keys([server, transporter])");
        org.apache.dubbo.remoting.Transporter extension = (org.apache.dubbo.remoting.Transporter)ExtensionLoader.getExtensionLoader(org.apache.dubbo.remoting.Transporter.class).getExtension(extName);
        return extension.bind(arg0, arg1);
    }
    public org.apache.dubbo.remoting.Client connect(org.apache.dubbo.common.URL arg0, org.apache.dubbo.remoting.ChannelHandler arg1) throws org.apache.dubbo.remoting.RemotingException {
        if (arg0 == null) throw new IllegalArgumentException("url == null");
        org.apache.dubbo.common.URL url = arg0;
        String extName = url.getParameter("client", url.getParameter("transporter", "netty"));
        if(extName == null) throw new IllegalStateException("Failed to get extension (org.apache.dubbo.remoting.Transporter) name from url (" + url.toString() + ") use keys([client, transporter])");
        org.apache.dubbo.remoting.Transporter extension = (org.apache.dubbo.remoting.Transporter)ExtensionLoader.getExtensionLoader(org.apache.dubbo.remoting.Transporter.class).getExtension(extName);
        return extension.connect(arg0, arg1);
    }
}

```


# 核心流程
这里我们在分析源码不是不要过多将spring框架引入进来，我们可以看做dubbo和spring两个不同的框架在最后进行整个，以方便开发者集成，但这并不能影响我们分析dubbo的实际的核心流程,至于最后如何与spring结合，最后可以做分析。分析核心原理，一定要抓住主要部分，不要被其他的东西所干扰。

## URL设计
URL作为参数传递的重要载体，其承载有SPI依赖的核心参数，也有各个模块调用层使用到的参数，是dubbo的核心数据结构

## 导出服务
**NOTE：** 如下代码即是如何使用java api的方式进行服务导出，这里将作为分析导出服务的开始  

```java
 ServiceConfig<GreetingsService> serviceConfig = new ServiceConfig<GreetingsService>();
 serviceConfig.setApplication(new ApplicationConfig("first-dubbo-provider"));
 serviceConfig.setRegistry(new RegistryConfig("multicast://224.5.6.7:1234"));
 serviceConfig.setInterface(GreetingsService.class);
 serviceConfig.setRef(new GreetingsServiceImpl());
 serviceConfig.export();
 System.in.read();
```

* 核心思想  
暴露服务是对实现类包装成invoker，传递给procotol进行组装

### URL在导出服务中变化
* 初始化serviceConf

```url
registry://zk-test-master1.meizu.mz:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&export=dubbo%3A%2F%2F172.16.46.201%3A20880%2Forg.apache.dubbo.demo.DemoService%3Fanyhost%3Dtrue%26application%3Ddubbo-demo-api-provider%26bind.ip%3D172.16.46.201%26bind.port%3D20880%26deprecated%3Dfalse%26dubbo%3D2.0.2%26dynamic%3Dtrue%26generic%3Dfalse%26interface%3Dorg.apache.dubbo.demo.DemoService%26methods%3DsayHello%26pid%3D1431%26register%3Dtrue%26release%3D%26side%3Dprovider%26timestamp%3D1557476129799&pid=1431&registry=zookeeper&timestamp=1557476129794
```

* RegistryProtocol协议转换

```url
zookeeper://zk-test-master1.meizu.mz:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&export=dubbo%3A%2F%2F172.16.46.201%3A20880%2Forg.apache.dubbo.demo.DemoService%3Fanyhost%3Dtrue%26application%3Ddubbo-demo-api-provider%26bind.ip%3D172.16.46.201%26bind.port%3D20880%26deprecated%3Dfalse%26dubbo%3D2.0.2%26dynamic%3Dtrue%26generic%3Dfalse%26interface%3Dorg.apache.dubbo.demo.DemoService%26methods%3DsayHello%26pid%3D1431%26register%3Dtrue%26release%3D%26side%3Dprovider%26timestamp%3D1557476129799&pid=1431&timestamp=1557476129794
```

* Dubbo provider url

```url
dubbo://172.16.46.201:20880/org.apache.dubbo.demo.DemoService?anyhost=true&application=dubbo-demo-api-provider&bind.ip=172.16.46.201&bind.port=20880&deprecated=false&dubbo=2.0.2&dynamic=true&generic=false&interface=org.apache.dubbo.demo.DemoService&methods=sayHello&pid=1431&register=true&release=&side=provider&timestamp=1557476129799
```

## 引用服务

调用的核心思想就是利用proxy代理机制封装invoker实现，进行相关的接口调用

```java
ReferenceConfig<PushService> referenceConfig = new ReferenceConfig<PushService>();
referenceConfig.setApplication(new ApplicationConfig("push-dubbo-consumer"));
referenceConfig.setRegistry(new RegistryConfig("zookeeper://zk-test-master1.meizu.mz:2181"));
referenceConfig.setInterface(PushService.class);
referenceConfig.setFilter("test");
PushService pushService = referenceConfig.get();
pushService.pushAll("push from test");
```

### URL在引用服务阶段的变化
* 初始化ReferenceConfig阶段  

```url
registry://zk-test-master1.meizu.mz:2181/org.apache.dubbo.registry.RegistryService?application=push-dubbo-consumer&dubbo=2.0.2&pid=18878&refer=application%3Dpush-dubbo-consumer%26default.generic%3Dfalse%26default.lazy%3Dfalse%26default.sticky%3Dfalse%26dubbo%3D2.0.2%26generic%3Dfalse%26interface%3Dcom.comsince.github.PushService%26lazy%3Dfalse%26methods%3DpushAll%2CpushByTokens%2CpushByToken%2CpushByIp%26pid%3D18878%26register.ip%3D127.0.1.1%26release%3D2.7.1%26side%3Dconsumer%26sticky%3Dfalse%26timestamp%3D1557370097259&registry=zookeeper&release=2.7.1&timestamp=1557370157316
```

* RegistryProtocol协议转换

```url
zookeeper://zk-test-master1.meizu.mz:2181/org.apache.dubbo.registry.RegistryService?application=push-dubbo-consumer&dubbo=2.0.2&pid=19876&refer=application%3Dpush-dubbo-consumer%26default.generic%3Dfalse%26default.lazy%3Dfalse%26default.sticky%3Dfalse%26dubbo%3D2.0.2%26generic%3Dfalse%26interface%3Dcom.comsince.github.PushService%26lazy%3Dfalse%26methods%3DpushAll%2CpushByTokens%2CpushByToken%2CpushByIp%26pid%3D19876%26register.ip%3D127.0.1.1%26release%3D2.7.1%26side%3Dconsumer%26sticky%3Dfalse%26timestamp%3D1557371733919&release=2.7.1&timestamp=1557371736282
```

* Zookeeper Registry 返回的协议

```url
dubbo://172.16.176.23:7461/com.comsince.github.PushService?anyhost=true&application=spring-boot-dubbo-push-connector&bean.name=ServiceBean:com.comsince.github.PushService&dubbo=2.0.2&generic=false&interface=com.comsince.github.PushService&methods=pushAll,pushByTokens,pushByToken,pushByIp&pid=16876&release=2.7.0&revision=1.0-SNAPSHOT&side=provider&timestamp=1556504458219
```

由于`Protocol`接口获取的是一个Adaptive实现，其会主动获取protocol参数选择合适的协议实现，以上对应关系如下
* registry -> RegistryProtocol
* zookeeper -> ZookeeperRegistrayFactory 用于构建zookeeper注册工厂
* dubbo -> DubboProtocol


### 核心调用过程 

#### Wrapper包装器思想
* 基于Procotol的包装，这个是基于dubbo SPI的wrapper功能实现  
dubbo的模块设计安装自顶向上逐层设计，严格按照各层的职责进行接口定义，可以清楚地看到下面的各个模块的引用关系
* [Filter机制](https://dubbo.apache.org/zh-cn/docs/dev/impls/filter.html)
基于装饰器模式，实现请求拦截，类似于severlet filter模式
* dubbo-rpc
* dubbo-remoting  
这里主要基于Netty实现长连接，因此核心问题是设置好消息加解码器Handler，以及消息处理器，消息加解码器可以用户透明，所以问题的关键就在于Netty Client需要接受来自客户端的设置handler。
handler的设置也采用装饰器模式进行功能叠加，这种方式不同于netty的pipeline的职责链模式，包装器模式会导致代码包装层数过多，可能带来阅读上的困难，如果理解其中的原理，其实这样模式更dubbo的spi wrapper是一致的
* dubbo-serialize  
消息序列化主要应用于基于Netty Handler的模式进行消息拦截处理，这样让消息的加解码对用户透明，用户只需要关系其handler消息处理即可


# 总结
研究一个框架需要知道其依赖的底层技术，在打下良好基础的前提，会让人事半功倍
* dubbo依赖网络框架Netty，提供长连接通信服务
* 注册中心提供服务自动发现，失效转移
* SPI机制提供动态价值机制，实现框架灵活扩展，功能拦截
* java 动态代理机制， 反射机制
* java 序列化机制
* 设计模式，wrapper包装器模式，如何对功能拆分，合理组织，设计可扩展的框架


# Dubbo 生态理解dubbo设计

* [dubbo-admin](https://github.com/apache/incubator-dubbo-admin)  
Dubbo-admin 提供服务信息查看，服务治理基本功能
监控方面目前只支持单机查看，不支持集群信息汇总，整体功能不太完善，需要等到dubbo2.7.2版本发布之后，新版metric才能使用

## dubbo metric原理
主要基于服务提供者与服务调用者开启私有服务供dubbo-admin调用收集信息，所以需要provider和consumer提前开启端口才能访问统计数据
* 注册provider 的metric需要consumer发起调用才能触发metric暴露服务

## dubbo-admin改造
* 针对dubbo metric无法配置监控端口的问题，对dubbo进行改造
* dubbo-admin对同一ip地址不同端口的provider和consumer同时提供监控

## Dubbo中重要概念
### 配置中心
相当于dubbo.properties的外部化存储，配置包括注册中心地址，元数据中心地址
### 注册中心
仅仅代表服务注册于发现的地址它还是率属于dubbo配置项
### 元数据中心
由于服务的注册有很多无用参数，过多的参数会导致注册中心节点（例如zookeeper）数据过多，导致节点不稳定，需要将其他参数单独放置，这里的配置也是率属于dubbo配置项




