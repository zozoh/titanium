////////////////////////////////////////////////////
async function pickImageAndInsertToDoc(editor, {
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
    title : "i18n:img-insert",
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
  editor.execCommand("InsertImage", editor, reo)
}
////////////////////////////////////////////////////
function CmdInsertImage(editor, oImgs) {
  if(_.isEmpty(oImgs))
    return
  
  // Prepare range
  let rng = editor.selection.getRng()
  
  // Create image fragments
  let $doc = rng.commonAncestorContainer.ownerDocument
  let frag = new DocumentFragment()
  for(let oImg of oImgs) {
    let $img = Ti.Dom.createElement({
      tagName : "img",
      className : "wn-media as-image",
      attrs : {
        src : `/o/content?str=id:${oImg.id}`,
        "wn-obj-id" : oImg.id,
        "wn-obj-sha1" : oImg.sha1,
        "wn-obj-mime" : oImg.mime,
        "wn-obj-tp"   : oImg.tp,
        "wn-obj-width" : oImg.width,
        "wn-obj-height" : oImg.height
      }
    }, $doc)
    frag.appendChild($img)
  }
  
  // Remove content
  if(!rng.collapsed) {
    rng.deleteContents()
  }

  // Insert fragments
  rng.insertNode(frag)

}
////////////////////////////////////////////////////
function GetCurrentImageElement(editor) {
  let sel = editor.selection
  let $img = sel.getNode()
  // Guard
  if("IMG" != $img.tagName) {
    return
  }
  return $img
}
////////////////////////////////////////////////////
function CmdSetImageSize(editor, {width=null, height=null}={}) {
  let $img = GetCurrentImageElement(editor)
  // Guard
  if(!_.isElement($img)) {
    return
  }
  // Clear the attribute
  Ti.Dom.setAttrs($img, {width, height})
  // Force sync content
  editor.__rich_tinymce_com.syncContent()
}
////////////////////////////////////////////////////
function CmdSetImageStyle(editor, css={}) {
  let $img = GetCurrentImageElement(editor)
  // Guard
  if(!_.isElement($img)) {
    return
  }
  // Clear float
  Ti.Dom.updateStyle($img, css)
  // Force sync content
  editor.__rich_tinymce_com.syncContent()
}
////////////////////////////////////////////////////
async function CmdShowImageProp(editor, settings) {
  let $img = GetCurrentImageElement(editor)
  // Guard
  if(!_.isElement($img)) {
    return
  }
  // Get margin style
  let stl = Ti.Dom.getStyle($img, /^(float|(margin-(left|right|top|bottom)))$/)
  stl.float = stl.float || "none"
  //console.log("stl", stl)
  // Gen the properties
  let data = {
    oid    : $img.getAttribute("wn-obj-id"),
    src    : $img.getAttribute("src"),
    width  : $img.getAttribute("width")  || undefined,
    height : $img.getAttribute("height") || undefined,
    displayWidth  : $img.width,
    displayHeight : $img.height,
    naturalWidth  : $img.naturalWidth,
    naturalHeight : $img.naturalHeight,
    ... stl
  }

  //console.log(data)
  // Show dialog
  let reo = await Ti.App.Open({
    icon  : "fas-image",
    title : "i18n:hmk-w-edit-img-prop",
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
        title : "i18n:hmk-w-edit-img-pic",
          name  : "oid",
          comType : "WnObjPicker",
          comConf : {
            valueType : "id",
            base : settings.base,
            titleEditable : false
          }
        }, {
          title : "i18n:hmk-size",
          fields: [{
            title : "i18n:width",
            name  : "width",
            comType : "TiInput",
            comConf : {
              placeholder: `${data.displayWidth}/${data.naturalWidth}px`
            }
          }, {
            title : "i18n:height",
            name  : "height",
            comType : "TiInput",
            comConf : {
              placeholder: `${data.displayHeight}/${data.naturalHeight}px`
            }
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
              }
            ]
          }
        }, {
          title : "i18n:hmk-w-edit-img-margin",
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
    // Remove Image
    if(!reo.oid) {
      Ti.Dom.remove($img)
      return
    }
    // 读取对象详情
    let oImg = await Wn.Io.loadMetaById(reo.oid)
    // Switch image src
    $img.src = `/o/content?str=id:${reo.oid}`
    $img.setAttribute("wn-obj-id", oImg.id)
    $img.setAttribute("wn-obj-sha1", oImg.sha1)
    $img.setAttribute("wn-obj-mime", oImg.mime)
    $img.setAttribute("wn-obj-tp", oImg.tp)
  }
  //................................................
  // Measure
  const _img_size = function(attrName, sz, oldSize) {
    if(oldSize == sz)
      return
    if(!sz) {
      $img.removeAttribute(attrName)
    } else {
      $img.setAttribute(attrName, sz)
    }
  }
  //................................................
  // Width/height
  _img_size("width",  reo.width,  data.width)
  _img_size("height", reo.height, data.height)
  //................................................
  // Styling
  const _img_style = function(styName, v, oldValue) {
    if(oldValue == v)
      return
    if(!v || "none" == v) {
      $img.style[styName] = ""
    } else if(_.isNumber(v)) {
      $img.style[styName] = `${v}px`
    } else {
      $img.style[styName] = v
    }
  }
  //................................................
  _img_style("float", reo.float, data.float)
  _img_style("marginLeft",   reo.marginLeft,   data.marginLeft)
  _img_style("marginRight",  reo.marginRight,  data.marginRight)
  _img_style("marginTop",    reo.marginTop,    data.marginTop)
  _img_style("marginBottom", reo.marginBottom, data.marginBottom)
  //................................................
  // clean cache
  $img.removeAttribute("data-mce-src")
  $img.removeAttribute("data-mce-style")
  //................................................
  // Force sync content
  editor.__rich_tinymce_com.syncContent()
}
////////////////////////////////////////////////////
export default {
  name : "wn-image",
  //------------------------------------------------
  init : function(conf={}) {
  },
  //------------------------------------------------
  setup : function(editor, url){
    //..............................................
    let settings = _.assign({
        base : "~"
      }, _.get(editor.settings, "wn_image_config"));
    //console.log("setup", editor.settings)
    //..............................................
    // Register plugin command
    editor.addCommand("InsertImage",   CmdInsertImage)
    editor.addCommand("SetImageSize",  CmdSetImageSize)
    editor.addCommand("SetImageStyle", CmdSetImageStyle)
    editor.addCommand("ShowImageProp", CmdShowImageProp)
    //..............................................
    // Register toolbar actions
    editor.ui.registry.addButton("WnImgPick", {
      icon : "image",
      tooltip : Ti.I18n.text("i18n:img-insert"),
      onAction : function(menuBtn) {
        pickImageAndInsertToDoc(editor, settings)
      },
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnImgClrSize", {
      icon : "edit-image",
      text : Ti.I18n.text("i18n:hmk-w-edit-img-clrsz"),
      onAction() {
        editor.execCommand("SetImageSize", editor)
      }
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnImgAutoFitWidth", {
      text : Ti.I18n.text("i18n:hmk-autofit"),
      onAction() {
        editor.execCommand("SetImageSize", editor, {width:"100%"})
      }
    })
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnImgFloat', {
      text: 'i18n:hmk-float',
      getSubmenuItems: function () {
        return [{
          type : "menuitem",
          icon : "align-left",
          text : Ti.I18n.text("i18n:hmk-float-left"),
          onAction() {
            editor.execCommand("SetImageStyle", editor, {float:"left"})
          }
        }, {
          type : "menuitem",
          icon : "align-right",
          text : Ti.I18n.text("i18n:hmk-float-right"),
          onAction() {
            editor.execCommand("SetImageStyle", editor, {float:"right"})
          }
        }, {
          type : "menuitem",
          text : Ti.I18n.text("i18n:hmk-float-clear"),
          onAction() {
            editor.execCommand("SetImageStyle", editor, {float:""})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnImgMargin', {
      text : Ti.I18n.text("i18n:hmk-w-edit-img-margin"),
      getSubmenuItems: function () {
        const __check_margin_size = function(api, expectSize) {
          let $img = GetCurrentImageElement(editor)
          let state = true
          if($img) {
            let sz = $img.style.marginLeft || $img.style.marginRight
            state = expectSize == sz
          }
          api.setActive(state);
          return function() {};
        }
        return [{
          type : "togglemenuitem",
          text : Ti.I18n.text("i18n:hmk-margin-sm"),
          onAction() {
            editor.execCommand("SetImageStyle", editor, {margin:"1em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '1em')
          }
        }, {
          type : "togglemenuitem",
          text : Ti.I18n.text("i18n:hmk-margin-md"),
          onAction() {
            editor.execCommand("SetImageStyle", editor, {margin:"2em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '2em')
          }
        }, {
          type : "togglemenuitem",
          text : Ti.I18n.text("i18n:hmk-margin-lg"),
          onAction() {
            editor.execCommand("SetImageStyle", editor, {margin:"3em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '3em')
          }
        }, {
          type : "menuitem",
          text : Ti.I18n.text("i18n:hmk-margin-no"),
          onAction() {
            editor.execCommand("SetImageStyle", editor, {margin:""})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addMenuItem("WnImgProp", {
      text : Ti.I18n.text("i18n:hmk-w-edit-img-prop"),
      onAction() {
        editor.execCommand("ShowImageProp", editor, settings)
      }
    })
    //..............................................
    editor.ui.registry.addContextMenu("wn-image", {
      update: function (el) {
        let sel = editor.selection
        let $nd = sel.getNode()
        if($nd.hasAttribute("wn-obj-id")
          && "IMG" == $nd.tagName
          && Ti.Dom.hasClass($nd, "wn-media", "as-image")) {
          return [
            "WnImgClrSize WnImgAutoFitWidth",
            "WnImgFloat WnImgMargin",
            "WnImgProp"
          ].join(" | ")
        }
        return []
      }
    })
    //..............................................
    let $vm = editor.__rich_tinymce_com
    $vm.registerContentCallback("wn-image", function() {
      //console.log("SetContent image")
      let els = editor.$('img[wn-obj-mime]')
      for(let i=0; i<els.length; i++) {
        let el = els[i]
        let mime = el.getAttribute("wn-obj-mime")
        if(/^image\//.test(mime) && !Ti.Dom.hasClass(el, "wn-media", "as-image")) {
          Ti.Dom.addClass(el, "wn-media", "as-image")
        }
      }
    })
    //..............................................
    return {
      getMetadata: function () {
        return  {
          name: 'Wn Image plugin',
          url: 'http://site0.cn'
        };
      }
    };
    //..............................................
  }
  //------------------------------------------------
}