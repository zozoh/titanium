---
title: 账号与授权·接口
author: zozoh
---

-----------------------------------------
# 接口一览

- `/api/auth/oauth2_wx`: 微信重定向
- `/api/auth/checkme`: 取得当前账户
- `/api/auth/login_by_wxcode`: 微信自动登录
- `/api/auth/check_name` : 检查重名
- `/api/auth/check_phone`: 检查手机已注册
- `/api/auth/login_by_vcode`: 短信密码登录
- `/api/auth/login_by_passwd`: 账号密码登录
- `/api/auth/get_vcode`: 获取验证码

-----------------------------------------
# `oauth2_wx`: 微信重定向

```bash
HTTP GET
#-----------------------------
# Query String
site=5auf..25ad     # 站点ID
ta=http://xxxxx     # 重定向的目标
#-----------------------------
# Response
#-----------------------------
302
URL to weixin server
```

根据命令生成微信重定向地址:

```
weixin $gh_name oauth2 https://xxxxx -scope snsapi_userinfo
```

-----------------------------------------
# `checkme`: 取得当前账户

```bash
HTTP GET /api/auth/checkme
#-----------------------------
# Query String
site=5auf..25ad     # 站点ID
ticket=er43..23vd   # 会话票据
#-----------------------------
# Response HTTP 200
#-----------------------------
# 成功找到当前用户
{
  ok : true,
  data : {
    me : {...}   # @see auth_meta.md#账号元数据
    ticket : "54..8m"  # 会话票据
    expi : 1598..      # 绝对毫秒数，表示会话到期的时间点
  }
}
# 当前用户未登录
{
  ok : false
  errCode : "e.www.api.auth.nologin",
  msg : "用户未登陆"
}
```

-----------------------------------------
# `login_by_wxcode`: 微信自动登录

```bash
HTTP GET /api/auth/login_by_wxcode
#-----------------------------
# Query String
site=5auf..25ad     # 站点ID
code=xxx            # 微信oauth2的验证码
#-----------------------------
# Response HTTP 200
#-----------------------------
# 成功登录
{
  ok : true,
  data : {
    me : {...}   # @see auth_meta.md#账号元数据
    ticket : "54..8m"  # 会话票据
    expi : 1598..      # 绝对毫秒数，表示会话到期的时间点
  }
}
# 用 code 创建会话失败
{
  ok : false ,
  errCode : "e.www.api.auth.fail_login_by_wxcode",
  msg  : "微信自动登录失败",
  data : "..."
}
```

-----------------------------------------
# `login_by_vcode`: 短信密码登录

```bash
HTTP POST /api/auth/login_by_vcode
#-----------------------------
# Cookies
www=5auf..25ad/er43..23vd
#-----------------------------
# Params
site=5auf..25ad     # 站点ID
phone=1391...       # 手机
vcode=4321          # 验证码
#-----------------------------
# Response HTTP 200
#-----------------------------
# 注册/登录成功
{
  ok : true
  data :{
    me : {...}   # @see auth_meta.md#账号元数据
    ticket : "54..8m"  # 会话票据
    expi : 1598..      # 绝对毫秒数，表示会话到期的时间点
  }
}
# 登录失败
{
  ok : false ,
  errCode : "e.www.api.auth.fail_login_by_vcode",
  msg  : "登录失败，验证码过期或者不正确",
  data : "..."
}
```

> 这里的处理逻辑稍微复杂一点，因为会有绑定手机的场景

```bash
# 如果当前会话已经登录
{
  # 如果手机号已经有了一个账号对象
  #  - 这种场景是用户预先用手机注册一个账号
  #  - 然后在微信打开，微信会自动注册/登录，而这个账号是没有手机号的
  {
    将当前的账号信息合并过去（用户信息作为默认值）
    删除当前账号
    修改当前会话的 uid/unm
  }
  # 否则
  {
    直接修改当前账号的 phone 字段
  }
}
# 否则
{
  # 如果手机号已经有了一个账号对象
  {
    用这个账号创建一个会话
  }
  # 否则
  {
    创建一个新账号
    为这个账号创建一个会话
  }
}
```

-----------------------------------------
# `login_by_passwd`: 账号密码登录

```bash
HTTP POST /api/auth/login_by_passwd
#-----------------------------
# Params
site=5auf..25ad     # 站点ID
phone=1391...       # phone 与 name
name=xiaobai        # 二者必须有一个
passwd=123456       # 用户输入的密码明文
#-----------------------------
# Response HTTP 200
#-----------------------------
# 注册/登录成功
{
  ok : true
  data :{
    me : {...}   # @see auth_meta.md#账号元数据
    ticket : "54..8m"  # 会话票据
    expi : 1598..      # 绝对毫秒数，表示会话到期的时间点
  }
}
# 登录失败
{
  ok : false ,
  errCode : "e.www.api.auth.login_by_passwd",
  msg  : "登录失败，用户名或密码错误",
  data : "..."
}
```

-----------------------------------------
# `get_vcode`: 获取验证码

```bash
HTTP GET /api/auth/get_vcode
#-----------------------------
# Params
site=5auf..25ad     # 站点ID
phone=1391...    # 手机
captcha=45ca     # 图片验证码
#-----------------------------
# Response HTTP 200
#-----------------------------
# 验证码获取成功
{
  ok : true ,
  data : {
    expi: 60     # 验证码有效期
  }
}
# 登录失败
{
  ok : false ,
  errCode : "e.www.api.auth.fail_get_vcode",
  msg  : "获取手机验证码失败",
  data : "..."
}
```

-----------------------------------------
# `check_name`: 检查重名

```bash
HTTP GET /api/auth/check_name
#-----------------------------
# Query String
site=5auf..25ad     # 站点ID
s=xiaobai
#-----------------------------
# Response HTTP 200
#-----------------------------
# 没有重名，可以用这个名字来注册
{
  ok : true
  data : "xiaobai"
}
# 名称已经存在
{
  ok : false ,
  errCode : "e.www.api.auth.name_exists",
  msg  : "名称已存在",
  data : "xiaobai"
}
```

-----------------------------------------
# `check_phone`: 检查手机已注册

```bash
HTTP GET /api/auth/check_phone
#-----------------------------
# Query String
site=5auf..25ad     # 站点ID
s=139..
#-----------------------------
# Response HTTP 200
#-----------------------------
# 这个手机可以用来注册
{
  ok : true
  data : "xiaobai"
}
# 手机号已经被注册
{
  ok : false ,
  errCode : "e.www.api.auth.phone_exists",
  msg  : "手机号已经被注册",
  data : "139.."
}
```

-----------------------------------------
# `logout`: 注销当前账号

```bash
HTTP POST /api/auth/logout
#-----------------------------
# Response HTTP 200
#-----------------------------
# 注销成功
{
  ok : true
  data :{
    me : {...}   # @see auth_meta.md#账号元数据
    ticket : "54..8m"  # 会话票据
  }
}
# 注销失败
{
  ok : false ,
  errCode : "e.www.api.auth.logout",
  msg  : "注销失败"
}
```
