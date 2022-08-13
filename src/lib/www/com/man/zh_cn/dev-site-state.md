# `global`全局加载

这里定制的全站会调用到的预加载接口

```json5
{
  "load-site-sky-menu": {
    // 具体调用哪个接口（定义在 apis）
    "apiName": "site-sky-menu",
    // 接口返回到哪个数据键
    "dataKey": "skyMenu",
    // 本调用的预加载级别
    //  - true : 相当于 1
    //  - >=0  : 页面加载【前】调用 （从小到大依次调用）
    //  - < 0  : 页面加载【后】调用 （并不保证顺序）
    "preload": true
  },
}
```

# `router`页面路由

> 页面路由由 `www-mod-page` 模块来执行

```json5
[
  // 逐个尝试 match 
  {
    // 正则表达式，匹配一下路径，通常路径都类似 path/to/some.html
    // 即，如果访问 http://my.com/path/to/a.html
    // 那么要匹配的路径就是 "path/to/a.html"
    "match": "^(zh_cn|zh_hk|en_uk)/(media|ytplayer)(.html)?",
    // 指明要用哪个页面来渲染。这里面支持 Explain 表达式
    // 上下文是 0,1,.. 表示上面正则表达式的捕获组
    // 为了让名称更加有意义，可以通过 names 来为捕获组起名
    "names" : ["id"],
    "page": {
      "path": "->page/${2}.html",
      "params": {}
    }
  },
  // 多个路由逐个 fallback
  {
    "match": "^(zh_cn|zh_hk|en_uk)/([^.]+)(.html)?",
    // 路由的时候，可以预先调用且只能调用一个 API
    // 这样，就可以通过数据，动态决定要渲染的页面
    "preload": {
      "apiName": "archive-fetch",
      "params": {
        "ph": "->~/site/${2}"
      },
      // 指向 page.data 一个存放数据的键
      // 有时候，虽然我们在 router 里声明了一个 preload
      // 但是我们可能需要在 page 里面同样尝试加载一遍这个数据
      // 因为，可能别的 router 也会路由到同样的页面
      // 但是可能并不会提供对应的数据。
      // 为此，我们需要在页面里，确保每个需要的数据都被加载上了。
      // 同时为了不重复加载数据，我们默认的会检查 dataKey
      // 如果页面模型已经有了这个数据，那么我们就不会再次加载
      // 除非，你强制声明 page 的 api preload+force，我们才会强制重新加载
      "dataKey": "archive"
    },
    "page": {
      "path": "->ar/${resp.data.layout}.html",
      "params": {
        "id": "=resp.data.id"
      }
    }
  },
  // 未声明 match 的，作为默认
  {
    "page": {
      "path" : "page/default.html"
    }
  }
]
```