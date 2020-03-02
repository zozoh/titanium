////////////////////////////////////////////////
async function Prompt(msg="", {
  title = "i18n:prompt", 
  icon,
  type  = "info", 
  position = "center",
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
  return Ti.App.Open({
    //------------------------------------------
    type, width, height, position,
    title   : theTitle,
    closer  : false,
    //------------------------------------------
    actions : [{
      text: textOk,
      handler : ({$main})=>$main.result
    }, {
      text: textCancel,
      handler : ()=>undefined
    }],
    //------------------------------------------
    comType : "modal-inner-body",
    comConf : {
      icon:theIcon, text, 
      trimed, placeholder, valueCase,
      value
    },
    //------------------------------------------
    components : [{
      name : "modal-inner-body",
      globally : false,
      data : {
        result : ""
      },
      props : {
        "icon"   : undefined, 
        "text"   : undefined,
        "trimed" : undefined, 
        "placeholder" : undefined, 
        "valueCase" : undefined,
        "value"  : undefined
      },
      template : `<div class="ti-msg-body as-prompt"
        v-ti-actived="__set_actived">
        <div class="as-icon"><ti-icon :value="icon"/></div>
        <div class="as-text">
          <div class="as-tip" v-if="text">{{text}}</div>
          <ti-input
            :value="result || value"
            :trimed="trimed"
            :placeholder="placeholder"
            :value-case="valueCase"
            :focus="true"
            @inputing="onInputing"/>
        </div>
      </div>`,
      methods : {
        onInputing(val) {
          this.result = val
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