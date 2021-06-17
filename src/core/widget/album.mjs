const ALBUM_CLASS_NAME = "ti-widget-album"
const WALL_CLASS_NAME = "photo-wall"
const DFT_WALL_CLASS = [
  'flex-none', 'item-margin-md', 'item-padding-no',
  'pic-fit-cover', 'hover-to-zoom', "at-bottom",
  'title-wrap-ellipsis'
]
////////////////////////////////////////////////
class TiAlbum {
  //---------------------------------------
  constructor($el, setup) {
    Ti.Dom.addClass($el, ALBUM_CLASS_NAME)
    this.$el = $el
    this.setup = _.assign({
      live: false,
      attrPrefix: "wn-obj-",
      dftWallClass: DFT_WALL_CLASS,
      itemToPhoto: {
        name: "=name",
        link: "=link",
        thumb: "=thumb",
        src: "=src",
        brief: "=brief"
      }
    }, setup)
    // If live album, and fullpreview
    // Mark the root element. (the element not join the DOM yet)
    // Client maybe attach the live fullpreview widget to the element later
    let data = this.getData();
    if (this.setup.live && data.fullpreview) {
      Ti.Dom.setAttrs(this.$el, {
        widget: "album-fullpreview",
        titleKey: `${this.setup.attrPrefix}title`
      }, "ti-live-")
    }
  }
  //---------------------------------------
  setData(album = {}) {
    let { attrPrefix } = this.setup
    let attrs = this.formatData(album)
    Ti.Dom.setStyle(this.$el, attrs.style)
    Ti.Dom.setAttrs(this.$el, _.omit(attrs, "style"), attrPrefix)
    // Clean the attribute for re-count the falls columns
    // They will be re-gen when renderPhotos()
    Ti.Dom.setAttrs(this.$el, {
      tiAlbumFallsWidth: null,
      tiAlbumFallsCount: null,
    })
  }
  //---------------------------------------
  formatData(album = {}) {
    let { dftWallClass } = this.setup
    let {
      id, name, link, layout, fullpreview, autoopen,
      style, wallStyle, tileStyle, imageStyle,
      titleStyle, briefStyle,
      wallClass
    } = album

    wallClass = Ti.Dom.getClassList(wallClass, {
      dftList: dftWallClass
    })

    style = Ti.Dom.formatStyle(style)
    wallStyle = Ti.Dom.formatStyle(wallStyle)
    tileStyle = Ti.Dom.formatStyle(tileStyle)
    imageStyle = Ti.Dom.formatStyle(imageStyle)
    titleStyle = Ti.Dom.formatStyle(titleStyle)
    briefStyle = Ti.Dom.formatStyle(briefStyle)

    return {
      id, name, link, layout, fullpreview, autoopen,
      wallClass: wallClass.join(" "),
      style: Ti.Dom.renderCssRule(style),
      wallStyle: Ti.Dom.renderCssRule(wallStyle),
      tileStyle: Ti.Dom.renderCssRule(tileStyle),
      imageStyle: Ti.Dom.renderCssRule(imageStyle),
      titleStyle: Ti.Dom.renderCssRule(titleStyle),
      briefStyle: Ti.Dom.renderCssRule(briefStyle),
    }
  }
  //---------------------------------------
  getData() {
    let { attrPrefix } = this.setup
    let N = attrPrefix.length
    let album = Ti.Dom.attrs(this.$el, (name) => {
      if ("style" == name) {
        return name
      }
      if (name.startsWith(attrPrefix)) {
        return _.camelCase(name.substring(N))
      }
    })
    let {
      style, wallClass, wallStyle, tileStyle, imageStyle,
      titleStyle, briefStyle,
    } = album
    album.wallClass = Ti.Dom.getClassList(wallClass).join(" ")
    album.style = Ti.Dom.parseCssRule(style)
    album.wallStyle = Ti.Dom.parseCssRule(wallStyle)
    album.tileStyle = Ti.Dom.parseCssRule(tileStyle)
    album.imageStyle = Ti.Dom.parseCssRule(imageStyle)
    album.titleStyle = Ti.Dom.parseCssRule(titleStyle)
    album.briefStyle = Ti.Dom.parseCssRule(briefStyle)
    album.type = this.$el.getAttribute("ti-album-type")
    return album
  }
  //---------------------------------------
  covertToPhotos(items = []) {
    let { itemToPhoto } = this.setup
    return _.map(items, it => {
      let po = Ti.Util.explainObj(it, itemToPhoto, {
        evalFunc: true
      })
      po.item = it
      return po
    })
  }
  //---------------------------------------
  renderItems(items = []) {
    let photos = this.covertToPhotos(items)
    //console.log({items, photos})
    this.renderPhotos(photos)
  }
  //---------------------------------------
  renderPhotos(photos = []) {
    let { attrPrefix } = this.setup
    let album = this.getData()

    // Build OUTER
    let $wall = Ti.Dom.createElement({
      tagName: "div",
      className: [
        WALL_CLASS_NAME, album.wallClass,
        `layout-${album.layout || "wall"}`
      ],
      style: album.wallStyle
    })

    // Render photos
    if ("falls" == album.layout) {
      this.renderPhotosAsFalls(photos, { $wall, album, attrPrefix })
    } else {
      this.renderPhotosAsWall(photos, { $wall, album, attrPrefix })
    }

    // Update content
    this.$el.innerHTML = ""
    Ti.Dom.appendTo($wall, this.$el)
  }
  //---------------------------------------
  renderPhotosAsWall(photos = [], { $wall, album, attrPrefix }) {
    // Build tils
    for (let i = 0; i < photos.length; i++) {
      this.createPhotoTileElement($wall, photos[i], album, attrPrefix)
    }
  }
  //---------------------------------------
  renderPhotosAsFalls(photos = [], { $wall, album, attrPrefix }) {
    //
    // Eval columns
    let { count, width } = this.evalColumns($wall, album)
    //console.log("renderPhotosAsFalls", album)

    // Save status
    Ti.Dom.setAttrs(this.$el, { count, width }, "ti-album-falls-")

    // Prepare the falls groups
    let $fallsGroups = []
    for (let i = 0; i < count; i++) {
      let $grp = Ti.Dom.createElement({
        $p: $wall,
        tagName: "div",
        className: "falls-group",
        style: { width }
      })
      $fallsGroups.push($grp)
    }

    // Prepare style
    let { tileStyle, imageStyle, titleStyle, briefStyle } = album
    tileStyle = _.omit(tileStyle, "width", "maxWidth", "minWidth")
    let photoStyles = {
      tileStyle, imageStyle, titleStyle, briefStyle
    }

    // Build tils
    for (let i = 0; i < photos.length; i++) {
      let gIx = i % count
      let $grp = $fallsGroups[gIx]
      this.createPhotoTileElement($grp, photos[i], photoStyles, attrPrefix)
    }
  }
  //---------------------------------------
  createPhotoTileElement($p, photo, {
    tileStyle, imageStyle, titleStyle, briefStyle
  }, attrPrefix) {
    let { thumb, src, link, name, brief, item } = photo
    let $tile = Ti.Dom.createElement({
      $p,
      tagName: "a",
      className: "wall-tile",
      style: tileStyle,
      attrs: {
        href: link || null,
        title: name || null,
        target: "_blank"
      }
    })
    let $img = Ti.Dom.createElement({
      $p: $tile,
      tagName: "img",
      style: imageStyle,
      attrs: {
        src: thumb || src,
        srcLarge: src
      }
    })
    if (name && !Ti.S.isBlank(name)) {
      let $title = Ti.Dom.createElement({
        $p: $tile,
        tagName: "div",
        className: "tile-title",
        style: titleStyle
      })
      $title.innerText = name.replace(/\r?\n/g, " ")
    }
    if (brief && !Ti.S.isBlank(brief)) {
      let $title = Ti.Dom.createElement({
        $p: $tile,
        tagName: "div",
        className: "tile-brief",
        style: briefStyle
      })
      $title.innerText = brief
    }
    // Save photo setting
    Ti.Dom.setAttrs($img, item, attrPrefix)
  }
  //---------------------------------------
  evalColumns($wall, album) {
    // In WWW page, the album always be redraw in background DIV
    // it was not JOIN the DOM tree yet. so, we can not get the measure.
    // At the editing time, we save the two attribute to avoid eval
    // them in this case.
    let { count, width } = Ti.Dom.attrs(this.$el, (name, value) => {
      if ("ti-album-falls-width" == name) {
        return "width"
      }
      if ("ti-album-falls-count" == name) {
        return { name: "count", value: value * 1 }
      }
    })
    if (count > 0) {
      return { count, width }
    }

    // Then lets see how to calculate the two values ...
    // Insert stub to measure the inner size
    //console.log("evalColumns", album)
    this.$el.innerHTML = ""
    Ti.Dom.appendTo($wall, this.$el)
    this.showLoading($wall)

    // Get the stub
    let $stub = Ti.Dom.find(".album-loading-stub", $wall)
    let stubW = $stub.clientWidth

    // Get rem base
    let $html = $stub.ownerDocument.documentElement
    let fontSize = $html.style.fontSize || "100px"
    let remBase = Ti.Css.toAbsPixel(fontSize)
    let absCtx = { remBase, base: stubW }

    // Get tile width
    let itW = _.get(album, "tileStyle.width") || "25%"
    let itWpx = Ti.Css.toAbsPixel(itW, absCtx)

    if (itWpx > 0) {
      Ti.Dom.remove($stub)
      return {
        count: Math.floor(stubW / itWpx),
        width: itW
      }
    }
    // KAO!!!
    else {
      throw "Fail to eval falls columns count: itW: " + itW
    }
  }
  //---------------------------------------
  getPhotos() {
    let attrPrefix = this.setup.attrPrefix
    let attrTpName = `${attrPrefix}layout`
    // Falls photos
    if ("falls" == this.$el.getAttribute(attrTpName)) {
      return this.getFallsPhotos()
    }
    // Wall photos
    return this.getWallPhotos()
  }
  //---------------------------------------
  getFallsPhotos() {
    let list = []
    let $wall = Ti.Dom.find(":scope > ." + WALL_CLASS_NAME, this.$el)
    let $grps = Ti.Dom.findAll(".falls-group", $wall)
    if (!_.isEmpty($grps)) {
      let grpList = []
      let total = 0
      for (let $grp of $grps) {
        let $tiles = Ti.Dom.findAll(".wall-tile", $grp)
        let grpData = []
        for (let i = 0; i < $tiles.length; i++) {
          let li = this.getPhotoDataFromTile($tiles[i])
          grpData.push(li)
          total++
        }
        grpList.push(grpData)
      }
      // Column -> List
      while (total > 0) {
        for (let i = 0; i < grpList.length; i++) {
          let grpData = grpList[i]
          if (grpData.length > 0) {
            let li = grpData.shift()
            list.push(li)
            total--
          }
        }
      }
    }
    return list
  }
  //---------------------------------------
  getWallPhotos() {
    let list = []
    let $wall = Ti.Dom.find(":scope > ." + WALL_CLASS_NAME, this.$el)
    let $tiles = Ti.Dom.findAll(".wall-tile", $wall)
    for (let i = 0; i < $tiles.length; i++) {
      let li = this.getPhotoDataFromTile($tiles[i])
      list.push(li)
    }
    return list
  }
  //---------------------------------------
  getPhotoDataFromTile($tile) {
    let attrPrefix = this.setup.attrPrefix
    let N = attrPrefix.length
    let $img = Ti.Dom.find("img", $tile)
    let item = Ti.Dom.attrs($img, (key, val) => {
      if (key.startsWith(attrPrefix)) {
        let name = _.camelCase(key.substring(N))
        let value = val
        if (/^\{.*\}$/.test(val)) {
          try {
            value = JSON.parse(val)
          } catch (E) { }
        }
        return { name, value }
      }
    })
    return {
      name: $tile.getAttribute("title") || null,
      link: $tile.getAttribute("href") || null,
      thumb: $img.getAttribute("src") || null,
      src: $img.getAttribute("src-large") || null,
      item
    }
  }
  //---------------------------------------
  convertToItems(photos = []) {
    return _.map(photos, photo => photo.item)
  }
  //---------------------------------------
  getItems() {
    let photos = this.getPhotos()
    return this.convertToItems(photos)
  }
  //---------------------------------------
  showLoading($ta) {
    $ta = $ta || this.$el
    $ta.innerHTML = [
      `<div class="album-loading-stub">`,
      `<i class="fas fa-spinner fa-spin"></i>`,
      `</div>`
    ].join("")
  }
  //---------------------------------------
}
////////////////////////////////////////////////
export const Album = {
  //---------------------------------------
  getEditFormConfig(prefix) {
    let PL = _.kebabCase(prefix)
    return {
      className: "no-status",
      spacing: "tiny",
      fields: [{
        title: `i18n:hmk-${PL}-info`,
        fields: [
          {
            title: `i18n:hmk-${PL}-id`,
            name: "id",
            comConf: {
              className: "is-nowrap",
              fullField: false
            }
          },
          {
            title: `i18n:hmk-${PL}-name`,
            name: "name"
          },
          {
            title: `i18n:hmk-w-edit-album-fullpreview`,
            name: "fullpreview",
            type: "Boolean",
            comType: "TiToggle"
          },
          {
            title: `i18n:hmk-w-edit-album-autoopen`,
            name: "autoopen",
            type: "Boolean",
            comType: "TiToggle"
          }
        ]
      },
      {
        title: "i18n:hmk-aspect",
        fields: [{
          title: "i18n:layout",
          name: "layout",
          defaultAs: "wall",
          comType: "TiSwitcher",
          comConf: {
            options: [
              { value: "wall", text: "i18n:hmk-layout-wall" },
              { value: "falls", text: "i18n:hmk-layout-falls" }]
          }
        },
        {
          title: "i18n:style",
          name: "wallClass",
          emptyAs: null,
          comType: "HmPropClassPicker",
          comConf: {
            valueType: "String",
            dialogHeight: 600,
            form: {
              fields: [{
                title: "i18n:hmk-class-flex",
                name: "flexMode",
                comType: "TiSwitcher",
                comConf: {
                  options: [
                    { value: "flex-none", text: "i18n:hmk-class-flex-none" },
                    { value: "flex-both", text: "i18n:hmk-class-flex-both" },
                    { value: "flex-grow", text: "i18n:hmk-class-flex-grow" },
                    { value: "flex-shrink", text: "i18n:hmk-class-flex-shrink" }]
                }
              },
              {
                title: "i18n:hmk-class-item-padding",
                name: "itemPadding",
                comType: "TiSwitcher",
                comConf: {
                  options: [
                    { value: "item-padding-no", text: "i18n:hmk-class-sz-no" },
                    { value: "item-padding-xs", text: "i18n:hmk-class-sz-xs" },
                    { value: "item-padding-sm", text: "i18n:hmk-class-sz-sm" },
                    { value: "item-padding-md", text: "i18n:hmk-class-sz-md" },
                    { value: "item-padding-lg", text: "i18n:hmk-class-sz-lg" },
                    { value: "item-padding-xl", text: "i18n:hmk-class-sz-xl" }
                  ]
                }
              },
              {
                title: "i18n:hmk-class-item-margin",
                name: "itemMargin",
                comType: "TiSwitcher",
                comConf: {
                  options: [
                    { value: "item-margin-no", text: "i18n:hmk-class-sz-no" },
                    { value: "item-margin-xs", text: "i18n:hmk-class-sz-xs" },
                    { value: "item-margin-sm", text: "i18n:hmk-class-sz-sm" },
                    { value: "item-margin-md", text: "i18n:hmk-class-sz-md" },
                    { value: "item-margin-lg", text: "i18n:hmk-class-sz-lg" },
                    { value: "item-margin-xl", text: "i18n:hmk-class-sz-xl" }
                  ]
                }
              },
              {
                title: "i18n:hmk-class-text-at",
                name: "textAt",
                comType: "TiSwitcher",
                comConf: {
                  options: [
                    { value: "at-top", text: "i18n:hmk-class-at-top" },
                    { value: "at-center", text: "i18n:hmk-class-at-center" },
                    { value: "at-bottom", text: "i18n:hmk-class-at-bottom" }
                  ]
                }
              },
              {
                title: "i18n:hmk-class-title-wrap",
                name: "titleWrap",
                defaultAs: "title-warp",
                comType: "TiSwitcher",
                comConf: {
                  options: [
                    { value: "title-wrap-auto", text: "i18n:hmk-class-text-wrap-auto" },
                    { value: "title-wrap-clip", text: "i18n:hmk-class-text-wrap-clip" },
                    { value: "title-wrap-ellipsis", text: "i18n:hmk-class-text-wrap-ellipsis" }
                  ]
                }
              },
              {
                title: "i18n:hmk-class-object-fit",
                name: "picFit",
                comType: "TiSwitcher",
                comConf: {
                  options: [
                    { value: "pic-fit-fill", text: "i18n:hmk-class-object-fit-fill" },
                    { value: "pic-fit-cover", text: "i18n:hmk-class-object-fit-cover" },
                    { value: "pic-fit-contain", text: "i18n:hmk-class-object-fit-contain" },
                    { value: "pic-fit-none", text: "i18n:hmk-class-object-fit-none" }
                  ]
                }
              },
              {
                title: "i18n:hmk-class-hover",
                name: "textHover",
                comType: "TiSwitcher",
                comConf: {
                  options: [
                    { value: "hover-to-up", text: "i18n:hmk-class-hover-to-up" },
                    { value: "hover-to-scale", text: "i18n:hmk-class-hover-to-scale" },
                    { value: "hover-to-zoom", text: "i18n:hmk-class-hover-to-zoom" }
                  ]
                }
              }]
            }
          } // title : "整体风格",
        }]
      },
      {
        title: "i18n:hmk-style-adv",
        fields: [{
          title: "i18n:hmk-style-outside",
          name: "style",
          type: "Object",
          emptyAs: null,
          comType: "HmPropCssRules",
          comConf: {
            rules: "#BLOCK"
          }
        },
        {
          title: "i18n:hmk-style-inside",
          name: "wallStyle",
          type: "Object",
          emptyAs: null,
          comType: "HmPropCssRules",
          comConf: {
            rules: "#BLOCK"
          }
        },
        {
          title: "i18n:hmk-style-tile",
          name: "tileStyle",
          type: "Object",
          emptyAs: null,
          comType: "HmPropCssRules",
          comConf: {
            rules: "#BLOCK"
          }
        },
        {
          title: "i18n:hmk-style-image",
          name: "imageStyle",
          type: "Object",
          emptyAs: null,
          comType: "HmPropCssRules",
          comConf: {
            rules: "#IMG"
          }
        },
        {
          title: "i18n:hmk-style-title",
          name: "titleStyle",
          type: "Object",
          emptyAs: null,
          comType: "HmPropCssRules",
          comConf: {
            rules: "#TEXT-BLOCK"
          }
        },
        {
          title: "i18n:hmk-style-brief",
          name: "briefStyle",
          type: "Object",
          emptyAs: null,
          comType: "HmPropCssRules",
          comConf: {
            rules: "#TEXT-BLOCK"
          }
        }]
      }]
    } // return {
  },
  //---------------------------------------
  registryTinyMceMenuItem(editor, {
    prefix,
    settings,
    GetCurrentAlbumElement
  }) {
    const NM = (...ss) => {
      return _.camelCase(ss.join("-"))
    }
    let NM_MENU = _.kebabCase(["wn", prefix].join("-"))
    let NM_PROP = NM("Wn", prefix, "Prop")
    let NM_RELOAD = NM("Wn", prefix, "Reload")
    let NM_AUTO_FIT_WIDTH = NM("Wn", prefix, "AutoFitWidth")
    let NM_MARGIN = NM("Wn", prefix, "Margin")
    let NM_CLR_SZ = NM("Wn", prefix, "ClrSize")

    let CMD_SET_STYLE = NM("Set", prefix, "Style")
    let CMD_RELOAD = NM("Reload", prefix)
    let CMD_PROP = NM("Show", prefix, "Prop")
    //.....................................
    let LP = _.kebabCase(prefix)
    //.....................................
    editor.ui.registry.addMenuItem(NM_CLR_SZ, {
      text: Ti.I18n.text(`i18n:hmk-${LP}-clrsz`),
      onAction() {
        editor.execCommand(CMD_SET_STYLE, editor, {
          width: "", height: "",
          maxWidth: "", maxHeight: "",
          minWidth: "", minHeight: ""
        })
      }
    })
    //.....................................
    editor.ui.registry.addMenuItem(NM_AUTO_FIT_WIDTH, {
      text: Ti.I18n.text(`i18n:hmk-${LP}-autofit`),
      onAction() {
        editor.execCommand(CMD_SET_STYLE, editor, {
          width: "100%", maxWidth: "", minWidth: ""
        })
      }
    })
    //.....................................
    editor.ui.registry.addMenuItem(NM_MARGIN, {
      text: Ti.I18n.text(`i18n:hmk-${LP}-margin`),
      getSubmenuItems: function () {
        const __check_margin_size = function (api, expectSize) {
          let $album = GetCurrentAlbumElement(editor)
          let state = true
          if ($album) {
            let sz = $album.style.marginLeft || $album.style.marginRight
            state = expectSize == sz
          }
          api.setActive(state);
          return function () { };
        }
        return [
          {
            type: "togglemenuitem",
            text: Ti.I18n.text("i18n:hmk-margin-sm"),
            onAction() {
              editor.execCommand(CMD_SET_STYLE, editor, { margin: "1em" })
            },
            onSetup: function (api) {
              return __check_margin_size(api, '1em')
            }
          },
          {
            type: "togglemenuitem",
            text: Ti.I18n.text("i18n:hmk-margin-md"),
            onAction() {
              editor.execCommand(CMD_SET_STYLE, editor, { margin: "2em" })
            },
            onSetup: function (api) {
              return __check_margin_size(api, '2em')
            }
          },
          {
            type: "togglemenuitem",
            text: Ti.I18n.text("i18n:hmk-margin-lg"),
            onAction() {
              editor.execCommand(CMD_SET_STYLE, editor, { margin: "3em" })
            },
            onSetup: function (api) {
              return __check_margin_size(api, '3em')
            }
          },
          {
            type: "menuitem",
            icon: "align-center",
            text: Ti.I18n.text("i18n:hmk-margin-center"),
            onAction() {
              editor.execCommand(CMD_SET_STYLE, editor, { margin: "0 auto" })
            }
          },
          {
            type: "menuitem",
            icon: "square-6",
            text: Ti.I18n.text("i18n:hmk-margin-no"),
            onAction() {
              editor.execCommand(CMD_SET_STYLE, editor, { margin: "" })
            }
          }
        ];
      }
    });
    //.....................................
    editor.ui.registry.addMenuItem(NM_RELOAD, {
      icon: "sync-alt-solid",
      text: Ti.I18n.text(`i18n:hmk-${LP}-refresh`),
      onAction() {
        editor.execCommand(CMD_RELOAD, editor, settings)
      }
    })
    //.....................................
    editor.ui.registry.addMenuItem(NM_PROP, {
      text: Ti.I18n.text(`i18n:hmk-${LP}-prop`),
      onAction() {
        editor.execCommand(CMD_PROP, editor, settings)
      }
    })
    //.....................................
    editor.ui.registry.addContextMenu(NM_MENU, {
      update: function (el) {
        let $album = GetCurrentAlbumElement(editor)
        // Guard
        if (!_.isElement($album)) {
          return []
        }
        return [
          [NM_CLR_SZ, NM_AUTO_FIT_WIDTH].join(" "),
          [NM_MARGIN, NM_RELOAD].join(" "),
          NM_PROP
        ].join(" | ")
      }
    })
    //.....................................
    return {
      NM_MENU,
      NM_PROP,
      NM_RELOAD,
      NM_AUTO_FIT_WIDTH,
      NM_MARGIN,
      NM_CLR_SZ,
      CMD_SET_STYLE,
      CMD_RELOAD,
      CMD_PROP,
    }
  },
  //---------------------------------------
  getOrCreate($el, setup = {}) {
    if (!$el.__ti_photo_wall) {
      $el.__ti_photo_wall = new TiAlbum($el, setup)
    }
    return $el.__ti_photo_wall
  },
  //---------------------------------------
}
