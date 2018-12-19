---
layout: wiki
title: "InnoDB引擎精要与索引优化实践"
categories: [中间件]
description: 关系型数据库
keywords: Mysql
---

## 存储引擎

### MyISAM

* 不支持行锁(MyISAM只有表锁)，读取时对需要读到的所有表加锁，写入时则对表加排他锁；
* 不支持事务
* 不支持外键
* 不支持崩溃后的安全恢复
* 在表有读取查询的同时，支持往表中插入新纪录
* 支持BLOB和TEXT的前500个字符索引，支持全文索引
* 支持延迟更新索引，极大地提升了写入性能
* 对于不会进行修改的表，支持 压缩表 ，极大地减少了磁盘空间的占用

**NOTE:** 补充概念

Mysql的行锁和表锁（ 锁是计算机协调多个进程或纯线程并发访问某一资源的机制）
表级锁： 每次操作锁住整张表。开销小，加锁快；不会出现死锁；锁定粒度大，发生锁冲突的概率最高，并发度最低；
行级锁： 每次操作锁住一行数据。开销大，加锁慢；会出现死锁；锁定粒度最小，发生锁冲突的概率最低，并发度也最高

### InnoDB

* 支持行锁，采用MVCC来支持高并发，有可能死锁
* 支持事务
* 支持外键
* 支持崩溃后的安全恢复
* 不支持全文索引

#### InnoDB的记录存储结构

**NOTE:**  总结

* 页是MySQL中磁盘和内存交互的基本单位，也是MySQL是管理存储空间的基本单位
* 指定和修改行格式的语法如下：
```
CREATE TABLE 表名 (列的信息) ROW_FORMAT=行格式名称
ALTER TABLE 表名 ROW_FORMAT=行格式名称
```
* InnoDB目前定义了4中行格式
  * COMPACT行格式
  * Redundant行格式
  * Dynamic和Compressed行格式
  这两种行格式类似于COMPACT行格式，只不过在处理行溢出数据时有点儿分歧，它们不会在记录的真实数据处存储字符串的前768个字节，而是把所有的字节都存储到其他页面中，只在记录的真实数据处存储其他页面的地址。
  另外，Compressed行格式会把存储在其他页面中的数据压缩处理。
* 一个页一般是16KB，当记录中的数据太多，当前页放不下的时候，会把多余的数据存储到其他页中，这种现象称为行溢出
* 对于 CHAR(M) 类型的列来说，当列采用的是定长字符集时，该列占用的字节数不会被加到变长字段长度列表，而如果采用变长字符集时，该列占用的字节数也会被加到变长字段长度列表

**NOTE:**参考资料　[InnoDB记录存储结构](https://mp.weixin.qq.com/s?__biz=MzIxNTQ3NDMzMw==&mid=2247483670&idx=1&sn=751d84d0ce50d64934d636014abe2023&chksm=979688e4a0e101f2a51d1f06ec75e25c56f8936321ae43badc2fe9fc1257b4dc1c24223699de&scene=21#wechat_redirect)

#### InnoDB页存储结构

* InnoDB为了不同的目的而设计了不同类型的页，用于存放我么记录的页也叫做数据页。
* 一个数据页可以被分为7个部分，分别是
	* File Header，表示文件头，占固定的38字节。
	* Page Header，表示页里的一些状态信息，占固定的56个字节。
	* Infimum + Supremum，两个虚拟的伪记录，分别表示页中的最小和最大记录，占固定的26个字节。
	* User Records：真实存储我们插入的记录的部分，大小不固定。也就是上面的记录存储结构
	* Free Space：页中尚未使用的部分，大小不确定。
	* Page Directory：页中的记录相对位置，也就是各个槽在页面中的地址偏移量，大小不固定，插入的记录越多，这个部分占用的空间越多。
	* File Trailer：用于检验页是否完整的部分，占用固定的8个字节。

* 每个记录的头信息中都有一个next_record属性，从而使页中的所有记录串联成一个单链表。
* InnoDB会为把页中的记录划分为若干个组，每个组的最后一个记录的地址偏移量作为一个槽，存放在Page Directory中，所以在一个页中根据主键查找记录是非常快的，分为两步：
  * 通过二分法确定该记录所在的槽。
  * 通过记录的next_record属性组成的链表遍历查找该槽中的各个记录。
* 每个数据页的File Header部分都有上一个和下一个页的编号，所以所有的数据页会组成一个双链表。
* 为保证从内存中同步到磁盘的页的完整性，在页的首部和尾部都会存储页中数据的校验和和LSN值，如果首部和尾部的校验和和LSN值校验不成功的话，就说明同步过程出现了问题。

**NOTE:**参考资料 [InnoDB数据页结构](https://mp.weixin.qq.com/s?__biz=MzIxNTQ3NDMzMw==&mid=2247483678&idx=1&sn=913780d42e7a81fd3f9b747da4fba8ec&chksm=979688eca0e101fa0913c3d2e6107dfa3a6c151a075c8d68ab3f44c7c364d9510f9e1179d94d&scene=21#wechat_redirect)

## 索引基础

存储结构对于算法尤其重要，有了上面的记录`存储结构`和`页存储结构`才能为索引打下基础

### InnoDB与MyISAM的索引核心要点

* 对于InnoDB存储引擎来说，在单个页中查找某条记录分为两种情况：
   * 以主键为搜索条件，可以使用Page Directory通过二分法快速定位相应的用户记录。
   * 以其他列为搜索条件，需要按照记录组成的单链表依次遍历各条记录。

* 没有索引的情况下，不论是以主键还是其他列作为搜索条件，只能沿着页的双链表从左到右依次遍历各个页。
* InnoDB存储引擎的索引是一棵B+树，完整的用户记录都存储在B+树第0层的叶子节点，其他层次的节点都属于内节点，内节点里存储的是目录项记录。InnoDB的索引分为两大种：
   * 聚簇索引:
     以主键值的大小为页和记录的排序规则，在叶子节点处存储的记录包含了表中所有的列。
   * 二级索引:
     以自定义的列的大小为页和记录的排序规则，在叶子节点处存储的记录内容是列 + 主键。
* MyISAM存储引擎的数据和索引分开存储，这种存储引擎的索引全部都是二级索引，在叶子节点处存储的是列 + 页号。

## 索引实践

* B+树索引在空间和时间上都有代价，所以没事儿别瞎建索引。
* B+树索引适用于下边这些情况：
  * 全值匹配
  * 匹配左边的列
  * 匹配范围值
  * 精确匹配某一列并范围匹配另外一列
  * 用于排序
  * 用于分组
* 在使用索引时需要注意下边这些事项：
  * 只为用于搜索、排序或分组的列创建索引
  * 为列的基数大的列创建索引
  * 索引列的类型尽量小
  * 可以只对字符串值的前缀建立索引
  * 只有索引列在比较表达式中单独出现才可以适用索引
  * 为了尽可能少的让聚簇索引发生页面分裂和记录移位的情况，建议让主键拥有AUTO_INCREMENT属性。
  * 定位并删除表中的重复和冗余索引
  * 尽量适用覆盖索引进行查询，避免回表带来的性能损耗。

**NOTE:** 参考资料 [MySQL的索引（中）](https://mp.weixin.qq.com/s?__biz=MzIxNTQ3NDMzMw==&mid=2247483718&idx=1&sn=4681f6ef312774f4a0a5f6bfb06c862a&chksm=979688b4a0e101a2d182cb37861d6b74ccbe61c1df9effba8da68e9c701701d20872d50429aa&mpshare=1&scene=23&srcid=1219fRpxTWQC6T05klRGcjDU#rd)

## 参考资料

* [MySQL常见的两种存储引擎：MyISAM与InnoDB的爱恨情仇](https://juejin.im/post/5b1685bef265da6e5c3c1c34)
* [数据库两大神器【索引和锁】](https://juejin.im/post/5b55b842f265da0f9e589e79#comment)

## 参考书籍

* [MySQL有什么推荐的学习书籍？](https://www.zhihu.com/question/28385400/answer/87729818)
* [MySQL技术内部-InnoDb引擎](/download/mysql/MySQL-Innodb-2.pdf)