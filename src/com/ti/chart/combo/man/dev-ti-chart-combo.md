---
title: 组合统计图形
author: zozohtnt@gmail.com
---

# 概述



# 属性:数据

 Name         | Type                 | Description
--------------|----------------------|----------
`nameList`    | `Array`              | 有多少种统计方式
`name`        | `String`             | 当前的统计方式
`date`        | `Number|String|Date` | 当前统计的日期
`maxDate`     | `Number|String|Date` | 最大的可选择的统计日期
`span`        | `String`             | 统计的时间跨度
`spanOptions` | `Array`              | 可选的统计时间跨度
`chartDefines`| `Object`             | 扩展的图表定义
`chartTypes`  | `Array|String`       | 可以支持的统计图表类型
`type`        | `String`             | 当前要显示的图表类型
`chartOptions`| `Object`             | 对于各种图表类型的特殊配置
`data`        | `Array`              | 图表的数据
