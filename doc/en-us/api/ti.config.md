---
title : ti.config
author: zozoh(zozohtnt@gmail.com)
tags:
- API
- method
---

# `ti.config` Global Configuration

```js
function(conf={})
```

`ti.config` should be invoked before you call `ti.load -> ti.setup`. It's given you a chance to tell `ti.use` where is the resources base location actually.

Here is the gloable configuration manifest below:

```js
{
  /*
  Define all resource prefix here. 
  
  ti.use('@lib:lodash/lodash')
    // -> /gu/ti/lib/lodash/lodash.js

  The value of each prefix obey the form below:

    [suffix]:[/path/to]
  
  if without the `[suffix]` part, no suffix will be appended.
  And the content type of the resource will be thought as 'text/plain'
  ------------------------------------------
  prefix : `"foo" : "js:/my/lib/"`
  ti.use('@foo:abc')
    // -> /my/lib/abc.js  -> [application/x-javascript]
  ------------------------------------------
  prefix : `"bar" : "/my/lib/"`
  ti.use('@bar:xyz')
    // -> /my/lib/xyz  -> [text/plain]
  */
  "prefixes" : {
    "ui"    : "js:/gu/ti/ui/",
    "lib"   : "js:/gu/ti/lib/",
    "app"   : "json:/gu/ti/app/",
    "theme" : "css:/gu/ti/theme/"
  }
}
```

## @params

- `conf` : the setup object

## @return

*undefined*

## @usage

```js
ti.config({
  "prefixes" : {
    "ui"    : "js:/gu/ti/ui/",
    "lib"   : "js:/gu/ti/lib/",
    "app"   : "json:/gu/ti/app/",
    "theme" : "css:/gu/ti/theme/"
  }
})
```

## @see

- [`ti.setup`](ti.setup.md)
- [`ti.load`](ti.setup.md)
- [`ti.use`](ti.use.md)