export class TiAppModal {
  //////////////////////////////////////////////
  // Attributes
  //////////////////////////////////////////////
  constructor() {
    this.icon   = undefined
    this.title  = undefined
    // info|warn|error|success|track
    this.type   = "info"
    //--------------------------------------------
    // Behavior
    this.ready  = _.identity
    //--------------------------------------------
    this.iconOk = undefined
    this.textOk = "i18n:ok"
    this.ok = ({result})=>result
    //--------------------------------------------
    this.iconCancel = undefined
    this.textCancel = "i18n:cancel"
    this.cancel = ()=>undefined
    //--------------------------------------------
    this.actions = null
    //--------------------------------------------
    this.comType = "ti-label"
    this.comConf = {}
    this.components = []
    //--------------------------------------------
    // Aspect
    this.closer = "default"  // true|false | (default|bottom|top|left|right)
    this.escape = true
    this.mask   = true       // !TODO maybe blur or something else
    this.clickMaskToClose = false
    /*
    validator : (v)=>{
      return /^(left|right|top|bottom|center)$/.test(v)
        || /^((left|right)-top|bottom-(left|right))$/.test(v)
    }
    */
   this.position = "center"
    //--------------------------------------------
    // Measure
    this.width    = "6.4rem"
    this.height   = undefined
    this.spacing  = undefined
    this.overflow = undefined
    this.adjustable = false  // true|false|"x"|"y"
    //--------------------------------------------
    // data model
    this.result = undefined
    //--------------------------------------------
    // modules
    this.modules = {}
    //--------------------------------------------
    // callback
    this.ready = function(app){}
  }
  //////////////////////////////////////////////
  // Methods
  //////////////////////////////////////////////
  async open(resolve=_.identity) {
    let TheActions = []
    // Customized actions
    if(this.actions) {
      TheActions = this.actions
    }
    // Use OK/Canel
    else {
      if(_.isFunction(this.ok) && this.textOk) {
        TheActions.push({
          icon : this.iconOk,
          text : this.textOk,
          handler : this.ok
        })
      }
      if(_.isFunction(this.cancel) && this.textCancel) {
        TheActions.push({
          icon : this.iconCancel,
          text : this.textCancel,
          handler : this.cancel
        })
      }
    }
    //..........................................
    // Setup content
    let html = `<transition :name="theTransName" @after-leave="onAfterLeave">
      <div class="ti-app-modal"
        v-if="!hidden"
          :class="topClass"
          :style="topStyle"
          @click.left="onClickTop"
          v-ti-activable>

          <div class="modal-con" 
            :class="theConClass"
            :style="theConStyle"
            @click.left.stop>

            <div class="modal-head"
              v-if="isShowHead">
                <div class="as-icon" v-if="icon"><ti-icon :value="icon"/></div>
                <div class="as-title">{{title|i18n}}</div>
            </div>

            <div class="modal-main">
              <component
                class="ti-fill-parent"
                :class="theMainClass"
                :is="comType"
                v-bind="theComConf"
                :on-init="onMainInit"
                v-model="result"/>
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
    </div></transition>`
    //..........................................
    // Prepare the app info
    let appInfo = {
      name : "app.modal",
      //////////////////////////////////////////
      template : html,
      components : this.components,
      //////////////////////////////////////////
      data : {
        hidden : true,
        //--------------------------------------
        icon   : this.icon,
        title  : this.title,
        type   : this.type,
        //--------------------------------------
        ready   : this.ready,
        actions : TheActions,
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
        adjustable : this.adjustable,
        //--------------------------------------
        result : this.result
      },
      //////////////////////////////////////////
      store : {
        modules : _.defaults({
          "viewport" : "@mod:ti/viewport"
        }, this.modules)
      },
      //////////////////////////////////////////
      computed : {
        //--------------------------------------
        topClass() {
          return this.getTopClass({
            "show-mask" : this.isShowMask,
            "no-mask"   : !this.isShowMask,
          }, `at-${this.position}`)
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
          return `app-modal-trans-at-${this.position}`
        },
        //--------------------------------------
        isShowHead() {
          return this.icon || this.title
        },
        //--------------------------------------
        isShowMask() {
          return this.mask ? true : false
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
        theConClass() {
          return Ti.Css.mergeClassName({
            "is-show-header"    : this.isShowHead,
            "is-hide-header"    : !this.isShowHead,
            "is-show-actions"   : this.hasActions,
            "is-hide-actions"   : !this.hasActions,
            "is-closer-default" : this.isCloserDefault
          }, `is-${this.type}`)
        },
        //--------------------------------------
        theConStyle() {
          return Ti.Css.toStyle({
            width  : this.width,
            height : this.height
          })
        },
        //--------------------------------------
        theMainClass() {
          return Ti.Css.mergeClassName(`modal-type-is-${this.type}`)
        },
        //--------------------------------------
        theCloserClass() {
          return Ti.Css.mergeClassName({
            'as-lamp-cord' : !this.isCloserDefault,
            'as-default'   : this.isCloserDefault,
            [`at-${this.closer}`] : !this.isCloserDefault
          })
        },
        //--------------------------------------
        theComConf() {
          return Ti.Util.explainObj(this, this.comConf)
        }
        //--------------------------------------
      },
      //////////////////////////////////////////
      methods : {
        //--------------------------------------
        onClickTop() {
          if(this.clickMaskToClose) {
            this.hidden = true
          }
        },
        //--------------------------------------
        onClose() {
          this.close()
        },
        //--------------------------------------
        close(result) {
          if(!_.isUndefined(result)) {
            this.returnValue = result
          }
          this.hidden = true
        },
        //--------------------------------------
        setResult(result) {
          this.returnValue = result
        },
        //--------------------------------------
        async onClickActon(a) {
          if(a.handler) {
            let app = Ti.App(this)
            let status = {close:true}
            let $body = app.$vm()
            let re = await a.handler({
              $app   : app,
              $body,
              $main  : $body.$main,
              result : _.cloneDeep($body.result),
              status
            })
            if(status.close) {
              this.close(re)
            } else {
              this.setResult(re)
            }
          }
        },
        //--------------------------------------
        onAfterLeave() {
          Ti.App(this).destroy(true);
          resolve(this.returnValue)
        },
        //--------------------------------------
        onMainInit($main) {
          let app = Ti.App(this)
          this.$main = $main;
          app.$vmMain($main);
          // Watch escape
          if(escape) {
            app.watchShortcut([{
              action : "root:close",
              shortcut : "ESCAPE"
            }])
          }
          // Active current
          this.setActived()
        }
        //--------------------------------------
      },
      //////////////////////////////////////////
      mounted : function() {
        let app = Ti.App(this)
        Ti.App.pushInstance(app)
        this.$nextTick(()=>{
          this.hidden = false
        })
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
    let $stub = Ti.Dom.createElement({
      $p : document.body,
      className : "the-stub"
    })
    app.mountTo($stub)
    //..........................................
    await this.ready(app)
    // Then it was waiting the `close()` be invoked
    //..........................................
  } // ~ open()
  //////////////////////////////////////////
}