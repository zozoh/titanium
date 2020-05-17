////////////////////////////////////////////////
async function TiAlert(msg="", {
  title, 
  icon,
  type  = "track", 
  textOk = "i18n:ok",
  position = "center",
  width, height}={}){
  //............................................
  let text = Ti.I18n.text(msg)
  let theIcon  = icon  || Ti.Icons.get(type, "zmdi-info")
  let theTitle = title || Ti.I18n.get(type)
  //............................................
  return await Ti.App.Open({
    //------------------------------------------
    type, width, height, position,
    title   : theTitle,
    closer  : false,
    actions : [{
      text: textOk,
      handler : ()=>true
    }],
    //------------------------------------------
    comType : "modal-inner-body",
    comConf : {icon:theIcon, text},
    //------------------------------------------
    components : {
      name : "modal-inner-body",
      globally : false,
      props : {
        "icon" : undefined, 
        "text" : undefined
      },
      template : `<div class="ti-msg-body as-alert">
        <div class="as-icon"><ti-icon :value="icon"/></div>
        <div class="as-text">{{text}}</div>
      </div>`
    }
    //------------------------------------------
  })
  //............................................
}
////////////////////////////////////////////////
export const Alert = TiAlert;