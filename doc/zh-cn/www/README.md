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
  //------------------------------------------------
  // site-state.json
  apis : [{
    // 每个 API 参见后面描述
  }],
  // 作为整个站点的全局导航条
  // 如果某个页面想有特殊设置，可以重载掉它
  nav : [{
    icon  : "xxx",       // 链接的图标
    title : "xxx",       // 链接文字
    // 链接类型
    //  - page   : 表示链接到一个站内页面
    //  - href   : 链接到一个外部链接
    //  - action : 调用模型方法名
    type  : "page",
    // 根据类型不同这里的值形式不一样
    value : "page/home",
    // 传入链接的参数，是一个 Object
    //  - page/href : 作为 query string
    //  - action    : 作为 action 的 payload
    params : null,
    // 只有在 `page|href` 模式下才有效，表示页面锚点
    // 必须以 `#` 开头，如果不以 `#` 开头，处理器会自动补全
    anchor : "#XXX",
		// 是否打开新窗口，只有在 page|href 类型下有效
    newTab : false
  }],
  // 默认入口页
  entry : "page/home",
  // 加载状态
  loading : false,
  // 全局动作映射
  actions : {
    "nav:page" : "navTo"
  },
  //------------------------------------------------
  // @mod:www/page
  Module::page : {
    
  },
  //------------------------------------------------
  // @mod:ti/viewport
  Module::viewport : {
    viewportMode,
    isViewportModeDesktop,
    isViewportModeTablet,
    isViewportModePhone,
    isViewportModeDesktopOrTablet,
    isViewportModePhoneOrTablet
  }
}
```

页面组装方式

```bash
DIV(@app)             # Vue(root) : index.wnml 
  |-- DIV.site-main   # Vue(root) : site-main.html
       |-- <ti-gui>   # Mod(page) : page/xxx.json
	
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
  // @see 上面站点整体描述关于 nav 每个项目的细节介绍
  "nav" : [{
      "title" : "首页",
      "value"  : "page/home"
    }, {
      "title" : "关于",
      "value"  : "page/about",
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
    "nav:to" : "navTo"
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
  "path"  : "page/home",
  // 根据 path/params/anchor 做成一个指纹，表示页面输入的变动
  "finger" : SHA1,
  // 动态参数表，通常这个是网页访问时从 URL 里获取的
  // 当重新调用 API 时，会从这里读取参数，以便动态更改内容
  "params" : {},
  // 当前锚点，通常这个是网页访问时从 URL 里获取的
  "anchor" : "#xxx"
  // 页面加载时需要预先处理的数据，
  "apis" : {
    // 页内唯一的处理名称作为键值
    "article" : {
      // 站点全局指定的 API 名称
      // 选，如果不指明，则默认用键值作为 api 的名称去查找对应的API设置
      "api" : "apiNameA",
      // 这里是参数表，与站点的对应API参数表叠加
      "params" : {
        "id" : {
          "refer"   : "params.id", // 从页面模型哪个字段读取数据
          "default" : "xxx"        // 默认值，如果未声明，用站点api的参数表值
        } 
      },
      // 接口的处理结果是否在页面加载时，由服务器渲染到了 DOM 里。
      // 如果是的话，会根据 params 的结果计算一个 SHA1 值
      // 在页面的 DOM 里寻找对应的节点，恢复回 JSON，这样就节省了一次网络请求
      // 同时也可以利用这个机制做到 SEO
      // 这个机制被封装在 SSR-JSON 里面
      "cached" : true,
      // 得到的数据对象应该存放到 data 段的哪个键下，
      // 可选，如果未定义，则用 API 的键作为 dataKey
      "dataKey" : "article"
    }
  },
  // 页面的数据段，记录每个 API 返回的结果
  // 如果是静态数据，可以直接在这个段里声明
  "data" : {
    "article" : Any,
    "info" : Any
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
    "nav:to" : "navTo"
  }
}
```
