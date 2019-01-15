---
layout: wiki
title: "【分布式基础组件】- RPC框架设计基础要点概览"
categories: [RPC]
description: RPC
keywords: PRC
---
<font color="#dd0000"></font> 

# 概述

RPC框架在微服务架构中占有举足轻重的地位，目前有阿里的`Dubbo`，Spring Cloud也开放了相关支持组件，本文将在魅族自研的RPC框架基础上，分析实现一个RPC框架需要具备的知识点以及需要考虑的问题

# 技术要点

* __Spring Bean 生命周期__  
java项目往往需要使用Spring框架集成，如果一个rpc框架能够很好的与Spring框架集成必然带来友好的接入体验，因此需要spring相关技术
* __网络通信__  
服务端消息传递需要通过网络传递，可以通过`HTTP`短链接，也可以通过`TCP`长连接，为了追求高效率建议使用TCP长连接，因袭需要熟练掌握`Netty`的原理以及使用
* __序列化__  
对象序列化，减少传输数据量
* __服务治理__
  * 负载均衡
  * 服务自动发现
  * 服务高可用

# Bean Schema 定义

## Spring xml 接入方式

```xml
<beans xmlns="http://www.springframework.org/schema/beans"  
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"   
    xmlns:comsince="http://www.comsince.com/comsince/schema/service"  
    xsi:schemaLocation="  
http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.1.xsd  
http://www.comsince.com/comsince/schema/service http://www.comsince.com/comsince/schema/service.xsd">
  <comsince:registry url="zookeeper://zk1:2181,zk2:2181,zk3:2181?timeout=3000" />
  <comsince:client loadbalancer="roundrobin" timeout="3000" retry="5" />
  <comsince:stub id="testAPI" node="/service/test" interface="com.rpc.test"/>
</bean>  
```

> 如上是采用xml方式接入rpc框架，主要包括`xmlns`,`xsd`等定义,关于更多与spring集成的方式，可以参考携程[Apollo](https://github.com/apollo)client项目，里面有包括spring xml，java annotation方式集成

## 参考资料

* [XML Schema Authoring-自定义bean命名空间](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#xml-custom) 

## Spring 核心初始化类说明

* __公共配置类__
  * SpringRegistry  注册中心配置类

  ```xml
  <comsince:registry url="zookeeper://zk1:2181,zk2:2181,zk3:2181?timeout=3000" />
  ```

  * SpringApplication 应用名称配置类

  ```xml
  <comsince:application appName="comsince" phones="13588888888"/>  
  ```

* __客户端配置类__
  * SpringClient 客户端配置类 

  ```xml
  <comsince:client loadbalancer="roundrobin" timeout="3000" retry="5" />
  ```

  * SpringComsinceStub 客户端接口调用类

  ```xml
  <comsince:stub id="testAPI" node="/service/test" interface="com.rpc.test"/>
  ```

* __服务端配置类__

  * SpringService

  ```xml
  <comsince:service node="/test/service/TestApp/RedirectorService" ref="RedirectorServiceImpl"/>
  ```

  * SpringServer

  ```xml
  <comsince:server syncThreadPool="1024" asyncThreadPool="1024" port="6319" />
  ```

# 客户端调用核心接口解析

以上是rpc客户端接入方式，采用了spring xml配置bean的房，下面将逐一说明实现原理

## 请求代理类
此类定义远程调用接口的关键参数
* __id__  远程调用对象id
* __node__ 存储当前服务节点信息的zookeeper节点名称 
* __interface__ 需要模拟rpc远程调用的接口名称，因为需要使用动态代理方式实现，这里需要指名需要代理的接口，并且只能是接口


## 实现FactoryBean接口

```java
  @Override
  public Object getObject() throws Exception {
    return buildStub();
  }

 /**
   * 工厂方法，生成proxy
   * @return
   * @throws ClassNotFoundException
   */
  private Object buildStub() throws ClassNotFoundException{
    Class<?> clazz = null;
    try{
      clazz = Class.forName(interfase);
    }catch (ClassNotFoundException e){
      LOG.error("找不到class, 如果这是一个protobuf类，请指定protocol=\"protobuf\"");
      throw e;
    }
    if(!clazz.isInterface()){
      throw new IllegalArgumentException("interface("+interfase+")不是接口");
    }
    Class<?>[] inter = new Class<?>[1];
    inter[0] = clazz;
    Object proxy = Proxy.newProxyInstance(clazz.getClassLoader(), inter, new StubHandler());
    return proxy;
  }
```

## 集群代理

为了实现服务自动发现，所有的服务提供者在启动后都是自动注册zookeeper注册中心中，服务调用者在进行调用的时候需要选取其中一个服务提供者进行调用，这里就涉及到`服务路由`、`服务发现`、`负载均衡`

### 限流降级

* __核心接口__

```java
public interface FaultThrottleInvoker<T,R>{
   /**
    * 执行容错后回调业务代码
    * @param requestWrapper
    * @param callbackable
    * @return
     */
   T invoke(RequestWrapper requestWrapper, FaultThrottleCallbackable callbackable) throws Throwable;

   interface FaultThrottleCallbackable<T>{
      T callback() throws Exception;
   }
}
```
利用Histrix 线程隔离，容错机制，限制客户端并发数，以及容错降级

### 负载均衡策略

* __核心接口__

```java
public interface Loadbalancer {
  
   /**
    * 根据服务名选取相应的invoker
    **/
    public Invoker select(final String serviceName, final List<ServerInfo> invokers);
    /**
     * 销毁
     */
    public void destroy();
}
```

* RoundrobinLoadBalancer 简单的轮询负载均衡
* WeightLoadbalancer 固定权重计算负载
* WRRLoadBalancer 权重负载均衡
* DynamicWrrLoadBalancer 动态权重调度


### 服务调用

* __核心接口__

```java
public interface Invoker extends ILifeCycle {
    /**
     * 请求调用
     *
     * @param request
     * @return
     * @throws Throwable
     */
    Object invoke(RequestWrapper request) throws RpcException;
}
```

# 集群配置初始化
## 注册中心
* 核心接口

```java
public interface Registry extends ILifeCycle {
    /**
     * 注册节点
     *
     * @param path
     * @param data
     */
    void register(String path, Object data);

    /**
     * 下线节点
     *
     * @param path
     */
    void unregister(String path);

    boolean update(String path, Object data);

    /**
     * 不存在则创建，加更新
     * @param path
     * @param data
     * @return
     */
    boolean updatePersistentPath(String path, Object data);


    /**
     * 节点不存在则创建
     * @param path
     * @param data
     * @return
     */
    boolean createPersistentPath(String path,Object data);

    Object read(String path);

    /**
     * 订阅
     *
     * @param path
     * @param listener
     * @param type
     */
    void subscribe(String path, NotifyListener listener, ListenerType type);

    /**
     * 取消订阅
     *
     * @param path
     * @param listener
     */
    void unsubscribe(String path, NotifyListener listener,ListenerType type);

    List<String> lookup(String path);

    /**
     * 获取注册中心地址
     * @return
     */
    String getRegistryHost();
```
## 订阅服务
### 订阅服务提供者
订阅zookeeper注册中心，实现服务发现功能
```java
private void subscribeProviders() {
        Listener = new NotifyListener() {
            @Override
            public void notify(String parentPath, List<String> list) {
                fireHostsChanged(parentPath, list);
            }

            @Override
            public void notify(String path, Object object) {
                LOG.info(String.format("[comsince:registry]notify server %s data change", path));
                String server = path.replaceFirst(config.getNode() + "/", "");
                ServerInfo newInfo = ServerInfo.buildServerInfo(server);

                NodeData nodeData = (NodeData) JSONObject.parseObject((String) object, NodeData.class);

                for (ServerInfo serverInfo : allServer) {//todo data变化的时候,可能恰好没有添加完成,
                    if (serverInfo.equalServer(newInfo)) {
                        serverInfo.setServiceData(nodeData);//todo 需要刷新服务提供列表
                        removeReConnInvoker(serverInfo);
                        break;
                    }
                }
            }

            @Override
            public String toString() {
                return config.getNode() + "NotifyListener";
            }
        };
        registry.subscribe(config.getNode(), Listener, ListenerType.CHILD);
    }
```

### 链接服务提供者

* __节点信息中提取IP:PORT:TCP构建服务提供者__
* __链接服务提供者__

```java
private void connect(List<ServerInfo> serverInfos) {
        if (serverInfos != null && !serverInfos.isEmpty()) {
            Map<ServerInfo, ChannelFuture> connectionFutures = new HashMap<ServerInfo, ChannelFuture>(serverInfos.size());
            for (ServerInfo current : serverInfos) {
                connectionFutures.put(current, bootstrap.connect(current));
            }
            //同时连多个服务器，异步执行。
            Iterator<Map.Entry<ServerInfo, ChannelFuture>> futureIt = connectionFutures.entrySet().iterator();
            while (futureIt.hasNext()) {
                Map.Entry<ServerInfo, ChannelFuture> next = futureIt.next();
                ChannelFuture f = next.getValue();
                ServerInfo serverInfo = next.getKey();
                Channel channel = f.awaitUninterruptibly().getChannel();
                if (!f.isSuccess()) {
                    LOG.warn("[comsince:client]append connection failed,add weak queue: " + serverInfo,
                            f.getCause());
                    weakServer.add(serverInfo);
                } else {
                    channel.setAttachment(serverInfo);
                    Invoker innvoker = new Invoker(new Channel[]{channel}, serverInfo);
                    InvokerWrapper invoker = new InvokerWrapper(invoker, Cluster.this);
                    serverInfo.setInvoker(invoker);
                    refushProvider(serverInfo, invoker);
                    LOG.info("[comsince:client]append new connection: " + serverInfo);
                }
            }
        }
    }
```

* 建立连接

> 连接接口

```java
public interface IClientBootstrap {
  ChannelFuture connect(ServerInfo serverinfo);
}
```

> 利用Netty与远程服务提供者建立长连接

```java
@Override
public ChannelFuture connect(ServerInfo serverinfo) {
    if(serverinfo.getType() == ServerType.TCP){
      if(tcpClientBootstrap == null){
        createTcpClient();
      }
      return tcpClientBootstrap.connect(new InetSocketAddress(
          serverinfo.getHost(), serverinfo.getPort()));
    }else if(serverinfo.getType() == ServerType.UDP){
      if(udpClientBootstrap == null){
        createUdpClient();
      }
      return udpClientBootstrap.connect(new InetSocketAddress(
          serverinfo.getHost(), serverinfo.getPort()));
    }
    return null;
  }
//建立TCP客户端
private void createTcpClient() {
    tcpClientBootstrap = new ClientBootstrap(new NioClientSocketChannelFactory(
                Executors.newCachedThreadPool(new NameThreadFactory("CLIENT-BOSS")),
                Executors.newCachedThreadPool(new NameThreadFactory("CLIENT-WORK"))));
    tcpClientBootstrap.setOption("tcpNoDelay", true);
    tcpClientBootstrap.setOption("child.tcpNoDelay", true);
    
    tcpClientBootstrap.setPipelineFactory(new ChannelPipelineFactory() {
      private ProtocolDecoder protobufDecoder = new ProtocolDecoder(null);
      private ProtocolEncoder protobufEncoder = new ProtocolEncoder(null);

      @Override
      public ChannelPipeline getPipeline() throws Exception {
        ChannelPipeline p = Channels.pipeline();
        FrameDecoder decoder = new FrameDecoder(null);
        p.addLast("framedecoder", decoder);
        p.addLast("protobufEncoder", protobufEncoder);
        p.addLast("requestHandler", handler);
        return p;
      }
    });
  }  
```

* __将连接服务提供者`Invoker`加入到对应`ServiceInfo`__
* __将serverInfo信息存储到服务提供者Map中，改Map存储着应用名称与服务提供者invoker的对应关系__
* __发起请求响应结果__  
在Netty的handler中处理结果，利用`Java Future`机制，异步回调查询结果

## 重连服务

定时重连，防止长连接异常中断

```java
((Client) bootstrap).getReconnectExecutorService().scheduleWithFixedDelay(new ConnectionTimer(), 0, Constant.CLIENT_RECONNETCTION_DELAY, TimeUnit.MILLISECONDS);
```

# 服务提供者创建

## 监听Spring 容器启动事件

```java
@Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        if (event.getApplicationContext().getParent() == null) {
            if (Server != null) {
                /*
                ClientConfig clientConfig = new ClientConfig();
                try {
                    Client client = null;
                    if (Client == null) {
                        client = Client.createInstance(clientConfig, Server.getRegistry().getRegistry());
                    } else {
                        client = Client.getClient();
                    }
                    //Moniter.serverStart(client, Server.getApplication().getConfig());
                } catch (IOException e) {
                    LOG.error("[:server] monitor start error !");
                    throw new RuntimeException(e);
                }
                */
                Server.getServer().startup();
                LOG.info("[:server] start finish !");
            }
            if (Client != null) {
                //Moniter.clientStart(Client.getClient(), ((ZookeeperRegistry) Client.getRegistry().getRegistry()).getZkClient(),Client.getApplication().getConfig());
                Client.getClient().startup();
                LOG.info("[:client] start finish !");
            }
        }
    }
```

## 创建服务提供者TCP连接

```java
/**
   * 创建TCP Server，在需要用到TCP协议时才创建。
   * @param config
   */
  private ServerBootstrap getTcpServer(ServerConfig config){
    if(tcpServerBootstrap == null){
      ChannelFactory factory = new NioServerSocketChannelFactory(Executors.newCachedThreadPool(new NameThreadFactory("SERVER-BOSS")),
                    Executors.newCachedThreadPool(new NameThreadFactory("SERVER-WORK")),
                    config.getIOThreadCount()<1?PROCESSES_COUNT:config.getIOThreadCount());
      tcpServerBootstrap = new ServerBootstrap(factory);
      tcpServerBootstrap.setPipelineFactory(new ChannelPipelineFactory(){

        private ProtocolDecoder protobufDecoder = new ProtocolDecoder(serviceManager);
        private ProtocolEncoder protobufEncoder = new ProtocolEncoder(serviceManager);
        private ServerChannelHandler handler = new ServerChannelHandler(serviceManager);

        @Override
        public ChannelPipeline getPipeline() throws Exception {
          ChannelPipeline p = Channels.pipeline();
          FrameDecoder decoder = new FrameDecoder(serviceManager);
          p.addLast("framedecoder", decoder);
          p.addLast("protobufEncoder", protobufEncoder);
          p.addLast("requestHandler", handler);
          return p;
        }

      });
      tcpServerBootstrap.setOption("tcpNoDelay", true);
      tcpServerBootstrap.setOption("child.tcpNoDelay", true);
      tcpServerBootstrap.setOption("child.keepAlive", true);
            tcpServerBootstrap.setOption("reuseAddress", true);//端口复用
    }
    return tcpServerBootstrap;
  }
```

## 消息处理

在自定义Netty Handler中处理来自客户端的请求