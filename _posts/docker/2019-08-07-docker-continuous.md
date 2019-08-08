---
layout: post
title: "基于Docker的即时通讯系统的持续集成发布说明"
description: docker IM
category: docker
---

本文以[universe-push](https://github.com/comsince/universe_push)即时通讯系统说明Docker的应用场景,说明该项目使用持续集成工具进行编译，发布到本地执行部署的完整步骤

# Docker Hub
## 推送本地镜像到docker hub
### 登录
```shell
docker login
Login with your Docker ID to push and pull images from Docker Hub. If you don't have a Docker ID, head over to https://hub.docker.com to create one.
Username: comsince
Password: 
WARNING! Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded
```

### 推送到Docker hub

**NOTE:** docker push 注册用户名/镜像名 ，推送的时候的确比较慢

```shell
The push refers to repository [docker.io/comsince/push-connector]
44b02495f384: Pushing [=>                                                 ]  1.083MB/53.36MB
73ad47d4bc12: Mounted from library/java 
c22c27816361: Mounted from library/java 
44b02495f384: Pushing [==>                                                ]  2.754MB/53.36MB
500ca2ff7d52: Mounted from library/java 
782d5215f910: Mounted from library/java 
0eb22bfb707d: Mounted from library/java 
a2ae92ffcd29: Mounted from library/java 
```


## 参考资料
* [Docker镜像推送（push）到Docker Hub](https://blog.csdn.net/boonya/article/details/74906927)

# Travis CI
对工程进行配置以支持自动编译，镜像自动发布到Docker Hub

## 加密环境变量说明

```shell
~$ travis encrypt DOCKER_USER=comsince
Detected repository as comsince/universe_push, is this correct? |yes| yes
Please add the following to your .travis.yml file:

  secure: "XxgNQunkxqdGnEOz96SoXhKbonkzOsvV0kZpakqyEwBYtVZim80M0ncUgF+yp1HK9w6MKin7BIZEXcAPWuK4POFJeKZxOMR+tv0veHw5N3PA85XY3tB/0FUtjfYmV8lZdLmpNwMlobYL6P9hFoS83tsYlT4edcV7OkSkz3zY5EuqbBFmu961sPCWw0mUQlkMHTVzhryuod/TlDjCMNq9afn1GqrYC7/8rh7m28KGoz9R5ZMSdDaGxdJ6dDFs2EombpeswEEU55gziQ0PmMwAyZOg5eE2xvep9QflDbsTFsw7isp67vHcstRaHjwHZK22qtuCJnk5VlLieAPQQ1TEjzDrqJftOkk3uHRusTGy4RNlQbTwnb2Zh9CmnhYMw05sPC0mgATeyDCDEqg1iR+lsCMA5N0hZ4APfPqXOrGbXNKv4lzrD/D33BIPosNJZgY9dDNg+imFhSILf+m6n4JpotymkNLiFwXv7P2wBNP2waRsSApTEOab2Raul29H8RNikUAQsJuV+0JDAv6C9hwlDo49SWpZ/lVol/l5jYnPc32rh0/nxjd7XeQPF2SdxcRViGGuTD8X8kuHRwdLQYltIahmRy9S9GXb8cDy02LUAi8NsqmNLUvh99LDNzRWKJbAmokG5TDS1M+9kNgU1iThv4G9UfOgqKV0DTB9f71L6mw="

```

## yml完整配置文件

```yml
sudo: required

services:
  - docker

language: java
jdk: oraclejdk8

env:
  global:
    - secure: "p0vozXSxltVDJlWZXoU9x263775HMYI6mHJTYx1nn29/H1/88VoPh4xLSWPVO/G0of128rkxj6I18+mkVS77Yk7wRPR23qMQ8gb8CikD94C5dlmuT5KNZY6xuaQZ5951CNZqfno3L+L7enKrAozoe+mRAcAzFOJSGwmqcMiHA8V+aEnXjFtiSS4NoEXmkHkYtv7ay5ydZeRUP23xGgz9RCt8GjQRf17fcejRUcjk4J7OMrWFhnb7pzdo9LOtlta0yAQFJNMYtAK3qm072QI+yxKdCIj0fV145x06WS4Cci3eloaj4mGLHzLHlEmdpw6Edi/t6p3V1DYcvE9hb830AxGJrdgilFVmNP5W0qnv7ZkRPASBZ1inr8NQI+E7P8YO2RUu76nqQprq2IvVLO4SjfRm7sdXty6LdA1p1NafazMpofYZkWibZzzdcRu0tbsrB/grN/vfIkdoMycn46xgHrdOGyia5JqDB6KCN8Dcyr5t8h+/1ZIrQpZ9vklght9c/6e6vo23+9Aepuctg/R+DrHSnnegxcZbQtr5V9RWtQsFGRtd5ZcwZzu/70V2/vBOGl763kZ+qNHxVrp9EAYj4eRnFDQEnYTIZKfzJpUKQJzIpiSLOM6mGJPufsrOONnzy9WpAaSC669Blw/XalXdympsg6Q2fYBDXHPlpAP46l0=" # DOCKER_EMAIL
    - secure: "XxgNQunkxqdGnEOz96SoXhKbonkzOsvV0kZpakqyEwBYtVZim80M0ncUgF+yp1HK9w6MKin7BIZEXcAPWuK4POFJeKZxOMR+tv0veHw5N3PA85XY3tB/0FUtjfYmV8lZdLmpNwMlobYL6P9hFoS83tsYlT4edcV7OkSkz3zY5EuqbBFmu961sPCWw0mUQlkMHTVzhryuod/TlDjCMNq9afn1GqrYC7/8rh7m28KGoz9R5ZMSdDaGxdJ6dDFs2EombpeswEEU55gziQ0PmMwAyZOg5eE2xvep9QflDbsTFsw7isp67vHcstRaHjwHZK22qtuCJnk5VlLieAPQQ1TEjzDrqJftOkk3uHRusTGy4RNlQbTwnb2Zh9CmnhYMw05sPC0mgATeyDCDEqg1iR+lsCMA5N0hZ4APfPqXOrGbXNKv4lzrD/D33BIPosNJZgY9dDNg+imFhSILf+m6n4JpotymkNLiFwXv7P2wBNP2waRsSApTEOab2Raul29H8RNikUAQsJuV+0JDAv6C9hwlDo49SWpZ/lVol/l5jYnPc32rh0/nxjd7XeQPF2SdxcRViGGuTD8X8kuHRwdLQYltIahmRy9S9GXb8cDy02LUAi8NsqmNLUvh99LDNzRWKJbAmokG5TDS1M+9kNgU1iThv4G9UfOgqKV0DTB9f71L6mw=" # DOCKER_USER
    - secure: "QBc52CAwpC6SD6+uv6AAQ0ZimaUr0Cqs0PGMVsvWXxU3mxX+eYElhdi12wmHSLpyr1p+nbG6x/jHxrj8C8S6S1N+zUamWTkxlUyCgNB/qa4uVrPy8oL8HbXTcHSDZZfZNE8Isd4JRn3sLUD80bbvE0Nt7hB8AQZ0WcIneMtCgth24fn9tBLEQxbrn3NYBwwW17OaumRyyr0seKxpC8IVd9uHym+E3B5P8eb6HqP314Qdh3Ykl1FA/GRRU6zV4UJ9RzlWNZhsEIjhPn3TVQMBEb505F6gZ17A9303zwzZO/5wIuzfvfooHdX5GFHHvVaI86YHFdOrCQSMwL+Wg+JRcJSXgMB0Sct7KRiX51auzxk2tDcTuLQPogIce02puEyKeXtfBPtvtd9CXChzGRY+bxgcHXmlAGeMisCA18oGk+RAJkfNnSJaym/rxBcFw2u2zpTv7Pd9VS22OHSgE/kEgpAhh9DZEpf9Dyh7QcqR7k0vwWPpG8SpGDrIEl2K7B+KjeHj+QjzlQSUQR4+XDCYcKDEclCHh8qMtdfUCJXXYI1jLrNseMPS7LhP8vIcBDz9BTykRxG3x7hEu0yWtFPi8asbtSnboWqUsI5PRdXA5opgO/bWBAcG2y7wWcV4KfArsLpO864qEQ1YgfJ/8syiVoyHjPNmN3WSo8N5IEzIOCc=" # DOCKER_PASS
    - COMMIT=${TRAVIS_COMMIT::7}

after_success:
  - docker login -u $DOCKER_USER -p $DOCKER_PASS

  #TAG
  - export TAG=`if [ "$TRAVIS_BRANCH" == "master" ]; then echo "latest"; else echo $TRAVIS_BRANCH ; fi`

  # push connector
  - export CONNECTOR=comsince/push-connector
  - docker build -t $CONNECTOR:$COMMIT ./spring-boot-dubbo-push-connector
  - docker tag $CONNECTOR:$COMMIT $CONNECTOR:$TAG
  - docker push $CONNECTOR

  # push group
  - export GROUP=comsince/push-group
  - docker build -t $GROUP:$COMMIT ./spring-boot-web-push-group
  - docker tag $GROUP:$COMMIT $GROUP:$TAG
  - docker push $GROUP
```

## Docker Hub查看
在每一次提交变更就会自动触发编译，上传最新的镜像到Docker Hub，如下图：
![image](/images/docker/docker-hub-image.png)

## 参考文档
* [Encrypting environment variables](https://docs.travis-ci.com/user/environment-variables/#encrypting-environment-variables)
* [持续集成服务 Travis CI 教程](http://www.ruanyifeng.com/blog/2017/12/travis_ci_tutorial.html)


# 从Docker Hub下载镜像发布IM系统

## 清除无用的Container

```shell
~$ docker container prune
WARNING! This will remove all stopped containers.
Are you sure you want to continue? [y/N] y
Deleted Containers:
95ff2a023c22d193e152ee3218f13580249d67bff2a258fa2bc05707cd639090
91dcfbdc6c80f3885fb17888a6e69741bcd8d72a0b6f038abb0f497004fd5c2f
ea077a788be0a271ecf2c45c1cbc0a6d9a321e51e53444919f5edf3b8a9ceedf
6ba0793c126de42a935b7654b80a1c7cba2e8c5eb60e77a35b00656af2ef4194

Total reclaimed space: 973kB
```

## 清除本地安装的IM镜像

```shell
~$ docker image rm comsince/push-connector
Untagged: comsince/push-connector:latest
Deleted: sha256:222ab60e0337ddc530a334fbee160809626ac4834d2e5de0edef846ec163eed8
Deleted: sha256:fbb138f2a5d9088a82d7147bbb0e7d09c5e00f1731fd3e3662514bf8977f9152
Deleted: sha256:7cc9b5dd559678da90450db0467cd0ee594c7a8d39404da25a533db19f094c6d
Deleted: sha256:69f29435335f24561ec99f24df90b584183c185fb8b586df8243380d6413f97a

~$ docker image rm comsince/push-group
Untagged: comsince/push-group:latest
Deleted: sha256:2ded5e02be6df2f9e8b2eab1da84074f84e3264cdce16df7032287398eed138f
Deleted: sha256:d3a5bfabb079d5fc6cfdb50065271234531a42229262f76c255a1412274c49c7
Deleted: sha256:39982f7ff55b21024d9275f42bdbfa8b202fe92337f0c8d05c48d9ddc260bbf2
Deleted: sha256:74928c636457155f3fb833a04bf3b357e9c605d07c2680b8eab93c7563d722ff
```

**NOTE:** 如果你从未在开发模式安装过以上镜像，可以忽略以上两步

## 启动镜像发布服务

* 进入到`universe_push`根目录，其目录下有一个`docker-compose.yml`的文件，`docker-composer`将会默认使用其进行服务发布

```shell
# 前台运行
docker-compose up
# 后台运行
docker-compose up -d
```

* docker-compose会检查镜像是否存在，如果不存在会从`Docker Hub`自动下载，就是我们上边已经发布到`Docker Hub`的镜像

**NOTE:** 启动过程中，可能出现mysql链接失败的报错，这是`push-group`需要依赖mysql服务，待mysql启动成功后，就正常了

## 查看日志
* 进入`push-connector`容器中查看日志

```shell
# 列出当前容器列表
~$ docker container ls
CONTAINER ID        IMAGE                     COMMAND                  CREATED             STATUS              PORTS                                                  NAMES
62030889169d        comsince/push-connector   "java -Xmx300m -jar …"   13 minutes ago      Up 19 seconds       0.0.0.0:6789->6789/tcp                                 universe_push_push-connector_1
44e6ca990c5e        comsince/push-group       "java -Xmx300m -jar …"   13 minutes ago      Up 21 seconds       0.0.0.0:7463->7463/tcp, 0.0.0.0:8081->8081/tcp         universe_push_push-group_1
dc05b02bacc3        zookeeper:3.5.5           "/docker-entrypoint.…"   13 minutes ago      Up 23 seconds       2888/tcp, 3888/tcp, 0.0.0.0:2181->2181/tcp, 8080/tcp   universe_push_zookeeper_1
bd66d9ec44e6        mysql:5.7                 "docker-entrypoint.s…"   13 minutes ago      Up 24 seconds       0.0.0.0:3306->3306/tcp, 33060/tcp                      universe_push_mysql_1


# 查看容器最近10条日志
~$ docker logs -f --tail 10 620
10:22:44.366 INFO  [tio-group-59] [com.comsince.github.PushPacket]  - readableLength 22 neededLength 22 isDataEnough 0
10:22:44.366 INFO  [tio-group-59] [com.comsince.github.handler.PushMessageHandler]  - handle signal :PUBLISH
10:22:44.366 INFO  [tio-group-59] [com.comsince.github.process.MessageDispatcher]  - start handleMessage PUBLISH
10:22:44.367 INFO  [pool-6-thread-8] [com.comsince.github.handler.im.IMHandler]  - imHandler fromUser=UXUfUfKK, clientId=bccdb58cfdb34d861562827329475, topic=MP
10:22:44.385 INFO  [pool-6-thread-8] [com.comsince.github.handler.im.IMHandler]  - User UXUfUfKK pull message with count(1), payload size(78)
10:22:44.386 INFO  [pool-6-thread-8] [com.comsince.github.handler.PublishMessageHandler]  - handle message errorcode ERROR_CODE_SUCCESS
10:22:44.386 INFO  [pool-6-thread-8] [com.comsince.github.handler.PublishMessageHandler]  - clientId bccdb58cfdb34d861562827329475 messagId 2231 send PUB_ACK message size 79 subSignal MP
10:22:44.386 INFO  [pool-6-thread-8] [org.tio.core.Tio]  - sendToBsId channelContext true
10:22:44.386 INFO  [pool-6-thread-8] [com.comsince.github.handler.PublishMessageHandler]  - send client bccdb58cfdb34d861562827329475 message size 79 sucess
10:22:44.386 INFO  [tio-group-60] [com.comsince.github.handler.PushConnectorListener]  - onAfterSent client:172.29.228.169:42158 bsId bccdb58cfdb34d861562827329475 sendSuccess true
```