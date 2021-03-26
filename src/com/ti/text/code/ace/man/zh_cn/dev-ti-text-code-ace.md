---
title: 富文本编辑器:TiTextRichTinymce
author: zozohtnt@gmail.com
screen:
- desktop
- mobile
---

# 富文本编辑器

本编辑器是对于`TiTextRichTinymce`的整合。

- [TinyMCE 官网](https://www.tiny.cloud)
- [创建一个 TinmyMCE 插件](https://www.tiny.cloud/docs/advanced/creating-a-plugin/)

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

# 插件详情

插件是通过`@plugins`描述的插件路径，在编辑器初始化时通过`Ti.Load`加载的。
插件模块遵循如下规范:

```js
// 总之需要导出 default 对象
export default {
  // 插件的名称，这个会传递给 TinyMCE 的 plugins 配置项
  // 作为本编辑的额外插件，它不会覆盖你原本的 tinymce.plugins 设置
  // 而是会追加在后面
  name : "ti-heading",
  // 这个函数会在初始化 TinyMCE 之前，给插件一个机会，修改配置项
  init : function(config) {
    // TODO update config
  },
  // 这个是 TinyMCE 标准插件函数，遵循起规范，详情请参见
  // https://www.tiny.cloud/docs/advanced/creating-a-plugin/
  // 这个函数是控件在初始化 TinyMCE 时，逐个通过 PluginManager.add
  // 加入 TinyMCE 的
  setup : function(editor, url){
    // TODO plugin detail
  }
}
```
