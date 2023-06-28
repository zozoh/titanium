const _M = {
  /////////////////////////////////////////
  data: () => ({
    collapse: true,
    dropReady: false,
    /*{
      core: "Unkown",
      app: "???"
    } */
    version: undefined
  }),
  /////////////////////////////////////////
  props: {
    "me": {
      type: Object,
      default: null
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass();
    },
    //--------------------------------------
    MyThumb() {
      return _.get(this.me, "thumb");
    },
    //--------------------------------------
    MySex() {
      return _.get(this.me, "sex") || 0;
    },
    //--------------------------------------
    MyLang() {
      return _.get(this.me, "LANG") || "zh-cn";
    },
    //--------------------------------------
    MyAvatarSrc() {
      return "/o/content?str=${thumb}";
    },
    //--------------------------------------
    hasSession() {
      return this.me ? true : false;
    },
    //--------------------------------------
    canLoginDomainSubAccount() {
      return Wn.Session.I_am_SysAccount();
    },
    //--------------------------------------
    LangList() {
      return [
        {
          lang: "en-us",
          text: "English",
          className: { "is-current": "en-us" == this.MyLang },
          src: "/gu/rs/ti/icons/png/lang-en-us.png"
        },
        {
          lang: "zh-cn",
          text: "简体",
          className: { "is-current": "zh-cn" == this.MyLang },
          src: "/gu/rs/ti/icons/png/lang-zh-cn.png"
        },
        {
          lang: "zh-hk",
          text: "繁體",
          className: { "is-current": "zh-hk" == this.MyLang },
          src: "/gu/rs/ti/icons/png/lang-zh-hk.png"
        }
      ];
    },
    //--------------------------------------
    TheLoginIcon() {
      if (this.MyThumb) {
        return {
          type: "image",
          iconClass: "as-thumb",
          value: `/o/content?str=${this.MyThumb}`
        };
      }

      if (2 == this.MySex) {
        return "im-user-female";
      }

      if (1 == this.MySex) {
        return "im-user-male";
      }

      return "im-user-circle";
    },
    //--------------------------------------
    DropStyle() {
      if (this.dropReady) {
        return {
          "visibility": "visible"
        };
      }
    },
    //--------------------------------------
    VersionInfo() {
      let info = this.version || {
        core: "Unkown",
        titanium: Ti.Version(),
        app: "???"
      };
      return [
        `Core: ${info.core}`,
        `Ti: ${info.titanium}`,
        `App: ${info.app}`
      ].join(" ");
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    async OnLoginDomainAccount() {
      let uname = await Ti.Prompt("Domain Account Login Name", {
        type: "info",
        icon: "fas-user"
      });
      // User Cancel
      uname = _.trim(uname);
      if (!uname) {
        return;
      }
      uname = uname.replaceAll(/^(['"$ \t;<>()])$/g, "");

      // Process Login
      let se = await Wn.Sys.exec2(`login -cqn -site true '${uname}'`, {
        as: "json"
      });
      if (se instanceof Error) {
        return;
      }

      // Change session
      let { ticket } = se;
      let re = await Ti.Http.get("/u/ajax/chse", { params: { seid: ticket } });
      console.log(re);

      // Login Ok : Redirect
      Ti.Be.Open("/", { target: "_self" });
    },
    //--------------------------------------
    OnResetPassword() {
      this.collapse = true;
      Ti.App(this).dispatch("session/openResetPasswd");
    },
    //--------------------------------------
    OnShowMore() {
      this.collapse = false;
      this.tryLoadVersion();
    },
    //--------------------------------------
    async tryLoadVersion() {
      if (!this.version) {
        this.version = { core: "Loading" };
        let sysInfo = await Wn.Sys.exec2("sys -runtime -cqn", { as: "json" });
        let core = sysInfo.nodeVersionNumber;

        let oV = await Wn.Io.loadMeta("~/.ti/version.json");
        let app = "???";
        if (oV) {
          let ver = await Wn.Io.loadContent(oV, { as: "json" });
          app = Ti.Tmpl.exec("${name}-${version}", ver);
        }
        this.version = { core, titanium: Ti.Version(), app };
      }
    },
    //--------------------------------------
    async OnChangeLang(lang) {
      if (this.MyLang != lang) {
        await Wn.Sys.exec(`me -set LANG=${lang}`);
        window.location.reload();
      }
    },
    //--------------------------------------
    dockDrop() {
      let $drop = this.$refs.drop;
      let $info = this.$refs.info;
      // Guard the elements
      if (!_.isElement($drop) || !_.isElement($info) || this.collapse) {
        return;
      }
      // Dock
      Ti.Dom.dockTo($drop, $info, {
        space: { y: 2 }
      });
      _.delay(() => {
        this.dropReady = true;
      }, 10);
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "collapse": {
      handler: function (newVal, oldVal) {
        if (!newVal && newVal != oldVal) {
          _.delay(() => {
            this.dockDrop();
          }, 0);
        }
        // Collapse
        else if (newVal) {
          this.dropReady = false;
        }
      },
      immediate: true
    }
  }
  //////////////////////////////////////////
};
export default _M;
