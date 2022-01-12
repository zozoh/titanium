---
title: 电子表格编辑控件:TiSheetTable
author: zozohtnt@gmail.com
screen:
- desktop
- mobile
---

# 控件概述

仿照 Excel 制作一个表格控件，可以比较自由高效的编辑数据表格。
对于数据表格，它支持：

1. 固定行固定列编辑
2. 不固定行固定列编辑
3. 不固定行不固定列编辑

控件的单元格定位依然采用 Excel 的单元格定位方式：

```bash
# 首行数据，下标为 0
# 列为 A-Z 的 26 进值
   A-Z ... AA-AZ ... BZ-BZ ...
0  [-] ... [-]   ... [-]   ...
1  [-] ... [-]   ... [-]   ...
2  [-] ... [-]   ... [-]   ...

# 26 进值对应表
0  1  2  3  4  5  6  7  8  9
A  B  C  D  E  F  G  H  I  J

10 11 12 13 14 15 16 17 18 19
K  L  M  N  O  P  Q  R  S  T

20 21 22 23 24 25 26 27 28 29
U  V  W  X  Y  Z  AA AB AC AD

30 31 33 33 34 35 36 37 38 39
AE AF AG AH AI AJ AK AL AM AN

40 41 44 44 44 45 46 47 48 49
AO AP AQ AR AS AT AU AV AW AX

50 51 55 55 55 55 56 57 58 59
AY AZ BA BB BC BD BE BF BG BH
```

控件接受的数据结构为：

```js
{
  //-----------------------------------
  // Data
  //-----------------------------------
  // 用一个散列表描述表格的纯数据
  // A1 表示 第1列第1行的单元格
  data : {
    "A1" : $VAL
  },
  // 默认显示的数据列到多少下标，默认 10 列
  // 如果定义了 columns，那么则以【可显示的列数】与本属性最大值为准
  dataWidth  : 10,
  // 默认显示的数据行到多少下标，默认 100 行
  dataHeight : 100,
  //-----------------------------------
  // Behavior
  //-----------------------------------
  // 数据表格延申方向，
  //  "cols" : 水平延展：可以增加更多的列
  //  "rows" : 垂直延展：可以增加更多的行
  //  "none" : 不能延展
  //  "both" : 即可以水平延展，也可以垂直延展
  // 默认为 rows
  extension : "rows",
  // 这里指定了一个固定的列定义
  columns: [
    {
      // 【选】列名称，默认为下标转换为的 26 进制数
      name: "A",
      // 【选】本列标题，默认为列名
      title : "xxx",
      // 编辑状态控件，默认为空，采用 cellComType
      comType: "TiInput",
      // 编辑状态控件设置，默认为空，表示采用 cellComConf
      comConf: {...},
      // 自己定义的 comConf 是否与默认的 cellComConf 合并
      mergeConf: true
    }
  ],
  // 单元格编辑状态下的默认控件，默认为 TiInput
  cellComType : "TiInput",
  // 单元格编辑状态下的控件的默认配置信息
  // 具体到某一个单元格，它会与 cells 的配置项融合
  cellComConf : {...}
}
```