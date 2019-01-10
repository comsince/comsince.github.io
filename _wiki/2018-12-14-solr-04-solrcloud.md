---
layout: wiki
title: "【分布式搜索】- Solr - SolrCloud集群模式"
categories: [NoSQL 搜索]
description: 搜索
keywords: solr
---

## Solr Cloud入门

* 启动SolrCloud单节点示例

```shell
bin/solr -e cloud
```

* 添加一个新的节点

```shell
mkdir <solr.home for new solr node>
cp <existing solr.xml path> <new solr.home>
bin/solr start -cloud -s solr.home/solr -p <port num> -z <zk hosts string>
```


```shell
mkdir -p example/cloud/node3/solr
cp server/solr/solr.xml example/cloud/node3/solr
bin/solr start -cloud -s example/cloud/node3/solr -p 8987 -z localhost:9983
```

> 前面的命令将在端口8987上启动另一个 solr 节点，并将 solr 主页设置为 example/cloud/node3/solr。新节点会将其日志文件写入 example/cloud/node3/logs

## SolrCloud的工作原理

### 逻辑概念
**逻辑概念的内容如下**：
* 集群可以承载多个Solr文档集合。
* 一个集合可以被分割成多个Shards，这些Shards包含集合中文档的一个子集。
* 一个集合具有的碎片数目是已经确定的：集合可以合理包含的文档数量的理论限制。单个搜索请求可能的并行量。

### 物理概念 

**集群由一个或多个Solr节点组成，Solr节点正在运行Solr服务器进程的实例**
* 每个节点可以承载多个内核。
* 集群中的每个核心都是逻辑碎片的物理副本。
* 每个副本都使用为其集合指定的相同配置。
* 每个分片具有确定的副本数量：集合中内置的冗余级别以及在某些节点变得不可用的情况下集群可以容错的程度。可以在重负载下处理的并发搜索请求数量的理论限制。

### SolrCloud中的分片和索引数据

> 分片是集合的逻辑分区，包含集合中的文档的子集，使集合中的每个文档都包含在一个碎片中。哪个分片包含集合中的每个文档取决于该集合的整体“分片”策略。

* __Leader和副本__
在SolrCloud中没有主人或奴隶。相反，每个碎片至少包含一个物理副本，其中一个是Leader.如果一个Leader失败了，其他副本中的一个会自动选为新的Leader。
__索引方式__:当文档被发送到Solr节点进行索引时，系统首先确定该文档属于哪个分片，然后确定哪个节点当前正在主管该分片的Leader。然后将文档转发给当前Leader进行索引，并且Leader将更新转发给所有其他副本。

* __副本的类型__
  * __NRT__：这是默认的设置。NRT副本（NRT = NearRealTime）维护事务日志，并将新文档写入本地索引。任何这种类型的副本都有资格成为leader。传统上，这是Solr唯一支持的类型。
  * __TLOG__：这种类型的副本维护事务日志，但不会在本地索引文档更改。这种类型有助于加快索引，因为副本中不需要发生任何提交。当这种类型的副本需要更新其索引时，通过复制leader的索引来实现。这种类型的复制品也有资格成为碎片的leader；它会通过首先处理它的事务日志来做到这一点。如果它确实成为leader，它将表现得如同它是NRT类型的复制品一样。
  * __PULL__：这种类型的副本不会维护事务日志，也不会在本地修改索引文档。它只复制碎片leader的索引。没有资格成为碎片leader，根本不参加碎片leader候选。

* 文档路由

Solr提供了在创建集合时通过指定router.name参数来指定集合使用的路由器实现的功能。

### Solr分布式请求

当一个Solr节点收到一个搜索请求时，这个请求就会在后台传送到作为要搜索的集合一部分的分片的副本。
所选择的副本充当聚合器：它创建内部请求以随机选择集合中每个分片的副本，协调响应，根据需要发出任何后续内部请求（例如，改进facet值或请求额外存储的字段），并为客户构建最终响应。

* 限制查询的碎片
* 配置ShardHandlerFactory

```xml
<requestHandler name="/select" class="solr.SearchHandler">
  <!-- other params go here -->
  <shardHandler class="HttpShardHandlerFactory">
    <int name="socketTimeOut">1000</int>
    <int name="connTimeOut">5000</int>
  </shardHandler>
</requestHandler>
```
* 避免分布式死锁

> 每个分片服务于top-level查询请求，然后向所有其他分片发出子请求。应该注意确保服务于HTTP请求的线程的最大数量大于来自top-level客户机和其他分片的可能数量的请求。如果不是这种情况，则配置可能会导致分布式死锁。


## SolrCloud韧性

* SolrCloud恢复和写入容错
* SolrCloud查询路由和读取容错

## SolrCloud配置和参数

### Solr：设置一个外部ZooKeeper集合

具体参见ZooKeeper集群安装



### 使用ZooKeeper管理配置文件
使用SolrCloud，您的配置文件保存在ZooKeeper中。
在以下任何一种情况下都会上传这些文件：
* 当您使用bin/solr脚本启动SolrCloud示例时。
* 当您使用bin/solr脚本创建一个集合时。
* 显式上传配置集到ZooKeeper时。

一旦这些服务器正在运行，您可以像以前一样从Solr中引用它们：

#### 启动引导

```shell
##添加root
./bin/solr zk mkroot /solr -z centos-hadoop1:2181,centos-hadoop2:2181,centos-hadoop3:2181
bin/solr start -e cloud -z centos-hadoop1:2181,centos-hadoop2:2181,centos-hadoop3:2181/solr -noprompt
```

您也可以在使用带有-d选项的bin/solr脚本创建集合时明确上载配置目录，例如：

```shell
bin/solr create -c mycollection -d _default
```

#### 使用bin / solr或SolrJ上传配置文件

```shell
bin/solr zk upconfig -n demo -d /solr/configsets/demo
# 删除配置，注意如果有mkroot，必须要带上
./bin/solr zk rm -r /configs/demo -z centos-hadoop1/solr
```

结果

```shell
[zk: localhost:2181(CONNECTED) 8] ls /configs/demo
[mapping-FoldToASCII.txt, currency.xml, managed-schema, protwords.txt, synonyms.txt, stopwords.txt, _schema_analysis_synonyms_english.json, velocity, update-script.js, _schema_analysis_stopwords_english.json, solrconfig.xml, elevate.xml, clustering, mapping-ISOLatin1Accent.txt, xslt, _rest_managed.json, spellings.txt, lang, params.json]
```

### 使用SolrCloud的Collections API

* __Collections API创建一个集合：CREATE__

```shell
curl http://localhost:8983/solr/admin/collections?action=CREATE&name=newCollection2&numShards=2&replicationFactor=1
```

* __RELOAD：重新加载一个集合__

```shell
curl http://localhost:8983/solr/admin/collections?action=RELOAD&name=newCollection
```

* __Solr删除一个集合：DELETE__

```
curl http://localhost:8983/solr/admin/collections?action=DELETE&name=newCollection1
```

### Solr命令行实用程序

zkCli.sh脚本提供的许多功能也由`Solr控制脚本`提供，可能更为熟悉，因为启动脚本ZooKeeper维护命令与Unix命令非常相似。 

## Solr客户端API
### 使用SolrJ

* 单节点Solr客户端

```java
String urlString = "http://localhost:8983/solr/techproducts";
SolrClient solr = new HttpSolrClient.Builder(urlString).build();
```

* SolrCloud客户端：

```java
// Using a ZK Host String
String zkHostString = "zkServerA:2181,zkServerB:2181,zkServerC:2181/solr"; #注意带上Solr zk root
SolrClient solr = new CloudSolrClient.Builder().withZkHost(zkHostString).build();

// Using already running Solr nodes
SolrClient solr = new CloudSolrClient.Builder().withSolrUrl("http://localhost:8983/solr").build();
```

## 最佳部署实践


> 为了启动时不用每次输入zk地址，可以在`solr.in.sh`配置默认的zk地址，并且带solr root

```shell
# Set the ZooKeeper connection string if using an external ZooKeeper ensemble
# e.g. host1:2181,host2:2181/chroot
# Leave empty if not using SolrCloud
ZK_HOST="centos-hadoop1:2181,centos-hadoop2:2181,centos-hadoop3:2181/solr"

# Set the ZooKeeper client timeout (for SolrCloud mode)
#ZK_CLIENT_TIMEOUT="15000"

# By default the start script uses "localhost"; override the hostname here
# for production SolrCloud environments to control the hostname exposed to cluster state
SOLR_HOST="centos-hadoop2"

# By default Solr will try to connect to Zookeeper with 30 seconds in timeout; override the timeout if needed
#SOLR_WAIT_FOR_ZK="30"

# By default the start script uses UTC; override the timezone if needed
SOLR_TIMEZONE="UTC+8"

```

## 参考资料


* [CentOs7.3 搭建 SolrCloud 集群服务](https://segmentfault.com/a/1190000010836061)
* [CentOs7.3 搭建 SolrCloud 集群服务](https://www.souyunku.com/2017/08/23/SolrCloud/)