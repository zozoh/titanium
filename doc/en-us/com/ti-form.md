---
title : <ti-form>
author: zozoh(zozohtnt@gmail.com)
tags:
- ti
- com
---

------------------------------------------------------
# Properties

## config

Define the schema(`Object`) of  data presentation.

```js
{
  // field com value -> form data
  serilizers : {
    "Key" : (val, key)=>Any
  },
  // form data -> field com value
  transformers : {
    "Key" : (val, key)=>Any
  },
  statusIcons : {
    spinning : 'fas-spinner fa-spin',
    error    : 'zmdi-alert-polygon',
    warn     : 'zmdi-alert-triangle',
    ok       : 'zmdi-check-circle',
  },
  // if serialize the data, how to format to JSON string
  // default is null, will output JSON compactly
  json : {
    tabs : '   '    // tabs, default 3 whitespaces
  },
  // it will render class to root element
  //  - `tiny`  : "as-spacing-tiny"
  //  - `comfy` : "as-spacing-comfy"
  spacing : "comfy",
  // Form fields
  fields : [{
    // @see `Data Type`
    type  : "Object
    // field modes
    disabled : false,
    hidden   : false,
    // Key in data, if array, it will pick out a object as the value
    name  : "name",
    icon  : "im-file",      // Field icon
    // Field title, `undefined` will auto use `key` as title
    // if `null`, the filed title will be hidded
    title : "i18n:xxx",
    tip   : "i18n:xxx"
    // Applied when undeinfed value
    undefinedAs : undeinfed,
    // Applied when null value
    nullAs : null,
    // Applied when NaN value
    nanAs : -1,
    // The component name, if undefined, it will auto evaluate by `type`
    comType : "ti-input",
    // The component properties, default is `undefined`
    comConf : {..}
    // Customized serializer
    serializer : String | Object | (val)=>Any
    // Customized transformer
    transformer : String | Object | (val)=>Any
  }, {
  	type  : "Group",
  	title : "i18n:xxx",
  	fields : [{
      // Nested field
  	}]
  }]
}
```

The callback function `serializer | transfomer` support `Object` type value which look like :

```js
{
  name : "toPercent",  // Function name declare in global set
  args : [3],          // The default arguments in function
}
```

For example, the function `toPercent` is:

```js
function toPercent(val, fixed=2) {
  return (val * 1).toFixed(2)
}
```

The `args` will declare the default argument value for it by `_.partialRight`


## data

The data(`Object`) to present by current form.

```js
{
  // This is a plain javascript object
}
```

Each field input data flow:  

```
data[key] 
   -> transformer
         -> com`
```
Each field output data flow:

```
com.$emit("changed")
   -> serializer
      -> data[key]
```

## status

The status of whole form

```js
{
	changed   : false,   // indicate the data changed
  saving    : false,   // indicate the data saving
  reloading : false,   // indicate the data reloading
}
```

## fieldStatus

The status for each fields

```js
{
  "fieldA" : {
    // Special status
    status : "error|warn|ok|spinning",
    // Message for current status
    message : "i18n:xxx",
  }
}
```

------------------------------------------------------
# Data Type

  Type              | JSON            | Com Value  | Default Component
----------------------|------------------|------------------|-------------------
`"String"`    | `String`   | `String`  | `<ti-label>` 
`"Number"`    | `Number`   |`Number`   | `<ti-input>` 
`"Integer"`  | `Integer`|`Integer`   | `<ti-input>` 
`"Boolean"`  | `Boolean`|`Boolean` |`<ti-toggle>`
`"Object"`    | `Object`   | `Object`  | `<ti-pair>` 
`"Array"`       | `Array`     |`Array`      | `<ti-list>` 
`"DateTime"`| `String`   |`Date`        | `<ti-date>` 
`"AMS"`            | `Integer`|`Date`        | `<ti-date>` 

```
`class TiTime`   |`<ti-form-time>`
`class TiColor` | `<ti-form-pick-color>`
`class TiPhoneNumber` | `<ti-form-input-phone>` 
`class TiEmail`         | `<ti-form-input-email>` 
`class TiAddress`     | `<ti-form-casecade-address>` 
`class TiCurrency` | `<ti-form-currency>` 
`class TiImage`    | `<ti-form-image>` 
```

------------------------------------------------------
# Event

## changed

```js
{
  name  : "xxx",   // String|Array which key be changed
  value : Any      // The value
}
```

## invlaid

```js
{
  name  : "xxx",   // String|Array which key be changed
  value : Any,     // The value
  errMessage : "i18n:xxx"
}
```

------------------------------------------------------
# Methods

- `getData`
- `setData`
- `showFields`
- `hideFields`
- `disableFields`
- `enableFields`








