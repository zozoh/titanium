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
	thing-schema.json  # Schema file to define the aspact of thing manager
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
  "layout" : {/*@see Thing Layout Section below*/},
  // Define current thing set special actions. 
  // It will override the default setting in `views/thing-manager.json`
  //  - If falsy, apply the default actions setting in `views`   
  //  - Use `[]` to disabled the actions meta
  "actions" : [/*@see view.md#View Defination->actions*/],
  // extends method set, it will be add to current component instance
  // - String to link extra method script file
  // - Plain Object is the raw method set
  // - async/await can be allowed
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
# Thing Layout

```js
/*
 There are 3 kinds of layout: "desktop|tablet|phone"
 */
{
  //----------------------------------------
  // Desktop
  //----------------------------------------
  "desktop" : {
    // root layout type: "tabs|cols|rows|@xxx"
    "type" : "cols",
    // If declared, it will allow user to adjust each block size(children only)
    "adjustable" : true,
    // Local store key for saving user adjusting result
    "adjustResult" : "my-thing-desktop",
    "blocks" : [{
      "name" : "search",  // MUST unique in current section(layout.desktop)
     	"type" : "rows",
      "size" : "40%",  // %|px|rem, if adjusted, it will keep the unit
      "blocks" : [{
          "name" : "filter",
          "size" : "50px",
          // This block use @filter, if without defined, block will be skipped
        	"body" : "@filter"
        }, {
					"name" : "sorter",
          "size" : "32px",
          "body" : "@sorter"
        }, {
          "name" : "list",
          "size" : "stretch", // will NOT allow to adjust
          "body" : "@list"
        }, {
          "name" : "pager",
          "size" : "50px",
          "body" : "@pager"
        }] // search.blocks
    }, {
      "name" : "info",
      // show title bar if `icon|title|actions`
      "icon" : "fas-info",          // show title bar
      "title" : "i18n:thing.info",  // show title bar
      "actions" : [/*@see view.md#View Defination->actions*/],
      // tabs will auto add <ti-tabs> in header part
      "type" : "tabs",
      "size" : "30%",
      "blocks" : [{
        "name"  : "meta",
        "title" : "i18n:thing.meta",
        "body"  : "@meta"
      }, {
        "name"  : "content",
        "title" : "i18n:thing.detail",
        "body"  : "@content"
      }]
    }, {
      "name" : "files",
      "title" : "i18n:thing.files",
      "type" : "tabs",
      "size" : "30%",
      "blocks" : [{
          "name"  : "media",
          "title" : "i18n:thing.media",
          "body"  : "@media"
        }, {
          "name"  : "attachment",
          "title" : "i18n:thing.attachment",
          "body"  : "@attachment"
      }]
    }], // desktop.blocks
    /*
    Panel it float box, default is hidden.
    */
    "panels" : [{
			"name"  : "create",
      // show title bar if `icon|title|closer=default`
      "icon"   : "zmdi-flare",
      "title"  : "i18n:thing.create",
      // closer button's position
      // "default" - right/top at title bar
      // "none" - no closer
      // "bottom" - bottom/center lamp cord
      // "top" - center/top shrink button 
      // "left" - center/left shrink button 
      // "right" - center/right shrink button 
      "closer" : "default",
      // Position of the original point of the panel
      // @see Ti.Rect.doctIn
      "position" : "center-top",
      "width"  : "100%",
      "height" : "100%",
      // user can adjust the size
      //  - true : both x/y
      //  - "x"  : x only
      //  - "y"  : y only
      //  - false : forbid adjust size
      "adjustable" : true,
      // panel body component instance
      "body"  : "@create"
    }]
  }, // desktop
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

> The thing layout power by `<ti-layout> | <ti-layout-block>`



## Layout Local Status

Save store/recorver the layout setting to local storage as json:

```js
{
  "search" : "40%",
  "filter" ："50px",
  "sorter" : "32px",
  "pager" : "50px",
  "info " : "30%",
  "files" : "30%",
  "create" : {
    width  : "70%",
    height : "45%" 
  }
}
```

