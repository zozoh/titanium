---
title : ti.ns
author: zozoh(zozohtnt@gmail.com)
tags:
- API
- method
---

# `ti.ns` 声明名称空间

在 `Titanium` 声明名称空间的方法。当然你可以用这个函数声明自己的具备 `Ti` 风格的名称空间。

## `ti.ns@params`

- `fullname{String}` : 名称空间全名，譬如 `ti.load`
- `obj{Function|Object}` : 定义对象，可以是函数，也可以是一个对象表示一个方法集

## `ti.ns@return`

*undefined*

## `ti.ns@usage`

```js
// Declare a function set
ti.ns("your.app.name", {
    "funcA" : function(){/*..*/}
    "funcB" : function(){/*..*/}
})
// Then you can:
your.app.name.funcA()
your.app.name.funcB()

// Declare a method
ti.ns("foo.bar", function(){
    /*..*/
})
// Then you can:
foo.bar()
```