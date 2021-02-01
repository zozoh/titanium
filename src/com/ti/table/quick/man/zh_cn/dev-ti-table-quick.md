---
title: 快速表格:TiTableQuick
author: zozohtnt@gmail.com
---

# 快速表格概述

如果数量巨大,`TiTable`由于要进行复杂的控件计算，所有速度很慢。通常数据超过一千，
表格渲染的速度就已经有明显的卡顿了。为此，我们提出了 `TiTableQuick` 控件，它虽
然功能上对于 `TiTable` 有所削弱，但是在数据量较大的时候，依然能表现处较好渲染速度。

它不在通过子控件渲染单元格，而是直接生成 DOM。

- 不支持 `Dict` 机制
- 可以定制单元格的显示类型，一个单元格还是显示多段数据
    - 可以支持的显示形式为： `图标|图片|文字`
    - 可以自定义 `Transformer`
- 不支持 `PuppetMode`


------------------------------------------------------
# 属性

**数据属性**

 Name         | Description
--------------|-----------------
`data`        | 表格需要显示的原始数据
`idBy`        | 数据的 ID 字段
`currentId`   | 【选】当前选择的行
`checkedIds`  | 【选】当前选中的行
`changedId`   | 【选】标记当前改变的行

**行为属性**

 Name         | Description
--------------|-----------------
`fields`      | 显示的字段列表
`multi`       | 是否支持多选
`checkable`   | 是否显示行选择框
`selectable`  | 行是否和被选中
`openable`    | 双击行，是否会有`open`事件
`cancelable`  | 点击空白，是否会取消选中
`hoverable`   | 是否显示鼠标 hover 样式
`autoScrollIntoView` | 是否自动滚动到高亮行

**回调函数**

 Name         | Description
--------------|-----------------
`onSelect`    | 当行被选择时的回调
`onOpen`      | 当行被双击时的回调

**外观属性**

 Name           | Description
----------------|-----------------
`blankAs`       | 空白显示文字和图标
`blankClass`    | 空白样式
`rowNumberBase` | 显示行下标起始值
`border`        | 如何显示单元格边框

**尺寸属性**

 Name      | Description
-----------|-----------------
`width`    | 宽度
`height`   | 高度

------------------------------------------------------
## `fields`字段列表

```js
fields : [{
  // 字段标题
  title : "i18n:xxx",

  // 字段显示宽度
  width : "30%",

  // 字段如果有多个显示项，这些显示项目强制维持一行
  nowrap : true,

  // 字段显示内容: 数组表示一个单元格内容多个显示项
  display : [{
    /*
    显示项目取值:
     - "xxx"  : 来自对象的一个固定键
     - ".."   : 相当于整个对象
     - [..]   : 数组表示来自对象的某几个键，组成一个新的子对象
    */
    key : String,
    /*
    显示项目的显示类型：
     - text : 【默认】表示直接显示内容 `<span>xxx</span>`
     - icon : 将内容转换为图标 `<i class="..."></i>`
     - img  : 将内容用图片呈现 `<img>
    */
    type : "text",
    /*
    自定义类选择器：
     - String : 直接指定一个类选择器
     - Function : 采用 `(val, obj, index)=>"className"`
     - Object : 是一个键值对，键为备选 className，值为一个 AutoMatch
    */
    className : String | Function | {
      ...
    }
    /*
    声明特殊的转换器
    */
    transformer : Function | String | Object
  }]
}]
```