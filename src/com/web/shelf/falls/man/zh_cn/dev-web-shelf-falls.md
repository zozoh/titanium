---
title: 瀑布流:WebShelfWall
author: zozohtnt@gmail.com
screen:
- desktop
- mobile
---

# 墙概述

将传入数据，用数据渲染控件渲染成垂直瀑布流墙贴

# 属性列表

| Name       | Description |
| ---------- | ---------------- |
| `cols`     | 指定有几列瀑布流 |
| `itemWdith`| 指定项目宽度，自动计算列数 |
| `data`     | 【数组】控件数据 |
| `comType`  | 墙贴项控件类型 |
| `comConf`  | 墙贴项控件配置 |
| `blankAs`  | 空白数据显示方式 |
| `loadingAs`| 加载数据显示方式 |

`cols` 与 `itemWidth` 二者必须都要声明，其中 `cols` 更加优先。


