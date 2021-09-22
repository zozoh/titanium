////////////////////////////////////////////////
async function TiConfirm(msg="", {
  title, 
  icon,
  vars,
  closer = false,
  type  = "info", 
  position = "center",
  textYes = "i18n:yes",
  textNo  = "i18n:no",
  width=480, height}={}){
  //............................................
  let text = _.isEmpty(vars)
               ? Ti.I18n.text(msg)
               : Ti.I18n.textf(msg, vars);
  let theIcon  = icon  || "zmdi-help"
  let theTitle = title || "i18n:confirm"
  //............................................
  return await Ti.App.Open({
    //------------------------------------------
    type, width, height, position,
    title   : theTitle,
    closer,
    actions : [{
      text: textYes,
      handler : ()=>true
    }, {
      text: textNo,
      handler : ()=>false
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
      template : `<div class="ti-msg-body as-confirm">
        <div class="as-icon"><ti-icon :value="icon"/></div>
        <div class="as-text">{{text}}</div>
      </div>`
    }
    //------------------------------------------
  })
  //............................................
}
////////////////////////////////////////////////
export const Confirm = TiConfirm;