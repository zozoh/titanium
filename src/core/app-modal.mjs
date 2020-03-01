export class TiAppModal {
  //////////////////////////////////////////////
  // Attributes
  //////////////////////////////////////////////
  icon   = undefined
  title  = "i18n:modal"
  // info|warn|error|success|track
  type   = "info"
  //--------------------------------------------
  // Behavior
  ready  = _.identity
  actions = [{
      text: 'i18n:ok',
      handler : _.identity
    }, {
      text: 'i18n:cancel',
      handler : _.identity
    }]
  //--------------------------------------------
  comType = "ti-label"
  comConf = {}
  //--------------------------------------------
  // Aspect
  closer = "default"  // true|false | (default|bottom|top|left|right)
  mask   = true       // !TODO maybe blur or something else
  clickMaskToClose = false
  /*
  validator : (v)=>{
    return /^(left|right|top|bottom|center)$/.test(v)
      || /^((left|right)-top|bottom-(left|right))$/.test(v)
  }
  */
  position = "center"
  //--------------------------------------------
  // Measure
  width    = undefined
  height   = undefined
  spacing  = undefined
  overflow = undefined
  adjustable = false  // true|false|"x"|"y"

  //////////////////////////////////////////////
  // Methods
  //////////////////////////////////////////////
  async open($stub, resolve=_.identity) {
    //..........................................
    // Setup content
    let html = `<div class="ti-app-modal"
      :class="topClass"
      :style="topStyle"
      @click.left="onClickTop">

      <transition :name="theTransName"
        @after-leave="onAfterLeave">

        <div class="modal-con" 
          v-if="!hidden"
            @click.left.stop>

            <div class="modal-head"
              v-if="isShowHead">
                <div class="as-icon" v-if="icon"><ti-icon :value="icon"/></div>
                <div class="as-title">{{title|i18n}}</div>
            </div>

            <div class="modal-main">
              <component
                class="ti-fill-parent"
                :is="comType"
                v-bind="comConf"
                :on-init="onMainInit"/>
            </div>

            <div class="modal-actions"
              v-if="hasActions">
                <div class="as-action"
                  v-for="a of actions"
                    @click.left="onClickActon(a)">
                    <div class="as-icon" v-if="a.icon">
                      <ti-icon :value="a.icon"/></div>
                    <div class="as-text">{{a.text|i18n}}</div>
                </div>
            </div>

            <div class="modal-closer"
              v-if="hasCloser"
                :class="theCloserClass">
                  <ti-icon value="zmdi-close" @click.native="onClose"/>
            </div>
        </div>

      </transition>
    </div>`
    //..........................................
    // Prepare the app info
    let appInfo = {
      //////////////////////////////////////////
      template : html,
      //////////////////////////////////////////
      data : {
        hidden : true,
        //--------------------------------------
        icon   : this.icon,
        title  : this.title,
        type   : this.type,
        //--------------------------------------
        ready   : this.ready,
        actions : this.actions,
        //--------------------------------------
        comType : this.comType,
        comConf : this.comConf,
        //--------------------------------------
        closer   : this.closer,
        mask     : this.mask,
        position : this.position,
        clickMaskToClose : this.clickMaskToClose,
        //--------------------------------------
        width      : this.width,
        height     : this.height,
        spacing    : this.spacing,
        overflow   : this.overflow,
        adjustable : this.adjustable
      },
      //////////////////////////////////////////
      store : {
        modules : {
          "viewport" : "@mod:ti/viewport"
        }
      },
      //////////////////////////////////////////
      computed : {
        //--------------------------------------
        topClass() {
          return this.getTopClass([
            `at-${this.position}`,
            `is-${this.type}`
          ])
        },
        //--------------------------------------
        topStyle() {
          if('center' != this.position) {
            return {
              "padding" : Ti.Css.toSize(this.spacing)
            }
          }
        },
        //--------------------------------------
        theTransName() {
          return `toast-trans-at-${this.position}`
        },
        //--------------------------------------
        isShowHead() {
          return this.icon || this.title
        },
        //--------------------------------------
        hasActions() {
          return !_.isEmpty(this.actions)
        },
        //--------------------------------------
        hasCloser() {
          return this.closer ? true : false
        },
        //--------------------------------------
        isCloserDefault() {
          return true === this.closer || "default" == this.closer
        },
        //--------------------------------------
        theCloserClass() {
          return Ti.Css.mergeClassName({
            'as-lamp-cord' : !this.isCloserDefault,
            'as-default'   : this.isCloserDefault,
            [`at-${this.closer}`] : !this.isCloserDefault
          })
        }
        //--------------------------------------
      },
      //////////////////////////////////////////
      methods : {
        //--------------------------------------
        onMainInit($main) {this.$main = $main},
        //--------------------------------------
        onClickTop() {
          if(this.clickMaskToClose) {
            this.hidden = true
          }
        },
        //--------------------------------------
        onClose() {
          this.hidden = true
        },
        //--------------------------------------
        async onClickActon(a) {
          if(a.handler) {
            let app = Ti.App(this)
            this.returnValue = await a.handler({
              $app  : app,
              $main : app.$main,
              close : ()=>this.onClose()
            })
          }
        },
        //--------------------------------------
        onAfterLeave() {
          Ti.App(this).destroy();
          Ti.Dom.remove(this.$stub)
          resolve(this.returnValue)
        }
        //--------------------------------------
      },
      //////////////////////////////////////////
      mounted : function() {
        this.$stub = this.$el.parentNode
        this.$nextTick(()=>{
          this.hidden = false
        })
        let app = Ti.App(this)
        Ti.App.pushInstance(app)
      },
      //////////////////////////////////////////
      beforeDestroy : function(){
        let app = Ti.App(this)
        Ti.App.pullInstance(app)
      }
      //////////////////////////////////////////
    }; // let appInfo = {
    //..........................................
    // create TiApp
    let app = Ti.App(appInfo)
    //..........................................
    await app.init()
    //..........................................
    // Mount to stub
    app.mountTo($stub)
    //..........................................
    // Then it was waiting the `close()` be invoked
    //..........................................
  }
  //--------------------------------------------
}