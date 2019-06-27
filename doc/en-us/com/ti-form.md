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
    type  : "Object"
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
    // Customized serializer： 
    // field com value -> form data
    // @see extendFunctionSet
    serializer : String | Object | (val)=>Any
    // Customized transformer
    // form data -> field com value
    // @see extendFunctionSet
    transformer : String | Object | (val)=>Any
  }, {
  	type  : "Group",
  	title : "i18n:xxx",
  	fields : [{
      // Nested field
  	}]
  }]，
  // extend function set for `serializer` and `transformer`
  extendFunctionSet : {
    "Key" : (val, key)=>Any
  }
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

```js
{
  'String'   : {transformer:"toStr",     serializer:"toStr"},
  'Number'   : {transformer:"toNumber",  serializer:"toNumber"},
  'Integer'  : {transformer:"toInteger", serializer:"toInteger"},
  'Boolean'  : {transformer:"toBoolean", serializer:"toBoolean"},
  'Object'   : {transformer:"toObject",  serializer:"toObject"},
  'Array'    : {transformer:"toArray",   serializer:"toArray"},
  'DateTime' : {transformer:"toDate",    serializer:"formatDate"},
  'AMS'      : {transformer:"toDate",    serializer:"toAMS"}
  // Time
  // Date
  // Color
  // PhoneNumber
  // Address
  // Currency
}
```
> please @see `Ti.Types.getFunctionByType()` for more detail

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

------------------------------------------------------
# Function Set

Defaults, `ti-form` suppor those functions in `serializer|transformer` of each field.
You can expend the function set be `config.extendFunctionSet`

------------------------------------------
## The form of function

Each method in function set should obey the form:

```js
{
  yourMethod : (fieldValue, arg1, arg2) {
    return $theNewFieldValue
  }
}
```

- `fieldValue` filled be form data.  It base on the `name` of each field.
- `arg1, arg2` it will be filled by `serializer|transformer` setting

Type       | `arg1, arg2 ...`
-----------|----------------------
`String`   | `[]`
`Object`   | defined by `.args`
`Function` | Declared by ES6 function default param

------------------------------------------
## Default Function Set

Defaultly, `ti-form` provide some usefully function:

- `toStr(val, fmt)`
- `toNumber(val)`
- `toInteger(val)`
- `toBoolean(val)`
- `toPercent(val)`
- `toBoolean(val)`
- `toArray(val, sep)`
- `toObject(val, fmt)`
- `formatDate(d, fmt="yyyy-MM-dd HH:mm:ss")`
- `toDate(val)`
- `toAMS(val)`

> Please @see `Ti.Types` document for more detail

------------------------------------------
## Example

```js
// String
serializer : "toStr"

// Object
transformer : {
  name : "toDate",
  args : "yyyy-MM-dd"
}

// Function
serializer : (val)=>{
  return `[${val}]`
}
```











