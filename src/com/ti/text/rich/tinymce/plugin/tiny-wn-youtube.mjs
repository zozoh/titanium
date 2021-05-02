////////////////////////////////////////////////////
async function pickYoutubeAndInsertToDoc(editor, {
  meta = "~"
}) {
  // Check meta
  let oMeta = await Wn.Io.loadMeta(meta)
  if(!oMeta) {
    return await Ti.Toast.Open({
      content : "i18n:e-ph-noexists",
      type : "warn",
      val: meta
    })
  }
  if(oMeta.race != "FILE") {
    return await Ti.Toast.Open({
      content : "i18n:e-obj-invalid",
      type : "warn",
      val: meta
    })
  }
  meta = oMeta

  // 读取信息
  let {domain, channelId} = await Wn.Io.loadContent(meta, {as:"json"})

  // Check base
  let reo = await Ti.App.Open({
    icon  : "fab-youtube",
    title : "i18n:net-youtube-add-video",
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
const DFT_ALLOW = [
  "accelerometer", "autoplay", "clipboard-write",
  "encrypted-media", "gyroscope",
  "picture-in-picture"].join(";")
////////////////////////////////////////////////////
function GetYoutubeAttrsByElement(elYoutube) {
  let style = Ti.Dom.getOwnStyle(elYoutube)
  let af = elYoutube.getAttribute("wn-yt-allowfullscreen")
  let allowfullscreen = af && /^(allowfullscreen|yes|true)$/.test(af)
  let allow = elYoutube.getAttribute("wn-yt-allow") || DFT_ALLOW;
  if(allow) {
    allow = _.map(allow.split(";"), al => _.trim(al))
  }
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
    allow,
    allowfullscreen,
    style
  }
}
////////////////////////////////////////////////////
function GetYoutubeAttrsByObj(ytVideo) {
  let {allow, allowfullscreen} = ytVideo
  allow = allow || []
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
    "wn-yt-allow" : allow.join("; ") || null,
    "wn-yt-allowfullscreen" : allowfullscreen || null
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
  $inner.innerHTML = '<i class="media-font-icon fab fa-youtube"></i>'
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
    title : "i18n:hmk-w-edit-yt-video",
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
      fields : [
        {
          title : "i18n:hmk-w-edit-yt-video-features",
          name  : "allow",
          type  : "Array",
          comType : "TiBulletCheckbox",
          comConf : {
            options : [
              {value: "accelerometer", text: "i18n:video-accelerometer"},
              {value: "autoplay", text: "i18n:video-autoplay"},
              {value: "clipboard-write", text: "i18n:video-clipboard-write"},
              {value: "encrypted-media", text: "i18n:video-encrypted-media"},
              {value: "gyroscope", text: "i18n:video-gyroscope"},
              {value: "picture-in-picture", text: "i18n:video-pic-in-pic"}
            ]
          }
        },
        {
          title : "i18n:allowfullscreen",
          name  : "allowfullscreen",
          type  : "Boolean",
          comType : "TiToggle"
        },
        Wn.Hm.getCssPropField("width", {
          name  : "style.width"
        }),
        Wn.Hm.getCssPropField("height", {
          name  : "style.height"
        }),
        Wn.Hm.getCssPropField("float", {
          name  : "style.float"
        }),
        {
          title : "i18n:style-more",
          name  : "style",
          type  : "Object",
          comType : "HmPropCssRules",
          comConf : {
            rules : [
              /^((min|max)-)?(width|height)$/,
              /^(margin|border|box-shadow|float)$/
            ]
          }
        }]
    },
    components : [
      "@com:ti/droplist",
      "@com:ti/bullet/checkbox"
    ]
  })
  //................................................
  // 用户取消
  if(!reo)
    return
  //................................................
  // 设置属性
  let attrs = GetYoutubeAttrsByObj(reo)
  Ti.Dom.setAttrs($video, attrs)
  //................................................
  // Styling
  let style = Ti.Dom.renderCssRule(reo.style)
  //console.log("style:", style)
  $video.style = style
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
      text : Ti.I18n.text("i18n:hmk-w-edit-video-clrsz"),
      onAction() {
        editor.execCommand("SetVideoStyle", editor, {width:""})
      }
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnYoutubeAutoFitWidth", {
      text : Ti.I18n.text("i18n:hmk-autofit"),
      onAction() {
        editor.execCommand("SetVideoStyle", editor, {width:"100%"})
      }
    })
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnYoutubeFloat', {
      text: Ti.I18n.text('i18n:hmk-float'),
      getSubmenuItems: function () {
        return [{
          type : "menuitem",
          icon : "align-left",
          text : Ti.I18n.text("i18n:hmk-float-left"),
          onAction() {
            editor.execCommand("SetYoutubeStyle", editor, {float:"left"})
          }
        }, {
          type : "menuitem",
          icon : "align-right",
          text : Ti.I18n.text("i18n:hmk-float-right"),
          onAction() {
            editor.execCommand("SetYoutubeStyle", editor, {float:"right"})
          }
        }, {
          type : "menuitem",
          text : Ti.I18n.text("i18n:hmk-float-none"),
          onAction() {
            editor.execCommand("SetYoutubeStyle", editor, {float:""})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnYoutubeMargin', {
      text: Ti.I18n.text('i18n:hmk-w-edit-video-margin'),
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
          text : Ti.I18n.text("i18n:hmk-margin-sm"),
          onAction() {
            editor.execCommand("SetYoutubeStyle", editor, {margin:"1em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '1em')
          }
        }, {
          type : "togglemenuitem",
          text : Ti.I18n.text("i18n:hmk-margin-md"),
          onAction() {
            editor.execCommand("SetYoutubeStyle", editor, {margin:"2em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '2em')
          }
        }, {
          type : "togglemenuitem",
          text : Ti.I18n.text("i18n:hmk-margin-lg"),
          onAction() {
            editor.execCommand("SetYoutubeStyle", editor, {margin:"3em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '3em')
          }
        }, {
          type : "menuitem",
          icon : "align-center",
          text : Ti.I18n.text("i18n:hmk-margin-center"),
          onAction() {
            editor.execCommand("SetYoutubeStyle", editor, {margin:"0 auto"})
          }
        }, {
          type : "menuitem",
          icon : "square-6",
          text : Ti.I18n.text("i18n:hmk-margin-no"),
          onAction() {
            editor.execCommand("SetYoutubeStyle", editor, {margin:""})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addMenuItem("WnYoutubeProp", {
      text : Ti.I18n.text("i18n:hmk-w-edit-video-prop"),
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