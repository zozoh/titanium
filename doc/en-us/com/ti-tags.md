---
title : <ti-tags>
author: zozoh(zozohtnt@gmail.com)
tags:
- ti
- com
---

-------------------------------------------------
# What is `TiTags`

Render a group of tags in piece boxes.

User can :

- remove tag
- change tag value by drop list options.

-------------------------------------------------
# Properties

## className

```js
"className" : null,
```

## data

```js
"data" : {
  type : Array,
  default : ()=>[]
}
```
`[{icon,text,value}]`

Tags data in array with element: 

```js
icon  : "fas-xxx",   // Tag icon
text  : "i18n:xxx",  // Tag text
value : 90           // Tag value (any Js Value)
```

## optionIcon

```js
"optionIcon" : {
  type : String,
  default : null
}
```
Default option icons

## cancelItemBubble

```js
"cancelItemBubble" : {
  type : Boolean,
  default : true
}
```
If click tag, it will cancel the native event bubble up.

## itemOptions

```js
"itemOptions" : {
  type : Array,
  default : ()=>[]
}
```
Give the options for each tag to change the value by drop list.

## itemIcon

```js
"itemIcon" : {
  type : String,
  default : null
}
```
Default drop item icon

## removeIcon

```js
"removeIcon" : {
  type : String,
  default : "zmdi-close"
}
```
The remove icon aspect. `null` to hide the remove icon from each tag.

## statusIcons

```js
"statusIcons" : {
  type : Object,
  default : ()=>({
    collapse : "zmdi-chevron-down",
    extended : "zmdi-chevron-up"
  })
}
```
If has options, it will render the status icon for drop list.
