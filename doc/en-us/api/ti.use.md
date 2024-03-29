---
title : ti.use
author: zozoh(zozohtnt@gmail.com)
tags:
- API
- method
---

# `ti.use` 资源加载

```js
function(url, {type="auto"}={})
```

资源加载，支持如下资源类型:

 URL模式  | 加载方式  | 说明
----------|----------|----------------
`*.js`    | script   | JS 脚本将会用 `<script>` 加载
`*.css`   | css      | CSS 文件将会用 `<link>` 加载
`*.json`  | json     | 通过 `XmlHttpRequest` 对象加载，并将内容转换为 Json
`Any`     | text     | 通过 `XmlHttpRequest` 对象加载

> 如果是自动模式 `mode="auto"`，则会自动根据 `url` 按照上表进行推断

## @params

- `url{String}` : 资源的路径或者 `URL`
- `mode{String}` : 指明加载方式 `script|css|json|text|auto`, 默认 `auto` 表示自动根据 `url` 推断

## @return

*Promise* 对象，其 `resolve` 的值为

 加载方式 | resolve 值
---------|----------------
script   | `<script>`
css      | `<link>`
json     | Object
text     | String

## @usage

```js
// 加载普通 JS 库，会在 <head> 最后增加 <script> 标签
ti.use("/path/to.js")
    .then(re => console.log(re))
    .catch(err => console.warn(err))
//=> <script> Element

// 加载普通 CSS 样式表
ti.use("/path/to.css")
    .then(re => console.log(re))
    .catch(err => console.warn(err))
//=> <link> Element

// 加载 JSON
ti.use("/path/to.json")
    .then(re => console.log(re))
    .catch(err => console.warn(err))
//=> {..}

// 加载文本，假设 to.text 内容为 `Hello Titanium`
ti.use("/path/to.text")
    .then(re => console.log(re))
    .catch(err => console.warn(err))
//=> "Hello Titanium"

// 强制加载 JSON 文本
ti.use("/path/to.text", {mode:"json"})
    .then(re => console.log(re))
    .catch(err => console.warn(err))
//=> {..}
```