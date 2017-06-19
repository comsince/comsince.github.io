---
layout: post
title: "HTTPS 原理以及优化实践"
description: 主要说明https原理以及在实际应用遇到的性能瓶颈
category: network
---

HTTPS 目前正在逐步得到广泛应用，本篇文章通过不断剖析HTTPS的原理，基于对此的深刻理解不断的分析其性能瓶颈。立足在安全的基础上达到与HTTP同样的性能。

## HTTPS

HTTPS 可以认为是 HTTP + TLS/SSL，所以我们只需要了解 TLS/SSL 原理即可。在进入原理之前，我们需要了解两个基础概念：数字证书、证书授权中心

证书与授权

* 数字证书（Digital Certificate）是用来证明公钥（非对称密钥算法中用于加密的密钥）所有者身份的。我们人人都可以自己生成一个公钥，但是这个公钥是否能代表是你的，这个认证的过程需要一个权威机构执行，这个机构就是证书授权中心。

* 证书授权中心（Certificate Authority）负责证书颁发。CA 是行业内信得过的组织机构，它具有权威性，由它颁发的证书大家都相信是可靠的。

### TLS/SSL 协议图解

![image](/images/network/https/tsl-ssl.png)


### SSL协议的握手过程 　　

为了便于更好的认识和理解 SSL 协议，这里着重介绍 SSL 协议的握手协议。SSL 协议既用到了公钥加密技术(非对称加密)又用到了对称加密技术，SSL对传输内容的加密是采用的对称加密，然后对对称加密的密钥使用公钥进行非对称加密。这样做的好处是，对称加密技术比公钥加密技术的速度快，可用来加密较大的传输内容， 公钥加密技术相对较慢，提供了更好的身份认证技术，可用来加密对称加密过程使用的密钥。
SSL 的握手协议非常有效的让客户和服务器之间完成相互之间的身份认证，其主要过程如下：

　　①客户端的浏览器向服务器传送客户端 SSL 协议的版本号，加密算法的种类，产生的随机数，以及其他服务器和客户端之间通讯所需要的各种信息。

　　②服务器向客户端传送 SSL 协议的版本号，加密算法的种类，随机数以及其他相关信息，同时服务器还将向客户端传送自己的证书。

　　③客户利用服务器传过来的信息验证服务器的合法性，服务器的合法性包括：证书是否过期，发行服务器证书的 CA 是否可靠，发行者证书的公钥能否正确解开服务器证书的“发行者的数字签名”，服务器证书上的域名是否和服务器的实际域名相匹配。如果合法性验证没有通过，通讯将断开；如果合法性验证通过，将继续进行第四步。

　　④用户端随机产生一个用于后面通讯的“对称密码”，然后用服务器的公钥（服务器的公钥从步骤②中的服务器的证书中获得）对其加密，然后将加密后的“预主密码”传给服务器。

　　⑤如果服务器要求客户的身份认证（在握手过程中为可选），用户可以建立一个随机数然后对其进行数据签名，将这个含有签名的随机数和客户自己的证书以及加密过的“预主密码”一起传给服务器。

　　⑥如果服务器要求客户的身份认证，服务器必须检验客户证书和签名随机数的合法性，具体的合法性验证过程包括：客户的证书使用日期是否有效，为客户提供证书的CA 是否可靠，发行CA 的公钥能否正确解开客户证书的发行 CA 的数字签名，检查客户的证书是否在证书废止列表（CRL）中。检验如果没有通过，通讯立刻中断；如果验证通过，服务器将用自己的私钥解开加密的“预主密码 ”，然后执行一系列步骤来产生主通讯密码（客户端也将通过同样的方法产生相同的主通讯密码）。

　　⑦服务器和客户端用相同的主密码即“通话密码”，一个对称密钥用于 SSL 协议的安全数据通讯的加解密通讯。同时在 SSL 通讯过程中还要完成数据通讯的完整性，防止数据通讯中的任何变化。

　　⑧客户端向服务器端发出信息，指明后面的数据通讯将使用的步骤⑦中的主密码为对称密钥，同时通知服务器客户端的握手过程结束。

　　⑨服务器向客户端发出信息，指明后面的数据通讯将使用的步骤⑦中的主密码为对称密钥，同时通知客户端服务器端的握手过程结束。

　　⑩SSL 的握手部分结束，SSL 安全通道的数据通讯开始，客户和服务器开始使用相同的对称密钥进行数据通讯，同时进行通讯完整性的检验。



## 抓包工具

### 桌面端wireshark

###  Android客户端tcdump
手机要有root权限
* 1 下载tcpdump   http://www.strazzere.com/android/tcpdump

* 2 adb push c:\wherever_you_put\tcpdump /data/local/tcpdump

* 3 adb shell chmod 6755 /data/local/tcpdump

* 4 adb shell,   su获得root权限

* 5 cd /data/local

* 6 ./tcpdump -i any -p -s 0 -w /sdcard/capture.pcap

## Andriod客户端优化

 优化策略一般有以下两种：
 * SessionId(一般由由服务端分布式存储seesionid实现)
 * Session Ticket(一般由客户端支持，服务服务端提供session ticket支持)

 客户端如果要支持session ticket，必须开启，否则在client sayhello Extentsion中就不会带有sessionticket支持，如下是不支持的包文格式：

 ![client-hello-with-no-session-ticket](/images/network/https/client-hello-no-session-ticket.png)

 下面以Android 客户端为例子，说明如何开启session ticket，由于此功能默认隐藏，需要通过反射调用隐藏的API,下面是stackoverflow的一个问题，由这可以受到一些启发[tls use session ticket in android](https://stackoverflow.com/questions/31023531/tls-use-session-ticket-in-android)
  
  通过查找Android API文档我们发现`SSLCertificateSocketFactory`有如下方法：
```
  /**
     * Enables <a href="http://tools.ietf.org/html/rfc5077#section-3.2">session ticket</a>
     * support on the given socket.
     *
     * @param socket a socket created by this factory
     * @param useSessionTickets {@code true} to enable session ticket support on this socket.
     * @throws IllegalArgumentException if the socket was not created by this factory.
     */
    public void setUseSessionTickets(Socket socket, boolean useSessionTickets) {
        castToOpenSSLSocket(socket).setUseSessionTickets(useSessionTickets);
    }
```
其最终的实现是在[OpenSSLSocketImpl](https://android.googlesource.com/platform/external/conscrypt/+/f087968/src/main/java/org/conscrypt/OpenSSLSocketImpl.java?autodive=0%2F%2F%2F%2F)中，如下代码：
```
 /**
     * This method enables session ticket support.
     *
     * @param useSessionTickets True to enable session tickets
     */
    public void setUseSessionTickets(boolean useSessionTickets) {
        this.useSessionTickets = useSessionTickets;
    }
```
但是以上接口又不能直接使用。我们必须通过扩展SSLSocketFactory来设置启用session ticket
```
public class SSLExtensionSocketFactory extends SSLSocketFactory {
    private String TAG = "TlsSessionTicket";
    private SSLSocketFactory mDelegate;

    public SSLExtensionSocketFactory(Context context) {
        try {
            SSLContext sslContext = SSLContext.getDefault();
            SSLSessionCache sslSessionCache;
            try {
                sslSessionCache =
                        new SSLSessionCache(new File(Environment.getExternalStorageDirectory(), "sslCache"));
            } catch (IOException e) {
                DebugLogger.e(TAG, e.getMessage());
                sslSessionCache = new SSLSessionCache(context);
            }
            install(sslSessionCache,sslContext);
            mDelegate = sslContext.getSocketFactory();
        } catch (Exception e) {
            DebugLogger.e(TAG,e.getMessage());
            mDelegate = (SSLSocketFactory) SSLSocketFactory.getDefault();
        }
    }

    private Socket makeSSLSocketSessionTicketSupport(Socket socket) {
        if(socket instanceof SSLSocket) {
            setUseSessionTickets(socket);
        }
        return socket;
    }
    @Override
    public String[] getDefaultCipherSuites() {
        return mDelegate.getDefaultCipherSuites();
    }

    @Override
    public String[] getSupportedCipherSuites() {
        return mDelegate.getSupportedCipherSuites();
    }

    @Override
    public Socket createSocket(Socket s, String host, int port, boolean autoClose) throws IOException {
        return makeSSLSocketSessionTicketSupport(mDelegate.createSocket(s, host, port, autoClose));
    }

    @Override
    public Socket createSocket(String host, int port) throws IOException {
        return makeSSLSocketSessionTicketSupport(mDelegate.createSocket(host, port));
    }

    @Override
    public Socket createSocket(String host, int port, InetAddress localHost, int localPort) throws IOException, UnknownHostException {
        return makeSSLSocketSessionTicketSupport(mDelegate.createSocket(host, port, localHost, localPort));
    }

    @Override
    public Socket createSocket(InetAddress host, int port) throws IOException {
        return makeSSLSocketSessionTicketSupport(mDelegate.createSocket(host, port));
    }

    @Override
    public Socket createSocket(InetAddress address, int port, InetAddress localAddress, int localPort) throws IOException {
        return makeSSLSocketSessionTicketSupport(mDelegate.createSocket(address, port, localAddress, localPort));
    }

    private void setUseSessionTickets(Socket socket){
        Class c = socket.getClass();
        try {
            Method m = c.getMethod("setUseSessionTickets",boolean.class);
            m.invoke(socket,true);
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (IllegalArgumentException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        }
    }

    private void install(SSLSessionCache sslSessionCache,SSLContext sslContext){
        Class c = sslSessionCache.getClass();
        try {
            Method method = c.getMethod("install", new Class<?>[] {SSLSessionCache.class, SSLContext.class});
            method.invoke(sslSessionCache,sslSessionCache,sslContext);
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    }
}
```

例如使用`HTTPUrlConnetion`时可以如下初始化`sessionFactory`

```
try {
      HttpsURLConnection.setDefaultSSLSocketFactory(new SSLExtensionSocketFactory(this));
  } catch (Exception e){

}
```

通过如上代码可以实现在发送client hello报文时，带上session ticket extend
![client-hello-with-session-ticket](/images/network/https/client-hello-with-session-ticket.png)

服务端响应回复session tick
![server-send-session-ticket](/images/network/https/server-send-session-ticket.png)

经过上面优化，不管应用重启，还是同一接口的请求，始终会重用session ticket，直到服务端session ticket 更换，这样就会减少一次交换证书，协商秘钥的请求，如下图所示：

![communication-with-session-ticket](/images/network/https/communication-with-session-ticket.png)

## 问题分析

* 证书问题

```
com.meizu.cloud.pushsdk.networking.error.ANError: javax.net.ssl.SSLHandshakeException: 
com.android.org.bouncycastle.jce.exception.ExtCertPathValidatorException: 
Could not validate certificate: 
Certificate expired at Thu Aug 16 13:34:06 GMT+03:00 2018 (compared to Mon Jun 24 04:55:04 GMT+03:00 2019)
```

这个问题一般是因为手机在校验服务器下发的证书时，发现证书过期，就会断开链接，如果手机的时间改成证书日期之后的时间也会报上面的错误。

## 参考文档
* [HTTPS性能优化实践](https://mp.weixin.qq.com/s/Twe-fjo4JShsphfcWx573Q)
* [SSL协议(HTTPS) 握手、工作流程详解(双向HTTPS流程)](http://www.cnblogs.com/jifeng/archive/2010/11/30/1891779.html)
* [理解 HTTPS 原理，SSL/TLS 协议](https://my.oschina.net/DL88250/blog/533451)
* [SSL/TLS协议运行机制的概述](http://www.ruanyifeng.com/blog/2014/02/ssl_tls.html)
* [详解https是如何确保安全的](http://www.wxtlife.com/2016/03/27/%E8%AF%A6%E8%A7%A3https%E6%98%AF%E5%A6%82%E4%BD%95%E7%A1%AE%E4%BF%9D%E5%AE%89%E5%85%A8%E7%9A%84%EF%BC%9F/)
* [TLS 握手优化详解](https://imququ.com/post/optimize-tls-handshake.html)


