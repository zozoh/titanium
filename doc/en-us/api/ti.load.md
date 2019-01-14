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
# `run` Loading Resource

```js
run(path, {forceArray=false}={}): Promise
```

> @see
> - [`ti.config`](ti.config.md)
> - [`ti.use`](ti.use.md)

## `run@params`

- `path{String|Array}` : The resource path to be loading. If An array has been passed on, the return value (`Premise.then`) should be `Array` also.
- `forceArray{Boolean}` : Whatever `path` is array or not, always return array

## `run@return`

`Premise` object. 

If An array has been passed on, the return value (`Promise.then`) will be array also. The value created by [ti.use](ti.use.md), relay on the specifical resource type.

That is to say, if you passed one single string value as the param `path`, it will invoke the [ti.use](ti.use.md) to load the resource, when it be done, the return value, which defined in [ti.use](ti.use.md) will be passed to the `resolve` method.

If you passed an array, each element is a string as the path, it will invoke [ti.use](ti.use.md) by `Premise.all`, if all resources has been loaded, an array which contains the return value of each resource will be passed to the `resolve` method. Of cause, the order is the same as the input param `path`.


## `run@usage`

```js
ti.load("@lib:lodash").then(re=>console.log(re))
// -> <script> Element

ti.load(["@lib:lodash", "@lib:jquery"])
  .then(re=>console.log(re))
// -> [<script> Element, <script> Element]
```

-------------------------------------------------
# `explain` What Will Be Loaded

```js
explain(path, {recur=false,forceArray=false}={}): {Premise|Object}
```
It is given you a way to get the resource loading chain for your understanding of what will be loaded by `ti.load.run` actually.

## `explain@params`

- `path{String|Array}` : please see [run@params](#run@params)
- `recur{Boolean}` : explain the resource loading chain deeply
- `forceArray{Boolean}` : Whatever `path` is array or not, always return array

## `explain@return`

`Object` when you passed `{recur:false}`. 

`Premise` when you passed `{recur:true}`, for the reason, it may has to be sent async request to server for several times. You will received the map object in `Premise.then`

The form of map object look like this:

```js
[{
  "type" : "js",   // resource type
  "name" : "@lib:jquery",         // resource name
  "target" : "/rs/js/jquery.js",  // full path of the resource
  "index"  : 0,   // The index of result list
}, {
  "type" : "app",
  "name" : "@app:foo.bar",
  "target" : "/rs/app/foo.bar/app.json",
  "data" : {/*..content of app.json*/},
  "indexes" : 1
}]
```

The field value of `type` can be one of the `"css|app|com|json|text"`， [SameValueZero][svz] default should be `"text"`

If `type` is `"app"` or `"com"`, received value should be parsed to `data` field, then it will be analyzed deeply when `{recur:true}`

## `explain@usage`

```js
ti.load.explain("@app:my.app").then(re=>console.log(re))
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