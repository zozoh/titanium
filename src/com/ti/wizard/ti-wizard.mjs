const _M = {
  ///////////////////////////////////////////////////
  data: () => ({
    myCurrent: undefined,
    myTitle: undefined
  }),
  ///////////////////////////////////////////////////
  props : {
    "title" : {
      type: String,
      default: undefined
    },
    "steps" : {
      type : Array,
      default : ()=>[]
    },
    "value" : {
      type : Object,
      default : ()=>({})
    },
    "current" : {
      type : [Number, String],
      default : 0
    },
    "canClickHeadItem" : {
      type : String,
      default : undefined
    },
    "evalStepConfFunc" : {
      type : Boolean,
      default : false
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //----------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //----------------------------------------------
    StepList() {
      let list = []
      if(_.isArray(this.steps)) {
        for(let i=0; i<this.steps.length; i++) {
          let step = this.steps[i]
          let stepKey = step.key || `step${i}`
          // Join to the list
          list.push({
            index     : i,
            stepKey   : stepKey,
            dataKey   : step.dataKey,
            title     : step.title   || stepKey,
            comType   : step.comType || "ti-label",
            comConf   : step.comConf,
            prepare   : step.prepare,
            serializer: step.serializer,
            prev : step.prev,
            next : step.next
          })
        }
      }
      return list
    },
    //----------------------------------------------
    StepHeads() {
      let list = []
      if(_.isArray(this.steps)) {
        for(let step of this.StepList) {
          let className = []
          if(this.CurrentStepIndex == step.index) {
            className.push("is-current")
          }
          else if(step.index > this.CurrentStepIndex) {
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
    CurrentStepIndex() {
      return this.CurrentStep
                ? this.CurrentStep.index
                : -1
    },
    //----------------------------------------------
    hasCurrentStep() {
      return this.CurrentStep ? true : false
    },
    //----------------------------------------------
    TheTitle() {
      return this.myTitle || this.title
    },
    //----------------------------------------------
    CurrentStep() {
      let cs = Ti.Util.fallback(this.myCurrent, this.current)
      let step = _.cloneDeep(this.getStep(cs))

      // Eval serializer
      let serializer = step.serializer
        ? Ti.Util.genInvoking(step.serializer, {
            context: this.value,
            partial: "right"
          })
        : _.identity;
      // Eval comConf
      let comConf = Ti.Util.explainObj(this.value, step.comConf, {
        evalFunc : this.evalStepConfFunc
      })

      return _.assign({}, step, {
        serializer, comConf
      })
    },
    //----------------------------------------------
    BtnPrev() {
      let btn = _.get(this.CurrentStep, "prev")
      return this.getStepAction(btn, {
        icon     : "zmdi-chevron-left",
        text     : "i18n:prev",
        enabled  : true
      })
    },
    //----------------------------------------------
    BtnNext() {
      let btn = _.get(this.CurrentStep, "next")
      return this.getStepAction(btn, {
        icon     : "zmdi-chevron-right",
        text     : "i18n:next",
        enabled  : true,
        reverse  : _.get(btn, "icon") ? false : true
      })
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    OnTitleChange(title) {
      this.myTitle = title
    },
    //----------------------------------------------
    OnDataChange(payload) {
      //console.log("wizard:OnStepDataChange", payload)
      let newData = _.assign({}, this.value, payload)
      this.$notify("change", newData)
    },
    //----------------------------------------------
    OnStepChange(payload) {
      // Prev
      if("%prev" == payload) {
        this.gotoFromCurrent(-1)
      }
      // Next
      else if("%next" == payload) {
        this.gotoFromCurrent(1)
      }
      // absolute step
      else {
        this.gotoStep(payload)
      }
    },
    //----------------------------------------------
    OnClickHeadItem(index) {
      // Can Click Passed Steps
      if("passed" == this.canClickHeadItem 
        && this.CurrentStepIndex > index) {
        this.gotoStep(index)
      }
    },
    //----------------------------------------------
    OnClickBtnPrev() {
      if(this.BtnPrev && this.BtnPrev.enabled) {
        if(this.BtnPrev.handler) {
          let invoking = Ti.Util.genInvoking(this.BtnPrev.handler, {
            context: this.value,
            partial: false
          })
          invoking.apply(this, [this.value])
        } else {
          this.gotoFromCurrent(-1)
        }
      }
    },
    //----------------------------------------------
    OnClickBtnNext() {
      if(this.BtnNext && this.BtnNext.enabled) {
        if(this.BtnNext.handler) {
          let invoking = Ti.Util.genInvoking(this.BtnNext.handler, {
            context: this.value,
            partial: false
          })
          invoking.apply(this, [this.value])
        } else {
          this.gotoFromCurrent(1)
        }
      }
    },
    //----------------------------------------------
    //
    // Utility Methods
    //
    //----------------------------------------------
    getStep(keyOrIndex) {
      // By Index: -1 is the last item
      if(_.isNumber(keyOrIndex)) {
        let i = Ti.Num.scrollIndex(keyOrIndex, this.StepList.length)
        if(i>=0)
          return this.StepList[i]
      }
      // By Key
      else {
        for(let step of this.StepList) {
          if(step.stepKey == keyOrIndex) {
            return step
          }
        }
      }
      // Return undefined
    },
    //----------------------------------------------
    gotoStep(keyOrIndex) {
      let step = this.getStep(keyOrIndex)
      if(step) {
        let oldStep = _.cloneDeep(this.CurrentStep)
        this.myCurrent = step.index

        this.$notify("step:chanage", {
          index: step.index,
          step,
          oldStep
        })
      }
    },
    //----------------------------------------------
    gotoFromCurrent(off=1) {
      if(this.CurrentStep) {
        let nextStepIndex = this.CurrentStep.index + off
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
          //console.log({stepBtn, val: this.value})
          // Eval enabled
          if(_.isPlainObject(btn.enabled)) {
            btn.enabled = Ti.AutoMatch.test(btn.enabled, this.value)
          }
          // Customized
          else if(_.isFunction(btn.enabled)) {
            btn.enabled = btn.enabled()
          }
        }
        // Setup 
        _.defaults(btn, dftSetting)
        btn.className = Ti.Css.mergeClassName(btn.className)
        // ClassName
        if(btn.enabled) {
          btn.className["is-enabled"] = true
        }
        // Revers
        if(btn.reverse) {
          btn.className["is-reverse"] = true
        }

        // Return 
        return btn
      }
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "CurrentStep" : {
      handler : function(step, oldstep) {
        if(step && _.isFunction(step.prepare)) {
          if(!oldstep || step.stepKey != oldstep.stepKey) {
            step.prepare.apply(this, [step])
          }
        }
      },
      immediate : true
    }
  }
  ///////////////////////////////////////////////////
}
export default _M;