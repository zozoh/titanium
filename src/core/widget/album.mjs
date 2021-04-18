const ALBUM_CLASS_NAME = "ti-widget-album"
const WALL_CLASS_NAME = "photo-wall"
const DFT_WALL_CLASS = [
  'flex-none','item-margin-md','item-padding-no',
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
    return _.map(items, it=>{
      let po = Ti.Util.explainObj(it, itemToPhoto)
      po.item = it
      return po
    })
  }
  //---------------------------------------
  renderItems(items=[]) {
    let photos = this.covertToPhotos(items)
    this.renderPhotos(photos)
  }
  //---------------------------------------
  renderPhotos(photos=[]) {
    let {attrPrefix} = this.setup
    let album = this.getData()

    // Outer style
    this.$el.style = album.albumStyle

    // Build OUTER
    let $wall = Ti.Dom.createElement({
      tagName : "div",
      className : [WALL_CLASS_NAME, album.wallClass],
      style : album.wallStyle
    })

    // Build tils
    for(let i=0; i<photos.length; i++) {
      let photo = photos[i]
      let {src, link, name, item} = photo
      let $tile = Ti.Dom.createElement({
        $p : $wall,
        tagName : "a",
        className : "wall-tile",
        style : album.tileStyle,
        attrs : {
          href  : link || null,
          title : name || null
        }
      })
      let $img = Ti.Dom.createElement({
        $p : $tile,
        tagName : "img",
        style : album.imageStyle,
        attrs : {
          src : src
        }
      })
      // Save photo setting
      Ti.Dom.setAttrs($img, item, attrPrefix)
    }

    // Update content
    this.$el.innerHTML = ""
    Ti.Dom.appendTo($wall, this.$el)
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
    return _.map(photos, photo=>photo.item)
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
              comType : "HmPropCssRules",
              comConf : {
                rules : "#BLOCK"
              }
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
              comType : "HmPropCssRules",
              comConf : {
                rules : "#BLOCK"
              }
            }, {
              title : "瓦片样式",
              name  : "tileStyle",
              type  : "Object",
              emptyAs : null,
              comType : "HmPropCssRules",
              comConf : {
                rules : "#BLOCK"
              }
            }, {
              title : "图片样式",
              name  : "imageStyle",
              type  : "Object",
              emptyAs : null,
              comType : "HmPropCssRules",
              comConf : {
                rules : "#IMG"
              }
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
