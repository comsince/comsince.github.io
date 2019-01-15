---
layout: wiki
title: "【分布式搜索】- Solr - 深入搜索"
categories: [NoSQL 搜索]
description: 搜索
keywords: solr
---

# 搜索请求

## 关于Solr搜索的概述

查询解析器的输入可以包括：

* 搜索字符串——即在索引中搜索的术语。
* 用于微调查询的参数，通过增加特定字符串或字段的重要性，通过在搜索项之间应用布尔逻辑，或者通过从搜索结果中排除内容。
* 用于控制查询响应的表示的参数，诸如指定将呈现结果的顺序或者限制对搜索应用的模式的特定字段的响应。

Solr 支持两种特殊的搜索结果分组方式，以帮助进一步探索：`faceting` 和`集群`。

## Solr查询响应的相关性

与相关性相关的两个概念的重要性：

* 精度（precision）是返回结果中相关文档的百分比。
* 召回（recall）一下系统中所有相关结果的相关结果的百分比。

## Solr查询语法和解析

本指南中讨论的解析器是：

* 标准查询解析器
* DisMax 查询解析器
* __扩展的 DisMax 查询解析器__
* 其他解析器

> 查询解析器插件是 QParserPlugin 的所有子类。如果您有自定义分析需求，您可能需要扩展该类来创建您自己的查询分析器。


### Solr常用的查询参数

所有 Solr 解析器都有一些查询参数是通用的
在 Solr 中几个查询解析器可以共享由 Solr 支持的查询参数。

#### defType 参数
__defType__ 参数选择 Solr 应该用来处理请求中的主查询参数（q）的查询解析器,在标准查询解析器中占有重要作用
```
defType=dismax
```

> 如果没有指定 defType 参数，则默认使用标准查询解析器。（如：defType=lucene）


#### sort 参数

sort 参数按升序 (asc) 或降序 (desc) 顺序排列搜索结果。该参数可以与数字或字母内容一起使用。方向可以全部以小写字母或全部大写字母输入（即，asc 或者ASC）。

#### start 参数

指定时，start 参数指定查询结果集中的偏移量，并指示 Solr 开始显示此偏移量的结果。
默认值是 0。换句话说，默认情况下，Solr 返回的结果没有偏移量，从结果开始的地方开始。

#### rows 参数

您可以使用该 rows 参数将查询的结果分页。该参数指定 Solr 应该一次返回到客户端的完整结果集中的最大文档数目。
默认值是10。也就是说，默认情况下，Solr 一次返回 10 个文档以响应查询。

#### fq（Filter Query）参数

fq 参数定义了一个查询，可以用来限制可以返回的文档的超集，而不影响 `score`。这对于加快复杂查询非常有用，因为指定的查询 fq 是独立于主查询而被缓存的。当以后的查询使用相同的过滤器时，会有一个缓存命中，过滤器结果从缓存中快速返回。

> 使用该 fq 参数时，请记住以下几点：

* 该 fq 参数可以在查询中多次指定。
```
fq=popularity:[10 TO *]&fq=section:0
```

* filter 查询可能涉及复杂的 Boolean 查询。上面的例子也可以写成一个单独 fq 的两个强制性的子句
```
fq=+popularity:[10 TO *] +section:0
```

* 每个过滤器查询的文档集都是独立缓存的。因此，关于前面的例子：如果这些条款经常出现在一起，则使用一个包含两个强制性条款的单个 fq，如果它们相对独立，则使用两个单独的 fq 参数。
* 还可以在 fq 内部使用 filter(condition) 语法来单独缓存子句
* 与所有参数一样：URL 中的特殊字符需要正确转义并编码为十六进制值。

#### fl（Field List）参数

该 fl 参数将查询响应中包含的信息限制在指定的字段列表中。这些字段必须是 stored="true" 或 docValues="true"。

#### 函数与 fl

可以为结果中的每个文档计算函数，并将其作为伪字段（pseudo-field）返回
```
fl=id,title,product(price,popularity)
```

#### 文件变换器与 fl

文档变换器可以用来修改查询结果中每个文档返回的信息：
```
fl=id,title,[explain]
```

#### 字段名称别名

您可以通过使用 “displayName” 前缀来更改对字段、函数或转换器的响应中使用的键
```
fl=id,sales_price:price,secret_sauce:prod(price,popularity),why_score:[explain style=nl]
```

返回Json样例
```json
{
"response": {
    "numFound": 2,
    "start": 0,
    "docs": [{
        "id": "6H500F0",
        "secret_sauce": 2100.0,
        "sales_price": 350.0,
        "why_score": {
            "match": true,
            "value": 1.052226,
            "description": "weight(features:cache in 2) [DefaultSimilarity], result of:",
            "details": [{
                "..."
}]}}]}}
```

#### debug 参数

* debug=query：仅返回有关查询的调试信息。
* debug=timing：返回有关查询花费多长时间处理的调试信息。
* debug=results：返回关于 score 结果的调试信息（也称为“解释”）。默认情况下，score 解释以大字符串值的形式返回，对结构和可读性使用换行符和制表符缩进行，但是可以指定一个附加参数 
* debug.explain.structured=true 来将此信息作为 wt 请求的响应格式的嵌套数据结构返回。
* debug=all：返回关于 request 请求的所有可用调试信息。（可替代地使用：debug=true）

#### explainOther 参数

该 explainOther 参数指定了一个 Lucene 查询来标识一组文档。如果包含此参数并设置为非空值，则查询将返回调试信息以及与 Lucene 查询相匹配的每个文档的“说明信息”（相对于主查询（由 q 指定）参数）。

```
q=supervillians&debugQuery=on&explainOther=id:juggernaut
```

#### timeAllowed 参数

此参数指定允许搜索完成的时间量（以毫秒为单位）

#### segmentTerminateElely 参数

#### omitHeader 参数

该参数可以设置为 true 或 false。
如果设置为 true，则此参数将从返回的结果中排除标题。标题包含有关请求的信息，例如完成所需的时间。该参数的默认值是 false。

#### wt 参数

该 wt 参数选择 Solr 应该用来格式化查询响应的 Response Writer

####  cache 参数

Solr 默认缓存所有查询的结果并过滤查询。要禁用结果缓存，请设置 cache=false 参数。

### Solr标准查询解析器的使用

标准查询解析器的关键优势在于它支持强大且相当直观的语法，允许您创建各种<font color="#dd0000">结构化查询</font> 。最大的缺点是它不容忍出现语法错误，与 DisMax 查询解析器相比， DisMax 查询解析器的设计目的是尽可能地减少抛出错误。

#### 标准查询解析器参数
除了常见 Query 参数，Faceting 参数，Highlighting 显示参数之外，标准查询解析器还支持下列所述的参数。
* q  
使用标准查询语法定义查询。该参数是强制性的。
* q.op  
指定查询表达式的默认运算符，覆盖在 Schema 中指定的默认运算符。可能的值是“AND”或“OR”。
* df  
指定默认字段，覆盖架构中默认字段的定义。
* sow

#### 通配符搜索

| 通配符搜索类型 | 特殊字符 | 示例 |
| :------| ------: | :------: |
| 单个字符（匹配单个字符） | ？ | 搜索字符串te?t将匹配 test 和 text。 |
| 多个字符（匹配零个或多个连续字符）| * | 通配符搜索：tes*将匹配 test，testing 和  tester器。您也可以在术语中间使用通配符。例如：te*t会匹配 test  和 text。*est会匹配 pest  和 test。 |

#### 模糊搜索

模糊搜索发现与指定术语相似的术语，而不一定完全匹配。
```
roam~
```
> 这个搜索将匹配像 roams、foam、foams。它也将匹配“roam”这个词本身。
可选的距离参数指定允许编辑的最大数量，介于0和2之间，默认为2

```
roam~1
```

>这将匹配 roams 和 foam 等术语，但不包括 foams，因为它的编辑距离为“2”。

#### 邻近搜索

邻近搜索查找介于特定距离之间的术语。

```
"jakarta apache"~10
```

#### 范围搜索

范围搜索指定字段的值范围（具有上限和下限的范围）

> 下面的范围查询匹配其 popularity 字段的值在52和10000之间（包含）的所有文档： 

```
popularity:[52 TO 10000]
```

查询周围的括号决定了它的包容性。

* 方括号 [＆] 表示一个包含范围查询，它匹配包括上限和下限在内的值。
* 大括号{＆}表示一个独占范围查询，它匹配上限和下限之间的值，但不包括上边界和下限本身。
* 您可以混合使用这些类型，因此范围的一端是包含性的，另一端是独占的。这是一个例子：
```
count:{1 TO 10]
```

#### 用“^”增加一个术语

Lucene / Solr 根据找到的术语提供匹配文档的相关级别。要增加一个术语：^，请在搜索的术语末尾使用带有一个 boost 因子 (一个数字)的插入符号 ^。boost 因子越高，该术语的相关性越高

```
jakarta^4 apache
"jakarta apache"^4 "Apache Lucene"
```

#### 常量 Score 查询使用 “^ =” 

常量 score 查询是使用 `<query_clause>^=<score>` 创建的，它将整个子句设置为与该子句匹配的任何文档的指定分数


#### 标准查询解析器支持的布尔运算符

> 以下操作都必须在制定df前提下进行

* 布尔运算符“+”

该 + 符号（也称为“required”运算符）要求在至少一个文档中的某个字段中的 "+" 符号之后的术语存在，以便查询返回匹配。

```
+jakarta lucene
``` 

* 布尔运算符 AND（“&&”）
AND 运算符匹配单个文档的文本中任何地方存在两个词的文档。这相当于使用集合的交集。符号 && 可以用来代替单词 AND。
```
"jakarta apache" AND "Apache Lucene"
"jakarta apache" && "Apache Lucene"
```

* 布尔运算符NOT（“！”）

NOT 运算符排除在 NOT 之后包含该术语的文档。这相当于使用集合的差异。符号 ! 可以用来代替单词 NOT。

```
"jakarta apache" NOT "Apache Lucene"
"jakarta apache" ! "Apache Lucene"
```

* 布尔运算符“ - ”

该 - 符号或 “prohibit” 操作符排除包含 - 符号后的术语的文档。 

```
"jakarta apache" -"Apache Lucene"
```

#### 逃离特殊字符

在查询中出现以下字符时，Solr 提供了特殊的含义：

```
+ - && || ! ( ) { } [ ] ^ " ~ * ? : /
```

> 为了使 Solr 逐字地解释这些字符中的任何一个，而不是像特殊字符一样，在字符前面加一个反斜杠字符 \


#### 将术语分组以形成子查询

Lucene / Solr 支持使用括号将子句分组以形成子查询

```
("Action Film" || "War Film") && Drama
```

* 在一个字段中分组子句

要将两个或多个布尔运算符应用于搜索中的单个字段，请将括号中的布尔子句分组,这样就不用定义defType了

```
genre:(("Action Film" || "War Film") && Drama)
```

### Solr查询：DisMax查询解析器

Solr 的 DisMax 查询解析器设计用于处理由用户输入的简单短语（没有复杂的语法），并基于每个字段的重要性使用不同的权重（boosts）在多个字段中搜索各个术语。其他选项使用户能够根据每个用例的具体规则影响评分（独立于用户输入）

#### DisMax 查询解析器参数
除了常见的请求参数、突出显示参数和简单的 facet 参数外，DisMax 查询解析器还支持下面描述的参数。与标准查询解析器一样，DisMax 查询解析器允许在 solrconfig. xml 中指定默认参数值
#### q 参数

该 q 参数定义了构成搜索本质的主要 “查询”。该参数支持用户提供的原始输入字符串，没有特殊的转义。术语中的 + 和 - 字符被视为“强制性”和“禁止”修饰符。
> 该 q 参数不支持通配符，如 *

#### q.alt 参数

如果指定，q.alt 参数定义一个查询（默认情况下将使用标准查询解析语法进行解析），当主 q 参数未指定或为空时

#### qf（Query Fields）参数

qf 参数引入了一个字段列表，每个字段都分配了一个 boost 因子来增加或减少该字段在查询中的重要性
```
qf="fieldOne^2.3 fieldTwo fieldThree^0.4"
```

```post
http://10.3.142.147:8080/solr/game_shard1_replica2/select?q=%E6%8D%95%E9%B1%BC&df=name&wt=json&indent=true&defType=dismax&qf=keyword%5E2+name%5E3
```

> 分配 fieldOne 一个 2.3 的提升， fieldTwo 为默认提升（因为没有 boost 因素被指定），并且 fieldThree 提高 0.4。这些 boost 因素使 fieldOne 中的匹配比 fieldTwo 的匹配更加重要，它比 fieldThree 中的匹配更为重要。

#### mm（最小匹配）参数

在处理查询时，Lucene / Solr 识别三种类型的子句：强制性的，禁止的和“optional”（也被称为“should”子句）。默认情况下，q 参数中指定的所有单词或短语都被视为“optional”子句，除非它们前面有“+”或“ - ”

#### pf（Phrase Fields）参数

一旦使用 fq 和 qf 参数确定了匹配文档的列表，就可以使用 pf 参数“boost”文档的得分，因为 q 参数中的所有项都出现在非常接近的情况下

#### ps（Phrase Slop）参数

ps 参数指定应用于使用 pf 参数指定的查询的 “短语 slop” 的数量。短语 slop 是一个标记需要相对于另一个标记移动以匹配查询中指定的短语的位置的数量。

#### qs（Query Phrase Slop）参数

qs 参数指定用 qf 参数明确包含在用户查询字符串中的短语查询所允许的倾斜量。如上所述，slop 是指为了匹配在查询中指定的短语，一个标记需要相对于另一个标记移动的位置的数量。

#### tie（Tie Breaker）参数

#### bq（Boost Query）参数

```url
http://localhost:8983/solr/techproducts/select?defType=dismax&q=video&bq=cat:electronics^5.0
```

#### bf（Boost Functions）参数


### Solr扩展的DisMax查询解析器：eDismax

Solr 扩展的 DisMax（eDisMax）查询解析器是 DisMax 查询解析器的改进版本。 


* 支持完整的 Lucene 查询分析器语法，它与 Solr 的标准查询解析器具有相同的增强功能。
  * 支持 AND、OR、NOT、 - 和+等查询。
  * 在 Lucene 语法模式下可选地将 “and” 和 “or” 视为 “AND” 和 “OR”。
  * 尊重 'magic 字段' 的名字：_val_ 和 _query_。这些在 Schema 中不是真实的字段，但是如果使用它，它可以帮助做特殊的事情（如 _val_ 的情况下的函数查询, 或者在 _query_ 中的嵌套查询）。如果 _val_ 用于术语或短语查询，则该值将作为函数进行分析。
* 在语法错误的情况下包括改进的智能部分转义; 在此模式下仍然支持字段查询、+/- 和短语查询。
* 通过使用单词 shingles 来提高接近度增强；在应用近似增强之前，不需要查询来匹配文档中的所有单词。
* 包括高级的停用词处理：在查询的强制部分中不需要停用词，但仍用于近似增强部分。如果一个查询由所有的停用词组成，例如“to be or not to be”，那么所有的单词都是必需的。
* 包括改进的 boost 功能：在 eDisMax 中，该 boost 功能是一个乘数而不是加数，提高了您的 boost 效果；DisMax的附加 boost 功能（bf 和 bq）也被支持。
* 支持纯粹的消极嵌套查询：诸如 +foo (-foo) 的查询将匹配所有文档。
* 让您指定允许最终用户查询哪些字段，并禁止直接派遣的搜索。


#### eDisMax 参数

* sow  
拆分空格
* mm.autoRelax
* boost
* lowercaseOperators  
指示是否将小写“and”和“or”当作与运算符“AND”和“OR”相同的布尔型参数。默认为false。
* ps
* pf2
* ps3
* stopwords
* uf  
指定允许最终用户明确查询的架构字段。该参数支持通配符。默认是允许所有的字段，相当于uf=*


#### 使用 “Magic Fields”：_val_ 和 _query_

* 如果 magic 字段名称：_val_ 在术语或短语查询中使用，则将该值作为函数进行分析。
* 它为 FunctionQuery 语法提供了一个 hook。包含括号的函数需要使用引号。例如：
```
_val_:myfield _val_:"recip(rord(myfield),1,2,3)"
```
* Solr 查询解析器为任何类型的查询解析器（通过 QParserPlugin）提供了嵌套的查询支持。如果嵌套查询包含保留字符，则通常需要引用封装。例如：
```
 _query_:"{!dismax qf=myfield}how now brown cow"
```


### Solr查询中的本地参数

#### 本地参数

本地参数被指定为参数的前缀。以下面的查询参数为例

```
q=solr rocks
```

我们可以使用本地参数对此查询字符串进行前缀，为标准查询解析器提供更多的信息

```
q={!q.op=AND df=title}solr rocks
```

#### 本地参数的基本语法

要指定一个本地参数，请在要修改的参数前插入以下内容：

* 首先：{!
* 插入由空格分隔的任意数量的 key=value
* 以 } 结束并立即跟随查询参数

#### 查询类型缩写
如果一个本地参数值没有名字出现，它会被赋予一个隐含的名字“type”

```
q={!dismax qf=myfield}solr rocks
```
相当于：
```
q={!type=dismax qf=myfield}solr rocks
```

如果没有指定“type”（显式或隐式），则默认使用 lucene 分析器。从而：

```
fq={!df=summary}solr rocks
```
等同于:
```
fq={!type=lucene df=summary}solr rocks
```

#### 用v 键指定参数值

本地参数中的 v 的特殊键是指定该参数的值的替代方法：
```
q={!dismax qf=myfield}solr rocks
```
相当于：
```
q={!type=dismax qf=myfield v='solr rocks'}
```

#### 参数取消引用
通过参数取消引用或间接引用，可以使用另一个参数的值，而不是直接指定它的值

```
q={!dismax qf=myfield}solr rocks
```
等同于：
```
q={!type=dismax qf=myfield v=$qq}&qq=solr rocks
```

### Solr函数查询的使用
#### 使用函数查询

* 通过一个明确的 QParser，期望函数参数，例如 func 或 frange

```
q={!func}div(popularity,price)&fq={!frange l=1000}customer_ratings
```

* 在一个 Sort 表达式中

```
sort=div(popularity,price) desc, score desc
```

* 将函数的结果作为伪字段（pseudo-fields）添加到查询结果中的文档

```
&fl=sum(x, y),id,a,b,c,score
```

#### 使用内置函数转义问题

>bq 使用内置函数需要使用单引用引起来，不然会因此解析错误

```shell
_query_:"{!edismax qf='title label game' pf='game^50 label^10 title' mm=1 bq='{!func}recip(rord(updateTime),1,1000,1000)' v=游戏}"

```

> 对于多个字段查询，需要用单引号引起来，不然解析器遇到空格做语法解析导致出错

```shell
http://10.3.142.194:8080/solr/gamev2/select?q= _query_:"{!edismax bf =log(sum(1,div(downloadCount,10000))) qf='name keword' pf=name v=$q1}"&q1=冒险岛&start=0&rows=10&wt=json&fl=id,name,keyword,downloadCount
```