---
title : ti.load
author: zozoh(zozohtnt@gmail.com)
tags:
- API
- namespace
---

-------------------------------------------------
# `ti.load` Overview

- [run](#run) : Do the resource loading.
- [explain](#explain) : Brief resource loading map for a glance.

-------------------------------------------------
# `ti.load.run` Loading Resource

```js
run(path, {recur=true,forceArray=false}={}): Promise
```

> @see
> - [`ti.config`](ti.config.md)
> - [`ti.use`](ti.use.md)

## `run@params`

- `path{String|Array}` : see [load.path](#load.path) for more detail.
- `recur{Boolean}` : explain the resource loading chain deeply
- `forceArray{Boolean}` : Whatever `path` is array or not, always return array

## `load.path`

The path of resouce to be loaded. If An `Array` has been passed on, the return value (`Promise.then`) should be `Array` also. 

A path formed like: 

```
[Loading Mode][@[Prefix]:][Path]
```

for example:

```bash
# load jQuery library
"js@lib:jquery"

# load foo.bar/app.json
"app@app:foo.bar"

# load foo.bar/components/profile/com.json
"com@app:components/profile"
```

All supported `Loading Mode` is below:

Mode   | UseType | Recur   | AutoSuffix
-------|---------|---------|-----------
`text` | `text`  | *No*    | *None*
`js`   | `script`| *No*    | `.js`
`!js`  | `script`| *No*    | *None*
`css`  | `css`   | *No*    | `.css`
`!css` | `css`   | *No*    | *None*
`json` | `json`  | *No*    | *None*
`app`  | `json`  | **Yes** | `/app.json`
`com`  | `json`  | **Yes** | `/com.json`

If you don't declare the `Loading Mode`, it will be auto detected by url suffix.

  Loading Mode      | Auto Detected
--------------------|-------------------------
`"css@theme:light"` | `"@theme:light.css"`
`"app@app:foo.bar"` | `"@app:foo.bar/app.json"`
`"com@ti:my.com"`   | `"@ti:my.com/com.json"`



## `run@return`

`Promise` object. 

If An array has been passed on, the return value (`Promise.then`) will be array also. The value created by [ti.use](ti.use.md), relay on the specifical resource type.

That is to say, if you passed one single string value as the param `path`, it will invoke the [ti.use](ti.use.md) to load the resource, when it's been done, the return value, which defined in [ti.use](ti.use.md) will be passed to the `resolve` method.

If you passed an array, each element is a string as the path, it will invoke [ti.use](ti.use.md) by `Promise.all`, if all resources have been loaded, an array which contains the return value of each resource will be passed to the `resolve` method. Of cause, the order is the same as the input param `path`.

## `run@thrown`

- `{errCode:"e.ti.load.invalid_path", data:[path]}`

## `run@usage`

```js
ti.load.run("js@lib:lodash").then(re=>console.log(re))
// -> <script> Element

ti.load.run(["js@lib:lodash", "js@lib:jquery"])
  .then(re=>console.log(re))
// -> [<script> Element, <script> Element]
```

-------------------------------------------------
# `ti.load.explain` What Will Be Loaded

```js
explain(path, {recur=false,forceArray=false}={}): {Promise|Object}
```
It is given you a way to get the resource loading chain for your understanding of what will be loaded by `ti.load.run` actually.

## `explain@params`

- `path{String|Array}`
- `recur{Boolean}`
- `forceArray{Boolean}`

Please see [run@params](#run@params)

## `explain@return`

`Object` when you passed `{recur:false}`. 

`Promise` when you passed `{recur:true}`, for the reason, it may has to be sent async request to server for several times. You will received the map object in `Promise.then`

The form of map object look like this:

```js
[{
  "mode" : "js",      // loading mode
  "type" : "script",  // resource type
  "name" : "@lib:jquery",         // resource name
  "target" : "/rs/js/jquery.js",  // full path of the resource
  "autoSuffix" : ".js",
  "canRecur" : false,
  "index"  : 0,   // The index of result list
  "data" : [Script Element]
}, {
  "mode" : "app",
  "type" : "json",
  "name" : "@app:foo.bar",
  "target" : "/rs/app/foo.bar/app.json",
  "indexes" : 1,
  "autoSuffix" : "/app.json",
  "canRecur" : true,
  "data" : {/*..content of app.json*/},
}]
```

The field value of `type` can be one of the `"css|app|com|json|text"`， [SameValueZero][svz] default should be `"text"`

If `type` is `"app"` or `"com"`, received value should be parsed to `data` field, then it will be analyzed deeply when `{recur:true}`

## `explain@usage`

```js
ti.load.explain("app@app:my.app").then(re=>console.log(re))
/*->
{
  "type" : "js",
  "name" : "@app:my.app",
  "target" : "/rs/app/my.app/app.json",
  "index"  : 0,
  "data" : {
    ...
  }
}
*/
```

## @see

- [`ti.config`](ti.config.md)
- [`ti.use`](ti.use.md)


[svz]:http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero