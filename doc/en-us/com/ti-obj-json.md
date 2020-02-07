---
title : <ti-obj-json>
author: zozoh(zozohtnt@gmail.com)
tags:
- ti
- com
---

-------------------------------------------------------------------
# ObjJson Overview

Provide the `tree|source` two tabs layout for json editing.

-------------------------------------------------------------------
# Properties

## className

```js
"className" : null
```

## data

```js
"data" : null
```

Any valid json data will be allowed.

## tabAt

```js
"tabAt" : {
  type : String,
  default : "bottom-left",
  validator : (v)=>/^(top|bottom)-(left|center|right)$/.test(v)
}
```

## tree

```js
"tree" : {
  type : Object,
  default : ()=>({})
}
```

`JsonTree` properties which the `data` will be replaced by self prop `data`

> @see [`TiObjJsonTree Properties`](ti-obj-json-tree.md#Properties)

