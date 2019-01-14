---
title : ti.config
author: zozoh(zozohtnt@gmail.com)
tags:
- API
- namespace
---

-------------------------------------------------
# `ti.config` Global Configuration

- [set](#set) : Set new [GCO](#GCO) to global.
- [update](#set) : Update new [GCO](#GCO) to global.
- [get](#get) : Get one configuration fields value (same refer). 

-------------------------------------------------
# `GCO`: Global Configuration Object

Here is the gloable configuration looks like:

```js
{
  /*
  @see [prefix]
  */
  "prefix" : {
    "app"   : "app:/ti/app/",
    "ui"    : "com:/ti/ui/",
    "lib"   : "js:/ti/lib/",
    "theme" : "css:/ti/theme/"
  }
  /*
  @see [alias]
  */
  "alias" {
    "@lib:jquery" : "@lib:jquery/2.3.1/jquery_min.js"
    "@lib:lodash" : "@lib:lodash/4.1.5/lodash_min.js"
  }
}
```

## `GCO.prefix`

This section defined all prefix of resource base locations.
For example:

```js
ti.use('@lib:lodash/lodash')
// -> /ti/lib/lodash/lodash.js
```

The value of each prefix obey the form below:

```
[suffix]:[/path/to]
```

If without the `[suffix]` part, no suffix will be appended.
And the content type of the resource will be thought as `text/plain`

The value of `[suffix]` should be one of them below:

 Suffix  | Type       | Comment
---------|------------|-------
js       | `*.js`     | Javascript File
css      | `*.css`    | CSS File
app      | `app.json` | Ti App config File
com      | `com.json` | Ti Component config File

```js
//------------------------------------------
// Define the prefix
ti.config.set({
  prefix : {
    "ui"    : "js:/ti/ui/",
    "lib"   : "js:/ti/lib/",
    "app"   : "app:/ti/app/",
    "theme" : "css:/ti/theme/"
  }
})
// -> /my/lib/abc.js  -> [application/x-javascript]
///------------------------------------------
//prefix : `"bar" : "/my/lib/"`
ti.use('@bar:xyz')
// -> /my/lib/xyz  -> [text/plain]
```

## `GCO.alias` Alias for resource

*TODO: NEED DOC*


-------------------------------------------------
# `ti.config.set` : Set Config Object

```js
set({prefix,alias}={prefix={}, alias={}})
```

Same like [ti.config.update](#ti.config.update), but a little differance, it will override all setting of the [GCO](#GCO)


## @params

- `prefix{object}` : Field [prefix](#GCO.prefix) of [GCO](#GCO)

## @return

*undefined*

## @usage

```js
/* If Global Object is:
{
  prefix : {
    "ui"    : "js:/api/ui",
    "lib"   : "js:/ti/lib/"
  }
}
*/
ti.config.set({
  prefix : {
    "ui"    : "js:/ti/ui/",
  }
})
/* Global Object will change to:
{
  prefix : {
    "ui"    : "js:/ti/ui/"
  }
}
*/
```

## @see

- [`ti.use`](ti.use.md)

-------------------------------------------------
# `ti.config.update` : Set Config Object

```js
set({prefix={}})
```

Same like [ti.config.set](#ti.config.set), but a little differance, it will replace all setting of the [GCO](#GCO)

## @params

- `prefix{object}` : Field [prefix](#GCO.prefix) of [GCO](#GCO)

## @return

*undefined*

## @usage

```js
/* If Global Object is:
{
  prefix : {
    "ui"    : "js:/api/ui",
    "lib"   : "js:/ti/lib/"
  }
}
*/
ti.config.update({
  prefix : {
    "ui"    : "js:/ti/ui/",
  }
})
/* Global Object will change to:
{
  prefix : {
    "ui"    : "js:/ti/ui/",
    "lib"   : "js:/ti/lib/"
  }
}
*/
```

## @see

- [`ti.use`](ti.use.md)

-------------------------------------------------
# `get` : Get Configuration

```js
get(key=null): Any
```

Get one field value from [GCO](#GCO), or entire [GCO](#GCO) if `null` has been passsed. The return value should be the same refer with the [GCO](#GCO) instance, which mean, if you mutate the value, it will effect the [GCO](#GCO), because you are mutate the same copy of it.

## @params

- `key{string}` : The field key of which you want to get. Whole [GCO](#GCO) will be returned when you passed `null`. It supported the dotted seperated path string also.

## @return

`Any Object` which is the same copy of [GCO](#GCO).

## @usage

```js
const prefix = ti.config.get("prefix")
// => {"ui":"xxx", "lib":"xxx" ...}

const uiPrefix = ti.config.get("prefix.ui")
// => "js:/ti/ui"
```

## @see

- [`ti.use`](ti.use.md)
