---
title : 动作执行
author: zozoh(zozohtnt@gmail.com)
---

# 执行种类

 Name     | Example                | Comments
----------|------------------------|-----------
`global`  |`global:alert('hello')` | 全局调用
`commit`  |`commit:main/toggle`    | App.commit
`dispatch`|`dispatch:main/save`    | App.dispatch
`root`    |`root:doSomething(true)`| App.root
`main`    |`main:invokIt(23)`      | App.main
`=>`      |`=>alert('hello')`      | `global:` 的别名
`$emit`   |`$emit:abc(23)`         | `vm.$emit`
`$notify` |`$notify:abc('haha')`   | `vm.$notify`
`$parent` |`$parent:doSome`        | 调用父控件方法