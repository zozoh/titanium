---
title : <ti-menu>
author: zozoh(zozohtnt@gmail.com)
tags:
- ti
- com
---

# Example

```js
[{
  key  : "saving",
  type : "action",
  icon : "zmdi-floppy",
  text : "i18n:save-change",
  altDisplay : {
    icon : "fas-spinner fa-pulse",
    text : "i18n:saving",
  },
  enableBy : "changed",
  action : "dispatch:main/save",
  shortcut : "CTRL+S"
}, {
  key  : "reloading",
  type : "action",
  icon : "zmdi-refresh",
  text : "i18n:refresh",
  altDisplay : {
    icon : "zmdi-refresh zmdi-hc-spin",
    text : "i18n:loading",
  },
  action : "dispatch:main/reload",
  shortcut : "CTRL+R"
}, {
  key  : "more",
  type : "group",
  icon : "zmdi-settings",
  text : "i18n:more",
  items : [{
    key  : "saving",
    type : "action",
    icon : "zmdi-floppy",
    text : "i18n:save-change",
    enableBy : "changed",
    altDisplay : {
      icon : "fas-spinner fa-pulse",
      text : "i18n:saving",
    },
    action : "dispatch:main/save",
  }]
}]
```