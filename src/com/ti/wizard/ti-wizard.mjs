export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    "current" : 0
  }),
  ///////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "steps" : {
      type : Array,
      default : ()=>[]
    },
    "data" : {
      type : Object,
      default : ()=>({})
    },
    "first" : {
      type : [Number, String],
      default : 0
    },
    "hijackable" : {
      type : Boolean,
      default : true
    }
  },
  ///////////////////////////////////////////////////
  watch : {
    "first" : function() {
      this.current = this.first
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //----------------------------------------------
    topClass() {
      return this.className
    },
    //----------------------------------------------
    stepList() {
      let list = []
      if(_.isArray(this.steps)) {
        for(let i=0; i<this.steps.length; i++) {
          let step = this.steps[i]
          let stepKey = step.key || `step${i}`
          let className = []
          if(step.className) {
            className = [].concat(step.className)
          }
          if(this.currentStepIndex == i) {
            className.push("is-current")
          }
          else if(i > this.currentStepIndex) {
            className.push("is-future")
          }
          else {
            className.push("is-passed")
          }
          // Join to the list
          list.push({
            className,
            index   : i,
            stepKey : stepKey,
            title   : step.title   || stepKey,
            dataKey : Ti.Util.fallback(step.dataKey,stepKey),
            data    : this.data,
            comValueKey : step.comValueKey,
            comType : step.comType || "ti-label",
            comConf : step.comConf || {value:stepKey},
            comEvents : step.comEvents  || {},
            prev : step.prev,
            next : step.next
          })
        }
      }
      return list
    },
    //----------------------------------------------
    currentStepIndex() {
      if(_.isArray(this.steps)) {
        // Index Already
        if(_.isNumber(this.current)) {
          return _.clamp(this.current, 0, this.steps.length-1)
        }
        // By Key
        for(let i=0; i<this.steps.length; i++) {
          let stepKey = step.key || `step${i}`
          if(this.current == stepKey) {
            return i
          }
        }
      }
      // No Current
      return -1
    },
    //----------------------------------------------
    hasCurrentStep() {
      return this.currentStepIndex >= 0
    },
    //----------------------------------------------
    currentStep() {
      let index = this.currentStepIndex
      if(index >= 0)
        return _.nth(this.stepList, index)
      return null
    },
    //----------------------------------------------
    btnPrev() {
      let btn = _.get(this.currentStep, "prev")
      return this.getStepAction(btn, {
        icon     : "zmdi-chevron-left",
        text     : "i18n:prev",
        enabled  : true
      })
    },
    //----------------------------------------------
    btnNext() {
      let btn = _.get(this.currentStep, "next")
      return this.getStepAction(btn, {
        icon     : "zmdi-chevron-right",
        text     : "i18n:next",
        enabled  : true
      })
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    onClickBtnPrev() {
      if(this.btnPrev && this.btnPrev.enabled) {
        this.gotoPrev()
      }
    },
    //----------------------------------------------
    onClickBtnNext() {
      if(this.btnNext && this.btnNext.enabled) {
        this.gotoNext()
      }
    },
    //----------------------------------------------
    gotoStep(step) {
      this.current = step
    },
    //----------------------------------------------
    gotoPrev(off=-1) {
      this.gotoFromCurrent(-1)
    },
    //----------------------------------------------
    gotoNext(off=1) {
      this.gotoFromCurrent(1)
    },
    //----------------------------------------------
    gotoFromCurrent(off=1) {
      if(this.currentStep) {
        this.current = this.currentStep.index + off
      }
    },
    //----------------------------------------------
    getStepAction(stepBtn, dftSetting={}) {
      if(stepBtn) {
        let btn
        // Boolean default
        if(_.isBoolean(stepBtn)) {
          btn = {}
        }
        // Customized Text 
        else if(_.isString(stepBtn)) {
          btn = {text : stepBtn || dftText}
        }
        // Actions
        else {
          btn = _.assign({}, stepBtn)
          // Eval enabled
          if(_.isPlainObject(btn.enabled)) {
            let enabled = true
            for(let key of _.keys(btn.enabled)) {
              let fn  = _.get(btn.enabled, key)
              let val = _.get(this.data, key)
              if(!Ti.Validate.checkBy(fn, val)) {
                enabled = false
                break
              }
            }
            btn.enabled = enabled
          }
        }
        // Setup 
        _.defaults(btn, dftSetting)
        // ClassName
        if(btn.enabled) {
          btn.className = "is-enabled"
        }
        // Return 
        return btn
      }
    }, 
    //----------------------------------------------
    onStepChanged( {
      index=-1,
      title,
      stepKey,
      dataKey,
      payload
    }={}) {
      console.log("wizard:onStepChanged", {index, title, stepKey, dataKey}, payload)
      if(!dataKey) {
        // Global Payload
        if(_.isPlainObject(payload)) {
          this.$emit("changed", payload)
        }
        // Apply by stepKey
        else {
          this.$emit("changed", {[stepKey] : payload})
        }
      }
      // emit by specail dataKey
      else {
        this.$emit("changed", {[dataKey] : payload})
      }
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  mounted : function() {
    this.current = this.first
  }
  ///////////////////////////////////////////////////
}