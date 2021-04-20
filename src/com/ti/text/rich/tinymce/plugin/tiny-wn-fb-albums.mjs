////////////////////////////////////////////////////
async function pickFbAlbumAndInsertToDoc(editor, settings) {
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
  editor.execCommand("InsertFbAlbum", editor, reo)
}
//--------------------------------------------------
function GetAlbumWidget($album) {
  return Ti.Widget.Album.getOrCreate($album, {
    attrPrefix : "wn-fb-",
    itemToPhoto : {
      name : "=name",
      link : "=link",
      src  : "=thumb_src"
    }
  })
}
//--------------------------------------------------
function UpdateFbAlbumTagInnerHtml($album, settings, {
  album, photos, items
}={}) {
  //console.log("UpdateFbAlbumTagInnerHtml")
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
      }).then((items)=>{
        //console.log(items)
        AB.renderItems(items)
      })
    })
  }
  // Just render
  else {
    AB.renderPhotos(photos)
  }
}
////////////////////////////////////////////////////
function CmdInsertAlbum(editor, fbAlbum) {
  if(!fbAlbum)
    return
  
  // Prepare range
  let rng = editor.selection.getRng()
  
  // Create image fragments
  let $doc = rng.commonAncestorContainer.ownerDocument
  let $album = Ti.Dom.createElement({
    tagName : "div",
    attrs : {
      tiAlbumType : "fb-album"
    },
    className : "wn-media as-fb-album"
  }, $doc)

  // Update INNER HTML
  UpdateFbAlbumTagInnerHtml($album, editor.wn_facebook_settings, {
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
function CmdReloadAlbum(editor, settings) {
  let $album = GetCurrentAlbumElement(editor)
  // Guard
  if(!_.isElement($album)) {
    return
  }
  // Reload content
  UpdateFbAlbumTagInnerHtml($album, settings)
}
////////////////////////////////////////////////////
function GetCurrentAlbumElement(editor) {
  let sel = editor.selection
  let $nd = sel.getNode()
  // Guard
  return Ti.Dom.closest($nd, (el)=>{
    return 'DIV' == el.tagName && Ti.Dom.hasClass(el, "wn-media", "as-fb-album")
  })
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
  // Gen the properties
  let AB = GetAlbumWidget($album)
  let data = AB.getData()

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
    comConf : Ti.Widget.Album.getEditFormConfig(),
    components : []
  })

  // 用户取消
  if(!reo)
    return

  //................................................
  let photos = AB.getPhotos()
  UpdateFbAlbumTagInnerHtml($album, settings, {
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
    //..............................................
    // Register toolbar actions
    editor.ui.registry.addButton("WnFbAlubmPick", {
      icon : "facebook-square-brands",
      tooltip : Ti.I18n.text("i18n:album-insert"),
      onAction : function(menuBtn) {
        pickFbAlbumAndInsertToDoc(editor, settings)
      },
    })
    //..............................................
    let {
      CMD_SET_STYLE, CMD_RELOAD, CMD_PROP
    } = Ti.Widget.Album.registryTinyMceMenuItem(editor, {
      prefix : "FbAlbums",
      settings,
      GetCurrentAlbumElement
    })
    //..............................................
    // Register plugin command
    editor.addCommand("InsertFbAlbum", CmdInsertAlbum)
    editor.addCommand(CMD_SET_STYLE,   CmdSetAlbumStyle)
    editor.addCommand(CMD_RELOAD,      CmdReloadAlbum)
    editor.addCommand(CMD_PROP,        CmdShowAlbumProp)
    //..............................................
    editor.on("SetContent", function() {
      //console.log("SetContent facebook")
      let els = editor.$('.wn-media.as-fb-album')
      for(let i=0; i<els.length; i++) {
        let el = els[i]
        UpdateFbAlbumTagInnerHtml(el, settings)
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