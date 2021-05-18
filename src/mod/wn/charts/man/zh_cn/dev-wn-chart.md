---
title: 统计模型
author: zozohtnt@gmail.com
---

# 数据布局

```bash
{HOME-DIR}/
|-- global-setup.json     # 全局配置
|-- {charts_name}/        # 每个目录就是一个统计数据, title 表示名称
|   |-- cache/            # 这里可以存放统计数据的缓存
|   |-- charts-setup.json # 本分类特殊的图表配置，也包括如何生成图表的命令
```

# 全局配置:`global-setup.json`

```js
{
  /*
  是否保持当前的选择到本地，保存的内容为:
  {
    name : "xxx",      // 当前图表名称
    type : "pie",      // 当前图表类型
    date : "2020-xx",  // 数据统计时间
    span : "7d",       // 统计时间跨度
  }
  保存的本地键是: "wn-chart-status-${meta.id}"
  */
  "keepToLocal" : true,
  //
  // 下面是默认值，当然，具体图表里的设置会把这个覆盖
  //
  "chartStatus": {
    "name" : "xxx",        // 当前图表名称
    "type" : "pie",        // 当前图表类型
  },
  // 全局设定的最大时间
  "maxDate": "today-1d",
  // 全局的可选时间跨度配置
  "spanOptions"  : [..],
  // 全局增加的扩展图表定义
  "chartDefines" : {..},
  // 全局可选的图表种类
  "chartTypes" : [..],
  // 全局增加的图表配置
  "chartOptions" : {
    "pie" : {/*...*/},
    "bar" : {/*...*/},
    ...
  }
}
```

# 全局配置:`chart-setup.json`

```js
{
  //
  // 当前图表的默认值
  //
  "chartStatus": {
    "type" : "pie",        // 当前图表类型
  },
  // 扩展图表定义
  "chartDefines" : {..},
  // 可选的图表种类
  "chartTypes" : [..],
  // 图表的特殊配置
  "chartOptions" : {
    "pie" : {/*...*/},
    "bar" : {/*...*/},
    ...
  },
  // 读取图表数据的命令模板,
  // 占位符 ${today} 以及 ${span} 
  "data": "xxx"
}
```