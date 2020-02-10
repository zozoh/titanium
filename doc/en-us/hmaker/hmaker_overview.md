---
title : hMaker Overview
author: zozoh(zozohtnt@gmail.com)
---

# What is hMaker

`hMaker` mantians all resources of a site:

```bash
SITE
|-- com/              # site customized components
|-- css/              # site casecade style sheets
|-- i18n/             # site i18n site
|-- js/               # site customized script
|-- img/              # any folder
|-- page/             # page folder
|   |-- home.json     # home page configuration
|-- _app.json         # site application setup
|-- site-state.json   # site global setup
```

-------------------------------------------------------------
# Site Global

```bash
site-state.json
|-- domain : "demo"         # [auto] site domain 
|-- apiBase : "/api/demo/"  # [auto] site api base
|-- captcha : "auth/ca..."  # [auto] sitte captcha api url pattern
|-- base : "/www/demo"      # [auto] site reouce base
#-------------------------------------------------------------
# private status (non-editable)
|-- loading : false
|-- isReady : false
#-------------------------------------------------------------
|-- utils : {..}            # utility function set
|-- apis  : {..}            # global api definations
|-- schema  : {..}          # global compnents schema
|-- blocks  : {..}          # global block pre-defination
|-- nav     : [..]          # site navitation setting
|-- router  : [..]          # site page router
|-- entry   : "page/home.html"  # site entry page
|-- actions : {..}          # site global actions for each page
```

-------------------------------------------------------------
# Site Page

```bash
some-page.json
|-- title   : "xxx"         # page title
|-- apis    : {..}          # page api definations
|-- data    : {..}          # page private data
|-- params  : {..}          # page input params
|-- layout  : {desktop:..}  # page layout
|-- schema  : {..}          # page compnents schema
|-- shown   : {login:false} # page panel shown
|-- actions : {..}          # page actions
```

-------------------------------------------------------------
# Editing.Modules

```bash
SITE                  # -> @hmaker/site-explorer
|-- com/              # 
|   |-- page-footer/  # 
|-- css/              # 
|   |-- all.css       # 
|-- i18n/             # 
|   |-- zh-cn/        # 
|       |-- all.i18n.json  # 
|-- js/               # 
|   |-- all.js        # 
|-- img/              # 
|-- page/             # 
|   |-- home.json     # -> @hmaker/site-page
|-- _app.json         # -> @hmaker/site-app
|-- site-state.json   # -> @hmaker/site-state
```

The module hierarchy should be:

```bash
@hmaker/website      # reload,CRUD
|-- tree : .mod/site-tree     # mutate: site reource as tree
|-- app  : @wn/obj-as-json    # mutate: _app.json
|-- site : @wn/obj-as-json    # mutate: site-state.json
|-- page : @wn/obj-as-json    # mutate: each page
```

## site-tree module

The `site-tree` state json should like:

```js
{
  // The root node should refer to website.state.meta
  "root" : {
    "id"   : "=meta.id",   // site.meta.id as Root Node Id
    "name" : "=meta.nm",   // site.meta.nm as Root Node Name
    "meta" : "=meta"       // refer to site.meta as WnObj
    "leaf" : false         // Indicate node as leaf or node
    // If current node is NOT leaf, which it must be, always
    // set the `children:[]`
    "children" : [{
        "id"   : "45a..gh3",    // object id
        "name" : "_app.json",   // object name
        "leaf" : true,          // Indicate node as leaf or node
        "meta" : {/*..*/},      // the WnObj Meta
      }, {
        "id"   : "45a..gh3",    // object id
        "name" : "page",        // object name
        "leaf" : false,         // Indicate it is leaf node
        "meta" : {/*..*/},      // the WnObj Meta,
        "children" : [
          /* children pages */
        ]
      }]
  }
}
```

-------------------------------------------------------------
# Editing.Components

## Site Top Level

```bash
SITE                  # -> <hmaker-site-manager>
|-- com/              # -> <wn-adaptlist>
|   |-- page-footer/  # -> <wn-adaptlist>
|-- css/              # -> <wn-adaptlist>
|   |-- all.css       # -> <ti-text-raw>
|-- i18n/             # -> <wn-adaptlist>
|   |-- zh-cn/        # -> <wn-adaptlist>
|       |-- all.i18n.json  # -> <ti-obj-json>
|-- js/               # -> <wn-adaptlist>
|   |-- all.js        # -> <ti-text-raw>
|-- img/              # -> <wn-adaptlist>
|-- page/             # -> <wn-adaptlist>
|   |-- home.json     # -> <hmaker-page> {NEW}
|-- _app.json         # -> <ti-obj-json>
|-- site-state.json   # -> <hmaker-site> {NEW}
```

## hmaker-site

```bash
site-state.json
#-------------------------------------------------------------
# Readonly
|-- domain : "demo"
|-- apiBase : "/api/demo/"
|-- captcha : "auth/ca..."
|-- base : "/www/demo"
#-------------------------------------------------------------
# private status (non-editable)
|-- loading : false
|-- isReady : false
#-------------------------------------------------------------
|-- entry   : "page/home.html"  # -> <ti-combo-input>
|-- utils : {..}            # -> <hmaker-utils-list> {NEW}
|-- apis  : {..}            # -> <hmaker-api-list> {NEW}
|   |-- thing/get           # -> <hmaker-api-item> {NEW}
|-- schema  : {..}          # -> <hmaker-schema-list> {NEW}
|   |-- list-desktop        # -> <hmaker-scheme-item> {NEW}
|-- blocks  : {..}          # -no-selectable-
|   |-- desktop             # -> <hmaker-layout-block-list> {NEW}
|   |   |-- sky             # -> <hmaker-layout-block-item> {NEW}
|   |       |-- [0]: {..}   # -> <hmaker-layout-block-item>
|   |       |-- [1]: {..}   # -> <hmaker-layout-block-item>
|   |-- tablet              # -> <hmaker-layout-block-list> reuse
|   |-- phone               # -> <hmaker-layout-block-list> desktop
|-- nav     : [..]          # -> <hmaker-nav-list> {NEW}
|   |-- [0] : {..}          # -> <hmaker-nav-item> {NEW}
|   |-- [1] : {..}          # -> <hmaker-nav-item>
|-- router  : [..]          # -> <hmaker-router-list> {NEW}
|   |-- [0] : {..}          # -> <hmaker-router-item> {NEW}
|-- actions : {..}          # -> <hmaker-action-list> {NEW}
    |-- "@page:ready"       # -> <hmaker-action-item> {NEW}
```

## hmaker-page

```bash
some-page.json
|-- title   : "xxx"         # -> <ti-input>
#-------------------------------------------------------------
|-- apis  : {..}            # -> <hmaker-api-list>
|   |-- thing/get           # -> <hmaker-api-item>
|-- data    : {..}          # -> <ti-obj-json>
|-- params  : {..}          # -> <ti-obj-json>
|-- layout  : {..}          # non-selectable
|   |-- desktop             # -> <hmaker-layout-block-edit> {NEW}
|   |   |-- [0]: {..}       # -> <hmaker-layout-block-item>
|   |   |-- [1]: {..}       # ->  support : "@BLOCK(desktop.sky)"
|   |-- tablet              # -> <hmaker-layout-block-edit> reuse
|   |-- phone               # -> <hmaker-layout-block-edit> desktop
|-- schema  : {..}          # -> <hmaker-schema-list>
|   |-- news-list-desktop   # -> <hmaker-scheme-item>
|   |-- news-detail         # -> support: "extends" : "list-desktop"
|-- shown   : {login:false} # -> <hmaker-shown-list>
|-- actions : {..}          # -> <hmaker-action-list>
    |-- "buy-now"           # -> <hmaker-action-item>
```