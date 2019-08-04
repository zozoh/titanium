export async function Captcha(src="", {
  title = "i18n:captcha-tip", 
  className,
  type  = "info",
  width = 320, 
  height,
  imgWidth,
  imgHeight=50,
  textOk = "i18n:ok",
  textChange = "i18n:captcha-chagne",
  placeholder = "i18n:captcha",
  value = null
}={}) {
  // Build DOM
  let html = `<div class="ti-simple-form">
      <header style="padding-bottom:0;">
        <img v-if="src"
          :style="captchaStyle"
          :src="captchaSrc"/>
      </header>
      <section>
        <div class="as-input">
          <input ref="inbox"
            spellcheck="false"
            :placeholder="placeholder|i18n"
            v-model="value"
            @keydown="onKeyDown">
          <span @click="onChangeSrc">
            <a>{{textChange|i18n}}</a>
          </span>
        </div>
        <div class="as-btn">
          <button ref="ok"
            @click="onOk">{{textOk|i18n}}</button>
        </div>
      </section>
    </div>`
  // Open modal
  return Ti.Modal.Open({
    data : {
      src, value, textOk, textChange, placeholder,
      timestamp : Date.now(),
    },
    template : html,
    computed : {
      captchaStyle() {
        let css = {}
        if(imgWidth)
          css.width = imgWidth
        if(imgHeight)
          css.height = imgHeight
        return Ti.Css.toStyle(css)
      },
      captchaSrc() {
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
            app.$modal.$closer.click()
          },
          "Tab" : ()=>{
            evt.preventDefault()
            evt.stopPropagation()
          },
          "Enter" : ()=>{
            evt.preventDefault()
            evt.stopPropagation()
            this.onOk()
          }
        })[evt.key]
        // Do the func
        Ti.Invoke(fn)
      },
      onChangeSrc() {
        this.timestamp = Date.now()
      },
      onOk() {
        Ti.App(this).$modal.close(this.value||"")
      }
    }
  }, {
    title, type, width, height, className,
    closer  : true,
    icon : false,
    actions : []
  })
}