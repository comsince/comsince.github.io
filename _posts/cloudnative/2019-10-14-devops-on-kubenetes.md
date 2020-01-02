---
layout: post
title: "基于K8s的DevOps实践[编辑中]"
description: docker IM cloud native
category: cloud-native
---

K8S的容器编排技术逐渐成熟，越来越多的应用逐渐迁移到k8s上部署，k8s成功将DevOps与运行平台完美结合，这是前所未有的改变，DevOps与k8s的巨大融合为应用开发，测试，部署提供标准的自动流程，促进应用快速落地

## 开源技术
**NOTE:** 本文将采用[猪齿鱼开源多云集成平台](https://gitee.com/choerodon/)作为基础说明各个阶段使用的开源技术，在此对此开源项目表示感谢

### Helm
在[支持k8s集群部署的分布式即时聊天系统](https://www.comsince.cn/2019/09/25/universe-push-k8s/)采用的时基于yaml部署方式，这种方式导致yaml过多，维护复杂

#### Helm简介

利用Kubernetes部署一个应用，需要Kubernetes原生资源文件如deployment、replicationcontroller、service或pod 等。而对于一个复杂的应用，会有很多类似上面的资源描述文件，如果有更新或回滚应用的需求，可能要修改和维护所涉及的大量资源文件，且由于缺少对发布过的应用版本管理和控制，使Kubernetes上的应用维护和更新等面临诸多的挑战，而Helm可以帮我们解决这些问题。

Helm有三个重要概念：

* chart：包含了创建Kubernetes的一个应用实例的必要信息
* config：包含了应用发布配置信息
* release：是一个chart及其配置的一个运行实例

#### helm 安装
安装详见[Helm部署](https://choerodon.io/zh/docs/installation-configuration/steps/helm/)
#### helm chart说明
helm chart是开发过程中需要了解的基本的概念，需要清楚其基本细节方能对其进行编写，如下：
```shell
[root@node1 ~]# tree mychart/
mychart/
├── charts
├── Chart.yaml
├── templates
│   ├── deployment.yaml
│   ├── _helpers.tpl
│   ├── ingress.yaml
│   ├── NOTES.txt
│   ├── service.yaml
│   └── tests
│       └── test-connection.yaml
└── values.yaml

```

##### Helm 模板之内置函数和Values 
利用内置对象读取参数，values参数进行自定义修改参数值

##### Helm 模板之模板函数与管道
* 模板函数  
对参数进行一定的函数转换
* 管道  
模板语言除了提供了丰富的内置函数之外，其另一个强大的功能就是管道的概念。和UNIX中一样，管道我们通常称为Pipeline，是一个链在一起的一系列模板命令的工具，以紧凑地表达一系列转换。简单来说，管道是可以按顺序完成一系列事情的一种方法。 
* default 函数  
另外一个我们会经常使用的一个函数是default 函数：default DEFAULT_VALUE GIVEN_VALUE。该函数允许我们在模板内部指定默认值，以防止该值被忽略掉了

##### Helm 模板之控制流程
控制流程为我们提供了控制模板生成流程的一种能力，Helm 的模板语言提供了以下几种流程控制：
* if/else 条件块
* with 指定范围
* range 循环块

除此之外，它还提供了一些声明和使用命名模板段的操作：

* define在模板中声明一个新的命名模板
* template导入一个命名模板
* block声明了一种特殊的可填写的模板区域

##### Helm模板之命名模板
实现yaml配置可重复利用，避免重复声明，并且使用_help.tpl集中存放命名模板
* 声明和使用命名模板
* 模板范围
* include 函数  
include函数中使用indent处理空格


### Gitlab

gitlab包括代码托管与持续集成工具，gitlabRunner，帮助实现一次提交，自动化编译，测试，发布的功能，这些都依赖CI工具

#### gitlab CI
* [GitLab CI介绍——入门篇](https://juejin.im/post/5d3eb115e51d4561bf462000)
在项目仓库中的根目录加入`.gitlab-ci.yml`配置文件，告诉gitlab Runner如何执行后续的操作，这些配置使用yaml文件格式，ci的一些重要特性也依赖yaml配置文件特性

* [YAML 语言教程](http://www.ruanyifeng.com/blog/2016/07/yaml.html)

**NOTE:** 如下一段`.gitlab-ci.yml`的配置。在这段配置中说明基于yaml锚点与引用的使用，这些都是yaml本身的特性。这里时结合`gitlab ci hidden keys`来实现的

```yaml
image: registry.cn-hangzhou.aliyuncs.com/choerodon-tools/cibase:0.8.0

stages:
  - build
  - release

build:
  stage: build
  script:
    - update_pom_version
    - mvn package spring-boot:repackage
    - mv target/app.jar $PWD/docker
    - kaniko -c $PWD/docker -f $PWD/docker/Dockerfile -d ${DOCKER_REGISTRY}/${GROUP_NAME}/${PROJECT_NAME}:${CI_COMMIT_TAG}

release:
  stage: release
  script:
    - chart_build
##这里&auto_devops定义锚点，以便于befroe_script引用
.auto_devops: &auto_devops |
  http_status_code=`curl -o .auto_devops.sh -s -m 10 --connect-timeout 10 -w %{http_code} "${CHOERODON_URL}/devops/ci?token=${Token}&type=microservice"`
  if [ "$http_status_code" != "200" ]; then
    cat .auto_devops.sh
    exit 1
  fi
  source .auto_devops.sh

before_script:
  - *auto_devops

```

## 技术实现

### 微服务框架
#### 注册中心
测试使用Euraka注册中心
#### 服务网关
基于zuul实现的过滤，过滤中包括对权限的验证

### OAuthServer
#### 基础概念
* [OAuth2.0 RFC](https://tools.ietf.org/html/rfc6749) oauth是协议，重点理解各种授权机制的协议流程
* [理解OAuth 2.0](http://www.ruanyifeng.com/blog/2014/05/oauth_2_0.html)
* [从零开始的Spring Security Oauth2](http://blog.didispace.com/spring-security-oauth2-xjf-1/)
理解oauth的关键概念是理解spring security Oauth的关键，在实际的代码配置中，关键概念将会引导你进行如何配置

**NOTE:** 授权码模式,密码模式，在获取token时需要加上base认证，即是加上`client_id`,`client_secret`
* [Spring Boot Security OAuth2 Example(Bcrypt Encoder)](https://www.devglan.com/spring-security/spring-boot-security-oauth2-example)

> 代码示例，此代码可以清除知道使用jwt与不使用jwt的配置方法与区别

* [Sample for Spring Security OAuth2 with JWT tokens](https://github.com/habuma/spring-security-oauth2-jwt-example)

#### 授权成功后，如何进行后续身份认证

权限认证是通过网关做前置校验，并没有使用spring security的基于表达式的权限认证

### Devops服务流程