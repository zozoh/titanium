////////////////////////////////////////////////
async function Captcha(src="", {
  title = "i18n:captcha-tip", 
  type  = "info",
  position = "center",

  iconOk, iconCancel,
  textOk = "i18n:ok",
  textCancel  = "i18n:cancel", 
  width = 320,  height,

  imgWidth,
  imgHeight=50,
  textChange = "i18n:captcha-chagne",
  placeholder = "i18n:captcha"
}={}) {
  //............................................
  return await Ti.App.Open({
    //------------------------------------------
    type, width, height, position,
    title,
    closer  : false,
    result  : "",
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
        src, timestamp : Date.now(),
        // display
        imgWidth, imgHeight, textChange,
        // for input
        placeholder : placeholder || value
      },
      props : {
        value : null
      },
      template : `<div class="ti-simple-form">
        <header style="padding-bottom:0;">
          <img ref="pic"
            v-if="src"
              :style="CaptchaStyle"
              :src="CaptchaSrc"
              @load="OnImgLoaded"/>
        </header>
        <section>
          <div class="as-input">
            <input ref="input"
              spellcheck="false"
              :placeholder="placeholder|i18n"
              :value="value"
              @input="$emit('input', $refs.input.value)">
            <span @click="timestamp = Date.now()">
              <a>{{textChange|i18n}}</a>
            </span>
          </div>
        </section>
      </div>`,
      computed : {
        CaptchaStyle() {
          return Ti.Css.toStyle({
            width  : this.imgWidth,
            height : this.imgHeight
          })
        },
        CaptchaSrc() {
          if(this.src && this.timestamp>0) {
            if(this.src.lastIndexOf('?') == -1) {
              return this.src + "?_t=" + this.timestamp
            } else {
              return this.src + "&_t=" + this.timestamp
            }
          } else {
            return this.src
          }
        }
      },
      methods : {
        OnImgLoaded() {
          Ti.Be.BlinkIt(this.$refs.pic)
        },
        __ti_shortcut(uniqKey) {
          if("ENTER" == uniqKey) {
            Ti.App(this).$vm().close(this.value)
          }
        }
      }
    }]
    //------------------------------------------
  })
  //............................................
}
////////////////////////////////////////////////
export default Captcha