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
	th_fields.json    # Define the meta form detail
	th_actions.json   # Define the table detail
	thing.json        # It will link to th_meta/table.json
```

The `thing.json` declared the thing set aspect.

```js
{
  //
  // Thing Manager Layout
  // - use "./th_layout.json" to link to special layout configuration
  // - use "@col3" to apply the built-in layout configuration
  // - There are built-in layout list:
  //   + @col3
  //   + @col2
  //   + @col1
  //
  "layout" : "./th_layout.json",
  // Define current thing set special actions. 
  // It will override the default setting in `views/thing-manager.json`
  //  - If falsy, apply the default actions setting in `views` 
  //  - String to link to individual json file
  //  - Use `[]` to disabled the actions meta
  "actions" : [/*@see view.md#View Defination->actions*/],
  // Define the current thing set fields
  //  - String to link to individual json setting file
  //  - `Plain Object`, it will be take the meta defination directly
  "fields" : "./th_fields.json",
  //
  // List
  // 
  "list" : {
		"comType": "ti-table",
    "comConf": {/*...*/},
    "fields" : ["fieldA", "fieldB"]
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
    "comConf": {/*...*/},
    "fields" : ["fieldA", "fieldB"]
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
# Thing Layout

```js
{
  "main" : {
    "name" : "main",
    "type" : "cols",   // tabs | *cols | rows | @xxx
    "size" : "100%",
    "blocks" : [{
      "name" : "search",
     	"type" : "rows",
      "size" : ["40%", "100%"],  // [PC,Mobile]
      "blocks" : [{
          "name" : "filter",
          "type" : "@filter",
          "size" : "50px",
        }, {
					"name" : "sorter",
          "type" : "@sorter",
          "size" : ["32px", 0],  // [PC,Mobile]
        }, {
          "name" : "list",
          "type" : "@list",
          "size" : "stretch"  // will not allow customizing
        }, {
          "name" : "pager",
          "type" : "@pager",
          "size" : "50px"
        }] // search.blocks
    }, {
      "name" : "info",
      "title" : [null, "i18n:thing.info"],
      "type" : "tabs",
      "size" : ["30%", "V:right-center=100%x100%"],
      "tabs" : [{
        "name" : "meta",
        "title" : "i18n:thing.meta",
        "type" : "@meta"
      }, {
        "name" : "content",
        "title" : "i18n:thing.detail",
        "type" : "@content"
      }]
    }, {
      "name" : "files",
      "title" : [null, "i18n:thing.files"],
      "type" : "tabs",
      "size" : ["30%", "H:center-bottom=100%x80%"],
      "tabs" : [{
          "name" : "media",
          "title" : "i18n:thing.media",
          "type" : "@media"
        }, {
          "name" : "attachment",
          "title" : "i18n:thing.attachment",
          "type" : "@attachment"
      }]
    }], // main.blocks
  } // main
}
```

> The thing layout power by `<ti-layout> | <ti-layout-block> | <ti-layout-tabs>`



## Layout Local Status

Save store/recorver the layout setting to local storage as json:

```js
{
  "main" : "100%",
  "search" : ["40%", "100%"],  // [PC,Mobile]
  "filter" ："50px",
  "sorter" : ["32px", 0],  // [PC,Mobile]
  "pager" : "50px",
  "info " : ["30%", "V:right-center=100%x100%"],
  "files" : ["30%", "H:center-bottom=100%x80%"]
}
```

