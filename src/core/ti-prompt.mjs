export async function Prompt(msg="", {
  title = "i18n:prompt", 
  icon = "prompt",
  className,
  type  = "info",
  textOk = "i18n:ok",
  textCancel  = "i18n:cancel", 
  width = 480, 
  height,
  trimed = true,
  placeholder = "",
  value = ""
}={}) {
  // Get the tip text
  let str = Ti.I18n.text(msg)
  let plh = Ti.I18n.text(placeholder)
  // Build promptHtml
  let promptHtml = `<div class="prompt-tip">${str}::{{viewportMode}}</div>
  <div class="prompt-input">
    <input v-model="value" ref="inbox"
            :placeholder="placeholder"
            spellcheck="false"
            @keydown="onKeyDown">
  </div>`
  // Build DOM
  let html = Ti.Dom.htmlChipITT({
      icon:icon, text:promptHtml
    },{
      className : "ti-modal-noti as-prompt",
      iconClass : "ti-modal-noti-icon",
      textClass : "ti-modal-noti-text",
      textTag : "div",
      textAsHtml : true
    })
  // Open modal
  return Ti.Modal.Open({
    // !!! zozoh: Why function don't work? I should find the reason later!
    // data : ()=>({value, placeholder}),
    data : {value, placeholder},
    template : html,
    mounted : function(){
      this.$refs.inbox.select()
    },
    methods : {
      onKeyDown: function(evt){
        let app = Ti.App(this)
        let fn = ({
          "Escape" : ()=>{
            evt.preventDefault()
            evt.stopPropagation()
            app.$modal.$btns.cancel.click()
          },
          "Tab" : ()=>{
            evt.preventDefault()
            evt.stopPropagation()
          },
          "Enter" : ()=>{
            evt.preventDefault()
            evt.stopPropagation()
            app.$modal.$btns.ok.click()
          }
        })[evt.key]
        // Do the func
        Ti.Invoke(fn)
      }
    }
  }, {
    title, type, width, height, className,
    closer  : false,
    icon : false,
    actions : [{
      key : "ok",
      text: textOk, 
      handler : ({app})=>{
        let val = app.$vm().value
        if(trimed)
          return _.trim(val)
        return val
      }
    }, {
      key : "cancel",
      text: textCancel
    }]
  })
}