---
title : Sidebar
author: zozoh(zozohtnt@gmail.com)
tags:
- walnut
- concept
---

# What is Thing ?

Thing is just a thing, and it almostly can be anything.

-------------------------------------------------
# Thing Defination

```bash
%THING SET%
  index/
  data/
  thing-schema.json    # GUI components configuration
  thing-layout.json    # Layout defination
  thing-actions.json   # Top action menu
```

-------------------------------------------------
# Schema


```js
{
  // extends method set, it will be add to current component instance
  // - String to link extra method script file
  // - Plain Object is the raw method set
  // - async/await can be allowed when method invoked
  // Thing Module(config) reload schema, if "methods" declared, it will be
  // reloaded also. The loading result will be tidied as Array, each item
  // is a method set. The thing main component will handler the method calling
  // by "main:invoke" method, which accept on argument as the method name.
  // it will invoke the method in "scheme.methods" which context(this) as 
  // the Vue Component instance self.
  "methods" : "@com:support/customized.mjs",
  //
  // List
  // 
  "list" : {
    "comType": "ti-table",
    "comConf": {/*...*/}
  },
  //
  // Filter: falsy to hidden
  //
  "filter" : {
    "comType": "wn-thing-filter",
    "comConf": {/*...*/}
  },
  //
  // Sorter: falsy to hidden
  //
  "sorter" : {
    "comType": "ti-sorter",
    "comConf": {/*...*/}
  },
  //
  // Pager: falsy to hidden
  //
  "pager" : {
    "comType": "ti-pager",
    "comConf": {/*...*/}
  },
  //
  // Meta
  //
  "meta" : {
    "comType": "wn-obj-form",
    "comConf": {/*...*/}
  },
  "content" : {
    "comType": "wn-obj-puretext",
    "comConf": {/*...*/},
  },
  //
  // Files: media/attachment etc
  //
  "media" : {
    "comType" : "wn-thing-files",
    "comConf" : {
      "overwrite" : true,  // overwrite exists file when upload
      "name" : "^.+(png|jpe?g|gif)$",  // file name's pattern
      "mime" : "^image\/", // file mime must match the pattern
      "maxSize" : 1000000  // (Byte) max file size to upload        
    }
  },
  "attachment" : {
    "comType" : "wn-thing-files",
    "comConf" : {/*..*/}
  }
}
```

-------------------------------------------------
# Layout

```js
{
  // Default shown setting
  "shown" : {
		"files" : true
  },
  //----------------------------------------
  // Desktop
  //----------------------------------------
  "desktop" : {
    /* TiGui Properties */
  }, 
  //----------------------------------------
  // Tablet
  // If the value is String, it means that copy the relative setting
  //----------------------------------------
  "tablet" : "phone",
  //----------------------------------------
  // Phone
  //----------------------------------------
  "phone"  : {/*..*/}
}
```

-------------------------------------------------
# Actions

```js
[{
  "key"  : "reloading",
  "type" : "action",
  "icon" : "zmdi-refresh",
  "text" : "i18n:refresh",
  "altDisplay" : {
    "icon" : "zmdi-refresh zmdi-hc-spin",
    "text" : "i18n:loading"
  },
  "action" : "dispatch:main/reload",
  "shortcut" : "CTRL+R"
}]
```

> It will override the top actions menu of `wn.manager`

