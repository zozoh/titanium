---
title : ti.ns
author: zozoh(zozohtnt@gmail.com)
tags:
- API
- method
---

# `ti.ns(fullname, obj)` 声明名称空间

在 `Titanium` 声明名称空间的方法。当然你可以用这个函数声明自己的具备 `Ti` 风格的名称空间。

## @params

- `fullname{String}` : 名称空间全名，譬如 `ti.load`
- `obj{Function|Object}` : 定义对象，可以是函数，也可以是一个对象表示一个方法集

## @return

*undefined*

## @usage

```js
ti.ns("your.app.name", {
    "funcA" : function(){/*..*/}
    "funcB" : function(){/*..*/}
})
```