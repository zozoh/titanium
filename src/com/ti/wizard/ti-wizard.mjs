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
          list.push({
            ...step,
            index   : i,
            key     : stepKey,
            title   : step.title || stepKey,
            dataKey : step.dataKey || stepKey,
          })
        }
      }
      return list
    },
    //----------------------------------------------
    currentStep() {
      // By Index
      if(_.isNumber(this.current)) {
        let index = _.clamp(this.current, 0, this.stepList.length-1)
        return _.nth(this.stepList, index)
      }
      // By Key
      for(let step of this.stepList) {
        if(step.key == this.current) {
          return step
        }
      }
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    gotoStep(step) {
      this.current = step
    },
    gotoNext(off=1) {
      this.gotoFromCurrent(1)
    },
    gotoPrev(off=-1) {
      this.gotoFromCurrent(-1)
    },
    gotoFromCurrent(off=1) {
      if(this.currentStep) {
        this.current = this.currentStep.index + off
      }
    }
  }
  ///////////////////////////////////////////////////
}