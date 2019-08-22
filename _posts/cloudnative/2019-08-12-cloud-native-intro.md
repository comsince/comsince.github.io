---
layout: post
title: "即时通讯服务在k8s容器的部署说明"
description: docker IM cloud native
category: cloud-native
---

本文主要说明云原生架构，kubenate相关概念，说明kubenate集群生产环境安装实践以及项目演示，本文以[universe-push](https://github.com/comsince/universe_push)作为分布式服务示例说明在部署过程中出现的问题以及解决方案

# Kubenetes 核心概念

## 容器运行时
* [Docker — 从入门到实践](https://yeasy.gitbooks.io/docker_practice/content/)

# 单步部署项目
以下为熟悉kubenate的基本原理与相关组件进行单步部署
* [ 和我一步步部署 kubernetes 集群 ](https://github.com/opsnull/follow-me-install-kubernetes-cluster)

# 基础项目
## Ansible
此项目用于复制系统部署，极大简化部署流程，是运维部署的重要工具  
* [Anisble-远程主机管理编排工具](http://getansible.com/)

### 核心概念
* ansible配置
* Host配置
* playbook基本结构
* include与role重用机制
* tags选择执行机制

## kubeadm-ansible
利用ansible编排工具实现kubeadmin自动部署kubenate，下面将安装此项目介绍kubenate部署的详细步骤与细节，[项目地址](https://github.com/choerodon/kubeadm-ansible)
### inventory
该配置说明环境部署的基本说明
```yaml
[all]
node1 ansible_host=192.168.56.11 ip=192.168.56.11 ansible_user=root ansible_ssh_pass=vagrant ansible_become=true
node2 ansible_host=192.168.56.12 ip=192.168.56.12 ansible_user=root ansible_ssh_pass=vagrant ansible_become=true
node3 ansible_host=192.168.56.13 ip=192.168.56.13 ansible_user=root ansible_ssh_pass=vagrant ansible_become=true

[kube-master]
node1
node2
node3

[etcd]
node1
node2
node3

[kube-node]
node1
node2
node3
```

### 执行playbook
一个项目下有一个yaml的配置代表执行脚本的入口，可以执行如下命令开始启动脚本
```shell
$ansible-playbook deploy.yml
```

## kubenete 环境部署及其依赖组件

## 基于kubeadm-ansible安装演示
这里只演示单节点的部署情况,具体安装步骤参考[kubenete-ansible-中文版本说明](https://github.com/choerodon/kubeadm-ansible/blob/v1.10.12/README_zh-CN.md)
### 安装ansible
pip安装ansible如果出现超时显示，可以换源`/usr/local/bin/pip3 install --no-cache-dir ansible==2.7.5 netaddr -i https://pypi.tuna.tsinghua.edu.cn/simple/`

```shell
[root@bogon kubeadm-ansible]# ansible-playbook -i inventory/hosts -e @inventory/vars cluster.yml

PLAY [kube-master:kube-node:etcd] **********************************************

TASK [base/variables : Set task variables] *************************************
Tuesday 13 August 2019  16:27:31 +0800 (0:00:00.128)       0:00:00.128 ******** 
ok: [node1] => {
    "msg": "Check roles/variables/defaults/main.yml"
}

TASK [base/prepare : Stop if ansible version is too low] ***********************
Tuesday 13 August 2019  16:27:31 +0800 (0:00:00.082)       0:00:00.211 ******** 
ok: [node1] => {
    "changed": false,
    "msg": "All assertions passed"
}

TASK [base/prepare : Stop if non systemd OS type] ******************************
Tuesday 13 August 2019  16:27:32 +0800 (0:00:00.086)       0:00:00.298 ******** 
ok: [node1] => {
    "changed": false,
    "msg": "All assertions passed"
}

TASK [base/prepare : Stop if unknown OS] ***************************************
Tuesday 13 August 2019  16:27:32 +0800 (0:00:00.085)       0:00:00.383 ******** 
ok: [node1] => {
    "changed": false,
    "msg": "All assertions passed"
}

TASK [base/prepare : Stop if memory is too small for masters] ******************
Tuesday 13 August 2019  16:27:32 +0800 (0:00:00.088)       0:00:00.472 ******** 
ok: [node1] => {
    "changed": false,
    "msg": "All assertions passed"
}

TASK [base/prepare : Stop if memory is too small for nodes] ********************
Tuesday 13 August 2019  16:27:32 +0800 (0:00:00.089)       0:00:00.562 ******** 
ok: [node1] => {
    "changed": false,
    "msg": "All assertions passed"
}

TASK [base/prepare : Assign inventory name to hostnames] ***********************
Tuesday 13 August 2019  16:27:32 +0800 (0:00:00.090)       0:00:00.652 ******** 
changed: [node1]

TASK [base/prepare : set interface ip] *****************************************
Tuesday 13 August 2019  16:27:32 +0800 (0:00:00.615)       0:00:01.267 ******** 
ok: [node1]

TASK [base/prepare : Hosts | populate inventory into hosts file] ***************
Tuesday 13 August 2019  16:27:33 +0800 (0:00:00.133)       0:00:01.401 ******** 
changed: [node1]

TASK [base/prepare : Hosts | localhost ipv4 in hosts file] *********************
Tuesday 13 August 2019  16:27:33 +0800 (0:00:00.328)       0:00:01.730 ******** 
changed: [node1]

TASK [base/prepare : Hosts | localhost ipv6 in hosts file] *********************
Tuesday 13 August 2019  16:27:33 +0800 (0:00:00.306)       0:00:02.036 ******** 
changed: [node1]

TASK [base/prepare : set timezone to Asia/ShangHai] ****************************
Tuesday 13 August 2019  16:27:33 +0800 (0:00:00.173)       0:00:02.210 ******** 
ok: [node1]

TASK [base/prepare : sysctl set net.ipv4.ip_forward=1] *************************
Tuesday 13 August 2019  16:27:34 +0800 (0:00:00.357)       0:00:02.567 ******** 
changed: [node1]

TASK [base/prepare : Temporarily closed selinux] *******************************
Tuesday 13 August 2019  16:27:34 +0800 (0:00:00.288)       0:00:02.855 ******** 
changed: [node1]

TASK [base/prepare : Permanent closure selinux] ********************************
Tuesday 13 August 2019  16:27:34 +0800 (0:00:00.292)       0:00:03.148 ******** 
changed: [node1]

TASK [base/prepare : Disable swap] *********************************************
Tuesday 13 August 2019  16:27:35 +0800 (0:00:00.180)       0:00:03.329 ******** 
changed: [node1]

TASK [base/prepare : Delete fstab swap config] *********************************
Tuesday 13 August 2019  16:27:35 +0800 (0:00:00.203)       0:00:03.533 ******** 
changed: [node1]

TASK [base/prepare : Check presence of fastestmirror.conf] *********************
Tuesday 13 August 2019  16:27:35 +0800 (0:00:00.191)       0:00:03.724 ******** 
ok: [node1]

TASK [base/prepare : Disable fastestmirror plugin] *****************************
Tuesday 13 August 2019  16:27:35 +0800 (0:00:00.297)       0:00:04.022 ******** 
changed: [node1]

TASK [base/prepare : Verify if br_netfilter module exists] *********************
Tuesday 13 August 2019  16:27:35 +0800 (0:00:00.180)       0:00:04.202 ******** 
ok: [node1]

TASK [base/prepare : Enable br_netfilter module] *******************************
Tuesday 13 August 2019  16:27:36 +0800 (0:00:00.190)       0:00:04.393 ******** 
changed: [node1]

TASK [base/prepare : Persist br_netfilter module] ******************************
Tuesday 13 August 2019  16:27:36 +0800 (0:00:00.296)       0:00:04.689 ******** 
changed: [node1]

TASK [base/prepare : Check if bridge-nf-call-iptables key exists] **************
Tuesday 13 August 2019  16:27:36 +0800 (0:00:00.535)       0:00:05.225 ******** 
ok: [node1]

TASK [base/prepare : Enable bridge-nf-call tables] *****************************
Tuesday 13 August 2019  16:27:37 +0800 (0:00:00.183)       0:00:05.408 ******** 

TASK [base/prepare : Ensure sysctl config] *************************************
Tuesday 13 August 2019  16:27:37 +0800 (0:00:00.058)       0:00:05.467 ******** 
changed: [node1]

TASK [base/prepare : sysctl set net] *******************************************
Tuesday 13 August 2019  16:27:37 +0800 (0:00:00.433)       0:00:05.901 ******** 
changed: [node1]

TASK [base/prepare : iptables accept all traffic from other node] **************
Tuesday 13 August 2019  16:27:37 +0800 (0:00:00.180)       0:00:06.081 ******** 
changed: [node1] => (item=node1)

TASK [base/prepare : iptables output all traffic from other node] **************
Tuesday 13 August 2019  16:27:38 +0800 (0:00:00.323)       0:00:06.405 ******** 
changed: [node1] => (item=node1)

TASK [base/prepare : iptables forward all traffic from other node] *************
Tuesday 13 August 2019  16:27:38 +0800 (0:00:00.219)       0:00:06.625 ******** 
changed: [node1]

TASK [base/prepare : iptables accept all traffic from kube pod subnet] *********
Tuesday 13 August 2019  16:27:38 +0800 (0:00:00.182)       0:00:06.807 ******** 
changed: [node1]

TASK [base/prepare : iptables output all traffic from kube pod subnet] *********
Tuesday 13 August 2019  16:27:38 +0800 (0:00:00.177)       0:00:06.985 ******** 
changed: [node1]

TASK [base/prepare : Create kubernetes directories] ****************************
Tuesday 13 August 2019  16:27:38 +0800 (0:00:00.180)       0:00:07.166 ******** 
changed: [node1] => (item=/etc/kubernetes)
changed: [node1] => (item=/etc/kubernetes/pki)
changed: [node1] => (item=/etc/kubernetes/manifests)
changed: [node1] => (item=/etc/kubernetes/ssl/etcd)

TASK [base/prepare : Create cni directories] ***********************************
Tuesday 13 August 2019  16:27:39 +0800 (0:00:00.600)       0:00:07.766 ******** 
changed: [node1] => (item=/etc/cni/net.d)
changed: [node1] => (item=/opt/cni/bin)

TASK [base/prepare : Ensure Yum repository] ************************************
Tuesday 13 August 2019  16:27:39 +0800 (0:00:00.285)       0:00:08.052 ******** 
changed: [node1]

TASK [base/prepare : Download cfssl] *******************************************
Tuesday 13 August 2019  16:27:40 +0800 (0:00:00.287)       0:00:08.339 ******** 
changed: [node1]

TASK [base/prepare : Download cfssljson] ***************************************
Tuesday 13 August 2019  16:29:23 +0800 (0:01:43.566)       0:01:51.906 ******** 
changed: [node1]

TASK [base/prepare : Download cfssl-certinfo] **********************************
Tuesday 13 August 2019  16:29:34 +0800 (0:00:10.904)       0:02:02.811 ******** 


changed: [node1]

TASK [base/docker : Ensure yum-utils] ******************************************
Tuesday 13 August 2019  16:29:42 +0800 (0:00:07.827)       0:02:10.638 ******** 
ok: [node1] => (item=['epel-release', 'yum-utils', 'device-mapper-persistent-data', 'lvm2'])

TASK [base/docker : Ensure docker-ce repo] *************************************
Tuesday 13 August 2019  16:29:48 +0800 (0:00:05.923)       0:02:16.562 ******** 
changed: [node1]

TASK [base/docker : Ensure docker-engine] **************************************
Tuesday 13 August 2019  16:29:48 +0800 (0:00:00.567)       0:02:17.130 ******** 
changed: [node1] => (item=['docker-ce-18.03.1.ce-1.el7.centos.x86_64'])

TASK [base/docker : Ensure /etc/docker directory] ******************************
Tuesday 13 August 2019  16:30:58 +0800 (0:01:09.571)       0:03:26.701 ******** 
changed: [node1] => (item=/etc/docker)
changed: [node1] => (item=/etc/systemd/system/docker.service.d)

TASK [base/docker : Ensure dockerd configuration] ******************************
Tuesday 13 August 2019  16:30:58 +0800 (0:00:00.291)       0:03:26.992 ******** 
changed: [node1]

TASK [base/docker : Enable docekr proxy] ***************************************
Tuesday 13 August 2019  16:30:59 +0800 (0:00:00.396)       0:03:27.389 ******** 

TASK [base/docker : reload systemd] ********************************************
Tuesday 13 August 2019  16:30:59 +0800 (0:00:00.031)       0:03:27.421 ******** 

TASK [base/docker : restart docker] ********************************************
Tuesday 13 August 2019  16:30:59 +0800 (0:00:00.029)       0:03:27.451 ******** 
changed: [node1]

PLAY [etcd] ********************************************************************

TASK [base/variables : Set task variables] *************************************
Tuesday 13 August 2019  16:31:00 +0800 (0:00:01.023)       0:03:28.474 ******** 
ok: [node1] => {
    "msg": "Check roles/variables/defaults/main.yml"
}

TASK [etcd : Create etcd cert dir] *********************************************
Tuesday 13 August 2019  16:31:00 +0800 (0:00:00.090)       0:03:28.565 ******** 
changed: [node1]

TASK [etcd : Create etcd certs config dir] *************************************
Tuesday 13 August 2019  16:31:00 +0800 (0:00:00.206)       0:03:28.771 ******** 
changed: [node1 -> 192.168.99.101]

TASK [etcd : Copy certs config] ************************************************
Tuesday 13 August 2019  16:31:00 +0800 (0:00:00.211)       0:03:28.983 ******** 
changed: [node1 -> 192.168.99.101] => (item=ca-config.json)
changed: [node1 -> 192.168.99.101] => (item=ca-csr.json)

TASK [etcd : Write server-csr config] ******************************************
Tuesday 13 August 2019  16:31:01 +0800 (0:00:00.757)       0:03:29.740 ******** 
changed: [node1 -> 192.168.99.101] => (item=client-csr.json)
changed: [node1 -> 192.168.99.101] => (item=server-csr.json)
changed: [node1 -> 192.168.99.101] => (item=peer-csr.json)

TASK [etcd : Copy gen certs script] ********************************************
Tuesday 13 August 2019  16:31:02 +0800 (0:00:01.278)       0:03:31.019 ******** 
changed: [node1 -> 192.168.99.101]

TASK [etcd : Generate Ca certs] ************************************************
Tuesday 13 August 2019  16:31:03 +0800 (0:00:00.456)       0:03:31.475 ******** 
changed: [node1 -> 192.168.99.101]

TASK [etcd : slurp etcd certs] *************************************************
Tuesday 13 August 2019  16:31:04 +0800 (0:00:01.241)       0:03:32.716 ******** 

TASK [etcd : write out etcd certs to other node] *******************************
Tuesday 13 August 2019  16:31:04 +0800 (0:00:00.116)       0:03:32.833 ******** 

TASK [etcd : Copy etcdctl binary from docker container] ************************
Tuesday 13 August 2019  16:31:04 +0800 (0:00:00.120)       0:03:32.954 ******** 
ok: [node1]

TASK [etcd : Create etcd env config file] **************************************
Tuesday 13 August 2019  16:31:43 +0800 (0:00:38.583)       0:04:11.537 ******** 
changed: [node1]

TASK [etcd : Install etcd launch script] ***************************************
Tuesday 13 August 2019  16:31:43 +0800 (0:00:00.465)       0:04:12.003 ******** 
changed: [node1]

TASK [etcd : Configure | Copy etcd.service systemd file] ***********************
Tuesday 13 August 2019  16:31:44 +0800 (0:00:00.415)       0:04:12.418 ******** 
changed: [node1]

TASK [etcd : reload systemd] ***************************************************
Tuesday 13 August 2019  16:31:44 +0800 (0:00:00.411)       0:04:12.830 ******** 
changed: [node1]

TASK [etcd : ensure etcd service is started and enabled] ***********************
Tuesday 13 August 2019  16:31:44 +0800 (0:00:00.244)       0:04:13.074 ******** 
changed: [node1]

TASK [etcd : Copy etcd cert dir under k8s cert dir] ****************************
Tuesday 13 August 2019  16:31:45 +0800 (0:00:00.396)       0:04:13.470 ******** 
ok: [node1]

RUNNING HANDLER [etcd : wait for etcd up] **************************************
Tuesday 13 August 2019  16:31:45 +0800 (0:00:00.271)       0:04:13.742 ******** 
ok: [node1]

PLAY [kube-master:kube-node] ***************************************************

TASK [base/variables : Set task variables] *************************************
Tuesday 13 August 2019  16:31:48 +0800 (0:00:03.201)       0:04:16.943 ******** 
ok: [node1] => {
    "msg": "Check roles/variables/defaults/main.yml"
}

TASK [base/install : Ensure Base Kubernetes] ***********************************
Tuesday 13 August 2019  16:31:48 +0800 (0:00:00.118)       0:04:17.062 ******** 
changed: [node1] => (item=['kubeadm-1.10.12-0.x86_64', 'kubectl-1.10.12-0.x86_64', 'kubelet-1.10.12-0.x86_64', 'kubernetes-cni-0.6.0-0'])

TASK [base/install : Ensure kubelet systemd config] ****************************
Tuesday 13 August 2019  16:33:04 +0800 (0:01:15.479)       0:05:32.541 ******** 
changed: [node1]

TASK [base/install : Ensure kubelet.service] ***********************************
Tuesday 13 August 2019  16:33:04 +0800 (0:00:00.393)       0:05:32.935 ******** 
changed: [node1]

TASK [base/install : Reload Kubelet] *******************************************
Tuesday 13 August 2019  16:33:04 +0800 (0:00:00.328)       0:05:33.263 ******** 
changed: [node1] => (item=kubelet)

TASK [base/install : Ensure jq nfs-utils package is installed] *****************
Tuesday 13 August 2019  16:33:05 +0800 (0:00:00.662)       0:05:33.925 ******** 
changed: [node1] => (item=['jq', 'nfs-utils', 'bash-completion'])

PLAY [kube-master] *************************************************************

TASK [base/variables : Set task variables] *************************************
Tuesday 13 August 2019  16:33:39 +0800 (0:00:33.887)       0:06:07.813 ******** 
ok: [node1] => {
    "msg": "Check roles/variables/defaults/main.yml"
}

TASK [master : Check if kubeadm has already run] *******************************
Tuesday 13 August 2019  16:33:39 +0800 (0:00:00.086)       0:06:07.900 ******** 
ok: [node1]

TASK [master : 读取 kubernetes-ca 根证书私钥 stat 信息] *********************************
Tuesday 13 August 2019  16:33:39 +0800 (0:00:00.171)       0:06:08.071 ******** 
ok: [node1]

TASK [master : 读取 kubernetes-ca 根证书 stat 信息] ***********************************
Tuesday 13 August 2019  16:33:39 +0800 (0:00:00.169)       0:06:08.240 ******** 
ok: [node1]

TASK [master : 读取 kubernetes-admin 证书 stat 信息] *********************************
Tuesday 13 August 2019  16:33:40 +0800 (0:00:00.169)       0:06:08.410 ******** 
ok: [node1]

TASK [master : 创建 kubernetes 的证书请求配置] ******************************************
Tuesday 13 August 2019  16:33:40 +0800 (0:00:00.167)       0:06:08.578 ******** 
changed: [node1]

TASK [master : 创建 kubernetes-ca 根证书私钥] *****************************************
Tuesday 13 August 2019  16:33:40 +0800 (0:00:00.469)       0:06:09.048 ******** 
changed: [node1]

TASK [master : 创建 kubernetes-ca 根证书] *******************************************
Tuesday 13 August 2019  16:33:41 +0800 (0:00:00.294)       0:06:09.342 ******** 
changed: [node1]

TASK [master : 创建 kube-apiserver 证书私钥] *****************************************
Tuesday 13 August 2019  16:33:41 +0800 (0:00:00.218)       0:06:09.561 ******** 
changed: [node1]

TASK [master : 创建 kube-apiserver 证书请求] *****************************************
Tuesday 13 August 2019  16:33:41 +0800 (0:00:00.265)       0:06:09.826 ******** 
changed: [node1]

TASK [master : 创建 kube-apiserver 证书] *******************************************
Tuesday 13 August 2019  16:33:41 +0800 (0:00:00.216)       0:06:10.042 ******** 
changed: [node1]

TASK [master : 创建 apiserver-kubelet-client 证书私钥] *******************************
Tuesday 13 August 2019  16:33:41 +0800 (0:00:00.222)       0:06:10.265 ******** 
changed: [node1]

TASK [master : 创建 apiserver-kubelet-client 证书请求] *******************************
Tuesday 13 August 2019  16:33:42 +0800 (0:00:00.247)       0:06:10.513 ******** 
changed: [node1]

TASK [master : 创建 apiserver-kubelet-client 证书] *********************************
Tuesday 13 August 2019  16:33:42 +0800 (0:00:00.413)       0:06:10.927 ******** 
changed: [node1]

TASK [master : 创建 sa 证书私钥] *****************************************************
Tuesday 13 August 2019  16:33:42 +0800 (0:00:00.222)       0:06:11.149 ******** 
changed: [node1]

TASK [master : 根据 sa 私钥创建公钥] ***************************************************
Tuesday 13 August 2019  16:33:43 +0800 (0:00:00.332)       0:06:11.482 ******** 
changed: [node1]

TASK [master : 软链 sa 证书私钥为 kube-controller-manager 证书私钥] ***********************
Tuesday 13 August 2019  16:33:43 +0800 (0:00:00.200)       0:06:11.682 ******** 
changed: [node1 -> 192.168.99.101]

TASK [master : 创建 kube-controller-manager 证书请求] ********************************
Tuesday 13 August 2019  16:33:43 +0800 (0:00:00.184)       0:06:11.867 ******** 
changed: [node1]

TASK [master : 创建 kube-controller-manager 证书] **********************************
Tuesday 13 August 2019  16:33:43 +0800 (0:00:00.193)       0:06:12.060 ******** 
changed: [node1]

TASK [master : 创建 kube-scheduler 证书私钥] *****************************************
Tuesday 13 August 2019  16:33:43 +0800 (0:00:00.189)       0:06:12.250 ******** 
changed: [node1]

TASK [master : 创建 kube-scheduler 证书请求] *****************************************
Tuesday 13 August 2019  16:33:44 +0800 (0:00:00.364)       0:06:12.614 ******** 
changed: [node1]

TASK [master : 创建 kube-scheduler 证书] *******************************************
Tuesday 13 August 2019  16:33:44 +0800 (0:00:00.218)       0:06:12.833 ******** 
changed: [node1]

TASK [master : 创建 front-proxy-ca 证书私钥] *****************************************
Tuesday 13 August 2019  16:33:44 +0800 (0:00:00.222)       0:06:13.055 ******** 
changed: [node1]

TASK [master : 创建 front-proxy-ca 根证书] ******************************************
Tuesday 13 August 2019  16:33:45 +0800 (0:00:00.294)       0:06:13.349 ******** 
changed: [node1]

TASK [master : 创建 front-proxy-client 证书私钥] *************************************
Tuesday 13 August 2019  16:33:45 +0800 (0:00:00.222)       0:06:13.572 ******** 
changed: [node1]

TASK [master : 创建 front-proxy-client 证书请求] *************************************
Tuesday 13 August 2019  16:33:45 +0800 (0:00:00.358)       0:06:13.931 ******** 
changed: [node1]

TASK [master : 创建 front-proxy-client 证书] ***************************************
Tuesday 13 August 2019  16:33:45 +0800 (0:00:00.221)       0:06:14.153 ******** 
changed: [node1]

TASK [master : 创建 kubernetes cluster admin 证书私钥] *******************************
Tuesday 13 August 2019  16:33:46 +0800 (0:00:00.219)       0:06:14.372 ******** 
changed: [node1]

TASK [master : 创建 kubernetes cluster admin 证书请求] *******************************
Tuesday 13 August 2019  16:33:46 +0800 (0:00:00.240)       0:06:14.613 ******** 
changed: [node1]

TASK [master : 创建 kubernetes cluster admin 证书] *********************************
Tuesday 13 August 2019  16:33:46 +0800 (0:00:00.213)       0:06:14.826 ******** 
changed: [node1]

TASK [master : 获取 kubernetes 相关证书] *********************************************
Tuesday 13 August 2019  16:33:46 +0800 (0:00:00.252)       0:06:15.079 ******** 
ok: [node1 -> 192.168.99.101] => (item=ca.crt)
ok: [node1 -> 192.168.99.101] => (item=ca.key)
ok: [node1 -> 192.168.99.101] => (item=apiserver.crt)
ok: [node1 -> 192.168.99.101] => (item=apiserver.key)
ok: [node1 -> 192.168.99.101] => (item=apiserver-kubelet-client.crt)
ok: [node1 -> 192.168.99.101] => (item=apiserver-kubelet-client.key)
ok: [node1 -> 192.168.99.101] => (item=sa.key)
ok: [node1 -> 192.168.99.101] => (item=sa.pub)
ok: [node1 -> 192.168.99.101] => (item=kube-controller-manager.crt)
ok: [node1 -> 192.168.99.101] => (item=kube-scheduler.crt)
ok: [node1 -> 192.168.99.101] => (item=kube-scheduler.key)
ok: [node1 -> 192.168.99.101] => (item=front-proxy-ca.crt)
ok: [node1 -> 192.168.99.101] => (item=front-proxy-ca.key)
ok: [node1 -> 192.168.99.101] => (item=front-proxy-client.crt)
ok: [node1 -> 192.168.99.101] => (item=front-proxy-client.key)
ok: [node1 -> 192.168.99.101] => (item=admin.crt)
ok: [node1 -> 192.168.99.101] => (item=admin.key)

TASK [master : 分发 kubernetes 相关证书到 master 节点] **********************************
Tuesday 13 August 2019  16:33:48 +0800 (0:00:01.733)       0:06:16.812 ******** 

TASK [master : set interface ip] ***********************************************
Tuesday 13 August 2019  16:33:48 +0800 (0:00:00.134)       0:06:16.947 ******** 
ok: [node1]

TASK [master : kubeadm | aggregate all SANs] ***********************************
Tuesday 13 August 2019  16:33:48 +0800 (0:00:00.150)       0:06:17.097 ******** 
ok: [node1]

TASK [master : kubeadm | Create kubeadm config] ********************************
Tuesday 13 August 2019  16:33:48 +0800 (0:00:00.154)       0:06:17.252 ******** 
changed: [node1]

TASK [master : kubeadm | Initialize first master] ******************************
Tuesday 13 August 2019  16:33:49 +0800 (0:00:00.656)       0:06:17.908 ******** 




changed: [node1]

TASK [master : kubeadm | Init other uninitialized masters] *********************
Tuesday 13 August 2019  16:35:38 +0800 (0:01:48.721)       0:08:06.630 ******** 

TASK [master : kubeadm | Create kubedns service config] ************************
Tuesday 13 August 2019  16:35:38 +0800 (0:00:00.039)       0:08:06.669 ******** 
changed: [node1]

TASK [master : kubeadm | delete old kube-dns service] **************************
Tuesday 13 August 2019  16:35:38 +0800 (0:00:00.468)       0:08:07.138 ******** 
changed: [node1]

TASK [master : kubeadm | create kube-dns service] ******************************
Tuesday 13 August 2019  16:35:39 +0800 (0:00:00.460)       0:08:07.599 ******** 
changed: [node1]

TASK [master : Update kube-proxy command args] *********************************
Tuesday 13 August 2019  16:35:39 +0800 (0:00:00.483)       0:08:08.083 ******** 
changed: [node1]

TASK [master : create admin.conf] **********************************************
Tuesday 13 August 2019  16:35:40 +0800 (0:00:00.646)       0:08:08.729 ******** 
changed: [node1]

TASK [master : create controller-manager.conf] *********************************
Tuesday 13 August 2019  16:35:41 +0800 (0:00:00.686)       0:08:09.415 ******** 
changed: [node1]

TASK [master : create scheduler.conf] ******************************************
Tuesday 13 August 2019  16:35:41 +0800 (0:00:00.608)       0:08:10.024 ******** 
changed: [node1]

TASK [master : create kubelet.conf] ********************************************
Tuesday 13 August 2019  16:35:42 +0800 (0:00:00.582)       0:08:10.607 ******** 
changed: [node1]

TASK [master : restart kubelet] ************************************************
Tuesday 13 August 2019  16:35:42 +0800 (0:00:00.581)       0:08:11.189 ******** 
changed: [node1]

TASK [master : Create kube config dir] *****************************************
Tuesday 13 August 2019  16:35:43 +0800 (0:00:00.252)       0:08:11.441 ******** 
changed: [node1]

TASK [master : Copy admin kubeconfig to root user home] ************************
Tuesday 13 August 2019  16:35:43 +0800 (0:00:00.211)       0:08:11.652 ******** 
changed: [node1]

TASK [master : Install kubectl bash completion] ********************************
Tuesday 13 August 2019  16:35:43 +0800 (0:00:00.265)       0:08:11.918 ******** 
changed: [node1]

TASK [master : Set kubectl bash completion file] *******************************
Tuesday 13 August 2019  16:35:43 +0800 (0:00:00.300)       0:08:12.218 ******** 
changed: [node1]

RUNNING HANDLER [master : Master | restart kubelet] ****************************
Tuesday 13 August 2019  16:35:44 +0800 (0:00:00.216)       0:08:12.435 ******** 
changed: [node1]

RUNNING HANDLER [master : Master | wait for master static pods] ****************
Tuesday 13 August 2019  16:35:44 +0800 (0:00:00.261)       0:08:12.697 ******** 
changed: [node1]

RUNNING HANDLER [master : Master | reload systemd] *****************************
Tuesday 13 August 2019  16:35:44 +0800 (0:00:00.263)       0:08:12.960 ******** 
changed: [node1]

RUNNING HANDLER [master : Master | reload kubelet] *****************************
Tuesday 13 August 2019  16:35:45 +0800 (0:00:00.341)       0:08:13.302 ******** 
changed: [node1]

RUNNING HANDLER [master : Master | wait for kube-scheduler] ********************
Tuesday 13 August 2019  16:35:45 +0800 (0:00:00.338)       0:08:13.641 ******** 
ok: [node1]

RUNNING HANDLER [master : Master | wait for kube-controller-manager] ***********
Tuesday 13 August 2019  16:35:46 +0800 (0:00:00.642)       0:08:14.283 ******** 
FAILED - RETRYING: Master | wait for kube-controller-manager (15 retries left).
FAILED - RETRYING: Master | wait for kube-controller-manager (14 retries left).
FAILED - RETRYING: Master | wait for kube-controller-manager (13 retries left).
FAILED - RETRYING: Master | wait for kube-controller-manager (12 retries left).
FAILED - RETRYING: Master | wait for kube-controller-manager (11 retries left).
FAILED - RETRYING: Master | wait for kube-controller-manager (10 retries left).
FAILED - RETRYING: Master | wait for kube-controller-manager (9 retries left).
FAILED - RETRYING: Master | wait for kube-controller-manager (8 retries left).
FAILED - RETRYING: Master | wait for kube-controller-manager (7 retries left).
FAILED - RETRYING: Master | wait for kube-controller-manager (6 retries left).
FAILED - RETRYING: Master | wait for kube-controller-manager (5 retries left).
FAILED - RETRYING: Master | wait for kube-controller-manager (4 retries left).
FAILED - RETRYING: Master | wait for kube-controller-manager (3 retries left).
ok: [node1]

RUNNING HANDLER [master : Master | wait for the apiserver to be running] *******
Tuesday 13 August 2019  16:36:54 +0800 (0:01:08.025)       0:09:22.309 ******** 
ok: [node1]

PLAY [kube-node] ***************************************************************

TASK [base/variables : Set task variables] *************************************
Tuesday 13 August 2019  16:36:54 +0800 (0:00:00.399)       0:09:22.709 ******** 
ok: [node1] => {
    "msg": "Check roles/variables/defaults/main.yml"
}

TASK [node : Set kubeadm_discovery_address] ************************************
Tuesday 13 August 2019  16:36:54 +0800 (0:00:00.134)       0:09:22.844 ******** 

TASK [node : nginx-proxy | Write static pod] ***********************************
Tuesday 13 August 2019  16:36:54 +0800 (0:00:00.036)       0:09:22.880 ******** 

TASK [node : nginx-proxy | Make nginx directory] *******************************
Tuesday 13 August 2019  16:36:54 +0800 (0:00:00.033)       0:09:22.914 ******** 

TASK [node : nginx-proxy | Write nginx-proxy configuration] ********************
Tuesday 13 August 2019  16:36:54 +0800 (0:00:00.036)       0:09:22.950 ******** 

TASK [node : Check if kubelet.conf exists] *************************************
Tuesday 13 August 2019  16:36:54 +0800 (0:00:00.035)       0:09:22.986 ******** 

TASK [node : Create kubeadm client config] *************************************
Tuesday 13 August 2019  16:36:54 +0800 (0:00:00.034)       0:09:23.020 ******** 

TASK [node : Join to cluster if needed] ****************************************
Tuesday 13 August 2019  16:36:54 +0800 (0:00:00.044)       0:09:23.065 ******** 

TASK [node : Wait for kubelet bootstrap to create config] **********************
Tuesday 13 August 2019  16:36:54 +0800 (0:00:00.038)       0:09:23.104 ******** 

TASK [node : Update server field in kubelet kubeconfig] ************************
Tuesday 13 August 2019  16:36:54 +0800 (0:00:00.037)       0:09:23.141 ******** 

TASK [node : Set Master Node schedule] *****************************************
Tuesday 13 August 2019  16:36:54 +0800 (0:00:00.083)       0:09:23.224 ******** 
changed: [node1 -> 192.168.99.101]

PLAY [kube-master] *************************************************************

TASK [base/variables : Set task variables] *************************************
Tuesday 13 August 2019  16:36:55 +0800 (0:00:00.423)       0:09:23.647 ******** 
ok: [node1] => {
    "msg": "Check roles/variables/defaults/main.yml"
}

TASK [addons/flannel : Flannel | create flannel config dir] ********************
Tuesday 13 August 2019  16:36:55 +0800 (0:00:00.129)       0:09:23.777 ******** 
changed: [node1] => (item=/etc/kubernetes/addons)
changed: [node1] => (item=/etc/kubernetes/addons/flannel)

TASK [addons/flannel : Flannel | Create cni-flannel-rbac manifest] *************
Tuesday 13 August 2019  16:36:55 +0800 (0:00:00.331)       0:09:24.108 ******** 
changed: [node1]

TASK [addons/flannel : Flannel | Create cni-flannel manifest] ******************
Tuesday 13 August 2019  16:36:56 +0800 (0:00:00.471)       0:09:24.580 ******** 
changed: [node1]

TASK [addons/flannel : Flannel | Create ServiceAccount ClusterRole and ClusterRoleBinding] ***
Tuesday 13 August 2019  16:36:56 +0800 (0:00:00.460)       0:09:25.042 ******** 
changed: [node1]

TASK [addons/flannel : Flannel | Start Resources] ******************************
Tuesday 13 August 2019  16:36:57 +0800 (0:00:00.455)       0:09:25.497 ******** 
changed: [node1]

TASK [addons/ingress-nginx : Ingress nginx | create ingress-nginx config dir] ***
Tuesday 13 August 2019  16:36:57 +0800 (0:00:00.402)       0:09:25.900 ******** 
ok: [node1] => (item=/etc/kubernetes/addons)
changed: [node1] => (item=/etc/kubernetes/addons/ingress-nginx)

TASK [addons/ingress-nginx : Ingress nginx | Ensure ingress-nginx deploy file] ***
Tuesday 13 August 2019  16:36:57 +0800 (0:00:00.330)       0:09:26.231 ******** 
changed: [node1] => (item=configmap.yml)
changed: [node1] => (item=default-backend.yml)
changed: [node1] => (item=rbac.yml)
changed: [node1] => (item=tcp-services-configmap.yml)
changed: [node1] => (item=udp-services-configmap.yml)
changed: [node1] => (item=with-rbac.yml)
changed: [node1] => (item=nginx-ingress-svc.yml)

TASK [addons/ingress-nginx : Start ingress controller] *************************
Tuesday 13 August 2019  16:37:00 +0800 (0:00:02.655)       0:09:28.887 ******** 
changed: [node1 -> 192.168.99.101]

TASK [addons/dashboard : Dashboard | create dashboard config dir] **************
Tuesday 13 August 2019  16:37:01 +0800 (0:00:00.497)       0:09:29.384 ******** 
ok: [node1] => (item=/etc/kubernetes/addons)
changed: [node1] => (item=/etc/kubernetes/addons/dashboard)

TASK [addons/dashboard : copy dashboard template] ******************************
Tuesday 13 August 2019  16:37:01 +0800 (0:00:00.303)       0:09:29.688 ******** 
changed: [node1]

TASK [addons/dashboard : Start dashboard] **************************************
Tuesday 13 August 2019  16:37:01 +0800 (0:00:00.453)       0:09:30.141 ******** 
changed: [node1 -> 192.168.99.101]

TASK [addons/heapster : Heapster | Create heapster dir] ************************
Tuesday 13 August 2019  16:37:02 +0800 (0:00:00.393)       0:09:30.535 ******** 
ok: [node1] => (item=/etc/kubernetes/addons)
changed: [node1] => (item=/etc/kubernetes/addons/heapster)

TASK [addons/heapster : Heapster | Copy heapster template] *********************
Tuesday 13 August 2019  16:37:02 +0800 (0:00:00.300)       0:09:30.835 ******** 
changed: [node1]

TASK [addons/heapster : Heapster | Start dashboard] ****************************
Tuesday 13 August 2019  16:37:03 +0800 (0:00:00.444)       0:09:31.280 ******** 
changed: [node1 -> 192.168.99.101]

TASK [addons/kube-lego : Kube lego | create kube-lego config dir] **************
Tuesday 13 August 2019  16:37:03 +0800 (0:00:00.463)       0:09:31.744 ******** 

TASK [addons/kube-lego : Kube lego | Ensure ingress-nginx deploy file] *********
Tuesday 13 August 2019  16:37:03 +0800 (0:00:00.046)       0:09:31.791 ******** 

TASK [addons/kube-lego : Kube lego | Start kube-lego] **************************
Tuesday 13 August 2019  16:37:03 +0800 (0:00:00.073)       0:09:31.864 ******** 

PLAY RECAP *********************************************************************
node1                      : ok=135  changed=105  unreachable=0    failed=0   

Tuesday 13 August 2019  16:37:03 +0800 (0:00:00.019)       0:09:31.884 ******** 
=============================================================================== 
master : kubeadm | Initialize first master ---------------------------- 108.72s
base/prepare : Download cfssl ----------------------------------------- 103.57s
base/install : Ensure Base Kubernetes ---------------------------------- 75.48s
base/docker : Ensure docker-engine ------------------------------------- 69.57s
master : Master | wait for kube-controller-manager --------------------- 68.03s
etcd : Copy etcdctl binary from docker container ----------------------- 38.58s
base/install : Ensure jq nfs-utils package is installed ---------------- 33.89s
base/prepare : Download cfssljson -------------------------------------- 10.90s
base/prepare : Download cfssl-certinfo ---------------------------------- 7.83s
base/docker : Ensure yum-utils ------------------------------------------ 5.92s
etcd : wait for etcd up ------------------------------------------------- 3.20s
addons/ingress-nginx : Ingress nginx | Ensure ingress-nginx deploy file --- 2.66s
master : 获取 kubernetes 相关证书 --------------------------------------------- 1.73s
etcd : Write server-csr config ------------------------------------------ 1.28s
etcd : Generate Ca certs ------------------------------------------------ 1.24s
base/docker : restart docker -------------------------------------------- 1.02s
etcd : Copy certs config ------------------------------------------------ 0.76s
master : create admin.conf ---------------------------------------------- 0.69s
base/install : Reload Kubelet ------------------------------------------- 0.66s
master : kubeadm | Create kubeadm config -------------------------------- 0.66s

```


## 部署结果

### 查看集群状态

```shell
[root@bogon hellocode]# kubectl cluster-info
Kubernetes master is running at https://192.168.99.101:6443
Heapster is running at https://192.168.99.101:6443/api/v1/namespaces/kube-system/services/heapster/proxy
KubeDNS is running at https://192.168.99.101:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
kubernetes-dashboard is running at https://192.168.99.101:6443/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy
```

如果要访问这些服务，要关闭防火墙
```shell
# 查看防火墙状态
[root@bogon hellocode]# firewall-cmd --state
running

# 停止防火墙
systemctl stop firewalld.service

# 禁止开机启动
[root@bogon hellocode]# systemctl disable firewalld.service 
Removed symlink /etc/systemd/system/multi-user.target.wants/firewalld.service.
Removed symlink /etc/systemd/system/dbus-org.fedoraproject.FirewallD1.service.
```

### 部署问题

#### Kube-dns无法启动的问题
* 命令执行如下结果

```shell
[root@node1 kubeadm-ansible]# kubectl get pods --all-namespaces
NAMESPACE     NAME                                        READY     STATUS    RESTARTS   AGE
kube-system   default-http-backend-6d7c87d586-xwx8v       1/1       Running   0          8m
kube-system   heapster-67f8bd97d8-4xlc5                   1/1       Running   0          8m
kube-system   kube-apiserver-node1                        1/1       Running   0          8m
kube-system   kube-controller-manager-node1               1/1       Running   0          8m
kube-system   kube-dns-647dfd8d8c-dklrf                   0/3       Pending   0          8m
kube-system   kube-flannel-h6hnl                          1/1       Running   0          8m
kube-system   kube-proxy-4rcvr                            1/1       Running   0          8m
kube-system   kube-scheduler-node1                        1/1       Running   0          8m
kube-system   kubernetes-dashboard-5b896854cc-smbgf       1/1       Running   0          8m
kube-system   nginx-ingress-controller-5fd854dc89-n2jn9   1/1       Running   0          8m

```

* 解决方法
安装CoreDNS，具体详见[部署 coredns 插件](https://k8s-install.opsnull.com/09-1.dns%E6%8F%92%E4%BB%B6.html)
**NOTE:** 注意修改coredns.yaml中的变量，需要注意cluseterIP

```yml
# __MACHINE_GENERATED_WARNING__

apiVersion: v1
kind: ServiceAccount
metadata:
  name: coredns
  namespace: kube-system
  labels:
      kubernetes.io/cluster-service: "true"
      addonmanager.kubernetes.io/mode: Reconcile
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    kubernetes.io/bootstrapping: rbac-defaults
    addonmanager.kubernetes.io/mode: Reconcile
  name: system:coredns
rules:
- apiGroups:
  - ""
  resources:
  - endpoints
  - services
  - pods
  - namespaces
  verbs:
  - list
  - watch
- apiGroups:
  - ""
  resources:
  - nodes
  verbs:
  - get
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  annotations:
    rbac.authorization.kubernetes.io/autoupdate: "true"
  labels:
    kubernetes.io/bootstrapping: rbac-defaults
    addonmanager.kubernetes.io/mode: EnsureExists
  name: system:coredns
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:coredns
subjects:
- kind: ServiceAccount
  name: coredns
  namespace: kube-system
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns
  namespace: kube-system
  labels:
      addonmanager.kubernetes.io/mode: EnsureExists
data:
  Corefile: |
    .:53 {
        errors
        health
        kubernetes cluster.local in-addr.arpa ip6.arpa {
            pods insecure
            upstream
            fallthrough in-addr.arpa ip6.arpa
            ttl 30
        }
        prometheus :9153
        forward . /etc/resolv.conf
        cache 30
        loop
        reload
        loadbalance
    }
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: coredns
  namespace: kube-system
  labels:
    k8s-app: kube-dns
    kubernetes.io/cluster-service: "true"
    addonmanager.kubernetes.io/mode: Reconcile
    kubernetes.io/name: "CoreDNS"
spec:
  # replicas: not specified here:
  # 1. In order to make Addon Manager do not reconcile this replicas parameter.
  # 2. Default is 1.
  # 3. Will be tuned in real time if DNS horizontal auto-scaling is turned on.
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
  selector:
    matchLabels:
      k8s-app: kube-dns
  template:
    metadata:
      labels:
        k8s-app: kube-dns
      annotations:
        seccomp.security.alpha.kubernetes.io/pod: 'docker/default'
    spec:
      priorityClassName: system-cluster-critical
      serviceAccountName: coredns
      tolerations:
        - key: "CriticalAddonsOnly"
          operator: "Exists"
      nodeSelector:
        beta.kubernetes.io/os: linux
      containers:
      - name: coredns
        image: k8s.gcr.io/coredns:1.3.1
        imagePullPolicy: IfNotPresent
        resources:
          limits:
            memory: 100Mi
          requests:
            cpu: 100m
            memory: 70Mi
        args: [ "-conf", "/etc/coredns/Corefile" ]
        volumeMounts:
        - name: config-volume
          mountPath: /etc/coredns
          readOnly: true
        ports:
        - containerPort: 53
          name: dns
          protocol: UDP
        - containerPort: 53
          name: dns-tcp
          protocol: TCP
        - containerPort: 9153
          name: metrics
          protocol: TCP
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
            scheme: HTTP
          initialDelaySeconds: 60
          timeoutSeconds: 5
          successThreshold: 1
          failureThreshold: 5
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
            scheme: HTTP
        securityContext:
          allowPrivilegeEscalation: false
          capabilities:
            add:
            - NET_BIND_SERVICE
            drop:
            - all
          readOnlyRootFilesystem: true
      dnsPolicy: Default
      volumes:
        - name: config-volume
          configMap:
            name: coredns
            items:
            - key: Corefile
              path: Corefile
---
apiVersion: v1
kind: Service
metadata:
  name: kube-dns
  namespace: kube-system
  annotations:
    prometheus.io/port: "9153"
    prometheus.io/scrape: "true"
  labels:
    k8s-app: kube-dns
    kubernetes.io/cluster-service: "true"
    addonmanager.kubernetes.io/mode: Reconcile
    kubernetes.io/name: "CoreDNS"
spec:
  selector:
    k8s-app: kube-dns
  clusterIP: 10.233.0.10  //注意这里的clusterIP
  ports:
  - name: dns
    port: 53
    protocol: UDP
  - name: dns-tcp
    port: 53
    protocol: TCP
  - name: metrics
    port: 9153
    protocol: TCP

```

### 参考资料
* [Kubernetes(k8s)如何使用kube-dns实现服务发现](https://www.kubernetes.org.cn/273.html)

**NOTE:** 以下示例服务为[分布式即时聊天系统](https://github.com/comsince/universe_push)为例

### kubenetes dashboard 登录问题

![image](/images/cloud-native/k8s-login.png)

* 生成token

```shell
kubectl create sa dashboard-admin -n kube-system
kubectl create clusterrolebinding dashboard-admin --clusterrole=cluster-admin --serviceaccount=kube-system:dashboard-admin
ADMIN_SECRET=$(kubectl get secrets -n kube-system | grep dashboard-admin | awk '{print $1}')
DASHBOARD_LOGIN_TOKEN=$(kubectl describe secret -n kube-system ${ADMIN_SECRET} | grep -E '^token' | awk '{print $2}')
echo ${DASHBOARD_LOGIN_TOKEN}
```

* [创建登录 token](https://k8s-install.opsnull.com/09-2.dashboard%E6%8F%92%E4%BB%B6.html#%E5%88%9B%E5%BB%BA%E7%99%BB%E5%BD%95-token)

### 启动示例服务
* kompose启动 `kompose -f universe-docker-compose.yml up`
* kubectl apply 启动 `kubectl apply -f universe-kube-deployment.yml` 

**NOTE:** 以下为相关的yml文件，请选择相关的文件下载,上面时两种启动方式，选择其中之一即可，推荐使用kubectl apply
* [universe-kube-deployment.yml](/download/cloud-native/universe-kube-deployment.yml)
* [universe-docker-compose.yml](/download/cloud-native/universe-docker-compose.yml)

如果想要停止服务，执行如下其中之一命令即可

* kompose停止 `kompose -f universe-docker-compose.yml down`
* kubectl delete 停止 `kubectl delete -f universe-kube-deployment.yml`

**NOGE:** 以下启动后服务概览

![image](/images/cloud-native/k8s-home.png)

### 服务发布的问题

#### 外部端口暴露问题
* 如何将服务暴露给外网,主要由三种暴露方式，这里需要用NodePort方式，注意nodePort端口范围为:30000-32767,以下为完整的配置  

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql
  labels:
    app: mysql-db
spec:
  ports:
    - port: 3306
      targetPort: 3306
      name: mysql
  selector:
    app: mysql-db
  clusterIP: None
---
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: mysql
  labels:
    app: mysql-db
spec:
  template:
    metadata:
      labels:
        app: mysql-db
    spec:
      containers:
      - args:
        - mysqld
        - --character-set-server=utf8mb4
        - --collation-server=utf8mb4_unicode_ci
        env:
        - name: MYSQL_PASSWORD
          value: test
        - name: MYSQL_ROOT_PASSWORD
          value: "123456"
        - name: MYSQL_USER
          value: test
        name: mysql
        image: mysql:5.7
        ports:
        - containerPort: 3306
---
apiVersion: v1
kind: Service
metadata:
  name: zookeeper
  labels:
    app: zookeeper-servicefind
spec:
  ports:
    - port: 2181
      targetPort: 2181
      name: zookeeper
  selector:
    app: zookeeper-servicefind
  clusterIP: None
---
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: zookeeper
  labels:
    app: zookeeper-servicefind
spec:
  template:
        metadata:
          labels:
            app: zookeeper-servicefind
        spec:
          containers:
          - env:
            - name: TZ
              value: Asia/Shanghai        
            name: zookeeper
            image: zookeeper:3.5.5
            ports:
              - containerPort: 2181
                name: zookeeper            
---
apiVersion: v1
kind: Service
metadata:
  name: push-connector
  labels:
    app: push-connector-dubbo
spec:
  ports:
    - port: 6789
      nodePort: 30789
      targetPort: 6789
      name: push-connector
  selector:
    app: push-connector-dubbo
  type: NodePort
---
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: push-connector
  labels:
    app: push-connector-dubbo
spec:
  template:
    metadata:
      labels:
        app: push-connector-dubbo
    spec:
      containers:
      - env:
        - name: TZ
          value: Asia/Shanghai         
        name: push-connector
        image: comsince/push-connector
        ports:
          - containerPort: 6789
---
apiVersion: v1
kind: Service
metadata:
  name: push-group
  labels:
    app: push-group-web
spec:
  ports:
    - port: 8081
      nodePort: 30081
      targetPort: 8081
      name: push-group
  selector:
    app: push-group-web
  type: NodePort
---
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: push-group
  labels:
    app: push-group-web
spec:
  template:
    metadata:
      labels:
        app: push-group-web
    spec:
      containers:
      - env:
        - name: TZ
          value: Asia/Shanghai         
        name: push-group
        image: comsince/push-group
        ports:
          - containerPort: 8081

```

#### Mysql数据持久化存储问题
可以使用数据卷来解决。这里使用`Persistent Volumes`,详情参见[基于 Persistent Volumes 搭建 WordPress 和 MySQL 应用](https://kubernetes.io/zh/docs/tutorials/stateful-application/mysql-wordpress-persistent-volume/)

**NOTE:** `PersistentVolumeClaim`必须有一个`PersistentVolume`绑定，不然claim会一直处理pending状态无法启动
* 如下为带有数据卷的yml

```yml
apiVersion: v1
kind: Service
metadata:
  name: mysql
  labels:
    app: mysql-db
spec:
  ports:
    - port: 3306
      targetPort: 3306
      name: mysql
  selector:
    app: mysql-db
  clusterIP: None
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: local-pv
  labels:
    type: local
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /data/mysql
---    
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pv-claim
  labels:
    app: push-group-mysql
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
---
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: mysql
  labels:
    app: mysql-db
spec:
  template:
    metadata:
      labels:
        app: mysql-db
    spec:
      containers:
      - args:
        - mysqld
        - --character-set-server=utf8mb4
        - --collation-server=utf8mb4_unicode_ci
        env:
        - name: MYSQL_PASSWORD
          value: test
        - name: MYSQL_ROOT_PASSWORD
          value: "123456"
        - name: MYSQL_USER
          value: test
        name: mysql
        image: mysql:5.7
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: mysql-persistent-storage
          mountPath: /var/lib/mysql
      volumes:
      - name: mysql-persistent-storage
        persistentVolumeClaim:
          claimName: mysql-pv-claim    
---
apiVersion: v1
kind: Service
metadata:
  name: zookeeper
  labels:
    app: zookeeper-servicefind
spec:
  ports:
    - port: 2181
      targetPort: 2181
      name: zookeeper
  selector:
    app: zookeeper-servicefind
  clusterIP: None
---
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: zookeeper
  labels:
    app: zookeeper-servicefind
spec:
  template:
        metadata:
          labels:
            app: zookeeper-servicefind
        spec:
          containers:
          - env:
            - name: TZ
              value: Asia/Shanghai        
            name: zookeeper
            image: zookeeper:3.5.5
            ports:
              - containerPort: 2181
                name: zookeeper            
---
apiVersion: v1
kind: Service
metadata:
  name: push-connector
  labels:
    app: push-connector-dubbo
spec:
  ports:
    - port: 6789
      nodePort: 30789
      targetPort: 6789
      name: push-connector
  selector:
    app: push-connector-dubbo
  type: NodePort
---
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: push-connector
  labels:
    app: push-connector-dubbo
spec:
  template:
    metadata:
      labels:
        app: push-connector-dubbo
    spec:
      containers:
      - env:
        - name: TZ
          value: Asia/Shanghai         
        name: push-connector
        image: comsince/push-connector
        ports:
          - containerPort: 6789
---
apiVersion: v1
kind: Service
metadata:
  name: push-group
  labels:
    app: push-group-web
spec:
  ports:
    - port: 8081
      nodePort: 30081
      targetPort: 8081
      name: push-group
  selector:
    app: push-group-web
  type: NodePort
---
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: push-group
  labels:
    app: push-group-web
spec:
  template:
    metadata:
      labels:
        app: push-group-web
    spec:
      containers:
      - env:
        - name: TZ
          value: Asia/Shanghai         
        name: push-group
        image: comsince/push-group
        ports:
          - containerPort: 8081

```