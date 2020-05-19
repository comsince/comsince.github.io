---
layout: post
title: "飞享-即时聊天系统技术文档"
description: IM TECH
category: IM
---

本文档主要说明飞享即时聊天系统的技术相关文档,用于支持其他多端开发.说明系统的整体架构与后续技术`发展规划`,`技术愿景`,`未来商业化支持`


[![Build Status](https://travis-ci.org/comsince/universe_push.svg?branch=master)](https://travis-ci.org/comsince/universe_push)
[![GitHub license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/comsince/universe_push/blob/master/LICENCE)
[![Gitee stars](https://gitee.com/comsince/universe_push/badge/star.svg?theme=white)](https://gitee.com/comsince/universe_push)
[![GitHub stars](https://img.shields.io/github/stars/comsince/universe_push?style=social)](https://github.com/comsince/universe_push)

# 概述
飞享是一个即时聊天系统整体解决方案,更像一个开箱即用的即时通讯产品化解决方案.在设计之初,尽量遵照平台原生开发的要求进行,因为我们始终觉得原生的体验是达到一个优秀即时通讯的基本要求.在对客户端,服务端设计的过程中,尽量采用业界通用的方案进行.不用过于依赖某项技术,因为我们任何只有合适的技术用在合适的系统上才能发挥它固有的价值.

初衷开始这个项目只是对即时通讯的喜爱,慢慢不断的发展成为一个即时通讯类产品,在功能的不断迭代中,需要我们停下脚本思考一些问题.更希望这个一个技术解决方案,而不是基于某种语言或者框架的解决方案.也是服务端通信框架是基于`t-io`(基于AIO的网络编程框架,提供便捷的API,方便管理,快速使用),或者是基于`Netty`(基于NIO的异步网络编程框架).也是服务端编程语言是基于`Java`或者是基于`Go`.技术本身是为了解决实际问题,不应该是限制具体某个领域的发展.在编写客户端应用时,可以支持`Android`,也可以支持`iOS`,可以支持`Web`.支持我们遵循我们设计的交互协议规范,这些都可以迎刃而解,不管你是采用Android或者iOS原生开发,还是跨平台开发,使用Js框架Vue,React.


# 系统架构

系统架构在以后更多的是解决用户不断增多进而导致的,硬件支持,软件支持.更多的用户带来的挑战包括不断增长的数据,需要不断优化的用户体验.功能的迭代带来系统复杂度不断增大,给软件架构带来更多的挑战.所以基于我们现在的简单分布式架构,解决小部分用户使用尚可,后续需要考虑更多的用户,更优的用户体验,因此需要不断的优化软件架构

**NOTE:** 如下为简要的系统部署图

![image](/images/im/push-universe-deploy.png)


# 系统流程图

![image](/images/im/push-universe-flow.png)

重点关注核心要点:`登录实现`,`消息不丢失设计`

## 登录设计
系统登录是进行用户管理的关键,现行设计采用`手机号`+`验证码`的方式进行,登录的目地是生成会话,以支持同一帐号不同设备登录的功能

### 用户token生成
**NOTE:** 每一个用户Id登录不同设备,采用不同的cid,即是采用uid(用户id)+cid(设备唯一id)生成session,token中间分隔符为`|`

#### token规则

usertoken | session secret | db secret

#### usertoken规则

testim | 时间戳 | 用户名

* 核心代码

```java
    public static String getToken(String username) {
        String signKey = KEY + "|" + (System.currentTimeMillis()) + "|" + username;
        try {
            return DES.encryptDES(signKey);
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return null;
    }
```


* 返回的token是经过AES加密然后Base64编码

### 客户端接入方式

**NOTE:** 用户登录成功后,会成功获取到上面生成的token,例如web端在获取到这个`token`保存在浏览器的`localstorage`里面.这个toekn将作为后续发送验证请求的关键.登录成功后要发送`connect`信令进行链接验证,关于信令的传输将会在下面介绍

![image](/images/im/login.png)

### 解密分离token

上面已经知道token是三部分加密组成,因此这里需要解密token,得到如下三部分内容
* usertoken
* session secret
* db secret

### 生成密码

**NOTE:** 以下是发送`connect`信令携带的消息体

```js
{
    userName: LocalStore.getUserId(), //用户id
    password: pwdAesBase64, //生成的用户密码
    clientIdentifier: localStorage.getItem(KEY_VUE_DEVICE_ID) //当前用户登录设备唯一id
}
```

### 生成规则

password 为 usertoken使用session secret经过AES加密得出的.

### 服务端认证

客户端在传入上述的`connect`消息后,需要经过消息认证才算接入成功,每次用户会话都有一个session,利用session secret
对`password`字段进行AES解密,如果能够解密成功,则表示登录验证成功



# 系统接口文档

系统的接入方式多种多样,带来的挑战是需要支持多种接入方式.对于Android,ios需要基于TCP实现用户长链接,保证消息即时可达.因此需要设计私有协议,
对于web端,可以采用websocket协议,只需要在消息体中设计我们的消息格式即可.

## 私有二进制协议

```
0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2
+---------------+---------------+---------------+---------------+
|      magic(8) |   version(8)  |   signal(8)   |               |
+---------------+---------------+---------------+---------------+
|                          length(32)                           | 
+---------------+---------------+---------------+---------------+
|   subsignal(8)|       messageId(16)           |  paload data  :
+---------------+---------------+---------------+---------------+
:             payload data(length)                              :
+---------------+---------------+---------------+---------------+
```

**NOTE:** 参数说明如下

* __magic__ 魔数,用于标记消息的起始位置
* __version__  协议版本号
* __signal__   主消息信令
* __length__   消息体长度
* __subsignal__ 消息子信令
* __messageId__ 消息ID，用于标记当前消息，可用作消息确认
* __payload data__ 消息体,长度由`length`定义

### 信令定义说明

**NOTE:** 如下是主信令与子信令对应关系

<table>
    <tr>
        <th>主信令</th>
        <th>子信令</th>
        <th>信令说明</th>  
    </tr >
    <tr>
        <td >PING</td>
        <td>无</td>
        <td>心跳主信令</td>
    </tr>
    <tr>
        <td >PUSH</td>
        <td>无</td>
        <td>推送消息主信令</td>
    </tr>
    <tr>
        <td rowspan="8">CONNECT</td>
        <td>CONNECTION_ACCEPTED</td>
        <td>接受链接</td>
    </tr>
    <tr>
        <td>CONNECTION_REFUSED_UNACCEPTABLE_PROTOCOL_VERSION</td>
        <td>不可接受的协议</td>
    </tr>
    <tr>
        <td>CONNECTION_REFUSED_IDENTIFIER_REJECTED</td>
        <td>用户拒绝</td>
    </tr>
    <tr>
        <td>CONNECTION_REFUSED_SERVER_UNAVAILABLE</td>
        <td>服务不可用</td>
    </tr>
    <tr>
        <td>CONNECTION_REFUSED_BAD_USER_NAME_OR_PASSWORD</td>
        <td>用户名或密码错误</td>
    </tr>
    <tr>
        <td>CONNECTION_REFUSED_NOT_AUTHORIZED</td>
        <td>没有授权</td>
    </tr>
    <tr>
        <td>CONNECTION_REFUSED_UNEXPECT_NODE</td>
        <td>节点拒绝链接</td>
    </tr>
    <tr>
        <td>CONNECTION_REFUSED_SESSION_NOT_EXIST</td>
        <td>会话不存在</td>
    </tr>
    <tr>
        <td >DISCONNECT</td>
        <td>无</td>
        <td>心跳主信令</td>
    </tr>
    <tr>
        <td >CONNECT_ACK</td>
        <td>无</td>
        <td>心跳主信令</td>
    </tr>
    <tr >
        <td rowspan="23">PUBLISH</td>
        <td>US</td>
        <td>用户搜索</td>
    </tr>
    <tr>
        <td>FAR</td>
        <td>朋友添加请求</td>
    </tr>
    <tr>
        <td>UPUI</td>
        <td>用户信息</td>
    </tr>
    <tr>
        <td>FRN</td>
        <td>朋友添加通知</td>
    </tr>
    <tr>
        <td>FRP</td>
        <td>拉取朋友请求</td>
    </tr>
    <tr>
        <td>FHR</td>
        <td>处理朋友申请</td>
    </tr>
    <tr>
        <td>FP</td>
        <td>获取朋友列表</td>
    </tr>
    <tr>
        <td>MN</td>
        <td>消息通知</td>
    </tr>
    <tr>
        <td>MS</td>
        <td>发送消息</td>
    </tr>
    <tr>
        <td>MP</td>
        <td>获取消息</td>
    </tr>
    <tr>
        <td>FN</td>
        <td>朋友添加通知</td>
    </tr>
    <tr>
        <td>GC</td>
        <td>创建群组</td>
    </tr>
    <tr>
        <td>GPGI</td>
        <td>获取群组信息</td>
    </tr>
    <tr>
        <td>GPGM</td>
        <td>获取群组成员</td>
    </tr>
    <tr>
        <td>GAM</td>
        <td>添加群组成员</td>
    </tr>
    <tr>
        <td>GKM</td>
        <td>移除群组成员</td>
    </tr>
    <tr>
        <td>GQ</td>
        <td>退出群组</td>
    </tr>
    <tr>
        <td>GMI</td>
        <td>修改群组信息</td>
    </tr>
    <tr>
        <td>MMI</td>
        <td>修改个人信息</td>
    </tr>
    <tr>
        <td>GQNUT</td>
        <td>获取上传文件token</td>
    </tr>
    <tr>
        <td>MR</td>
        <td>消息撤回</td>
    </tr>
    <tr>
        <td>RMN</td>
        <td>远程消息通知</td>
    </tr>
    <tr>
        <td>LRM</td>
        <td>拉取历史消息</td>
    </tr>
    <tr>
        <td >PUB_ACK</td>
        <td>确认主信令</td>
        <td>子信令同上面Publish的子信令，这里不再一一列出</td>
    </tr>
</table>


### 信令交互路程

信令交互流程主要是指如何使用以上的信令进行业务处理，信令的设计都采用的发送确认机制，例如客户端发送`connect`信令后，正常情况下都会受到服务器返回的ack确认指令，这里就是`connect_ack`.
下面主要针对`PUBLISH`信令说明，因为这个主信令下面有比较多的子信令，每个信令的具体含义已经在上面做了相应的说明。下面主要来说明具体业务是如何交互的。下面以发送消息说明

* 客户端构造信令消息体，此时__signal__为__PUSHLISH__，子信令为__MS__，代表用户需要发送消息
* 服务端接收到消息后解析指令，根据子信令处理相应的业务逻辑。处理成功后，服务端构造`PUSH__ACK`确认消息，此时主信令就是`PUSH_ACK`，子信令依旧保持不变为`MS`
* 客户端收到确认指令后，根据返回的子消息信令进行后续的业务处理
* 由于信令支持messageId,用户可以根据messageId,确认是否是之前的消息，可以用其实现异步消息转为同步处理


## 基于websocket的消息体信令设计

由于web端采用的是websocket协议，所有我们只需要定义传输消息体格式既可，如下为websocket消息通讯的Json格式定义

```json
{
    "signal": "connect", //主信令
    "sub_signal": "conect_ack", //子信令
    "message_id": 0,  //消息id
    "content": ""     //消息体
}
```

**NOTE：** 这里的Json格式定义有点类似二进制通讯协议，只不过由于websocket协议本身定义了消息头，消息长度，因为不需要我们自己处理，因此我们只需要关注以上字段既可


## 内容消息体格式定义

这里的消息体定义主要指在上面的json字段中content定义，我们知道content字段是携带真正通讯内容的载体，如文本，图片，视频等实体消息，因为content的定义决定了后续我们处理消息的方式

# 系统规划

## 系统架构设计
系统会随着主流软件设计逐步进行架构设计,主要对系统的主要性能瓶颈进行一定的重新设计,例如接入用户数如何水平扩展,如果保证用户消息的大规模存储.
并尽量保证最具竞争力的设计,实现在即时通讯领域应用最新的技术架构,实现业务的稳步提升

## 多端开发系统体验
在用户体验上,尽量使用原生开发,当然在这些基础上,可以使用小程序开发,方便大家快速体验系统功能.系统体验上,尽量追求,普通大众最能接收的设计.

## 可扩展性
相信很多用户可能对系统在实际应用中的效果并不满意,因此考虑系统的可扩展性,二次开发的便利性,需要提升
