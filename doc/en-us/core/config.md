---
title : Ti.Config
author: zozoh(zozohtnt@gmail.com)
tags:
- core
- API
- namespace
---

# Global Configuration

- [set](#ti.config.set) : Set new [GCO](#GCO) to global.
- [update](#ti.config.update) : Update new [GCO](#GCO) to global.
- [get](#ti.config.get) : Get one configuration fields value (same refer). 
- [url](#ti.config.url) : eval the full resource path by [prefix](#GCO.prefix)

-------------------------------------------------
# `GCO`

Global Configuration Object (`GCO`) is the place that Titanium store its configuration.

Here is the `GCO` looks like:

```js
{
  /*
  @see [prefix]
  */
  "prefix" : {
    "app"   : "/ti/app/",
    "ui"    : "/ti/ui/",
    "lib"   : "/ti/lib/",
    "theme" : "/ti/theme/"
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

This section defined all prefix of resource base locations. For example:

```js
//------------------------------------------
// Define the prefix
Ti.Config.set({
  prefix : {
    "foo" : "/my/foo",
    "bar" : "/my/bar/"
  }
})
///------------------------------------------
Ti.Config.url('@foo:abc')
// -> /my/fooabc
///------------------------------------------
Ti.Config.url('@bar:xyz')
// -> /my/bar/xyz
```

## `GCO.alias`

*TODO: NEED DOC*

-------------------------------------------------
# `Ti.Config.set`

```js
set({prefix,alias})
```

Same like [Ti.Config.update](#Ti.Config.update), but there is a little differance, it will overwrite all setting of the [GCO](#GCO) by params passed on.

## `set@params`

- `prefix{Object}` : Field [prefix](#GCO.prefix) of [GCO](#GCO)
- `alias{Object}` : Field [alias](#GCO.alias) of [GCO](#GCO)

## `set@return`

*undefined*

## `set@usage`

```js
/* If Global Object is:
{
  prefix : {
    "ui"    : "/api/ui",
    "lib"   : "/ti/lib/"
  }
}
*/
Ti.Config.set({
  prefix : {
    "ui"    : "/ti/ui/",
  }
})
/* Global Object will change to:
{
  prefix : {
    "ui"    : "/ti/ui/"
  }
}
*/
```

-------------------------------------------------
# `Ti.Config.update`

```js
update({prefix, alias})
```

Same like [Ti.Config.set](#Ti.Config.set), but there is a little differance, it will merge to the setting of the [GCO](#GCO) by params passed on.

## `update@params`

- `prefix{object}` : Field [prefix](#GCO.prefix) of [GCO](#GCO)
- `alias{Object}` : Field [alias](#GCO.alias) of [GCO](#GCO)

## `update@return`

*undefined*

## `update@usage`

```js
/* If Global Object is:
{
  prefix : {
    "ui"    : "/api/ui",
    "lib"   : "/ti/lib/"
  }
}
*/
Ti.Config.update({
  prefix : {
    "ui"    : "js:/ti/ui/",
  }
})
/* Global Object will change to:
{
  prefix : {
    "ui"    : "/ti/ui/",
    "lib"   : "/ti/lib/"
  }
}
*/
```

-------------------------------------------------
# `Ti.Config.get`

```js
get(key=null): Any
```

Get one field value from [GCO](#GCO), or entire [GCO](#GCO) if `null` has been passsed. The return value should be the same refer with the [GCO](#GCO) instance, which mean, if you mutate the value, it will effect the [GCO](#GCO), because you are mutate the same copy of it.

## `get@params`

- `key{string}` : The field key of which you want to get. Whole [GCO](#GCO) will be returned when you passed `null`. It supported the dotted seperated path string also.

## `get@return`

`Any Object` which is the same copy of [GCO](#GCO).

## `get@usage`

```js
const prefix = Ti.Config.get("prefix")
// => {"ui":"/ti/ui/", "lib":"/ti/lib/"}

const uiPrefix = Ti.Config.get("prefix.ui")
// => "/ti/ui"
```

-------------------------------------------------
# `Ti.Config.url`

```js
url(path=""): String
```

Eval resource full path by [prefix](#GCO.prefix) and [alias](#GCO.alias). Actually, it will apply the  [alias](#GCO.alias) at first, then replace the [prefix](#GCO.prefix) part.

The prefix of the path (`"@app"` or `"@com"` etc.) should be defined in [prefix](#GCO.prefix) field. 

If the input path is not formed like `@xxx:path`, it will be returned directly. If the prefix (`"@xxx"`) is not defined in [prefix](#GCO.prefix), an error will be raised.

## `url@params`

- `path{string}` : reource path formed like `"@app:foo.bar"`

## `url@return`

`String` as the full path of given resource path

## `url@thrown`

- `{errCode:"e.ti.config.prefix_without_defined", data:[prefix]}`

## `url@usage`

```js
//prefix : `{"bar" : "/my/lib/"}`
Ti.Config.url('@bar:xyz')
// -> /my/lib/xyz
```