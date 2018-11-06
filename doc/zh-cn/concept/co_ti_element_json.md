---
title: 概念·钛元素·定义文件
author: zozoh
---

```js
// ti/包名/控件A/控件A.json
{
    dom  : true,
    css  : true,
    i18n : true,
    icons : {
        "del" : '<i class..>'
    },
    // 控件的数据模板，每个段的值为默认值
    // 这些数据可以被模板视图使用
    // 注意，这个 data 必须为一个 Object
    data : {
        "loading" : false,  // 布尔值也不能空着
        "ready"   : false,
        // 对象的话，要把内部的值写全了
        "shape" : {
            "top"   : 100,  // 数字就是数字
            "left"  : -54   // 必须要有值
        },
        // 如果是数组，至少要填个空的
        "items" : [],
        // 如果是 HTML 的值，在数据里就是字符串
        "tip"   : '<span>这个是帮助</span>'
    },
    // TODO 这个，到底是强制三个属性呢？
    // 还是应该随意 ? 
    schema : {
        "data"  : "[ti.d.DataDefine]",
        "value" : "[ti.d.DataDefine]",
        "prop"  : "[ti.d.DataDefine]"
    },
    // 方法表，这些方法会在创建实例时，绑定到实例对象上
    // 保留方法:
    //    init/render/destroy
    // 内置方法名
    //    on_init/on_render/on_destroy
    methods : ["table.js"],
    // 本元素自动冒泡的事件列表
    bubble : [{
        // 默认就是 watch，可以不写
        // 数据路径下有变化，就触发
        // 因此下述事件，可以用字符串表示 "shape.x"
        type    : "watch",   
        keyPath : "shape.x", 
    }, {
        type    : "watch",   // 通常对于数组
        keyPath : "items"    // 监听整个集合
    }]
    // 本元素的公开行为
    // 所有的元素都有如下公开行为：
    //  - redraw | destroy
    behavior : {
        "someFunc" : {
            "method" : "do_refresh",
            "params" : [{
                "name" : "callback"
            }]
        }
    }
}
```

