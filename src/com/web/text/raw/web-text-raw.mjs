export default {
  /////////////////////////////////////////
  props: {
    "icon": {
      type: [String, Object],
      default: undefined
    },
    "value": {
      type: [String, Number, Boolean, Array],
      default: undefined
    },
    "lineSeperater": {
      type: String,
      default: "\n"
    },
    "i18n": {
      type: Boolean,
      default: true
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    hasValue() {
      return Ti.Util.isNil(this.value) ? false : true;
    },
    //--------------------------------------
    TheValue() {
      let list = []
      this.joinValue(list, this.value)
      return list
    },
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    joinValue(list = [], str) {
      // Guard
      if(!str) {
        return
      }
      if (_.isArray(str)) {
        for (let s of str) {
          this.joinValue(list, s)
        }
      }
      else if(_.isString(str) && this.lineSeperater) {
        if (this.i18n) {
          str = Ti.I18n.text(str)
        }
        let ss = str.split(this.lineSeperater)
        for(let s of ss) {
          if(this.i18n) {
            s = Ti.I18n.text(s)
          } 
          list.push(s)
        }
      }
      else if (this.i18n) {
        let s = Ti.I18n.text(str)
        list.push(s)
      }
      else {
        list.push(str)
      }
    }
  }
  //////////////////////////////////////////
}