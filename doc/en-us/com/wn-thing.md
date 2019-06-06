---
title : <ti-thing>
author: zozoh(zozohtnt@gmail.com)
tags:
- ti
- com
---

-------------------------------------------------
# What is TiThing

Render complex GUI by `<ti-layout>|<ti-block>` according the setting of
JSON style defination.

```bash
TiThing
 |-- TiThingLayout
      |-- TiLayout  <----------------------+
           |--<slot:blocks>-- [TiBlock..]  | Recursion
           |                   |-----------+
           |                   |--<slot>-- AnotherComponent
           |--<slot:panels>-- [TiBlock..]
```

-------------------------------------------------
# Properties

## `layout`

> Layout is a `block`, it will build a tree structure by `blocks` and `panels`

```js

```

## methods

> Extra method set

```js
{
  // This method will be bind to current <ti-thing> instance.
  methodA : functin() {
    // `this` should be the vm instance
  }
}
```

## schame

> Define each layout block body

-------------------------------------------------
# Event

The `<ti-layout> && <ti-lay-xxx>` will hijack the `$emit` of
all the `@body` component by `Ti.Config.comDecorator`.

If `comA` in a block named `xyz`, and `$emit`

-------------------------------------------------
# Methods
