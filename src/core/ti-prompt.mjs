////////////////////////////////////////////////
async function TiPrompt(msg = "", {
  title = "i18n:prompt",
  icon,
  type = "info",
  position = "center",
  iconOk, iconCancel,
  textOk = "i18n:ok",
  textCancel = "i18n:cancel",
  width = 480, height,
  trimed = true,
  placeholder = "",
  valueCase = null,
  value = "",
  comType = "TiInput",
  comConf = {
    focused: true,
    autoSelect: true
  },
  comModel = {/*event: 'inputing',prop: 'value'*/ }
} = {}) {
  //............................................
  let text = Ti.I18n.text(msg)
  let theIcon = icon || "zmdi-keyboard"
  //............................................
  comModel = comModel || {}
  if (/^TiInput(Currency)?/.test(comType)) {
    _.defaults(comModel, {
      event: 'inputing',
      prop: 'value'
    })
  } else {
    _.defaults(comModel, {
      event: 'change',
      prop: 'value'
    })
  }
  //............................................
  return await Ti.App.Open({
    //------------------------------------------
    type, width, height, position,
    title: title,
    closer: false,
    result: value,
    //------------------------------------------
    textOk, textCancel,
    iconOk, iconCancel,
    //------------------------------------------
    comType: "modal-inner-body",
    //------------------------------------------
    components: [{
      name: "modal-inner-body",
      globally: false,
      data: {
        // display
        icon: theIcon, text,
        // for input
        comType,
        comConf: _.assign({
          placeholder: placeholder || value,
          trimed,
          valueCase,
        }, comConf)
      },
      props: {
        value: null
      },
      template: `<div class="ti-msg-body as-prompt"
        v-ti-activable>
        <div class="as-icon"><ti-icon :value="icon"/></div>
        <div class="as-text">
          <div class="as-tip" v-if="text">{{text}}</div>
          <component 
            :is="comType"
            v-bind="comConf"
            :${comModel.prop}="value"
            @${comModel.event}="OnComChange"/>
        </div>
      </div>`,
      methods: {
        OnComChange(val) {
          this.$emit("change", val)
        },
        __ti_shortcut(uniqKey) {
          if ("ENTER" == uniqKey) {
            console.log(this.value)
            Ti.App(this).$vm().close(this.value)
          }
        }
      }
    }, "@com:ti/input"]
    //------------------------------------------
  })
  //............................................
}
////////////////////////////////////////////////
export const Prompt = TiPrompt;