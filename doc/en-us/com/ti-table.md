---
title : <ti-table>
author: zozoh(zozohtnt@gmail.com)
tags:
- ti
- com
---

-------------------------------------------------------------------
# Overview

```
Table
|-- data
    |-- Record
        |-- Field Cell
            |-- Display Item
```

- `select`: User click one row
- `check`: User click the `checkbox` of one row, or `Ctrl/Shift+Click` in `multi` mode.
- `cancel` Unselect the checked row.

-------------------------------------------------------------------
# Properties

-------------------------------------------------------------------
## fields

```js
"fields" : {
  type : Array,
  default : ()=>[]
}
```

Defind each column of the table by `Array{Object}`, The element in Array should like:

```js
{
  title : "i18n:xxx",
  display : "theName"
}
```

The field `display` defined how to render the column.
You can declare the value in three modes below:

 Type     | Description
----------|------------
`String`  | render by `ti-label`
`Object`  | customized the display method
`Array{String|Object}` | multi rendering

It will be formatted to Array like:

```js
[{
  key : "theName",
  uniqueKey : "theName", // String form by `key`
  type : "String",       // @see Ti.Types
  transformer : "toStr", // @see Ti.Types.getFuncByType()
  comType : "ti-label",
  comConf : {}
}]
```

The `key` present the way how to pick the value from row data.
It can be `String` or `Array`:
- `String` : as key path to get the value
- `Array`  : as key set to pick a new object

**Note!!** If key is falsy, the field will be ignored

-------------------------------------------------------------------
## idBy

```js
"idBy" : {
  type : [String, Function],
  default : "id"
}
```

Indicate the way to get `id` from raw data. The value could be:

- `String`: Key in raw data to pick out the ID
- `Function`: Cutomized method to pick out the ID from raw data.

The `id` of the raw data is the unique identification of each record.
The value of the `id` should be `String`.

-------------------------------------------------------------------
## className

```js
"className" : {
  type : String,
  default : null
}
```
Customized class selector name in root element of the table component.

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
## data

```js
"data" : {
  type : Array,
  default : ()=>[]
}
```

The input raw data to render by the component.

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
## border

```
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
# Data

```js
data: ()=>({
  myLastIndex: 0,     // The last row index selected by user
  myCurrentId: null,  // Current row ID
  myCheckedIds: {},   // Which row has been checked
  theData: [],        // The data evaluated into fix-form
  myViewPortWidth: 0, // Update-in-time, root element width
  myColSizes: {
    primary: [],  // Primary Max Col-Sizes
    amended: []   // The col-size to display in DOM
  }
})
```


-------------------------------------------------------------------

-------------------------------------------------------------------

-------------------------------------------------------------------

-------------------------------------------------------------------
