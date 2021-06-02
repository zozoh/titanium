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
    nm    : elAudio.getAttribute("wn-obj-nm"),
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
    "wn-obj-nm" : oAudio.nm,
    "wn-obj-mime" : oAudio.mime,
    "wn-obj-tp"   : oAudio.tp,
    "wn-obj-duration" : oAudio.duration
  }
}
////////////////////////////////////////////////////
function UpdateAudioTagInnerHtml(elAudio) {
  let audioName = elAudio.getAttribute("wn-obj-nm") || "No title"
  let $inner = Ti.Dom.createElement({
    tagName : "div",
    className : "audio-inner"
  })
  $inner.innerHTML = `
    <div class="as-play-icon"><i class="fas fa-play"></i></div>
    <div class="as-audio-name"></div>
    <div class="as-volume-icon"><i class="fas fa-volume-up"></i></div>
  `
  elAudio.innerHTML = null
  Ti.Dom.find(".as-audio-name", $inner).innerText = audioName
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
    title : "i18n:hmk-w-edit-audio-prop",
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
          title : "i18n:audio",
          name  : "oid",
          comType : "WnObjPicker",
          comConf : {
            valueType : "id",
            base : settings.base,
            titleEditable : false
          }
        }, {
          title : "i18n:size",
          fields: [{
            title : "i18n:width",
            name  : "width",
            comType : "TiInput"
          }, {
            title : "i18n:height",
            name  : "height",
            comType : "TiInput"
          }]
        }, {
          title : "i18n:hmk-float",
          name  : "float",
          comType : "TiSwitcher",
          comConf : {
            allowEmpty : false,
            options : [
              {
                icon:"fas-align-justify",
                value: "none",
                text: "i18n:hmk-float-none"
              },
              {
                icon:"fas-align-left",
                value: "left",
                text: "i18n:hmk-float-left"
              },
              {
                icon:"fas-align-right",
                value: "right",
                text: "i18n:hmk-float-right"
              }]
          }
        }, {
          title : "i18n:hmk-w-edit-audio-margin",
          fields : [{
              title : "i18n:top",
              name  : "marginTop",
              comType : "TiInput",
              comConf : {
                placeholder : "0px"
              }
            }, {
              title : "i18n:right",
              name  : "marginRight",
              comType : "TiInput",
              comConf : {
                placeholder : "0px"
              }
            }, {
              title : "i18n:bottom",
              name  : "marginBottom",
              comType : "TiInput",
              comConf : {
                placeholder : "0px"
              }
            }, {
              title : "i18n:left",
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
      icon : "volume-up-solid",
      tooltip : Ti.I18n.text("i18n:audio-insert"),
      onAction : function(menuBtn) {
        pickAudioAndInsertToDoc(editor, settings)
      },
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnAudioClrSize", {
      text : Ti.I18n.text("i18n:hmk-w-edit-audio-clrsz"),
      onAction() {
        editor.execCommand("SetAudioSize", editor)
      }
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnAudioAutoFitWidth", {
      text : Ti.I18n.text("i18n:hmk-autofit"),
      onAction() {
        editor.execCommand("SetAudioSize", editor, {width:"100%"})
      }
    })
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnAudioFloat', {
      text: 'i18n:hmk-float',
      getSubmenuItems: function () {
        return [{
          type : "menuitem",
          icon : "align-left",
          text : Ti.I18n.text("i18n:hmk-float-left"),
          onAction() {
            editor.execCommand("SetAudioStyle", editor, {float:"left"})
          }
        }, {
          type : "menuitem",
          icon : "align-right",
          text : Ti.I18n.text("i18n:hmk-float-right"),
          onAction() {
            editor.execCommand("SetAudioStyle", editor, {float:"right"})
          }
        }, {
          type : "menuitem",
          text : Ti.I18n.text("i18n:hmk-float-clear"),
          onAction() {
            editor.execCommand("SetAudioStyle", editor, {float:""})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnAudioMargin', {
      text : Ti.I18n.text("i18n:hmk-w-edit-audio-margin"),
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
          text : Ti.I18n.text("i18n:hmk-margin-sm"),
          onAction() {
            editor.execCommand("SetAudioStyle", editor, {margin:"1em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '1em')
          }
        }, {
          type : "togglemenuitem",
          text : Ti.I18n.text("i18n:hmk-margin-md"),
          onAction() {
            editor.execCommand("SetAudioStyle", editor, {margin:"2em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '2em')
          }
        }, {
          type : "togglemenuitem",
          text : Ti.I18n.text("i18n:hmk-margin-lg"),
          onAction() {
            editor.execCommand("SetAudioStyle", editor, {margin:"3em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '3em')
          }
        }, {
          type : "menuitem",
          text : Ti.I18n.text("i18n:hmk-margin-no"),
          onAction() {
            editor.execCommand("SetAudioStyle", editor, {margin:""})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addMenuItem("WnAudioProp", {
      text : Ti.I18n.text("i18n:hmk-w-edit-audio-prop"),
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
    let $vm = editor.__rich_tinymce_com
    $vm.registerContentCallback("wn-audio", function() {
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