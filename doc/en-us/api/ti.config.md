---
title : ti.config
author: zozoh(zozohtnt@gmail.com)
tags:
- API
- namespace
---

-------------------------------------------------
# `ti.config` Global Configuration

`ti.config` should be invoked before you call `ti.load -> ti.setup`. It's given you a chance to tell `ti.use` where the resources base location is actually.

- [set](#set) : Set new [GCO](#GCO) to global
- [update](#set) : Update new [GCO](#GCO) to global
- [get](#get) : Get one configuration fields value (same refer). 

-------------------------------------------------
# `GCO`: Global Configuration Object

Here is the gloable configuration look like:

```js
{
  /*
  @see [prefixes]
  */
  "prefixes" : {
    "ui"    : "js:/gu/ti/ui/",
    "lib"   : "js:/gu/ti/lib/",
    "app"   : "json:/gu/ti/app/",
    "theme" : "css:/gu/ti/theme/"
  }
}
```

## `prefiexes`

This section defined all prefixes of resource base locations.
For example:

```js
ti.use('@lib:lodash/lodash')
// -> /gu/ti/lib/lodash/lodash.js
```

The value of each prefix obey the form below:

```
[suffix]:[/path/to]
```

If without the `[suffix]` part, no suffix will be appended.
And the content type of the resource will be thought as `text/plain`

```js
//------------------------------------------
// prefix : `"foo" : "js:/my/lib/"`
ti.use('@foo:abc')
// -> /my/lib/abc.js  -> [application/x-javascript]
///------------------------------------------
//prefix : `"bar" : "/my/lib/"`
ti.use('@bar:xyz')
// -> /my/lib/xyz  -> [text/plain]
```

-------------------------------------------------
# `set` : Set Config Object

```js
set({prefixes={}})
```

Same like [set](#set), but a little differance, it will override all setting of the [GCO](#GCO)


## @params

- `prefixes{object}` : Field [prefiexes](#prefixes) of [GCO](#GCO)

## @return

*undefined*

## @usage

```js
/* If Global Object is:
{
  prefixes : {
    "ui"    : "js:/api/ui",
    "lib"   : "js:/gu/ti/lib/"
  }
}
*/
ti.config.set({
  prefixes : {
    "ui"    : "js:/gu/ti/ui/",
  }
})
/* Global Object will change to:
{
  prefixes : {
    "ui"    : "js:/gu/ti/ui/"
  }
}
*/
```

## @see

- [`ti.use`](ti.use.md)

-------------------------------------------------
# `update` : Set Config Object

```js
set({prefixes={}})
```

Same like [set](#set), but a little differance, it will replace all setting of the [GCO](#GCO)

## @params

- `prefixes{object}` : Field [prefiexes](#prefixes) of [GCO](#GCO)

## @return

*undefined*

## @usage

```js
/* If Global Object is:
{
  prefixes : {
    "ui"    : "js:/api/ui",
    "lib"   : "js:/gu/ti/lib/"
  }
}
*/
ti.config.update({
  prefixes : {
    "ui"    : "js:/gu/ti/ui/",
  }
})
/* Global Object will change to:
{
  prefixes : {
    "ui"    : "js:/gu/ti/ui/",
    "lib"   : "js:/gu/ti/lib/"
  }
}
*/
```

## @see

- [`ti.use`](ti.use.md)

-------------------------------------------------
# `get` : Get Configuration

```js
get(key=null)
```

Get one field value from [GCO](#GCO), or entire [GCO](#GCO) if `null` has been passsed. The return value should be the same refer with the [GCO](#GCO) instance, which mean, if you mutate the value, it will effect the [GCO](#GCO), because you are mutate the same copy of it.

## @params

- `key{string}` : The field key of which you want to get. Whole [GCO](#GCO) will be returned when you passed `null`. It supported the dotted seperated path string also.

## @return

The same copy of [GCO](#GCO).

## @usage

```js
const prefixes = ti.config.get("prefixes")
// => {"ui":"xxx", "lib":"xxx" ...}

const uiPrefix = ti.config.get("prefixes.ui")
// => "js:/gu/ti/ui"
```

## @see

- [`ti.use`](ti.use.md)
