---
layout: wiki
title: "【分布式搜索】- Elastissearch聚合数据分析"
categories: [NoSQL 搜索]
description: 搜索
keywords: elasticsearch
---

本文主要说明ElasticSearch在数据聚合分析中的应用


## 统计分组

* 聚合分组语句

```json
GET /tvs/sales/_search
{
  "size": 0, 
  "aggs": {
    "popular_colors": {
      "terms": {
        "field": "color"
      }
    }
  }
}
```

* 查询结果

```json
{
  "took" : 3,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 8,
    "max_score" : 0.0,
    "hits" : [ ]
  },
  "aggregations" : {
    "popular_colors" : {
      "doc_count_error_upper_bound" : 0,
      "sum_other_doc_count" : 0,
      "buckets" : [
        {
          "key" : "红色",
          "doc_count" : 4
        },
        {
          "key" : "绿色",
          "doc_count" : 2
        },
        {
          "key" : "蓝色",
          "doc_count" : 2
        }
      ]
    }
  }
}

```

hits.hits：我们指定了size是0，所以hits.hits就是空的，否则会把执行聚合的那些原始数据给你返回回来
aggregations：聚合结果
popular_color：我们指定的某个聚合的名称
buckets：根据我们指定的field划分出的buckets
key：每个bucket对应的那个值
doc_count：这个bucket分组内，有多少个数据
数量，其实就是这种颜色的销量

**NOTE：**改聚合类似于MySQL的Group By规则

## Metric函数

* 求平均值

```json
GET /tvs/sales/_search
{
  "size": 0,
  "aggs": {
    "colors": {
      "terms": {
        "field": "color"
      },
      "aggs": {
        "avg_price": {
          "avg": {
            "field": "price"
          }
        }
      }
    }
  }
}
```

* 类似SQL

```sql
select avg(price) from tvs.sales group by color
```

## 多层嵌套分组

```json
GET /tvs/sales/_search
{
  "size": 0,
  "aggs": {
    "group_by_color": {
      "terms": {
        "field": "color"
      },
      "aggs": {
        "color_avg_price": {
          "avg": {
            "field": "price"
          }
        },
        "group_by_brand":{
          "terms": {
            "field": "brand"
          },
          "aggs": {
            "brand_avg_price": {
              "avg": {
                "field": "price"
              }
            }
          }
        }
      }
    }
  }
}
```

**NOTE:** 根据颜色分好组之后，再进行下钻分析，在根据品牌分组。


## Metric 函数

* max：求一个bucket内，指定field值最大的那个数据
* min：求一个bucket内，指定field值最小的那个数据
* sum：求一个bucket内，指定field值的总和

```json
GET /tvs/sales/_search
{
   "size" : 0,
   "aggs": {
      "colors": {
         "terms": {
            "field": "color"
         },
         "aggs": {
            "avg_price": { "avg": { "field": "price" } },
            "min_price" : { "min": { "field": "price"} }, 
            "max_price" : { "max": { "field": "price"} },
            "sum_price" : { "sum": { "field": "price" } } 
         }
      }
   }
}
```

## histogram

histogram：类似于terms，也是进行bucket分组操作，接收一个field，按照这个field的值的各个范围区间，进行bucket分组操作

```json
GET /tvs/sales/_search
{
  "size": 0,
  "aggs": {
    "group_by_price": {
      "histogram": {
        "field": "price",
        "interval": 2000
      },
      "aggs": {
        "total_price": {
          "sum": {
            "field": "price"
          }
        }
      }
    }
  }
}
```


## date histogram

date histogram，按照我们指定的某个date类型的日期field，以及日期interval，按照一定的日期间隔，去划分bucket

* `min_doc_count`：即使某个日期interval，2017-01-01~2017-01-31中，一条数据都没有，那么这个区间也是要返回的，不然默认是会过滤掉这个区间的
* `extended_bounds，min，max`：划分bucket的时候，会限定在这个起始日期，和截止日期内

```json
GET /tvs/sales/_search
{
  "size": 0,
  "aggs": {
    "group_sale_date": {
      "date_histogram": {
        "field": "sold_date",
        "interval": "month",
        "format": "yyyy-MM-dd",
        "min_doc_count": 0,
        "extended_bounds": {
          "min": "2016-01-01",
          "max": "2017-12-31"
        }
      }
    }
  }
}
```

* 根据date分组后，再进行下钻分析,注意aggs层级

```json
GET /tvs/sales/_search
{
  "size": 0,
  "aggs": {
    "group_sold_date": {
      "date_histogram": {
        "field": "sold_date",
        "interval": "quarter",
        "format": "yyyy-MM-dd",
        "min_doc_count": 0,
        "extended_bounds": {
          "min": "2016-01-01",
          "max": "2017-12-31"
        }
      },
      "aggs": {
        "group_by_brand": {
          "terms": {
            "field": "brand"
          },
          "aggs": {
            "sum_price": {
              "sum": {
                "field": "price"
              } 
            }
          }
        },
        "total_sum_price":{
          "sum": {
            "field": "price"
          }
        },
        "avg_quarter_price":{
          "avg": {
            "field": "price"
          }
        }
      }
    }
  }
}
```

## 搜索+聚合

```json
GET /tvs/sales/_search 
{
  "size": 0,
  "query": {
    "term": {
      "brand": {
        "value": "小米"
      }
    }
  },
  "aggs": {
    "group_by_color": {
      "terms": {
        "field": "color"
      }
    }
  }
}
```

## 聚合数据范围

```json
GET /tvs/sales/_search 
{
  "size": 0, 
  "query": {
    "term": {
      "brand": {
        "value": "长虹"
      }
    }
  },
  "aggs": {
    "single_brand_avg_price": {
      "avg": {
        "field": "price"
      }
    },
    "all": {
      "global": {},
      "aggs": {
        "all_brand_avg_price": {
          "avg": {
            "field": "price"
          }
        }
      }
    }
  }
}
```

* `ingle_brand_avg_price`：就是针对query搜索结果，执行的，拿到的，就是长虹品牌的平均价格
* `all.all_brand_avg_price`：拿到所有品牌的平均价格


## 过滤+聚合

* 过滤后聚合分组

```json
GET /tvs/sales/_search
{
  "size": 0,
  "query": {
    "constant_score": {
      "filter": {
        "range": {
          "price": {
            "gte": 1200
          }
        }
      }
    }
  },
  "aggs": {
    "avg_price":{
      "avg": {
        "field": "price"
      }
    }    
  }
}
```


* bucket filter：对不同的bucket下的aggs，进行filter

```json
GET /tvs/sales/_search 
{
  "size": 0,
  "query": {
    "term": {
      "brand": {
        "value": "长虹"
      }
    }
  },
  "aggs": {
    "recent_850d": {
      "filter": {
        "range": {
          "sold_date": {
            "gte": "now-850d"
          }
        }
      },
      "aggs": {
        "recent_150d_avg_price": {
          "avg": {
            "field": "price"
          }
        }
      }
    }
  }

```

## 聚合排序

* 按照颜色分组，计算改分组的平均价格后，升序排序

```json
GET /tvs/sales/_search 
{
  "size": 0,
  "aggs": {
    "group_by_color": {
      "terms": {
        "field": "color",
        "order": {
          "avg_price": "asc"
        }
      },
      "aggs": {
        "avg_price": {
          "avg": {
            "field": "price"
          }
        }
      }
    }
  }
}
```

* 按照颜色分组后下钻在安装品牌进行分组，之后计算改分组的平均价格，降序排序

```json
GET /tvs/sales/_search 
{
  "size": 0,
  "aggs": {
    "group_by_color": {
      "terms": {
        "field": "color"
      },
      "aggs": {
        "group_by_brand": {
          "terms": {
            "field": "brand",
            "order": {
              "avg_price": "desc"
            }
          },
          "aggs": {
            "avg_price": {
              "avg": {
                "field": "price"
              }
            }
          }
        }
      }
    }
  }
}
```

