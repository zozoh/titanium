---
title : <ti-form>
author: zozoh(zozohtnt@gmail.com)
tags:
- ti
- com
---

# Properties

## meta

Define the schema(`Object`) for how to present data

```js
{
  // Form fields
  fields : [{
    // Valid type, 
    type  : "Object",
    // Key in data, if array, it will pick out a object as the value
    key   : "name",
    icon  : "im-file",      // Field icon
    // Field title, `undefined` will auto use `key` as title
    // if `null`, the filed title will be hidded
    title : "i18n:xxx",
    // If value is undefined, it wil be applied
    undefinedAs : undeinfed,
    // If value is null, it will be applied
    nullAs : null,
    // Customized validator.
    // Please @see 'Validate' section for more detail
    validate : (val, key)=>true
  }]
}
```

## data

The data(`Object`) to present by current form.

```js
```

## status

Each field status

```js
{
	// meta data for 
}
```