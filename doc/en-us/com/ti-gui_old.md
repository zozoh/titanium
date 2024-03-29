---
title : <ti-gui>
author: zozoh(zozohtnt@gmail.com)
tags:
- ti
- com
---

-------------------------------------------------
# What is `TiGui`

Render complex GUI by `<ti-layout>|<ti-block>` according the setting of
JSON style defination.

The GUI flow the hierarchy below:

```bash
<ti-gui>
#-----------------------------
# tabs layout
|-- <ti-gui-tabs>
|   |-- <ti-gui-block>
|   |   |-- <ti-gui>
|   |   |   |-- ..
|   |-- <ti-gui-block>
|   |   |-- <ti-text-raw>
#-----------------------------
# cols layout
|-- <ti-gui-cols>
|   |-- <ti-gui-block>
|   |-- <ti-gui-block>
#-----------------------------
# rows layout
|-- <ti-gui-rows>
|   |-- <ti-gui-block>
|   |-- <ti-gui-block>
#-----------------------------
# Absolute panels
|-- <ti-gui-panel>
|-- <ti-gui-panle>
|-- ...
```

-------------------------------------------------
# GUI Layout

GUI can auto-adapt the layout for `phone|tablet|desktop` by property `layout`.

```js
{
  desktop : {
    type : "rows",
    blocks : [..]
  },
  tablet : "desktop",
  phone  : "desktop"
}
```

-------------------------------------------------
# Properties

## className

## layout

## panels

## schame

```js
"schema" : {
  type : Object,
  default : ()=>({})
}
```

Each layout block can refer to `schema` to get a component fully defination like:

```js
{
  "keyInBody" : {
    comType : "ti-xxx",
    comConf : {
      /* Component configuration */
    }
  }
}
```

## actionStatus

```js
"actionStatus" : {
  type : Object,
  default : ()=>({})
}
```


## shown

```js
"shown" : {
  type : Object,
  default : ()=>({})
}
```

Indicate which block is shown.

```js
{
  blockNameA : true,
  blockNameB : false
}
```

## canLoading

```js
"canLoading" : {
  type : Boolean,
  default : false
}
```
Indicate the GUI can should loading mask or not.


## loadingAs

```js
"loadingAs" : {
  type : [Boolean, Object],
  default : null
}
```
`true` or special `Object` to show the loading mask. 

-------------------------------------------------
# Block Properties

## className

```js
"className" : null
```

Define the block special css selector.

## type

Block's type could be `cols|rows|tabs|wall`.
The "size" field of each sub-block has different meaning

- `cols`
  + size is width of each column
- `rows`
  + size is height of each row
- `tabs`
  + It will auto show the tabs bar, which each tab item texted by block's title.
  + The block's name will be used when title no-defined.
- `wall`
  + size should item count of each row when Number,
  + String("%|rem|px") will be taken as items's width
  + Array[width,height] will be taken as item's  `width/height`
  + "stretch" will be ignored.

## title

```js
"title" : {
  type : String,
  default : null
}
```

Block title bar text content, which supported the `i18n:xxx`.

## icon

```js
"icon" : {
  type : String,
  default : null
}
```

Block title bar icon.

-------------------------------------------------
## tabAt

```js
"tabAt" : {
  type : String,
  default : "top-left",
  validator : (v)=>/^(top|bottom)-(left|center|right)$/.test(v)
}
```

If `type="tabs"`, the prop will be used to indicated the tab title bar position. `top-left` as default.

-------------------------------------------------
## adjustable

User can adjust the size
 - `true` : both x/y
 - `"x"`  : x only
 - `"y"`  : y only
 - `false` : forbid adjust size

Defaultly `true`

-------------------------------------------------
## border

Boolean. Show sub block border or not.

Default is `false`

-------------------------------------------------
## blocks

Current block title/icon/actions
If one of them has been declared, it will show the title bar

Each block looked like:

```js
{
  title : "i18n:xxx",
  icon  : "fas-file",
  className : null,
  actions : [/*
 	 action menu items, @see <ti-menu> for more detail
  */],
  //.....................................
  // required and must be unique
  name : "b0",
  type : "tabs",  // sub-layout
  blocks : [{     // sub-blocks
  /*layout*/
  }],
  body : "xxx",   // refer to schame
  //.....................................
  // The style.overflow
  overflow : "hidden"
  //.....................................
  // default size is "stretch"
  // "%" "rem" "px" was supported also.
  // Number will be taken as "px" when "rows|cols"
  size : "30%",
  //.....................................
  // Enabled in "cols/rows" block. To define the block flexibility.
  // default is auto, 
  //  - auto   : default. If defined size as "none", else "both"
  //  - grow   : as flex: 1 0 auto;
  //  - shrink : as flex: 0 1 auto;
  //  - both   : as flex: 1 1 auto;
  //  - none   : as flex: 0 0 auto;
  flex : "auto"
  // If true, use can change the block size by mouse.
  // It will be ignored when "wall" or "tabs"
  // default is true
  adjustable : true,
  // Show border between subblock or not
  border: false
}
```

-------------------------------------------------
## panels

Each panel looked like:

```js
{
  title,icon,actions,
  hideTitle
  //.....................................
  name : "b0",             // required and must be unique
  type : "rows",           // sub-layout
  blocks : [{/*layout*/}], // sub-blocks
  body : "xxx",
  //.....................................
  // For the reason panels is absoluted, so we need more fields
  // to declare the position. Those fields following is worked only
  // in "panles" fields
  //.....................................
  // panel poisiton could be:
  //  - left|right|top|bottom
  //  - center
  //  - left-top|right-top|bottom-left|bottom-right
  position : "center/center",
  width  : "100%",
  height : "100%",
  //.....................................
  // The style.overflow
  overflow : "hidden"
  // This panel will mask GUI
  // Default is false
  mask : false
  // closer button's position
  // null - no closer
  // "default" - right/top at title bar
  // "bottom" - bottom/center lamp cord
  // "top" - center/top shrink button 
  // "left" - center/left shrink button 
  // "right" - center/right shrink button 
  closer : null,
  // user can adjust the size
  //  - true : both x/y
  //  - "x"  : x only
  //  - "y"  : y only
  //  - false : forbid adjust size
  adjustable : true,
}
```

-------------------------------------------------
# Event

## Built-in events

- `block-shown` : `{path:["@top"], name:"xxx"}`
- `block-hided` : `{path:["@top"], name:"xxx"}`
- `block-resize` : `{blocks sizing}`

## Event by-pass

`<ti-gui>` will by-pass the customized event emitted 
by `AnotherComponent`, and prepend the prefix for each event.

For example, if `ComponentA` in block `xyz` emitted one event named `abc`,
then the `<ti-gui>` will emitted one event named `xyz:abc`. You can
listen the event by `<ti-gui v-bind:xyz:abc="myMethod">`.

May you curious about how `<ti-gui>` can made it, here is the trick detail:

> It will hijack the `$emit` of descendants by:

```bash
'ti-gui'.$emit(event, arg)
           ^----------------+
                            |
                  !!!{ this.$parent.$emit();}
  'gui-layout'.methods.hijackEmit(event, arg)
                        ^
              { this.$parent.hijackEmit();}
    'ti-layout'.$emit <= "hijacked"
                 ^
        { this.$parent.$emit('$name:$event', arg);}
      'ti-block'.methods.hijackEmit(event, arg)
                          ^
                  { this.$parent.hijackEmit();}
[slot]  'AnyComponent'.$emit <= "hijacked"
```

> If nested `GuiLayout`, it will looks like this:

```bash
'ti-gui'.$emit(event, arg)
           ^
           +--------- { this.$parent.$emit();}
  'gui-layout'.methods.hijackEmit(event, arg)
                        ^
              { this.$parent.hijackEmit();}
    'ti-layout'.$emit <= "hijacked"
                 ^
        { this.$parent.$emit('$name:$event', arg);}
      'ti-block'.methods.hijackEmit(event, arg)
                          ^
                  !!!{ this.$parent.hijackEmit();}
[slot]  'gui-layout'.methods.hijackEmit(event, arg)
                        ^
                    { this.$parent.hijackEmit();}
          'ti-layout'.$emit <= "hijacked"
                      ^
              { this.$parent.$emit('$name:$event', arg);}
            'ti-block'.methods.hijackEmit(event, arg)
                                ^
                        { this.$parent.hijackEmit();}
[slot]        'AnyComponent'.$emit <= "hijacked"
```

> Hijact each component `$emit` method by `Ti.Config.decorate(com)`
> to add `beforeCreate` hook in `mixin`, which obey the rule below:

- If `this.hijackEmit`, don't hijact self `$emit`
- Else if `$parent.hijackEmit`, let `$emit=>$parent.hijacEmit`

> In `<gui-layout>`, make `hijackEmit` auto-adapt parent:

- If `$parent.hijackEmit`, call it
- Else call `$parent.$emit`

-------------------------------------------------
# Methods

## `showBlock`

## `hideBlock`