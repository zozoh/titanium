---
title: 账号与授权·接口
author: zozoh
---

-----------------------------------------
# 接口一览

- `/api/auth/oauth2_wx`: 微信重定向
- `/api/auth/checkme`: 取得当前账户
- `/api/auth/login_by_wxcode`: 微信自动登录
- `/api/auth/login_by_phone`: 短信密码登录
- `/api/auth/login_by_passwd`: 账号密码登录
- `/api/auth/captcha`: 图形验证码
- `/api/auth/get_sms_vcode`: 获取短信验证码
- `/api/auth/get_email_vcode`: 获取邮箱验证码
- `/api/auth/logout`: 注销
- `/api/auth/isava` : 检查重名

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
####################################
# 测试命令
www checkme "id:xxx" "45..ae" -ajax -cqn
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
# `login_by_phone`: 短信密码登录

```bash
HTTP POST /api/auth/login_by_vcode
#-----------------------------
# Params
site=5auf..25ad     # 站点ID
name=1391...        # 手机
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
# 如果手机号已经有了一个账号对象
{
  用这个账号创建一个会话
}
# 否则
{
  创建一个新账号
  为这个账号创建一个会话
}
```

-----------------------------------------
# `login_by_passwd`: 账号密码登录

```bash
HTTP POST /api/auth/login_by_passwd
#-----------------------------
# Params
site=5auf..25ad     # 站点ID
name=1391...        # phone 或者 name
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
####################################
# 测试命令
www checkme "id:xxx" "45..ae" -ajax -cqn
```

-----------------------------------------
# `bind_account`: 绑定手机/邮箱

```bash
HTTP POST /api/auth/bind_account
#-----------------------------
# Params
site=5auf..25ad     # 站点ID
name=1391...        # 手机/邮箱
vcode=4321          # 验证码
ticket=er43..23vd   # 登录票据（绑定手机时标识当前用户）
#-----------------------------
# Response HTTP 200
#-----------------------------
# 绑定成功
{
  ok : true
  data :{
    me : {...}   # @see auth_meta.md#账号元数据
    ticket : "54..8m"  # 会话票据
    expi : 1598..      # 绝对毫秒数，表示会话到期的时间点
  }
}
# 绑定失败
{
  ok : false ,
  errCode : "e.www.api.auth.fail_login_by_vcode",
  msg  : "登录失败，验证码过期或者不正确",
  data : "..."
}
```

> 这里的处理逻辑稍微复杂一点，因为会有绑定手机的场景

```bash
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
```

-----------------------------------------
# `captcha`: 图形验证码

```bash
HTTP GET /api/auth/captcha
#-----------------------------
# Params
site=5auf..25ad  # 站点ID
scene=robot      # 【选】验证码的场景，默认robot作为防机器人场景
account=1391...  # 手机/邮箱
#-----------------------------
# Response HTTP 200
# Content-Type: image/png
#-----------------------------
00 45 5d 78 09 12 1f 3d 19 33 f2
00 45 5d 78 09 12 1f 3d 19 33 f2
..
```

-----------------------------------------
# `get_sms_vcode`: 获取短信验证码

```bash
HTTP GET /api/auth/get_sms_vcode
#-----------------------------
# Params
site=5auf..25ad  # 站点ID
scene=login      # 验证码的场景：login/bind
account=1391...  # 手机
captcha=45ca     # 图片验证码（防机器，场景为robot）
#-----------------------------
# Response HTTP 200
#-----------------------------
# 验证码获取成功
{
  ok : true ,
  data : {
    account : "185...123",  # 账号
    duInMin : 5,            # 验证码有效期（分钟）
    expi: 1564992179107,    # 有效期的最后时间点
    maxRetry : 3,           # 最大重试次数
    retry : 0,              # 已经重试的次数
    scene : "auth"          # 验证码的场景
  }
}
# 验证码获取失败
{
  ok : false ,
  errCode : "e.www.api.auth.fail_get_vcode",
  msg  : "获取验证码失败",
  data : "..."
}
```

-----------------------------------------
# `get_email_vcode`: 获取邮箱验证码

```bash
HTTP GET /api/auth/get_email_vcode
#-----------------------------
# Params
site=5auf..25ad  # 站点ID
scene=login      # 验证码的场景：login/bind
account=1391...  # 手机
captcha=45ca     # 图片验证码（防机器，场景为robot）
#-----------------------------
# Response HTTP 200
#-----------------------------
# 验证码获取成功
{
  ok : true ,
  data : {
    account : "xx@xx.com",  # 账号
    duInMin : 20,           # 验证码有效期（分钟）
    expi: 1564992179107,    # 有效期的最后时间点
    maxRetry : 3,           # 最大重试次数
    retry : 0,              # 已经重试的次数
    scene : "auth"          # 验证码的场景
  }
}
# 验证码获取失败
{
  ok : false ,
  errCode : "e.www.api.auth.fail_get_vcode",
  msg  : "获取验证码失败",
  data : "..."
}
```

-----------------------------------------
# `logout`: 注销当前账号

```bash
HTTP POST /api/auth/logout
#-----------------------------
# Query String
site=5auf..25ad     # 站点ID
ticket=er43..23vd   # 会话票据
#-----------------------------
# Response HTTP 200
#-----------------------------
# 注销成功
{
  ok : true
  data :{
    ticket : "54..8m"  # 会话票据
    expi : 1598..      # 绝对毫秒数，表示会话到期的时间点
  }
}
# 注销失败
{
  ok : false ,
  errCode : "e.www.ticket.noexist",
  msg  : "票据找不到对应会话"
}
```

-----------------------------------------
# `isava`: 检查重名

```bash
HTTP GET /api/auth/isava
#-----------------------------
# Query String
site=5auf..25ad     # 站点ID
name=xiaobai        # 登录名/手机号/邮箱
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
  msg  : "该账号已被注册",
  data : "xiaobai"
}
```
