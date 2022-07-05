---
title: 表单控件:TiForm
author: zozohtnt@gmail.com
screen:
- desktop
- mobile
---

# 文章瓦片概述

表单控件就是一个控件集合的容器，它假定自己所有的控件都有

- `value` 属性
- `change` 事件

-------------------------------------------------------------
# 属性列表

## 数据属性

| Name               | Description                        |
| ------------------ | ---------------------------------- |
| `data`             | 表单的数据对象                     |
| `fields`           | 表单的每个字段的控件描述           |
| `fieldStatus`      | 字段状态                           |
| `onlyFields`       | 【标识】是否只输出字段表内的字段值 |
| `fixed`            | 固定字段                           |
| `defaultFieldType` | 默认字段数据类型                   |
| `linkFields`       | 自动关联的字段                     |

## 行为属性

| Name             | Description                |
| ---------------- | -------------------------- |
| `keepTabIndexBy` | 标签式表单自动保存当前标签 |
| `currentTab`     | 标签式表单当前标签下标     |
| `defaultComType` | 默认的控件类型 `TiLabel`   |
| `autoShowBlank`  | 如果数据为空，显示空白     |
| `adjustDelay`    | 表单字段标题宽度调整延迟   |

## 外观属性

| Name          | Description                |
| ------------- | -------------------------- |
| `mode`        | 显示模式 `all|tab`         |
| `tabAt`       | 标签式表单标签位置         |
| `blankAs`     | 空白显示样式               |
| `icon`        | 表单标题图标               |
| `title`       | 表单标题文字               |
| `statusIcons` | 表单字段状态的图标样式集合 |
| `spacing`     | 表单字段间距               |

## 尺寸属性

| Name     | Description  |
| -------- | ------------ |
| `width`  | 表单整体宽度 |
| `height` | 表单整体高度 |

-------------------------------------------------------------
# 属性详情

## linkFields

当表单的字段发生改变，会导致两个事件

- `field:change` : `{name,value}`
- `change` : `data`

在触发 `field:change` 事件之后，触发 `change` 之前，有时候用户可能需要
自动修改另外一些字段，这个时候，用户可以通过这个属性定制整个表单的行为。

当然，有时候字段更新逻辑可能过于复杂且特殊，这个时候直接监听表单的 `field:change` 事件，
然后通过自己的业务函数，你实际上可以做任何事情。这里，我们提供这个属性，是为了在大部分
情况你并不需要写业务代码，仅仅是通过几行配置就能很好的达到你的目的。

```js
{
  // 这是一个映射表，描述了某个特殊字段更新后，你希望进行的特殊操作
  linkFields : {
    // 键就是触发的字段名，值如果是下面形式的对象，表示需要查 TiDict
    // 如果查到了字典项，就会映射为一个对象，并融合
    "fieldName2" : {
      dict : "DictName",
      // 当 dict 为 Name(=xxx) 这种动态字典时，才会有效
      dictVars : {...},
      // 映射目标
      target : {
        "fieldA" : "keyOfDictItem1",
        "fieldB" : "keyOfDictItem2",
      },
      // 或者直接挑选字段
      target : ["fieldA", "fieldB"],
      // 这个选项开启，则表示上面的映射目标不是简单的映射
      // 而是需要通过 Ti.Util.explainObj 来转换
      // 当然，这个选项只有在 target 为 Object 映射时才有效
      // 选项的值为一个键，即，在 explainObj 的上下文中，默认是 form.data
      // 并加入一个当前字段的键。
      // 因为这个值很可能是从 dictionary 翻译出来的对象或者对象列表
      explainTargetAs: "item",
    },
    // 如果对应的是一个函数，那么会直接调用，函数支持 async
    "fieldName2" : async function({name, value}, data) {
      // {name, value} 表示更新的字段名和值
      // data 表示当前表单的整体数据对象
      // TODO 你的函数逻辑可以随意，async/await 也是支持的
      // 只是你返回的时候，必须是一个对象
      // 这个对象会与表单的 data 字段融合后，发出 'change' 事件
      // 当然，在这之前，也会发 'field:change' 事件
      return {
        "fieldA" : "xxxx",
        "fieldB" : "xxxx"
      }
    }
  }
}
```