---
title : 编辑属性
author: zozoh(zozohtnt@gmail.com)
tags:
- walnut
- concept
---

# 对象编辑属性的设计动机

在 Walnut 界面里，基本上，任何对象都可以打开一个属性对话框。
打开对话框的函数是 `Wn.EditObjMeta`。

为了能让对象呈现出不同的属性编辑表单，这个函数接受 `{tabs:{..}}` 参数。

有时候，我们希望在服务器端指定一下某个类型的对象，需要呈现出什么属性。
这样就免去了界面端，每次都要指定这些属性的烦恼。

为此，如果 `Wn.EditObjMeta(对象, {tabs:"auto"})` 那么这个函数会
主动通过 `ti metas id:xxx` 命令获取这个对象的特殊属性编辑设定。

下面一个问题就是，这个映射关系是怎么存储的呢？ 请看下节。

-------------------------------------------------
# 对象特殊属性的映射

```bash
/rs/ti/view/            # View 配置目录
  |-- metas.json        # 这个是与 mapping.json 语法相同的映射文件
  |-- metas/            # 存放了所有的相关映射定义
  		|-- abc.json      # 定义文件
  		|-- ...           # 文件主名就是定义名
/home/$YOUR/            # 域配置目录
  |-- .ti/              # Ti 配置目录
      |-- metas.json    # 你的映射文件
      |-- metas/        # 映射元数据
      	  |-- yourmeta.json  # 自定义的属性定义
```

-------------------------------------------------
# 映射语法

> 与 `mapping.json` 相同

```js
{
  paths : {
    "~/my_folder/my_file.txt" : "$MetaName"
  },
  types : {
    // special type names will be try firstly
    "html" : "$MetaName"
    "mp3"  : "$MetaName"
    // RegExp has been supported, the matching keys
    // starts by '^' will be taken as RegExp.
    // And it will obey the original order of input file 
    // for matching priority
    "^(jpe?g)$" : "$MetaName"
  },
  mimes : {
    // Full mime type
    "text/xml" : "$MetaName"
    // Just a group name
    "text" : "$MetaName"
  },
  // Finally, matching by object race
  races : {
    "DIR"  : "$MetaName"
    "FILE" : "$MetaName"
  }
}
```
-------------------------------------------------
# 如何获取

```bash
ti metass id:xxx
```