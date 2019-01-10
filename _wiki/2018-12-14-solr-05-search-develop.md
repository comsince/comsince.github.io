---
layout: wiki
title: "【分布式搜索】- Solr - 结构化搜索进阶高级搜索"
categories: [NoSQL 搜索]
description: 搜索
keywords: solr
---
<font color="#dd0000"></font> 
## 概述

搜索由普通的结构化搜索到高级搜索是搜索框架必须要面临的问题，本文试图从基本的结构化搜索逐渐深入说明如何使用solr的高级搜索特性，并全面梳理一下定义一个搜索规则的整体思维方式

## 标准结构化查询

结构化查询一般出现在关系型数据库中，这些基本的查询都可以使用solr基本的查询参数来完成，在Solr Admin页面你可以看到如下基本的查询参数

* defType 参数
* sort 参数
* start 参数
* rows 参数
* fq（Filter Query）参数
* fl（Field List）参数
* wt 参数
* debug 参数

> 可以根据以上参数实现过滤下载量在1000~1500之前的数据，并且只显示前10条，以`json`返回信息

* 查询条件

```shell
curl http://10.3.142.194:8080/solr/gamev2/select?fq=downloadCount:[1000 TO 1500]&start=0&rows=2&wt=json&q=*:*
```

* 响应内容

```json
{
  "responseHeader": {
    "status": 0,
    "QTime": 1,
    "params": {
      "start": "0",
      "q": "*:*",
      "wt": "json",
      "fq": "downloadCount:[1000 TO 1500]",
      "rows": "2"
    }
  },
  "response": {
    "numFound": 103,
    "start": 0,
    "docs": [{
      "id": "1877892",
      "name": "手残大联盟",
      "pinyin": "shoucandalianmeng",
      "suoxie": "scdlm",
      "keyword": "休闲时间",
      "publisher": "apkkpa",
      "ismstore": 1,
      "recentCount": 5,
      "downloadCount": 1400,
      "subscribeCount": 0,
      "catId": 2,
      "package": "com.avalon.AvalonHardest",
      "purchase": 0,
      "appId": 1877892,
      "vId": 5085129,
      "ss": 50,
      "icon": "http://img.wdjimg.com/mms/icon/v1/9/81/fd4b6da4deecafea170012a7dd471819_256_256.png",
      "size": 54789471,
      "source": 1,
      "_version_": 1610077964134776832
    }, {
      "id": "1889060",
      "name": "小苹果儿：根本停不下来",
      "pinyin": "xiaopingguoer：genbentingbuxialai",
      "suoxie": "xpge：gbtbxl",
      "keyword": "坑爹游戏 小苹果儿 小苹果 苹果 停不下来",
      "publisher": "ipeaksoft",
      "ismstore": 1,
      "recentCount": 14,
      "downloadCount": 1033,
      "subscribeCount": 0,
      "catId": 2,
      "package": "com.ipeaksoft.xiaoPingGuo",
      "purchase": 0,
      "appId": 1889060,
      "vId": 5302291,
      "ss": 50,
      "icon": "http://img.wdjimg.com/mms/icon/v1/1/7a/2243c605206d92b7d5d686344e3ab7a1_256_256.png",
      "size": 24829967,
      "source": 1,
      "_version_": 1610077964145262593
    }]
  }
}
```

> 看以看出我们完全可以不用`q`参数，仅仅利用fq参数就能实现基本的结构化查询，过滤出我们想要的信息


## 高级查询

solr提供个三种默认的查询解析器，并且提供其他的查询解析器，这些解析器的核心就是对上面的`q`参数使用你设置的解析器进行查询解析

### 标准化查询

标准化查询即是利用术语表达式自由组合参数进而查询特定字段，进行组合查询，查询规则：`字段名：查询内容`

* 查询条件

```shell
curl http://10.3.142.194:8080/solr/gamev2/select?start=0&rows=2&wt=json&q=name:荣耀 OR keyword:军团
```

* 响应

```json
{
  "responseHeader": {
    "status": 0,
    "QTime": 2,
    "params": {
      "start": "0",
      "q": "name:荣耀 OR keyword:军团",
      "wt": "json",
      "rows": "2"
    }
  },
  "response": {
    "numFound": 80,
    "start": 0,
    "docs": [{
      "id": "3181385",
      "name": "荣耀军团",
      "pinyin": "rongyaojuntuan",
      "suoxie": "ryjt",
      "keyword": "魔幻 荣耀 军团 奇迹",
      "publisher": "猎手互动科技有限公司",
      "ismstore": 1,
      "recentCount": 0,
      "downloadCount": 3333,
      "subscribeCount": 0,
      "catId": 2,
      "package": "com.ls.ryjt.mz",
      "purchase": 1,
      "appId": 3181385,
      "vId": 7697628,
      "ss": 50,
      "icon": "http://game.res.meizu.com/fileserver/app_icon/9096/f25eb30ee61841a4a53707b69f37754d.png",
      "size": 313299696,
      "label": "RPG 即时 MMO-分类 男生游戏 魔幻-分类",
      "source": 0,
      "_version_": 1610077965232635904
    }, {
      "id": "3200263",
      "name": "我的荣耀",
      "pinyin": "woderongyao",
      "suoxie": "wdry",
      "keyword": "红警 二战 坦克 荣耀 将军 策略 国战  军团 塔防 第五人格 红色警戒 绝地求生 坦克连 指挥官 装甲 合金弹头 帝国战争 共和国之辉 文明 射击",
      "publisher": "深圳市中泰源科技有限公司",
      "ismstore": 1,
      "recentCount": 0,
      "downloadCount": 9,
      "subscribeCount": 261,
      "catId": 2,
      "package": "com.wdry.hegsbl.mz",
      "purchase": 1,
      "appId": 3200263,
      "vId": 7688272,
      "ss": 52,
      "icon": "http://game.res.meizu.com/fileserver/app_icon/9056/29944b9fd09d4d18b484ec4dc88c5a50.png",
      "size": 0,
      "source": 0,
      "_version_": 1610077965200130049
    }]
  }
}
```

### 本地参数个性化查询解析器

#### 指定查询解析器

* 查询条件

```shell
curl http://10.3.142.194:8080/solr/gamev2/select?start=0&rows=2&wt=json&q=荣耀&defType=dismax&qf=name
```
> 如果不适用本地参数需要指定defType也就是查询解析器名称，pf指定查询的字段，这样q参数就不要指定查询字段了


* 响应

```json
{
  "responseHeader": {
    "status": 0,
    "QTime": 2,
    "params": {
      "start": "0",
      "q": "荣耀",
      "qf": "name",
      "wt": "json",
      "defType": "dismax",
      "rows": "2"
    }
  },
  "response": {
    "numFound": 68,
    "start": 0,
    "docs": [{
      "id": "1636041",
      "name": "小小荣耀军团",
      "pinyin": "xiaoxiaorongyaojuntuan",
      "suoxie": "xxryjt",
      "keyword": "横版 策略 动作 免费 对战 魔兽 兽人 精灵 人类 2d 卷轴",
      "publisher": "silentmoon",
      "ismstore": 1,
      "recentCount": 338,
      "downloadCount": 11346,
      "subscribeCount": 0,
      "catId": 2,
      "package": "com.SilverMoon.Legions.en",
      "purchase": 0,
      "appId": 1636041,
      "vId": 5026741,
      "ss": 50,
      "icon": "http://img.wdjimg.com/mms/icon/v1/4/1e/462b679acf2e4ed10f21bb4a817dd1e4_256_256.png",
      "size": 31966652,
      "source": 1,
      "_version_": 1610077964130582529
    }, {
      "id": "2245690",
      "name": "血之荣耀2",
      "pinyin": "xiezhirongyao2",
      "suoxie": "xzry2",
      "keyword": "",
      "publisher": "格融移动科技（北京）有限公司",
      "ismstore": 1,
      "recentCount": 120013,
      "downloadCount": 956,
      "subscribeCount": 0,
      "catId": 2,
      "package": "com.glu.gladiator2.tencent",
      "purchase": 0,
      "appId": 2245690,
      "vId": 5656536,
      "ss": 50,
      "icon": "http://img.wdjimg.com/mms/icon/v1/a/18/573fee58028634e2adb547815e16618a_256_256.png",
      "size": 199130755,
      "source": 1,
      "_version_": 1610077964162039808
    }]
  }
}
```

### 嵌套查询

有时需要针对不同的字段选用不同的查询解析器，因而可以在q查询参数中使用本地参数

* 查询条件

```shell
curl http://10.3.142.194:8080/solr/gamev2/select?q= _query_:"{!edismax pf=name v=$q1}"&q1=name:冒险岛&start=0&row=10&wt=json
```

> 这里是使用edismax查询解析通过<font color="#dd0000">magic</font> 指定，使用参数引用的方式，其跟如下指定查询字段是一样的

```
http://10.3.142.194:8080/solr/gamev2/select?q= _query_:"{!edismax qf=name pf=name v=$q1}"&q1=冒险岛&start=0&rows=10&wt=json&fl=id,name,keyword
```

> 为了改进搜索结果，增加pf参数，当所有字段匹配结果相同，通过这个字段指定，进而提升文档的搜索排名

* 响应结果

```json
{
  "responseHeader": {
    "status": 0,
    "QTime": 1,
    "params": {
      "fl": "id,name,keyword",
      "start": "0",
      "q1": "冒险岛",
      "q": " _query_:\"{!edismax qf=name pf=name v=$q1}\"",
      "wt": "json",
      "rows": "10"
    }
  },
  "response": {
    "numFound": 185,
    "start": 0,
    "docs": [{
      "id": "2607646",
      "name": "永不言弃之冒险岛",
      "keyword": "像素 永不言弃 冒险岛"
    }, {
      "id": "3216166",
      "name": "超级冒险岛",
      "keyword": ""
    }, {
      "id": "3216444",
      "name": "热血冒险岛",
      "keyword": ""
    }, {
      "id": "3216561",
      "name": "冒险岛手游",
      "keyword": ""
    }, {
      "id": "3216591",
      "name": "部落冒险岛",
      "keyword": ""
    }, {
      "id": "3217945",
      "name": "冒险王国金银岛",
      "keyword": ""
    }, {
      "id": "3220053",
      "name": "香瓜岛大冒险",
      "keyword": ""
    }, {
      "id": "3221049",
      "name": "冒险军团（冒险与挖矿）",
      "keyword": ""
    }, {
      "id": "3216246",
      "name": "滑雪大冒险探险时光",
      "keyword": ""
    }, {
      "id": "2075740",
      "name": "松鼠大冒险",
      "keyword": "休闲时间"
    }]
  }
}
```


#### 利用bf增加文档分数

这里使用了本地函数，具体函数列表参见：[Function Queries](https://lucene.apache.org/solr/guide/6_6/function-queries.html)

```
http://10.3.142.194:8080/solr/gamev2/select?q= _query_:"{!edismax bf =log(sum(1,div(downloadCount,10000))) qf=name pf=name v=$q1}"&q1=冒险岛&start=0&rows=10&wt=json&fl=id,name,keyword,downloadCount
```

* 响应结果

```json
{
  "responseHeader": {
    "status": 0,
    "QTime": 2,
    "params": {
      "fl": "id,name,keyword,downloadCount",
      "start": "0",
      "q1": "冒险岛",
      "q": " _query_:\"{!edismax bf =log(sum(1,div(downloadCount,10000))) qf=name pf=name v=$q1}\"",
      "wt": "json",
      "rows": "10"
    }
  },
  "response": {
    "numFound": 185,
    "start": 0,
    "docs": [{
      "id": "2607646",
      "name": "永不言弃之冒险岛",
      "keyword": "像素 永不言弃 冒险岛",
      "downloadCount": 78895
    }, {
      "id": "3216166",
      "name": "超级冒险岛",
      "keyword": "",
      "downloadCount": 0
    }, {
      "id": "3216444",
      "name": "热血冒险岛",
      "keyword": "",
      "downloadCount": 0
    }, {
      "id": "3216561",
      "name": "冒险岛手游",
      "keyword": "",
      "downloadCount": 0
    }, {
      "id": "3216591",
      "name": "部落冒险岛",
      "keyword": "",
      "downloadCount": 0
    }, {
      "id": "3217945",
      "name": "冒险王国金银岛",
      "keyword": "",
      "downloadCount": 0
    }, {
      "id": "3220053",
      "name": "香瓜岛大冒险",
      "keyword": "",
      "downloadCount": 0
    }, {
      "id": "3221049",
      "name": "冒险军团（冒险与挖矿）",
      "keyword": "",
      "downloadCount": 0
    }, {
      "id": "3216246",
      "name": "滑雪大冒险探险时光",
      "keyword": "",
      "downloadCount": 0
    }, {
      "id": "1752541",
      "name": "保卫萝卜2：极地冒险",
      "keyword": "塔防守卫 闯关 萌系 塔防 冒险",
      "downloadCount": 10498561
    }]
  }
}
```

> 可以看到在相同关键字<font color="#dd0000">冒险岛</font>下载排名多的搜索结果靠前


## 参考资料

* [Query Parsing - Tips and Tricks](https://www.slideshare.net/erikhatcher/solr-query-parsing-tips-and-tricks)