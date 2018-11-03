---
title: 概念·钛元素·创建实例
author: zozoh
---

```json
// ti/包名/控件A/控件A.json
{
    "dom" : true,
    "css" : true,
    "icons" : {
        "del" : '<i class..>'
    },
    // TODO 这个，到底是强制三个属性呢？
    // 还是应该随意 ? 
    "schema" : {
        "data"  : "[ti.d.DataDefine]",
        "value" : "[ti.d.DataDefine]",
        "prop"  : "[ti.d.DataDefine]"
    },
    // 本元素可以发出的事件
}
```

