export default {
  ///////////////////////////////////////
  inject: ["$bar"],
  ///////////////////////////////////////
  props : {
    "name": {
      type: String,
      default: undefined
    },
    "icon": {
      type: String,
      default: undefined
    },
    "text": {
      type: String,
      default: undefined
    },
    "tip": {
      type: String,
      default: undefined
    },
    "shortcut": {
      type: String,
      default: undefined
    },
    "altDisplay" : {
      type: [Object, Array],
      default: ()=>[]
    },
    "enabled": {
      type: [Boolean, String, Array, Object],
      default: undefined
    },
    "disabled": {
      type: [Boolean, String, Array, Object],
      default: undefined
    },
    "value" : true,
    "depth": {
      type: Number,
      default: 0
    },
    "status" : {
      type : Object,
      default : ()=>({})
    }
  },
  ///////////////////////////////////////
  computed : {
    //-----------------------------------
    TopClass() {
      return this.getTopClass({
        "is-enabled" : this.isEnabled,
        "is-disabled": this.isDisabled,
        "is-top" : this.depth == 1,
        "is-sub" : this.depth > 1,
        "has-icon" : this.icon ? true : false
      }, `is-depth-${this.depth}`)
    },
    //-----------------------------------
    AltDisplay() {
      if(_.isArray(this.altDisplay)) {
        return this.altDisplay
      }
      return this.altDisplay
        ? [this.altDisplay]
        : []
    },
    //-----------------------------------
    isEnabled() {
      if(!Ti.Util.isNil(this.enabled)) {
        return this.isMatchStatus(this.enabled)
      }
      if(!Ti.Util.isNil(this.disabled)) {
        if(this.isMatchStatus(this.disabled)) {
          return false
        }
      }
      return true
    },
    //-----------------------------------
    isDisabled() {
      return !this.isEnabled
    },
    //-----------------------------------
    isShowShortcut() {
      return this.shortcut && this.depth > 1
    },
    //-----------------------------------
    CurrentDisplay() {
      // if(this.name)
      // console.log("CurrentDisplay", this.name)
      // Prepare default
      let dis =  {
        icon : this.icon,
        text : this.text,
        tip  : this.tip,
        value: this.value
      }
      // Alt Display
      if(!_.isEmpty(this.AltDisplay)) {
        for(let alt of this.AltDisplay) {
          let mat = alt.match || this.name
          if(this.isMatchStatus(mat)) {
            _.assign(dis, _.pick(alt, [
              "icon", "text", "tip", "value"
            ]))
            break
          }
        }
      }
      // Done
      return dis
    }
    //-----------------------------------
  },
  ///////////////////////////////////////
  methods : {
    //---------------------------------------
    OnClickTop() {
      if(!this.isDisabled) {
        let val = this.CurrentDisplay.value
        this.$emit('fire', val)
      }
    },
    //---------------------------------------
    isMatchStatus(mat) {
      if(_.isBoolean(mat)) {
        return mat
      }
      // Key | `"saving"`
      if(_.isString(mat)) {
        return _.get(this.status, mat) ? true : false
      }
      // KeySet | `["saving","changed"]`
      else if(_.isArray(mat)) {
        for(let k of mat) {
          if(!_.get(this.status, k)) {
            return false
          }
        }
        return true
      }
      // Complex match
      else if(_.isPlainObject(mat)) {
        // Validate | `{validate:{..}}`
        if(mat.validate) {
          return Ti.Validate(this.status, mat.validate)
        }
        // Match  | `{saving:true}`
        return _.isMatch(this.status, mat)
      }
      return false
    }
    //---------------------------------------
  }
  ///////////////////////////////////////
}