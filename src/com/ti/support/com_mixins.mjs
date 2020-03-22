const _M = {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  inject : {
    "$EmitBy" : {default:undefined},
    "primaryNotify" : {default:false}
  },
  ///////////////////////////////////////////////////
  computed :{
    //-----------------------------------------------
    // Auto PageMode
    ...Vuex.mapGetters("viewport", [
      "viewportMode", 
      "viewportActivedComIds",
      "isViewportModeDesktop", 
      "isViewportModeTablet", 
      "isViewportModePhone",
      "isViewportModeDesktopOrTablet", 
      "isViewportModePhoneOrTablet"
    ]),
    //-----------------------------------------------
    // Auto assign component ID
    tiComId() {
      return `${this._uid}:${this.tiComType}`
    },
    //-----------------------------------------------
    // Auto detected current com is actived or not.
    isActived() {
      return _.indexOf(this.viewportActivedComIds, this.tiComId) >= 0
    },
    //-----------------------------------------------
    isSelfActived() {
      return _.last(this.viewportActivedComIds) == this.tiComId
    },
    //-----------------------------------------------
    getTopClass() {
      return (...klass)=>Ti.Css.mergeClassName({
        "is-self-actived" : this.isSelfActived,
        "is-actived" : this.isActived
      }, klass, this.className)
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  props : {
    "className" : undefined,
    "onInit"    : undefined,
    "onReady"   : undefined
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    // Auto count my useful id path array
    tiActivableComIdPath(parentFirst=true) {
      let list = this.tiActivableComPath(parentFirst)
      return _.map(list, (vm)=>vm.tiComId)
    },
    //-----------------------------------------------
    // Auto count my useful id path array
    tiActivableComPath(parentFirst=true) {
      let list = [this]
      let vm = this.$parent
      while(vm) {
        // Only the `v-ti-actived` marked Com join the parent paths
        if(vm.$el.__ti_activable__) {
          list.push(vm)
        }
        // Look up
        vm = vm.$parent
      }
      if(parentFirst)
        list.reverse()
      return list
    },
    //-----------------------------------------------
    // Auto get the parent activable component
    tiParentActivableCom() {
      let $pvm = this.$parent
      while($pvm && !$pvm.$el.__ti_activable__) {
        $pvm = $pvm.$parent
      }
      return $pvm
    },
    //-----------------------------------------------
    setActived() {
      this.__set_actived()
    },
    //-----------------------------------------------
    $notify(name, ...args) {
      console.log("$notify", name, args)
      // Customized notify
      if(!this.primaryNotify && _.isFunction(this.$EmitBy)) {
        this.$EmitBy(name, ...args)
      }
      // Primary Emit
      else {
        this.$emit(name, ...args)
      }
    },
    //-----------------------------------------------
    $receive(name, args=[], FuncSet={}){
      // Parse Handler
      let {block, event} = Ti.Util.explainEventName(name)
      console.log(`${this.tiComId}.$receive`, {name, block, event, args, a0:_.first(args)})

      // Find Event Handler
      let fn = FuncSet[name] || FuncSet[event]

      // Invoke Event Handler
      if(_.isFunction(fn)) {
        fn.apply(this, args)
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  created : async function(){
    //...............................................
    // Hijack the emit by $parent
    if(!this.hijackEmit) {
      if(this.$parent 
        && this.$parent.hijackable
        && _.isFunction(this.$parent.hijackEmit)) {
        //const __old_emit = this.$emit
        this.$emit = async (name, ...args) => {
          //await __old_emit.apply(this, [name, ...args])
          // Ignore the VueDevTool Event
          if(/^hook:/.test(name)) {
            return
          }
          // Do emit hijacking
          await this.$parent.hijackEmit(name, args)
        }
      }
    }
    //...............................................
    // Auto mark self as actived Component in App
    this.__set_actived = ()=>{
      if(!this.isSelfActived) {
        //console.log("I am actived", this)
        Ti.App(this).setActivedVm(this)
        //this.$emit("com:actived", this)
      }
    }
    //...............................................
    // Auto invoke the callback
    if(_.isFunction(this.onInit)) {
      this.onInit(this)
    }
    //...............................................
  },
  ///////////////////////////////////////////////////
  mounted : function() {
    if(_.isFunction(this.onReady)) {
      this.onReady(this)
    }
  },
  ///////////////////////////////////////////////////
  destroyed : function(){
    //console.log("destroyed", this.$el)
    if(Ti.App(this).setBlurredVm(this)) {
      this.$emit("com:blurred", this)
    }
  }
  ///////////////////////////////////////////////////
}
export default _M;