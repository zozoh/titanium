---
title : <ti-form>
author: zozoh(zozohtnt@gmail.com)
tags:
- ti
- com
---

# Properties

## config

Define the schema(`Object`) of  data presentation.

```js
{
  serilizers : {
    "Key" : (val, key)=>Any
  },
  transformers : {
    "Key" : (val, key)=>Any
  },
  statusIcons : {
    spinning : 'fas-spinner fa-spin',
    error    : 'zmdi-alert-polygon',
    warn     : 'zmdi-alert-triangle',
    ok       : 'zmdi-check-circle',
  },
  // Form fields
  fields : [{
    // @see `Data Type`
    type  : "Object",
    // field modes
    disabled : false,
    hidden   : false,
    // Key in data, if array, it will pick out a object as the value
    name  : "name",
    icon  : "im-file",      // Field icon
    status : "error|warn|ok|spinning",
    message : "i18n:xxx",
    // Field title, `undefined` will auto use `key` as title
    // if `null`, the filed title will be hidded
    title : "i18n:xxx",
    tip   : "i18n:xxx"
    // If value is undefined, it wil be applied
    undefinedAs : undeinfed,
    // If value is null, it will be applied
    nullAs : null,
    // The component name, if undefined, it will auto evaluate by `type`
    comType : "ti-form-input",
    // The component properties, default is `undefined`
    comConf : {..}
    // Customized transformer
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

Each field status

```js
{
	changed   : false,   // indicate the data changed
  saving    : false,   // indicate the data saving
  reloading : false,   // indicate the data reloading
}
```

--------------------------------------------------------------------------------------
# Data Type

  Type              | JSON            | Com Value  | Default Component
----------------------|------------------|------------------|-------------------
`"String"`    | `String`   | `String`  | `<ti-form-input>`
`"Number"`    | `Number`   |`Number`   | `<ti-form-input-num>`
`"Integer"`  | `Integer`|`Integer`   | `<ti-form-input-num>`
`"Boolean"`  | `Boolean`|`Boolean` |`<ti-form-toggle>`
`"Object"`    | `Object`   | `Object`  | `<ti-form-pair>`
`"Array"`       | `Array`     |`Array`      | `<ti-form-list>`
`"DateTime"`| `String`   |`Date`        | `<ti-form-date>`
`"AMS"`            | `Integer`|`Date`        | `<ti-form-date>`

```
`class TiTime`   |`<ti-form-time>`
`class TiColor` | `<ti-form-pick-color>`
`class TiPhoneNumber` | `<ti-form-input-phone>` 
`class TiEmail`         | `<ti-form-input-email>` 
`class TiAddress`     | `<ti-form-casecade-address>` 
`class TiCurrency` | `<ti-form-currency>` 
`class TiImage`    | `<ti-form-image>` 
```

--------------------------------------------------------------------------------------
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

--------------------------------------------------------------------------------------
# Methods

- `getData`
- `setData`
- `showFields`
- `hideFields`
- `disableFields`
- `enableFields`








