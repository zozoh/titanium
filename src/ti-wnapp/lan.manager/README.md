# app.json

```js
{
  "name" : "lan",
  "theme" : "@theme:light",  // 主模块的皮肤主体
  "state" : "@app:lan",   // 主模块数据结构
  "dom"   : "@app:lan",   // 主模块的渲染模板
  "css"   : "@app:lan",   // 主模块的样式表
  // 主模块同步数据操作，以 "..." 开头表示一个函数集
  "mutations" : "...@app:mutations",
  // 主模块异步操作
  "actions" : [
    "...@app:actions/load",
    "...@app:actions/session",
    "@app:actions/upload"
  ],
  // 子模块映射表
  "modules" : {
    "teacher" : "@app:module/teacher",
    "timeslot": "@app:module/timeslot",
    "timeline": "@app:module/timeline",
    "schedule": "@app:module/schedule",
    "plan"    : "@app:module/plan"
  },
  // 子模块对应的组件映射表
  "components" : {
    "teacher" : "@app:components/teacher",
    "timeslot": "@app:components/timeslot",
    "timeline": "@app:components/timeline",
    "schedule": "@app:components/schedule",
    "plan"    : "@app:components/plan"
  },
  // 主模块的依赖
  "deps" : [
    "@ui:element-ui",
    "@ui:vuematerial"
  ]
}
```