---
title: 样式规则编辑控件:HmPropCssRules
author: zozohtnt@gmail.com
screen:
- desktop
---

# 样式规则编辑控件概述

显示`JS`风格的`CSS`样式表，并提供编辑表单。

它会内置常用的`CSS`属性编辑控件

-------------------------------------------------------------
# 属性列表

| Name      | Description                 |
| --------- | --------------------------- |
| `value`   | 样式值(对象)                |
| `keyType` | 输出样式值的                |
| `form`    | 弹出式表单的配置信息        |
| `rules`   | 指定需要编辑的 `CSS` 属性名 |

-------------------------------------------------------------
# 属性详解

## `keyType`

输出样式表的键类型，可以支持下面的选项:

1. `kebab` 即格式如 `"margin-left"` 这样的键
2. `camel` 即格式如 `"marginLeft"` 这样的键
3. `snake` 即格式如 `"margin_left"` 这样的键

默认为 `kebab`

## `rules`

这个是一个便利的属性，它可以作为 `form` 配置项 `fields` 段的默认值。
如果你指定了 `form.fields`， 那么这个属性将不起作用。

```js
// 直接指定一组字段
rules : ["border", "margin"],

// 采用正则表达式描述一组属性
rules : "^(border|margin).*$",
```


