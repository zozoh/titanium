---
title : View
author: zozoh(zozohtnt@gmail.com)
tags:
- walnut
- concept
---

# What is View ?

A view is a bundle of `Module`, `Component` and `Actions`.
It provided enought informations to `app/wn.manager` to present and
mutate the current `Obj` of `Walnut`.

- `Module` : Data module to mutate the `Obj`
  - It encapsulated the `Walnut` special API to `Component` and `Actions`
  - That's mean that you can safely build another customzied `Module` to changed the way to access remote server any time if you want.
- `Component` : How to present the `Obj` and response the user actions.
- `Actions` : Command set of `Obj` mutation. Shortcut would be supported also.
  - It is presented as actions menu

Once `Obj` loaded by `app/wn.manager`, whatever `DIR` or `FILE` the `app/wn.manger` will try to find one `View` to handle it. And it is the major job of the `app/wn.manger` also.

-------------------------------------------------
# View Definition

```js
{
  // The view icon
  "comIcon" : 'im-edit',
  // Component of this view
  // You can declare the `name` in `_com.json` of 
  // this component. If without declared, the path name
  // should be take as the view name. As the setting example
  // below, it should be "meta"
  "comType" : '@com:ti/obj/meta",
  // Module
  "modType" : '@mod:wn/obj-as-text',
  // Actions
  "actions" : [/*see `ti-menu` options*/]
}
```

-------------------------------------------------
# View Loading

In `app/wn.manager` it runs `Walnut` command by `Wn.Sys.exec` to
get the view defination for current `Obj`: 

```bash
titanium:> ti views id:qjt1ho2k6oh6np40vopovqg29d
# -> It will output the view Defination as JSON string
```

In javascript:

```js
Wn.Sys.exec(`ti view id:${objId}`,{as:'json'}).then(view=>{
  /* Here you got your view defination object */
})
```

> P.S.  you can  build you own `app/your.own` to change the way to load View Defination also, but it should be another topic, we will discuss it in another sestion later.

Walnut is a web OS, it stored the view mapping like this:

```bash
/rs/ti/view/            # Generatl view mapping
  |-- mapping.json      # viewo mapping file
  |-- views/            # Store all view
  		|-- text-editor.json  # View definition file
  		|-- ...               # View name as the file major name
/home/$YOUR/            # domain special view mapping
  |-- .ti/              # Titanium config home
      |-- mapping.json  # view mapping file
      |-- views/        # Your customized views
      	  |-- youview.json  # Your customized view definition file
```

The search path has been defined in ENV:

```js
{
  /*...*/
  VIEWS_PATH : "~/.ti/:/rs/ti/view/"
  /*...*/
}
```

If `VIEWS_PATH` failed to found, default value `/rs/ti/view/` will be taken.

Alternativly, you can fetch a view definition by indicated the `ViewName` explicatly:

```bash
titanium:> ti views -name "text-editor"
# -> It will output the view Defination as JSON string
```

In javascript:

```js
Wn.Sys.exec(`ti view -name "text-editor"`,{as:'json'}).then(view=>{
  /* Here you got your view defination object */
})
```

-------------------------------------------------
# View Mapping

```js
{
  // Firstly, matching by object full path.
  // In the matching, "~" will be supported. In face, the object path
  // will be normlized as "~/xxx" if it is in current user home folder
  // !!! NOTE, it is case sensitive.
  paths : {
    "~/my_folder/my_file.txt" : "$ViewName"
  },
  // Secondly, matching by object type
  // the extension name which called "object type"
  // willl be transform to lower case before process matching
  types : {
    // special type names will be try firstly
    "html" : "$ViewName"
    "mp3"  : "$ViewName"
    // RegExp has been supported, the matching keys
    // starts by '^' will be taken as RegExp.
    // And it will obey the original order of input file 
    // for matching priority
    "^(jpe?g)$" : "$ViewName"
  },
  // Then, matching by object mime Type
  // In this matching, you can use group name.
  mimes : {
    // Full mime type
    "text/xml" : "$ViewName"
    // Just a group name
    "text" : "$ViewName"
  },
  // Finally, matching by object race
  races : {
    "DIR"  : "$ViewName"
    "FILE" : "$ViewName"
  }
}
```
It will find a view definition by `$ViewName` in **view path**, which defined in ENV `VIEWS_PATH`, and it will look up the folder which the mapping located at first. If without found the view definition, it will search the `VIEW_PATH` one directory by one directory, and of cause, the location of mapping file will be skipped.

-------------------------------------------------
# How to get view information

`Walnut` provided extend command `ti views` to load view information for any given object, you can run `man ti views` for more detail in `walnut console`