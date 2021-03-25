////////////////////////////////////////////////////
async function pickVideoAndInsertToDoc(editor, {
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
    icon  : "fas-image",
    title : "i18n:video-insert",
    position : "top",
    width  : "95%",
    height : "95%",
    multi : false,
    fallbackPath
  })

  // User canceled
  if(_.isEmpty(reo)) {
    return
  }

  // Do insert image
  editor.execCommand("InsertVideo", editor, reo)
}
////////////////////////////////////////////////////
function GetVideoAttrsByElement(elVideo) {
  let stl = Ti.Dom.getStyle(elVideo, 
    /^(width|height|float|(margin-(left|right|top|bottom)))$/)
  stl.float = stl.float || "none"
  return {
    oid   : elVideo.getAttribute("wn-obj-id"),
    sha1  : elVideo.getAttribute("wn-obj-sha1"),
    mime  : elVideo.getAttribute("wn-obj-mime"),
    tp    : elVideo.getAttribute("wn-obj-tp"),
    thumb : elVideo.getAttribute("wn-obj-thumb"),
    video_cover   : elVideo.getAttribute("wn-obj-video_cover"),
    naturalWidth  : elVideo.getAttribute("wn-obj-width"),
    naturalHeight : elVideo.getAttribute("wn-obj-height"),
    duration : elVideo.getAttribute("wn-obj-duration"),
    ... stl
  }
}
////////////////////////////////////////////////////
function GetVideoAttrsByObj(oVideo) {
  return {
    "wn-obj-id" : oVideo.id,
    "wn-obj-sha1" : oVideo.sha1,
    "wn-obj-mime" : oVideo.mime,
    "wn-obj-tp"   : oVideo.tp,
    "wn-obj-thumb" : oVideo.thumb,
    "wn-obj-video_cover" : oVideo.video_cover,
    "wn-obj-width" : oVideo.width,
    "wn-obj-height" : oVideo.height,
    "wn-obj-duration" : oVideo.duration
  }
}
////////////////////////////////////////////////////
function UpdateVideoTagInnerHtml(elVideo) {
  let cover = elVideo.getAttribute("wn-obj-video_cover")
  if(!cover) {
    cover = elVideo.getAttribute("wn-obj-thumb")
  }
  if(cover && !cover.startsWith("id:")) {
    cover = "id:" + cover
  }
  let $inner = Ti.Dom.createElement({
    tagName : "div",
    className : "media-inner",
    style : {
      "background-image" : `url("/o/content?str=${cover}")`
    }
  })
  $inner.innerHTML = '<i class="fas fa-play-circle"></i>'
  elVideo.innerHTML = null
  elVideo.contentEditable = false
  Ti.Dom.appendTo($inner, elVideo)
}
////////////////////////////////////////////////////
function CmdInsertVideo(editor, oVideos) {
  if(_.isEmpty(oVideos))
    return
  
  // Prepare range
  let rng = editor.selection.getRng()
  
  // Create image fragments
  let $doc = rng.commonAncestorContainer.ownerDocument
  let frag = new DocumentFragment()
  for(let oVideo of oVideos) {
    let $video = Ti.Dom.createElement({
      tagName : "div",
      className : "wn-media as-video",
      attrs : GetVideoAttrsByObj(oVideo)
    }, $doc)
    UpdateVideoTagInnerHtml($video)
    frag.appendChild($video)
  }
  
  // Remove content
  if(!rng.collapsed) {
    rng.deleteContents()
  }

  // Insert fragments
  rng.insertNode(frag)

}
////////////////////////////////////////////////////
function GetCurrentVideoElement(editor) {
  let sel = editor.selection
  let $nd = sel.getNode()
  // Guard
  return Ti.Dom.closest($nd, (el)=>{
    return 'DIV' == el.tagName && Ti.Dom.hasClass(el, "wn-media", "as-video")
  })
}
////////////////////////////////////////////////////
function CmdSetVideoSize(editor, {width="", height=""}={}) {
  let $video = GetCurrentVideoElement(editor)
  // Guard
  if(!_.isElement($video)) {
    return
  }
  // Clear the attribute
  Ti.Dom.setStyle($video, {width, height})
  // Force sync content
  editor.__rich_tinymce_com.syncContent()
}
////////////////////////////////////////////////////
function CmdSetVideoStyle(editor, css={}) {
  let $video = GetCurrentVideoElement(editor)
  // Guard
  if(!_.isElement($video)) {
    return
  }
  // Clear float
  Ti.Dom.setStyle($video, css)
  // Force sync content
  editor.__rich_tinymce_com.syncContent()
}
////////////////////////////////////////////////////
async function CmdShowVideoProp(editor, settings) {
  let $video = GetCurrentVideoElement(editor)
  // Guard
  if(!_.isElement($video)) {
    return
  }
  //console.log("stl", stl)
  // Gen the properties
  let data = GetVideoAttrsByElement($video)

  //console.log(data)
  // Show dialog
  let reo = await Ti.App.Open({
    icon  : "fas-image",
    title : "编辑视频属性",
    width  : "37%",
    height : "100%",
    position : "right",
    closer : "left",
    clickMaskToClose : true,
    result : data,
    model : {prop:"data", event:"change"},
    comType : "TiForm",
    comConf : {
      spacing : "tiny",
      fields : [{
          title : "视频",
          name  : "oid",
          comType : "WnObjPicker",
          comConf : {
            valueType : "id",
            base : settings.base,
            titleEditable : false
          }
        }, {
          title : "尺寸",
          fields: [{
            title : "宽度",
            name  : "width",
            comType : "TiInput",
            comConf : {
              placeholder: `${data.naturalWidth}px`
            }
          }, {
            title : "高度",
            name  : "height",
            comType : "TiInput",
            comConf : {
              placeholder: `${data.naturalHeight}px`
            }
          }]
        }, {
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
          title : "视频距",
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
        }]
    },
    components : [
      "@com:wn/obj/picker"
    ]
  })

  // 用户取消
  if(!reo)
    return

  // Update image
  //................................................
  // src
  if(data.oid != reo.oid) {
    // Remove Video
    if(!reo.oid) {
      Ti.Dom.remove($video)
      return
    }
    // 读取对象详情
    let oVideo = await Wn.Io.loadMetaById(reo.oid)
    // Switch image src
    let attrs = GetVideoAttrsByObj(oVideo)
    Ti.Dom.setAttrs($video, attrs)

    UpdateVideoTagInnerHtml($video)
    
  }
  //................................................
  // Styling
  const _video_style = function(styName, v, oldValue) {
    if(oldValue == v)
      return
    if(!v || "none" == v) {
      $video.style[styName] = ""
    } else if(_.isNumber(v) || /^\d+(\.\d+)?$/.test(v)) {
      $video.style[styName] = `${v}px`
    } else {
      $video.style[styName] = v
    }
  }
  //................................................
  _video_style("width", reo.width, data.width)
  _video_style("height", reo.height, data.height)
  _video_style("float", reo.float, data.float)
  _video_style("marginLeft",   reo.marginLeft,   data.marginLeft)
  _video_style("marginRight",  reo.marginRight,  data.marginRight)
  _video_style("marginTop",    reo.marginTop,    data.marginTop)
  _video_style("marginBottom", reo.marginBottom, data.marginBottom)
  //................................................
  // clean cache
  $video.removeAttribute("data-mce-src")
  $video.removeAttribute("data-mce-style")
  //................................................
  // Force sync content
  editor.__rich_tinymce_com.syncContent()
}
////////////////////////////////////////////////////
export default {
  name : "wn-video",
  //------------------------------------------------
  init : function(conf={}) {
  },
  //------------------------------------------------
  setup : function(editor, url){
    //..............................................
    let settings = _.assign({
        base : "~"
      }, _.get(editor.settings, "wn_video_config"));
    //console.log("setup", editor.settings)
    //..............................................
    // Register plugin command
    editor.addCommand("InsertVideo",   CmdInsertVideo)
    editor.addCommand("SetVideoSize",  CmdSetVideoSize)
    editor.addCommand("SetVideoStyle", CmdSetVideoStyle)
    editor.addCommand("ShowVideoProp", CmdShowVideoProp)
    //..............................................
    // Register toolbar actions
    editor.ui.registry.addButton("WnVideoPick", {
      icon : "film-solid",
      tooltip : Ti.I18n.text("i18n:video-insert"),
      onAction : function(menuBtn) {
        pickVideoAndInsertToDoc(editor, settings)
      },
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnVideoClrSize", {
      text : "清除视频尺寸",
      onAction() {
        editor.execCommand("SetVideoSize", editor)
      }
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnVideoAutoFitWidth", {
      text : "自动适应宽度",
      onAction() {
        editor.execCommand("SetVideoSize", editor, {width:"100%"})
      }
    })
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnVideoFloat', {
      text: '文本绕图',
      getSubmenuItems: function () {
        return [{
          type : "menuitem",
          icon : "align-left",
          text : "居左绕图",
          onAction() {
            editor.execCommand("SetVideoStyle", editor, {float:"left"})
          }
        }, {
          type : "menuitem",
          icon : "align-right",
          text : "居右绕图",
          onAction() {
            editor.execCommand("SetVideoStyle", editor, {float:"right"})
          }
        }, {
          type : "menuitem",
          text : "清除浮动",
          onAction() {
            editor.execCommand("SetVideoStyle", editor, {float:""})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnVideoMargin', {
      text: '视频边距',
      getSubmenuItems: function () {
        const __check_margin_size = function(api, expectSize) {
          let $video = GetCurrentVideoElement(editor)
          let state = true
          if($video) {
            let sz = $video.style.marginLeft || $video.style.marginRight
            state = expectSize == sz
          }
          api.setActive(state);
          return function() {};
        }
        return [{
          type : "togglemenuitem",
          text : "小边距",
          onAction() {
            editor.execCommand("SetVideoStyle", editor, {margin:"1em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '1em')
          }
        }, {
          type : "togglemenuitem",
          text : "中等边距",
          onAction() {
            editor.execCommand("SetVideoStyle", editor, {margin:"2em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '2em')
          }
        }, {
          type : "togglemenuitem",
          text : "较大边距",
          onAction() {
            editor.execCommand("SetVideoStyle", editor, {margin:"3em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '3em')
          }
        }, {
          type : "menuitem",
          text : "清除边距",
          onAction() {
            editor.execCommand("SetVideoStyle", editor, {margin:""})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addMenuItem("WnVideoProp", {
      text : "视频属性",
      onAction() {
        editor.execCommand("ShowVideoProp", editor, settings)
      }
    })
    //..............................................
    editor.ui.registry.addContextMenu("wn-video", {
      update: function (el) {
        let $video = GetCurrentVideoElement(editor)
        // Guard
        if(!_.isElement($video)) {
          return []
        }
        return [
          "WnVideoClrSize WnVideoAutoFitWidth",
          "WnVideoFloat WnVideoMargin",
          "WnVideoProp"
        ].join(" | ")
      }
    })
    //..............................................
    editor.on("SetContent", function() {
      //console.log("SetContent video")
      let els = editor.$('.wn-media.as-video')
      for(let i=0; i<els.length; i++) {
        let el = els[i]
        let mime = el.getAttribute("wn-obj-mime")
        UpdateVideoTagInnerHtml(el)
      }
    })
    //..............................................
    return {
      getMetadata: function () {
        return  {
          name: 'Wn Video plugin',
          url: 'http://site0.cn'
        };
      }
    };
    //..............................................
  }
  //------------------------------------------------
}