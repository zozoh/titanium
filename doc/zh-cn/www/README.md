---
title : Web站点概述
author: zozoh(zozohtnt@gmail.com)
tags:
- ti
- www
---

------------------------------------------------------
# 站点结构

```bash
$HOME/
  |-- com/
  |-- css/
  |-- i18n/
  |-- js/
  |-- mod/
  |    |-- site-actions.mjs
  |    |-- site-getters.mjs
  |    |-- site-mutaions.mjs
  |    |-- site-state.json
  |-- page/
  |    |-- home/
  |    |    |-- _com.json
  |    |-- site-getters.mjs
  |    |-- site-mutaions.mjs
  |    |-- site-state.json
  |-- _app.json
  |-- index.wnml
  |-- site-main.html
  |-- site-main.mjs
```

------------------------------------------------------
# _app.json

```js
{
  "name"  : "scaffold",
  "title" : "Ti·网站脚手架",
  "theme" : "light",
  "i18n"  : "@Site:i18n/all",
  "css"   : "@Site:css/all.css",
  "template" : "./site-main.html",
  "mixins"   : "./site-main.mjs",
  "store" : {
    "state"     : "@Site:mod/site-state.json",
    "getters"   : "@Site:mod/site-getters.mjs",
    "mutations" : "@Site:mod/site-mutations.mjs",
    "actions"   : "@Site:mod/site-actions.mjs",
    "modules"   : {
      "viewport" : "@mod:ti/viewport" 
    },
    "mixins" : "@lib:www/app-mixins.mjs"
  },
  "components" : [
    "@com:ti/icon",
    "@com:ti/form",
    "@com:ti/loading",
    "@com:ti/menu",
    "@com:ti/obj/thumb",
    "@com:ti/obj/meta"]
}
```

------------------------------------------------------
# site-state.json

```js
{
  // 这里描述了站点要用到的 api
  "apis" : {
    // 每个 API 都有唯一的键
    "apiNameA" : {
      "title" : "注记名",        // 支持 "i18n:xxx" 形态
      "path"  : "path/to/api",  // 前面不加 `/`
      "method" : "GET",         // 选，默认为GET，可为 GET|POST
      "headers" : {
        // 请求头，默认为空
      },
      "params" : {
        // 就是请求参数啦，作为每个 API  的参数默认值
      },
      "as" : "json"    // 返回的值用什么方式解析
  	}
  },
  // 这里是站点的每个页面
  "pages" : {
    // 每个页面都有一个唯一的键
    "page1" : {
      // 这个是一个字符串模板，支持从数据段获取内容
      // 当页面更新后，会用这个值修改网页标题
      "title" : "页面标题",
      // 页面的数据段，每条数据值可能是来自 api 或者干脆是静态数据
      "data" : {
        // 来自 api
        "article" : {
          "type" : "api",
          "name" : "apiNameA",
          "params" : {/*这个值会与API默认参数值融合*/}
        }
        // 静态值
        "info" : {
          "type" : "static",
          "data" : "Any"   // 可以是任何类型的值
        }
      }
    }
  }
}
```