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



-------------------------------------------------
# Properties

## `type`

Layout type could be `cols|rows|tabs|wall`.
The "size" field of each sub-block has different meaning

### `cols`

size is width of each column

### `rows`

size is height of each row

###  `tabs`

It will auto show the tabs bar, which each tab item texted by block's title.
The block's name will be used when title no-defined.

### `wall`

size should item count of each row when Number,
String("%|rem|px") will be taken as items's width
Array[width,height] will be taken as item's  `width/height`
"stretch" will be ignored.

-------------------------------------------------
## `adjustable`

User can adjust the size
 - `true` : both x/y
 - `"x"`  : x only
 - `"y"`  : y only
 - `false` : forbid adjust size

Defaultly `true`

-------------------------------------------------
## `blocks`

Current block title/icon/actions
If one of them has been declared, it will show the title bar

Each block looked like:

```js
{
  title : "i18n:xxx",
  icon  : "fas-file",
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
  // default size is "stretch"
  // "%" "rem" "px" was supported also.
  // Number will be taken as "px" when "rows|cols"
  size : "30%",
  // If true, use can change the block size by mouse.
  // It will be ignored when "wall" or "tabs"
  // default is true
  adjustable : true
}
```

-------------------------------------------------
## `panels`

Each panel looked like:

```js
{
  title,icon,actions,
  //.....................................
  name : "b0",             // required and must be unique
  type : "rows",           // sub-layout
  blocks : [{/*layout*/}], // sub-blocks
  body : "xxx",
  //.....................................
  // For the reason panels is absoluted, so we need more fields
  // to declare the position. Those fields following is worked only
  // in "panles" fields
  position : "center-top",    // @see Ti.Rect.doctIn
  width  : "100%",
  height : "100%",
  // closer button's position
  // "default" - right/top at title bar
  // "none" - no closer
  // "bottom" - bottom/center lamp cord
  // "top" - center/top shrink button 
  // "left" - center/left shrink button 
  // "right" - center/right shrink button 
  closer : "default",
  // user can adjust the size
  //  - true : both x/y
  //  - "x"  : x only
  //  - "y"  : y only
  //  - false : forbid adjust size
  adjustable : true,
}
```

-------------------------------------------------
## schame

> Define each layout block body

```js
{
  "key" : {
    comType : "ti-form",
    comConf : {
      /* Config of the ti-form*/
    }
  }
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