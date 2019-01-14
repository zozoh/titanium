---
title : ti.use
author: zozoh(zozohtnt@gmail.com)
tags:
- API
- method
---

# `ti.use(url,{conf})` 资源加载

```js
function(url, {mode="auto"})
```

资源加载，支持如下资源类型:

 URL模式  | 加载方式  | 说明
----------|----------|----------------
`*.js`    | script   | JS 脚本将会用 `<script>` 加载
`*.css`   | css      | CSS 文件将会用 `<link>` 加载
`*.json`  | json     | 通过 `XmlHttpRequest` 对象加载，并将内容转换为 Json
*default* | text     | 通过 `XmlHttpRequest` 对象加载

> 如果是自动模式 `mode="auto"`，则会自动根据 `url` 按照上表进行推断

## @params

- `url` : 资源的路径或者 `URL`
- `conf` : *可选*，默认为 `{mode:"auto"}`
    + `mode` : 指明加载方式 `script|css|json|text`, 如果是 `auto` 为自动决定

## @return

*Promise* 对象，其 `resolve` 的值为

 加载方式 | resolve 值
---------|----------------
script   | `https://yoursite.com/context/path/to.js`
css      | `https://yoursite.com/context/path/to.css`
json     | Plain Object
text     | String

## @usage

```js
// 加载普通 JS 库，会在 <head> 最后增加 <script> 标签
ti.use("/path/to.js")
    .then(re => console.log(re))
    .catch(err => console.warn(err))
// "https://yoursite.com/context/path/to.js"

// 加载普通 CSS 样式表
ti.use("/path/to.css")
    .then(re => console.log(re))
    .catch(err => console.warn(err))
// "https://yoursite.com/context/path/to.css"

// 加载 JSON
ti.use("/path/to.json")
    .then(re => console.log(re))
    .catch(err => console.warn(err))
// {..}

// 加载文本，假设 to.text 内容为 `Hello Titanium`
ti.use("/path/to.text")
    .then(re => console.log(re))
    .catch(err => console.warn(err))
// "Hello Titanium"

// 强制加载 JSON 文本
ti.use("/path/to.text", {mode:"json"})
    .then(re => console.log(re))
    .catch(err => console.warn(err))
// {..}
```