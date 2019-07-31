---
title: 账号与授权·元数据
author: zozoh
---

-----------------
# 会话元数据

> `.www/session/$SiteId/$TicketId`

```js
{
  id   : "45..8a",    // 会话唯一ID
  nm   : "54..8m",    // 会话的票据，会定期变化
  expi : 159..,       // 过期时间点 AMS
  uid  : "u6..8r",    // 会话的用户ID
  unm  : "xxx",       // 用户的名称（冗余）
}
```

-----------------
# 站点元数据

> `~/www` 目录，即标识了 `www="ROOT|Domain"` 元数据的目录

```js
{
  id: ID,       // 站点的 ID

  // 本站的映射域名，可以是  www.youdomain.com 之类的域名
  // 只要在 `/domain` 里做了映射，则会转到这个目录下
  www: "ROOT"

  // 当访问站点，但是没有指明入口页时，默认跳转到哪个页面，
  // 默认是 index.wnml | index.html
  www_entry: "enter.html",

  // 站点更多的设置
  www_site : {
    accounts : "~/accounts",  // ThingSet: 账号数据集
    roles    : "~/roles",     // ThingSet: 角色数据集
    orders   : "~/orders",    // ThingSet: 订单数据集
    wxmp     : "gh_xxx",      // 微信公号目录名
    se_du    : 86400          // 新会话过期时间（秒）
  }

}
```

-----------------
# 账号元数据

> `hm_account_set` 对应的数据，需要有下面的固定元数据

```js
{
  id : "u6..8r",    // 会话用户的 ID
  nm : "u6..8r",    // 用户的登录名，通常为 id

  //................................ 登录信息
  login : 158..,      // 绝对毫秒数，表示上一次登录
  role  : "user",     // 角色值，即 role.nm
  //................................ 用户信息
  th_nm  : "小白",       // 用户昵称
  thumb  : "id:xxx",    // 头像存储的位置
  city     : "海淀",
  province : "北京", 
  country  : "中国",
  sex      : "male",     // 性别 男:1,女:2

  //................................ 采用密码登录
  passwd : "$SHA1",          // 加盐密码
  salt   : "xxxx",           // 盐值

  //................................ 其他可登录字段
  phone  : "18501211985",           // 手机号码
  email  : "zozoh@nutzam.com",   // 邮箱

  //................................ 采用 oauth 认证
  // 字段以 oauth_ 开头
  oauth_github  : "xxxxxxx",
  oauth_wxlogin : "oSQW..cYq"

  //................................ 采用微信公众号的 openId
  // 键的格式为 wx_公众号ID
  // 值为 OpenID
  wx_gh_xxxx : OpenId
}
```

-----------------
# 角色元数据

那么根据 `hm_role_set`，以及用户中的 `role`，我们可以得到一个角色的元数据：

```
{
    nm       : "user",        // 角色唯一名
    th_nm    : "小白",         // 角色显示名
    mainpage : "index.wnml",  // 着陆页
    isdft    : true,          // 是否为默认角色，只能有一个有效
}
```