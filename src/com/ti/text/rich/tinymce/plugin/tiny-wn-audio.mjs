////////////////////////////////////////////////////
async function pickAudioAndInsertToDoc(editor, {
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
    icon  : "fas-file-audio",
    title : "i18n:audio-insert",
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
  editor.execCommand("InsertAudio", editor, reo)
}
////////////////////////////////////////////////////
function GetAudioAttrsByElement(elAudio) {
  let stl = Ti.Dom.getStyle(elAudio, 
    /^(width|height|float|(margin-(left|right|top|bottom)))$/)
  stl.float = stl.float || "none"
  return {
    oid   : elAudio.getAttribute("wn-obj-id"),
    sha1  : elAudio.getAttribute("wn-obj-sha1"),
    mime  : elAudio.getAttribute("wn-obj-mime"),
    tp    : elAudio.getAttribute("wn-obj-tp"),
    duration : elAudio.getAttribute("wn-obj-duration"),
    ... stl
  }
}
////////////////////////////////////////////////////
function GetAudioAttrsByObj(oAudio) {
  return {
    "wn-obj-id" : oAudio.id,
    "wn-obj-sha1" : oAudio.sha1,
    "wn-obj-mime" : oAudio.mime,
    "wn-obj-tp"   : oAudio.tp,
    "wn-obj-duration" : oAudio.duration
  }
}
////////////////////////////////////////////////////
function UpdateAudioTagInnerHtml(elAudio) {
  let cover = elAudio.getAttribute("wn-obj-audio_cover")
  if(!cover) {
    cover = elAudio.getAttribute("wn-obj-thumb")
  }
  if(cover && !cover.startsWith("id:")) {
    cover = "id:" + cover
  }
  let $inner = Ti.Dom.createElement({
    tagName : "div",
    className : "media-inner"
  })
  $inner.innerHTML = '<i class="fas fa-volume-up"></i>'
  elAudio.innerHTML = null
  elAudio.contentEditable = false
  Ti.Dom.appendTo($inner, elAudio)
}
////////////////////////////////////////////////////
function CmdInsertAudio(editor, oAudios) {
  if(_.isEmpty(oAudios))
    return
  
  // Prepare range
  let rng = editor.selection.getRng()
  
  // Create image fragments
  let $doc = rng.commonAncestorContainer.ownerDocument
  let frag = new DocumentFragment()
  for(let oAudio of oAudios) {
    let $audio = Ti.Dom.createElement({
      tagName : "div",
      className : "wn-media as-audio",
      attrs : GetAudioAttrsByObj(oAudio)
    }, $doc)
    UpdateAudioTagInnerHtml($audio)
    frag.appendChild($audio)
  }
  
  // Remove content
  if(!rng.collapsed) {
    rng.deleteContents()
  }

  // Insert fragments
  rng.insertNode(frag)

}
////////////////////////////////////////////////////
function GetCurrentAudioElement(editor) {
  let sel = editor.selection
  let $nd = sel.getNode()
  // Guard
  return Ti.Dom.closest($nd, (el)=>{
    return 'DIV' == el.tagName && Ti.Dom.hasClass(el, "wn-media", "as-audio")
  })
}
////////////////////////////////////////////////////
function CmdSetAudioSize(editor, {width="", height=""}={}) {
  let $audio = GetCurrentAudioElement(editor)
  // Guard
  if(!_.isElement($audio)) {
    return
  }
  // Clear the attribute
  Ti.Dom.setStyle($audio, {width, height})
  // Force sync content
  editor.__rich_tinymce_com.syncContent()
}
////////////////////////////////////////////////////
function CmdSetAudioStyle(editor, css={}) {
  let $audio = GetCurrentAudioElement(editor)
  // Guard
  if(!_.isElement($audio)) {
    return
  }
  // Clear float
  Ti.Dom.setStyle($audio, css)
  // Force sync content
  editor.__rich_tinymce_com.syncContent()
}
////////////////////////////////////////////////////
async function CmdShowAudioProp(editor, settings) {
  let $audio = GetCurrentAudioElement(editor)
  // Guard
  if(!_.isElement($audio)) {
    return
  }
  //console.log("stl", stl)
  // Gen the properties
  let data = GetAudioAttrsByElement($audio)

  //console.log(data)
  // Show dialog
  let reo = await Ti.App.Open({
    icon  : "fas-image",
    title : "编辑音频属性",
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
          title : "音频",
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
            comType : "TiInput"
          }, {
            title : "高度",
            name  : "height",
            comType : "TiInput"
          }]
        }, {
          title : "文本绕图",
          name  : "float",
          comType : "TiSwitcher",
          comConf : {
            allowEmpty : false,
            options : [
              {value: "none",  text: "不绕图", icon:"fas-align-justify"},
              {value: "left",  text: "左绕图", icon:"fas-align-left"},
              {value: "right", text: "右绕图", icon:"fas-align-right"},]
          }
        }, {
          title : "音频距",
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
    // Remove Audio
    if(!reo.oid) {
      Ti.Dom.remove($audio)
      return
    }
    // 读取对象详情
    let oAudio = await Wn.Io.loadMetaById(reo.oid)
    // Switch image src
    let attrs = GetAudioAttrsByObj(oAudio)
    Ti.Dom.setAttrs($audio, attrs)

    UpdateAudioTagInnerHtml($audio)
    
  }
  //................................................
  // Styling
  const _audio_style = function(styName, v, oldValue) {
    if(oldValue == v)
      return
    if(!v || "none" == v) {
      $audio.style[styName] = ""
    } else if(_.isNumber(v) || /^\d+(\.\d+)?$/.test(v)) {
      $audio.style[styName] = `${v}px`
    } else {
      $audio.style[styName] = v
    }
  }
  //................................................
  _audio_style("width", reo.width, data.width)
  _audio_style("height", reo.height, data.height)
  _audio_style("float", reo.float, data.float)
  _audio_style("marginLeft",   reo.marginLeft,   data.marginLeft)
  _audio_style("marginRight",  reo.marginRight,  data.marginRight)
  _audio_style("marginTop",    reo.marginTop,    data.marginTop)
  _audio_style("marginBottom", reo.marginBottom, data.marginBottom)
  //................................................
  // clean cache
  $audio.removeAttribute("data-mce-src")
  $audio.removeAttribute("data-mce-style")
  //................................................
  // Force sync content
  editor.__rich_tinymce_com.syncContent()
}
////////////////////////////////////////////////////
export default {
  name : "wn-audio",
  //------------------------------------------------
  init : function(conf={}) {
  },
  //------------------------------------------------
  setup : function(editor, url){
    //..............................................
    let settings = _.assign({
        base : "~"
      }, _.get(editor.settings, "wn_audio_config"));
    //console.log("setup", editor.settings)
    //..............................................
    // Register plugin command
    editor.addCommand("InsertAudio",   CmdInsertAudio)
    editor.addCommand("SetAudioSize",  CmdSetAudioSize)
    editor.addCommand("SetAudioStyle", CmdSetAudioStyle)
    editor.addCommand("ShowAudioProp", CmdShowAudioProp)
    //..............................................
    // Register toolbar actions
    editor.ui.registry.addButton("WnAudioPick", {
      icon : "music-solid",
      tooltip : Ti.I18n.text("i18n:audio-insert"),
      onAction : function(menuBtn) {
        pickAudioAndInsertToDoc(editor, settings)
      },
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnAudioClrSize", {
      text : "清除音频尺寸",
      onAction() {
        editor.execCommand("SetAudioSize", editor)
      }
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnAudioAutoFitWidth", {
      text : "自动适应宽度",
      onAction() {
        editor.execCommand("SetAudioSize", editor, {width:"100%"})
      }
    })
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnAudioFloat', {
      text: '文本绕图',
      getSubmenuItems: function () {
        return [{
          type : "menuitem",
          icon : "align-left",
          text : "居左绕图",
          onAction() {
            editor.execCommand("SetAudioStyle", editor, {float:"left"})
          }
        }, {
          type : "menuitem",
          icon : "align-right",
          text : "居右绕图",
          onAction() {
            editor.execCommand("SetAudioStyle", editor, {float:"right"})
          }
        }, {
          type : "menuitem",
          text : "清除浮动",
          onAction() {
            editor.execCommand("SetAudioStyle", editor, {float:""})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnAudioMargin', {
      text: '音频边距',
      getSubmenuItems: function () {
        const __check_margin_size = function(api, expectSize) {
          let $audio = GetCurrentAudioElement(editor)
          let state = true
          if($audio) {
            let sz = $audio.style.marginLeft || $audio.style.marginRight
            state = expectSize == sz
          }
          api.setActive(state);
          return function() {};
        }
        return [{
          type : "togglemenuitem",
          text : "小边距",
          onAction() {
            editor.execCommand("SetAudioStyle", editor, {margin:"1em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '1em')
          }
        }, {
          type : "togglemenuitem",
          text : "中等边距",
          onAction() {
            editor.execCommand("SetAudioStyle", editor, {margin:"2em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '2em')
          }
        }, {
          type : "togglemenuitem",
          text : "较大边距",
          onAction() {
            editor.execCommand("SetAudioStyle", editor, {margin:"3em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '3em')
          }
        }, {
          type : "menuitem",
          text : "清除边距",
          onAction() {
            editor.execCommand("SetAudioStyle", editor, {margin:""})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addMenuItem("WnAudioProp", {
      text : "音频属性",
      onAction() {
        editor.execCommand("ShowAudioProp", editor, settings)
      }
    })
    //..............................................
    editor.ui.registry.addContextMenu("wn-audio", {
      update: function (el) {
        let $audio = GetCurrentAudioElement(editor)
        // Guard
        if(!_.isElement($audio)) {
          return []
        }
        return [
          "WnAudioClrSize WnAudioAutoFitWidth",
          "WnAudioFloat WnAudioMargin",
          "WnAudioProp"
        ].join(" | ")
      }
    })
    //..............................................
    editor.on("SetContent", function() {
      //console.log("SetContent audio")
      let els = editor.$('.wn-media.as-audio')
      for(let i=0; i<els.length; i++) {
        let el = els[i]
        let mime = el.getAttribute("wn-obj-mime")
        UpdateAudioTagInnerHtml(el)
      }
    })
    //..............................................
    return {
      getMetadata: function () {
        return  {
          name: 'Wn Audio plugin',
          url: 'http://site0.cn'
        };
      }
    };
    //..............................................
  }
  //------------------------------------------------
}