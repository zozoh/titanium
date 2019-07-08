export async function Confirm(msg="", {
  title = "i18n:confirm", 
  icon = "confirm",
  className,
  type  = "warn", 
  textYes = "i18n:yes",
  textNo  = "i18n:no",
  width, height}={}){
  // Get the tip text
  let str = Ti.I18n.text(msg)
  // Build DOM
  let html = Ti.Dom.htmlChipITT({
      icon:icon, text:str
    },{
      className : "ti-modal-noti as-confirm",
      iconClass : "ti-modal-noti-icon",
      textClass : "ti-modal-noti-text"
    })
  // Open modal
  return Ti.Modal.Open({
    template : html
  }, {
    title, type, width, height, className,
    closer  : false,
    icon : false,
    actions : [{
      text: textYes, handler :()=>true
    }, {
      text: textNo,  handler :()=>false
    }]
  })
}