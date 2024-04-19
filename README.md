# 概述
基于Jekyll的个人博客项目，这里有一篇关于如何[使用Github Pages建独立博客](https://comsince.github.io/2012/02/22/github-pages/) 的文章,
* [即时通讯客户端vue版本](https://web.fsharechat.cn)

# 发布步骤

* 安装jekyll

```
ubutun 20.08 jekyll 部署
sudo apt-get install ruby-full build-essential zlib1g-dev
echo '# Install Ruby Gems to ~/gems' >> ~/.bashrc
echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
gem install jekyll bundler 出现安装jekyll失败，单独安装jekyll
gem install jekyll --version 3.8.6  指定jekyll版本，不然默认版本会保sass错误，让升级gem，但是又无法升级
gem install github-pages 188
启动
bundle exec jekyll serve -H 172.16.40.51
```

* 下载本项目源码，编译本项目

```
bundle exec jekyll build
```

* 提交编译好文件_site到nginx中部署