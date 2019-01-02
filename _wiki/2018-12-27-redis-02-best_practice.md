---
layout: wiki
title: 【内存数据库】- Redis性能调优专题 
categories: [redis]
description: redis原理
keywords: redis
---

## redis 性能调优

针对Redis的性能优化，主要从下面几个层面入手：

* 最初的也是最重要的，确保没有让Redis执行耗时长的命令
* 使用pipelining将连续执行的命令组合执行
* 操作系统的Transparent huge pages功能必须关闭：
	```
	echo never > /sys/kernel/mm/transparent_hugepage/enabled
	```

* 如果在虚拟机中运行Redis，可能天然就有虚拟机环境带来的固有延迟。可以通过./redis-cli –intrinsic-latency 100命令查看固有延迟。同时如果对Redis的性能有较高要求的话，应尽可能在物理机上直接部署Redis。
* 检查数据持久化策略
* 考虑引入读写分离机制

### 长耗时命令

Redis绝大多数读写命令的时间复杂度都在O(1)到O(N)之间，在文本和官方文档中均对每个命令的时间复杂度有说明。

通常来说，O(1)的命令是安全的，O(N)命令在使用时需要注意，如果N的数量级不可预知，则应避免使用。例如对一个field数未知的Hash数据执行HGETALL/HKEYS/HVALS命令，通常来说这些命令执行的很快，但如果这个Hash中的field数量极多，耗时就会成倍增长。
又如使用SUNION对两个Set执行Union操作，或使用SORT对List/Set执行排序操作等时，都应该严加注意。

避免在使用这些O(N)命令时发生问题主要有几个办法：

* 不要把List当做列表使用，仅当做队列来使用
* 通过机制严格控制Hash、Set、Sorted Set的大小
* 可能的话，将排序、并集、交集等操作放在客户端执行
* 绝对禁止使用KEYS命令
* 避免一次性遍历集合类型的所有成员，而应使用SCAN类的命令进行分批的，游标式的遍历


Redis提供了SCAN命令，可以对Redis中存储的所有key进行游标式的遍历，避免使用KEYS命令带来的性能问题。同时还有SSCAN/HSCAN/ZSCAN等命令，分别用于对Set/Hash/Sorted Set中的元素进行游标式遍历

Redis提供了Slow Log功能，可以自动记录耗时较长的命令。相关的配置参数有两个：
```
slowlog-log-slower-than xxxms  #执行时间慢于xxx毫秒的命令计入Slow Log
slowlog-max-len xxx  #Slow Log的长度，即最大纪录多少条Slow Log
```

* 使用__SLOWLOG GET [number]__命令，可以输出最近进入Slow Log的number条命令。
* 使用__SLOWLOG RESET__命令，可以重置Slow Log

### 网络引发的延迟

* 尽可能使用长连接或连接池，避免频繁创建销毁连接
* 客户端进行的批量数据操作，应使用Pipeline特性在一次交互中完成。

## 数据持久化引发的延迟

Redis的数据持久化工作本身就会带来延迟，需要根据数据的安全级别和性能要求制定合理的持久化策略：

* __AOF + fsync always__的设置虽然能够绝对确保数据安全，但每个操作都会触发一次fsync，会对Redis的性能有比较明显的影响
* __AOF + fsync every second__是比较好的折中方案，每秒fsync一次
* __AOF + fsync never__会提供AOF持久化方案下的最优性能
* 使用RDB持久化通常会提供比使用AOF更高的性能，但需要注意RDB的策略配置
* 每一次RDB快照和AOF Rewrite都需要Redis主进程进行fork操作。fork操作本身可能会产生较高的耗时，与CPU和Redis占用的内存大小有关。根据具体的情况合理配置RDB快照和AOF Rewrite时机，避免过于频繁的fork带来的延迟

**NOTE:**Redis在fork子进程时需要将内存分页表拷贝至子进程，以占用了24GB内存的Redis实例为例，共需要拷贝24GB / 4kB * 8 = 48MB的数据。在使用单Xeon 2.27Ghz的物理机上，这一fork操作耗时216ms。

**NOTE:** 可以通过INFO命令返回的latest_fork_usec字段查看上一次fork操作的耗时（微秒）

### Swap引发的延迟

当Linux将Redis所用的内存分页移至swap空间时，将会阻塞Redis进程，导致Redis出现不正常的延迟。Swap通常在物理内存不足或一些进程在进行大量I/O操作时发生，应尽可能避免上述两种情况的出现。

__/proc/<pid>/smaps__文件中会保存进程的swap记录，通过查看这个文件，能够判断Redis的延迟是否由Swap产生。如果这个文件中记录了较大的Swap size，则说明延迟很有可能是Swap造成的。

### 数据淘汰引发的延迟

当同一秒内有大量key过期时，也会引发Redis的延迟。在使用时应尽量将key的失效时间错开。

### 引入读写分离机制

Redis的主从复制能力可以实现一主多从的多节点架构，在这一架构下，主节点接收所有写请求，并将数据同步给多个从节点。
在这一基础上，我们可以让从节点提供对实时性要求不高的读请求服务，以减小主节点的压力。
尤其是针对一些使用了长耗时命令的统计类任务，完全可以指定在一个或多个从节点上执行，避免这些长耗时命令影响其他请求的响应。

## Redis分片方案
这些方案主要注意原理实现，其余主要是运维方便的实践
  * Twemproxy
  * redis Cluster
  * Codis

## 参考资料

* [Redis 的 KEYS 命令引起 RDS 数据库雪崩，宕机 2 次，造成几百万损失](http://blog.jobbole.com/114397/?utm_source=blog.jobbole.com&utm_medium=relatedPosts)
