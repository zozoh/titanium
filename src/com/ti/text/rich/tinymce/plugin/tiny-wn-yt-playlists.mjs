////////////////////////////////////////////////////
async function pickYtPlaylistAndInsertToDoc(editor, settings) {
  // Load information
  let playlists = await settings.loadPlaylists()

  // format
  let items = _.map(playlists, pl=>{
    return {
      id: pl.id, title: pl.title, preview: pl.thumbUrl,
      badges : {
        NW : "fab-youtube-square",
        SE : {
          type : "text",
          className : "bchc-badge as-label as-year",
          value : pl.itemCount
        }
      }
    }
  })

  // Check base
  let reo = await Ti.App.Open({
    icon  : "fab-youtube-square",
    title : "i18n:net-youtube-add-playlist",
    position : "top",
    width  : "95%",
    height : "95%",
    model : {event:"select"},
    comType : "TiWall",
    comConf : {
      data: items,
      idBy: "id",
      multi: false,
      display: {
        key : "..",
        comType : "ti-obj-thumb",
        comConf : {
          "..." : "${=..}"
        }
      }
    },
    components : [
      "@com:ti/wall"
    ]
  })

  // User canceled
  if(_.isEmpty(reo) || !reo.current) {
    return
  }
  console.log("YTPlaylist", reo.current)
  // Do insert
  editor.execCommand("InsertYtPlaylist", editor, reo.current)
}
//--------------------------------------------------
function GetAlbumWidget($album) {
  return Ti.Widget.Album.getOrCreate($album, {
    attrPrefix : "wn-ytpl-",
    itemToPhoto : {
      name : "=title",
      link : "->https://www.youtube.com/watch?v=${id}",
      src  : "=thumbUrl"
    }
  })
}
//--------------------------------------------------
function UpdateYtPlaylistTagInnerHtml($album, settings, {
  album, photos, items
}={}) {
  //console.log("UpdateYtPlaylistTagInnerHtml")
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
    console.log("YTPL:: setting.load")
    settings.loadVideos(album).then((data)=>{
      console.log("load PL videos", data)
      AB.renderItems(data)
    })
  }
  // Just render
  else {
    AB.renderPhotos(photos)
  }
}
////////////////////////////////////////////////////
function CmdInsertAlbum(editor, ytPlaylist) {
  if(!ytPlaylist)
    return
  
  // Prepare range
  let rng = editor.selection.getRng()
  
  // Create image fragments
  let $doc = rng.commonAncestorContainer.ownerDocument
  let $album = Ti.Dom.createElement({
    tagName : "div",
    attrs : {
      tiAlbumType : "yt-playlist"
    },
    className : "wn-media as-yt-playlist"
  }, $doc)

  // Update INNER HTML
  UpdateYtPlaylistTagInnerHtml($album, editor.wn_yt_playlist_settings, {
    album : ytPlaylist
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
  UpdateYtPlaylistTagInnerHtml($album, settings)
}
////////////////////////////////////////////////////
function GetCurrentAlbumElement(editor) {
  let sel = editor.selection
  let $nd = sel.getNode()
  // Guard
  return Ti.Dom.closest($nd, (el)=>{
    return 'DIV' == el.tagName && Ti.Dom.hasClass(el, "wn-media", "as-yt-playlist")
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
  console.log(data)

  // Show dialog
  let reo = await Ti.App.Open({
    icon  : "fab-youtube-square",
    title : "编辑播放列表属性",
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
  UpdateYtPlaylistTagInnerHtml($album, settings, {
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
  name : "wn-yt-playlists",
  //------------------------------------------------
  init : function(conf={}) {
  },
  //------------------------------------------------
  setup : function(editor, url){
    //..............................................
    let settings = _.assign({
      meta : "~"
    }, _.get(editor.settings, "wn_yt_playlist_config"));
    //console.log("setup", editor.settings)
    //..............................................
    // Reload meta content
    settings.loadVideos = async function({id}){
      if(!this.config) {
        await this.loadConfig()
      }
      return await Wn.Youtube.getAllVideos(this.config, id)
    }
    //..............................................
    settings.loadConfig = async function(){
      let oMeta = await Wn.Io.loadMeta(this.meta)
      if(!oMeta) {
        return await Ti.Toast.Open(`路径[${meta}]不存在`, "warn")
      }
      if(oMeta.race != "FILE") {
        return await Ti.Toast.Open(`对象[${meta}]非法`, "warn")
      }

      // Load playlists
      let {domain, channelId} = await Wn.Io.loadContent(oMeta, {as:"json"})
      this.domain = domain
      this.channelId = channelId
      this.config = await Wn.Youtube.loadConfig({
        domain, channelId
      })
      return this.config
    }
    //..............................................
    settings.loadPlaylists = async function(){
      // Loaded already!
      if(!this.config) {
        await this.loadConfig()
      }
      return await Wn.Youtube.getAllPlaylists(this.config)
    }
    //..............................................
    editor.wn_yt_playlist_settings = settings
    //..............................................
    // Register toolbar actions
    editor.ui.registry.addButton("WnYtPlaylistPick", {
      icon : "youtube-square-brands",
      tooltip : Ti.I18n.text("i18n:album-insert"),
      onAction : function(menuBtn) {
        pickYtPlaylistAndInsertToDoc(editor, settings)
      },
    })
    //..............................................
    let {
      CMD_SET_STYLE, CMD_RELOAD, CMD_PROP
    } = Ti.Widget.Album.registryTinyMceMenuItem(editor, {
      prefix : "YtPlaylists",
      settings,
      GetCurrentAlbumElement
    })
    //..............................................
    // Register plugin command
    editor.addCommand("InsertYtPlaylist", CmdInsertAlbum)
    editor.addCommand(CMD_SET_STYLE,   CmdSetAlbumStyle)
    editor.addCommand(CMD_RELOAD,      CmdReloadAlbum)
    editor.addCommand(CMD_PROP,        CmdShowAlbumProp)
    //..............................................
    editor.on("SetContent", function() {
      let els = editor.$('.wn-media.as-yt-playlist')
      for(let i=0; i<els.length; i++) {
        let el = els[i]
        UpdateYtPlaylistTagInnerHtml(el, settings)
      }
    })
    //..............................................
    return {
      getMetadata: function () {
        return  {
          name: 'Wn Youtube playlist plugin',
          url: 'http://site0.cn'
        };
      }
    };
    //..............................................
  }
  //------------------------------------------------
}