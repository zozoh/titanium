---
title : 动态字典
author: zozoh(zozohtnt@gmail.com)
---

# 使用字典 

```js
// 采用 Droplist 举例
comConf: {
  options: "#MyDict(=a)",
  dictVars: {
    a : "dog"
  }
}
```

那么，相当于寻找 `MyDict.dog` 这个字典

# 字典的定义

字典定义在一个私有全局变量里：

```js
// dict.mjs
DYNAMIC_DICTS = {
  // 字典的定义（构造函数）
  definations = {
    "${name}.${key}" : Function(vars={}){...}
  }
  // 字典的实例
  instances: {
    /* 缓存构造函数的返回结果 */
    "${name}.${key}" : Dict
  }
}
```

每次获取字典，都相当于懒加载。 先看实例里有没有，如果没有则调用构造函数创建。

因此 `Ti.Dict.GetDynamicDict({name, key, vars})` 是一个懒加载。它的 vars 字段，
是供给动态字典的构造函数参数的。 当然，也不是所有的动态字典的构造函数都需要，
这个完全取决于调用者。

在配置文件中，字典通过 `wn-dict` 来定义：

```js
{
  dynamic: true,
  // 下面这些字段，都会针对 vars 被 explain
  // 之后，才会调用普通的 CreateDict 方法
  data, query, item, children,
  value, text, icon, shadowed,
  dataChildrenKey
}
```

# 示例

```js
//
// 字典定义
//
"EventNames": {
  "dynamic": true,
  "data": "->cat ~/bizdict/event-names-${cate}.json"
},
//
// 在表单中的控件调用
//
{
  comType: "TiDroplist",
  comConf: {
    // 这里的 =cate 是从 vars 取某个值作为字典的标识名
    // 当然，vars 可以有很多值，来约束一个字典
    options: "#EventNames(=cate)",
    dictVars: {
      "cate": ":::=item.event_cate"
    }
  }
}
// 对象（或者上下文）有字段 event_cate
// 如果它的值为 A，相当于加载 event-names-A.json
// 如果它的值为 B，相当于加载 event-names-B.json
// 同时，通过 Ti.DictFactory.__debug_dynamic() 可以看到
{
  definations: {
    EventNames: ƒ
  },
  instances: {
    A: Dict,
    B: Dict
  }
}
```


