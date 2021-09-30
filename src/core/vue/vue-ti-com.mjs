/////////////////////////////////////////////////////
const TiComMixin = {
  inheritAttrs: false,
  ///////////////////////////////////////////////////
  computed: {
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
      return (...klass) => Ti.Css.mergeClassNameBy(this, {
        "is-self-actived": this.isSelfActived,
        "is-actived": this.isActived
      }, klass, this.className)
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  props: {
    "className": undefined,
    "onInit": undefined,
    "onReady": undefined
  },
  ///////////////////////////////////////////////////
  created: async function () {
    //...............................................
    // Auto invoke the callback
    if (_.isFunction(this.onInit)) {
      this.onInit(this)
    }
    //...............................................
  },
  ///////////////////////////////////////////////////
  mounted: function () {
    if (_.isFunction(this.onReady)) {
      this.onReady(this)
    }
  },
  ///////////////////////////////////////////////////
  beforeDestroyed: function () {
    //console.log("destroyed", this.$el)
    Ti.App(this).setBlurredVm(this)
  }
  ///////////////////////////////////////////////////
}
/////////////////////////////////////////////////////
const TiComMethods = {
  //-----------------------------------------------
  // Auto count my useful id path array
  tiActivableComIdPath(parentFirst = true) {
    let list = this.tiActivableComPath(parentFirst)
    return _.map(list, (vm) => vm.tiComId)
  },
  //-----------------------------------------------
  // Auto count my useful id path array
  tiActivableComPath(parentFirst = true) {
    let list = [this]
    let vm = this.$parent
    while (vm) {
      // Only the `v-ti-actived` marked Com join the parent paths
      if (vm.__ti_activable__) {
        list.push(vm)
      }
      // Look up
      vm = vm.$parent
    }
    if (parentFirst)
      list.reverse()
    return list
  },
  //-----------------------------------------------
  // Auto get the parent activable component
  tiParentActivableCom() {
    let $pvm = this.$parent
    while ($pvm && !$pvm.__ti_activable__) {
      $pvm = $pvm.$parent
    }
    return $pvm
  },
  //-----------------------------------------------
  tiParentCom(comType) {
    let ct = _.kebabCase(comType)
    let $pvm = this.$parent
    while ($pvm && $pvm.tiComType != ct) {
      $pvm = $pvm.$parent
    }
    return $pvm
  },
  //-----------------------------------------------
  setActived() {
    if (!this.isSelfActived) {
      //console.log("I am actived", this)
      Ti.App(this).setActivedVm(this)
      //this.$notify("com:actived", this)
    }
  }
  //-----------------------------------------------
}
/////////////////////////////////////////////////////
export const VueTiCom = {
  install(Vue) {
    //...............................................
    // Mixins
    Vue.mixin(TiComMixin)
    //...............................................
    // Methods
    _.assign(Vue.prototype, TiComMethods)
    //...............................................
    // Filter: i18n
    Vue.filter("i18n", function (val, vars = {}) {
      if (/^i18n:(.+)/.test(val)) {
        return Ti.I18n.textf(val, vars)
      }
      return Ti.I18n.getf(val, vars)
    })
    Vue.filter("i18nTxt", function (val, vars = {}) {
      if (/^i18n:(.+)/.test(val)) {
        return Ti.I18n.textf(val, vars)
      }
      return val
    })
    // Filter: percent
    Vue.filter("percent", function (val, fixed = 2, auto = true) {
      return Ti.S.toPercent(val * 1, { fixed, auto })
    })
    // Filter: float
    Vue.filter("float", function (val, precision = 2, dft = 0.0) {
      return Ti.Types.toFloat(val, { precision, dft })
    })
    // Filter: datetime
    Vue.filter("datetime", function (val, fmt = "yyyy-MM-dd") {
      return Ti.DateTime.format(val, fmt)
    })
    //...............................................
    // Directive: v-drop-files
    //  - value : f() | [f(), "i18n:mask-tip"]
    //  - modifiers : {
    //      mask : Auto show DIV.ti-drag-mask
    //    }
    Vue.directive("dropFiles", {
      bind: function ($el, binding) {
        //console.log("drop-files bind", $el, binding)
        // Preparent Handler / Mask Content
        let handler = null
        let maskHtml = null
        let showMask = binding.modifiers.mask
        if (_.isArray(binding.value)) {
          handler = binding.value.length > 0 ? binding.value[0] : null
          maskHtml = binding.value.length > 1 ? binding.value[1] : null
        }
        // Directly function
        else if (_.isFunction(binding.value)) {
          handler = binding.value
        }
        if (!handler)
          return
        if (showMask) {
          maskHtml = Ti.I18n.text(
            maskHtml || "i18n:drop-file-here-to-upload"
          )
        }
        // Attach Events
        $el.__drag_enter_count = 0
        $el.addEventListener("dragenter", function (evt) {
          if ($el.turnOffTiDropFile) {
            return
          }
          $el.__drag_enter_count++;
          if ($el.__drag_enter_count == 1) {
            //console.log(">>>>>>>>>>>> enter")
            $el.setAttribute("ti-is-drag", "")
            if (showMask) {
              $el.$ti_drag_mask = Ti.Dom.createElement({
                className: "ti-drag-mask",
                $p: $el
              })
              $el.$ti_drag_mask.innerHTML = `<span>${maskHtml}</span>`
            }
          }
        })
        $el.addEventListener("dragover", function (evt) {
          if ($el.turnOffTiDropFile) {
            return
          }
          evt.preventDefault();
          evt.stopPropagation();
        })
        $el.addEventListener("dragleave", function (evt) {
          if ($el.turnOffTiDropFile) {
            return
          }
          $el.__drag_enter_count--;
          if ($el.__drag_enter_count <= 0) {
            //console.log("<<<<<<<<<<<<< leave")
            $el.removeAttribute("ti-is-drag")
            if ($el.$ti_drag_mask) {
              Ti.Dom.remove($el.$ti_drag_mask)
              delete $el.$ti_drag_mask
            }
          }
        })
        $el.addEventListener("drop", function (evt) {
          if ($el.turnOffTiDropFile) {
            return
          }
          evt.preventDefault();
          evt.stopPropagation();
          //console.log("drop:", evt.dataTransfer.files)
          //..........................
          // reset drag tip
          $el.__drag_enter_count = 0
          $el.removeAttribute("ti-is-drag")
          if ($el.$ti_drag_mask) {
            Ti.Dom.remove($el.$ti_drag_mask)
            delete $el.$ti_drag_mask
          }
          //..........................
          if (_.isFunction(handler)) {
            handler(evt.dataTransfer.files)
          }
          //..........................
        })
      }
    })  // ~ Vue.directive("dropFiles", {
    //...............................................
    // Directive: v-drop-off
    Vue.directive("dropOff", {
      bind: function ($el, binding) {
        // console.log("drop-off bind", $el, binding)
        $el.addEventListener("dragover", function (evt) {
          evt.preventDefault();
          evt.stopPropagation();
        })
        $el.addEventListener("drop", function (evt) {
          evt.preventDefault();
          evt.stopPropagation();
        })
      }
    })  // ~ Vue.directive("dropOff"
    //...............................................
    // Directive: v-drag-off
    Vue.directive("dragOff", {
      bind: function ($el, binding) {
        // console.log("drop-off bind", $el, binding)
        $el.addEventListener("dragstart", function (evt) {
          evt.preventDefault();
          evt.stopPropagation();
        })
      }
    })  // ~ Vue.directive("dragOff"
    //...............................................
    // Directive: v-ti-on-actived="this"
    Vue.directive("tiActivable", {
      bind: function ($el, { value }, { context }) {
        let vm = context
        vm.__ti_activable__ = true
        $el.addEventListener("click", function (evt) {
          if (!evt.__ti_activable_used__) {
            evt.__ti_activable_used__ = true
            //console.log(vm.tiComId, evt)
            vm.setActived()
          }
        })
      }
    })
    //...............................................
    // Directive: v-ti-on-actived="this"
    Vue.directive("tiDraggable", {
      bind: function ($el, { value }, { context }) {
        Ti.Be.Draggable($el, value)
      }
    })
    //...............................................
  }
}
/////////////////////////////////////////////////////