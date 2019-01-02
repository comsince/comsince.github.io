---
layout: wiki
title: "【分布式搜索】- Elastissearch初识搜索"
categories: [NoSQL 搜索]
description: 搜索
keywords: elasticsearch
---

# 分布式搜索引擎

## multi-index和multi-type搜索模式

* **/_search**：所有索引，所有type下的所有数据都搜索出来
* **/index1/_search**：指定一个index，搜索其下所有type的数据
* **/index1,index2/_search**：同时搜索两个index下的数据
* **/*1,*2/_search**：按照通配符去匹配多个索引
* **/index1/type1/_search**：搜索一个index下指定的type的数据
* **/index1/type1,type2/_search**：可以搜索一个index下多个type的数据
* **/index1,index2/type1,type2/_search**：搜索多个index下的多个type的数据
* **/_all/type1,type2/_search**：_all，可以代表搜索所有index下的指定type的数据


## 分页搜索

```
GET /_search?size=10
GET /_search?size=10&from=0
GET /_search?size=10&from=20
```

* 深度分页问题

## Query String 基础搜索

```
GET /test_index/test_type/_search?q=test_field:test
GET /test_index/test_type/_search?q=+test_field:test
GET /test_index/test_type/_search?q=-test_field:test
```

* _all metadata

es中的_all元数据，在建立索引的时候，我们插入一条document，它里面包含了多个field，此时，es会自动将多个field的值，全部用字符串的方式串联起来，变成一个长的字符串，作为_all field的值，同时建立索引

后面如果在搜索的时候，没有对某个field指定搜索，就默认搜索_all field，其中是包含了所有field的值的

## 搜索原理
### 精确匹配与全文搜索

### 倒排索引
### 分词器
* 常见分词器 
  * standard analyzer：set, the, shape, to, semi, transparent, by, calling, set_trans, 5（默认的是standard）
  * simple analyzer：set, the, shape, to, semi, transparent, by, calling, set, trans
  * whitespace analyzer：Set, the, shape, to, semi-transparent, by, calling, set_trans(5)
  * language analyzer（特定的语言的分词器，比如说，english，英语分词器）：set, shape, semi, transpar, call, set_tran, 5

* 测试分词器

```
GET /_analyze
{
  "analyzer": "standard",
  "text": "Text to analyze"
}
```

* 默认分词器

* standard

  * standard tokenizer：以单词边界进行切分
  * standard token filter：什么都不做
  * lowercase token filter：将所有字母转换为小写
  * stop token filer（默认被禁用）：移除停用词，比如a the it等等

* 定制分词器

```
启用english停用词token filter

PUT /my_index
{
  "settings": {
    "analysis": {
      "analyzer": {
        "es_std": {
          "type": "standard",
          "stopwords": "_english_"
        }
      }
    }
  }
}
```

```
PUT /my_index
{
  "settings": {
    "analysis": {
      "char_filter": {
        "&_to_and": {
          "type": "mapping",
          "mappings": ["&=> and"]
        }
      },
      "filter": {
        "my_stopwords": {
          "type": "stop",
          "stopwords": ["the", "a"]
        }
      },
      "analyzer": {
        "my_analyzer": {
          "type": "custom",
          "char_filter": ["html_strip", "&_to_and"],
          "tokenizer": "standard",
          "filter": ["lowercase", "my_stopwords"]
        }
      }
    }
  }
}
```

### Mapping

* 往es里面直接插入数据，es会自动建立索引，同时建立type以及对应的mapping
* mapping中就自动定义了每个field的数据类型
* 不同的数据类型（比如说text和date），可能有的是exact value，有的是full text
* __exact value__，在建立倒排索引的时候，分词的时候，是将整个值一起作为一个关键词建立到倒排索引中的；__full text__，会经历各种各样的处理，分词，normaliztion（时态转换，同义词转换，大小写转换），才会建立到倒排索引中
* __exact value__和full text类型的field就决定了，在一个搜索过来的时候，对exact value field或者是full text field进行搜索的行为也是不一样的，会跟建立倒排索引的行为保持一致；比如说exact value搜索的时候，就是直接按照整个值进行匹配，full text query string，也会进行分词和normalization再去倒排索引中去搜索
* 可以用es的dynamic mapping，让其自动建立mapping，包括自动设置数据类型；也可以提前手动创建index和type的mapping，自己对各个field进行设置，包括数据类型，包括索引行为，包括分词器，等等

#### Dynamic mapping 核心映射数据类型

* __string__
* byte，short，integer，long
* float，double
* boolean
* date

#### 查看Mapping

```
GET /index/_mapping/type
```

### 定制Mapping

* true：遇到陌生字段，就进行dynamic mapping
* false：遇到陌生字段，就忽略
* strict：遇到陌生字段，就报错

```
PUT /my_index
{
  "mappings": {
    "my_type": {
      "dynamic": "strict",
      "properties": {
        "title": {
          "type": "text"
        },
        "address": {
          "type": "object",
          "dynamic": "true"
        }
      }
    }
  }
}
```

* 定制自己的dynamic mapping template（type level）

```
PUT /my_index
{
    "mappings": {
        "my_type": {
            "dynamic_templates": [
                { "en": {
                      "match":              "*_en", 
                      "match_mapping_type": "string",
                      "mapping": {
                          "type":           "string",
                          "analyzer":       "english"
                      }
                }}
            ]
}}}
```

```
PUT /my_index/my_type/1
{
  "title": "this is my first article"
}

PUT /my_index/my_type/2
{
  "title_en": "this is my first article"
}
```

**NOTE:** title没有匹配到任何的dynamic模板，默认就是standard分词器，不会过滤停用词，is会进入倒排索引，用is来搜索是可以搜索到的
title_en匹配到了dynamic模板，就是english分词器，会过滤停用词，is这种停用词就会被过滤掉，用is来搜索就搜索不到了

* 定制自己的default mapping template（index level）

```
PUT /my_index
{
    "mappings": {
        "_default_": {
            "_all": { "enabled":  false }
        },
        "blog": {
            "_all": { "enabled":  true  }
        }
    }
}

```

**NOTE:** 默认的出了blog类型之外，其他的type _all字段都禁用

## 搜索语法

### filter与query

* filter，仅仅只是按照搜索条件过滤出需要的数据而已，不计算任何相关度分数，对相关度没有任何影响
* query，会去计算每个document相对于搜索条件的相关度，并按照相关度进行排序
* filter，不需要计算相关度分数，不需要按照相关度分数进行排序，同时还有内置的自动cache最常使用filter的数据
* query，相反，要计算相关度分数，按照分数进行排序，而且无法cache结果

### match all

```
GET /_search
{
    "query": {
        "match_all": {}
    }
}
```

### match

```
GET /_search
{
    "query": { "match": { "title": "my elasticsearch article" }}
}
```

### multi match

```
GET /test_index/test_type/_search
{
  "query": {
    "multi_match": {
      "query": "test",
      "fields": ["test_field", "test_field1"]
    }
  }
}
```

### range query

```
GET /company/employee/_search 
{
  "query": {
    "range": {
      "age": {
        "gte": 30
      }
    }
  }
}
```

### term query

```
GET /test_index/test_type/_search 
{
  "query": {
    "term": {
      "test_field": "test hello"
    }
  }
}
```

### terms query

```
GET /_search
{
    "query": { "terms": { "tag": [ "search", "full_text", "nosql" ] }}
}
```

### 合法性检查

```
GET /test_index/test_type/_validate/query?explain
{
  "query": {
    "match": {
      "test_field": "test"
    }
  }
}
```

### 定制排序规则

默认情况下是按照评分排序的

也可以使用constant_score

```

GET /_search
{
    "query" : {
        "constant_score" : {
            "filter" : {
                "term" : {
                    "author_id" : 1
                }
            }
        }
    }
}
```

## 零停机重建索引

一个field的设置是不能被修改的，如果要修改一个Field，那么应该重新按照新的mapping，建立一个index，然后将数据批量查询出来，重新用bulk api写入index中

批量查询的时候，建议采用scroll api，并且采用多线程并发的方式来reindex数据，每次scoll就查询指定日期的一段数据，交给一个线程即可

* 索引别名

```
创建别名
PUT /my_index/_alias/goods_index
```

```
POST /_aliases
{
    "actions": [
        { "remove": { "index": "my_index", "alias": "goods_index" }},
        { "add":    { "index": "my_index_new", "alias": "goods_index" }}
    ]
}
```

