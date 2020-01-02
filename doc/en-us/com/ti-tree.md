---
title : <ti-tree>
author: zozoh(zozohtnt@gmail.com)
tags:
- ti
- com
---

# Tree Overview

Tree has following behaviors:

- `Open/Close` Node
- Select node by `value`
- Select node by `path`
- `href` in node

# Tree Node

```js
{
  className : null, // Node customized className
  index : 0,    // [Auto] index(0 base) in current level
  name  : "c"   // [Auto] Unique in current level, default is "N${index}"
  path  : ["a","b"],     // [Auto] parent name path, top is []
  text : "i18n:xxx",     // Node text
  icon : "far-xxx",      // Node icon
  href : "/xx?id=${id}", // href templ,
  value : "45m..rt8",    // Node value, unique in tree
  tip  : "i18n:xxx",     // Node tip
  leaf : false,          // Node is leaf, children will be ignored
  selected : false,      // [Auto] Node is selected
  opened : false,        // [Auto] Node is opened
  // Children nodes, if not array or undefined, take it as leaf
  children : [..]
}
```