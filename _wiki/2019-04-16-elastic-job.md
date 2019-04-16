---
layout: wiki
title: "【任务调度框架】- elastic job核心原理解析"
categories: [任务调度框架]
description: java concurrency
keywords: 任务调度框架 
---
## 概述
分布式任务调度框架源码分析，主要从设计思想分析其大致的实现思路
* 依赖组件  
任何一个框架不是凭空诞生的，有时候其可能依赖其他第三方框架，因此理解其依赖的框架显得至关重要，如果某个框架是依赖其他框架，也即是源码分析依赖三方框架的实现基础，然后再在此基础上进行扩展增加功能。

* 核心功能  
这时一个开源项目的核心功能，也是其借助三方组件构建起来的逻辑依据。核心功能时框架所要实现的最主要，最核心的功能，开发者不需要关注具体实现，只需要关注接口即可
这里也是常说的实现原理

* 对外核心接口  
框架本身可以任由开发者自由使用，不再依赖诸如spring框架，这就是该框架提供的核心编程接口，包括配置接口，核心功能接口

## 源码解析

### 依赖组件
* [quartz 框架使用](http://www.quartz-scheduler.org/documentation/quartz-2.2.2/tutorials/)
* [zookeeper client curator](https://github.com/apache/curator)

### zookeeper注册中心
利用注册中心的持久节点与临时节点特性实现数据存储监听

### 对外核心接口
#### 配置类
这里的配置类主要还是任务job的相关运行的配置，例如job名称，定时调度规则
* JobCoreConfiguration  作业核心配置类
对任务进行分类配置
* SimpleJobConfiguration
* ScriptJobConfiguration
* DataflowJobConfiguration

JobScheduler最终配置类
* LiteJobConfiguration 增加一些参数，包括分片策略

#### 核心功能接口
任务调度框架，主要是在特定事件调用开发这定义的job，一般思路就是需要开发者实现自己的job，以便于定时调度框架等待时间来临之时进行任务调度。基于此思想开发者需要配置job实现类
* JobScheduler 核心启动类 启动任务
api接口,这些接口就是开发者编程接口，实现这里的逻辑，等待框架定时调度
* simpleJob 简单job
* dataflowJob 工作流job
* scriptJob 脚本型作业

### 任务调度核心框架
从作业的启动初始化开始,主要核心调度还是依赖quartz进行调度,具体调度方式参考quartz的核心用法
单个作业的启动，暂停，恢复都是依赖quartz定时框架来实现，elasticjob主要实现如何进行分片，以及如果执行该分片的作业

#### 任务调度启动
以下为核心类，任务从这里开始执行，quartz就是回调job的excute的方法来实现任务调度的，可以说，elastic的核心逻辑就是从这里开始的
关于context的解释，上下文也就是指运行某个任务时，这个任何所需要的核心参数，大多保存在这里，供应用取用，用以实现特定的功能
```java
/**
 * Lite调度作业.
 *
 * @author zhangliang
 */
public final class LiteJob implements Job {
    
    @Setter
    private ElasticJob elasticJob;
    
    @Setter
    private JobFacade jobFacade;
    
    @Override
    public void execute(final JobExecutionContext context) throws JobExecutionException {
        JobExecutorFactory.getJobExecutor(elasticJob, jobFacade).execute();
    }
}
```

* AbstractElasticJobExecutor 
基于模板的设计模式,这里定义任务执行的大体框架,elastic job主要依赖zookeeper作为数据存储中心，因此熟悉其数据结构成为理解其工作原理的关键

![image](http://static.iocoder.cn/images/Elastic-Job/2017_10_07/02.png)

```properties
--jobName
       --config 存储job的相关配置信息
       --servers
         -- ${ip} 表明当前服务器是否启用等信息
       --instances 当前运行实例节点
         --${ip}@-@${pid}
       --sharding
         --${分片项}
           --running 作业运行中标记
           --instances 节点数据表示：${ip}@-@${pid} 当前分片在那个机器上运行
           --failover 当前分片失效节点信息，以便于重新执行
           --disable 是否禁用此分片项
           --misfire 是否开启错过任务重新执行
       --leader
         --sharding
           --necessary 是否需要执行分片
           --processing 是否正在执行分片
         --election
           --latch 主节点选取
           --instances
              --${ip}@-@${pid} 当前leader节点，临时节点
         --failover
           --items
             --${分片项} 存储当前失效转移的分片项，latch锁竞争获取
           --latch 执行失效转移的锁
```

## zookeeper任务配置信息

```json
{
    "jobName": "javaSimpleJob", 
    "jobClass": "com.comsince.github.job.simple.JavaSimpleJob", 
    "jobType": "SIMPLE", 
    "cron": "0/5 * * * * ?", 
    "shardingTotalCount": 3, 
    "shardingItemParameters": "0=Beijing,1=Shanghai,2=Guangzhou", 
    "jobParameter": "", 
    "failover": false, 
    "misfire": true, 
    "description": "", 
    "jobProperties": {
        "job_exception_handler": "com.dangdang.ddframe.job.executor.handler.impl.DefaultJobExceptionHandler", 
        "executor_service_handler": "com.dangdang.ddframe.job.executor.handler.impl.DefaultExecutorServiceHandler"
    }, 
    "monitorExecution": true, 
    "maxTimeDiffSeconds": -1, 
    "monitorPort": -1, 
    "jobShardingStrategyClass": "", 
    "reconcileIntervalMinutes": 10, 
    "disabled": false, 
    "overwrite": false
}

```
## 核心流程 
### 主节点选举
利用`leader/election/latch`分布式锁，选举出一个节点，进而在`leader/election/instances`写入该leader节点信息，该节点为临时节点

### 节点分片
* 判断当前是不是主节点`leader/election/instances`是不是存储的本节点信息
* 等待所有的分片执行完毕`/sharding/${分片项}/running`节点都移除
* 利用配置的分片策略，对各个服务器分配对应的分片项
* 写入`leader/sharding/necessary`节点
* 执行写入分片 配置`/sharding/${分片项}/instances`到节点data
* 删除 `leader/sharding/necessary` `leader/sharding/processing` 上面三个操作写入删除在同一事务中进行
* 获取当前节点的分片项
* 根据配置参数生成当前分片上下文shardingContext

### 失效转移
策略的促发主要来自于监听zookeeper节点的变更
#### JobCrashedJobListener失败监听
* 获取失效节点`sharding/${分片项}/failover` 节点data存储当前失效节点信息
* 如果failover节点无数据，获取当前节点的分片项`/sharding/${分片项}`,然后创建失效节点`/leader/failover/items/${分片项}`
* 新节点从`/leader/failover/items/` 选取第一个分片执行,并删除该节点，然后重新触发执行,这里是事务的方式执行，保证同个分片只能在一个节点上重新执行
* 失效分片转移执行结束时需要删除`sharding/${分片项}/failover`，因为下次执行任务时会重新促发分片

### 错过执行作业重触发
错过执行即是在前一个任务还在执行的过程中，下个任务的时间点到达，重新促发任务执行操作
* 检查是否存在作业错过执行的情况`/sharding/${分片}/running`仍然存在与下次促发时相关的分片，代表由任务还在执行中
* 建立相应的`/sharding/${分片}/misfire`持久节点,然后退出执行
* 当前任务执行完毕后，检查是否存在misfire分片,然后启动执行

## 总结
elasticjob 基本时围绕zookeeper节点数据进行策略逻辑整合，也更加说明，一个两个数据结构，能够将问题逻辑条理化。
项目的核心在于基于quartz触发job开始后一系列预定义策略，这也是模板设计模式的最好印证。这也更好说明，框架更时一种预定义的策略，策略的整合时这个框架的灵魂


