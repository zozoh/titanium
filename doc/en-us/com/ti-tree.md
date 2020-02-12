---
title : <ti-tree>
author: zozoh(zozohtnt@gmail.com)
tags:
- ti
- com
---

# Tree Overview

Tree has following behaviors:

- `Open/Close` Node
- Select node by `value`
- Select node by `path`
- `href` in node

# Properties

-------------------------------------------------------------------
## className

```js
"className" : {
  type : String,
  default : null
}
```

## nodeClassName

```js
"nodeClassName" : {
  type : String,
  default : null
}
```

-------------------------------------------------------------------
## data

```js
"data" : {
  type : Array,
  default : ()=>[]
}
```

-------------------------------------------------------------------
## idBy

```js
"idBy" : {
  type : [String, Function],
  default : "id"
}
```

How to get `id` from the tree node data.
An `id` is the unique `String` value in whole tree.

-------------------------------------------------------------------
## nameBy

```js
"nameBy" : {
  type : [String, Function],
  default : "name"
}
```

How to get `name` from the tree node data.
An `name` is the unique `String` value in the nodes with the same parent.

-------------------------------------------------------------------
## childrenBy

```js
"childrenBy" : {
  type : [String, Function],
  default : "children"
}
```

How to get `children` from the tree node data.

- `String` : The key of children data in raw-data
- `Function` : how to pick out the children `Array` from raw-data, support `async`.

The `children` is an `Array`, contains all children nodes of current node.

-------------------------------------------------------------------
## leafBy

```js
"leafBy" : {
  type : [String, Function],
  default : "!children"
}
```

Test give node data is `leaf` or not.

- `String`: it will `_.get` the value and test `falsy`. It starts with `!`, it will `not` the result.
- `Function`: it wll return `true` or `false` to indicate the given item is leaf or not.
 `true` is mean the given item is leaf, so it will hidden the `open/close` handle.
 The function will be invoked by on argument `(item)`, which it sh raw-data of given `data` in prop.

-------------------------------------------------------------------
## title

```js
"title" : {
  type : String,
  default : 'i18n:title'
}
```

For `table mode`, defined the `main-column` title.

-------------------------------------------------------------------
## mainWidth

```js
"mainWidth" : {
  type : [String, Number],
  default : 'stretch'
}
```

For `table mode`, defined the `main-column` width.

-------------------------------------------------------------------
## display

```js
"display" : {
  type : [String, Object, Array],
  default : "name"
}
```

How to display the tree node self. `@see` the `<ti-table>`

-------------------------------------------------------------------
## defaultOpenDepth

```js
"defaultOpenDepth" : {
  type : Number,
  default : 1
}
```

Default to open the node in depth. The top node depth is `0`, which eqausls the path array length.

-------------------------------------------------------------------
## keepOpenBy

```js
"keepOpenBy" : {
  type : String,
  default : null
}
```

Local store to save the tree open status

-------------------------------------------------------------------
## changedId

```js
"changedId" : {
  type : String,
  default : null
}
```

Indicate which row has been change. If changed, it will show up special
mark to highlight the status.

The value will be `_.isEqual` with the result of `idBy`.

In whole table, only one record can be marked as **changed**.

-------------------------------------------------------------------
## currentId

```js
"currentId" : {
  type : String,
  default : null
}
```

Indicate the current row outside from the component.

> It will auto update the private status `myCurrentId` and `myLastIndex`

-------------------------------------------------------------------
## checkedIds

```js
"checkedIds" : {
  type : Array,
  default : ()=>[]
}
```

Indicate the checked rows outside from the components.

> It will auto update the private status `myCheckedId`

-------------------------------------------------------------------
## openedNodePaths

```js
"openedNodePaths" : {
  type : Object,
  default : ()=>({})
}
```

Indicate the opened nodes outside from the components.

> It will auto update the private status `myOpenedNodePaths`

-------------------------------------------------------------------
## multi

```js
"multi" : {
  type : Boolean,
  default : false
}
```

Support multi rows selecting. If `false`, only one row can be checked whatever the `checkedId`.

If `multi` mode is enabled. It will support `Shift+Click` and `Ctrl+Click` to multi-select the rows.

> It is effected only when `selectable` is enabled.

-------------------------------------------------------------------
## checkable

```js
"checkable" : {
  type : Boolean,
  default : false
}
```

Show the checkbox at the begin or each row. Default is `false`.

-------------------------------------------------------------------
## selectable

```js
"selectable" : {
  type : Boolean,
  default : true
}
```

Can select

-------------------------------------------------------------------
## cancelable

```js
{
  type : Boolean,
  default : true
}
```

If `true`, user can cancle selected current row by click blank area.

-------------------------------------------------------------------
## hoverable

```js
{
  type : Boolean,
  default : true
}
```

If `true`, show hover style when mouse hover the table-row.

-------------------------------------------------------------------
## puppetMode

```js
{
  type : Boolean,
  default : false
}
```

By path to children component `ti-table`.

-------------------------------------------------------------------
## width

```js
"width" : {
  type : [String, Number],
  default : null
}
```

-------------------------------------------------------------------
## height

```js
"height" : {
  type : [String, Number],
  default : null
}
```

-------------------------------------------------------------------
## border

```js
"border" : {
  type : String,
  default : "row",
  validator : (v)=>/^(row|column|cell|none)$/.test(v)
}
```

Indicate the border aspect.

- `none`: No border.
- `row`: border for each row
- `column`: border for each column
- `cell`: border for each cell

-------------------------------------------------------------------
## autoScrollIntoView

```js
"autoScrollIntoView" : {
  type : Boolean,
  default : true
}
```

Auto scroll the first highlight item into view

-------------------------------------------------------------------
## autoOpen

```js
"autoOpen" : {
  type : Boolean,
  default : false
}
```

If `true`, it will auto-open the sub-tree, when focus one node.

-------------------------------------------------------------------
## showRoot

```js
"showRoot" : {
  type : Boolean,
  default : true
}
```
Show the root node

-------------------------------------------------------------------
## nodeHandleIcons

```js
"nodeHandleIcons" : {
  type : Array,
  default : ()=>[
    "zmdi-chevron-right",
    "zmdi-chevron-down"]
}
```

Decleare the node handle icon aspect. It is `Array["Closed Icon", "Opened Icon"]`.

-------------------------------------------------------------------
## extendFunctionSet

```js
"extendFunctionSet" : {
  type : Object,
  default : ()=>({})
}
```

Extend function set for `transformer` in each field `display`

-------------------------------------------------------------------
## fields

```js
"fields" : {
  type : Array,
  default : ()=>[]
}
```

> `@see` the defination in `<ti-table>`

-------------------------------------------------------------------
## blankAs

```js
"blankAs" : undefined
```

@see [TiTable>Properties>blankAs](ti-table.md#blankAs) 

-------------------------------------------------------------------
# Tree Node

```js
{
  id     : "45y..9r1",    // -> idBy(item)
  name   : "xiaobai",     // -> nameBy(item)
  icon   : "zmdi-chevron-right",  // -> nodeHandleIcons
  path   : ["user", "xiaobai"],   // node name path
  pathId : "user/xiaobai",        // default ID
  depth  : 0,        // top is 0
  opened : true,     // Node opened or closed
  leaf   : false,    // -> leafBy
  rawData : {...},   // primary data 
  children : [..]    // -> childrenBy
}
```

-------------------------------------------------------------------
# Events

## selected

When row selected/checked or canceled, it will emit the event with payload:


```js
currentId : ID,    // current row ID
checkedIds : {     // All checked row id set
  [ID] : true     
},
selected : [..],   // checked rows raw-data
current : {..}     // current row raw-data     
```

## item:changed

When cell display item `changed`, it will emit the event with payload:

```js
name  : {DiplayItemKey},   // the display item key
value : Any                // The display UI changed event payload
data  : {..},    // Relative node raw-data
nodeId : ID,     // Relative node ID
node  : {   // The relative node 
  /* @see TreeNode*/
}
```

## opened-status:changed

When node open or closed, it will emit the event with payload:

```js
{
  "Array/0" : false,
  "Array/1" : true,
  "Array/2/pet" : true
}
```

## opened

When node opened, it will emit the event with payload:

```js
{
  /*@see TreeNode*/  
}
```

## closed

When node closed, it will emit the event with payload:

```js
{
  /*@see TreeNode*/  
}
```

