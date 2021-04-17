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
//--------------------------------------------------
function GetAlbumWidget($album) {
  return Ti.Widget.Album.getOrCreate($album, {
    attrPrefix : "wn-fb-",
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
//--------------------------------------------------
function UpdateFacebookTagInnerHtml($album, settings, {
  album, photos, items
}={}) {
  console.log("UpdateFacebookTagInnerHtml")
  // Bind widget and get the data
  let AB = GetAlbumWidget($album);
  // If insert new album, the params will be passed
  if(!album) {
    album = AB.getData()
  } else {
    AB.setData(album)
  }
  // Mark content editable
  $album.contentEditable = false

  // Explain items to photos
  if(items) {
    photos = AB.covertToPhotos(items)
  }
  
  // Reload photo from remote
  if(_.isEmpty(photos)) {
    // Show loading
    AB.showLoading()

    // Load and rendering
    settings.load().then(({data})=>{
      let {longLiveAccessToken} = data[album.id].content
      // Reload album items
      Ti.Api.Facebook.getAlbumPhotoList({
        albumId : album.id,
        access_token : longLiveAccessToken
      }).then((photos)=>{
        AB.renderPhotos(photos)
      })
    })
  }
  // Just render
  else {
    AB.renderPhotos(photos)
  }
}
////////////////////////////////////////////////////
function CmdInsertFacebook(editor, fbAlbum) {
  if(!fbAlbum)
    return
  
  // Prepare range
  let rng = editor.selection.getRng()
  
  // Create image fragments
  let $doc = rng.commonAncestorContainer.ownerDocument
  let $album = Ti.Dom.createElement({
    tagName : "div",
    className : "wn-media as-photos as-facebook"
  }, $doc)

  // Update INNER HTML
  UpdateFacebookTagInnerHtml($album, editor.wn_facebook_settings, {
    album : fbAlbum
  })
  
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
  let AB = GetAlbumWidget($album)
  // Guard
  if(!_.isElement($album)) {
    return
  }
  // Gen the properties
  let data = AB.getData()
  console.log(data)

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
    comConf : AB.getEditFormConfig(),
    components : []
  })

  // 用户取消
  if(!reo)
    return

  //................................................
  let photos = AB.getPhotos()
  UpdateFacebookTagInnerHtml($album, settings, {
    album:reo, photos
  })
  //................................................
  // clean cache
  $album.removeAttribute("data-mce-src")
  $album.removeAttribute("data-mce-style")
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