export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  props : {
    "steps" : {
      type : Array,
      default : ()=>[]
    },
    "data" : {
      type : Object,
      default : ()=>({})
    },
    "current" : {
      type : [Number, String],
      default : 0
    },
    "canClickHeadItem" : {
      type : String,
      default : null
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //----------------------------------------------
    topClass() {
      return this.className
    },
    //----------------------------------------------
    displayStepList() {
      let list = []
      if(_.isArray(this.steps)) {
        for(let step of this.stepList) {
          let className = []
          if(step.className) {
            className = [].concat(step.className)
          }
          if(this.currentStepIndex == step.index) {
            className.push("is-current")
          }
          else if(step.index > this.currentStepIndex) {
            className.push("is-future")
          }
          else {
            className.push("is-passed")
          }
          // Join to the list
          list.push(_.assign({}, step, {className}))
        }
      }
      return list
    },
    //----------------------------------------------
    stepList() {
      let list = []
      if(_.isArray(this.steps)) {
        for(let i=0; i<this.steps.length; i++) {
          let step = this.steps[i]
          let stepKey = step.key || `step${i}`
          // Join to the list
          list.push({
            index     : i,
            className : step.className,
            stepKey   : stepKey,
            title     : step.title   || stepKey,
            dataKey   : step.dataKey,
            data      : this.data,
            comType   : step.comType || "ti-label",
            comConf   : step.comConf || {value:stepKey},
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
      return this.currentStep
                ? this.currentStep.index
                : -1
    },
    //----------------------------------------------
    hasCurrentStep() {
      return this.currentStep ? true : false
    },
    //----------------------------------------------
    currentStep() {
      return this.getStepBy(this.current)
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
    getStepBy(keyOrIndex) {
      // By Index: -1 is the last item
      if(_.isNumber(keyOrIndex)) {
        let i = Ti.Num.scrollIndex(keyOrIndex, this.stepList.length)
        if(i>=0)
          return this.stepList[i]
      }
      // By Key
      else {
        for(let step of this.stepList) {
          if(step.stepKey == keyOrIndex) {
            return step
          }
        }
      }
      // Return undefined
    },
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
    gotoStep(keyOrIndex) {
      let step = this.getStepBy(keyOrIndex)
      if(step)
        this.$notify("goto-step", step)
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
        let nextStepIndex = this.currentStep.index + off
        this.gotoStep(nextStepIndex)
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
            btn.enabled = Ti.Validate.match(this.data, btn.enabled)
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
    onStepEvent({emitName, nextStep, payload}={}) {
      console.log("wizard:onStepEvent", {emitName, nextStep, payload})
      // Notify Event
      if(emitName) {
        this.$notify(emitName, payload)
      }
      // Try auto goto nextStep
      this.gotoStep(nextStep)
    },
    //----------------------------------------------
    onClickHeadItem(step, index) {
      // Can Click Passed Steps
      if("passed" == this.canClickHeadItem 
        && this.currentStepIndex > index) {
        this.gotoStep(index)
      }
    }
    //----------------------------------------------
  }
  ///////////////////////////////////////////////////
}