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
  |    |-- about.json
  |    |-- home.json
  |-- _app.json
  |-- index.wnml
  |-- site-main.html
  |-- site-main.mjs
  |-- site-state.json
```

------------------------------------------------------
# 站点逻辑结构

```bash
$SITE(index.wnml) -> _app.json
 |-- ./i18n/all          # 多国语言支持
 |-- ./css/all.css       # 全局 css
 ###############################################################
 |-- @com:ti/support/com_mixins.mjs  # 由 Ti comDecorator 装入所有控件
 |    |-- mapGetter("viewport"       # 映射 Viewport 模块所有方法
 |    |-- created=hijackEmit         # 支持 hijackEmit 机制
 ###############################################################
 |-- @lib:www/site-main.html  # VueRoot DOM 模板
 |    |-- <ti-gui>            # 通用界面布局控件
 |          |-- v-bind=pageGUI      # @see computed.pageGUI()
 |          |-- :loading-as=loading # @see computed.loading
 |          |-- :shown=page.shown   # @see computed.page#shown
 ###############################################################
 |-- @lib:www/site-main.mjs   # VueRoot 交互逻辑
 |    |-- "computed"          # 动态属性映射自主模型 www-site.mjs 
 |    |   |-- logo/page/base/loading/actions
 |    |   |-- navigation()    # 自动计算当前页面的导航条（默认为站点）
 |    |   |-- pageGUI()       # 自动计算当前页面的布局配置项目
 |    |   |   |-- schame      # 当前页的 schame
 |    |   |   |-- layout      # 根据 viewport.mode 决定 layout
 |    |   |   |-- explainObj  # 处理 `=`` 和 `...` 模式
 |    |-- "watch"
 |    |   |-- page.finger  # 当前页面内容变化，自动更新文档标题等
 |    |                    # 百度统计等代码也可以加在这里
 |    |-- "methods"
 |    |   |-- showBlock -> "page/showBlock"  # 路由到模块方法
 |    |   |-- hideBlock -> "page/hideBlock"  # 路由到模块方法
 |    |   |-- onBlockEvent -> {actions}      # 动态路由到模块方法
 |    |-- "mounted"
 |        |-- window.onpopstate   # 检测地址栏
 |            |-- navTo page      # 切换到对应逻辑页面
 ###############################################################
 |-- "store"             # Vuex 的数据处理模型
      |-- ./site-state.json      # 站点的全局信息
      |   |-- apis={..}          # 站点的接口集合
      |   |-- base="/"           # 站点的 href base
      |   |-- logo="/logo.png"   # 站点的LOGO
      |   |-- nav=[..]           # 站点的全局导航条
      |   |-- entry="page/home"  # 站点的默认入口页
      |   |-- loading=false      # 站点的加载状态
      |   |-- actions={..}       # 站点的动作映射表
      ###########################################################
      |-- modules              # 站点子模型
      |   |-- page=@lib:www/mode/page   # 逻辑页面处理模型
      |   |   |-- showBlock(name)       # 显示页面块
      |   |   |-- hideBlock(name)       # 隐藏页面块
      |   |   |-- #----------------------------------------------
      |   |   |   # 加载页面，这一次性把页面的 api 结果加载到data
      |   |   |-- reload()
      |   |       |-- @Site:$PAGE.json      # 当前页面的配置信息
      |   |           |-- title="xxx"       # 页面标题
      |   |           |-- path="page/home"  # 页面路径
      |   |           |-- finger=SHA1(path+params+anchor)  # 内容变化指纹
      |   |           |-- params={..}       # 页面输入参数表
      |   |           |-- anchor="#xx"      # 页面的指定锚点
      |   |           |-- apis={..}         # 页面的接口配置
      |   |               |-- extend("site.apis")
      |   |           |-- data={..}         # 接口的加载结果
      |   |           |-- layout={desktop/tablet/phone}  # 页面三种布局设置
      |   |           |-- shown="xxx"     # 页面各个部分的显示隐藏开关
      |   |           |-- schema={..}     # 页面各个控件的具体配置信息
      |   |           |-- actions={..}    # 页面的附加动作映射表
      |   |-- viewport=@mod:ti/viewport   # 通用视口检测方法
      ###########################################################
      |-- @lib:www/mod/www-site.mjs     # 站点主模型
      	  |-- "getters"
      	  |   |-- actions()     # 当前页面的动作映射表(与全局合并)
      	  |-- "actions"
      	      |-- navTo()       # 提供对于链接的执行逻辑
      	      |   |-- page=> dispatch("page/reload")   # 处理站点页面
      	      |   |   |--> "调用 modules.page.reload 加载页面"
      	      |   |-- action=> dispatch(value,params)  # 处理交互动作
      	      |-- reload()      # 根据window的URL重新加载当前页
      	          |-- dispatch("navTo")  # 执行加载
 			
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
  // 站点用到的自定义函数集合
  // 后面的可以覆盖前面的
  "utils" : {
    "wn" : "@lib:www/util/wn-data-types.mjs",
    "site" : ["./js/aa.mjs", "./js/bb.js"]
  },
  //-----------------------------------------
  // 这里描述了站点要用到的 api
  "apis" : {
    // 每个 API 都有唯一的键，这个是整个站点的 api 模板
    // 每个页面根据名字引用，并且如果需要的话，可以覆盖掉如下字段
    //  - vars       : 合并
    //  - params     : 合并
    //  - preload    : 替换
    //  - dataKey    : 替换
    //  - transformer : 替换
    "apiNameA" : {
      // 支持 "i18n:xxx" 形态
      "title" : "注记名",
      // 前面不加 `/`，支持模板形态 `${xx}` 为占位符，值来自 vars 段
      // 占位符在 vars 段声明
      "path"  : "path/to/api",
      // 选，默认为GET，可为 GET|POST|INVOKE
      // 如果值为 "INVOKE" 那么本 api 则表示调用 www 模块的方法
      // path 则表示方法路径，譬如 "auth/doCheckMe"
      // 而 params 则表示调用这个方法的 payload
      "method" : "GET",
      "headers" : {
        // 请求头，默认为空
      },
      // 为 path 段声明动态展位符的值
      "vars" : {
        "xyz" : "=page.data.xxx"   // 可以动态取值
      }, 
      "params" : {
        "id" : {
          "required" : false,   // 是否为必须参数，默认 false
          // `=` 开头为动态获取数据
          // 当然也可以直接是一个静态的值
          "value" : "=page.params.id"
        }
      },
      // 仅在 POST 时有效，如果声明这个段，那么 params 则会变成 queryString
      // 直接使用 "=xxx" 可以将整个 body 动态获取一个值
      "body" : {
        "products" : "=page.data.items",
        "pay_tp" : "=page.data.payType"
      },
      // 默认为 form，可以是 form|json|text
      "bodyType": "form",
      // 返回的值用什么方式解析
      // 可选 json | text | ajax
      "as" : "json",
      // 当获取服务器响应后，在写入到 dataKey 以前，可以做一次转换
      // 以便写入的数据符合控件的预期
      // 转换器的上下文对象为 rootState
      // 如果只有调用名，可以简写为一个字符串
      "transformer" : {
        "name" : "Ti.Types.toObject",    // 调用函数（全局）
        "args" : [{..}],                 // 对象或者数组
        // 是否生成 partial 调用, 可以有以下三个选项
        //  - Falsy : 关闭 partila, args 提供的就是完备参数表
        //  - "left" : 左排参数
        //  - "right": 右排参数
        // 默认 "right"
        "partial": "right",
        // 预先解析
        // 默写需要将数据对象填充为资源路径时，需要 apiBase, base 等
        // 全局信息，这里需要预先解一下，以便填充 rootState 相关信息
        // 默认 false
        "explain": false  
      },
      // 接口的处理结果是否在页面加载时，由服务器渲染到了 DOM 里。
      // 如果是的话，会根据 params 的结果计算一个 SHA1 值
      // 在页面的 DOM 里寻找对应的节点，恢复回 JSON，这样就节省了一次网络请求
      // 同时也可以利用这个机制做到 SEO
      // 这个机制被封装在 SSR-JSON 里面
      // 数字 0 为默认值，表示不预加载
      // 大于 0 的数字，按从小到大，依次加载
      // 如果数字小于 0，则表示等页面都加载完毕后，再加载
      // 并且这个加载是不会用 await 阻断的。
      // 非常适合记录页面访问统计数据等脚本
      "preload" : 0,
      // 本选项表示即使页面不声明本 api，也加入页面
      // 通常用作全局的数据检查，譬如 auth/doCheckMe
      "pages" : true,
      // 如果开启了 preload, 这个选项可以根据 rootState 动态判断是否需要加载
      // Ti.AutoMatch.test(api.preloadWhen, rootState)
      "preloadWhen" : {..}
      // 得到的数据对象应该存放到 data 段的哪个键下，
      // 可选，如果未定义，则用 API 的键作为 dataKey
      "dataKey" : "article",
      // 得到的数据，对于 dataKey 对应的键，应该是替换还是 merget
      // 默认为 false 表示替换
      "dataMerge" : false
      // dataKey 存储的数据是被transformer过的（如果你定义了的话）
      // 有时候，你还想把transformer之前的数据也存起来，方便别的控件使用
      // 可以声明这个字段，它的意义与dataKey一样，只不过保存的是api的原始数据
      "rawDataKey": null,
      "rawDataMerge" : false,
      // 请求前是否自动清空数据（dataKey, 和 rawDataKey）指定的数据
      //  - true: 请求前一定清除
      //  - false: 请求前一定不清除
      //  - "GET": 只有 GET 请求才清除
      // 默认 GET
      "autoResetData" : "GET"
    }
  },
  //-----------------------------------------
  // 站点的基础路径
  "base" : "/www/titanium/scaffold/",
  // 站点的 API 前缀路径
  "apiBase" : "/api/titanium/",
  // 站点的总体 Logo
  "logo" : "img/logo60.png",
  // 站点主目录ID作为站点ID,这个会在 __page_init__ 过程里动态设置
  "siteId" : null,
  // 站点的所在域的名称
  "domain" : "titanium",
  //-----------------------------------------
  // 如果站点要显示图形验证码，这个验证码图片的路径模板
  // 这里的路径会自动拼合上 apiBase，除非你以 `/` 开头
  "captcha" : "auth/captcha?site=${site}&account=${account}&scene=${scene}",
  //-----------------------------------------
  // 全局的 schema，将与 page 里面的定义合并(page的定义优先)
  "schema" : {
    /*...*/
  },
  //-----------------------------------------
  // 全局的 panels 设定，在page里，可以用 "@xxx" 来引用
  "panels" : {
     "xxx" : {/*...*/}
  },
  //-----------------------------------------
  // 作为整个站点的全局导航条
  // 如果某个页面想有特殊设置，可以重载掉它
  // @see 上面站点整体描述关于 nav 每个项目的细节介绍
  "nav" : [{
      icon  : "xxx",       // 链接的图标
      title : "xxx",       // 链接文字
      // 链接类型
      //  - page     : 表示链接到一个站内页面
      //  - href     : 链接到一个外部链接
      //  - dispatch : 调用模型方法名
      type  : "page",
      // 根据类型不同这里的值形式不一样
      value : "page/home",
      // 传入链接的参数，是一个 Object
      //  - page/href : 作为 query string
      //  - dispatch  : 作为 dispatch 目标方法的 payload
      params : null,
      // 只有在 `page|href` 模式下才有效，表示页面锚点
      // 必须以 `#` 开头，如果不以 `#` 开头，处理器会自动补全
      anchor : "#XXX",
      // 是否打开新窗口，只有在 page|href 类型下有效
      newTab : false
    }],
  //-----------------------------------------
  // 页面的路由，可以将伪静态页面地址路由到真正的页面配置文件
  // 会依次遍历路由列表，依靠  "match" 来匹配，
  // 因此排在前面的优先级高
  "router" : [{
    	// 匹配的正则表达式
    	"match" : "^page/([^_]+)_([^.]+).html",
      // 为参数设置名称【选】
      "name": ["name", "id"],
    	// 页面的信息，可以用占位符 ${1} ${2}
      // 如果声明了 "names" 段，可以用名称
      "page": {
        "path" : "->page/${name}",
        "params": {
          "id": "=1"
        }
      }
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
  // 表示页面是否加载完成，当开始加载页面时，会主动设置为 false
  // 当加载完成后（page/reload完毕）会设置成 true
  "isReady" : false,
  //-----------------------------------------
  // 站点全局的动作方法映射表
  //  [块名.事件名] : 动作（字符串表动作名，对象则带payload）
  // 如果顶级块，"块名." 则不显示
  "actions" : {
    // 如果值是数组，那么页面的动作会追加在后面
    "@page:ready" : [{
      "action" : "auth/autoCheckmeOrAuthByWxghCode",
      "playload" : {
        "codeKey" : "code",
        "force" : false
      }
    }],
    // 非数组，则会替换这个动作
    "do:logout" : "auth/doLogout",
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
  // 在界面空间里，则可以方便的监控这个 finger 一旦变动，可以做一些事情
  // 譬如改变页面标题等（在单页应用里尤其有用）
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
      "apiName" : "apiNameA",
      // 这里是参数表，替换站点的对应API参数表中的 value 叠加
      "params" : {
        "id"  : "=page.params.id"
      }
    }
  },
  // 页面的数据段，记录每个 API 返回的结果
  // 如果是静态数据，可以直接在这个段里声明
  // 如果是输入控件的收集的用户输入数据，也收集在这里
  "data" : {
    "article" : Any,
    "info" : Any
  },
  // 声明了一组 data 段的键，页面加载后，
  // 也要自动 explain 这些键，支持 "."
  "explainDataKey": [],
  // 页面布局
  "layout" : {
    // 桌面布局
    "desktop" : {
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
    // 平板布局
    "tablet" : "desktop",
    // 手机布局
    "phone"  : "desktop"
  },
  // 监控各个布局块的隐藏显示，主要用在 panels 段里
  "shown" : {},
  // 页面控件配置信息
  "schema" : {/*...*/},
  // 当前页面特殊的 actions 映射
  // 如果站点级的映射动作是一个数组，则会在尾部叠加这个动作
  // 否则就覆盖站点定义的全局动作
  // 如果你给定了一个数组，那么无论站点级映射是不是数组，都会被覆盖
  "actions" : {
    "buy-now" : {
      "action"  : "auth/checkme",
      "payload" : {
        "force" : true,
        "success"   : {
          "action"  : "navTo",
          "payload" : {
            "type"  : "page",
            "value" : "page/order-create"
          }
        },
        "nophone" : {
          "action"  : "page/showBlock",
          "payload" : "login"
        },
        "fail" : {
          "action"  : "page/showBlock",
          "payload" : "login"
        }
      }
    },
    "login.get:vcode" : "auth/doGetVcode",
    "login.auth:send" : "auth/doAuth",
    "login.auth:ok" : {
      "action" : "page/hideBlock",
      "payload" : "login"
    }
  }
}
```
