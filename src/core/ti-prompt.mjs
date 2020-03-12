////////////////////////////////////////////////
async function Prompt(msg="", {
  title = "i18n:prompt", 
  icon,
  type  = "info", 
  position = "center",
  iconOk, iconCancel,
  textOk = "i18n:ok",
  textCancel  = "i18n:cancel", 
  width = 480, height,
  trimed = true,
  placeholder = "",
  valueCase = null,
  value = ""
}={}) {
  //............................................
  let text = Ti.I18n.text(msg)
  let theIcon  = icon  || "zmdi-keyboard"
  let theTitle = title || "i18n:confirm"
  //............................................
  return await Ti.App.Open({
    //------------------------------------------
    type, width, height, position,
    title   : theTitle,
    closer  : false,
    result  : value,
    //------------------------------------------
    textOk, textCancel,
    iconOk, iconCancel,
    //------------------------------------------
    comType : "modal-inner-body",
    //------------------------------------------
    components : [{
      name : "modal-inner-body",
      globally : false,
      data : {
        // display
        icon : theIcon, text, 
        // for input
        placeholder : placeholder || value,
        trimed,
        valueCase
      },
      props : {
        value : null
      },
      template : `<div class="ti-msg-body as-prompt"
        v-ti-actived="__set_actived">
        <div class="as-icon"><ti-icon :value="icon"/></div>
        <div class="as-text">
          <div class="as-tip" v-if="text">{{text}}</div>
          <ti-input
            :value="value"
            :trimed="trimed"
            :placeholder="placeholder"
            :value-case="valueCase"
            :focused="true"
            :auto-select="true"
            @inputing="onInputing"/>
        </div>
      </div>`,
      methods : {
        onInputing(val) {
          this.$emit("change", val)
        },
        __ti_shortcut(uniqKey) {
          if("ENTER" == uniqKey) {
            Ti.App(this).$vm().close(this.result)
          }
        }
      }
    }, "@com:ti/input"]
    //------------------------------------------
  })
  //............................................
}
////////////////////////////////////////////////
export default Prompt