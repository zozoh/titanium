---
title : Ti
author: zozoh(zozohtnt@gmail.com)
tags:
- core
- API
- namespace
---

# Aboute Titanium Core

**Top Namespaces**

- [Ti.Version](#Ti.Version) : A method of take a glance of current lib version.
- [Ti.Load](#Ti.Load) : A method of async loading resourced.

**Sub Namespaces**

- [Ti.App](app.md)
- [Ti.Config](config.md)
- [Ti.Dom](dom.md)
- [Ti.Err](err.md)

-------------------------------------
# `Ti.Load`

```js
TiLoad(url=[], {dynamicPrefix}={}):Promise
```

## `Load@params`

- `url{String|Array}` : Resource URL to be loaded
- `dynamicPrefix{Object}` : Additional url prefix set


## `Load@return`

`Promise` the object will be returned. If one single string url has been passed on, it will return single one result. If an array has been passed on, result should be grouped as an array. 

These are 5 types resource has been supported by `Ti.Load`:

 Patttern | Mode  | Load By    | Result
----------|-------|------------|---------------
`*.js`    | js    | `<script>` | Script Element
`*.mjs`   | mjs   | `import`   | `ES6 Module default export`
`*.css`   | css   | `<link>`   | Link Element
`*.json`  | json  | `XMLHttpRequest` | Javascript Plain Object
`Any`     | text  | `XMLHttpRequest` | Pure Text

## `Load@thrown`

- `{errCode:"e.ti.use.url_must_string", data:"URL"}`

## `Load@usage`

```js
Ti.Load('@my:mutations.js').then(m=>console.log(m))
// {..}
```


-------------------------------------
# `Ti.Version`

```js
Version():String
```

Take a glance of current Titanium version.

## `Version@params`

*No Params*

## `Version@return`

`String` to indicate current Titanium framework version.

## `Version@usage`

```js
console.log(Ti.Version())
// "1.0"
```



