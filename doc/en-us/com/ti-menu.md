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
  "key"  : "reloading",
  "type" : "action",
  "icon" : "zmdi-refresh",
  "text" : "i18n:refresh",
  "altDisplay" : {
    "icon" : "zmdi-refresh zmdi-hc-spin",
    "text" : "i18n:loading"
  },
  "action" : "dispatch:main/reload",
  "shortcut" : "CTRL+R"
},{
  "type":"line"
}, {
  "type" : "group",
  "icon" : "zmdi-settings",
  "text" : "i18n:more",
  "items" : [{
      "key"  : "create",
      "type" : "action",
      "icon" : "zmdi-flare",
      "text" : "i18n:create",
      "action" : "dispatch:main/create",
      "shortcut" : "ALT+CTRL+N"
    },{
      "key"  : "deleting",
      "type" : "action",
      "icon" : "zmdi-delete",
      "text" : "i18n:del",
      "altDisplay" : {
        "icon" : "zmdi-refresh zmdi-hc-spin",
        "text" : "i18n:del-ing"
      },
      "action" : "dispatch:main/deleteSelected",
      "shortcut" : "CTRL+DELETE"
    },{
      "type":"line"
    },{
      "key"  : "renaming",
      "type" : "action",
      "icon" : "zmdi-space-bar",
      "text" : "i18n:rename",
      "altDisplay" : {
        "icon" : "zmdi-refresh zmdi-hc-spin"
      },
      "action" : "dispatch:main/rename",
      "shortcut" : "F2"
    },{
      "type":"line"
    },{
      "key"  : "selectAll",
      "type" : "action",
      "icon" : "zmdi-check-all",
      "text" : "i18n:select-all",
      "action" : "commit:main/selectAll",
      "shortcut" : "CTRL+A"
    },{
      "key"  : "blurAll",
      "type" : "action",
      "icon" : "zmdi-minus",
      "text" : "i18n:blur-all",
      "action" : "commit:main/blurAll"
    },{
      "type" : "line"
    },{
      "key"  : "publishing",
      "type" : "action",
      "icon" : "zmdi-mail-send",
      "text" : "i18n:publish",
      "altDisplay" : {
        "icon" : "zmdi-refresh zmdi-hc-spin",
        "text" : "i18n:publishing"
      },
      "action" : "dispatch:main/publish",
      "shortcut" : "CTRL+SHIFT+P"
    },{
      "type" : "line"
    },{
      "key"  : "exposeHidden",
      "type" : "action",
      "icon" : "zmdi-eye-off",
      "text" : "i18n:weo-export-hidden",
      "altDisplay" : {
        "icon" : "zmdi-eye",
        "capture" : false
      },
      "action" : "commit:main/toggleExposeHidden",
      "shortcut" : "ALT+CTRL+SHIFT+H"
    },{
      "type" : "line"
    },{
      "key"  : "upload",
      "type" : "action",
      "icon" : "zmdi-cloud-upload",
      "text" : "i18n:upload-file",
      "action" : "main:openLocalFileSelectdDialog",
      "shortcut" : "ALT+CTRL+SHIFT+U"
    },{
      "type" : "line"
    },{
      "type" : "action",
      "icon" : "zmdi-download",
      "text" : "i18n:download-to-local",
      "action" : "dispatch:main/download"
    }]
}]
```