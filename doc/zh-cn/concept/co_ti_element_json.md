---
title: 概念·钛元素·定义文件
author: zozoh
---

```json
// ti/包名/控件A/控件A.json
{
    "dom"  : true,
    "css"  : true,
    "i18n" : true,
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
    "events" : {
        "change" : "[ti.d.DataDefine]"
    },
    // 本元素的公开行为
    // 所有的元素都有如下公开行为：
    //  - redraw | destroy
    "behavior" : {
        "someFunc" : {
            "method" : "do_refresh",
            "params" : [{
                "name" : "callback"
            }]
        }
    }
}
```

