(function(){
/////////////////////////////////////////////////////////
Ti.Preload("/gu/rs/ti/com/ti/label/_com.json", {
  "name" : "ti-label",
  "globally" : true,
  "template" : "./ti-label.html",
  "props" : "./ti-label-props.mjs",
  "mixins" : ["./ti-label.mjs"]
})
Ti.Preload("/gu/rs/ti/com/ti/label/ti-label.html", `<div class="ti-label"
  :class="TopClass"
  :style="TopStyle"
  @dblclick.left="OnDblClick">
  <!--prefix:icon-->
  <div v-if="ThePrefixIcon"
    class="as-icon at-prefix"
    :class="getHoverClass('prefixIcon')"
    @click.left="OnClickPrefixIcon">
    <ti-icon :value="ThePrefixIcon"/>
  </div>
  <!--prefix:text-->
  <div v-if="prefixText" 
    class="as-text at-prefix"
    :class="getHoverClass('prefixText')"
    @click.left="OnClickPrefixText">
    <span>{{prefixText|i18n}}</span>
  </div>
  <!--Text-->
  <div class="as-value"
    :style="ValueStyle"
    @click.left="OnClickValue">
    <!--Link-->
    <a v-if="href"
        :href="href"
        :taget="newTab ? '_blank' : undefined"
        @click.left.prevent>{{myDisplayText}}</a>
    <!--Normal Text-->
    <span v-else>{{myDisplayText}}</span>
  </div>
  <!--suffix:text-->
  <div v-if="suffixText"
    class="as-text at-suffix"
    :class="getHoverClass('suffixText')"
    @click.left="OnClickSuffixIcon">
    <span>{{suffixText|i18n}}</span>
  </div>
  <!--suffix:icon-->
  <div v-if="suffixIcon"
    class="as-icon at-suffix"
    :class="getHoverClass('suffixIcon')"
    @click.left="OnClickSuffixIcon">
    <ti-icon :value="suffixIcon"/>
  </div>
</div>`)
const _M = {
  //////////////////////////////////////////
  data : ()=>({
    myDisplayIcon : undefined,
    myDisplayText : undefined,
    myDictValKey  : undefined
  }),
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-blank"   : !_.isNumber(this.TheValue) && _.isEmpty(this.TheValue)
      })
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //--------------------------------------
    ValueStyle() {
      return Ti.Css.toStyle({
        maxWidth : this.valueMaxWidth
      })
    },
    //--------------------------------------
    ThePrefixIcon() {
      return this.myDisplayIcon || this.prefixIcon
    },
    //------------------------------------------------
    TheHover() {
      let map = {}
      let hos = _.concat(this.hover)
      for(let ho of hos) {
        if(ho) {
          map[ho] = true
        }
      }
      return map
    },
    //--------------------------------------
    TheValue() {
      let str = this.value
      // Auto trim
      if(this.trim && _.isString(str)) {
        return _.trim(str)
      }
      // Return it directly
      return str
    },
    //--------------------------------------
    Dict() {
      if(this.dict) {
        // Already Dict
        if(this.dict instanceof Ti.Dict) {
          this.myDictValKey = ".text"
          return this.dict
        }
        // Get back
        let {name, vKey} = Ti.DictFactory.explainDictName(this.dict)
        this.myDictValKey = vKey || ".text"
        return Ti.DictFactory.CheckDict(name)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //------------------------------------------------
    isCanHover(hoverName) {
      return this.TheHover[hoverName] ? true : false
    },
    //------------------------------------------------
    getHoverClass(hoverName) {
      let canHover = this.isCanHover(hoverName)
      return {
        "can-hover" : canHover,
        "for-look"  : !canHover,
        "is-prefix-icon-hover" : "prefixIcon" == hoverName
      }
    },
    //--------------------------------------
    OnDblClick() {
      if(this.editable) {
        Ti.Be.EditIt(this.$el, {
          text: this.TheValue,
          ok : (newVal)=> {
            this.$notify("change", newVal)
          }
        })
      }
    },
    //------------------------------------------------
    OnClickPrefixIcon() {
      this.$notify("prefix:icon")
    },
    //------------------------------------------------
    OnClickPrefixText() {
      this.$notify("prefix:text")
    },
    //------------------------------------------------
    OnClickValue() {
      this.$notify("click:value")
    },
    //------------------------------------------------
    OnClickSuffixIcon() {
      this.$notify("suffix:icon")
    },
    //------------------------------------------------
    OnClickSuffixText() {
      this.$notify("suffix:text")
    },
    //--------------------------------------
    async evalDisplay(val) {
      // By Dict Item
      if(this.Dict) {
        let it = await this.Dict.getItem(val)
        if(it) {
          this.myDisplayIcon = this.Dict.getIcon(it)
          val = this.Dict.getBy(this.myDictValKey, it, val)
        } else {
          this.myDisplayIcon = null
        }
      }
      // Number
      if(_.isNumber(val)) {
        return val
      }
      // Collection
      if(_.isArray(val) || _.isPlainObject(val)) {
        return JSON.stringify(val, null, '  ')
      }
      // Normal value
      if(Ti.Util.isNil(val)) {
        return Ti.I18n.text(this.placeholder)
      }
      // Date
      if(_.isDate(val)) {
        return Ti.Types.toStr(val, this.format)
      }
      // Auto format
      if(this.format) {
        val = Ti.Types.toStr(val, this.format)
      }
      // Return & auto-i18n
      return this.autoI18n 
              ? Ti.I18n.text(val)
              : val
    },
    //--------------------------------------
    async reloadMyDisplay() {
      this.myDisplayIcon = null
      this.myDisplayText = await this.evalDisplay(this.TheValue)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "value" : {
      handler   : "reloadMyDisplay",
      immediate : true
    }
  }
  ////////////////////////////////////////// 
}
Ti.Preload("/gu/rs/ti/com/ti/label/ti-label.mjs", _M)
/////////////////////////////////////////////////////////
})()