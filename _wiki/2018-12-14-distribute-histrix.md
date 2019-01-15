---
layout: wiki
title: "【分布式基础组件】- Hystrix核心要点分析"
categories: [开发框架]
description: Spring容器
keywords: Histrix
---

> 本次内容来源于`亿级网络流量Hystrix课程笔记`，如有侵权，请联系删除

# Hystrix 概述
在分布式系统中，每个服务都可能会调用很多其他服务，被调用的那些服务就是依赖服务，有的时候某些依赖服务出现故障也是很正常的。
Hystrix可以让我们在分布式系统中对服务间的调用进行控制，加入一些调用延迟或者依赖故障的容错机制。
Hystrix通过将依赖服务进行资源隔离，进而组织某个依赖服务出现故障的时候，这种故障在整个系统所有的依赖服务调用中进行蔓延，同时Hystrix还提供故障时的fallback降级机制

# Hystrix设计原则

## 基本原则

* __对依赖服务调用时出现的调用延迟和调用失败进行控制和容错保护__
* 在复杂的分布式系统中，阻止某一个依赖服务的故障在整个系统中蔓延，服务A->服务B->服务C，服务C故障了，服务B也故障了，服务A故障了，整套分布式系统全部故障，整体宕机
* 提供fail-fast（快速失败）和快速恢复的支持
* 提供fallback优雅降级的支持
* 支持近实时的监控、报警以及运维操作


## 细节原则

* 阻止任何一个依赖服务耗尽所有的资源，比如tomcat中的所有线程资源
* 避免请求排队和积压，采用限流和fail fast来控制故障
* 提供fallback降级机制来应对故障
* 使用资源隔离技术，比如__bulkhead（舱壁隔离技术）__，__swimlane（泳道技术）__，__circuit breaker（短路技术）__，来限制任何一个依赖服务的故障的影响
* 通过近实时的统计/监控/报警功能，来提高故障发现的速度
* 通过近实时的属性和配置热修改功能，来提高故障处理和恢复的速度
* 保护依赖服务调用的所有故障情况，而不仅仅只是网络故障情况

## 设计思路

* 通过HystrixCommand或者HystrixObservableCommand来封装对外部依赖的访问请求，这个访问请求一般会运行在独立的线程中，资源隔离
* 对于超出我们设定阈值的服务调用，直接进行超时，不允许其耗费过长时间阻塞住。这个超时时间默认是99.5%的访问时间，但是一般我们可以自己设置一下
* 为每一个依赖服务维护一个独立的线程池，或者是semaphore，当线程池已满时，直接拒绝对这个服务的调用
* 对依赖服务的调用的成功次数，失败次数，拒绝次数，超时次数，进行统计
* 如果对一个依赖服务的调用失败次数超过了一定的阈值，自动进行熔断，在一定时间内对该服务的调用直接降级，一段时间后再自动尝试恢复
* 当一个服务调用出现失败，被拒绝，超时，短路等异常情况时，自动调用fallback降级机制
* 对属性和配置的修改提供近实时的支持

# 隔离技术

## 技术对比

* __线程池__   
适合绝大多数的场景，99%的，线程池，对依赖服务的网络请求的调用和访问，timeout这种问题

* __信号量__  
适合你的访问不是对外部依赖的访问，而是对内部的一些比较复杂的业务逻辑的访问，但是像这种访问，系统内部的代码，其实不涉及任何的网络请求，那么只要做信号量的普通限流就可以了，因为不需要去捕获timeout类似的问题，算法+数据结构的效率不是太高，并发量突然太高，因为这里稍微耗时一些，导致很多线程卡在这里的话，不太好，所以进行一个基本的资源隔离和访问，避免内部复杂的低效率的代码，导致大量的线程被hang住


## 线程隔离技术

```java
public class CommandHelloWorld extends HystrixCommand<String> {

    private final String name;

    public CommandHelloWorld(String name) {
        super(HystrixCommandGroupKey.Factory.asKey("ExampleGroup"));
        this.name = name;
    }

    @Override
    protected String run() {
        return "Hello " + name + "!";
    }

}
```

### Command调用方式

* 同步  

```java
new CommandHelloWorld("World").execute()，new ObservableCommandHelloWorld("World").toBlocking().toFuture().get()
```
* 异步

```java
new CommandHelloWorld("World").queue()，new ObservableCommandHelloWorld("World").toBlocking().toFuture()
```

## 信号量隔离技术

* 代码设置

```java
super(Setter.withGroupKey(HystrixCommandGroupKey.Factory.asKey("ExampleGroup"))
        .andCommandPropertiesDefaults(HystrixCommandProperties.Setter()
               .withExecutionIsolationStrategy(ExecutionIsolationStrategy.SEMAPHORE)));
```

## 线程池隔离主要参数配置说明

### command名称和command组

```java
private static final Setter cachedSetter = 
    Setter.withGroupKey(HystrixCommandGroupKey.Factory.asKey("ExampleGroup"))
        .andCommandKey(HystrixCommandKey.Factory.asKey("HelloWorld"));    

public CommandHelloWorld(String name) {
    super(cachedSetter);
    this.name = name;
}
```

### command线程池

> threadpool key代表了一个HystrixThreadPool，用来进行统一监控，统计，缓存,默认的`threadpool key`就是`command group`名称,如果不想直接用command group，也可以手动设置thread pool name

```java
public CommandHelloWorld(String name) {
    super(Setter.withGroupKey(HystrixCommandGroupKey.Factory.asKey("ExampleGroup"))
            .andCommandKey(HystrixCommandKey.Factory.asKey("HelloWorld"))
            .andThreadPoolKey(HystrixThreadPoolKey.Factory.asKey("HelloWorldPool")));
    this.name = name;
}
```

### 综述

* __CommandGroup__  
  * 代表了某一个底层的依赖服务，一个依赖服务可能会暴露出来多个接口，每个接口就是一个command key
  * 在逻辑上去组织起来一堆command key的调用，统计信息，成功次数，timeout超时次数，失败次数，可以看到某一个服务整体的一些访问情况
  * 推荐是根据一个服务去划分出一个线程池，command key默认都是属于同一个线程池的，特殊情况同一服务不同接口可能存在不同接口的调用频率不同，可以单独设置ThreadPoolKey
* __ComandKey__  
代表了一类command，一般来说，代表了底层的依赖服务的一个接口
* __ThreadPoolKey__  
command key，要用自己的线程池，可以定义自己的threadpool key,实现同一个服务不同接口使用不同的线程池


### execution.isolation.strategy
指定了HystrixCommand.run()的资源隔离策略，THREAD或者SEMAPHORE，一种是基于线程池，一种是信号量
```java
// to use thread isolation
HystrixCommandProperties.Setter()
   .withExecutionIsolationStrategy(ExecutionIsolationStrategy.THREAD)
// to use semaphore isolation
HystrixCommandProperties.Setter()
   .withExecutionIsolationStrategy(ExecutionIsolationStrategy.SEMAPHORE)
```

### 线程池大小

* 设置线程池的大小，默认是10

```java
HystrixThreadPoolProperties.Setter()
   .withCoreSize(int value)
```   

### queueSizeRejectionThreshold

控制queue满后reject的threshold，因为maxQueueSize不允许热修改，因此提供这个参数可以热修改，控制队列的最大大小，默认值是5

```java
HystrixThreadPoolProperties.Setter()
   .withQueueSizeRejectionThreshold(int value)
```

### execution.isolation.semaphore.maxConcurrentRequests

设置使用SEMAPHORE隔离策略的时候，允许访问的最大并发量，超过这个最大并发量，请求直接被reject
默认值是10，设置的小一些，否则因为信号量是基于调用线程去执行command的，而且不能从timeout中抽离，因此一旦设置的太大，而且有延时发生，可能瞬间导致tomcat本身的线程资源本占满

```java
HystrixCommandProperties.Setter()
   .withExecutionIsolationSemaphoreMaxConcurrentRequests(int value)
```

# Hystrix执行步骤与原理

* __构建一个HystrixCommand或者HystrixObservableCommand__  
一个HystrixCommand或一个HystrixObservableCommand对象，代表了对某个依赖服务发起的一次请求或者调用
构造的时候，可以在构造函数中传入任何需要的参数
__HystrixCommand__主要用于仅仅会返回一个结果的调用
__HystrixObservableCommand__主要用于可能会返回多条结果的调用

```java
HystrixCommand command = new HystrixCommand(arg1, arg2);
HystrixObservableCommand command = new HystrixObservableCommand(arg1, arg2);
```

* __调用command的执行方法__  
execute()：调用后直接block住，属于同步调用，直到依赖服务返回单条结果，或者抛出异常
queue()：返回一个Future，属于异步调用，后面可以通过Future获取单条结果
observe()：订阅一个Observable对象，Observable代表的是依赖服务返回的结果，获取到一个那个代表结果的Observable对象的拷贝对象
toObservable()：返回一个Observable对象，如果我们订阅这个对象，就会执行command并且获取返回结果

* __检查是否开启缓存__  
如果这个command开启了请求缓存，request cache，而且这个调用的结果在缓存中存在，那么直接从缓存中返回结果

* __检查是否开启了短路器__  
检查这个command对应的依赖服务是否开启了短路器
如果断路器被打开了，那么hystrix就不会执行这个command，而是直接去执行fallback降级机制

* __检查线程池/队列/semaphore是否已经满了__
如果command对应的线程池/队列/semaphore已经满了，那么也不会执行command，而是直接去调用fallback降级机制

* __执行command__  
调用HystrixObservableCommand.construct()或HystrixCommand.run()来实际执行这个command
HystrixCommand.run()是返回一个单条结果，或者抛出一个异常
HystrixObservableCommand.construct()是返回一个Observable对象，可以获取多条结果
如果HystrixCommand.run()或HystrixObservableCommand.construct()的执行，超过了timeout时长的话，那么command所在的线程就会抛出一个TimeoutException
如果timeout了，也会去执行fallback降级机制，而且就不会管run()或construct()返回的值了

* __短路健康检查__  
  * Hystrix会将每一个依赖服务的调用成功，失败，拒绝，超时，等事件，都会发送给circuit breaker断路器
  * 短路器就会对调用成功/失败/拒绝/超时等事件的次数进行统计
  * 短路器会根据这些统计次数来决定，是否要进行短路，如果打开了短路器，那么在一段时间内就会直接短路，然后如果在之后第一次检查发现调用成功了，就关闭断路器


* __调用fallback降级机制__  
在以下几种情况中，hystrix会调用fallback降级机制：run()或construct()抛出一个异常，短路器打开，线程池/队列/semaphore满了，command执行超时了  

# 断路器工作原理

## 断路器执行步骤

* 如果经过短路器的流量超过了一定的阈值，HystrixCommandProperties.circuitBreakerRequestVolumeThreshold()  

举个例子，可能看起来是这样子的，要求在10s内，经过短路器的流量必须达到20个；在10s内，经过短路器的流量才10个，那么根本不会去判断要不要短路

* 如果断路器统计到的异常调用的占比超过了一定的阈值，HystrixCommandProperties.circuitBreakerErrorThresholdPercentage()  
如果达到了上面的要求，比如说在10s内，经过短路器的流量（你，只要执行一个command，这个请求就一定会经过短路器），达到了30个；同时其中异常的访问数量，占到了一定的比例，比如说60%的请求都是异常（报错，timeout，reject），会开启短路

* 断路器从close状态转换到open状态

* 断路器打开的时候，所有经过该断路器的请求全部被短路，不调用后端服务，直接走fallback降级

* 经过了一段时间之后，HystrixCommandProperties.circuitBreakerSleepWindowInMilliseconds()，会half-open，让一条请求经过短路器，看能不能正常调用。如果调用成功了，那么就自动恢复，转到close状态

## 断路器配置

* __circuitBreaker.enabled__  
控制短路器是否允许工作，包括跟踪依赖服务调用的健康状况，以及对异常情况过多时是否允许触发短路，默认是true
```java
HystrixCommandProperties.Setter()
   .withCircuitBreakerEnabled(boolean value)
```

* __circuitBreaker.requestVolumeThreshold__
设置一个rolling window，滑动窗口中，最少要有多少个请求时，才触发开启短路
```java
HystrixCommandProperties.Setter()
   .withCircuitBreakerRequestVolumeThreshold(int value)
```

* __circuitBreaker.sleepWindowInMilliseconds__  
设置在短路之后，需要在多长时间内直接reject请求，然后在这段时间之后，再重新导holf-open状态，尝试允许请求通过以及自动恢复，默认值是5000毫秒
```java
HystrixCommandProperties.Setter()
   .withCircuitBreakerSleepWindowInMilliseconds(int value)
```

* __circuitBreaker.errorThresholdPercentage__  
设置异常请求量的百分比，当异常请求达到这个百分比时，就触发打开短路器，默认是50，也就是50%
```java
HystrixCommandProperties.Setter()
   .withCircuitBreakerErrorThresholdPercentage(int value)
```   

* __circuitBreaker.forceOpen__  
如果设置为true的话，直接强迫打开短路器，相当于是手动短路了，手动降级，默认false
```java
HystrixCommandProperties.Setter()
   .withCircuitBreakerForceOpen(boolean value)
```

* __circuitBreaker.forceClosed__  
如果设置为ture的话，直接强迫关闭短路器，相当于是手动停止短路了，手动升级，默认false
```java
HystrixCommandProperties.Setter()
   .withCircuitBreakerForceClosed(boolean value)
```

# 深入线程池隔离技术

## 线程池隔离技术优点

* 任何一个依赖服务都可以被隔离在自己的线程池内，即使自己的线程池资源填满了，也不会影响任何其他的服务调用
* 服务可以随时引入一个新的依赖服务，因为即使这个新的依赖服务有问题，也不会影响其他任何服务的调用
* 当一个故障的依赖服务重新变好的时候，可以通过清理掉线程池，瞬间恢复该服务的调用，而如果是tomcat线程池被占满，再恢复就很麻烦
* 如果一个client调用库配置有问题，线程池的健康状况随时会报告，比如成功/失败/拒绝/超时的次数统计，然后可以近实时热修改依赖服务的调用配置，而不用停机
* 如果一个服务本身发生了修改，需要重新调整配置，此时线程池的健康状况也可以随时发现，比如成功/失败/拒绝/超时的次数统计，然后可以近实时热修改依赖服务的调用配置，而不用停机
* 基于线程池的异步本质，可以在同步的调用之上，构建一层异步调用层

## 线程池隔离技术缺点
* 线程池机制最大的缺点就是增加了cpu的开销除了tomcat本身的调用线程之外，还有hystrix自己管理的线程池
* 每个command的执行都依托一个独立的线程，会进行排队，调度，还有上下文切换
* Hystrix官方自己做了一个多线程异步带来的额外开销，通过对比多线程异步调用+同步调用得出，Netflix API每天通过hystrix执行10亿次调用，每个服务实例有40个以上的线程池，每个线程池有10个左右的线程
* 最后发现说，用hystrix的额外开销，就是给请求带来了3ms左右的延时，最多延时在10ms以内，相比于可用性和稳定性的提升，这是可以接受的

# 信号量隔离限流
* __sempahore技术可以用来限流和削峰，但是不能用来对调用延迟的服务进行`timeout`和`隔离`__
* __一旦请求数量超过了semephore限定的数量之后，就会立即开启限流__

* `withExecutionTimeoutInMilliseconds(20000)`：timeout也设置大一些，否则如果请求放等待队列中时间太长了，直接就会timeout，等不到去线程池里执行了
* `withFallbackIsolationSemaphoreMaxConcurrentRequests(30)`：fallback，sempahore限流，30个，避免太多的请求同时调用fallback被拒绝访问


# 生产环境优化策略

## 生产环境关键配置优化步骤
* 一开始先不要设置timeout超时时长，默认就是1000ms，也就是1s
* 一开始也不要设置线程池大小，默认就是10
* 直接部署hystrix到生产环境，如果运行的很良好，那么就让它这样运行好了
* 让hystrix应用，24小时运行在生产环境中
* 依赖标准的监控和报警机制来捕获到系统的异常运行情况
* 在24小时之后，看一下调用延迟的占比，以及流量，来计算出让短路器生效的最小的配置数字
* 直接对hystrix配置进行热修改，然后继续在hystrix dashboard上监控
* 看看修改配置后的系统表现有没有改善

## 线程池大小

* 每秒的高峰访问次数 * 99%的访问延时 + buffer
例如每秒30次请求，30 * 0.2 + 4 = 10线程，10个线程每秒处理30次访问应该足够了，每个线程处理3次访问，timeou设置长300ms
* 对于线程池大小来说，一般应该控制在10个左右，20个以内，最少5个，不要太多，也不要太少

## 线程池动态扩容与缩容

* __coreSize__  
设置线程池的大小，默认是10
```java
HystrixThreadPoolProperties.Setter()
   .withCoreSize(int value)
```

* __maximumSize__
设置线程池的最大大小，只有在设置allowMaximumSizeToDivergeFromCoreSize的时候才能生效,默认是10
```java
HystrixThreadPoolProperties.Setter()
   .withMaximumSize(int value)
```

* __keepAliveTimeMinutes__  
设置保持存活的时间，单位是分钟，默认是1
如果设置allowMaximumSizeToDivergeFromCoreSize为true，那么coreSize就不等于maxSize，此时线程池大小是可以动态调整的，可以获取新的线程，也可以释放一些线程
如果coreSize < maxSize，那么这个参数就设置了一个线程多长时间空闲之后，就会被释放掉
```java
HystrixThreadPoolProperties.Setter()
   .withKeepAliveTimeMinutes(int value)
```

* __allowMaximumSizeToDivergeFromCoreSize__  
允许线程池大小自动动态调整，设置为true之后，maxSize就生效了，此时如果一开始是coreSize个线程，随着并发量上来，那么就会自动获取新的线程，但是如果线程在keepAliveTimeMinutes内空闲，就会被自动释放掉,默认是fales   
```java
HystrixThreadPoolProperties.Setter()
   .withAllowMaximumSizeToDivergeFromCoreSize(boolean value)
```

## 监控与报警

### Hystix事件类型

* __execute event type__

| 事件类型 | 含义 |
| :------| :------: | 
|EMIT|observable command返回一个value|
|SUCCESS| 完成执行，并且没有报错|
|FAILURE| 执行时抛出了一个异常，会触发fallback|
|TIMEOUT| 开始执行了，但是在指定时间内没有完成执行，会触发fallback|
|BAD_REQUEST |执行的时候抛出了一个HystrixBadRequestException|
|SHORT_CIRCUITED| 短路器打开了，触发fallback|
|THREAD_POOL_REJECTED| 线程成的容量满了，被reject，触发fallback|
|SEMAPHORE_REJECTED	|	信号量的容量满了，被reject，触发fallback|

* __fallback event type__

| 事件类型 | 含义 |
| :------| ------: | 
|FALLBACK_EMIT|observable command，fallback value被返回了|
|FALLBACK_SUCCESS|fallback逻辑执行没有报错|
|FALLBACK_FAILURE|fallback逻辑抛出了异常，会报错|
|FALLBACK_REJECTION|fallback的信号量容量满了，fallback不执行，报错|
|FALLBACK_MISSING|fallback没有实现，会报错|

* __其他的event type__

| 事件类型 | 含义 |
| :------| ------: | 
|EXCEPTION_THROWN| command生命自周期是否抛出了异常|
|RESPONSE_FROM_CACHE| command是否在cache中查找到了结果|
|COLLAPSED|command是否是一个合并batch中的一个|


* __thread pool event type__

| 事件类型 | 含义 |
| :------| ------: | 
|EXECUTED|线程池有空间，允许command去执行了|
REJECTED|线程池没有空间，不允许command执行，reject掉了|

* __collapser event type__

| 事件类型 | 含义 |
| :------| ------: |
|BATCH_EXECUTED|collapser合并了一个batch，并且执行了其中的command|
|ADDED_TO_BATCH|command加入了一个collapser batch|
|RESPONSE_FROM_CACHE|没有加入batch，而是直接取了request cache中的数据|

### metric统计相关的配置

* __metrics.rollingStats.timeInMilliseconds__  
设置统计的rolling window，单位是毫秒，hystrix只会维持这段时间内的metric供短路器统计使用,<font color="#dd0000">这个属性是不允许热修改的</font>  
默认值是10000，就是10秒钟
```java
HystrixCommandProperties.Setter()
   .withMetricsRollingStatisticalWindowInMilliseconds(int value)
```   

* __metrics.rollingStats.numBuckets__  
该属性设置每个滑动窗口被拆分成多少个bucket，而且滑动窗口对这个参数必须可以整除，同样不允许热修改<font color="#dd0000">默认值是10</font>也就是说，每秒钟是一个bucket  
随着时间的滚动，比如又过了一秒钟，那么最久的一秒钟的bucket就会被丢弃，然后新的一秒的bucket会被创建
```java
HystrixCommandProperties.Setter()
   .withMetricsRollingStatisticalWindowBuckets(int value)
```

* __metrics.rollingPercentile.enabled__  
控制是否追踪请求耗时，以及通过百分比方式来统计，<font color="#dd0000">默认是true</font> 
```java
HystrixCommandProperties.Setter()
   .withMetricsRollingPercentileEnabled(boolean value)
```

* __metrics.rollingPercentile.timeInMilliseconds__  
设置rolling window被持久化保存的时间，这样才能计算一些请求耗时的百分比<font color="#dd0000">默认是60000ms</font>，60s，不允许热修改  
相当于是一个大的rolling window，专门用于计算请求执行耗时的百分比
```java
HystrixCommandProperties.Setter()
   .withMetricsRollingPercentileWindowInMilliseconds(int value)
```

* __metrics.rollingPercentile.numBuckets__  
设置rolling percentile window被拆分成的bucket数量，上面那个参数除以这个参数必须能够整除，不允许热修改<font color="#dd0000">默认值是6</font>，也就是每10s被拆分成一个bucket
```java
HystrixCommandProperties.Setter()
   .withMetricsRollingPercentileWindowBuckets(int value)
```

* __metrics.rollingPercentile.bucketSize__  
设置每个bucket的请求执行次数被保存的最大数量，如果再一个bucket内，执行次数超过了这个值，那么就会重新覆盖从bucket的开始再写  
举例来说，如果bucket size设置为100，而且每个bucket代表一个10秒钟的窗口，但是在这个bucket内发生了500次请求执行，那么这个bucket内仅仅会保留100次执行  
如果调大这个参数，就会提升需要耗费的内存，来存储相关的统计值，不允许热修改<font color="#dd0000">默认值是100</font> 
```java
HystrixCommandProperties.Setter()
   .withMetricsRollingPercentileBucketSize(int value)
```

* __metrics.healthSnapshot.intervalInMilliseconds__  
控制成功和失败的百分比计算，与影响短路器之间的等待时间，<font color="#dd0000">默认值是500毫秒</font> 
```java
HystrixCommandProperties.Setter()
   .withMetricsHealthSnapshotIntervalInMilliseconds(int value)
```   


> 不要随便乱改资源配置，不要随便乱增加线程池大小，等待队列大小，异常情况是正常的.千万不要急于给你的依赖调用过多的资源，比如线程池大小，队列大小，超时时长，信号量容量，等等，因为这可能导致我们自己对自己的系统进行DDOS攻击
