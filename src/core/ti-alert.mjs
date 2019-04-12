export async function Alert(msg="", {
  title = "i18n:info", 
  icon = "alert",
  className,
  type  = "track", 
  textOk = "i18n:ok",
  width, height}={}){
  // Get the tip text
  let str = Ti.I18n.text(msg)
  // Build DOM
  let html = Ti.Dom.htmlChipITT({
      icon:icon, text:str
    },{
      className : "ti-modal-noti as-alert",
      iconClass : "ti-modal-noti-icon",
      textClass : "ti-modal-noti-text"
    })
  // Open modal
  return Ti.Modal({
    template : html
  }, {
    title, type, width, height, className,
    closer  : false,
    icon : false,
    actions : [{text: textOk}]
  })
}