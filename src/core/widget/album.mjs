const ALBUM_CLASS_NAME = "ti-widget-album"
const WALL_CLASS_NAME = "photo-wall"
const DFT_WALL_CLASS = [
  'flex-none','item-margin-no','item-padding-sm',
  'pic-fit-cover','hover-to-zoom'
]
////////////////////////////////////////////////
class TiAlbum {
  //---------------------------------------
  constructor($el, setup) {
    Ti.Dom.addClass($el, ALBUM_CLASS_NAME)
    this.$el = $el
    this.setup = _.assign({
      attrPrefix : "wn-obj-",
      dftWallClass : DFT_WALL_CLASS,
      itemToPhoto : {
        name : "=name",
        link : "=link",
        src  : "=src"
      },
      photoToItem : {
        name : "=name",
        link : "=link",
        src  : "=src"
      }
    }, setup)
  }
  //---------------------------------------
  setData(album={}) {
    let {attrPrefix} = this.setup
    let attrs = this.formatData(album)
    
    Ti.Dom.setAttrs(this.$el, attrs, attrPrefix)
  }
  //---------------------------------------
  formatData(album={}) {
    let {dftWallClass} = this.setup
    let {
      id, name, link,
      albumStyle, wallStyle, tileStyle, imageStyle,
      wallClass
    } = album

    wallClass = Ti.Dom.getClassList(wallClass, {
      dftList : dftWallClass
    })

    Ti.Dom.formatStyle(albumStyle)
    Ti.Dom.formatStyle(wallStyle)
    Ti.Dom.formatStyle(tileStyle)
    Ti.Dom.formatStyle(imageStyle)

    return {
      id,name,link, 
      wallClass  : wallClass.join(" "), 
      albumStyle : Ti.Dom.renderCssRule(albumStyle),
      wallStyle  : Ti.Dom.renderCssRule(wallStyle),
      tileStyle  : Ti.Dom.renderCssRule(tileStyle),
      imageStyle : Ti.Dom.renderCssRule(imageStyle),
    }
  }
  //---------------------------------------
  getData() {
    let {attrPrefix} = this.setup
    let N = attrPrefix.length
    let album = Ti.Dom.attrs(this.$el, (name)=>{
      if(name.startsWith(attrPrefix)) {
        return _.camelCase(name.substring(N))
      }
    })
    let {
      wallClass, albumStyle, wallStyle, tileStyle, imageStyle
    } = album
    album.wallClass = Ti.Dom.getClassList(wallClass).join(" ")
    album.albumStyle = Ti.Dom.parseCssRule(albumStyle)
    album.wallStyle  = Ti.Dom.parseCssRule(wallStyle)
    album.tileStyle  = Ti.Dom.parseCssRule(tileStyle)
    album.imageStyle = Ti.Dom.parseCssRule(imageStyle)
    return album
  }
  //---------------------------------------
  covertToPhotos(items=[]) {
    let {itemToPhoto} = this.setup
    return _.map(items, it=>Ti.Util.explainObj(it, itemToPhoto))
  }
  //---------------------------------------
  renderItems(items=[]) {
    let photos = this.covertToPhotos(items)
    this.renderPhotos(photos)
  }
  //---------------------------------------
  renderPhotos(photos=[]) {
    let album = this.getData()
    album = this.formatData(album)

    // Outer style
    this.$el.style = album.albumStyle

    // Build HTML
    let alClass = _.uniq(_.concat(WALL_CLASS_NAME, album.wallClass)).join(" ")
    let html = [`<div class="${alClass}">`]
    for(let po of photos) {
      let {src, link, name} = po
      html.push(`<a class="wall-tile" href="${link||'#'}" title="${name||''}">`)
      html.push(`<img src="${src}"/>`)
      html.push('</a>')
    }
    html.push('</div>')
    this.$el.innerHTML = html.join("")

    // Update style
    let $wall = Ti.Dom.find(":scope > ."+WALL_CLASS_NAME, this.$el)
    $wall.style = album.wallStyle

    let $tiles = Ti.Dom.findAll(".wall-tile", $wall)
    for(let i=0; i<$tiles.length; i++) {
      let $tile = $tiles[i]
      let $img = Ti.Dom.find("img", $tile)
      $tile.style = album.tileStyle
      $img.style = album.imageStyle
    }
  }
  //---------------------------------------
  getPhotos() {
    let list = []
    let $wall = Ti.Dom.find(":scope > ."+WALL_CLASS_NAME, this.$el)
    let $tiles = Ti.Dom.findAll(".wall-tile", $wall)
    for(let i=0; i<$tiles.length; i++) {
      let $tile = $tiles[i]
      let $img = Ti.Dom.find("img", $tile)
      list.push({
        name : $tile.getAttribute("title") || null,
        link : $tile.getAttribute("href") || null,
        src  : $img.getAttribute("src") || null
      })
    }
    return list
  }
  //---------------------------------------
  convertToItems(photos=[]) {
    let {photoToItem} = this.setup
    return _.map(photos, photo=>Ti.Util.explainObj(photo, photoToItem))
  }
  //---------------------------------------
  getItems() {
    let photos = this.getPhotos()
    return this.convertToItems(photos)
  }
  //---------------------------------------
  showLoading() {
    this.$el.innerHTML = [
      `<div class="media-inner">`,
      `<i class="fas fa-spinner fa-spin"></i>`,
      `</div>`
    ].join("")
  }
  //---------------------------------------
  getEditFormConfig() {
    return {
      className : "no-status",
      spacing : "tiny",
      fields : [{
          title : "相册信息",
          fields: [{
            title : "ID",
            name  : "id"
          }, {
            title : "Name",
            name  : "name"
          }]
        }, {
          title : "相册外观",
          fields : [{
              title : "外部样式",
              name  : "albumStyle",
              type  : "Object",
              emptyAs : null,
              comType : "HmPropCssRules"
            }, {
              title : "整体风格",
              name : "wallClass",
              emptyAs : null,
              comType : "HmPropClassPicker",
              comConf : {
                valueType : "String",
                form : {
                  fields : [{
                    title : "i18n:hmk-class-flex",
                    name : "flexMode",
                    comType : "TiSwitcher",
                    comConf : {
                      options : [
                        {value: "flex-none",  text:"i18n:hmk-class-flex-none"},
                        {value: "flex-both",  text:"i18n:hmk-class-flex-both"},
                        {value: "flex-grow",  text:"i18n:hmk-class-flex-grow"},
                        {value: "flex-shrink",text:"i18n:hmk-class-flex-shrink"}                    ]
                    }
                  }, {
                    title : "i18n:hmk-class-item-padding",
                    name : "itemPadding",
                    comType : "TiSwitcher",
                    comConf : {
                      options : [
                        {value: "item-padding-no", text:"i18n:hmk-class-sz-no"},
                        {value: "item-padding-xs", text:"i18n:hmk-class-sz-xs"},
                        {value: "item-padding-sm", text:"i18n:hmk-class-sz-sm"},
                        {value: "item-padding-md", text:"i18n:hmk-class-sz-md"},
                        {value: "item-padding-lg", text:"i18n:hmk-class-sz-lg"},
                        {value: "item-padding-xl", text:"i18n:hmk-class-sz-xl"}
                      ]
                    }
                  }, {
                    title : "i18n:hmk-class-item-margin",
                    name : "itemMargin",
                    comType : "TiSwitcher",
                    comConf : {
                      options : [
                        {value: "item-margin-no", text:"i18n:hmk-class-sz-no"},
                        {value: "item-margin-xs", text:"i18n:hmk-class-sz-xs"},
                        {value: "item-margin-sm", text:"i18n:hmk-class-sz-sm"},
                        {value: "item-margin-md", text:"i18n:hmk-class-sz-md"},
                        {value: "item-margin-lg", text:"i18n:hmk-class-sz-lg"},
                        {value: "item-margin-xl", text:"i18n:hmk-class-sz-xl"}
                      ]
                    }
                  }, {
                    title : "i18n:hmk-class-object-fit",
                    name : "picFit",
                    comType : "TiSwitcher",
                    comConf : {
                      options : [
                        {value: "pic-fit-fill",   text:"i18n:hmk-class-object-fit-fill"},
                        {value: "pic-fit-cover",  text:"i18n:hmk-class-object-fit-cover"},
                        {value: "pic-fit-contain",text:"i18n:hmk-class-object-fit-contain"},
                        {value: "pic-fit-none", text:"i18n:hmk-class-object-fit-none"}
                      ]
                    }
                  }, {
                    title : "i18n:hmk-class-hover",
                    name : "textHover",
                    comType : "TiSwitcher",
                    comConf : {
                      options : [
                        {value: "hover-to-up",    text:"i18n:hmk-class-hover-to-up"},
                        {value: "hover-to-scale", text:"i18n:hmk-class-hover-to-scale"},
                        {value: "hover-to-zoom",  text:"i18n:hmk-class-hover-to-zoom"}
                      ]
                    }
                  }]
                }
              } // title : "整体风格",
            }, {
              title : "内部样式",
              name  : "wallStyle",
              type  : "Object",
              emptyAs : null,
              comType : "HmPropCssRules"
            }, {
              title : "瓦片样式",
              name  : "tileStyle",
              type  : "Object",
              emptyAs : null,
              comType : "HmPropCssRules"
            }, {
              title : "图片样式",
              name  : "imageStyle",
              type  : "Object",
              emptyAs : null,
              comType : "HmPropCssRules"
            }]
        }]
    } // return {
  }
  //---------------------------------------
}
////////////////////////////////////////////////
export const Album = {
  //---------------------------------------
  getOrCreate($el, setup={}) {
    if(!$el.__ti_photo_wall) {
      $el.__ti_photo_wall = new TiAlbum($el, setup)
    }
    return $el.__ti_photo_wall
  }
  //---------------------------------------
}
