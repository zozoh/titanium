---
title: 通用对象数据模型
author: zozoh
---

# 模型数据

```json5
{
  // 模块名称。因为有时候模型并不会被加载为 main
  "moduleName": "main",
  // 本地行为存储的键模板
  "localBehaviorKeepAt": "->WnObj-State-${dirId}",
  // 哪些本地行为不要做本地存储（AutoMatch）
  "localBehaviorIgnore": null,
  // 【自动覆盖】解析后的本地行为存储键
  "lbkAt": null,
  // 【自动覆盖】解析后函数 （localBehaviorIgnore）
  "lbkIgnore": null,
  // 一个标志位，表示当前不要做本地行为存储
  // 因为当重新加载 schema 且 schema.behavior 存在时，会调用对应的 commit
  // 从而触发本地行为被覆盖。因此 reload 函数会首先标志一下 lbkOff=true
  // 以便跳过本地行为存储逻辑
  "lbkOff": false,
  /*
               数据·目录模式
  */
  "dirId": null,
  "oDir": null,
  // 数据导出的时候 (wn-obj-adaptor-methods.exportData)
  // 需要一个导出的映射方式。是一个 BeanMapping 的文件
  // 考虑到可能有多个导出方式，因此是一个目录，下面存放一组这样的文件
  // 当然，如果 oDir.mapping_dir 有值，则更优先
  "mappingDirPath": null,
  "fixedMatch": {},
  "filter": {},
  "sorter": {
    "nm": 1
  },
  "objKeys": null,
  "list": [],
  "currentId": null,
  "checkedIds": {},
  "pager": {
    "pn": 1,
    "pgsz": 50,
    "pgc": 0,
    "sum": 0,
    "skip": 0,
    "count": 0
  },
  /*
               数据·文件模式
  */
  "meta": null,
  "content": null,
  "__saved_content": null,
  "contentPath": "<self>",
  "contentType": "<MIME>",
  "contentData": null,
  // 静默解析模式
  // 在自动解析 content 的时候（JSON 文件）
  // 如果解析失败会抛错，将这个开关设置为 true，则可以忍受这个错误
  "contentQuietParse": false,
  /*
               模型状态
  */
  "status": {
    "reloading": false,
    "doing": false,
    "saving": false,
    "deleting": false,
    "changed": false,
    "restoring": false,
    "hasCurrent": false,
    "hasChecked": false,
    "hasMeta": false
  },
  "fieldStatus": {},
  // 每个项目的状态： 支持 icons.mjs 里面的 NAMES 定义，常用的有：
  //  - loading
  //  - moved
  //  - removed
  //  - processing
  //  - ok
  //  - success
  //  - warn
  //  - error
  //  - done
  "itemStatus": {
    /*[ItemId]: "loading|renaming|removed"*/
  },
  /*
               模型界面配置
  */
  // 提供给 WnObjAdaptor 的 GUI 使用
  "guiShown": {},
  "schema": {}
}
```

# 模型加载过程

```bash
# reload(meta)
> meta 可以是一个 WnObj 也可以是一个字符串
#------------------------------------------
# 1. 确定宿主数据
#------------------------------------------
> 目录模式: 如果 meta.race == "DIR"
  state.oDir = meta
  state.dirId = meta.id
> 文件模式: 否则
  state.meta  = meta
  state.dirId = meta.pid
#------------------------------------------
# 2. 加载 schema
#------------------------------------------
> status.reloading = true
> 尝试获取 schemaPath
  > 优先尝试的顺序是:
    1. meta.schema
    2. oDir.schema
    3. state.schema
> 加载 schema
  > ? 预加载 schema.components
  > commit schema 必须要在预加载全部依赖控件之后
  > ? 覆盖 schema.methods
  > ? 覆盖 schema.localBehaviorKeepAt
  > ? 覆盖 schema.behavior.contentPath
#------------------------------------------
# 3. 并行加载其余配置
#------------------------------------------
- loadLayout
- loadObjActions
- loadObjMethods
#------------------------------------------
# 4. 解释行为
#------------------------------------------
> explainLocalBehaviorKeepAt
  > lbkAt / lbkIgnore
> updateSchemaBehavior
  > lbkOff = true {
    > applyBehavior
  }
> restoreLocalBehavior
  > applyBehavior
#------------------------------------------
# 5. 加载数据
#------------------------------------------
> reloadData
  > ? state.oDir
    >> queryList
  > ? getters.contentLoadPath
    >> loadContent
#------------------------------------------
# 6. 结束
#------------------------------------------
> status.reloading = false
```













