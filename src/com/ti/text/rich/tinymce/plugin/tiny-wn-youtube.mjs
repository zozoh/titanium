////////////////////////////////////////////////////
async function pickYoutubeAndInsertToDoc(editor, {
  meta = "~"
}) {
  // Check meta
  let oMeta = await Wn.Io.loadMeta(meta)
  if(!oMeta) {
    return await Ti.Toast.Open(`路径[${meta}]不存在`, "warn")
  }
  if(oMeta.race != "FILE") {
    return await Ti.Toast.Open(`对象[${meta}]非法`, "warn")
  }
  meta = oMeta

  // 读取信息
  let {domain, channelId} = await Wn.Io.loadContent(meta, {as:"json"})

  // Check base
  let reo = await Ti.App.Open({
    icon  : "fas-image",
    title : "Youtube",
    position : "top",
    width  : "95%",
    height : "95%",
    comType : "NetYoutubeBrowser",
    comConf : {
      meta, domain, channelId,
      notifyName : "change"
    },
    components : [
      "@com:net/youtube/browser"
    ]
  })

  // User canceled
  if(_.isEmpty(reo)) {
    return
  }

  // Do insert image
  editor.execCommand("InsertYoutube", editor, reo)
}
////////////////////////////////////////////////////
function GetYoutubeAttrsByElement(elYoutube) {
  let stl = Ti.Dom.getStyle(elYoutube, 
    /^(width|height|float|(margin-(left|right|top|bottom)))$/)
  stl.float = stl.float || "none"
  return {
    id   : elYoutube.getAttribute("wn-yt-id"),
    title  : elYoutube.getAttribute("wn-yt-title"),
    description  : elYoutube.getAttribute("wn-yt-description"),
    pubat    : elYoutube.getAttribute("wn-yt-pubat"),
    thumbUrl : elYoutube.getAttribute("wn-yt-thumb-url"),
    duration   : elYoutube.getAttribute("wn-yt-duration"),
    du_in_str  : elYoutube.getAttribute("wn-yt-du_in_str"),
    definition : elYoutube.getAttribute("wn-yt-definition"),
    categoryId : elYoutube.getAttribute("wn-yt-category-id"),
    ... stl
  }
}
////////////////////////////////////////////////////
function GetYoutubeAttrsByObj(ytVideo) {
  return {
    "wn-yt-id" : ytVideo.id,
    "wn-yt-title" : ytVideo.title,
    "wn-yt-description" : ytVideo.description,
    "wn-yt-pubat" : ytVideo.publishedAt,
    "wn-yt-thumb-url" : ytVideo.thumbUrl,
    "wn-yt-duration" : ytVideo.duration,
    "wn-yt-du_in_str" : ytVideo.du_in_str,
    "wn-yt-definition" : ytVideo.definition,
    "wn-yt-category-id" : ytVideo.categoryId,
  }
}
////////////////////////////////////////////////////
function UpdateYoutubeTagInnerHtml(elYoutube) {
  let cover = elYoutube.getAttribute("wn-yt-thumb-url")
  let $inner = Ti.Dom.createElement({
    tagName : "div",
    className : "media-inner",
    style : {
      "background-image" : `url("${cover}")`
    }
  })
  $inner.innerHTML = '<i class="fab fa-youtube"></i>'
  elYoutube.innerHTML = null
  elYoutube.contentEditable = false
  Ti.Dom.appendTo($inner, elYoutube)
}
////////////////////////////////////////////////////
function CmdInsertYoutube(editor, ytVideo) {
  if(!ytVideo)
    return
  
  // Prepare range
  let rng = editor.selection.getRng()
  
  // Create image fragments
  let $doc = rng.commonAncestorContainer.ownerDocument
  let $video = Ti.Dom.createElement({
    tagName : "div",
    className : "wn-media as-youtube",
    attrs : GetYoutubeAttrsByObj(ytVideo)
  }, $doc)
  UpdateYoutubeTagInnerHtml($video)
  
  // Remove content
  if(!rng.collapsed) {
    rng.deleteContents()
  }

  // Insert fragments
  rng.insertNode($video)

}
////////////////////////////////////////////////////
function GetCurrentYoutubeElement(editor) {
  let sel = editor.selection
  let $nd = sel.getNode()
  // Guard
  return Ti.Dom.closest($nd, (el)=>{
    return 'DIV' == el.tagName && Ti.Dom.hasClass(el, "wn-media", "as-youtube")
  })
}
////////////////////////////////////////////////////
function CmdSetYoutubeSize(editor, {width="", height=""}={}) {
  let $video = GetCurrentYoutubeElement(editor)
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
function CmdSetYoutubeStyle(editor, css={}) {
  let $video = GetCurrentYoutubeElement(editor)
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
async function CmdShowYoutubeProp(editor, settings) {
  let $video = GetCurrentYoutubeElement(editor)
  // Guard
  if(!_.isElement($video)) {
    return
  }
  //console.log("stl", stl)
  // Gen the properties
  let data = GetYoutubeAttrsByElement($video)

  //console.log(data)
  // Show dialog
  let reo = await Ti.App.Open({
    icon  : "fab-youtube",
    title : "编辑Youtube视频属性",
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
          title : "尺寸",
          fields: [{
            title : "宽度",
            name  : "width",
            comType : "TiInput",
            comConf : {
              
            }
          }, {
            title : "高度",
            name  : "height",
            comType : "TiInput",
            comConf : {
              
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
    components : []
  })

  // 用户取消
  if(!reo)
    return

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
  name : "wn-youtube",
  //------------------------------------------------
  init : function(conf={}) {
  },
  //------------------------------------------------
  setup : function(editor, url){
    //..............................................
    let settings = _.assign({
        meta : "~"
      }, _.get(editor.settings, "wn_youtube_config"));
    //console.log("setup", editor.settings)
    //..............................................
    // Register plugin command
    editor.addCommand("InsertYoutube",   CmdInsertYoutube)
    editor.addCommand("SetYoutubeSize",  CmdSetYoutubeSize)
    editor.addCommand("SetYoutubeStyle", CmdSetYoutubeStyle)
    editor.addCommand("ShowYoutubeProp", CmdShowYoutubeProp)
    //..............................................
    // Register toolbar actions
    editor.ui.registry.addButton("WnYoutubePick", {
      icon : "youtube-brands",
      tooltip : Ti.I18n.text("i18n:video-insert"),
      onAction : function(menuBtn) {
        pickYoutubeAndInsertToDoc(editor, settings)
      },
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnYoutubeClrSize", {
      text : "清除视频尺寸",
      onAction() {
        editor.execCommand("SetYoutubeSize", editor)
      }
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnYoutubeAutoFitWidth", {
      text : "自动适应宽度",
      onAction() {
        editor.execCommand("SetYoutubeSize", editor, {width:"100%"})
      }
    })
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnYoutubeFloat', {
      text: '文本绕图',
      getSubmenuItems: function () {
        return [{
          type : "menuitem",
          icon : "align-left",
          text : "居左绕图",
          onAction() {
            editor.execCommand("SetYoutubeStyle", editor, {float:"left"})
          }
        }, {
          type : "menuitem",
          icon : "align-right",
          text : "居右绕图",
          onAction() {
            editor.execCommand("SetYoutubeStyle", editor, {float:"right"})
          }
        }, {
          type : "menuitem",
          text : "清除浮动",
          onAction() {
            editor.execCommand("SetYoutubeStyle", editor, {float:""})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnYoutubeMargin', {
      text: '视频边距',
      getSubmenuItems: function () {
        const __check_margin_size = function(api, expectSize) {
          let $video = GetCurrentYoutubeElement(editor)
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
            editor.execCommand("SetYoutubeStyle", editor, {margin:"1em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '1em')
          }
        }, {
          type : "togglemenuitem",
          text : "中等边距",
          onAction() {
            editor.execCommand("SetYoutubeStyle", editor, {margin:"2em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '2em')
          }
        }, {
          type : "togglemenuitem",
          text : "较大边距",
          onAction() {
            editor.execCommand("SetYoutubeStyle", editor, {margin:"3em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '3em')
          }
        }, {
          type : "menuitem",
          text : "清除边距",
          onAction() {
            editor.execCommand("SetYoutubeStyle", editor, {margin:""})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addMenuItem("WnYoutubeProp", {
      text : "视频属性",
      onAction() {
        editor.execCommand("ShowYoutubeProp", editor, settings)
      }
    })
    //..............................................
    editor.ui.registry.addContextMenu("wn-youtube", {
      update: function (el) {
        let $video = GetCurrentYoutubeElement(editor)
        // Guard
        if(!_.isElement($video)) {
          return []
        }
        return [
          "WnYoutubeClrSize WnYoutubeAutoFitWidth",
          "WnYoutubeFloat WnYoutubeMargin",
          "WnYoutubeProp"
        ].join(" | ")
      }
    })
    //..............................................
    editor.on("SetContent", function() {
      //console.log("SetContent youtube")
      let els = editor.$('.wn-media.as-youtube')
      for(let i=0; i<els.length; i++) {
        let el = els[i]
        UpdateYoutubeTagInnerHtml(el)
      }
    })
    //..............................................
    return {
      getMetadata: function () {
        return  {
          name: 'Wn Youtube plugin',
          url: 'http://site0.cn'
        };
      }
    };
    //..............................................
  }
  //------------------------------------------------
}