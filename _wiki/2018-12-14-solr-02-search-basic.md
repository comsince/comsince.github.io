---
layout: wiki
title: "【分布式搜索】- Solr - 初入搜索"
categories: [NoSQL 搜索]
description: 搜索
keywords: solr
---

# Solr文档、字段和模式设计

## Solr文档、字段和模式设计概述

* __Solr 如何看待文档__

Solr 的基本信息单元是一个文档，它是描述某些东西的一组数据。例如：配方文件将包含成分、说明、准备时间、烹饪时间、所需的工具等等。例如，关于一个人的文档可能包含该人的姓名、传记、最喜欢的颜色和鞋子大小。关于一本书的文档可能包含标题、作者、出版年份、页数等等。

* __字段分析__

`字段分析`告诉 Solr 在生成索引时如何处理传入的数据。这个过程的一个更准确的名字是处理（processing），甚至消化（digestion），但官方名称是分析。
字段分析是字段类型的重要组成部分。了解`分析器`、`标记器`和`过滤器`是对字段分析的详细描述。

* __Solr 的模式文件__
  * `managed-schema` 是 Solr 默认使用的模式文件的名称，用于支持通过 Schema API 或 Schemaless Mode 功能在运行时进行模式更改。如果您选择了，您可以 显式配置 managed-schema 功能以使用备用文件名，但文件内容仍由 Solr 自动更新。
  * `schema.xml` 是模式文件的传统名称，可以由使用 ClassicIndexSchemaFactory 的用户手动编辑该模式。
  * 如果您使用的是 SolrCloud，则您可能无法通过本地文件系统上的这些名称找到任何文件。您将只能通过 Schema API（如果已启用）或通过 Solr 管理界面的Cloud Screens 来查看模式。

## Solr字段类型

### Solr字段类型的定义和属性

* 字段类型定义可以包括以下四种类型的信息：
  * 字段类型的名称（必填）。
  * 一个实现类的名字（必填）。
  * 如果一个字段的类型是 TextField，则为字段类型的字段分析说明。
  * 字段类型属性取决于实现类，一些属性可能是强制性的。

* __schema.xml 中的字段类型定义__

```xml
<fieldType name="text_general" class="solr.TextField" positionIncrementGap="100"> 
  <analyzer type="index"> 
    <tokenizer class="solr.StandardTokenizerFactory"/>
    <filter class="solr.StopFilterFactory" ignoreCase="true" words="stopwords.txt" />
    <!-- in this example, we will only use synonyms at query time
    <filter class="solr.SynonymFilterFactory" synonyms="index_synonyms.txt" ignoreCase="true" expand="false"/>
    -->
    <filter class="solr.LowerCaseFilterFactory"/>
  </analyzer>
  <analyzer type="query">
    <tokenizer class="solr.StandardTokenizerFactory"/>
    <filter class="solr.StopFilterFactory" ignoreCase="true" words="stopwords.txt" />
    <filter class="solr.SynonymFilterFactory" synonyms="synonyms.txt" ignoreCase="true" expand="true"/>
    <filter class="solr.LowerCaseFilterFactory"/>
  </analyzer>
</fieldType>
```

> 上述实例的第一行包含字段类型名称、text_general 和实现类的名称 solr.TextField。
定义的其余部分是关于字段分析，在理解分析器、分词和过滤器中描述。 

* __字段类型属性__

```xml
<fieldType name="date" class="solr.DatePointField"
           sortMissingLast="true" omitNorms="true"/>
```

  * 可以为给定字段类型指定的属性分为三个主要类别：
    * 特定于字段类型的类的属性。
    * 常规属性 Solr 支持任何字段类型。
    * 字段默认属性可以在字段类型上指定，这些字段将由使用此类型而不是默认行为的字段继承。

* 字段的一般属性
* 字段默认属性

### Solr包含的字段类型

详情参见solr官方文档

## Solr如何定义字段
字段是在 schema.xml 的字段元素中定义的。一旦你设置了字段类型，那么定义 Solr 字段本身很简单了。 

* 示例-字段定义

```xml
<field name="price" type="float" default="0.0" indexed="true" stored="true"/>
```

* 字段属性
  * __name__  
  该字段的名称。字段名称只能由字母数字或下划线字符组成，不能以数字开头。目前这并不是严格执行的，但其他字段名称将不具备所有组件的第一类支持，并且不保证向后的兼容性。带有前导和后缀下划线的名称（例如，_version_）被保留。每个字段都必须有一个name。
  * __type__  
  该fieldType字段的名称。这将name在<font color="#dd0000">fieldType</font>定义的name属性中找到。每个字段都必须有一个type。
  * __default__  
  将自动添加到在索引时该字段中没有值的任何文档的默认值。如果这个属性没有指定，那么没有默认值。
* 可选的字段类型重写属性

## Solr复制字段

```xml
<copyField source="cat" dest="text" maxChars="30000" />
```

> 在这个例子中，我们希望 Solr 将 cat 字段复制到一个名为 text 的字段中

* 下面的行将与通配符模式 * _t 匹配的所有传入字段的内容复制到文本字段中：

```xml
<copyField source="*_t" dest="text" maxChars="25000" />
```

* 复制是在流源级别完成的，并且不复制到另一个副本中。这意味着复制字段不能被链接，即不能从 here 复制到 there 然后从 there 复制到 elsewhere。但是，可以将相同的源字段复制到多个目标字段：

```xml
<copyField source="here" dest="there"/>
<copyField source="here" dest="elsewhere"/>
```

## Solr动态字段

动态字段允许 Solr 对您在架构中未明确定义的字段进行索引
在作为索引文档时，与任何明确定义的字段都不匹配的字段可以与动态字段匹配

```xml
<dynamicField name="*_i" type="int" indexed="true"  stored="true"/>
```

## Solr模式元素

* __唯一的键__

```xml
<uniqueKey>id</uniqueKey>
```

* 相似

## Solr的架构API

架构 API 入口点
* /schema：检索架构，或修改架构以添加、删除或替换字段、动态字段、复制字段或字段类型。
* /schema/fields：检索有关所有定义的字段或特定命名字段的信息。
* /schema/dynamicfields：检索有关所有动态字段规则或特定命名动态规则的信息。
* /schema/fieldtypes：检索有关所有字段类型或特定字段类型的信息。
* /schema/copyfields：检索有关复制字段的信息。
* /schema/name：检索模式名称。
* /schema/version：检索模式版本。
* /schema/uniquekey：检索已定义的 uniqueKey。
* /schema/similarity：检索全局相似性定义。

### Solr修改架构

```post
POST /collection/schema
```

Solr 如果要添加、删除或替换字段、动态字段规则、复制字段规则或新字段类型，可以将 POST 请求发送到 /collection/schema/ 端点，并使用一系列命令以执行请求的操作。支持以下命令：

* add-field：用你提供的参数添加一个新的字段。
* delete-field：删除一个字段。
* replace-field：用一个不同的配置替换现有的字段。
* add-dynamic-field：使用您提供的参数添加新的动态字段规则。
* delete-dynamic-field：删除一个动态的字段规则。
* replace-dynamic-field：用一个配置不同的现有动态字段规则替换。
* add-field-type：用你提供的参数添加一个新的字段类型。
* delete-field-type：删除一个字段类型。
* replace-field-type：用不同的配置替换现有的字段类型。
* add-copy-field：添加一个新的复制字段规则。
* delete-copy-field：删除复制字段规则。

### Solr检索架构信息

* 检索整个架构

```json
GET /collection/schema
```

* 列表字段
  * GET /collection/schema/fields
  * GET /collection/schema/fields/fieldname

```json
curl http://localhost:8983/solr/gettingstarted/schema/fields
```

* 列出动态字段
  * GET /collection/schema/dynamicfields
  * GET /collection/schema/dynamicfields/name

```shell
curl http://localhost:8983/solr/gettingstarted/schema/dynamicfields
```  

* 列出字段类型
  * GET /collection/schema/fieldtypes
  * GET /collection/schema/fieldtypes/name

```shell
curl http://localhost:8983/solr/gettingstarted/schema/fieldtypes
```  

* 列表复制字段
  * GET /collection/schema/copyfields

```shell
curl http://localhost:8983/solr/gettingstarted/schema/copyfields
```  

* 显示架构名称
  * GET /collection/schema/name

```shell
curl http://localhost:8983/solr/gettingstarted/schema/name
```  

* 显示架构版本
  * GET /collection/schema/version

```shell
curl http://localhost:8983/solr/gettingstarted/schema/version
```  

* 列出 UniqueKey
  * GET /collection/schema/uniquekey

```shell
curl http://localhost:8983/solr/gettingstarted/schema/uniquekey
```  

## 如何使用DocValues

# Solr分析器、标记器和过滤器

以下各部分描述了 Solr 如何分解和处理文本数据。有三个主要的概念要理解：分析器、标记器和过滤器。

* 字段分析器在接收期间、文档被索引时以及在查询时使用。分析器检查字段的文本并生成标记流。分析器可能是一个单独的类，或者它们可能由一系列的标记器和过滤器类组成。
* 标记器将字段数据分解为词法单位或标记。
* 过滤器检查标记流并保留它们、转换或丢弃它们，或者创建新的标记。标记器和过滤器可以组合起来形成管道或链，其中一个的输出被输入到下一个。这样的`标记器`和`过滤器`序列称为`分析器`，分析器的输出结果用于匹配查询结果或生成索引。


## Solr分析器概述

Solr 分析器被指定为 `schema.xml` 配置文件中的<fieldType>元素的子元素（在与 solrconfig. xml 相同的 conf/ 目录中）。
在正常使用情况下，只有类型为 <font color="#dd0000">solr.TextField</font> 的字段将指定一个分析器。配置分析器的最简单的方法是使用单个 <analyzer> 元素

```xml
<fieldType name="nametext" class="solr.TextField">
  <analyzer class="org.apache.lucene.analysis.core.WhitespaceAnalyzer"/>
</fieldType>
```

最复杂的分析要求，通常也可以分解为一系列离散的、相对简单的处理步骤。正如你很快就会发现的那样，Solr 发行版提供了大量的标记器和过滤器，覆盖了你可能遇到的大多数场景。建立一个分析器链非常简单，您可以指定一个简单的< analyzer >元素（无类属性），使用子元素命名标记器和过滤器的工厂类以使用，按照您希望它们运行的​​顺序

```xml
<fieldType name="nametext" class="solr.TextField">
  <analyzer>
    <tokenizer class="solr.StandardTokenizerFactory"/>
    <filter class="solr.StandardFilterFactory"/>
    <filter class="solr.LowerCaseFilterFactory"/>
    <filter class="solr.StopFilterFactory"/>
    <filter class="solr.EnglishPorterFilterFactory"/>
  </analyzer>
</fieldType>
```

> 字段值与索引术语：分析器的输出会影响给定字段中索引的术语 (以及分析对这些字段的查询时使用的术语)，但不会影响字段的存储值。例如: “Brown Cow”分成两个索引词 “brown” 和 “cow”，但存储的值仍将是一个字符串: “Brown Cow”。

* 分析阶段

分析发生在两种情况下：
  * 在索引的时候，当一个字段被创建时，分析得到的令牌流将被添加到一个索引中，并为该字段定义一组术语（包括位置、大小等）。
  * 在查询时间，分析正在搜索的值，并将结果的条件与存储在字段索引中的条件进行匹配。

如果您为 <analyzer> 字段类型提供了一个简单的定义（如上例所示），那么它将用于索引和查询。如果您想要为每个阶段使用不同的分析器，则可以包含两个与 type 属性区分的 <analyzer> 定义。例如：

```xml
<fieldType name="nametext" class="solr.TextField">
  <analyzer type="index">
    <tokenizer class="solr.StandardTokenizerFactory"/>
    <filter class="solr.LowerCaseFilterFactory"/>
    <filter class="solr.KeepWordFilterFactory" words="keepwords.txt"/>
    <filter class="solr.SynonymFilterFactory" synonyms="syns.txt"/>
  </analyzer>
  <analyzer type="query">
    <tokenizer class="solr.StandardTokenizerFactory"/>
    <filter class="solr.LowerCaseFilterFactory"/>
  </analyzer>
</fieldType>
```

## 什么是Tokenizer (分词)

Tokenizer 的工作是将文本流分解为令牌，其中每个令牌（通常）是文本中字符的子序列。分析器知道它配置的字段，但 tokenizer 不是。Tokenizers 从字符流（Reader）中读取并生成一系列令牌对象（TokenStream）。  

```xml
<fieldType name="text" class="solr.TextField">
  <analyzer>
    <tokenizer class="solr.StandardTokenizerFactory"/>
  </analyzer>
</fieldType>
```

## 什么是Solr过滤器

与分词一样，Solr 过滤器消耗输入并产生一个令牌流。过滤器也来自于 org.apache.lucene.analysis.TokenStream。与分词不同，过滤器的输入是另一个TokenStream。过滤器的工作通常比 tokenizer 更容易，因为在大多数情况下，过滤器会依次查看流中的每个标记，并决定是否将其传递、替换或丢弃。

```xml
<fieldType name="text" class="solr.TextField">
  <analyzer>
    <tokenizer class="solr.StandardTokenizerFactory"/>
    <filter class="solr.StandardFilterFactory"/>
    <filter class="solr.LowerCaseFilterFactory"/>
    <filter class="solr.EnglishPorterFilterFactory"/>
  </analyzer>
</fieldType>
```

> 这个例子从 Solr 的标准 tokenizer 开始，它将字段的文本分解为令牌。然后，这些令牌通过 Solr 的标准过滤器，从首字母缩略词中删除点，并执行一些其他的常见操作。所有的令牌都被设置为小写，这将有利于在查询时不区分大小写的匹配。


## Solr处理输入字符：CharFilter

### 什么是 CharFilter

CharFilter 是预处理输入字符的组件。
CharFilter可以像 Token Filters 一样链接在一个 Tokenizer 前面。
CharFilters 可以添加、更改或删除字符，同时保留原始字符偏移以支持突出显示等功能。

过滤器：
* solr.MappingCharFilterFactory

```xml
<analyzer>
  <charFilter class="solr.MappingCharFilterFactory" mapping="mapping-FoldToASCII.txt"/>
  <tokenizer ...>
  [...]
</analyzer>
```

* solr.HTMLStripCharFilterFactory

```xml
<analyzer>
  <charFilter class="solr.HTMLStripCharFilterFactory"/>
  <tokenizer ...>
  [...]
</analyzer>
```

* solr.ICUNormalizer2CharFilterFactory

```xml
<analyzer>
  <charFilter class="solr.ICUNormalizer2CharFilterFactory"/>
  <tokenizer ...>
  [...]
</analyzer>
```

* solr.PatternReplaceCharFilterFactory

```xml
<analyzer>
  <charFilter class="solr.PatternReplaceCharFilterFactory"
             pattern="([nN][oO]\.)\s*(\d+)" replacement="$1$2"/>
  <tokenizer ...>
  [...]
</analyzer>
```

## Solr中有哪些Tokenizers


* 标准 Tokenizer
* 经典 Tokenizer
* 关键字 Tokenizer
* 信令 Tokenizer
* 小写 Tokenizer
* N-gram Tokenizer
* 边缘 N-gram Tokenizer
* ICU Tokenizer
* 路径层次 Tokenizer
* 正则表达式模式 Tokenizer
* 简化的正则表达式模式 Tokenizer
* 简化的正则表达式模式分割 Tokenizer
* UAX29 URL 电子邮件 Tokenizer
* 白空间 Tokenizer

## Solr过滤器类型

# Solr索引和基本数据操作

## Solr索引介绍
将内容添加到 Solr 索引中，并在必要时修改该内容或将其删除。

以下是将数据加载到 Solr 索引中的三种最常见的方法：

* 使用基于 Apache Tika 构建的 Solr Cell 框架来获取二进制文件或结构化文件，如 Office、Word、PDF 和其他专有格式。
* 通过向任何可以生成此类请求的环境发送 HTTP 请求到 Solr 服务器来上传 XML 文件。
* 编写自定义 Java 应用程序以通过 Solr 的 Java Client API（在客户端 API 中更详细地描述）来获取数据。如果您正在使用提供 Java API 的应用程序（如内容管理系统（CMS）），则使用 Java API 可能是最佳选择。

> 如果在与索引关联的架构中定义了字段名称，那么当该内容被标记时，与该字段相关联的分析步骤将被应用于其内容。如果存在与字段名称匹配的字段，则在架构中未明确定义的字段将被忽略或映射到动态字段定义


## Solr：Post工具

> 为了以后测试，建议在本地启动集群模式

```shell
./bin/solr -e cloud
```

* 索引 XML

```shell
bin/post -c gettingstarted *.xml
```

* 索引 CSV

```shell
bin/post -c gettingstarted *.csv
```

* 索引 JSON

```shell
bin/post -c gettingstarted *.json
```