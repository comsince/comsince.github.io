---
layout: page
title: About
description: Personal blog using jekyll,which include most note from DevelopNote repoistor
keywords: comsince
comments: true
menu: 关于
permalink: /about/
---



## 联系

* GitHub：[@comsicne](https://github.com/comsince)
* 博客：[{{ site.title }}]({{ site.url }})
* 微博: [@comsince](http://weibo.com/comsince)
* 知乎: [@comsince](http://www.zhihu.com/people/comsince)

## Skill Keywords

#### Software Engineer Keywords
<div class="btn-inline">
    {% for keyword in site.skill_software_keywords %}
    <button class="btn btn-outline" type="button">{{ keyword }}</button>
    {% endfor %}
</div>

#### Mobile Developer Keywords
<div class="btn-inline">
    {% for keyword in site.skill_mobile_app_keywords %}
    <button class="btn btn-outline" type="button">{{ keyword }}</button>
    {% endfor %}
</div>

#### Windows Developer Keywords
<div class="btn-inline">
    {% for keyword in site.skill_windows_keywords %}
    <button class="btn btn-outline" type="button">{{ keyword }}</button>
    {% endfor %}
</div>
