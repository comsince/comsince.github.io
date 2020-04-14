---
layout: wiki
title: "【高性能服务器】- Nginx"
categories: [开发框架]
description: Spring容器
keywords: Spring Ioc
---


# 安装依赖包

```shell
sudo apt-get install libpcre3 libpcre3-dev  zlib1g-dev  openssl

```

# 编译

```shell
cd /usr/local/src
wget http://nginx.org/download/nginx-1.4.2.tar.gz
tar -zxvf nginx-1.4.2.tar.gz
cd nginx-1.4.2
 

# 安装tcp反向代理模块 
./configure  --prefix=/usr/local/nginx --with-stream --with-http_ssl_module
make
make install
```


# 配置stream

> 注意这个模块与http是同级的，不要配置到http模块里面了,TCP长连接只需要下面精简配置就行，多了反而nginx与客户端无法保持链接

```
stream {
    upstream push-connector {
        hash $remote_addr consistent;
        server 172.16.177.107:6789 weight=1 max_fails=3 fail_timeout=30s;
        server 172.16.176.23:6789 weight=1 max_fails=3 fail_timeout=30s;
        server 172.16.176.25:6789 weight=1 max_fails=3 fail_timeout=30s;
    }
    server {
        listen 9945;
        proxy_pass push-connector;
    }
}


```


# 测试

```shell
sudo /usr/local/nginx    #启动
或
sudo /usr/local/nginx -c /usr/local/nginx.conf
sudo /usr/local/nginx -t #检测配置文件是否正确 
sudo /usr/local/nginx -s stop #停止 
sudo /usr/local/nginx -s reload #重载配置文件
```

# 免费的证书

[【Nginx】使用certbot安装免费https证书使Nginx支持Https请求](https://www.cnblogs.com/756623607-zhang/p/11638506.html)

# 参考资料

* [在Ubuntu上编译安装Nginx](https://vsxen.github.io/2017/04/09/nginx-sourse-compile-on-ubuntu/)
* [Nginx 配置TCP代理](https://www.cnops.xyz/archives/1315)