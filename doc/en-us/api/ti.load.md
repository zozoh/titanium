---
title : ti.load
author: zozoh(zozohtnt@gmail.com)
tags:
- API
- method
---

# `ti.load` Loading Resource

```js
function({path, mode="process"})
```

## @params

- `path{String|Array}` : The resource path to be loading. If An array has been passed on, the return value (`Promise.then`) will be array also. The value formed by [ti.use](ti.use.md), base on the resource specifical content type.
- `mode{String}` : default is "process"
  + `process` : Default, load the resource really
  + `explain` : Just output the loading resource map for debug

## @return

*Premise*

## @usage

```js
const path = "@lib:lodash/lodash"
ti.load({path})
// -> it will append <script> in document.head
```

## @see

- [`ti.config`](ti.config.md)
- [`ti.use`](ti.use.md)