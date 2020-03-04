export class TiAppModal {
  //////////////////////////////////////////////
  // Attributes
  //////////////////////////////////////////////
  icon   = undefined
  title  = undefined
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
  components = []
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
  width    = "6.4rem"
  height   = undefined
  spacing  = undefined
  overflow = undefined
  adjustable = false  // true|false|"x"|"y"
  //--------------------------------------------
  // modules
  modules = {}
  //--------------------------------------------
  // callback
  ready = function(app){}
  //////////////////////////////////////////////
  // Methods
  //////////////////////////////////////////////
  async open(resolve=_.identity) {
    //..........................................
    // Setup content
    let html = `<transition :name="theTransName" @after-leave="onAfterLeave">
      <div class="ti-app-modal"
        v-if="!hidden"
          :class="topClass"
          :style="topStyle"
          @click.left="onClickTop"
          v-ti-actived="__set_actived">

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
    </div></transition>`
    //..........................................
    // Prepare the app info
    let appInfo = {
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
            let re = await a.handler({
              $app  : app,
              $main : app.$vm().$main,
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
        }
        //--------------------------------------
      },
      //////////////////////////////////////////
      mounted : function() {
        this.$nextTick(()=>{
          this.hidden = false
        })
        let app = Ti.App(this)
        Ti.App.pushInstance(app)
        this.setActived()
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
  } // ~ methods
  //////////////////////////////////////////
}