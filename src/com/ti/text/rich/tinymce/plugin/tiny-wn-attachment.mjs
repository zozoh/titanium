////////////////////////////////////////////////////
async function pickAttachmentAndInsertToDoc(editor, {
  base = "~", 
  autoCreate=null, 
  sideItems, sideWidth,
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
    icon  : "fas-paperclip",
    title : "i18n:attachment-insert",
    position : "top",
    width  : "95%",
    height : "95%",
    multi : false,
    sideItems, sideWidth,
    fallbackPath
  })

  // User canceled
  if(_.isEmpty(reo)) {
    return
  }

  // Do insert image
  editor.execCommand("InsertAttachment", editor, reo)
}
////////////////////////////////////////////////////
function GetAttachmentAttrsByElement(elAttachment) {
  let stl = Ti.Dom.getStyle(elAttachment, 
    /^(font-(size|bold)|text-transform)$/)
  return {
    oid   : elAttachment.getAttribute("wn-obj-id"),
    nm    : elAttachment.getAttribute("wn-obj-nm"),
    title : elAttachment.getAttribute("wn-obj-title"),
    sha1  : elAttachment.getAttribute("wn-obj-sha1"),
    mime  : elAttachment.getAttribute("wn-obj-mime"),
    tp    : elAttachment.getAttribute("wn-obj-tp"),
    icon  : elAttachment.getAttribute("wn-obj-icon"),
    ... stl
  }
}
////////////////////////////////////////////////////
function GetAttachmentAttrsByObj(oAttachment) {
  return {
    "wn-obj-id"    : oAttachment.id,
    "wn-obj-nm"    : oAttachment.nm,
    "wn-obj-title" : oAttachment.title,
    "wn-obj-sha1"  : oAttachment.sha1,
    "wn-obj-mime"  : oAttachment.mime,
    "wn-obj-tp"    : oAttachment.tp,
    "wn-obj-icon"  : oAttachment.icon
  }
}
////////////////////////////////////////////////////
function UpdateAttachmentTagInnerHtml(elAttachment) {
  let obj = GetAttachmentAttrsByElement(elAttachment)
  let icon = Ti.Icons.get(obj, "fas-paperclip")
  // console.log(obj, icon)
  let iconHtml = Ti.Icons.fontIconHtml(icon, `<i class="fas fa-paperclip"></i>`)
  let html = `<span class="as-icon">${iconHtml}</span>`
  if(obj.title) {
    html += `<span class="as-title">${obj.title}</span>`
  }
  let $inner = Ti.Dom.createElement({
    tagName : "span",
    className : "attachment-inner"
  })
  $inner.innerHTML = html
  elAttachment.innerHTML = null
  elAttachment.contentEditable = false
  Ti.Dom.appendTo($inner, elAttachment)
}
////////////////////////////////////////////////////
function CmdInsertAttachment(editor, oAttachments) {
  if(_.isEmpty(oAttachments))
    return
  
  // Prepare range
  let rng = editor.selection.getRng()
  
  // Create image fragments
  let $doc = rng.commonAncestorContainer.ownerDocument
  let frag = new DocumentFragment()
  for(let oAttachment of oAttachments) {
    let attrs = GetAttachmentAttrsByObj(oAttachment)
    if(!attrs['wn-obj-title']) {
      attrs['wn-obj-title'] = oAttachment.nm
    }
    let $attachment = Ti.Dom.createElement({
      tagName : "span",
      className : "wn-attachment",
      attrs
    }, $doc)
    UpdateAttachmentTagInnerHtml($attachment)
    frag.appendChild($attachment)
  }
  
  // Remove content
  if(!rng.collapsed) {
    rng.deleteContents()
  }

  // Insert fragments
  rng.insertNode(frag)

}
////////////////////////////////////////////////////
function GetCurrentAttachmentElement(editor) {
  let sel = editor.selection
  let $nd = sel.getNode()
  // Guard
  return Ti.Dom.closest($nd, (el)=>{
    return 'SPAN' == el.tagName && Ti.Dom.hasClass(el, "wn-attachment")
  })
}
////////////////////////////////////////////////////
function CmdSetAttachmentAttrs(editor, attrs={}) {
  let $attachment = GetCurrentAttachmentElement(editor)
  // Guard
  if(!_.isElement($attachment)) {
    return
  }
  // Update the attribute
  Ti.Dom.setAttrs($attachment, attrs)
  // Force sync content
  editor.__rich_tinymce_com.syncContent()
}
////////////////////////////////////////////////////
function CmdSetAttachmentStyle(editor, css={}) {
  let $attachment = GetCurrentAttachmentElement(editor)
  // Guard
  if(!_.isElement($attachment)) {
    return
  }
  // Clear float
  Ti.Dom.setStyle($attachment, css)
  // Force sync content
  editor.__rich_tinymce_com.syncContent()
}
////////////////////////////////////////////////////
async function CmdShowAttachmentProp(editor, settings) {
  let $attachment = GetCurrentAttachmentElement(editor)
  // Guard
  if(!_.isElement($attachment)) {
    return
  }
  //console.log("stl", stl)
  // Gen the properties
  let data = GetAttachmentAttrsByElement($attachment)
  console.log(data)

  // Show dialog
  let reo = await Ti.App.Open({
    icon  : "fas-paperclip",
    title : "i18n:hmk-w-edit-attachment-prop",
    width  : "37%",
    height : "100%",
    position : "right",
    closer : "left",
    clickMaskToClose : true,
    result : data,
    model : {prop:"data", event:"change"},
    comType : "TiForm",
    comConf : {
      linkFields : {
        "oid" : async ({name, value})=>{
          if(!value)
            return
          let obj = await Wn.Io.loadMetaById(value)
          let re = _.pick(obj, "nm", "title", "icon")
          re.title = re.title || re.nm
          return re
        }
      },
      spacing : "tiny",
      fields : [{
          title : "i18n:attachments",
          name  : "oid",
          comType : "WnObjPicker",
          comConf : {
            valueType : "id",
            base : settings.base,
            titleEditable : false
          }
        }, {
          title : "i18n:style",
          fields: [{
            title : "i18n:font-size",
            name  : "fontSize",
            comType : "TiInput",
            comConf : {
              placeholder: `Such as: .16rem`
            }
          }, {
            title : "i18n:font-weight",
            name  : "fontWeight",
            comType : "TiSwitcher",
            comConf : {
              options : [
                {value: "inherit", text: "i18n:inherit"},
                {value: "normal",  text: "i18n:font-w-normal"},
                {value: "bold",    text: "i18n:font-w-bold"}
              ]
            }
          }, {
            title : "i18n:font-transform",
            name  : "textTransform",
            comType : "TiSwitcher",
            comConf : {
              options : [
                {value: "inherit",    text: "i18n:inherit"},
                {value: "capitalize", text: "i18n:font-t-capitalize"},
                {value: "uppercase",  text: "i18n:font-t-uppercase"},
                {value: "lowercase",  text: "i18n:font-t-lowercase"}
              ]
            }
          }]
        }, {
          title : "i18n:content-setup",
          fields : [{
            title : "i18n:icon",
            name  : "icon",
            comType : "TiInputIcon",
            comConf : {
              options : [
                "fas-paperclip",
                "fas-volume-up",
                "fas-film",
                "fas-file-word",
                "fas-file-video",
                "fas-file-powerpoint",
                "fas-file-pdf",
                "fas-file-image",
                "fas-file-excel",
                "fas-file-code",
                "fas-file-audio",
                "fas-file-archive",
                "fas-file-alt",
                "fas-file",
                "fas-file-upload",
                "fas-file-signature",
                "fas-file-prescription",
                "fas-file-medical-alt",
                "fas-file-medical",
                "fas-file-invoice-dollar",
                "fas-file-invoice",
                "fas-file-import",
                "fas-file-export",
                "fas-file-download",
                "fas-file-csv",
                "fas-file-contract"
              ]
            }
          }, {
            title : "i18n:title",
            name  : "title",
            comType : "TiInput"
          }, {
            title : "i18n:name",
            name  : "nm"
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
  let attrs = {}
  if(data.oid != reo.oid) {
    // Remove Attachment
    if(!reo.oid) {
      Ti.Dom.remove($attachment)
      return
    }
    // 读取对象详情
    let oAttachment = await Wn.Io.loadMetaById(reo.oid)
    // Switch image src
    attrs = GetAttachmentAttrsByObj(oAttachment)
    Ti.Dom.setAttrs($attachment, attrs)
  }
  // Attributes
  else {
    attrs = GetAttachmentAttrsByObj(reo)
  }
  Ti.Dom.setAttrs($attachment, attrs)
  //................................................
  // Styling
  const _attachment_style = function(styName, v, oldValue) {
    if(oldValue == v)
      return
    if(!v || "none" == v) {
      $attachment.style[styName] = ""
    } else if(_.isNumber(v) || /^\d+(\.\d+)?$/.test(v)) {
      $attachment.style[styName] = `${v}px`
    } else {
      $attachment.style[styName] = v
    }
  }
  //................................................
  _attachment_style("fontSize", reo.fontSize, data.fontSize)
  _attachment_style("fontWeight", reo.fontWeight, data.fontWeight)
  _attachment_style("textTransform", reo.textTransform, data.textTransform)
  //................................................
  // clean cache
  $attachment.removeAttribute("data-mce-src")
  $attachment.removeAttribute("data-mce-style")
  //................................................
  // Update inner HTML
  UpdateAttachmentTagInnerHtml($attachment)
  //................................................
  // Force sync content
  editor.__rich_tinymce_com.syncContent()
}
////////////////////////////////////////////////////
export default {
  name : "wn-attachment",
  //------------------------------------------------
  init : function(conf={}) {
  },
  //------------------------------------------------
  setup : function(editor, url){
    //..............................................
    let settings = _.assign({
        base : "~"
      }, _.get(editor.settings, "wn_attachment_config"));
    //console.log("setup", editor.settings)
    //..............................................
    // Register plugin command
    editor.addCommand("InsertAttachment",   CmdInsertAttachment)
    editor.addCommand("SetAttachmentAttrs", CmdSetAttachmentAttrs)
    editor.addCommand("SetAttachmentStyle", CmdSetAttachmentStyle)
    editor.addCommand("ShowAttachmentProp", CmdShowAttachmentProp)
    //..............................................
    // Register toolbar actions
    editor.ui.registry.addButton("WnAttachmentPick", {
      icon : "paperclip-solid",
      tooltip : Ti.I18n.text("i18n:attachment-insert"),
      onAction : function(menuBtn) {
        pickAttachmentAndInsertToDoc(editor, settings)
      },
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnAttachmentClrStyle", {
      text : Ti.I18n.text("清除附件样式"),
      onAction() {
        editor.execCommand("CmdSetAttachmentStyle", editor, {
          fontSize : null,
          fontWeight : null,
          textTransform : null
        })
      }
    })
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnAttachmentFontSize', {
      text: Ti.I18n.text("文字大小"),
      getSubmenuItems: function () {
        return [{
          type : "menuitem",
          text : Ti.I18n.text("特小"),
          onAction() {
            editor.execCommand("SetAttachmentStyle", editor, {fontSize:".8em"})
          }
        }, {
          type : "menuitem",
          text : Ti.I18n.text("较小"),
          onAction() {
            editor.execCommand("SetAttachmentStyle", editor, {fontSize:".9em"})
          }
        }, {
          type : "menuitem",
          text : Ti.I18n.text("正常"),
          onAction() {
            editor.execCommand("SetAttachmentStyle", editor, {fontSize:"1em"})
          }
        }, {
          type : "menuitem",
          text : Ti.I18n.text("较大"),
          onAction() {
            editor.execCommand("SetAttachmentStyle", editor, {fontSize:"1.2em"})
          }
        }, {
          type : "menuitem",
          text : Ti.I18n.text("特大"),
          onAction() {
            editor.execCommand("SetAttachmentStyle", editor, {fontSize:"1.5em"})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnAttachmentFontWeight', {
      text: Ti.I18n.text("文字粗细"),
      getSubmenuItems: function () {
        return [{
          type : "menuitem",
          text : Ti.I18n.text("继承"),
          onAction() {
            editor.execCommand("SetAttachmentStyle", editor, {fontWeight:"inherit"})
          }
        }, {
          type : "menuitem",
          text : Ti.I18n.text("正常"),
          onAction() {
            editor.execCommand("SetAttachmentStyle", editor, {fontWeight:"normal"})
          }
        }, {
          type : "menuitem",
          text : Ti.I18n.text("加粗"),
          onAction() {
            editor.execCommand("SetAttachmentStyle", editor, {fontWeight:"bold"})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnAttachmentTextTransform', {
      text: Ti.I18n.text("文字转换"),
      getSubmenuItems: function () {
        return [{
          type : "menuitem",
          text : Ti.I18n.text("继承"),
          onAction() {
            editor.execCommand("SetAttachmentStyle", editor, {
              textTransform: "inherit"
            })
          }
        }, {
          type : "menuitem",
          text : Ti.I18n.text("首字母大写"),
          onAction() {
            editor.execCommand("SetAttachmentStyle", editor, {
              textTransform: "capitalize"
            })
          }
        }, {
          type : "menuitem",
          text : Ti.I18n.text("全大写"),
          onAction() {
            editor.execCommand("SetAttachmentStyle", editor, {
              textTransform: "uppercase"
            })
          }
        }, {
          type : "menuitem",
          text : Ti.I18n.text("全小写"),
          onAction() {
            editor.execCommand("SetAttachmentStyle", editor, {
              textTransform: "lowercase"
            })
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addMenuItem("WnAttachmentProp", {
      text : Ti.I18n.text("附件属性"),
      onAction() {
        editor.execCommand("ShowAttachmentProp", editor, settings)
      }
    })
    //..............................................
    editor.ui.registry.addContextMenu("wn-attachment", {
      update: function (el) {
        let $attachment = GetCurrentAttachmentElement(editor)
        // Guard
        if(!_.isElement($attachment)) {
          return []
        }
        return [
          "WnAttachmentClrStyle",
          "WnAttachmentFontSize WnAttachmentFontWeight WnAttachmentTextTransform",
          "WnAttachmentProp"
        ].join(" | ")
      }
    })
    //..............................................
    let $vm = editor.__rich_tinymce_com
    $vm.registerContentCallback("wn-attachment", function() {
      //console.log("SetContent attachment")
      let els = editor.$('.wn-attachment')
      for(let i=0; i<els.length; i++) {
        let el = els[i]
        UpdateAttachmentTagInnerHtml(el)
      }
    })
    //..............................................
    return {
      getMetadata: function () {
        return  {
          name: 'Wn Attachment plugin',
          url: 'http://site0.cn'
        };
      }
    };
    //..............................................
  }
  //------------------------------------------------
}