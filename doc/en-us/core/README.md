---
title : Titanium Core
author: zozoh(zozohtnt@gmail.com)
tags:
- core
- API
---

# Aboute Titanium Core

- [Ti.Version](#Ti.Version)
- [Ti.Namespace](#Ti.Namespace)
- [Ti.App](app.md)
- [Ti.Config](config.md)
- [Ti.Dom](dom.md)
- [Ti.Err](err.md)
- [Ti.Load](load.md)

-------------------------------------
# `Ti.Version`

```js
Version():String
```

Take a glance of current Titanium version.

## `Ti.Version@params`

*No Params*

## `Ti.Version@return`

`String` to indicate current Titanium framework version.

## `Ti.Version@example`

```js
console.log(Ti.Version())
// "1.0"
```

-------------------------------------
# `Ti.Namespace`

```js
Namespace(fullname, obj)
```

## `Ti.Namespace@params`

- `fullname{String}` A dotted seperated string to declare the namespace full path. 
- `obj{Any}` Object to join the namespace
  + Generally, you will pass on `Function|Class`.
  + To add a funtion set, a plain `Object` will be nice.
  + Another object type like `String|Number|Boolean|RegExp|Date`, may taken as a normal global value.

## `Ti.Namespace@return`

*undefined*

## `Ti.Namespace@example`

```js
Ti.Namespace("foo.bar", function(){
  console.log("I am FooBar")
})
// You can access it anywhere by:
foo.bar()
// "I am FooBar"
```

