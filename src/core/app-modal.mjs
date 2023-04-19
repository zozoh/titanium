export class TiAppModal {
  //////////////////////////////////////////////
  // Attributes
  //////////////////////////////////////////////
  constructor() {
    this.className = undefined;
    this.icon = undefined;
    this.title = undefined;
    // info|warn|error|success|track
    this.type = "info";
    //--------------------------------------------
    this.iconOk = undefined;
    this.textOk = "i18n:ok";
    this.ok = ({ result }) => result;
    //--------------------------------------------
    this.iconCancel = undefined;
    this.textCancel = "i18n:cancel";
    this.cancel = () => undefined;
    //--------------------------------------------
    this.actions = null;
    //--------------------------------------------
    // Modal open and close, transition duration
    // I need know the duration, then delay to mount
    // the main component.
    // Some component will auto resize, it need a static
    // window measurement.
    this.transDelay = 350;
    //--------------------------------------------
    this.comType = "ti-label";
    this.comConf = {};
    this.explainComConf = true;
    this.components = [];
    //--------------------------------------------
    // Aspect
    this.closer = "default"; // true|false | (default|bottom|top|left|right)
    this.escape = true;
    this.mask = true; // !TODO maybe blur or something else
    this.clickMaskToClose = false;
    this.changeToClose = false;
    /*
    validator : (v)=>{
      return /^(left|right|top|bottom|center)$/.test(v)
        || /^((left|right)-top|bottom-(left|right))$/.test(v)
    }
    */
    this.position = "center";
    //--------------------------------------------
    // Measure
    this.width = "6.4rem";
    this.height = undefined;
    this.maxWidth = undefined;
    this.maxHeight = undefined;
    this.minWidth = undefined;
    this.minHeight = undefined;
    this.mainStyle = undefined;
    this.spacing = undefined;
    this.overflow = undefined;
    this.adjustable = false; // true|false|"x"|"y"
    //--------------------------------------------
    // data model
    this.result = undefined;
    this.model = { prop: "value", event: "change" };
    //--------------------------------------------
    // modules
    this.modules = {};
    this.modState = {};
    //--------------------------------------------
    // Events
    this.events = {};
    //--------------------------------------------
    this.topActions = [];
    //--------------------------------------------
    // callback
    this.ready = async function (app) {};
    this.preload = async function (app) {};
    this.beforeClosed = async function (app) {};
  }
  //////////////////////////////////////////////
  // Methods
  //////////////////////////////////////////////
  async open(resolve = _.identity) {
    //console.log("dialog", this.className)
    let TheActions = [];
    // Customized actions
    if (this.actions) {
      TheActions = this.actions;
    }
    // Use OK/Canel
    else {
      if (_.isFunction(this.ok) && this.textOk) {
        TheActions.push({
          icon: this.iconOk,
          text: this.textOk,
          handler: this.ok
        });
      }
      if (_.isFunction(this.cancel) && this.textCancel) {
        TheActions.push({
          icon: this.iconCancel,
          text: this.textCancel,
          handler: this.cancel
        });
      }
    }
    //..........................................
    let model = "";
    if (this.model) {
      let { event, prop } = this.model;
      if (event) {
        model += ` @${event}="OnChange"`;
      }
      if (prop) {
        // 简单映射
        if (_.isString(prop)) {
          model += ` :${prop}="result"`;
        }
        // 数组的话，可以映射多个属性
        else if (_.isArray(prop)) {
          for (let k of prop) {
            model += ` :${k}="result.${k}"`;
          }
        }
        // 复杂映射： prop:{comProp: resultKey}
        else if (_.isObject(prop)) {
          _.forEach(prop, (v, k) => {
            model += ` :${k}="result.${v}"`;
          });
        }
      }
    }
    //..........................................
    let storeModules = _.defaults(
      {
        "viewport": "@mod:ti/viewport"
      },
      this.modules
    );
    //console.log(storeModules)
    //..........................................
    let AppModalEvents = _.cloneDeep(this.events);
    let eventStub = [];
    _.forEach(AppModalEvents, (fn, key) => {
      eventStub.push(`@${key}="OnEvent('${key}', $event)"`);
    });

    //..........................................
    // Setup content
    let html = `<transition :name="TransName" @after-leave="OnAfterLeave">
      <div class="ti-app-modal ${this.className || ""}"
        v-if="!hidden"
          :class="TopClass"
          :style="TopStyle"
          @click.left="OnClickTop"
          v-ti-activable>

          <div class="modal-con" 
            :class="ConClass"
            :style="ConStyle"
            @click.left.stop>

            <div class="modal-head"
              v-if="isShowHead">
                <div class="as-icon" v-if="icon"><ti-icon :value="icon"/></div>
                <div class="as-title">{{title|i18n}}</div>
                <div
                  v-if="hasTopActionBar"
                    class="as-bar">
                      <ti-actionbar
                        :items="topActions"
                        align="right"
                        :status="TopActionBarStatus"/>
                </div>
            </div>

            <div class="modal-main" :style="MainStyle">
              <component
                v-if="comType"
                  class="ti-fill-parent"
                  :class="MainClass"
                  :is="comType"
                  v-bind="TheComConf"
                  :on-init="OnMainInit"
                  ${model}
                  ${eventStub.join(" ")}
                  @close="OnClose"
                  @ok="OnOk"
                  @actions:update="OnActionsUpdated"/>
            </div>

            <div class="modal-actions"
              v-if="hasActions">
                <div class="as-action"
                  v-for="a of actions"
                    @click.left="OnClickActon(a)">
                    <div class="as-icon" v-if="a.icon">
                      <ti-icon :value="a.icon"/></div>
                    <div class="as-text">{{a.text|i18n}}</div>
                </div>
            </div>

            <div class="modal-closer"
              v-if="hasCloser"
                :class="CloserClass">
                  <ti-icon value="zmdi-close" @click.native="OnClose"/>
            </div>
        </div>
    </div></transition>`;
    //..........................................
    // Prepare the app info
    let appInfo = {
      name: "app.modal",
      //////////////////////////////////////////
      template: html,
      components: this.components,
      //////////////////////////////////////////
      data: {
        hidden: true,
        //--------------------------------------
        icon: this.icon,
        title: this.title,
        type: this.type,
        //--------------------------------------
        ready: this.ready,
        beforeClosed: this.beforeClosed,
        //--------------------------------------
        actions: TheActions,
        //--------------------------------------
        topActions: this.topActions,
        //--------------------------------------
        // comType : this.comType,
        // Delay set the comType to mount the main
        // for the open/close transition duration
        comType: null,
        comConf: this.comConf,
        explainComConf: this.explainComConf,
        //--------------------------------------
        closer: this.closer,
        escape: this.escape,
        mask: this.mask,
        position: this.position,
        clickMaskToClose: this.clickMaskToClose,
        changeToClose: this.changeToClose,
        //--------------------------------------
        width: this.width,
        height: this.height,
        maxWidth: this.maxWidth,
        maxHeight: this.maxHeight,
        minWidth: this.minWidth,
        minHeight: this.minHeight,
        mainStyle: this.mainStyle,
        spacing: this.spacing,
        overflow: this.overflow,
        adjustable: this.adjustable,
        //--------------------------------------
        result: _.cloneDeep(this.result)
      },
      //////////////////////////////////////////
      store: {
        modules: storeModules
      },
      //////////////////////////////////////////
      computed: {
        //--------------------------------------
        TopClass() {
          let nilHeight = Ti.Util.isNil(this.height);
          return this.getTopClass(
            {
              "show-mask": this.isShowMask,
              "no-mask": !this.isShowMask,
              "has-height": !nilHeight,
              "nil-height": nilHeight
            },
            `at-${this.position}`
          );
        },
        //--------------------------------------
        TopStyle() {
          if ("center" != this.position) {
            return {
              "padding": Ti.Css.toSize(this.spacing)
            };
          }
        },
        //--------------------------------------
        MainStyle() {
          return Ti.Css.toStyle(this.mainStyle);
        },
        //--------------------------------------
        TransName() {
          return `app-modal-trans-at-${this.position}`;
        },
        //--------------------------------------
        isShowHead() {
          return this.icon || this.title || this.hasTopActionBar;
        },
        //--------------------------------------
        hasTopActionBar() {
          return !_.isEmpty(this.topActions);
        },
        //--------------------------------------
        isShowMask() {
          return this.mask ? true : false;
        },
        //--------------------------------------
        hasActions() {
          return !_.isEmpty(this.actions);
        },
        //--------------------------------------
        hasCloser() {
          return this.closer ? true : false;
        },
        //--------------------------------------
        isCloserDefault() {
          return true === this.closer || "default" == this.closer;
        },
        //--------------------------------------
        ConClass() {
          return Ti.Css.mergeClassName(
            {
              "is-show-header": this.isShowHead,
              "is-hide-header": !this.isShowHead,
              "is-show-actions": this.hasActions,
              "is-hide-actions": !this.hasActions,
              "is-closer-default": this.isCloserDefault,
              "has-top-action-bar": this.hasTopActionBar
            },
            `is-${this.type}`
          );
        },
        //--------------------------------------
        ConStyle() {
          return Ti.Css.toStyle({
            width: this.width,
            height: this.height,
            maxWidth: this.maxWidth,
            maxHeight: this.maxHeight,
            minWidth: this.minWidth,
            minHeight: this.minHeight
          });
        },
        //--------------------------------------
        MainClass() {
          return Ti.Css.mergeClassName(`modal-type-is-${this.type}`);
        },
        //--------------------------------------
        Main() {
          return this.$store.state.main;
        },
        //--------------------------------------
        State() {
          return this.$store.state;
        },
        //--------------------------------------
        RootState() {
          return this.$store.state;
        },
        //--------------------------------------
        RootGetter() {
          return this.$store.getters;
        },
        //--------------------------------------
        TopActionBarStatus() {
          return _.get(this.Main, "status");
        },
        //--------------------------------------
        CloserClass() {
          return Ti.Css.mergeClassName({
            "as-lamp-cord": !this.isCloserDefault,
            "as-default": this.isCloserDefault,
            [`at-${this.closer}`]: !this.isCloserDefault
          });
        },
        //--------------------------------------
        TheComConf() {
          if (this.explainComConf) {
            return Ti.Util.explainObj(this, this.comConf);
          }
          return this.comConf;
        }
        //--------------------------------------
      },
      //////////////////////////////////////////
      methods: {
        //--------------------------------------
        // Events
        //--------------------------------------
        OnClickTop() {
          if (this.clickMaskToClose) {
            this.hidden = true;
          }
        },
        //--------------------------------------
        OnClose() {
          this.close();
        },
        //--------------------------------------
        OnOk(re) {
          if (_.isUndefined(re)) {
            re = this.result;
          }
          this.close(re);
        },
        //--------------------------------------
        OnChange(newVal) {
          this.result = newVal;
          if (this.changeToClose) {
            this.close(this.result);
          }
        },
        //--------------------------------------
        OnActionsUpdated(actions = []) {
          this.topActions = actions;
          Ti.App(this).reWatchShortcut(actions);
        },
        //--------------------------------------
        OnEvent(key, payload) {
          console.log(key, payload)
          let fn = _.get(AppModalEvents, key);
          fn.apply(this, [payload]);
        },
        //--------------------------------------
        async OnClickActon(a) {
          // Guard
          if (!a) {
            return;
          }
          let app = Ti.App(this);
          let status = { close: true };
          let $body = app.$vm();
          let re;
          if (_.isFunction(a.handler)) {
            re = await a.handler({
              $app: app,
              $body,
              $main: $body.$main,
              result: _.cloneDeep($body.result),
              status
            });
          }
          // Close and set result
          if (status.close) {
            this.close(re);
          }
          // Just set result
          else if (!_.isUndefined(re)) {
            this.setResult(re);
          }
        },
        //--------------------------------------
        OnAfterLeave() {
          Ti.App(this).destroy(true);
          resolve(this.returnValue);
        },
        //--------------------------------------
        OnMainInit($main) {
          let app = Ti.App(this);
          this.$main = $main;
          app.$vmMain($main);
          // Watch escape
          if (this.escape) {
            app.watchShortcut([
              {
                action: "root:close",
                shortcut: "ESCAPE"
              }
            ]);
          }
          // Active current
          this.setActived();
          // Report ready
          this.ready(app);
        },
        //--------------------------------------
        // Dispatch Events
        //--------------------------------------
        __ti_shortcut(uniqKey) {
          if (this.$main && _.isFunction(this.$main.__ti_shortcut)) {
            return this.$main.__ti_shortcut(uniqKey);
          }
        },
        //--------------------------------------
        // Utility
        //--------------------------------------
        close(re) {
          if (!_.isUndefined(re)) {
            this.returnValue = re;
          }
          this.hidden = true; // -> trans -> beforeDestroy
        },
        //--------------------------------------
        setResult(result) {
          this.returnValue = result;
        }
        //--------------------------------------
      },
      //////////////////////////////////////////
      mounted: function () {
        let app = Ti.App(this);
        Ti.App.pushInstance(app);
        this.$nextTick(() => {
          this.hidden = false;
        });
      },
      //////////////////////////////////////////
      beforeDestroy: async function () {
        let app = Ti.App(this);
        if (_.isFunction(this.beforeClosed)) {
          await this.beforeClosed(app);
        }
        Ti.App.pullInstance(app);
      }
      //////////////////////////////////////////
    }; // let appInfo = {
    //..........................................
    // create TiApp
    let app = Ti.App(appInfo, (conf) => {
      _.forEach(this.modState, ({ state, merge } = {}, modName) => {
        //console.log(modName)
        let mod = _.get(conf, `store.modules.${modName}`);
        if (mod && mod.state) {
          if (merge) {
            _.merge(mod.state, state);
          } else {
            _.assign(mod.state, state);
          }
        }
      });
    });
    //..........................................
    await app.init();
    //..........................................
    // Mount to stub
    let $stub = Ti.Dom.createElement({
      $p: document.body,
      className: "the-stub"
    });
    //..........................................
    await this.preload(app);
    //..........................................
    app.mountTo($stub);
    // The set the main com
    _.delay(() => {
      app.$vm().comType = this.comType;
    }, this.transDelay || 0);
    //..........................................

    // Then it was waiting the `close()` be invoked
    //..........................................
  } // ~ open()
  //////////////////////////////////////////
}
