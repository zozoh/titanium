---
title : ti.dom
author: zozoh(zozohtnt@gmail.com)
tags:
- API
- namespace
---

----------------------------------------------------
# `ti.dom` Overview

Provide a dom quick operation layer

----------------------------------------------------
# `createElement`

```js
ti.dom.createElement({tagName="div", attrs={}, props={}, className=""}, $doc=document):Element
```

## @params

- `options{Object}` : Element defination
  + `tagName{String}` : Element Tag Name, default by `div`
  + `attr{Object}` : Attribute set for the element, default by empty
  + `props{Object}` : Properties set for the element, default by empty
  + `className{String}` : Class selector for the element, name splited by whitespace
- `$doc` : The Document Object which provided the `createElement` method really.

## @return

New DOM Element, which not join the DOM tree yet.

## @usage

```js
const $div = ti.com.createElement({})
// -> <div>
```

----------------------------------------------------
# `appendToHead`

```js
ti.dom.appendToHead($el, $head=document.head) 
```

----------------------------------------------------
# `findAll`

```js
ti.dom.findAll(selector="*", $doc=document)
```

----------------------------------------------------
# `find`

```js
ti.dom.find(selector="*", $doc=document)
```