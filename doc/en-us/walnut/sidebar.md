---
title : Sidebar
author: zozoh(zozohtnt@gmail.com)
tags:
- walnut
- concept
---

# What is Sidebar ?

A sidebar is a quick access object set which needed by `app/wn.manager`. You can define the sidebar as you want.

-------------------------------------------------
# Sidebar Definition

> A sidebar defined by a pure JSON file:

```js
{
  "sidebar" : [{
    "icon"  : "im-xxx",
    "title" : "i18n:xxx",
    "items" : [{
        // [optional] Item key default by `obj.id`
        // The `obj` will been retrieved from `path`
        key  : "The-Item-Key",
        // [required] Item path, if noexist or without privilege,
        // the item will be dropped.
        // Formed path like "~/xxx" would be supported, and it will be
        // formmated to absolute full path.
        path : "/path/to/object",
        // [optional] Item icon 
        // @see [#Sidebar Item] for more detail
        "icon"  : "im-xxx",
        // [optional] Item icon
        "title" : "i18n:xxx",
        // [optional] Item view
        "view"  : "text-editor",
        // [optional] Item default icon
        // @see [#Sidebar Item] for more detail
        defaultIcon : "im-network",
        // [optional] Item default display text
        defaultTitle : 'i18n:xxx',
        // [optional] Item default view
        defaultView : null,
        // [optional] Additionaly privilege setting. (By server)
        // If setted, current session must matched one of the rule,
        // else the item will be dropped also.
        // If the rule is empty, it will be taken as unsetted.
        roles : {
            "ADMIN"  : ".",    // must be admin of current path
            "MEMBER" : "~/some/path",
            "ADMIN"  : "@op"   // must be admin of 'op' group
        }
    },
    // Dynamic items, it will process a customized command
    // to retrieve the sidebar items.
    // Each item's key should be `obj.id`
    {
        command : 'obj -match "{..}"',
        // The following option following the meaning defined above
        key,icon,title,view,defaultIcon, defaultTitle,defaultView,roles
    },
    // Nested group
    {
        title  : "i18n:xxx",
        items : [],
        // The following option following the meaning defined above
        key,icon,title,view,defaultIcon, defaultTitle,defaultView,roles
        // !Yes, the nested group must with a `key`, if without a
        // key the whole group will be dropped.
    }]
  }]
}
```

-------------------------------------------------
# Sidebar Item

For normal `WnObj` which declared by `path` or `command`, it will retrieve the `icon/title/view` by the priority:

1. try `icon/title/view` in `sidebar.json`
2. try `icon/title/view` in `WnObj`
3. try `defaultIcon/defaultTitle/defaultView` in `sidebar.json`
4. apply the default value

The default value of each fields:

Field            | Default Value
-----------------|------------------------------------
icon.WnObj | `{tp, mime, race}`
icon.Group  | `null`
title.WnObj  | `obj.nm`
title.Group   | `"Group"`
view.WnObj | `null`
view.Group  | `null`

-------------------------------------------------
# Sidebar Output

By `Sidebar Definition`, it will generated a explicit sidebar manifestation:

```js
{
  "sidebar" : [{
    "depth" : 0,   // Item depth, 0 base
    "text"  : "i18n:xxx",   // Items group
    "items" : [{
        depth : 1,
        key  : "The-Item-Key",     // [*] Item key default by `obj.id`
        oid  : "xxx",              // [O] Item id, `null` if group
        path : "/path/to/object",  // [*] Item path
        icon : "im-network",       // [*] Item icon
        text : 'i18n:xxx',         // [*] Item text
        view : null   // Item view, default is `null` mean "auto"
    }]
  }, {
      // Another group
  }]
}
```

-------------------------------------------------
# Sidebar Loading

In `app/wn.manager` it runs `Walnut` command by `Wn.Sys.exec` to
get the view defination for current `Obj`: 

```bash
titanium:> ti sidebar
  # It will output the sidebar Defination as JSON string
```

In javascript:

```js
Wn.Sys.exec(`ti sidebar`,{as:'json'}).then(view=>{
  /* Here you got your view defination object */
})
```

The search path has been defined in ENV:

```js
{
  /*...*/
  SIDEBAR_PATH : "~/.ti/sidebar.json:/rs/ti/view/sidebar.json"
  /*...*/
}
```

If `SIDEBAR_PATH` failed to found, default value `/rs/ti/view/sidebar.json` will be taken.

Typically, the sidebar has been stored like this:

```bash
/rs/ti/view/          # Generatl view home
  |-- sidebar.json    # System defaul sidebar
/home/$YOUR/          # domain special view mapping
  |-- .ti/            # Titanium config home
      |-- sidebar.json  # your special sidebar
```

-------------------------------------------------
# How to get sidebar information

`Walnut` provided extend command `ti sidebar` to load sidebar information for current session, you can run `man ti sidebar` for more detail in `walnut console`