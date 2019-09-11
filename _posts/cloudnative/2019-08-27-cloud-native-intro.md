---
layout: post
title: "云原生-微服务未来发展"
description: docker IM cloud native
category: cloud-native
---

技术推进总是在不断总结前面已有的基础上不断完善，知识的结构也会越来越清晰，越来越多的业务会伴随着微服务技术的成熟而不断衍生出来。技术的演进是由规律可循的，下一代技术的提升
也是在总结前面的经验基础上形成一种标准，从主机托管到虚拟机技术成熟在到容器技术不断发展，一切技术的演进总是在解决一个问题，不断将问题的解决方案抽象出来不断的下沉到基础系统
尽量减少开发者技术难度，不断聚焦需要提升的业务，从而使众多传统公司向互联网转型。

# 什么是云

## 基于虚拟机的云计算
![image](https://skyao.io/learning-cloudnative/introduction/images/cloud-history-3.png)
## 基于容器的编排大战
![image](https://skyao.io/learning-cloudnative/introduction/images/cloud-history-4.png)
# 什么是原生

## 云原生
### CNCF定义
* 应用容器化(software stack to be Containerized)
* 面向微服务架构(Microservices oriented)
* 应用支持容器的编排调度(Dynamically Orchestrated)

云原生包含了一组应用的模式，用于帮助企业快速，持续，可靠，规模化地交付业务软件。云原生由微服务架构，DevOps 和以容器为代表的敏捷基础架构组成。援引宋净超同学的一张图片来描述云原生所需要的能力与特征
![image](https://skyao.io/learning-cloudnative/introduction/images/cloud-native-definition-cncf-original.png)

* 新的定义
![image](https://skyao.io/learning-cloudnative/introduction/images/cloud-native-cncf-new-definition.png)

## 技术实现变迁

### 最初的网络计算机交互
![image](https://static001.infoq.cn/resource/image/09/74/090582484a744fa1cd9b2ea1c4671474.png)

### 微服务出现
应用封装类库的方式集成与业务无关的逻辑,即是SOA服务实现
![image](https://static001.infoq.cn/resource/image/03/18/03188c6719267ad14d884004ae9eb518.png)

### 微服务框架分离
在开发微服务时也是类似的，工程师们聚焦在业务逻辑上，不需要浪费时间去编写服务基础设施代码或管理系统用到的软件库和框架。

![image](https://static001.infoq.cn/resource/image/a3/4d/a3d89ea2f9729a313af93c832912cd4d.png)

### SiderCar
![image](https://static001.infoq.cn/resource/image/df/c4/df38768795a3d138fe4d167f485952c4.png)

### 服务网格
在这样的模型里，每个服务都会有一个边车代理与之配对。服务间通信都是通过边车代理进行的，于是我们就会得到如下的部署图。

![image](https://static001.infoq.cn/resource/image/c4/84/c457de10e1e2d7f7ee8910506590cc84.png)

## 云原生带来什么
技术从来都不是突然出现，总是在不断积累前面的经验产生的。云计算厂商不断跟随不断促进云原生的进步，是因为云原生所构建的生态，越来越让云计算厂商处于一个优势地位，让这些成为开发的基础设施，形成一种统一的规范，这样更有利于平台的建设。云原生可以让开发者从以前租赁虚拟机变成只需要关注云计算平台提供的服务，使这种服务更加标准，从而使DevOps更加标准化，从开发，测试，发布整个流程形成一个闭环，使开发者不用离开平台即可走完整个开发流程，极大加快了软件的开发，帮助云计算厂商收敛服务，提供标准化服务。

* 以下基于SOA服务化的项目架构

![image](https://www.kuboard.cn/assets/img/image-20190731230110206.fbb88459.png)
**NOTE:** 该图的左侧是 DevOps 平台，涵盖构建、测试、包管理、部署及运维、监控及评估。右侧是运行时平台，分成互联网层、展现层、微服务层、数据层。k8s成功将DevOps与运行平台完美结合，这是前所未有的改变

# 云原生技术索引
这里依据云原生所需要的技术，逐一描述各个技术解决的问题
## Docker
### Docker基础
* 镜像与容器的基本操作
* Dockerfile 定制镜像
* 镜像仓库
* 数据共享与持久化
* Docker网络模式

### Docker生态组件
* docker-compose

### 参考资料
* [Docker从入门到实践](https://yeasy.gitbooks.io/docker_practice/introduction/what.html)

## kubenetes
容器编排工具，已经成为事实标准
### POD
理解kubenetes的对象，进而正确使用yaml配置
* pod hook
* pod健康检查
* 初始化容器

### 常用资源对象操作
* Deployment 
* Job
* HPA pod 自动扩容与缩容
* Service
* ConfigMap
* RBAC
* StatefulSet

### 持久化存储
主要针对由状态应用需要持久化存储数据，防止扩容缩容时数据丢失导致状态不一致的情况
* PV  
PersistentVolume（持久化卷），是对底层的共享存储的一种抽象，PV 由管理员进行创建和配置，它和具体的底层的共享存储技术的实现方式有关，比如 Ceph、GlusterFS、NFS 等，都是通过插件机制完成与共享存储的对接。
* PVC  
PersistentVolumeClaim（持久化卷声明），PVC 是用户存储的一种声明，PVC 和 Pod 比较类似，Pod 消耗的是节点，PVC 消耗的是 PV 资源，Pod 可以请求 CPU 和内存，而 PVC 可以请求特定的存储空间和访问模式。对于真正使用存储的用户不需要关心底层的存储实现细节，只需要直接使用 PVC 即可。
* StorageClass  
动态创建Pv

### 服务发现
kubenetes集群内部通过服务名自动实现域名地址解析
* kubeDNS,CoreDNS 注意域名命令规则
* Ingress 

# DevOps实践
kubenetes容器编排加快应用自动化构建，发布，从而为持续集成，持续发布提供基础设施，弄清楚在这个过程中所涉及的问题，就能理解以下组件在各个阶段的作用

## Helm简介
利用Kubernetes部署一个应用，需要Kubernetes原生资源文件如deployment、replicationcontroller、service或pod 等。而对于一个复杂的应用，会有很多类似上面的资源描述文件，如果有更新或回滚应用的需求，可能要修改和维护所涉及的大量资源文件，且由于缺少对发布过的应用版本管理和控制，使Kubernetes上的应用维护和更新等面临诸多的挑战，而Helm可以帮我们解决这些问题。

 Helm有三个重要概念：

* chart：包含了创建Kubernetes的一个应用实例的必要信息
* config：包含了应用发布配置信息
* release：是一个chart及其配置的一个运行实例


### helm安装

* [helm简介、安装、使用](https://johng.cn/helm-brief/)

```
helm install c7n/nfs-client-provisioner \
    --set rbac.create=true \
    --set persistence.enabled=true \
    --set storageClass.name=nfs-provisioner \
    --set persistence.nfsServer=node1 \
    --set persistence.nfsPath=/u01/prod \
    --version 0.1.0 \
    --name nfs-client-provisioner \
    --namespace kube-system
```
                
* Chartmuseum

```shell
helm install c7n/chartmuseum \
    --set service.enabled=true \
    --set persistence.enabled=true \
    --set persistence.existingClaim=chartmuseum-pvc \
    --set ingress.enabled=true \
    --set ingress.hosts=chart.example.comsince.cn \
    --set env.open.DISABLE_API=false \
    --set env.open.DEPTH=2 \
    --version 1.6.1 \
    --name chartmuseum \
    --namespace c7n-system

```

* mino

```shell
helm install c7n/minio \
    --set service.enabled=true \
    --set persistence.enabled=true \
    --set persistence.existingClaim=minio-pvc \
    --set env.open.MINIO_ACCESS_KEY=admin \
    --set env.open.MINIO_SECRET_KEY=password \
    --set ingress.enabled=true \
    --set ingress.hosts=minio.example.comsince.cn \
    --set image.tag=RELEASE.2019-03-27T22-35-21Z \
    --version 0.1.0 \
    --name minio \
    --namespace c7n-system

```


* habor

```shell
helm install c7n/harbor \
    --set expose.ingress.hosts.core=registry.example.comsince.cn \
    --set externalURL=https://registry.example.comsince.cn \
    --set persistence.persistentVolumeClaim.registry.storageClass=nfs-provisioner \
    --set persistence.persistentVolumeClaim.jobservice.storageClass=nfs-provisioner \
    --set persistence.persistentVolumeClaim.database.storageClass=nfs-provisioner \
    --set persistence.persistentVolumeClaim.redis.storageClass=nfs-provisioner \
    --set chartmuseum.enabled=false \
    --set clair.enabled=false \
    --set notary.enabled=false \
    --set harborAdminPassword=Harbor12345 \
    --version 1.1.1 \
    --name harbor \
    --namespace c7n-system
```

* gitlab 

```shell
helm install c7n/gitlab \
    --set persistence.enabled=true \
    --set persistence.existingClaim=gitlab-pvc \
    --set env.config.GITLAB_EXTERNAL_URL=http://gitlab.example.comsince.cn \
    --set env.config.GITLAB_TIMEZONE=Asia/Shanghai \
    --set env.config.CHOERODON_OMNIAUTH_ENABLED=false \
    --set env.config.GITLAB_DEFAULT_CAN_CREATE_GROUP=true \
    --set env.config.DB_ADAPTER=postgresql \
    --set env.config.DB_HOST=gitlab-postgresql-postgresql.c7n-system.svc \
    --set env.config.DB_PORT=5432 \
    --set env.config.DB_USERNAME=postgres \
    --set env.config.DB_PASSWORD=password \
    --set env.config.DB_DATABASE=gitlabhq_production \
    --set env.config.REDIS_HOST=gitlab-redis.c7n-system.svc \
    --set env.config.SMTP_ENABLE=false \
    --set env.config.SMTP_ADDRESS=smtp.mxhichina.com \
    --set env.config.SMTP_PORT=465 \
    --set env.config.SMTP_USER_NAME=git.sys@example.choerodon.io \
    --set env.config.SMTP_PASSWORD=password \
    --set env.config.SMTP_DOMAIN=smtp.mxhichina.com \
    --set env.config.SMTP_AUTHENTICATION=login \
    --set env.config.GITLAB_EMAIL_FROM=git.sys@example.choerodon.io \
    --set env.config.SMTP_ENABLE_STARTTLS_AUTO=true \
    --set env.config.SMTP_TLS=true \
    --set env.config.PROMETHEUS_ENABLE=false \
    --set env.config.NODE_EXPORTER_ENABLE=false \
    --set env.config.UNICORN_WORKERS=3 \
    --set env.config.UNICORN_TIMEOUT=60 \
    --set service.enabled=true \
    --set service.ssh.nodePort=32222 \
    --set ingress.enabled=true \
    --version 0.5.0 \
    --name gitlab \
    --namespace c7n-system
```


## 微服务开发框架

* manager service

```shell
helm install c7n/manager-service \
    --set preJob.preInitDB.datasource.url="jdbc:mysql://c7n-mysql.c7n-system.svc:3306/manager_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
    --set preJob.preInitDB.datasource.username=choerodon \
    --set preJob.preInitDB.datasource.password=password \
    --set env.open.SPRING_DATASOURCE_URL="jdbc:mysql://c7n-mysql.c7n-system.svc:3306/manager_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
    --set env.open.SPRING_DATASOURCE_USERNAME=choerodon \
    --set env.open.SPRING_DATASOURCE_PASSWORD=password \
    --set env.open.SPRING_CLOUD_CONFIG_URI="http://register-server.c7n-system:8000/" \
    --set env.open.CHOERODON_GATEWAY_DOMAIN="api.example.comsince.cn" \
    --set env.open.CHOERODON_SWAGGER_OAUTH_URL="http://api.example.comsince.cn/oauth/oauth/authorize" \
    --set env.open.EUREKA_CLIENT_SERVICEURL_DEFAULTZONE="http://register-server.c7n-system:8000/eureka/" \
    --set env.open.SPRING_REDIS_HOST=c7n-redis.c7n-system.svc \
    --set env.open.SPRING_REDIS_PORT=6379 \
    --set env.open.SPRING_REDIS_DATABASE=4 \
    --name manager-service \
    --version 0.18.0 \
    --namespace c7n-system
```


* notify service

```shell
helm install c7n/notify-service \
    --set preJob.preConfig.datasource.url="jdbc:mysql://c7n-mysql.c7n-system.svc:3306/manager_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
    --set preJob.preConfig.datasource.username=choerodon \
    --set preJob.preConfig.datasource.password=password \
    --set preJob.preInitDB.datasource.url="jdbc:mysql://c7n-mysql.c7n-system.svc:3306/notify_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
    --set preJob.preInitDB.datasource.username=choerodon \
    --set preJob.preInitDB.datasource.password=password \
    --set env.open.SPRING_DATASOURCE_URL="jdbc:mysql://c7n-mysql.c7n-system.svc:3306/notify_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
    --set env.open.SPRING_DATASOURCE_USERNAME=choerodon \
    --set env.open.SPRING_DATASOURCE_PASSWORD=password \
    --set env.open.EUREKA_CLIENT_SERVICEURL_DEFAULTZONE="http://register-server.c7n-system:8000/eureka/" \
    --set env.open.SPRING_CLOUD_CONFIG_ENABLED=true \
    --set env.open.SPRING_CLOUD_CONFIG_URI="http://register-server.c7n-system:8000/" \
    --set env.open.SPRING_REDIS_HOST=c7n-redis.c7n-system.svc \
    --set env.open.SPRING_REDIS_DATABASE=3 \
    --set service.enabled=true \
    --set service.name=notify-service \
    --set ingress.enabled=true \
    --set ingress.host=notify.example.comsince.cn \
    --name notify-service \
    --version 0.18.0 \
    --namespace c7n-system
```

* api-gateway

```shell
helm install c7n/api-gateway \
    --set preJob.preConfig.datasource.url="jdbc:mysql://c7n-mysql.c7n-system.svc:3306/manager_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
    --set preJob.preConfig.datasource.username=choerodon \
    --set preJob.preConfig.datasource.password=password \
    --set service.enabled=true \
    --set ingress.enabled=true \
    --set ingress.host=api.example.comsince.cn \
    --set env.open.EUREKA_CLIENT_SERVICEURL_DEFAULTZONE="http://register-server.c7n-system:8000/eureka/" \
    --set env.open.SPRING_CLOUD_CONFIG_ENABLED=true \
    --set env.open.SPRING_CLOUD_CONFIG_URI="http://register-server.c7n-system:8000/" \
    --set env.open.SPRING_DATASOURCE_URL="jdbc:mysql://c7n-mysql.c7n-system.svc:3306/iam_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
    --set env.open.SPRING_DATASOURCE_USERNAME=choerodon \
    --set env.open.SPRING_DATASOURCE_PASSWORD=password \
    --set env.open.SPRING_REDIS_HOST=c7n-redis.c7n-system.svc \
    --set env.open.SPRING_REDIS_PORT=6379 \
    --set env.open.SPRING_REDIS_DATABASE=4 \
    --set env.SPRING_CACHE_MULTI_L1_ENABLED=true \
    --set env.SPRING_CACHE_MULTI_L2_ENABLED=false \
    --name api-gateway \
    --version 0.18.1 \
    --namespace c7n-system

```


* oauth server

```shell
helm install c7n/oauth-server \
    --set preJob.preConfig.datasource.url="jdbc:mysql://c7n-mysql.c7n-system.svc:3306/manager_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
    --set preJob.preConfig.datasource.username=choerodon \
    --set preJob.preConfig.datasource.password=password \
    --set env.open.SPRING_DATASOURCE_URL="jdbc:mysql://c7n-mysql.c7n-system.svc:3306/iam_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
    --set env.open.SPRING_DATASOURCE_USERNAME=choerodon \
    --set env.open.SPRING_DATASOURCE_PASSWORD=password \
    --set env.open.SPRING_REDIS_HOST=c7n-redis.c7n-system.svc \
    --set env.open.SPRING_REDIS_DATABASE=7 \
    --set env.open.CHOERODON_DEFAULT_REDIRECT_URL="http://c7n.example.comsince.cn" \
    --set env.open.EUREKA_CLIENT_SERVICEURL_DEFAULTZONE="http://register-server.c7n-system:8000/eureka/" \
    --set env.open.SPRING_CLOUD_CONFIG_ENABLED=true \
    --set env.open.SPRING_CLOUD_CONFIG_URI="http://register-server.c7n-system:8000/" \
    --name oauth-server \
    --version 0.18.0 \
    --namespace c7n-system
```


* file service

```shell
helm install c7n/file-service \
    --set preJob.preConfig.datasource.url="jdbc:mysql://c7n-mysql.c7n-system.svc:3306/manager_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
    --set preJob.preConfig.datasource.username=choerodon \
    --set preJob.preConfig.datasource.password=password \
    --set env.open.MINIO_ENDPOINT="http://minio.example.comsince.cn" \
    --set env.open.MINIO_ACCESSKEY=admin \
    --set env.open.MINIO_SECRETKEY=password \
    --set env.open.EUREKA_CLIENT_SERVICEURL_DEFAULTZONE="http://register-server.c7n-system:8000/eureka/" \
    --set env.open.SPRING_CLOUD_CONFIG_ENABLED=true \
    --set env.open.SPRING_CLOUD_CONFIG_URI="http://register-server.c7n-system:8000/" \
    --name file-service \
    --version 0.18.1 \
    --namespace c7n-system
```

### 持续交付服务

* devops service

```shell
helm install c7n/devops-service \
    --set preJob.preConfig.datasource.url="jdbc:mysql://c7n-mysql.c7n-system.svc:3306/manager_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
    --set preJob.preConfig.datasource.username=choerodon \
    --set preJob.preConfig.datasource.password=password \
    --set preJob.preInitDB.datasource.url="jdbc:mysql://c7n-mysql.c7n-system.svc:3306/devops_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
    --set preJob.preInitDB.datasource.username=choerodon \
    --set preJob.preInitDB.datasource.password=password \
    --set env.open.SPRING_DATASOURCE_URL="jdbc:mysql://c7n-mysql.c7n-system.svc:3306/devops_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
    --set env.open.SPRING_DATASOURCE_USERNAME=choerodon \
    --set env.open.SPRING_DATASOURCE_PASSWORD=password \
    --set env.open.EUREKA_CLIENT_SERVICEURL_DEFAULTZONE="http://register-server.c7n-system:8000/eureka/" \
    --set env.open.SPRING_REDIS_HOST=c7n-redis.c7n-system.svc \
    --set env.open.SPRING_REDIS_DATABASE=11 \
    --set env.open.SPRING_CLOUD_CONFIG_ENABLED=true \
    --set env.open.SPRING_CLOUD_CONFIG_URI="http://register-server.c7n-system:8000/" \
    --set env.open.SERVICES_HARBOR_BASEURL="https://registry.example.comsince.cn" \
    --set env.open.SERVICES_HARBOR_USERNAME=admin \
    --set env.open.SERVICES_HARBOR_PASSWORD="Harbor12345" \
    --set env.open.SERVICES_HARBOR_INSECURESKIPTLSVERIFY="true" \
    --set env.open.SERVICES_HELM_URL="http://chart.example.comsince.cn" \
    --set env.open.SERVICES_GITLAB_URL="http://gitlab.example.comsince.cn" \
    --set env.open.SERVICES_GITLAB_SSHURL="gitlab.example.comsince.cn:32222" \
    --set env.open.SERVICES_GITLAB_PASSWORD=password \
    --set env.open.SERVICES_GITLAB_PROJECTLIMIT=100 \
    --set env.open.SERVICES_GATEWAY_URL=http://api.example.comsince.cn \
    --set env.open.SECURITY_IGNORED="/ci\,/webhook\,/v2/api-docs\,/agent/**\,/ws/**\,/webhook/**" \
    --set env.open.AGENT_VERSION="0.18.0" \
    --set env.open.AGENT_REPOURL="https://openchart.choerodon.com.cn/choerodon/c7n/" \
    --set env.open.AGENT_SERVICEURL="ws://devops.example.comsince.cn/agent/" \
    --set env.open.TEMPLATE_VERSION="0.17.0" \
    --set env.open.TEMPLATE_URL="https://github.com/choerodon/choerodon-devops-templates.git" \
    --set env.open.AGENT_CERTMANAGERURL="https://openchart.choerodon.com.cn/choerodon/infra/" \
    --set ingress.enabled=true \
    --set ingress.host=devops.example.comsince.cn \
    --set service.enabled=true \
    --set persistence.enabled=true \
    --set persistence.existingClaim="chartmuseum-pvc" \
    --name devops-service \
    --version 0.18.6 \
    --namespace c7n-system
```

* gitlab service

```shell
helm install c7n/gitlab-service \
    --set preJob.preConfig.datasource.url="jdbc:mysql://c7n-mysql.c7n-system.svc:3306/manager_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
    --set preJob.preConfig.datasource.username=choerodon \
    --set preJob.preConfig.datasource.password=password \
    --set preJob.preInitDB.datasource.url="jdbc:mysql://c7n-mysql.c7n-system.svc:3306/gitlab_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
    --set preJob.preInitDB.datasource.username=choerodon \
    --set preJob.preInitDB.datasource.password=password \
    --set env.open.SPRING_DATASOURCE_URL="jdbc:mysql://c7n-mysql.c7n-system.svc:3306/gitlab_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
    --set env.open.SPRING_DATASOURCE_USERNAME=choerodon \
    --set env.open.SPRING_DATASOURCE_PASSWORD=password \
    --set env.open.EUREKA_CLIENT_SERVICEURL_DEFAULTZONE="http://register-server.c7n-system:8000/eureka/" \
    --set env.open.SPRING_CLOUD_CONFIG_ENABLED=true \
    --set env.open.SPRING_CLOUD_CONFIG_URI="http://register-server.c7n-system:8000/" \
    --set env.open.GITLAB_URL="http://gitlab.example.comsince.cn" \
    --set env.open.GITLAB_PRIVATETOKEN="qfjWAri2xqyFifaFs4Zq" \
    --name gitlab-service \
    --version 0.18.1 \
    --namespace c7n-system
```

* workflow service

```shell
helm install c7n/workflow-service \
    --set preJob.preConfig.datasource.url="jdbc:mysql://c7n-mysql.c7n-system.svc:3306/manager_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
    --set preJob.preConfig.datasource.username=choerodon \
    --set preJob.preConfig.datasource.password=password \
    --set preJob.preInitDB.datasource.url="jdbc:mysql://c7n-mysql.c7n-system.svc:3306/workflow_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
    --set preJob.preInitDB.datasource.username=choerodon \
    --set preJob.preInitDB.datasource.password=password \
    --set env.open.SPRING_DATASOURCE_URL="jdbc:mysql://c7n-mysql.c7n-system.svc:3306/workflow_service?useUnicode=true&characterEncoding=utf-8&useSSL=false" \
    --set env.open.SPRING_DATASOURCE_USERNAME=choerodon \
    --set env.open.SPRING_DATASOURCE_PASSWORD=password \
    --set env.open.EUREKA_CLIENT_SERVICEURL_DEFAULTZONE="http://register-server.c7n-system:8000/eureka/" \
    --set env.open.SPRING_REDIS_HOST=c7n-redis.c7n-system.svc \
    --set env.open.SPRING_REDIS_DATABASE=11 \
    --set env.open.SPRING_CLOUD_CONFIG_ENABLED=true \
    --set env.open.SPRING_CLOUD_CONFIG_URI="http://register-server.c7n-system:8000/" \
    --name workflow-service \
    --version 0.18.0 \
    --namespace c7n-system
```

### 整合前端服务

* choerodon front

```shell
helm install c7n/choerodon-front \
    --set preJob.preConfig.db.host=c7n-mysql.c7n-system.svc \
    --set preJob.preConfig.db.port=3306 \
    --set preJob.preConfig.db.dbname=iam_service \
    --set preJob.preConfig.db.username=choerodon \
    --set preJob.preConfig.db.password=password \
    --set preJob.preConfig.db.enabledelete=true \
    --set preJob.preConfig.db.upattrs="sort\,parent_id" \
    --set env.open.PRO_API_HOST="api.example.comsince.cn" \
    --set env.open.PRO_DEVOPS_HOST="ws://devops.example.comsince.cn" \
    --set env.open.PRO_AGILE_HOST="http://minio.example.comsince.cn/agile-service/" \
    --set env.open.PRO_WEBSOCKET_SERVER="ws://notify.example.comsince.cn" \
    --set env.open.PRO_CLIENT_ID="choerodon" \
    --set env.open.PRO_TITLE_NAME="Choerodon" \
    --set env.open.PRO_HEADER_TITLE_NAME="Choerodon" \
    --set env.open.PRO_HTTP="http" \
    --set env.open.PRO_FILE_SERVER="http://minio.example.comsince.cn" \
    --set ingress.host="c7n.example.comsince.cn" \
    --set service.enabled=true \
    --set ingress.enabled=true \
    --name choerodon-front \
    --version 0.18.8 \
    --namespace c7n-system
```

```shell
helm install c7n/mysql-client \
    --set env.MYSQL_HOST=c7n-mysql.c7n-system.svc \
    --set env.MYSQL_PORT=3306 \
    --set env.MYSQL_USER=root \
    --set env.MYSQL_PASS=password \
    --set env.SQL_SCRIPT="\
            INSERT INTO iam_service.oauth_client (\
            name\,organization_id\,resource_ids\,secret\,scope\,\
            authorized_grant_types\,web_server_redirect_uri\,\
            access_token_validity\,refresh_token_validity\,\
            additional_information\,auto_approve\,object_version_number\,\
            created_by\,creation_date\,last_updated_by\,last_update_date)\
            VALUES('choerodon'\,1\,'default'\,'secret'\,'default'\,\
            'password\,implicit\,client_credentials\,authorization_code\,refresh_token'\,\
            'http://c7n.example.comsince.cn'\,3600\,3600\,'{}'\,'default'\,1\,0\,NOW()\,0\,NOW());" \
    --version 0.1.0 \
    --name c7n-front-client \
    --namespace c7n-system
```



# 参考资料

围绕云原生的话题出现各种开源项目，容器化技术成熟以及k8s成为容器编排事实标准，传统SOA向service mesh转变催生各种技术名词的诞生
* [畅谈云原生（上）：云原生应用应该是什么样子？](https://skyao.io/talk/201902-cloudnative-freely-talk/)
* [畅谈云原生（下）](https://skyao.io/talk/201902-cloudnative-freely-talk2/)
* [模式之服务网格](https://www.infoq.cn/article/pattern-service-mesh)
* [cloud-native学习笔记](https://skyao.io/learning-cloudnative/)
* [从Docker到Kubernetes进阶](https://www.qikqiak.com/k8s-book/)
