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
# Properties

## className

```js
"className" : null
```

## layout

GUI can auto-adapt the layout for `phone|tablet|desktop` by property `layout`.

```js
{
  desktop : {
    type : "rows",   // cols|rows|tabs
    blocks : [..],
    // Panels in special viewport mode
    panels : [{
      name : "xxx",  // panel name, unique in whole GUI
      body : "ti-xxx"
    }]
  },
  tablet : "desktop",
  phone  : "desktop",
  // Define the global panels here
  panels : [{
    name : "xxx",  // panel name, unique in whole GUI
    body : "ti-xxx"
  }]
}
```

Or, you can declare the layout `type/block` directly.


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

## keepShownTo

```js
"keepStatusTo" : {
  type : String,
  default : null
}
```
Declare the local storage key for private shown storage. 

If the prop was without defined, the `shown` will not be stored as the privated propery. That's GUI `shown` will obey the input property `shown`.

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
# Rows/Cols

## className

## blocks

## adjustable

## border

## schema

## actionStatus

## shown

-------------------------------------------------
# Tabs

## className

## tabAt

```js
"tabAt" : {
  type : String,
  default : "top-left",
  validator : (v)=>/^(top|bottom)-(left|center|right)$/.test(v)
}
```

It define the tabs position:

- `top-left` or `top-center` or `top-right`
- `bottom-left` or `bottom-center` or `bottom-right`

```
 Left             Center           Right
+---------------------------------------+
| +------+------+                       |
| | TabA | TabB |                       | Top
+---------------------------------------+
|                                       |
|                                       |
|       Main Block Section              |
|                                       |
|                                       |
+---------------------------------------+
|                       | TabA | TabB | | Bottom
|                       +------+------+ |
+---------------------------------------+
```

## blocks

## currentTab

```js
"currentTab" : {
  type : [String, Number],
  default : 0
}
```
Current tab index of name.

## schema

## actionStatus

## shown

-------------------------------------------------
# Panel

## className

## title

## icon

## hideTitle

## actions

## actionStatus

## name

## type

## blocks

## body

## adjustable

## overflow

## width

## height

## viewportWidth

## viewportHeight

## position

```js
"position" : {
  type : String,
  default : "center",
  validator : (v)=>{
    return /^(left|right|top|bottom|center)$/.test(v)
      || /^((left|right)-top|bottom-(left|right))$/.test(v)
  }
}
```

panel poisiton could be:

- left|right|top|bottom
- center
- left-top|right-top|bottom-left|bottom-right

## closer

```js
"closer" : {
  type : String,
  default : "default",
  validator : (v)=>(
    _.isNull(v) || /^(default|bottom|top|left|right)$/.test(v)
  )
}
```

Indiate the closer button's position:

Closer      | Description
------------|--------------------
`null`      | no closer
`"default"` | right/top at title bar
`"bottom"`  | bottom/center lamp cord
`"top"`     | center/top shrink button 
`"left"`    | center/left shrink button 
`"right"`   | center/right shrink button 

## mask

```js
"mask" : {
  type : Boolean,
  default : false
}
```
If `true`, it will enable mask layer to capture all user mouse operation duration the panel lifecycle. Default is `false`

## clickMaskToClose

```js
"clickMaskToClose" : {
  type : Boolean,
  default : false
}
```
If `mask==true`, this prop will cause the panel closed when user click the mask area. Default is `false`.


-------------------------------------------------
# Block

## className

```js
"className" : null
```

Define the block special css selector.

## type

```js
"type" : {
  type : String,
  default : null,
  validator : (v)=>{
    return Ti.Util.isNil(v)
      || /^(cols|rows|tabs)$/.test(v)
  }
}
```

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

## hideTitle

```js
"hideTitle" : {
  type : Boolean,
  default : false
}
```

Force to hide the title bar.

## actions

```js
"actions" : {
  type : Array,
  default : ()=>[]
}
```
The title bar action menu data.

## actionStatus

```js
"actionStatus" : {
  type : Object,
  default : ()=>({})
}
```

## name

```js
"name" : {
  type : String,
  default : null
}
```
Block unique name in whole GUI. If without defined, the block is so called *"anonymity block"* which can not be `show/hide` by `shown` property.

## blocks

```js
"blocks" : {
  type : Array,
  default : ()=>[]
}
```
Define the sub-blocks.

## body

```js
"body" : {
  type : [String, Object],
  default : null
}
```
Indicate the block rendering component. It is higher priority then `type/blocks`.
That's mean, if declared `body`, it will be ignore the `type/blocks` setup.

## hijackable

```js
"hijackable" : {
  type : Boolean,
  default : true
}
```
If turn `false`, it will mute all sub-component events emiting.

## size

```js
"size" : {
  type : [String, Number],
  default : null
}
```

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

## overflow

```js
"overflow" : {
  type : String,
  default : null
}
```
Indicate the block css `overflow`.

## flex

```js
"flex" : {
  type : String,
  default : "auto",
  validator : (v)=>/^(auto|grow|shrink|both|none)$/.test(v)
}
```

Enabled in `cols/rows` block for the block flexibility.

Flex     | Description
---------|----------------------
`auto`   | default. If `size` defined, same as "none", else "both"
`grow`   | as `flex: 1 0 auto;`
`shrink` | as `flex: 0 1 auto;`
`both`   | as `flex: 1 1 auto;`
`none`   | as `flex: 0 0 auto;`

## tabAt

```js
"tabAt" : {
  type : String,
  default : "top-left",
  validator : (v)=>/^(top|bottom)-(left|center|right)$/.test(v)
}
```
If `type="tabs"`, the prop will be used to indicated the tab title bar position. `top-left` as default.

## adjustable

```js
"adjustable" : {
  type : Boolean,
  default : true
}
```

User can adjust the size
 - `true` : both x/y
 - `"x"`  : x only
 - `"y"`  : y only
 - `false` : forbid adjust size

Defaultly `true`

## border

```js
"border" : {
  type : Boolean,
  default : false
}
```

Show sub block border or not. Default is `false`

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