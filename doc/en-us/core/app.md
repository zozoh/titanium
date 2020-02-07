---
title : Ti.App
author: zozoh(zozohtnt@gmail.com)
---

# shortcut routing

If declare `v-ti-actived="__set_actived"` at any component root element, it will cause the component activable in whole app.

> `__set_actived` is builtin method declared by `com_mixins` on any component `created` lifecyle stage.

`TiApp` maintain one property `[TI_VM_ACTIVED]` to store current actived component. If shortcut fired, it will invoke `app.fireActivedVmShortcut`

Then it will call:

```
Ti.InvokeBy(this.getActivedVm(), "__ti_shortcut", [uniqKey])
```

So, if you declare the method `__ti_shortcut` in your component, you will  got this fire.

If you want to capture the shortcut firing, just return `false` in your `__ti_shortcut`.


