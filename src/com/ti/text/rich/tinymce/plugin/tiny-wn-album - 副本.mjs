////////////////////////////////////////////////////
async function pickAlbumAndInsertToDoc(editor, {
  base = "~", 
  autoCreate=null, 
  fallbackPath,
}) {
  // Check base
  if(_.isPlainObject(autoCreate)) {
    let oBase = await Wn.Io.loadMeta(base)
    if(!oBase) {
      let pph = Ti.Util.getParentPath(base)
      let dnm = Ti.Util.getFileName(base)
      let baseMeta = _.assign({}, autoCreate, {
        race: 'DIR', nm : dnm
      })
      let baseJson = JSON.stringify(baseMeta)
      let cmdText = `o @create '${baseJson}' -p ${pph} -auto @json -cqn`
      oBase = await Wn.Sys.exec2(cmdText, {as:"json"})
    }
    base = oBase
  }

  // Show dialog
  let reo = await Wn.OpenObjSelector(base, {
    icon  : "far-images",
    title : "i18n:album-insert",
    position : "top",
    width  : "95%",
    height : "95%",
    multi : false,
    filter : o => "DIR" == o.race,
    search : {
      filter : {
        match : {
          race : "DIR"
        }
      },
      sorter : {nm : 1}
    },
    fallbackPath
  })

  // User canceled
  if(_.isEmpty(reo)) {
    return
  }

  // Do insert image
  editor.execCommand("InsertAlbum", editor, reo[0])
}
//--------------------------------------------------
function GetAlbumWidget($album) {
  return Ti.Widget.Album.getOrCreate($album, {
    attrPrefix : "wn-obj-",
    itemToPhoto : {
      name : "=name",
      link : "=link",
      src  : "=thumb_src"
    },
    photoToItem : {
      name : "=name",
      link : "=link",
      thumb_src : "=src"
    }
  })
}
////////////////////////////////////////////////////
function GetAlbumAttrsByElement(elAlbum) {
  // Top Style
  let stl = Ti.Dom.getStyle(elAlbum, 
    /^(width|height|float|(margin-(left|right|top|bottom)))$/)
  stl.float = stl.float || "none"
  //
  // Wall Style
  let $wall = Ti.Dom.find(".tiw-photo-wall", elAlbum)
  let wallClass = ""
  let wallStyle = {}
  let tileClass = ""
  let tileStyle = {}
  let picStyle = {}
  if(_.isElement($wall)) {
    wallClass = Ti.Dom.getClassList($wall, v=>v!="tiw-photo-wall").join(" ")
    wallStyle = Ti.Dom.getOwnStyle($wall)
    tileClass = Ti.Dom.getClassList($wall.getAttribute("wn-tile-class")).join(" ")
    tileStyle = Ti.Dom.parseCssRule($wall.getAttribute("wn-tile-style"))
    picStyle = Ti.Dom.parseCssRule($wall.getAttribute("wn-pic-style"))
  }
  return {
    id : elAlbum.getAttribute("wn-obj-id"),
    nm : elAlbum.getAttribute("wn-obj-nm"),
    thumb : elAlbum.getAttribute("wn-obj-thumb"),
    title : elAlbum.getAttribute("wn-obj-title"),
    ... stl,
    wallClass, wallStyle,
    tileClass, tileStyle, picStyle
  }
}
////////////////////////////////////////////////////
function GetAlbumAttrsByObj(oAlbumn) {
  return {
    "wn-obj-id" : oAlbumn.id,
    "wn-obj-nm" : oAlbumn.nm,
    "wn-obj-thumb" : oAlbumn.thumb,
    "wn-obj-title" : oAlbumn.title
  }
}
////////////////////////////////////////////////////
function SetAlbumInfoToElement($album, data, old={}) {
  //................................................
  Ti.Dom.setStyleValue($album, "width",        data.width,        old.width)
  Ti.Dom.setStyleValue($album, "height",       data.height,       old.height)
  Ti.Dom.setStyleValue($album, "float",        data.float,        old.float)
  Ti.Dom.setStyleValue($album, "marginLeft",   data.marginLeft,   old.marginLeft)
  Ti.Dom.setStyleValue($album, "marginRight",  data.marginRight,  old.marginRight)
  Ti.Dom.setStyleValue($album, "marginTop",    data.marginTop,    old.marginTop)
  Ti.Dom.setStyleValue($album, "marginBottom", data.marginBottom, old.marginBottom)
  //................................................
  let $wall = Ti.Dom.find(":scope > .tiw-photo-wall", $album)
  if($wall) {
    Ti.Dom.formatStyle(data.wallStyle)
    Ti.Dom.formatStyle(data.tileStyle)
    Ti.Dom.formatStyle(data.picStyle)
    $wall.className = `tiw-photo-wall ${data.wallClass||""}`
    let wallStyle = Ti.Dom.renderCssRule(data.wallStyle)
    let tileStyle = Ti.Dom.renderCssRule(data.tileStyle)
    let picStyle = Ti.Dom.renderCssRule(data.picStyle)
    $wall.style = wallStyle
    $wall.setAttribute("wn-tile-class", data.tileClass || null)
    $wall.setAttribute("wn-tile-style", tileStyle)
    $wall.setAttribute("wn-pic-style", picStyle)
  }
  //................................................
}
////////////////////////////////////////////////////
const DFT_CLASS = [
  'flex-none','item-margin-no','item-padding-sm',
  'pic-fit-cover','hover-to-zoom'
].join(' ')
//--------------------------------------------------
function UpdateAlbumTagInnerHtml(elAlbum) {
  //console.log("UpdateAlbumTagInnerHtml")
  // Get old content
  let album = GetAlbumAttrsByElement(elAlbum)
  // Mark content editable
  elAlbum.contentEditable = false
  // Show loading
  elAlbum.innerHTML = `<div class="media-inner">
    <i class="fas fa-spinner fa-spin"></i>
  </div>`

  let match = JSON.stringify({
    pid : album.id,
    race : "FILE",
    mime : "^image\/"
  })
  Wn.Sys.exec2(`o @query '${match}' @json #SHA1 -cqnl`, {
    as:"json"
  }).then(data => {
    // Create inner HTML for the album
    let html = `<div class="tiw-photo-wall ${DFT_CLASS}">`
    for(let oImg of data) {
      let src = `/o/content?str=${oImg.thumb}`
      html += `<a class="wall-tile" href="#" target="_blank">
          <img src="${src}" 
          wn-obj-id="${oImg.id}"
          wn-obj-sha1="${oImg.sha1}"
          wn-obj-mime="${oImg.mime}"
          wn-obj-tp="${oImg.tp}"
          wn-obj-width="${oImg.width}"
          wn-obj-height="${oImg.height}"/></a>`
    }
    html += '</div>'
    elAlbum.innerHTML = html

    // Recover the attr-data
    SetAlbumInfoToElement(elAlbum, album)

    // Then we need update the album css style
    UpdateAlbumStyle(elAlbum)
  })
}
////////////////////////////////////////////////////
function UpdateAlbumStyle($album) {
  let $wall = Ti.Dom.find(":scope > .tiw-photo-wall", $album)
  let {tileStyle, picStyle} = GetAlbumAttrsByElement($album)
  let $tiles = Ti.Dom.findAll(".wall-tile", $wall)
  for(let i=0; i<$tiles.length; i++) {
    let $tile = $tiles[i]
    let $img = Ti.Dom.find("img", $tile)
    Ti.Dom.setStyle($tile, tileStyle)
    Ti.Dom.setStyle($img, picStyle)
  }
}
////////////////////////////////////////////////////
function CmdInsertAlbum(editor, oAlbumn) {
  if(!oAlbumn)
    return
  //console.log("CmdInsertAlbum", oAlbumn)
  // Prepare range
  let rng = editor.selection.getRng()
  
  // Create image fragments
  let $doc = rng.commonAncestorContainer.ownerDocument
  let $album = Ti.Dom.createElement({
    tagName : "div",
    className : "wn-media as-photos as-album",
    attrs : GetAlbumAttrsByObj(oAlbumn)
  }, $doc)
  UpdateAlbumTagInnerHtml($album, editor.wn_album_settings)
  
  // Remove content
  if(!rng.collapsed) {
    rng.deleteContents()
  }

  // Insert fragments
  rng.insertNode($album)

}
////////////////////////////////////////////////////
function CmdReloadAlbumAlbum(editor, settings) {
  let $album = GetCurrentAlbumElement(editor)
  // Guard
  if(!_.isElement($album)) {
    return
  }
  // Reload content
  UpdateAlbumTagInnerHtml($album, settings)
}
////////////////////////////////////////////////////
function GetCurrentAlbumElement(editor) {
  let sel = editor.selection
  let $nd = sel.getNode()
  // Guard
  return Ti.Dom.closest($nd, (el)=>{
    return 'DIV' == el.tagName && Ti.Dom.hasClass(el, "wn-media", "as-album")
  })
}
////////////////////////////////////////////////////
function CmdSetAlbumSize(editor, {width="", height=""}={}) {
  let $album = GetCurrentAlbumElement(editor)
  // Guard
  if(!_.isElement($album)) {
    return
  }
  // Clear the attribute
  Ti.Dom.setStyle($album, {width, height})
  // Force sync content
  editor.__rich_tinymce_com.syncContent()
}
////////////////////////////////////////////////////
function CmdSetAlbumStyle(editor, css={}) {
  let $album = GetCurrentAlbumElement(editor)
  // Guard
  if(!_.isElement($album)) {
    return
  }
  // Clear float
  Ti.Dom.setStyle($album, css)
  // Force sync content
  editor.__rich_tinymce_com.syncContent()
}
////////////////////////////////////////////////////
async function CmdShowAlbumProp(editor, settings) {
  let $album = GetCurrentAlbumElement(editor)
  // Guard
  if(!_.isElement($album)) {
    return
  }
  //console.log("stl", stl)
  // Gen the properties
  let data = GetAlbumAttrsByElement($album)

  //console.log(data)
  // Show dialog
  let reo = await Ti.App.Open({
    icon  : "fab-album",
    title : "编辑相册属性",
    width  : "37%",
    height : "100%",
    position : "right",
    closer : "left",
    clickMaskToClose : true,
    result : data,
    model : {prop:"data", event:"change"},
    comType : "TiForm",
    comConf : {
      className : "no-status",
      spacing : "tiny",
      fields : [{
          title : "相册尺寸",
          className : "as-vertical col-2",
          fields: [{
            title : "宽度",
            name  : "width",
            comType : "TiInput"
          }, {
            title : "高度",
            name  : "height",
            comType : "TiInput"
          }, {
            title : "瓦片宽",
            name  : "tileStyle.width",
            comType : "TiInput"
          }, {
            title : "瓦片高",
            name  : "tileStyle.height",
            comType : "TiInput"
          }, {
            title : "图片宽",
            name  : "picStyle.width",
            comType : "TiInput"
          }, {
            title : "图片高",
            name  : "picStyle.height",
            fieldWidth : "50%",
            comType : "TiInput"
          }]
        }, {
          title : "相册外距",
          className : "as-vertical col-4",
          fields : [{
            title : "上",
            name  : "marginTop",
            comType : "TiInput",
            comConf : {
              placeholder : "0px"
            }
          }, {
            title : "右",
            name  : "marginRight",
            comType : "TiInput",
            comConf : {
              placeholder : "0px"
            }
          }, {
            title : "下",
            name  : "marginBottom",
            comType : "TiInput",
            comConf : {
              placeholder : "0px"
            }
          }, {
            title : "左",
            name  : "marginLeft",
            comType : "TiInput",
            comConf : {
              placeholder : "0px"
            }
          }]
        }, {
          title : "相册样式",
          fields : [{
              title : "文本绕图",
              name  : "float",
              comType : "TiSwitcher",
              comConf : {
                allowEmpty : false,
                options : [
                  {value: "none",  text: "不绕图",   icon:"fas-align-justify"},
                  {value: "left",  text: "左绕图", icon:"fas-align-left"},
                  {value: "right", text: "右绕图", icon:"fas-align-right"},]
              }
            }, {
            title : "整体风格",
            name : "wallClass",
            emptyAs : null,
            comType : "HmPropClassPicker",
            comConf : {
              dftValue : DFT_CLASS,
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
                      {value: "hover-to-up",  text:"i18n:hmk-class-hover-to-up"},
                      {value: "hover-to-zoom", text:"i18n:hmk-class-hover-to-zoom"}
                    ]
                  }
                }]
              }
            } // title : "整体风格",
          }, {
            title : "整体样式",
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
            name  : "picStyle",
            type  : "Object",
            emptyAs : null,
            comType : "HmPropCssRules"
          }]
        }]
    },
    components : []
  })

  // 用户取消
  if(!reo)
    return

  //................................................
  SetAlbumInfoToElement($album, reo, data)
  //................................................
  // clean cache
  $album.removeAttribute("data-mce-src")
  $album.removeAttribute("data-mce-style")
  //................................................
  // Then we need update the album css style
  UpdateAlbumStyle($album)
  //................................................
  // Force sync content
  editor.__rich_tinymce_com.syncContent()
}
////////////////////////////////////////////////////
export default {
  name : "wn-album",
  //------------------------------------------------
  init : function(conf={}) {
  },
  //------------------------------------------------
  setup : function(editor, url){
    //..............................................
    let settings = _.assign({
        meta : "~"
      }, _.get(editor.settings, "wn_album_config"));
    //console.log("setup", editor.settings)
    //..............................................
    // Reload meta content
    // Check meta
    settings.load = async function(){
      if(this.data) {
        return {meta: this.meta, data: this.data}
      }
      let oMeta = await Wn.Io.loadMeta(this.meta)
      if(!oMeta) {
        return await Ti.Toast.Open(`路径[${this.meta}]不存在`, "warn")
      }
      if(oMeta.race != "FILE") {
        return await Ti.Toast.Open(`对象[${this.meta}]非法`, "warn")
      }
      this.meta = oMeta
      this.data = await Wn.Io.loadContent(oMeta, {as:"json"})  

      return {meta: this.meta, data: this.data}
    }
    editor.wn_album_settings = settings
    // 读取信息
    //..............................................
    // Register plugin command
    editor.addCommand("InsertAlbum",   CmdInsertAlbum)
    editor.addCommand("SetAlbumSize",  CmdSetAlbumSize)
    editor.addCommand("SetAlbumStyle", CmdSetAlbumStyle)
    editor.addCommand("ReloadAlbumAlbum", CmdReloadAlbumAlbum)
    editor.addCommand("ShowAlbumProp", CmdShowAlbumProp)
    //..............................................
    // Register toolbar actions
    editor.ui.registry.addButton("WnAlbumPick", {
      icon : "images-regular",
      tooltip : Ti.I18n.text("i18n:album-insert"),
      onAction : function(menuBtn) {
        pickAlbumAndInsertToDoc(editor, settings)
      },
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnAlbumClrSize", {
      text : "清除相册尺寸",
      onAction() {
        editor.execCommand("SetAlbumSize", editor)
      }
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnAlbumAutoFitWidth", {
      text : "自动适应宽度",
      onAction() {
        editor.execCommand("SetAlbumSize", editor, {width:"100%"})
      }
    })
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnAlbumFloat', {
      text: '文本绕图',
      getSubmenuItems: function () {
        return [{
          type : "menuitem",
          icon : "align-left",
          text : "居左绕图",
          onAction() {
            editor.execCommand("SetAlbumStyle", editor, {float:"left"})
          }
        }, {
          type : "menuitem",
          icon : "align-right",
          text : "居右绕图",
          onAction() {
            editor.execCommand("SetAlbumStyle", editor, {float:"right"})
          }
        }, {
          type : "menuitem",
          text : "清除浮动",
          onAction() {
            editor.execCommand("SetAlbumStyle", editor, {float:""})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnAlbumMargin', {
      text: '相册边距',
      getSubmenuItems: function () {
        const __check_margin_size = function(api, expectSize) {
          let $album = GetCurrentAlbumElement(editor)
          let state = true
          if($album) {
            let sz = $album.style.marginLeft || $album.style.marginRight
            state = expectSize == sz
          }
          api.setActive(state);
          return function() {};
        }
        return [{
          type : "togglemenuitem",
          text : "小边距",
          onAction() {
            editor.execCommand("SetAlbumStyle", editor, {margin:"1em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '1em')
          }
        }, {
          type : "togglemenuitem",
          text : "中等边距",
          onAction() {
            editor.execCommand("SetAlbumStyle", editor, {margin:"2em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '2em')
          }
        }, {
          type : "togglemenuitem",
          text : "较大边距",
          onAction() {
            editor.execCommand("SetAlbumStyle", editor, {margin:"3em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '3em')
          }
        }, {
          type : "menuitem",
          icon : "align-center",
          text : "边距居中",
          onAction() {
            editor.execCommand("SetVideoStyle", editor, {margin:"0 auto"})
          }
        }, {
          type : "menuitem",
          icon : "square-6",
          text : "清除边距",
          onAction() {
            editor.execCommand("SetAlbumStyle", editor, {margin:""})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addMenuItem("WnAlbumReload", {
      icon : "sync-alt-solid",
      text : "刷新相册内容",
      onAction() {
        editor.execCommand("ReloadAlbumAlbum", editor, settings)
      }
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnAlbumProp", {
      text : "相册属性",
      onAction() {
        editor.execCommand("ShowAlbumProp", editor, settings)
      }
    })
    //..............................................
    editor.ui.registry.addContextMenu("wn-album", {
      update: function (el) {
        let $album = GetCurrentAlbumElement(editor)
        // Guard
        if(!_.isElement($album)) {
          return []
        }
        return [
          "WnAlbumClrSize WnAlbumAutoFitWidth",
          "WnAlbumFloat WnAlbumMargin",
          "WnAlbumReload",
          "WnAlbumProp"
        ].join(" | ")
      }
    })
    //..............................................
    editor.on("SetContent", function() {
      //console.log("SetContent album")
      let els = editor.$('.wn-media.as-album')
      for(let i=0; i<els.length; i++) {
        let el = els[i]
        UpdateAlbumTagInnerHtml(el, settings)
      }
    })
    //..............................................
    return {
      getMetadata: function () {
        return  {
          name: 'Wn Album plugin',
          url: 'http://site0.cn'
        };
      }
    };
    //..............................................
  }
  //------------------------------------------------
}