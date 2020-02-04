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
# Editing

## Site Top Level

```bash
SITE
|-- com/              # -> <wn-adaptlist>
|   |-- page-footer/  # -> <wn-adaptlist>
|-- css/              # -> <wn-adaptlist>
|   |-- all.css       # -> <ti-text-raw>
|-- i18n/             # -> <wn-adaptlist>
|   |-- zh-cn/        # -> <wn-adaptlist>
|       |-- all.i18n.json  # -> <ti-obj-json>
|-- js/               # site customized script
|   |-- all.js        # -> <ti-text-raw>
|-- img/              # -> <wn-adaptlist>
|-- page/             # -> <wn-adaptlist>
|   |-- home.json     # -> <wn-hmaker-page> {NEW}
|-- _app.json         # -> <ti-obj-json>
|-- site-state.json   # -> <wn-hmaker-site> {NEW}
```

## wn-hmaker-site

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
|-- utils : {..}            # -> <wn-hmaker-utils-list> {NEW}
|-- apis  : {..}            # -> <wn-hmaker-api-list> {NEW}
|   |-- thing/get           # -> <wn-hmaker-api-item> {NEW}
|-- schema  : {..}          # -> <wn-hmaker-schema-list> {NEW}
|   |-- list-desktop        # -> <wn-hmaker-scheme-item> {NEW}
|-- blocks  : {..}          # -no-selectable-
|   |-- desktop             # -> <wn-hmaker-layout-block-list> {NEW}
|   |   |-- sky             # -> <wn-hmaker-layout-block-item> {NEW}
|   |       |-- [0]: {..}   # -> <wn-hmaker-layout-block-item>
|   |       |-- [1]: {..}   # -> <wn-hmaker-layout-block-item>
|   |-- tablet              # -> <wn-hmaker-layout-block-list> reuse
|   |-- phone               # -> <wn-hmaker-layout-block-list> desktop
|-- nav     : [..]          # -> <wn-hmaker-nav-list> {NEW}
|   |-- [0] : {..}          # -> <wn-hmaker-nav-item> {NEW}
|   |-- [1] : {..}          # -> <wn-hmaker-nav-item>
|-- router  : [..]          # -> <wn-hmaker-router-list> {NEW}
|   |-- [0] : {..}          # -> <wn-hmaker-router-item> {NEW}
|-- actions : {..}          # -> <wn-hmaker-action-list> {NEW}
    |-- "@page:ready"       # -> <wn-hmaker-action-item> {NEW}
```

## wn-hmaker-page

```bash
some-page.json
|-- title   : "xxx"         # -> <ti-input>
#-------------------------------------------------------------
|-- apis  : {..}            # -> <wn-hmaker-api-list>
|   |-- thing/get           # -> <wn-hmaker-api-item>
|-- data    : {..}          # -> <ti-obj-json>
|-- params  : {..}          # -> <ti-obj-json>
|-- layout  : {..}          # non-selectable
|   |-- desktop             # -> <wn-hmaker-layout-block-edit> {NEW}
|   |   |-- [0]: {..}       # -> <wn-hmaker-layout-block-item>
|   |   |-- [1]: {..}       # ->  support : "@BLOCK(desktop.sky)"
|   |-- tablet              # -> <wn-hmaker-layout-block-edit> reuse
|   |-- phone               # -> <wn-hmaker-layout-block-edit> desktop
|-- schema  : {..}          # -> <wn-hmaker-schema-list>
|   |-- news-list-desktop   # -> <wn-hmaker-scheme-item>
|   |-- news-detail         # -> support: "extends" : "list-desktop"
|-- shown   : {login:false} # -> <wn-hmaker-shown-list>
|-- actions : {..}          # -> <wn-hmaker-action-list>
    |-- "buy-now"           # -> <wn-hmaker-action-item>
```