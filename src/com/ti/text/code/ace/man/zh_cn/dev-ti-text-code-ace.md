---
title: 代码编辑器:TiTextCodeAce
author: zozohtnt@gmail.com
screen:
- desktop
- mobile
---

# 富文本编辑器

本编辑器是对于`ACE`的整合。

- [Ace 官网](https://ace.c9.io/)


# 属性列表

## 数据属性

 Name      | Description       
-----------|------------------
 `value`   | 编辑内容

## 行为属性

Name         | Description                                    
-------------|-----------------------------------------------
`toolbar`    | 控件数据                               
`plugins`    | 插件列表，字符串列表，会在运行时被`Ti.Load`异步加载
`pluginUrl`  | 解析插件列表内容到可以被`Ti.Load`接受的 URL 的方法
`readonly`   | 只读
`tinyConfig` | TinyMCE 自定义设置（参见 TinyMCE 文档）
`tinySetup`  | 编辑器自定义回调


## 外观属性

Name          | Description                                    
--------------|-----------------------------------------------
`lang`        | 界面语言                              
`placeholder` | 空白占位文字
`theme`       | 文档样式主题
`loadingAs`   | 内容加载中的样式
`blankAs`     | 空内容样式

