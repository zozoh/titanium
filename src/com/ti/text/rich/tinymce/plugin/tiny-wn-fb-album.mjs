const ALBUM_PREFIX = "FbAlbum";
////////////////////////////////////////////////////
async function pickFbAlbumAndInsertToDoc(editor, settings) {
  let {metas} = await settings.load()
  if(metas.length == 0) {
    return await Ti.Toast.Open("i18n:hmk-config-nil", "warn")
  }

  // Get the meta
  let meta;
  if(metas.length > 1) {
    let metaId = await Ti.App.Open({
      title : "i18n:hmk-config-choose",
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
  // Set the album account
  reo.account = meta.nm

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
      name  : "=name",
      link  : "=link",
      thumb : "=thumb_src",
      src   : "=src"
    }
  })
}
//--------------------------------------------------
function UpdateFbAlbumTagInnerHtml(editor, $album, settings, {
  album, photos, items, force
}={}) {
  //console.log("UpdateFbAlbumTagInnerHtml")
  // Bind widget and get the data
  let AB = GetAlbumWidget($album);
  // If insert new album, the params will be passed
  if(!album) {
    album = AB.getData()
    if(force) {
      AB.setData(album)
    }
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
    // Get account name
    let accountName = $album.getAttribute("wn-fb-account")
    // Show loading
    AB.showLoading()

    // Load and rendering
    settings.load().then(({data})=>{
      // Found the account in data
      let content = data[accountName]
      let {domain, longLiveAccessToken} = content
      // Reload album items
      Wn.FbAlbum.reloadAllPhotoList({
        albumId : album.id,
        domain,
        access_token : longLiveAccessToken,
        force
      }).then((items)=>{
        console.log(items)
        Ti.Api.Facebook.setObjListPreview(items)
        AB.renderItems(items)
        // Force sync content
        editor.__rich_tinymce_com.syncContent()
      })
    })
  }
  // Just render
  else {
    AB.renderPhotos(photos)
    // Force sync content
    editor.__rich_tinymce_com.syncContent()
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
      tiAlbumType : "fb-album",
      wnFbAccount : fbAlbum.account
    },
    className : "wn-media as-fb-album"
  }, $doc)

  // Update INNER HTML
  UpdateFbAlbumTagInnerHtml(editor, $album, editor.wn_facebook_settings, {
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
  UpdateFbAlbumTagInnerHtml(editor, $album, settings, {
    force: true
  })
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
    title : "i18n:hmk-w-edit-fb-album-prop",
    width  : "37%",
    height : "100%",
    position : "right",
    closer : "left",
    clickMaskToClose : true,
    result : data,
    model : {prop:"data", event:"change"},
    comType : "TiForm",
    comConf : Ti.Widget.Album.getEditFormConfig(ALBUM_PREFIX),
    components : []
  })

  // 用户取消
  if(!reo)
    return

  //................................................
  let photos = AB.getPhotos()
  UpdateFbAlbumTagInnerHtml(editor, $album, settings, {
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
  name : "wn-fb-album",
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
        return await Ti.Toast.Open({
          content : "i18n:e-ph-noexists",
          type : "warn",
          val: this.meta
        })
      }
      // DIR, loading setting map
      if("DIR" == oMeta.race) {
        // Query and read
        let cmdText = [
          `o id:${oMeta.id}`,
            `@query 'tp:"${this.type}"'`,
            `@read -as json`,
            `@json -cqn`].join(" ")
        this.metas = await Wn.Sys.exec2(cmdText, {as:"json"})
      }
      // FILE, load the single file
      else {
        oMeta.content = await Wn.Io.loadContent(oMeta, {as:"json"})
        this.metas = [oMeta]
      }

      // Build Album ID data
      this.data = {}
      _.forEach(this.metas, ({nm, content})=>{
        this.data[nm] = content
      })

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
      prefix : ALBUM_PREFIX,
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
    let $vm = editor.__rich_tinymce_com
    $vm.registerContentCallback("wn-fb-album", function() {
      //console.log("SetContent facebook")
      let els = editor.$('.wn-media.as-fb-album')
      for(let i=0; i<els.length; i++) {
        let el = els[i]
        UpdateFbAlbumTagInnerHtml(editor, el, settings)
      }
    })
    //..............................................
    return {
      getMetadata: function () {
        return  {
          name: 'Wn Facebook Album plugin',
          url: 'http://site0.cn'
        };
      }
    };
    //..............................................
  }
  //------------------------------------------------
}