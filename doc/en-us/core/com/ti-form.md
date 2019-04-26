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
  validators : {
    "Key" : (val, key)=>Error
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
    serializer : String | (val, key)=>Any
    // Customized transformer
    transfomer : String | (val, key)=>Any
    // Customized validator.
    // Please @see 'Validate' section for more detail
    validator : String | (val, key)=>"i18n:error.message"
  }, {
  	type  : "Group",
  	title : "i18n:xxx",
  	fields : [{
      // Nested field
  	}]
  }]
}
```

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
      -> validator
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

  Type             |  JsType                    | Default Component
---------------------|----------------------------|-------------------
`"String"`   | `String`               | `<ti-form-input>`
`"Number"`   | `Number`               | `<ti-form-input-num>`
`"Boolean"` | `Boolean`             |`<ti-form-toggle>`
`"Object"`   | `Object`                | `<ti-form-pair>`
`"Array"`     | `Array`                   | `<ti-form-list>`
`"Date"`        | `Date`                     | `<ti-form-date>`
`"Time"`        | `class TiTime`   |`<ti-form-time>`
`"DateTime"`   | `Date`                  | `<ti-form-datetime>`
`"Color"`      | `class TiColor` | `<ti-form-pick-color>`
`"Phone"`      | `class TiPhoneNumber` | `<ti-form-input-phone>` 
`"Email`        | `class TiEmail`         | `<ti-form-input-email>` 
`"Address"` | `class TiAddress`     | `<ti-form-casecade-address>` 
`"Currency"` | `class TiCurrency` | `<ti-form-currency>` 
`"Image"`       | `class TiImage`        | `<ti-form-image>` 

--------------------------------------------------------------------------------------
# Event

## changed

```js
{
  name  : "xxx",   // String|Array which key be changed
  value : {..}     // The form data
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








