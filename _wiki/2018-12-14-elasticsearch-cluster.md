---
layout: wiki
title: "【分布式搜索】- Elastissearch集群篇"
categories: [NoSQL 搜索]
description: 搜索
keywords: elasticsearch
---

## 性能优化

* 扩大filesystem cache 至少为数据总量的一半
* 合理控制存入搜索引擎的数据量，不必要字段尽量不要存储到搜索引擎里，可以将这些字段存放到hbase或mysql里面
* 数据预热
* 冷热分离，类似数据库垂直拆分
* 不要执行过于复杂的查询操作，可以提前设计好模型
* 分页性能优化，不能随便翻页