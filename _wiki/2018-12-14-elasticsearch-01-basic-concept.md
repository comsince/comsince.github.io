---
layout: wiki
title: "【分布式搜索】- Elastissearch基础概念"
categories: [NoSQL 搜索]
description: 搜索
keywords: elasticsearch
---

这里主要说明elasticsearch基本概念

## Elasticsearch的功能

### 分布式的搜索引擎和数据分析引擎
### 全文检索，结构化检索，数据分析

* __全文检索__：我想搜索商品名称包含牙膏的商品，select * from products where product_name like "%牙膏%"
* __结构化检索__：我想搜索商品分类为日化用品的商品都有哪些，select * from products where category_id='日化用品'
* 部分匹配、自动完成、搜索纠错、搜索推荐
* __数据分析__：我们分析每一个商品分类下有多少个商品，select category_id,count(*) from products group by category_id   


## Elasticsearch的适用场景

国外

* （1）维基百科，类似百度百科，牙膏，牙膏的维基百科，全文检索，高亮，搜索推荐
* （2）The Guardian（国外新闻网站），类似搜狐新闻，用户行为日志（点击，浏览，收藏，评论）+社交网络数据（对某某新闻的相关看法），数据分析，给到每篇新闻文章的作者，让他知道他的文章的公众反馈（好，坏，热门，垃圾，鄙视，崇拜）
* （3）Stack Overflow（国外的程序异常讨论论坛），IT问题，程序的报错，提交上去，有人会跟你讨论和回答，全文检索，搜索相关问题和答案，程序报错了，就会将报错信息粘贴到里面去，搜索有没有对应的答案
* （4）GitHub（开源代码管理），搜索上千亿行代码
* （5）电商网站，检索商品
* （6）日志数据分析，logstash采集日志，ES进行复杂的数据分析（ELK技术，elasticsearch+logstash+kibana）
* （7）商品价格监控网站，用户设定某商品的价格阈值，当低于该阈值的时候，发送通知消息给用户，比如说订阅牙膏的监控，如果高露洁牙膏的家庭套装低于50块钱，就通知我，我就去买
*（8）BI系统，商业智能，Business Intelligence。比如说有个大型商场集团，BI，分析一下某某区域最近3年的用户消费金额的趋势以及用户群体的组成构成，产出相关的数张报表，**区，最近3年，每年消费金额呈现100%的增长，而且用户群体85%是高级白领，开一个新商场。ES执行数据分析和挖掘，Kibana进行数据可视化

国内

*（9）国内：站内搜索（电商，招聘，门户，等等），IT系统搜索（OA，CRM，ERP，等等），数据分析（ES热门的一个使用场景）

## Elasticsearch的特点

* （1）可以作为一个大型分布式集群（数百台服务器）技术，处理PB级数据，服务大公司；也可以运行在单机上，服务小公司
* （2）Elasticsearch不是什么新技术，主要是将全文检索、数据分析以及分布式技术，合并在了一起，才形成了独一无二的ES；lucene（全文检索），商用的数据分析软件（也是有的），分布式数据库（mycat）
* （3）对用户而言，是`开箱即用`的，非常简单，作为中小型的应用，直接3分钟部署一下ES，就可以作为生产环境的系统来使用了，数据量不大，操作不是太复杂
* （4）数据库的功能面对很多领域是不够用的（事务，还有各种联机事务型的操作）；特殊的功能，比如全文检索，同义词处理，相关度排名，复杂数据分析，海量数据的近实时处理；Elasticsearch作为传统数据库的一个补充，提供了数据库所不不能提供的很多功能


## elasticsearch的核心概念

* __Near Realtime（NRT）__：近实时，两个意思，从写入数据到数据可以被搜索到有一个小延迟（大概1秒）；基于es执行搜索和分析可以达到秒级

* __Cluster__：集群，包含多个节点，每个节点属于哪个集群是通过一个配置（集群名称，默认是elasticsearch）来决定的，对于中小型应用来说，刚开始一个集群就一个节点很正常
* __Node__：节点，集群中的一个节点，节点也有一个名称（默认是随机分配的），节点名称很重要（在执行运维管理操作的时候），默认节点会去加入一个名称为“elasticsearch”的集群，如果直接启动一堆节点，那么它们会自动组成一个elasticsearch集群，当然一个节点也可以组成一个elasticsearch集群

* __Document&field__：文档，es中的最小数据单元，一个document可以是一条客户数据，一条商品分类数据，一条订单数据，通常用JSON数据结构表示，每个index下的type中，都可以去存储多个document。一个document里面有多个field，每个field就是一个数据字段。

* __Index__：索引，包含一堆有相似结构的文档数据，比如可以有一个客户索引，商品分类索引，订单索引，索引有一个名称。一个index包含很多document，一个index就代表了一类类似的或者相同的document。比如说建立一个product index，商品索引，里面可能就存放了所有的商品数据，所有的商品document。
* __Type__：类型，每个索引里都可以有一个或多个type，type是index中的一个逻辑数据分类，一个type下的document，都有相同的field，比如博客系统，有一个索引，可以定义用户数据type，博客数据type，评论数据type。

* __shard__：单台机器无法存储大量数据，es可以将一个索引中的数据切分为多个shard，分布在多台服务器上存储。有了shard就可以横向扩展，存储更多数据，让搜索和分析等操作分布到多台服务器上去执行，提升吞吐量和性能。每个shard都是一个lucene index。
* __replica__：任何一个服务器随时可能故障或宕机，此时shard可能就会丢失，因此可以为每个shard创建多个replica副本。replica可以在shard故障时提供备用服务，保证数据不丢失，多个replica还可以提升搜索操作的吞吐量和性能。primary shard（建立索引时一次设置，不能修改，默认5个），replica shard（随时修改数量，默认1个），默认每个索引10个shard，5个primary shard，5个replica shard，最小的高可用配置，是2台服务器。

### elasticsearch核心概念 vs. 数据库核心概念

Elasticsearch			数据库

Document	->		行

Type		->		表

Index		->		库

## 基本操作

### 简单的集群管理

* 快速检查集群的健康状况

```
GET /_cat/health?v
epoch      timestamp cluster       status node.total node.data shards pri relo init unassign pending_tasks max_task_wait_time active_shards_percent
1488006741 15:12:21  elasticsearch yellow          1         1      1   1    0    0        1             0                  -                 50.0%
```

* `green`：每个索引的primary shard和replica shard都是active状态的
* `yellow`：每个索引的primary shard都是active状态的，但是部分replica shard不是active状态，处于不可用的状态
* `red`：不是所有索引的primary shard都是active状态的，部分索引有数据丢失了

### 索引查询

```
GET /_cat/indices?v

health status index   uuid                   pri rep docs.count docs.deleted store.size pri.store.size
yellow open   .kibana rUm9n9wMRQCCrRDEhqneBg   1   1          1            0      3.1kb          3.1kb
```

### 创建索引

```
PUT /test_index?pretty
```

### 删除索引

```
DELETE /test_index?pretty
```

#### CRUD操作

* 新增

```
PUT /index/type/id
{
  "json数据"
}

PUT /ecommerce/product/1
{
    "name" : "gaolujie yagao",
    "desc" :  "gaoxiao meibai",
    "price" :  30,
    "producer" :      "gaolujie producer",
    "tags": [ "meibai", "fangzhu" ]
}
```

* 查询

```
GET /index/type/id
GET /ecommerce/product/1
```

* 修改

全局替换
```
PUT /ecommerce/product/1
{
    "name" : "jiaqiangban gaolujie yagao",
    "desc" :  "gaoxiao meibai",
    "price" :  30,
    "producer" :      "gaolujie producer",
    "tags": [ "meibai", "fangzhu" ]
}

```

* 更新

```
POST /ecommerce/product/1/_update
{
  "doc": {
    "name": "jiaqiangban gaolujie yagao"
  }
}
```

* 删除

```
DELETE /ecommerce/product/1

```

## 搜索

### query string search

```
GET /ecommerce/product/_search?q=name:yagao&sort=price:desc
```

* took：耗费了几毫秒
* timed_out：是否超时，这里是没有
* _shards：数据拆成了5个分片，所以对于搜索请求，会打到所有的primary shard（或者是它的某个replica shard也可以）
* hits.total：查询结果的数量，3个document
* hits.max_score：score的含义，就是document对于一个search的相关度的匹配分数，越相关，就越匹配，分数也高
* hits.hits：包含了匹配搜索的document的详细数据

### query DSL

* 查询所有

```
GET /ecommerce/product/_search
{
  "query": { "match_all": {} }
}
```

* 条件查询

```
GET /ecommerce/product/_search
{
    "query" : {
        "match" : {
            "name" : "yagao"
        }
    },
    "sort": [
        { "price": "desc" }
    ]
}
```

* 分页查询

```
GET /ecommerce/product/_search
{
  "query": { "match_all": {} },
  "from": 1,
  "size": 1
}
```

* 指定查询字段

```
GET /ecommerce/product/_search
{
  "query": { "match_all": {} },
  "_source": ["name", "price"]
}
```

### query filter

```
GET /ecommerce/product/_search
{
    "query" : {
        "bool" : {
            "must" : {
                "match" : {
                    "name" : "yagao" 
                }
            },
            "filter" : {
                "range" : {
                    "price" : { "gt" : 25 } 
                }
            }
        }
    }
}

```

### full-text search（全文检索）

倒排索引，分词

```
GET /ecommerce/product/_search
{
    "query" : {
        "match" : {
            "producer" : "yagao producer"
        }
    }
}
```

### phrase search（短语搜索）

* __全文检索__相对应，相反，全文检索会将输入的搜索串拆解开来，去倒排索引里面去一一匹配，只要能匹配上任意一个拆解后的单词，就可以作为结果返回
* __phrase search__，要求输入的搜索串，必须在指定的字段文本中，完全包含一模一样的，才可以算匹配，才能作为结果返回

```
GET /ecommerce/product/_search
{
    "query" : {
        "match_phrase" : {
            "producer" : "yagao producer"
        }
    }
}
```

### highlight search（高亮搜索结果）

```
GET /ecommerce/product/_search
{
    "query" : {
        "match" : {
            "producer" : "producer"
        }
    },
    "highlight": {
        "fields" : {
            "producer" : {}
        }
    }
}
```

## 基础架构

### 复杂分布式机制的透明隐藏特性

* 分片机制
* cluster discovery（集群发现机制，我们之前在做那个集群status从yellow转green的实验里，直接启动了第二个es进程，那个进程作为一个node自动就发现了集群，并且加入了进去，还接受了部分数据，replica shard）
* shard负载均衡（举例，假设现在有3个节点，总共有25个shard要分配到3个节点上去，es会自动进行均匀分配，以保持每个节点的均衡的读写负载请求）
* shard副本，请求路由，集群扩容，shard重分配

### 垂直扩容与水平扩容

* 垂直扩容：采购更强大的服务器，成本非常高昂，而且会有瓶颈，假设世界上最强大的服务器容量就是10T，但是当你的总数据量达到5000T的时候，你要采购多少台最强大的服务器啊

* 水平扩容：业界经常采用的方案，采购越来越多的普通服务器，性能比较一般，但是很多普通服务器组织在一起，就能构成强大的计算和存储能力

### 负载均衡

### 节点平等的分布式架构

* 节点对等，每个节点都能接收所有的请求
* 自动请求路由
* 响应收集

### Shard&replica机制

* index包含多个shard
* 每个shard都是一个最小工作单元，承载部分数据，lucene实例，完整的建立索引和处理请求的能力
* 增减节点时，shard会自动在nodes中负载均衡
* primary shard和replica shard，每个document肯定只存在于某一个primary shard以及其对应的replica shard中，不可能存在于多个primary shard
* replica shard是primary shard的副本，负责容错，以及承担读请求负载
* primary shard的数量在创建索引的时候就固定了，replica shard的数量可以随时修改
* primary shard的默认数量是5，replica默认是1，默认有10个shard，5个primary shard，5个replica shard
* primary shard不能和自己的replica shard放在同一个节点上（否则节点宕机，primary shard和副本都丢失，起不到容错的作用），但是可以和其他primary shard的replica shard放在同一个节点上

### 单node环境下index分布

* 单node环境下，创建一个index，有3个primary shard，3个replica shard
* 集群status是yellow
* 这个时候，只会将3个primary shard分配到仅有的一个node上去，另外3个replica shard是无法分配的
* 集群可以正常工作，但是一旦出现节点宕机，数据全部丢失，而且集群不可用，无法承接任何请求

**NOTE:** shard配置

```
PUT /test_index
{
   "settings" : {
      "number_of_shards" : 3,
      "number_of_replicas" : 1
   }
}
```

### 横向扩容过程，如何超出扩容极限，以及如何提升容错性

* primary&replica自动负载均衡，6个shard，3 primary，3 replica
* 每个node有更少的shard，IO/CPU/Memory资源给每个shard分配更多，每个shard性能更好
* 扩容的极限，6个shard（3 primary，3 replica），最多扩容到6台机器，每个shard可以占用单台服务器的所有资源，性能最好
* 超出扩容极限，动态修改replica数量，9个shard（3primary，6 replica），扩容到9台机器，比3台机器时，拥有3倍的读吞吐量
* 3台机器下，9个shard（3 primary，6 replica），资源更少，但是容错性更好，最多容纳2台机器宕机，6个shard只能容纳0台机器宕机

### 容错机制

* master node宕机，自动master选举，red
* replica容错：新master将replica提升为primary shard，yellow
* 重启宕机node，master copy replica到该node，使用原有的shard并同步宕机后的修改，green

# 分布式文档系统

## document核心元数据

### _index元数据

* 代表一个document存放在哪个index中
* 类似的数据放在一个索引，非类似的数据放不同索引：product index（包含了所有的商品），sales index（包含了所有的商品销售数据），inventory index（包含了所有库存相关的数据）。如果你把比如product，sales，human resource（employee），全都放在一个大的index里面，比如说company index，不合适的。
* index中包含了很多类似的document：类似是什么意思，其实指的就是说，这些document的fields很大一部分是相同的，你说你放了3个document，每个document的fields都完全不一样，这就不是类似了，就不太适合放到一个index里面去了。
* 索引名称必须是小写的，不能用下划线开头，不能包含逗号：product，website，blog

### _type元数据

* 代表document属于index中的哪个类别（type）
* 一个索引通常会划分为多个type，逻辑上对index中有些许不同的几类数据进行分类：因为一批相同的数据，可能有很多相同的fields，但是还是可能会有一些轻微的不同，可能会有少数fields是不一样的，举个例子，就比如说，商品，可能划分为电子商品，生鲜商品，日化商品，等等。
* type名称可以是大写或者小写，但是同时不能用下划线开头，不能包含逗号

### _id元数据

* 代表document的唯一标识，与index和type一起，可以唯一标识和定位一个document
* 我们可以手动指定document的id（put /index/type/id），也可以不指定，由es自动为我们创建一个id

### 手动指定document id

```
put /index/type/id
```

### 自动生成document id

```
post /index/type
```

**NOTE:** 自动生成的id，长度为20个字符，URL安全，base64编码，GUID，分布式系统并行生成时不可能会发生冲突

## document相关操作

### document的全量替换

* 语法与创建文档是一样的，如果document id不存在，那么就是创建；如果document id已经存在，那么就是全量替换操作，替换document的json串内容
* document是不可变的，如果要修改document的内容，第一种方式就是全量替换，直接对document重新建立索引，替换里面所有的内容
* es会将老的document标记为deleted，然后新增我们给定的一个document，当我们创建越来越多的document的时候，es会在适当的时机在后台自动删除标记为deleted的document

### document的强制创建

* 创建文档与全量替换的语法是一样的，有时我们只是想新建文档，不想替换文档
* PUT /index/type/id?op_type=create，PUT /index/type/id/_create

### document的删除

* DELETE /index/type/id
* 不会理解物理删除，只会将其标记为deleted，当数据越来越多的时候，在后台自动删除


## 并发控制

* 基于_version进行乐观锁并发控制

只有当当前版本一致时，才会执行更新操作，更新或修改的时候如果失败需要先获取版本号后在进行修改
```
PUT /test_index/test_type/7?version=1 
{
  "test_field": "test client 1"
}
```

* external version

**NOTE:** 当version_type=external的时候，只有当你提供的version比es中的_version大的时候，才能完成修改


```
PUT /test_index/test_type/8?version=2&version_type=external
{
  "test_field": "test client 1"
}
```

## partial update 部分更新

一般文档更新替换流程

* 应用程序先发起一个get请求，获取到document，展示到前台界面，供用户查看和修改
* 用户在前台界面修改数据，发送到后台
* 后台代码，会将用户修改的数据在内存中进行执行，然后封装好修改后的全量数据
* 然后发送PUT请求，到es中，进行全量替换
* es将老的document标记为deleted，然后重新创建一个新的document

```
post /index/type/id/_update 
{
   "doc": {
      "要修改的少数几个field即可，不需要全量的数据"
   }
}
```

### 内置脚本

```
POST /test_index/test_type/11/_update
{
   "script" : "ctx._source.num+=1"
}
```

## Mget操作

* mget批量查询

```
GET /_mget
{
   "docs" : [
      {
         "_index" : "test_index",
         "_type" :  "test_type",
         "_id" :    1
      },
      {
         "_index" : "test_index",
         "_type" :  "test_type",
         "_id" :    2
      }
   ]
}
```

## 批量插入

* 操作类型
  * delete：删除一个文档，只要1个json串就可以了
  * create：PUT /index/type/id/_create，强制创建
  * index：普通的put操作，可以是创建文档，也可以是全量替换文档
  * update：执行的partial update操作

```
POST /_bulk
{ "delete": { "_index": "test_index", "_type": "test_type", "_id": "3" }} 
{ "create": { "_index": "test_index", "_type": "test_type", "_id": "12" }}
{ "test_field":    "test12" }
{ "index":  { "_index": "test_index", "_type": "test_type", "_id": "2" }}
{ "test_field":    "replaced test2" }
{ "update": { "_index": "test_index", "_type": "test_type", "_id": "1", "_retry_on_conflict" : 3} }
{ "doc" : {"test_field2" : "bulk test1"} }
```

**NOTE:** bulk api对json的语法，有严格的要求，每个json串不能换行，只能放一行，同时一个json串和一个json串之间，必须有一个换行


**NOTE:** bulk request会加载到内存里，如果太大的话，性能反而会下降，因此需要反复尝试一个最佳的bulk size。一般从1000~5000条数据开始，尝试逐渐增加。另外，如果看大小的话，最好是在5~15MB之间。

## Document路由原理

* 路由算法

```
shard = hash(routing) % number_of_primary_shards
```

* 路由id 策略

* 默认的routing就是_id
也可以在发送请求的时候，手动指定一个routing value，比如说put /index/type/id?routing=user_id

**NOTE:** 手动指定routing value是很有用的，可以保证说，某一类document一定被路由到一个shard上去，那么在后续进行应用级别的负载均衡，以及提升批量读取的性能的时候，是很有帮助的

## Document 增删改内部原理

* 客户端选择一个node发送请求过去，这个node就是coordinating node（协调节点）
* coordinating node，对document进行路由，将请求转发给对应的node（有primary shard）
* 实际的node上的primary shard处理请求，然后将数据同步到replica node
* coordinating node，如果发现primary node和所有replica node都搞定之后，就返回响应结果给客户端

## 一致性原理

* consistency，one（primary shard），all（all shard），quorum（default）

  * one：要求我们这个写操作，只要有一个primary shard是active活跃可用的，就可以执行
  * all：要求我们这个写操作，必须所有的primary shard和replica shard都是活跃的，才可以执行这个写操作
  * quorum：默认的值，要求所有的shard中，必须是大部分的shard都是活跃的，可用的，才可以执行这个写操作

* quorum机制，写之前必须确保大多数shard都可用，int( (primary + number_of_replicas) / 2 ) + 1，当number_of_replicas>1时才生效

* 如果节点数少于quorum数量，可能导致quorum不齐全，进而导致无法执行任何写操作

* quorum不齐全时，wait，默认1分钟，timeout，100，30s  

```
put /index/type/id?timeout=30
```


## Document 内部查询原理

* 客户端发送请求到任意一个node，成为coordinate node
* coordinate node对document进行路由，将请求转发到对应的node，此时会使用round-robin随机轮询算法，在primary shard以及其所有replica中随机选择一个，让读请求负载均衡
* 接收请求的node返回document给coordinate node
* coordinate node返回document给客户端
* 特殊情况：document如果还在建立索引过程中，可能只有primary shard有，任何一个replica shard都没有，此时可能会导致无法读取到document，但是document完成索引建立之后，primary shard和replica shard就都有了

## 批量插入内部优化原理

* 采用规范的json格式，会导致耗费更多内存，更多jvm gc开销
* 最大的优势在于，不需要将json数组解析为一个JSONArray对象，形成一份大数据的拷贝，浪费内存空间，尽可能地保证性能