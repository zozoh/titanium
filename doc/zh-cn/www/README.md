---
title : Web站点概述
author: zozoh(zozohtnt@gmail.com)
tags:
- ti
- www
---

------------------------------------------------------
# 站点物理结构

```bash
$HOME/
  |-- com/
  |-- css/
  |-- i18n/
  |-- js/
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
  |-- site-actions.mjs
  |-- site-getters.mjs
  |-- site-mutaions.mjs
  |-- site-state.json
```

------------------------------------------------------
# 站点逻辑结构

```js
{
  apis : [{
    // 每个 API 参见后面描述
  }],
  // 作为整个站点的全局导航条
  // 如果某个页面想有特殊设置，可以重载掉它
  nav : [{
    icon  : "xxx",       // 链接的图标
    title : "xxx",       // 链接文字
    // 链接类型
    //  - page : 表示链接到一个站内页面
    //  - href : 链接到一个外部链接
    //  - dispatch : 调用模型方法
    type  : "page",
    // 根据类型不同这里的值形式不一样
    value : "page/home"
    // 只有在 dispatch 模式下才生效，传入动作的参数
    // 如果为 null 则表示无参数
    payload : null
		// 是否打开新窗口，只有在 page|href 类型下有效
    newTab : false    
  }],
  // 当前页面
  currentPage : {
    title : "页面标题",
    data  : {/*页面数据（静态|动态）*/},
    layout : {/*页面布局*/}
  }
}
```

页面组装方式

```bash
DIV(@app)             # Vue(root) : index.wnml 
  |-- DIV.site-main   # Vue(root) : site-main.html
	
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
  //-----------------------------------------
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
  //-----------------------------------------
  // 站点的基础路径
  "base" : "/www/titanium/scaffold/",
  //-----------------------------------------
  // 作为整个站点的全局导航条
  // 如果某个页面想有特殊设置，可以重载掉它
  "nav" : [{
      "title" : "首页",
      "page"  : "page/home"
    }, {
      "title" : "关于",
      "page"  : "page/about"
    }],
  //-----------------------------------------
  // 指明要站点的入口页，如果不指明，则默认用 nav[0] 
  // 对应的页面来做入口页
  // 网页刷新时会根据 base 来判断要显示哪个页面
  // 如果发现没有页的路径，那么就用这个入口页
  // 这个链接会被 TiLoad 自动加载
  "entry" : "page/home"
  //-----------------------------------------
  // 正在加载中的显示方式，如果为 true 表示
  // 要显示正在加载中，文字和图标为 ti-loading 默认
  // 或者可以用一个对象{icon,text}指定加载方式
  // 这个对象就是  ti-loading 的属性
  "loading" : false,
  //-----------------------------------------
  // 站点全局的动作方法映射表
  //  [块名.事件名] : "动作名"
  // 如果顶级块，"块名." 则不显示
  "actions" : {
    "nav:page" : "navToPage"
  }
}
```

------------------------------------------------------
# page/home.json

```js
{
  // 这个是一个字符串模板，支持从数据段获取内容
  // 当页面更新后，会用这个值修改网页标题
  "title" : "页面标题",
  // 页面的数据段，每条数据值可能是来自 api 或者干脆是静态数据
  "data" : {
    // 来自 api
    "article" : {
      "type" : "api",
      "name" : "apiNameA",
      "params" : {/*这个值会与API默认参数值融合*/},
      "result" : {/*这里存放 API 的返回结果*/}
    }
    // 静态值
    "info" : {
      "type"   : "static",
      "result" : "Any"   // 可以是任何类型的值
    }
  },
  // 页面布局
  "layout" : {
    "type" : "rows",
    "blocks" : [{
        "body" : {
          "comType" : "ti-label",
          "comConf" : {
            "value" : "Sky"
          }
        }
      }]
  },
  // 监控各个布局块的隐藏显示，主要用在 panels 段里
  "shown" : {},
  // 页面控件配置信息
  "schema" : {/*...*/},
  // 当前页面特殊的 actions 映射
  // 重复的键优先级高于站点的 actions
  "actions" : {
    "nav:page" : "navToPage"
  }
}
```
