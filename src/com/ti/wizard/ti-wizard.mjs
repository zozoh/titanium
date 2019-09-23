export default {
  inheritAttrs : false,
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
    "current" : {
      type : [Number, String],
      default : 0
    },
    "hijackable" : {
      type : Boolean,
      default : true
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
            dataKey : step.dataKey || stepKey,
            comType : step.comType || "ti-label",
            comConf : step.comConf || {value:stepKey},
            serializer : Ti.Types.getFunc(step, "serializer")
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
    currentStep() {
      let index = this.currentStepIndex
      if(index >= 0)
        return _.nth(this.stepList, index)
      return null
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    gotoStep(step) {
      this.current = step
    },
    //----------------------------------------------
    gotoNext(off=1) {
      this.gotoFromCurrent(1)
    },
    //----------------------------------------------
    gotoPrev(off=-1) {
      this.gotoFromCurrent(-1)
    },
    //----------------------------------------------
    gotoFromCurrent(off=1) {
      if(this.currentStep) {
        this.current = this.currentStep.index + off
      }
    },
    //----------------------------------------------
    async hijackEmit(name, args) {
      console.log("ti-wizard::hijackEmit->", name, args)
      let payload = args
      if(args && _.isArray(args) && args.length == 1) {
        payload = args[0]
      }
      
    }
    //----------------------------------------------
  }
  ///////////////////////////////////////////////////
}