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
      attrs : {
        src : `/o/content?str=id:${oImg.id}`,
        "wn-obj-id" : oImg.id,
        "wn-obj-sha1" : oImg.sha1,
        "wn-obj-mime" : oImg.mime,
        "wn-obj-tp"   : oImg.tp
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
function CmdClearImageSize(editor) {
  let sel = editor.selection
  let $img = sel.getNode()
  // Guard
  if("IMG" != $img.tagName) {
    return
  }
  // Clear the attribute
  $img.removeAttribute("width")
  $img.removeAttribute("height")
}
////////////////////////////////////////////////////
function CmdFloatImage(editor, float) {
  let sel = editor.selection
  let $img = sel.getNode()
  // Guard
  if("IMG" != $img.tagName) {
    return
  }
  // Clear float
  $img.style.float = float || ""
}
////////////////////////////////////////////////////
async function CmdShowImageProp(editor, settings) {
  let sel = editor.selection
  let $img = sel.getNode()
  // Guard
  if("IMG" != $img.tagName) {
    return
  }
  // Get margin style
  let stl = Ti.Dom.getStyle($img, /^(float|(margin-(left|right|top|bottom)))$/)
  stl.float = stl.float || "none"
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
    title : "编辑图片属性",
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
          title : "图片",
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
              placeholder: `${data.displayWidth}/${data.naturalWidth}px`
            }
          }, {
            title : "高度",
            name  : "height",
            comType : "TiInput",
            comConf : {
              placeholder: `${data.displayHeight}/${data.naturalHeight}px`
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
          title : "图片边距",
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
    let {extended_valid_elements} = conf 

    conf.extended_valid_elements = _.concat(
      extended_valid_elements, 
      'img[wn-obj-*|src|width|height|style]'
    ).join(",")
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
    editor.addCommand("InsertImage",    CmdInsertImage)
    editor.addCommand("ClearImageSize", CmdClearImageSize)
    editor.addCommand("FloatImage",     CmdFloatImage)
    editor.addCommand("ShowImageProp",  CmdShowImageProp)
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
      text : "清除图片尺寸",
      onAction() {
        editor.execCommand("ClearImageSize", editor)
      }
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnImgFloatLeft", {
      icon : "align-left",
      text : "居左绕图",
      onAction() {
        editor.execCommand("FloatImage", editor, "left")
      }
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnImgFloatRight", {
      icon : "align-right",
      text : "居右绕图",
      onAction() {
        editor.execCommand("FloatImage", editor, "right")
      }
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnImgFloatNone", {
      text : "清除浮动",
      onAction() {
        editor.execCommand("FloatImage", editor, null)
      }
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnImgProp", {
      text : "图片属性",
      onAction() {
        editor.execCommand("ShowImageProp", editor, settings)
      }
    })
    //..............................................
    editor.ui.registry.addContextMenu("wn-image", {
      update: function (el) {
        let sel = editor.selection
        let $nd = sel.getNode()
        if($nd.hasAttribute("wn-obj-id") && "IMG" == $nd.tagName) {
          return [
            "WnImgClrSize",
            "WnImgFloatLeft WnImgFloatCenter WnImgFloatRight WnImgFloatNone",
            "WnImgProp"
          ].join(" | ")
        }
        return []
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