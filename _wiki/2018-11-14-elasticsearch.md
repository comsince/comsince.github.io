---
layout: wiki
title: "Elastissearch核心知识摘要"
categories: [NoSQL 搜索]
description: 搜索
keywords: elasticsearch
---


## 概要

介绍elasticsearch 基础到高阶的技术要点

## ElasticSearch 核心知识

### 分布式文档系统

#### elasticsearch的核心概念

* （1）Near Realtime（NRT）：近实时，两个意思，从写入数据到数据可以被搜索到有一个小延迟（大概1秒）；基于es执行搜索和分析可以达到秒级

* （2）Cluster：集群，包含多个节点，每个节点属于哪个集群是通过一个配置（集群名称，默认是elasticsearch）来决定的，对于中小型应用来说，刚开始一个集群就一个节点很正常
* （3）Node：节点，集群中的一个节点，节点也有一个名称（默认是随机分配的），节点名称很重要（在执行运维管理操作的时候），默认节点会去加入一个名称为“elasticsearch”的集群，如果直接启动一堆节点，那么它们会自动组成一个elasticsearch集群，当然一个节点也可以组成一个elasticsearch集群

* （4）Document&field：文档，es中的最小数据单元，一个document可以是一条客户数据，一条商品分类数据，一条订单数据，通常用JSON数据结构表示，每个index下的type中，都可以去存储多个document。一个document里面有多个field，每个field就是一个数据字段。

product document

```
{
  "product_id": "1",
  "product_name": "高露洁牙膏",
  "product_desc": "高效美白",
  "category_id": "2",
  "category_name": "日化用品"
}
```

* （5）Index：索引，包含一堆有相似结构的文档数据，比如可以有一个客户索引，商品分类索引，订单索引，索引有一个名称。一个index包含很多document，一个index就代表了一类类似的或者相同的document。比如说建立一个product index，商品索引，里面可能就存放了所有的商品数据，所有的商品document。
* （6）Type：类型，每个索引里都可以有一个或多个type，type是index中的一个逻辑数据分类，一个type下的document，都有相同的field，比如博客系统，有一个索引，可以定义用户数据type，博客数据type，评论数据type。

商品index，里面存放了所有的商品数据，商品document

但是商品分很多种类，每个种类的document的field可能不太一样，比如说电器商品，可能还包含一些诸如售后时间范围这样的特殊field；生鲜商品，还包含一些诸如生鲜保质期之类的特殊field

type，日化商品type，电器商品type，生鲜商品type

* 日化商品type：`product_id，product_name，product_desc，category_id，category_name`
* 电器商品type：`product_id，product_name，product_desc，category_id，category_name，service_period`
* 生鲜商品type：`product_id，product_name，product_desc，category_id，category_name，eat_period`

每一个type里面，都会包含一堆document

```
{
  "product_id": "2",
  "product_name": "长虹电视机",
  "product_desc": "4k高清",
  "category_id": "3",
  "category_name": "电器",
  "service_period": "1年"
}


{
  "product_id": "3",
  "product_name": "基围虾",
  "product_desc": "纯天然，冰岛产",
  "category_id": "4",
  "category_name": "生鲜",
  "eat_period": "7天"
}
```

* （7）shard：单台机器无法存储大量数据，es可以将一个索引中的数据切分为多个shard，分布在多台服务器上存储。有了shard就可以横向扩展，存储更多数据，让搜索和分析等操作分布到多台服务器上去执行，提升吞吐量和性能。每个shard都是一个lucene index。
* （8）replica：任何一个服务器随时可能故障或宕机，此时shard可能就会丢失，因此可以为每个shard创建多个replica副本。replica可以在shard故障时提供备用服务，保证数据不丢失，多个replica还可以提升搜索操作的吞吐量和性能。primary shard（建立索引时一次设置，不能修改，默认5个），replica shard（随时修改数量，默认1个），默认每个索引10个shard，5个primary shard，5个replica shard，最小的高可用配置，是2台服务器。


#### elasticsearch核心概念 vs. 数据库核心概念

```
Elasticsearch			数据库

Document			行
Type				表
Index				库
```


## 搜索引擎

* 倒排索引
* Daynamic Mapping
* Query DSL

```
{
    QUERY_NAME: {
        ARGUMENT: VALUE,
        ARGUMENT: VALUE,...
    }
}

{
    QUERY_NAME: {
        FIELD_NAME: {
            ARGUMENT: VALUE,
            ARGUMENT: VALUE,...
        }
    }
}
```


### 结构化搜索
结构化搜索类似于传统的mysql查询，这里对比下与elastissearch的主要用法

#### Mapping查询
Mapping 结构定义类似于Solr的schema，关系型数据库的创建语句
```
GET /forum/_mapping/article
```

* 建立索引时制定Mapping
```
PUT /forum
{
  "mappings": {
    "article":{
      "properties":{
        "articleID":{
          "type":"keyword"
        }
      }
    }
  }
}
```

现在es 5.2版本，type=text，默认会设置两个field，一个是field本身，比如articleID，就是分词的；还有一个的话，就是field.keyword，articleID.keyword，默认不分词，会最多保留256个字符

#### 批量插入

```

POST /forum/article/_bulk
{ "index": { "_id": 1 }}
{ "articleID" : "XHDK-A-1293-#fJ3", "userID" : 1, "hidden": false, "postDate": "2017-01-01" }
{ "index": { "_id": 2 }}
{ "articleID" : "KDKE-B-9947-#kL5", "userID" : 1, "hidden": false, "postDate": "2017-01-02" }
{ "index": { "_id": 3 }}
{ "articleID" : "JODL-X-1937-#pV7", "userID" : 2, "hidden": false, "postDate": "2017-01-01" }
{ "index": { "_id": 4 }}
{ "articleID" : "QQPX-R-3956-#aD8", "userID" : 2, "hidden": true, "postDate": "2017-01-02" }
```

**NOTE:** 批量插入json字段不要格式化，因为批量插入是根据换行来进行切割数据的


#### Term Filter搜索

```
GET /forum/article/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "term": {
          "userID": "1"
        }
      }
    }
  }
}
```

#### 查看分词

```
GET /forum/_analyze
{
  "field": "articleID",
  "text": "KDKE-B-9947-#kL5"
}
```

默认是analyzed的text类型的field，建立倒排索引的时候，就会对所有的articleID分词，分词以后，原本的articleID就没有了，只有分词后的各个word存在于倒排索引中。


* term filter：根据exact value进行搜索，数字、boolean、date天然支持
* text需要建索引时指定为not_analyzed，才能用term query
* 与传统关系型数据库比较：相当于SQL中的单个where条件

#### Fileter 执行原理

* 在倒排索引中查找搜索串，获取document list
* 为每个在倒排索引中搜索到的结果，构建一个bitset，[0, 0, 0, 1, 0, 1]
* 遍历每个过滤条件对应的bitset，优先从最稀疏的开始搜索，查找满足所有条件的document
* caching bitset，跟踪query，在最近256个query中超过一定次数的过滤条件，缓存其bitset。对于小segment（<1000，或<3%），不缓存bitset
* filter大部分情况下来说，在query之前执行，先尽量过滤掉尽可能多的数据
* 如果document有新增或修改，那么cached bitset会被自动更新
* 以后只要是有相同的filter条件的，会直接来使用这个过滤条件对应的cached bitset

#### Bool Filter 查询

```
GET /forum/article/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "bool": {
          "should": [
            {"term": { "postDate": "2017-01-01" }},
            {"term": {"articleID": "XHDK-A-1293-#fJ3"}}
          ],
          "must_not": {
            "term": {
              "postDate": "2017-01-02"
            }
          }
        }
      }
    }
  }
}
```

* 相关Sql

```
select *
from forum.article
where (post_date='2017-01-01' or article_id='XHDK-A-1293-#fJ3')
and post_date!='2017-01-02'
```

**NOTE:** 总结

* bool：must，must_not，should，组合多个过滤条件
* bool可以嵌套
* 相当于SQL中的多个and条件：当你把搜索语法学好了以后，基本可以实现部分常用的sql语法对应的功能

#### Term 多值搜索

相当于SQL中的in语句

```
GET /forum/article/_search 
{
  "query": {
    "constant_score": {
      "filter": {
        "terms": {
          "articleID": [
            "KDKE-B-9947-#kL5",
            "QQPX-R-3956-#aD8"
          ]
        }
      }
    }
  }
}
```

**NOTE:** 

* terms多值搜索
* 优化terms多值搜索的结果
* 相当于SQL中的in语句

#### Range Filter

* 查询示例

```
GET /forum/article/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "range": {
          "view_cnt": {
            "gt": 30,
            "lt": 60
          }
        }
      }
    }
  }
}

```

**NOTE:** 总结

* range，sql中的between，或者是>=1，<=1
* range做范围过滤




### 全文搜索

#### Match Query精准控制

提高全文检索精准度实践

* 利用and组合搜索

```
GET /forum/article/_search
{
  "query": {
    "match": {
      "title": {
        "query": "java elasticsearch",
        "operator":"and"
      }
    }
  }
}
```

* minimum_should_match 限定匹配条件个数

```
GET /forum/article/_search
{
  "query": {
    "match": {
      "title": {
        "query": "java elasticsearch spark hadoop",
        "minimum_should_match": "75%"
      }
    }
  }
}
```

* bool 组合多个搜索条件

```
GET /forum/article/_search
{
  "query": {
    "bool": {
      "must":     { "match": { "title": "java" }},
      "must_not": { "match": { "title": "spark"  }},
      "should": [
                  { "match": { "title": "hadoop" }},
                  { "match": { "title": "elasticsearch"   }}
      ]
    }
  }
}
```

**NOTE：** 总结
默认情况下，should是可以不匹配任何一个的，比如上面的搜索中，this is java blog，就不匹配任何一个should条件
但是有个例外的情况，如果没有must的话，那么should中必须至少匹配一个才可以

```
GET /forum/article/_search
{
  "query": {
    "bool": {
      "should": [
        { "match": { "title": "java" }},
        { "match": { "title": "elasticsearch"   }},
        { "match": { "title": "hadoop"   }},
  { "match": { "title": "spark"   }}
      ],
      "minimum_should_match": 3 
    }
  }
}
```
上面可以精确控制匹配上面至少三个条件


**NOTE:**　这个，就跟之前的那个term query，不一样了。不是搜索exact value，是进行full text全文检索。
match query，是负责进行全文检索的。当然，如果要检索的field，是not_analyzed类型的，那么match query也相当于term query

* 全文检索的时候，进行多个值的检索，有两种做法，match query；should
* 控制搜索结果精准度：and operator，minimum_should_match

#### match query 转化为 bool + term

##### 普通match如何转换为term+should

```
{
    "match": { "title": "java elasticsearch"}
}
```
使用诸如上面的match query进行多值搜索的时候，es会在底层自动将这个match query转换为bool的语法
bool should，指定多个搜索词，同时使用term query

```
{
  "bool": {
    "should": [
      { "term": { "title": "java" }},
      { "term": { "title": "elasticsearch"   }}
    ]
  }
}
```

##### and match转换为term+must 

```
{
    "match": {
        "title": {
            "query":    "java elasticsearch",
            "operator": "and"
        }
    }
}
```
转换为

```
{
  "bool": {
    "must": [
      { "term": { "title": "java" }},
      { "term": { "title": "elasticsearch"   }}
    ]
  }
}
```

##### minimum_should_match转换

```
{
    "match": {
        "title": {
            "query":                "java elasticsearch hadoop spark",
            "minimum_should_match": "75%"
        }
    }
}
```

转化为

```
{
  "bool": {
    "should": [
      { "term": { "title": "java" }},
      { "term": { "title": "elasticsearch"   }},
      { "term": { "title": "hadoop" }},
      { "term": { "title": "spark" }}
    ],
    "minimum_should_match": 3 
  }
}
```

#### boost细粒度权重控制

搜索条件的权重，boost，可以将某个搜索条件的权重加大，此时当匹配这个搜索条件和匹配另一个搜索条件的document，计算relevance score时，匹配权重更大的搜索条件的document，relevance score会更高，当然也就会优先被返回回来

默认情况下，搜索条件的权重都是一样的，都是1

#### 多shard场景下relevance score不准确问题

* 生产环境下，数据量大，尽可能实现均匀分配

数据量很大的话，其实一般情况下，在概率学的背景下，es都是在多个shard中均匀路由数据的，路由的时候根据_id，负载均衡
比如说有10个document，title都包含java，一共有5个shard，那么在概率学的背景下，如果负载均衡的话，其实每个shard都应该有2个doc，title包含java
如果说数据分布均匀的话，其实就没有刚才说的那个问题了

* 测试环境下，将索引的primary shard设置为1个，number_of_shards=1，index settings

如果说只有一个shard，那么当然，所有的document都在这个shard里面，就没有这个问题了

* 测试环境下，搜索附带search_type=dfs_query_then_fetch参数，会将local IDF取出来计算global IDF

计算一个doc的相关度分数的时候，就会将所有shard对的local IDF计算一下，获取出来，在本地进行global IDF分数的计算，会将所有shard的doc作为上下文来进行计算，也能确保准确性。但是production生产环境下，不推荐这个参数，因为性能很差。

#### Best Filed 策略Dismax

best fields策略，就是说，搜索到的结果，应该是某一个field中匹配到了尽可能多的关键词，被排在前面；而不是尽可能多的field匹配到了少数的关键词，排在了前面
dis_max语法，直接取多个query中，分数最高的那一个query的分数即可

```
GET /forum/article/_search
{
    "query": {
        "dis_max": {
            "queries": [
                { "match": { "title": "java solution" }},
                { "match": { "content":  "java solution" }}
            ]
        }
    }
}
```


#### tie_breaker

ie_breaker参数的意义，在于说，将其他query的分数，乘以tie_breaker，然后综合与最高分数的那个query的分数，综合在一起进行计算
除了取最高分以外，还会考虑其他的query的分数
tie_breaker的值，在0~1之间，是个小数，就ok

```
GET /forum/article/_search
{
    "query": {
        "dis_max": {
            "queries": [
                { "match": { "title": "java beginner" }},
                { "match": { "body":  "java beginner" }}
            ],
            "tie_breaker": 0.3
        }
    }
}
```

#### Muti Match

```
GET /forum/article/_search
{
  "query": {
    "multi_match": {
        "query":                "java solution",
        "type":                 "best_fields", 
        "fields":               [ "title^2", "content" ],
        "tie_breaker":          0.3,
        "minimum_should_match": "50%" 
    }
  } 
}
```
等同于
```
GET /forum/article/_search
{
  "query": {
    "dis_max": {
      "queries":  [
        {
          "match": {
            "title": {
              "query": "java beginner",
              "minimum_should_match": "50%",
        "boost": 2
            }
          }
        },
        {
          "match": {
            "body": {
              "query": "java beginner",
              "minimum_should_match": "30%"
            }
          }
        }
      ],
      "tie_breaker": 0.3
    }
  } 
}
```

minimum_should_match，主要是用来干嘛的？
* 去长尾，long tail
* 长尾，比如你搜索5个关键词，但是很多结果是只匹配1个关键词的，其实跟你想要的结果相差甚远，这些结果就是长尾
* minimum_should_match，控制搜索结果的精准度，只有匹配一定数量的关键词的数据，才能返回


#### Mutimatch + MostFiled

* 增加mapping

```
POST /forum/_mapping/article
{
  "properties": {
      "sub_title_0": { 
          "type":     "text",
          "analyzer": "english",
          "fields": {
              "std":   { 
                  "type":     "text",
                  "analyzer": "standard"
              }
          }
      }
  }
}
```

如下查询可能不准
```
GET /forum/article/_search
{
  "query": {
    "match": {
      "sub_title_0": "learning courses"
    }
  }
}
```

* Mutimatch + most filed查询
```
GET /forum/article/_search
{
   "query": {
        "multi_match": {
            "query":  "learning courses",
            "type":   "most_fields", 
            "fields": [ "sub_title_0", "sub_title_0.std" ]
        }
    }
}
```


* best_fields，是对多个field进行搜索，挑选某个field匹配度最高的那个分数，同时在多个query最高分相同的情况下，在一定程度上考虑其他query的分数。简单来说，你对多个field进行搜索，就想搜索到某一个field尽可能包含更多关键字的数据

* 优点：通过best_fields策略，以及综合考虑其他field，还有minimum_should_match支持，可以尽可能精准地将匹配的结果推送到最前面
* 缺点：除了那些精准匹配的结果，其他差不多大的结果，排序结果不是太均匀，没有什么区分度了

实际的例子：百度之类的搜索引擎，最匹配的到最前面，但是其他的就没什么区分度了

* most_fields，综合多个field一起进行搜索，尽可能多地让所有field的query参与到总分数的计算中来，此时就会是个大杂烩，出现类似best_fields案例最开始的那个结果，结果不一定精准，某一个document的一个field包含更多的关键字，但是因为其他document有更多field匹配到了，所以排在了前面；所以需要建立类似sub_title.std这样的field，尽可能让某一个field精准匹配query string，贡献更高的分数，将更精准匹配的数据排到前面

* 优点：将尽可能匹配更多field的结果推送到最前面，整个排序结果是比较均匀的
* 缺点：可能那些精准匹配的结果，无法推送到最前面


#### cross-fields搜索

```
GET /forum/article/_search
{
  "query": {
    "multi_match": {
      "query":       "Peter Smith",
      "type":        "most_fields",
      "fields":      [ "author_first_name", "author_last_name" ]
    }
  }
}
```
```
{
  "took" : 0,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 3,
    "max_score" : 0.6931472,
    "hits" : [
      {
        "_index" : "forum",
        "_type" : "article",
        "_id" : "2",
        "_score" : 0.6931472,
        "_source" : {
          "articleID" : "KDKE-B-9947-#kL5",
          "userID" : 1,
          "hidden" : false,
          "postDate" : "2017-01-02",
          "tag" : [
            "java"
          ],
          "tag_cnt" : 1,
          "view_cnt" : 50,
          "title" : "this is java blog",
          "content" : "i think java is the best programming language",
          "sub_title" : "learned a lot of course",
          "sub_title_0" : "learned a lot of course",
          "author_first_name" : "Smith",
          "author_last_name" : "Williams"
        }
      },
      {
        "_index" : "forum",
        "_type" : "article",
        "_id" : "5",
        "_score" : 0.5753642,
        "_source" : {
          "articleID" : "DHJK-B-1395-#Ky5",
          "userID" : 3,
          "hidden" : false,
          "postDate" : "2017-03-01",
          "tag" : [
            "elasticsearch"
          ],
          "tag_cnt" : 1,
          "view_cnt" : 10,
          "title" : "this is spark blog",
          "content" : "spark is best big data solution based on scala ,an programming language similar to java",
          "sub_title" : "haha, hello world",
          "author_first_name" : "Tonny",
          "author_last_name" : "Peter Smith"
        }
      },
      {
        "_index" : "forum",
        "_type" : "article",
        "_id" : "1",
        "_score" : 0.5753642,
        "_source" : {
          "articleID" : "XHDK-A-1293-#fJ3",
          "userID" : 1,
          "hidden" : false,
          "postDate" : "2017-01-01",
          "tag" : [
            "java",
            "hadoop"
          ],
          "tag_cnt" : 2,
          "view_cnt" : 30,
          "title" : "this is java and elasticsearch blog",
          "content" : "i like to write best elasticsearch article",
          "sub_title" : "learning more courses",
          "sub_title_0" : "learning more courses",
          "author_first_name" : "Peter",
          "author_last_name" : "Smith"
        }
      }
    ]
  }
}

```


* 问题1：只是找到尽可能多的field匹配的doc，而不是某个field完全匹配的doc
* 问题2：most_fields，没办法用minimum_should_match去掉长尾数据，就是匹配的特别少的结果
* 问题3：TF/IDF算法，比如Peter Smith和Smith Williams，搜索Peter Smith的时候，由于first_name中很少有Smith的，所以query在所有document中的频率很低，得到的分数很高，可能Smith Williams反而会排在Peter Smith前面

#### copy_to策略

```
PUT /forum/_mapping/article
{
  "properties": {
      "new_author_first_name0": {
          "type":     "text",
          "copy_to":  "new_author_full_name0" 
      },
      "new_author_last_name0": {
          "type":     "text",
          "copy_to":  "new_author_full_name0" 
      },
      "new_author_full_name0": {
          "type":     "text"
      }
  }
}
```

* 查询

```
GET /forum/article/_search
{
  "query": {
    "match": {
      "new_author_full_name":       "Peter Smith"
    }
  }
}
```

**NOTE:** 次文档内容均来自Elastic顶尖高手系列课程笔记，如有侵权，请联系删除！