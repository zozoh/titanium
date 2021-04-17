////////////////////////////////////////////////////
async function pickFacebookAndInsertToDoc(editor, settings) {
  let {metas} = await settings.load()
  if(metas.length == 0) {
    return await Ti.Toast.Open("找不到配置信息", "warn")
  }

  // Get the meta
  let meta;
  if(metas.length > 1) {
    let metaId = await Ti.App.Open({
      title : "选择配置信息",
      width : 480,
      height : 480,
      comType : "TiBulletRadio",
      comConf : {
        options : metas
      },
      components : ["@com:ti/bullet/radio"]
    })
    // User cancel
    if(!metaId) {
      return
    }
    meta = _.find(metas, m => m.id == metaId)
  }
  // Only one meta
  else {
    meta = metas[0]
  }
  // Check base
  let reo = await Ti.App.Open({
    icon  : "fas-image",
    title : "Facebook",
    position : "top",
    width  : "95%",
    height : "95%",
    comType : "NetFacebookAlbums",
    comConf : {
      meta, 
      ... meta.content,
      notifyName : "change"
    },
    components : [
      "@com:net/facebook/albums"
    ]
  })

  // User canceled
  if(_.isEmpty(reo)) {
    return
  }

  // Do insert image
  editor.execCommand("InsertFacebook", editor, reo)
}
////////////////////////////////////////////////////
function GetFacebookAttrsByElement(elFacebook) {
  // Top Style
  let stl = Ti.Dom.getStyle(elFacebook, 
    /^(width|height|float|(margin-(left|right|top|bottom)))$/)
  stl.float = stl.float || "none"
  //
  // Wall Style
  let $wall = Ti.Dom.find(".tiw-photo-wall", elFacebook)
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
    id   : elFacebook.getAttribute("wn-fb-id"),
    name  : elFacebook.getAttribute("wn-fb-name"),
    link  : elFacebook.getAttribute("wn-fb-link"),
    ... stl,
    wallClass, wallStyle,
    tileClass, tileStyle, picStyle
  }
}
////////////////////////////////////////////////////
function GetFacebookAttrsByObj(fbAlbumn) {
  return {
    "wn-fb-id" : fbAlbumn.id,
    "wn-fb-name" : fbAlbumn.name,
    "wn-fb-link" : fbAlbumn.link
  }
}
////////////////////////////////////////////////////
function SetAlbumInfoToElement($album, data, old={}) {
  console.log("SetAlbumInfoToElement", data, old)
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
    Ti.Dom.setAttrs($wall, {
      "wn-tile-class" : data.tileClass || null,
      "wn-tile-style" : tileStyle || null,
      "wn-pic-style"  : picStyle  || null
    })
  }
  //................................................
}
////////////////////////////////////////////////////
const DFT_CLASS = [
  'flex-none','item-margin-no','item-padding-sm',
  'pic-fit-cover','hover-to-zoom'
].join(' ')
//--------------------------------------------------
function UpdateFacebookTagInnerHtml(elFacebook, settings) {
  //console.log("UpdateFacebookTagInnerHtml")
  // Get old content
  let album = GetFacebookAttrsByElement(elFacebook)
  // Mark content editable
  elFacebook.contentEditable = false
  // Show loading
  elFacebook.innerHTML = `<div class="media-inner">
    <i class="fas fa-spinner fa-spin"></i>
  </div>`

  settings.load().then(({data})=>{
    let {longLiveAccessToken} = data[album.id].content
    // Reload album items
    Ti.Api.Facebook.getAlbumPhotoList({
      albumId : album.id,
      access_token : longLiveAccessToken
    }).then((photos)=>{
      // Create inner HTML for the album
      let html = `<div class="tiw-photo-wall ${DFT_CLASS}">`
      for(let photo of photos) {
        let {name, link, thumb_src} = photo
        html += `<a class="wall-tile"
          href="${link}" title="${name||''}"
          target="_blank"><img src="${thumb_src}"/></a>`
      }
      html += '</div>'
      elFacebook.innerHTML = html

      // Recover the attr-data
      SetAlbumInfoToElement(elFacebook, album)

      // Then we need update the album css style
      UpdateAlbumStyle(elFacebook)
    })
  })
}
////////////////////////////////////////////////////
function UpdateAlbumStyle($album) {
  let $wall = Ti.Dom.find(":scope > .tiw-photo-wall", $album)
  let {tileStyle, picStyle} = GetFacebookAttrsByElement($album)
  let $tiles = Ti.Dom.findAll(".wall-tile", $wall)
  for(let i=0; i<$tiles.length; i++) {
    let $tile = $tiles[i]
    let $img = Ti.Dom.find("img", $tile)
    Ti.Dom.setStyle($tile, tileStyle)
    Ti.Dom.setStyle($img, picStyle)
  }
}
////////////////////////////////////////////////////
function CmdInsertFacebook(editor, fbAlbumn) {
  if(!fbAlbumn)
    return
  
  // Prepare range
  let rng = editor.selection.getRng()
  
  // Create image fragments
  let $doc = rng.commonAncestorContainer.ownerDocument
  let $album = Ti.Dom.createElement({
    tagName : "div",
    className : "wn-media as-photos as-facebook",
    attrs : GetFacebookAttrsByObj(fbAlbumn)
  }, $doc)
  UpdateFacebookTagInnerHtml($album, editor.wn_facebook_settings)
  
  // Remove content
  if(!rng.collapsed) {
    rng.deleteContents()
  }

  // Insert fragments
  rng.insertNode($album)

}
////////////////////////////////////////////////////
function CmdReloadFacebookAlbum(editor, settings) {
  let $album = GetCurrentFacebookElement(editor)
  // Guard
  if(!_.isElement($album)) {
    return
  }
  // Reload content
  UpdateFacebookTagInnerHtml($album, settings)
}
////////////////////////////////////////////////////
function GetCurrentFacebookElement(editor) {
  let sel = editor.selection
  let $nd = sel.getNode()
  // Guard
  return Ti.Dom.closest($nd, (el)=>{
    return 'DIV' == el.tagName && Ti.Dom.hasClass(el, "wn-media", "as-facebook")
  })
}
////////////////////////////////////////////////////
function CmdSetFacebookSize(editor, {width="", height=""}={}) {
  let $album = GetCurrentFacebookElement(editor)
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
function CmdSetFacebookStyle(editor, css={}) {
  let $album = GetCurrentFacebookElement(editor)
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
async function CmdShowFacebookProp(editor, settings) {
  let $album = GetCurrentFacebookElement(editor)
  // Guard
  if(!_.isElement($album)) {
    return
  }
  //console.log("stl", stl)
  // Gen the properties
  let data = GetFacebookAttrsByElement($album)

  //console.log(data)
  // Show dialog
  let reo = await Ti.App.Open({
    icon  : "fab-facebook",
    title : "编辑Facebook相册属性",
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
                      {value: "hover-to-up",    text:"i18n:hmk-class-hover-to-up"},
                      {value: "hover-to-scale", text:"i18n:hmk-class-hover-to-scale"},
                      {value: "hover-to-zoom",  text:"i18n:hmk-class-hover-to-zoom"}
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
  name : "wn-fb-albums",
  //------------------------------------------------
  init : function(conf={}) {
  },
  //------------------------------------------------
  setup : function(editor, url){
    //..............................................
    let settings = _.assign({
        meta : "~",
        type : "facebook_albums"
      }, _.get(editor.settings, "wn_facebook_config"));
    //console.log("setup", editor.settings)
    //..............................................
    // Reload meta content
    // Check meta
    settings.load = async function(){
      if(this.data) {
        return {metas: this.metas, data: this.data}
      }
      let oMeta = await Wn.Io.loadMeta(this.meta)
      if(!oMeta) {
        return await Ti.Toast.Open(`路径[${this.meta}]不存在`, "warn")
      }
      // DIR, loading setting map
      if("DIR" == oMeta.race) {
        // Query and read
        let cmdText = [
          `o id:${oMeta.id}`,
            `@query 'tp:"${this.type}"'`,
            `@read -as json`,
            `@json -cqn'`].join(" ")
        this.metas = await Wn.Sys.exec2(cmdText, {as:"json"})
      }
      // FILE, load the single file
      else {
        oMeta.content = await Wn.Io.loadContent(oMeta, {as:"json"})
        this.metas = [oMeta]
      }

      // Build Album ID data
      this.data = {}
      for(let meta of this.metas) {
        let content = _.get(meta, "content")
        _.forEach(content.userAlbumIds, aId => {
          this.data[aId] = {meta, content}
        })

      }

      return {metas: this.metas, data: this.data}
    }
    editor.wn_facebook_settings = settings
    // 读取信息
    //..............................................
    // Register plugin command
    editor.addCommand("InsertFacebook",   CmdInsertFacebook)
    editor.addCommand("SetFacebookSize",  CmdSetFacebookSize)
    editor.addCommand("SetFacebookStyle", CmdSetFacebookStyle)
    editor.addCommand("ReloadFacebookAlbum", CmdReloadFacebookAlbum)
    editor.addCommand("ShowFacebookProp", CmdShowFacebookProp)
    //..............................................
    // Register toolbar actions
    editor.ui.registry.addButton("WnFacebookPick", {
      icon : "facebook-square-brands",
      tooltip : Ti.I18n.text("i18n:album-insert"),
      onAction : function(menuBtn) {
        pickFacebookAndInsertToDoc(editor, settings)
      },
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnFacebookClrSize", {
      text : "清除相册尺寸",
      onAction() {
        editor.execCommand("SetFacebookSize", editor)
      }
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnFacebookAutoFitWidth", {
      text : "自动适应宽度",
      onAction() {
        editor.execCommand("SetFacebookSize", editor, {width:"100%"})
      }
    })
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnFacebookFloat', {
      text: '文本绕图',
      getSubmenuItems: function () {
        return [{
          type : "menuitem",
          icon : "align-left",
          text : "居左绕图",
          onAction() {
            editor.execCommand("SetFacebookStyle", editor, {float:"left"})
          }
        }, {
          type : "menuitem",
          icon : "align-right",
          text : "居右绕图",
          onAction() {
            editor.execCommand("SetFacebookStyle", editor, {float:"right"})
          }
        }, {
          type : "menuitem",
          text : "清除浮动",
          onAction() {
            editor.execCommand("SetFacebookStyle", editor, {float:""})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnFacebookMargin', {
      text: '相册边距',
      getSubmenuItems: function () {
        const __check_margin_size = function(api, expectSize) {
          let $album = GetCurrentFacebookElement(editor)
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
            editor.execCommand("SetFacebookStyle", editor, {margin:"1em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '1em')
          }
        }, {
          type : "togglemenuitem",
          text : "中等边距",
          onAction() {
            editor.execCommand("SetFacebookStyle", editor, {margin:"2em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '2em')
          }
        }, {
          type : "togglemenuitem",
          text : "较大边距",
          onAction() {
            editor.execCommand("SetFacebookStyle", editor, {margin:"3em"})
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
            editor.execCommand("SetFacebookStyle", editor, {margin:""})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addMenuItem("WnFacebookReload", {
      icon : "sync-alt-solid",
      text : "刷新相册内容",
      onAction() {
        editor.execCommand("ReloadFacebookAlbum", editor, settings)
      }
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnFacebookProp", {
      text : "相册属性",
      onAction() {
        editor.execCommand("ShowFacebookProp", editor, settings)
      }
    })
    //..............................................
    editor.ui.registry.addContextMenu("wn-fb-albums", {
      update: function (el) {
        let $album = GetCurrentFacebookElement(editor)
        // Guard
        if(!_.isElement($album)) {
          return []
        }
        return [
          "WnFacebookClrSize WnFacebookAutoFitWidth",
          "WnFacebookFloat WnFacebookMargin",
          "WnFacebookReload",
          "WnFacebookProp"
        ].join(" | ")
      }
    })
    //..............................................
    editor.on("SetContent", function() {
      //console.log("SetContent facebook")
      let els = editor.$('.wn-media.as-facebook')
      for(let i=0; i<els.length; i++) {
        let el = els[i]
        UpdateFacebookTagInnerHtml(el, settings)
      }
    })
    //..............................................
    return {
      getMetadata: function () {
        return  {
          name: 'Wn Facebook plugin',
          url: 'http://site0.cn'
        };
      }
    };
    //..............................................
  }
  //------------------------------------------------
}