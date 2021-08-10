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
    //console.log(this.setup)
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
    //console.log("album.setData", album)
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
      id, name,
      link, linkText, newtab,
      layout, fullpreview, autoopen,
      style, exLinkStyle,
      wallStyle,
      partLeftStyle, partRightStyle,
      tileStyle, imageStyle,
      titleStyle, briefStyle,
      wallClass
    } = album

    wallClass = Ti.Dom.getClassList(wallClass, {
      dftList: dftWallClass
    })

    style = Ti.Dom.formatStyle(style)
    exLinkStyle = Ti.Dom.formatStyle(exLinkStyle)
    wallStyle = Ti.Dom.formatStyle(wallStyle)
    tileStyle = Ti.Dom.formatStyle(tileStyle)
    partLeftStyle = Ti.Dom.formatStyle(partLeftStyle)
    partRightStyle = Ti.Dom.formatStyle(partRightStyle)
    imageStyle = Ti.Dom.formatStyle(imageStyle)
    titleStyle = Ti.Dom.formatStyle(titleStyle)
    briefStyle = Ti.Dom.formatStyle(briefStyle)

    return {
      id, name,
      link, linkText, newtab,
      layout, fullpreview, autoopen,
      wallClass: wallClass.join(" "),
      style: Ti.Css.renderCssRule(style),
      exLinkStyle: Ti.Css.renderCssRule(exLinkStyle),
      wallStyle: Ti.Css.renderCssRule(wallStyle),
      tileStyle: Ti.Css.renderCssRule(tileStyle),
      partLeftStyle: Ti.Css.renderCssRule(partLeftStyle),
      partRightStyle: Ti.Css.renderCssRule(partRightStyle),
      imageStyle: Ti.Css.renderCssRule(imageStyle),
      titleStyle: Ti.Css.renderCssRule(titleStyle),
      briefStyle: Ti.Css.renderCssRule(briefStyle),
    }
  }
  //---------------------------------------
  getData() {
    let { attrPrefix, styleUrlRewrite } = this.setup
    let N = attrPrefix.length
    let album = Ti.Dom.attrs(this.$el, (name) => {
      if ("style" == name) {
        return name
      }
      if (name.startsWith(attrPrefix)) {
        return _.camelCase(name.substring(N))
      }
    })
    let settings = {
      urlRewrite: styleUrlRewrite,
      nameCase: "camel"
    }
    let {
      style, wallClass, wallStyle, exLinkStyle,
      partLeftStyle, partRightStyle,
      tileStyle, imageStyle,
      titleStyle, briefStyle,
    } = album
    album.wallClass = Ti.Dom.getClassList(wallClass).join(" ")
    album.style = Ti.Css.parseAndTidyCssRule(style, settings)
    album.exLinkStyle = Ti.Css.parseAndTidyCssRule(exLinkStyle, settings)
    album.wallStyle = Ti.Css.parseAndTidyCssRule(wallStyle, settings)
    album.tileStyle = Ti.Css.parseAndTidyCssRule(tileStyle, settings)
    album.partLeftStyle = Ti.Css.parseAndTidyCssRule(partLeftStyle, settings)
    album.partRightStyle = Ti.Css.parseAndTidyCssRule(partRightStyle, settings)
    album.imageStyle = Ti.Css.parseAndTidyCssRule(imageStyle, settings)
    album.titleStyle = Ti.Css.parseAndTidyCssRule(titleStyle, settings)
    album.briefStyle = Ti.Css.parseAndTidyCssRule(briefStyle, settings)
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
      if (it.brief)
        console.log(po)
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
    console.log(album)

    // Default wall class
    let className = Ti.Css.mergeClassName(album.wallClass) || {}
    className[WALL_CLASS_NAME] = true
    className[`layout-${album.layout || "wall"}`] = true
    if (!className["text-in"] && !className["text-out"]) {
      className["text-in"] = true
    }

    // Build OUTER
    let $wall = Ti.Dom.createElement({
      tagName: "div",
      className,
      style: album.wallStyle
    })

    // Render photos
    if ("falls" == album.layout) {
      this.renderPhotosAsFalls(photos, { $wall, album, attrPrefix })
    } else if ("rows" == album.layout) {
      this.renderPhotosAsRows(photos, { $wall, album, attrPrefix })
    } else {
      this.renderPhotosAsWall(photos, { $wall, album, attrPrefix })
    }

    // Update content
    this.$el.innerHTML = ""
    Ti.Dom.appendTo($wall, this.$el)

    // Extend link
    if (album.link) {
      let $link = Ti.Dom.createElement({
        $p: this.$el,
        tagName: "a",
        className: "album-ex-link",
        style: album.exLinkStyle,
        attrs: {
          href: album.link,
          target: album.newtab ? "_blank" : undefined
        }
      })
      let linkText = album.linkText || album.name
      $link.innerText = linkText
    }
    // Remove link
    else {
      Ti.Dom.remove(".album-ex-link", this.$el)
    }
  }
  //---------------------------------------
  renderPhotosAsWall(photos = [], { $wall, album, attrPrefix }) {
    // Build tils
    for (let i = 0; i < photos.length; i++) {
      this.createPhotoTileElement($wall, photos[i], album, attrPrefix)
    }
  }
  //---------------------------------------
  renderPhotosAsRows(photos = [], { $wall, album, attrPrefix }) {
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
    layout, tileStyle,
    partLeftStyle, partRightStyle,
    imageStyle, titleStyle, briefStyle
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
    let $partL = $tile
    if ("rows" == layout) {
      $partL = Ti.Dom.createElement({
        $p: $tile,
        tagName: "span",
        className: "part-left",
        style: partLeftStyle
      })
    }
    let $img = Ti.Dom.createElement({
      $p: $partL,
      tagName: "img",
      style: imageStyle,
      attrs: {
        src: thumb || src,
        srcLarge: src
      }
    })
    let $partR = $tile
    if ("rows" == layout) {
      $partR = Ti.Dom.createElement({
        $p: $tile,
        tagName: "span",
        className: "part-right",
        style: partRightStyle
      })
    }
    if (name && !Ti.S.isBlank(name)) {
      let $title = Ti.Dom.createElement({
        $p: $partR,
        tagName: "span",
        className: "tile-title",
        style: titleStyle
      })
      let nameHtml = name
        .replace('<', '&lt;')
        .replace(/(\r?\n|(\\r)?\\n)/g, "<br>")
      $title.innerHTML = nameHtml
    }
    if (brief && !Ti.S.isBlank(brief)) {
      let $title = Ti.Dom.createElement({
        $p: $partR,
        tagName: "span",
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
    let photos = this.getWallPhotos()
    return photos
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
    let $brief = Ti.Dom.find(".tile-brief", $tile)
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
      brief: $brief ? $brief.innerText : null,
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
            title: "i18n:href",
            name: "link",
            comType: "ti-input"
          },
          {
            title: "i18n:href-text",
            name: "linkText",
            comType: "ti-input"
          },
          {
            title: "i18n:newtab",
            name: "newtab",
            type: "Boolean",
            comType: "ti-toggle"
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
              { value: "rows", text: "i18n:hmk-layout-rows" },
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
            dialogHeight: 640,
            form: {
              fields: [
                {
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
                  title: "i18n:hmk-class-text-mode",
                  name: "textMode",
                  comType: "TiSwitcher",
                  comConf: {
                    options: [
                      { value: "text-in", text: "i18n:hmk-class-text-in" },
                      { value: "text-out", text: "i18n:hmk-class-text-out" }
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
          title: "i18n:hmk-style-part-left",
          name: "partLeftStyle",
          type: "Object",
          emptyAs: null,
          hidden: {
            "!layout": "rows"
          },
          comType: "HmPropCssRules",
          comConf: {
            rules: "#BLOCK"
          }
        },
        {
          title: "i18n:hmk-style-part-right",
          name: "partRightStyle",
          type: "Object",
          emptyAs: null,
          hidden: {
            "!layout": "rows"
          },
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
        },
        {
          title: "i18n:hmk-style-exlink",
          name: "exLinkStyle",
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
    //console.log("getOrCreate", setup)
    if (!$el.__ti_photo_wall) {
      $el.__ti_photo_wall = new TiAlbum($el, setup)
    }
    return $el.__ti_photo_wall
  },
  //---------------------------------------
}
