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
      name : "=title|nm",
      link : "#",
      src  : "->/o/content?str=${thumb}"
    }
  })
}
//--------------------------------------------------
function UpdateAlbumTagInnerHtml($album, settings, {
  album, photos, items
}={}) {
  //console.log("UpdateAlbumTagInnerHtml")
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
    settings.load(album).then((data)=>{
      AB.renderItems(data)
    })
  }
  // Just render
  else {
    AB.renderPhotos(photos)
  }
}
////////////////////////////////////////////////////
function CmdInsertAlbum(editor, oAlbum) {
  if(!oAlbum)
    return
  //console.log("CmdInsertAlbum", oAlbum)
  // Prepare range
  let rng = editor.selection.getRng()
  
  // Create image fragments
  let $doc = rng.commonAncestorContainer.ownerDocument
  let $album = Ti.Dom.createElement({
    tagName : "div",
    attrs : {
      tiAlbumType : "album"
    },
    className : "wn-media as-album"
  }, $doc)
  
  // Update INNER HTML
  UpdateAlbumTagInnerHtml($album, editor.wn_album_settings, {
    album : oAlbum
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
///////////////////////////////////////////////////
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
  //console.log(data)

  //console.log(data)
  // Show dialog
  // Show dialog
  let reo = await Ti.App.Open({
    icon  : "fab-facebook",
    title : "编辑相册属性",
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
  UpdateAlbumTagInnerHtml($album, settings, {
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
    //..............................................
    // Reload meta content
    // Check meta
    settings.load = async function({id}){
      let match = JSON.stringify({
        pid  : id,
        race : "FILE",
        mime : "^image\/"
      })
      let KF = '^(id|thumb|sha1|nm|title|mime|tp|width|height)$'
      return await Wn.Sys.exec2(
        `o @query '${match}' @json '${KF}' -cqnl`, {
          as:"json"
        })
    }
    editor.wn_album_settings = settings
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
    let {
      CMD_SET_STYLE, CMD_RELOAD, CMD_PROP
    } = Ti.Widget.Album.registryTinyMceMenuItem(editor, {
      prefix : "album",
      settings,
      GetCurrentAlbumElement
    })
    //..............................................
    // Register plugin command
    editor.addCommand("InsertAlbum",   CmdInsertAlbum)
    editor.addCommand(CMD_SET_STYLE, CmdSetAlbumStyle)
    editor.addCommand(CMD_RELOAD,   CmdReloadAlbum)
    editor.addCommand(CMD_PROP, CmdShowAlbumProp)
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