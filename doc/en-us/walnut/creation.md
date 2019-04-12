---
title : Object Creation
author: zozoh(zozohtnt@gmail.com)
tags:
- walnut
- concept
---

# What is Creation

Creation defined the object types, which can be created by user under given `DIR`.

--------------------------------------------------
# Define Creation

```js
{
  "d-box"  : ["box", "folder"],
  "DIR"    : []
}
```

- `[]` - empty array mean no limitation
- `["xx"]` - array specify the types list allowed to create
- `null` - forbid to create anything

--------------------------------------------------
# Type Defination

```js
{
  "mp4" : {
    race  : "FILE",
    icon  : "zmid-video",            // icon/thumb could be icon-font
    thumb : "svg:/path/to/svg.svg",  // or svg file
    mime  : "video/mp4",
    text  : "MP4 Video",   // display name of current type
    brief : "The brief description of MP4, pure text, options",
    help  : "mp4-help.html"
  }, 
  "html" : {
    /*..*/
  }
}
```

--------------------------------------------------
# Creation Output

```js
{
  defaultType : "folder",
  types: [{
    race  : "FILE",
    icon  : "zmid-video",            // icon/thumb could be icon-font
    thumb : "svg:/path/to/svg.svg",  // or svg file
    name  : "mp4",
    mime  : "video/mp4",
    text  : "MP4 Video",   // display name of current type
    brief : "The brief description of MP4, pure text, options",
    help  : "<h1>HTML document content as the help, <em>optional</em></h1>"
  }]
}
```

--------------------------------------------------
# Load Creation

In `app/wn.manager` it runs `Walnut` command by `Wn.Sys.exec` to
get the `creation` for current `Obj`: 

```bash
titanium:> ti creation id:qjt1ho2k6oh6np40vopovqg29d
# -> It will output the Creation Output as JSON string
```

In javascript:

```js
Wn.Sys.exec(`ti creation id:${objId}`,{as:'json'}).then(view=>{
  /* Here you got your Creation Output object */
})
```

Walnut is a web OS, it stored the view mapping like this:

```bash
/rs/ti/view/             # Generatl creation home
  |-- creation.json      # creation mapping file
  |-- types/             # each types icon
      |-- icon/          # type icon files
      |   |-- mp4.svg    # usually, we use svg
      |   |-- html.svg   # but png was supported also
      |   |-- ..
      |-- zh-cn/
      |   |-- _types.json    # Each obj type definition
      |   |-- mp4-help.html  # Help file
      |   |-- html-help.html # Optional
      |-- en-us/
/home/$YOUR/             # domain special view mapping
  |-- .ti/               # Titanium config home
      |-- creation.json  # creation mapping file
      |-- types/
          |-- icon/
          |-- zh-cn/
          |-- en-use/
```

The search path share with [View Path](view.md), which has been defined in ENV:

```js
{
  /*...*/
  VIEWS_PATH : "~/.ti/:/rs/ti/view/"
  /*...*/
}
```

> If `VIEWS_PATH` failed to found, default value `/rs/ti/view/` will be taken.

--------------------------------------------------
# How to get creation information

`Walnut` provided extend command `ti creation` to load creation information for current session, you can run `man ti creation` for more detail in `walnut console`