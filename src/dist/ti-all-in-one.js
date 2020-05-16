(function(){
//============================================================
// JOIN: net/aliyun/vod/manager/vod-manager.html
//============================================================
Ti.Preload("ti/com/net/aliyun/vod/manager/vod-manager.html", `<ti-gui
  class="net-aliyun-vod-manager"
  :class="TopClass"
  :layout="GuiLayout"
  :schema="GuiSchema"
  :can-loading="true"
  :loading-as="reloading"
  @filter::change="OnFilterChange"
  @list::select="OnListSelect"
  @video::preview="OnVideoPreview"/>`);
//============================================================
// JOIN: net/aliyun/vod/manager/vod-manager.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////////////////
  data : ()=>({
    reloading: false,
    list: [],
    pager: {},
    scrollToken: null,
    myCurrentId: null,
    myCurrentVideo: null
  }),
  ///////////////////////////////////////////////////////
  props : {
    "meta": {
      type: Object,
      default: ()=>({})
    },
    "fields": {
      type: String,
      default: "Title,CoverURL,Duration,CateName,Size,Description,RegionID"
    },
    "pageSize": {
      type: Number,
      default: 20
    },
    "multi": {
      type: Boolean,
      default: true
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass();
    },
    //---------------------------------------------------
    ConfName() {
      return _.get(this.meta, "vodConfigName")
    },
    //---------------------------------------------------
    CmdPrefix() {
      if(this.ConfName) {
        return `aliyunvod ${this.ConfName}`
      }
      return "aliyunvod"
    },
    //---------------------------------------------------
    WallItemDisplay() {
      return {
        key : "..",
        comType : 'ti-obj-thumb',
        comConf : it => ({
          id: it.videoId,
          title: it.title,
          preview: {
            type: "image",
            value: it.coverURL
          } 
        })
      }
    },
    //---------------------------------------------------
    GuiLayout(){
      return {
        type: "cols",
        border:true,
        blocks: [{
            type:"rows",
            size:"61.8%",
            border:true,
            blocks: [{
                name: "filter",
                size: 40,
                body: "pcFilter"
              }, {
                name: "list",
                body: "pcList"
              }, {
                name: "pager",
                size: 40,
                body: "pcPager"
              }]
          }, {
            icon: "zmdi-tv-alt-play",
            title: "i18n:video",
            name: "video",
            body: "pcVideo"
          }]
      }
    },
    //---------------------------------------------------
    GuiSchema() {
      return {
        pcFilter: {
          comType: "ti-combo-filter",
          comConf: {
            className: "as-spacing-tiny",
            placeholder: "i18n:net-flt-nil",
            form: {
              fields: [{
                title: "i18n:net-ct",
                name: "createTime",
                type: "Array",
                comType: "ti-input-daterange",
                comConf: {}
              }]
            }
          }
        },
        pcList: {
          comType: "ti-wall",
          comConf: {
            data: this.list,
            idBy: "videoId",
            multi: this.multi,
            display: this.WallItemDisplay
          }
        },
        pcPager: {
          comType : "ti-paging-jumper",
          comConf : {
            value : this.pager
          }
        },
        pcVideo: {
          comType: "net-aliyun-vod-video-info",
          comConf: {
            value: this.myCurrentVideo
          }
        }
      }
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods :{
    //---------------------------------------------------
    OnFilterChange(payload) {
      console.log("FilterChange", payload)
    },
    //---------------------------------------------------
    async OnListSelect({currentId, checkedIds, checked}) {
      this.myCurrentId = currentId
      // Select some thing
      if(currentId) {
        this.myCurrentVideo = await this.reloadVideoInfo(currentId)
        this.$notify("change", {
          currentId  : this.myCurrentId,
          current    : this.myCurrentVideo,
          checkedIds, checked
        })
      }
      // Select nothing
      else {
        this.myCurrentVideo = null
        this.$notify("change", undefined)
      }
    },
    //---------------------------------------------------
    async OnVideoPreview({title, videoId, coverURL}={}){
      // Request the playAuth
      let playAuth = await this.requestPlayAuth(videoId)

      // Open player
      await Ti.App.Open({
        icon: "zmdi-tv-alt-play",
        title: `Preview: ${title}`,
        textOk: null,
        textCancel: "i18n:close",
        position: "top",
        width: "90%",
        height: "90%",
        comType: "NetAliyunVodVideoPlayer",
        comConf: {
          videoId, playAuth,
          coverUrl: coverURL
        },
        components: "@com:net/aliyun/vod/video/player"
      })
    },
    //---------------------------------------------------
    async requestPlayAuth(videoId) {
      this.reloading = true
      let cmds = [this.CmdPrefix, "playauth", videoId, "-cqn"]
      let reo = await Wn.Sys.exec2(cmds.join(" "), {as:"json"})
      this.reloading = false

      return reo.playAuth
    },
    //---------------------------------------------------
    async reloadVideoInfo(videoId) {
      this.reloading = true
      let cmds = [this.CmdPrefix, "video", videoId, "-cqn"]
      let reo = await Wn.Sys.exec2(cmds.join(" "), {as:"json"})
      this.reloading = false

      return reo
    },
    //---------------------------------------------------
    async reloadVideos() {
      this.reloading = true
      // prepare the command
      let cmds = [this.CmdPrefix]
      cmds.push("search", "-fields", `'${this.fields}'`)
      cmds.push("-pgsz", this.pageSize)
      cmds.push("-as page -cqn")

      // Run
      let reo = await Wn.Sys.exec2(cmds.join(" "), {as:"json"})
      this.list  = reo.list
      this.pager = reo.pager
      this.scrollToken = reo.scrollToken

      // Mark
      this.reloading = false
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  mounted : function() {
    this.reloadVideos()
  }
  ///////////////////////////////////////////////////////
}
Ti.Preload("ti/com/net/aliyun/vod/manager/vod-manager.mjs", _M);
})();
//============================================================
// JOIN: net/aliyun/vod/manager/_com.json
//============================================================
Ti.Preload("ti/com/net/aliyun/vod/manager/_com.json", {
  "name" : "net-aliyun-vod-manager",
  "globally" : true,
  "template" : "./vod-manager.html",
  "mixins" : ["./vod-manager.mjs"],
  "components": [
    "@com:ti/wall",
    "@com:ti/combo/filter",
    "@com:ti/paging/jumper",
    "@com:net/aliyun/vod/video/info"
  ]
});
//============================================================
// JOIN: net/aliyun/vod/video/info/vod-video-info.html
//============================================================
Ti.Preload("ti/com/net/aliyun/vod/video/info/vod-video-info.html", `<div class="net-aliyun-vod-video-info"
  :class="TopClass">
  <!--
    Blank
  -->
  <ti-loading
    v-if="!hasVideo"
      icon="fas-hand-point-left"
      text="i18n:net-vod-video-nil"/>
  <!--
    Show Content
  -->
  <template v-else>
    <!--Preview-->
    <div class="as-preview">
      <img 
        class="ti-fill-parent"
        :src="VideoCoverURL"/>
      <div class="as-btn" @click.left="OnClickPreview">
        <i class="fas fa-play-circle"></i>
      </div>
    </div>
    <!--
      Detail info
    -->
    <div class="as-detail">
      <ti-form
        class="ti-cover-parent"
        spacing="tiny"
        :fields="FormFields"
        :data="value"/>
    </div>
  </template>
</div>`);
//============================================================
// JOIN: net/aliyun/vod/video/info/vod-video-info.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////////////////
  props : {
    "value": {
      type: Object,
      default: undefined
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass();
    },
    //---------------------------------------------------
    hasVideo() {
      return this.value ? true : false
    },
    //---------------------------------------------------
    VideoCoverURL() {
      return _.get(this.value, "coverURL")
    },
    //---------------------------------------------------
    FormFields() {
      return [{
        title : "VideoID",
        name  : "videoId"
      }, {
        title : "Title",
        name  : "title"
      }, {
        title : "CateName",
        name  : "cateName"
      }, {
        title : "Description",
        name  : "description"
      }, {
        title : "Duration",
        name  : "duration"
      }, {
        title : "RegionId",
        name  : "regionId"
      }, {
        title : "Size",
        name  : "size"
      }, {
        title : "Status",
        name  : "status"
      }, {
        title : "Tags",
        name  : "tags"
      }, {
        title : "AuditStatus",
        name  : "auditStatus"
      }, {
        title : "DownloadSwitch",
        name  : "downloadSwitch"
      }, {
        title : "PreprocessStatus",
        name  : "preprocessStatus"
      }, {
        title : "CreateTime",
        name  : "createTime"
      }, {
        title : "ModifyTime",
        name  : "modifyTime"
      }]
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods :{
    //---------------------------------------------------
    OnClickPreview(){
      this.$notify("preview", this.value)
    }
    //---------------------------------------------------
  }
  ///////////////////////////////////////////////////////
}
Ti.Preload("ti/com/net/aliyun/vod/video/info/vod-video-info.mjs", _M);
})();
//============================================================
// JOIN: net/aliyun/vod/video/info/_com.json
//============================================================
Ti.Preload("ti/com/net/aliyun/vod/video/info/_com.json", {
  "name" : "NetAliyunVodVideoInfo",
  "globally" : true,
  "template" : "./vod-video-info.html",
  "mixins" : ["./vod-video-info.mjs"],
  "components": [
    "@com:ti/form"
  ]
});
//============================================================
// JOIN: net/aliyun/vod/video/player/vod-video-player.html
//============================================================
Ti.Preload("ti/com/net/aliyun/vod/video/player/vod-video-player.html", `<div class="net-vod-video-player"
  :class="TopClass">
  <div :id="PlayerID"></div>
</div>`);
//============================================================
// JOIN: net/aliyun/vod/video/player/vod-video-player.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////////////////
  props : {
    "autoplay": {
      type: Boolean,
      default: true
    },
    "videoId": {
      type: String,
      default: undefined
    },
    "coverUrl": {
      type: String,
      default: undefined
    },
    "playAuth": {
      type: String,
      default: undefined
    },
    "encryptType": {
      type: Number,
      default: undefined
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass();
    },
    //---------------------------------------------------
    PlayerID() {
      let n = parseInt(Math.random()* 100000);
      return `ALIPLAYER_${n}`
    },
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods :{
    //---------------------------------------------------
    initPlayer() {
      if(!this.$player
        && this.playAuth
        && this.videoId
        && this.coverUrl) {

        // console.log("haha", {
        //   playAuth: this.playAuth,
        //   videoId: this.videoId,
        //   coverUrl: this.coverUrl
        // })

        this.$player = new Aliplayer({
          id: this.PlayerID,
          width: "100%",
          height: "100%",
          autoplay: this.autoplay,
          vid: this.videoId,
          cover: this.coverUrl,
          encryptType: this.encryptType,
          playauth : this.playAuth
        })
      }
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  watch: {
    // "playAuth": function() {
    //   this.$nextTick(()=>this.initPlayer())
    // },
    // "videoId": function() {
    //   this.$nextTick(()=>this.initPlayer())
    // },
    // "coverUrl": function() {
    //   this.$nextTick(()=>this.initPlayer())
    // }
  },
  ///////////////////////////////////////////////////////
  mounted: function(){
    this.initPlayer();
  }
  ///////////////////////////////////////////////////////
}
Ti.Preload("ti/com/net/aliyun/vod/video/player/vod-video-player.mjs", _M);
})();
//============================================================
// JOIN: net/aliyun/vod/video/player/_com.json
//============================================================
Ti.Preload("ti/com/net/aliyun/vod/video/player/_com.json", {
  "name" : "NetAliyunVodVideoPlayer",
  "globally" : true,
  "template" : "./vod-video-player.html",
  "mixins" : ["./vod-video-player.mjs"],
  "components": [
    
  ]
});
//============================================================
// JOIN: ti/actionbar/com/bar-item-action/bar-item-action.html
//============================================================
Ti.Preload("ti/com/ti/actionbar/com/bar-item-action/bar-item-action.html", `<div class="bar-item-action">
  <bar-item-info
    v-bind="this"
    @fire="OnFired"/>
</div>`);
//============================================================
// JOIN: ti/actionbar/com/bar-item-action/bar-item-action.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////
  inject: ["$bar"],
  ///////////////////////////////////////
  props : {
    //-----------------------------------
    // Same as <bar-item-info>
    //-----------------------------------
    "name": {
      type: String,
      default: undefined
    },
    "icon": {
      type: String,
      default: undefined
    },
    "hideIcon" : {
      type: Boolean,
      default: false
    },
    "text": {
      type: String,
      default: undefined
    },
    "tip": {
      type: String,
      default: undefined
    },
    "altDisplay" : {
      type: [Object, Array],
      default: ()=>[]
    },
    "enabled": {
      type: [String, Array, Object],
      default: undefined
    },
    "disabled": {
      type: [String, Array, Object],
      default: undefined
    },
    "highlight": {
      type: [String, Array, Object],
      default: undefined
    },
    "value" : {
      type: [Boolean, String, Number, Array],
      default: true
    },
    "depth": {
      type: Number,
      default: 0
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
    //-----------------------------------
    // Self Props
    //-----------------------------------
    "action" : {
      type : [String, Object, Function],
      default: undefined
    },
    "notify" : {
      type : [Boolean, String],
      default: false
    },
    "wait" : {
      type : Number,
      default: 0
    },
    "shortcut": {
      type: String,
      default: undefined
    }
  },
  ///////////////////////////////////////
  computed: {
    notifyName() {
      if(this.notify) {
        return _.isString(this.notify)
                ? this.notify
                : this.name;
      }
    }
  },
  ///////////////////////////////////////
  methods : {
    OnFired(val) {
      // Call Action
      if(this.action) {
        let app = Ti.App(this)
        let currentData = app.currentData()
        let invoking = Ti.Shortcut.genActionInvoking(this.action, {
          $com : this.$bar.$parent,
          argContext : currentData,
          wait : this.wait
        })
        // Invoke it
        invoking()
      }

      // notify
      if(this.notifyName) {    
        this.$bar.notifyChange({
          name  : this.notifyName,
          value : val
        })
      }
    }
  },
  ///////////////////////////////////////
  mounted : function() {
    if(this.shortcut) {
      Ti.App(this).guardShortcut(this, this.shortcut, ()=>{
        return this.isEnabled
      })
    }
  },
  ///////////////////////////////////////
  destroyed : function(){
    if(this.shortcut) {
      Ti.App(this).pulloutShortcut(this)
    }
  }
  ///////////////////////////////////////
}
Ti.Preload("ti/com/ti/actionbar/com/bar-item-action/bar-item-action.mjs", _M);
})();
//============================================================
// JOIN: ti/actionbar/com/bar-item-action/_com.json
//============================================================
Ti.Preload("ti/com/ti/actionbar/com/bar-item-action/_com.json", {
  "name" : "bar-item-action",
  "template" : "./bar-item-action.html",
  "mixins"   : ["./bar-item-action.mjs"]
});
//============================================================
// JOIN: ti/actionbar/com/bar-item-group/bar-item-group.html
//============================================================
Ti.Preload("ti/com/ti/actionbar/com/bar-item-group/bar-item-group.html", `<div class="bar-item-group"
  :class="TopClass"
  @mouseenter.stop="OnMouseEnter"
  @mouseleave.stop="OnMouseLeave">
  <!--
    Info
  -->
  <bar-item-info
    v-if="hasInfo"
      v-bind="this"
      :value="collapse"
      :status="status"
      @fire="OnFired"/>
  <!--
    Group Children
  -->
  <template v-if="showChildren">
    <div v-if="isDepth1"
      class="as-mask"
      @click="doCollapse"></div>
    <div ref="children"
      v-if="showChildren"
        class="as-children"
        :style="ChildrenStyle"
        @click.left="doCollapse">
          <component 
            v-for="bi in items"
              :key="bi.key"
              :is="bi.comType"
              v-bind="bi.comConf"
              :depth="depth+1"
              :items="bi.items"
              :hide-icon="isChildrenWithoutIcon"
              :status="status"/>
    </div>
  </template>
</div>`);
//============================================================
// JOIN: ti/actionbar/com/bar-item-group/bar-item-group.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////
  inject: ["$bar"],
  ///////////////////////////////////////////
  provide : function(){
    return {depth: this.depth+1}
  },
  ///////////////////////////////////////
  data : ()=>({
    collapse : true,
    isDocked : false,
    barItems : []
  }),
  ///////////////////////////////////////
  props : {
    //-----------------------------------
    // Same as <bar-item-info>
    //-----------------------------------
    "name": {
      type: String,
      default: undefined
    },
    "icon": {
      type: String,
      default: undefined
    },
    "hideIcon" : {
      type: Boolean,
      default: false
    },
    "text": {
      type: String,
      default: undefined
    },
    "tip": {
      type: String,
      default: undefined
    },
    "altDisplay" : {
      type: [Object, Array],
      default: ()=>[]
    },
    "enabled": {
      type: [String, Array, Object],
      default: undefined
    },
    "disabled": {
      type: [String, Array, Object],
      default: undefined
    },
    "highlight": {
      type: [String, Array, Object],
      default: undefined
    },
    "depth": {
      type: Number,
      default: 0
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
    //-----------------------------------
    // Self Props
    //-----------------------------------
    "items": {
      type: Array,
      default: ()=>[]
    },
    "autoExtend": {
      type: Boolean,
      default: false
    }
  },
  ///////////////////////////////////////////
  computed : {
    //---------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-collapse" : this.collapse,
        "is-extended" : !this.collapse
      },`is-depth-${this.depth}`)
    },
    //---------------------------------------
    isDepth0() {return 0 == this.depth},
    isDepth1() {return 1 == this.depth},
    isDepthX() {return this.depth > 1},
    //---------------------------------------
    hasInfo() {
      return this.icon || this.text
    },
    //---------------------------------------
    isChildrenWithoutIcon() {
      for(let it of this.items) {
        if(it.comConf && it.comConf.icon) {
          return false
        }
      }
      return true
    },
    //---------------------------------------
    showChildren() {
      return this.isDepth0 || !this.collapse
    },
    //---------------------------------------
    ChildrenStyle() {
      if(!this.isDepth0) {
        if(!this.isDocked) {
          return {"visibility": "hidden"}
        }
      }
    }
    //---------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //---------------------------------------
    OnMouseEnter() {
      if(this.isDepthX) {
        this.doExtend()
      }
    },
    //---------------------------------------
    OnMouseLeave() {
      if(this.isDepthX) {
        this.doCollapse()
      }
    },
    //---------------------------------------
    OnFired(collapse) {
      if(collapse) {
        this.doExtend()
      } else {
        this.doCollapse()
      }
    },
    //---------------------------------------
    doExtend() {
      this.collapse = false
      //this.$bar.notifyChange({name:this.name, value:true})
    },
    //---------------------------------------
    doCollapse() {
      this.collapse = true
      this.isDocked = false
      //this.$bar.notifyChange({name:this.name, value:false})
    },
    //---------------------------------------
    doDockChildren() {
      this.$nextTick(()=>{
        if(this.$refs.children && this.depth>0) {
          Ti.Dom.dockTo(this.$refs.children, this.$el, {
            mode : this.isDepthX ? "V" : "H",
            position : "fixed",
            space: this.isDepthX ? {x:1} : {y:3}
          })
          _.delay(()=>{
            this.isDocked = true
          }, 5)
        }
      })
    }
    //---------------------------------------
  },
  ///////////////////////////////////////////
  watch: {
    "collapse": "doDockChildren"
  },
  ///////////////////////////////////////////
  mounted: function(){
    this.doDockChildren()
    this.$bar.allocGroup(this)
  },
  ///////////////////////////////////////////
  beforeDestroy: function() {
    this.$bar.freeGroup(this)
  }
  ///////////////////////////////////////////
}
Ti.Preload("ti/com/ti/actionbar/com/bar-item-group/bar-item-group.mjs", _M);
})();
//============================================================
// JOIN: ti/actionbar/com/bar-item-group/_com.json
//============================================================
Ti.Preload("ti/com/ti/actionbar/com/bar-item-group/_com.json", {
  "name" : "bar-item-group",
  "template" : "./bar-item-group.html",
  "mixins"   : ["./bar-item-group.mjs"]
});
//============================================================
// JOIN: ti/actionbar/com/bar-item-info/bar-item-info.html
//============================================================
Ti.Preload("ti/com/ti/actionbar/com/bar-item-info/bar-item-info.html", `<div class="bar-item-info"
  :class="TopClass"
  @click.left="OnClickTop">
  <!--
    Icon
  -->
  <span
    v-if="isShowIcon"
      class="as-icon">
      <ti-icon
        v-if="hasIcon" 
          :value="CurrentDisplay.icon"/>
  </span>
  <!--
    Text
  -->
  <span
    v-if="CurrentDisplay.text"
      class="as-text"
        >{{CurrentDisplay.text|i18n}}</span>
  <!--
    Shortcut
  -->
  <span
    v-if="isShowShortcut"
      class="as-shortcut">{{shortcut}}</span>
</div>`);
//============================================================
// JOIN: ti/actionbar/com/bar-item-info/bar-item-info.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////
  inject: ["$bar"],
  ///////////////////////////////////////
  props : {
    "name": {
      type: String,
      default: undefined
    },
    "icon": {
      type: String,
      default: undefined
    },
    "hideIcon" : {
      type: Boolean,
      default: false
    },
    "text": {
      type: String,
      default: undefined
    },
    "tip": {
      type: String,
      default: undefined
    },
    "shortcut": {
      type: String,
      default: undefined
    },
    "altDisplay" : {
      type: [Object, Array],
      default: ()=>[]
    },
    "enabled": {
      type: [Boolean, String, Array, Object],
      default: undefined
    },
    "disabled": {
      type: [Boolean, String, Array, Object],
      default: undefined
    },
    "highlight": {
      type: [Boolean, String, Array, Object],
      default: undefined
    },
    "value" : {
      type: [Boolean, String, Number, Array],
      default: undefined
    },
    "depth": {
      type: Number,
      default: 0
    },
    "status" : {
      type : Object,
      default : ()=>({})
    }
  },
  ///////////////////////////////////////
  computed : {
    //-----------------------------------
    TopClass() {
      return this.getTopClass({
        "is-enabled"  : this.isEnabled,
        "is-disabled" : this.isDisabled,
        "is-highlight": this.isHighlight,
        "is-top" : this.depth == 1,
        "is-sub" : this.depth > 1,
        "has-icon" : this.icon ? true : false,
        "no-icon"  : this.icon ? false : true,
        "show-icon": this.isShowIcon,
        "hide-icon": !this.isShowIcon
      }, `is-depth-${this.depth}`)
    },
    //-----------------------------------
    AltDisplay() {
      if(_.isArray(this.altDisplay)) {
        return this.altDisplay
      }
      return this.altDisplay
        ? [this.altDisplay]
        : []
    },
    //-----------------------------------
    isEnabled() {
      if(!Ti.Util.isNil(this.enabled)) {
        return this.isMatchStatus(this.enabled)
      }
      if(!Ti.Util.isNil(this.disabled)) {
        if(this.isMatchStatus(this.disabled)) {
          return false
        }
      }
      return true
    },
    //-----------------------------------
    isDisabled() {
      return !this.isEnabled
    },
    //-----------------------------------
    isHighlight() {
      if(!Ti.Util.isNil(this.highlight)) {
        return this.isMatchStatus(this.highlight)
      }
      return false
    },
    //-----------------------------------
    isShowShortcut() {
      return this.shortcut && this.depth > 1
    },
    //-----------------------------------
    isShowIcon() {
      return !this.hideIcon || this.hasIcon
    },
    //-----------------------------------
    hasIcon() {
      return this.CurrentDisplay.icon ? true : false
    },
    //-----------------------------------
    CurrentDisplay() {
      // if("bold" == this.name)
      //   console.log("CurrentDisplay", this.name)
      // Prepare default
      let dis =  {
        icon : this.icon,
        text : this.text,
        tip  : this.tip,
        value: this.value
      }
      // Alt Display
      if(!_.isEmpty(this.AltDisplay)) {
        for(let alt of this.AltDisplay) {
          let mat = alt.match || this.name
          if(this.isMatchStatus(mat)) {
            _.assign(dis, _.pick(alt, [
              "icon", "text", "tip", "value"
            ]))
            break
          }
        }
      }
      // Done
      return dis
    },
    //-----------------------------------
    TheValues() {
      let val = this.CurrentDisplay.value
      // Bool
      if(_.isBoolean(val)) {
        return [val, !val]
      }
      // Array
      if(_.isArray(val))
        return val
      // Normal value
      return [val]
    }
    //-----------------------------------
  },
  ///////////////////////////////////////
  methods : {
    //---------------------------------------
    OnClickTop() {
      if(!this.isDisabled) {
        let val = this.isHighlight
          ? _.last(this.TheValues)
          : _.first(this.TheValues)
        
        this.$emit('fire', val)
      }
    },
    //---------------------------------------
    isMatchStatus(mat) {
      if(_.isBoolean(mat)) {
        return mat
      }
      // Key | `"saving"`
      if(_.isString(mat)) {
        return _.get(this.status, mat) ? true : false
      }
      // KeySet | `["saving","changed"]`
      else if(_.isArray(mat)) {
        for(let k of mat) {
          if(!_.get(this.status, k)) {
            return false
          }
        }
        return true
      }
      // Complex match
      else if(_.isPlainObject(mat)) {
        // Validate | `{validate:{..}}`
        if(mat.validate) {
          return Ti.Validate(this.status, mat.validate)
        }
        // Match  | `{saving:true}`
        return _.isMatch(this.status, mat)
      }
      return false
    }
    //---------------------------------------
  }
  ///////////////////////////////////////
}
Ti.Preload("ti/com/ti/actionbar/com/bar-item-info/bar-item-info.mjs", _M);
})();
//============================================================
// JOIN: ti/actionbar/com/bar-item-info/_com.json
//============================================================
Ti.Preload("ti/com/ti/actionbar/com/bar-item-info/_com.json", {
  "name" : "bar-item-info",
  "template" : "./bar-item-info.html",
  "mixins"   : ["./bar-item-info.mjs"]
});
//============================================================
// JOIN: ti/actionbar/com/bar-item-line/bar-item-line.html
//============================================================
Ti.Preload("ti/com/ti/actionbar/com/bar-item-line/bar-item-line.html", `<div class="bar-item-line"
  :class="TopClass"></div>`);
//============================================================
// JOIN: ti/actionbar/com/bar-item-line/bar-item-line.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////
  inject: ["$bar"],
  ///////////////////////////////////////
  props : {
    "depth": {
      type: Number,
      default: 0
    }
  },
  ///////////////////////////////////////
  computed : {
    //-----------------------------------
    TopClass() {
      return this.getTopClass({
        "is-top" : this.depth == 1,
        "is-sub" : this.depth > 1
      })
    }
    //-----------------------------------
  }
  ///////////////////////////////////////
}
Ti.Preload("ti/com/ti/actionbar/com/bar-item-line/bar-item-line.mjs", _M);
})();
//============================================================
// JOIN: ti/actionbar/com/bar-item-line/_com.json
//============================================================
Ti.Preload("ti/com/ti/actionbar/com/bar-item-line/_com.json", {
  "name" : "bar-item-line",
  "template" : "./bar-item-line.html",
  "mixins"   : ["./bar-item-line.mjs"]
});
//============================================================
// JOIN: ti/actionbar/ti-actionbar.html
//============================================================
Ti.Preload("ti/com/ti/actionbar/ti-actionbar.html", `<div class="ti-actionbar"
  :class="TopClass"
  v-ti-activable>
  <bar-item-group 
    name="Ti_ActionBar_Root_Group"
    :items="BarItems"
    :status="status"/>
</div>`);
//============================================================
// JOIN: ti/actionbar/ti-actionbar.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////
  provide : function(){
    return {
      "$bar"  : this,
      "depth" : 0
    }
  },
  ///////////////////////////////////////////
  data: ()=>({
    mySeq : 0,
    myGroups: {}
  }),
  ///////////////////////////////////////////
  props : {
    "items" :{
      type : Array,
      default : ()=>[]
    },
    "align" : {
      type : String,
      default : "left",
      validator : v => /^(left|right|center)$/.test(v)
    },
    "status" : {
      type : Object,
      default : ()=>({})
    }
  },
  ///////////////////////////////////////////
  computed : {
    //---------------------------------------
    TopClass() {
      return this.getTopClass(`align-${this.align}`)
    },
    //---------------------------------------
    BarItems() {
      //console.log("EvalBarItems")
      let list = []
      _.forEach(this.items, it => {
        let bi = this.evalBarItem(it)
        if(bi) {
          list.push(bi)
        }
      })
      return list
    }
    //---------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //---------------------------------------
    allocGroup($big) {
      //console.log("allocGroup", $big.name)
      this.myGroups[$big.name] = $big
    },
    //---------------------------------------
    freeGroup($big) {
      //console.log("freeGroup", $big.name)
      delete this.myGroups[$big.name]
    },
    //---------------------------------------
    notifyChange({name, value}={}) {
      if(name) {
        this.$notify("change", {name, value})
      }
    },
    //---------------------------------------
    evalBarItem(it){
      let type = this.getItemType(it)
      let key = this.getItemKey(type)
      let bi = {
        type, key,
        comType: `bar-item-${type}`,
        comConf: _.defaults(_.omit(it, "items"), {
            name: key
          })
      }
      if("group" == type && _.isArray(it.items)) {
        bi.items = []
        for(let child of it.items) {
          let ci = this.evalBarItem(child)
          bi.items.push(ci)
        }
      }
      return bi
    },
    //---------------------------------------
    getItemType(bi) {
      if(bi.type) {
        return bi.type
      }
      // Line
      if(_.isEmpty(bi)) {
        return "line"
      }
      // Group
      else if(_.isArray(bi.items)) {
        return "group"
      }
      // TODO support switcher
      // Default is action
      return "action"
    },
    //---------------------------------------
    getItemKey(type="BarItem") {
      return `${type}-${this.mySeq++}`
    },
    //---------------------------------------
    collapseAllGroup() {
      _.forEach(this.myGroups, $big=>{
        $big.doCollapse()
      })
    },
    //---------------------------------------
    __ti_shortcut(uniqKey) {
      Ti.InvokeBy({"ESCAPE":()=>this.collapseAllGroup()}, uniqKey)
    }
    //---------------------------------------
  },
  ///////////////////////////////////////////
  mounted: function(){
    Ti.Viewport.watch(this, {resize:()=>this.collapseAllGroup()})
  },
  ///////////////////////////////////////////
  beforeDestroy: function(){
    Ti.Viewport.unwatch(this)
  }
  ///////////////////////////////////////////
}
Ti.Preload("ti/com/ti/actionbar/ti-actionbar.mjs", _M);
})();
//============================================================
// JOIN: ti/actionbar/_com.json
//============================================================
Ti.Preload("ti/com/ti/actionbar/_com.json", {
  "name" : "ti-actionbar",
  "globally" : true,
  "template" : "./ti-actionbar.html",
  "mixins" : ["./ti-actionbar.mjs"],
  "components" : [
    "./com/bar-item-action",
    "./com/bar-item-group",
    "./com/bar-item-line",
    "./com/bar-item-info"
  ]
});
//============================================================
// JOIN: ti/button/ti-button.html
//============================================================
Ti.Preload("ti/com/ti/button/ti-button.html", `<div class="ti-button"
  :class="topClass">
  <ul>
    <li v-for="it in items"
      :key="it.name"
      :class="it.buttonClass"
      @click="onClickItem(it)">
      <!--
        Icon
      -->
      <ti-icon v-if="it.icon"
        :value="it.icon"/>
      <!--
        Text
      -->
      <span v-if="it.text"
        class="it-text">{{it.text|i18n}}</span>
    </li>
  </ul>
</div>`);
//============================================================
// JOIN: ti/button/ti-button.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "size" :{
      type : String,
      default : "normal",
      validator: v=>/^(big|normal|small|tiny)$/.test(v)
    },
    // center|top|left|right|bottom|
    // left-top|right-top|bottom-left|bottom-right
    "align" :{
      type : String,
      default : "center"
    },
    "setup" : {
      type : [Array, Object],
      default : ()=>[]
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    topClass() {
      return Ti.Css.mergeClassName([
        `is-${this.size}`, `at-${this.align}`
      ], this.className)
    },
    //......................................
    items() {
      let list = [].concat(this.setup)
      let re = []
      _.forEach(list, (li, index)=>{
        let it = {}
        it.name = li.name || `item-${index}`
        it.eventName = li.eventName || it.name
        it.payload = li.payload
        it.icon = li.icon
        it.text = li.text
        it.disabled = li.disabled
        it.buttonClass = {
          [`as-do-${it.name}`] : true,
          "is-enabled"      : !li.disabled  ? true : false,
          "is-disabled"     : li.disabled   ? true : false,
          "is-invert-icon"  : li.invertIcon ? true : false 
        }
        re.push(it)
      })
      return re
    }
    //......................................
  },
  //////////////////////////////////////////
  methods :{
    onClickItem(it) {
      if(!it.disabled) {
        this.$notify(it.eventName, it.payload)
      }
    }
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/button/ti-button.mjs", _M);
})();
//============================================================
// JOIN: ti/button/_com.json
//============================================================
Ti.Preload("ti/com/ti/button/_com.json", {
  "name" : "ti-button",
  "globally" : true,
  "template" : "./ti-button.html",
  "mixins"   : ["./ti-button.mjs"],
  "components" : []
});
//============================================================
// JOIN: ti/calendar/ti-calendar.html
//============================================================
Ti.Preload("ti/com/ti/calendar/ti-calendar.html", `<div class="ti-calendar">
  <!--
    Heading
  -->
  <div class="as-head">
    <!--
      Switcher
    -->
    <div class="as-switcher" :class="switcherClass">
      <div class="as-title">
        <ti-input-month
          width="100%"
          height=".36rem"
          icon="far-calendar-alt"
          :hide-border="true"
          :value="theViewDate"
          :format="theViewRangeText"
          :editable="monthEditable"
          :begin-year="beginYear"
          :end-year="endYear"
          @change="onMonthChanged"/>
      </div>
      <div class="go-btn to-prev-block" @click="gotoMatrix(-1)">
        <ti-icon value="zmdi-chevron-left"/>
      </div>
      <div class="go-btn go-today" @click="gotoToday">
        <span>{{'today'|i18n}}</span>
      </div>
      <div class="go-btn to-next-block" @click="gotoMatrix(1)">
        <ti-icon value="zmdi-chevron-right"/>
      </div>
    </div>
    <!--
      Change Mode
      TODO maybe should support mode changing here
    -->
    
  </div>
  <!--
    Day cells
  -->
  <div class="as-matrix-table">
    <div v-for="matrix in dateMatrixList"
      class="as-matrix">
      <table>
        <thead>
          <th v-for="wt in weekTitles">{{wt.title}}</th>
        </thead>
        <tbody>
          <tr v-for="row in matrix">
            <td v-for="cell in row" :class="cell.type">
              <slot name="cell">
                <span class="as-date-item"
                  @click="onClickCell(cell)">{{cell.text}}</span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>`);
//============================================================
// JOIN: ti/calendar/ti-calendar.mjs
//============================================================
(function(){
///////////////////////////////////////////
const _M = {
  /////////////////////////////////////////
  data: ()=>({
    "view_date" : null
  }),
  /////////////////////////////////////////
  props : {
    "value" : {
      type : [String, Number, Date, Array],
      default : null
    },
    /***
     * The value represent a **Date Range**.
     * It must be a Array with two elements, first one is begin date
     * of the range, the last one is the end of the range.
     * Both the two date is includsive of the range.
     * 
     * If the value passed in is not array, It will be taken as 
     * the begin date
     */
    "range" : {
      type : Boolean,
      default : false
    },
    // Which day is first day
    //  0 - Sunday
    //  1 - Monday
    "firstDayInWeek" : {
      type : [Number, String],  // 0, or "Sun" or "Sunday"
      default : 0
    },
    /***
     * How to decide the matrix end date
     * 
     * - "monthly" : show whole month
     * - "weekly"  : show few weeks defined by `matrixCount`
     */ 
    "matrixMode" : {
      type : String,
      default : "monthly"
    },
    /***
     * Define the matrix block count by `matrixMode`
     * 
     * - "monthly" - how many calenars should be shown in same time
     * - "weekly"  - how many week should be shown in block
     */
    "matrixCount" : {
      type : Number,
      default : 1
    },
    // true : can write time directly
    "monthEditable" : {
      type : Boolean,
      default : true
    },
    "monthFormat" : {
      type : String,
      default : "yyyy-MM-dd" 
    },
    "beginYear" : {
      type : [Number, String],
      default : 1970
    },
    "endYear" : {
      type : [Number, String],
      default : (new Date().getFullYear()+1)
    }
  },
  //////////////////////////////////////////
  watch : {
    // If the value changed outside,
    // and if the value our-of-view
    // It should auto switch the viewDate
    "value" : function(val) {
      if(val) {
        let [v0] = [].concat(val)
        let dt = Ti.Types.toDate(v0)
        let ms = dt.getTime()
        if(!_.inRange(ms, ...this.theMatrixRangeInMs)) {
          this.view_date = null
        }
      }
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    switcherClass() {
      if(this.isMonthly && this.matrixCount>1) {
        return "sz-double"
      }
    },
    //--------------------------------------
    isMonthly() {
      return "monthly" == this.matrixMode
    },
    isWeekly() {
      return "weekly" == this.matrixMode
    },
    //--------------------------------------
    today() {
      return new Date()
    },
    todayName() {
      return Ti.Types.formatDate(this.today, "yyyy-MM-dd")
    },
    //--------------------------------------
    theDate() {
      if(_.isArray(this.value)) {
        if(this.value.length > 0) {
          return Ti.Types.toDate(this.value[0])
        }
        return null
      }
      return Ti.Types.toDate(this.value, null)
    },
    //--------------------------------------
    theRangeInMs() {
      // Move to 00:00:00
      let dt0 = new Date(this.theDate)
      // Define the dt1
      let dt1;
      if(_.isArray(this.value) && this.value.length > 1) {
        dt1 = Ti.Types.toDate(this.value[1])
      }
      // The End of the Day
      else {
        dt1 = new Date(dt0)
      }
      // Make the range
      let msRange = [dt0.getTime(), dt1.getTime()].sort()

      // dt0 start of the day
      dt0 = Ti.DateTime.setTime(new Date(msRange[0]))
      // dt1 end of the day
      dt1 = Ti.DateTime.setTime(new Date(msRange[1]), [23,59,59,999])

      // rebuild the range
      return [dt0.getTime(), dt1.getTime()]
    },
    //--------------------------------------
    theRangeInText() {
      return Ti.Types.formatDate(this.theRangeInMs, "yyyy-MM-dd")
    },
    //--------------------------------------
    theRangeBeginDate() {
      return new Date(this.theRangeInMs[0])
    },
    //--------------------------------------
    theRangeEndDate() {
      return new Date(this.theRangeInMs[1])
    },
    //--------------------------------------
    theMatrixRangeInMs() {
      let c0 = this.dateMatrixList[0][0][0]
      let i = this.dateMatrixList.length - 1
      let y = this.dateMatrixList[i].length - 1
      let x = this.dateMatrixList[i][y].length - 1
      let c1 = this.dateMatrixList[i][y][x]

      let dt0 = new Date(c0.raw)
      let dt1 = new Date(c1.raw)
      Ti.DateTime.setTime(dt0)
      Ti.DateTime.setTime(dt1, [23,59,59,999])
      return [dt0.getTime(), dt1.getTime()]
    },
    //--------------------------------------
    theMatrixRange() {
      let dt0 = new Date(this.theMatrixRangeInMs[0])
      let dt1 = new Date(this.theMatrixRangeInMs[1])
      return [dt0, dt1]
    },
    //--------------------------------------
    theViewRange() {
      let i = this.dateMatrixList.length - 1
      let y = this.dateMatrixList[i].length - 1
      let x = this.dateMatrixList[i][y].length - 1
      let c1 = this.dateMatrixList[i][y][x]
      while(c1.type!="in-month" && x>0) {
        c1 = this.dateMatrixList[i][y][--x]
      }

      let dt0 = new Date(this.theViewDate)
      let dt1 = new Date(c1.raw)
      Ti.DateTime.setTime(dt0)
      Ti.DateTime.setTime(dt1, [23,59,59,999])
      return [dt0, dt1]
    },
    //--------------------------------------
    theViewRangeText() {
      let dt0 = this.theViewRange[0]
      if(this.isMonthly && this.matrixCount > 1) {
        let dt1 = this.theViewRange[1]
        let yy0 = dt0.getFullYear()
        let MM0 = dt0.getMonth()
        let yy1 = dt1.getFullYear()
        let MM1 = dt1.getMonth()
        let MA0 = Ti.DateTime.getMonthAbbr(MM0)
        let MA1 = Ti.DateTime.getMonthAbbr(MM1)
        let MT0 = Ti.I18n.get(MA0)
        let MT1 = Ti.I18n.get(MA1)

        MM0++;  MM1++;  // Month change to 1 base

        let vars = {
          yy0, yy1,
          MM0, MM1,
          MA0, MA1,
          MT0, MT1
        }
        // Beyound year
        if(yy0 != yy1) {
          return Ti.I18n.getf("cal.m-range-beyond-years", vars)
        }
        // Beyound month
        if(MM0 != MM1) {
          return Ti.I18n.getf("cal.m-range-beyond-months", vars)
        }
      }
      return Ti.Types.formatDate(dt0, this.monthFormat)
    },
    //--------------------------------------
    theDateName() {
      return Ti.Types.formatDate(this.theDate, "yyyy-MM-dd")
    },
    //--------------------------------------
    theViewDate() {
      return this.view_date || this.theDate || new Date()
    },
    //--------------------------------------
    theViewYear() {
      return this.theViewDate.getFullYear()
    },
    //--------------------------------------
    theViewMonth() {
      return this.theViewDate.getMonth()
    },
    theViewMonthAbbr() {
      return Ti.DateTime.getMonthAbbr(this.theViewMonth)
    },
    //--------------------------------------
    weekTitles() {
      let day = this.firstDayInWeek
      // Week day index
      if(_.isNumber(day)) {
        day = _.clamp(day, 0, 6)
      }
      // Week day abbr or name
      else if(_.isString(day)) {
        let dayName = _.lowerCase(day)
        day = Ti.DateTime.getWeekDayValue(dayName, 0)
      }
      // Join list
      let list = []
      for(let i=0; i<7; i++) {
        list.push({
          day,
          title : Ti.I18n.get(["cal","week",day])
        })
        if(++day >=7 ) {
          day = 0
        }
      }
      // Return it
      return list
    },
    //--------------------------------------
    weekFirstDayValue() {
      if(_.isString(this.firstDayInWeek)) {
        return Ti.DateTime.getWeekDayValue(this.firstDayInWeek, 0)
      }
      return _.clamp(this.firstDayInWeek, 0, 6)
    },
    //--------------------------------------
    dateMatrixList() {
      let beginDate = new Date(this.theViewDate)
      //............................
      let list = []
      let theYear  = this.theViewYear
      let theMonth = this.theViewMonth
      // Monthly: may create multi-matrix
      if(this.isMonthly) {
        for(let i=0; i<this.matrixCount; i++) {
          let {matrix, lastDate} = this.createMatrix(
            beginDate, theYear, theMonth
          )
          list.push(matrix)
          beginDate = Ti.DateTime.moveDate(new Date(lastDate), 1)
          theMonth ++
          if(theMonth >= 12) {
            theMonth = 0
            theYear ++
          }
        }
      }
      // Weekly
      else {
        let {matrix} = this.createMatrix(beginDate)
        list.push(matrix)
      }
      return list
      //............................
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    /***
     * Create a date matrix
     */
    createMatrix(beginDate, theYear, theMonth) {
      // Move to the first date in month
      if(this.isMonthly) {
        beginDate.setDate(1)
      }
      //............................
      // Move the first day of week
      let wfdv = this.weekFirstDayValue
      while(beginDate.getDay() > wfdv) {
        Ti.DateTime.moveDate(beginDate, -1)
      }
      while(beginDate.getDay() < wfdv) {
        Ti.DateTime.moveDate(beginDate, 1)
      }
      //............................
      // Build the matrix
      let len = 7
      let y = 0
      let matrix = []
      let lastDate = null
      while(true) {
        let row = []
        for(let x=0; x<len; x++) {
          let index = y*len + x
          lastDate = Ti.DateTime.createDate(beginDate, index)
          let month = lastDate.getMonth()
          let date  = lastDate.getDate()
          let name  = Ti.Types.formatDate(lastDate, "yyyy-MM-dd")
          let isSelected = false
          // Range: match begin/end date
          if(this.range) {
            isSelected = _.inRange(lastDate.getTime(), ...this.theRangeInMs)
          }
          // Single: match the date
          else {
            isSelected = name == this.theDateName
          }
          let type = {
            "is-prev"  : month < theMonth,
            "is-next"  : month > theMonth,
            "in-month" : month == theMonth,
            "is-today" : this.todayName == name,
            "is-selected" : isSelected
          }
          // Eval displayText in cell
          // The first day of month should the Abbr
          let text = ""+date
          if(1 == date && (
              (this.isMonthly && this.matrixCount>1)
              || this.isWeekly
          )) {
            let abbr = Ti.DateTime.getMonthAbbr(month)
            text = Ti.I18n.get(`cal.abbr.${abbr}`)
          }
          // Join to the row
          row.push({
            x, y, index, type, name, text,
            year  : lastDate.getFullYear(),
            month,
            day   : lastDate.getDay(),
            date  : lastDate.getDate(),
            raw   : lastDate
          })
        }
        // Move to next row
        y++
        // End by week count
        if(this.isWeekly) {
          let count = _.clamp(this.matrixCount, 1, 100)
          if(y>count)
            break
        }
        // End by next month
        else if(this.isMonthly) {
          if((
              row[0].year  == theYear &&
              row[0].month  > theMonth
            ) || row[0].year > theYear) {
            break
          }
        }
        // Invalid mode, break now
        else {
          break
        }
        // Join to matrix
        matrix.push(row)
      }
      //............................
      return {
        matrix, lastDate
      }
    },
    //--------------------------------------
    gotoToday() {
      this.view_date = new Date()
    },
    //--------------------------------------
    gotoMatrix(offset=0) {
      let cd = this.theViewDate
      let dt = new Date(cd.getFullYear(), cd.getMonth(), cd.getDate())

      // Monthly
      if(this.isMonthly) {
        Ti.DateTime.moveMonth(dt, offset)
      }
      // Weekly
      else if(this.isWeekly) {
        Ti.DateTime.moveDate(dt, offset*7*this.matrixCount)
      }
      // Invalid mode
      else {
        return
      }

      // Switch the current view
      this.view_date = dt
    },
    //--------------------------------------
    onMonthChanged(month) {
      let dt = Ti.Types.toDate(month)
      this.view_date = dt
    },
    //--------------------------------------
    onClickCell(cell) {
      // Range
      if(this.range) {
        // If array ...
        if(_.isArray(this.value)) {
          // Finish the range
          if(this.value.length == 1) {
            let msRange = [cell.raw.getTime(), this.theDate.getTime()].sort()
            let dt0 = Ti.Types.toDate(msRange[0])
            let dt1 = Ti.Types.toDate(msRange[1])
            this.$notify("change", [dt0, dt1])
          }
          // Start a new range
          else {
            this.$notify("change", [cell.raw])
          }
        }
        // Has Value
        else {
          this.$notify("change", [cell.raw])
        }
      }
      // Single value
      else {
        this.$notify("change", cell.raw)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  mounted : function() {
    this.view_date = this.theDate || new Date()
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/calendar/ti-calendar.mjs", _M);
})();
//============================================================
// JOIN: ti/calendar/_com.json
//============================================================
Ti.Preload("ti/com/ti/calendar/_com.json", {
  "name" : "ti-calendar",
  "globally" : true,
  "i18n" : "@i18n:ti-datetime",
  "template" : "./ti-calendar.html",
  "mixins"   : ["./ti-calendar.mjs"],
  "components" : [
    "@com:ti/input/month"]
});
//============================================================
// JOIN: ti/chart/g2/ti-chart-g2.html
//============================================================
Ti.Preload("ti/com/ti/chart/g2/ti-chart-g2.html", `<div class="ti-chart ti-chart-g2">
  <section ref="chart"
    class="chart-main ti-fill-parent"></section>
</div>`);
//============================================================
// JOIN: ti/chart/g2/ti-chart-g2.mjs
//============================================================
(function(){
function draw_chart({
  $refs,
  padding,
  data,
  setup=_.identity,
  autoSource
}={}) {
  let $container = $refs.chart
  //console.log(data)
  let width  = G2.DomUtil.getWidth($container)
  let height = G2.DomUtil.getHeight($container)
  //.......................................
  // Create The Chart
  let chart = new G2.Chart({
    container: $container,
    padding, width, height
  })
  //.......................................
  // Set datasource
  if(autoSource && data && !_.isEmpty(data))
    chart.source(data)
  //.......................................
  // Setup chart
  setup(chart, data, {
    width, height
  })
  //.......................................
  // 渲染并返回
  chart.render()
  return chart
}
///////////////////////////////////////////
const _M = {
  /////////////////////////////////////////
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "data" : {
      type : Array,
      default : ()=>[]
    },
    "padding" : {
      type : [Number, Array, String],
      default : "auto"
    },
    // Function(chart, data):void
    "setup" : {
      type : Function,
      default : _.identity
    },
    "autoSource" : {
      type : Boolean,
      default : true
    }
  },
  //////////////////////////////////////////
  watch : {
    "data" : function() {this.debounceRedrawChart()},
  },
  //////////////////////////////////////////
  computed : {
  },
  //////////////////////////////////////////
  methods : {
    //......................................
    redrawChart() {
      if(!_.isElement(this.$refs.chart)) {
        return
      }
      if(this.__g2_chart) {
        try{
          this.__g2_chart.destroy()
        }catch(E){}
        $(this.$refs.chart).empty()
      }
      this.__g2_chart = draw_chart(this)
    },
    drawAll() {
      //console.log("I am drawAll")
      this.$nextTick(()=>{
        this.redrawChart()
      })
    }
    //......................................
  },
  /////////////////////////////////////////
  mounted : function() {
    this.drawAll()
    this.debounceRedrawChart = _.debounce(()=>{
      this.redrawChart()
    }, 500)
    this.debounceRedrawAll = _.debounce(()=>{
      this.drawAll()
    }, 500)
    // 监控窗口尺寸变化
    Ti.Viewport.watch(this, {
      resize: function() {
        let chart = this.__g2_chart
        if(chart) {
          this.$notify("before_resize")
          let $container = this.$refs.chart
          let width  = G2.DomUtil.getWidth($container)
          let height = G2.DomUtil.getHeight($container)
          chart.changeWidth(width)
          chart.changeHeight(height)
        }
      }
    })
  },
  beforeDestroy : function(){
    if(this.__g2_chart) {
      this.__g2_chart.destroy()
    }
    // 解除窗口监控
    Ti.Viewport.unwatch(this)
  }
  /////////////////////////////////////////
}
Ti.Preload("ti/com/ti/chart/g2/ti-chart-g2.mjs", _M);
})();
//============================================================
// JOIN: ti/chart/g2/_com.json
//============================================================
Ti.Preload("ti/com/ti/chart/g2/_com.json", {
  "name" : "ti-chart-g2",
  "globally" : true,
  "template" : "./ti-chart-g2.html",
  "mixins"   : ["./ti-chart-g2.mjs"],
  "components" : [],
  "deps" : []
});
//============================================================
// JOIN: ti/chart/simple/ti-chart-simple.html
//============================================================
Ti.Preload("ti/com/ti/chart/simple/ti-chart-simple.html", `<div class="ti-chart ti-chart-simple">
  <header 
    v-if="title" 
    @click="drawAll">{{title}}</header>
  <aside v-if="aside"
    :class="asideClass">
    <slot name="aside">
      <span v-if="unit">{{unit}}</span>
    </slot>
  </aside>
  <section class="chart-main" ref="chart"></section>
  <div v-if="hasSlider"
    ref="slider"
    class="chart-slider">
  </div>
</div>`);
//============================================================
// JOIN: ti/chart/simple/ti-chart-simple.mjs
//============================================================
(function(){
function draw_chart({
  $refs,
  type="interval",
  unit,
  data=[],
  axisX,
  axisY,
  color,
  animate,
  padding,
  minValue,
  maxValue,
  valueInterval,
  coord
}={}) {
  let $container = $refs.chart
  //console.log(data)
  let width  = G2.DomUtil.getWidth($container)
  let height = G2.DomUtil.getHeight($container)
  // if(width > 500 && width < 510)
  //   console.log(width, height)
  // if(hasSlider)
  //   console.log("XXXX", data)
  //.......................................
  // maxValue
  if(_.isUndefined(maxValue)) {
    maxValue = 0
    let valKey = axisY.name
    for(let it of data){
      maxValue = Math.max(maxValue, it[valKey])
    }
  }
  //.......................................
  // Create The Chart
  let chart = new G2.Chart({
    container: $container,
    padding, width, height
  })
  //.......................................
  // Set datasource
  chart.source(data)
  //.......................................
  // Setup title
  chart.legend(false)
  //.......................................
  // axisX
  let axisXOptions = {
    label : {
      textStyle : {
        fill : axisX.color || "#888"
      }
    }
  }
  chart.axis(axisX.name, axisXOptions)
  //.......................................
  // 纵轴设定
  let axisYOptions = {
    label : {
      autoRotate : false,
      textStyle : {
        fill : axisY.color || "#888"
      }
    },
    grid: {
      type: 'line',
      lineStyle: {
        stroke: 'rgba(255,255,255,0.4)',
        lineWidth: 0.5,
        lineDash: false
      }
    }
  }
  chart.axis(axisY.name, axisYOptions)
  //.......................................
  // 坐标系变换
  if(coord) {
    if("transpose" == coord) {
      chart.coord().transpose()
    }
  }
  //.......................................
  // 视图缩放
  let alias = axisY.title || axisY.name
  chart.scale(axisY.name, {
    alias,
    type : "linear",
    min: minValue,
    max: maxValue,
    tickInterval: valueInterval
  })
  //.......................................
  // 图表种类和风格
  let factory = ({
    //+++++++++++++++++++++++++++++++++++++
    // 折线
    line() {
      let geom = chart.line().position(position)
      chart.point().position(position).size(4).shape('circle').style({
        stroke: '#fff',
        lineWidth: 1
      });
      return geom
    },
    //+++++++++++++++++++++++++++++++++++++
    // 柱图·单柱
    interval() {
      return chart.interval().position(position)
    },
    //+++++++++++++++++++++++++++++++++++++
    // 柱图·分组
    intervalDodge() {
      return chart.interval().position(position).adjust([{
        type: 'dodge',
        marginRatio: 1 / 32
      }])
    },
    //+++++++++++++++++++++++++++++++++++++
    // 柱图·堆叠
    intervalStack(position) {
      return chart.intervalStack().position(position)
    },
  })[type]
  // 默认就是柱图
  factory = factory || ((position)=>{
    return chart.interval().position(position)
  })
  //.......................................
  // 生成图表
  let position = `${axisX.name}*${axisY.name}`
  let geom = factory(position)
  //.......................................
  // 设置数据显示
      //.color(color || 'l(270) 0:#0d4a6a 1:#00fddd')
    // .animate({
    //   appear: {
    //     delay: 500, // 动画延迟执行时间
    //     duration: 1000 // 动画执行时间
    //   }
    // });
  if(color) {
    geom.color(color)
  }
  if(animate) {
    geom.animate(animate)
  }
    
  //.......................................
  // 渲染并返回
  chart.render()
  return chart
}
///////////////////////////////////////////
const _M = {
  /////////////////////////////////////////
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "title" : {
      type : String,
      default : null
    },
    "data" : {
      type : Array,
      default : ()=>[]
    },
    "type" : {
      type : String,
      default : "interval"
    },
    "axisX" : {
      type : Object,
      default : ()=>({
        name : "name",
        title : "name"
      })
    },
    "axisY" : {
      type : Object,
      default : ()=>({
        name : "value",
        title : "value"
      })
    },
    "aside" : {
      type : String,
      default : "left" // none|left|center|right
    },
    "unit" : {
      type : String,
      default : null
    },
    "padding" : {
      type: Array,
      default : ()=>[20,20,50,50]
    },
    "minValue" : {
      type: Number,
      default : 0
    },
    "maxValue" : {
      type: Number,
      default : undefined
    },
    "color" : {
      type: String,
      default : null
    },
    "animate" : {
      type : Object,
      default : ()=>({
        delay: 500, // 动画延迟执行时间
        duration: 1000 // 动画执行时间
      })
    },
    "valueInterval" : {
      type: Number,
      default : 100
    },
    // 坐标系变换
    "coord" : {
      type : [String, Object],
      default : null
    }
  },
  //////////////////////////////////////////
  watch : {
    "data" : function() {this.debounceRedrawChart()},
    // "type" : function() {this.debounceRedrawAll()},
    // "axisX" : function() {this.debounceRedrawAll()},
    // "axisY" : function() {this.debounceRedrawAll()}
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    asideClass() {
      return `at-${this.aside||"none"}`
    },
    //......................................
    // TODO support slider
    hasSlider() {return false}
    //......................................
  },
  //////////////////////////////////////////
  methods : {
    //......................................
    redrawChart() {
      //console.log("I am redrawChart")
      if(this.__g2_chart) {
        this.__g2_chart.destroy()
        $(this.$refs.chart).empty()
      }
      this.__g2_chart = draw_chart(this)
    },
    drawAll() {
      //console.log("I am drawAll")
      this.$nextTick(()=>{
        this.redrawChart()
        //this.redrawSlider()
      })
    }
    //......................................
  },
  /////////////////////////////////////////
  mounted : function() {
    this.drawAll()
    this.debounceRedrawChart = _.debounce(()=>{
      this.redrawChart()
    }, 500)
    this.debounceRedrawAll = _.debounce(()=>{
      this.drawAll()
    }, 500)
  },
  beforeDestroy : function(){
    if(this.__g2_chart) {
      this.__g2_chart.destroy()
    }
    // if(this.__g2_slider) {
    //   this.__g2_slider.destroy()
    // }
  }
  /////////////////////////////////////////
}
Ti.Preload("ti/com/ti/chart/simple/ti-chart-simple.mjs", _M);
})();
//============================================================
// JOIN: ti/chart/simple/_com.json
//============================================================
Ti.Preload("ti/com/ti/chart/simple/_com.json", {
  "name" : "ti-chart-simple",
  "globally" : true,
  "template" : "./ti-chart-simple.html",
  "mixins"   : ["./ti-chart-simple.mjs"],
  "components" : [],
  "deps" : []
});
//============================================================
// JOIN: ti/color/ti-color.html
//============================================================
Ti.Preload("ti/com/ti/color/ti-color.html", `<div class="ti-color" >
  <!--
    Color Matrix Table
  -->
  <div class="as-table">
    <table>
      <thead>
        <tr>
          <th v-for="color in colorGrays">
            <span 
              :style="colorItemStyle(color)" 
              @click="onColorClicked(color)"></span>
          </th>
        </tr>
        <tr>
            <th v-for="color in colorMajors">
              <span 
                :style="colorItemStyle(color)" 
                @click="onColorClicked(color)"></span>
            </th>
          </tr>
      </thead>
      <!--Matrix-->
      <tbody>
        <tr v-for="row in colorMatrix"
          class="as-row">
          <td v-for="color in row">
            <span 
              :style="colorItemStyle(color)" 
              @click="onColorClicked(color)"></span>
          </td>
        </tr>
      </tbody>
    </table>
  </div> <!-- End Matrix-->
  <!--
    Color Input
  -->
  <div class="as-input">
    <div class="as-hex">
        <input class="as-value" 
          spellcheck="false"
          :value="theHex"
          @change="onHexChanged"/>
    </div>
    <div class="as-alpha">
      <ti-input-num 
        :value="theAlpha"
        :max-value="100"
        :min-value="0"
        :step="10"
        @change="onAlphaChanged"/>
    </div>
  </div>
  <!--
    Color Preview
  -->
  <div class="as-preview">
    <span>{{theColorValue}}</span>
  </div>
</div>`);
//============================================================
// JOIN: ti/color/ti-color.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ///////////////////////////////////////////////////////
  props : {
    "value" : {
      type : [String, Number],
      default : null
    },
    "majorColors" : {
      type : Array,
      default : ()=>["#980000","#ff0000","#ff9900","#ffff00","#00ff00",
                 "#00ffff","#4a86e8","#0000ff","#9900ff","#ff00ff"]
    },
    // List the colors at first rows
    "topColors" : {
      type : Array,
      default : ()=>["#e6b8af","#f4cccc","#fce5cd","#fff2cc","#d9ead3",
                 "#d0e0e3","#c9daf8","#cfe2f3","#d9d2e9","#ead1dc"]
    },
    // List the colors at last rows
    // it should same lenght with topColors
    "bottomColors" : {
      type : Array,
      default : ()=>["#5b0f00","#660000","#783f04","#7f6000","#274e13",
                 "#0c343d","#1c4587","#073763","#20124d","#4c1130"]
    },
    // How many middle colors between the head and bottom
    "middleDegree" : {
      type : Number,
      default : 5
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    theColor() {
      return Ti.Types.toColor(this.value, null)
    },
    //---------------------------------------------------
    theHex() {
      if(this.theColor)
        return this.theColor.hex
    },
    //---------------------------------------------------
    theAlpha() {
      if(this.theColor)
        return Math.round(this.theColor.alpha * 100)
    },
    //---------------------------------------------------
    theColorValue() {
      if(this.theColor)
        return this.theColor.rgba
      return Ti.I18n.get("empty")
    },
    //---------------------------------------------------
    colCount() {
      return this.topColors.length
    },
    //---------------------------------------------------
    colorGrays() {
      let grays = []
      let step = 255 / this.colCount
      for(let i=0; i<this.colCount; i++) {
        let v = Math.round((i+1) * step)
        grays.push(Ti.Types.toColor(v))
      }
      return grays
    },
    //---------------------------------------------------
    colorMajors() {
      let majors = []
      for(let v of this.majorColors) {
        majors.push(Ti.Types.toColor(v))
      }
      return majors
    },
    //---------------------------------------------------
    colorMatrix() {
      // Head Colors
      let tops = []
      for(let v of this.topColors) {
        tops.push(Ti.Types.toColor(v))
      }
      // Bottom colors
      let bottoms = []
      for(let v of this.bottomColors) {
        bottoms.push(Ti.Types.toColor(v))
      }
      // Middle Colors
      let matrix = [tops]
      for(let y=0; y<this.middleDegree-1; y++) {
        let rows = []
        for(let x=0; x<this.colCount; x++) {
          let top = tops[x]
          let bottom = bottoms[x]
          let pos = (y+1) /this.middleDegree
          let color = top.between(bottom, pos)
          color.adjustByHSL({s:.5})
          rows.push(color)
        }
        matrix.push(rows)
      }
      // The bottom
      matrix.push(bottoms)
      // Return the matrix
      return matrix
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods : {
    //---------------------------------------------------
    colorItemStyle(color) {
      return {
        "background-color" : color.rgb
      }
    },
    //---------------------------------------------------
    onHexChanged(evt) {
      let hex=_.trim(evt.target.value)
      if(/^[0-9a-f]{3,6}$/i.test(hex)) {
        hex = "#" + hex
      }
      let co = Ti.Types.toColor(hex)
      this.$notify("change", co)
    },
    //---------------------------------------------------
    onAlphaChanged(a) {
      let co = this.theColor 
                ? this.theColor.clone()
                : Ti.Types.toColor("black")
      co.alpha = a / 100
      this.$notify("change", co)
    },
    //---------------------------------------------------
    onColorClicked(color) {
      let co = color.clone()
      if(_.isNumber(this.theAlpha)) {
        co.alpha = this.theAlpha/100
      }
      this.$notify("change", co)
    }
    //---------------------------------------------------
  }
  ///////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/color/ti-color.mjs", _M);
})();
//============================================================
// JOIN: ti/color/_com.json
//============================================================
Ti.Preload("ti/com/ti/color/_com.json", {
  "name" : "ti-color",
  "globally" : true,
  "template" : "./ti-color.html",
  "mixins" : ["./ti-color.mjs"]
});
//============================================================
// JOIN: ti/combo/box/ti-combo-box.html
//============================================================
Ti.Preload("ti/com/ti/combo/box/ti-combo-box.html", `<div class="ti-combo-box" 
  :class="topClass"
  :style="topStyle">
  <!--
    Box: Component
  -->
  <div class="as-box" ref="box" :style="theBoxStyle">
    <slot name="box"><div>ComboBox</div></slot>
  </div>
  <!--
    Mask & Drop
  -->
  <template v-if="'extended'==status">
    <!--Mask-->
    <div class="as-mask" @click.left="notifyCollapse()"></div>
    <!--Drop-->
    <div class="as-drop" ref="drop" :style="theDropStyle">
      <slot name="drop"><div>ComboBox Dropdown</div></slot>
    </div>
  </template>
</div>`);
//============================================================
// JOIN: ti/combo/box/ti-combo-box.mjs
//============================================================
(function(){
const _M = {
  ////////////////////////////////////////////////////
  data : ()=>({
    box : {
      "position" : null,
      "width"  : null,
      "height" : null,
      "top"    : null,
      "left"   : null
    },
    myDropDockReady : false
  }),
  ////////////////////////////////////////////////////
  props : {
    "width" : {
      type : [Number, String],
      default : null
    },
    "height" : {
      type : [Number, String],
      default : null
    },
    "dropWidth" : {
      type : [Number, String],
      default : "box"
    },
    "dropHeight" : {
      type : [Number, String],
      default : null
    },
    "dropOverflow" : {
      type : [String, Array],
      default : "auto",
      validator : (v)=>{
        if(Ti.Util.isNil(v)) {
          return true
        }
        if(_.isString(v)) {
          v = v.split(" ")
        }
        if(_.isArray(v)) {
          if(v.length > 2 || v.length == 0) {
            return false
          }
          for(let s of v) {
            if(!/^(auto|hidden|visible|scroll)$/.test(s)) {
              return false
            }
          }
          return true
        }
        return false
      }
    },
    "status" : {
      type : String,
      default : "collapse",
      validator : (st)=>/^(collapse|extended)$/.test(st)
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return this.getTopClass(`is-${this.status}`)
    },
    //------------------------------------------------
    topStyle() {
      return Ti.Css.toStyle({
        //width  : this.box.width,
        height : this.box.height
      })
    },
    //------------------------------------------------
    theBoxStyle() {
      return Ti.Css.toStyle(this.box)
    },
    //------------------------------------------------
    theDropStyle() {
      return Ti.Css.toStyle({
        "overflow" : this.dropOverflow,
        "visibility" : this.myDropDockReady ? "visible" : "hidden"
      })
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    notifyCollapse(escaped=false) {
      this.$notify("collapse", {escaped})
    },
    //------------------------------------------------
    dockDrop() {
      let $drop  = this.$refs.drop
      let $box   = this.$refs.box
      // Guard the elements
      if(!_.isElement($drop) || !_.isElement($box)){
        return
      }
      //............................................
      // If drop opened, make the box position fixed
      // to at the top of mask
      if("extended" == this.status) {
        let r_box  = Ti.Rects.createBy($box)
        //..........................................
        // Mark box to fixed position
        _.assign(this.box, {position:"fixed"}, r_box.raw())
        //..........................................
        // Make drop same width with box
        let dropStyle = {}
        if("box" == this.dropWidth) {
          dropStyle.width = r_box.width
        }
        else if(!Ti.Util.isNil(this.dropWidth)) {
          dropStyle.width = this.dropWidth
        }
        if(!Ti.Util.isNil(this.dropHeight)) {
          dropStyle.height = this.dropHeight
        }
        //..........................................S
        Ti.Dom.setStyle($drop, Ti.Css.toStyle(dropStyle))      
        //..........................................
        // Dock drop to box
        this.$nextTick(()=>{
          // Count dock
          Ti.Dom.dockTo($drop, $box, {
            space:{y:2}
          })
          // Make drop visible
          _.delay(()=>{
            this.myDropDockReady = true
          }, 1)
        })
        //..........................................
      }
      //............................................
    },
    //------------------------------------------------
    reDockDrop() {
      this.resetBoxStyle()
      this.$nextTick(()=>{
        this.dockDrop()
      })
    },
    //------------------------------------------------
    resetBoxStyle() {
      // Recover the $box width/height
      _.assign(this.box, {
        position:null, top:null, left:null, 
        width: this.width, height: this.height
      })
      this.myDropDockReady = false
    },
    //------------------------------------------------
    __ti_shortcut(uniqKey) {
      if("ESCAPE" == uniqKey) {
        this.notifyCollapse(true)
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "status" : function(sta){
      this.$nextTick(()=>{
        // If collapse, it should clean the box styles
        if("collapse" == sta) {
          this.resetBoxStyle()
        }
        // try docking
        else {
          this.dockDrop()
        }
      })
    }
  },
  ////////////////////////////////////////////////////
  mounted : function() {
    this.dropOpened = this.autoOpenDrop
    this.box.width  = this.width
    this.box.height = this.height

    this.dockDrop()

    Ti.Viewport.watch(this, {
      scroll:()=>this.notifyCollapse(),
      resize:()=>this.notifyCollapse()
    })
  },
  ////////////////////////////////////////////////////
  beforeDestroy : function() {
    Ti.Viewport.unwatch(this)
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/combo/box/ti-combo-box.mjs", _M);
})();
//============================================================
// JOIN: ti/combo/box/_com.json
//============================================================
Ti.Preload("ti/com/ti/combo/box/_com.json", {
  "name" : "ti-combo-box",
  "globally" : true,
  "template" : "./ti-combo-box.html",
  "mixins" : ["./ti-combo-box.mjs"]
});
//============================================================
// JOIN: ti/combo/filter/ti-combo-filter.html
//============================================================
Ti.Preload("ti/com/ti/combo/filter/ti-combo-filter.html", `<div class="ti-combo-filter"
  :class="TopClass">
  <!--
    Marjor type
  -->

  <!--
    Filter input box
  -->
  <ti-combo-box
    class="as-filter"
    :drop-width="dropWidth"
    :drop-height="dropHeight"
    :status="myDropStatus"
    @collapse="OnCollapse"
    v-ti-activable>
    <!--
      Box
    -->
    <template v-slot:box>
      <ti-input 
        v-bind="TheInputProps"

        :value="InputValue"
        :prefix-icon="ThePrefixIcon"
        :suffix-icon="TheSuffixIcon"

        @change="OnInputChanged"
        @input:focus="OnInputFocused"
        @prefix:icon="$notify('prefix:icon')"
        @suffix:icon="OnClickStatusIcon"/>
    </template>
    <!--
      Drop
    -->
    <template v-slot:drop="slotProps">
      <ti-form
        v-bind="form"
        :data="myFormData"
        @change="OnFormChange"/>
    </template>
  </ti-combo-box>
  <!--
    Sorter
  -->
</div>`);
//============================================================
// JOIN: ti/combo/filter/ti-combo-filter.mjs
//============================================================
(function(){
const _M = {
  ////////////////////////////////////////////////////
  /*
  {
    keyword: "xxx",  -> myFreeValue
    match: {..}      -> myFormData
  }
  */
  ////////////////////////////////////////////////////
  data : ()=>({
    myDropStatus : "collapse",
    myFreeValue : null,
    myFormData  : {}
  }),
  ////////////////////////////////////////////////////
  props : {
    "form" : {
      type : Object,
      default : null
    },
    "autoCollapse" : {
      type : Boolean,
      default : false
    },
    "statusIcons" : {
      type : Object,
      default : ()=>({
        collapse : "zmdi-chevron-down",
        extended : "zmdi-chevron-up"
      })
    },
    "dropWidth" : {
      type : [Number, String],
      default : "box"
    },
    "dropHeight" : {
      type : [Number, String],
      default : null
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    isCollapse() {return "collapse"==this.myDropStatus},
    isExtended() {return "extended"==this.myDropStatus},
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    hasForm() {
      return !_.isEmpty(this.form)
    },
    //------------------------------------------------
    TheInputProps(){
      return _.assign({}, this, {
        autoI18n : this.autoI18n,
        placeholder : this.placeholder
      })
    },
    //------------------------------------------------
    InputValue() {
      return this.myFreeValue
    },
    //------------------------------------------------
    ThePrefixIcon() {
      let icon = this.prefixIcon;
      return icon || "im-filter"
    },
    //------------------------------------------------
    TheSuffixIcon() {
      if(this.hasForm) {
        return this.statusIcons[this.myDropStatus]
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    OnCollapse() {this.doCollapse()},
    //-----------------------------------------------
    OnInputChanged(val) {
      this.myFreeValue = val
      if(!this.isExtended)
        this.tryNotifyChanged()
    },
    //-----------------------------------------------
    OnInputFocused() {
      if(this.autoFocusExtended && !this.isExtended) {
        this.doExtend()
      }
    },
    //-----------------------------------------------
    OnClickStatusIcon() {
      if(this.isExtended) {
        this.doCollapse()
      } else {
        this.doExtend()
      }
    },
    //-----------------------------------------------
    OnFormChange(formData) {
      console.log("haha", formData)
      this.myFormData = formData
    },
    //-----------------------------------------------
    // Core Methods
    //-----------------------------------------------
    doExtend(tryReload=true) {
      if(this.hasForm && !this.isExtended) {
        this.myDropStatus = "extended"
      }
    },
    //-----------------------------------------------
    doCollapse({escaped=false}={}) {
      if(!this.isCollapse) {
        if(!escaped) {
          this.tryNotifyChanged()
        }
        this.myDropStatus = "collapse"
      }
    },
    //-----------------------------------------------
    tryNotifyChanged() {
      //console.log("tryNotifyChanged")
      let val = this.genValue()
      if(!_.isEqual(val, this.value)) {
        this.$notify("change", val)
      }
    },
    //-----------------------------------------------
    // Utility
    //-----------------------------------------------
    genValue() {
      return {
        keyword : this.myFreeValue,
        match   : this.myFormData
      }
    },
    //-----------------------------------------------
    evalMyValue() {
      let val = _.assign({}, this.value)
      this.myFreeValue = val.keyword
      this.myFormData  = val.match
    },
    //-----------------------------------------------
    // Callback
    //-----------------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-combo-multi-input", uniqKey)
      //....................................
      if("ESCAPE" == uniqKey) {
        this.doCollapse({escaped:true})
        return {prevent:true, stop:true, quit:true}
      }
      //....................................
      // If droplist is actived, should collapse it
      if("ENTER" == uniqKey) {
        this.doCollapse()
        return {stop:true, quit:true}
      }
      //....................................
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    //-----------------------------------------------
    "value" : {
      handler: "evalMyValue",
      immediate : true
    }
    //-----------------------------------------------
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/combo/filter/ti-combo-filter.mjs", _M);
})();
//============================================================
// JOIN: ti/combo/filter/_com.json
//============================================================
Ti.Preload("ti/com/ti/combo/filter/_com.json", {
  "name" : "ti-combo-filter",
  "globally" : true,
  "template" : "./ti-combo-filter.html",
  "props"    : "@com:ti/input/ti-input-props.mjs",
  "mixins"   : "./ti-combo-filter.mjs",
  "components" : ["@com:ti/form"]
});
//============================================================
// JOIN: ti/combo/input/ti-combo-input-props.mjs
//============================================================
(function(){
const _M = {
  //-----------------------------------
  // Data
  //-----------------------------------
  "options" : {
    type : [String, Array, Function, Ti.Dict],
    default : ()=>[]
  },
  "valueBy" : {
    type : [String, Function],
    default : undefined
  },
  "textBy" : {
    type : [String, Function],
    default : undefined
  },
  "iconeBy" : {
    type : [String, Function],
    default : undefined
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "dropComType" : {
    type : String,
    default : undefined
  },
  "dropComConf" : {
    type : Object,
    default : undefined
  },
  "mustInList" : {
    type : Boolean,
    default : false
  },
  "autoFocusExtended" : {
    type : Boolean,
    default : true
  },
  "filter" : {
    type : Boolean,
    default : true
  },
  "delay" : {
    type : Number,
    default : 800
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "statusIcons" : {
    type : Object,
    default : ()=>({
      collapse : "zmdi-chevron-down",
      extended : "zmdi-chevron-up"
    })
  },
  "dropDisplay" : {
    type : [Object, String, Array],
    default : undefined
  },
  "dropItemBorder" : {
    type : Boolean,
    default : true
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "dropWidth" : {
    type : [Number, String],
    default : "box"
  },
  "dropHeight" : {
    type : [Number, String],
    default : null
  }
}
Ti.Preload("ti/com/ti/combo/input/ti-combo-input-props.mjs", _M);
})();
//============================================================
// JOIN: ti/combo/input/ti-combo-input.html
//============================================================
Ti.Preload("ti/com/ti/combo/input/ti-combo-input.html", `<ti-combo-box :class="TopClass"
  :drop-width="dropWidth"
  :drop-height="dropHeight"
  :status="myDropStatus"
  @collapse="OnCollapse"
  v-ti-activable>
  <!--
    Box
  -->
  <template v-slot:box>
    <ti-input 
      v-bind="TheInputProps"

      :value="InputValue"
      :prefix-icon="ThePrefixIcon"
      :suffix-icon="TheSuffixIcon"

      @change="OnInputChanged"
      @inputing="OnInputInputing"
      @input:focus="OnInputFocused"
      @prefix:icon="$notify('prefix:icon')"
      @suffix:icon="OnClickStatusIcon"/>
  </template>
  <!--
    Drop
  -->
  <template v-slot:drop="slotProps">
    <component class="ti-fill-parent"
      :is="DropComType"
      v-bind="DropComConf"

      :on-init="OnDropListInit"
      @select="OnDropListSelected"/>
  </template>
</ti-combo-box>`);
//============================================================
// JOIN: ti/combo/input/ti-combo-input.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    myDropStatus   : "collapse",
    myItem         : null,
    myFreeValue    : null,
    myFilterValue  : null,
    myOptionsData  : [],
    myCurrentId    : null,
    myCheckedIds   : {},

    myOldValue : undefined,
    loading : false
  }),
  ////////////////////////////////////////////////////
  props : {
    "canInput" : {
      type : Boolean,
      default : true
    },
    "autoCollapse" : {
      type : Boolean,
      default : false
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    isCollapse() {return "collapse"==this.myDropStatus},
    isExtended() {return "extended"==this.myDropStatus},
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    TheInputProps(){
      return _.assign({}, this, {
        readonly : !this.canInput || this.readonly,
        autoI18n : this.autoI18n,
        placeholder : this.placeholder
      })
    },
    //------------------------------------------------
    InputValue() {
      if(!Ti.Util.isNil(this.myFilterValue)) {
        return this.myFilterValue
      }
      if(this.myItem) {
        return this.Dict.getText(this.myItem)
               || this.Dict.getValue(this.myItem)
      }
      return this.myFreeValue
    },
    //------------------------------------------------
    GetValueBy() {
      return it => this.Dict.getValue(it)
    },
    //------------------------------------------------
    ThePrefixIcon() {
      if(this.loading) {
        return "zmdi-settings zmdi-hc-spin"
      }
      let icon = this.prefixIcon;
      if(this.myItem) {
        icon = this.Dict.getIcon(this.myItem) || icon
      }
      return icon || "zmdi-minus"
    },
    //------------------------------------------------
    TheSuffixIcon() {
      return this.statusIcons[this.myDropStatus]
    },
    //------------------------------------------------
    DropComType() {return this.dropComType || "ti-list"},
    DropComConf() {
      return _.assign({
        display    : this.dropDisplay || "text",
        border     : this.dropItemBorder
      }, this.dropComConf, {
        data : this.myOptionsData,
        currentId  : this.myCurrentId,
        checkedIds : this.myCheckedIds,
        idBy       : this.GetValueBy,
        multi      : false,
        hoverable  : true,
        checkable  : false,
        autoCheckCurrent : true
      })
    },
    //------------------------------------------------
    Dict() {
      // Customized
      if(this.options instanceof Ti.Dict) {
        return this.options
      }
      // Refer dict
      if(_.isString(this.options)) {
        let dictName = Ti.DictFactory.DictReferName(this.options)
        if(dictName) {
          return Ti.DictFactory.CheckDict(dictName, ({loading}) => {
            this.loading = loading
          })
        }
      }
      // Auto Create
      return Ti.DictFactory.CreateDict({
        data : this.options,
        getValue : Ti.Util.genGetter(this.valueBy || "value"),
        getText  : Ti.Util.genGetter(this.textBy  || "text|name"),
        getIcon  : Ti.Util.genGetter(this.iconBy  || "icon")
      })
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    OnDropListInit($dropList){this.$dropList=$dropList},
    //------------------------------------------------
    OnCollapse() {this.doCollapse()},
    //-----------------------------------------------
    OnInputInputing(val) {
      if(this.filter) {
        this.myFilterValue = val
        // Auto extends
        if(this.autoFocusExtended) {
          if(!this.isExtended) {
            this.doExtend(false)
          }
        }
        // Reload options data
        if(this.isExtended) {
          this.debReload()
        }
      }
    },
    //-----------------------------------------------
    async OnInputChanged(val, byKeyboardArrow) {
      // Clean filter
      this.myFilterValue = null
      // Clean
      if(!val) {
        this.myItem = null
        this.myFreeValue = null
        this.myCheckedIds = {}
        this.myCurrentId = null
      }
      // Find ...
      else {
        let it = await this.Dict.getItem(val)
        // Matched tag
        if(it) {
          this.myItem = it
          this.myFreeValue = null
        }
        else if(!this.mustInList) {
          this.myItem = null
          this.myFreeValue = val
        }
      }
      if(!byKeyboardArrow)
        this.tryNotifyChanged()
    },
    //-----------------------------------------------
    async OnInputFocused() {
      if(this.autoFocusExtended && !this.isExtended) {
        await this.doExtend()
      }
    },
    //-----------------------------------------------
    async OnClickStatusIcon() {
      if(this.isExtended) {
        await this.doCollapse()
      } else {
        await this.doExtend()
      }
    },
    //-----------------------------------------------
    async OnDropListSelected({currentId, byKeyboardArrow}={}) {
      //console.log({currentId, byKeyboardArrow})
      this.myCurrentId = currentId
      await this.OnInputChanged(currentId, byKeyboardArrow)
      if(this.autoCollapse && !byKeyboardArrow) {
        await this.doCollapse()
      }
    },
    //-----------------------------------------------
    // Core Methods
    //-----------------------------------------------
    async doExtend(tryReload=true) {
      this.myOldValue = this.evalMyValue()
      // Try reload options again
      if(tryReload && _.isEmpty(this.myOptionsData)) {
        await this.reloadMyOptionData(true)
      }
      this.$nextTick(()=>{
        this.myDropStatus = "extended"
      })
    },
    //-----------------------------------------------
    async doCollapse({escaped=false}={}) {
      if(escaped) {
        this.evalMyItem(this.myOldValue)
      }
      // Try notify
      else  {
        this.tryNotifyChanged()
      }
      this.myDropStatus = "collapse"
      this.myOldValue   = undefined
    },
    //-----------------------------------------------
    tryNotifyChanged() {
      //console.log("tryNotifyChanged")
      let val = this.evalMyValue()
      if(!_.isEqual(val, this.value)) {
        this.$notify("change", val)
      }
    },
    //-----------------------------------------------
    // Utility
    //-----------------------------------------------
    evalMyValue(item=this.myItem, freeValue=this.myFreeValue) {
      //console.log("evalMyValue", item, freeValue)
      // Item
      if(item) {
        return this.Dict.getValue(item)
      }
      // Ignore free values
      return this.mustInList 
              ? null
              : freeValue
    },
    //-----------------------------------------------
    async evalMyItem(val=this.value) {
      let it = await this.Dict.getItem(val)
      // Update state
      if(it) {
        let itV = this.Dict.getValue(it)
        this.myItem = it
        this.myFreeValue = null
        this.myCurrentId  = itV
        this.myCheckedIds = {[itV]: true}
      }
      // Clean
      else {
        this.myItem = null
        this.myFreeValue = this.mustInList ? null : val
        this.myCurrentId  = null
        this.myCheckedIds = {}
      }
    },
    //-----------------------------------------------
    async reloadMyOptionData(force=false) {
      //console.log("reloadMyOptionData")
      if(force || this.isExtended) {
        this.myOptionsData = await this.Dict.queryData(this.myFilterValue)
      } else {
        this.myOptionsData = []
      }
    },
    //-----------------------------------------------
    // Callback
    //-----------------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-combo-multi-input", uniqKey)
      //....................................
      if("ESCAPE" == uniqKey) {
        this.doCollapse({escaped:true})
        return {prevent:true, stop:true, quit:true}
      }
      //....................................
      // If droplist is actived, should collapse it
      if("ENTER" == uniqKey) {
        if(this.$dropList && this.$dropList.isActived) {
          this.doCollapse()
          return {stop:true, quit:true}
        }
      }
      //....................................
      if("ARROWUP" == uniqKey) {
        if(this.$dropList) {
          this.$dropList.selectPrevRow({
            payload: {byKeyboardArrow: true}
          })
        }
        return {prevent:true, stop:true, quit:true}
      }
      //....................................
      if("ARROWDOWN" == uniqKey) {
        if(this.$dropList && this.isExtended) {
          this.$dropList.selectNextRow({
            payload: {byKeyboardArrow: true}
          })
        } else {
          this.doExtend()
        }
        return {prevent:true, stop:true, quit:true}
      }
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    //-----------------------------------------------
    "value" : {
      handler: "evalMyItem",
      immediate : true
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
   created : function() {
    this.debReload = _.debounce(val=>{
      this.reloadMyOptionData()
    }, this.delay)
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/combo/input/ti-combo-input.mjs", _M);
})();
//============================================================
// JOIN: ti/combo/input/_com.json
//============================================================
Ti.Preload("ti/com/ti/combo/input/_com.json", {
  "name" : "ti-combo-input",
  "globally" : true,
  "template" : "./ti-combo-input.html",
  "props"    : [
    "@com:ti/input/ti-input-props.mjs",
    "./ti-combo-input-props.mjs"],
  "mixins"   : "./ti-combo-input.mjs",
  "components" : [
    "@com:ti/combo/box"]
});
//============================================================
// JOIN: ti/combo/multi-input/ti-combo-multi-input.html
//============================================================
Ti.Preload("ti/com/ti/combo/multi-input/ti-combo-multi-input.html", `<ti-combo-box :class="TopClass"
  :drop-width="dropWidth"
  :drop-height="dropHeight"
  :status="myDropStatus"
  @collapse="OnCollapse"
  v-ti-activable>
  <!--
    Box
  -->
  <template v-slot:box>
    <ti-input-tags
      :input-value="myFilterValue"
      :value="InputTagValues"
      :value-case="valueCase"
      :trimed="trimed"
        :max-value-len="maxValueLen"
        :value-unique="valueUnique"
        :tag-options="tagOptions"
        :tag-mapping="tagMapping"

      :readonly="readonly"
      :focused="focused"
      :hover="hover"
      :auto-select="autoSelect"
        :can-input="canInput"
        :cancel-tag-bubble="cancelTagBubble"

      :placeholder="placeholder"
      :hide-border="hideBorder"
      :prefix-icon="prefixIcon"
      :prefix-hover-icon="prefixHoverIcon"
      :prefix-icon-for-clean="prefixIconForClean"
      :prefix-text="prefixText"
      :suffix-icon="TheSuffixIcon"
      :suffix-text="suffixText"
        :tag-item-icon-by="tagItemIconBy"
        :tag-item-default-icon="tagItemDefaultIcon"
        :tag-option-default-icon="tagOptionDefaultIcon"
      
      :width="width"
      :height="height"

      :input-change="OnInputChanged"

      @inputing="OnInputInputing"
      @input:focus="OnInputFocused"
      @change="OnTagListChanged"
      @prefix:icon="$notify('prefix:icon')"
      @suffix:icon="OnClickStatusIcon"/>
  </template>
  <!--
    Drop
  -->
  <template v-slot:drop>
    <component class="ti-fill-parent"
      :is="DropComType"
      v-bind="DropComConf"

      :on-init="OnDropListInit"
      @select="OnDropListSelected"/>
  </template>
</ti-combo-box>`);
//============================================================
// JOIN: ti/combo/multi-input/ti-combo-multi-input.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    myDropStatus   : "collapse",
    myTags         : [],
    myFreeValues   : [],
    myFilterValue  : null,
    myOptionsData  : [],
    myCurrentId    : null,
    myCheckedIds   : {},

    myOldValue : undefined
  }),
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    isCollapse() {return "collapse"==this.myDropStatus},
    isExtended() {return "extended"==this.myDropStatus},
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    Values() {
      return Ti.S.toArray(this.value)
    },
    //------------------------------------------------
    InputTagValues() {
      return _.concat(this.myTags, this.myFreeValues)
    },
    //------------------------------------------------
    GetValueBy() {
      return it => this.Dict.getValue(it)
    },
    //------------------------------------------------
    TheSuffixIcon() {
      return this.statusIcons[this.myDropStatus]
    },
    //------------------------------------------------
    DropComType() {return this.dropComType || "ti-list"},
    DropComConf() {
      return _.assign({
        display    : this.dropDisplay || "text",
        border     : this.dropItemBorder
      }, this.dropComConf, {
        data : this.myOptionsData,
        currentId  : this.myCurrentId,
        checkedIds : this.myCheckedIds,
        idBy       : this.GetValueBy,
        multi      : true,
        hoverable  : true,
        checkable  : true,
        autoCheckCurrent : false
      })
    },
    //------------------------------------------------
    Dict() {
      // Customized
      if(this.options instanceof Ti.Dict) {
        return this.options
      }
      // Auto Create
      return Ti.DictFactory.CreateDict({
        data: this.options,
        getValue : Ti.Util.genGetter(this.valueBy || "value"),
        getText  : Ti.Util.genGetter(this.textBy  || "text|name"),
        getIcon  : Ti.Util.genGetter(this.iconBy  || "icon")
      })
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    OnDropListInit($dropList){this.$dropList=$dropList},
    //------------------------------------------------
    async OnCollapse() {this.doCollapse()},
    //------------------------------------------------
    OnInputInputing(val) {
      if(this.filter) {
        this.myFilterValue = val
        this.debReload()
      }
    },
    //------------------------------------------------
    async OnInputChanged(val) {
      // Clean filter
      this.myFilterValue = null
      // Uniq 
      if(this.valueUnique) {
        if(_.indexOf(this.myFreeValues, val)>=0) {
          return
        }
        for(let tag of this.myTags) {
          let tagV = this.Dict.getValue(tag)
          if(tagV == val) {
            return
          }
        }
      }
      // Join to ...
      let it = await this.Dict.getItem(val)
      // Matched tag
      if(it) {
        this.myTags.push(it)
      }
      // Join to free value
      else if(val && !this.mustInList) {
        this.myFreeValues.push(val)
      }
      this.tryNotifyChanged()
    },
    //-----------------------------------------------
    async OnInputFocused() {
      if(this.autoFocusExtended && !this.isExtended) {
        await this.doExtend()
      }
    },
    //-----------------------------------------------
    async OnTagListChanged(vals=[]) {
      await this.evalMyTags(vals)
      this.tryNotifyChanged()
    },
    //-----------------------------------------------
    async OnClickStatusIcon() {
      if(this.isExtended) {
        this.doCollapse()
      } else {
        await this.doExtend()
      }
    },
    //-----------------------------------------------
    async OnDropListSelected({currentId, checkedIds}={}) {
      this.myCurrentId = currentId
      this.myCheckedIds = checkedIds

      let vals = Ti.Util.truthyKeys(checkedIds)
      await this.evalMyTags(_.concat(vals, this.myFreeValues))
      this.tryNotifyChanged()
    },
    //-----------------------------------------------
    // Core Methods
    //-----------------------------------------------
    async doExtend() {
      this.myOldValue = this.evalMyValues()
      // Try reload options again
      if(_.isEmpty(this.myOptionsData)) {
        await this.reloadMyOptionData(true)
      }
      this.$nextTick(()=>{
        this.myDropStatus = "extended"
      })
    },
    //-----------------------------------------------
    doCollapse({escaped=false}={}) {
      if(escaped) {
        this.$notify("change", this.myOldValue)
      }
      this.myDropStatus = "collapse"
      this.myOldValue   = undefined
    },
    //-----------------------------------------------
    tryNotifyChanged(escaped=false) {
      let vals = this.evalMyValues()
      if(!escaped && !_.isEqual(vals, this.Values)) {
        this.$notify("change", vals)
      }
    },
    //-----------------------------------------------
    // Utility
    //-----------------------------------------------
    evalMyValues(tags=this.myTags, freeValues=this.myFreeValues) {
      let vals = []
      // Tags
      _.forEach(tags, tag => {
        let v = this.Dict.getValue(tag)
        if(!Ti.Util.isNil(v)) {
          vals.push(v)
        } else if (!this.mustInList) {
          vals.push(tag)
        }
      })
      // Ignore free values
      if(this.mustInList || _.isEmpty(freeValues)) {
        return vals
      }
      // Join free values
      return _.concat(vals, freeValues)
    },
    //-----------------------------------------------
    async evalMyTags(vals=this.value) {
      vals = Ti.S.toArray(vals)
      let tags  = []
      let ids   = {}
      let frees = []
      for(let v of vals) {
        let tag = await this.Dict.getItem(v)
        if(tag) {
          tags.push(tag)
          ids[v] = true
        } else {
          frees.push(v)
        }
      }
      this.myTags = tags
      this.myFreeValues = frees
      this.myCheckedIds = ids
    },
    //-----------------------------------------------
    async reloadMyOptionData(force=false) {
      if(force || this.isExtended) {
        this.myOptionsData = await this.Dict.queryData(this.myFilterValue)
      } else {
        this.myOptionsData = []
      }
    },
    //-----------------------------------------------
    // Callback
    //-----------------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-combo-multi-input", uniqKey)
      //....................................
      if("ESCAPE" == uniqKey) {
        this.doCollapse({escaped:true})
        return {prevent:true, stop:true, quit:true}
      }
      //....................................
      // If droplist is actived, should collapse it
      if("ENTER" == uniqKey) {
        if(this.$dropList && this.$dropList.isActived) {
          this.doCollapse()
          return {stop:true, quit:true}
        }
      }
      //....................................
      if("ARROWUP" == uniqKey) {
        if(this.$dropList) {
          this.$dropList.selectPrevRow({
            payload: {byKeyboardArrow: true}
          })
        }
        return {prevent:true, stop:true, quit:true}
      }
      //....................................
      if("ARROWDOWN" == uniqKey) {
        if(this.$dropList && this.isExtended) {
          this.$dropList.selectNextRow({
            payload: {byKeyboardArrow: true}
          })
        } else {
          this.doExtend()
        }
        return {prevent:true, stop:true, quit:true}
      }
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    //-----------------------------------------------
    "value" : {
      handler: "evalMyTags",
      immediate : true
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  created : function() {
    this.debReload = _.debounce(val=>{
      this.reloadMyOptionData()
    }, this.delay)
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/combo/multi-input/ti-combo-multi-input.mjs", _M);
})();
//============================================================
// JOIN: ti/combo/multi-input/_com.json
//============================================================
Ti.Preload("ti/com/ti/combo/multi-input/_com.json", {
  "name" : "ti-combo-multi-input",
  "globally" : true,
  "template" : "./ti-combo-multi-input.html",
  "props"    : [
    "@com:ti/input/ti-input-props.mjs",
    "@com:ti/input/tags/ti-input-tags-props.mjs",
    "@com:ti/combo/input/ti-combo-input-props.mjs"],
  "mixins"   : ["./ti-combo-multi-input.mjs"],
  "components" : [
    "@com:ti/combo/box"]
});
//============================================================
// JOIN: ti/crumb/com/crumb-item/crumb-item.html
//============================================================
Ti.Preload("ti/com/ti/crumb/com/crumb-item/crumb-item.html", `<div class="ti-crumb-item" 
  :class="topClass"
  @click.left="onClickTop">
  <!--
    Icon
  -->
  <ti-icon v-if="icon" 
    class="as-icon"
    :value="icon"/>
  <!--
    Text
  -->
  <template v-if="text">
    <a v-if="href"
      class="as-text"
      @click.prevent
      :href="href"
      :class="textClass">{{text|i18n}}</a>
    <span v-else
      class="as-text"
      :class="textClass">{{text|i18n}}</span>
  </template>
  <!--
    Asterisk
  -->
  <span v-if="asterisk"
    class="as-asterisk"
    ></span>
  <!--
    Path Icon
  -->
  <ti-icon v-if="!atLast"
    class="as-path-icon"
    :value="pathIcon"/>
</div>`);
//============================================================
// JOIN: ti/crumb/com/crumb-item/crumb-item.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "index" : {
      type : Number,
      default : -1
    },
    "atLast" : {
      type : Boolean,
      default : false
    },
    "icon" : {
      type : [String, Object],
      default : null
    },
    "text" : {
      type : String,
      default : null
    },
    "href" : {
      type : String,
      default : null
    },
    "value" : {
      type : [String, Number, Boolean, Object],
      default : null
    },
    "pathIcon" : {
      type : String,
      default : null
    },
    "asterisk" : {
      type : Boolean,
      default : false
    },
    "cancelBubble" : {
      type : Boolean,
      default : true
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "at-tail" : this.atLast,
        "at-path" : !this.atLast,
        "is-asterisk" : this.asterisk
      }, this.className)
    },
    //------------------------------------------------
    textClass() {
      return {
        "without-icon"    : !this.hasIcon && !this.removeIcon
      }
    },
    //------------------------------------------------
    hasIcon() {
      return this.icon ? true : false
    },
    //------------------------------------------------
    theData() {
      return {
        index    : this.index,
        icon     : this.icon,
        text     : this.text,
        value    : this.value,
        href     : this.href,
        atLast   : this.atLast,
        asterisk : this.asterisk
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onClickTop($event) {
      // Show Drop Down
      if(this.hasOptions) {
        $event.stopPropagation()
        this.openDrop()
      }
      // Stop Bubble Up
      else if(this.cancelBubble) {
        $event.stopPropagation()
      }
      // Emit event
      if(this.href) {
        this.$notify("item:active", this.theData)
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/crumb/com/crumb-item/crumb-item.mjs", _M);
})();
//============================================================
// JOIN: ti/crumb/com/crumb-item/_com.json
//============================================================
Ti.Preload("ti/com/ti/crumb/com/crumb-item/_com.json", {
  "name" : "crumb-item",
  "globally" : false,
  "template" : "./crumb-item.html",
  "mixins" : ["./crumb-item.mjs"]
});
//============================================================
// JOIN: ti/crumb/ti-crumb.html
//============================================================
Ti.Preload("ti/com/ti/crumb/ti-crumb.html", `<div class="ti-crumb"
  :class="topClass">
  <!--
    Loop items
  -->
  <crumb-item v-for="it in theData"
    :key="it.index"
    :path-icon="pathIcon"
    :cancel-bubble="cancelItemBubble"
    v-bind="it"/>
</div>`);
//============================================================
// JOIN: ti/crumb/ti-crumb.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "data" : {
      type : Array,
      default : ()=>[]
    },
    "itemIcon" : {
      type : String,
      default : null
    },
    "pathIcon" : {
      type : String,
      default : "zmdi-chevron-right"
    },
    "cancelItemBubble" : {
      type : Boolean,
      default : true
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      if(this.className)
        return this.className
    },
    //------------------------------------------------
    theData() {
      let list = []
      if(_.isArray(this.data)) {
        _.forEach(this.data, (val, index)=>{
          list.push(_.assign({
            icon    : this.itemIcon
          }, val, {index, atLast:index==this.data.length - 1}))
        })
      }
      return list
    },
    //------------------------------------------------
    theDataValues() {
      let list = []
      for(let it of this.theData) {
        list.push(Ti.Util.fallback(it.value, null))
      }
      return list
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  // methods : {
  //   //------------------------------------------------
  //   onItemFired({index=-1}={}) {
  //     if(index >= 0) {
  //       let it = _.nth(this.theData, index)
  //       if(it) {
  //         this.$notify("item:actived", it)
  //       }
  //     }
  //   }
  //   //------------------------------------------------
  // }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/crumb/ti-crumb.mjs", _M);
})();
//============================================================
// JOIN: ti/crumb/_com.json
//============================================================
Ti.Preload("ti/com/ti/crumb/_com.json", {
  "name" : "ti-crumb",
  "globally" : true,
  "template" : "./ti-crumb.html",
  "mixins" : ["./ti-crumb.mjs"],
  "components" : [
    "./com/crumb-item"
  ]
});
//============================================================
// JOIN: ti/datetime/ti-datetime.html
//============================================================
Ti.Preload("ti/com/ti/datetime/ti-datetime.html", `<div class="ti-datetime">
  <!--Date-->
  <ti-calendar class="is-date"
    :value="theDate"
    :month-format="monthFormat"
    :begin-year="beginYear"
    :end-year="endYear"
    @change="onDateChanged"/>
  <!--Time-->
  <div class="is-time">
    <div class="as-time-text">{{theTimeText}}</div>
    <div class="as-time-cols">
      <ti-time
        :value="theTime"
        :mode="timeMode"
        width="100%"
        height="none"
        @change="onTimeChanged"/>
    </div>
  </div>
</div>`);
//============================================================
// JOIN: ti/datetime/ti-datetime.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "value" : {
      type : [String, Number, Date],
      default : null
    },
    "timeMode" : {
      type : String,
      default : "sec",
      /***
       * - `sec`  : "HH:mm:ss"
       * - `min`  : "HH:mm"
       * - `auto` : "HH:mm:ss"
       */
      validator : function(unit) {
        return /^(sec|min|auto)$/.test(unit)
      }
    },
    "monthFormat" : {
      type : String,
      default : "yyyy-MM" 
    },
    "beginYear" : {
      type : [Number, String],
      default : 1970
    },
    "endYear" : {
      type : [Number, String],
      default : (new Date().getFullYear()+1)
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return this.className
    },
    //------------------------------------------------
    theDate() {
      return Ti.Types.toDate(this.value, null)
    },
    //------------------------------------------------
    theTime() {
      return Ti.Types.toTime(this.theDate)
    },
    //------------------------------------------------
    theTimeFormat() {
      return ({
        "sec"  : "HH:mm:ss",
        "min"  : "HH:mm",
        "auto" : "auto"
      })[this.timeMode]
    },
    //------------------------------------------------
    theTimeText() {
      return this.getTimeText(this.theTime)
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onDateChanged(dt) {
      let theDate = this.theDate || new Date()
      let tm = Ti.Types.toTime(this.theTime||0);
      dt = new Date(dt)
      dt.setHours(tm.hours)
      dt.setMinutes(tm.minutes)
      dt.setSeconds(tm.seconds)
      dt.setMilliseconds(tm.milliseconds)
      this.$notify("change", dt)
    },
    //------------------------------------------------
    onTimeChanged(tm) {
      let theDate = this.theDate || new Date()
      let dt = new Date(theDate)
      dt.setHours(tm.hours)
      dt.setMinutes(tm.minutes)
      dt.setSeconds(tm.seconds)
      dt.setMilliseconds(tm.milliseconds)
      this.$notify("change", dt)
    },
    //------------------------------------------------
    getTimeText(tm) {
      if(tm instanceof Ti.Types.Time) {
        return tm.toString(this.theTimeFormat)
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/datetime/ti-datetime.mjs", _M);
})();
//============================================================
// JOIN: ti/datetime/_com.json
//============================================================
Ti.Preload("ti/com/ti/datetime/_com.json", {
  "name" : "ti-datetime",
  "globally" : true,
  "template" : "./ti-datetime.html",
  "mixins" : ["./ti-datetime.mjs"],
  "components" : [
    "@com:ti/time",
    "@com:ti/calendar"]
});
//============================================================
// JOIN: ti/droplist/ti-droplist.html
//============================================================
Ti.Preload("ti/com/ti/droplist/ti-droplist.html", `<component 
  :is="ComType"
  v-bind="this"
  :can-input="false"
  :must-in-list="true"
  :auto-collapse="true"
  @change="$notify('change', $event)"/>`);
//============================================================
// JOIN: ti/droplist/ti-droplist.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "multi" : {
      type : Boolean,
      default : false
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    ComType() {
      return this.multi
        ? "ti-combo-multi-input"
        : "ti-combo-input"
    }
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/droplist/ti-droplist.mjs", _M);
})();
//============================================================
// JOIN: ti/droplist/_com.json
//============================================================
Ti.Preload("ti/com/ti/droplist/_com.json", {
  "name" : "ti-droplist",
  "globally" : true,
  "template" : "./ti-droplist.html",
  "props"    : [
    "@com:ti/input/ti-input-props.mjs",
    "@com:ti/input/tags/ti-input-tags-props.mjs",
    "@com:ti/combo/input/ti-combo-input-props.mjs"],
  "mixins"   : ["./ti-droplist.mjs"],
  "components" : [
    "@com:ti/combo/input",
    "@com:ti/combo/multi-input"
  ]
});
//============================================================
// JOIN: ti/form/com/form-field/form-field-props.mjs
//============================================================
(function(){
const _M = {
  "type" : {
    type : String,
    default : "String"
  },
  "disabled" : {
    type : Boolean,
    default : false
  },
  "uniqKey" : {
    type : String,
    default : null
  },
  "name" : {
    type : [String, Array],
    default : null
  },
  "icon" : {
    type : String,
    default : null
  },
  "fieldStatus" : {
    type : Object,
    default : ()=>({})
  },
  "message" : {
    type : String,
    default : null
  },
  "title" : {
    type : String,
    default : null
  },
  "tip" : {
    type : String,
    default : null
  },
  "width" : {
    type : [String, Number],
    default : "stretch"
  },
  "height" : {
    type : [String, Number],
    default : undefined
  },
  "checkEquals" : {
    type : Boolean,
    default : true
  },
  "undefinedAs" : {
    default : undefined
  },
  "nullAs" : {
    default : undefined
  },
  "nanAs" : {
    type : Number,
    default : undefined
  },
  "emptyAs" : {
    type : String,
    default : undefined
  },
  "defaultAs" : {
    default : undefined
  },
  "display" : {
    type : [String, Object, Boolean],
    default : false
  },
  "funcSet" : {
    type : Object,
    default : ()=>({})
  },
  "comType" : {
    type : String,
    default : "ti-label"
  },
  "comConf" : {
    type : Object,
    default : ()=>({})
  },
  "autoValue" : {
    type : String,
    default : "value"
  },
  "serializer" : {
    type : Function,
    default : _.identity
  },
  "transformer" : {
    type : Function,
    default : _.identity
  },
  "data" : {
    type : Object,
    default : null
  },
  "statusIcons" : {
    type : Object,
    default : ()=>({
      spinning : 'fas-spinner fa-spin',
      error    : 'zmdi-alert-polygon',
      warn     : 'zmdi-alert-triangle',
      ok       : 'zmdi-check-circle',
    })
  }
}
Ti.Preload("ti/com/ti/form/com/form-field/form-field-props.mjs", _M);
})();
//============================================================
// JOIN: ti/form/com/form-field/form-field.html
//============================================================
Ti.Preload("ti/com/ti/form/com/form-field/form-field.html", `<div class="form-field"
  :class="TopClass"
  :style="ConStyle"
  v-ti-activable>
  <!--========================================
    Field Name
  -->
  <div 
    v-if="isShowTitle"
      class="field-name"
      :data-tip="StatusText">
        <!--Status Icon-->
        <span 
          v-if="StatusIcon"
            class="name-status">
            <ti-icon :value="StatusIcon"/>
        </span>
        <!--Title Text-->
        <span class="name-title">{{TheTitle|i18n}}</span>
        <!--Field Icon-->
        <span 
          v-if="isShowIcon" 
            class="name-icon">
            <ti-icon :value="icon"/>
        </span>
  </div>
  <!--========================================
    Field Value
  -->
  <div class="field-value"
    :style="ConStyle">
    <!--
      UI Component
    -->
    <div v-if="isComReady"
      class="field-component"
      :class="ComClass"
      :style="ComStyle">
      <component 
        :is="myComType"
          v-bind="myComConf"
          @change="OnChange"/>
    </div>
    <!--
      Tips
    -->
    <div 
      v-if="isShowTip"
        class="field-tip">{{tip|i18n}}</div>
  </div>
</div>`);
//============================================================
// JOIN: ti/form/com/form-field/form-field.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////////
  data : ()=>({
    isComReady : false,
    myComType : null,
    myComConf : null
  }),
  //////////////////////////////////////////////
  computed : {
    //----------------------------------------
    TopClass() {
      return this.getTopClass({
        "no-status-icons"  : !this.hasStatusIcons,
        "has-status-icons" : this.hasStatusIcons,
        "is-disabled" : this.disabled
      }, 
      `as-${this.viewportMode}`,
      (this.StatusType?`is-${this.StatusType}`:null))
    },
    //----------------------------------------
    isShowTitle  () {return !Ti.Util.isNil(this.title)},
    isShowIcon   () {return !Ti.Util.isNil(this.icon)},
    isShowTip    () {return !Ti.Util.isNil(this.tip)},
    hasStatusIcons(){return !_.isEmpty(this.statusIcons)},
    //----------------------------------------
    isNumberType() {
      return /^(Number|Integer|Float)$/.test(this.type)
    },
    //----------------------------------------
    UniqName() {
      return _.isArray(this.name)
        ? this.name.join("-")
        : this.name
    },
    //----------------------------------------
    TheTitle() {
      return this.title || this.UniqName
    },
    //----------------------------------------
    ComClass() {
      let auto    = "auto" == this.width
      let full    = "full" == this.width
      let stretch = "stretch" == this.width
      let fixed   = !auto && !full && !stretch && !Ti.Util.isNil(this.width)
      return {
        "is-size-auto"     : auto,
        "is-size-full"     : full,
        "is-size-stretch"  : stretch,
        "is-size-fixed"    : fixed
      }
    },
    //----------------------------------------
    ConStyle() {
      return Ti.Css.toStyle({
        height: this.height
      })
    },
    //----------------------------------------
    ComStyle() {
      let css = {
        height: this.height
      }
      if(this.width && !/^(auto|stretch)$/.test(this.width)) {
        css.width = Ti.Css.toSize(this.width)
      }
      return Ti.Css.toStyle(css)
    },
    //----------------------------------------
    TheDisplay() {
      // Guard
      if(!this.display) {
        return
      }
      // Eval setting
      if(!_.isBoolean(this.display) && this.display) {
        return this.evalFieldDisplayItem(this.display, {
          funcSet    : this.funcSet,
          defaultKey : this.name
        })
      }
      // return default.
      return {
        comType : "ti-label",
        comConf : {}
      }
    },
    //----------------------------------------
    CurrentDisplayItem() {
      // Display Mode
      let dis = this.TheDisplay || {}

      // If Actived reset the display
      if(this.isActived || !this.display) {
        dis = {
          defaultAs: this.defaultAs,
          comType : this.comType,
          comConf : this.comConf,
        }
      }

      // Assign the default value and return
      return _.defaults(_.cloneDeep(dis), {
        comType : "ti-label",
        key     : this.name,
        type    : this.type,
        dict    : this.dict,
        transformer : this.transformer
      })
    },
    //----------------------------------------
    Status() {
      return _.get(this.fieldStatus, this.uniqKey)
    },
    //----------------------------------------
    StatusType() {
      return _.get(this.Status, "type")
    },
    //----------------------------------------
    StatusText() {
      return _.get(this.Status, "text")
    },
    //----------------------------------------
    StatusIcon() {
      if(this.Status && this.hasStatusIcons) {
        return this.statusIcons[this.Status.type]
      }
    },
    //----------------------------------------
  },
  ////////////////////////////////////////////////
  methods : {
    //--------------------------------------------
    __before_bubble({name, args}) {
      if(this.name) {
        return {
          name : `${this.UniqName}::${name}`,
          args
        }
      }
    },
    //--------------------------------------------
    OnChange(val) {
      // Customized value
      let v2 = val
      try {
        //console.log("this.serializer(val):", val)
        v2 = this.serializer(val)
        //console.log("field changed", val, v2)
      }
      // Invalid 
      catch(error) {
        this.$notify("invalid", {
          errMessage : ""+error,
          name  : this.name,
          value : val
        })
        return
      }
      
      // apply default
      v2 = this.evalInputValue(v2)

      // emit event
      if(!this.checkEquals || !_.isEqual(v2, this.fieldValue)) {
        this.$notify("change", {
          name  : this.name,
          value : v2
        })
      }
    },
    //--------------------------------------------
    async evalTheCom() {
      let theCom = await this.evalDataForFieldDisplayItem({
        itemData : this.data, 
        displayItem : this.CurrentDisplayItem, 
        vars : {
          "isActived" : this.isActived,
          "disabled"  : this.disabled
        },
        autoIgnoreNil : false,
        autoValue : this.autoValue
      })
      // console.log("evalTheCom", {
      //   myUID      : this._uid,
      //   isActived  : this.isActived,
      //   oldComType : this.myComType,
      //   oldComConf : _.cloneDeep(this.myComConf),
      //   newComType : theCom.comType,
      //   newComConf : _.cloneDeep(theCom.comConf),
      // })
      
      this.myComType = theCom.comType
      this.myComConf = theCom.comConf

      this.isComReady = true
    },
    //--------------------------------------------
    evalInputValue(val) {
      // apply default
      if(_.isUndefined(val)){
        return _.cloneDeep(
          Ti.Util.fallback(this.undefinedAs, this.defaultAs)
        )
      }
      if(_.isNull(val)){
        return _.cloneDeep(
          Ti.Util.fallback(this.nullAs, this.defaultAs, null)
        )
      }
      if(this.isNumberType && isNaN(val)) {
        return _.cloneDeep(
          Ti.Util.fallback(this.nanAs, this.defaultAs, NaN)
        )
      }
      if(_.isEmpty(val) && _.isString(val)) {
        return _.cloneDeep(
          Ti.Util.fallback(this.emptyAs, this.defaultAs, "")
        )
      }
      return val
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  watch : {
    "CurrentDisplayItem" : "evalTheCom",
    "data" : {
      handler: "evalTheCom",
      immediate : true
    }
  }
  ////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/form/com/form-field/form-field.mjs", _M);
})();
//============================================================
// JOIN: ti/form/com/form-field/_com.json
//============================================================
Ti.Preload("ti/com/ti/form/com/form-field/_com.json", {
  "name" : "ti-form-field",
  "globally" : true,
  "template" : "./form-field.html",
  "methods"  : "@com:ti/support/field_display.mjs",
  "props" : "./form-field-props.mjs",
  "mixins" : ["./form-field.mjs"]
});
//============================================================
// JOIN: ti/form/com/form-group/form-group-props.mjs
//============================================================
(function(){
const _M = {
  "type" : {
    type : String,
    default : "Group"
  },
  "icon" : {
    type : String,
    default : null
  },
  "title" : {
    type : String,
    default : null
  },
  "fields" : {
    type : Array,
    default : ()=>[]
  },
  "data" : {
    type : Object,
    default : null
  },
  "fieldStatus" : {
    type : Object,
    default : ()=>({})
  },
  "statusIcons" : {
    spinning : 'fas-spinner fa-spin',
    error    : 'zmdi-alert-polygon',
    warn     : 'zmdi-alert-triangle',
    ok       : 'zmdi-check-circle',
  }
}
Ti.Preload("ti/com/ti/form/com/form-group/form-group-props.mjs", _M);
})();
//============================================================
// JOIN: ti/form/com/form-group/form-group.html
//============================================================
Ti.Preload("ti/com/ti/form/com/form-group/form-group.html", `<div class="form-group"
  :class="topClass">
  <div class="group-title">
    <ti-icon
      v-if="show.icon" 
      :value="icon"/>
    <span
      v-if="show.title"
      class="name-title">{{title|i18n}}</span>
  </div>
  <div class="group-fields">
      <ti-form-field v-for="fld in fields"
        :key="fld.key"
        v-bind="fld"
        :data="data"
        :field-status="fieldStatus"
        :status-icons="statusIcons"/>
  </div>
</div>`);
//============================================================
// JOIN: ti/form/com/form-group/form-group.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs: false,
  ///////////////////////////////////////////
  computed : {
    //----------------------------------------
    topClass() {
      let klass = [`as-${this.viewportMode}`]
      if(this.className) {
        klass.push(this.className)
      }
      return klass
    },
    //----------------------------------------
    show() {
      return {
        title : this.title ? true : false,
        icon  : this.icon  ? true : false
      }
    }
    //----------------------------------------
  }
  ///////////////////////////////////////////
}
Ti.Preload("ti/com/ti/form/com/form-group/form-group.mjs", _M);
})();
//============================================================
// JOIN: ti/form/com/form-group/_com.json
//============================================================
Ti.Preload("ti/com/ti/form/com/form-group/_com.json", {
  "name" : "form-group",
  "globally" : false,
  "template" : "./form-group.html",
  "props" : "./form-group-props.mjs",
  "mixins" : ["./form-group.mjs"]
});
//============================================================
// JOIN: ti/form/ti-form-props.mjs
//============================================================
(function(){
const _M = {
  //-----------------------------------
  // Data
  //-----------------------------------
  "data" : {
    type : Object,
    default : undefined
  },
  "fields" : {
    type : Array,
    default : ()=>[]
  },
  "fieldStatus" : {
    type : Object,
    default : ()=>({})
  },
  // "extendFunctionSet" : {
  //   type : Object,
  //   default : undefined
  // },
  "onlyFields" : {
    type: Boolean,
    default: true
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "keepTabIndexBy" : {
    type : String,
    default : null
  },
  "defaultComType" : {
    type : String,
    default : "ti-label"
  },
  "autoShowBlank" : {
    type : Boolean,
    default : undefined
  },
  "currentTab" : {
    type : Number,
    default : 0
  },
  "adjustDelay" : {
    type : Number,
    default : 0
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "mode" : {
    type : String,
    default : "all",
    validator : (val)=>/^(all|tab)$/.test(val)
  },
  "tabAt" : {
    type : String,
    default : "top-center",
    validator : (v)=>/^(top|bottom)-(left|center|right)$/.test(v)
  },
  "blankAs" : {
    type : Object,
    default : ()=>({
      icon : "zmdi-alert-circle-o",
      text : "i18n:empty-data"
    })
  },
  "icon" : {
    type : String,
    default : null
  },
  "title" : {
    type : String,
    default : null
  },
  "statusIcons" : {
    type : Object,
    default : ()=>({
      spinning : 'fas-spinner fa-spin',
      error    : 'zmdi-alert-polygon',
      warn     : 'zmdi-alert-triangle',
      ok       : 'zmdi-check-circle',
    })
  },
  "spacing" : {
    type : String,
    default : "comfy",
    validator : v => /^(comfy|tiny)$/.test(v)
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "width" : {
    type : [Number, String],
    default : null
  },
  "height" : {
    type : [Number, String],
    default : null
  }
}
Ti.Preload("ti/com/ti/form/ti-form-props.mjs", _M);
})();
//============================================================
// JOIN: ti/form/ti-form.html
//============================================================
Ti.Preload("ti/com/ti/form/ti-form.html", `<div class="ti-form"
  :class="TopClass"
  :style="TopStyle"
  v-ti-activable>
  <template v-if="hasData || !isAutoShowBlank">
    <!--
      Form Header
    -->
    <header class="form-header" v-if="hasHeader">
      <span v-if="icon"
        class="it-icon"><ti-icon :value="icon"/></span>
      <span v-if="title"
        class="it-text">{{title}}</span>
    </header>
    <!--
      Tabs for display:"tab"
    -->
    <div class="form-tab" v-if="isTabMode">
      <ul>
        <li v-for="tab in TabItems" 
          :class="tab.className"
          @click.left="OnClickTab(tab)">
          <ti-icon 
            class="tab-icon" v-if="tab.icon" :value="tab.icon"/>
          <span 
            class="tab-text" v-if="tab.title">{{tab.title|i18n}}</span>
        </li>
      </ul>
    </div>
    <!--
      Form Fields
    -->
    <div class="form-body">
      <template v-for="fld in FieldsInCurrentTab">
        <!--
          For Group
        -->
        <form-group v-if="'Group' == fld.type"
          v-bind="fld"
          :data="TheData"
          :field-status="fieldStatus"
          :status-icons="statusIcons"
          @change="OnFieldChange"/>
        <!--
          For field
        -->
        <ti-form-field v-else
          :key="fld.key"
          v-bind="fld"
          :data="TheData"
          :field-status="fieldStatus"
          :status-icons="statusIcons"
          @change="OnFieldChange"/>
      </template>
    </div>
  </template>
  <!--
    Show Blank
  -->
  <template v-else>
    <ti-loading v-bind="blankAs"/>
  </template>
</div>`);
//============================================================
// JOIN: ti/form/ti-form.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////////////////
  model : {
    prop  : "data",
    event : "change"
  },
  //////////////////////////////////////////////////////
  data : ()=>({
    currentTabIndex : 0
  }),
  //////////////////////////////////////////////////////
  computed : {
    //--------------------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-tab-mode": this.isTabMode,
        "is-all-mode": this.isAllMode,
        [`tab-at-${this.tabAt}`]  : this.isTabMode,
        [`tab-at-${this.TheTabAtX}`] : this.isTabMode,
        [`tab-at-${this.TheTabAtY}`] : this.isTabMode
      }, 
      `as-${this.viewportMode}`,
      `as-spacing-${this.spacing||"comfy"}`
      )
    },
    //--------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //--------------------------------------------------
    hasHeader() {
      return this.title || this.icon ? true : false
    },
    //--------------------------------------------------
    hasData() {
      return !Ti.Util.isNil(this.data)
    },
    //--------------------------------------------------
    isTabMode() {return 'tab' == this.mode},
    isAllMode() {return 'all' == (this.mode || "all")},
    isAutoShowBlank() {return Ti.Util.fallback(this.autoShowBlank, false)},
    //--------------------------------------------------
    TheTabAt() {return this.tabAt.split("-")},
    TheTabAtX(){return this.TheTabAt[1]},
    TheTabAtY(){return this.TheTabAt[0]},
    //--------------------------------------------------
    TheFields() {
      let list = []
      _.forEach(this.fields, (fld, index)=>{
        let fld2 = this.evalFormField(fld, [index])
        if(fld2) {
          list.push(fld2)
        }
      })
      return list
    },
    //--------------------------------------------------
    KeysInFields() {
      let keys = []
      for(let fg of this.TheFields) {
        if(this.isGroup(fg)) {
          _.forEach(fg.fields, (fld)=>{
            if(_.isArray(fld.name)) {
              keys.push(...fld.name)
            } else {
              keys.push(fld.name)
            }
          })
        } else {
          if(_.isArray(fg.name)) {
            keys.push(...fg.name)
          } else {
            keys.push(fg.name)
          }
        }
      }
      return keys
    },
    //--------------------------------------------------
    TabList() {
      let list = []
      let otherFields = []
      if(this.isTabMode) {
        for(let fld of this.TheFields) {
          if(fld.type == "Group") {
            list.push(fld)
          }
          // Collect to others
          else {
            otherFields.push(fld)
          }
        }
        // Join others
        if(!_.isEmpty(otherFields)) {
          list.push({
            type : "Group",
            title : "i18n:others",
            fields : otherFields
          })
        }
      }
      return list;
    },
    //--------------------------------------------------
    // add "current" to theTabList
    TabItems() {
      let items = []
      _.forEach(this.TabList, (li, index)=>{
        let isCurrent = (index == this.currentTabIndex)
        items.push(_.assign({}, li, {
          index, isCurrent, className: {
            "is-current" : isCurrent
          }
        }))
      })
      return items
    },
    //--------------------------------------------------
    CurrentTab() {
      for(let tab of this.TabItems) {
        if(tab.isCurrent) {
          return tab
        }
      }
    },
    //--------------------------------------------------
    FieldsInCurrentTab() {
      // Current Tab
      if(this.isTabMode) {
        if(this.CurrentTab) {
          return this.CurrentTab.fields || []
        }
        return []
      }
      // Show All
      else {
        return this.TheFields
      }
    },
    //--------------------------------------------------
    /***
     * Eval function set for `transformer|serializer` of each fields
     * 
     * Defaultly, it will support the function set defined in `Ti.Types`
     */
    // FuncSet() {
    //   return _.assign({}, Ti.GlobalFuncs(), this.extendFunctionSet)
    // },
    //--------------------------------------------------
    TheData() {
      if(this.data) {
        if(this.onlyFields) {
          return _.pick(this.data, this.KeysInFields)
        }
        return this.data
      }
      return {}
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  methods : {
    //--------------------------------------------------
    OnClickTab(tab) {
      this.currentTabIndex = tab.index
      this.$notify("tab:change", tab)
    },
    //--------------------------------------------------
    OnFieldChange({name, value}={}) {
      //console.log("ti-form.OnFieldChange", {name, value})      
      let data = _.cloneDeep(this.TheData)
      // Signle value
      if(_.isString(name)) {
        // Whole data
        if(".." == name) {
          _.assign(data, value)
        }
        // Statci value
        else if(/^'[^']+'$/.test(name)) {
          return
        }
        // Dynamic value
        else {
          _.set(data, name, value)
        }
      }
      // Object
      else if(_.isArray(name)) {
        let vo = {}
        for(let k of name) {
          vo[k] = _.get(value, k)
        }
        _.assign(data, vo)
      }
      // Other 
      else {
        return
      }

      // Notify
      this.$notify("field:change", {name, value})
      this.$notify("change", data)
    },
    //--------------------------------------
    isGroup(fld) {
      return "Group" == fld.type || _.isArray(fld.fields)
    },
    //--------------------------------------------------
    evalFormField(fld={}, nbs=[]) {
      // Hide or disabled
      if(fld.hidden) {
        if(Ti.Validate.match(this.data, fld.hidden)) {
          return
        }
      }
      // Disable
      let disabled = false
      if(fld.disabled) {
        disabled = Ti.Validate.match(this.data, fld.disabled)
      }

      // The key
      let fldKey = Ti.Util.anyKey(fld.name||nbs, "ti-fld")
      // let fldKey = fld.name
      //   ? [].concat(fld.name).join("-")
      //   : "ti-fld-" + nbs.join("-")
      //............................................
      // For group
      if(this.isGroup(fld)) {
        let group = {
          disabled,
          type        : "Group",
          key         : fldKey,
          className   : fld.className,
          icon        : fld.icon,
          title       : fld.title,
          fields      : []
        }
        // Group fields
        _.forEach(fld.fields, (subfld, index)=>{
          let newSubFld = this.evalFormField(subfld, [...nbs, index])
          if(newSubFld) {
            group.fields.push(newSubFld)
          }
        })
        // Done
        return _.isEmpty(group.fields) ? null : group
      }
      //............................................
      // For Normal Field
      if(fld.name) {
        let field = _.defaults(_.omit(fld, "disabled"), {
          type : "String",
          comType : this.defaultComType,
          disabled
        })

        // The UniqKey of field
        field.uniqKey = _.concat(field.name).join("-")
        //console.log(field.uniqKey)

        // // field status
        // let fStatus = _.get(this.fieldStatus, funiqKey)
        // if(fStatus) {
        //   field.status  = fStatus.status
        //   field.message = fStatus.message
        // }

        // Default
        if(!field.serializer) {
          let fnName = Ti.Types.getFuncByType(field.type||"String", "serializer")
          field.serializer = `Ti.Types.${fnName}`
        }
        if(!field.transformer) {
          let fnName = Ti.Types.getFuncByType(field.type||"String", "transformer")
          field.transformer = `Ti.Types.${fnName}`
        }        

        // Tidy form function
        const invokeOpt = {
          context: this,
          partialRight: true
        }
        field.serializer  = Ti.Util.genInvoking(field.serializer, invokeOpt)
        field.transformer = Ti.Util.genInvoking(field.transformer,invokeOpt)

        // Done
        return field
      }
    },
    //--------------------------------------------------
    __adjust_fields_width() {
      // Guard
      if(!_.isElement(this.$el))
        return
      // Find all field-name Elements
      let $fldNames = Ti.Dom.findAll(".form-field > .field-name", this.$el)

      // Reset them to org-width
      for(let $fldnm of $fldNames) {
        Ti.Dom.setStyle($fldnm, {width:""})
      }

      // Get the max-width of them
      let maxWidth = 0
      for(let $fldnm of $fldNames) {
        let rect = Ti.Rects.createBy($fldnm)
        maxWidth = Math.ceil(Math.max(rect.width, maxWidth))
      }

      // Wait for whole view rendered, and align the field-name
      for(let $fldnm of $fldNames) {
        Ti.Dom.setStyle($fldnm, {width:maxWidth})
      }
    },
    //--------------------------------------------------
    adjustFieldsWidth() {
      if(this.adjustDelay > 0) {
        _.delay(()=>{
          this.__adjust_fields_width()
        }, this.adjustDelay)
      } else {
        this.$nextTick(()=>{
          this.__adjust_fields_width()
        })
      }
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  watch : {
    "TheFields" : function(){
      this.adjustFieldsWidth()
    },
    "currentTab" : function(index){
      this.currentTabIndex = index
    },
    "currentTabIndex" : function(index){
      if(this.keepTabIndexBy) {
        Ti.Storage.session.set(this.keepTabIndexBy, index)
      }
      this.adjustFieldsWidth()
    }
  },
  //////////////////////////////////////////////////////
  created : function() {
    this.__debounce_adjust_fields_width = _.debounce(()=>{
      this.__adjust_fields_width()
    }, 500)
  },
  //////////////////////////////////////////////////////
  mounted : function() {
    //--------------------------------------------------
    this.currentTabIndex = 
      Ti.Storage.session.getInt(
          this.keepTabIndexBy, this.currentTab
      )
    //--------------------------------------------------
    Ti.Viewport.watch(this, {resize:()=>{
      this.__debounce_adjust_fields_width()
    }})
    //--------------------------------------------------
    this.adjustFieldsWidth()
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/form/ti-form.mjs", _M);
})();
//============================================================
// JOIN: ti/form/_com.json
//============================================================
Ti.Preload("ti/com/ti/form/_com.json", {
  "name" : "ti-form",
  "globally" : true,
  "template" : "./ti-form.html",
  "methods"  : "@com:ti/support/field_display.mjs",
  "props" : "./ti-form-props.mjs",
  "mixins" : ["./ti-form.mjs"],
  "components" : [
    "./com/form-group",
    "./com/form-field",
    "@com:ti/input",
    "@com:ti/input/num",
    "@com:ti/input/tags",
    "@com:ti/input/color",
    "@com:ti/input/icon",
    "@com:ti/input/date",
    "@com:ti/input/time",
    "@com:ti/input/timerange",
    "@com:ti/input/month",
    "@com:ti/input/datetime",
    "@com:ti/input/daterange",
    "@com:ti/input/text",
    "@com:ti/combo/input",
    "@com:ti/combo/multi-input",
    "@com:ti/label",
    "@com:ti/toggle",
    "@com:ti/switcher",
    "@com:ti/droplist"]
});
//============================================================
// JOIN: ti/form/_hmaker.json
//============================================================
Ti.Preload("ti/com/ti/form/_hmaker.json", {
  "icon"   : "im-task-o",
  "title"  : "i18n:com-form",
  "scenes" : ["desktop", "tablet"],
  "editComType" : "hmaker-edit-com-form",
  "editComConf" : {
    "value" : "=comConf"
  }
});
//============================================================
// JOIN: ti/gui/block/ti-gui-block.html
//============================================================
Ti.Preload("ti/com/ti/gui/block/ti-gui-block.html", `<div class="ti-gui-block" 
  :class="TopClass"
  :style="TopStyle">
  <!--
    Header
  -->
  <div class="block-head" v-if="isShowHeader">
    <!--Icon-->
    <div class="as-icon" v-if="icon">
      <ti-icon :value="icon"/>
    </div>
    <!--Title-->
    <div class="as-title">
      <span v-if="title">{{title|i18n}}</span>
    </div>
    <!--Actions-->
    <div class="as-actions" v-if="hasActions">
      <ti-actionbar 
        :items="actions"
        :status="actionStatus"/>
    </div>
  </div>
  <!--
    Content
  -->
  <div class="block-main" v-if="TheCom">
    <div class="block-main-con"
      :class="MainConClass">
      <component 
        class="ti-fill-parent"
        :is="TheCom.comType"
        v-bind="TheCom.comConf"/>
    </div>
  </div>
  <!--Blank-->
  </div>`);
//============================================================
// JOIN: ti/gui/block/ti-gui-block.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////
  inject : ["$gui"],
  /////////////////////////////////////////
  props : {
    "type" : {
      type : String,
      default : null,
      validator : (v)=>{
        return Ti.Util.isNil(v)
          || /^(cols|rows|tabs)$/.test(v)
      }
    },
    "title" : {
      type : String,
      default : null
    },
    "icon" : {
      type : [String, Object],
      default : null
    },
    "hideTitle" : {
      type : Boolean,
      default : false
    },
    "actions" : {
      type : Array,
      default : ()=>[]
    },
    "actionStatus" : {
      type : Object,
      default : ()=>({})
    },
    "name" : {
      type : String,
      default : null
    },
    "blocks" : {
      type : Array,
      default : ()=>[]
    },
    "body" : {
      type : [String, Object],
      default : null
    },
    "embedIn" : {
      type : String,
      default : null,
      validator : (v)=>/^(panel|rows|cols|tabs)$/.test(v)
    },
    "size" : {
      type : [String, Number],
      default : null
    },
    "overflow" : {
      type : String,
      default : null
    },
    "flex" : {
      type : String,
      default : undefined,
      validator : (v)=>(_.isUndefined(v) || /^(auto|grow|shrink|both|none)$/.test(v))
    },
    "schema" : {
      type : Object,
      default : ()=>({})
    },
    "shown" : {
      type : Object,
      default : ()=>({})
    },
    "captureEvents" : {
      type : Object,
      default : ()=>({})
    },
    // Those 3 props for by-pass to sub-(cols/rows)
    "tabAt"       : undefined,
    "adjustable"  : undefined,
    "border"      : undefined
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        [`gui-block-${this.name}`] : this.name ? true : false,
        "is-show-header"  : this.isShowHeader,
        "is-hide-header"  : !this.isShowHeader,
        "ti-fill-parent" : /^(tabs|panel)$/.test(this.embedIn)
      }, `is-flex-${this.FlexName}`)
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toStyle(({
        //..................................
        rows:()=>({
          height: this.BlockSize
        }),
        //..................................
        cols:()=>({
          width : this.BlockSize
        }),
        //..................................
        tabs:()=>({}),
        //..................................
        panel:()=>({})
        //..................................
      })[this.embedIn]())
    },
    //--------------------------------------
    MainConClass() {
      return {
        "can-flex-none"   : this.isFlexNone,
        "can-flex-shrink" : !this.isFlexNone
      }
    },
    //--------------------------------------
    BlockSize() {
      let size = this.size
      return /^(auto|stretch)$/.test(size) 
        ? null
        : size
    },
    //--------------------------------------
    FlexName() {
      let flex = this.flex || this.$gui.defaultFlex || "auto"
      if("auto" == flex) {
        if("stretch" == this.size || Ti.Util.isNil(this.size)) {
          return "both"
        }
        return "none"
      }
      return flex || "both"
    },
    //--------------------------------------
    isFlexNone() {
      return "none" == this.FlexName
    },
    //--------------------------------------
    isShowHeader() {
      if(this.hideTitle || 'tabs' == this.embedIn) {
        return false
      }
      if(this.title || this.hasActions) {
        return true
      }
      return false
    },
    //--------------------------------------
    hasActions() {
      return !_.isEmpty(this.actions)
    },
    //--------------------------------------
    TheCom() {
      //....................................
      // Body -> Component
      if(this.body) {
        let com = _.isString(this.body) ? this.schema[this.body] : this.body
        if(com) {
          let parent = this.schema[com.extends]
          let self = _.omit(com, "extends")
          com = _.merge({}, parent, self)
          return _.defaults(com, {
            comType : "ti-label",
            comConf : {}
          })
        }
      }
      //....................................
      // Sub GUI
      if(!_.isEmpty(this.blocks)) {
        let comType = `ti-gui-${this.type||"cols"}`
        let comConf = {
          tabAt      : this.tabAt,
          border     : this.border,
          adjustable : this.adjustable,
          blocks     : this.blocks,
          schema : this.schema,
          actionStatus : this.actionStatus,
          shown  : this.shown,
          defaultFlex : this.defaultFlex
        }
        return {
          comType, comConf
        }
      }
      //....................................
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    __before_bubble({name, args}) {
      if(this.name) {
        return {
          name : `${this.name}::${name}`,
          args
        }
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/gui/block/ti-gui-block.mjs", _M);
})();
//============================================================
// JOIN: ti/gui/block/_com.json
//============================================================
Ti.Preload("ti/com/ti/gui/block/_com.json", {
  "name" : "ti-gui-block",
  "globally" : true,
  "template" : "./ti-gui-block.html",
  "mixins"   : ["./ti-gui-block.mjs"]
});
//============================================================
// JOIN: ti/gui/cols/ti-gui-cols.html
//============================================================
Ti.Preload("ti/com/ti/gui/cols/ti-gui-cols.html", `<div class="ti-gui-cols" :class="topClass">
  <template v-if="hasBlocks">
    <template v-for="(block, index) in blocks">
      <ti-gui-block v-if="!block.hide"
        :key="index"
        embed-in="cols"
        v-bind="block"
        :schema="schema"
        :action-status="actionStatus"
        :shown="shown"/>
      </template>
  </template>
</div>`);
//============================================================
// JOIN: ti/gui/cols/ti-gui-cols.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "blocks" : {
      type : Array,
      default : ()=>[]
    },
    "adjustable" : {
      type : Boolean,
      default : true
    },
    "border" : {
      type : Boolean,
      default : false
    },
    "schema" : {
      type : Object,
      default : ()=>({})
    },
    "actionStatus" : {
      type : Object,
      default : ()=>({})
    },
    "shown" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-adjustable" : this.adjustable,
        "show-border"   : this.border
      }, this.className)
    },
    //--------------------------------------
    hasBlocks() {
      return !_.isEmpty(this.blocks)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    //--------------------------------------
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/gui/cols/ti-gui-cols.mjs", _M);
})();
//============================================================
// JOIN: ti/gui/cols/_com.json
//============================================================
Ti.Preload("ti/com/ti/gui/cols/_com.json", {
  "name" : "ti-gui-cols",
  "globally" : true,
  "template" : "./ti-gui-cols.html",
  "mixins"   : ["./ti-gui-cols.mjs"],
  "components" : ["@com:ti/gui/block"]
});
//============================================================
// JOIN: ti/gui/panel/ti-gui-panel.html
//============================================================
Ti.Preload("ti/com/ti/gui/panel/ti-gui-panel.html", `<div class="ti-gui-panel"
  :class="TopClass"
  @click.left="OnClickMask">
  <div class="panel-con"
    :style="ConStyle"
    @click.left.stop>
    <!--
      Block
    -->
    <ti-gui-block
      embed-in="panel"
      flex="none"
      :type="type"
      :title="title"
      :icon="icon"
      :hide-title="hideTitle"
      :actions="actions"
      :action-status="actionStatus"
      :name="name"
      :blocks="blocks"
      :body="body"
      :overflow="overflow"
      :schema="schema"
      :shown="shown"
      :capture-events="captureEvents"/>
    <!--
      Closer
    -->
    <div
      v-if="hasCloser"
        class="panel-closer"
        :class="CloserClass">
        <ti-icon
          value="zmdi-close"
          @click.native="OnClose"/>
    </div>
  </div>
</div>`);
//============================================================
// JOIN: ti/gui/panel/ti-gui-panel.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  inject: ["$gui"],
  /////////////////////////////////////////
  props : {
    "captureEvents" : undefined,
    "title" : {
      type : String,
      default : null
    },
    "icon" : {
      type : [String, Object],
      default : null
    },
    "hideTitle" : {
      type : Boolean,
      default : false
    },
    "actions" : {
      type : Array,
      default : ()=>[]
    },
    "actionStatus" : {
      type : Object,
      default : ()=>({})
    },
    "name" : {
      type : String,
      default : null
    },
    "type" : {
      type : String,
      default : null,
      validator : (v)=>{
        return Ti.Util.isNil(v)
          || /^(cols|rows|tabs)$/.test(v)
      }
    },
    "blocks" : {
      type : Array,
      default : ()=>[]
    },
    "body" : {
      type : [String, Object],
      default : null
    },
    "adjustable" : {
      type : [Boolean, String],
      default : true,
      validator : (v)=>{
        return _.isBoolean(v) || /^(x|y)$/.test(v)
      }
    },
    "overflow" : {
      type : String,
      default : null
    },
    "width" : {
      type : [String,Number],
      default : -1
    },
    "height" : {
      type : [String,Number],
      default : -1
    },
    "viewportWidth" : {
      type : [String,Number],
      default : 0
    },
    "viewportHeight" : {
      type : [String,Number],
      default : 0
    },
    "position" : {
      type : String,
      default : "center",
      validator : (v)=>{
        return /^(left|right|top|bottom|center)$/.test(v)
          || /^((left|right)-top|bottom-(left|right))$/.test(v)
      }
    },
    "closer" : {
      type : String,
      default : "default",
      validator : (v)=>(
        _.isNull(v) || /^(default|bottom|top|left|right)$/.test(v)
      )
    },
    "mask" : {
      type : Boolean,
      default : false
    },
    "clickMaskToClose" : {
      type : Boolean,
      default : false
    },
    "schema" : {
      type : Object,
      default : ()=>({})
    },
    "shown" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "show-mask" : this.mask,
        "no-mask"   : !this.mask,
        "is-closer-default" : this.isCloserDefault
      }, `at-${this.position}`)
    },
    //--------------------------------------
    ConStyle() {
      let width  = Ti.Css.toPixel(this.width, this.viewportWidth, this.width)
      let height = Ti.Css.toPixel(this.height, this.viewportHeight, this.height)
      return Ti.Css.toStyle({width, height})
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
    CloserClass() {
      return Ti.Css.mergeClassName({
        'as-lamp-cord' : !this.isCloserDefault,
        'as-default'   : this.isCloserDefault,
        [`at-${this.closer}`] : !this.isCloserDefault
      })
    }
    //--------------------------------------
    // theCloserIconName() {
    //   return this.isCloserDefault
    //           ? "zmdi-minus"
    //           : "zmdi-close";
    //}
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClose() {
      this.$gui.onBlockHide(this.name)
    },
    //--------------------------------------
    OnClickMask() {
      if(this.clickMaskToClose) {
        this.$gui.onBlockHide(this.name)
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/gui/panel/ti-gui-panel.mjs", _M);
})();
//============================================================
// JOIN: ti/gui/panel/_com.json
//============================================================
Ti.Preload("ti/com/ti/gui/panel/_com.json", {
  "name" : "ti-gui-panel",
  "globally" : true,
  "template" : "./ti-gui-panel.html",
  "mixins"   : ["./ti-gui-panel.mjs"],
  "components" : ["@com:ti/gui/block"]
});
//============================================================
// JOIN: ti/gui/rows/ti-gui-rows.html
//============================================================
Ti.Preload("ti/com/ti/gui/rows/ti-gui-rows.html", `<div class="ti-gui-rows" :class="topClass">
  <template v-if="hasBlocks">
    <template v-for="(block, index) in blocks">
      <ti-gui-block v-if="!block.hide"
        :key="index"
        embed-in="rows"
        v-bind="block"
        :schema="schema"
        :action-status="actionStatus"
        :shown="shown"/>
    </template>
  </template>
</div>`);
//============================================================
// JOIN: ti/gui/rows/ti-gui-rows.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "blocks" : {
      type : Array,
      default : ()=>[]
    },
    "adjustable" : {
      type : Boolean,
      default : true
    },
    "border" : {
      type : Boolean,
      default : false
    },
    "schema" : {
      type : Object,
      default : ()=>({})
    },
    "actionStatus" : {
      type : Object,
      default : ()=>({})
    },
    "shown" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-adjustable" : this.adjustable,
        "show-border"   : this.border
      }, this.className)
    },
    //--------------------------------------
    hasBlocks() {
      return !_.isEmpty(this.blocks)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    //--------------------------------------
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/gui/rows/ti-gui-rows.mjs", _M);
})();
//============================================================
// JOIN: ti/gui/rows/_com.json
//============================================================
Ti.Preload("ti/com/ti/gui/rows/_com.json", {
  "name" : "ti-gui-rows",
  "globally" : true,
  "template" : "./ti-gui-rows.html",
  "mixins"   : ["./ti-gui-rows.mjs"],
  "components" : ["@com:ti/gui/block"]
});
//============================================================
// JOIN: ti/gui/tabs/ti-gui-tabs.html
//============================================================
Ti.Preload("ti/com/ti/gui/tabs/ti-gui-tabs.html", `<div class="ti-gui-tabs" :class="topClass">
  <!--
    Tab title bar
  -->
  <header :class="tabClass">
    <ul>
      <li v-for="it in theTabItems"
        :key="it.key"
        :class="it.className"
        @click="onSetCurrentTabItem(it)">
        <!--Icon-->
        <ti-icon
          v-if="it.icon"
            class="it-icon"
            :value="it.icon"/>
        <!--Text-->
        <span class="it-text">{{it.title|i18n}}</span>
      </li>
    </ul>
  </header>
  <!--
    Current Block
  -->
  <section v-if="theCurrentBlock">
    <ti-gui-block 
      embed-in="tabs"
      v-bind="theCurrentBlock"
      :action-status="actionStatus"
      :schema="schema"
      :shown="shown"/>
  </section>
</div>`);
//============================================================
// JOIN: ti/gui/tabs/ti-gui-tabs.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  inject: ["$gui"],
  /////////////////////////////////////////
  data: ()=>({
    myCurrentTab : 0
  }),
  /////////////////////////////////////////
  props : {
    "tabAt" : {
      type : String,
      default : "top-left",
      validator : (v)=>/^(top|bottom)-(left|center|right)$/.test(v)
    },
    "blocks" : {
      type : Array,
      default : ()=>[]
    },
    "schema" : {
      type : Object,
      default : ()=>({})
    },
    "actionStatus" : {
      type : Object,
      default : ()=>({})
    },
    "shown" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName([
        `at-${this.theTabAt[0]}`
      ], this.className)
    },
    //--------------------------------------
    theTabAt() {
      return this.tabAt.split("-")
    },
    //--------------------------------------
    tabClass() {
      return `as-${this.theTabAt[1]}`
    },
    theSchema() {
      return this.schema
    },
    //--------------------------------------
    theBlockWrapList() {
      let list = []
      for(let i=0; i<this.blocks.length; i++) {
        let block = this.blocks[i]
        let key = block.name || `tab-${i}`
        list.push({
          index : i, 
          key, block          
        })
      }
      return list
    },
    //--------------------------------------
    theTabItems() {
      let list = []
      for(let wrap of this.theBlockWrapList) {
        let current = this.myCurrentTab == wrap.key
        let item = {
          current,
          key   : wrap.key,
          index : wrap.index,
          name  : wrap.block.name, 
          icon  : wrap.block.icon,
          title : wrap.block.title,
          className : {"is-current":current}
        }
        // tab item can not be blank
        if(!item.icon && !item.title) {
          item.title = Ti.Util.fallback(item.name, item.key)
        }
        list.push(item)
      }
      return list
    },
    //--------------------------------------
    theCurrentTabItem() {
      for(let item of this.theTabItems) {
        if(item.current) {
          return item
        }
      }
    },
    //--------------------------------------
    theCurrentBlock() {
      for(let wrap of this.theBlockWrapList) {
        if(this.myCurrentTab == wrap.key) {
          return wrap.block
        }
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    onSetCurrentTabItem(item) {
      this.$gui.onBlockShownUpdate({
        [item.key] : true,
        [this.theCurrentTabItem.key] : false
      })
    },
    //--------------------------------------
    syncCurrentTabFromShown() {
      //console.log("syncCurrentTabFromShown")
      for(let wrap of this.theBlockWrapList) {
        if(this.shown[wrap.key]) {
          this.myCurrentTab = wrap.key
          return
        }
      }
      // Default highlight the first tab
      if(this.theBlockWrapList.length>0) {
        this.myCurrentTab = this.theBlockWrapList[0].key
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "shown" : function() {
      this.syncCurrentTabFromShown()
    },
    "blocks" : function() {
      this.syncCurrentTabFromShown()
    }
  },
  //////////////////////////////////////////
  mounted : function() {
    this.syncCurrentTabFromShown()
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/gui/tabs/ti-gui-tabs.mjs", _M);
})();
//============================================================
// JOIN: ti/gui/tabs/_com.json
//============================================================
Ti.Preload("ti/com/ti/gui/tabs/_com.json", {
  "name" : "ti-gui-tabs",
  "globally" : true,
  "template" : "./ti-gui-tabs.html",
  "mixins"   : ["./ti-gui-tabs.mjs"],
  "components" : ["@com:ti/gui/block"]
});
//============================================================
// JOIN: ti/gui/ti-gui-methods.mjs
//============================================================
(function(){
const _M = {
  //--------------------------------------
  formatGuiBlock(b={}, shown={}, float=false) {
    // ClassName
    let klass = [`at-${b.position||"center"}`]
    // Show/hide
    let isShown = shown[b.name]
    if(_.isUndefined(isShown)) {
      // hide panel block in default
      if(float) {
        isShown = false
      }
      // show normal block in default
      else {
        isShown = true
      }
    }
    // Mask
    if(b.mask) {
      klass.push("show-mask")
    } else {
      klass.push("no-mask")
    }
    // Transition Name
    let transName = b.position ? `gui-panel-${b.position}` : null
    // Block Info
    let pickKeys = [
      "className", "actionDisplayMode", "flex",
      "icon","title","actions","name", "adjustable", "closer", 
      "position", "overflow", "status"]
    let panelSize = {}
    // !!!
    // If block is float, that mean it in a panel
    // keep the width/height outside block info
    // it should not set to the block but the panel
    // !!!
    if(!float || b.mask) {
      pickKeys.push("width")
      pickKeys.push("height")
    }
    // panelSize should be assign to top
    else {
      // left/right:  panel hold the with
      if(/^(left|right)$/.test(b.position)) {
        pickKeys.push("height")
        panelSize.width = b.width
      }
      // top/bottom:  panel hold the height
      else if(/^(top|bottom)$/.test(b.position)) {
        pickKeys.push("width")
        panelSize.height = b.height
      }
      // center, block hold the size
      else if("center"==b.position){
        pickKeys.push("width")
        pickKeys.push("height")
      }
      // Others, panel hold the size
      else {
        panelSize.width = b.width
        panelSize.height = b.height
      }
    }
    let info = _.pick(b, pickKeys)
    // Sizing
    if(b.size && "stretch"!=b.size) {
      // Cols
      if("cols" == this.type) {
        info.width = b.size
      }
      // Rows
      else if("rows" == this.type) {
        info.height = b.size
      }
    }
    // ComType as body
    let comType, comConf
    if(b.body) {
      let com = b.body || {}
      if(_.isString(com)) {
        let sch = this.schema[com]
        // Define the detail in schema
        if(_.isPlainObject(sch)) {
          com = sch
          // explain the "extends"
          if(com.extends) {
            let parentSchema = this.schema[com.extends]
            let mySchema = _.omit(com, ["extends"])
            com = _.merge({}, parentSchema, mySchema)
          }
        }
        // Just a com-type
        else {
          com = {comType:com, comConf:{}}
        }
      }
      comType = com.comType || "ti-label"
      comConf = com.comConf || {value:b.name||"GUI"}
    }
    // ComType as layout/block
    else if(!_.isEmpty(b.blocks)){
      comType = "ti-gui"
      comConf = _.pick(b, [
        "type", "blocks", "adjustable", "border"
      ])
      _.defaults(comConf, {
        type : "cols",
        schema : this.schema,
        shown : this.shown
      })
    }
    // Join to result list
    return {
      className: klass.join(" "), 
      panelStyle : Ti.Css.toStyle(panelSize),
      name : b.name,
      isShown, transName,
      info, comType, comConf
    }
  },
  //--------------------------------------
  getFormedBlockList(list=[], shown={}, float=false) {
    let list2 = []
    if(_.isArray(list)) {
      for(let b of list) {
        let b2 = this.formatGuiBlock(b, shown, float)
        list2.push(b2)
      }
    }
    //console.log(list2)
    return list2
  },
  //--------------------------------------
  /***
   * Create new plain object to represent the blocks shown.
   * 
   * @param show{Object} : The primary shown object to be merge
   * @param name{String|Array|Object} : Value to marge.
   *  - `String` : Set the single key to the `value`
   *  - `Array`  : Batch set a group of keys to the `value`
   *  - `Object` : Merge to `shown` directly, the third argument `value` willl 
   *               be ignored.
   * @param value{Any} : if `name` is string, it will be taken as value.
   */
  createGuiBlockShown(shown={}, name, value) {
    let re = {...shown}
    // String
    if(_.isString(name)) {
      re[name] = value
    }
    // Array
    else if(_.isArray(name)) {
      for(let nm of name) {
        re[nm] = value
      }
    }
    // Object
    else if(_.isPlainObject(name)) {
      _.assign(re, name)
    }
    return re
  }
  //--------------------------------------
}
Ti.Preload("ti/com/ti/gui/ti-gui-methods.mjs", _M);
})();
//============================================================
// JOIN: ti/gui/ti-gui.html
//============================================================
Ti.Preload("ti/com/ti/gui/ti-gui.html", `<div class="ti-gui" :class="TopClass">
  <!--===========================================
    All normal layout
  -->
  <div class="gui-con">
    <!--
      Layout as rows
    -->
    <ti-gui-rows v-if="isRowsLayout"
      class="ti-fill-parent"
      v-bind="TheLayout"
      :schema="schema"
      :shown="TheShown"
      :default-flex="defaultFlex"
      :action-status="actionStatus"/>
    <!--
      Layout as cols
    -->
    <ti-gui-cols v-else-if="isColsLayout"
      class="ti-fill-parent"
      v-bind="TheLayout"
      :schema="schema"
      :shown="TheShown"
      :default-flex="defaultFlex"
      :action-status="actionStatus"/>
    <!--
      Layout as tabs
    -->
    <ti-gui-tabs v-else-if="isTabsLayout"
      class="ti-fill-parent"
      v-bind="TheLayout"
      :schema="schema"
      :shown="TheShown"
      :default-flex="defaultFlex"
      :action-status="actionStatus"/>
  </div>
  <!--===========================================
    All float panels
  -->
  <template v-for="pan in ThePanels">
    <transition :name="pan.transName">
      <ti-gui-panel
        v-if="pan.visible"
          :key="pan.key"
          v-bind="pan.panel"
          :viewport-width="myViewportWidth"
          :viewport-height="myViewportHeight"
          :schema="schema"
          :shown="TheShown"
          :default-flex="defaultFlex"
          :action-status="actionStatus"/>
    </transition>
  </template>
  <!--===========================================
    Loading
  -->
  <div v-if="isLoading"
    class="ti-mask-loading">
    <ti-loading v-bind="TheLoading"/>
  </div>
</div>`);
//============================================================
// JOIN: ti/gui/ti-gui.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////
  provide : function() {
    return {
      "$gui" : this
    }
  },
  /////////////////////////////////////////
  data: ()=>({
    myShown : {},
    myViewportWidth  : 0,
    myViewportHeight : 0,
  }),
  /////////////////////////////////////////
  props : {
    "defaultFlex" : {
      type : String,
      default : undefined,
      validator : (v)=>(_.isUndefined(v) || /^(auto|grow|shrink|both|none)$/.test(v))
    },
    "layout" : {
      type : Object,
      default : ()=>({
        desktop : {},
        tablet  : "desktop",
        phone   : "desktop"
      })
    },
    "schema" : {
      type : Object,
      default : ()=>({})
    },
    "keepShownTo" : {
      type : String,
      default : null
    },
    "actionStatus" : {
      type : Object,
      default : ()=>({})
    },
    "shown" : {
      type : Object,
      default : ()=>({})
    },
    "canLoading" : {
      type : Boolean,
      default : false
    },
    // value should be prop of ti-loading
    "loadingAs" : {
      type : [Boolean, Object],
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-loading" : this.isLoading
      })
    },
    //--------------------------------------
    TheLayout() {
      if(_.isEmpty(this.layout))
        return {}
      //....................................
      // Raw layout
      if(/^(rows|cols|tabs)$/.test(this.layout.type)) {
        return this.layout
      }
      //....................................
      // Auto adapt viewMode
      let lay = this.layout[this.viewportMode]
      // Refer onece
      if(_.isString(lay)) {
        lay = this.layout[lay]
      }
      // Refer twice (I think it is enough for most of cases)
      if(_.isString(lay)) {
        lay = this.layout[lay]
      }
      return lay || {}
    },
    //--------------------------------------
    isRowsLayout() {return "rows"==this.TheLayout.type},
    isColsLayout() {return "cols"==this.TheLayout.type},
    isTabsLayout() {return "tabs"==this.TheLayout.type},
    //--------------------------------------
    ThePanels() {
      let list = []

      // Join Global Panels
      this.joinThePanels(list, this.layout.panels, "G")

      // Join Current Mode Panels
      if(this.layout != this.TheLayout) {
        this.joinThePanels(list, this.TheLayout.panels, this.viewportMode)
      }

      // Done
      return list
    },
    //--------------------------------------
    TheShown() {
      return this.keepShownTo
        ? this.myShown
        : this.shown
    },
    //--------------------------------------
    isLoading() {
      return this.canLoading 
             && this.loadingAs 
                  ? true 
                  : false
    },
    //--------------------------------------
    TheLoading() {
      if(_.isPlainObject(this.loadingAs)) {
        return this.loadingAs
      }
      return {}
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    isShown(...names) {
      for(let name of names) {
        if(this.TheShown[name])
          return true
      }
      return false
    },
    //--------------------------------------
    joinThePanels(list=[], panels=[], keyPrefix="") {
      if(_.isArray(panels) && panels.length > 0) {
        for(let i=0; i<panels.length; i++) {
          let pan = panels[i]
          let pos = Ti.Util.fallback(pan.position, "center")
          let index = list.length
          list.push({
            index,
            visible   : this.isShown(pan.name),
            key       : pan.name || `panel-${keyPrefix}-${index}`,
            transName : `ti-gui-panel-${pos}`,
            panel     : pan
          })
        }
      }
    },
    //--------------------------------------
    updateShown(shown) {
      //console.log("updateShown", shown)
      this.syncMyShown(shown)
      this.persistMyStatus()
    },
    //--------------------------------------
    onBlockShow(name) {
      // Update privated status
      if(this.keepShownTo) {
        this.updateShown({[name]:true})
      }
      // Leave it to parent
      else {
        this.$notify("block:show", name)
      }
    },
    //--------------------------------------
    onBlockHide(name) {
      // Update privated status
      if(this.keepShownTo) {
        this.updateShown({[name]:false})
      }
      // Leave it to parent
      else {
        this.$notify("block:hide", name)
      }
    },
    //--------------------------------------
    onBlockShownUpdate(shown) {
      // Update privated status
      if(this.keepShownTo) {
        this.updateShown(shown)
      }
      // Leave it to parent
      else {
        this.$notify("block:shown", shown)
      }
    },
    //--------------------------------------
    syncMyShown(...showns) {
      if(this.keepShownTo) {
        this.myShown = _.assign({}, this.myShown, ...showns)
      }
    },
    //--------------------------------------
    persistMyStatus() {
      if(this.keepShownTo) {
        let shown = _.omitBy(this.myShown, (v)=>!v)
        Ti.Storage.session.setObject(this.keepShownTo, shown)
      }
    },
    //--------------------------------------
    loadMyStatus() {
      if(this.keepShownTo) {
        let shown = Ti.Storage.session.getObject(this.keepShownTo)
        this.syncMyShown(this.shown, shown)
      }
    },
    //--------------------------------------
    syncViewportMeasure() {
      let rect = Ti.Rects.createBy(this.$el);
      this.myViewportWidth  = rect.width
      this.myViewportHeight = rect.height
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "shown" : function(shown) {
      //console.log("ti-gui shown changed", shown)
      this.syncMyShown(shown)
    }
  },
  //////////////////////////////////////////
  mounted : function() {
    //......................................
    Ti.Viewport.watch(this, {
      resize : _.debounce(()=>this.syncViewportMeasure(), 100)
    })
    //......................................
    this.syncViewportMeasure()
    //......................................
    this.loadMyStatus()
    //......................................
  },
  ///////////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/gui/ti-gui.mjs", _M);
})();
//============================================================
// JOIN: ti/gui/_com.json
//============================================================
Ti.Preload("ti/com/ti/gui/_com.json", {
  "name" : "ti-gui",
  "globally" : true,
  "template" : "./ti-gui.html",
  "methods"  : "./ti-gui-methods.mjs",
  "mixins"   : ["./ti-gui.mjs"],
  "components" : [
    "@com:ti/gui/cols",
    "@com:ti/gui/rows",
    "@com:ti/gui/tabs",
    "@com:ti/gui/panel"
  ]
});
//============================================================
// JOIN: ti/icon/text/ti-icon-text.html
//============================================================
Ti.Preload("ti/com/ti/icon/text/ti-icon-text.html", `<div class="ti-icon-text" 
  :class="className">
  <!--Icon-->
  <ti-icon v-if="icon" class="as-icon" :value="icon"/>
  <!--Text-->
  <div v-if="text" class="as-text">{{text|i18n}}</div>
</div>`);
//============================================================
// JOIN: ti/icon/text/ti-icon-text.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ///////////////////////////////////////////////////////
  props : {
    "icon" : {
      type : [String,Object],
      default : ""
    },
    "text" : {
      type : String,
      default : null
    }
  }
  ///////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/icon/text/ti-icon-text.mjs", _M);
})();
//============================================================
// JOIN: ti/icon/text/_com.json
//============================================================
Ti.Preload("ti/com/ti/icon/text/_com.json", {
  "name" : "ti-icon-text",
  "globally" : true,
  "template" : "./ti-icon-text.html",
  "mixins" : ["./ti-icon-text.mjs"]
});
//============================================================
// JOIN: ti/icon/ti-icon.html
//============================================================
Ti.Preload("ti/com/ti/icon/ti-icon.html", `<div 
  class="ti-icon" 
  :class="TopClass">
  <div class="icon-icon"
    :style="Icon.outerStyle">
    <!--Font icon-->
    <i v-if="'font'==Icon.type"
      :class="Icon.className"
      :style="Icon.innerStyle">
      <!--ligature font -->
      <template v-if="Icon.text">{{Icon.text}}</template>
    </i>
    <!--Svg/Image-->
    <img v-else-if="'svg'==Icon.type || 'image'==Icon.type"
        :src="Icon.value"
        :style="Icon.innerStyle"/>
    <!--
      Default output the value
    -->
    <em v-else>{{value}}</em>
  </div>
</div>`);
//============================================================
// JOIN: ti/icon/ti-icon.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ///////////////////////////////////////////////////////
  data : ()=>({
    myValue : null
  }),
  ///////////////////////////////////////////////////////
  props : {
    // If image, join the base
    "base" : {
      type : String,
      default : null
    },
    "value" : {
      type : [String,Object,Number],
      default : null
    },
    "dict" : {
      type : [String, Ti.Dict],
      default : null
    },
    "defaultValue" : {
      type : [String,Object],
      default : null
    },
    "fontSize" : {
      type : [Number, String],
      default : null
    },
    "width" : {
      type : [Number, String],
      default : null
    },
    "height" : {
      type : [Number, String],
      default : null
    },
    "color" : {
      type : String,
      default : ""
    },
    "opacity" : {
      type : Number,
      default : -1
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass(`is-${this.Icon.type}`)
    },
    //---------------------------------------------------
    Dict() {
      if(this.dict) {
        // Already Dict
        if(this.dict instanceof Ti.Dict) {
          return this.dict
        }
        // Get back
        let {name} = Ti.DictFactory.explainDictName(this.dict)
        return Ti.DictFactory.CheckDict(name)
      }
    },
    //---------------------------------------------------
    // formed icon data
    Icon() {
      let icn 
      if(_.isPlainObject(this.myValue)){
        // Regular icon object, return it directly
        if(this.myValue.type && this.myValue.value) {
          icn = this.myValue
        }
        // Eval it as meta
        else {
          icn = {
            type  : "font", 
            value : Ti.Icons.get(this.myValue)
          }
        }
      }
      // String
      else {
        icn = {
          type : "font",
          value : this.myValue
        }
        if(_.isString(this.myValue)) {
          icn.type = Ti.Util.getSuffixName(this.myValue) || "font"
        }
        // for image
        if(/^(jpe?g|gif|png)$/i.test(icn.type)){
          icn.type = "image"
        }
      }

      // Join `className / text` to show icon font
      if('font' == icn.type) {
        let val = Ti.Icons.getByName(icn.value, icn.value)
        _.assign(icn, Ti.Icons.parseFontIcon(val))
      }
      // Join base
      else if('image' == icn.type) {
        if(!Ti.Util.isBlank(this.base)) {
          icn.value = Ti.Util.appendPath(this.base, icn.value)
        }
      }

      // join style:outer
      icn.outerStyle = Ti.Css.toStyle({
        width   : this.width,
        height  : this.height,
        color   : this.color,
        opacity : this.opacity >= 0 ? this.opacity : undefined
      })

      // join style:inner
      if('image' == icn.type) {
        icn.innerStyle = {
          "width"  : this.width  ? "100%" : undefined,
          "height" : this.height ? "100%" : undefined
        }
      }
      // font size
      else if('font' == icn.type) {
        icn.innerStyle = {
          "font-size" : this.fontSize 
                          ? Ti.Css.toSize(this.fontSize) 
                          : undefined
        }
      }

      return icn
    },
    //---------------------------------------------------
  },
  methods : {
    async evalMyValue() {
      let val = Ti.Util.fallbackNil(this.value, this.defaultValue)
      // Translate by dict
      if(this.Dict) {
        this.myValue = await this.Dict.getItemIcon(val)
      }
      // Normal value
      else {
        this.myValue = val
      }
    }
  },
  ///////////////////////////////////////////////////////
  watch : {
    "value" : {
      handler : "evalMyValue",
      immediate : true
    }
  }
  ///////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/icon/ti-icon.mjs", _M);
})();
//============================================================
// JOIN: ti/icon/_com.json
//============================================================
Ti.Preload("ti/com/ti/icon/_com.json", {
  "name" : "ti-icon",
  "globally" : true,
  "template" : "./ti-icon.html",
  "mixins" : ["./ti-icon.mjs"]
});
//============================================================
// JOIN: ti/imgfile/ti-imgfile.html
//============================================================
Ti.Preload("ti/com/ti/imgfile/ti-imgfile.html", `<div class="ti-imgfile"
  :class="TopClass">
  <!--
    Hidden input file to choose files
  -->
  <input 
    type="file" 
    ref="file" 
    class="ti-hide"
    @change.stop.seft="OnSelectLocalFilesToUpload">
  <!--
    Major preview zone
  -->
  <div class="thumb-con"
    :style="ThumbStyle"
    @click="OnClickToEdit"
    v-drop-files.mask="OnDropFiles">
    <!--
      Preview
    -->
    <ti-obj-thumb 
      :preview="PreviewThumb"
      :progress="progress"
      :footer="false"/>
  </div>
  <!--
    Remove
  -->
  <div v-if="isShowRemoveIcon"
    class="thumb-actions">
    <!--remove-->
    <div class="thumb-opt as-del"
      @click="OnRemove">
      <ti-icon value="zmdi-delete"/>
      <span class="it-text">{{'clear'|i18n}}</span>
    </div>
    <!--open-->
    <div class="thumb-opt as-open"
      @click="OnOpen">
      <ti-icon value="zmdi-open-in-new"/>
      <span class="it-text">{{'open'|i18n}}</span>
    </div>
    <!--//////-->
  </div>
</div>`);
//============================================================
// JOIN: ti/imgfile/ti-imgfile.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  props : {
    // The source to display image
    "src" : {
      type : String,
      default : null
    },
    // The value must be a LocalFile object
    // to prerender the LocalFile during uploading
    "uploadFile" :{
      type : File,
      default : null
    },
    // Show the process `0.0-1.0` during the uploading
    "progress" : {
      type : Number,
      default : -1
    },
    // Display width
    "width" : {
      type : [String, Number],
      default : 100
    },
    // Display height
    "height" : {
      type : [String, Number],
      default : 100
    },
    // support remove the objects
    "removable" : {
      type : Boolean,
      default : true
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    ThumbStyle(){
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //--------------------------------------
    isShowRemoveIcon() {
      if(!this.uploadFile && this.src) {
        return true
      }
      return false
    },
    //--------------------------------------
    PreviewThumb() {
      if(this.uploadFile) {
        return {type:"localFile", value:this.uploadFile}
      }
      // Normal image
      if(this.src) {
        return {type:"image", value:this.src}
      }
      // Show Icon
      return {type:"font", value:"zmdi-plus"}
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickToEdit() {
      this.$refs.file.click()
    },
    //--------------------------------------
    async OnDropFiles(files) {
      let file = _.get(files, 0)
      if(file) {
        this.$notify("upload", file)
      }
    },
    //--------------------------------------
    async OnSelectLocalFilesToUpload(evt) {
      await this.OnDropFiles(evt.target.files)
      this.$refs.file.value = ""
    },
    //--------------------------------------
    OnRemove() {
      this.$notify("remove")
    },
    //--------------------------------------
    OnOpen() {
      this.$notify("open")
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/imgfile/ti-imgfile.mjs", _M);
})();
//============================================================
// JOIN: ti/imgfile/_com.json
//============================================================
Ti.Preload("ti/com/ti/imgfile/_com.json", {
  "name" : "ti-imgfile",
  "globally" : true,
  "template" : "./ti-imgfile.html",
  "mixins" : ["./ti-imgfile.mjs"],
  "components" : ["@com:ti/obj/thumb"]
});
//============================================================
// JOIN: ti/input/color/ti-input-color.html
//============================================================
Ti.Preload("ti/com/ti/input/color/ti-input-color.html", `<ti-combo-box class="ti-input-color"
  :class="topClass"
  :drop-width="null"
  :status="status"
  @collapse="doCollapse">
  <!--
    Box
  -->
  <template v-slot:box>
    <span class="as-color"
      @click.left="onToggleDrop">
        <u class="as-bg"></u>
        <u class="as-fr" :style="colorStyle"></u>
    </span>
    <span class="as-clear" @click="onClearColor">
      <ti-icon value="zmdi-close"/>
    </span>
  </template>
  <!--
    Drop
  -->
  <template v-slot:drop>
    <ti-color 
      :value="value"
      @change="onColorChanged"/>
  </template>
</ti-combo-box>`);
//============================================================
// JOIN: ti/input/color/ti-input-color.mjs
//============================================================
(function(){
const _M = {
  ////////////////////////////////////////////////////
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data: ()=>({
    hideBorder : false,
    status  : "collapse"
  }),
  ////////////////////////////////////////////////////
  props : {
    "value" : {
      type : [String, Number],
      default : null
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-empty"  : !this.hasValue,
        "is-valued" : this.hasValue,
        "show-border"  : !this.hideBorder,
        "hide-border"  : this.hideBorder,
      }, this.className)
    },
    //------------------------------------------------
    colorStyle() {
      let color = Ti.Types.toColor(this.value, null)
      if(color) {
        return {"background":color.rgba}
      }
    },
    //------------------------------------------------
    isCollapse() {return "collapse"==this.status},
    isExtended() {return "extended"==this.status},
    //------------------------------------------------
    hasValue() {
      return !Ti.Util.isNil(this.value)
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onToggleDrop() {
      this.status = ({
        "collapse" : "extended",
        "extended" : "collapse"
      })[this.status]
    },
    //------------------------------------------------
    onClearColor() {
      this.$notify("change", null)
    },
    //------------------------------------------------
    onColorChanged(color) {
      let co = Ti.Types.toColor(color)
      this.$notify("change", co ? co.toString() : null)
    },
    //------------------------------------------------
    doCollapse() {
      this.status = "collapse"
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/input/color/ti-input-color.mjs", _M);
})();
//============================================================
// JOIN: ti/input/color/_com.json
//============================================================
Ti.Preload("ti/com/ti/input/color/_com.json", {
  "name" : "ti-input-color",
  "globally" : true,
  "template" : "./ti-input-color.html",
  "mixins" : ["./ti-input-color.mjs"],
  "components" : ["@com:ti/color"]
});
//============================================================
// JOIN: ti/input/date/ti-input-date.html
//============================================================
Ti.Preload("ti/com/ti/input/date/ti-input-date.html", `<ti-combo-box class="as-date"
  :class="topClass"
  :width="width"
  :drop-width="null"
  :status="status"
  @collapse="doCollapse">
  <!--
    Box
  -->
  <template v-slot:box>
    <ti-input 
      :readonly="!canInput"
      :hide-border="hideBorder"
      :placeholder="placeholder|i18n"
      :prefix-icon="icon"
      :suffix-icon="theStatusIcon"
      :value="theInputValue"
      :height="height"
      :focus="isExtended"
      @change="onChanged"
      @input:focus="onInputFocused"
      @suffix:icon="onClickStatusIcon"/>
  </template>
  <!--
    Drop
  -->
  <template v-slot:drop>
    <ti-calendar
      :value="theDropDate"
      :month-format="monthFormat"
      :begin-year="beginYear"
      :end-year="endYear"
      @change="onDateChanged"/>
  </template>
</ti-combo-box>`);
//============================================================
// JOIN: ti/input/date/ti-input-date.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "runtime" : null,
    "status"  : "collapse"
  }),
  ////////////////////////////////////////////////////
  props : {
    "canInput" : {
      type : Boolean,
      default : true
    },
    "value" : {
      type : [String, Number, Date],
      default : null
    },
    "icon" : {
      type : String,
      default : "far-calendar-alt"
    },
    "format" : {
      type : String,
      default : "yyyy-MM-dd"
    },
    "placeholder" : {
      type : [String, Number],
      default : "i18n:blank-date"
    },
    "hideBorder" : {
      type : Boolean,
      default : false
    },
    "autoCollapse" : {
      type : Boolean,
      default : true
    },
    "width" : {
      type : [Number, String],
      default : "1.8rem"
    },
    "height" : {
      type : [Number, String],
      default : undefined
    },
    "monthFormat" : {
      type : String,
      default : "yyyy-MM" 
    },
    "beginYear" : {
      type : [Number, String],
      default : 1970
    },
    "endYear" : {
      type : [Number, String],
      default : (new Date().getFullYear()+1)
    },
    "statusIcons" : {
      type : Object,
      default : ()=>({
        collapse : "zmdi-chevron-down",
        extended : "zmdi-chevron-up"
      })
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
    //------------------------------------------------
    isCollapse() {return "collapse"==this.status},
    isExtended() {return "extended"==this.status},
    //------------------------------------------------
    theDate() {
      return Ti.Types.toDate(this.value, null)
    },
    //------------------------------------------------
    theDropDate() {
      return this.runtime || this.theDate
    },
    //------------------------------------------------
    theInputValue() {
      if(this.isExtended) {
        return this.getDateText(this.theDropDate)
      }
      return this.getDateText(this.theDropDate, this.format)
    },
    //------------------------------------------------
    theStatusIcon() {
      return this.statusIcons[this.status]
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    applyRuntime() {
      if(this.runtime) {
        let dt = this.runtime
        this.runtime = null
        let str = this.getDateText(dt)
        this.$notify("change", str)
      }
    },
    //-----------------------------------------------
    doExtend() {
      this.status = "extended"
    },
    //-----------------------------------------------
    doCollapse({escaped=false}={}) {
      this.status = "collapse"
      // Drop runtime
      if(escaped) {
        this.runtime = null
      }
      // Apply Changed for runtime
      else {
        this.applyRuntime()
      }
    },
    //------------------------------------------------
    onInputFocused() {
      this.doExtend()
    },
    //------------------------------------------------
    onChanged(val) {
      // Empty value as null
      if(_.isEmpty(val)) {
        this.$notify("change", null);
      }
      // Parsed value
      else {
        let dt  = Ti.Types.toDate(val)
        let str = this.getDateText(dt)
        this.$notify("change", str)
      }
    },
    //------------------------------------------------
    onClickStatusIcon() {
      // extended -> collapse
      if(this.isExtended) {
        this.doCollapse()
      }
      // collapse -> extended
      else {
        this.doExtend()
      }
    },
    //------------------------------------------------
    onDateChanged(dt) {
      this.runtime = dt
      if(this.autoCollapse) {
        this.doCollapse()
      }
    },
    //------------------------------------------------
    getDateText(dt, fmt="yyyy-MM-dd") {
      let dt2 = Ti.Types.toDate(dt, null)
      return Ti.Types.formatDate(dt2, fmt)
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/input/date/ti-input-date.mjs", _M);
})();
//============================================================
// JOIN: ti/input/date/_com.json
//============================================================
Ti.Preload("ti/com/ti/input/date/_com.json", {
  "name" : "ti-input-date",
  "globally" : true,
  "template" : "./ti-input-date.html",
  "mixins" : ["./ti-input-date.mjs"],
  "components" : [
    "@com:ti/combo/input",
    "@com:ti/calendar"]
});
//============================================================
// JOIN: ti/input/daterange/ti-input-daterange.html
//============================================================
Ti.Preload("ti/com/ti/input/daterange/ti-input-daterange.html", `<ti-combo-box class="as-daterange"
  :class="topClass"
  :width="width"
  :drop-width="null"
  :status="status"
  @collapse="doCollapse">
  <!--
    Box
  -->
  <template v-slot:box>
    <ti-input 
      :readonly="!canInput"
      :hide-border="hideBorder"
      :placeholder="placeholder|i18n"
      :prefix-icon="icon"
      :suffix-icon="theStatusIcon"
      :value="theInputValue"
      :height="height"
      :focus="isExtended"
      @change="onChanged"
      @input:focus="onInputFocused"
      @suffix:icon="onClickStatusIcon"/>
  </template>
  <!--
    Drop
  -->
  <template v-slot:drop>
    <ti-calendar
      :value="theDropRange"
      :range="true"
      :matrix-count="matrixCount"
      :month-format="monthFormat"
      :begin-year="beginYear"
      :end-year="endYear"
      @change="onDateRangeChanged"/>
  </template>
</ti-combo-box>`);
//============================================================
// JOIN: ti/input/daterange/ti-input-daterange.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "runtime" : null,
    "status"  : "collapse"
  }),
  ////////////////////////////////////////////////////
  props : {
    "canInput" : {
      type : Boolean,
      default : true
    },
    "value" : {
      type : [String, Number, Date, Array],
      default : null
    },
    "icon" : {
      type : String,
      default : "fas-calendar-alt"
    },
    "format" : {
      type : String,
      default : "yyyy-MM-dd"
    },
    "placeholder" : {
      type : String,
      default : "i18n:blank-date-range"
    },
    "hideBorder" : {
      type : Boolean,
      default : false
    },
    "width" : {
      type : [Number, String],
      default : "3rem"
    },
    "height" : {
      type : [Number, String],
      default : undefined
    },
    "matrixCount" : {
      type : Number,
      default : 2
    },
    "monthFormat" : {
      type : String,
      default : "yyyy-MM-dd" 
    },
    "beginYear" : {
      type : [Number, String],
      default : 1970
    },
    "endYear" : {
      type : [Number, String],
      default : (new Date().getFullYear()+1)
    },
    "statusIcons" : {
      type : Object,
      default : ()=>({
        collapse : "zmdi-chevron-down",
        extended : "zmdi-chevron-up"
      })
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
    //------------------------------------------------
    isCollapse() {return "collapse"==this.status},
    isExtended() {return "extended"==this.status},
    //--------------------------------------
    theDate() {
      if(_.isArray(this.value) && !_.isEmpty(this.value)) {
        return Ti.Types.toDate(this.value[0])
      }
      if(this.value) {
        return Ti.Types.toDate(this.value)
      }
    },
    //--------------------------------------
    theRangeInMs() {
      if(!this.theDate) {
        return []
      }
      // Move to 00:00:00
      let dt0 = new Date(this.theDate)
      // Define the dt1
      let dt1;
      if(_.isArray(this.value) && this.value.length > 1) {
        dt1 = Ti.Types.toDate(this.value[1])
      }
      // The End of the Day
      else {
        dt1 = new Date(dt0)
      }
      // Make the range
      let msRange = [dt0.getTime(), dt1.getTime()].sort()

      // dt0 start of the day
      dt0 = Ti.DateTime.setTime(new Date(msRange[0]))
      // dt1 end of the day
      dt1 = Ti.DateTime.setTime(new Date(msRange[1]), [23,59,59,999])

      // rebuild the range
      return [dt0.getTime(), dt1.getTime()]
    },
    //------------------------------------------------
    theRange() {
      if(_.isEmpty(this.theRangeInMs)) {
        return []
      }
      return [
        new Date(this.theRangeInMs[0]), 
        new Date(this.theRangeInMs[1])]
    },
    //------------------------------------------------
    theDropRange() {
      return this.runtime || this.theRange
    },
    //------------------------------------------------
    theRangeValue() {
      return this.formatRangeValue(this.theRange).join(",")
    },
    //------------------------------------------------
    theRangeText() {
      if(!_.isEmpty(this.theRange)) {
        let dt0 = this.theRange[0]
        let dt1 = this.theRange[1]
        let yy0 = dt0.getFullYear()
        let MM0 = dt0.getMonth()
        let dd0 = dt0.getDate()
        let yy1 = dt1.getFullYear()
        let MM1 = dt1.getMonth()
        let dd1 = dt1.getDate()
        let MA0 = Ti.DateTime.getMonthAbbr(MM0)
        let MA1 = Ti.DateTime.getMonthAbbr(MM1)
        let MT0 = Ti.I18n.get(MA0)
        let MT1 = Ti.I18n.get(MA1)

        MM0++;  MM1++;  // Month change to 1 base

        let vars = {
          yy0, yy1,
          MM0, MM1,
          dd0, dd1,
          MA0, MA1,
          MT0, MT1
        }
        // Beyond year
        if(yy0 != yy1) {
          return Ti.I18n.getf("cal.d-range-beyond-years", vars)
        }
        // Beyond month
        if(MM0 != MM1) {
          return Ti.I18n.getf("cal.d-range-beyond-months", vars)
        }
        // Beyond day
        if(dd0 != dd1) {
          return Ti.I18n.getf("cal.d-range-beyond-days", vars)
        }
        // Same day
        return Ti.I18n.getf("cal.d-range-in-same-day", vars)
      }
    },
    //------------------------------------------------
    theInputValue() {
      if(this.isExtended) {
        return this.theRangeValue
      }
      return this.theRangeText
    },
    //------------------------------------------------
    theStatusIcon() {
      return this.statusIcons[this.status]
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    applyRuntime() {
      if(this.runtime) {
        let rg = this.runtime
        this.runtime = null
        let rg2 = this.formatRangeValue(rg)
        this.$notify("change", rg2)
      }
    },
    //-----------------------------------------------
    doExtend() {
      this.status = "extended"
    },
    //-----------------------------------------------
    doCollapse({escaped=false}={}) {
      this.status = "collapse"
      // Drop runtime
      if(escaped) {
        this.runtime = null
      }
      // Apply Changed for runtime
      else {
        this.applyRuntime()
      }
    },
    //------------------------------------------------
    onInputFocused() {
      this.doExtend()
    },
    //------------------------------------------------
    onChanged(val) {
      console.log("haha")
      let rg = this.parseDateRange(val)
      // Empty Range
      if(_.isEmpty(rg)) {
        this.$notify("change", null);
      }
      // Format the Range
      else {
        let rg2 = this.formatRangeValue(rg)
        this.$notify("change", rg2);
      }
    },
    //------------------------------------------------
    onClickStatusIcon() {
      // extended -> collapse
      if(this.isExtended) {
        this.doCollapse()
      }
      // collapse -> extended
      else {
        this.doExtend()
      }
    },
    //------------------------------------------------
    onDateRangeChanged(rg) {
      this.runtime = rg
    },
    //------------------------------------------------
    parseDateRange(val) {
      // Empty value as null
      if(_.isEmpty(val)) {
        return []
      }
      // Parsed value
      let ss = val.split(",")
      // Empty
      if(_.isEmpty(ss)) {
        return []
      }
      // One date
      if(ss.length == 1) {
        let dt = Ti.Types.toDate(ss[0])
        return [dt]
      }
      // range
      let dt0 = Ti.Types.toDate(ss[0])
      let dt1 = Ti.Types.toDate(ss[1])
      return [dt0, dt1].sort((dt0,dt1)=>{
        return dt0.getTime()-dt1.getTime()
      })
    },
    //------------------------------------------------
    formatRangeValue(range) {
      return Ti.Types.formatDate(range, this.format)
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/input/daterange/ti-input-daterange.mjs", _M);
})();
//============================================================
// JOIN: ti/input/daterange/_com.json
//============================================================
Ti.Preload("ti/com/ti/input/daterange/_com.json", {
  "name" : "ti-input-daterange",
  "globally" : true,
  "template" : "./ti-input-daterange.html",
  "mixins" : ["./ti-input-daterange.mjs"],
  "components" : [
    "@com:ti/combo/input",
    "@com:ti/calendar"]
});
//============================================================
// JOIN: ti/input/datetime/ti-input-datetime.html
//============================================================
Ti.Preload("ti/com/ti/input/datetime/ti-input-datetime.html", `<ti-combo-box class="as-datetime"
  :class="topClass"
  :width="width"
  :drop-width="null"
  :drop-overflow="'hidden'"
  :status="status"
  @collapse="doCollapse">
  <!--
    Box
  -->
  <template v-slot:box>
    <ti-input 
      :readonly="!canInput"
      :hide-border="hideBorder"
      :placeholder="placeholder|i18n"
      :prefix-icon="icon"
      :suffix-icon="theStatusIcon"
      :value="theInputValue"
      :height="height"
      :focus="isExtended"
      @change="onChanged"
      @input:focus="onInputFocused"
      @suffix:icon="onClickStatusIcon"/>
  </template>
  <!--
    Drop
  -->
  <template v-slot:drop>
    <ti-datetime
      :value="theDropDate"
      :month-format="monthFormat"
      :begin-year="beginYear"
      :end-year="endYear"
      @change="onDateChanged"/>
  </template>
</ti-combo-box>`);
//============================================================
// JOIN: ti/input/datetime/ti-input-datetime.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "runtime" : null,
    "status"  : "collapse"
  }),
  ////////////////////////////////////////////////////
  props : {
    "canInput" : {
      type : Boolean,
      default : true
    },
    "value" : {
      type : [String, Number, Date],
      default : null
    },
    "icon" : {
      type : String,
      default : "fas-clock"
    },
    "format" : {
      type : String,
      default : "yyyy-MM-dd HH:mm:ss"
    },
    "placeholder" : {
      type : [String, Number],
      default : "i18n:blank-datetime"
    },
    "hideBorder" : {
      type : Boolean,
      default : false
    },
    "autoCollapse" : {
      type : Boolean,
      default : false
    },
    "width" : {
      type : [Number, String],
      default : "2.4rem"
    },
    "height" : {
      type : [Number, String],
      default : undefined
    },
    "monthFormat" : {
      type : String,
      default : "yyyy-MM" 
    },
    "beginYear" : {
      type : [Number, String],
      default : 1970
    },
    "endYear" : {
      type : [Number, String],
      default : (new Date().getFullYear()+1)
    },
    "statusIcons" : {
      type : Object,
      default : ()=>({
        collapse : "zmdi-chevron-down",
        extended : "zmdi-chevron-up"
      })
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
    //------------------------------------------------
    isCollapse() {return "collapse"==this.status},
    isExtended() {return "extended"==this.status},
    //------------------------------------------------
    theDate() {
      return Ti.Types.toDate(this.value, null)
    },
    //------------------------------------------------
    theDropDate() {
      return this.runtime || this.theDate
    },
    //------------------------------------------------
    theInputValue() {
      if(this.isExtended) {
        return this.getDateText(this.theDropDate)
      }
      return this.getDateText(this.theDropDate, this.format)
    },
    //------------------------------------------------
    theStatusIcon() {
      return this.statusIcons[this.status]
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    applyRuntime() {
      if(this.runtime) {
        let dt = this.runtime
        this.runtime = null
        let str = this.getDateText(dt)
        this.$notify("change", str)
      }
    },
    //-----------------------------------------------
    doExtend() {
      this.status = "extended"
    },
    //-----------------------------------------------
    doCollapse({escaped=false}={}) {
      this.status = "collapse"
      // Drop runtime
      if(escaped) {
        this.runtime = null
      }
      // Apply Changed for runtime
      else {
        this.applyRuntime()
      }
    },
    //------------------------------------------------
    onInputFocused() {
      this.doExtend()
    },
    //------------------------------------------------
    onChanged(val) {
      // Empty value as null
      if(_.isEmpty(val)) {
        this.$notify("change", null);
      }
      // Parsed value
      else {
        let dt  = Ti.Types.toDate(val)
        let str = this.getDateText(dt)
        this.$notify("change", str)
      }
    },
    //------------------------------------------------
    onClickStatusIcon() {
      // extended -> collapse
      if(this.isExtended) {
        this.doCollapse()
      }
      // collapse -> extended
      else {
        this.doExtend()
      }
    },
    //------------------------------------------------
    onDateChanged(dt) {
      this.runtime = dt
      if(this.autoCollapse) {
        this.doCollapse()
      }
    },
    //------------------------------------------------
    getDateText(dt, fmt="yyyy-MM-dd HH:mm:ss") {
      let dt2 = Ti.Types.toDate(dt, null)
      return Ti.Types.formatDate(dt2, fmt)
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/input/datetime/ti-input-datetime.mjs", _M);
})();
//============================================================
// JOIN: ti/input/datetime/_com.json
//============================================================
Ti.Preload("ti/com/ti/input/datetime/_com.json", {
  "name" : "ti-input-datetime",
  "globally" : true,
  "template" : "./ti-input-datetime.html",
  "mixins" : ["./ti-input-datetime.mjs"],
  "components" : [
    "@com:ti/combo/input",
    "@com:ti/datetime"]
});
//============================================================
// JOIN: ti/input/icon/ti-input-icon-props.mjs
//============================================================
(function(){
const _M = {
  "options": {
    type: Array,
    default: () => [
      "im-spotify",
      "im-newsletter",
      "im-award",
      "im-headphones",
      "im-megaphone",
      "im-barcode",
      "im-google-play",
      "im-facebook-messenger",
      "im-wechat",
      "im-line",
      "im-git",
      "im-first-aid",
      "im-ribbon",
      "im-plane",
      "im-idea",
      "im-data",
      "im-data-delete",
      "im-data-validate",
      "im-folder-add",
      "im-radar",
      "im-pizza",
      "im-truck",
      "im-support",
      "im-reset",
      "im-import",
      "im-export",
      "im-color-fan",
      "im-cookie",
      "im-gift-card",
      "im-factory",
      "im-pulse",
      "im-accessibility",
      "im-apartment",
      "im-plugin",
      "im-layer",
      "im-direction",
      "im-dribbble",
      "im-radio",
      "im-bank",
      "im-battery-empty",
      "im-battery",
      "im-battery-full",
      "im-x-mark-circle-o",
      "im-timer",
      "im-hashtag",
      "im-server",
      "im-flask",
      "im-anchor",
      "im-umbrella",
      "im-cc-amex",
      "im-cc-visa",
      "im-cc-mastercard",
      "im-cc-paypal",
      "im-cc-amazon",
      "im-cc-bitcoin",
      "im-car",
      "im-paintbrush",
      "im-cube",
      "im-cubes",
      "im-language",
      "im-calculator",
      "im-user-settings",
      "im-trophy",
      "im-pointer",
      "im-edit",
      "im-warning-circle",
      "im-check-mark-circle-o",
      "im-date-o",
      "im-newspaper-o",
      "im-wrench",
      "im-binoculars",
      "im-gamepad",
      "im-history",
      "im-bell-active",
      "im-coffee",
      "im-leaf",
      "im-gift",
      "im-flip-chart-o",
      "im-clock",
      "im-line-chart-up",
      "im-laptop-o",
      "im-monitor-o",
      "im-cursor",
      "im-keyboard",
      "im-pin",
      "im-store",
      "im-graduation-hat",
      "im-certificate-o",
      "im-sun",
      "im-diamond-o",
      "im-drop",
      "im-paperplane",
      "im-fingerprint",
      "im-lifebuoy",
      "im-power",
      "im-target",
      "im-navigation",
      "im-bug",
      "im-network",
      "im-pie-chart",
      "im-note-o",
      "im-id-card",
      "im-tags",
      "im-floppy-disk",
      "im-dashboard",
      "im-tools",
      "im-users",
      "im-trash-can",
      "im-x-mark-circle",
      "im-x-mark",
      "im-shield",
      "im-mobile",
      "im-inbox",
      "im-crown",
      "im-check-square",
      "im-check-square-o",
      "im-check-mark-circle",
      "im-check-mark",
      "im-redo",
      "im-undo",
      "im-map-o",
      "im-task-o",
      "im-menu-dot-v",
      "im-edit-off",
      "im-facebook",
      "im-sitemap",
      "im-save",
      "im-volume-off",
      "im-volume",
      "im-sign-out",
      "im-sign-in",
      "im-shopping-cart",
      "im-rocket",
      "im-banknote",
      "im-fullscreen",
      "im-minimize",
      "im-maximize",
      "im-light-bulb",
      "im-filter",
      "im-picture-o",
      "im-eye-off",
      "im-eye",
      "im-external-link",
      "im-random",
      "im-loop",
      "im-next",
      "im-previous",
      "im-eject",
      "im-stop",
      "im-pause",
      "im-play",
      "im-credit-card",
      "im-bookmark",
      "im-upload",
      "im-download",
      "im-video-camera",
      "im-photo-camera",
      "im-care-up",
      "im-care-down",
      "im-care-left",
      "im-arrow-up-circle",
      "im-arrow-down-circle",
      "im-arrow-left-circle",
      "im-arrow-right-circle",
      "im-arrow-up",
      "im-arrow-down",
      "im-arrow-left",
      "im-arrow-right",
      "im-angle-up-circle",
      "im-angle-down-circle",
      "im-angle-left-circle",
      "im-angle-right-circle",
      "im-angle-up",
      "im-angle-down",
      "im-angle-left",
      "im-angle-right",
      "im-twitch",
      "im-reddit",
      "im-edge",
      "im-whatsapp",
      "im-amazon",
      "im-snapchat",
      "im-instagram",
      "im-fire",
      "im-sync",
      "im-toggle",
      "im-control-panel",
      "im-archive",
      "im-bell",
      "im-bell-off",
      "im-youtube",
      "im-spinner",
      "im-smiley-o",
      "im-frown-o",
      "im-code",
      "im-android-os",
      "im-linux-os",
      "im-apple-os",
      "im-menu",
      "im-menu-list",
      "im-menu-dot-h",
      "im-windows-os",
      "im-square-o",
      "im-check-square-i",
      "im-radio-button-circle",
      "im-radio-button-circle-o",
      "im-flag",
      "im-opera",
      "im-thumb-up",
      "im-thumb-down",
      "im-safari",
      "im-paper-clip",
      "im-firefox",
      "im-copy",
      "im-chrome",
      "im-quote-left",
      "im-quote-right",
      "im-ie",
      "im-briefcase",
      "im-forbidden",
      "im-vk",
      "im-wizard",
      "im-location",
      "im-paypal",
      "im-coin",
      "im-key",
      "im-lock",
      "im-lock-open",
      "im-share",
      "im-flash",
      "im-cloud",
      "im-database",
      "im-wifi",
      "im-book",
      "im-audio",
      "im-video",
      "im-microphone",
      "im-printer",
      "im-computer",
      "im-phone",
      "im-user-male",
      "im-user-female",
      "im-user-circle",
      "im-clock-o",
      "im-calendar",
      "im-pencil",
      "im-question",
      "im-bar-chart",
      "im-info",
      "im-folder",
      "im-folder-open",
      "im-file",
      "im-file-o",
      "im-files-o",
      "im-warning",
      "im-link",
      "im-unlink",
      "im-tag",
      "im-heart",
      "im-cloud-upload",
      "im-cloud-download",
      "im-speech-bubble",
      "im-speech-bubble-comment",
      "im-speech-bubble-comments",
      "im-mail",
      "im-globe",
      "im-home",
      "im-window-o",
      "im-table",
      "im-windows-o",
      "im-gear",
      "im-twitter",
      "im-magnifier",
      "im-magnifier-plus",
      "im-magnifier-minus",
      "im-minus",
      "im-minus-circle",
      "im-plus",
      "im-plus-circle",
      "im-care-right",
      "im-star",
      "im-star-half",
      "im-star-o",
      "im-circle-o",
      "im-xing",
      "im-vimeo",
      "im-tumblr",
      "im-stumbleupon",
      "im-stackoverflow",
      "im-soundcloud",
      "im-skype",
      "im-pinterest",
      "im-linkedin",
      "im-google-plus",
      "im-github",
      "im-flickr",
      "im-facebook-like",
      "im-blogger",
      "im-behance"
    ]
  }
}
Ti.Preload("ti/com/ti/input/icon/ti-input-icon-props.mjs", _M);
})();
//============================================================
// JOIN: ti/input/icon/ti-input-icon.html
//============================================================
Ti.Preload("ti/com/ti/input/icon/ti-input-icon.html", `<ti-combo-box class="ti-input-icon"
  :class="topClass"
  :drop-width="dropWidth"
  :drop-height="dropHeight"
  :status="status"
  @collapse="doCollapse">
  <!--
    Box
  -->
  <template v-slot:box>
    <span class="as-value"
      :style="theValueStyle"
      @click.left="onToggleDrop">
      <!--Show Icon-->
      <ti-icon 
        v-if="hasValue"
          :value="value"/>
      <!--No Icon-->
      <span 
        v-else
          class="no-icon"><i class="zmdi zmdi-cake"></i></span>
    </span>
    <span class="as-clear" @click="onClearIcon">
      <ti-icon value="zmdi-close"/>
    </span>
  </template>
  <!--
    Drop
  -->
  <template v-slot:drop>
    <div class="icon-input">
      <input ref="input"
        :placeholder="'i18n:icon-code-tip'|i18n"
        @change="onChangedIcon">
    </div>
    <div class="icon-options">
      <ul>
        <li v-for="li of theOptionIcons"
          @click.left="onSelectIcon(li)"
          @dblclick.left="onSelectIconAndCollapse(li)"
          @mouseenter="onHoverIcon(li)"
          @mouseleave="onLeaveIcon(li)">
          <ti-icon :value="li.value"/>
        </li>
      </ul>
    </div>
    <div class="icon-tip">
      <template v-if="theTipIcon">
        <ti-icon :value="theTipIcon"/>
        <span>{{theTipIcon}}</span>
      </template>
      <template v-else>
        <span>...</span>
      </template>
    </div>
  </template>
</ti-combo-box>`);
//============================================================
// JOIN: ti/input/icon/ti-input-icon.mjs
//============================================================
(function(){
const _M = {
  ////////////////////////////////////////////////////
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data: ()=>({
    hideBorder : false,
    myHoverIcon : null,
    status  : "collapse"
  }),
  ////////////////////////////////////////////////////
  props : {
    // "hideBorder"  : {
    //   type : Boolean,
    //   default : false
    // },
    "value" : {
      type : [String, Object],
      default : null
    },
    "iconSize" : {
      type : [Number,String],
      default : null
    },
    "dropWidth" : {
      type : [Number, String],
      default : "4rem"
    },
    "dropHeight" : {
      type : [Number, String],
      default : "4rem"
    },
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "show-border"  : !this.hideBorder,
        "hide-border"  : this.hideBorder,
      }, this.className)
    },
    //------------------------------------------------
    theValueStyle() {
      return {
        "font-size" : Ti.Css.toSize(this.iconSize)
      }
    },
    //------------------------------------------------
    isCollapse() {return "collapse"==this.status},
    isExtended() {return "extended"==this.status},
    //------------------------------------------------
    hasValue () {
      return !Ti.Util.isNil(this.value)
    },
    //------------------------------------------------
    theTipIcon () {
      return  this.myHoverIcon || this.value
    },
    //------------------------------------------------
    theOptionIcons() {
      let list = []
      _.forEach(this.options, (icon, index)=>{
        let m = /^([a-z]+)-(.+)$/.exec(icon)
        list.push({
          value : icon,
          index : index,
          type  : m[1],
          name  : m[2]
        })
      })
      return list
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onToggleDrop() {
      this.status = ({
        "collapse" : "extended",
        "extended" : "collapse"
      })[this.status]
    },
    //------------------------------------------------
    onSelectIcon({value}={}) {
      this.$notify("change", value)
    },
    //------------------------------------------------
    onSelectIconAndCollapse({value}={}) {
      this.$notify("change", value)
      this.status = "collapse"
    },
    //------------------------------------------------
    onChangedIcon() {
      let icon = _.trim(this.$refs.input.value)
      console.log("haha", icon)
      this.$notify("change", icon)
    },
    //------------------------------------------------
    onHoverIcon({value}={}) {
      this.myHoverIcon = value
    },
    //------------------------------------------------
    onLeaveIcon() {
      this.myHoverIcon = null
    },
    //------------------------------------------------
    onClearIcon() {
      this.$notify("change", null)
    },
    //------------------------------------------------
    doCollapse() {
      this.status = "collapse"
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/input/icon/ti-input-icon.mjs", _M);
})();
//============================================================
// JOIN: ti/input/icon/_com.json
//============================================================
Ti.Preload("ti/com/ti/input/icon/_com.json", {
  "name" : "ti-input-icon",
  "globally" : true,
  "template" : "./ti-input-icon.html",
  "props" : "./ti-input-icon-props.mjs",
  "mixins" : ["./ti-input-icon.mjs"]
});
//============================================================
// JOIN: ti/input/month/ti-input-month.html
//============================================================
Ti.Preload("ti/com/ti/input/month/ti-input-month.html", `<ti-combo-box class="as-month"
  :class="topClass"
  :width="width"
  :drop-width="dropWidth"
  :drop-height="dropHeight"
  :drop-overflow="'hidden'"
  :status="status"
  @collapse="doCollapse">
  <!--
    Box
  -->
  <template v-slot:box>
    <ti-input 
      :readonly="!canInput"
      :hide-border="hideBorder"
      :placeholder="placeholder|i18n"
      :prefix-icon="icon"
      :suffix-icon="theStatusIcon"
      :value="theInputValue"
      :height="height"
      :focus="isExtended"
      @change="onChanged"
      @input:focus="onInputFocused"
      @suffix:icon="onClickStatusIcon"/>
  </template>
  <!--
    Drop
  -->
  <template v-slot:drop>
    <ti-month
      :value="theDropDate"
      :height="dropHeight"
      :begin-year="beginYear"
      :end-year="endYear"
      @change="onMonthChanged"/>
  </template>
</ti-combo-box>`);
//============================================================
// JOIN: ti/input/month/ti-input-month.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "runtime" : null,
    "status"  : "collapse"
  }),
  ////////////////////////////////////////////////////
  props : {
    "canInput" : {
      type : Boolean,
      default : true
    },
    "value" : {
      type : [String, Number, Date],
      default : null
    },
    "icon" : {
      type : String,
      default : "far-calendar"
    },
    "format" : {
      type : String,
      default : "yyyy-MM"
    },
    "placeholder" : {
      type : [String, Number],
      default : "i18n:blank-month"
    },
    "hideBorder" : {
      type : Boolean,
      default : false
    },
    "width" : {
      type : [Number, String],
      default : "1.4rem"
    },
    "height" : {
      type : [Number, String],
      default : undefined
    },
    "dropWidth" : {
      type : [Number, String],
      default : "box"
    },
    // the height of drop list
    "dropHeight" : {
      type : [Number, String],
      default : 200
    },
    "beginYear" : {
      type : [Number, String],
      default : 1970
    },
    "endYear" : {
      type : [Number, String],
      default : (new Date().getFullYear()+1)
    },
    "statusIcons" : {
      type : Object,
      default : ()=>({
        collapse : "zmdi-chevron-down",
        extended : "zmdi-chevron-up"
      })
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
    //------------------------------------------------
    isCollapse() {return "collapse"==this.status},
    isExtended() {return "extended"==this.status},
    //------------------------------------------------
    theDate() {
      return Ti.Types.toDate(this.value, null)
    },
    //------------------------------------------------
    theDropDate() {
      return this.runtime || this.theDate
    },
    //------------------------------------------------
    theInputValue() {
      if(this.isExtended) {
        return this.getDateText(this.theDropDate)
      }
      return this.getDateText(this.theDropDate, this.format)
    },
    //------------------------------------------------
    theStatusIcon() {
      return this.statusIcons[this.status]
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    applyRuntime() {
      if(this.runtime) {
        let dt = this.runtime
        this.runtime = null
        let str = this.getDateText(dt)
        this.$notify("change", str)
      }
    },
    //-----------------------------------------------
    doExtend() {
      this.status = "extended"
    },
    //-----------------------------------------------
    doCollapse({escaped=false}={}) {
      this.status = "collapse"
      // Drop runtime
      if(escaped) {
        this.runtime = null
      }
      // Apply Changed for runtime
      else {
        this.applyRuntime()
      }
    },
    //------------------------------------------------
    onInputFocused() {
      this.doExtend()
    },
    //------------------------------------------------
    onChanged(val) {
      // Empty value as null
      if(_.isEmpty(val)) {
        this.$notify("change", null);
      }
      // Parsed value
      else {
        let dt  = Ti.Types.toDate(val)
        let str = this.getDateText(dt)
        this.$notify("change", str)
      }
    },
    //------------------------------------------------
    onClickStatusIcon() {
      // extended -> collapse
      if(this.isExtended) {
        this.doCollapse()
      }
      // collapse -> extended
      else {
        this.doExtend()
      }
    },
    //------------------------------------------------
    onMonthChanged(dt) {
      this.runtime = dt
    },
    //------------------------------------------------
    getDateText(dt, fmt="yyyy-MM") {
      let dt2 = Ti.Types.toDate(dt, null)
      return Ti.Types.formatDate(dt2, fmt)
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/input/month/ti-input-month.mjs", _M);
})();
//============================================================
// JOIN: ti/input/month/_com.json
//============================================================
Ti.Preload("ti/com/ti/input/month/_com.json", {
  "name" : "ti-input-month",
  "globally" : true,
  "template" : "./ti-input-month.html",
  "mixins" : ["./ti-input-month.mjs"],
  "components" : [
    "@com:ti/combo/input",
    "@com:ti/month"]
});
//============================================================
// JOIN: ti/input/num/ti-input-num.html
//============================================================
Ti.Preload("ti/com/ti/input/num/ti-input-num.html", `<div class="ti-input-num ti-fill-parent">
  <!--
    Button: -
  -->
  <div class="as-btn is-decrease"
    :class="desreaseClass"
    @click="changeByStep(-1)">
    <ti-icon value="zmdi-minus"/>
  </div>
  <!--
    Input
  -->
  <div class="as-input">
    <input 
      spellcheck="false" 
      :value="theValue"
      @change="onChanged">
  </div>
  <!--
    Button: +
  -->
  <div class="as-btn is-increase"
    :class="increaseClass"
    @click="changeByStep(1)">
    <ti-icon value="zmdi-plus"/>
  </div>
</div>`);
//============================================================
// JOIN: ti/input/num/ti-input-num.mjs
//============================================================
(function(){
const _M = {
  ////////////////////////////////////////////////////
  props : {
    "value" : null,
    "defaultValue" : {
      type : Number,
      default : 0
    },
    "maxValue" : {
      type : Number,
      default : undefined
    },
    "minValue" : {
      type : Number,
      default : undefined
    },
    "step" : {
      type : Number,
      default : 1
    }
    // "width" : {
    //   type : [Number, String],
    //   default : 200
    // }
  },
  ////////////////////////////////////////////////////
  computed : {
    // topStyle() {
    //   if(_.isNumber(this.width) || this.width) {
    //     return {
    //       width : Ti.Css.toSize(this.width)
    //     }
    //   }
    // },
    theValue() {
      if(isNaN(this.value) 
         || !_.isNumber(this.value)) {
        return
      }
      return this.getValue(this.value)
    },
    desreaseClass() {
      if(!_.isUndefined(this.minValue) && this.value <= this.minValue) {
        return "is-disabled"
      }
      return "is-enabled"
    },
    increaseClass() {
      if(!_.isUndefined(this.maxValue) && this.value >= this.maxValue) {
        return "is-disabled"
      }
      return "is-enabled"
    }
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    getValue(val) {
      if(isNaN(val) || !_.isNumber(val)) {
        return this.defaultValue
      }
      if(!_.isUndefined(this.minValue) && val < this.minValue) {
        return this.minValue
      }
      if(!_.isUndefined(this.maxValue) && val > this.maxValue) {
        return this.maxValue
      }
      return val
    },
    //------------------------------------------------
    changeByStep(n=0) {
      let val = this.theValue
      // Start with default value
      if(_.isUndefined(val)) {
        val = this.defaultValue
      }
      // change by step
      else {
        val += (n * this.step)
      }
      // Eval the min/max range
      val = this.getValue(val)

      // Emit change
      if(val != this.value) {
        this.$notify("change", val)
      }
    },
    //------------------------------------------------
    onChanged($event) {
      let $in = $event.target
      if(_.isElement($in)) {
        let str = _.trim($in.value)
        let val = str ? str * 1 : this.defaultValue
        if(!isNaN(val)) {
          this.$notify("change", val)  
        }
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/input/num/ti-input-num.mjs", _M);
})();
//============================================================
// JOIN: ti/input/num/_com.json
//============================================================
Ti.Preload("ti/com/ti/input/num/_com.json", {
  "name" : "ti-input-num",
  "globally" : true,
  "template" : "./ti-input-num.html",
  "mixins" : ["./ti-input-num.mjs"]
});
//============================================================
// JOIN: ti/input/tags/ti-input-tags-props.mjs
//============================================================
(function(){
const _M = {
  //-----------------------------------
  // Data
  //-----------------------------------
  "dict" : {
    type : [String, Ti.Dict],
    default : null
  },
  "inputValue" : null,
  // +1 from the begin
  // -1 from the last
  "maxValueLen" : {
    type : Number,
    default : 0
  },
  "valueUnique" : {
    type : Boolean,
    default : true
  },
  "tagOptions" : {
    type : [Array, Function],
    default : ()=>[]
  },
  "tagMapping" : {
    type : Object,
    default : undefined
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "canInput" : {
    type : Boolean,
    default : true
  },
  "cancelTagBubble" : {
    type : Boolean,
    default : false
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "tagItemIconBy" : {
    type : [String, Function],
    default : undefined
  },
  "tagItemDefaultIcon" : {
    type : String,
    default : undefined
  },
  "tagOptionDefaultIcon" : {
    type : String,
    default : undefined
  }
}
Ti.Preload("ti/com/ti/input/tags/ti-input-tags-props.mjs", _M);
})();
//============================================================
// JOIN: ti/input/tags/ti-input-tags.html
//============================================================
Ti.Preload("ti/com/ti/input/tags/ti-input-tags.html", `<ti-input
  class="ti-input-tags"
  :class-name="className"
  :value="inputValue"
  :value-case="valueCase"
  :trimed="trimed"

  :readonly="!canInput || readonly"
  :focused="focused"
  :hover="hover"
  :auto-select="autoSelect"

  :placeholder="thePlaceholder"
  :auto-i18n="autoI18n"
  :hide-border="hideBorder"
  :prefix-icon="prefixIcon"
  :prefix-hover-icon="prefixHoverIcon"
  :prefix-icon-for-clean="prefixIconForClean"
  :prefix-text="prefixText"
  :suffix-icon="suffixIcon"
  :suffix-text="suffixText"
  
  :width="width"
  :height="height"

  :on-init="onInputInit"
  
  @inputing="onInputInputing"
  @change="onInputChanged"
  @input:focus="$notify('input:focus')"
  @prefix:icon="$notify('prefix:icon')"
  @input:blur="$notify('input:blur')"
  @suffix:icon="$notify('suffix:icon')">
  <!--
    Tag List
  -->
  <div v-if="hasTags"
    class="as-tags">
    <ti-tags
      :value="theTags"
      :dict="dict"
      :removable="true"
      :item-options="tagOptions"
      :item-icon-by="tagItemIconBy"
      :item-default-icon="tagItemDefaultIcon"
      :option-default-icon="tagOptionDefaultIcon"
      :mapping="tagMapping"
      :cancel-item-bubble="cancelTagBubble"
      @change="$notify('change', $event)"/>
  </div>
</ti-input>`);
//============================================================
// JOIN: ti/input/tags/ti-input-tags.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    
  }),
  ////////////////////////////////////////////////////
  props : {
    "inputChange" : {
      type: Function,
      default : undefined
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    /***
     * @return The tag objects list like:
     * 
     * ```js
     * [{
     *   icon  : "zmdi-phone",
     *   text  : "i18n:xxx",
     *   value : 100,
     *   options : [{icon,text,value}...]
     * }]
     * ```
     */
    theTags() {
      return this.evalTagList(this.value)
    },
    //------------------------------------------------
    hasTags() {
      return !_.isEmpty(this.theTags)
    },
    //------------------------------------------------
    thePlaceholder() {
      if(this.placeholder) {
        return this.placeholder
      }
      if(this.readonly || !this.canInput) {
        return ""
      }
      return "i18n:input-tags"
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onInputInit($input) {this.$input=$input},
    //------------------------------------------------
    /***
     * @return The tag objects list like:
     * 
     * ```js
     * [{
     *   icon  : "zmdi-phone",
     *   text  : "i18n:xxx",
     *   value : 100,
     *   options : [{icon,text,value}...]
     * }]
     * ```
     */
    evalTagList(values=[], newTagVal) {
      //...........................................
      // Prepare the list
      let list = _.filter(_.concat(values), (v)=>!Ti.Util.isNil(v))
      // Join the last one
      if(!Ti.Util.isNil(newTagVal)) {
        list.push(newTagVal)
      }
      // valueUnique
      if(this.valueUnique) {
        list = _.uniq(list)
      }
      // The MaxValueLen
      if(this.maxValueLen > 0) {
        list = _.slice(list, 0, this.maxValueLen)
      }
      // Slice from the end
      else if(this.maxValueLen < 0) {
        let offset = Math.max(0, list.length + this.maxValueLen)
        list = _.slice(list, offset)
      }
      // Gen Tag List
      let tags = []
      for(let li of list) {
        // Object
        if(_.isPlainObject(li)) {
          tags.push(_.assign({
            icon    : this.tagIcon,
            options : this.tagOptions
          }, li))
        }
        // String or simple value
        else {
          tags.push(li)
        }
      }
      //...........................................
      return tags
    },
    //------------------------------------------------
    getTagValues(tags=[]) {
      let list = []
      for(let tag of tags) {
        let val = _.isPlainObject(tag)
          ? tag.value
          : tag
        if(!Ti.Util.isNil(val)) {
          list.push(val)
        }
      }
      return list
    },
    //------------------------------------------------
    onInputInputing(val) {
      this.$notify("inputing", val)
    },
    //------------------------------------------------
    onInputChanged(val) {
      // May click the prefix icon for clean
      if(_.isNull(val)) {
        this.$notify("change", [])
      }
      // Delegate to parent
      else if(_.isFunction(this.inputChange)) {
        this.inputChange(val)
      }
      // Handle by self
      else if(val) {
        let tags = this.evalTagList(this.value, val)
        let vals = this.getTagValues(tags)
        this.$notify("change", vals)
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/input/tags/ti-input-tags.mjs", _M);
})();
//============================================================
// JOIN: ti/input/tags/_com.json
//============================================================
Ti.Preload("ti/com/ti/input/tags/_com.json", {
  "name" : "ti-input-tags",
  "globally" : true,
  "template" : "./ti-input-tags.html",
  "props" : [
      "@com:ti/input/ti-input-props.mjs",
      "./ti-input-tags-props.mjs"
    ],
  "mixins" : ["./ti-input-tags.mjs"],
  "components" : ["@com:ti/tags"]
});
//============================================================
// JOIN: ti/input/text/ti-input-text.html
//============================================================
Ti.Preload("ti/com/ti/input/text/ti-input-text.html", `<div class="ti-input-text" 
  :class="topClass" 
  :style="topStyle"
  v-ti-activable>
  <!--
    Prefix
  -->
  <div class="as-bar is-prefix">
    <!--prefix:icon-->
    <div v-if="prefixIcon"
      class="as-icon at-prefix"
      :class="getHoverClass('prefixIcon')"
      @click.left.stop="onClickPrefixIcon"
      @mouseenter="pointerHover='prefixIcon'"
      @mouseleave="pointerHover=null">
      <ti-icon :value="thePrefixIcon"/>
    </div>
    <!--prefix:text-->
    <div v-if="prefixText" 
      class="as-text at-prefix"
      :class="getHoverClass('prefixText')"
      @click.left.stop="onClickPrefixText"
      @mouseenter="pointerHover='prefixText'"
      @mouseleave="pointerHover=null">
      <span>{{prefixText|i18n}}</span>
    </div>
  </div>
  <!--input-->
  <textarea ref="input"
    spellcheck="false" 
    :readonly="readonly"
    :value="theValue"
    :placeholder="placeholder"
    @compositionstart="onInputCompositionStart"
    @compositionend="onInputCompositionEnd"
    @input="onInputing"
    @keydown="onInputKeyDown"
    @change="onInputChanged"
    @focus="onInputFocus"
    @blur="onInputBlur"></textarea>
  <!--
    Suffox
  -->
  <div class="as-bar is-suffix">
    <!--suffix:text-->
    <div v-if="suffixText"
      class="as-text at-suffix"
      :class="getHoverClass('suffixText')"
      @click.left.stop="onClickSuffixIcon"
      @mouseenter="pointerHover='suffixText'"
      @mouseleave="pointerHover=null">
      <span>{{suffixText|i18n}}</span>
    </div>
    <!--suffix:icon-->
    <div v-if="suffixIcon"
      class="as-icon at-suffix"
      :class="getHoverClass('suffixIcon')"
      @click.left.stop="onClickSuffixIcon"
      @mouseenter="pointerHover='suffixIcon'"
      @mouseleave="pointerHover=null">
      <ti-icon :value="suffixIcon"/>
    </div>
  </div>
</div>`);
//============================================================
// JOIN: ti/input/text/ti-input-text.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "inputCompositionstart" : false,
    "isFocused" : false,
    "pointerHover" : null
  }),
  ////////////////////////////////////////////////////
  watch : {
    "focus" : function(v) {
      this.isFocused = v
    }
  },
  ////////////////////////////////////////////////////
  props : {
    "value" : null,
    "format" : {
      type : [String, Array, Object],
      default : undefined
    },
    "readonly" : {
      type: Boolean,
      default : false
    },
    "valueCase" : {
      type : String,
      default : null,
      validator : (cs)=>(Ti.Util.isNil(cs)||Ti.S.isValidCase(cs))
    },
    "placeholder" : {
      type : [String, Number],
      default : null
    },
    "trimed" : {
      type : Boolean,
      default : true
    },
    "autoJsValue" : {
      type : Boolean,
      default : false
    },
    "hideBorder" : {
      type : Boolean,
      default : false
    },
    "width" : {
      type : [Number, String],
      default : null
    },
    "height" : {
      type : [Number, String],
      default : null
    },
    "prefixHoverIcon" : {
      type : String,
      default : "zmdi-close-circle"
    },
    "prefixIconForClean" : {
      type : Boolean,
      default : true
    },
    "prefixIcon" : {
      type : String,
      default : null
    },
    "prefixText" : {
      type : String,
      default : null
    },
    "suffixText" : {
      type : String,
      default : null
    },
    "suffixIcon" : {
      type : String,
      default : null
    },
    "focus" : {
      type : Boolean,
      default : false
    },
    "hover" : {
      type : [Array, String],
      default : ()=>["prefixIcon", "suffixIcon"]
    },
    "autoSelect" : {
      type : Boolean,
      default : false
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className, {
        "is-self-actived" : this.isSelfActived,
        "is-actived"   : this.isActived,
        "is-focused"   : this.isFocused,
        "is-blurred"   : !this.isFocused,
        "is-readonly"  : this.readonly,
        "show-border"  : !this.hideBorder,
        "hide-border"  : this.hideBorder,
        "has-prefix-icon" : this.thePrefixIcon,
        "has-prefix-text" : this.prefixText,
        "has-suffix-icon" : this.suffixIcon,
        "has-suffix-text" : this.suffixText,
      })
    },
    //------------------------------------------------
    topStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //------------------------------------------------
    theValue() {
      //console.log("input value:", this.value)
      // if(_.isArray(this.value)) {
      //   return this.value.join("\r\n")
      // }
      return Ti.Types.toStr(this.value, this.format)
    },
    //------------------------------------------------
    thePrefixIcon() {
      if("prefixIcon" == this.pointerHover
        && this.isCanHover("prefixIcon")) {
        return this.prefixHoverIcon || this.prefixIcon
      }
      return this.prefixIcon
    },
    //------------------------------------------------
    theHover() {
      let map = {}
      let hos = _.concat(this.hover)
      for(let ho of hos) {
        if(ho) {
          map[ho] = true
        }
      }
      return map
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    isCanHover(hoverName) {
      return this.theHover[hoverName] ? true : false
    },
    //------------------------------------------------
    getHoverClass(hoverName) {
      let canHover = this.isCanHover(hoverName)
      return {
        "can-hover" : canHover,
        "for-look"  : !canHover
      }
    },
    //------------------------------------------------
    onInputCompositionStart(){
      this.inputCompositionstart = true
    },
    //------------------------------------------------
    onInputCompositionEnd(){
      this.inputCompositionstart = false
      this.doWhenInput()
    },
    //------------------------------------------------
    onInputing($event) {
      if(!this.inputCompositionstart) {
        this.doWhenInput()
      }
    },
    //------------------------------------------------
    doWhenInput(emitName="inputing", autoJsValue=false) {
      if(_.isElement(this.$refs.input)) {
        //console.log("doWhenInput", emitName)
        let val = this.$refs.input.value
        // Auto js value
        if(autoJsValue) {
          val = Ti.S.toJsValue(val, {
            autoNil  : true,
            autoDate : false,
            trimed : this.trimed
          })
        }
        // Trim
        else if(this.trimed) {
          val = _.trim(val)
        }
        // case
        val = Ti.S.toCase(val, this.valueCase)
        // notify
        this.$notify(emitName, val)
      }
    },
    //------------------------------------------------
    onInputKeyDown($event) {
      let payload = _.pick($event, 
        "code","key","keyCode",
        "altKey","ctrlKey","metaKey","shiftKey")
      payload.uniqueKey = Ti.Shortcut.getUniqueKey(payload)
      payload.$event = $event
      this.$notify("keypress", payload)
    },
    //------------------------------------------------
    onInputChanged() {
      this.doWhenInput("change", this.autoJsValue)
    },
    //------------------------------------------------
    onInputFocus() {
      if(!this.readonly) {
        if(this.autoSelect) {
          this.$refs.input.select()
        } else {
          this.$refs.input.focus()
        }
      }
      this.isFocused = true
      this.$notify("input:focus")
      // Auto Actived
      if(!this.isActived) {
        this.setActived()
      }
    },
    //------------------------------------------------
    onInputBlur() {
      this.isFocused = false
      this.$notify("input:blur")
    },
    //------------------------------------------------
    onClickPrefixIcon() {
      if(this.prefixIconForClean) {
        this.$notify("change", null)
      }
      this.$notify("prefix:icon")
    },
    //------------------------------------------------
    onClickPrefixText() {
      this.$notify("prefix:text")
    },
    //------------------------------------------------
    onClickSuffixIcon() {
      this.$notify("suffix:icon")
    },
    //------------------------------------------------
    onClickSuffixText() {
      this.$notify("suffix:text")
    },
    //------------------------------------------------
    doAutoFocus() {
      if(this.focus && !this.isFocused) {
        this.onInputFocus()
      }  
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "focus" : function() {
      this.doAutoFocus()
    }
  },
  ////////////////////////////////////////////////////
  mounted : function(){
    this.doAutoFocus()
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/input/text/ti-input-text.mjs", _M);
})();
//============================================================
// JOIN: ti/input/text/_com.json
//============================================================
Ti.Preload("ti/com/ti/input/text/_com.json", {
  "name" : "ti-input-text",
  "globally" : true,
  "template" : "./ti-input-text.html",
  "mixins" : ["./ti-input-text.mjs"],
  "components" : []
});
//============================================================
// JOIN: ti/input/ti-input-props.mjs
//============================================================
(function(){
const _M = {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value" : null,
  "format" : undefined,
  "valueCase" : {
    type : String,
    default : null,
    validator : (cs)=>(Ti.Util.isNil(cs)||Ti.S.isValidCase(cs))
  },
  "trimed" : {
    type : Boolean,
    default : true
  },
  "autoJsValue" : {
    type : Boolean,
    default : false
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "readonly" : {
    type: Boolean,
    default : false
  },
  "focused" : {
    type : Boolean,
    default : false
  },
  "hover" : {
    type : [Array, String],
    default : ()=>["prefixIcon", "suffixIcon"]
  },
  "autoSelect" : {
    type : Boolean,
    default : false
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "placeholder" : {
    type : [String, Number],
    default : null
  },
  "autoI18n" : {
    type : Boolean,
    default : false
  },
  "hideBorder" : {
    type : Boolean,
    default : false
  },
  "prefixIcon" : {
    type : [String, Object],
    default : null
  },
  "prefixHoverIcon" : {
    type : String,
    default : "zmdi-close-circle"
  },
  "prefixIconForClean" : {
    type : Boolean,
    default : true
  },
  "prefixText" : {
    type : String,
    default : null
  },
  "suffixIcon" : {
    type : [String, Object],
    default : null
  },
  "suffixText" : {
    type : String,
    default : null
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "width" : {
    type : [Number, String],
    default : null
  },
  "height" : {
    type : [Number, String],
    default : null
  }
}
Ti.Preload("ti/com/ti/input/ti-input-props.mjs", _M);
})();
//============================================================
// JOIN: ti/input/ti-input.html
//============================================================
Ti.Preload("ti/com/ti/input/ti-input.html", `<div class="ti-input" 
  :class="TopClass" 
  :style="TopStyle"
  v-ti-activable>
  <!--prefix:icon-->
  <div v-if="prefixIcon"
    class="as-input-icon at-prefix"
    :class="getHoverClass('prefixIcon')"
    @click.left="OnClickPrefixIcon"
    @mouseenter="pointerHover='prefixIcon'"
    @mouseleave="pointerHover=null">
    <ti-icon :value="ThePrefixIcon"/>
  </div>
  <!--prefix:text-->
  <div v-if="prefixText" 
    class="as-input-text at-prefix"
    :class="getHoverClass('prefixText')"
    @click.left="OnClickPrefixText"
    @mouseenter="pointerHover='prefixText'"
    @mouseleave="pointerHover=null">
    <span>{{prefixText|i18n}}</span>
  </div>
  <!--PreSlot-->
  <slot></slot>
  <!--
    Input Box
  -->
  <div class="as-input">
    <input ref="input"
      spellcheck="false" 
      :readonly="readonly"
      :value="TheValue"
      :placeholder="placeholder|i18n"
      @compositionstart="OnInputCompositionStart"
      @compositionend="OnInputCompositionEnd"
      @input="OnInputing"
      @change="OnInputChanged"
      @focus="OnInputFocus"
      @blur="OnInputBlur">
    <!--suffix:text-->
    <div v-if="suffixText"
      class="as-input-text at-suffix"
      :class="getHoverClass('suffixText')"
      @click.left="OnClickSuffixIcon"
      @mouseenter="pointerHover='suffixText'"
      @mouseleave="pointerHover=null">
      <span>{{suffixText|i18n}}</span>
    </div>
    <!--suffix:icon-->
    <div v-if="suffixIcon"
      class="as-input-icon at-suffix"
      :class="getHoverClass('suffixIcon')"
      @click.left="OnClickSuffixIcon"
      @mouseenter="pointerHover='suffixIcon'"
      @mouseleave="pointerHover=null">
      <ti-icon :value="suffixIcon"/>
    </div>
  </div>
</div>`);
//============================================================
// JOIN: ti/input/ti-input.mjs
//============================================================
(function(){
const _M = {
  ////////////////////////////////////////////////////
  model : {
    prop : "value",
    event: "change"
  },
  ////////////////////////////////////////////////////
  data : ()=>({
    "inputCompositionstart" : false,
    "isFocused" : false,
    "pointerHover" : null
  }),
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-focused"   : this.isFocused,
        "is-blurred"   : !this.isFocused,
        "is-readonly"  : this.readonly,
        "show-border"  : !this.hideBorder,
        "hide-border"  : this.hideBorder,
        "has-prefix-icon" : this.thePrefixIcon,
        "has-prefix-text" : this.prefixText,
        "has-suffix-icon" : this.suffixIcon,
        "has-suffix-text" : this.suffixText,
      })
    },
    //------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //------------------------------------------------
    TheValue() {
      //console.log("input value:", this.value)
      let val = Ti.Types.toStr(this.value, this.format)
      if(this.autoI18n) {
        return Ti.I18n.text(val)
      }
      return val
    },
    //------------------------------------------------
    ThePrefixIcon() {
      if("prefixIcon" == this.pointerHover
        && this.isCanHover("prefixIcon")) {
        return this.prefixHoverIcon || this.prefixIcon
      }
      return this.prefixIcon
    },
    //------------------------------------------------
    TheHover() {
      let map = {}
      let hos = _.concat(this.hover)
      for(let ho of hos) {
        if(ho) {
          map[ho] = true
        }
      }
      return map
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    isCanHover(hoverName) {
      return this.TheHover[hoverName] ? true : false
    },
    //------------------------------------------------
    getHoverClass(hoverName) {
      let canHover = this.isCanHover(hoverName)
      return {
        "can-hover" : canHover,
        "for-look"  : !canHover,
        "is-prefix-icon-hover" : "prefixIcon" == hoverName
      }
    },
    //------------------------------------------------
    OnInputCompositionStart(){
      this.inputCompositionstart = true
    },
    //------------------------------------------------
    OnInputCompositionEnd(){
      this.inputCompositionstart = false
      this.doWhenInput()
    },
    //------------------------------------------------
    OnInputing($event) {
      if(!this.inputCompositionstart) {
        this.doWhenInput()
      }
    },
    //------------------------------------------------
    doWhenInput(emitName="inputing", autoJsValue=false) {
      if(_.isElement(this.$refs.input)) {
        //console.log("doWhenInput", emitName)
        let val = this.$refs.input.value
        // Auto js value
        if(autoJsValue) {
          val = Ti.S.toJsValue(val, {
            autoNil  : true,
            autoDate : false,
            trimed : this.trimed
          })
        }
        // Trim
        else if(this.trimed) {
          val = _.trim(val)
        }
        // case
        val = Ti.S.toCase(val, this.valueCase)
        // notify
        this.$notify(emitName, val)
      }
    },
    //------------------------------------------------
    // OnInputKeyDown($event) {
    //   let payload = _.pick($event, 
    //     "code","key","keyCode",
    //     "altKey","ctrlKey","metaKey","shiftKey")
    //   payload.uniqueKey = Ti.Shortcut.getUniqueKey(payload)
    //   payload.$event = $event
    //   this.$notify("keypress", payload)
    // },
    //------------------------------------------------
    OnInputChanged() {
      this.doWhenInput("change", this.autoJsValue)
    },
    //------------------------------------------------
    OnInputFocus() {
      if(!this.readonly) {
        if(this.autoSelect) {
          this.$refs.input.select()
        } else {
          this.$refs.input.focus()
        }
      }
      this.isFocused = true
      this.$notify("input:focus")
      // Auto Actived
      if(!this.isActived) {
        this.setActived()
      }
    },
    //------------------------------------------------
    OnInputBlur() {
      this.isFocused = false
      this.$notify("input:blur")
    },
    //------------------------------------------------
    OnClickPrefixIcon() {
      if(this.prefixIconForClean) {
        this.$notify("change", null)
      }
      this.$notify("prefix:icon")
    },
    //------------------------------------------------
    OnClickPrefixText() {
      this.$notify("prefix:text")
    },
    //------------------------------------------------
    OnClickSuffixIcon() {
      this.$notify("suffix:icon")
    },
    //------------------------------------------------
    OnClickSuffixText() {
      this.$notify("suffix:text")
    },
    //------------------------------------------------
    doAutoFocus() {
      if(this.focused && !this.isFocused) {
        this.OnInputFocus()
      }  
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "focused" : function() {
      this.doAutoFocus()
    }
  },
  ////////////////////////////////////////////////////
  mounted : function(){
    this.doAutoFocus()
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/input/ti-input.mjs", _M);
})();
//============================================================
// JOIN: ti/input/time/ti-input-time.html
//============================================================
Ti.Preload("ti/com/ti/input/time/ti-input-time.html", `<ti-combo-box class="as-time"
  :class="topClass"
  :width="width"
  :drop-width="dropWidth"
  :drop-height="dropHeight"
  :drop-overflow="'hidden'"
  :status="status"
  @collapse="doCollapse">
  <!--
    Box
  -->
  <template v-slot:box>
    <ti-input 
      :readonly="!canInput"
      :hide-border="hideBorder"
      :placeholder="placeholder|i18n"
      :prefix-icon="icon"
      :suffix-icon="theStatusIcon"
      :value="theTimeText"
      :height="height"
      :focus="isExtended"
      @change="onChanged"
      @input:focus="onInputFocused"
      @suffix:icon="onClickStatusIcon"/>
  </template>
  <!--
    Drop
  -->
  <template v-slot:drop>
    <ti-time
      :value="theDropTime"
      :height="dropHeight"
      :mode="mode"
      @change="onTimeChanged"/>
  </template>
</ti-combo-box>`);
//============================================================
// JOIN: ti/input/time/ti-input-time.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "runtime" : null,
    "status"   : "collapse"
  }),
  ////////////////////////////////////////////////////
  props : {
    "canInput" : {
      type : Boolean,
      default : true
    },
    "value" : {
      type : [String, Number, Ti.Types.Time],
      default : null
    },
    "icon" : {
      type : String,
      default : "far-clock"
    },
    /***
     * Value unit when value is Number
     */
    "valueUnit" : {
      type : String,
      default : "s",
      validator : function(unit) {
        return /^(ms|s|min|hr)$/.test(unit)
      }
    },
    // Display mode
    "mode" : {
      type : String,
      default : "auto",
      /***
       * - `sec`  : "HH:mm:ss"
       * - `min`  : "HH:mm"
       * - `auto` : "HH:mm" or "HH:mm:ss" if `ss` no zero
       */
      validator : function(unit) {
        return /^(sec|min|auto)$/.test(unit)
      }
    },
    "placeholder" : {
      type : [String, Number],
      default : "i18n:blank-time"
    },
    "hideBorder" : {
      type : Boolean,
      default : false
    },
    "width" : {
      type : [Number, String],
      default : "1.4rem"
    },
    "height" : {
      type : [Number, String],
      default : undefined
    },
    "dropWidth" : {
      type : [Number, String],
      default : "box"
    },
    "dropHeight" : {
      type : [Number, String],
      default : 400
    },
    "statusIcons" : {
      type : Object,
      default : ()=>({
        collapse : "zmdi-chevron-down",
        extended : "zmdi-chevron-up"
      })
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
    //------------------------------------------------
    isCollapse() {return "collapse"==this.status},
    isExtended() {return "extended"==this.status},
    //------------------------------------------------
    theTime() {
      //console.log("input value:", this.value)
      return Ti.Types.toTime(this.value, this.valueUnit)
    },
    //------------------------------------------------
    theDropTime() {
      return this.runtime || this.theTime
    },
    //------------------------------------------------
    theTimeFormat() {
      return ({
        "sec"  : "HH:mm:ss",
        "min"  : "HH:mm",
        "auto" : "auto"
      })[this.mode]
    },
    //------------------------------------------------
    theTimeText() {
      return this.getTimeText(this.theDropTime)
    },
    //------------------------------------------------
    theStatusIcon() {
      return this.statusIcons[this.status]
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    applyRuntime() {
      if(this.runtime) {
        let tm = this.runtime
        this.runtime = null
        let str = this.getTimeText(tm)
        this.$notify("change", str)
      }
    },
    //-----------------------------------------------
    doExtend() {
      this.status = "extended"
    },
    //-----------------------------------------------
    doCollapse({escaped=false}={}) {
      //console.log("time doCollapse", {escaped})
      this.status = "collapse"
      // Drop runtime
      if(escaped) {
        this.runtime = null
      }
      // Apply Changed for runtime
      else {
        this.applyRuntime()
      }
    },
    //------------------------------------------------
    onInputFocused() {
      this.doExtend()
    },
    //------------------------------------------------
    onChanged(val) {
      // Empty value as null
      if(_.isEmpty(val)) {
        this.$notify("change", null);
      }
      // Parsed value
      else {
        let tm  = Ti.Types.toTime(val)
        let str = this.getTimeText(tm)
        this.$notify("change", str)
      }
    },
    //------------------------------------------------
    onClickStatusIcon() {
      // extended -> collapse
      if(this.isExtended) {
        this.doCollapse()
      }
      // collapse -> extended
      else {
        this.doExtend()
      }
    },
    //------------------------------------------------
    onTimeChanged(time) {
      this.runtime = time
    },
    //------------------------------------------------
    getTimeText(tm) {
      if(tm instanceof Ti.Types.Time) {
        return tm.toString(this.theTimeFormat)
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/input/time/ti-input-time.mjs", _M);
})();
//============================================================
// JOIN: ti/input/time/_com.json
//============================================================
Ti.Preload("ti/com/ti/input/time/_com.json", {
  "name" : "ti-input-time",
  "globally" : true,
  "template" : "./ti-input-time.html",
  "mixins" : ["./ti-input-time.mjs"],
  "components" : [
    "@com:ti/combo/input",
    "@com:ti/time"]
});
//============================================================
// JOIN: ti/input/timerange/ti-input-timerange.html
//============================================================
Ti.Preload("ti/com/ti/input/timerange/ti-input-timerange.html", `<ti-combo-box class="as-timerange"
  :class="topClass"
  :width="width"
  :drop-width="null"
  :status="status"
  @collapse="doCollapse">
  <!--
    Box
  -->
  <template v-slot:box>
    <ti-input 
      :readonly="!canInput"
      :hide-border="hideBorder"
      :placeholder="placeholder|i18n"
      :prefix-icon="icon"
      :suffix-icon="theStatusIcon"
      :value="theRangeText"
      :height="height"
      :focus="isExtended"
      @change="onChanged"
      @input:focus="onInputFocused"
      @suffix:icon="onClickStatusIcon"/>
  </template>
  <!--
    Drop
  -->
  <template v-slot:drop>
    <ti-form
      :data="theDropRange"
      v-bind="theFormConfig"
      @change="onFormChanged"/>
  </template>
</ti-combo-box>`);
//============================================================
// JOIN: ti/input/timerange/ti-input-timerange.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "runtime" : null,
    "status"  : "collapse"
  }),
  ////////////////////////////////////////////////////
  props : {
    "canInput" : {
      type : Boolean,
      default : true
    },
    "value" : {
      type : [String, Object, Number, Array],
      default : null
    },
    "rangeKeys" : {
      type : Array,
      default : ()=>["beginTime", "endTime"]
    },
    "valueMode" : {
      type : String,
      default : "Array"
    },
    "dftValue" : {
      type : Array,
      default : ()=>["09:00", "17:00"]
    },
    "icon" : {
      type : String,
      default : "zmdi-time-interval"
    },
    "format" : {
      type : String,
      default : "HH:mm"
    },
    "placeholder" : {
      type : String,
      default : "i18n:blank-time-range"
    },
    "hideBorder" : {
      type : Boolean,
      default : false
    },
    "width" : {
      type : [Number, String],
      default : "2rem"
    },
    "height" : {
      type : [Number, String],
      default : undefined
    },
    "statusIcons" : {
      type : Object,
      default : ()=>({
        collapse : "zmdi-chevron-down",
        extended : "zmdi-chevron-up"
      })
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
    //------------------------------------------------
    isCollapse() {return "collapse"==this.status},
    isExtended() {return "extended"==this.status},
    //--------------------------------------
    theFormConfig() {
      let [keyBegin, keyEnd] = this.rangeKeys
      let fields = [{
        name  : keyBegin,
        type  : "Time",
        title : "i18n:time-begin",
        comType : "ti-input-time"
      }, {
        name  : keyEnd,
        type  : "Time",
        title : "i18n:time-end",
        comType : "ti-input-time"
      }]
      return {
        fields,
        spacing : "tiny",
        statusIcons : null
      }
    },
    //--------------------------------------
    theRange() {
      return this.parseTimeRange(this.value)
    },
    //--------------------------------------
    theRangeText() {
      let [keyBegin, keyEnd] = this.rangeKeys
      let ss = []
      _.forEach(this.theRange, (val)=>{
        // Time
        if(val) {
          ss.push(val.toString(this.format))
        }
        // Zero
        else {
          ss.push(Ti.Types.formatTime(0, this.format))
        }
      })
      return ss.join(" ~ ")
    },
    //--------------------------------------
    theRangeValue() {
      return this.formatRangeValue(this.theRange)
    },
    //------------------------------------------------
    theDropRange() {
      return this.runtime || this.theRangeValue
    },
    //------------------------------------------------
    theStatusIcon() {
      return this.statusIcons[this.status]
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    applyRuntime() {
      if(this.runtime) {
        let rg = this.parseTimeRange(this.runtime)
        this.runtime = null
        let rg2 = this.formatRangeValue(rg)
        let rg3 = this.formatEmitRangeValue(rg2)
        this.$notify("change", rg3)
      }
    },
    //-----------------------------------------------
    doExtend() {
      this.status = "extended"
    },
    //-----------------------------------------------
    doCollapse({escaped=false}={}) {
      this.status = "collapse"
      // Drop runtime
      if(escaped) {
        this.runtime = null
      }
      // Apply Changed for runtime
      else {
        this.applyRuntime()
      }
    },
    //------------------------------------------------
    onInputFocused() {
      this.doExtend()
    },
    //------------------------------------------------
    onChanged(val) {
      let rg = this.parseTimeRange(val)
      // Empty Range
      if(_.isEmpty(rg)) {
        this.$notify("change", null);
      }
      // Format the Range
      else {
        let rg2 = this.formatRangeValue(rg)
        let rg3 = this.formatEmitRangeValue(rg2)
        this.$notify("change", rg3);
      }
    },
    //------------------------------------------------
    onClickStatusIcon() {
      // extended -> collapse
      if(this.isExtended) {
        this.doCollapse()
      }
      // collapse -> extended
      else {
        this.doExtend()
      }
    },
    //------------------------------------------------
    formatEmitRangeValue(rg) {
      let [keyBegin, keyEnd] = this.rangeKeys
      // Format the value to array
      if(rg && "Array" == this.valueMode) {
        let re = [rg[keyBegin], rg[keyEnd]]
        return _.filter(re, (v)=>(v && _.isString(v)))
      }
      // Default as object
      return rg
    },
    //------------------------------------------------
    onFormChanged(pair) {
      let rg = _.assign({}, this.theRangeValue, this.runtime)
      rg[pair.name] = pair.value
      this.runtime = rg
    },
    //------------------------------------------------
    parseTimeRange(val) {
      let [keyBegin, keyEnd] = this.rangeKeys
      val = Ti.Util.fallback(val, this.dftValue, {})
      let rg = {}
      // Number 
      if(_.isNumber(val)) {
        let tm = Ti.Types.toTime(val)
        rg = {
          [keyBegin] : tm
        }
      }
      // String
      else if(_.isString(val)) {
        let str = _.trim(val)
        let ss = _.split(str, /[\t ,\/~-]+/)
        let tm0 = Ti.Types.toTime(ss[0])
        let tm1 = Ti.Types.toTime(ss[1])
        rg = {
          [keyBegin] : tm0,
          [keyEnd]   : tm1
        }
      }
      // Array
      else if(_.isArray(val)) {
        rg = {
          [keyBegin] : Ti.Types.toTime(val[0]),
          [keyEnd]   : Ti.Types.toTime(val[1])
        }
      }
      // Plain Object
      else if(_.isPlainObject(val)) {
        rg = _.pick(val, this.rangeKeys)
      }
      // Then make sure the range beignTime is the less one
      return this.normalizeRange(rg)
    },
    //------------------------------------------------
    // Then make sure the range beignTime is the less one
    normalizeRange(rg) {
      let [keyBegin, keyEnd] = this.rangeKeys
      if(rg && rg[keyBegin] && rg[keyEnd]) {
        let tmBegin = Ti.Types.toTime(rg[keyBegin])
        let tmEnd   = Ti.Types.toTime(rg[keyEnd])
        if(tmBegin.valueInMilliseconds > tmEnd.valueInMilliseconds) {
          let tm = rg[keyBegin]
          rg[keyBegin] = tmEnd
          rg[keyEnd] = tmBegin
        }
      }
      return rg
    },
    //------------------------------------------------
    formatRangeValue(range) {
      let rg = _.assign({}, range)
      _.forEach(rg, (val, key)=>{
        // Time
        if(val) {
          rg[key] = val.toString()
        }
        // Zero
        else {
          rg[key] = Ti.Types.formatTime(0)
        }
      })
      return rg
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/input/timerange/ti-input-timerange.mjs", _M);
})();
//============================================================
// JOIN: ti/input/timerange/_com.json
//============================================================
Ti.Preload("ti/com/ti/input/timerange/_com.json", {
  "name" : "ti-input-timerange",
  "globally" : true,
  "template" : "./ti-input-timerange.html",
  "mixins" : ["./ti-input-timerange.mjs"],
  "components" : [
    "@com:ti/combo/input"]
});
//============================================================
// JOIN: ti/input/_com.json
//============================================================
Ti.Preload("ti/com/ti/input/_com.json", {
  "name" : "ti-input",
  "globally" : true,
  "template" : "./ti-input.html",
  "props" : "./ti-input-props.mjs",
  "mixins" : ["./ti-input.mjs"],
  "components" : []
});
//============================================================
// JOIN: ti/label/ti-label-props.mjs
//============================================================
(function(){
const _M = {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value" : null,
  "dict" : {
    type : [String, Ti.Dict],
    default : undefined
  },
  "trimed" : {
    type : Boolean,
    default : true
  },
  "format" : undefined,
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "href" : {
    type : String,
    default : undefined
  },
  "newTab" : {
    type : Boolean,
    default : false
  },
  "editable" : {
    type : Boolean,
    default : false
  },
  "hover" : {
    type : [Array, String],
    default : ()=>["suffixIcon"]
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "placeholder" : {
    type : String,
    default : "i18n:nil"
  },
  "autoI18n" : {
    type : Boolean,
    default : true
  },
  "prefixIcon" : {
    type : String,
    default : undefined
  },
  "prefixText" : {
    type : String,
    default : undefined
  },
  "suffixText" : {
    type : String,
    default : undefined
  },
  "suffixIcon" : {
    type : String,
    default : undefined
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "width" : {
    type : [Number, String],
    default : undefined
  },
  "height" : {
    type : [Number, String],
    default : undefined
  },
  "valueMaxWidth" : {
    type : [Number, String],
    default : undefined
  }
}
Ti.Preload("ti/com/ti/label/ti-label-props.mjs", _M);
})();
//============================================================
// JOIN: ti/label/ti-label.html
//============================================================
Ti.Preload("ti/com/ti/label/ti-label.html", `<div class="ti-label"
  :class="TopClass"
  :style="TopStyle"
  @dblclick.left="OnDblClick">
  <!--prefix:icon-->
  <div v-if="ThePrefixIcon"
    class="as-icon at-prefix"
    :class="getHoverClass('prefixIcon')"
    @click.left="OnClickPrefixIcon">
    <ti-icon :value="ThePrefixIcon"/>
  </div>
  <!--prefix:text-->
  <div v-if="prefixText" 
    class="as-text at-prefix"
    :class="getHoverClass('prefixText')"
    @click.left="OnClickPrefixText">
    <span>{{prefixText|i18n}}</span>
  </div>
  <!--Text-->
  <div class="as-value"
    :style="ValueStyle"
    @click.left="OnClickValue">
    <!--Link-->
    <a v-if="href"
        :href="href"
        :taget="newTab ? '_blank' : undefined"
        @click.left.prevent>{{myDisplayText}}</a>
    <!--Normal Text-->
    <span v-else>{{myDisplayText}}</span>
  </div>
  <!--suffix:text-->
  <div v-if="suffixText"
    class="as-text at-suffix"
    :class="getHoverClass('suffixText')"
    @click.left="OnClickSuffixIcon">
    <span>{{suffixText|i18n}}</span>
  </div>
  <!--suffix:icon-->
  <div v-if="suffixIcon"
    class="as-icon at-suffix"
    :class="getHoverClass('suffixIcon')"
    @click.left="OnClickSuffixIcon">
    <ti-icon :value="suffixIcon"/>
  </div>
</div>`);
//============================================================
// JOIN: ti/label/ti-label.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////
  data : ()=>({
    myDisplayIcon : undefined,
    myDisplayText : undefined,
    myDictValKey  : undefined
  }),
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-blank"   : !_.isNumber(this.TheValue) && _.isEmpty(this.TheValue)
      })
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //--------------------------------------
    ValueStyle() {
      return Ti.Css.toStyle({
        maxWidth : this.valueMaxWidth
      })
    },
    //--------------------------------------
    ThePrefixIcon() {
      return this.myDisplayIcon || this.prefixIcon
    },
    //------------------------------------------------
    TheHover() {
      let map = {}
      let hos = _.concat(this.hover)
      for(let ho of hos) {
        if(ho) {
          map[ho] = true
        }
      }
      return map
    },
    //--------------------------------------
    TheValue() {
      let str = this.value
      // Auto trim
      if(this.trim && _.isString(str)) {
        return _.trim(str)
      }
      // Return it directly
      return str
    },
    //--------------------------------------
    Dict() {
      if(this.dict) {
        // Already Dict
        if(this.dict instanceof Ti.Dict) {
          this.myDictValKey = ".text"
          return this.dict
        }
        // Get back
        let {name, vKey} = Ti.DictFactory.explainDictName(this.dict)
        this.myDictValKey = vKey || ".text"
        return Ti.DictFactory.CheckDict(name)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //------------------------------------------------
    isCanHover(hoverName) {
      return this.TheHover[hoverName] ? true : false
    },
    //------------------------------------------------
    getHoverClass(hoverName) {
      let canHover = this.isCanHover(hoverName)
      return {
        "can-hover" : canHover,
        "for-look"  : !canHover,
        "is-prefix-icon-hover" : "prefixIcon" == hoverName
      }
    },
    //--------------------------------------
    OnDblClick() {
      if(this.editable) {
        Ti.Be.EditIt(this.$el, {
          text: this.TheValue,
          ok : (newVal)=> {
            this.$notify("change", newVal)
          }
        })
      }
    },
    //------------------------------------------------
    OnClickPrefixIcon() {
      this.$notify("prefix:icon")
    },
    //------------------------------------------------
    OnClickPrefixText() {
      this.$notify("prefix:text")
    },
    //------------------------------------------------
    OnClickValue() {
      this.$notify("click:value")
    },
    //------------------------------------------------
    OnClickSuffixIcon() {
      this.$notify("suffix:icon")
    },
    //------------------------------------------------
    OnClickSuffixText() {
      this.$notify("suffix:text")
    },
    //--------------------------------------
    async evalDisplay(val) {
      // By Dict Item
      if(this.Dict) {
        let it = await this.Dict.getItem(val)
        if(it) {
          this.myDisplayIcon = this.Dict.getIcon(it)
          val = this.Dict.getBy(this.myDictValKey, it, val)
        } else {
          this.myDisplayIcon = null
        }
      }
      // Number
      if(_.isNumber(val)) {
        return val
      }
      // Collection
      if(_.isArray(val) || _.isPlainObject(val)) {
        return JSON.stringify(val, null, '  ')
      }
      // Normal value
      if(Ti.Util.isNil(val)) {
        return Ti.I18n.text(this.placeholder)
      }
      // Date
      if(_.isDate(val)) {
        return Ti.Types.toStr(val, this.format)
      }
      // Auto format
      if(this.format) {
        val = Ti.Types.toStr(val, this.format)
      }
      // Return & auto-i18n
      return this.autoI18n 
              ? Ti.I18n.text(val)
              : val
    },
    //--------------------------------------
    async reloadMyDisplay() {
      this.myDisplayIcon = null
      this.myDisplayText = await this.evalDisplay(this.TheValue)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "value" : {
      handler   : "reloadMyDisplay",
      immediate : true
    }
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/label/ti-label.mjs", _M);
})();
//============================================================
// JOIN: ti/label/_com.json
//============================================================
Ti.Preload("ti/com/ti/label/_com.json", {
  "name" : "ti-label",
  "globally" : true,
  "template" : "./ti-label.html",
  "props" : "./ti-label-props.mjs",
  "mixins" : ["./ti-label.mjs"]
});
//============================================================
// JOIN: ti/label/_hmaker.json
//============================================================
Ti.Preload("ti/com/ti/label/_hmaker.json", {
  "icon"   : "im-tag",
  "title"  : "i18n:com-label",
  "scenes" : ["desktop", "tablet", "phone"],
  "editComType" : "ti-form",
  "editComConf" : {
    "mode" : "tab",
    "data" : "=comConf",
    "fields" : [{
        "title": "i18n:hmk-aspect",
        "fields": [{
            "title": "i18n:hmk-placeholder",
            "name": "placeholder",
            "comType": "ti-input"
          }, {
            "title": "i18n:hmk-autoI18n",
            "name": "autoI18n",
            "type": "Boolean",
            "defaultAs": true,
            "comType": "ti-toggle"
          }, {
            "title": "i18n:hmk-prefixIcon",
            "name": "prefixIcon",
            "comType": "ti-input-icon"
          }, {
            "title": "i18n:hmk-prefixText",
            "name": "prefixText",
            "comType": "ti-input"
          }, {
            "title": "i18n:hmk-suffixIcon",
            "name": "suffixIcon",
            "comType": "ti-input-icon"
          }, {
            "title": "i18n:hmk-suffixText",
            "name": "suffixText",
            "comType": "ti-input"
          }]
      }, {
        "title": "i18n:hmk-behavior",
        "fields": [{
            "title": "i18n:hmk-href",
            "name": "href",
            "comType": "ti-input"
          }, {
            "title": "i18n:hmk-newTab",
            "name": "newTab",
            "type": "Boolean",
            "hidden" : {
              "href": "NoEmpty"
            },
            "comType": "ti-toggle"
          }, {
            "title": "i18n:hmk-breakLine",
            "name": "breakLine",
            "type": "Boolean",
            "defaultAs": true,
            "comType": "ti-toggle"
          }, {
            "title": "i18n:hmk-editable",
            "name": "editable",
            "type": "Boolean",
            "comType": "ti-toggle"
          }]
      }, {
      "title": "i18n:hmk-data",
      "fields": [{
          "title": "i18n:hmk-value",
          "name": "value",
          "comType": "ti-input"
        }, {
          "title": "i18n:hmk-dict",
          "name": "dict",
          "comType": "ti-input"
        }, {
          "title": "i18n:hmk-trimed",
          "name": "trimed",
          "type": "Boolean",
          "comType": "ti-toggle"
        }, {
          "title": "i18n:hmk-format",
          "name": "format",
          "comType": "ti-input",
          "comConf": {
            "autoJsValue": true
          }
        }]
    }, {
      "title": "i18n:hmk-measure",
      "fields": [{
          "title": "i18n:hmk-width",
          "name": "width",
          "comType": "ti-input"
        }, {
          "title": "i18n:hmk-height",
          "name": "height",
          "comType": "ti-input"
        }, {
          "title": "i18n:hmk-valueMaxWidth",
          "name": "valueMaxWidth",
          "comType": "ti-input"
        }]
    }]
  }
});
//============================================================
// JOIN: ti/lbs/map/baidu/ti-lbs-map-baidu.html
//============================================================
Ti.Preload("ti/com/ti/lbs/map/baidu/ti-lbs-map-baidu.html", `<div class="ti-lbs-map by-baidu ti-fill-parent">
  <div ref="arena" class="map-arena ti-fill-parent"></div>
</div>`);
//============================================================
// JOIN: ti/lbs/map/baidu/ti-lbs-map-baidu.mjs
//============================================================
(function(){
//
// The coordinate base on BD09
//
const _M = {
  /////////////////////////////////////////
  inheritAttrs : false,
  /////////////////////////////////////////
  data : ()=>({
    valueMarker : null
  }),
  /////////////////////////////////////////
  props : {
    // @see http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference_3_0.html#a5b0
    // ROADMAP    : BMAP_NORMAL_MAP
    // SATELLITE  : BMAP_SATELLITE_MAP
    // HYBRID     : BMAP_HYBRID_MAP
    "mapType" : {
      type : String,
      default : "ROADMAP"
    },
    // Map center : {"lat":39.9042, "lng":116.4074}
    // If null, it will auto sync with the value
    "center" : {
      type : Object,
      // default : ()=>({
      //   {"lat":39.9042, "lng":116.4074}
      // })
      default : null
    },
    "zoom" : {
      type : Number,
      default : 8
    },
    // A LatLng Point in map, which react the changing
    "value" : {
      type : Object,
      default : null
    },
    "valueOptions" : {
      type : Object,
      default : ()=>({
        icon : null,
        title : "UserMarker",
        // DOWN|BOUNCE|DROP|UP
        animation : "DOWN"
      })
    }
  },
  //////////////////////////////////////////
  computed : {
    //-------------------------------------
    mapCenterLatLng() {
      if(!_.isEmpty(this.center)) {
        return this.genLatLng(this.center)
      }
      if(!_.isEmpty(this.value)) {
        return this.genLatLng(this.value)
      }
      // Default center to beijing
      return this.genLatLng({lat:39.9042, lng:116.4074})
    },
    //-------------------------------------
    mapTypeId() {
      return ({
        "ROADMAP"   : BMAP_NORMAL_MAP,
        "SATELLITE" : BMAP_SATELLITE_MAP,
        "HYBRID"    : BMAP_HYBRID_MAP
      })[this.mapType] || BMAP_NORMAL_MAP
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    genLatLng({lat, lng}={}) {
      return new BMap.Point(lng, lat)
    },
    //-------------------------------------
    drawValue() {
      let $map = this.__map
      let opt  = this.valueOptions

      // Guard the value
      if(!this.value)
        return

      let point = this.genLatLng(this.value);
      var marker = new BMap.Marker(point)
      $map.addOverlay(marker);

      this.valueMarker = marker
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "value" : function(){this.drawValue()}
  },
  //////////////////////////////////////////
  mounted : async function() {
    // Init Map
    let $map = new BMap.Map(this.$refs.arena, {
      mapType : this.mapTypeId
    })
    $map.centerAndZoom(this.mapCenterLatLng, this.zoom);
    $map.addControl(new BMap.MapTypeControl({
      mapTypes:[
              BMAP_NORMAL_MAP,
              BMAP_SATELLITE_MAP,
              BMAP_HYBRID_MAP
          ]}));	
    $map.enableScrollWheelZoom(true);
    // Store
    this.__map = $map
    // Draw Value
    this.drawValue()
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/lbs/map/baidu/ti-lbs-map-baidu.mjs", _M);
})();
//============================================================
// JOIN: ti/lbs/map/baidu/_com.json
//============================================================
Ti.Preload("ti/com/ti/lbs/map/baidu/_com.json", {
  "name" : "ti-lbs-map-baidu",
  "globally" : true,
  "template" : "./ti-lbs-map-baidu.html",
  "mixins"   : ["./ti-lbs-map-baidu.mjs"],
  "components" : []
});
//============================================================
// JOIN: ti/lbs/map/tencent/ti-lbs-map-tencent.html
//============================================================
Ti.Preload("ti/com/ti/lbs/map/tencent/ti-lbs-map-tencent.html", `<div class="ti-lbs-map by-tencent ti-fill-parent">
  <div ref="arena" class="map-arena ti-fill-parent"></div>
</div>`);
//============================================================
// JOIN: ti/lbs/map/tencent/ti-lbs-map-tencent.mjs
//============================================================
(function(){
//
// The coordinate base on GCJ02
//
const _M = {
  /////////////////////////////////////////
  inheritAttrs : false,
  /////////////////////////////////////////
  data : ()=>({
    valueMarker : null
  }),
  /////////////////////////////////////////
  props : {
    // @see https://lbs.qq.com/javascript_v2/doc/maptypeid.html
    // ROADMAP | SATELLITE | HYBRID
    "mapType" : {
      type : String,
      default : "ROADMAP"
    },
    // Map center : {"lat":39.9042, "lng":116.4074}
    // If null, it will auto sync with the value
    "center" : {
      type : Object,
      // default : ()=>({
      //   {"lat":39.9042, "lng":116.4074}
      // })
      default : null
    },
    "zoom" : {
      type : Number,
      default : 8
    },
    // A LatLng Point in map, which react the changing
    "value" : {
      type : Object,
      default : null
    },
    "valueOptions" : {
      type : Object,
      default : ()=>({
        icon : null,
        title : "UserMarker",
        // DOWN|BOUNCE|DROP|UP
        animation : "DOWN"
      })
    }
  },
  //////////////////////////////////////////
  computed : {
    //-------------------------------------
    mapCenterLatLng() {
      if(!_.isEmpty(this.center)) {
        return this.genLatLng(this.center)
      }
      if(!_.isEmpty(this.value)) {
        return this.genLatLng(this.value)
      }
      // Default center to beijing
      return this.genLatLng({lat:39.9042, lng:116.4074})
    },
    //-------------------------------------
    mapTypeId() {
      return (qq.maps.MapTypeId[this.mapType]) 
             || qq.maps.MapTypeId.ROADMAP
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    genLatLng({lat, lng}={}) {
      return new qq.maps.LatLng(lat, lng)
    },
    //-------------------------------------
    drawValue() {
      let $map = this.__map
      let opt  = this.valueOptions

      // Guard the value
      if(!this.value)
        return

      let llpos = this.genLatLng(this.value);

      var marker = new qq.maps.Marker({
        position: llpos,
        animation: qq.maps.MarkerAnimation[opt.animation],
        //设置显示Marker的地图
        map: $map,
        //设置Marker可拖动
        draggable: true,
        // //自定义Marker图标为大头针样式
        // icon: new qq.maps.MarkerImage(
        //     "https://open.map.qq.com/doc/img/nilt.png"),
        // //自定义Marker图标的阴影
        // shadow: new qq.maps.MarkerImage(
        //     "https://open.map.qq.com/doc/img/nilb.png"),
        //设置Marker标题，鼠标划过Marker时显示
        title: opt.title,
        //设置Marker的可见性，为true时可见,false时不可见
        visible: true,
      });

      this.valueMarker = marker
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "value" : function(){this.drawValue()}
  },
  //////////////////////////////////////////
  mounted : async function() {
    // Init Map
    let $map = new qq.maps.Map(this.$refs.arena, {
      zoom: this.zoom,
      center: this.mapCenterLatLng,
      mapTypeId: this.mapTypeId
    })
    // Store
    this.__map = $map
    // Draw Value
    this.drawValue()
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/lbs/map/tencent/ti-lbs-map-tencent.mjs", _M);
})();
//============================================================
// JOIN: ti/lbs/map/tencent/_com.json
//============================================================
Ti.Preload("ti/com/ti/lbs/map/tencent/_com.json", {
  "name" : "ti-lbs-map-tencent",
  "globally" : true,
  "template" : "./ti-lbs-map-tencent.html",
  "mixins"   : ["./ti-lbs-map-tencent.mjs"],
  "components" : []
});
//============================================================
// JOIN: ti/lbs/map/ti-lbs-map.html
//============================================================
Ti.Preload("ti/com/ti/lbs/map/ti-lbs-map.html", `<div class="ti-lbs-map" 
  :class="topClass"
  :style="topStyle">
  <div class="map-con">
    <!--
      Map Main
    -->
    <div class="as-main">
      <component 
        :is="mapComType"
        v-bind="mapComConf"/>
    </div>
    <!--
      Map Info
    -->
    <div class="as-info">
      <div class="as-toggle" @click="fullScreen=!fullScreen">
        <ti-icon :value="toggleIcon"/>
      </div>
      <ul class="as-laln">
        <li><span>{{'lat'|i18n}}:</span><em>{{lalnCenter.lat|float(8)}}</em></li>
        <li><span>{{'lng'|i18n}}:</span><em>{{lalnCenter.lng|float(8)}}</em></li>
      </ul>
    </div>
  </div>
</div>`);
//============================================================
// JOIN: ti/lbs/map/ti-lbs-map.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  inheritAttrs : false,
  /////////////////////////////////////////
  data : ()=>({
    fullScreen : false
  }),
  /////////////////////////////////////////
  props : {
    "by" : {
      type : String,
      default : "tencent"
    },
    // @see https://lbs.qq.com/javascript_v2/doc/maptypeid.html
    // @see http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference_3_0.html#a5b0
    // ROADMAP | SATELLITE | HYBRID
    "mapType" : {
      type : String,
      default : "ROADMAP"
    },
    // Map center : {"lat":39.9042, "lng":116.4074}
    // If null, it will auto sync with the value
    "center" : {
      type : Object,
      // default : ()=>({
      //   {"lat":39.9042, "lng":116.4074}
      // })
      default : null
    },
    // Sometime, the lat/lng valued by integer
    // this prop defined how to translate them to float
    "autoFloat" : {
      type : Number,
      default : 10000000
    },
    // Map width
    "width" : {
      type : [String, Number],
      default : 400
    },
    // Map height
    "height" : {
      type : [String, Number],
      default : 400
    },
    "zoom" : {
      type : Number,
      default : 8
    },
    // The Coordinate System for input LatLng (center/value...)
    //  - WGS84 : Standard GPS 
    //  - BD09  : for Baidu Map
    //  - GCJ02 : (Mars) QQ/GaoDe/AliYun ...
    "coordinate" : {
      type : String,
      default : "WGS84"
    },
    // A LatLng Point in map, which react the changing
    "value" : {
      type : Object,
      default : null
    },
    // The layout which cover to the map
    // TODO think about it
    "layers" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //-------------------------------------
    topClass() {
      let klass = []
      if(this.fullScreen) {
        klass.push("is-fullscreen")
      }
      if(this.className) {
        klass.push(this.className)
      }
      return klass
    },
    //-------------------------------------
    topStyle() {
      if(!this.fullScreen) {
        return Ti.Css.toStyle({
          width  : this.width,
          height : this.height
        })
      }
    },
    //-------------------------------------
    toggleIcon() {
      return this.fullScreen
        ? "zmdi-fullscreen-exit"
        : "zmdi-fullscreen"
    },
    //-------------------------------------
    mapComType() {
      return `ti-lbs-map-${this.by}`
    },
    //-------------------------------------
    mapComConf() {
      return {
        "mapType" : this.mapType,
        "center"  : this.lalnCenter,
        "zoom"    : this.zoom,
        "value"   : this.lalnValue,
        "valueOptions" : this.valueOptions
      }
    },
    //-------------------------------------
    targetCoordinate() {
      return ({
        "tencent" : "GCJ02",
        "baidu"   : "BD09",
        "ali"     : "GCJ02"
      })[this.by] || "WGS84"
    },
    //-------------------------------------
    arenaStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //-------------------------------------
    lalnValue() {
      if(!_.isEmpty(this.center)) {
        return this.genLatLng(this.center)
      }
      if(!_.isEmpty(this.value)) {
        return this.genLatLng(this.value)
      }
      // Default center to beijing
      return new qq.maps.LatLng({lat:39.9042, lng:116.4074})
    },
    //-------------------------------------
    lalnCenter() {
      if(!_.isEmpty(this.center)) {
        return this.genLatLng(this.center)
      }
      if(!_.isEmpty(this.value)) {
        return this.genLatLng(this.value)
      }
      // Default center to beijing
      return new qq.maps.LatLng({lat:39.9042, lng:116.4074})
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    autoLatLng(val) {
      if(val > 360) {
        return val / this.autoFloat
      }
      return val
    },
    //-------------------------------------
    genLatLng({lat, lng}={}) {
      lat = this.autoLatLng(lat)
      lng = this.autoLatLng(lng)

      // Transform coordinate
      let from = this.coordinate
      let to   = this.targetCoordinate

      if(from == to) {
        return {lat, lng}
      }

      // find the trans-methods
      let methodName = `${from}_TO_${to}`

      // like `WGS84_TO_BD09` or `WGS84_TO_GCJ02`
      let fn = Ti.GPS[methodName]

      return fn(lat, lng)
    }
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/lbs/map/ti-lbs-map.mjs", _M);
})();
//============================================================
// JOIN: ti/lbs/map/_com.json
//============================================================
Ti.Preload("ti/com/ti/lbs/map/_com.json", {
  "name" : "ti-lbs-map",
  "globally" : true,
  "template" : "./ti-lbs-map.html",
  "mixins"   : ["./ti-lbs-map.mjs"],
  "components" : [
    "./tencent/_com.json",
    "./baidu/_com.json"
  ]
});
//============================================================
// JOIN: ti/list/com/list-row/list-row.html
//============================================================
Ti.Preload("ti/com/ti/list/com/list-row/list-row.html", `<div class="list-row"
  :class="TopClass">
  <!--current actived row indicator-->
  <div class="row-actived-indicator"></div>
  <!-- Indents -->
  <div v-for="n in indent"
  class="row-indent"></div>
  <!--ICON: Handler-->
  <template v-if="icon">
    <ti-icon
      v-if="hasRealIcon"
        class="row-icon"
        :value="icon"
        @click.native.left.stop="OnClickIcon"/>
    <div v-else
      class="row-icon"></div>
  </template>
  <!--ICON: Checker-->
  <ti-icon v-if="checkable"
      class="row-checker"
      :value="theCheckIcon"
      @click.native.left.stop="OnClickChecker"/>
  <!-- Content -->
  <div
    class="row-con"
    @click.left="OnClickRow"
    @dblclick.left="OnDblClickRow"
    v-ti-activable>
    <component 
      v-for="(it, index) in myDisplayItems"
        :class="'item-'+index"
        :key="it.uniqueKey"
        :is="it.comType"
        v-bind="it.comConf"
        @change="onItemChanged(it, $event)"/>
  </div>

</div>`);
//============================================================
// JOIN: ti/list/com/list-row/list-row.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    myDisplayItems : []
  }),
  ///////////////////////////////////////////////////
  props : {
    "indent" : {
      type : Number,
      default : 0
    },
    "icon" : {
      type : [Boolean, String],
      default : null
    },
    "display" : {
      type : Array,
      default : ()=>[]
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopClass() {
      return this.getListItemClass(`row-indent-${this.indent}`)
    },
    //-----------------------------------------------
    hasRealIcon() {
      return this.icon && _.isString(this.icon)
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    async evalMyDisplayItems() {
      let items = []
      // if(this.data && this.data.title && this.data.type) {
      //   console.log("evalCellDisplayItems", this.data)
      // }
      // Eval each items
      for(let displayItem of this.display) {
        let it = await this.evalDataForFieldDisplayItem({
            itemData : this.data, 
            displayItem, 
            vars : {
              "isCurrent" : this.isCurrent,
              "isChecked" : this.isChecked,
              "isChanged" : this.isChanged,
              "isActived" : this.isActived,
              "rowId"     : this.rowId
            }
        })
        if(it) {
          items.push(it)
        }
      }
      // Update and return
      this.myDisplayItems = items
    },
    //-----------------------------------------------
    onItemChanged({name,value}={}) {
      this.$notify("item:changed", {
        name, value,
        rowId : this.rowId,
        data  : this.data
      })
    },
    //-----------------------------------------------
    OnClickIcon($event) {
      this.$notify("icon", {
        rowId  : this.rowId,
        shift  : $event.shiftKey,
        toggle : ($event.ctrlKey || $event.metaKey)
      })
    },
    //--------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-list-row", uniqKey)
      if(!_.isEmpty(this.rowToggleKey)){
        if(this.isRowToggleKey(uniqKey)) {
          this.onClickChecker({})
          return {prevent:true, stop:true, quit:true}
        }
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "display" : async function() {
      await this.evalMyDisplayItems()
    },
    "data" : async function() {
      //console.log("data changed")
      await this.evalMyDisplayItems()
    },
    "isCurrent" : async function() {
      await this.evalMyDisplayItems()
    },
    "isChecked" : async function() {
      await this.evalMyDisplayItems()
    }
  },
  ///////////////////////////////////////////////////
  mounted : async function() {
    await this.evalMyDisplayItems()
  }
  ///////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/list/com/list-row/list-row.mjs", _M);
})();
//============================================================
// JOIN: ti/list/com/list-row/_com.json
//============================================================
Ti.Preload("ti/com/ti/list/com/list-row/_com.json", {
  "name" : "list-row",
  "globally" : false,
  "template" : "./list-row.html",
  "methods"  : "@com:ti/support/field_display.mjs",
  "mixins" : [
    "@com:ti/support/list_item_mixins.mjs",
    "./list-row.mjs"]
});
//============================================================
// JOIN: ti/list/ti-list.html
//============================================================
Ti.Preload("ti/com/ti/list/ti-list.html", `<div class="ti-list"
  :class="TopClass"
  @click="OnClickTop"
  v-ti-activable>
  <!--
    Blank
  -->
  <div
    v-if="isDataEmpty"
      class="ti-blank is-big">
      <ti-loading v-bind="blankAs"/>
  </div>
  <!--
    Show Items
  -->
  <template v-else>
    <list-row
      v-for="row in TheData"
        :key="row.id"
        :row-id="row.id"
        :index="row.index"
        :icon="row.icon"
        :indent="row.indent"
        :data="row.rawData"
        :display="DisplayItems"
        :current-id="theCurrentId"
        :checked-ids="theCheckedIds"
        :changed-id="changedId"
        :checkable="checkable"
        :selectable="selectable"
        :openable="openable"
        :row-toggle-key="TheRowToggleKey"
        :class-name="itemClassName"
        @checker="OnRowCheckerClick"
        @select="OnRowSelect"
        @open="OnRowOpen"/>
  </template>
</div>`);
//============================================================
// JOIN: ti/list/ti-list.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////
  data : ()=>({
    myData : [],
  }),
  //////////////////////////////////////////
  props : {
    "iconBy" : {
      type : [String, Function],
      default : null
    },
    "indentBy" : {
      type : [String, Function],
      default : null
    },
    "itemClassName" : undefined,
    "display" : {
      type : [Object, String, Array],
      default : ()=>({
        key : "..",
        comType : "ti-label"
      })
    },
    "border" : {
      type : Boolean,
      default : true
    },
    "autoScrollIntoView" : {
      type : Boolean,
      default : true
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-hoverable"    : this.hoverable,
        "show-border"     : this.border
      })
    },
    //--------------------------------------
    getRowIndent() {
      if(_.isFunction(this.indentBy)) {
        return it => this.indentBy(it)
      }
      if(_.isString(this.indentBy)) {
        return it => _.get(it, this.indentBy)
      }
      return it => 0
    },
    //--------------------------------------
    getRowIcon() {
      if(_.isFunction(this.iconBy)) {
        return it => this.iconBy(it)
      }
      if(_.isString(this.iconBy)) {
        return it => _.get(it, this.iconBy)
      }
      return it => null
    },
    //--------------------------------------
    DisplayItems() {
      let diss = _.concat(this.display)
      // Prepare the return list
      let items = []
      // Loop each items
      for(let dis of diss) {
        let item = this.evalFieldDisplayItem(dis, {
          funcSet: this.fnSet
        })
        if(item) {
          items.push(item)
        }
      }
      // Done
      return items
    },
    //--------------------------------------
    TheData() {
      return this.myData
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickTop($event) {
      if(this.cancelable) {
        // Click The body or top to cancel the row selection
        if(Ti.Dom.hasOneClass($event.target,
            'ti-list', 'list-item')) {
          this.cancelRow()
        }
      }
    },
    //--------------------------------------
    scrollCurrentIntoView() {
      if(this.autoScrollIntoView && this.myLastIndex>=0) {
        let [$first] = Ti.Dom.findAll(".list-row.is-current", this.$el)
        if($first) {
          let rect = Ti.Rects.createBy($first)
          let view = Ti.Rects.createBy(this.$el)
          if(!view.contains(rect)) {
            this.$el.scrollTop += rect.top - view.top
          }
        }
      }
    },
    //--------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-list", uniqKey)
      if("ARROWUP" == uniqKey) {
        this.selectPrevRow({
          payload: {byKeyboardArrow: true}
        })
        this.scrollCurrentIntoView()
        return {prevent:true, stop:true, quit:true}
      }

      if("ARROWDOWN" == uniqKey) {
        this.selectNextRow({payload:{byKeyboardArrow:true}})
        this.scrollCurrentIntoView()
        return {prevent:true, stop:true, quit:true}
      }
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "data" : {
      handler : async function(newVal, oldVal){
        let isSame = _.isEqual(newVal, oldVal)
        if(!isSame) {
          //console.log("!!!list data changed", {newVal, oldVal})
          this.myData = await this.evalData((it)=>{
            it.icon = this.getRowIcon(it.item)
            it.indent = this.getRowIndent(it.item)
          })
        }
      },
      immediate : true
    }
  },
  //////////////////////////////////////////
  mounted : function() {
    if(this.autoScrollIntoView) {
      this.$nextTick(()=>{
        this.scrollCurrentIntoView()
      })
    }
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/list/ti-list.mjs", _M);
})();
//============================================================
// JOIN: ti/list/_com.json
//============================================================
Ti.Preload("ti/com/ti/list/_com.json", {
  "name" : "ti-list",
  "globally" : true,
  "template" : "./ti-list.html",
  "props" : "@com:ti/support/list_props.mjs",
  "methods" : "@com:ti/support/field_display.mjs",
  "mixins" : [
    "@com:ti/support/list_mixins.mjs",
    "./ti-list.mjs"
  ],
  "components" : [
    "./com/list-row",
    "@com:ti/label"
  ]
});
//============================================================
// JOIN: ti/list/_hmaker.json
//============================================================
Ti.Preload("ti/com/ti/list/_hmaker.json", {
  "icon"   : "im-data",
  "title"  : "i18n:com-list",
  "screen" : ["desktop", "tablet"],
  "manual" : true,
  "tutorial" : true,
  "video" : true,
  "editComType" : "ti-form",
  "editComConf" : {
    "fields" : []
  }
});
//============================================================
// JOIN: ti/loading/ti-loading.html
//============================================================
Ti.Preload("ti/com/ti/loading/ti-loading.html", `<div class="ti-loading">
    <div class="tl-con">
        <ti-icon :value="icon"/>
        <span>{{text|i18n}}</span>
    </div>
</div>`);
//============================================================
// JOIN: ti/loading/ti-loading.mjs
//============================================================
(function(){
const _M = {
  props : {
    icon : {
      type : String,
      default : "fas-spinner fa-spin"
    },
    text : {
      type : String,
      default : "i18n:loading"
    }
  }
}
Ti.Preload("ti/com/ti/loading/ti-loading.mjs", _M);
})();
//============================================================
// JOIN: ti/loading/_com.json
//============================================================
Ti.Preload("ti/com/ti/loading/_com.json", {
  "name" : "ti-loading",
  "globally" : true,
  "template" : "./ti-loading.html",
  "mixins" : ["./ti-loading.mjs"]
});
//============================================================
// JOIN: ti/media/binary/ti-media-binary.html
//============================================================
Ti.Preload("ti/com/ti/media/binary/ti-media-binary.html", `<div class="ti-media-binary">
  <div class="tob-icon">
    <ti-icon v-if="icon" :value="icon" size="1.28rem"/>
  </div>
  <div class="tob-title">
    {{title}}
  </div>
  <div class="tob-actions">
    <a :href="src">
      <ti-icon value="download"/>
      <span>{{'download'|i18n}}</span>
    </a>
  </div>
</div>`);
//============================================================
// JOIN: ti/media/binary/ti-media-binary.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  props : {
    "icon" : {
      type : [String, Object],
      default : null
    },
    "title" : {
      type : String,
      default : null
    },
    "src" : {
      type : String,
      default : null
    },
    "width" : {
      type : [String, Number],
      default : ""
    },
    "height" : {
      type : [String, Number],
      default : ""
    }
  },
  computed : {
    
  },
  methods : {
    
  }
}
Ti.Preload("ti/com/ti/media/binary/ti-media-binary.mjs", _M);
})();
//============================================================
// JOIN: ti/media/binary/_com.json
//============================================================
Ti.Preload("ti/com/ti/media/binary/_com.json", {
  "name" : "ti-media-binary",
  "globally" : true,
  "template" : "./ti-media-binary.html",
  "mixins" : ["./ti-media-binary.mjs"]
});
//============================================================
// JOIN: ti/media/image/ti-media-image.html
//============================================================
Ti.Preload("ti/com/ti/media/image/ti-media-image.html", `<div class="ti-media-image" 
     :class="topClass"
     :style="topStyle"
     :fit-mode="fitMode"
     v-drag-off>
  <div class="as-con" ref="con">
    <img ref="the_image"
      :src="src"
      :style="theImageStyle"
      @load="onImageLoaded"
      @dblclick.stop="onToggleImageFitMode">
  </div>
</div>`);
//============================================================
// JOIN: ti/media/image/ti-media-image.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////
  inheritAttrs : false,
  ///////////////////////////////////
  data: ()=>({
    naturalWidth  : -1,
    naturalHeight : -1,
    viewportWidth  : -1,
    viewportHeight : -1,
    fitMode  : "contain",
    imgLoading : true,
    inViewport : false
  }),
  ///////////////////////////////////
  props : {
    "src" : {
      type : String,
      default : null
    },
    "width" : {
      type : [String, Number],
      default : ""
    },
    "height" : {
      type : [String, Number],
      default : ""
    }
  },
  ///////////////////////////////////
  computed : {
    topClass() {
      return Ti.Css.mergeClassName({
        "as-fitmode-cover"   : this.fitMode=="cover",
        "as-fitmode-contain" : this.fitMode=="contain",
        "is-img-loading" : this.imgLoading,
        "is-in-viewport" : this.inViewport
      }, this.className)
    },
    topStyle() {
      return {
        width  : this.width, 
        height : this.height
      }
    },
    theImageStyle() {
      let css = {
        "visibility" : "hidden",
        "position"   : "relative"
      }
      // If ready, then resize to zoom
      if(this.naturalWidth > 0
        && this.naturalHeight > 0) {
        // Get the measure of viewport
        let viewport = Ti.Rects.create({
          top:0, left:0,
          width  : this.viewportWidth,
          height : this.viewportHeight
        })
        // Get the measure of image
        let r_img = Ti.Rects.create({
          top:2, left:2,
          width  : this.naturalWidth,
          height : this.naturalHeight
        })
        // Zoom it
        let r_im2 = r_img.zoomTo({
          width  : viewport.width, 
          height : viewport.height,
          mode   : this.fitMode
        })
        // mark
        this.inViewport = viewport.contains(r_im2, 2)
        // append to css
        css.width  = r_im2.width
        css.height = r_im2.height
        css.left = (viewport.width  - r_im2.width)  / 2
        css.top  = (viewport.height - r_im2.height) / 2
        css.visibility = "visible"
      }
      // done
      return Ti.Css.toStyle(css)
    }
  },
  ///////////////////////////////////
  methods : {
    onImageLoaded() {
      let $img = this.$refs.the_image
      if($img) {
        this.naturalWidth  = $img.naturalWidth
        this.naturalHeight = $img.naturalHeight
        this.imgLoading = false
      }
    },
    onResizeViewport() {
      let r_vpt = Ti.Rects.createBy(this.$refs.con)
      this.viewportWidth  = r_vpt.width
      this.viewportHeight = r_vpt.height
    },
    onToggleImageFitMode() {
      this.fitMode = ({
        "contain" : "cover",
        "cover"   : "contain"
      })[this.fitMode]
    }
  },
  ///////////////////////////////////
  mounted : function(){
    Ti.Viewport.watch(this, {resize : ()=>{
      this.onResizeViewport()
    }})
    this.onResizeViewport()
  },
  ///////////////////////////////////
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
  ///////////////////////////////////
}
Ti.Preload("ti/com/ti/media/image/ti-media-image.mjs", _M);
})();
//============================================================
// JOIN: ti/media/image/_com.json
//============================================================
Ti.Preload("ti/com/ti/media/image/_com.json", {
  "name" : "ti-media-image",
  "globally" : true,
  "template" : "./ti-media-image.html",
  "mixins" : ["./ti-media-image.mjs"]
});
//============================================================
// JOIN: ti/media/video/ti-media-video.html
//============================================================
Ti.Preload("ti/com/ti/media/video/ti-media-video.html", `<div class="ti-media-video"
    :class="topClass"
    :style="topStyle"
    v-drag-off>
    <video ref="the_video"
      :src="src"
      controls
      @loadeddata="onVideoLoaded"/>
    <div class="tov-loading" v-if="loading">
      <ti-loading/>
    </div>
</div>`);
//============================================================
// JOIN: ti/media/video/ti-media-video.mjs
//============================================================
(function(){
const resize = function(evt){
  this.doResizeVideo()
}
//-----------------------------------
const _M = {
  inheritAttrs : false,
  data: ()=>({
    naturalWidth  : -1,
    naturalHeight : -1,
    fitMode  : "none",
    loading : true
  }),
  props : {
    "src" : {
      type : String,
      default : null
    },
    "width" : {
      type : [String, Number],
      default : ""
    },
    "height" : {
      type : [String, Number],
      default : ""
    }
  },
  computed : {
    topClass() {
      return {
        "as-none"    : this.fitMode=="none",
        "as-contain" : this.fitMode=="contain",
        "as-loading" : this.loading
      }
    },
    topStyle() {
      return {
        width  : this.width, 
        height : this.height
      }
    }
  },
  methods : {
    onVideoLoaded() {
      let $video = this.$refs.the_video
      this.naturalWidth  = $video.videoWidth
      this.naturalHeight = $video.videoHeight
      //console.log(this.naturalWidth, this.naturalHeight)
      this.loading = false
      //$video.volume = 1
      this.doResizeVideo()
    },
    isContainsByViewport() {
      // Get the viewport
      let vpRect = Ti.Rects.createBy(this.$el)
      let imRect = Ti.Rects.create({
        ...vpRect.raw("tl"),
        width  : this.naturalWidth,
        height : this.naturalHeight
      })
      // console.log("vpRect", vpRect.toString())
      // console.log("imRect", imRect.toString())
      return vpRect.contains(imRect)
    },
    doResizeVideo() {
      // Image is in viewport
      if(this.isContainsByViewport()) {
        this.fitMode = "none"
      }
      // Image is too big, mark "cover"
      else {
        this.fitMode = "contain"
      }
    },
  },
  mounted : function(){
    Ti.Viewport.watch(this, {resize})
  },
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
}
Ti.Preload("ti/com/ti/media/video/ti-media-video.mjs", _M);
})();
//============================================================
// JOIN: ti/media/video/_com.json
//============================================================
Ti.Preload("ti/com/ti/media/video/_com.json", {
  "name" : "ti-media-video",
  "globally" : true,
  "template" : "./ti-media-video.html",
  "mixins" : ["./ti-media-video.mjs"]
});
//============================================================
// JOIN: ti/month/ti-month.html
//============================================================
Ti.Preload("ti/com/ti/month/ti-month.html", `<div class="ti-col-data as-month" 
  :class="topClass" 
  :style="topStyle">
  <ti-list v-for="list in theListGroup"
    :key="list.key"
    :data="list.data"
    :display="'text'"
    :current-id="list.currentId"
    :cancelable="false"
    @select="onListSelected(list.key, $event)"/>
</div>`);
//============================================================
// JOIN: ti/month/ti-month.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "value" : {
      type : [String, Number, Date],
      default : null
    },
    // the height of drop list
    "height" : {
      type : [Number, String],
      default : 200
    },
    "beginYear" : {
      type : [Number, String],
      default : 1970
    },
    "endYear" : {
      type : [Number, String],
      default : (new Date().getFullYear()+1)
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    topStyle() {
      return {
        "height" : Ti.Css.toSize(this.height)
      }
    },
    //------------------------------------------------
    theDate() {
      return Ti.Types.toDate(this.value, null)
    },
    //------------------------------------------------
    theListGroup() {
      return [
        this.createList("year",  
          this.beginYear*1, 
          this.endYear*1,
          this.theDate ? this.theDate.getFullYear() : null,
          {reverse:true}
        ),
        this.createList("month",
          0,
          12,
          this.theDate ? this.theDate.getMonth() : null,
          {getText: (val)=>{
            let abbr = Ti.DateTime.getMonthAbbr(val)
            return Ti.I18n.get(abbr)
          }}
        )
      ]
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    createList(key, fromVal, toVal, currentVal, {
      reverse=false,
      getText=(val)=>val
    }={}) {
      let list = {
        key,
        currentId : `R-${currentVal}`,
        data  : []
      }
      for(let i=fromVal; i<toVal; i++) {
        list.data.push({
          id : `R-${i}`,
          value : i,
          text  : getText(i)
        })
      }
      if(reverse) {
        list.data.reverse()
      }
      return list
    },
    //------------------------------------------------
    onListSelected(key, {current}={}) {
      let val = _.get(current, "value") || 0

      let theDate = this.theDate || new Date()

      let d = ({
        "month" : (m)=>{
          return new Date(theDate.getFullYear(), m)
        },
        "year" : (y)=>{
          return new Date(y, theDate.getMonth())
        }
      })[key](val)

      this.$notify("change", d)
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/month/ti-month.mjs", _M);
})();
//============================================================
// JOIN: ti/month/_com.json
//============================================================
Ti.Preload("ti/com/ti/month/_com.json", {
  "name" : "ti-month",
  "globally" : true,
  "template" : "./ti-month.html",
  "mixins" : ["./ti-month.mjs"],
  "components" : ["@com:ti/list"]
});
//============================================================
// JOIN: ti/obj/creation/ti-obj-creation.html
//============================================================
Ti.Preload("ti/com/ti/obj/creation/ti-obj-creation.html", `<div class="ti-obj-creation">
  <div class="toc-types"
    v-if="hasTypes">
    <ul>
      <li v-if="freeCreate"
        @click="setCurrentType(null)">
        <span class="ti-icon"></span>
        <span class="ti-text">{{'toc-auto-type'|i18n}}</span>
      </li>
      <li v-for="tp of types"
        :class="getTypeItemClassName(tp)"
        @click="setCurrentType(tp)">
        <ti-icon :value="tp.icon"/>
        <span class="ti-text">{{tp.text}}</span>
        <em v-if="'DIR' != tp.race">(*.{{tp.name}})</em>
      </li>
    </ul>
  </div>
  <div class="toc-main">
    <div v-if="hasCurrentType"
      class="toc-info">
      <div class="toc-thumb">
        <ti-icon :value="currentType.thumb"/>
      </div>
      <div class="toc-text">{{currentType.text}}</div>
      <div v-if="!currentIsDir"
        class="toc-name">*.{{currentType.name}}</div>
      <div class="toc-brief"
        v-if="currentType.brief">{{currentType.brief}}</div>
    </div>
    <div v-else
      class="toc-free">
      <span>{{'toc-free'|i18n}}</span>
    </div>
    <div class="toc-input">
      <input
        ref="input" 
        :value="value.name"
        :placeholder="'toc-tip'|i18n" 
        @change="onChange" 
        spellcheck="false">
    </div>
  </div>
</div>`);
//============================================================
// JOIN: ti/obj/creation/ti-obj-creation.mjs
//============================================================
(function(){
const _M = {
  props : {
    "types" : {
      type : Array,
      default : ()=>[]
    },
    "value" : {
      type : Object,
      default : ()=>({
        name : "",
        type : "",
        race : ""
      })
    },
    "trimed" : {
      type : Boolean,
      default : true
    },
    "freeCreate" : {
      type : Boolean,
      default : false
    }
  },
  computed : {
    hasTypes() {
      return !_.isEmpty(this.types)
    },
    currentIsDir(){
      return 'DIR' == this.value.race
    },
    hasCurrentType() {
      return this.value.type && this.value.race
    },
    currentType() {
      for(let tp of this.types) {
        if(tp.name == this.value.type){
          return tp
        }
      }
    }
  },
  methods : {
    isCurrent(tp) {
      return this.value.type == tp.name
    },
    getTypeItemClassName(tp) {
      if(this.isCurrent(tp)){
        return "as-current"
      }
      return ""
    },
    setCurrentType(tp){
      if(tp) {
        this.value.type = tp.name
        this.value.race = tp.race
      } else {
        this.value.type = ""
        this.value.race = ""
      }
      this.onChange()
      this.$notify("input", this.value)
    },
    onChange() {
      let name = this.$refs.input.value
      if(this.trimed) {
        name = _.trim(name)
      }
      this.value.name = name

      if('DIR'!=this.value.race 
        && this.value.type
        && this.value.name){
        let suffix = `.${this.value.type}`
        if(!this.value.name.endsWith(suffix)){
          let majorName = Ti.Util.getMajorName(this.value.name)
          this.value.name = majorName + suffix
        }
      }

      this.$notify("input", this.value)
    }
  },
  mounted : function(){
    if(this.hasTypes) {
      this.setCurrentType(this.types[0])
    }
    this.$refs.input.focus()
  }
}
Ti.Preload("ti/com/ti/obj/creation/ti-obj-creation.mjs", _M);
})();
//============================================================
// JOIN: ti/obj/creation/_com.json
//============================================================
Ti.Preload("ti/com/ti/obj/creation/_com.json", {
  "name" : "ti-obj-creation",
  "globally" : true,
  "i18n" : "@i18n:ti-obj-creation",
  "template" : "./ti-obj-creation.html",
  "mixins" : ["./ti-obj-creation.mjs"]
});
//============================================================
// JOIN: ti/obj/thumb/ti-obj-thumb.html
//============================================================
Ti.Preload("ti/com/ti/obj/thumb/ti-obj-thumb.html", `<div class="ti-obj-thumb" 
    :class="TopClass">
  <!--
    Preview && Process Bar
  -->
  <header>
    <!--Preview Part-->
    <div class="as-preview">
      <!-- Local Image -->
      <template v-if="isLocalImage">
        <img ref="localImage" is-local-file>
      </template>
      <!-- Local File -->
      <template v-else-if="isLocalFile">
        <ti-icon :value="LocalFileIcon"/>
      </template>
      <!-- Remote Image -->
      <template v-else-if="'image'==preview.type">
        <img :src="preview.value">
      </template>
      <!-- Icon -->
      <template v-else>
        <ti-icon :value="preview"/>
      </template>
      <!--Badge-->
      <template v-if="badges">
        <div v-if="badges.NW" class="as-badge at-nw"><ti-icon :value="badges.NW"/></div>
        <div v-if="badges.NE" class="as-badge at-ne"><ti-icon :value="badges.NE"/></div>
        <div v-if="badges.SW" class="as-badge at-sw"><ti-icon :value="badges.SW"/></div>
        <div v-if="badges.SE" class="as-badge at-se"><ti-icon :value="badges.SE"/></div>
      </template>
    </div>
    <!--Process bar-->
    <div v-if="isShowProgress"
      class="as-progress ti-progress-bar">
      <span class="bar-tip">{{ProgressTip}}</span>
      <b class="bar-outer">
        <em class="bar-inner" 
            :style="ProgressStyle"></em>
      </b>
    </div>
  </header>
  <!--
    Status Mask
  -->
  <section class="as-status" v-if="status">
    <ti-icon 
      :value="status"
      font-size="2em"
      width="3em"
      height="3em"/>
  </section>
  <!--
    Footer for item title text
  -->
  <footer v-if="showFooter">
    <div class="as-title">
      <a v-if="hasHref"
        :href="TheHref"
        @click.prevent>{{title}}</a>
      <span v-else>{{title}}</span>
    </div>
  </footer>
</div>`);
//============================================================
// JOIN: ti/obj/thumb/ti-obj-thumb.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////
  props : {
    index : {
      type : Number,
      default : -1
    },
    id : {
      type : String,
      default : null
    },
    // The text to present the object
    title : {
      type : String,
      default : null
    },
    // The URL of thumb
    preview : {
      type : [String, Object],
      default : "broken_image"
    },
    href : {
      type : String,
      default : null
    },
    status : {
      type : [String, Object],
      default : null
    },
    progress : {
      type : Number,
      default : -1
    },
    visibility : {
      type : String,
      default : "show"  // `show|weak|hide`
    },
    // true - alwasy show the footer part
    showFooter : {
      type : Boolean,
      default : true
    },
    badges : {
      type : Object,
      default: ()=>({
        "NW" : null,
        "NE" : null,
        "SW" : null,
        "SE" : null
      })
    }
  },
  ////////////////////////////////////////////////
  watch : {
    "preview" : function() {
      this.renderLocalFile()
    }
  },
  ////////////////////////////////////////////////
  computed : {
    //--------------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-hide" : ('hide' == this.visibility),
        "is-weak" : ('weak' == this.visibility)
      }, ()=>this.status ? `is-status-${this.status}` : null)
    },
    //--------------------------------------------
    PreviewType() {
      return _.get(this.preview, "type") || "auto"
    },
    //--------------------------------------------
    isLocalFile() {
      return "localFile" == this.PreviewType
    },
    //--------------------------------------------
    isLocalImage() {
      return this.isLocalFile
        && /^image\//.test(this.LocalFile.type)
    },
    //--------------------------------------------
    LocalFile() {
      if(this.isLocalFile) {
        return this.preview.value
      }
    },
    //--------------------------------------------
    LocalFileIcon() {
      if(this.isLocalFile) {
        let file = this.LocalFile
        let oF = {
          type : Ti.Util.getSuffixName(file.name),
          mime : file.type,
          race : Ti.Util.isNil(file.type) ? "DIR" : "FILE"
        }
        return Ti.Icons.get(oF)
      }
    },
    //--------------------------------------------
    isShowProgress() {
      return this.progress>=0;
    },
    //--------------------------------------------
    ProgressTip() {
      return Ti.S.toPercent(this.progress, {fixed:1, auto:false})
    },
    //--------------------------------------------
    ProgressStyle() {
      return {width:this.ProgressTip}
    },
    //--------------------------------------------
    hasHref() {
      return this.href ? true : false
    },
    //--------------------------------------------
    TheHref() {
      return encodeURI(this.href)
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  methods : {
    //--------------------------------------------
    renderLocalFile() {
      //console.log(this.LocalFile)
      if(this.isLocalImage) {
        let reader = new FileReader();
        reader.onload = (evt)=>{
          if(this.$refs.localImage) {
            this.$refs.localImage.src = evt.target.result
          }
        }
        reader.readAsDataURL(this.preview.value);
      }
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  mounted : function(){
    this.renderLocalFile()
  }
  ////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/obj/thumb/ti-obj-thumb.mjs", _M);
})();
//============================================================
// JOIN: ti/obj/thumb/_com.json
//============================================================
Ti.Preload("ti/com/ti/obj/thumb/_com.json", {
  "name" : "ti-obj-thumb",
  "globally" : true,
  "template" : "./ti-obj-thumb.html",
  "mixins" : ["./ti-obj-thumb.mjs"]
});
//============================================================
// JOIN: ti/obj/tile/ti-obj-tile.html
//============================================================
Ti.Preload("ti/com/ti/obj/tile/ti-obj-tile.html", `<div class="ti-obj-tile" 
    :class="topClass">
  <!--
    Preview Image
  -->
  <div class="as-preview">
    <a v-if="hasHref"
      :href="href"
      @click="onClick"
      ><ti-icon 
        :value="preview"
        :height="previewHeight"/></a>
    <ti-icon v-else
      :value="preview"
      :height="previewHeight"/>
  </div>
  <!--
    Title
  -->
  <div class="as-title">
    <a v-if="hasHref"
      :href="href"
      @click="onClick"
    >{{title}}</a>
    <!--
      Without Href
    -->
    <span v-else>{{title}}</span>
  </div>
  <!--
    Footer
  -->
  <div v-if="hasBrief"
    class="as-brief">
    <span>{{brief}}</span>
  </div>
</div>`);
//============================================================
// JOIN: ti/obj/tile/ti-obj-tile.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////
  props : {
    "index" : {
      type : Number,
      default : -1
    },
    "id" : {
      type : String,
      default : null
    },
    // The URL of thumb
    "preview" : {
      type : [Object, String],
      default : ()=>({
        type : "font",
        value : "broken_image"
      })
    },
    // The preview part height
    "previewHeight" : {
      type : [String, Number],
      default : null
    },
    "hover" : {
      type : String,
      default : null,
      validator : function(val) {
        return !val || /^(up|down|left|right|zoom)$/.test(val)
      }
    },
    // The text to present the object
    "title" : {
      type : String,
      default : null
    },
    "href" : {
      type : String,
      default : null
    },
    // true - alwasy show the footer part
    "brief" : {
      type : String,
      default : null
    },
    "emitBy" : {
      type : Object,
      default : ()=>({
        evantName : null,
        payload : {}
      })
    }
  },
  ////////////////////////////////////////////////
  computed : {
    topClass() {
      let klass =[this.className]
      if(this.hover) {
        klass.push("on-hover")
        klass.push(`on-hover-${this.hover}`)
      }
      return klass
    },
    hasHref() {
      return this.href ? true : false
    },
    hasBrief() {
      return this.brief ? true : false
    }
  },
  ////////////////////////////////////////////////
  methods : {
    //--------------------------------------------
    onClick(evt) {
      // Prevent default and emit event
      if(this.emitBy.eventName) {
        evt.preventDefault()
        let eventName = this.emitBy.eventName
        let payload = this.emitBy.payload || {}
        //............................
        console.log("onClick", eventName, payload)
        this.$notify(eventName, payload)
      }
    }
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/obj/tile/ti-obj-tile.mjs", _M);
})();
//============================================================
// JOIN: ti/obj/tile/_com.json
//============================================================
Ti.Preload("ti/com/ti/obj/tile/_com.json", {
  "name" : "ti-obj-tile",
  "globally" : true,
  "template" : "./ti-obj-tile.html",
  "mixins" : ["./ti-obj-tile.mjs"]
});
//============================================================
// JOIN: ti/paging/jumper/ti-paging-jumper.html
//============================================================
Ti.Preload("ti/com/ti/paging/jumper/ti-paging-jumper.html", `<div class="ti-paging-jumper">
  <div 
    class="pj-btn"
    :class="getBtnClass(1)"
    @click="OnJumpTo(1)">
      <ti-icon value="zmdi-skip-previous"/>
      <span class="it-text">{{'paging-first'|i18n}}</span></div>
  <div 
    class="pj-btn"
    :class="getBtnClass(value.pn-1)"
    @click="OnJumpTo(value.pn-1)">
      <ti-icon value="zmdi-chevron-left"/>
      <span class="it-text">{{'paging-prev'|i18n}}</span></div>
  <div 
    class="pj-current"
    :class="PageNumberClass"
    @click="OnClickCurrent">
    <b>{{value.pn}}</b>
  </div>
  <div 
    class="pj-btn"
    :class="getBtnClass(value.pn+1)"
    @click="OnJumpTo(value.pn+1)">
      <span class="it-text">{{'paging-next'|i18n}}</span>
      <ti-icon value="zmdi-chevron-right"/></div>
  <div 
    class="pj-btn"
    :class="getBtnClass(value.pgc)"
    @click="OnJumpTo(value.pgc)">
      <span class="it-text">{{'paging-last'|i18n}}</span>
      <ti-icon value="zmdi-skip-next"/></div>
  <div
    class="pj-sum"
    :class="SumClass"
    @click="OnClickSum">{{'paging-sum'|i18n(value)}}</div>
</div>`);
//============================================================
// JOIN: ti/paging/jumper/ti-paging-jumper.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////
  props : {
    "value" : {
      type : Object,
      default : ()=>({
        pn : 0,     // Page Number
        pgsz : 0,   // PageSize
        pgc : 0,    // page count
        sum : 0,    // Total
        count : 0   // Record in page
      })
    }
  },
  ///////////////////////////////////////////
  computed : {
    PageNumberClass() {
      return this.value.pgc > 1
              ? "is-enabled"
              : "is-disabled"
    },
    SumClass() {
      return this.value.pgsz > 0
              ? "is-enabled"
              : "is-disabled"
    }
  },
  ///////////////////////////////////////////
  methods : {
    //--------------------------------------
    isInvalidPageNumber(pageNumber) {
      return pageNumber <=0 
        || pageNumber > this.value.pgc
        || pageNumber == this.value.pn
    },
    //--------------------------------------
    getBtnClass(pageNumber) {
      if(this.isInvalidPageNumber(pageNumber)) {
        return "is-disabled"
      }
      return "is-enabled"
    },
    //--------------------------------------
    OnJumpTo(pageNumber) {
      if(!this.isInvalidPageNumber(pageNumber)) {
        this.$notify("change", {
          pn   : pageNumber, 
          pgsz : this.value.pgsz
        })
      }
    },
    //--------------------------------------
    async OnClickCurrent() {
      // No Necessary
      if(this.value.pgc <= 1)
        return
      // Ask new pageNumber
      let msg = Ti.I18n.getf("paging-change-pn", this.value)
      let str = await Ti.Prompt(msg, {
        value : this.value.pn
      })
      // NoChange
      if(!str || str == this.value.pn)
        return
      // verify the str
      let pn = parseInt(str)
      if(isNaN(pn) || pn<=0 || pn>this.value.pgc) {
        msg = Ti.I18n.getf("paging-change-pn-invalid", this.value)
        await Ti.Alert(msg, {
          title : "i18n:warn",
          type  : "warn",
          icon  : "im-warning",
          width : 420
        })
        return 
      }
      // 通知修改
      this.$notify("change", {
        pn   : pageNumber, 
        pgsz : this.value.pgsz
      })
    },
    //--------------------------------------
    async OnClickSum(){
      let msg = Ti.I18n.getf("paging-change-pgsz", this.value)
      let str = await Ti.Prompt(msg, {
        value : this.value.pgsz
      })
      // NoChange
      if(!str || str == this.value.pgsz)
        return
      // verify the str
      let pgsz = parseInt(str)
      if(isNaN(pgsz) || pgsz<=0) {
        await Ti.Alert("i18n:paging-change-pgsz-invalid", {
          title : "i18n:warn",
          type  : "warn",
          icon  : "im-warning",
          width : 420
        })
        return 
      }
      // 通知修改
      this.$notify("change:pgsz", pgsz)
      this.$notify("change", {
        pn   : 1, 
        pgsz : pgsz
      })
    }
  }
  ///////////////////////////////////////////
}
Ti.Preload("ti/com/ti/paging/jumper/ti-paging-jumper.mjs", _M);
})();
//============================================================
// JOIN: ti/paging/jumper/_com.json
//============================================================
Ti.Preload("ti/com/ti/paging/jumper/_com.json", {
  "name" : "ti-paging-jumper",
  "globally" : true,
  "template" : "./ti-paging-jumper.html",
  "mixins" : ["./ti-paging-jumper.mjs"]
});
//============================================================
// JOIN: ti/roadblock/ti-roadblock.html
//============================================================
Ti.Preload("ti/com/ti/roadblock/ti-roadblock.html", `<div class="ti-web-roadblock">
  <div class="as-main">
    <div v-if="icon" class="as-icon">
      <ti-icon :value="icon"/>
    </div>
    <div v-if="text" class="as-text">
      <span>{{text | i18n}}</span>
    </div>
  </div>
</div>`);
//============================================================
// JOIN: ti/roadblock/ti-roadblock.mjs
//============================================================
(function(){
/***
 * In Building ....
 */
const _M = {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "icon" : {
      type: String,
      default: "fas-exclamation-triangle"
    },
    "text" : {
      type: String,
      default: null
    }
  },
  //////////////////////////////////////////
  computed : {
    
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/roadblock/ti-roadblock.mjs", _M);
})();
//============================================================
// JOIN: ti/roadblock/_com.json
//============================================================
Ti.Preload("ti/com/ti/roadblock/_com.json", {
  "name" : "ti-roadblock",
  "globally" : true,
  "template" : "./ti-roadblock.html",
  "mixins"   : ["./ti-roadblock.mjs"],
  "components" : []
});
//============================================================
// JOIN: ti/session/badge/ti-session-badge.html
//============================================================
Ti.Preload("ti/com/ti/session/badge/ti-session-badge.html", `<div class="ti-session-badge">
  <!--
    Has Session, show account info
  -->
  <template v-if="hasSession">
    <!--Avatar-->
    <div v-if="hasAvatar"
      class="as-avatar">
      <img :src="myAvatar"/>
    </div>
    <!--User Icon-->
    <div v-else
      class="as-icon">
      <ti-icon :value="myIcon"/>
    </div>
    <!--User Name-->
    <div class="as-name">{{myName}}</div>
    <!--Links-->
    <div v-for="li in theLinks"
      class="as-link">
      <!--Icon-->
      <ti-icon v-if="li.icon"
      class="it-icon"
      :value="li.icon"/>
      <!--Text-->
      <a @click.left="onClickLink(li, $event)"
        :href="li.href"
        :target="li.newtab?'_blank':null">
        {{li.text|i18n}}
      </a>
    </div>
  </template>
  <!--
    Without session, show login link
  -->
  <template v-else>
    <div v-if="loginIcon"
      class="as-icon">
      <ti-icon :value="loginIcon"/>
    </div>
    <div class="as-link">
      <a @click="$notify(loginEvent)">{{'login'|i18n}}</a>
    </div>
  </template>
</div>`);
//============================================================
// JOIN: ti/session/badge/ti-session-badge.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "me" : {
      type : Object,
      default : null
    },
    // Key to indicate Avatar existing
    // null - will not support avatar
    "avatarKey" : {
      type : String,
      default : null
    },
    // Avatar Source Template
    // null - will not support avatar
    "avatarSrc" : {
      type : String,
      default : null
    },
    "loginIcon" : {
      type : String,
      default : "zmdi-account-circle"
    },
    "nameKeys" : {
      type : [String, Array],
      default : "name"
    },
    "loginEvent" : {
      type : String,
      default : "do:login"
    },
    "logoutEvent" : {
      type : String,
      default : "do:logout"
    },
    /***
     * The customized link before `login/logout`.
     * 
     * ```
     * {
     *    icon   : "im-xxx",
     *    text   : "i18n:xxx",
     *    href   : "/path/to/uri"  // The <a href>
     *    newtab : false,        // if href, the open target
     *    emit   : "do:login"      // Mutex(href)
     *    inSession : true       // Show only in session
     * }
     * ```
     */
    "links" : {
      type : Array,
      default : ()=>[]
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
    //......................................
    theLinks() {
      let list = []
      //---------------------------
      // Join the links
      for(let li of this.links) {
        // Ignore out-of-session link
        if(li.inSession && !this.hasSession) {
          continue;
        }
        // Join
        list.push(li)
      }
      //---------------------------
      // Add the Login/Logout link
      if(this.hasSession) {
        list.push({
          text : "i18n:logout",
          emit : this.logoutEvent
        })
      }
      // Login 
      else {
        list.push({
          text : "i18n:login",
          emit : this.loginEvent
        })
      }
      //---------------------------
      return list
    },
    //......................................
    myName() {
      if(this.me) {
        return Ti.Util.getOrPick(this.me, this.nameKeys) 
               || Ti.I18n.get("mine")
      }
    },
    //......................................
    myIcon() {
      if(this.me) {
        if(2 == this.me.sex) {
          return "im-user-female"
        }
        return "im-user-male"
      }
      return "far-user"
    },
    //......................................
    myAvatar() {
      if(this.avatarSrc) {
        return Ti.S.renderBy(this.avatarSrc, this.me)
      }
    },
    //......................................
    hasAvatar() {
      return this.avatarSrc
        && this.avatarKey
        && this.me
        && this.me[this.avatarKey]
    },
    //......................................
    hasSession() {
      return this.me ? true : false
    }
    //......................................
  },
  //////////////////////////////////////////
  methods : {
    onClickLink(link, $event) {
      // Emit
      if(link.emit) {
        $event.preventDefault()
        this.$notify(link.emit)
      }
      // Href: do nothing
    }
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/session/badge/ti-session-badge.mjs", _M);
})();
//============================================================
// JOIN: ti/session/badge/_com.json
//============================================================
Ti.Preload("ti/com/ti/session/badge/_com.json", {
  "name" : "ti-session-badge",
  "globally" : true,
  "template" : "./ti-session-badge.html",
  "mixins" : ["./ti-session-badge.mjs"]
});
//============================================================
// JOIN: ti/support/field_display.mjs
//============================================================
(function(){
//////////////////////////////////////////////
function _render_iteratee({
  varName,
  vars, 
  matched
} = {}) {
  if(matched.startsWith("$$")) {
    return matched.substring(1)
  }
  // ${=xxx}  get value from vars
  // ${pos.x} get value from itemData
  let m = /^(=)?([^?]+)(\?(.*))?$/.exec(varName)
  let ctx = "=" == m[1]
    ? vars.vars
    : vars.itemData;
  
  let vkey = _.trim(m[2])
  let vdft = Ti.Util.fallbackNil(_.trim(m[4]), matched)
  let rev = Ti.Util.getOrPick(ctx, vkey)
  return Ti.Util.fallback(rev, vdft)
}
//////////////////////////////////////////////
// cx = {vars, itemData, value, $FuncSet}
function __eval_com_conf_item(val, cx={}) {
  // String valu3
  if(_.isString(val)) {
    //........................................
    // Function call
    //........................................
    let m = /^\(\)=>([^(]+)\(([^)]*)\)$/.exec(val)
    if(m) {
      let name = _.trim(m[1])
      let __as = _.trim(m[2])
      let args = Ti.S.joinArgs(__as, [], v => {
        return __eval_com_conf_item(v, cx)
      })
      let func = _.get(cx.$FuncSet, name)
      return func.apply(cx, args)
    }
    //........................................
    // Quick Value
    //........................................
    // VAL: evalue the special value, like:
    //  - "${=value}"
    //  - "${=..}"
    //  - "${=varName}"
    m = /^\$\{=([^${}=]+)\}$/.exec(val)
    if(m) {
      let varName = _.trim(m[1])
      // Whole Context
      if(".." == varName) {
        return cx.itemData
      }
      // Value
      if("value" == varName) {
        return cx.value
      }
      // In var set
      else {
        return Ti.Util.fallback(_.get(cx.vars, varName), val)
      }
    }
    //........................................
    // String Template
    //........................................
    // VAL as template (xxx)?xxx${nn}
    // the placeholder support:
    //  - "${=varName}"
    //  - "${info.age}"
    m = /^(\((.+)\)\?)?(.+)$/.exec(val)
    if(m){
      let preKey = _.trim(m[2])
      let tmpl = _.trim(m[3])
      //console.log("haha", preKey, tmpl)
      // Only `itemData` contains the preKey, render the value
      if(preKey) {
        // "(age)?xxx"  :: get from itemDAta
        if(_.get(cx.itemData, preKey)) {
          return Ti.S.renderBy(tmpl, cx, {
            iteratee: _render_iteratee
          })
        }
        return null
      }
      // Render the value
      return Ti.S.renderBy(tmpl, cx, {
        iteratee: _render_iteratee
      })
    }
    //........................................
    // Primary
    //........................................
    return val
  }
  // Object Value
  else if(_.isPlainObject(val)) {
    //........................................
    // Function Call
    //........................................
    // ... TODO maybe we dont need it
    // function call has bee supported in string mode
    //........................................
    // Nested Objects
    //........................................
    let obj = {}
    _.forEach(val, (v, k)=>{
      let v2 = __eval_com_conf_item(v, cx)
      if("..." == k) {
        _.assign(obj, v2)
      } else {
        obj[k] = v2
      }
    })
    return obj
  }
  // Array Value
  else if(_.isArray(val)) {
    let list = []
    for(let v of val) {
      let v2 = __eval_com_conf_item(v, cx)
      list.push(v2)
    }
    return list
  }
  // Keep original value
  return val
}
//////////////////////////////////////////////
const FieldDisplay = {
  //------------------------------------------
  evalFieldDisplayItem(displayItem={}, {
    funcSet, 
    defaultKey
  }={}){
    //........................................
    const __gen_dis = ()=>{
      //......................................
      // Guard it
      if(Ti.Util.isNil(displayItem)) {
        return defaultKey 
          ? { key:defaultKey, comType:"ti-label"}
          : null
      }
      //......................................
      // {key:"xxx", comType:"xxx"}
      if(_.isPlainObject(displayItem)){
        let dis = _.assign({
          key : defaultKey,
          comType : "ti-label",
        }, displayItem)
        if(dis.transformer) {
          const invokeOpt = {
            context: this,
            partialRight: true
          }
          dis.transformer = Ti.Util.genInvoking(dis.transformer, invokeOpt)
        }
        return dis
      }
      //......................................
      // Array to multi key
      if(_.isArray(displayItem)) {
        return {
          key : displayItem,
          comType : "ti-label",
        }
      }
      //......................................
      // Boolean
      if(true === displayItem) {
        return {
          key : defaultKey,
          comType : "ti-label",
        }
      }
      //......................................
      if(_.isString(displayItem)){
        // <icon:zmdi-user>
        let m = /^<([^:>=]*)(:([^>]+))?>$/.exec(displayItem)
        if(m) {
          return {
            key       : m[1] || defaultKey || ":ti-icon",
            defaultAs : m[3] || undefined,
            comType   : "ti-icon"
          }
        }
        //......................................
        // #DictName(xxx) -> ti-label
        // just like `#RelayStatus(status)`
        m = /^[@#]([^\(]+)\(([^)]+)\)$/.exec(displayItem)
        if(m) {
          return {
            key : m[2] || defaultKey,
            comType : "ti-label",
            comConf : {
              dict : m[1]
            }
          }
        }
        //......................................
        // "<=ti-label:key>" or ":<=ti-label>"
        m = /^<=([^:]+)(:(.+))?>$/.exec(displayItem)
        if(m) {
          return {
            key       : m[3] || defaultKey || Symbol(displayItem),
            comType   : m[1]
          }
        }
        //......................................
        // String -> ti-label
        // - "name" or ["name", "age"]
        // - "'Static Text'"
        // - "text+>/a/link?nm=${name}"
        // - "'More'->/a/link?id=${id}"
        m = /^([^+-]+)(([+-])>(.+))?$/.exec(displayItem)
        if(m) {
          let key  = _.trim(m[1] || m[0])
          let newTab = m[3] == "+"
          let href = _.trim(m[4])
          return {
            key,
            comType : "ti-label",
            comConf : {newTab, href}
          }
        }
        //......................................
      }
      //......................................
      return displayItem
    }
    //........................................
    let dis = __gen_dis()
    //........................................
    if(dis.dict) {
      let {name, vKey} = Ti.DictFactory.explainDictName(dis.dict)
      dis.$dict = Ti.DictFactory.CheckDict(name)
      dis.$dictValueKey = vKey || ".text"
    }
    //........................................
    // Save function set
    dis.$FuncSet = funcSet
    //........................................
    // Then return
    return dis
  },
  //------------------------------------------
  /***
   * @param itemData{Object} - raw data
   * @param displayItem{Object} - display item setting
   * @param vars{Object} - special value forms like:
   * ```js
   * {
   *   "isCurrent" : this.isCurrent,
   *   "isChecked" : this.isChecked,
   *   "isHover"   : this.isHover,
   *   "isActived" : this.isActived,
   *   "rowId"     : this.rowId
   * }
   * ```
   */
  async evalDataForFieldDisplayItem({
    itemData={}, 
    displayItem={}, 
    vars={},
    autoIgnoreNil=true,
    autoValue="value"
  }={}) {
    let dis = displayItem;
    // if("sex" == dis.key) 
    //   console.log(dis)
    let value = dis.defaultAs;
    //.....................................
    // Array -> Obj
    if(_.isArray(dis.key)) {
      value = _.pick(itemData, dis.key)
    }
    // String ...
    else if(_.isString(dis.key)){
      // Whole data
      if(".." == dis.key) {
        value = itemData
      }
      // Statci value
      else if(/^'[^']+'$/.test(dis.key)) {
        value = dis.key.substring(1, dis.key.length-1)
      }
      // Dynamic value
      else {
        value = Ti.Util.fallback(
          Ti.Util.getOrPick(itemData, dis.key),
          value
        )
      }
    }
    //.....................................
    // Transformer
    if(_.isFunction(dis.transformer)) {
      //console.log("do trans")
      // Sometimes, we need transform nil also
      if(!Ti.Util.isNil(value) || dis.transNil) {
        value = dis.transformer(value)
      }
    }
    // Ignore the undefined/null
    if(autoIgnoreNil && Ti.Util.isNil(value)) {
      if(Ti.Util.fallback(dis.ignoreNil, true)) {
        return
      }
    }
    //.....................................
    // Translate by dict
    if(dis.$dict) {
      value = await dis.$dict.getItemAs(dis.$dictValueKey, value)
    }
    //.....................................
    // Add value to comConf
    let reDisplayItem = _.cloneDeep(dis)
    let comConf = {};
    //.....................................
    // Customized comConf
    if(_.isFunction(dis.comConf)) {
      comConf = _.assign({}, dis.comConf(itemData))
    }
    //.....................................
    // Eval comConf
    else if(dis.comConf){
      comConf = __eval_com_conf_item(dis.comConf, {
        vars, 
        itemData, 
        value, 
        $FuncSet: dis.$FuncSet
      })
    }
    //.....................................
    // Set the default value key
    if(autoValue && _.isUndefined(comConf[autoValue])) {
      comConf[autoValue] = value
    }
    //.....................................
    reDisplayItem.comConf = comConf
    //.....................................
    reDisplayItem.uniqueKey = _.concat(
      reDisplayItem.key, reDisplayItem.comType).join("-")
    //.....................................
    return reDisplayItem
  }
  //------------------------------------------
}
//////////////////////////////////////////////
Ti.Preload("ti/com/ti/support/field_display.mjs", FieldDisplay);
})();
//============================================================
// JOIN: ti/support/formed_list_methods.mjs
//============================================================
(function(){
//////////////////////////////////////////
const _M = {
  //......................................
  isSelectedItem(it={}, {value=null, multi=false}={}) {
    if(multi) {
      return _.isArray(value) && _.indexOf(value, it.value) >= 0
    }
    return _.isEqual(value, it.value)
  },
  //......................................
  normalizeData(list=[], {
    emptyItem=null,
    multi=false,
    value=null,
    focusIndex=-1,
    mapping=null,
    defaultIcon=null,
    iteratee=null,
    defaultTipKey=null
  }={}) {
    //console.log("normalizeData", iteratee)
    let index = 0
    let reList = []
    //.........................................
    // Single mode, join the empty item
    if(!multi && emptyItem) {
      let emIt = _.cloneDeep(emptyItem)
      emIt.selected = 
        _.isUndefined(emIt.value)||_.isNull(emIt.value)
          ? _.isNull(value)
          : this.isSelectedItem(emIt, {value, multi})
      if(_.isFunction(iteratee))
        emIt = iteratee(emIt, index) || emIt
      reList.push(emIt)
      index++
    }
    //.........................................
    // Format the list
    let list2 = []
    if(_.isArray(list)) {
      let theMapping = mapping
        ? _.defaults({...mapping}, {
            icon     : "icon",
            text     : "text",
            value    : "value",
            tip      : "tip"
          })
        : null
      for(let it of list) {
        // Plain Object
        if(_.isPlainObject(it)) {
          let it2
          // Mapping
          if(theMapping) {
            it2 = Ti.Util.translate(it, theMapping)
          }
          // Clone
          else {
            it2 = _.cloneDeep(it)
          }
          // Apply Default Tip
          if(!it2.tip && defaultTipKey) {
            it2.tip = it[defaultTipKey]
          }
          // Join to list
          list2.push(it2)
        }
        // Simple value
        else {
          list2.push({
            icon  : defaultIcon,
            text  : Ti.Types.toStr(it),
            value : it
          })
        }
      }
    }
    //.........................................
    // Tidy it
    for(let i=0; i<list2.length; i++) {
      let li = list2[i]
      // Mark index
      li.index = i
      li.focused = (i == focusIndex)
      // Mark icon
      li.icon = li.icon || defaultIcon
      
      // decide select: by self
      li.selected = this.isSelectedItem(li, {value, multi})
      
      // Customized
      if(_.isFunction(iteratee)) {
        list2[i] = iteratee(li, i) || li
      }
    }
    //console.log(reList)
    return list2
  },
  //------------------------------------------------
  matchItemByKey(item={}, key="value", mode="equal", val) {
    let itemValue = item[key]
    // find method by mode
    let fnCall = ({
      "equal"   : ()=>_.isEqual(itemValue, val),
      "starts"  : ()=>_.startsWith(itemValue, val),
      "contains": ()=>{
        if(_.isString(itemValue)) {
          return itemValue.indexOf(val+"") >= 0
        }
        _.indexOf(itemValue, val)>=0
      },
    })[mode]
    // Do the invoking
    if(_.isFunction(fnCall)) {
      return fnCall()
    }
    return false
  },
  //------------------------------------------------
  findItemInList(str, {
    list = [], 
    matchValue = "equal",
    matchText  = "off"
  }={}) {
    if(_.isArray(list) && !_.isEmpty(list)) {
      for(let li of list) {
        if(this.matchItemByKey(li, "value", matchValue, str)) {
          return li
        }
        if(this.matchItemByKey(li, "text", matchText, str)) {
          return li
        }
      }
    }
    return null
  },
  //------------------------------------------------
  // multi  : Array
  // single : Number
  getSelectedItemIndex(formedList, {value=null, multi=false}={}) {
    let re = []
    let sls = {value, multi}
    for(let i=0; i<formedList.length; i++) {
      let li = formedList[i]
      if(this.isSelectedItem(li, sls)) {
        if(!this.multi)
          return i
        re.push(i)
      }
    }
    if(_.isEmpty(re) && !multi) {
      return -1
    }
    return re
  },
  //......................................
  // async tryReload({loaded=false, cached=true}={}){
  //   if(!loaded || !cached) {
  //     await this.reload()
  //     return
  //   }
  //   // Return the blank Promise
  //   return new Promise((resolve)=>{
  //     resolve()
  //   })
  // },
  // //......................................
  // async doReload(options=[], vars) {
  //   vars = Ti.Util.fallback(vars, this.value)
  //   let list = []
  //   // Dynamic value
  //   if(_.isFunction(options)) {
  //     list = await options(vars)
  //     if(!_.isArray(list)){
  //       return []
  //     }
  //   }
  //   // Static value
  //   else if(_.isArray(this.options)){
  //     list = [].concat(this.options)
  //   }
  //   return list
  // }
  //......................................
}
Ti.Preload("ti/com/ti/support/formed_list_methods.mjs", _M);
})();
//============================================================
// JOIN: ti/support/list_item_mixins.mjs
//============================================================
(function(){
const _M = {
  inject: ["$vars"],
  ///////////////////////////////////////////////////
  props : {
    "index" : {
      type : Number,
      default : -1
    },
    "rowId" : {
      type : String,
      default : null
    },
    "data" : null,
    "changedId" : {
      type : String,
      default : null
    },
    "currentId" : {
      type : String,
      default : null
    },
    "checkedIds" : {
      type : Object,
      default : ()=>({})
    },
    "checkable" : {
      type : Boolean,
      default : false
    },
    "selectable" : {
      type : Boolean,
      default : true
    },
    "openable" : {
      type : Boolean,
      default : true
    },
    "rowToggleKey" : {
      type : Array,
      default : ()=>[]
    },
    "checkIcons" : {
      type : Object,
      default : ()=>({
        on  : "fas-check-square",
        off : "far-square"
      })
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    getListItemClass() {
      return (...klass)=>this.getTopClass({
        "is-current" : this.isCurrent,
        "is-checked" : this.isChecked,
        "is-changed" : this.isChanged
      }, klass)
    },
    //-----------------------------------------------
    isCurrent() {
      return this.rowId == this.currentId
    },
    //-----------------------------------------------
    isChanged() {
      return this.rowId == this.changedId
    },
    //-----------------------------------------------
    isChecked() {
      return this.checkedIds[this.rowId] ? true : false
    },
    //-----------------------------------------------
    theCheckIcon() {
      if(this.checkedIds[this.rowId]) {
        return this.checkIcons.on
      }
      return this.checkIcons.off
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    isRowToggleKey(uniqKey) {
      return _.indexOf(this.rowToggleKey, uniqKey)>=0
    },
    //-----------------------------------------------
    OnClickChecker($event={}) {
      if(this.checkable) {
        this.$notify("checker", {
          rowId  : this.rowId,
          shift  : $event.shiftKey,
          toggle : ($event.ctrlKey || $event.metaKey)
        })
      }
    },
    //-----------------------------------------------
    OnClickRow($event={}) {
      let toggle = ($event.ctrlKey || $event.metaKey)
      if(this.selectable && (!this.isCurrent || !this.isChecked || toggle)) {
        this.$notify("select", {
          rowId  : this.rowId,
          shift  : $event.shiftKey,
          toggle
        })
      }
    },
    //-----------------------------------------------
    OnDblClickRow($event={}) {
      if(this.openable) {
        $event.stopPropagation()
        this.$notify("open", {
          rowId  : this.rowId
        })
      }
    },
    //-----------------------------------------------
    doAutoActived() {
      if(!this.isActived && this.isCurrent) {
        this.setActived()
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "isCurrent" : function() {
      this.doAutoActived()
    }
  },
  ///////////////////////////////////////////////////
  mounted : function() {
    this.doAutoActived()
  }
  ///////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/support/list_item_mixins.mjs", _M);
})();
//============================================================
// JOIN: ti/support/list_mixins.mjs
//============================================================
(function(){
const LIST_MIXINS = {
  ///////////////////////////////////////////////////
  provide : function(){
    return {
      "$vars" : this.vars || {}
    }
  },
  ///////////////////////////////////////////////////
  data : ()=>({
    myLastIndex: -1,      // The last row index selected by user
    myCurrentId: null,    // Current row ID
    myCheckedIds: {}      // Which row has been checked
  }),
  ///////////////////////////////////////////////////
  // props -> list_props.mjs
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopStyle() {
      let w = this.width
      let h = this.height
      return Ti.Css.toStyle({
        width  : w,
        height : h
      })
    },
    //-----------------------------------------------
    hasRowToggleKey() {
      return !_.isEmpty(this.rowToggleKey)
    },
    //-----------------------------------------------
    TheRowToggleKey() {
      return _.without(_.concat(this.rowToggleKey), undefined)
    },
    //-----------------------------------------------
    getRowId() {
      return Ti.Util.genRowIdGetter(this.idBy)
    },
    //-----------------------------------------------
    getRowData() {
      return Ti.Util.genRowDataGetter(this.rawDataBy)
    },
    //-----------------------------------------------
    isDataEmpty() {
      return !_.isArray(this.data) || _.isEmpty(this.data)
    },
    //-----------------------------------------------
    isAllChecked() {
      // Empty list, nothing checked
      if(this.isDataEmpty) {
        return false 
      }
      // Checking ...
      for(let row of this.TheData){
        if(!this.theCheckedIds[row.id])
          return false;  
      }
      return true
    },
    //-----------------------------------------------
    hasChecked() {
      for(let it of this.data){
        let itId = this.getRowId(it)
        if(this.theCheckedIds[itId])
          return true  
      }
      return false
    },
    //-----------------------------------------------
    theCurrentRowId() {
      return this.wrapRowId(this.currentId)
    },
    //-----------------------------------------------
    theCurrentId()  {
      return this.puppetMode 
              ? this.theCurrentRowId 
              : this.myCurrentId
    },
    //-----------------------------------------------
    theCheckedIds() {
      return this.puppetMode 
        ? this.getCheckedIdsMap(this.checkedIds)
        : this.myCheckedIds 
    },
    //-----------------------------------------------
    // fnSet() {
    //   return _.assign({}, Ti.GlobalFuncs(), this.extendFunctionSet)
    // },
    //-----------------------------------------------
    Dict() {
      if(this.dict) {
        // Already Dict
        if(this.dict instanceof Ti.Dict) {
          return this.dict
        }
        // Get back
        let {name} = Ti.DictFactory.explainDictName(this.dict)
        return Ti.DictFactory.CheckDict(name)
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    wrapRowId(rowId) {
      if(_.isNumber(rowId)){
        return ""+rowId
      }
      return rowId
    },
    //-----------------------------------------------
    async evalData(iteratee=_.identity) {
      let data = this.data
      //............................................
      // May need translate
      if(this.Dict) {
        // Query by value
        if(_.isString(data)) {
          data = await this.Dict.queryData(data)
        }
        // Check Each data item
        else if(_.isArray(data)) {
          let data2 = []
          for(let i=0; i<data.length; i++) {
            let it = data[i]
            // Check the real item
            if(_.isString(it)) {
              let it2 = await this.Dict.getItem(it)
              if(it2) {
                data2.push(it2)
              }
            }
            // Primary
            else {
              data2.push(it)
            }
          }
          data = data2
        }
        // All data of Dict
        else {
          data = await this.Dict.getData()
        }
      }
      //............................................
      // Then format the list
      let list = []
      _.forEach(data, (it, index)=>{
        let item = {
          index,
          id      : this.getRowId(it, index),
          rawData : this.getRowData(it),
          item : it
        }
        item = iteratee(item) || item
        // Join
        list.push(item)
      })
      //............................................
      return list
    },
    //-----------------------------------------------
    findRowIndexById(rowId) {
      for(let row of this.TheData) {
        if(row.id == rowId) {
          return row.index
        }
      }
      return -1
    },
    //-----------------------------------------------
    findRowById(rowId) {
      for(let row of this.TheData) {
        if(row.id == rowId) {
          return row
        }
      }
    },
    //------------------------------------------
    getCurrentRow(currentId=this.theCurrentId) {
      return this.findRowById(currentId)
    },
    //------------------------------------------
    getCurrent(currentId=this.theCurrentId) {
      let row = this.getCurrentRow(currentId)
      return row 
              ? row.rawData
              : null
    },
    //------------------------------------------
    getCheckedRow(idMap=this.theCheckedIds) {
      let list = []
      for(let row of this.TheData) {
        if(idMap[row.id]) {
          list.push(row)
        }
      }
      return list
    },
    //------------------------------------------
    getChecked(idMap=this.theCheckedIds) {
      let rows = this.getCheckedRow(idMap)
      return _.map(rows, row=>row.rawData)
    },
    //-----------------------------------------------
    getEmitContext(
      currentId, 
      checkedIds={}
    ) {
      let checked = []
      let current = null
      let currentIndex = -1
      for(let row of this.TheData) {
        if(row.id == currentId) {
          current = row.rawData
          currentIndex = row.index
        }
        if(checkedIds[row.id]) {
          checked.push(row.rawData)
        }
      }
      return {
        current, currentId, currentIndex,
        checked, checkedIds
      }
    },
    //-----------------------------------------------
    selectRow(rowId, {quiet=false, payload}={}) {
      let idMap = {}
      let curId = null
      
      // Change the current & checked
      if(this.autoCheckCurrent) {
        idMap = rowId ? {[rowId]:true} : {}
        curId = rowId || null
      }
      // Just change to current
      else {
        idMap = _.cloneDeep(this.myCheckedIds)
        curId = rowId
      }

      let emitContext = this.getEmitContext(curId, idMap)
      // Private Mode
      if(!this.puppetMode) {
        this.myCheckedIds = idMap
        this.myCurrentId  = curId
        this.myLastIndex  = this.findRowIndexById(rowId)
      }
      // Notify Changes
      if(!quiet) {
        _.defaults(emitContext, payload)
        this.$notify("select", emitContext)
      }
    },
    //-----------------------------------------------
    selectRowByIndex(rowIndex, options) {
      //console.log(rowIndex)
      let index = rowIndex
      if(this.scrollIndex) {
        index = Ti.Num.scrollIndex(rowIndex, this.TheData.length)
      }
      if(_.inRange(index, 0, this.TheData.length)) {
        let row = this.TheData[index]
        this.selectRow(row.id, options)
      }
    },
    //-----------------------------------------------
    selectPrevRow(options) {
      this.selectRowByIndex(Math.max(-1, this.myLastIndex-1), options)
    },
    //-----------------------------------------------
    selectNextRow(options) {
      this.selectRowByIndex(this.myLastIndex+1, options)
    },
    //-----------------------------------------------
    selectRowsToCurrent(rowId) {
      let idMap = _.cloneDeep(this.theCheckedIds)
      let curId = this.theCurrentId
      let index = this.findRowIndexById(rowId)
      if(index >= 0) {
        let fromIndex = Math.min(index, this.myLastIndex)
        let toIndex   = Math.max(index, this.myLastIndex)
        if(fromIndex < 0) {
          fromIndex = 0
        }
        for(let i=fromIndex; i<=toIndex; i++) {
          let row = this.TheData[i]
          idMap[row.id] = true
        }
        // Eval context
        let emitContext = this.getEmitContext(curId, idMap)
        // Private Mode
        if(!this.puppetMode) {
          this.myCheckedIds = idMap
          this.myCurrentId  = curId
          this.myLastIndex  = index
        }
        // Notify Changes
        this.$notify("select", emitContext)
      }
    },
    //-----------------------------------------------
    checkRow(rowId) {
      let idMap = _.cloneDeep(this.theCheckedIds)
      let curId = this.theCurrentId
      let index = this.myLastIndex
      // All rows
      if(_.isUndefined(rowId)) {
        idMap = {}
        _.forEach(this.TheData, (row)=>{
          idMap[row.id] = true
        })
      }
      // Multi rows
      else if(_.isArray(rowId)) {
        let lastRowId = _.last(rowId)
        _.forEach(rowId, (r_id)=>{
          idMap[r_id] = true
        })
        if(this.autoCheckCurrent) {
          index = this.findRowIndexById(lastRowId)
        }
      }
      // Single row
      else {
        idMap[rowId] = true
        if(this.autoCheckCurrent) {
          index = this.findRowIndexById(rowId)
        }
      }
      // Eval context
      let emitContext = this.getEmitContext(curId, idMap)
      // Private Mode
      if(!this.puppetMode) {
        this.myCheckedIds = idMap
        this.myCurrentId  = curId
        this.myLastIndex  = index
      }
      // Notify Changes
      this.$notify("select", emitContext)
    },
    //-----------------------------------------------
    cancelRow(rowId) {
      let idMap = _.cloneDeep(this.theCheckedIds)
      let curId  = this.theCurrentId
      let index = -1
      //console.log("cancelRow", rowId)
      if(_.isUndefined(rowId)) {
        idMap = {}
        curId = null
      }
      // Single row
      else {
        index = this.findRowIndexById(rowId)
        idMap[rowId] = false
        if(this.autoCheckCurrent && curId == rowId) {
          curId = null
        }
      }
      // Eval context
      let emitContext = this.getEmitContext(curId, idMap)
      // Private Mode
      if(!this.puppetMode) {
        this.myCheckedIds = idMap
        this.myCurrentId  = curId
        this.myLastIndex  = index
      }
      // Notify Changes
      this.$notify("select", emitContext)
    },
    //-----------------------------------------------
    toggleRow(rowId) {
      if(this.theCheckedIds[rowId]) {
        this.cancelRow(rowId)
      } else {
        this.checkRow(rowId)
      }
    },
    //-----------------------------------------------
    OnRowCheckerClick({rowId, shift}={}) {
      if(this.multi) {
        // Shift Mode
        if(shift) {
          this.selectRowsToCurrent(rowId)
        }
        // Simple Toggle Mode
        else {
          this.toggleRow(rowId)
        }
      }
      // Single Mode
      else {
        this.selectRow(rowId)
      }
    },
    //-----------------------------------------------
    OnRowSelect({rowId, shift, toggle}={}) {
      // Multi + Shift Mode
      if(shift && this.multi) {
        this.selectRowsToCurrent(rowId)
      }
      // Multi + Toggle Mode
      else if(toggle && this.multi) {
        this.toggleRow(rowId)
      }
      // Toggle Mode
      else if(!Ti.Util.isNil(rowId) && !this.autoCheckCurrent) {
        this.toggleRow(rowId)
      }
      // Single Mode
      else {
        this.selectRow(rowId)
      }
    },
    //-----------------------------------------------
    OnRowOpen({rowId}={}) {
      let row = this.findRowById(rowId)
      if(row) {
        this.$notify("open", row)
      }
    },
    //-----------------------------------------------
    getCheckedIdsMap(idList=[]) {
      let idMap = {}
      // ID List
      if(_.isArray(idList)) {
        _.forEach(idList, (rowId)=>{
          idMap[rowId] = true
        })
      }
      // Map
      else {
        _.forEach(idList, (checked, rowId)=>{
          if(checked) {
            idMap[rowId] = true
          }
        })
      }
      // Force to check current
      if(this.autoCheckCurrent && !Ti.Util.isNil(this.theCurrentId)) {
        idMap[this.theCurrentId] = true
      }
      return idMap
    },
    //-----------------------------------------------
    syncCurrentId() {
      if(!this.puppetMode && this.theCurrentId != this.theCurrentRowId) {
        //console.log("syncCurrentId", this.theCurrentRowId)
        this.selectRow(this.theCurrentRowId, {quiet:true})
      }
      // Just update the last
      else {
        this.myLastIndex = this.findRowIndexById(this.theCurrentRowId)
      }
    },
    //-----------------------------------------------
    syncCheckedIds() {
      if(!this.puppetMode) {
        this.myCheckedIds = this.getCheckedIdsMap(this.checkedIds)
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "currentId" : function() {
      this.syncCurrentId()
    },
    "checkedIds" : function() {
      this.syncCheckedIds()
    },
    "data" : function() {
      if(this.theCurrentId) {
        this.myLastIndex = this.findRowIndexById(this.theCurrentId)
      }
    }
  },
  ///////////////////////////////////////////////////
  mounted : async function() {
    //.................................
    this.syncCheckedIds()
    this.syncCurrentId()
    //.................................
   }
  ///////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/support/list_mixins.mjs", LIST_MIXINS);
})();
//============================================================
// JOIN: ti/support/list_props.mjs
//============================================================
(function(){
const _M = {
  //-----------------------------------
  // Data
  //-----------------------------------
  "data" : {
    type : [Array, String],
    default : ()=>[]
  },
  // If input the value(ID) Array
  // it can translate by this Dict
  "dict" : {
    type : [String, Ti.Dict],
    default : null
  },
  "idBy" : {
    type : [String, Function],
    default : "id"
  },
  "rawDataBy" : {
    type : [Object, String, Function],
    default : _.identity
  },
  "currentId" : {
    type : [String, Number],
    default : null
  },
  "checkedIds" : {
    type : [Array, Object],
    default : ()=>[]
  },
  "changedId" : {
    type : String,
    default : null
  },
  // "extendFunctionSet" : {
  //   type : Object,
  //   default : ()=>({})
  // },
  "vars" : {
    type : Object,
    default : ()=>({})
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "multi" : {
    type : Boolean,
    default : false
  },
  // in selectRow(), auto check current and drop primary checked rows?
  "autoCheckCurrent" : {
    type : Boolean,
    default : true
  },
  // in multi mode, which key to toggle row checker?
  "rowToggleKey" : {
    type : [String, Array],
    default : ()=>["SPACE"]
  },
  "checkable" : {
    type : Boolean,
    default : false
  },
  "selectable" : {
    type : Boolean,
    default : true
  },
  "openable" : {
    type : Boolean,
    default : true
  },
  "cancelable" : {
    type : Boolean,
    default : true
  },
  "hoverable" : {
    type : Boolean,
    default : false
  },
  "puppetMode" : {
    type : Boolean,
    default : false
  },
  "scrollIndex" : {
    type : Boolean,
    default : false
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "blankAs" : {
    type : Object,
    default : ()=>({
      icon : "zmdi-alert-circle-o",
      text : "empty-data"
    })
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "width" : {
    type : [Number, String],
    default : null
  },
  "height" : {
    type : [Number, String],
    default : null
  }
}
Ti.Preload("ti/com/ti/support/list_props.mjs", _M);
})();
//============================================================
// JOIN: ti/switcher/ti-switcher-props.mjs
//============================================================
(function(){
const _M = {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value" : null,
  "options" : {
    type : [Array, Function, String, Ti.Dict],
    default : ()=>[]
  },
  "valueBy" : {
    type : [String, Function],
    default : undefined
  },
  "textBy" : {
    type : [String, Function],
    default : undefined
  },
  "iconeBy" : {
    type : [String, Function],
    default : undefined
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "multi" : false,
  // In single mode, to keep at least one item selected,
  // you can set the prop to `false`
  "allowEmpty" : {
    type : Boolean,
    default : true
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "defaultIcon" : {
    type : String,
    default : null
  },
  "emptylAs" : {
    default : null
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "width" : {
    type : [Number, String],
    default : null
  },
  "height" : {
    type : [Number, String],
    default : null
  }
}
Ti.Preload("ti/com/ti/switcher/ti-switcher-props.mjs", _M);
})();
//============================================================
// JOIN: ti/switcher/ti-switcher.html
//============================================================
Ti.Preload("ti/com/ti/switcher/ti-switcher.html", `<div class="ti-switcher"
  :class="TopClass">
  <!--
    Show Loading
  -->
  <ti-icon
    v-if="loading"
    value="zmdi-settings zmdi-hc-spin"/>
  <!--
    Options
  -->
  <div v-else
    class="switcher-con">
    <ul>
      <li v-for="it in TheItems" 
        :key="it.value"
        :class="it.className"
        @click="OnClickItem(it, $event)"
        @mousedown="myFocusIndex=it.index;">
        <ti-icon class="it-icon"
          size=".8em"
          v-if="it.icon" 
          :value="it.icon"/>
        <span
          class="it-text">{{it.text|i18n}}</span>
      </li>
    </ul>
  </div>
</div>`);
//============================================================
// JOIN: ti/switcher/ti-switcher.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////////////////
  data : ()=>({
    loading : false,
    myOptionsData : [],
    myValueMap  : {},
    myLastIndex : 0,
    myFocusIndex : -1
  }),
  /////////////////////////////////////////////////////
  computed : {
    //-------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //-------------------------------------------------
    Dict() {
      // Customized
      if(this.options instanceof Ti.Dict) {
        return this.options
      }
      // Refer dict
      if(_.isString(this.options)) {
        let dictName = Ti.DictFactory.DictReferName(this.options)
        if(dictName) {
          return Ti.DictFactory.CheckDict(dictName, ({loading}) => {
            this.loading = loading
          })
        }
      }
      return Ti.DictFactory.GetOrCreate({
        data : this.options,
        getValue : Ti.Util.genGetter(this.valueBy || "value"),
        getText  : Ti.Util.genGetter(this.textBy  || "text|name"),
        getIcon  : Ti.Util.genGetter(this.iconBy  || "icon")
      }, {
        hooks: ({loading}) => this.loading = loading
      })
    },
    //-------------------------------------------------
    TheItems() {
      return _.map(this.myOptionsData, (it, index) => {
        let itV = this.Dict.getValue(it)
        return {
          index,
          className : {
            "is-selected" : this.myValueMap[itV],
            "is-focused"  : index == this.myFocusIndex
          },
          text  : this.Dict.getText(it),
          value : itV,
          icon  : this.Dict.getIcon(it) || this.defaultIcon
        }
      })
    }
    //-------------------------------------------------
  },
  /////////////////////////////////////////////////////
  methods : {
    //-------------------------------------------------
    OnClickItem({value, index}, $event) {
      let toggle = ($event.ctrlKey || $event.metaKey)
      let shift  = $event.shiftKey;
      // Multi + Shift Mode
      if(shift && this.multi) {
        this.selectItemsToCurrent(value, index)
      }
      // Multi + Toggle Mode
      else if(toggle && this.multi) {
        this.toggleItem(value)
      }
      // Toggle Mode
      else if(this.allowEmpty) {
        this.toggleItem(value)
      }
      // Single Mode
      else {
        this.myValueMap = {[value]:true}
      }
      // Last Index
      this.myLastIndex = index
      // Notify
      this.tryNotifyChanged()
    },
    //-------------------------------------------------
    // Utility
    //-------------------------------------------------
    findItemIndexByValue(val) {
      for(let it of this.TheItems) {
        if(it.value == val)
          return it.index
      }
      return -1
    },
    //-------------------------------------------------
    selectItemsToCurrent(val) {
      let vmap  = _.cloneDeep(this.myValueMap)
      let index = this.findItemIndexByValue(val)
      if(index >= 0) {
        let fromIndex = Math.min(index, this.myLastIndex)
        let toIndex   = Math.max(index, this.myLastIndex)
        if(fromIndex < 0) {
          fromIndex = 0
        }
        for(let i=fromIndex; i<=toIndex; i++) {
          let it = this.TheItems[i]
          vmap[it.value] = true
        }
      }
      this.myValueMap = vmap
    },
    //-------------------------------------------------
    toggleItem(val) {
      let oldV = this.myValueMap[val]
      if(this.multi) {
        this.myValueMap = _.assign({}, this.myValueMap, {
          [val] : !oldV
        })
      } else {
        this.myValueMap = {[val] : !oldV}
      }
    },
    //-------------------------------------------------
    tryNotifyChanged() {
      let vals = Ti.Util.truthyKeys(this.myValueMap)
      if(!_.isEqual(vals, this.Values)) {
        let v = this.multi ? vals : vals.join(",")
        this.$notify("change", v)
      }
    },
    //......................................
    async reloadMyOptionsData() {
      this.myOptionsData = await this.Dict.getData()
    },
    //......................................
    reloadMyValueMap() {
      let vals = Ti.S.toArray(this.value)
      let vmap = {}
      _.forEach(vals, v => vmap[v]=true)
      this.myValueMap = vmap
    }
    //......................................
  },
  /////////////////////////////////////////
  watch : {
    "options" : {
      handler : "reloadMyOptionsData",
      immediate: true
    },
    "value" : {
      handler : "reloadMyValueMap",
      immediate: true
    }
  },
  /////////////////////////////////////////
  mounted : async function(){
    Ti.Dom.watchDocument("mouseup", ()=>this.myFocusIndex = -1)
  },
  /////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Dom.unwatchDocument("mouseup", this.__on_mouseup)
  }
  /////////////////////////////////////////
}
Ti.Preload("ti/com/ti/switcher/ti-switcher.mjs", _M);
})();
//============================================================
// JOIN: ti/switcher/_com.json
//============================================================
Ti.Preload("ti/com/ti/switcher/_com.json", {
  "name" : "ti-switcher",
  "globally" : true,
  "template" : "./ti-switcher.html",
  "props" : "./ti-switcher-props.mjs",
  "mixins" : ["./ti-switcher.mjs"]
});
//============================================================
// JOIN: ti/table/com/table-row/com/table-cell/table-cell.html
//============================================================
Ti.Preload("ti/com/ti/table/com/table-row/com/table-cell/table-cell.html", `<div class="table-cell"
  :class="TopClass"
  :style="TopStyle"
  :col-index="index"
  v-ti-activable>
  <div class="cell-wrapper"
    :class="WrapperClass">
    <!--Slot for first column-->
    <slot></slot>
    <!--Fields-->
    <div class="cell-con">
      <component 
        v-for="(it, index) in cellItems"
          :class="'item-'+index"
          :key="it.uniqueKey"
          :is="it.comType"
          v-bind="it.comConf"
          @change="OnItemChanged(it, $event)"/>
    </div>
  </div>
</div>`);
//============================================================
// JOIN: ti/table/com/table-row/com/table-cell/table-cell.mjs
//============================================================
(function(){
/////////////////////////////////////////////////////
const _M = {
  ///////////////////////////////////////////////////
  inject : ["$table"],
  ///////////////////////////////////////////////////
  data: ()=>({
    isEditingMode : false,
    cellItems : [],
    myCellSize : -1
  }),
  ///////////////////////////////////////////////////
  props : {
    "index" : {
      type : Number,
      default : -1
    },
    "rowId" : {
      type : String,
      default : null
    },
    "rowIndex" : {
      type : Number,
      default : -1
    },
    //..........................
    "cellSize" : {
      type : Number,
      default : 0
    },
    "title" : {
      type : String,
      default : null
    },
    "nowrap" : {
      type : Boolean,
      default : true
    },
    //..........................
    "display" : {
      type : Array,
      default : ()=>[]
    },
    //..........................
    "name" : {
      type : [String, Array],
      default : null
    },
    "type" : {
      type : String,
      default : "String"
    },
    "dict" : {
      type : String,
      default : "String"
    },
    "comType" : {
      type : String,
      default : null
    },
    "comConf" : {
      type : Object,
      default : ()=>({})
    },
    "serializer" : {
      type : Function,
      default : _.identity
    },
    "transformer" : {
      type : Function,
      default : _.identity
    },
    //..........................
    "data" : {
      type : Object,
      default : ()=>({})
    },
    //..........................
    "isCurrent" : {
      type : Boolean,
      default : false
    },
    "isHover" : {
      type : Boolean,
      default : false
    },
    "isChecked" : {
      type : Boolean,
      default : false
    },
    //..........................
    "ignoreNil" : {
      type : Boolean,
      default : true
    },
    //..........................
    "focusBy" : {
      type : String,
      default : "focus"
    },
    "widthBy" : {
      type : String,
      default : "width"
    }
    //..........................
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //-----------------------------------------------
    TopStyle() {
      if(this.cellSize > 0) {
        return Ti.Css.toStyle({
          "width" : this.cellSize
        })
      }
    },
    //-----------------------------------------------
    WrapperClass() {
      return {
        "is-nowrap" : this.nowrap,
        "is-editing-mode" : this.isEditingMode
      }
    },
    //-----------------------------------------------
    theCurrentDisplayItems() {
      // Edit Mode
      if((this.isActived && this.comType) || _.isEmpty(this.display)) {
        //...........................................
        this.isEditingMode = true
        //...........................................
        let comConf = _.assign({}, this.comConf)
        if(this.focusBy) {
          comConf[this.focusBy] = "${=isActived}"
        }
        if(this.widthBy) {
          comConf[this.widthBy] = "${=cellSize}"
        }
        //...........................................
        return [{
          comType : this.comType,
          comConf,
          key  : this.name,
          type : this.type,
          dict : this.dict,
          transformer : this.transformer,
          ignoreNil : false
        }]
        //...........................................
      }
      // Display Mode
      this.isEditingMode = false
      return this.display
    },
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    async evalCellDisplayItems() {
      this.$table.reportReady(this.rowIndex, this.index, !_.isEmpty(this.cellItems))
      let items = []
      // Eval each items
      for(let displayItem of this.theCurrentDisplayItems) {
        let it = await this.evalDataForFieldDisplayItem({
            itemData : this.data, 
            displayItem, 
            vars : {
              "isCurrent" : this.isCurrent,
              "isChecked" : this.isChecked,
              "isHover"   : this.isHover,
              "isActived" : this.isActived,
              "rowId"     : this.rowId,
              "cellSize"  : this.cellSize
            },
            autoIgnoreNil : true
        })
        if(it) {
          items.push(it)
        }
      }
      //if(0 == this.rowIndex && 1==this.index) {
      //  console.log("evalCellDisplayItems", this.rowIndex, this.index)
      //}
      // Update and return
      let old = Ti.Util.pureCloneDeep(this.cellItems)
      let nit = Ti.Util.pureCloneDeep(items)
      if(!_.isEqual(old, nit)) {
        //console.log(`-> Cell[${this.rowIndex}-${this.index}]:`, {old, nit})
        this.cellItems = items
      }
      // report ready
      this.$table.reportReady(this.rowIndex, this.index, true)
    },
    //-----------------------------------------------
    OnItemChanged(item, payload) {
      this.$table.$notify("cell:item:change", {
        rowId     : this.rowId,
        cellIndex : this.index,
        index     : this.rowIndex,
        name      : item.key,
        value     : payload
      })
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "data" : {
      handler : "evalCellDisplayItems",
      immediate : true
    },
    "isCurrent" : "evalCellDisplayItems",
    "isChecked" : "evalCellDisplayItems",
    "isHover"   : "evalCellDisplayItems",
    "isActived" : "evalCellDisplayItems"
    // "cellSize" : async function() {
    //   await this.debounceEvalCellDisplayItems()
    // }
  }
  ///////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/table/com/table-row/com/table-cell/table-cell.mjs", _M);
})();
//============================================================
// JOIN: ti/table/com/table-row/com/table-cell/_com.json
//============================================================
Ti.Preload("ti/com/ti/table/com/table-row/com/table-cell/_com.json", {
  "name" : "table-cell",
  "globally" : false,
  "template" : "./table-cell.html",
  "methods"  : "@com:ti/support/field_display.mjs",
  "mixins"   : ["./table-cell.mjs"],
  "components" : ["@com:ti/label"]
});
//============================================================
// JOIN: ti/table/com/table-row/table-row.html
//============================================================
Ti.Preload("ti/com/ti/table/com/table-row/table-row.html", `<div class="table-row"
  :class="TopClass"
  @click.left="OnClickRow"
  @dblclick.left="OnDblClickRow"
  @mouseenter="OnMouseEnter"
  @mouseleave="OnMouseLeave"
  v-ti-activable>
  <!--
    Cells
  -->
  <table-cell v-for="fld in fields"
    :key="fld.index"
    v-bind="fld"
    :row-id="rowId"
    :row-index="index"
    :cell-size="getCellSize(fld.index)"
    :is-current="isCurrent"
    :is-hover="isHover"
    :is-checked="isChecked"
    :data="data">
    <template v-if="fld.index == 0">
      <div class="table-row-head">
        <!--current actived row indicator-->
        <div class="row-actived-indicator"></div>
        <!-- Indents -->
        <div v-for="n in indent"
            class="row-indent"></div>
        <!--ICON: Handler-->
        <template v-if="icon">
          <ti-icon
            v-if="hasRealIcon"
              class="row-icon"
              :value="icon"
              @click.native.left.stop="OnClickIcon"/>
          <div v-else
            class="row-icon"></div>
        </template>
        <!--ICON: Checker-->
        <ti-icon v-if="checkable"
            class="row-checker"
            :value="theCheckIcon"
            @click.native.left.stop="OnClickChecker"/>
      </div>
    </template>
  </table-cell>
</div>`);
//============================================================
// JOIN: ti/table/com/table-row/table-row.mjs
//============================================================
(function(){
/////////////////////////////////////////////////////
const _M = {
  ///////////////////////////////////////////////////
  props : {
    "indent" : {
      type : Number,
      default : 0
    },
    "icon" : {
      type : [Boolean, String],
      default : null
    },
    "fields" : {
      type : Array,
      default : ()=>[]
    },
    "sizes" : {
      type : Array,
      default : ()=>[]
    },
    "hoverId" : {
      type : String,
      default : null
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopClass() {
      return this.getListItemClass({
        "is-hover"   : this.isHover
      }, `row-indent-${this.indent}`)
    },
    //-----------------------------------------------
    isHover() {
      return this.hoverId && this.rowId == this.hoverId
    },
    //-----------------------------------------------
    hasRealIcon() {
      return this.icon && _.isString(this.icon)
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    getCellSize(index) {
      if(this.sizes.length > index) {
        return this.sizes[index]
      }
    },
    //-----------------------------------------------
    OnClickIcon($event) {
      this.$notify("icon", {
        rowId  : this.rowId,
        shift  : $event.shiftKey,
        toggle : ($event.ctrlKey || $event.metaKey)
      })
    },
    //-----------------------------------------------
    OnMouseEnter() {
      this.$notify("enter", {
        rowId  : this.rowId
      })
    },
    //-----------------------------------------------
    OnMouseLeave() {
      this.$notify("leave", {
        rowId  : this.rowId
      })
    }
    //-----------------------------------------------
  }
  ///////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/table/com/table-row/table-row.mjs", _M);
})();
//============================================================
// JOIN: ti/table/com/table-row/_com.json
//============================================================
Ti.Preload("ti/com/ti/table/com/table-row/_com.json", {
  "name" : "table-row",
  "globally" : false,
  "template" : "./table-row.html",
  "mixins" : [
    "@com:ti/support/list_item_mixins.mjs",
    "./table-row.mjs"],
  "components" : [
      "./com/table-cell"
    ]
});
//============================================================
// JOIN: ti/table/ti-table-props.mjs
//============================================================
(function(){
const _M = {
  "iconBy" : {
    type : [String, Function],
    default : null
  },
  "indentBy" : {
    type : [String, Function],
    default : null
  },
  "fields" : {
    type : Array,
    default : ()=>[]
  },
  "head" : {
    type : String,
    default : "frozen",
    validator : v =>
      Ti.Util.isNil(v) 
      || /^(frozen|none|normal)$/.test(v)
  },
  "border" : {
    type : String,
    default : "cell",
    validator : v => /^(row|column|cell|none)$/.test(v)
  },
  "autoScrollIntoView" : {
    type : Boolean,
    default : true
  }
}
Ti.Preload("ti/com/ti/table/ti-table-props.mjs", _M);
})();
//============================================================
// JOIN: ti/table/ti-table-resizes.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////////////
  data : ()=>({
    myViewportWidth : 0,  // Update-in-time, root element width
    myTableWidth: 0,      // Update-in-time, table width
    myColSizes: {
      priHead : [],  // Primary head column sizing
      priBody : [],  // Primary body column sizing
      primary : [],  // Primary Max Col-Sizes
      fixeds  : [],  // Fixed value [480, .23, 'auto', 'stretch']
                     // Eval when `evalEachColumnSize`
                     //  - 480 : fixed width
                     //  - -480 : fixed width and override primary
                     //  - .23 : as percent eval each time resize
                     //  - 'auto' : it will keep the primary sizing
                     //  - 'stretch' : it will join to the auto-remains-assignment
      amended : []   // The col-size to display in DOM
    },
    myCellsReady : false,
    myCellsReport : {},
    I_am_in_resizing : false
  }),
  ///////////////////////////////////////////////////
  methods : {
    //--------------------------------------
    reportReady(rowIndex=-1, cellIndex=-1, isDone=false) {
      let key = `R${rowIndex}-C${cellIndex}`
      //console.log(key, isDone)
      if(isDone) {
        delete this.myCellsReport[key]
      } else {
        this.myCellsReport[key] = isDone
      }
      // Check the status
      _.delay(()=>{
        this.myCellsReady = _.isEmpty(this.myCellsReport)
        // Do resize
        if(this.myCellsReady) {
          this.evalEachColumnSize()
        }
      })
    },
    //--------------------------------------
    evalEachColumnSize() {
      // Guard
      if(this.I_am_in_resizing) {
        return
      }
      //console.log("evalEachColumnSize", this, this.tiComType)

      // Reset each column size
      this.I_am_in_resizing = true
      this.myTableWidth = 0
      this.myColSizes = {
        priHead : [],
        priBody : [],
        primary : [],
        fixeds  : [],
        amended : []
      }
      //.........................................
      // Eval the fixeds
      for(let fld of this.TableFields) {
        let fldWidth = fld.width || "stretch"
        // Stretch/Auto
        if(/^(stretch|auto)$/.test(fldWidth)) {
          this.myColSizes.fixeds.push(fldWidth)
        }
        // Fixed or percent
        else {
          this.myColSizes.fixeds.push(Ti.Css.toPixel(fldWidth, 1))
        }
      }
      //.........................................
      // Wait reset applied, and ...
      this.$nextTick(()=>{
        // Get original size: head
        let $heads = Ti.Dom.findAll(".table-head ul li", this.$el)
        for(let $he of $heads) {
          let rect = Ti.Rects.createBy($he)
          this.myColSizes.priHead.push(rect.width)
        }

        // Get original size: body
        let $rows = Ti.Dom.findAll(".table-body .table-row", this.$el)
        for(let $row of $rows) {
          let $cells = Ti.Dom.findAll(":scope > div", $row)
          for(let x=0; x<$cells.length; x++) {
            let $cell = $cells[x]
            let rect = Ti.Rects.createBy($cell)
            if(x>= this.myColSizes.priBody.length) {
              this.myColSizes.priBody[x] = rect.width
            } else {
              this.myColSizes.priBody[x] = Math.max(
                rect.width, this.myColSizes.priBody[x]
              )
            }
          }
        }

        // Count the primary max sizing for each columns
        for(let i=0; i<this.myColSizes.priHead.length; i++) {
          let wHeadCell = this.myColSizes.priHead[i]
          let wBodyCell = this.myColSizes.priBody[i]
          let w = Math.max(wHeadCell, wBodyCell)
          this.myColSizes.primary.push(w)
        }

        // Resize Table
        this.onTableResize()

        _.delay(()=>{
          this.I_am_in_resizing = false
        }, 10)
      })
    },
    //--------------------------------------
    onTableResize() {
      // Guard it
      let colN = this.myColSizes.primary.length
      if(colN <= 0) {
        return
      }

      // Get the viewport width
      let viewportWidth = Ti.Rects.createBy(this.$el).width
      //console.log("onTableResize")

      // Assign the fixed width
      // And count how many fields to join the remains-assignment
      let raIndexs = [];
      let amended = []
      for(let i=0; i<this.myColSizes.fixeds.length; i++) {
        let fxW = this.myColSizes.fixeds[i]
        // Get the primary width
        let priW = this.myColSizes.primary[i]
        // join to auto-remains-assignment
        if("stretch" == fxW) {
          raIndexs.push(i)
          amended.push(priW)
        }
        // keep primary
        else if("auto" == fxW) {
          amended.push(priW)
        }
        // Eval percent
        else if(fxW <= 1 && fxW > 0) {
          amended.push(fxW * viewportWidth)
        }
        // Eval percent and join remains-assignment
        else if(fxW < 0 && fxW >= -1) {
          let w = Math.abs(fxW * viewportWidth)
          amended.push(Math.max(w, priW))
        }
        // Fixed width and join remains-assignment
        else if(fxW < -1) {
          let w = Math.abs(fxW)
          amended.push(Math.max(w, priW))
        }
        // Fixed width
        else {
          amended.push(fxW)
        }
      }

      // Count the tableWidth
      let sumWidth = _.sum(amended)
      let tableWidth = Math.max(viewportWidth, sumWidth)
      this.myTableWidth = tableWidth

      // Assign the remain
      if(raIndexs.length > 0) {
        let remain = tableWidth - sumWidth
        if(remain > 0) {
          let remainCell = remain / raIndexs.length
          for(let index of raIndexs) {
            amended[index] += remainCell
          }
        }
      }

      // apply amended
      this.myColSizes.amended = amended
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  mounted : async function() {
    //.................................
    Ti.Viewport.watch(this, {
      resize : _.debounce(()=>this.onTableResize(), 10)
    })
    //.................................
  },
  ///////////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
  ///////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/table/ti-table-resizes.mjs", _M);
})();
//============================================================
// JOIN: ti/table/ti-table.html
//============================================================
Ti.Preload("ti/com/ti/table/ti-table.html", `<div class="ti-table"
  :class="TopClass"
  @click="OnClickTop"
  v-ti-activable>
  <!--
    Blank
  -->
  <div
    v-if="isDataEmpty"
      class="ti-blank is-big">
      <ti-loading v-bind="blankAs"/>
  </div>
  <!--
    Show thead/tbody
  -->
  <template v-else>
    <!--
      Head
    -->
    <div v-if="isShowHead"
      class="table-head"
      :style="TableStyle">
      <!--checker-->
      <div
          v-if="checkable && multi"
            class="as-checker"
            @click.left="OnClickHeadChecker">
            <ti-icon :value="HeadCheckerIcon"/>
      </div>
      <!--field titles-->
      <ul>
        <li
          v-for="fld in TableFields"
            class="table-head-cell"
            :style="getHeadCellStyle(fld.index)"
            :col-index="fld.index">
          <span class="table-head-cell-text">{{fld.title|i18n}}</span>
        </li>
      </ul>
    </div
    <!--
      Body
    -->
    <div ref="body"
      class="table-body"
      :style="TableStyle">
      <table-row
        v-for="row in myData"
          :key="row.id"
          :row-id="row.id"
          :index="row.index"
          :icon="row.icon"
          :indent="row.indent"
          :data="row.rawData"
          :fields="TableFields"
          :sizes="myColSizes.amended"
          :current-id="theCurrentId"
          :checked-ids="theCheckedIds"
          :hover-id="myHoverId"
          :changed-id="changedId"
          :checkable="checkable"
          :selectable="selectable"
          :openable="openable"
          @icon="$notify('icon', $event)"
          @checker="OnRowCheckerClick"
          @select="OnRowSelect"
          @open="OnRowOpen"
          @enter="OnRowEnter"
          @leave="OnRowLeave"/>
    </div>
  </template>
</div>`);
//============================================================
// JOIN: ti/table/ti-table.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////////////
  provide : function(){
    return {
      "$table" : this
    }
  },
  ///////////////////////////////////////////////////
  data : ()=>({
    myData : [],
    myHoverId  : null,    // The row mouse hover
  }),
  ///////////////////////////////////////////////////
  // props -> ti-table-props.mjs
  ///////////////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-cells-no-ready" : !this.myCellsReady,
        "is-layout-ready" : this.myCellsReady,
        "is-hoverable"   : this.hoverable
      }, [
        `is-border-${this.border}`,
        `is-head-${this.head||"none"}`,
      ])
    },
    //--------------------------------------
    TableStyle() {
      if(this.myTableWidth>0) {
        return Ti.Css.toStyle({
          "width" : this.myTableWidth
        })
      }
    },
    //--------------------------------------
    getRowIndent() {
      if(_.isFunction(this.indentBy)) {
        return it => this.indentBy(it)
      }
      if(_.isString(this.indentBy)) {
        return it => _.get(it, this.indentBy)
      }
      return it => 0
    },
    //--------------------------------------
    getRowIcon() {
      if(_.isFunction(this.iconBy)) {
        return it => this.iconBy(it)
      }
      if(_.isString(this.iconBy)) {
        return it => _.get(it, this.iconBy)
      }
      return it => null
    },
    //--------------------------------------
    TheData() {
      return this.myData
    },
    //--------------------------------------
    isShowHead() {
      return /^(frozen|normal)$/.test(this.head)
    },
    //--------------------------------------
    HeadCheckerIcon() {
      if(this.isAllChecked) {
        return "fas-check-square"
      }
      if(this.hasChecked) {
        return "fas-minus-square"
      }
      return "far-square"
    },
    //--------------------------------------
    TableFields() {
      let fields = []
      for(let i=0; i< this.fields.length; i++) {
        let fld = this.fields[i]
        //..................................
        let display = this.evalFieldDisplay(fld.display, fld.name)
        //..................................
        let fldWidth = Ti.Util.fallbackNil(fld.width, "stretch")
        //..................................
        if(_.isString(fldWidth)) {
          // Percent
          if(/^\d+(\.\d+)?%$/.test(fldWidth)) {
            fldWidth = fldWidth.substring(0, fldWidth.length-1)/100;
          }
          // Auto or stretch
          else if(!/^(auto|stretch)$/.test(fldWidth)) {
            fldWidth = "stretch"
          }
        }
        // Must be number
        else if(!_.isNumber(fldWidth)) {
          fldWidth = "stretch"
        }
        //..................................
        fields.push({
          index  : i,
          title  : fld.title,
          nowrap : fld.nowrap,
          width  : fldWidth,
          //.....................
          name : fld.name,
          display,
          //.....................
          type : fld.type,
          comType : fld.comType,
          comConf : fld.comConf,
          transformer : fld.transformer,
          serializer  : fld.serializer
        })
      }
      return fields
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnRowEnter({rowId}={}) {
      if(this.hoverable) {
        this.myHoverId = rowId
      }
    },
    //--------------------------------------
    OnRowLeave({rowId}={}) {
      if(this.hoverable) {
        if(this.myHoverId == rowId) {
          this.myHoverId = null
        }
      }
    },
    //--------------------------------------
    OnClickHeadChecker() {
      // Cancel All
      if(this.isAllChecked) {
        this.cancelRow()
      }
      // Check All
      else {
        this.checkRow()
      }
    },
    //--------------------------------------
    OnClickTop($event) {
      if(this.cancelable) {
        // Click The body or top to cancel the row selection
        if(Ti.Dom.hasOneClass($event.target,
            'ti-table', 'table-body',
            'table-head-cell',
            'table-head-cell-text')) {
          this.cancelRow()
        }
      }
    },
    //--------------------------------------
    onItemChanged(payload) {
      this.$notify("item:change", payload)
    },
    //--------------------------------------
    getHeadCellStyle(index=-1) {
      if(this.myColSizes.amended.length > index) {
        return Ti.Css.toStyle({
          "width" : this.myColSizes.amended[index]
        })
      }
    },
    //--------------------------------------
    evalFieldDisplay(displayItems=[], defaultKey) {
      // Force to Array
      displayItems = _.concat(displayItems)
      // Prepare the return list
      let items = []
      // Loop each items
      for(let li of displayItems) {
        let item = this.evalFieldDisplayItem(li, {
          funcSet: this.fnSet,
          defaultKey
        })
        if(item) {
          items.push(item)
        }
      }
      // // Gen transformer for each item
      // for(let it of items) {
      //   // Transformer
      //   it.transformer = Ti.Types.getFuncBy(it, "transformer", this.fnSet)
      // }
      // Array to pick
      return items
    },
    //--------------------------------------
    scrollCurrentIntoView() {
      if(this.autoScrollIntoView && this.myLastIndex>=0) {
        let $tbody = this.$refs.body
        let $row = Ti.Dom.find(`.table-row:nth-child(${this.myLastIndex+1})`, $tbody)

        let tbody = Ti.Rects.createBy($tbody)
        let row = Ti.Rects.createBy($row)

        // test it need to scroll or not
        if(!tbody.contains(row)) {
          // at bottom
          if(row.bottom > tbody.bottom) {
            $tbody.scrollTop += row.bottom - tbody.bottom
          }
          // at top
          else {
            $tbody.scrollTop += row.top - tbody.top
          }
        }
      }
    },
    //--------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-table", uniqKey)
      if("ARROWUP" == uniqKey) {
        this.selectPrevRow({
          payload: {byKeyboardArrow: true}
        })
        this.scrollCurrentIntoView()
        return {prevent:true, stop:true, quit:true}
      }

      if("ARROWDOWN" == uniqKey) {
        this.selectNextRow({
          payload: {byKeyboardArrow: true}
        })
        this.scrollCurrentIntoView()
        return {prevent:true, stop:true, quit:true}
      }
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "data" : {
      handler : async function(newVal, oldVal){
        let isSame = _.isEqual(newVal, oldVal)
        if(!isSame) {
          //console.log("!!!table data changed", {newVal, oldVal})
          this.myData = await this.evalData((it)=>{
            it.icon = this.getRowIcon(it.item)
            it.indent = this.getRowIndent(it.item)
          })
        }
        // Check ready 
        if(_.isEmpty(this.data)) {
          this.myCellsReady = true
        }
      },
      immediate : true
    }
  }
  ///////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/table/ti-table.mjs", _M);
})();
//============================================================
// JOIN: ti/table/_com.json
//============================================================
Ti.Preload("ti/com/ti/table/_com.json", {
  "name" : "ti-table",
  "globally" : true,
  "template" : "./ti-table.html",
  "props" : [
    "@com:ti/support/list_props.mjs",
    "./ti-table-props.mjs"
  ],
  "methods" : "@com:ti/support/field_display.mjs",
  "mixins" : [
    "@com:ti/support/list_mixins.mjs",
    "./ti-table-resizes.mjs",
    "./ti-table.mjs"
  ],
  "components" : [
    "./com/table-row"
  ]
});
//============================================================
// JOIN: ti/tags/com/tags-item/tags-item.html
//============================================================
Ti.Preload("ti/com/ti/tags/com/tags-item/tags-item.html", `<div class="ti-tags-item" 
  :class="topClass"
  @mouseenter="mouseEnter='top'"
  @mouseleave="mouseEnter=null"
  @click.left="onClickTop">
  <!--
    Deleter
  -->
  <ti-icon v-if="removable"
    class="as-del"
    :value="removeIcon"
    @mouseenter.native="mouseEnter='del'"
    @mouseleave.native="mouseEnter='top'"
    @click.native.stop="onClickDel"/>
  <!--
    Icon
  -->
  <ti-icon v-if="icon" 
    class="as-icon"
    :value="icon"/>
  <!--
    Text
  -->
  <template v-if="text">
    <a v-if="href"
      class="as-text"
      @click.prevent
      :href="href"
      :class="textClass">{{text|i18n}}</a>
    <span v-else
      class="as-text"
      :class="textClass">{{text|i18n}}</span>
  </template>
  <!--
    Status Icon
  -->
  <ti-icon v-if="hasOptions"
    class="as-status"
    :value="theStatusIcon"/>
  <!--
    Drop & Mask
  -->
  <template v-if="'extended' == status">
    <div class="as-mask" @click.stop="closeDrop"></div>
    <div class="as-drop" ref="drop"
      @click.stop>
      <ti-icon-text v-for="it in theOptions"
        :key="it.index"
        v-bind="it"
        @click.native="onClickOption(it)"/>
    </div>
  </template>
</div>`);
//============================================================
// JOIN: ti/tags/com/tags-item/tags-item.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    // null / top / del
    mouseEnter : null,
    // collapse / extended
    status : "collapse"
  }),
  ////////////////////////////////////////////////////
  props : {
    "index" : {
      type : Number,
      default : -1
    },
    "atLast" : {
      type : Boolean,
      default : false
    },
    "icon" : {
      type : [String, Object],
      default : null
    },
    "text" : {
      type : String,
      default : null
    },
    "href" : {
      type : String,
      default : null
    },
    "value" : {
      type : [String, Number, Boolean, Object],
      default : null
    },
    /***
     * Show drop list for changing the piece value
     * 
     * ```js
     * [{
     *   icon  : "zmdi-card-giftcard",
     *   text  : "随便什么礼物",
     *   value : "Gift"
     * }, {
     *   icon  : "zmdi-cocktail",
     *   text  : "鸡尾酒会",
     *   value : "Cocktail"
     * }, {
     *   icon  : "zmdi-nature-people",
     *   text  : "人在树下；雨在天空",
     *   value : "NaturePeople"
     * }]
     * ```
     */
    "options" : {
      type : Array,
      default : ()=>[]
    },
    "optionDefaultIcon" : {
      type : String,
      default : null
    },
    "cancelBubble" : {
      type : Boolean,
      default : false
    },
    "removable" : {
      type : Boolean,
      default : false
    },
    "removeIcon" : {
      type : String,
      default : null
    },
    "statusIcons" : {
      type : Object,
      default : ()=>({
        collapse : "zmdi-chevron-down",
        extended : "zmdi-chevron-up"
      })
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "has-options"  :  this.hasOptions,
        "is-enter-top" : 'top' == this.mouseEnter && this.hasOptions,
        "is-enter-del" : 'del' == this.mouseEnter
      }, this.className)
    },
    //------------------------------------------------
    textClass() {
      return {
        "without-icon"    : !this.hasIcon && !this.removable,
        "without-options" : !this.hasOptions
      }
    },
    //------------------------------------------------
    hasIcon() {
      return this.icon ? true : false
    },
    //------------------------------------------------
    hasOptions() {
      return _.isArray(this.options) && this.options.length > 0
    },
    //------------------------------------------------
    /***
     * @return The objects list like:
     * 
     * ```js
     * [{
      *   icon  : "zmdi-phone",
      *   text  : "i18n:xxx",
      *   value : 100,
      *   options : [{icon,text,value}...]
      * }]
      * ```
      */
    theOptions() {
      let list = _.filter(_.concat(this.options), (v)=>!Ti.Util.isNil(v))
      let tags = []
      _.forEach(list, (li, index)=>{
        let tag
        // Object
        if(_.isPlainObject(li)) {
          tag = _.assign({icon:this.optionDefaultIcon}, li, {index})
        }
        // String or simple value
        else {
          tag = {
            index : index,
            icon  : this.optionDefaultIcon,
            text  : Ti.Types.toStr(li),
            value : li
          }
        }
        // Join to
        if(!_.isEqual(tag.value, this.value)) {
          tags.push(tag)
        }
      })
      return tags
    },
    //------------------------------------------------
    theStatusIcon() {
      return this.statusIcons[this.status]
    },
    //------------------------------------------------
    theData() {
      return {
        index    : this.index,
        icon     : this.icon,
        text     : this.text,
        value    : this.value,
        href     : this.href,
        atLast   : this.atLast,
        asterisk : this.asterisk
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onClickDel() {
      this.$notify("remove", this.theData)
    },
    //------------------------------------------------
    onClickOption({value,text,icon}={}) {
      this.$notify("change", {
        value,text,icon,
        index: this.index
      })
      this.closeDrop()
    },
    //------------------------------------------------
    onClickTop($event) {
      // Show Drop Down
      if(this.hasOptions) {
        $event.stopPropagation()
        this.openDrop()
      }
      // Stop Bubble Up
      else if(this.cancelBubble) {
        $event.stopPropagation()
      }
      // Emit event
      if(this.href) {
        this.$notify("fire", this.theData)
      }
    },
    //------------------------------------------------
    openDrop() {
      if(this.hasOptions) {
        this.status = "extended"
        this.$nextTick(()=>{
          this.dockDrop()
        })
      }
    },
    //------------------------------------------------
    closeDrop() {
      this.status = "collapse"
      this.mouseEnter = null
    },
    //------------------------------------------------
    dockDrop() {
      let $drop  = this.$refs.drop
      let $box   = this.$el
      // Guard the elements
      if(!_.isElement($drop) || !_.isElement($box)){
        return
      }
      // If drop opened, make the box position fixed
      // to at the top of mask
      if("extended" == this.status) {
        let r_box  = Ti.Rects.createBy($box)
        //..........................................
        // Make drop same width with box
        Ti.Dom.setStyle($drop, {
          "min-width" : `${r_box.width}px`
        })
        //..........................................
        // Dock drop to box
        Ti.Dom.dockTo($drop, $box, {
          space:{y:2}, posListX:["left", "right"]
        })
        //..........................................
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  mounted : function(){
    this.dockDrop()
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/tags/com/tags-item/tags-item.mjs", _M);
})();
//============================================================
// JOIN: ti/tags/com/tags-item/_com.json
//============================================================
Ti.Preload("ti/com/ti/tags/com/tags-item/_com.json", {
  "name" : "tags-item",
  "globally" : false,
  "template" : "./tags-item.html",
  "mixins" : ["./tags-item.mjs"],
  "components" : ["@com:ti/icon/text"]
});
//============================================================
// JOIN: ti/tags/ti-tags.html
//============================================================
Ti.Preload("ti/com/ti/tags/ti-tags.html", `<div class="ti-tags"
  :class="TopClass">
  <!--
    Loop piece
  -->
  <tags-item v-for="tag in myTags"
    :key="tag.index"
    v-bind="tag"
    :cancel-bubble="cancelItemBubble"
    :option-default-icon="optionDefaultIcon"
    :removable="removable"
    :remove-icon="removeIcon"
    :status-icons="statusIcons"
    @change="OnItemChanged"
    @remove="OnItemRemoved"
    @fire="OnItemFired"/>
</div>`);
//============================================================
// JOIN: ti/tags/ti-tags.mjs
//============================================================
(function(){
const _M = {
  ////////////////////////////////////////////////////
  data: ()=>({
    myTags   : [],
    myValues : []
  }),
  ////////////////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value" : {
      type : Array,
      default : ()=>[]
    },
    "dict" : {
      type : [String, Ti.Dict],
      default : null
    },
    "mapping" : {
      type : Object,
      default : undefined
    },
    "itemOptions" : {
      type : Array,
      default : ()=>[]
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "cancelItemBubble" : {
      type : Boolean,
      default : false
    },
    "removable" : {
      type : Boolean,
      default : false
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "itemIconBy" : {
      type : [String, Function],
      default : undefined
    },
    "optionDefaultIcon" : {
      type : String,
      default : undefined
    },
    "itemDefaultIcon" : {
      type : String,
      default : undefined
    },
    "removeIcon" : {
      type : String,
      default : "zmdi-close"
    },
    "statusIcons" : {
      type : Object,
      default : ()=>({
        collapse : "zmdi-chevron-down",
        extended : "zmdi-chevron-up"
      })
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      if(this.className)
        return this.className
    },
    //------------------------------------------------
    getTagItemIcon() {
      if(_.isFunction(this.itemIconBy)) {
        return it => this.itemIconBy(it)
      }
      if(_.isString(this.itemIconBy)) {
        return it => _.get(it, this.itemIconBy)
      }
      return it => null
    },
    //--------------------------------------
    Dict() {
      if(this.dict) {
        // Already Dict
        if(this.dict instanceof Ti.Dict) {
          return this.dict
        }
        // Get back
        let {name} = Ti.DictFactory.explainDictName(this.dict)
        return Ti.DictFactory.CheckDict(name)
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    OnItemChanged({index, value}={}) {
      if(index >= 0) {
        let values = this.getMyValues()
        values[index] = Ti.Util.fallback(value, null)
        this.$notify("change", values)
      }
    },
    //------------------------------------------------
    OnItemRemoved({index}={}) {
      if(index >= 0) {
        let values = this.getMyValues()
        _.pullAt(values, index)
        this.$notify("change", values)
      }
    },
    //------------------------------------------------
    OnItemFired({index=-1}={}) {
      if(index >= 0) {
        let it = _.nth(this.theData, index)
        if(it) {
          this.$notify("item:actived", it)
        }
      }
    },
    //------------------------------------------------
    async evalMyData() {
      const tags = []
      if(_.isArray(this.value)) {
        const lastIndex = this.value.length - 1
        for(let index=0; index<this.value.length; index++){
          let val = this.value[index]
          let tag;
          // Auto mapping plain object
          if(_.isPlainObject(val)) {
            tag = this.mapping 
                    ? Ti.Util.translate(val, this.mapping)
                    : _.cloneDeep(val)
            // Customized the icon
            if(!tag.icon) {
              tag.icon = this.getTagItemIcon(val)
            }
          }
          // Lookup Dict
          else if(this.Dict) {
            let it = await this.Dict.getItem(val)
            tag = _.defaults({
              icon  : this.Dict.getIcon(it),
              text  : this.Dict.getText(it) || val,
              value : val
            })
          }
          // Auto gen object for simple value
          else {
            tag = {text: val, value: val}
          }
          // Join default value
          _.defaults(tag, {
            index,
            icon    : this.itemDefaultIcon,
            options : this.itemOptions,
            atLast  : index == lastIndex
          })
          // Join to tags
          tags.push(tag)
        }; // _.forEach
      }
      // assign the tags
      this.myTags = tags
    },
    //------------------------------------------------
    getMyValues() {
      const vals = []
      for(let tag of this.myTags) {
        vals.push(Ti.Util.fallback(tag.value, null))
      }
      return vals
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "value" : {
      handler : "evalMyData",
      immediate : true
    }
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/tags/ti-tags.mjs", _M);
})();
//============================================================
// JOIN: ti/tags/_com.json
//============================================================
Ti.Preload("ti/com/ti/tags/_com.json", {
  "name" : "ti-tags",
  "globally" : true,
  "template" : "./ti-tags.html",
  "mixins" : ["./ti-tags.mjs"],
  "components" : [
    "./com/tags-item"
  ]
});
//============================================================
// JOIN: ti/text/json/ti-text-json.html
//============================================================
Ti.Preload("ti/com/ti/text/json/ti-text-json.html", `<ti-gui
  class="ti-text-json"
  :class="className"
  keep-shown-to="ti-text-json-editor"
  :layout="TheLayout"
  :schema="TheSchema"
  :can-loading="true"
  @change="OnChange"/>`);
//============================================================
// JOIN: ti/text/json/ti-text-json.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////
  props : {
    "tabAt" : {
      type : String,
      default : "bottom-left",
      validator : (v)=>/^(top|bottom)-(left|center|right)$/.test(v)
    },
    "value" : undefined,
    "tree" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TheContent() {
      if(!Ti.Util.isNil(this.value)) {
        return this.value
      }
      return ""
    },
    //--------------------------------------
    TheData() {
      if(!Ti.Util.isNil(this.value)) {
        return Ti.Types.safeParseJson(this.value, null)
      }
      return null
    },
    //--------------------------------------
    TheLayout() {
      return {
        type : "tabs",
        tabAt : this.tabAt,
        blocks : [{
          title : "i18n:structure",
          name  : "tree",
          body  : "desktop-tree"
        }, {
          title : "i18n:source-code",
          name  : "source",
          body  : "desktop-source"
        }]
      }
    },
    //--------------------------------------
    TheSchema() {
      //....................................
      // Tree Conf
      let treeConf = _.assign({}, this.tree, {
        value: this.TheData
      })
      //....................................
      // Source Conf
      let sourceConf = {
        showTitle : false,
        value    : this.value
      }
      //....................................
      // Done
      return {
        "desktop-tree" : {
          comType : "ti-text-json-tree", 
          comConf : treeConf
        },
        "desktop-source" : {
          comType : "ti-text-raw",
          comConf : sourceConf
        }
      }
      //....................................
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnChange(payload) {
      //console.log("TiObjJson->OnChange", payload)
      this.$notify('change', payload)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/text/json/ti-text-json.mjs", _M);
})();
//============================================================
// JOIN: ti/text/json/tree/item/json-tree-item.html
//============================================================
Ti.Preload("ti/com/ti/text/json/tree/item/json-tree-item.html", `<div class="json-value"
  :class="topClass"
  v-ti-activable>
  <!--
  //  - Label   : Readonly
  -->
  <span v-if="isLabel"
    class="as-editing as-label">{{theLabelDisplayText}}</span>
  <!--
  //  - Boolean : Editable boolean value
  -->
  <ti-toggle v-else-if="'Boolean' == valueType"
    class="as-editing"
    :value="value"
    @change="$notify('change', $event)"/>
  <!--
  //  - Integer : Editable integer value
  //  - Float   : Editable float value
  //  - String  : Editable string value
  //  - Nil     : Edtiable any value
  -->
  <ti-label v-else
    class="as-editing"
    :value="value"
    :class-name="theValueClassName"
    :format="theValueFormat"
    :editable="true"
    @change="$notify('change', $event)"/>
  <!--
    Action Menu
  -->
  <ti-actionbar v-if="showActions"
    class="as-actions"
    :items="theActionMenuData"
    :status="theActionMenuStatus"/>
</div>`);
//============================================================
// JOIN: ti/text/json/tree/item/json-tree-item.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  //////////////////////////////////////////
  data : ()=>({
    
  }),
  //////////////////////////////////////////
  props : {
    "value" : null,
    "valueType" : {
      type : String,
      default : "Nil"
    },
    "valuePath" : {
      type : [String, Array],
      default : ()=>[]
    },
    "showActions" : {
      type : Boolean,
      default : false
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-self-actived" : this.isSelfActived,
        "is-actived" : this.isActived
      })
    },
    //--------------------------------------
    isLabel() {
      return /^(Array|Object)$/.test(this.valueType)
    },
    //--------------------------------------
    isTop() {
      return this.theValuePath.length == 0
    },
    //--------------------------------------
    theLabelDisplayText() {
      if('Array' == this.valueType) {
        return '[..]'
      }
      if('Object' == this.valueType) {
        return '{..}'
      }
      return '???'
    },
    //--------------------------------------
    theValuePath() {
      if(_.isArray(this.valuePath)) {
        return this.valuePath
      }
      if(_.isString(this.valuePath)) {
        return _.without(this.valuePath.split(/[\/.]/g), "")
      }
      return []
    },
    //--------------------------------------
    theValueClassName() {
      return _.kebabCase(`is${this.valueType}`)
    },
    //--------------------------------------
    theValueFormat() {
      if('String' == this.valueType) {
        return function(val) {
          if(val) {
            return `"${val}"`
          }
          return '""'
        }
      }
    },
    //--------------------------------------
    theActionMenuData() {
      //................................
      let jvTypes = [{
        name  : "jvTypeArray",
        text  : "i18n:json-Array",
        type  : "action",
        altDisplay : {
          icon : "zmdi-check",
          capture : false
        },
        action : ()=>{
          this.$notify("change", {jsonMutate:"ChangeValueType", args:"Array"})
        }
      }, {
        name  : "jvTypeObject",
        text  : "i18n:json-Object",
        type  : "action",
        altDisplay : {
          icon : "zmdi-check",
          capture : false
        },
        action : ()=>{
          this.$notify("change", {jsonMutate:"ChangeValueType", args:"Object"})
        }
      }]
      //................................
      // Add
      let menuData = [{
        name : "jv-add",
        type : "action",
        icon : "zmdi-plus",
        action : ()=>{
          this.$notify("change", {jsonMutate : "Add"})
        }
      }]
      //................................
      // Remove : If not the top
      if(!this.isTop) {
        menuData.push({
          type : "line"
        })
        // Can not remove top node
        menuData.push({
          name : "jv-remove",
          type : "action",
          icon : "zmdi-delete",
          action : ()=>{
            this.$notify("change", {jsonMutate : "Remove"})
          }
        })
        // Add More Types
        jvTypes.push({
          type : "line"
        })
        // AddType: Boolean
        jvTypes.push({
          name  : "jvTypeBoolean",
          text  : "i18n:json-Boolean",
          type  : "action",
          altDisplay : {
            icon : "zmdi-check",
            capture : false
          },
          action : ()=>{
            this.$notify("change", {jsonMutate:"ChangeValueType", args:"Boolean"})
          }
        })
        // AddType: Number
        jvTypes.push({
          name  : "jvTypeNumber",
          text  : "i18n:json-Number",
          type  : "action",
          altDisplay : {
            icon : "zmdi-check",
            capture : false
          },
          action : ()=>{
            this.$notify("change", {jsonMutate:"ChangeValueType", args:"Number"})
          }
        })
        // AddType: String
        jvTypes.push({
          name  : "jvTypeString",
          text  : "i18n:json-String",
          type  : "action",
          altDisplay : {
            icon : "zmdi-check",
            capture : false
          },
          action : ()=>{
            this.$notify("change", {jsonMutate:"ChangeValueType", args:"String"})
          }
        })
        // AddType: Nil
        jvTypes.push({
          name  : "jvTypeNil",
          text  : "i18n:json-Nil",
          type  : "action",
          altDisplay : {
            icon : "zmdi-check",
            capture : false
          },
          action : ()=>{
            this.$notify("change", {jsonMutate:"ChangeValueType", args:"Nil"})
          }
        })
      }
      //................................
      // More: Change Type
      menuData.push({
        type : "line"
      })
      menuData.push({
        key  : "jv-types",
        type : "group",
        icon : "zmdi-more",
        items : jvTypes
      })
      // Done
      return menuData
    },
    //--------------------------------------
    theActionMenuStatus() {
      return {
        jvTypeBoolean : "Boolean" == this.valueType,
        jvTypeInteger : "Integer" == this.valueType,
        jvTypeFloat   : "Float"   == this.valueType,
        jvTypeNumber  : "Number"  == this.valueType,
        jvTypeString  : "String"  == this.valueType,
        jvTypeArray   : "Array"   == this.valueType,
        jvTypeObject  : "Object"  == this.valueType,
        jvTypeNil     : "Nil"     == this.valueType
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    
  },
  //////////////////////////////////////////
  mounted : function() {
    
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/text/json/tree/item/json-tree-item.mjs", _M);
})();
//============================================================
// JOIN: ti/text/json/tree/item/_com.json
//============================================================
Ti.Preload("ti/com/ti/text/json/tree/item/_com.json", {
  "name" : "ti-text-json-tree-item",
  "globally" : true,
  "template" : "./json-tree-item.html",
  "mixins" : ["./json-tree-item.mjs"]
});
//============================================================
// JOIN: ti/text/json/tree/ti-text-json-tree.html
//============================================================
Ti.Preload("ti/com/ti/text/json/tree/ti-text-json-tree.html", `<ti-tree class="ti-text-json-tree"
  title="i18n:name"
  :main-width="mainWidth"
  :class="className"
  :border="border"
  :keep-open-by="keepOpenBy"
  :multi="true"
  :data="myTreeRoot"
  :display="TreeDisplay"
  :auto-open="autoOpen"
  :current-id="myTreeCurrentPathId"
  :default-open-depth="2"
  :fields="TreeFields"
  @select
  @node:item:change="OnNodeItemChange"
  @opened-status:changed="OnOpenedStatusChanged"/>`);
//============================================================
// JOIN: ti/text/json/tree/ti-text-json-tree.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////
  data : ()=>({
    myTreeRoot : [],
    myTreeCurrentPathId : null,
    myTreeOpenedStatus : {}
  }),
  //////////////////////////////////////////
  props : {
    "value" : null,
    "mainWidth" : {
      type : [String, Number],
      default : .372
    },
    "border" : {
      type : String,
      default : "cell",
      validator : v => /^(row|column|cell|none)$/.test(v)
    },
    "keepOpenBy" : {
      type : String,
      default : null
    },
    "autoOpen" : {
      type : Boolean,
      default : false
    },
    "showRoot" : {
      type : Boolean,
      default : true
    },
    "editing" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TreeDisplay() {
      return {
        key : "name",
        comType : "ti-label",
        comConf : (it)=>({
          className : _.kebabCase(`is-${it.nameType}`),
          editable  : 'Key' == it.nameType,
          format : ({
              "Index" : "[${val}]",
              "Label" : "i18n:json-${val}"
            })[it.nameType]
        })
      }
    },
    //--------------------------------------
    TreeFields() {
      return [{
        title : "i18n:value",
        width : .618,
        display : {
          key : "value",
          ignoreNil : false,
          comType : "ti-text-json-tree-item",
          comConf : {
            valueType   : "${valueType}",
            valuePath   : "${=rowId}",
            showActions : "${=isCurrent}"
          }
        }
      }]
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    evalTreeData() {
      let list = []
      // Join the top data
      this.joinTreeTableRow(list, this.value)

      // Update Tree Data
      this.myTreeRoot = _.first(list)
    },
    //--------------------------------------
    getJsValueType(val) {
      if(Ti.Util.isNil(val))
        return "Nil"

      if(_.isArray(val))
        return "Array"
      
      if(_.isNumber(val)) {
        return "Number"
      }

      return _.upperFirst(typeof val)
    },
    //--------------------------------------
    joinTreeTableRow(list=[], item, key) {
      let nameType;
      let valueType = this.getJsValueType(item)
      // Default itemKey is self-type
      // For top leval
      if(_.isUndefined(key)) {
          key = valueType
          nameType = "Label"
      }
      // Index key
      else if(_.isNumber(key)) {
        nameType = "Index"
      }
      // String key
      else {
        nameType = "Key"
      }
      //................................
      // undefined
      if(_.isUndefined(item)) {
        list.push({
          nameType, valueType,
          name  : key,
          value : undefined
        })
      }
      //................................
      // null
      else if(_.isNull(item)) {
        list.push({
          nameType, valueType,
          name  : key,
          value : null
        })
      }
      //................................
      // Array
      if(_.isArray(item)) {
        // Create self
        let node = {
          nameType, valueType: "Array",
          name  : key,
          value : item,
          children : []
        }
        // Join Children
        for(let i=0; i<item.length; i++) {
          let child = item[i]
          this.joinTreeTableRow(node.children, child, i)
        }
        // Join self
        list.push(node)
      }
      //................................
      // Object
      else if(_.isPlainObject(item)) {
        // Create self
        let node = {
          nameType, valueType: "Object",
          name  : key,
          value : item,
          children : []
        }
        // Join Children
        _.forEach(item, (v, k)=>{
          this.joinTreeTableRow(node.children, v, k)
        })
        // Join self
        list.push(node)
      }
      //................................
      // Boolean
      else if(_.isBoolean(item)) {
        list.push({
          nameType, valueType,
          name  : key,
          value : item ? true : false
        })
      }
      //................................
      // Number 
      else if(_.isNumber(item)) {
        list.push({
          nameType, valueType,
          name  : key,
          value : item * 1
        })
      }
      //................................
      // String
      else if(_.isString(item)) {
        list.push({
          nameType, valueType,
          name  : key,
          value : item + ""
        })
      }
    },
    //--------------------------------------
    async doAdd(root={}, path=[]) {
      // Looking for the target from data
      let hie = Ti.Trees.getByPath(this.myTreeRoot, path)
      let target = _.isEmpty(path) ? root : _.get(root, path)
      let isOpened = this.myTreeOpenedStatus[path.join("/")]
      //console.log({root, path, target, hie, isOpened})
      //.....................................
      // Guard: Fail to find the target
      if(!hie) {
        return
      }
      //.....................................
      // If Opened Array
      if(isOpened && _.isArray(target)) {
        // just append the nil at tail
        target.push(null)
      }
      //.....................................
      // If Opened Object
      else if(isOpened && _.isPlainObject(target)) {
        // ask the key
        let newKey = await Ti.Prompt("i18n:json-new-key")
        if(Ti.Util.isNil(newKey)) {
          return
        }
        // and insert nil at the tail
        target[newKey] = null
      }
      //.....................................
      // Other, it must be simple value
      else if(path.length > 0){
        //...................................
        // get the parent node
        let p_ph = path.slice(0, path.length-1);
        let parent = _.isEmpty(p_ph) ? root : _.get(root, p_ph);
        let keyOrIndex = _.last(path)
        //...................................
        // Prepare the new data
        let stub;
        //...................................
        // If array, insert nil after current
        if(_.isArray(parent)) {
          stub = parent
          Ti.Util.insertToArray(parent, keyOrIndex+1, null)
        }
        //...................................
        // If Object
        else if(_.isPlainObject(parent)) {
          // ask the key
          let newKey = await Ti.Prompt("i18n:json-new-key")
          if(Ti.Util.isNil(newKey)) {
            return
          }
          // and insert nil after current path
          stub = Ti.Util.appendToObject(parent, keyOrIndex, {
            [newKey] : null
          })
        }
        //...................................
        // If root, return the stub 
        if(p_ph.length == 0) {
          return stub
        }
        // Set stub
        _.set(root, p_ph, stub)
      }
      //.....................................
      return root
    },
    //--------------------------------------
    doRemove(root={}, path=[]) {
      // Forbid to remove the top
      if(_.isEmpty(path)) {
        return
      }
      //...................................
      // get the candidate for next highlight
      let hie = Ti.Trees.getByPath(this.myTreeRoot, path)
      let can = Ti.Trees.nextCandidate(hie)
      //...................................
      // get the parent node
      let p_ph = path.slice(0, path.length-1);
      let parent = _.isEmpty(p_ph) ? root : _.get(root, p_ph);
      let keyOrIndex = _.last(path)
      //...................................
      // Prepare the new data
      let stub;
      //...................................
      // If array, insert nil after current
      if(_.isArray(parent)) {
        stub = []
        _.forEach(parent, (val, index)=>{
          if(index != keyOrIndex) {
            stub.push(val)
          }
        })
      }
      //...................................
      // If Object
      else if(_.isPlainObject(parent)) {
        stub = {}
        // and insert nil after current path
        _.forEach(parent, (val, key)=>{
          if(key != keyOrIndex) {
            stub[key] = val
          }
        })
      }
      //.....................................
      // Highlight the next
      if(can && can.node) {
        let nextPathId = _.concat(can.path, can.node.name).join("/")
        this.$nextTick(()=>{
          this.myTreeCurrentPathId = nextPathId
        })
      }
      //...................................
      // If root, return the stub 
      if(p_ph.length == 0) {
        return stub
      }
      // Set stub
      _.set(root, p_ph, stub)
      //.....................................
      return root
    },
    //--------------------------------------
    doChangeValueType(root={}, path=[], type) {
      // Get the source
      let isRoot = _.isEmpty(path);
      let src = isRoot ? root : _.get(root, path)
      //.....................................
      // Prepare converter
      let convert = ({
        //...................................
        "Boolean" : (src)=>{
          return src ? true : false
        },
        //...................................
        "Number" : (src)=>{
          let nb = src * 1
          return isNaN(nb) ? -1 : nb
        },
        //...................................
        "Integer" : (src)=>{
          let nb = parseInt(src)
          return isNaN(nb) ? -1 : nb
        },
        //...................................
        "Float" : (src)=>{
          let nb = src * 1
          return isNaN(nb) ? -1 : nb
        },
        //...................................
        "String" : (src)=>{
          // Array/Object
          if(_.isArray(src) || _.isObject(src)) {
            return JSON.stringify(src)
          }
          // Other value
          return src + ""
        },
        //...................................
        "Array" : (src)=>{
          // Array
          if(_.isArray(src)) {
            return
          }
          // Nil
          else if(Ti.Util.isNil(src)) {
            return []
          }
          // Wrap to array
          else {
            return [src]
          }
        },
        //...................................
        "Object" : (src)=>{
          // Array
          if(_.isArray(src)) {
            // Try array as pairs
            let pairs = _.fromPairs(src)
            let stub = {}
            _.forEach(pairs, (val, key)=>{
              if(!Ti.Util.isNil(key) && !_.isUndefined(val)) {
                stub[key] = val
              }
            })
            // Maybe merget it 
            if(_.isEmpty(stub) && !_.isEmpty(src)) {
              Ti.Util.merge(stub, src)
            }
            // Whatever return the object
            return stub
          }
          // Object
          else if(_.isPlainObject(src)) {
            return
          }
          // String try to JSON
          else if(_.isString(src)) {
            return Ti.Types.safeParseJson(src, {
              "value" : src
            })
          }
          // Other value, just wrap to Object
          return {"value": src}
        },
        //...................................
        "Nil" : (src)=>{
          return null
        }
        //...................................
      })[type]
      //.....................................
      // Do convert
      if(_.isFunction(convert)) {
        let stub = convert(src)
        // Canceled
        if(_.isUndefined(stub)) {
          return
        }
        // Root object, return directly
        if(isRoot) {
          return stub
        }
        // Update to main data
        _.set(root, path, stub)
        return root
      }
      //.....................................
      // Fail to find the converter, return undeinfed to cancel
    },
    //--------------------------------------
    async OnNodeItemChange({name, value, data, node, nodeId}={}) {
      //console.log("OnNodeItemChange", {name,value, data, node, nodeId})
      //....................................
      // Guard it
      if(!node.id) {
        return;
      }
      //....................................
      // Prepare the new Data
      let newData = _.cloneDeep(this.value)
      //....................................
      // Get the target JSON path
      let path = node.path
      //....................................
      // Mutate JSON structure
      if(value && value.jsonMutate) {
        let fn = ({
          Add             : this.doAdd,
          Remove          : this.doRemove,
          ChangeValueType : this.doChangeValueType
        })[value.jsonMutate]
        // Invoke it
        newData = await Ti.DoInvoke(fn, _.concat([newData, path], value.args), this)

        // Canceled the mutation
        if(_.isUndefined(newData)) {
          return
        }
      }
      //....................................
      // Modify the Array/Object
      else {
        // Set the Key
        if("name" == name) {
          newData = Ti.Util.setKey(newData, path, value)
        }
        // Set the Value
        else if("value" == name) {
          // Eval the value smartly
          let fn = ({
            "Integer" : (v)=> {
              let v2 = parseInt(v)
              if(isNaN(v2)) {
                return v
              }
              return v2
            },
            "Float" : (v)=> {
              let v2 = v * 1
              if(isNaN(v2)) {
                return v
              }
              return v2
            },
            "Number" : (v)=> {
              let v2 = v * 1
              if(isNaN(v2)) {
                return v
              }
              return v2
            },
            "Nil" : (v)=> {
              return Ti.S.toJsValue(v, {
                autoDate : false
              })
            }
          })[data.valueType]
          let v2 = _.isFunction(fn) ? fn(value) : value
          
          // Set it to data
          _.set(newData, path, v2)
        }
      }
      //....................................
      // Emit the change
      this.$notify("change", newData)
    },
    //--------------------------------------
    OnOpenedStatusChanged(opened) {
      this.myTreeOpenedStatus = opened
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "value" : function(){
      this.evalTreeData()
    }
  },
  //////////////////////////////////////////
  mounted : function() {
    this.evalTreeData()
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/text/json/tree/ti-text-json-tree.mjs", _M);
})();
//============================================================
// JOIN: ti/text/json/tree/_com.json
//============================================================
Ti.Preload("ti/com/ti/text/json/tree/_com.json", {
  "name" : "ti-text-json-tree",
  "globally" : true,
  "i18n" : "@i18n:ti-text-json",
  "template" : "./ti-text-json-tree.html",
  "mixins" : ["./ti-text-json-tree.mjs"],
  "components" : [
    "@com:ti/tree",
    "@com:ti/text/json/tree/item"
  ]
});
//============================================================
// JOIN: ti/text/json/_com.json
//============================================================
Ti.Preload("ti/com/ti/text/json/_com.json", {
  "name" : "ti-text-json",
  "globally" : true,
  "i18n" : "@i18n:ti-text-json",
  "template" : "./ti-text-json.html",
  "mixins" : ["./ti-text-json.mjs"],
  "components" : [
    "@com:ti/gui",
    "@com:ti/text/raw",
    "@com:ti/toggle",
    "@com:ti/text/json/tree"
  ]
});
//============================================================
// JOIN: ti/text/markdown/preview/markdown-preview.html
//============================================================
Ti.Preload("ti/com/ti/text/markdown/preview/markdown-preview.html", `<div class="ti-markdown-preview"
  :class="TopClass">
  <article 
    :class="ThemeClass"
    v-html="myHtml"></article>
  <!--pre>{{myHtml}}</pre-->
</div>`);
//============================================================
// JOIN: ti/text/markdown/preview/markdown-preview.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////////////
  data: ()=>({
    myHtml  : null,
    myTheme : null
  }),
  ///////////////////////////////////////////////////
  props : {
    "mediaBase" : {
      type : String,
      default : undefined
    },
    "value" : {
      type : String,
      default : ""
    }, 
    "placeholder" : {
      type : String,
      default : "i18n:blank"
    },
    "theme" : {
      type : String,
      default : "nice"
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //-----------------------------------------------
    ThemeClass() {
      if(this.myTheme) {
        return `ti-markdown-theme-${this.myTheme}`
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    evalMediaSrc(src) {
      // Falsy src or base
      if(!src || !this.mediaBase) {
        return src
      }
      // Absolute path
      if(/^(https?:\/\/|\/)/i.test(src)) {
        return src
      }
      // Join the base
      return Ti.Util.appendPath(this.mediaBase, src)
    },
    //-----------------------------------------------
    renderMarkdown() {
      if(!Ti.Util.isBlank(this.value)) {
        let MdDoc = Cheap.parseMarkdown(this.value)
        console.log(MdDoc.toString())
        this.myHtml  = MdDoc.toBodyInnerHtml({
          mediaSrc : src => this.evalMediaSrc(src)
        })
        this.myTheme = MdDoc.getMeta("theme", this.theme)
      }
      // Show Blank
      else {
        this.myHtml = Ti.I18n.text(this.placeholder)
        this.myTheme = this.theme
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "value" : {
      handler : "renderMarkdown",
      immediate : true
    }
  }
  ///////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/text/markdown/preview/markdown-preview.mjs", _M);
})();
//============================================================
// JOIN: ti/text/markdown/preview/_com.json
//============================================================
Ti.Preload("ti/com/ti/text/markdown/preview/_com.json", {
  "name" : "ti-text-markdown-preview",
  "globally" : true,
  "template" : "./markdown-preview.html",
  "mixins" : ["./markdown-preview.mjs"]
});
//============================================================
// JOIN: ti/text/markdown/richeditor/markdown-richeditor.html
//============================================================
Ti.Preload("ti/com/ti/text/markdown/richeditor/markdown-richeditor.html", `<div class="ti-markdown-richeditor"
  :class="TopClass">
  <!--
    Toolbar
  -->
  <ti-actionbar 
    v-if="hasToolbar"
      class="as-toolbar"
      :items="ToolbarMenuData" 
      :align="toolbarAlign"
      :status="myToolbarStatus"
      @change="OnToolbarChange"/>
  <!--
    Stage
  -->
  <div ref="stage"
    class="as-stage"
    spellcheck="false"
    :class="ThemeClass"></div>
</div>`);
//============================================================
// JOIN: ti/text/markdown/richeditor/markdown-richeditor.mjs
//============================================================
(function(){
/////////////////////////////////////////////////////
function ResetQuillConfig(Quill) {
  //.................................................
  // Reset once
  if(Quill.__has_been_reset) 
    return
  //.................................................
  // hljs.configure({   // optionally configure hljs
  //   languages: ['javascript', 'ruby', 'python']
  // });
  //.................................................
  // Reset Indent    
  const Indent = Quill.import('formats/indent')
  Indent.keyName = "li-indent"
  Indent.whitelist = [1,2,3,4,5,6]
  //.................................................
  // Mark it
  Quill.__has_been_reset = true
}
/////////////////////////////////////////////////////
const _M = {
  ///////////////////////////////////////////////////
  data: ()=>({
    myMeta : {},
    syncForbid : 0,
    myToolbarStatus : {}
  }),
  ///////////////////////////////////////////////////
  props : {
    //...............................................
    // Data
    //...............................................
    "mediaBase" : {
      type : String,
      default : undefined
    },
    "value" : {
      type : String,
      default : ""
    }, 
    //...............................................
    // Aspact
    //...............................................
    "placeholder" : {
      type : String,
      default : "i18n:blank"
    },
    "theme" : {
      type : String,
      default : "nice"
    },
    "toolbar" : {
      type : Array,
      default : ()=>[
        "Heading", "|", "B", "I", "|", "Link", "Code", 
        "|", "BlockQuote", "CodeBlock", 
        "|", "Outdent", "Indent",  
        "|", "UL", "OL",
        "|", "Media"
        ]
    },
    "toolbarAlign" : {
      type : String,
      default: "left",
      validator : v => /^(left|right|center)$/.test(v)
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //-----------------------------------------------
    ThemeClass() {
      if(this.ThemeName) {
        return `ti-markdown-theme-${this.ThemeName}`
      }
    },
    //-----------------------------------------------
    ThemeName() {
      return _.get(this.myMeta, "theme") || this.theme
    },
    //-----------------------------------------------
    hasToolbar() {
      return !_.isEmpty(this.ToolbarMenuData)
    },
    //-----------------------------------------------
    ToolbarMenuData() {
      let list = []
      _.forEach(this.toolbar, v => {
        let it = ({
          //.........................................
          "|" : {type : "line"},
          //.........................................
          "B" : {
            icon : "fas-bold",
            notify: "bold",
            highlight : "bold",
            disabled : "italic"
          },
          //.........................................
          "I" : {
            icon : "fas-italic",
            notify : "italic",
            highlight : "italic",
            disabled : "bold"
          },
          //.........................................
          "Link" : {
            icon : "fas-link",
            notify : "link",
            highlight : "link"
          },
          //.........................................
          "Code" : {
            icon : "zmdi-code",
            notify : "code",
            highlight : "code"
          },
          //.........................................
          "Heading" : {
            type : "group",
            icon : "fas-hashtag",
            text : "i18n:wordp-heading",
            items : [{
                text: "i18n:wordp-h1",
                notify: "header",
                highlight : "h1",
                value: 1
              }, {
                text: "i18n:wordp-h2",
                notify: "header",
                highlight : "h2",
                value: 2
              }, {
                text: "i18n:wordp-h3",
                notify: "header",
                highlight : "h3",
                value: 3
              }, {
                text: "i18n:wordp-h4",
                notify: "header",
                highlight : "h4",
                value: 4
              }, {
                text: "i18n:wordp-h5",
                notify: "header",
                highlight : "h5",
                value: 5
              }, {
                text: "i18n:wordp-h6",
                notify: "header",
                highlight : "h6",
                value: 6
              }, {
                text: "i18n:wordp-h0",
                notify: "header",
                highlight : "h0",
                value:  0
              }]
          },
          //.........................................
          "BlockQuote" : {
            icon : "fas-quote-right",
            notify : "blockquote",
            highlight : "blockquote"
          },
          //.........................................
          "CodeBlock" : {
            icon : "fas-code",
            notify : "code_block",
            highlight : "code-block"
          },
          //.........................................
          "Indent" : {
            icon : "fas-indent",
            notify: "indent"
          },
          //.........................................
          "Outdent" : {
            icon : "fas-outdent",
            notify: "outdent"
          },
          //.........................................
          "UL" : {
            icon : "fas-list-ul",
            notify : "list",
            value : "bullet",
            highlight: {list:"bullet"}
          },
          //.........................................
          "OL" : {
            icon : "fas-list-ol",
            notify : "list",
            value : "ordered",
            highlight: {list:"ordered"}
          },
          //.........................................
          "Media" : {
            icon : "fas-photo-video",
            action : "$parent:OnInsertMedia"
          },
          //.........................................
        })[v]
        //...........................................
        if(it) {
          list.push(it)
        }
        //...........................................
      })
      // list.push({
      //   text: "HL",
      //   action : "$parent:highlightCode"
      // })
      return list;
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    // Events
    //-----------------------------------------------
    OnToolbarChange({name, value}={}) {
      console.log({name, value})
      const fn = ({
        //...........................................  
        bold  ($q, val){$q.format("bold", val)},
        italic($q, val){$q.format("italic", val)},
        code($q, val){$q.format("code", val)},
        //...........................................
        header($q, val) {$q.format("header", val)},
        //...........................................
        blockquote($q, val){$q.format("blockquote", val)},
        code_block($q, val){$q.format("code-block", val)},
        //..........................................
        async link($q, val){
          let range = $q.getSelection()
          if(!range) {
            return await Ti.Toast.Open("i18n:wordp-nil-sel", "warn")
          }
          // Insert link
          if(val) {
            if(range.length > 0) {
              let href = await Ti.Prompt("i18n:wordp-link");
              if(!Ti.Util.isNil(href)) {
                let op = $q.format("link", href)
              }
            }
            // Warn user
            else {
              return await Ti.Toast.Open("i18n:wordp-nil-sel", "warn")
            }
          }
          // Remove link
          else {
            $q.format("link", false)
          }
        },
        //...........................................
        indent ($q){$q.format("indent", "+1")},
        outdent($q){$q.format("indent", "-1")},
        //...........................................
        list($q, val="bullet"){$q.format("list", val)}
        //...........................................
      })[name]
      //.............................................
      // Invoke
      if(_.isFunction(fn)) {
        fn(this.$editor, value)
        this.quillUpdateFormat()
      }
      //.............................................
    },
    //-----------------------------------------------
    async OnInsertMedia() {
      let list = await Wn.OpenObjSelector()

      // User cancel
      if(!list || _.isEmpty(list)) {
        return
      }
      
      for(let obj of list) {
        let home = Wn.Session.getHomePath();
        let rph = Ti.Util.getRelativePath(home, obj.ph, "")
        let aph = Ti.Util.appendPath("~", rph)
        let src = `/o/content?str=${aph}`
        // Video
        if(obj.mime && obj.mime.startsWith("video")) {
          this.insertMedia("video", src, {
            controls : false,
            autoplay : false
          })
        }
        // Image
        else {
          this.insertMedia("image", src)
        }
      }
    },
    //-----------------------------------------------
    // Insert Operation
    //-----------------------------------------------
    insertMedia(type="image", src, attrs={}) {
      // Guard
      if(!src) {
        return
      }

      // Prepare the Delta
      let Delta = Quill.import("delta")
      let det = new Delta()

      // Insert to current position
      let sel = this.$editor.getSelection()
      console.log("selection", sel)

      if(!sel) {
        this.$editor.setSelection(0)
        sel = {index:0, length:0}
      }

      let {index,length} = sel

      // Move to current
      det.retain(index)
            
      // Delete current
      if(length > 0) {
          det.delete(length)
      }

      // Add Media
      det.insert({[type]: src, attributes: attrs})
     
      // Update 
      this.$editor.updateContents(det)

      // Move cursor
      this.$editor.setSelection(index+1)
    },
    //-----------------------------------------------
    // Utility
    //-----------------------------------------------
    //-----------------------------------------------
    // Rendering
    //-----------------------------------------------
    // evalMediaSrc(src) {
    //   // Falsy src or base
    //   if(!src || !this.mediaBase) {
    //     return src
    //   }
    //   // Absolute path
    //   if(/^(https?:\/\/|\/)/i.test(src)) {
    //     return src
    //   }
    //   // Join the base
    //   return Ti.Util.appendPath(this.mediaBase, src)
    // },
    //-----------------------------------------------
    renderMarkdown() {
      console.log("!!!!!!!!!!!!!!!!!!!!!! renderMarkdown")
      if(!Ti.Util.isBlank(this.value)) {
        // Parse markdown
        let MdDoc = Cheap.parseMarkdown(this.value)
        console.log(MdDoc.toString())
        window.MdDoc = MdDoc
        this.myMeta = _.cloneDeep(MdDoc.getMeta())

        // Get delta
        let delta = MdDoc.toDelta()
        //console.log(JSON.stringify(delta, null, '   '))

        // Update Quill editor content
        this.$editor.setContents(delta);
        
      }
      // Show Blank
      else {
        this.myMeta = {}
      }
    },
    //-----------------------------------------------
    syncMarkdown() {
      if(this.syncForbid > 0) {
        this.syncForbid --
        return
      }
      this.renderMarkdown()
    },
    //-----------------------------------------------
    // Highlight
    //-----------------------------------------------
    highlightCode() {
      for(let $code of this.$refs.stage.querySelectorAll("pre")) {
        console.log($code)
        hljs.highlightBlock($code)
      }
    },
    //-----------------------------------------------
    // Quill
    //-----------------------------------------------
    quillChanged(delta) {
      console.log("changed", JSON.stringify(delta, null, '  '))
      let MdDoc = Cheap.parseDelta(delta)
      MdDoc.setDefaultMeta(this.myMeta)
      this.myMeta = MdDoc.getMeta()
      console.log(MdDoc.toString())
      let markdown = MdDoc.toMarkdown()
      console.log(markdown)
      if(markdown != this.value) {
        this.syncForbid = 1
        this.$notify("change", markdown)
      }
    },
    //-----------------------------------------------
    quillSelectionChanged(range) {
      // Update selection info
      if(range) {
        // Indicate row:col
        let ii = [range.index]
        if(range.length > 0) {
          ii.push(range.length)
        }
        this.$notify("indicate", ii.join(":"))

        // Update format
        this.quillUpdateFormat(range)
      }
    },
    //-----------------------------------------------
    quillUpdateFormat(range) {
      let fmt = this.$editor.getFormat(range)
      //console.log(fmt)
      //fmt = _.cloneDeep(fmt)
      if(fmt.header) {
        fmt[`h${fmt.header}`] = true
      } else {
        fmt["h0"] = true
      }
      if(!_.isEqual(this.myToolbarStatus, fmt)) {
        this.myToolbarStatus = fmt
      }
    },
    //-----------------------------------------------
    installQuillEditor() {
      // Guard
      if(this.$editor) {
        return
      }
      //.............................................
      // Reset the Quill Default
      ResetQuillConfig(Quill)
      //Quill.register(MyIndent)
      //.............................................
      this.$editor = new Quill(this.$refs.stage, {
        modules: {
          syntax: false
        },
        bounds : this.$refs.stage,
        placeholder : Ti.I18n.text(this.placeholder)
      });
      //.............................................
      this.debounceQuillChanged = _.debounce((newDelta, oldDelta)=>{
        let delta = oldDelta.compose(newDelta)
        this.quillChanged(delta)
      }, 1000)
      //.............................................
      this.$editor.on("text-change", (newDelta, oldDelta, source)=>{
        this.debounceQuillChanged(newDelta, oldDelta)
      })
      //.............................................
      this.$editor.on("selection-change", (range, oldRange, source)=>{
        this.quillSelectionChanged(range)
      })
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "value" : {
      handler : "syncMarkdown"
    }
  },
  ///////////////////////////////////////////////////
  mounted: function() {
    this.installQuillEditor()
    this.syncMarkdown()
  }
  ///////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/text/markdown/richeditor/markdown-richeditor.mjs", _M);
})();
//============================================================
// JOIN: ti/text/markdown/richeditor/_com.json
//============================================================
Ti.Preload("ti/com/ti/text/markdown/richeditor/_com.json", {
  "name" : "ti-text-markdown-richeditor",
  "globally" : true,
  "i18n" : "@i18n:ti-text-editor",
  "template" : "./markdown-richeditor.html",
  "css" : "@deps:highlight/default.css",
  "mixins" : ["./markdown-richeditor.mjs"],
  "components" : [
    "@com:wn/adaptlist"
  ],
  "deps" : [
    "@deps:quill/quill.js",
    "@deps:highlight/highlight.js"
  ]
});
//============================================================
// JOIN: ti/text/raw/ti-text-raw.html
//============================================================
Ti.Preload("ti/com/ti/text/raw/ti-text-raw.html", `<div class="ti-text-raw"
  :class="TopClass"
  v-ti-activable>
  <!--
    Show Editor
  -->
  <template v-if="hasContent || showTitle">
    <div
      v-if="showTitle"
        class="te-head"
        :class="HeadClass">
        <ti-icon class="center" :value="icon"/>
        <b>{{title}}</b>
    </div>
    <div class="te-main">
      <textarea ref="text" 
        spellcheck="false"
        :placeholder="placeholder"
        :value="myContent"
        @keyup="OnTextareaKeyup"
        @change="OnContentChanged"
      ></textarea>
    </div>
  </template>
  <!--
    Show Blank
  -->
  <ti-loading 
    v-else
      icon="zmdi-alert-circle-o"
      :text="blankText"/>
</div>`);
//============================================================
// JOIN: ti/text/raw/ti-text-raw.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////////////
  model : {
    prop  : "content",
    event : "change"
  },
  ///////////////////////////////////////////////////
  data : ()=>({
    myContent : null
  }),
  ///////////////////////////////////////////////////
  props : {
    "icon" : {
      type : [String, Object],
      default : "im-hashtag"
    },
    "title" : {
      type : String,
      default : "No Title"
    },
    "showTitle" : {
      type : Boolean,
      default : true
    },
    "trimed" : {
      type : Boolean,
      default : false
    },
    "value" : {
      type : String,
      default : ""
    }, 
    "status" : {
      type : Object,
      default : ()=>{
        changed : false
      }
    },
    "ignoreKeyUp" : {
      type : Boolean,
      default : false
    },
    "blankText" : {
      type : String,
      default : "i18n:blank"
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopClass() {
      return this.getTopClass({
        "show-title" : this.showTitle,
        "hide-title" : !this.showTitle
      })
    },
    //-----------------------------------------------
    HeadClass() {
      return {
        "content-changed" : this.isContentChanged
      }
    },
    //-----------------------------------------------
    hasContent() {
      return !Ti.Util.isNil(this.value)
    },
    //-----------------------------------------------
    placeholder() {
      return Ti.I18n.text(this.blankText)
    },
    //-----------------------------------------------
    isContentChanged() {
      if(this.ignoreKeyUp) {
        return this.myContent != this.value
      }
      return _.get(this.status, "changed")
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    getContent() {
      return this.myContent
    },
    //-----------------------------------------------
    checkContentChanged(emit=true) {
      let vm = this
      let $t = vm.$refs.text
      if(_.isElement($t)) {
        let txt = $t.value
        if(this.trimed) {
          txt = _.trim(txt)
        }
        this.myContent = txt
        if(emit && txt != this.value) {
          vm.$notify("change", txt)
        }
      }
    },
    //-----------------------------------------------
    onTextareaKeyup() {
      this.checkContentChanged(!this.ignoreKeyUp)
    },
    //-----------------------------------------------
    OnContentChanged() {
      this.checkContentChanged(true)
    },
    //-----------------------------------------------
    __ti_shortcut(uniqKey) {
      if("CTRL+ENTER" == uniqKey) {
        this.checkContentChanged()
        return {prevent:true}
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "value" : function() {
      this.myContent = this.value
    }
  },
  ///////////////////////////////////////////////////
  created : function() {
    this.OnTextareaKeyup = _.debounce(()=>{
      this.checkContentChanged(!this.ignoreKeyUp)
    }, 500)
  },
  ///////////////////////////////////////////////////
  mounted : function() {
    this.myContent = this.value
  }
  ///////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/text/raw/ti-text-raw.mjs", _M);
})();
//============================================================
// JOIN: ti/text/raw/_com.json
//============================================================
Ti.Preload("ti/com/ti/text/raw/_com.json", {
  "name" : "ti-text-raw",
  "globally" : true,
  "template" : "./ti-text-raw.html",
  "mixins" : ["./ti-text-raw.mjs"]
});
//============================================================
// JOIN: ti/time/ti-time.html
//============================================================
Ti.Preload("ti/com/ti/time/ti-time.html", `<div class="ti-col-data as-time" 
  :class="topClass" 
  :style="topStyle">
  <ti-list v-for="list in theListGroup"
    :key="list.key"
    :data="list.data"
    :display="'text'"
    :current-id="list.currentId"
    :cancelable="false"
    @select="onListSelected(list.key, $event)"/>
</div>`);
//============================================================
// JOIN: ti/time/ti-time.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "value" : {
      type : [String, Number, Date, Ti.Types.Time],
      default : null
    },
    /***
     * Value unit when value is Number
     */
    "valueUnit" : {
      type : String,
      default : "s",
      validator : function(unit) {
        return /^(ms|s|min|hr)$/.test(unit)
      }
    },
    // Display mode
    "mode" : {
      type : String,
      default : "auto",
      /***
       * - `sec`  : "HH:mm:ss"
       * - `min`  : "HH:mm"
       * - `auto` : "HH:mm:ss"
       */
      validator : function(unit) {
        return /^(sec|min|auto)$/.test(unit)
      }
    },
    // the height of drop list
    "width" : {
      type : [Number, String],
      default : null
    },
    // the height of drop list
    "height" : {
      type : [Number, String],
      default : 200
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    topStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //------------------------------------------------
    theTime() {
      return Ti.Types.toTime(this.value||0, {
        unit: this.valueUnit
      })
    },
    //------------------------------------------------
    theListGroup() {
      let re = [
        this.createList("hours",   0, 24, this.theTime.hours),
        this.createList("minutes", 0, 60, this.theTime.minutes)
      ]
      if(/^(auto|sec)$/.test(this.mode)) {
        re.push(this.createList("seconds", 0, 60, this.theTime.seconds))
      }
      return re
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    createList(key, fromVal, toVal, currentVal=0) {
      let list = {
        key,
        currentId : `R-${currentVal}`,
        data    : []
      }
      for(let i=fromVal; i<toVal; i++) {
        list.data.push({
          id : `R-${i}`,
          value : i,
          text  : _.padStart(i, 2, '0')
        })
      }
      return list
    },
    //------------------------------------------------
    onListSelected(key, {current}={}) {
      let tm = this.theTime.clone()
      tm[key] = _.get(current, "value") || 0
      this.$notify("change", tm)
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/time/ti-time.mjs", _M);
})();
//============================================================
// JOIN: ti/time/_com.json
//============================================================
Ti.Preload("ti/com/ti/time/_com.json", {
  "name" : "ti-time",
  "globally" : true,
  "template" : "./ti-time.html",
  "mixins" : ["./ti-time.mjs"],
  "components" : ["@com:ti/list"]
});
//============================================================
// JOIN: ti/toggle/ti-toggle.html
//============================================================
Ti.Preload("ti/com/ti/toggle/ti-toggle.html", `<div class="ti-toggle"
  :class="topClass">
  <aside @click.left="onClick"><b></b></aside>
</div>`);
//============================================================
// JOIN: ti/toggle/ti-toggle.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  data : ()=>({
    isOn : false
  }),
  /////////////////////////////////////////
  props : {
    "value" : false,
    "readonly" : false,
    "options" : {
      type: Array,
      default: ()=>[false, true]
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    topClass() {
      return Ti.Css.mergeClassName({
        "is-off" : !this.isOn,
        "is-on"  : this.isOn
      }, this.className)
    }
    //......................................
  },
  //////////////////////////////////////////
  methods : {
    onClick() {
      if(!this.readonly) {
        let v = this.isOn ? 0 : 1
        this.$notify("change", this.options[v])
      }
    }
  },
  //////////////////////////////////////////
  watch : {
    "value" : function() {
      this.isOn = this.value ? true : false
    }
  },
  //////////////////////////////////////////
  mounted : function() {
    this.isOn = this.value ? true : false
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/toggle/ti-toggle.mjs", _M);
})();
//============================================================
// JOIN: ti/toggle/_com.json
//============================================================
Ti.Preload("ti/com/ti/toggle/_com.json", {
  "name" : "ti-toggle",
  "globally" : true,
  "template" : "./ti-toggle.html",
  "mixins" : ["./ti-toggle.mjs"]
});
//============================================================
// JOIN: ti/transfer/ti-transfer-props.mjs
//============================================================
(function(){
const _M = {
  //-----------------------------------
  // Data
  //-----------------------------------
  // option() -> all list
  // option(inputing) -> condition list
  "options" : {
    type : [String, Array, Function, Ti.Dict],
    default : ()=>[]
  },
  "valueBy" : {
    type : [String, Function],
    default : undefined
  },
  "textBy" : {
    type : [String, Function],
    default : undefined
  },
  "iconeBy" : {
    type : [String, Function],
    default : undefined
  },
  "value" : undefined,
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "canComType" : {
    type : String,
    default : undefined
  },
  "canComConf" : {
    type : Object,
    default : undefined
  },
  "selComType" : {
    type : String,
    default : undefined
  },
  "selComConf" : {
    type : Object,
    default : undefined
  },
  "filter" : {
    type : Boolean,
    default : true
  },
  "fltComType" : {
    type : String,
    default : "ti-input"
  },
  "fltComConf" : {
    type : Object,
    default : undefined
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "display" : {
    type : [Object, String, Array],
    default : undefined
  },
  "assignButtons" : {
    type : Object,
    default : ()=>({
      add    : "fas-angle-double-right",
      remove : "fas-angle-double-left"
    })
  },
  "canTitle" : {
    type : String,
    default : "i18n:candidate"
  },
  "selTitle" : {
    type : String,
    default : "i18n:checked"
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "width" : {
    type : [Number, String],
    default : null
  },
  "height" : {
    type : [Number, String],
    default : null
  }
}
Ti.Preload("ti/com/ti/transfer/ti-transfer-props.mjs", _M);
})();
//============================================================
// JOIN: ti/transfer/ti-transfer.html
//============================================================
Ti.Preload("ti/com/ti/transfer/ti-transfer.html", `<div class="ti-transfer"
  :class="TopClass"
  :style="TopStyle">
  <!--=========================================
    Left: Candidates
  -->
  <div class="as-box as-can-list">
    <!--
      Head
    -->
    <div class="as-box-head">
      <div class="as-list-checker"
        @click.left="OnClickHeadChecker(can)">
        <ti-icon :value="GetHeadCheckerIcon(can)"/>
      </div>
      <!--Title-->
      <div class="as-title">{{canTitle|i18n}}</div>
      <!--Filter-->
      <div v-if="filter"
        class="as-filter">
          <component 
            :is="fltComType"
            v-bind="FilterComConf"
            :value="myFilterValue"
            @change="OnFilterChanged"
            /></div>
    </div>
    <!--
      component
    -->
    <component :is="CanListComType"
      class="as-box-main ti-fill-parent"
      v-bind="CanListComConf"
      @select="OnCanListSelected"/>
    <!--
      Foot
    -->
    <div class="as-box-foot">
      <span>{{'total-count'|i18n({nb:can.data.length})}}</span>
    </div>
  </div>
  <!--=========================================
    Buttons
  -->
  <div class="as-buttons">
    <!--Add-->
    <div class="as-btn is-add"
      @click.left="canListToSel">
      <ti-icon :value="assignButtons.add"/>
    </div>
    <!--Remove-->
    <div class="as-btn is-remove"
      @click.left="selListToCan">
      <ti-icon :value="assignButtons.remove"/>
    </div>
  </div>
  <!--=========================================
    Right: Checked
  -->
  <div class="as-box as-sel-list">
    <!--
      Head
    -->
    <div class="as-box-head">
      <div class="as-list-checker"
        @click.left="OnClickHeadChecker(sel)">
        <ti-icon :value="GetHeadCheckerIcon(sel)"/>
      </div>
      <div class="as-title">{{selTitle|i18n}}</div>
    </div>
    <!--
      component
    -->
    <component :is="SelListComType"
      class="as-box-main ti-fill-parent"
      v-bind="SelListComConf"
      @select="OnSelListSelected"/>
    <!--
      Foot
    -->
    <div class="as-box-foot">
      <span>{{'total-count'|i18n({nb:sel.data.length})}}</span>
    </div>
  </div>
</div>`);
//============================================================
// JOIN: ti/transfer/ti-transfer.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ///////////////////////////////////////////////////////
  data : ()=>({
    myFilterValue : null,
    myOptionsData : [],
    can : {
      data : [],
      checkedIds : []
    },
    sel : {
      data : [],
      checkedIds : []
    },
    selIdMap : {}
  }),
  ///////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //------------------------------------------------
    Values() {
      return Ti.S.toArray(this.value)
    },
    //------------------------------------------------
    CanListComType() {return this.canComType || "ti-list"},
    SelListComType() {return this.selComType || "ti-list"},
    //------------------------------------------------
    CanListComConf() {
      return this.genComConf(this.canComConf, this.can)
    },
    SelListComConf() {
      return this.genComConf(this.selComConf, this.sel)
    },
    //------------------------------------------------
    FilterComConf() {
      return _.assign({
        trimed      : true,
        width       : "100%",
        prefixIcon  : "zmdi-filter-list",
        placeholder : "i18n:filter",
        hover       : ['prefixIcon','suffixText','suffixIcon']
      }, this.fltComConf)
    },
    //------------------------------------------------
    GetValueBy() {
      return it => this.Dict.getValue(it)
    },
    //------------------------------------------------
    Dict() {
      // Customized
      if(this.options instanceof Ti.Dict) {
        return this.options
      }
      // Refer dict
      if(_.isString(this.options)) {
        let dictName = Ti.DictFactory.DictReferName(this.options)
        if(dictName) {
          return Ti.DictFactory.CheckDict(dictName, ({loading}) => {
            this.loading = loading
          })
        }
      }
      // Auto Create
      return Ti.DictFactory.CreateDict({
        data: this.options,
        getValue : Ti.Util.genGetter(this.valueBy || "value"),
        getText  : Ti.Util.genGetter(this.textBy  || "text|name"),
        getIcon  : Ti.Util.genGetter(this.textBy  || "icon")
      })
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods : {
    //---------------------------------------------------
    OnCanListSelected({checkedIds}) {
      this.can.checkedIds = this.getIds(checkedIds)
    },
    //---------------------------------------------------
    OnSelListSelected({checkedIds}) {
      this.sel.checkedIds = this.getIds(checkedIds)
    },
    //---------------------------------------------------
    OnClickHeadChecker(list) {
      let {data, checkedIds} = list
      // All -> none
      if(data.length == checkedIds.length) {
        list.checkedIds = []
      }
      // Others to All
      else {
        let idMap = this.rebuildIdMap(data)
        list.checkedIds = this.getIds(idMap)
      }
    },
    //---------------------------------------------------
    async OnFilterChanged(val) {
      this.myFilterValue = val
      this.myOptionsData = await this.Dict.queryData(val)
      this.evalShownCanList()
    },
    //---------------------------------------------------
    GetHeadCheckerIcon({data, checkedIds}) {
      if(data.length > 0) {
        // All
        if(data.length == checkedIds.length) {
          return "fas-check-square"
        }
        // Partally
        if(checkedIds.length > 0) {
          return  "fas-minus-square"
        }
      }
      return "far-square" // none
    },
    //---------------------------------------------------
    // Core Methods
    //---------------------------------------------------
    canListToSel() {
      // Guard
      if(_.isEmpty(this.can.checkedIds))
        return
      // Assign
      let {src, tag} = this.assignToList(this.can, this.sel)
      this.can = src
      this.sel = tag
    },
    //---------------------------------------------------
    selListToCan() {
      // Guard
      if(_.isEmpty(this.sel.checkedIds))
        return
      // Assign
      let {src, tag} = this.assignToList(this.sel,this.can)
      this.can = tag
      this.sel = src
    },
    //---------------------------------------------------
    // Utility
    //---------------------------------------------------
    assignToList({data, checkedIds}, ta) {
      // Make ids map
      let ids = {}
      _.forEach(checkedIds, v=>ids[v]=true)
      // pick remove list
      let remains = []
      let joins = []
      _.forEach(data, it => {
        let itV = this.Dict.getValue(it)
        if(ids[itV]) {
          joins.push(it)
        } else {
          remains.push(it)
        }
      })
      // Merge checked ids
      _.forEach(ta.checkedIds, v=>ids[v]=true)
      // Join to new list
      return {
        src : {
          data: remains, checkedIds: []
        },
        tag : {
          data      : _.concat(ta.data, joins),
          checkedIds: _.keys(ids)
        }
      }
    },
    //---------------------------------------------------
    genComConf(comConf, {data, checkedIds}) {
      return _.assign({
        idBy      : this.GetValueBy,
        display   : this.display || "text"
      }, comConf, {
        data,  checkedIds,
        multi            : true,
        checkable        : true,
        puppetMode       : true,
        autoCheckCurrent : false,
      })
    },
    //---------------------------------------------------
    evalShownCanList() {
      let list = []
      _.forEach(this.myOptionsData, it => {
        let itV = this.Dict.getValue(it)
        if(!this.selIdMap[itV]) {
          list.push(it)
        }
      })
      this.can.data = list
      this.can.checkedIds = []
    },
    //---------------------------------------------------
    async reloadCanList() {
      //console.log("reloadCanList")
      this.myOptionsData = await this.Dict.queryData(this.myFilterValue)
      this.evalShownCanList()
    },
    //---------------------------------------------------
    async reloadSelList(vals=this.Values) {
      //console.log("reloadSelList")
      let list = []
      for(let v of vals) {
        let it = await this.Dict.getItem(v)
        if(it) {
          list.push(it)
        } else {
          list.push(v)
        }
      }
      this.sel = {
        data: list,
        checkedIds : []
      }
    },
    //---------------------------------------------------
    rebuildIdMap(data) {
      let ids = {}
      _.forEach(data, it => {
        let itV = this.Dict.getValue(it)
        ids[itV] = true
      })
      return ids
    },
    //---------------------------------------------------
    rebuildSelIdMap() {
      this.selIdMap = this.rebuildIdMap(this.sel.data)
    },
    //---------------------------------------------------
    getIds(idMap) {
      let ids = []
      _.forEach(idMap, (v, id)=>{
        if(v)
          ids.push(id)
      })
      return ids
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  watch : {
    "value" : function(newVal, oldVal) {
      if(!_.isEqual(newVal, oldVal)) {
        this.reloadSelList()
      }
    },
    "options" : function(newVal, oldVal) {
      if(!_.isEqual(newVal, oldVal)) {
        this.reloadCanList()
      }
    },
    "sel.data" : function() {
      this.rebuildSelIdMap()
      let ids = _.keys(this.selIdMap)
      if(!_.isEqual(ids, this.Values)) {
        this.$notify("change", ids)
      }
    }
  },
  ///////////////////////////////////////////////////////
  mounted : async function() {
    await this.reloadSelList()
    await this.reloadCanList()
  }
  ///////////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/transfer/ti-transfer.mjs", _M);
})();
//============================================================
// JOIN: ti/transfer/_com.json
//============================================================
Ti.Preload("ti/com/ti/transfer/_com.json", {
  "name" : "ti-transfer",
  "globally" : true,
  "template" : "./ti-transfer.html",
  "props" : "./ti-transfer-props.mjs",
  "mixins" : ["./ti-transfer.mjs"]
});
//============================================================
// JOIN: ti/tree/ti-tree.html
//============================================================
Ti.Preload("ti/com/ti/tree/ti-tree.html", `<ti-table
  class="ti-tree"
  :class="TopClass"
  id-by="id"
  icon-by="icon"
  indent-by="indent"
  raw-data-by="rawData"
  :fields="TableFields"
  :data="myTreeTableData"
  :changed-id="changedId"
  :current-id="currentId"
  :checked-ids="checkedIds"
  :multi="multi"
  :checkable="checkable"
  :selectable="selectable"
  :cancelable="cancelable"
  :hoverable="hoverable"
  :puppet-mode="puppetMode"
  :width="width"
  :height="height"
  :head="TableHead"
  :border="border"
  :blank-as="blankAs"
  :auto-scroll-into-view="autoScrollIntoView"
  @icon="OnRowIconClick"
  @open="OnRowOpen"
  @select="OnRowSelect"
  @cell:item:change="OnCellItemChange"/>
  `);
//============================================================
// JOIN: ti/tree/ti-tree.mjs
//============================================================
(function(){
const TI_TREE = {
  //////////////////////////////////////////
  data : ()=>({
    "myTreeTableData"   : [],
    "myOpenedNodePaths" : {},
    "myCurrentId"       : null
  }),
  //////////////////////////////////////////
  props : {
    "nodeClassName" : {
      type : String,
      default : null
    },
    // The list to be rendered
    "data" : {
      type : [Object, Array],
      default : null
    },
    "idBy" : {
      type : [String, Function],
      default : "id"
    },
    "nameBy" : {
      type : [String, Function],
      default : "name"
    },
    "childrenBy" : {
      type : [String, Function],
      default : "children"
    },
    "leafBy" : {
      type    : [String, Function],
      default : "!children"
    },
    "title" : {
      type : String,
      default : 'i18n:title'
    },
    "mainWidth" : {
      type : [String, Number],
      default : 'stretch'
    },
    "display" : {
      type : [String, Object, Array],
      default : "name"
    },
    // Default to open the node in depth.
    // the top node depth is 1, which is eqausl the path array length.
    // If 0, it will close all top leavel nodes
    "defaultOpenDepth" : {
      type : Number,
      default : 0
    },
    // Local store to save the tree open status
    "keepOpenBy" : {
      type : String,
      default : null
    },
    "keepCurrentBy" : {
      type : String,
      default : null
    },
    "changedId" : {
      type : String,
      default : null
    },
    "currentId" : {
      type : String,
      default : null
    },
    "checkedIds" : {
      type : Array,
      default : ()=>[]
    },
    "openedNodePaths" : {
      type : Object,
      default : ()=>({})
    },
    "multi" : {
      type : Boolean,
      default : false
    },
    "checkable" : {
      type : Boolean,
      default : false
    },
    // select item
    "selectable" : {
      type : Boolean,
      default : true
    },
    "cancelable" : {
      type : Boolean,
      default : true
    },
    "hoverable" : {
      type : Boolean,
      default : false
    },
    "width" : {
      type : [String, Number],
      default : null
    },
    "puppetMode" : {
      type : Boolean,
      default : false
    },
    "height" : {
      type : [String, Number],
      default : null
    },
    "autoScrollIntoView" : {
      type : Boolean,
      default : true
    },
    "autoOpen" : {
      type : Boolean,
      default : false
    },
    "showRoot" : {
      type : Boolean,
      default : true
    },
    "nodeHandleIcons" : {
      type : Array,
      default : ()=>[
        "zmdi-chevron-right",
        "zmdi-chevron-down"]
    },
    "border" : {
      type : String,
      default : "column",
      validator : v => /^(row|column|cell|none)$/.test(v)
    },
    // "extendFunctionSet" : {
    //   type : Object,
    //   default : ()=>({})
    // },
    "fields" : {
      type : Array,
      default : ()=>[]
    },
    "blankAs" : undefined
  },
  //////////////////////////////////////////
  watch : {
    
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return Ti.Css.mergeClassName({
        "is-selectable"  : this.selectable,
        "is-hoverable"   : this.hoverable
      }, this.className)
    },
    //--------------------------------------
    getNodeId() {
      if(_.isFunction(this.idBy)) {
        return (it)=>this.idBy(it)
      }
      return (it)=>_.get(it, this.idBy)
    },
    //--------------------------------------
    getNodeName() {
      if(_.isFunction(this.nameBy)) {
        return it => this.nameBy(it)
      }
      return it => _.get(it, this.nameBy)
    },
    //--------------------------------------
    isNodeLeaf() {
      if(_.isFunction(this.leafBy)) {
        return it => (this.leafBy(it) ? true : false)
      }
      // Not
      let m = /^(!)?(.+)$/.exec(this.leafBy)
      let isNot = m[1] ? true : false
      let keyPath = _.trim(m[2])
      return it => (_.get(it, keyPath) ? !isNot : isNot)
    },
    //--------------------------------------
    getNodeChildren() {
      if(_.isFunction(this.childrenBy)) {
        return it => this.childrenBy(it)
      }
      return it => _.get(it, this.childrenBy)
    },
    //--------------------------------------
    isTable() {
      return _.isArray(this.fields) && !_.isEmpty(this.fields)
    },
    //--------------------------------------
    TableHead() {
      if(this.isTable) {
        return "frozen"
      }
      return "none"
    },
    //--------------------------------------
    TableFields() {
      let mainCol = {
        title   : this.title,
        width   : this.mainWidth,
        nowrap  : true,
        display : this.display
      }
      if(this.isTable) {
        return _.concat(mainCol, this.fields)
      }
      return [mainCol]
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    async evalTreeTableData() {
      // if(_.get(this.data, "value.title"))
      //     console.log("evalTreeTableData", _.get(this.data, "value.title"))
      let tableData = []

      //if(this.showRoot)
      //console.log("evalTreeTableData", this.data)

      // Array push to root
      if(_.isArray(this.data)) {
        await this.joinTreeTableRow(tableData, {}, null, this.data)
      }
      // already has root
      else if(this.data){
        await this.joinTreeTableRow(tableData, this.data, null)
      }

      this.myTreeTableData = tableData
    },
    //--------------------------------------
    async joinTreeTableRow(rows=[], item={}, path=[], children) {
      // if(this.showRoot)
      //console.log("joinTreeTableRow", item)
      let self = {}
      //....................................
      // For ROOT
      if(!path) {
        self.name = this.getNodeName(item) || "$ROOT$"
        self.path = []
        self.pathId = "/"
        self.id = Ti.Util.fallbackNil(this.getNodeId(item), self.pathId)
        self.indent = 0
        self.leaf   = false
        self.opened = !this.showRoot
          ? true 
          : Ti.Util.fallback(
              this.myOpenedNodePaths[self.pathId], 
              self.indent < this.defaultOpenDepth);
        self.icon   = self.leaf ? true : this.nodeHandleIcons[self.opened ? 1 : 0]
      }
      // Others node
      else {
        self.name   = this.getNodeName(item)
        self.path   = _.concat(path, self.name)
        self.pathId = self.path.join("/")
        self.id = Ti.Util.fallbackNil(this.getNodeId(item), self.pathId)
        self.indent = self.path.length
        self.leaf   = this.isNodeLeaf(item)
        self.opened = Ti.Util.fallback(
          this.myOpenedNodePaths[self.pathId], 
          self.indent < this.defaultOpenDepth);
        self.icon   = self.leaf ? true : this.nodeHandleIcons[self.opened ? 1 : 0]
      }
      //....................................
      // Join the rawData
      self.rawData = item
      //....................................
      // Add root if necesssary
      if(this.showRoot) {
        rows.push(self)
      }
      // If not show root, minus depth
      else {
        self.indent --
        if(self.indent >= 0) {
          rows.push(self)
        }
      }
      //....................................
      // Join Children
      if(self.opened && !self.leaf) {
        if(!children) {
          children = await this.getNodeChildren(item)
        }
        if(_.isArray(children)) {
          for(let child of children) {
            await this.joinTreeTableRow(rows, child, self.path)
          }
        }
      }
      //....................................
    },
    //--------------------------------------
    findTableRow(rowId) {
      if(!Ti.Util.isNil(rowId)) {
        for(let row of this.myTreeTableData) {
          if(row.id == rowId) {
            return row
          }
        }
      }
    },
    //--------------------------------------
    OnCellItemChange({name, value, rowId}={}) {
      //console.log("OnCellItemChange", {name, value, rowId})
      let row = this.findTableRow(rowId)
      if(row) {
        this.$notify("node:item:change", {
          name,
          value,
          node   : row,
          nodeId : rowId,
          data   : row.rawData
        })
      }
    },
    //--------------------------------------
    OnRowSelect({currentId, checkedIds={}}={}) {
      let current, node, selected=[]
      
      // Has selected
      if(currentId) {
        let currentRow;
        for(let row of this.myTreeTableData) {
          if(row.id == currentId) {
            currentRow = row
            current = row.rawData
          }
          if(checkedIds[row.id]) {
            selected.push(row.rawData)
          }
        }
        // Auto Open
        if(currentRow && this.autoOpen) {
          this.openRow(currentRow)
        }
        // Store current Id
        this.myCurrentId = _.get(currentRow, "id")
        node = currentRow
      }
      // Cancel current row
      else {
        this.myCurrentId = null
      }
      // Save local status
      if(this.keepCurrentBy) {
        if(!this.puppetMode) {
          Ti.Storage.session.set(this.keepCurrentBy, this.myCurrentId)
        }
      }
      // Emit the value
      this.$notify("select", {
        node,
        current, selected,
        currentId, checkedIds
      })
    },
    //--------------------------------------
    OnRowIconClick({rowId}={}) {
      let row = this.findTableRow(rowId)
      // Open it
      if(row && !row.leaf && !row.opened) {
        this.openRow(row)
      }
      // Close it
      else {
        this.closeRow(row)
      }
    },
    //--------------------------------------
    OnRowOpen({id}={}) {
      let row = this.findTableRow(id)
      if(row && !row.leaf && !row.opened) {
        this.openRow(row)
      }
    },
    //--------------------------------------
    openRow(rowOrId) {
      let row = _.isString(rowOrId) 
                  ? this.findTableRow(rowOrId)
                  : rowOrId
      if(row && !row.leaf && !row.opened) {
        this.$set(this.myOpenedNodePaths, row.pathId, true)
        // Notify status changed
        this.$notify("opened", row)
        // Save to Local
        this.saveNodeOpenStatus()
      }
    },
    //--------------------------------------
    isOpened(rowOrId) {
      let row = _.isString(rowOrId) 
                  ? this.findTableRow(rowOrId)
                  : rowOrId
      return row ? row.opened : false
    },
    //--------------------------------------
    closeRow(rowOrId) {
      let row = _.isString(rowOrId) 
                  ? this.findTableRow(rowOrId)
                  : rowOrId
      if(row && !row.leaf && row.opened) {
        this.$set(this.myOpenedNodePaths, row.pathId, false)
        // Notify status changed
        this.$notify("closed", row)
        // Save to Local
        this.saveNodeOpenStatus()
      }
    },
    //--------------------------------------
    saveNodeOpenStatus() {
      if(this.keepOpenBy) {
        Ti.Storage.session.setObject(this.keepOpenBy, this.myOpenedNodePaths)
      }
      this.$notify("opened-status:changed", this.myOpenedNodePaths)
    },
    //--------------------------------------
    syncOpenedNodePaths() {
      this.myOpenedNodePaths = _.assign({}, this.openedNodePaths)
    },
    //--------------------------------------
    __ti_shortcut(uniqKey) {
      if("ARROWLEFT" == uniqKey) {
        this.closeRow(this.myCurrentId)
      }

      if("ARROWRIGHT" == uniqKey) {
        this.openRow(this.myCurrentId)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "data" : async function(newVal, oldVal) {
      if(!_.isEqual(newVal, oldVal)) {
        await this.evalTreeTableData()
      }
    },
    "openedNodePaths" : function(newVal, oldVal) {
      if(!_.isEqual(newVal, oldVal)) {
        //console.log("tree openedNodePaths changed")
        this.syncOpenedNodePaths()
      }
    }
  },
  //////////////////////////////////////////
  mounted : async function() {
    //.................................
    this.syncOpenedNodePaths()
    //.................................
    // Ti.Dom.watchDocument("mouseup", this.__on_mouseup)
    // Recover the open status from local store
    if(this.keepOpenBy) {
      this.myOpenedNodePaths = Ti.Storage.session.getObject(this.keepOpenBy)
      if(!this.puppetMode) {
        this.$notify("opened-status:changed", this.myOpenedNodePaths)
      }
    }
    //................................
    // Eval Data
    await this.evalTreeTableData()
    //................................
    // Watch Deep
    this.$watch("myOpenedNodePaths", ()=>{
      this.evalTreeTableData()
    }, {deep:true})
    //................................
    // Recover the current
    if(this.keepCurrentBy) {
      let currentId = Ti.Storage.session.get(this.keepCurrentBy)
      if(!Ti.Util.isNil(currentId)) {
        this.$nextTick(()=>{
          this.$children[0].selectRow(currentId)
        })
      }
    }
    //................................
  },
  //////////////////////////////////////////
  beforeDestroy : function(){
    //Ti.Dom.unwatchDocument("mouseup", this.__on_mouseup)
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/tree/ti-tree.mjs", TI_TREE);
})();
//============================================================
// JOIN: ti/tree/_com.json
//============================================================
Ti.Preload("ti/com/ti/tree/_com.json", {
  "name" : "ti-tree",
  "globally" : true,
  "template" : "./ti-tree.html",
  "mixins" : ["./ti-tree.mjs"],
  "components" : [
    "@com:ti/table"]
});
//============================================================
// JOIN: ti/upload/file/ti-upload-file.html
//============================================================
Ti.Preload("ti/com/ti/upload/file/ti-upload-file.html", `<div class="ti-upload-file"
  :class="TopClass">
  <!--
    Hidden input file to choose files
  -->
  <input 
    type="file" 
    ref="file" 
    class="ti-hide"
    @change.stop.seft="OnSelectLocalFilesToUpload">
  <!--
    Major preview zone
  -->
  <div ref="thumb"
    class="thumb-con"
    :style="ThumbStyle"
    @click="OnClickToEdit"
    v-drop-files.mask="OnDropFiles">
    <!--
      Preview
    -->
    <ti-obj-thumb 
      :preview="PreviewIcon"
      :progress="progress"
      :footer="false"/>
    <!--
      Remove
    -->
    <div ref="actions"
      v-if="isShowRemoveIcon"
        class="thumb-actions"
        :style="ActionsStyle">
        <!--remove-->
        <div class="thumb-opt as-del"
          @click.left.stop="OnRemove">
          <ti-icon value="zmdi-delete"/>
          <span class="it-text">{{'clear'|i18n}}</span>
        </div>
        <!--open-->
        <div class="thumb-opt as-open"
          @click.left.stop="OnOpen">
          <ti-icon value="zmdi-open-in-new"/>
          <span class="it-text">{{'open'|i18n}}</span>
        </div>
    </div>
    <!--//////-->
  </div>
</div>`);
//============================================================
// JOIN: ti/upload/file/ti-upload-file.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  data: ()=>({
    myArea: 0,
    myActionsWidth: 0
  }),
  /////////////////////////////////////////
  props : {
    // The source to display image
    "preview" : {
      type : [String, Object],
      default : null
    },
    // The value must be a LocalFile object
    // to prerender the LocalFile during uploading
    "uploadFile" :{
      type : File,
      default : null
    },
    // Show the process `0.0-1.0` during the uploading
    "progress" : {
      type : Number,
      default : -1
    },
    // Display width
    "width" : {
      type : [String, Number],
      default : 120
    },
    // Display height
    "height" : {
      type : [String, Number],
      default : 120
    },
    // support remove the objects
    "removable" : {
      type : Boolean,
      default : true
    },
    "areaSize": {
      type: Object,
      default: ()=>({
        //xl: (800 * 800),
        xs: (100 * 100),
        sm: (200 * 200),
        md: (400 * 400),
        lg: (600 * 600),
      })
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass(
        `is-area-${this.AreaType}`)
    },
    //--------------------------------------
    AreaType() {
      let AS = this.areaSize;
      let ar = this.myArea
      if(ar <= 0) {
        return "nil"
      }
      if(_.inRange(ar, 0, AS.xs+1))
        return "xs"
      if(_.inRange(ar, AS.xs, AS.sm+1))
        return "sm"
      if(_.inRange(ar, AS.sm, AS.md+1))
        return "md"
      if(_.inRange(ar, AS.md, AS.lg+1))
        return "lg"

      return "xl"
    },
    //--------------------------------------
    ThumbStyle(){
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //--------------------------------------
    ActionsStyle() {
      if(/^(xs|sm)$/.test(this.AreaType)) {
        return {
          right: Ti.Css.toSize(this.myActionsWidth*-1)
        }
      }
    },
    //--------------------------------------
    hasPreview() {
      return this.preview ? true : false
    },
    //--------------------------------------
    isShowRemoveIcon() {
      if(!this.uploadFile && this.hasPreview) {
        return true
      }
      return false
    },
    //--------------------------------------
    PreviewIcon() {
      if(this.uploadFile) {
        return {type:"localFile", value:this.uploadFile}
      }
      // Normal image
      if(this.preview) {
        return this.preview
      }
      // Show Icon
      return "zmdi-plus"
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickToEdit() {
      this.$refs.file.click()
    },
    //--------------------------------------
    async OnDropFiles(files) {
      let file = _.get(files, 0)
      if(file) {
        this.$notify("upload", file)
      }
    },
    //--------------------------------------
    async OnSelectLocalFilesToUpload(evt) {
      await this.OnDropFiles(evt.target.files)
      this.$refs.file.value = ""
    },
    //--------------------------------------
    OnRemove() {
      this.$notify("remove")
    },
    //--------------------------------------
    OnOpen() {
      this.$notify("open")
    },
    //--------------------------------------
    recountArea() {
      let rect = Ti.Rects.createBy(this.$refs.thumb)
      this.myArea = rect.width * rect.height
      if(this.$refs.actions) {
        this.myActionsWidth = this.$refs.actions.getBoundingClientRect().width
      } else {
        this.myActionsWidth = 0
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "preview": function() {
      this.$nextTick(()=>this.recountArea())
    }
  },
  //////////////////////////////////////////
  mounted: function() {
    this.$nextTick(()=>this.recountArea())
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/upload/file/ti-upload-file.mjs", _M);
})();
//============================================================
// JOIN: ti/upload/file/_com.json
//============================================================
Ti.Preload("ti/com/ti/upload/file/_com.json", {
  "name" : "ti-upload-file",
  "globally" : true,
  "template" : "./ti-upload-file.html",
  "mixins" : ["./ti-upload-file.mjs"]
});
//============================================================
// JOIN: ti/wall/com/wall-tile/wall-tile.html
//============================================================
Ti.Preload("ti/com/ti/wall/com/wall-tile/wall-tile.html", `<div class="wall-tile"
  :class="TopClass"
  :style="TopStyle">
  <div v-if="myCom"
    class="tile-con"
    @click.left="OnClickRow"
    @dblclick.left="OnDblClickRow"
    v-ti-activable>
    <component   
      :is="myCom.comType" 
      v-bind="myCom.comConf"/>
  </div>
</div>`);
//============================================================
// JOIN: ti/wall/com/wall-tile/wall-tile.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////////////
  inject: ["$wall"],
  ///////////////////////////////////////////////////
  data : ()=>({
    myCom : null
  }),
  ///////////////////////////////////////////////////
  props : {
    "display" : {
      type : Object,
      default : null
    },
    // Wall-Tile width
    "width" : {
      type : [String, Number],
      default : null
    },
    // Wall-Tile height
    "height" : {
      type : [String, Number],
      default : null
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopClass() {
      return this.getListItemClass()
    },
    //--------------------------------------
    TopStyle() {
      let css = {}
      if(this.width) {
        css.width = this.width
      }
      if(this.height) {
        css.height = this.height
      }
      return Ti.Css.toStyle(css)
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    async evalMyDisplayCom() {
      //console.log("evalMyDisplayCom", this.data)
      this.$wall.reportReady(this.index, !Ti.Util.isNil(this.myCom))
      let com = await this.evalDataForFieldDisplayItem({
        itemData : this.data, 
        displayItem : this.display, 
        vars : {
          "isCurrent" : this.isCurrent,
          "isChecked" : this.isChecked,
          "isChanged" : this.isChanged,
          "isActived" : this.isActived,
          "rowId"     : this.rowId,
          ... this.$vars
        }
      })

      // Update and return
      let old = Ti.Util.pureCloneDeep(this.myCom)
      let nit = Ti.Util.pureCloneDeep(com)
      if(!_.isEqual(old, nit)) {
        //console.log(`-> Cell[${this.rowIndex}-${this.index}]:`, {old, nit})
        this.myCom = com
      }
      // report ready
      this.$wall.reportReady(this.index, true)
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "data" : {
      handler : "evalMyDisplayCom",
      immediate : true
    },
    "isCurrent" : "evalMyDisplayCom",
    "isChecked" : "evalMyDisplayCom"
  }
  ///////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/wall/com/wall-tile/wall-tile.mjs", _M);
})();
//============================================================
// JOIN: ti/wall/com/wall-tile/_com.json
//============================================================
Ti.Preload("ti/com/ti/wall/com/wall-tile/_com.json", {
  "name" : "wall-tile",
  "globally" : false,
  "template" : "./wall-tile.html",
  "methods"  : "@com:ti/support/field_display.mjs",
  "mixins" : [
    "@com:ti/support/list_item_mixins.mjs",
    "./wall-tile.mjs"]
});
//============================================================
// JOIN: ti/wall/ti-wall.html
//============================================================
Ti.Preload("ti/com/ti/wall/ti-wall.html", `<div class="ti-wall" 
  :class="TopClass"
  @click="OnClickTop"
  v-ti-activable>
  <!--
    Blank
  -->
  <div
    v-if="isDataEmpty"
      class="ti-blank is-big">
      <ti-loading v-bind="blankAs"/>
  </div>
  <!--
    Show tiles
  -->
  <template v-else>
    <!--tiles-->
    <wall-tile
      v-for="row in TheData"
        :key="row.id"
        :row-id="row.id"
        :index="row.index"
        :display="ItemDisplay"
        :data="row.rawData"
        :current-id="theCurrentId"
        :checked-ids="theCheckedIds"
        :changed-id="changedId"
        :checkable="checkable"
        :selectable="selectable"
        :openable="openable"
        :class-name="itemClassName"
        :width="itemWidth"
        :height="itemHeight"
        @select="OnRowSelect"
        @open="OnRowOpen"/>
    <!--Blank Tile-->
    <div v-for="bc in BlankCols"
      class="wall-tile"
      :style="bc">
    </div>
  </template>
</div>`);
//============================================================
// JOIN: ti/wall/ti-wall.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////////////
  provide : function(){
    return {
      "$wall" : this
    }
  },
  //////////////////////////////////////////
  data : ()=>({
    myData : [],

    myColCount : 0,
    myColWidth : 0,
    isOnlyOneRow : true,

    myCellsReport : {},
    myNeedResize : true
  }),
  //////////////////////////////////////////
  props : {
    "itemClassName" : undefined,
    "display" : {
      type : [Object, String],
      default : ()=>({
        key : "..",
        comType : "ti-label"
      })
    },
    "border" : {
      type : Boolean,
      default : true
    },
    // aspect: list item spacing
    // `no|xs|sm|md|lg|xl`
    "spacing" : {
      type : String,
      default : "sm"
    },
    // Wall-Tile width
    "itemWidth" : {
      type : [String, Number],
      default : null
    },
    // Wall-Tile height
    "itemHeight" : {
      type : [String, Number],
      default : null
    },
    "resizeDelay" : {
      type : Number,
      default : 0
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-hoverable"    : this.hoverable,
        "show-border"     : this.border,
        "is-only-one-row" : this.isOnlyOneRow,
        "is-multi-rows"   : !this.isOnlyOneRow
      }, [
        `spacing-${this.spacing}`
      ])
    },
    //--------------------------------------
    ItemDisplay() {
      return this.evalFieldDisplayItem(this.display, {
        funcSet : this.fnSet
      })
    },
    //--------------------------------------
    TheData() {
      return this.myData
    },
    //--------------------------------------
    ListRealCount() {
      return this.TheData.length
    },
    //--------------------------------------
    BlankCols() {
      let list = []
      if(!_.isEmpty(this.TheData) 
        && this.myColCount > 0 
        && this.myColWidth > 1
        && !this.isOnlyOneRow) {
        // get list real count
        let n = this.ListRealCount % this.myColCount
        if(n > 0) {
          let nr = this.myColCount - n
          for(let i=0; i<nr; i++) {
            list.push({
              width : `${this.myColWidth}px`
            })
          }
        }
      }
      //console.log(list)
      return list
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickTop($event) {
      if(this.cancelable) {
        // Click The body or top to cancel the row selection
        if(Ti.Dom.hasOneClass($event.target,
            'ti-wall', 'wall-tile')) {
          this.cancelRow()
        }
      }
    },
    //--------------------------------------
    OnWallResize() {
      //console.log("OnWallResize")
      let $divs = Ti.Dom.findAll(":scope > .wall-tile", this.$el)
      // Guard empty
      if(_.isEmpty($divs)) 
        return
      // Eval the cols and width
      //console.log("  ~~~ do", this.data)
      let cols  = 0
      let width = 1
      let top = -1
      let isOnlyOneRow = true
      for(let $div of $divs) {
        let rect = $div.getBoundingClientRect()
        if(top < 0) {
          top  = rect.top
        }
        if(top == rect.top) {
          cols ++
          width = Math.max(rect.width, width)
        }
        // Find the next row
        else {
          isOnlyOneRow = false
          break
        }
      }
      //console.log({cols, width, top})
      if(width > 1) {
        this.myColCount = cols
        this.myColWidth = width
        this.isOnlyOneRow = isOnlyOneRow
      }
    },
    //--------------------------------------
    reportReady(rowIndex=-1, isDone=false) {
      let key = `R${rowIndex}`
      //console.log(key, isDone)
      if(isDone) {
        delete this.myCellsReport[key]
      } else {
        this.myCellsReport[key] = false
        this.myNeedResize = true
      }
      // Check the status
      if(isDone) {
        _.delay(()=>{
          let allReady = _.isEmpty(this.myCellsReport)
          // Do resize
          if(allReady && this.myNeedResize) {
            _.delay(()=>{
              this.OnWallResize()
            }, this.resizeDelay)
            this.myNeedResize = false
          }
        })
      }
    },
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "data" : {
      handler : async function(newVal, oldVal){
        let isSame = _.isEqual(newVal, oldVal)
        if(!isSame) {
          //console.log("!!!wall data changed", {newVal, oldVal})
          this.myData = await this.evalData()
        }
      },
      immediate : true
    }
  },
  //////////////////////////////////////////
  mounted : function() {
    //.................................
    Ti.Viewport.watch(this, {
      resize : _.debounce(()=>this.OnWallResize(), 100)
    })
    //.................................
  },
  //////////////////////////////////////////
  destroyed : function() {
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/ti/wall/ti-wall.mjs", _M);
})();
//============================================================
// JOIN: ti/wall/_com.json
//============================================================
Ti.Preload("ti/com/ti/wall/_com.json", {
  "name" : "ti-wall",
  "globally" : true,
  "template" : "./ti-wall.html",
  "props" : "@com:ti/support/list_props.mjs",
  "methods" : "@com:ti/support/field_display.mjs",
  "mixins" : [
    "@com:ti/support/list_mixins.mjs",
    "./ti-wall.mjs"
  ],
  "components" : [
    "./com/wall-tile",
    "@com:ti/label"
  ]
});
//============================================================
// JOIN: ti/wizard/com/wizard-step/wizard-step.html
//============================================================
Ti.Preload("ti/com/ti/wizard/com/wizard-step/wizard-step.html", `<component 
  :is="comType"
  v-bind="comBindObject"/>`);
//============================================================
// JOIN: ti/wizard/com/wizard-step/wizard-step.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  props : {
    "index" : {
      type : Number,
      default : -1
    },
    "stepKey" : {
      type : String,
      default : null
    },
    "title" : {
      type : String,
      default : null
    },
    "dataKey" : {
      type : String,
      default : null
    },
    "data" : {
      type : [Array, Object, Number, Boolean, String],
      default : null
    },
    "comType" : {
      type : String,
      default : "ti-label"
    },
    "comConf" : {
      type : Object,
      default : ()=>({
        value: "Step Component"
      })
    },
    "comEvents" : {
      type : Object,
      default : ()=>({})
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //----------------------------------------------
    comBindObject() {
      let bind = Ti.Util.explainObj(this.data, this.comConf, {
        evalFunc : true
      })
      return bind      
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    async hijackEmit(name, args) {
      // Find the serializer function
      let router = this.comEvents[name]
      if(!name.startsWith("hook:"))
        console.log("hijackEmit:", {name, args, router})

      // Do routing
      if(router) {
        // Boolean: keep emitName
        if(_.isBoolean(router)) {
          router = {emitName:name}
        }
        // String/Number: step
        else if(_.isNumber(router) || /^[+-][0-9]+$/.test(router)) {
          router = {emitName:name, nextStep:router}
        }
        // String for emitName
        else if(_.isString(router)) {
          router = {emitName:router}
        }
        //............................
        // Eval emit & next
        let emitName = router.emitName || name
        let nextStep = router.nextStep
        if(/^[+-][0-9]+$/.test(nextStep)) {
          nextStep = this.index + (nextStep*1)
        }
        //............................
        // Eval Payload
        let payload = args
        if(args && _.isArray(args) && args.length == 1) {
          payload = args[0]
        }
        // Transform Payload
        let trans = Ti.Types.getFuncBy(router, "transformer")
        if(_.isFunction(trans)) {
          payload = trans(payload)
        }
        // Wrap payload by dataKey
        if(this.dataKey) {
          payload = {[this.dataKey] : payload}
        }
        //............................
        // Notify
        this.$notify("step:event", {
          emitName, nextStep, payload
        })
        //............................
      }
    }
    //----------------------------------------------
  }
  ///////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/wizard/com/wizard-step/wizard-step.mjs", _M);
})();
//============================================================
// JOIN: ti/wizard/com/wizard-step/_com.json
//============================================================
Ti.Preload("ti/com/ti/wizard/com/wizard-step/_com.json", {
  "name" : "wizard-step",
  "globally" : true,
  "template" : "./wizard-step.html",
  "mixins" : ["./wizard-step.mjs"]
});
//============================================================
// JOIN: ti/wizard/ti-wizard.html
//============================================================
Ti.Preload("ti/com/ti/wizard/ti-wizard.html", `<div class="ti-wizard ti-fill-parent"
  :class="topClass">
  <!--
    Header Indicators
  -->
  <div class="as-head">
    <ul>
      <li v-for="(step, index) in displayStepList"
        :key="step.stepKey"
        :class="step.className"
        @click.left="onClickHeadItem(step, index)">
        <span class="as-indicator">
          <span class="as-line at-l"></span>
          <span class="as-dot">{{index+1}}</span>
          <span class="as-line at-r"></span>
        </span>
        <span class="as-text">{{step.title}}</span>
      </li>
    </ul>
  </div>
  <!--
    Current Step Component
  -->
  <div class="as-main">
    <wizard-step 
      v-bind="currentStep"
      @step:event="onStepEvent"/>
  </div>
  <!--
    Footer Default Buttons
  -->
  <div v-if="btnPrev || btnNext"
    class="as-foot">
    <ul>
      <!--
        Btn: Prev
      -->
      <li v-if="btnPrev" 
        :class="btnPrev.className"
        @click="onClickBtnPrev">
        <span v-if="btnPrev.icon"
          class="as-icon">
          <ti-icon :value="btnPrev.icon"/>
        </span>
        <span class="as-sep"></span>
        <span class="as-text">{{btnPrev.text|i18n}}</span>
      </li>
      <!--
        Btn: Next
      -->
      <li v-if="btnNext" 
        :class="btnNext.className"
        @click="onClickBtnNext">
        <span class="as-text">{{btnNext.text|i18n}}</span>
        <span class="as-sep"></span>
        <span v-if="btnNext.icon"
          class="as-icon">
          <ti-icon :value="btnNext.icon"/>
        </span>
      </li>
    </ul>
  </div>
</div>`);
//============================================================
// JOIN: ti/wizard/ti-wizard.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  props : {
    "steps" : {
      type : Array,
      default : ()=>[]
    },
    "data" : {
      type : Object,
      default : ()=>({})
    },
    "current" : {
      type : [Number, String],
      default : 0
    },
    "canClickHeadItem" : {
      type : String,
      default : null
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //----------------------------------------------
    topClass() {
      return this.className
    },
    //----------------------------------------------
    displayStepList() {
      let list = []
      if(_.isArray(this.steps)) {
        for(let step of this.stepList) {
          let className = []
          if(step.className) {
            className = [].concat(step.className)
          }
          if(this.currentStepIndex == step.index) {
            className.push("is-current")
          }
          else if(step.index > this.currentStepIndex) {
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
    stepList() {
      let list = []
      if(_.isArray(this.steps)) {
        for(let i=0; i<this.steps.length; i++) {
          let step = this.steps[i]
          let stepKey = step.key || `step${i}`
          // Join to the list
          list.push({
            index     : i,
            className : step.className,
            stepKey   : stepKey,
            title     : step.title   || stepKey,
            dataKey   : step.dataKey,
            data      : this.data,
            comType   : step.comType || "ti-label",
            comConf   : step.comConf || {value:stepKey},
            comEvents : step.comEvents  || {},
            prev : step.prev,
            next : step.next
          })
        }
      }
      return list
    },
    //----------------------------------------------
    currentStepIndex() {
      return this.currentStep
                ? this.currentStep.index
                : -1
    },
    //----------------------------------------------
    hasCurrentStep() {
      return this.currentStep ? true : false
    },
    //----------------------------------------------
    currentStep() {
      return this.getStepBy(this.current)
    },
    //----------------------------------------------
    btnPrev() {
      let btn = _.get(this.currentStep, "prev")
      return this.getStepAction(btn, {
        icon     : "zmdi-chevron-left",
        text     : "i18n:prev",
        enabled  : true
      })
    },
    //----------------------------------------------
    btnNext() {
      let btn = _.get(this.currentStep, "next")
      return this.getStepAction(btn, {
        icon     : "zmdi-chevron-right",
        text     : "i18n:next",
        enabled  : true
      })
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    getStepBy(keyOrIndex) {
      // By Index: -1 is the last item
      if(_.isNumber(keyOrIndex)) {
        let i = Ti.Num.scrollIndex(keyOrIndex, this.stepList.length)
        if(i>=0)
          return this.stepList[i]
      }
      // By Key
      else {
        for(let step of this.stepList) {
          if(step.stepKey == keyOrIndex) {
            return step
          }
        }
      }
      // Return undefined
    },
    //----------------------------------------------
    onClickBtnPrev() {
      if(this.btnPrev && this.btnPrev.enabled) {
        this.gotoPrev()
      }
    },
    //----------------------------------------------
    onClickBtnNext() {
      if(this.btnNext && this.btnNext.enabled) {
        this.gotoNext()
      }
    },
    //----------------------------------------------
    gotoStep(keyOrIndex) {
      let step = this.getStepBy(keyOrIndex)
      if(step)
        this.$notify("goto-step", step)
    },
    //----------------------------------------------
    gotoPrev(off=-1) {
      this.gotoFromCurrent(-1)
    },
    //----------------------------------------------
    gotoNext(off=1) {
      this.gotoFromCurrent(1)
    },
    //----------------------------------------------
    gotoFromCurrent(off=1) {
      if(this.currentStep) {
        let nextStepIndex = this.currentStep.index + off
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
          // Eval enabled
          if(_.isPlainObject(btn.enabled)) {
            btn.enabled = Ti.Validate.match(this.data, btn.enabled)
          }
        }
        // Setup 
        _.defaults(btn, dftSetting)
        // ClassName
        if(btn.enabled) {
          btn.className = "is-enabled"
        }
        // Return 
        return btn
      }
    }, 
    //----------------------------------------------
    onStepEvent({emitName, nextStep, payload}={}) {
      console.log("wizard:onStepEvent", {emitName, nextStep, payload})
      // Notify Event
      if(emitName) {
        this.$notify(emitName, payload)
      }
      // Try auto goto nextStep
      this.gotoStep(nextStep)
    },
    //----------------------------------------------
    onClickHeadItem(step, index) {
      // Can Click Passed Steps
      if("passed" == this.canClickHeadItem 
        && this.currentStepIndex > index) {
        this.gotoStep(index)
      }
    }
    //----------------------------------------------
  }
  ///////////////////////////////////////////////////
}
Ti.Preload("ti/com/ti/wizard/ti-wizard.mjs", _M);
})();
//============================================================
// JOIN: ti/wizard/_com.json
//============================================================
Ti.Preload("ti/com/ti/wizard/_com.json", {
  "name" : "ti-wizard",
  "globally" : true,
  "template" : "./ti-wizard.html",
  "mixins" : ["./ti-wizard.mjs"],
  "components" : [
    "./com/wizard-step"]
});
//============================================================
// JOIN: web/auth/captcha/web-auth-captcha.html
//============================================================
Ti.Preload("ti/com/web/auth/captcha/web-auth-captcha.html", `<div 
  class="ti-combo-captcha" 
  :class="topClass">
 
</div>`);
//============================================================
// JOIN: web/auth/captcha/web-auth-captcha.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ///////////////////////////////////////////////////////
  props : {
    "value" : {
      type : [String,Object],
      default : ""
    },
    "text" : {
      type : String,
      default : null
    },
    "fontSize" : {
      type : [Number, String],
      default : null
    },
    "width" : {
      type : [Number, String],
      default : null
    },
    "height" : {
      type : [Number, String],
      default : null
    },
    "color" : {
      type : String,
      default : ""
    },
    "opacity" : {
      type : Number,
      default : -1
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    topClass() {
      if(this.className)
        return this.className
    },
    //---------------------------------------------------
    // formed icon data
    icon() {
      let icn 
      if(_.isPlainObject(this.value)){
        // Regular icon object, return it directly
        if(this.value.type && this.value.value) {
          icn = this.value
        }
        // Eval it as meta
        else {
          icn = Ti.Icons.get(this.value)
        }
      }
      // String
      else {
        icn = {
          type : "font",
          value : this.value
        }
        if(_.isString(this.value)) {
          icn.type = Ti.Util.getSuffixName(this.value) || "font"
        }
        // for image
        if(/^(jpe?g|gif|png)$/i.test(icn.type)){
          icn.type = "img"
        }
      }

      // Join `className / text` to show icon font
      if('font' == icn.type) {
        _.assign(icn, Ti.Icons.parseFontIcon(icn.value))
      }

      // join style:outer
      icn.outerStyle = Ti.Css.toStyle({
        width   : this.width,
        height  : this.height,
        color   : this.color,
        opacity : this.opacity >= 0 ? this.opacity : undefined
      })

      // join style:inner
      if('img' == icn.type) {
        icn.innerStyle = {
          "width"  : this.width  ? "100%" : undefined,
          "height" : this.height ? "100%" : undefined
        }
      }
      // font size
      else if('font' == icn.type) {
        icn.innerStyle = {
          "font-size" : this.fontSize 
                          ? Ti.Css.toSize(this.fontSize) 
                          : undefined
        }
      }

      return icn
    },
    //---------------------------------------------------
  }
  ///////////////////////////////////////////////////////
}
Ti.Preload("ti/com/web/auth/captcha/web-auth-captcha.mjs", _M);
})();
//============================================================
// JOIN: web/auth/captcha/_com.json
//============================================================
Ti.Preload("ti/com/web/auth/captcha/_com.json", {
  "name" : "web-auth-captcha",
  "globally" : true,
  "template" : "./web-auth-captcha.html",
  "mixins" : ["./web-auth-captcha.mjs"]
});
//============================================================
// JOIN: web/auth/signup/web-auth-signup.html
//============================================================
Ti.Preload("ti/com/web/auth/signup/web-auth-signup.html", `<div 
  class="web-auth-signup web-simple-form" 
  :class="TopClass">
  <header>{{Msgs.title|i18n}}</header>
  <section>
    <div class="as-input" :class="NameClass">
      <input 
        spellcheck="false"
        :placeholder="Msgs.nameTip|i18n"
        v-model="data.name"></div>
    <div class="as-input" :class="PasswdClass">
      <input 
        spellcheck="false"
        :placeholder="Msgs.passwdTip|i18n"
        v-model="data.passwd">
      <span v-if="Msgs.codeGet">
        <em v-if="delay>0">{{'auth-vcode-delay'|i18n({sec:delay})}}</em>
        <a v-else
          @click="OnGetVcode">{{Msgs.codeGet|i18n}}</a>
      </span>
    </div>
    <div class="as-btn">
      <button @click="OnAuthSubmit">{{Msgs.btnText|i18n}}</button>
    </div>
    <ul class="as-links">
      <li v-if="Msgs.linkLeft"
        class="at-left">
        <a @click="OnChangeMode">{{Msgs.linkLeft   |i18n}}</a>
      </li>
      <li v-if="Msgs.linkRight"
        class="at-right">
        <a>{{Msgs.linkRight |i18n}}</a></li>
    </ul>
  </section>
</div>`);
//============================================================
// JOIN: web/auth/signup/web-auth-signup.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////////////////
  data : ()=>({
    "data" : {
      "name"   : null,
      "passwd" : null
    },
    "guarding" : false,
    "currentMode"  : "login_by_passwd",
    // String, Array
    "invalidField" : null,
    // delay to get the next captcha to prevent robot
    "delay" : -1
  }),
  ///////////////////////////////////////////////////////
  props : {
    // - "login_by_passwd"
    // - "login_by_phone"
    // - "login_by_email"
    // - "bind_phone"
    // - "bind_email"
    "mode" : {
      type : String,
      default : "login_by_passwd"
    },
    "toggleMode": {
      type : String,
      default : "login_by_phone"
    },
    "captcha" : {
      type : String,
      required : true,
      default : null
    },
    "scenes" : {
      type : Object,
      default: ()=>({
        robot  : "robot",
        bind_phone : "auth",
        bind_email : "auth",
        login_by_email   : "auth",
        login_by_phone   : "auth",
        login_by_passwd  : "auth"
      })
    },
    // The interval of get capche to prevent robot
    // (in second)
    "getDelay" : {
      type : Number,
      default : 60
    }
    // "invalidField" : {
    //   type : [String, Array],
    //   default : null
    // }
  },
  ///////////////////////////////////////////////////////
  watch : {
    "currentMode" : function() {
      this.guarding = false
      this.data.name = ""
      this.data.passwd = ""
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //---------------------------------------------------
    Msgs() {
      // Login by password
      if("login_by_passwd" == this.currentMode) {
        return {
          "title"     : "i18n:auth-passwd-title",
          "nameTip"   : (
            "login_by_email" == this.toggleMode
              ? "i18n:auth-passwd-name-email-tip"
              : "i18n:auth-passwd-name-phone-tip"
          ),
          "passwdTip" : "i18n:auth-passwd-tip",
          "btnText"   : "i18n:auth-login",
          "linkLeft"  : (
            "login_by_email" == this.toggleMode
              ? "i18n:auth-go-email"
              : "i18n:auth-go-phone"
          ),
          "linkRight" : "i18n:auth-passwd-getback",
          "blankName" : "i18n:auth-blank-name"
        }
      }
      // Login by Phone
      if("login_by_phone" == this.currentMode) {
        return {
          "title"     : "i18n:auth-phone-title",
          "nameTip"   : "i18n:auth-phone-tip",
          "passwdTip" : "i18n:auth-phone-vcode",
          "codeGet"   : "i18n:auth-phone-vcode-get",
          "btnText"   : "i18n:auth-login-or-signup",
          "linkLeft"  : "i18n:auth-go-passwd",
          "linkRight" : "i18n:auth-vcode-lost",
          "blankName" : "i18n:auth-blank-phone"
        }
      }
      // Login by email
      if("login_by_email" == this.currentMode) {
        return {
          "title"     : "i18n:auth-email-title",
          "nameTip"   : "i18n:auth-email-tip",
          "passwdTip" : "i18n:auth-email-vcode",
          "codeGet"   : "i18n:auth-email-vcode-get",
          "btnText"   : "i18n:auth-login-or-signup",
          "linkLeft"  : "i18n:auth-go-passwd",
          "linkRight" : "i18n:auth-vcode-lost",
          "blankName" : "i18n:auth-blank-email"
        }
      }
      // Bind the phone
      if("bind_phone" == this.currentMode) {
        return {
          "title"     : "i18n:auth-bind-phone-title",
          "nameTip"   : "i18n:auth-phone-tip",
          "passwdTip" : "i18n:auth-phone-vcode",
          "codeGet"   : "i18n:auth-phone-vcode-get",
          "btnText"   : "i18n:auth-bind",
          //"linkLeft"  : "i18n:auth-bind-link-left",
          "linkRight" : "i18n:auth-vcode-lost",
          "blankName" : "i18n:auth-blank-phone"
        }
      }
      // Bind the email
      if("bind_email" == this.currentMode) {
        return {
          "title"     : "i18n:auth-bind-email-title",
          "nameTip"   : "i18n:auth-email-tip",
          "passwdTip" : "i18n:auth-email-vcode",
          "codeGet"   : "i18n:auth-email-vcode-get",
          "btnText"   : "i18n:auth-bind",
          //"linkLeft"  : "i18n:auth-bind-link-left",
          "linkRight" : "i18n:auth-vcode-lost",
          "blankName" : "i18n:auth-blank-email"
        }
      }
      // Invalid mode
      throw Ti.Err.make("e.com.combo.auth.invalid-mode", this.currentMode)
    },
    //---------------------------------------------------
    Params() {
      return _.mapValues(this.data, (str)=>_.trim(str))
    },
    //---------------------------------------------------
    isBlankName() {
      return this.Params.name ? false : true
    },
    //---------------------------------------------------
    isBlankNameOrPasswd() {
      let {name, passwd} = this.Params
      return !name || !passwd
    },
    //---------------------------------------------------
    Invalid() {
      return {
        name   : this.isInvalid("name"),
        passwd : this.isInvalid("passwd")
      }
    },
    //---------------------------------------------------
    NameClass() {
      if(this.guarding && 
        (this.Invalid.name || !this.Params.name))
        return "is-invalid"
    },
    //---------------------------------------------------
    PasswdClass() {
      if(this.guarding && 
        (this.Invalid.passwd || !this.Params.passwd))
        return "is-invalid"
    },
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods :{
    //---------------------------------------------------
    OnChangeMode() {
      // -> login-by-vcode
      if("login_by_passwd" == this.currentMode) {
        this.currentMode = this.toggleMode
      }
      // -> login-by-passwd
      else {
        this.currentMode = "login_by_passwd"
      }
      Ti.Be.BlinkIt(this.$el)  
    },
    //---------------------------------------------------
    OnAuthSubmit() {
      this.guarding = true
      // Guarding
      if(this.isBlankNameOrPasswd) {
        return Ti.Toast.Open("i18n:auth-blank-name-passwd", "warn")
      }
      // Mask GUI
      let toast = Ti.Toast.Open({
        icon : "fas-spinner fa-spin",
        content : "i18n:auth-doing",
        position : "center",
        duration : 0,
        closer : false
      })

      // Do Auth
      this.$notify("auth:send", {
        type   : this.currentMode,
        name   : this.Params.name,
        passwd : this.Params.passwd,
        // Close loading toast
        done : ()=> {
          toast.close()
          this.InvalidField = null
        },
        ok : ()=>{
          Ti.Toast.Open({
            type : "success",
            position : "top",
            content : "i18n:auth-ok",
            duration : 2000
          })
          this.$notify("auth:ok")
        },
        noexist : ()=>{
          this.InvalidField = "name"
        },
        invalid : ()=> {
          this.InvalidField = "passwd"
        },
        others : ()=> {
          this.InvalidField = ["name", "passwd"]
        },
        fail : ({errCode, data}={})=> {
          Ti.Toast.Open({
            type : "warn",
            position : "top",
            content : `i18n:${errCode}`,
            duration : 5000
          })
        }
      })
    },
    //---------------------------------------------------
    async OnGetVcode() {
      this.guarding = true
      // The Account Name is required
      if(this.isBlankName) {
        this.InvalidField = "name"
        Ti.Toast.Open(this.Msgs["blankName"], "warn")
        return
      }

      // Reset invalid
      this.guarding = false
      this.InvalidField = null

      // Show the image captcha to prevent robot
      console.log("captcha", this.captcha)
      let vars = {
        scene   : this.scenes.robot,
        account : this.Params.name
      }
      //let src = "/api/joysenses/auth/captcha?site=rv340tg5gcigsp6p5hvigc2gjb&account=18501211423"
      let src = Ti.S.renderBy(this.captcha, vars)
      let captcha = await Ti.Captcha(src)
      if(!captcha)
        return

      // Mask GUI
      let toast = Ti.Toast.Open({
        icon : "fas-spinner fa-spin",
        content : "i18n:auth-sending-vcode",
        position : "center",
        duration : 0,
        closer : false
      })

      // 验证码发送目标的名称（i18n）
      let vCodeTargetName = ({
        "login_by_phone" : "i18n:auth-ta-phone",
        "login_by_email" : "i18n:auth-ta-email",
        "bind_phone"     : "i18n:auth-ta-phone",
        "bind_email"     : "i18n:auth-ta-email"
      })[this.currentMode]

      // 不同模式下的场景
      let vCodeScene = _.get(this.scenes, this.currentMode) || "auth"

      // use the captcha to get code
      this.$notify("get:vcode", {
        type    : this.currentMode,
        scene   : vCodeScene,
        account : this.data.name,
        captcha,
        done: ()=>{
          toast.close()
          this.InvalidField = null
          this.data.passwd = ""
        },
        ok : ({duInMin=60}={})=>{
          this.delay = this.getDelay
          Ti.Toast.Open({
            type : "success",
            position : "top",
            content : "i18n:auth-sent-ok",
            vars : {
              ta  : Ti.I18n.text(vCodeTargetName),
              min : duInMin
            },
            duration : 5000
          })
        },
        fail : ({errCode, data}={})=> {
          Ti.Toast.Open({
            type : "warn",
            position : "top",
            content : `i18n:${errCode}`,
            duration : 5000
          })
        }
      })
    },
    //---------------------------------------------------
    isInvalid(name="") {
      if(_.isArray(this.InvalidField)) {
        return _.indexOf(this.InvalidField, name) >= 0
      }
      return name == this.InvalidField
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  mounted : function() {
    if(this.mode) {
      this.currentMode = this.mode
    }
    // count the secound
    this.__H = window.setInterval(()=>{
      if(this.delay>=0)
        this.delay --
    }, 1000)
  },
  ///////////////////////////////////////////////////////
  beforeDestroy : function() {
    if(this.__H) {
      window.clearInterval(this.__H)
    }
  }
  ///////////////////////////////////////////////////////
}
Ti.Preload("ti/com/web/auth/signup/web-auth-signup.mjs", _M);
})();
//============================================================
// JOIN: web/auth/signup/_com.json
//============================================================
Ti.Preload("ti/com/web/auth/signup/_com.json", {
  "name" : "web-auth-signup",
  "globally" : true,
  "template" : "./web-auth-signup.html",
  "mixins" : ["./web-auth-signup.mjs"]
});
//============================================================
// JOIN: web/footer/web-footer.html
//============================================================
Ti.Preload("ti/com/web/footer/web-footer.html", `<div class="ti-web-footer">
  I footer
</div>`);
//============================================================
// JOIN: web/footer/web-footer.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "logo" : {
      type : [String, Object],
      default : "zmdi-chevron-down"
    },
    "brief" : {
      type : String,
      default : null
    },
    "copyright" : {
      type : String,
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/web/footer/web-footer.mjs", _M);
})();
//============================================================
// JOIN: web/footer/_com.json
//============================================================
Ti.Preload("ti/com/web/footer/_com.json", {
  "name" : "web-footer",
  "globally" : true,
  "template" : "./web-footer.html",
  "mixins"   : ["./web-footer.mjs"]
});
//============================================================
// JOIN: web/media/image/web-media-image.html
//============================================================
Ti.Preload("ti/com/web/media/image/web-media-image.html", `<img
  :class="TopClass"
  class="web-media-image"
  :src="ImgSrc"/>`);
//============================================================
// JOIN: web/media/image/web-media-image.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  props : {
    "base": {
      type: String,
      default: undefined
    },
    "src" : {
      type : String,
      default : undefined
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    ImgSrc() {
      return Ti.Util.appendPath(this.base, this.src)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/web/media/image/web-media-image.mjs", _M);
})();
//============================================================
// JOIN: web/media/image/_com.json
//============================================================
Ti.Preload("ti/com/web/media/image/_com.json", {
  "name" : "web-media-image",
  "globally" : true,
  "template" : "./web-media-image.html",
  "mixins"   : ["./web-media-image.mjs"]
});
//============================================================
// JOIN: web/media/player/web-media-player.html
//============================================================
Ti.Preload("ti/com/web/media/player/web-media-player.html", `<div class="ti-web-image">
  
</div>`);
//============================================================
// JOIN: web/media/player/web-media-player.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "src" : {
      type : String,
      default : undefined
    },
    "value": {
      type : [String, Number],
      default : undefined
    },
    "bgColor": {
      type : [String, Number],
      default: "#000000"
    },
    // [{text:"xxx", className:"xxx", cssStyle:""}]
    // [{src:"xxx",  className:"xxx", cssStyle:""}]
    "items" : {
      type : [Array],
      default : ()=>[]
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TheItems() {
      let list = []
      _.forEach(this.items, it => {

      })
      return list
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/web/media/player/web-media-player.mjs", _M);
})();
//============================================================
// JOIN: web/media/player/_com.json
//============================================================
Ti.Preload("ti/com/web/media/player/_com.json", {
  "name" : "web-media-player",
  "globally" : true,
  "template" : "./web-media-player.html",
  "mixins"   : ["./web-media-player.mjs"]
});
//============================================================
// JOIN: web/meta/article/web-meta-article.html
//============================================================
Ti.Preload("ti/com/web/meta/article/web-meta-article.html", `<div class="ti-web-meta-article">
  <!--
    Title
  -->
  <h1>{{title}}</h1>
  <!--
    Brief
  -->
  <div v-if="brief"
    class="as-brief">{{brief}}</div>
  <!--
    Author/Date
  -->
  <div v-if="hasDateOrAuthor"
    class="as-sub">
    <ul>
      <li v-if="author">{{author}}</li>
      <li v-if="date">{{date}}</li>
    </ul>
  </div>
  <!--
    Bottom line
  -->
  <hr v-if="bottomLine">
</div>`);
//============================================================
// JOIN: web/meta/article/web-meta-article.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "titleKey" : {
      type : String,
      default : "title"
    },
    "briefKey" : {
      type : String,
      default : "brief"
    },
    "dateKey" : {
      type : String,
      default : "date"
    },
    "dateFormat" : {
      type : String,
      default : "yyyy-MM-dd"
    },
    "authorKey" : {
      type : String,
      default : "author"
    },
    "bottomLine" : {
      type : Boolean,
      default : true
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    title() {
      if(this.titleKey) {
        return this.meta[this.titleKey]
      }
      return "NoTitle"
    },
    //......................................
    brief() {
      if(this.briefKey) {
        return this.meta[this.briefKey]
      }
    },
    //......................................
    hasDateOrAuthor() {
      return (this.date || this.author) ? true : false
    },
    //......................................
    date() {
      if(this.dateKey) {
        let ds = this.meta[this.dateKey]
        if(ds) {
          try {
            return Ti.Types.formatDate(ds, this.dateFormat)
          }catch(E){}
        }
      }
    },
    //......................................
    author() {
      if(this.authorKey) {
        return this.meta[this.authorKey]
      }
    }
    //......................................
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/web/meta/article/web-meta-article.mjs", _M);
})();
//============================================================
// JOIN: web/meta/article/_com.json
//============================================================
Ti.Preload("ti/com/web/meta/article/_com.json", {
  "name" : "web-meta-article",
  "globally" : true,
  "template" : "./web-meta-article.html",
  "mixins"   : ["./web-meta-article.mjs"]
});
//============================================================
// JOIN: web/meta/commodity/web-meta-commodity.html
//============================================================
Ti.Preload("ti/com/web/meta/commodity/web-meta-commodity.html", `<div class="web-meta-commodity"
  :class="TopClass">
  <div class="as-main">
    <!--
      Left: Preview
    -->
    <div
      v-if="previewImageSrc"
        class="at-left">
      <WebMediaImage
        :src="previewImageSrc"/>
    </div>
    <!--
      Right: Information
    -->
    <div class="at-right">
      <!--Title-->
      <h1>{{MetaTitle}}</h1>
      <div class="as-form">
        <ti-form
          v-bind="form"
          :data="FormData"
          @change="OnFormChanged"/>
      </div>
      <div class="as-btns">
        <!--Buy Button-->
        <a class="ti-btn" @click="OnClickBuyNow">{{actions.buy|i18n}}</a>
      </div>
    </div>
  </div>
</div>`);
//============================================================
// JOIN: web/meta/commodity/web-meta-commodity.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  props : {
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "previewSrc": {
      type: String,
      default: null
    },
    "titleKey" : {
      type : String,
      default : "title"
    },
    "buyAmount" : {
      type : Number,
      default : 1
    },
    "form" : {
      type : Object,
      default : ()=>({})
    },
    "actions": {
      type: Object,
      default: ()=>({
        "buy" : "i18n:buy-now"
      })
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    TopClass() {
      return this.getTopClass()
    },
    //......................................
    FormData() {
      return {
        ...this.meta,
        buyAmount : this.buyAmount
      }
    },
    //......................................
    previewImageSrc() {
      if(this.previewSrc && this.meta) {
        return Ti.S.renderBy(this.previewSrc, this.meta)
      }
    },
    //......................................
    MetaTitle() {
      if(this.titleKey) {
        return _.get(this.meta, this.titleKey)
      }
      return "NoTitle"
    }
    //......................................
  },
  //////////////////////////////////////////
  methods : {
    //......................................
    OnClickBuyNow() {
      this.$notify("buy:now")
    },
    //......................................
    OnFormChanged({name, value}) {
      this.$notify("meta:changed", {name, value})
    }
    //......................................
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/web/meta/commodity/web-meta-commodity.mjs", _M);
})();
//============================================================
// JOIN: web/meta/commodity/_com.json
//============================================================
Ti.Preload("ti/com/web/meta/commodity/_com.json", {
  "name" : "web-meta-commodity",
  "globally" : true,
  "template" : "./web-meta-commodity.html",
  "mixins"   : ["./web-meta-commodity.mjs"],
  "components" : [
    "@com:web/meta/preview"
  ]
});
//============================================================
// JOIN: web/meta/order/com/order-item/order-item.html
//============================================================
Ti.Preload("ti/com/web/meta/order/com/order-item/order-item.html", `<div class="as-row order-item">
  <!--Thumb/Title-->
  <div class="as-cell">
    <div class="as-title">
      <ti-icon 
        :value="thumbObj" 
        width=".32rem" 
        height=".32rem"/>
      <span class="as-text">{{title}}</span>
    </div>
  </div>
  <!--price-->
  <div class="as-cell as-price">
    <span>{{price}}</span>
  </div>
  <!--amount-->
  <div class="as-cell as-amount">
    <span>{{amount}}</span>
  </div>
  <!--Total-->
  <div class="as-cell as-fee">
    <em class="ti-num is-md">{{feeText}}</em>
  </div>
</div>`);
//============================================================
// JOIN: web/meta/order/com/order-item/order-item.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  props : {
    "id" : {
      type : String,
      default : null
    },
    "thumb" : {
      type : String,
      default : null
    },
    "src" : {
      type : String,
      default : "/api/thumb?id:${id}"
    },
    "dftIcon" : {
      type : String,
      default : "fas-cube"
    },
    "title" : {
      type : String,
      default : null
    },
    "price" : {
      type : Number,
      default : 1
    },
    "currency" : {
      type : String,
      default : "RMB"
    },
    "amount" : {
      type : Number,
      default : 1
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    thumbObj() {
      if(this.thumb) {
        let imgSrc = Ti.S.renderBy(this.src, this)
        return {type:"image", value:imgSrc}
      }
      return this.dftIcon
    },
    //......................................
    fee() {
      return Ti.WWW.evalFee(this)
    },
    //......................................
    feeText() {
      return Ti.WWW.feeText(this.fee, this.currency)
    }
    //......................................
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/web/meta/order/com/order-item/order-item.mjs", _M);
})();
//============================================================
// JOIN: web/meta/order/com/order-item/_com.json
//============================================================
Ti.Preload("ti/com/web/meta/order/com/order-item/_com.json", {
  "name" : "order-item",
  "globally" : false,
  "template" : "./order-item.html",
  "mixins"   : ["./order-item.mjs"]
});
//============================================================
// JOIN: web/meta/order/web-meta-order.html
//============================================================
Ti.Preload("ti/com/web/meta/order/web-meta-order.html", `<div class="ti-web-meta-order">
  <!--
    Title
  -->
  <h1>确认订单信息</h1>
  <!--
    Item list
  -->
  <div class="as-items">
    <div class="as-table">
      <div class="as-head">
        <ul>
          <li class="as-title">商品</li>
          <li class="as-price">单价</li>
          <li class="as-amount">数量</li>
          <li class="as-fee">小计</li>
        </ul>
      </div>
      <div class="as-body">
        <order-item v-for="it in items"
          :key="it.id"
          v-bind="it"
          :src="itemThumbSrc"
          :currency="currency"/>
      </div>
    </div>
  </div>
  <!--
    Summary
  -->
  <div class="as-summary">
    <div class="as-sum-fee">
      <span>实际支付</span>
      <em class="ti-num is-xl">{{totalFeeText}}</em>
    </div>
    <div class="as-btns">
      <a class="ti-btn" @click="onSubmit">提交订单</a>
    </div>
  </div>

</div>`);
//============================================================
// JOIN: web/meta/order/web-meta-order.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  props : {
    "items" : {
      type : Array,
      default : ()=>[]
    },
    "itemThumbSrc" : {
      type : String,
      default : "/api/thumb?id:${id}"
    },
    "currency" : {
      type : String,
      default : "RMB"
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    totalFee() {
      let tot = 0
      for(let it of this.items) {
        tot += Ti.WWW.evalFee(it)
      }
      return tot
    },
    //......................................
    totalFeeText() {
      return Ti.WWW.feeText(this.totalFee, this.currency)
    }
    //......................................
  },
  methods : {
    onSubmit() {
      this.$notify("order:submit", {
        items    : this.items,
        currency : this.currency
      })
    }
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/web/meta/order/web-meta-order.mjs", _M);
})();
//============================================================
// JOIN: web/meta/order/_com.json
//============================================================
Ti.Preload("ti/com/web/meta/order/_com.json", {
  "name" : "web-meta-order",
  "globally" : true,
  "template" : "./web-meta-order.html",
  "mixins"   : ["./web-meta-order.mjs"],
  "components" : [
    "./com/order-item"
  ]
});
//============================================================
// JOIN: web/meta/preview/web-meta-preview.html
//============================================================
Ti.Preload("ti/com/web/meta/preview/web-meta-preview.html", `<div class="ti-web-preview ti-fill-parent">
  <!--
    Top: Image
  -->
  <div class="as-preview">
    <ti-icon value="zmdi-image"/>
  </div>
  <!--
    Bottom: List
  -->
  
</div>`);
//============================================================
// JOIN: web/meta/preview/web-meta-preview.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "logo" : {
      type : [String, Object],
      default : "zmdi-chevron-down"
    },
    "brief" : {
      type : String,
      default : null
    },
    "copyright" : {
      type : String,
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/web/meta/preview/web-meta-preview.mjs", _M);
})();
//============================================================
// JOIN: web/meta/preview/_com.json
//============================================================
Ti.Preload("ti/com/web/meta/preview/_com.json", {
  "name" : "web-meta-preview",
  "globally" : true,
  "template" : "./web-meta-preview.html",
  "mixins"   : ["./web-meta-preview.mjs"]
});
//============================================================
// JOIN: web/nav/columns/nav-columns.html
//============================================================
Ti.Preload("ti/com/web/nav/columns/nav-columns.html", `<nav class="web-nav-columns"
  :class="TopClass">
  <!--=======================================-->
  <div v-for="it in TheItems"
    class="as-column">
    <div class="item-self">
      <a
        :key="it.index"
        class="link-item"
        :class="it.className"
        :href="it.href"
        :target="it.target"
        @click.left="OnClickLink($event, it)">
        <!--Icon-->
        <ti-icon
          v-if="it.icon"
            :value="it.icon"/>
        <!--Text-->
        <span
          v-if="it.title"
            class="as-text">{{it.title}}</span>
        </a>
      </div>
      <!--===================================-->
      <!--SubItems-->
      <div
        v-if="it.items"
          class="sub-items">
          <div class="items-con">
            <a
              v-for="sub in it.items"
                :key="sub.index"
                class="sub-item"
                :class="sub.className"
                :href="sub.href"
                :target="sub.target"
                @click.left="OnClickLink($event, sub)">
                <!--Icon-->
                <ti-icon
                  v-if="sub.icon"
                    :value="sub.icon"/>
                <!--Text-->
                <span
                  v-if="sub.title"
                    class="as-text">{{sub.title}}</span>
            </a>
          </div>
      </div>
      <!--===================================-->
  </div>
  <!--=======================================-->
</nav>`);
//============================================================
// JOIN: web/nav/columns/nav-columns.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  props : {
    "items" : {
      type : Array,
      default : ()=>[]
    },
    "path" : {
      type : String,
      default: null
    },
    "align" : {
      type : String,
      default : "center",
      validator: v => /^(left|center|right)$/.test(v)
    },
    "spacing" : {
      type : String,
      validator: v => /^(tiny|comfy|wide)$/.test(v)
    },
    "border" : {
      type : String,
      default : "solid",
      validator: v => /^(none|solid|dashed|dotted)$/.test(v)
    }
  },
  /////////////////////////////////////////
  computed : {
    //------------------------------------
    TopClass() {
      return this.getTopClass(
        `is-spacing-${this.spacing}`,
        `is-align-${this.align}`,
        ()=> {
          if(this.border)
            return `is-border-${this.border}`
        }
      )
    },
    //------------------------------------
    TheItems() {
      return this.evalItems(this.items)
    }
    //------------------------------------
  },
  /////////////////////////////////////////
  methods : {
    //------------------------------------
    OnClickLink(evt, {type,value}={}) {
      if(/^(page|action)$/.test(type)) {
        evt.preventDefault()
        console.log("onClickLink", "nav:to", {type,value})
        this.$notify("nav:to", {type,value})
      }
    },
    //------------------------------------
    evalItems(items) {
      let list = []
      _.forEach(items, (it, index)=>{
        //................................
        let li = _.pick(it, [
          "icon", "title", "type",
          "href", "target", "value"])
        //................................
        li.index = index
        //................................
        if(this.path) {
          li.highlight = it.highlightBy(this.path)
        }
        //................................
        let hasHref = li.href ? true : false;
        li.className = {
          "has-href"    : hasHref,
          "nil-href"    : !hasHref,
          "is-highlight": li.highlight,
          "is-normal"   : !li.highlight,
        }
        //................................
        if(it.items) {
          li.items = this.evalItems(it.items)
        }
        //................................
        list.push(li)
        //................................
      })
      return list
    }
    //------------------------------------
  }
  /////////////////////////////////////////
}
Ti.Preload("ti/com/web/nav/columns/nav-columns.mjs", _M);
})();
//============================================================
// JOIN: web/nav/columns/_com.json
//============================================================
Ti.Preload("ti/com/web/nav/columns/_com.json", {
  "name" : "web-nav-columns",
  "globally" : true,
  "template" : "./nav-columns.html",
  "mixins"   : ["./nav-columns.mjs"],
  "components" : []
});
//============================================================
// JOIN: web/nav/links/nav-links.html
//============================================================
Ti.Preload("ti/com/web/nav/links/nav-links.html", `<nav class="web-nav-links"
  :class="TopClass">
  <!--=======================================-->
  <a
    v-for="it in TheItems"
      :key="it.index"
      class="link-item"
      :class="it.className"
      :href="it.href"
      :target="it.target"
      @click.left="OnClickLink($event, it)"
      @mouseenter="OnItemMouseEnter(it)"
      @mouseleave="OnItemMouseLeave(it)">
      <!--Icon-->
      <ti-icon
        v-if="it.icon"
          :value="it.icon"/>
      <!--Text-->
      <span
        v-if="it.title"
          class="as-text">{{it.title}}</span>
      <!--===================================-->
      <!--SubItems-->
      <div
        v-if="mySubItems && mySubIndex == it.index"
          class="sub-items">
          <div class="items-con">
            <a
              v-for="sub in mySubItems"
                :key="sub.index"
                class="sub-item"
                :class="sub.className"
                :href="sub.href"
                :target="sub.target"
                @click.left="OnClickLink($event, sub)">
                <!--Icon-->
                <ti-icon
                  v-if="sub.icon"
                    :value="sub.icon"/>
                <!--Text-->
                <span
                  v-if="sub.title"
                    class="as-text">{{sub.title}}</span>
            </a>
          </div>
      </div>
      <!--===================================-->
  </a>
  <!--=======================================-->
</nav>`);
//============================================================
// JOIN: web/nav/links/nav-links.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  data: ()=>({
    mySubIndex: -1,
    mySubItems: null
  }),
  /////////////////////////////////////////
  props : {
    "items" : {
      type : Array,
      default : ()=>[]
    },
    "path" : {
      type : String,
      default: null
    },
    "align" : {
      type : String,
      default : "left",
      validator: v => /^(left|center|right)$/.test(v)
    },
    "spacing" : {
      type : String,
      validator: v => /^(tiny|comfy|wide)$/.test(v)
    },
    "border" : {
      type : String,
      default : "solid",
      validator: v => /^(none|solid|dashed|dotted)$/.test(v)
    }
  },
  /////////////////////////////////////////
  computed : {
    //------------------------------------
    TopClass() {
      return this.getTopClass(
        `is-spacing-${this.spacing}`,
        `is-align-${this.align}`,
        ()=> {
          if(this.border)
            return `is-border-${this.border}`
        }
      )
    },
    //------------------------------------
    TheItems() {
      return this.evalItems(this.items)
    }
    //------------------------------------
  },
  /////////////////////////////////////////
  methods : {
    //------------------------------------
    OnClickLink(evt, {type,value}={}) {
      if(/^(page|action)$/.test(type)) {
        evt.preventDefault()
        console.log("onClickLink", "nav:to", {type,value})
        this.$notify("nav:to", {type,value})
      }
    },
    //------------------------------------
    OnItemMouseEnter({index, items}) {
      // Guard
      if(_.isEmpty(items)) {
        this.mySubIndex = -1
        this.mySubItems = null
        return
      }
      // Eval sub items
      this.mySubItems = this.evalItems(items)
      this.mySubIndex = index

      // Dock it
      this.$nextTick(()=>this.dockSub())
    },
    //------------------------------------
    OnItemMouseLeave({index}) {
      if(this.mySubIndex == index) {
        this.mySubIndex = -1
        this.mySubItems = null
      }
    },
    //------------------------------------
    dockSub(){
      let $sub = Ti.Dom.find(".sub-items", this.$el)
      // Guard
      if(!$sub) {
        return
      }
      // Ready to dock
      let $an = $sub.parentNode
      let rAn = Ti.Rects.createBy($an)
      let rSub = Ti.Rects.createBy($sub)
      let css = Ti.Css.toStyle({
        top  : rAn.height,
        left : (rAn.width - rSub.width)/2
      })
      Ti.Dom.setStyle($sub, css)
    },
    //------------------------------------
    evalItems(items) {
      let list = []
      _.forEach(items, (it, index)=>{
        //................................
        let li = _.pick(it, [
          "icon", "title", "type",
          "href", "target", "value",
          "items"])
        //................................
        li.index = index
        //................................
        if(this.path) {
          li.highlight = it.highlightBy(this.path)
        }
        //................................
        let hasHref = li.href ? true : false;
        li.className = {
          "has-href"    : hasHref,
          "nil-href"    : !hasHref,
          "is-highlight": li.highlight,
          "is-normal"   : !li.highlight,
        }
        //................................
        list.push(li)
        //................................
      })
      return list
    }
    //------------------------------------
  }
  /////////////////////////////////////////
}
Ti.Preload("ti/com/web/nav/links/nav-links.mjs", _M);
})();
//============================================================
// JOIN: web/nav/links/_com.json
//============================================================
Ti.Preload("ti/com/web/nav/links/_com.json", {
  "name" : "web-nav-links",
  "globally" : true,
  "template" : "./nav-links.html",
  "mixins"   : ["./nav-links.mjs"],
  "components" : []
});
//============================================================
// JOIN: web/pay/done/web-pay-done.html
//============================================================
Ti.Preload("ti/com/web/pay/done/web-pay-done.html", `<div class="ti-web-pay-done"
  :class="topClass">
  <div class="done-con">
    <!--
      Icon
    -->
    <div class="done-icon">
      <ti-icon :value="theIcon"/>
    </div>
    <!--
      Tip
    -->
    <div class="done-tip">{{theTip | i18n}}</div>
  </div>
</div>`);
//============================================================
// JOIN: web/pay/done/web-pay-done.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "payType" : {
      type : String,
      default : null
    },
    "items" : {
      type : Array,
      default : ()=>[]
    },
    "orderData" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    topClass() {
      return {
        "is-ok"   : this.isOK,
        "is-fail" : this.isFAIL,
        "is-wait" : this.isWAIT
      }
    },
    isOK() {
      return "OK" == this.orderData.st
    },
    isFAIL(){
      return "FAIL" == this.orderData.st
    },
    isWAIT(){
      return "WAIT" == this.orderData.st
    },
    theIcon() {
      if(this.isOK) {
        return "zmdi-check-circle"
      }
      if(this.isFAIL) {
        return "zmdi-alert-octagon"
      }
      return "zmdi-notifications-active"
    },
    theTip() {
      return ({
        "OK"   : "pay-re-ok",
        "FAIL" : "pay-re-fail",
        "WAIT" : "pay-re-wait"
      })[this.orderData.st]
        || "pay-re-nil"
    }
  },
  //////////////////////////////////////////
  methods : {
    
  },
  //////////////////////////////////////////
  watch : {
    
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/web/pay/done/web-pay-done.mjs", _M);
})();
//============================================================
// JOIN: web/pay/done/_com.json
//============================================================
Ti.Preload("ti/com/web/pay/done/_com.json", {
  "name" : "web-pay-done",
  "globally" : true,
  "template" : "./web-pay-done.html",
  "mixins"   : ["./web-pay-done.mjs"]
});
//============================================================
// JOIN: web/pay/scan/web-pay-scan.html
//============================================================
Ti.Preload("ti/com/web/pay/scan/web-pay-scan.html", `<div class="ti-web-pay-scan">
  <div class="scan-con">
    <!--
      QRCODE
    -->
    <div v-if="isQRCODE"
      class="is-qrcode">
      <img :src="paymentDataAsQrcodeUrl">
    </div>
    <!--
      IFRAME
    -->
    <div v-else-if="isIFRAME"
      class="is-iframe">
      <iframe 
        frameborder="0" 
        scrolling="no"
        :src="paymentData"></iframe>
    </div>
    <!--
      Others
    -->
    <div v-else>
      {{paymentData}}
    </div>
    <!--
      Tip
    -->
    <div class="scan-tip">{{theTip | i18n}}</div>
  </div>
  <!--
    Check Button
  -->
  <div class="scan-check-btn ti-btn is-huge"
    @click.left="onClickCheckBtn">
    <ti-icon class="as-icon" :value="checkBtnIcon"/>
    <span class="as-text">{{checkBtnText|i18n}}</span>
  </div>
</div>`);
//============================================================
// JOIN: web/pay/scan/web-pay-scan.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  /////////////////////////////////////////
  data : ()=>({
    __WS : null    // The handle of websocket
  }),
  /////////////////////////////////////////
  props : {
    "watchUser" : {
      type : String,
      default : null
    },
    "payType" : {
      type : String,
      default : null
    },
    "items" : {
      type : Array,
      default : ()=>[]
    },
    "orderStatusOk" : {
      type : Boolean,
      default : false
    },
    "orderPayment" : {
      type : Object,
      default : ()=>({})
    },
    "orderData" : {
      type : Object,
      default : ()=>({})
    },
    "qrcodeSize" : {
      type : Number,
      default : 200
    }
  },
  //////////////////////////////////////////
  computed : {
    isQRCODE() {
      return "QRCODE" == this.orderPayment.dataType
    },
    isIFRAME() {
      return "IFRAME" == this.orderPayment.dataType
    },
    isLINK() {
      return "LINK" == this.orderPayment.dataType
    },
    isJSON() {
      return "JSON" == this.orderPayment.dataType
    },
    isTEXT() {
      return "TEXT" == this.orderPayment.dataType
    },
    paymentData() {
      return this.orderPayment.data
    },
    paymentDataAsQrcodeUrl() {
      return `/gu/qrcode?d=${this.orderPayment.data}&s=${this.qrcodeSize}&_=${Date.now()}`
    },
    theTip() {
      return ({
        "wx.qrcode"  : "pay-tip-wx-qrcode",
        "zfb.qrcode" : "pay-tip-zfb-qrcode"
      })[this.payType]
        || "pay-by-nil"
    },
    checkBtnIcon(){
      return "zmdi-assignment-check"
    },
    checkBtnText(){
      return "i18n:pay-check-do"
    }
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    onClickCheckBtn() {
      this.$notify("pay-check")
    },
    //--------------------------------------
    async watchPaymentChanged() {
      // Guard
      if(this.__WS 
        || !this.watchUser 
        || !this.orderData 
        || !this.orderData.pay_id) {
        return
      }
      // Watch Remote
      this.__WS = Ti.Websocket.listenRemote({
        watchTo : {
          method : "watch",
          user   : this.watchUser,
          match  : {
            id : this.orderData.pay_id
          }
        },
        received : (wso)=>{
          console.log("websocket", wso)
          this.onClickCheckBtn()
        },
        closed : ()=>{
          this.unwatchPaymentChanged()
        }
      })
    },
    //--------------------------------------
    unwatchPaymentChanged() {
      if(this.__WS) {
        this.__WS.close();
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "orderData.st" : function() {
      if(/^(OK|FAIL)$/.test(this.orderData.st)) {
        this.$notify("pay-done")
      }
    }
  },
  //////////////////////////////////////////
  mounted : function() {
    this.watchPaymentChanged()
  },
  //////////////////////////////////////////
  beforeDestroy : function(){
    this.unwatchPaymentChanged()
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/web/pay/scan/web-pay-scan.mjs", _M);
})();
//============================================================
// JOIN: web/pay/scan/_com.json
//============================================================
Ti.Preload("ti/com/web/pay/scan/_com.json", {
  "name" : "web-pay-scan",
  "globally" : true,
  "template" : "./web-pay-scan.html",
  "mixins"   : ["./web-pay-scan.mjs"]
});
//============================================================
// JOIN: web/pay/types/web-pay-types.html
//============================================================
Ti.Preload("ti/com/web/pay/types/web-pay-types.html", `<div class="ti-web-pay-types">
  <!--Choosing-->
  <ti-web-choose-mode
    :base="base"
    :options="options"
    :value="value"
    @change="$notify('change', $event)"/>
  <!--Button-->
  <div class="ti-btn is-huge" 
    :class="btnClass"
    @click.left="onClickBtn">
    <span class="as-text">{{payTypeText|i18n}}</span>
  </div>
</div>`);
//============================================================
// JOIN: web/pay/types/web-pay-types.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "base" : {
      type : String,
      default : "/gu/rs/ti/icons/png/"
    },
    "options" : {
      type : Array,
      default : ()=>[
        {"icon":"wxpay256.png",  "value":"wx.qrcode",  "text":"i18n:pay-wx"},
        {"icon":"alipay256.png", "value":"zfb.qrcode", "text":"i18n:pay-zfb"}]
      // default : ()=>[
      //   {"icon":"fab-weixin",  "value":"wx.qrcode",  "text":"i18n:pay-wx"},
      //   {"icon":"fab-alipay", "value":"zfb.qrcode", "text":"i18n:pay-zfb"}]
    },
    "value" : {
      type : String,
      default : null
    },
    "apiName" : {
      type : String,
      default : null
    },
    "orderStatusOk" : {
      type : Boolean,
      default : false
    }
  },
  //////////////////////////////////////////
  computed : {
    payTypeText() {
      return ({
        "wx.qrcode"  : "pay-by-wx-qrcode",
        "zfb.qrcode" : "pay-by-zfb-qrcode"
      })[this.value]
        || "pay-by-nil"
    },
    btnClass() {
      if(this.value) {
        return "is-enabled"
      }
      return "is-disabled"
    }
  },
  //////////////////////////////////////////
  methods : {
    onClickBtn() {
      if(this.value) {
        this.$notify("pay-buy")
      }
    }
  },
  //////////////////////////////////////////
  watch : {
    "orderStatusOk" : function(){
      if(this.orderStatusOk) {
        this.$notify("pay-ready")
      }
    }
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/web/pay/types/web-pay-types.mjs", _M);
})();
//============================================================
// JOIN: web/pay/types/_com.json
//============================================================
Ti.Preload("ti/com/web/pay/types/_com.json", {
  "name" : "web-pay-types",
  "globally" : true,
  "template" : "./web-pay-types.html",
  "mixins"   : ["./web-pay-types.mjs"],
  "components" : ["@com:web/widget/choose-mode"]
});
//============================================================
// JOIN: web/shelf/free/web-shelf-free.html
//============================================================
Ti.Preload("ti/com/web/shelf/free/web-shelf-free.html", `<div class="web-shelf-free"
  :class="TopClass"
  :style="TopStyle">
  <!--=============================-->
  <div class="free-main"
    :style="MainStyle">
    <div 
      v-for="it in TheItems"
        :key="it.key"
        class="free-item"
        :class="it.className"
        :style="it.style">
      <component
        :is="it.comType"
        v-bind="it.comConf"/>
    </div>
  </div>
  <!--=============================-->
</div>`);
//============================================================
// JOIN: web/shelf/free/web-shelf-free.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////
  props : {
    "base": {
      type: String,
      default: undefined
    },
    /*
    Each item should obey the form below:
    {
      position: "top|left|bottom|right|center|free",
      className: "item-class-selector",
      style: {...},
      comType: "xxx",
      comConf: {...}
    }
    */
    "items" : {
      type : Array,
      default : ()=>[]
    },
    "background": {
      type: String,
      default: null
    },
    "width": {
      type: [String, Number],
      default: undefined
    },
    "height": {
      type: [String, Number],
      default: undefined
    },
    "mainBackground": {
      type: String,
      default: null
    },
    "mainWidth": {
      type: [String, Number],
      default: undefined
    },
    "mainHeight": {
      type: [String, Number],
      default: undefined
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height,
        backgroundImage: this.getCssBackgroundUrl(this.background)
      })
    },
    //--------------------------------------
    MainStyle() {
      return Ti.Css.toStyle({
        width  : this.mainWidth,
        height : this.mainHeight,
        backgroundImage: this.getCssBackgroundUrl(this.mainBackground)
      })
    },
    //--------------------------------------
    TheItems() {
      if(!_.isArray(this.items))
        return []
      
      let list = []      
      _.forEach(this.items, (it, index)=>{
        // Eval the class
        let klass = [`at-${it.position||"free"}`, `i-${index}`]
        if(it.className) {
          klass.push(it.className)
        }
          
        // Eval style
        let style = Ti.Css.toStyle(it.style)

        // Join
        list.push({
          key: `It-${index}`,
          index,
          className: Ti.Css.mergeClassName(klass),
          style,
          comType: it.comType || "WebTextRaw",
          comConf: it.comConf
        })        
      })
      // Get the result
      return list
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    getCssBackgroundUrl(src) {
      return Ti.Css.toBackgroundUrl(src, this.base)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/web/shelf/free/web-shelf-free.mjs", _M);
})();
//============================================================
// JOIN: web/shelf/free/_com.json
//============================================================
Ti.Preload("ti/com/web/shelf/free/_com.json", {
  "name" : "web-shelf-free",
  "globally" : true,
  "template" : "./web-shelf-free.html",
  "mixins" : ["./web-shelf-free.mjs"]
});
//============================================================
// JOIN: web/shelf/scroller/web-shelf-scroller.html
//============================================================
Ti.Preload("ti/com/web/shelf/scroller/web-shelf-scroller.html", `<div class="web-shelf-scroller"
  :class="TopClass">
  <!--=======================================-->
  <div class="scroll-btn at-left" :class="BtnLeftClass">
    <span @click.left="OnScrollLeft"><ti-icon :value="iconLeft"/></span>
  </div>
  <!--=======================================-->
  <div class="scroller-outer" ref="outer">
    <!--=====================================-->
    <div class="scroller-inner" ref="inner"
      :style="InnerStyle">
      <!--===================================-->
      <div
        v-for="it in ItemList"
          class="scroller-tile"
          :key="it.key"
          :style="ItemStyle">
          <component
            :is="it.comType"
            v-bind="it.comConf"/>
      </div>
      <!--===================================-->
    </div>
    <!--=====================================-->
  </div>
  <!--=======================================-->
  <div class="scroll-btn at-right" :class="BtnRightClass">
    <span @click.left="OnScrollRight"><ti-icon :value="iconRight"/></span>
  </div>
  <!--=======================================-->
</div>`);
//============================================================
// JOIN: web/shelf/scroller/web-shelf-scroller.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////
  data: ()=>({
    myScrollLeft  : 0,
    myMaxScroll   : 0,
    myScrollWidth : 0
  }),
  //////////////////////////////////////////
  props : {
    "data" : {
      type : Array,
      default : ()=>[]
    },
    // Item count per-row
    "cols" : {
      type : Number,
      default : 4,
      validator: v => v > 0
    },
    // Item comType
    "comType": {
      type: String,
      default: "ti-label"
    },
    "comConf": {
      type: Object,
      default: ()=>({
        value: "=.."
      })
    },
    "iconLeft": {
      type: String,
      default: "zmdi-chevron-left"
    },
    "iconRight": {
      type: String,
      default: "zmdi-chevron-right"
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    InnerStyle() {
      return {
        "left": Ti.Css.toSize(this.myScrollLeft)
      }
    },
    //--------------------------------------
    ItemStyle() {
      return {
        "width" : Ti.Types.toPercent(1/this.cols)
      }
    },
    //--------------------------------------
    isLeftEnabled() {return this.myScrollLeft < 0;},
    isRightEnabled() {
      return (this.myScrollLeft + this.myMaxScroll) > this.myScrollWidth
    },
    //--------------------------------------
    BtnLeftClass() {
      return {
        "is-enabled"  : this.isLeftEnabled,
        "is-disabled" : !this.isLeftEnabled
      }
    },
    //--------------------------------------
    BtnRightClass() {
      return {
        "is-enabled"  : this.isRightEnabled,
        "is-disabled" : !this.isRightEnabled
      }
    },
    //--------------------------------------
    ItemList() {
      if(!_.isArray(this.data))
        return []
      
      let list = []      
      for(let i=0; i < this.data.length; i++) {
        let it = this.data[i]
        let comConf = _.assign({}, this.comConf, {
          value: it
        })
        list.push({
          key: `It-${i}`,
          comType: this.comType,
          comConf
        })
      }
      
      // Get the result
      return list
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnScrollLeft() {
      // Guard
      if(!this.isLeftEnabled) {
        return
      }
      // Do Scroll
      let step = Math.abs(this.myScrollLeft)
      step = Math.min(this.myScrollWidth, step)
      this.myScrollLeft += step
    },
    //--------------------------------------
    OnScrollRight() {
      // Guard
      if(!this.isRightEnabled) {
        return
      }
      // Do Scroll
      let remain = this.myMaxScroll - (this.myScrollLeft+this.myScrollWidth)
      let step = Math.min(this.myScrollWidth, remain)
      this.myScrollLeft -= step
    },
    //--------------------------------------
    evalScrolling() {
      this.myMaxScroll = this.$refs.inner.scrollWidth;
      this.myScrollWidth = this.$refs.outer.getBoundingClientRect().width;
      this.myScrollLeft = 0;
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "data": {
      handler: function(){
        this.$nextTick(()=>{
          this.evalScrolling()
        })
      },
      immediate: true
    }
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/web/shelf/scroller/web-shelf-scroller.mjs", _M);
})();
//============================================================
// JOIN: web/shelf/scroller/_com.json
//============================================================
Ti.Preload("ti/com/web/shelf/scroller/_com.json", {
  "name" : "web-shelf-scroller",
  "globally" : true,
  "template" : "./web-shelf-scroller.html",
  "mixins" : ["./web-shelf-scroller.mjs"]
});
//============================================================
// JOIN: web/shelf/wall/web-shelf-wall.html
//============================================================
Ti.Preload("ti/com/web/shelf/wall/web-shelf-wall.html", `<div class="web-shelf-wall"
  :class="TopClass">
  <!--
    Each rows
  -->
  <div v-for="wr in WallList"
    class="wall-group"
    :key="wr.key">
    <!--
      ===========================================
      Items in row
    -->
    <template v-for="it in wr.items">
      <!--
        Blank
      -->
      <div
        v-if="it.blank"
          class="wall-tile is-blank"
          :style="ItemStyle"></div>
      <!--
        Normal Item
      -->
      <div
        v-else
          class="wall-tile is-com"
          :style="ItemStyle">
          <component
            :is="it.comType"
            v-bind="it.comConf"/>
      </div>
    </template> <!-- End item-->
  </div> <!--End Row-->
</div>`);
//============================================================
// JOIN: web/shelf/wall/web-shelf-wall.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////
  props : {
    "data" : {
      type : Array,
      default : ()=>[]
    },
    // Item count per-row
    "cols" : {
      type : Number,
      default : 4,
      validator: v => v>0 && (parseInt(v) == v)
    },
    // Item comType
    "comType": {
      type: String,
      default: "ti-label"
    },
    "comConf": {
      type: Object,
      default: ()=>({
        value: "=.."
      })
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    ItemStyle() {
      return {
        "width" : Ti.Types.toPercent(1/this.cols)
      }
    },
    //--------------------------------------
    WallList() {
      if(!_.isArray(this.data))
        return []
      
      let list = []      
      let items = []
      let count = 1
      for(let i=0; i < this.data.length; i++) {
        let it = this.data[i]
        let comConf = _.assign({}, this.comConf, {
          value: it
        })
        items.push({
          key: `It-${i}`,
          comType: this.comType,
          comConf
        })        

        // Next row
        if(count >= this.cols) {
          count = 1
          list.push({
            key: `Row-${list.length}`,
            items
          })
          items = []
        }
        // Next item
        else {
          count++
        }
      }
      // The last line
      if(!_.isEmpty(items)) {
        for(let i=items.length; i<this.cols; i++) {
          items.push({
            key: `It-${i}`,
            blank: true
          })
        }
        list.push({
          key: `Row-${list.length}`,
          items
        })
      }
      // Get the result
      return list
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    //--------------------------------------
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/web/shelf/wall/web-shelf-wall.mjs", _M);
})();
//============================================================
// JOIN: web/shelf/wall/_com.json
//============================================================
Ti.Preload("ti/com/web/shelf/wall/_com.json", {
  "name" : "web-shelf-wall",
  "globally" : true,
  "template" : "./web-shelf-wall.html",
  "mixins" : ["./web-shelf-wall.mjs"]
});
//============================================================
// JOIN: web/text/heading/web-text-heading.html
//============================================================
Ti.Preload("ti/com/web/text/heading/web-text-heading.html", `<div class="web-text-heading">
  <!--Icon-->
  <div
    v-if="icon"
      class="as-icon"><ti-icon :value="icon"/></div>
  <!--Title-->
  <div
    v-if="title"
      class="as-title"
      @click.left="OnClickTitle"><span>{{title|i18n}}</span></div>
  <!--Comments-->
  <div
    v-if="comment"
      class="as-comment"><span>{{comment|i18n}}</span></div>
  <!--View more-->
  <div
    v-if="more"
      class="as-more"
      @click.left="OnClickMore"><span>{{more|i18n}}</span></div>
</div>`);
//============================================================
// JOIN: web/text/heading/web-text-heading.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  props : {
    "icon": {
      type : String,
      default: null
    },
    "title" : {
      type : String,
      default : null
    },
    "comment" : {
      type : String,
      default : null
    },
    "more": {
      type: String,
      default: null
    },
    "value": null
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickTitle() {
      this.$notify("fire", this.value)
    },
    //--------------------------------------
    OnClickMore() {
      this.$notify("more", this.value)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/web/text/heading/web-text-heading.mjs", _M);
})();
//============================================================
// JOIN: web/text/heading/_com.json
//============================================================
Ti.Preload("ti/com/web/text/heading/_com.json", {
  "name" : "web-text-heading",
  "globally" : true,
  "template" : "./web-text-heading.html",
  "mixins"   : ["./web-text-heading.mjs"]
});
//============================================================
// JOIN: web/text/raw/web-text-raw.html
//============================================================
Ti.Preload("ti/com/web/text/raw/web-text-raw.html", `<div class="web-text-raw" :class="TopClass"><span>{{TheValue}}</span></div>
<div class="web-text-raw" :class="TopClass"><span>{{TheValue}}</span></div>`);
//============================================================
// JOIN: web/text/raw/web-text-raw.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  props : {
    "value": {
      type : [String, Number],
      default : "Web Text"
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    TheValue() {
      return this.value
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/web/text/raw/web-text-raw.mjs", _M);
})();
//============================================================
// JOIN: web/text/raw/_com.json
//============================================================
Ti.Preload("ti/com/web/text/raw/_com.json", {
  "name" : "web-text-raw",
  "globally" : true,
  "template" : "./web-text-raw.html",
  "mixins"   : ["./web-text-raw.mjs"]
});
//============================================================
// JOIN: web/widget/choose-mode/web-choose-mode.html
//============================================================
Ti.Preload("ti/com/web/widget/choose-mode/web-choose-mode.html", `<div class="ti-web-choose-mode">
  <div v-for="it in theItems"
    class="wcm-item"
    :class="it.className"
    @click.left="onClickItem(it)">
    <!--Icon-->
    <ti-icon
      class="as-icon"
      :base="base"
      :value="it.icon"/>
    <!--Text-->
    <div v-if="it.text"
      class="as-text">{{it.text|i18n}}</div>
  </div>
</div>`);
//============================================================
// JOIN: web/widget/choose-mode/web-choose-mode.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "base" : {
      type : String,
      default : null
    },
    "options" : {
      type : Array,
      default : ()=>[]
    },
    "value" : {
      type : String,
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    theItems() {
      let list = []
      for(let it of this.options) {
        list.push(_.assign({}, it, {
          className : _.isEqual(this.value, it.value)
            ? "is-current" : "is-others"
        }))
      }
      return list
    }
    //......................................
  },
  //////////////////////////////////////////
  methods : {
    //......................................
    onClickItem(it) {
      this.$notify("change", it.value)
    }
    //......................................
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/web/widget/choose-mode/web-choose-mode.mjs", _M);
})();
//============================================================
// JOIN: web/widget/choose-mode/_com.json
//============================================================
Ti.Preload("ti/com/web/widget/choose-mode/_com.json", {
  "name" : "web-choose-mode",
  "globally" : true,
  "template" : "./web-choose-mode.html",
  "mixins"   : ["./web-choose-mode.mjs"]
});
//============================================================
// JOIN: web/widget/sharebar/web-widget-sharebar.html
//============================================================
Ti.Preload("ti/com/web/widget/sharebar/web-widget-sharebar.html", `<div class="web-widget-sharebar"
  :class="TopClass">
  <!--
    Title
  -->
  <div
    v-if="title"
      class="as-title">{{title|i18n}}</div>
  <!--
    Items
  -->
  <div class="as-items">
    <a
      v-for="it in TheItems"
        class="bar-item">
      <i :class="it.iconClass"></i>
    </a>
  </div>
</div>`);
//============================================================
// JOIN: web/widget/sharebar/web-widget-sharebar.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  props : {
    "title": {
      type: String,
      default: null
    },
    "items" : {
      type : Array,
      default : ()=>[]
    }
  },
  /////////////////////////////////////////
  computed : {
    //------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------
    TheItems() {
      return this.evalItems(this.items)
    }
    //------------------------------------
  },
  /////////////////////////////////////////
  methods : {
    //------------------------------------
    evalItems(items) {
      let list = []
      _.forEach(items, (it, index)=>{
        //................................
        let li = ({
          //..............................
          "facebook": {
            iconClass: "fab fa-facebook-f"
          },
          //..............................
          "twitter": {
            iconClass: "fab fa-twitter"
          },
          //..............................
          "instagram": {
            iconClass: "fab fa-instagram"
          },
          //..............................
          "tumblr": {
            iconClass: "fab fa-tumblr"
          }
          //..............................
          //..............................
        })[it]
        //................................
        if(li)
          list.push(li)
        //................................
      })
      return list
    }
    //------------------------------------
  }
  /////////////////////////////////////////
}
Ti.Preload("ti/com/web/widget/sharebar/web-widget-sharebar.mjs", _M);
})();
//============================================================
// JOIN: web/widget/sharebar/_com.json
//============================================================
Ti.Preload("ti/com/web/widget/sharebar/_com.json", {
  "name" : "web-widget-sharebar",
  "globally" : true,
  "template" : "./web-widget-sharebar.html",
  "mixins"   : ["./web-widget-sharebar.mjs"],
  "components" : []
});
//============================================================
// JOIN: wn/adaptlist/wn-adaptlist-methods.mjs
//============================================================
(function(){
const OBJ = {
  //---------------------------------------
  /***
   * Create new object
   */
  async doCreate() {
    // Load the creation setting
    let {
      types, 
      freeCreate
    } = await Wn.Sys.exec(`ti creation -cqn id:${this.meta.id}`, {as:"json"})

    let no = await Ti.App.Open({
      title : "i18n:create",
      type  : "success",
      position: "top",
      width  : 640,
      height : "61.8%",
      comType : "ti-obj-creation",
      comConf : {
        types, freeCreate
      },
      components : ["@com:ti/obj/creation"]
    })
    
    // Do Create
    // Check the newName
    if(no && no.name) {
      // Check the newName contains the invalid char
      if(no.name.search(/[%;:"'*?`\t^<>\/\\]/)>=0) {
        return await Ti.Alert('i18n:wn-create-invalid')
      }
      // Check the newName length
      if(no.length > 256) {
        return await Ti.Alert('i18n:wn-create-too-long')
      }      
      // Do the creation
      let json = JSON.stringify({
        nm   : no.name, 
        tp   : no.type=="folder"?"":no.type, 
        race : no.race
      })
      let newMeta = await Wn.Sys.exec2(
          `obj id:${this.meta.id} -cqno -new '${json}'`,
          {as:"json"})
      // Error
      if(newMeta instanceof Error) {
        Ti.Toast.Open("i18n:wn-create-fail", "error")
      }
      // Replace the data
      else {
        Ti.Toast.Open("i18n:wn-create-ok", "success")
        await this._run("reload")

        // Make it checked
        this.myCheckedIds = [newMeta.id]
        this.myCurrentId = newMeta.id
      }
    }  // ~ if(newName)
  },
  //--------------------------------------------
  async doRename() {
    let it = this.getCurrentItem()
    if(!it) {
      return await Ti.Toast.Open('i18n:wn-rename-none', "warn")
    }
    this.setItemStatus(it.id, "renaming")
    try {
      // Get newName from User input
      let newName = await Ti.Prompt({
          text : 'i18n:wn-rename',
          vars : {name:it.nm}
        }, {
          title : "i18n:rename",
          placeholder : it.nm,
          value : it.nm
        })
      // Check the newName
      if(newName) {
        // Check the newName contains the invalid char
        if(newName.search(/[%;:"'*?`\t^<>\/\\]/)>=0) {
          return await Ti.Alert('i18n:wn-rename-invalid')
        }
        // Check the newName length
        if(newName.length > 256) {
          return await Ti.Alert('i18n:wn-rename-too-long')
        }
        // Check the suffix Name
        let oldSuffix = Ti.Util.getSuffix(it.nm)
        let newSuffix = Ti.Util.getSuffix(newName)
        if(oldSuffix && oldSuffix != newSuffix) {
          let repair = await Ti.Confirm("i18n:wn-rename-suffix-changed")
          if(repair) {
            newName += oldSuffix
          }
        }
        // Mark renaming
        this.setItemStatus(it.id, "loading")
        // Do the rename
        let newMeta = await Wn.Sys.exec2(
            `obj id:${it.id} -cqno -u 'nm:"${newName}"'`,
            {as:"json"})
        // Error
        if(newMeta instanceof Error) {
          Ti.Toast.Open("i18n:wn-rename-fail", "error")
        }
        // Replace the data
        else {
          Ti.Toast.Open("i18n:wn-rename-ok", "success")
          this.setItem(newMeta)
        }
        this.setItemStatus({id:it.id, status:{loading:false}})
      }  // ~ if(newName)
    }
    // reset the status
    finally {
      this.setItemStatus(it.id, null)
    }
  },
  //--------------------------------------------
  async doDelete() {
    let list = this.getCheckedItems()
    // Guard
    if(_.isEmpty(list)) {
      return await Ti.Toast.Open('i18n:wn-del-none', "warn")
    }

    let delCount = 0
    // make removed files. it remove a video
    // it will auto-remove the `videoc_dir` in serverside also
    // so, in order to avoid delete the no-exists file, I should
    // remove the `videoc_dir` ID here, each time loop, check current
    // match the id set or not, then I will get peace
    let exRemovedIds = {}
    try {
      // Loop items
      for(let it of list) {
        // Duck check
        if(!it || !it.id || !it.nm)
          continue
        // Ignore obsolete item
        if(it.__is && (it.__is.loading || it.__is.removed))
          continue
        // Ignore the exRemovedIds
        if(exRemovedIds[it.id])
          continue
        
        // Mark item is processing
        this.setItemStatus(it.id, "loading")
        // If DIR, check it is empty or not
        if('DIR' == it.race) {
          let count = await Wn.Sys.exec(`count -A id:${it.id}`)
          count = parseInt(count)
          if(count > 0) {
            // If user confirmed, then rm it recurently
            if(!(await Ti.Confirm({
                text:'i18n:wn-del-no-empty-folder', vars:{nm:it.nm}}))) {
              this.setItemStatus(it.id, null)
              continue
            }
          }
        }
        // Do delete
        await Wn.Sys.exec(`rm ${'DIR'==it.race?"-r":""} id:${it.id}`)
        // Mark item removed
        this.setItemStatus(it.id, "removed")
        // If video result folder, mark it at same time
        let m = /^id:(.+)$/.exec(it.videoc_dir)
        if(m) {
          let vdId = m[1]
          exRemovedIds[vdId] = true
          this.setItemStatus(vdId, "removed")
        }
        // Counting
        delCount++
        // Then continue the loop .......^
      }
      // Do reload
      await this._run("reload")
    }
    // End deleting
    finally {
      Ti.Toast.Open("i18n:wn-del-ok", {N:delCount}, "success")
    }

  },
  //--------------------------------------------
  async doUpload(files=[]) {
    // Prepare the list
    let ups = _.map(files, (file, index)=>({
      id : `U${index}_${Ti.Random.str(6)}`,
      file : file,
      total : file.size,
      current : 0
    }))

    // Show Uploading
    this.myUploadigFiles = ups

    // Prepare the list
    let newIds = {}
    // Do upload file one by one
    for(let up of ups) {
      let file = up.file
      let {ok, data} = await Wn.Io.uploadFile(file, {
        target : `id:${this.meta.id}`,
        progress : function(pe){
          up.current = pe.loaded
        }
      })
      if(ok) {
        newIds[data.id] = true
      }
    }

    // All done, hide upload
    _.delay(()=>{
      this.myUploadigFiles = []
    }, 1000)

    // Tell user ...
    Ti.Toast.Open("i18n:upload-done", "success")


    // Call reload
    await this._run("reload")

    // Make it checked
    this.myCheckedIds = newIds
    this.myCurrentId = null
  },
  //--------------------------------------------
  async doDownload() {
    let list = this.getCheckedItems()
    if(_.isEmpty(list)) {
      return await Ti.Toast.Open('i18n:wn-download-none', "warn")
    }
    // Too many, confirm at first
    if(list.length > 5) {
      if(!await Ti.Confirm({
        text : "i18n:wn-download-too-many",
        vars : {N:list.length}})) {
        return
      }
    }
    // Do the download
    for(let it of list) {
      if('FILE' != it.race) {
        if(!await Ti.Confirm({
            text : "i18n:wn-download-dir",
            vars : it
          }, {
            textYes : "i18n:continue",
            textNo  : "i18n:terminate"
          })){
          return
        }
        continue;
      }
      let link = Wn.Util.getDownloadLink(it)
      Ti.Be.OpenLink(link)
    }
  }
  //--------------------------------------------
}
Ti.Preload("ti/com/wn/adaptlist/wn-adaptlist-methods.mjs", OBJ);
})();
//============================================================
// JOIN: wn/adaptlist/wn-adaptlist-props.mjs
//============================================================
(function(){
const _M = {
  //-----------------------------------
  // Data
  //-----------------------------------
  "meta" : {
    type : Object,
    default : null
  },
  // {list:[], pager:{..}}
  "data" : {
    type : [Object, Array],
    default : null
  },
  "changedId" : {
    type : String,
    default : null
  },
  "status" : {
    type : Object,
    default : ()=>({
      reloading : false
    })
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  // Drop files to upload
  "droppable" : {
    type : Boolean,
    default : true
  },
  // multi-selectable
  // effected when selectable is true
  "multi" : {
    type : Boolean,
    default : true
  },
  "checkable" : {
    type : Boolean,
    default : true
  },
  "blurable" : {
    type : Boolean,
    default : true
  },
  "selectable" : {
    type : Boolean,
    default : true
  },
  // aspect: list item spacing
  // `xs|sm|md|lg|xl`
  "spacing" : {
    type : String,
    default : "sm"
  },
  "keeyHiddenBy" : {
    type : String,
    default : "wn-list-adaptview-expose-hidden"
  },
  "routers" : {
    type : Object,
    default : ()=>({
      "reload" : "dispatch:current/reload"
    })
  },
  "listConf" : {
    type : Object,
    default : undefined
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "itemClassName" : {
    type : String,
    default : null
  }
}
Ti.Preload("ti/com/wn/adaptlist/wn-adaptlist-props.mjs", _M);
})();
//============================================================
// JOIN: wn/adaptlist/wn-adaptlist.html
//============================================================
Ti.Preload("ti/com/wn/adaptlist/wn-adaptlist.html", `<div class="wn-adaptlist" 
  :class="TopClass"
  v-ti-activable>
  <div class="ti-fill-parent"
    v-drop-files.mask="OnDropFiles">
    <!--==================================
      Show Loading
    -->
    <ti-loading
      v-if="isReloading" 
        text="i18n:reloading"/>
    <!--==================================
      Data List
    -->
    <ti-wall
      v-else
        class="ti-fill-parent"
        :data="TheDataList"
        :spacing="spacing"
        :changed-id="changedId"
        :current-id="myCurrentId"
        :checked-ids="myCheckedIds"
        :multi="multi"
        :checkable="checkable"
        :blurable="blurable"
        :selectable="selectable"
        :display="WallItemDisplay"
        :puppet-mode="true"
        v-bind="listConf"
        :on-init="OnListInit"
        @select="OnSelected"/>
    <!--==================================
      Hidden file upload control
    -->
    <input 
      type="file" 
      ref="file" 
      class="ti-hide"
      multiple
      @change.stop.seft="OnSelectLocalFilesToUpload">
    <!--==================================
      Uploading Pannel
    -->
    <div
      class="wal-uploading"
      :class="UploadingClass">
      <header>
        <ti-icon value="fas-spinner fa-pulse"/>
        <span>{{'uploading'|i18n}}</span>
      </header>
      <section>
        <ti-wall 
          :data="TheUploadingList"
          :spacing="spacing"
          :selectable="false"
          :multi="false"
          :checkable="false"
          :blurable="false"
          :display="UploadingItemDisplay"
          :puppet-mode="true"/>
      </section>
    </div>
    <!--==================================-->
  </div>
</div>`);
//============================================================
// JOIN: wn/adaptlist/wn-adaptlist.mjs
//============================================================
(function(){
const _M = {
  ////////////////////////////////////////////////
  data: ()=>({
    myCurrentId  : null,
    myCheckedIds : {},
    myUploadigFiles : [],
    myItemStatus : {},
    myExposeHidden : true,
    myData : null
  }),
  ////////////////////////////////////////////////
  computed : {
    //--------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------------
    isReloading() {
      return _.get(this.status, "reloading")
    },
    //--------------------------------------------
    WallItemDisplay() {
      return {
        key : "..",
        transformer : {
          name : "Wn.Util.getObjThumbInfo",
          args : [{
            status : this.myItemStatus,
            exposeHidden : this.myExposeHidden
          }]
        },
        comType : 'ti-obj-thumb',
        comConf : {
          "..." : "${=value}"
        }
      }
    },
    //--------------------------------------------
    UploadingItemDisplay() {
      return {
        key : "..",
        comType : 'ti-obj-thumb',
        comConf : {
          "..." : "${=value}"
        }
      }
    },
    //--------------------------------------------
    hasDataList() {
      return this.myData && _.isArray(this.myData.list)
    },
    //--------------------------------------------
    TheDataList() {
      if(!this.myData || _.isEmpty(this.myData.list)) {
        return []
      }
      let list = []
      for(let it of this.myData.list) {
        if(!this.isHiddenItem(it)) {
          let status = this.myItemStatus[it.id]
          list.push(_.assign({$wn$adaptlist$status:status}, it))
        }
      }
      return list
    },
    //--------------------------------------------
    /***
     * Show uploading list
     */
    TheUploadingList() {
      let list = this.myUploadigFiles
      let re = []
      if(_.isArray(list)) {
        for(let it of list) {
          // Gen Preview for local image
          let mime = it.file.type
          let tp = Ti.Util.getSuffixName(it.file.name)
          let preview;
          if(/^image\//.test(mime)) {
            preview = {
              type : "localFile",
              value : it.file
            }
          } else {
            preview = Ti.Icons.get({tp, mime})
          }
          // Join to result list
          re.push({
            id    : it.id,
            title : it.file.name,
            preview,
            progress : (it.current/it.total)
          })
        }
      }
      return re
    },
    //--------------------------------------------
    /***
     * has uploading
     */
    hasUploading() {
      return this.myUploadigFiles.length > 0
    },
    //--------------------------------------------
    UploadingClass() {
      return this.hasUploading ? "up-show" : "up-hide"
    }
    //--------------------------------------------
  },  // ~ computed
  ////////////////////////////////////////////////
  methods : {
    //--------------------------------------------
    OnListInit($list){this.$innerList = $list},
    //--------------------------------------------
    // Events
    //--------------------------------------------
    OnSelected({currentId, checkedIds}) {
      //console.log("OnSelected", currentId, checkedIds)
      // For Desktop
      this.myCurrentId  = currentId
      this.myCheckedIds = checkedIds

      return {stop:false}
    },
    //--------------------------------------------
    async OnDropFiles(files) {
      if(!this.droppable)
        return
      let fs = [...files]
      await this.doUpload(fs)
      
      // Wait the computed result and notify
      this.$nextTick(()=>{
        // Find my checked files
        let objs = []
        for(let it of this.TheDataList){
          if(this.myCheckedIds[it.id]){
            objs.push(it)
          }
        }

        // Emit events
        this.$notify("uploaded", objs)
      })
    },
    //--------------------------------------------
    async OnSelectLocalFilesToUpload(evt){
      await this.OnDropFiles(evt.target.files)
      this.$refs.file.value = ""
    },
    //--------------------------------------------
    // Getters
    //--------------------------------------------
    getCurrentItem() {
      if(this.myCurrentId) {
        return _.find(this.TheDataList, it=>it.id == this.myCurrentId)
      }
    },
    //--------------------------------------------
    getCheckedItems() {
      return _.filter(this.TheDataList, it=>this.myCheckedIds[it.id])
    },
    //--------------------------------------------
    setItem(newItem) {
      if(newItem && this.hasDataList) {
        let list = _.map(this.TheDataList, it => {
          return it.id == newItem.id
            ? newItem
            : it
        })
        this.myData.list = list
      }
    },
    //--------------------------------------------
    setItemStatus(id, status="loading") {
      this.myItemStatus = _.assign({}, this.myItemStatus, {
        [id] : status
      })
    },
    //--------------------------------------------
    // For global menu invoke checkAll/cancleAll
    invokeList(methodName) {
      console.log("methodName")
      Ti.InvokeBy(this.$innerList, methodName)
    },
    //--------------------------------------------
    isHiddenItem(it) {
      if(it.nm.startsWith(".") && !this.myExposeHidden) {
        return true
      }
      return false
    },
    //--------------------------------------------
    // Utility
    //--------------------------------------------
    async _run(nm, payload) {
      let target = (this.routers||{})[nm]
      // Run by customized function
      if(_.isFunction(target)) {
        await target()
      }
      // In app
      else if(target) {
        let app = Ti.App(this)
        return await app.exec(target, payload)
      }
    },
    //--------------------------------------------
    toggleExposeHidden() {
      let newVal = !this.myExposeHidden
      this.myExposeHidden = newVal
      if(this.keeyHiddenBy) {
        Ti.Storage.session.set(this.keeyHiddenBy, newVal)
      }
    },
    //--------------------------------------------
    openLocalFileSelectdDialog(){
      this.$refs.file.click()
    },
    //--------------------------------------------
    async openCurrentMeta() {
      let meta = this.getCurrentItem() || this.meta

      if(!meta) {
        return Ti.Toast.Open("i18n:nil-obj")
      }

      let reo = await Wn.EditObjMeta(meta, {fields:"auto"})
      
      // Update to current list
      if(reo) {
        let {updates, data} = reo
        // TODO if update the "thumb" may need to force reload the preview
        // Update to list
        this.setItem(data)
      }
    },
    //--------------------------------------------
    syncMyData() {
      this.myData = _.cloneDeep(this.data) || {
        list: [], pager: {}
      }
      this.myItemStatus = {}
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  watch: {
    //--------------------------------------------
    "data" : {
      handler : "syncMyData",
      immediate : true
    },
    //--------------------------------------------
    "myExposeHidden" : function(eh){
      this.$notify("expose-hidden", eh)
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  mounted : function(){
    //--------------------------------------------
    // Guart the uploading
    Ti.Fuse.getOrCreate().add({
      key : "wn-list-adaptview-check-uploading",
      everythingOk : ()=>{
        return !this.hasUploading
      },
      fail : ()=>{
        Ti.Toast.Open("i18n:upload-nofinished", "warn")
      }
    })
    // Restore the exposeHidden
    if(this.keeyHiddenBy) {
      this.myExposeHidden = Ti.Storage.session.getBoolean(this.keeyHiddenBy)
    }
  },
  //--------------------------------------------
  beforeDestroy : function(){
    Ti.Fuse.get().remove("wn-list-adaptview-check-uploading")
  }
  //--------------------------------------------
  ////////////////////////////////////////////////
}
Ti.Preload("ti/com/wn/adaptlist/wn-adaptlist.mjs", _M);
})();
//============================================================
// JOIN: wn/adaptlist/_com.json
//============================================================
Ti.Preload("ti/com/wn/adaptlist/_com.json", {
  "name" : "wn-adaptlist",
  "globally" : true,
  "template" : "./wn-adaptlist.html",
  "props" : "./wn-adaptlist-props.mjs",
  "methods" : "./wn-adaptlist-methods.mjs",
  "mixins" : ["./wn-adaptlist.mjs"],
  "components" : [
    "@com:ti/obj/thumb",
    "@com:ti/wall"]
});
//============================================================
// JOIN: wn/combo/edit-com/wn-combo-edit-com.html
//============================================================
Ti.Preload("ti/com/wn/combo/edit-com/wn-combo-edit-com.html", `<ti-label
  class="wn-combo-edit-com"
  :class="className"
  :placeholder="placeholder"
  :prefix-icon="ComIcon"
  :value="ComTitle"
  :suffix-icon="'zmdi-delete'"
  @click:value="OnClickValue"
  @suffix:icon="OnClickSuffixIcon"/>
  `);
//============================================================
// JOIN: wn/combo/edit-com/wn-combo-edit-com.mjs
//============================================================
(function(){
const _M = {
  ////////////////////////////////////////////////////
  data : ()=>({
    myCom: null
  }),
  ////////////////////////////////////////////////////
  // props 
  props : {
    "value" : {
      type : Object,
      default : ()=>({})
    },
    "placeholder" : {
      type: String,
      default: "i18n:wn-edit-com-nil"
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    Dict() {
      return Wn.Dict.hMakerComponents()
    },
    //------------------------------------------------
    ComIcon() {
      return _.get(this.myCom, "icon")
    },
    //------------------------------------------------
    ComTitle() {
      return _.get(this.myCom, "title")
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    async OnClickValue() {
      //console.log("click", this.value)
      let com = await Wn.EditTiComponent(this.value)
      if(com) {
        this.notifyChange(com)
      }
    },
    //--------------------------------------
    OnClickSuffixIcon() {
      this.notifyChange({})
    },
    //--------------------------------------
    notifyChange(com={}) {
      if(!com.comType) {
        com.comType = undefined
        com.comConf = undefined
      }
      this.$notify("change", com)
    },
    //--------------------------------------
    async reloadMyCom() {
      if(!_.isEmpty(this.value)) {
        let {comType} = this.value
        this.myCom = await this.Dict.getItem(comType)
      }
      // Empty
      else {
        this.myCom = null
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    "value" : {
      handler: "reloadMyCom",
      immediate : true
    }
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/wn/combo/edit-com/wn-combo-edit-com.mjs", _M);
})();
//============================================================
// JOIN: wn/combo/edit-com/_com.json
//============================================================
Ti.Preload("ti/com/wn/combo/edit-com/_com.json", {
  "name" : "wn-combo-edit-com",
  "globally" : true,
  "template" : "./wn-combo-edit-com.html",
  "mixins"   : "./wn-combo-edit-com.mjs"
});
//============================================================
// JOIN: wn/combo/input/wn-combo-input.html
//============================================================
Ti.Preload("ti/com/wn/combo/input/wn-combo-input.html", `<ti-combo-input v-bind="this"
  
  :options="OptionsDict"
  :drop-com-type="DropComType"
  :prefix-icon="ThePrefixIcon"
  :drop-display="TheDropDisplay"
  
  @change="$notify('change', $event)"/>
  `);
//============================================================
// JOIN: wn/combo/input/wn-combo-input.mjs
//============================================================
(function(){
const _M = {
  ////////////////////////////////////////////////////
  data : ()=>({
    loading : false
  }),
  ////////////////////////////////////////////////////
  // props 
  props : {
    "itemBy" : {
      type : [String, Function],
      default : undefined
    },
    "findBy" : {
      type : [String, Function],
      default : undefined
    },
    "loadingIcon" : {
      type : String,
      default : "zmdi-settings zmdi-hc-spin"
    },
    "canInput" : {
      type : Boolean,
      default : true
    },
    "autoCollapse" : {
      type : Boolean,
      default : false
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    DropComType() {
      return this.dropComType || "wn-list"
    },
    //------------------------------------------------
    ThePrefixIcon() {
      if(this.loading) {
        return this.loadingIcon
      }
      return this.prefixIcon
    },
    //---------------------------------------------------
    OptionsDict() {
      return Wn.Dict.evalOptionsDict(this, ({loading}) => {
        this.loading = loading
      })
    },
    //---------------------------------------------------
    TheDropDisplay() {
      return this.dropDisplay || ["@<thumb>", "title|text"]
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/wn/combo/input/wn-combo-input.mjs", _M);
})();
//============================================================
// JOIN: wn/combo/input/_com.json
//============================================================
Ti.Preload("ti/com/wn/combo/input/_com.json", {
  "name" : "wn-combo-input",
  "globally" : true,
  "template" : "./wn-combo-input.html",
  "props"    : [
    "@com:ti/input/ti-input-props.mjs",
    "@com:ti/combo/input/ti-combo-input-props.mjs"],
  "mixins"   : "./wn-combo-input.mjs",
  "components" : [
    "@com:ti/combo/input",
    "@com:wn/list",
    "@com:wn/obj/icon"]
});
//============================================================
// JOIN: wn/combo/multi-input/wn-combo-multi-input.html
//============================================================
Ti.Preload("ti/com/wn/combo/multi-input/wn-combo-multi-input.html", `<ti-combo-multi-input v-bind="this"

  :options="OptionsDict"
  :tag-mapping="TheTagMapping"
  :drop-com-type="DropComType"
  :prefix-icon="ThePrefixIcon"
  :tag-item-icon-by="TheTagItemIconBy"
  :drop-display="TheDropDisplay"
  
  @change="$notify('change', $event)"/>
  `);
//============================================================
// JOIN: wn/combo/multi-input/wn-combo-multi-input.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    loading : false
  }),
  ////////////////////////////////////////////////////
  // props 
  props : {
    "itemBy" : {
      type : [String, Function],
      default : undefined
    },
    "findBy" : {
      type : [String, Function],
      default : undefined
    },
    "loadingIcon" : {
      type : String,
      default : "zmdi-settings zmdi-hc-spin"
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    DropComType() {
      return this.dropComType || "wn-list"
    },
    //------------------------------------------------
    ThePrefixIcon() {
      if(this.loading && this.prefixIcon) {
        return this.loadingIcon
      }
      return this.prefixIcon
    },
    //---------------------------------------------------
    OptionsDict() {
      return Wn.Dict.evalOptionsDict(this, ({loading}) => {
        this.loading = loading
      })
    },
    //------------------------------------------------
    TheTagMapping() {
      if(!_.isEmpty(this.tagMapping)) {
        return this.tagMapping
      }
      return {
        text  : "title|nm",
        icon  : "icon",
        value : "id"
      }
    },
    //------------------------------------------------
    TheTagItemIconBy() {
      return this.tagItemIconBy
               || (meta => Wn.Util.getObjIcon(meta))
     },
    //---------------------------------------------------
    TheDropDisplay() {
      return this.dropDisplay || ["@<thumb>", "title", "nm"]
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/wn/combo/multi-input/wn-combo-multi-input.mjs", _M);
})();
//============================================================
// JOIN: wn/combo/multi-input/_com.json
//============================================================
Ti.Preload("ti/com/wn/combo/multi-input/_com.json", {
  "name" : "wn-combo-multi-input",
  "globally" : true,
  "template" : "./wn-combo-multi-input.html",
  "props"    : [
    "@com:ti/input/ti-input-props.mjs",
    "@com:ti/input/tags/ti-input-tags-props.mjs",
    "@com:ti/combo/input/ti-combo-input-props.mjs"],
  "mixins"   : "./wn-combo-multi-input.mjs",
  "components" : [
    "@com:ti/combo/multi-input",
    "@com:wn/list",
    "@com:wn/obj/icon"]
});
//============================================================
// JOIN: wn/droplist/wn-droplist.html
//============================================================
Ti.Preload("ti/com/wn/droplist/wn-droplist.html", `<component 
  :is="ComType"
  v-bind="this"
  :can-input="false"
  :must-in-list="true"
  :auto-collapse="true"
  @change="$notify('change', $event)"/>`);
//============================================================
// JOIN: wn/droplist/wn-droplist.mjs
//============================================================
(function(){
const _M = {
  ////////////////////////////////////////////////////
  props : {
    "multi" : {
      type : Boolean,
      default : false
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    ComType() {
      return this.multi
        ? "wn-combo-multi-input"
        : "wn-combo-input"
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
Ti.Preload("ti/com/wn/droplist/wn-droplist.mjs", _M);
})();
//============================================================
// JOIN: wn/droplist/_com.json
//============================================================
Ti.Preload("ti/com/wn/droplist/_com.json", {
  "name" : "wn-droplist",
  "globally" : true,
  "template" : "./wn-droplist.html",
  "props"    : [
    "@com:ti/input/ti-input-props.mjs",
    "@com:ti/input/tags/ti-input-tags-props.mjs",
    "@com:ti/combo/input/ti-combo-input-props.mjs"],
  "mixins"   : ["./wn-droplist.mjs"],
  "components" : [
    "@com:wn/combo/input",
    "@com:wn/combo/multi-input"
  ]
});
//============================================================
// JOIN: wn/explorer/wn-explorer.html
//============================================================
Ti.Preload("ti/com/wn/explorer/wn-explorer.html", `<div class="wn-explorer"
  v-drop-off
  :class="topClass">
  <!--
    Sky
  -->
  <div v-if="show.sky"
    class="explorer-sky">
    <!--Logo-->
    <div v-if="show.logo"
      class="sky-logo ti-flex-center">
      <slot name="logo"></slot>
    </div>
    <!--Title/Crumb-->
    <div v-if="!noTitle"
      class="sky-title">
      <slot name="title">
        <ul class="as-address-bar">
          <li v-for="an in ancestors" :key="an.id">
            <a :href="getObjLink(an)"
              @click.prevent="$notify('main:open', an)">{{getObjTitle(an)}}</a>
            <ti-icon class="center" value="chevron_right"/>
          </li>
          <li v-if="meta">
            <b>{{getObjTitle(meta)}}</b>
            <span v-if="status.changed"
              class="ti-mark-changed">*</span>
          </li>
        </ul>
      </slot>
    </div>
    <!--Actions-->
    <div v-if="show.action"
      class="sky-action ti-flex-right">
      <slot name="action"></slot>
    </div>
  </div>
  <!--
    Aside
  -->
  <div v-if="show.aside"
    class="explorer-aside">
    <slot name="aside"></slot>
  </div>
  <!--
    Main Arena
  -->
  <div class="explorer-arena">
    <slot name="arena"></slot>
  </div>
  <!--
    Footer
  -->
  <div v-if="show.footer"
    class="explorer-footer">
    <slot name="footer"></slot>
  </div>
  <div v-if="loading" class="exploer-loading-mask"></div>
</div>`);
//============================================================
// JOIN: wn/explorer/wn-explorer.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////////
  props : {
    "loading" : {
      type : Boolean,
      default : false
    },
    "noTitle" : {
      type : Boolean,
      default : false
    },
    "meta" :{
      type : Object,
      default : ()=>({})
    },
    "ancestors" : {
      type : Array,
      default : ()=>[]
    },
    "children" : {
      type : Array,
      default : ()=>[]
    },
    "status" : {
      type : Object,
      default : ()=>({
        changed : false
      })
    }
  },
  //////////////////////////////////////////////
  computed : {
    show() {
      let re = {
        logo   : this.$slots.logo   ? true : false,
        action : this.$slots.action ? true : false,
        aside  : this.$slots.aside  ? true : false,
        footer : this.$slots.footer ? true : false,
      }
      re.sky = !(this.noTitle && !re.logo && !re.action)
      return re
    },
    topClass() {
      return {
        "no-sky"    : !this.show.sky,
        "no-aside"  : !this.show.aside,
        "no-footer" : !this.show.footer,
      }
    }
  },
  //////////////////////////////////////////////
  methods : {
    //.........................................
    getObjTitle(meta) {
      let title = meta.title || meta.nm
      return Ti.I18n.text(title)
    },
    //.........................................
    getObjLink(meta) {
      return Wn.Util.getAppLink(meta).toString()
    },
  },
  //////////////////////////////////////////////
  mounted : function() {
    // console.log(this.$slots)
  }
}
Ti.Preload("ti/com/wn/explorer/wn-explorer.mjs", _M);
})();
//============================================================
// JOIN: wn/explorer/_com.json
//============================================================
Ti.Preload("ti/com/wn/explorer/_com.json", {
  "name" : "wn-explorer",
  "globally" : true,
  "template" : "./wn-explorer.html",
  "mixins" : ["./wn-explorer.mjs"]
});
//============================================================
// JOIN: wn/gui/arena/wn-gui-arena.html
//============================================================
Ti.Preload("ti/com/wn/gui/arena/wn-gui-arena.html", `<div class="wn-gui-arena">
  <component 
    :is="comType"
      class="ti-cover-parent"
      v-bind="comConf"/>
</div>`);
//============================================================
// JOIN: wn/gui/arena/wn-gui-arena.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  props : {
    "meta" : {
      type : Object,
      default : null
    },
    "comType" : {
      type : String,
      default : "ti-loading"
    },
    "comConf" : {
      type : Object,
      default : ()=>({})
    }
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/wn/gui/arena/wn-gui-arena.mjs", _M);
})();
//============================================================
// JOIN: wn/gui/arena/_com.json
//============================================================
Ti.Preload("ti/com/wn/gui/arena/_com.json", {
  "name" : "wn-gui-arena",
  "globally" : true,
  "template" : "./wn-gui-arena.html",
  "mixins"   : ["./wn-gui-arena.mjs"]
});
//============================================================
// JOIN: wn/gui/footer/wn-gui-footer.html
//============================================================
Ti.Preload("ti/com/wn/gui/footer/wn-gui-footer.html", `<div class="wn-gui-footer">
  <!--
    Info
  -->
  <div class="as-info ti-flex-center">
    <ti-icon v-if="infoIcon"
      :value="infoIcon"/>
    <span v-if="infoText"
      >{{infoText|i18n}}</span>
  </div>
  <!--
    Message
  -->
  <div class="as-msg ti-flex-center">
    {{message}}
  </div>
  <!--
    Indicator
  -->
  <div class="as-indi">
    {{indicator}}
  </div>
</div>`);
//============================================================
// JOIN: wn/gui/footer/wn-gui-footer.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "infoIcon" : {
      type : [String, Object],
      default : undefined
    },
    "infoText" : {
      type : String,
      default : undefined
    },
    "message" : {
      type : String,
      default : undefined
    },
    "indicator" : {
      type : String,
      default : undefined
    }
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/wn/gui/footer/wn-gui-footer.mjs", _M);
})();
//============================================================
// JOIN: wn/gui/footer/_com.json
//============================================================
Ti.Preload("ti/com/wn/gui/footer/_com.json", {
  "name" : "wn-gui-footer",
  "globally" : true,
  "template" : "./wn-gui-footer.html",
  "mixins"   : ["./wn-gui-footer.mjs"]
});
//============================================================
// JOIN: wn/gui/side/nav/com/side-nav-item/side-nav-item.html
//============================================================
Ti.Preload("ti/com/wn/gui/side/nav/com/side-nav-item/side-nav-item.html", `<div class="side-nav-item" :class="topClass">
  <!--
    Self Info
  -->
  <div class="it-info" >
    <!--Icon-->
    <span v-if="icon" class="it-info-icon">
      <ti-icon :value="icon" size=".16rem"/>
    </span>
    <!--Group-->
    <span v-if="isGroup"
      class="it-info-text"
      @click.stop.prevent="onClickGroupInfo">{{title|i18n}}</span>
    <!--Item-->
    <a v-else
      class="it-info-text"
      :href="href"
      @click.stop.prevent="onClickItemInfo">
      {{title|i18n}}
    </a>
  </div>
  <!--
    Sub Container
  -->
  <div class="it-con" v-if="items && items.length > 0">
      <side-nav-item v-for="subIt in items"
        :key="subIt.key"
        :group-status-store-key="subIt.key"
        :highlight-id="highlightId"
        v-bind="subIt"
        @item:actived="$notify('item:actived', $event)"/>
  </div>
</div>`);
//============================================================
// JOIN: wn/gui/side/nav/com/side-nav-item/side-nav-item.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ///////////////////////////////////////////
  data : ()=>{
    return {
      collapse : true
    }
  },
  ///////////////////////////////////////////
  props : {
    "groupStatusStoreKey" : {type:String, default:null},
    "highlightId" : {type:String, default:null},
    "id" : {type:String, default:null},
    "depth" : {type:Number, default:0},
    "icon"  : {type:[String,Object], default:null},
    "title" : {type:String, default:null},
    "path"  : {type:String, default:null},
    "view"  : {type:String, default:null},
    "href"  : {type:String, default:null},
    "items" : {
      type : Array,
      default : ()=>[]
    }
  },
  ///////////////////////////////////////////
  computed : {
    topClass() {
      return {
        "is-top"   : this.isTop,
        "is-sub"   : !this.isTop,
        "is-group" : this.isGroup,
        "is-item"  : !this.isGroup,
        "is-collapse"  : this.collapse,
        "is-expend"    : !this.collapse,
        "is-highlight" : this.isHighlight
      }
    },
    isTop() {
      return this.depth == 0
    },
    isGroup() {
      return _.isArray(this.items)
    },
    isHighlight() {
      return this.id && this.id == this.highlightId
    }
  },
  ///////////////////////////////////////////
  methods : {
    onClickGroupInfo() {
      if(this.isGroup) {
        this.collapse = !this.collapse
        // Save status
        if(this.groupStatusStoreKey) {
          Ti.Storage.session.set(this.groupStatusStoreKey, this.collapse)
        }
      }
    },
    onClickItemInfo() {
      this.$notify("item:actived", {
        id: this.id,
        title : this.title,
        path : this.path,
        href : this.href,
        view : this.view
      })
    }
  },
  ///////////////////////////////////////////
  mounted : function(){
    if(this.isGroup) {
      // Only Top Group is expended
      if(this.isTop) {
        this.collapse = false
      }
      // Others group will default collapse
      // The 'item' will ignore the setting of collapse
      else {
        this.collapse = true
      }
      // Load local setting
      if(this.groupStatusStoreKey) {
        this.collapse = 
          Ti.Storage.session.getBoolean(this.groupStatusStoreKey, this.collapse)
      }
    }
  }
  ///////////////////////////////////////////
}
Ti.Preload("ti/com/wn/gui/side/nav/com/side-nav-item/side-nav-item.mjs", _M);
})();
//============================================================
// JOIN: wn/gui/side/nav/com/side-nav-item/_com.json
//============================================================
Ti.Preload("ti/com/wn/gui/side/nav/com/side-nav-item/_com.json", {
  "name" : "side-nav-item",
  "template" : "./side-nav-item.html",
  "mixins" : ["./side-nav-item.mjs"]
});
//============================================================
// JOIN: wn/gui/side/nav/wn-gui-side-nav.html
//============================================================
Ti.Preload("ti/com/wn/gui/side/nav/wn-gui-side-nav.html", `<div class="wn-gui-side-nav"
  :class="topClass"
  v-ti-activable>
  <side-nav-item v-for="it in theItems"
    :key="it.key"
    v-bind="it"
    @item:actived="onItemActived"/>
</div>`);
//============================================================
// JOIN: wn/gui/side/nav/wn-gui-side-nav.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "items" : {
      type : Array,
      default : null
    },
    "highlightItemId" : {
      type : String,
      default : null
    },
    "highlightItemPath" : {
      type : String,
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-self-actived" : this.isSelfActived,
        "is-actived" : this.isActived
      }, this.className)
    },
    //-------------------------------------
    theItems() {
      let list = []
      if(_.isArray(this.items)) {
        for(let it of this.items) {
          list.push(this.evalItem(it))
        }
      }
      return list;
    },
    //-------------------------------------
    theHighlightItemId() {
      let list = this.joinHighlightItems([], this.items)
      if(list.length > 0) {
        // Sort the list, 0->N, the first one should be the hightlight one
        list.sort((it0,it1)=>it0.score-it1.score)
        // Get the first one
        return _.first(list).id
      }
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    evalItem(it={}) {
      // Children
      let items = null
      if(_.isArray(it.items)) {
        items = []
        for(let subIt of it.items) {
          items.push(this.evalItem(subIt))
        }
      }
      // Self
      return _.assign(_.pick(it, ["id","key","depth","icon","title","path","view"]), {
        items,
        groupStatusStoreKey : it.key,
        highlightId : this.theHighlightItemId,
        href : it.id ? Wn.Util.getAppLink(it.id)+"" : null
      })
    },
    //-------------------------------------
    joinHighlightItems(list=[], items=[]) {
      if(this.highlightItemId && _.isArray(items) && items.length>0) {
        for(let it of items) {
          // Match the ID, 0
          if(it.id == this.highlightItemId) {
            list.push({score:0, id: it.id})
          }
          // Match the Path, 1 or more
          else if(it.path && it.id
              && this.highlightItemPath 
              && this.highlightItemPath.startsWith(it.path)){
            let diff = this.highlightItemPath.length - it.path.length
            list.push({score:1+diff, id: it.id})
          }
          // Join Children
          if(it.items) {
            this.joinHighlightItems(list, it.items)
          }
        }
      }
      // Return self
      return list
    },
    //-------------------------------------
    onItemActived(payload={}){
      this.$notify("item:active", payload)
    }
    //-------------------------------------
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/wn/gui/side/nav/wn-gui-side-nav.mjs", _M);
})();
//============================================================
// JOIN: wn/gui/side/nav/_com.json
//============================================================
Ti.Preload("ti/com/wn/gui/side/nav/_com.json", {
  "name" : "wn-gui-side-nav",
  "globally" : true,
  "template" : "./wn-gui-side-nav.html",
  "mixins"   : ["./wn-gui-side-nav.mjs"],
  "components" : ["./com/side-nav-item"]
});
//============================================================
// JOIN: wn/gui/side/tree/wn-gui-side-tree.html
//============================================================
Ti.Preload("ti/com/wn/gui/side/tree/wn-gui-side-tree.html", `<ti-tree
  class="ti-fill-parent wn-gui-side-tree"
  id-by="value"
  name-by="name"
  :display="TreeDisplay"
  :data="myTreeData"
  :current-id="highlightItemId"
  :checked-ids="CheckedIds"
  keep-open-by="wn-gui-side-tree"
  :auto-open="true"
  :default-open-depth="2"
  :show-root="false"
  :puppet-mode="true"
  @select="onItemActived"/>`);
//============================================================
// JOIN: wn/gui/side/tree/wn-gui-side-tree.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  data : ()=>({
    myItems : [],
    myTreeData : []
  }),
  /////////////////////////////////////////
  props : {
    "items" : {
      type : Array,
      default : null
    },
    "highlightItemId" : {
      type : String,
      default : null
    },
    "highlightItemPath" : {
      type : String,
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    //-------------------------------------
    TreeDisplay() {
      return ['<icon>', {
          key: "text",
          comConf: {
            className: "is-nowrap",
            href: "(value)?/a/open/wn.manager?ph=id:${value}"
          }
        }]
    },
    //-------------------------------------
    HighlightItemId() {
      let list = this.joinHighlightItems([], this.items)
      if(list.length > 0) {
        // Sort the list, 0->N, the first one should be the hightlight one
        list.sort((it0,it1)=>it0.score-it1.score)
        // Get the first one
        return _.first(list).id
      }
    },
    //-------------------------------------
    CheckedIds() {
      if(!this.HighlightItemId) {
        return []
      }
      return [this.HighlightItemId]
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    evalTreeData(items=[]) {
      this.myItems = _.cloneDeep(items)
      let list = []
      if(_.isArray(items)) {
        for(let it of items) {
          list.push(this.evalItemToTreeNode(it))
        }
      }
      //console.log("theTreeData", list)
      this.myTreeData = list
    },
    //-------------------------------------
    evalItemToTreeNode(it={}) {
      // Children
      let children = null
      if(_.isArray(it.items)) {
        children = []
        for(let subIt of it.items) {
          children.push(this.evalItemToTreeNode(subIt))
        }
      }
      // Self
      return {
        name  : it.key,
        text  : it.title,
        icon  : it.icon,
        value : it.id,
        children
      }
    },
    //-------------------------------------
    joinHighlightItems(list=[], items=[]) {
      if(this.highlightItemId && _.isArray(items) && items.length>0) {
        for(let it of items) {
          // Match the ID, 0
          if(it.id == this.highlightItemId) {
            list.push({score:0, id: it.id})
          }
          // Match the Path, 1 or more
          else if(it.path && it.id
              && this.highlightItemPath 
              && this.highlightItemPath.startsWith(it.path)){
            let diff = this.highlightItemPath.length - it.path.length
            list.push({score:1+diff, id: it.id})
          }
          // Join Children
          if(it.items) {
            this.joinHighlightItems(list, it.items)
          }
        }
      }
      // Return self
      return list
    },
    //-------------------------------------
    onItemActived({current={}}={}){
      if(current.value) {
        this.$notify("item:active", {
          id : current.value
        })
      }
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "items" : {
      handler : function(newVal, oldVal){
        if(!_.isEqual(newVal, this.myItems)) {
          this.evalTreeData(newVal)
        }
      },
      immediate : true
    }
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/wn/gui/side/tree/wn-gui-side-tree.mjs", _M);
})();
//============================================================
// JOIN: wn/gui/side/tree/_com.json
//============================================================
Ti.Preload("ti/com/wn/gui/side/tree/_com.json", {
  "name" : "wn-gui-side-tree",
  "globally" : true,
  "template" : "./wn-gui-side-tree.html",
  "mixins"   : ["./wn-gui-side-tree.mjs"],
  "components" : ["@com:ti/tree"]
});
//============================================================
// JOIN: wn/gui/test.json
//============================================================
Ti.Preload("ti/com/wn/gui/test.json", {
  "layout" : {
    "type" : "cols",
    "border" : true,
    "blocks" : [{
      "name" : "C0",
      "icon"  : "im-award",
      "title" : "Test C0",
      "closer" : true,
      "actions" : [{
          "type" : "group",
          "icon" : "zmdi-more-vert",
          "items" :  [{
              "key" : "show-P1",
              "text" : "show P1",
              "type" : "action",
              "action" : "main:showBlock(P1)"
            }, {
              "key" : "hide-P1",
              "text" : "hide P1",
              "type" : "action",
              "action" : "main:hideBlock(P1)"
            }]
        }],
      "size" : "20%",
      "type" : "rows",
      "border" : true,
      "blocks" : [{
        "name" : "C0-1",
        "size" : 100,
        "body" : {
          "comType" : "ti-label",
          "comConf" : {"value" : "C0-1 content"}
        }
      }, {
        "name" : "C0-2",
        "body" : {
          "comType" : "ti-label",
          "comConf" : {"value" : "C0-2 content"}
        }
      }, {
        "name" : "C0-3",
        "body" : {
          "comType" : "ti-label",
          "comConf" : {"value" : "C0-3 content"}
        }
      }]
    }, {
      "name" : "C1",
      "icon"  : "im-award",
      "title" : "Test C1",
      "actions" : [{
          "type" : "group",
          "icon" : "zmdi-more-vert",
          "items" :  [{
              "key" : "show-P1",
              "text" : "show P1",
              "type" : "action",
              "action" : "main:showBlock(P1)"
            }, {
              "key" : "hide-P1",
              "text" : "hide P1",
              "type" : "action",
              "action" : "main:hideBlock(P1)"
            }]
        }],
      "size" : "stretch",
      "type" : "tabs",
      "blocks" : [{
        "name" : "C1-1",
        "size" : 100,
        "body" : {
          "comType" : "ti-label",
          "comConf" : {"value" : "C1-1 content"}
        }
      }, {
        "name" : "C1-2",
        "body" : {
          "comType" : "ti-label",
          "comConf" : {"value" : "C1-2 content"}
        }
      }, {
        "name" : "C1-3",
        "body" : {
          "comType" : "ti-label",
          "comConf" : {"value" : "C1-3 content"}
        }
      }]
    }, {
      "name" : "C2",
      "body" : "C2",
      "size" : 260
    }],
    "panels" : [{
      "name" : "P1",
      "closer" : "right",
      "position":"left-top",
      "width" : "50%",
      "height" : "50%",
      "mask" : true,
      "body" : {
        "comType" : "ti-label",
        "comConf" : {"value" : "P1"}
      }
    }]
  },
  "schema" : {
    "C1" : {
      "comType" : "ti-label",
      "comConf" : {
        "value" : "I am C11"
      }
    },
    "C2" : {
      "comType" : "ti-label",
      "comConf" : {
        "value" : "I am C22"
      }
    }
  },
  "actions" : [{
      "key"  : "reloading",
      "type" : "action",
      "icon" : "zmdi-refresh",
      "text" : "i18n:refresh",
      "altDisplay" : {
        "icon" : "zmdi-refresh zmdi-hc-spin",
        "text" : "i18n:loading"
      },
      "action" : "dispatch:main/reload",
      "shortcut" : "CTRL+R"
    }, {
      "key" : "show-P1",
      "text" : "show P1",
      "type" : "action",
      "action" : "main:showBlock(P1)"
    }, {
      "key" : "hide-P1",
      "text" : "hide P1",
      "type" : "action",
      "action" : "main:hideBlock(P1)"
    }] 
});
//============================================================
// JOIN: wn/gui/wn-gui.html
//============================================================
Ti.Preload("ti/com/wn/gui/wn-gui.html", `<ti-gui
  v-bind="layout"
  :schema="schema"
  :shown="shown"
  @block:show="showBlock"
  @block:hide="hideBlock"/>`);
//============================================================
// JOIN: wn/gui/wn-gui.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  /////////////////////////////////////////
  data : function(){
    return {
      "shown" : {}
    }
  },
  /////////////////////////////////////////
  props : {
    "data" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    layout() {
      if(this.data)
        return this.data.layout
      return {}
    },
    schema() {
      if(this.data)
        return this.data.schema
      return {}
    }
  },
  //////////////////////////////////////////
  watch : {
    // Notify wn-manager update the action menu
    "data.actions" : function(){
      //this.$notify("actions:updated", this.data.actions)
    }
  },
  //////////////////////////////////////////
  methods : {
    // @see ti-gui-methods.mjs#showGuiBlock
    showBlock(name) {
      this.shown = this.createGuiBlockShown(this.shown, name, true)
    },
    // @see ti-gui-methods.mjs#hideGuiBlock
    hideBlock(name) {
      this.shown = this.createGuiBlockShown(this.shown, name, false)
    }
  }
}
Ti.Preload("ti/com/wn/gui/wn-gui.mjs", _M);
})();
//============================================================
// JOIN: wn/gui/_com.json
//============================================================
Ti.Preload("ti/com/wn/gui/_com.json", {
  "name" : "wn-gui",
  "globally" : true,
  "template" : "./wn-gui.html",
  "methods"  : "@com:ti/gui/ti-gui-methods.mjs",
  "mixins"   : ["./wn-gui.mjs"],
  "components" : ["@com:ti/gui"]
});
//============================================================
// JOIN: wn/imgfile/wn-imgfile.html
//============================================================
Ti.Preload("ti/com/wn/imgfile/wn-imgfile.html", `<ti-imgfile
  :src="imageSrc"
  :width="width"
  :height="height"
  :progress="progress"
  :upload-file="uploadFile"
  :removable="removable"
  @upload="onUpload"
  @remove="onRemove"
  @open="onOpen"/>`);
//============================================================
// JOIN: wn/imgfile/wn-imgfile.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  data : ()=>({
    "src_ts" : null,
    "oImage"     : null,
    "uploadFile" : null,
    "progress"   : -1
  }),
  /////////////////////////////////////////
  props : {
    "value" : {
      type : String,
      default : null
    },
    // Display width
    "width" : {
      type : [String, Number],
      default : undefined
    },
    // Display height
    "height" : {
      type : [String, Number],
      default : undefined
    },
    // support remove the objects
    "removable" : {
      type : Boolean,
      default : true
    },
    // Indicate the upload target when upload new value
    // Of cause, if the `value` exists, replace it
    // The `target` must be a path to a image object,
    // it will auto transfrom the image format by `cmd_imagic`
    "target" : {
      type : String,
      required: true,
      default : null
    },
    // which type supported to upload
    // nulll or empty array will support any types
    "supportTypes" : {
      type : [String, Array],
      default : ()=>["png","jpg","jpeg","gif"]
    },
    // which mime supported to upload
    // nulll or empty array will support any mimes
    "supportMimes" : {
      type : [String, Array],
      default : ()=>["image/png","image/jpeg","image/gif"]
    },
    // Image object only: it will auto apply image filter
    // just like clip the image size etc..
    // @see cmd_imagic for more detail about the filter
    "filter" : {
      type : [Array, String],
      default : null
    },
    // Image object only: if `>0 and <=1` mean output quality
    // if not match the range, will depends on the `cmd_imagic` default
    "quality" : {
      type : Number,
      default : 0
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    acceptTypes() {
      if(_.isString(this.supportTypes))
        return this.supportTypes.split(",")
      return this.supportTypes
    },
    //--------------------------------------
    acceptMimes() {
      if(_.isString(this.supportMimes))
        return this.supportMimes.split(",")
      return this.supportMimes
    },
    //--------------------------------------
    imageFilter() {
      if(!this.filter)
        return []
      return [].concat(this.filter)
    },
    //--------------------------------------
    // Display image for <ti-thumb>
    imageSrc() {
      if(this.oImage) {
        let ss = ["/o/content?str=id:", this.oImage.id]
        if(this.src_ts) {
          ss.push("&_t=")
          ss.push(this.src_ts)
        }
        return ss.join("")
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    async assertListHas(list, str, invalidMsg, vars) {
      if(!_.isEmpty(list)) {
        let invalid  = true
        for(let li of list) {
          if(li == str) {
            invalid = false
            break
          }
        }
        if(invalid) {
          await Ti.Alert(invalidMsg, {type:"warn", icon:"zmdi-alert-triangle"})
          return false
        }
      }
      return true
    },
    //--------------------------------------
    async onOpen() {
      // remove the thumb file
      if(this.oImage) {
        let link = Wn.Util.getAppLink(this.oImage)
        //console.log("it will open ", link)
        await Ti.Be.Open(link.url, {params:link.params})
      }
    },
    //--------------------------------------
    async onRemove() {
      // remove the thumb file
      if(this.oImage) {
        await Wn.Sys.exec2(`rm id:${this.oImage.id}`)
      }
      // Notify the change
      this.$notify("change", null)
    },
    //--------------------------------------
    async onUpload(file) {
      //console.log("it will upload ", file)

      //................................
      // Check for support Types
      let type = Ti.Util.getSuffixName(file.name)
      if(!await this.assertListHas(
        this.acceptTypes, type, {
          text : 'i18n:wn-invalid-types',
          vars : {current:type, supports:this.acceptTypes.join(", ")}
        })) {
        return
      }
      if(!await this.assertListHas(
        this.acceptMimes, file.type, {
          text : 'i18n:wn-invalid-mimes',
          vars : {current:file.type, supports:this.acceptMimes.join(", ")}
        })) {
        return
      }

      //................................
      // Upload file to destination
      this.uploadFile = file
      this.progress = 0

      let {ok, msg, data} = await Wn.Io.uploadFile(file, {
        target : this.target,
        mode   : "r",
        progress : (pe)=> {
          this.progress = pe.loaded / pe.total
        }
      })

      //................................
      // Reset upload
      this.uploadFile = null
      this.progress = -1

      //................................
      // Fail to upload
      if(!ok) {
        await Ti.Alert(`i18n:${msg}`, {type:"warn", icon:"zmdi-alert-triangle"})
        return
      }

      //................................
      // do Filter
      if(!_.isEmpty(this.imageFilter)) {
        let cmd = [
          "imagic", `id:${data.id}`, 
          `-filter "${this.imageFilter.join(" ")}"`]       
        if(this.quality>0 && this.quality<=1) {
          cmd.push(`-qa ${this.quality}`)
        }
        cmd.push("-out inplace")
        let cmdText = cmd.join(" ")
        await Wn.Sys.exec2(cmdText)
      }

      //................................
      // done
      this.src_ts = Date.now()
      this.oImage = data
      this.$notify("change", data)
    },
    //--------------------------------------
    async reload() {
      if(this.value) {
        this.oImage = await Wn.Io.loadMeta(this.value)
      }
      // Reset
      else {
        this.oImage = null
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "value" : function() {
      this.reload()
    }
  },
  //////////////////////////////////////////
  mounted : async function(){
    await this.reload()
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/wn/imgfile/wn-imgfile.mjs", _M);
})();
//============================================================
// JOIN: wn/imgfile/_com.json
//============================================================
Ti.Preload("ti/com/wn/imgfile/_com.json", {
  "name" : "wn-imgfile",
  "globally" : true,
  "template" : "./wn-imgfile.html",
  "mixins" : ["./wn-imgfile.mjs"],
  "components" : [
    "@com:ti/imgfile"
  ]
});
//============================================================
// JOIN: wn/label/wn-label.html
//============================================================
Ti.Preload("ti/com/wn/label/wn-label.html", `<ti-label
  :class-name="className"
  :blank-as="blankAs"
  :value="theValue"
  :format="format"
  :prefix-icon="prefixIcon"
  :prefix-text="prefixText"
  :suffix-text="suffixText"
  :suffix-icon="suffixIcon"
  :href="href"
  :new-tab="newTab"/>`);
//============================================================
// JOIN: wn/label/wn-label.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  //////////////////////////////////////////
  data: ()=>({
    "theValue" : null
  }),
  //////////////////////////////////////////
  props : {
    "blankAs" : {
      type : String,
      default : "i18n:nil"
    },
    "value" : null,
    "format" : undefined,
    "prefixIcon" : {
      type : String,
      default : null
    },
    "prefixText" : {
      type : String,
      default : null
    },
    "suffixText" : {
      type : String,
      default : null
    },
    "suffixIcon" : {
      type : String,
      default : null
    },
    "dict" : {
      type : String,
      default : null
    },
    "href" : {
      type : String,
      default : null
    },
    "newTab" : {
      type : Boolean,
      default : false
    }
  },
  //////////////////////////////////////////
  watch : {
    "value" : async function() {
      await this.evalTheValue()
    }
  },
  //////////////////////////////////////////
  methods : {
    async evalTheValue() {
      // Blank value
      if(!Ti.Util.isNil(this.value) && this.dict) {
        this.theValue = await Wn.Dict.get(this.dict, this.value)
      }
      // Keep primary
      else {
        this.theValue = this.value
      }
    }
  },
  //////////////////////////////////////////
  mounted : async function() {
    await this.evalTheValue()
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/wn/label/wn-label.mjs", _M);
})();
//============================================================
// JOIN: wn/label/_com.json
//============================================================
Ti.Preload("ti/com/wn/label/_com.json", {
  "name" : "wn-label",
  "globally" : true,
  "template" : "./wn-label.html",
  "mixins" : ["./wn-label.mjs"],
  "components" : ["@com:ti/label"]
});
//============================================================
// JOIN: wn/list/wn-list.html
//============================================================
Ti.Preload("ti/com/wn/list/wn-list.html", `<ti-list
  v-bind="this"
  :display="DisplayItems"
  :on-init="OnSubListInit"
  @select="OnSelected"
  @open="$notify('open', $event)"/>`);
//============================================================
// JOIN: wn/list/wn-list.mjs
//============================================================
(function(){
/////////////////////////////////////////////////////
const _M = {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    isAllChecked  : false,
    hasChecked    : false,
    theCurrentId  : false,
    theCheckedIds : false
  }),
  ///////////////////////////////////////////////////
  props : {
    "iconBy" : {
      type : [String, Function],
      default : undefined
    },
    "indentBy" : {
      type : [String, Function],
      default : undefined
    },
    "itemClassName" : undefined,
    "display" : {
      type : [Object, String, Array],
      default : ()=>({
        key : "..",
        comType : "ti-label"
      })
    },
    "border" : {
      type : Boolean,
      default : true
    },
    "autoScrollIntoView" : {
      type : Boolean,
      default : true
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //----------------------------------------------
    DisplayItems() {
      return this.explainDisplayItems(this.display)
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    OnSubListInit($list) {this.$list = $list},
    //----------------------------------------------
    OnSelected(payload={}){
      this.theCheckedIds = payload.checkedIds
      this.theCurrentId  = payload.currentId
      this.syncCheckStatus()
      this.$notify("select", payload)
    },
    //----------------------------------------------
    syncCheckStatus() {
      this.isAllChecked = this.$list.isAllChecked
      this.hasChecked   = this.$list.hasChecked
    },
    //----------------------------------------------
    // Delegate methods
    selectPrevRow(options){this.$list.selectPrevRow(options)},
    selectNextRow(options){this.$list.selectNextRow(options)},

    getCurrentRow(options){return this.$list.getCurrentRow(options)},
    getCheckedRow(options){return this.$list.getCheckedRow(options)},

    getCurrent(options){return this.$list.getCurrent(options)},
    getChecked(options){return this.$list.getChecked(options)},

    selectRow(options){this.$list.selectRow(options)},
    checkRow (options){this.$list.checkRow(options)},
    cancelRow(options){this.$list.cancelRow(options)}
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "data" : function(){
      this.syncCheckStatus()
    },
    "checkedIds" : function(){
      this.syncCheckStatus()
    }
  }
  ///////////////////////////////////////////////////
}
Ti.Preload("ti/com/wn/list/wn-list.mjs", _M);
})();
//============================================================
// JOIN: wn/list/_com.json
//============================================================
Ti.Preload("ti/com/wn/list/_com.json", {
  "name" : "wn-list",
  "globally" : true,
  "template" : "./wn-list.html",
  "props" : [
    "@com:ti/support/list_props.mjs"],
  "mixins" : [
    "@com:wn/support/wn_list_wrapper_mixins.mjs",
    "./wn-list.mjs"],
  "components" : [
    "@com:ti/table"]
});
//============================================================
// JOIN: wn/obj/form/wn-obj-form.html
//============================================================
Ti.Preload("ti/com/wn/obj/form/wn-obj-form.html", `<ti-form 
  v-bind="this"
  :auto-show-blank="isAutoShowBlank"
  :class-name="className"
  @field:change="OnFieldChange"
  @change="OnChange"
  @invalid="OnInvalid"/>`);
//============================================================
// JOIN: wn/obj/form/wn-obj-form.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////////////////
  props : {
    "fuse" : {
      type : Object,
      default : ()=>({
        key  : "wn-obj-form",
        noti : null
      })
    },
    // {method : "dispatch", target : "main/onChanged"}
    "setDataBy" : {
      type : [String, Object],
      default : null
    },
    // {method : "dispatch", target : "main/changeMeta"}
    "updateBy" : {
      type : [String, Object],
      default : null
    },
    // {method : "commit", target : "main/setFieldStatus"}
    "setFieldStatusBy" : {
      type : [String, Object],
      default : null
    }
  },
  //////////////////////////////////////////////////////
  computed : {
    isAutoShowBlank() {return Ti.Util.fallback(this.autoShowBlank, true)},
  },
  //////////////////////////////////////////////////////
  methods : {
    //--------------------------------------------------
    doAction(emitName, action, payload) {
      // {method, target}
      if(_.isPlainObject(action)) {
        Ti.App(this)[action.method](action.target, payload)
      }
      // "method:target"
      else if(_.isString(action)) {
        Ti.App(this).exec(action, payload)
      }
      // Just notify $parent
      else if(action){
        this.$notify(emitName, payload)
      }
    },
    //--------------------------------------------------
    OnFieldChange({name, value}={}) {
      //console.log("wn-obj-form.field:changed", {name, value})
      this.doAction("field:change", this.updateBy, {name, value})
    },
    //--------------------------------------------------
    OnChange(data) {
      //console.log("wn-obj-form.changed", data)
      this.doAction("change", this.setDataBy, data)
    },
    //--------------------------------------------------
    OnInvalid(err) {
      //console.log("wn-form.invalid", err)
      let payload = {
        name    : err.name,
        message : [err.errMessage, err.value].join(" :: "),
        status  : "warn"
      }
      this.doAction("invalid", this.setFieldStatusBy, payload)
    }
    //--------------------------------------------------
  }
  //////////////////////////////////////////////////////
}
Ti.Preload("ti/com/wn/obj/form/wn-obj-form.mjs", _M);
})();
//============================================================
// JOIN: wn/obj/form/_com.json
//============================================================
Ti.Preload("ti/com/wn/obj/form/_com.json", {
  "name" : "wn-obj-form",
  "globally" : true,
  "template" : "./wn-obj-form.html",
  "props" : "@com:ti/form/ti-form-props.mjs",
  "mixins" : ["./wn-obj-form.mjs"],
  "components" : [
    "@com:ti/form",
    "@com:wn/transfer",
    "@com:wn/droplist",
    "@com:wn/combo/input",
    "@com:wn/imgfile",
    "@com:wn/combo/multi-input"
  ]
});
//============================================================
// JOIN: wn/obj/icon/wn-obj-icon.html
//============================================================
Ti.Preload("ti/com/wn/obj/icon/wn-obj-icon.html", `<ti-icon 
  class="wn-obj-icon" 
  :class="topClass"
  :value="theIcon"/>`);
//============================================================
// JOIN: wn/obj/icon/wn-obj-icon.mjs
//============================================================
(function(){
/////////////////////////////////////////////////////
const _M = {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  props : {
    // icon string
    "icon" : {
      type : String,
      default : null
    },
    // image thumb: id:xxxx
    "thumb" : {
      type : String,
      default : null
    },
    "mime" : {
      type : String,
      default : null
    },
    "type" : {
      type : String,
      default : null
    },
    "race" : {
      type : String,
      default : null
    },
    // default icon string
    "candidateIcon" : {
      type : String,
      default : null
    },
    // timestamp
    "timestamp" : {
      type : Number,
      default : 0
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
    //-----------------------------------------------
    theIcon() {
      return Wn.Util.getObjThumbIcon({
        candidateIcon : this.candidateIcon,
        timestamp : this.timestamp,
        thumb : this.thumb,
        icon  : this.icon,
        mime  : this.mime,
        type  : this.type,
        race  : this.race,
      }, "fas-cube")
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    //-----------------------------------------------
  }
  ///////////////////////////////////////////////////
}
Ti.Preload("ti/com/wn/obj/icon/wn-obj-icon.mjs", _M);
})();
//============================================================
// JOIN: wn/obj/icon/_com.json
//============================================================
Ti.Preload("ti/com/wn/obj/icon/_com.json", {
  "name" : "wn-obj-icon",
  "globally" : true,
  "template" : "./wn-obj-icon.html",
  "mixins" : ["./wn-obj-icon.mjs"]
});
//============================================================
// JOIN: wn/obj/json/wn-obj-json.html
//============================================================
Ti.Preload("ti/com/wn/obj/json/wn-obj-json.html", `<div class="wn-obj-json">
  <!--
    Show Text Editor
  -->
  <ti-text-json v-if="hasMeta"
    class="ti-fill-parent"
    :value="value"
    :data="data"
    @change="onChangeContent"/>
  <!--
    Empty Data
  -->
  <ti-loading v-else/>
</div>`);
//============================================================
// JOIN: wn/obj/json/wn-obj-json.mjs
//============================================================
(function(){
const _M = {
  ////////////////////////////////////////////
  props : {
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "value" : {
      type: String,
      default: null
    },
    "status" : {
      type : Object,
      default : ()=>({})
    }
  },
  ////////////////////////////////////////////
  computed : {
    //----------------------------------------
    hasMeta() {
      return this.meta ? true : false
    }
    //----------------------------------------
  },
  ////////////////////////////////////////////
  methods : {
    onChangeContent(newData) {
      this.$notify("change", newData)
    }
  },
  ////////////////////////////////////////////
  mounted : function(){
    //----------------------------------------
    Ti.Fuse.getOrCreate().add({
      key : "wn-obj-json",
      everythingOk : ()=>{
        return !this.status.changed
      },
      fail : ()=>{
        Ti.Toast.Open("i18n:wn-obj-nosaved", "warn")
      }
    })
    //----------------------------------------
  },
  ////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Fuse.get().remove("wn-obj-json")
  }
  ////////////////////////////////////////////
}
Ti.Preload("ti/com/wn/obj/json/wn-obj-json.mjs", _M);
})();
//============================================================
// JOIN: wn/obj/json/_com.json
//============================================================
Ti.Preload("ti/com/wn/obj/json/_com.json", {
  "name" : "wn-obj-json",
  "globally" : true,
  "template" : "./wn-obj-json.html",
  "mixins" : ["./wn-obj-json.mjs"],
  "components" : ["@com:ti/text/json"]
});
//============================================================
// JOIN: wn/obj/picker/wn-obj-picker.html
//============================================================
Ti.Preload("ti/com/wn/obj/picker/wn-obj-picker.html", `<div class="wn-obj-picker">
  <ti-box ref="box"
    :empty="empty"
    :items="formedItems"
    :loading="loading"
    :multi="multi"
    :icon="theChooseIcon"
    :clear-icon="clearIcon"
    @open="openPicker"
    @remove="onRemoveItem"
    @clear="onClearItems"/>
</div>`);
//============================================================
// JOIN: wn/obj/picker/wn-obj-picker.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  data : ()=>({
    "loading" : false,
    "items" : []
  }),
  /////////////////////////////////////////
  props : {
    "empty" :{
      type : Object,
      default : ()=>({
        text  : "i18n:no-selected",
        value : undefined
      })
    },
    "value" : {
      type : [Object, String, Array],
      default : null
    },
    "base" : {
      type : [Object, String],
      default : "~"
    },
    "multi" : {
      type : Boolean,
      default : false
    },
    "clearIcon" : {
      type : [String, Object],
      default : "zmdi-close-circle"
    },
    "chooseIcon" : {
      type : String,
      default : "zmdi-folder-outline"
    },
    // Key of meta to show as text
    // If undefined, use "title -> nm"
    "textBy" : {
      type : [String, Array],
      default : null
    }
  },
  //////////////////////////////////////////
  watch : {
    "value" : function(){
      this.reload()
    }
  },
  //////////////////////////////////////////
  computed : {
    formedItems() {
      let list = []
      for(let obj of this.items) {
        let it = {
          icon : Wn.Util.genPreviewObj(obj),
          text : Wn.Util.getObjDisplayName(obj, this.textBy),
          value : obj.id
        }
        list.push(it)
      }
      return list
    },
    oneItem() {
      let it = _.isArray(this.value) 
        ? _.get(this.value, 0)
        : this.value
      if("id:" == it || !it || _.isEmpty(it))
        return null
      return it
    },
    theChooseIcon() {
      return _.isEmpty(this.items) ? this.chooseIcon : null
    }
  },
  //////////////////////////////////////////
  methods : {
    async openPicker() {
      let meta = this.oneItem
      let autoOpenDir = false
      // Use base to open the folder
      // Then it should be auto-open the folder
      if(!meta || _.isEmpty(meta)) {
        meta = this.base || "~"
        autoOpenDir = true
      }

      let payload = await Wn.OpenObjSelector(meta, {
        multi    : this.multi,
        selected : this.items,
        autoOpenDir
      })
      // take `undefined` as cancel
      if(_.isUndefined(payload)) {
        //console.log("canceled!")        
      }
      // take `null` as empty
      // object or array will be the value
      else {
        //console.log(payload)
        this.$notify("change", payload)
      }
    },
    //......................................
    onRemoveItem(rmIt) {
      let payload = []
      for(let i=0; i<this.items.length; i++) {
        let it = this.items[i]
        let iv = this.formedItems[i]
        if(!_.isEqual(iv.value, rmIt.value)){
          payload.push(it)
        }
      }
      this.$notify("change", payload)
    },
    //......................................
    onClearItems() {
      console.log("remove!!")
      this.$notify("change", this.multi ? [] : null)
    },
    //......................................
    async reload(){
      this.loading = true
      await this.doReload()
      this.loading = false
    },
    //......................................
    async doReload() {
      let vals = this.value ? [].concat(this.value) : []
      let items = []
      // Loop each value item
      for(let it of vals) {
        let it2 = await this.reloadItem(it)
        if(it2)
          items.push(it2)
        if(!this.multi && items.length > 0)
          break
      }
      // Update value, it will be trigger the computed attribute
      // Then it will be passed to <ti-box> as formed list
      // the <ti-box> will show it reasonablely obey the `multi` options
      this.items = items
    },
    //......................................
    async reloadItem(it) {
      if(!it || _.isEmpty(it))
        return null
      // path id:xxxx
      if(_.isString(it)){
        return await Wn.Io.loadMeta(it)
      }
      // object {id:xxx}
      else if(it.id){
        return await Wn.Io.loadMetaById(it.id)
      }
      // Unsupported form of value
      else {
         throw Ti.Err.make("e-wn-obj-picker-unsupported-value-form", it)
      }
    }
    //......................................
  },
  /////////////////////////////////////////
  mounted : async function(){
    await this.reload()
  }
}
Ti.Preload("ti/com/wn/obj/picker/wn-obj-picker.mjs", _M);
})();
//============================================================
// JOIN: wn/obj/picker/_com.json
//============================================================
Ti.Preload("ti/com/wn/obj/picker/_com.json", {
  "name" : "wn-obj-picker",
  "globally" : true,
  "template" : "./wn-obj-picker.html",
  "mixins"   : ["./wn-obj-picker.mjs"],
  "components" : [
    "@com:wn/adaptlist"]
});
//============================================================
// JOIN: wn/obj/preview/com/preview-info-field/preview-info-field.html
//============================================================
Ti.Preload("ti/com/wn/obj/preview/com/preview-info-field/preview-info-field.html", `<div class="info-field">
  <div class="as-name" :style="theNameStyle">
    <ti-icon v-if="icon" class="it-icon" :value="icon"/>
    <span class="it-text">{{title|i18n}}</span>
  </div>
  <div class="as-value" :style="theValueStyle">{{theValue}}</div>
</div>`);
//============================================================
// JOIN: wn/obj/preview/com/preview-info-field/preview-info-field.mjs
//============================================================
(function(){
/////////////////////////////////////////////////////
const _M = {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data: ()=>({
    theValue : null
  }),
  ///////////////////////////////////////////////////
  props : {
    "icon" : {
      type : String,
      default : null
    },
    "data" : {
      type : Object,
      default : ()=>({})
    },
    "type" : {
      type : String,
      default : "String"
    },
    "title" : {
      type : String,
      default : null
    },
    "name" : {
      type : String,
      default : null
    },
    "dict" : {
      type : String,
      default : null
    },
    "nameWidth" : {
      type : [String, Number],
      default : 50
    },
    "valueWidth" : {
      type : [String, Number],
      default : 200
    },
    "transformer" : {
      type : [String,Object,Function],
      default : null
    }
  },
  ///////////////////////////////////////////////////
  watch : {
    "data" : async function() {
      this.theValue = await this.evalTheValue()
    },
    "name" : async function() {
      this.theValue = await this.evalTheValue()
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    theTransformer() {
      return Ti.Types.getFuncBy(this, "transformer")
    },
    theNameStyle() {
      return Ti.Css.toStyle({
        "width" : this.nameWidth
      })
    },
    theValueStyle() {
      return Ti.Css.toStyle({
        "width" : this.valueWidth
      })
    }
  },
  ///////////////////////////////////////////////////
  methods : {
    async evalTheValue() {
      let val = _.get(this.data, this.name)

      if(this.dict) {
        val = await wn.Dict.get(this.dict, val)
      }

      if(_.isFunction(this.theTransformer)) {
        val = this.theTransformer(val)
      }

      return val
    }
  },
  ///////////////////////////////////////////////////
  mounted : async function(){
    this.theValue = await this.evalTheValue()
  }
  ///////////////////////////////////////////////////
}
Ti.Preload("ti/com/wn/obj/preview/com/preview-info-field/preview-info-field.mjs", _M);
})();
//============================================================
// JOIN: wn/obj/preview/com/preview-info-field/_com.json
//============================================================
Ti.Preload("ti/com/wn/obj/preview/com/preview-info-field/_com.json", {
  "name" : "wn-obj-preview-info-field",
  "globally" : true,
  "template" : "./preview-info-field.html",
  "mixins" : ["./preview-info-field.mjs"]
});
//============================================================
// JOIN: wn/obj/preview/wn-obj-preview.html
//============================================================
Ti.Preload("ti/com/wn/obj/preview/wn-obj-preview.html", `<div class="wn-obj-preview" :class="TopClass">
  <!--
    With content
  -->
  <div class="wop-con" v-if="hasMeta">
    <!--Main View-->
    <component class="as-main"
      :is="PreviewComType"
      :icon="DataIcon"
      :title="DataTitle"
      :src="DataSource"/>
    <!--ActionBar at top-->
    <div class="as-abar">
      <ul>
        <li v-for="it in TheActions"
          @click.left="OnAction(it.action)">
          <ti-icon class="it-icon" :value="it.icon"/>
        </li>
      </ul>
    </div>
    <!--Meta at bottom-->
    <div class="as-info" v-if="isShowInfo">
      <!--
        Head
      -->
      <div class="info-head">
        <!--Pin Status Icon-->
        <span class="it-icon" @click.left="toggleInfoFloat">
          <ti-icon :value="PreviewInfoPinIcon"/>
        </span>
        <!--Head text-->
        <span class="it-text">{{'i18n:info'|i18n}}</span>
        <!--Edit Button-->
        <span class="it-edit"
          @click.left="OnEditInfo">{{'i18n:edit'|i18n}}</span>
      </div>
      <!--
        Fields
      -->
      <div class="info-field-con">
        <wn-obj-preview-info-field
          v-for="fld in PrevewInfoFields"
          :key="fld.name"
          v-bind="fld"
          :data="meta"/>
      </div>
    </div>
  </div>
  <!--
    Empty 
  -->
  <div v-else
    class="ti-blank is-big">
    <ti-icon value="fas-file-image"/>
    <span>{{'nil-obj'|i18n}}</span>
  </div>
</div>`);
//============================================================
// JOIN: wn/obj/preview/wn-obj-preview.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////
  data : ()=>({
    isInFullScreen : false,
    isShowInfo     : false,
    isFloatInfo    : false
  }),
  //////////////////////////////////////////
  props : {
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
    "actions" : {
      type : Array,
      default : ()=>["fullscreen", "newtab", "download", "info"]
    },
    "showInfo" : {
      type : Boolean,
      default : false
    },
    "floatInfo" : {
      type : Boolean,
      default : false
    },
    "editInfoBy" : {
      type : [Function, String],
      default : null
    },
    "infoPosition" : {
      type : String,
      default : "bottom",
      validator: (val)=>/^(bottom|left)$/.test(val)
    },
    "infoNameWidth" : {
      type : [String, Number],
      default : 50
    },
    "infoValueWidth" : {
      type : [String, Number],
      default : 200
    },
    "infoFields" : {
      type : Array,
      default : ()=>["nm", "tp", "mime", "width", "height", "len", "duration"]
    },
    // Store the status in Local
    "stateLocalKey" : {
      type : String,
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    hasMeta() {
      return _.isEmpty(this.meta) ? false : true
    },
    //--------------------------------------
    TopClass() {
      return {
        "is-fullscreen" : this.isInFullScreen,
        "is-show-info"  : this.isShowInfo,
        "is-float-info" : this.isFloatInfo,
        [`is-info-at-${this.infoPosition}`] : true        
      }
    },
    //--------------------------------------
    PreviewComType() {
      if(this.meta) {
        let mime = this.meta.mime || ""
        // Video
        if(mime.startsWith("video/")){
          return "ti-media-video"
        }
        // Image
        else if(mime.startsWith("image/")){
          return "ti-media-image"
        }
        // Binary
        else {
          return "ti-media-binary"
        }
      }
    },
    //--------------------------------------
    PreviewInfoPinIcon() {
      return this.isFloatInfo 
        ? 'fas-thumbtack'
        : 'zmdi-layers'
    },
    //--------------------------------------
    PrevewInfoFields() {
      return Wn.Obj.evalFields(this.meta, this.infoFields, (fld)=>{
        if(fld.quickName  && _.isUndefined(fld.value)) {
          return
        }
        if("Group" == fld.type) {
          return fld
        }
        return _.defaults(fld, {
          nameWidth  : this.infoNameWidth,
          valueWidth : this.infoValueWidth
        })
      })
    },
    //--------------------------------------
    TheActions() {
      let list = []
      if(this.hasMeta) {
        _.forEach(this.actions, (it)=>{
          //..........................
          // full screen
          if("fullscreen" == it) {
            if(!this.isInFullScreen) {
              list.push({
                icon : "zmdi-fullscreen",
                text : "i18n:wop-fullscreen-enter",
                action : ()=>this.enterFullscreen()
              })
            }
            // Exit FullScreen
            else {
              list.push({
                icon : "zmdi-fullscreen-exit",
                text : "i18n:wop-fullscreen-quit",
                action : ()=>this.exitFullscreen()
              })
            }
          }
          //..........................
          // Open
          else if("newtab" == it) {
            list.push({
              icon : "zmdi-open-in-new",
              text : "i18n:open-newtab",
              action : ()=>this.openInNewTab()
            })
          }
          //..........................
          // Download
          else if("download" == it) {
            list.push({
              icon : "zmdi-download",
              text : "i18n:download-to-local",
              action : ()=>this.download()
            })
          }
          //..........................
          // Toggle Info
          else if("info" == it) {
            if(!this.isShowInfo) {
              list.push({
                icon : "zmdi-info",
                text : "i18n:info",
                action : ()=>this.doShowInfo()
              })
            }
            // Show Info
            else {
              list.push({
                icon : "zmdi-info-outline",
                text : "i18n:info",
                action : ()=>this.doHideInfo()
              })
            }
          }
          //..........................
          else if(_.isPlainObject(it) && it.action) {
            list.push(it)
          }
          //..........................
        })
      }
      //................................
      return list
    },
    //--------------------------------------
    DataSource() {
      if(!this.meta)
        return ""
      let link = Wn.Util.getDownloadLink(this.meta, {mode:"auto"})
      return link.toString();
    },
    //--------------------------------------
    DataIcon() {
      return Wn.Util.getIconObj(this.meta)
    },
    //--------------------------------------
    DataTitle() {
      return Wn.Util.getObjDisplayName(this.meta)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnAction(action) {
      // Exec command
      if(_.isString(action)) {
        Ti.App(this).exec(actionName)
      }
      // Call function
      else if(_.isFunction(action)) {
        action()
      }
    },
    //--------------------------------------
    OnEditInfo() {
      if(this.meta) {
        // Command
        if(_.isString(this.editInfoBy)) {
          Ti.App(this).exec(this.editInfoBy, this.meta)
        }
        // Function Invoking
        else if(_.isFunction(this.editInfoBy)) {
          this.editInfoBy(this.meta)
        }
        // Default to open the dialog
        else {
          Wn.EditObjMeta(this.meta)
        }
      }
    },
    //--------------------------------------
    enterFullscreen() {
      this.isInFullScreen = true
      this.resizeMediaViewport()
    },
    //--------------------------------------
    exitFullscreen() {
      this.isInFullScreen = false
      this.resizeMediaViewport()
    },
    //--------------------------------------
    doShowInfo() {
      this.isShowInfo = true
      this.saveStateToLocal()
      this.resizeMediaViewport()
    },
    //--------------------------------------
    doHideInfo() {
      this.isShowInfo = false
      this.saveStateToLocal()
      this.resizeMediaViewport()
    },
    //--------------------------------------
    toggleInfoFloat() {
      this.isFloatInfo = !this.isFloatInfo
      this.saveStateToLocal()
      this.resizeMediaViewport()
    },
    //--------------------------------------
    resizeMediaViewport() {
      for(let $child of this.$children) {
        if(_.isFunction($child.onResizeViewport)) {
          this.$nextTick(()=>{
            $child.onResizeViewport()
          })
        }
      }
    },
    //--------------------------------------
    openInNewTab() {
      let link = Wn.Util.getAppLink(this.meta)
      Ti.Be.OpenLink(link)
    },
    //--------------------------------------
    download() {
      let link = Wn.Util.getDownloadLink(this.meta)
      Ti.Be.OpenLink(link)
    },
    //--------------------------------------
    saveStateToLocal() {
      if(this.stateLocalKey) {
        Ti.Storage.session.mergeObject(this.stateLocalKey, {
          isShowInfo     : this.isShowInfo,
          isFloatInfo    : this.isFloatInfo
        })
        // let state = Ti.Storage.session.getObject(this.stateLocalKey)
        // console.log("-> saveStateToLocal", state)
      }
    },
    //--------------------------------------
    loadStateFromLocal() {
      if(this.stateLocalKey) {
        let state = Ti.Storage.session.getObject(this.stateLocalKey)
        //console.log("<- loadStateFromLocal", state)
        _.defaults(state, {
          isShowInfo     : this.isShowInfo,
          isFloatInfo    : this.isFloatInfo
        })
        this.isShowInfo  = state.isShowInfo
        this.isFloatInfo = state.isFloatInfo
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "showInfo" : function(val) {
      console.log("showInfo watched")
      this.isShowInfo = val
    },
    "floatInfo" : function(val) {
      console.log("floatInfo watched")
      this.isFloatInfo = val
    }
  },
  //////////////////////////////////////////
  mounted : function() {
    this.isShowInfo  = this.showInfo
    this.isFloatInfo = this.floatInfo
    this.$nextTick(()=>{
      this.loadStateFromLocal()
    })
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/wn/obj/preview/wn-obj-preview.mjs", _M);
})();
//============================================================
// JOIN: wn/obj/preview/_com.json
//============================================================
Ti.Preload("ti/com/wn/obj/preview/_com.json", {
  "name" : "wn-obj-preview",
  "globally" : true,
  "i18n" : "@i18n:wn-obj-preview",
  "template" : "./wn-obj-preview.html",
  "mixins" : ["./wn-obj-preview.mjs"],
  "components" : [
    "./com/preview-info-field",
    "@com:ti/media/binary",
    "@com:ti/media/image",
    "@com:ti/media/video"]
});
//============================================================
// JOIN: wn/obj/puretext/wn-obj-puretext.html
//============================================================
Ti.Preload("ti/com/wn/obj/puretext/wn-obj-puretext.html", `<div class="wn-obj-puretext">
  <!--
    Show Text Editor
  -->
  <ti-text-raw v-if="hasMeta"
    class="ti-fill-parent"
    :icon="theIcon"
    :title="theTitle"
    :show-title="showTitle"
    :value="content"
    :content-is-changed="status.changed"
    :blank-text="blankText"
    @change="onChangeContent"/>
  <!--
    Empty Data
  -->
  <div v-else
    class="ti-blank is-big">
    <ti-icon value="zmdi-alert-circle-o"/>
    <span>{{"empty-data"|i18n}}</span>
  </div>
</div>`);
//============================================================
// JOIN: wn/obj/puretext/wn-obj-puretext.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : true,
  ////////////////////////////////////////////
  props : {
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "content" : {
      type : String,
      default : null
    },
    "savedContent" : {
      type : String,
      default : null
    },
    "contentType" : {
      type : String,
      default : null
    },
    "showTitle" : {
      type : Boolean,
      default : true
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
    "blankText" : {
      type : String,
      default : "i18n:blank"
    }
  },
  ////////////////////////////////////////////
  computed : {
    //----------------------------------------
    theIcon() {
      if(this.meta) {
        return Wn.Util.getIconObj(this.meta)
      }
      return Ti.Icons.get()
    },
    //----------------------------------------
    theTitle() {
      if(this.meta) {
        return this.meta.title || this.meta.nm
      }
      return "no-title"
    },
    //----------------------------------------
    hasMeta() {
      return this.meta ? true : false
    }
    //----------------------------------------
  },
  ////////////////////////////////////////////
  methods : {
    onChangeContent(newContent) {
      this.$notify("change", {content:newContent})
    }
  },
  ////////////////////////////////////////////
  mounted : function(){
    //----------------------------------------
    Ti.Fuse.getOrCreate().add({
      key : "wn-obj-puretext",
      everythingOk : ()=>{
        return !this.status.changed
      },
      fail : ()=>{
        Ti.Toast.Open("i18n:wn-obj-nosaved", "warn")
      }
    })
    //----------------------------------------
  },
  ////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Fuse.get().remove("wn-obj-puretext")
  }
  ////////////////////////////////////////////
}
Ti.Preload("ti/com/wn/obj/puretext/wn-obj-puretext.mjs", _M);
})();
//============================================================
// JOIN: wn/obj/puretext/_com.json
//============================================================
Ti.Preload("ti/com/wn/obj/puretext/_com.json", {
  "name" : "wn-obj-puretext",
  "globally" : true,
  "template" : "./wn-obj-puretext.html",
  "mixins" : ["./wn-obj-puretext.mjs"],
  "components" : ["@com:ti/text/raw"]
});
//============================================================
// JOIN: wn/obj/uploader/wn-obj-uploader.html
//============================================================
Ti.Preload("ti/com/wn/obj/uploader/wn-obj-uploader.html", `<ti-uploader
  :value="formedValue"/>`);
//============================================================
// JOIN: wn/obj/uploader/wn-obj-uploader.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  props : {
    "value" : {
      type : [String, Object, Array],
      default : null
    },
    // true - support multiple object 
    "multi" : {
      type : Boolean,
      default : true
    },
    // support remove the objects
    "removable" : {
      type : Boolean,
      default : true
    },
    // Before removed, how many objects shuld be remained at least
    "remained" : {
      type : Number,
      default : 0
    },
    // If null value, new object will be uploaded to here
    // path ends with `/` mean folder, it will keep the local name 
    // if without define, can not upload new file
    // for path, the "~" has been supported also
    "target" : {
      type : String,
      default : null
    },
    // When create a new file to target folder, 
    // how to format the local name
    "nameTransformer" : {
      type : [Function, String, Object],
      default : null
    },
    // which type supported to upload
    // nulllor empty array will support any types
    "supportTypes" : {
      type : [Array, String],
      default : null
    },
    // Image object only: it will auto apply image filter
    // just like clip the image size etc..
    // @see cmd_imagic for more detail about the filter
    "imageFilter" : {
      type : [Array, String],
      default : null
    },
    // Image object only: if `>0 and <=1` mean output quality
    // if not match the range, will depends on the `cmd_imagic` default
    "imageQuality" : {
      type : Number,
      default : 0
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    //--------------------------------------
    formedValue() {
      return null
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    getObj(income) {
      if(income) {
        if(_.isString(income)) {
          
        }
      }
    }
  }
}
Ti.Preload("ti/com/wn/obj/uploader/wn-obj-uploader.mjs", _M);
})();
//============================================================
// JOIN: wn/obj/uploader/_com.json
//============================================================
Ti.Preload("ti/com/wn/obj/uploader/_com.json", {
  "name" : "wn-obj-uploader",
  "globally" : true,
  "template" : "./wn-obj-uploader.html",
  "mixins" : ["./wn-obj-uploader.mjs"],
  "components" : [
    "@com:ti/uploader"
  ]
});
//============================================================
// JOIN: wn/support/wn_list_wrapper_mixins.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////////////
  methods : {
    explainDisplayItems(display=[]) {
      let displayItems = _.concat(display)
      let list = []
      _.forEach(displayItems, (it)=>{
        // Guard
        if(Ti.Util.isNil(it)) {
          return
        }
        // Quick: table.field.display:: thumb->icon
        if(_.isString(it)) {
          let m = /^@<thumb(:([^>]*))?>$/.exec(it)
          if(m) {
            let candidateIcon = m[2] || undefined
            list.push({
              key : ["icon", "thumb", "tp", "mime", "race", "__updated_time"],
              type : "Object",
              transformer : {
                name : "Ti.Types.toObject",
                args : {
                  icon  : "icon",
                  thumb : "thumb",
                  type  : "tp",
                  mime  : "mime",
                  race  : "race",
                  timestamp : "__updated_time"
                }
              },
              comType  : "wn-obj-icon",
              comConf : {
                "..." : "${=value}",
                "candidateIcon" : candidateIcon,
                //"className"   : "thing-icon"
              }
            })
            return
          }
        }
        // Other, just join
        list.push(it)
      })
      return list
    }
  }
  ///////////////////////////////////////////////////
}
Ti.Preload("ti/com/wn/support/wn_list_wrapper_mixins.mjs", _M);
})();
//============================================================
// JOIN: wn/table/wn-table.html
//============================================================
Ti.Preload("ti/com/wn/table/wn-table.html", `<ti-table
  v-bind="this"
  :fields="TheFields"
  :on-init="OnSubListInit"
  @select="OnSelected"
  @open="$notify('open', $event)"/>`);
//============================================================
// JOIN: wn/table/wn-table.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////////////
  data : ()=>({
    isAllChecked  : false,
    hasChecked    : false,
    theCurrentId  : false,
    theCheckedIds : false
  }),
  ///////////////////////////////////////////////////
  computed : {
    //----------------------------------------------
    TheFields() {
      let list = []
      for(let fld of this.fields) {
        let f2 = _.assign({}, fld)
        f2.display = this.explainDisplayItems(fld.display)
        list.push(f2)
      }
      return list
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    OnSubListInit($list) {this.$list = $list},
    //----------------------------------------------
    OnSelected(payload={}){
      this.theCheckedIds = payload.checkedIds
      this.theCurrentId  = payload.currentId
      this.syncCheckStatus()
      this.$notify("select", payload)
    },
    //----------------------------------------------
    syncCheckStatus() {
      this.isAllChecked = this.$list.isAllChecked
      this.hasChecked   = this.$list.hasChecked
    },
    //----------------------------------------------
    // Delegate methods
    selectPrevRow(options){this.$list.selectPrevRow(options)},
    selectNextRow(options){this.$list.selectNextRow(options)},

    getCurrentRow(options){return this.$list.getCurrentRow(options)},
    getCheckedRow(options){return this.$list.getCheckedRow(options)},

    getCurrent(options){return this.$list.getCurrent(options)},
    getChecked(options){return this.$list.getChecked(options)},

    selectRow(options){this.$list.selectRow(options)},
    checkRow (options){this.$list.checkRow(options)},
    cancelRow(options){this.$list.cancelRow(options)}
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "data" : function(){
      this.syncCheckStatus()
    },
    "checkedIds" : function(){
      this.syncCheckStatus()
    }
  }
  ///////////////////////////////////////////////////
}
Ti.Preload("ti/com/wn/table/wn-table.mjs", _M);
})();
//============================================================
// JOIN: wn/table/_com.json
//============================================================
Ti.Preload("ti/com/wn/table/_com.json", {
  "name" : "wn-table",
  "globally" : true,
  "template" : "./wn-table.html",
  "props" : [
    "@com:ti/support/list_props.mjs",
    "@com:ti/table/ti-table-props.mjs"],
  "mixins" : [
    "@com:wn/support/wn_list_wrapper_mixins.mjs",
    "./wn-table.mjs"],
  "components" : [
    "@com:ti/table"]
});
//============================================================
// JOIN: wn/thing/manager/com/thing-creator/thing-creator.html
//============================================================
Ti.Preload("ti/com/wn/thing/manager/com/thing-creator/thing-creator.html", `<div class="thing-creator ti-box-relative">
  <ti-form
    :fields="fields"
    :only-fields="false"
    v-model="myData"/>
  <hr class="no-space">
  <div class="ti-flex-center ti-padding-10">
    <div class="ti-btn is-big" 
      @click="onCreate">
      <span>{{'create-now'|i18n}}</span>
    </div>
  </div>
  <div v-if="creating"
    class="ti-box-mask as-thin ti-flex-center">
    <ti-loading text="i18n:creating"/>
  </div>
</div>`);
//============================================================
// JOIN: wn/thing/manager/com/thing-creator/thing-creator.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////
  data : ()=>({
    "myData" : {},
    "creating" : false
  }),
  ///////////////////////////////////////////
  props : {
    "fields" : {
      type : Array,
      default : ()=>[]
    },
    "data" : {
      type : Object,
      default : ()=>({})
    }
  },
  ///////////////////////////////////////////
  methods : {
    //--------------------------------------
    onChanged({name, value}={}) {
      //console.log("changed", name, value)
      this.obj = _.assign({}, this.obj, {[name]: value})
    },
    //--------------------------------------
    async onCreate() {
      this.creating = true

      let app = Ti.App(this)
      await app.dispatch("main/create", this.myData)

      this.$notify("block:hide", "creator")
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  watch : {
    "data": {
      handler : function(){
        this.myData = _.assign({}, this.data)
      },
      immediate : true
    }
  }
  ///////////////////////////////////////////
}
Ti.Preload("ti/com/wn/thing/manager/com/thing-creator/thing-creator.mjs", _M);
})();
//============================================================
// JOIN: wn/thing/manager/com/thing-creator/_com.json
//============================================================
Ti.Preload("ti/com/wn/thing/manager/com/thing-creator/_com.json", {
  "name" : "wn-thing-creator",
  "globally" : true,
  "template" : "./thing-creator.html",
  "mixins"   : ["./thing-creator.mjs"],
  "components" : []
});
//============================================================
// JOIN: wn/thing/manager/com/thing-files/thing-files-props.mjs
//============================================================
(function(){
const _M = {
  //-----------------------------------
  // Data
  //-----------------------------------
  "dirName" : {
    type : String,
    default : "media"
  },
  "dataHome" : {
    type : String,
    default : null
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "files" : {
    type: Object,
    default: undefined
  },
  "preview" : {
    type : Object,
    default: undefined
  },
  "previewEdit" : {
    type : Object,
    default: undefined
  },
  "actions" : {
    type : Array,
    default : ()=>[{
        "name" : "reloading",
        "type" : "action",
        "icon" : "zmdi-refresh",
        "tip" : "i18n:refresh",
        "altDisplay" : {
          "icon" : "zmdi-refresh zmdi-hc-spin"
        },
        "action" : "$parent:reloadData"
      },{
        "type" : "line"
      }, {
        "name" : "deleting",
        "type" : "action",
        "icon" : "zmdi-delete",
        "text" : "i18n:del",
        "altDisplay" : {
          "icon" : "zmdi-refresh zmdi-hc-spin",
          "text" : "i18n:del-ing"
        },
        "action" : "$parent:doDeleteSelected"
      },{
        "type" : "line"
      },{
        "name" : "upload",
        "type" : "action",
        "icon" : "zmdi-cloud-upload",
        "text" : "i18n:upload",
        //"action" : "commit:main/files/showUploadFilePicker"
        "action" : "$parent:doUploadFiles"
      }]
  },
  "stateLocalKey" : {
    type : String,
    default : null
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "dirNameTip" : {
    type : String,
    default : "i18n:thing-files"
  },
  "dirNameComType" : {
    type : String,
    default : "ti-droplist"
  },
  "dirNameOptions" : {
    type : Array,
    default : ()=>[{
      icon  :"zmdi-collection-image",
      text  :"i18n:media",
      value : "media"
    }, {
      icon  :"zmdi-attachment-alt",
      text  :"i18n:attachment",
      value : "attachment"
    }]
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
}
Ti.Preload("ti/com/wn/thing/manager/com/thing-files/thing-files-props.mjs", _M);
})();
//============================================================
// JOIN: wn/thing/manager/com/thing-files/thing-files.html
//============================================================
Ti.Preload("ti/com/wn/thing/manager/com/thing-files/thing-files.html", `<div class="thing-files">
  <!--
    With Data Home
  -->
  <template v-if="dataHome">
    <!--
      Head bar for switch dir and actions
    -->
    <div class="as-header">
      <div v-if="dirNameTip"
        class="as-tip">
        <span>{{dirNameTip|i18n}}</span>
      </div>
      <!--Left: select files home dirName-->
      <div class="as-name">
        <component 
          :is="dirNameComType"
          height=".3rem"
          :allow-empty="false"
          :options="dirNameOptions"
          :value="dirName"
          :prefix-icon-for-clean="false"
          @change="OnDirNameChanged"/>
      </div>
      <!--Right: Common Actions-->
      <div class="as-menu">
        <ti-actionbar 
          :items="actions"
          :status="myStatus"/>
      </div>
    </div>
    <!--
      File Preview
    -->
    <div class="as-preview">
      <wn-obj-preview
        class="ti-fill-parent"
        v-bind="ThePreview"
        :meta="CurrentFile"/>
    </div>
    <!--
      File List
    -->
    <div class="as-list">
      <wn-adaptlist
        class="ti-fill-parent"
        v-bind="TheFiles"
        :data="myData"
        :meta="myHome"
        :status="myStatus"
        @uploaded="OnFileUploaded"
        @select="OnFileSelected"
        :on-init="OnAdaptListInit"/>
    </div>
  </template>
  <!--
    Without Data Home
  -->
  <ti-loading v-else
    text="i18n:empty-data"
    icon="zmdi-alert-circle-o"/>
</div>`);
//============================================================
// JOIN: wn/thing/manager/com/thing-files/thing-files.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////
  inject: ["$ThingManager"],
  ///////////////////////////////////////////
  data: ()=>({
    myHome: null,
    myData: {},
    myStatus: {
      reloading: false
    },
    myCurrentId: null
  }),
  ///////////////////////////////////////////
  computed : {
    //--------------------------------------
    hasDataHome() {
      return this.dataHome ? true : false
    },
    //--------------------------------------
    CurrentFile(){
      if(this.myCurrentId && this.myData.list){
        for(let it of this.myData.list) {
          if(this.myCurrentId == it.id){
            return it
          }
        }
      }
    },
    //--------------------------------------
    ThePreview() {
      let preview = Ti.Util.getFallback(
        this.preview, 
        this.dirName, 
        "@default") || this.preview || {}

      return {
        showInfo  : false,
        floatInfo : false,
        infoPosition  : "left",
        infoNameWidth : 40,
        infoValueWidth : 120,
        stateLocalKey : this.stateLocalKey,
        // Customized
        ...preview,
        // Edit Info 
        editInfoBy : ()=>{
          this.editPreviewInfo()
        }
      }
    },
    //--------------------------------------
    TheFiles() {
      return _.assign({}, this.files, {
        routers : {
          "reload" : async ()=>{
            await this.reloadData()
          }
        }
      })
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnAdaptListInit($adaptlist){this.$adaptlist = $adaptlist},
    //--------------------------------------
    // Events
    //--------------------------------------
    OnDirNameChanged(dirName) {
      let app = Ti.App(this)
      app.commit("main/setCurrentDataDir", dirName)
      this.$nextTick(()=>{
        this.reloadData()
      })
    },
    //--------------------------------------
    OnFileSelected({currentId}) {
      this.myCurrentId = currentId
    },
    //--------------------------------------
    async OnFileUploaded(files=[]){
      let f = _.first(files)
      if(f) {
        this.$adaptlist.myCurrentId = f.id
        this.myCurrentId = f.id
      }
      await this.doUpdateFilesCount()
    },
    //--------------------------------------
    // Untility
    //--------------------------------------
    async doUpdateFilesCount() {
      let meta = _.get(this.$ThingManager, "current.meta")
      if(meta) {
        let cmds = ['thing', meta.th_set, 'file', meta.id, "-ufc"]
        let cmdText = cmds.join(" ")
        await Wn.Sys.exec2(cmdText)
      }
    },
    //--------------------------------------
    async doDeleteSelected(){
      await this.$adaptlist.doDelete()
      await this.doUpdateFilesCount()
    },
    //--------------------------------------
    async doUploadFiles() {
      // Guard
      if(!this.hasDataHome) {
        return
      }
      // If empty data home, create one
      if(!this.myHome) {
        let pos = this.dataHome.indexOf('/')
        let tsDataPh = this.dataHome.substring(0, pos)
        let dirPath = Ti.Util.appendPath(this.dataHome.substring(pos+1), this.dirName)
        let newMeta = {
          race : "DIR",
          nm   : dirPath
        }
        let json = JSON.stringify(newMeta)
        let cmdText = `obj "${tsDataPh}" -IfNoExists -new '${json}' -cqno`
        console.log(cmdText)
        this.myHome = await Wn.Sys.exec2(cmdText, {as:"json"})
      }
      
      // Do upload
      if(this.myHome) {
        this.$adaptlist.openLocalFileSelectdDialog()
      }
      // Impossible
      else {
        throw "Impossible!!!"
      }
    },
    //--------------------------------------
    async editPreviewInfo() {
      //console.log("showPreviewObjInfo:", this.preview)
      if(this.CurrentFile) {
        let options = _.get(this.previewEdit, this.dirName)
        let reo = await Wn.EditObjMeta(this.CurrentFile, options)
        if(reo && reo.data) {
          this.updateItemInDataList(reo.data)
        }
      }
    },
    //--------------------------------------
    updateItemInDataList(meta) {
      if(meta && this.myData && _.isArray(this.myData.list)) {
        this.myData.list = _.map(
          this.myData.list,
          it => it.id == meta.id ? meta : it)
      }
    },
    //--------------------------------------
    // Reloading
    //--------------------------------------
    async reloadData() {
      if(this.dataHome && this.dirName) {
        this.myStatus.reloading = true
        let hmph = Ti.Util.appendPath(this.dataHome, this.dirName)
        let home = await Wn.Io.loadMeta(hmph)
        // Guard
        if(!home) {
          this.myHome = null
          this.myData = {}
        }
        // Update data
        else {
          let reo = await Wn.Io.loadChildren(home)
          this.myHome = home
          this.myData = reo
        }
        _.delay(()=>{
          this.myStatus.reloading = false
        }, 100)
      }
      // Reset
      else {
        this.myHome = null
        this.myData = {}
      }
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  watch : {
    "dataHome" : {
      handler : "reloadData",
      immediate : true
    }
  },
  ///////////////////////////////////////////
  mounted : function() {
    this.$ThingManager.$files = this
  }
  ///////////////////////////////////////////
}
Ti.Preload("ti/com/wn/thing/manager/com/thing-files/thing-files.mjs", _M);
})();
//============================================================
// JOIN: wn/thing/manager/com/thing-files/_com.json
//============================================================
Ti.Preload("ti/com/wn/thing/manager/com/thing-files/_com.json", {
  "name" : "wn-thing-files",
  "globally" : true,
  "template" : "./thing-files.html",
  "props" : "./thing-files-props.mjs",
  "mixins"   : ["./thing-files.mjs"],
  "components" : [
    "@com:wn/adaptlist"
  ]
});
//============================================================
// JOIN: wn/thing/manager/com/thing-filter/thing-filter.html
//============================================================
Ti.Preload("ti/com/wn/thing/manager/com/thing-filter/thing-filter.html", `<div class="thing-filter"
  :class="topClass">
  <!--
    Icon: Recycle Bin
  -->
  <div v-if="isInRecycleBin"
    class="filter-recycle-bin"
    @click="onLeaveRecycleBin">
    <span class="it-icon">
      <ti-icon value="fas-recycle"/>
      <ti-icon value="far-arrow-alt-circle-left"/>
    </span>
    <span class="it-text">{{'i18n:thing-recycle-bin'|i18n}}</span>
  </div>
  <!--
    Keyword
  -->
  <div class="filter-keyword"
    :class="keywordClass">
    <!--Input Box-->
    <input ref="input"
      :placeholder="placeholderText" 
      spellcheck="false"
      @change="onInputChanged"
      @focus="keywordFocus=true"
      @blur="keywordFocus=false">
    <!--Search Icon-->
    <ti-icon v-if="searchIcon" :value="searchIcon"/>
  </div>
</div>`);
//============================================================
// JOIN: wn/thing/manager/com/thing-filter/thing-filter.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////
  data : ()=>({
    keywordFocus : false
  }),
  ///////////////////////////////////////////
  props : {
    "placeholder" : {
      type : String,
      default : "i18n:thing-filter-kwdplhd"
    },
    "searchIcon" : {
      type : String,
      default : "zmdi-search"
    },
    "status" : {
      type : Object,
      default : ()=>({})
    }
  },
  ///////////////////////////////////////////
  computed : {
    //---------------------------------------
    placeholderText() {
      if(this.placeholder)
        return Ti.I18n.text(this.placeholder)
      return ""
    },
    //---------------------------------------
    keywordClass() {
      return {
        "has-icon" : this.hasSearchIcon,
        "is-focus" : this.keywordFocus
      }
    },
    //---------------------------------------
    isInRecycleBin() {
      return this.status.inRecycleBin
    },
    //---------------------------------------
    topClass() {
      return {
        "in-recycle-bin" : this.isInRecycleBin
      }      
    }
    //---------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //---------------------------------------
    onInputChanged() {
      let name = _.trim(this.$refs.input.value)
      // Empty as undefined
      if(_.isEmpty(name)) {
        name = null
      }
      // make regex
      else {
        name = `^.*${name}.*$`
      }
      Ti.App(this).commit("main/search/updateFilter", {
        th_nm : name
      })
      Ti.App(this).dispatch("main/reloadSearch")
    },
    //---------------------------------------
    // When this func be invoked, the recycleBin must be true
    onLeaveRecycleBin() {
      Ti.App(this).dispatch('main/toggleInRecycleBin')
    }
    //---------------------------------------
  }
  ///////////////////////////////////////////
}
Ti.Preload("ti/com/wn/thing/manager/com/thing-filter/thing-filter.mjs", _M);
})();
//============================================================
// JOIN: wn/thing/manager/com/thing-filter/_com.json
//============================================================
Ti.Preload("ti/com/wn/thing/manager/com/thing-filter/_com.json", {
  "name" : "wn-thing-filter",
  "globally" : true,
  "template" : "./thing-filter.html",
  "mixins"   : ["./thing-filter.mjs"],
  "components" : []
});
//============================================================
// JOIN: wn/thing/manager/wn-thing-manager.html
//============================================================
Ti.Preload("ti/com/wn/thing/manager/wn-thing-manager.html", `<ti-gui
  class="wn-thing"
  :class="TopClass"
  :layout="TheLayout"
  :schema="TheSchema"
  :shown="TheShown"
  :can-loading="true"
  :loading-as="GuiLoadingAs"
  :action-status="status"
  @block:show="showBlock"
  @block:hide="hideBlock"
  @block:shown="changeShown"
  @list::select="OnListSelect"
  @list::open="OnListOpen"
  @content::change="OnContentChange"
  @pager::change="OnPagerChange"
  @view-current-source="OnViewCurrentSource"/>`);
//============================================================
// JOIN: wn/thing/manager/wn-thing-manager.mjs
//============================================================
(function(){
const _M = {
  ///////////////////////////////////////////
  provide : function() {
    return {
      "$ThingManager" : this
    }
  },
  ///////////////////////////////////////////
  props : {
    // Thing Set Home
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "currentDataHome" : {
      type : String,
      default : null
    },
    "currentDataDir" : {
      type : String,
      default : "media"
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
    "config" : {
      type : Object,
      default : ()=>({})
    },
    "search" : {
      type : Object,
      default : ()=>({})
    },
    "current" : {
      type : Object,
      default : ()=>({})
    },
    "files" : {
      type : Object,
      default : ()=>({})
    },
    "preview" : {
      type : Object,
      default : ()=>({})
    },
    "emitChange": {
      type : Boolean,
      default: false
    }
  },
  ///////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    TheShown() {
      return _.get(this.config, "shown") || {}
    },
    //--------------------------------------
    TheLayout() {
      return Ti.Util.explainObj(this, this.config.layout)
    },
    //--------------------------------------
    TheSchema() {
      return Ti.Util.explainObj(this, this.config.schema)
    },
    //--------------------------------------
    TheLoadingAs() {
      return _.assign({
        "reloading" : {
          icon : "fas-spinner fa-spin",
          text : "i18n:loading"
        },
        "saving" : {
          icon : "zmdi-settings fa-spin",
          text : "i18n:saving"
        },
        "deleting" : {
          icon : "zmdi-refresh fa-spin",
          text : "i18n:del-ing"
        },
        "publishing" : {
          icon : "zmdi-settings zmdi-hc-spin",
          text : "i18n:publishing"
        },
        "restoring" : {
          icon : "zmdi-time-restore zmdi-hc-spin",
          text : "i18n:thing-restoring"
        },
        "cleaning" : {
          icon : "zmdi-settings zmdi-hc-spin",
          text : "i18n:thing-cleaning"
        }
      }, _.get(this.TheSchema, "loadingAs"))
    },
    //--------------------------------------
    ChangedRowId() {
      if(this.current && this.current.meta && this.current.status.changed) {
        return this.current.meta.id
      }
    },
    //--------------------------------------
    GuiLoadingAs() {
      let key = _.findKey(this.status, (v)=>v)
      return _.get(this.TheLoadingAs, key)
    },
    //--------------------------------------
    curentThumbTarget() {
      if(this.current.meta) {
        let th_set = this.meta.id
        return `id:${th_set}/data/${this.current.meta.id}/thumb.jpg`
      }
      return ""
    },
    //--------------------------------------
    SchemaMethods() {
      if(this.TheSchema && this.TheSchema.methods) {
        return Ti.Util.merge({}, this.TheSchema.methods)
      }
      return {}
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnListSelect({current, currentId, checkedIds, checked}) {
      Ti.App(this).dispatch("main/setCurrentThing", {
        meta: current, 
        currentId,
        checkedIds
      })
      if(this.emitChange) {
        this.$emit("change", {current, currentId, checkedIds, checked})
      }
    },
    //--------------------------------------
    OnListOpen({rawData}) {
      let app = Ti.App(this)
      app.dispatch("main/config/updateShown", this.config.listOpen)
      // Update Current
      app.dispatch("main/setCurrentThing", {meta: rawData})
    },
    //--------------------------------------
    OnContentChange(content) {
      let app = Ti.App(this)
      app.dispatch("main/current/changeContent", content)
      app.commit("main/syncStatusChanged")
    },
    //--------------------------------------
    OnPagerChange({pn, pgsz}={}) {
      //console.log("OnPagerChange", {pn, pgsz})
      Ti.App(this).dispatch("main/search/reloadPage", {pn, pgsz})
    },
    //--------------------------------------
    OnViewCurrentSource() {
      this.viewCurrentSource()
    },
    //--------------------------------------
    // Show hide block
    //--------------------------------------
    async changeShown(shown={}) {
      Ti.App(this).dispatch("main/doChangeShown", shown)
    },
    //--------------------------------------
    showBlock(name) {
      //console.log("showBlock", name)
      // If creator, then must leave the recycle bin
      if("creator" == name) {
        if(this.status.inRecycleBin) {
          Ti.Alert("i18n:thing-create-in-recyclebin", {
            title : "i18n:warn",
            icon  : "im-warning",
            type  : "warn"
          })
          return
        }
      }
      if("files" == name) {
        Ti.App(this).dispatch("main/reloadFiles")
      }
      else if("content" == name) {
        //Ti.App(this).dispatch("main/reloadFiles")
        Ti.App(this).dispatch("main/current/reload")
      }
      // Mark block
      Ti.App(this).dispatch("main/doChangeShown", {[name]:true})
    },
    //--------------------------------------
    hideBlock(name) {
      Ti.App(this).dispatch("main/doChangeShown", {[name]:false})
    },
    //--------------------------------------
    toggleBlock(name) {
      Ti.App(this).dispatch("main/doChangeShown", {
        [name]: !this.TheShown[name]
      })
    },
    //--------------------------------------
    // Utility
    //--------------------------------------
    async viewCurrentSource() {
      // Guard
      if(!this.current.meta) {
        return await Ti.Toast.Open("i18n:empty-data", "warn")
      }
      // Open Editor
      let newContent = await Wn.EditObjContent(this.current.meta, {
        showEditorTitle : false,
        icon      : Wn.Util.getObjIcon(this.current.meta, "zmdi-tv"),
        title     : Wn.Util.getObjDisplayName(this.current.meta),
        width     : "61.8%",
        height    : "96%",
        content   : this.current.content,
        saveBy    : null
      })

      //console.log(newContent)

      // Cancel the editing
      if(_.isUndefined(newContent)) {
        return
      }

      // Update the current editing
      Ti.App(this).dispatch("main/setCurrentContent", newContent)
    },
    //--------------------------------------
    async invoke(fnName) {
      //console.log("invoke ", fnName)
      let fn = _.get(this.SchemaMethods, fnName)
      // Invoke the method
      if(_.isFunction(fn)) {
        return await fn.apply(this, [])
      }
      // Throw the error
      else {
        throw Ti.Err.make("e.thing.fail-to-invoke", fnName)
      }
    },
    //--------------------------------------
    checkActionsUpdate() {
      //console.log("checkActionsUpdate")
      let actions = _.get(this.config, "actions")
      if(_.isArray(actions)) {
        this.$notify("actions:update", actions)
      }
    },
    //--------------------------------------
    async reloadCurrentFiles() {
      await this.$files.reloadData()
    },
    //--------------------------------------
    async deleteCurrentSelectedFiles() {
      await this.$files.doDeleteSelected()
    },
    //--------------------------------------
    async uploadFilesToCurrent() {
      await this.$files.doUploadFiles()
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  mounted : function() {
    // Mark self in order to let `thing-files` set self
    // to root `wn-thing-manager` instance
    // then `openLocalFileSelectdDialogToUploadFiles`
    // can assess the `thing-files` instance directly.
    this.THING_MANAGER_ROOT = true

    // Update the customized actions
    this.checkActionsUpdate()
  }
  ///////////////////////////////////////////
}
Ti.Preload("ti/com/wn/thing/manager/wn-thing-manager.mjs", _M);
})();
//============================================================
// JOIN: wn/thing/manager/_com.json
//============================================================
Ti.Preload("ti/com/wn/thing/manager/_com.json", {
  "name" : "wn-thing-manager",
  "globally" : true,
  "i18n" : "@i18n:wn-thing",
  "template" : "./wn-thing-manager.html",
  "mixins"   : ["./wn-thing-manager.mjs"],
  "components" : [
    "./com/thing-files",
    "./com/thing-filter",
    "./com/thing-creator",
    "./com/thing-files",
    "@com:ti/gui",
    "@com:ti/paging/jumper",
    "@com:wn/table",
    "@com:wn/obj/icon",
    "@com:wn/obj/puretext",
    "@com:wn/obj/preview",
    "@com:wn/obj/form"]
});
//============================================================
// JOIN: wn/thing/_test/thing-actions.json
//============================================================
Ti.Preload("ti/com/wn/thing/_test/thing-actions.json", '')
//============================================================
// JOIN: wn/thing/_test/thing-layout.json
//============================================================
Ti.Preload("ti/com/wn/thing/_test/thing-layout.json", {
  "shown" : {
    "search" : true,
    "meta" : true,
    "content" : false,
    "files" : false
  },
  "listOpen" : {
    "content" : true,
    "files" : true
  },
  "desktop" : {
    "type" : "cols",
    "border" : true,
    "blocks" : [{
      "name" : "search",
      "size" : "50%",
      "type" : "rows",
      "border" : true,
      "blocks" : [{
          "name" : "filter",
          "size" : 50,
          "body" : "filter"
        }, {
          "name" : "list",
          "size" : "stretch",
          "overflow" : "hidden",
          "body" : "list"
        }, {
          "name" : "pager",
          "size" : "auto",
          "body" : "pager"
        }]
    }, {
      "name"  : "meta",
      "title" : "i18n:thing-meta",
      "icon"  : "zmdi-info",
      "actions" : [{
          "key" : "show-content",
          "statusKey" : "content",
          "type" : "action",
          "text" : "i18n:thing-content-show",
          "altDisplay" : {
            "text" : "i18n:thing-content-hide",
            "capture" : false
          },
          "action" : "main:toggleBlock(content)"
        }, {
          "key" : "show-files",
          "statusKey" : "files",
          "type" : "action",
          "text" : "i18n:thing-files-show",
          "altDisplay" : {
            "text" : "i18n:thing-files-hide",
            "capture" : false
          },
          "action" : "main:toggleBlock(files)"
        }],
      "size"  : "stretch",
      "body"  : "meta"
    }],
    "panels" : [{
      "name" : "content",
      "title" : "i18n:thing-content",
      "icon"  : "zmdi-file-text",
      "body" : "content",
      "position" : "left",
      "width"  : "50%",
      "height" : "100%",
      "closer" : "default",
      "status" : "=current.status",
      "actions" : [{
        "key"  : "saving",
        "type" : "action",
        "icon" : "zmdi-floppy",
        "text" : "i18n:save-change",
        "altDisplay" : {
          "icon" : "fas-spinner fa-pulse",
          "text" : "i18n:saving"
        },
        "enableBy" : "changed",
        "action" : "dispatch:main/saveCurrent"
      }]
    }, {
      "name" : "files",
      "title" : "i18n:thing-files",
      "icon"  : "zmdi-collection-image",
      "body" : "files",
      "position" : "right",
      "width"  : "50%",
      "height" : "100%",
      "closer" : "default"
    }, {
      "name" : "creator",
      "title" : "i18n:thing-create",
      "icon"  : "zmdi-flare",
      "body" : "creator",
      "position" : "top",
      "width"  : "61.8%",
      "mask"   : true,
      "closer" : "bottom",
      "status" : "=status"
    }]
  },
  "tablet" : "phone",
  "phone" : {
      "name" : "search",
      "size" : "50%",
      "type" : "rows",
      "border" : true,
      "blocks" : [{
          "name" : "filter",
          "size" : 50,
          "body" : "filter"
        }, {
          "name" : "list",
          "size" : "stretch",
          "overflow" : "hidden",
          "body" : "list"
        }, {
          "name" : "pager",
          "size" : "auto",
          "body" : "pager"
        }],
      "panels" : [{
        "name"  : "meta",
        "title" : "i18n:thing-meta",
        "icon"  : "zmdi-info",
        "position" : "right",
        "width"  : "100%",
        "height" : "100%",
        "closer" : "default",
        "body"  : "meta",
        "actionDisplayMode" : "desktop",
        "actions" : [{
            "key" : "show-content",
            "statusKey" : "content",
            "type" : "action",
            "text" : "i18n:thing-content-show",
            "altDisplay" : {
              "text" : "i18n:thing-content-hide",
              "capture" : false
            },
            "action" : "main:toggleBlock(content)"
          }, {
            "key" : "show-files",
            "statusKey" : "files",
            "type" : "action",
            "text" : "i18n:thing-files-show",
            "altDisplay" : {
              "text" : "i18n:thing-files-hide",
              "capture" : false
            },
            "action" : "main:toggleBlock(files)"
          }]
      }, {
        "name" : "content",
        "title" : "i18n:thing-content",
        "icon"  : "zmdi-file-text",
        "body" : "content",
        "position" : "bottom",
        "width"  : "100%",
        "height" : "100%",
        "closer" : "default",
        "status" : "=current.status",
        "actionDisplayMode" : "desktop",
        "actions" : [{
          "key"  : "saving",
          "type" : "action",
          "icon" : "zmdi-floppy",
          "text" : "i18n:save-change",
          "altDisplay" : {
            "icon" : "fas-spinner fa-pulse",
            "text" : "i18n:saving"
          },
          "enableBy" : "changed",
          "action" : "dispatch:main/saveCurrent"
        }]
      }, {
        "name" : "files",
        "title" : "i18n:thing-files",
        "icon"  : "zmdi-collection-image",
        "body" : "files",
        "position" : "bottom",
        "width"  : "100%",
        "height" : "100%",
        "closer" : "default",
        "status" : "=files.status",
        "actionDisplayMode" : "desktop",
        "actions" : [{
            "key"  : "deleting",
            "type" : "action",
            "icon" : "zmdi-delete",
            "text" : "i18n:del-checked",
            "altDisplay" : {
              "icon" : "zmdi-refresh zmdi-hc-spin",
              "text" : "i18n:del-ing"
            },
            "action" : "dispatch:main/files/deleteSelected"
          },{
            "key"  : "upload",
            "type" : "action",
            "icon" : "zmdi-cloud-upload",
            "text" : "i18n:upload-file",
            "action" : "commit:main/files/showUploadFilePicker"
          }]
      }, {
        "name" : "creator",
        "title" : "i18n:thing-create",
        "icon"  : "zmdi-flare",
        "body" : "creator",
        "position" : "top",
        "width"  : "100%",
        "mask"   : true,
        "closer" : "bottom",
        "status" : "=status"
      }]
    }
});
//============================================================
// JOIN: wn/thing/_test/thing-schema.json
//============================================================
Ti.Preload("ti/com/wn/thing/_test/thing-schema.json", {
  "filter" : {
    "comType" : "wn-thing-filter",
    "comConf" : {
      "status" : "=status"
    }
  },
  "list" : {
    "comType" : "ti-table",
    "comConf" : {
      "list" : "=search.list",
      "changedId"  : "=changedRowId",
      "currentId"  : "=search.currentId",
      "checkedIds" : "=search.checkedIds",
      "border" : true,
      "checkable" : true,
      "multi"  : true,
      "fields" : [{
        "title" : "名称",
        "display" : ["th_nm", "lbls"]
      }, {
        "title" : "标签",
        "display" : "lbls"
      }, {
        "title" : "创建时间",
        "type"    : "DateTime",
        "display" : {
          "key":"ct", 
          "transformer" : {
            "name" : "formatDate",
            "args" : "yyyyMMdd/HH:mm:s"
          }
        }
      }]
    }
  },
  "pager" : {
    "comType" : "ti-paging-jumper",
    "comConf" : {
      "data" : "=search.pager"
    }
  },
  "creator" : {
    "comType" : "wn-thing-creator",
    "comConf" : {
      "config" : {
        "fields" : [{
          "name" : "th_nm",
          "comType" : "ti-input",
          "comConf" : {}
        }]
      },
      "data" : {
        "th_nm" : "新数据对象"
      }
    }
  },
  "meta" : {
    "comType" : "wn-obj-form",
    "comConf" : {
      "data"   : "=current.meta",
      "status" : "=current.status",
      "fieldStatus" : "=current.fieldStatus",
      "config" : {
        "fields" : [{
            "title"  : "ID",
            "name"   : "id"
          }, {
            "title"   : "名称",
            "name"    : "th_nm",
            "comType" : "ti-input"
          },{
            "icon"    : "zmdi-labels",
            "title"   : "标签",
            "name"    : "lbls",
            "type"    : "Array",
            "transformer" : "toStr",
            "comType" : "ti-input"
          },{
            "icon"    : "zmdi-time",
            "title"   : "最后修改时间",
            "name"    : "lm",
            "type"    : "DateTime",
            "comConf" : {"format":"yyyy年MM月dd日"}
          }]
      },
      "updateBy" : {
        "method" : "dispatch",
        "target" : "main/updateCurrent"
      },
      "setFieldStatusBy" : {
        "method" : "commit",
        "target" : "main/current/setMetaFieldStatus"
      }
    }
  },
  "content" : {
    "comType" : "wn-obj-puretext",
    "comConf" : {
      "showTitle"    : false,
      "meta"         : "=current.meta",
      "content"      : "=current.content",
      "savedContent" : "=current.__saved_content",
      "contentType"  : "=current.contentType",
      "status"       : "=current.status"
    }
  },
  "files" : {
    "comType" : "wn-thing-files",
    "comConf" : {
      "filesName" : "=filesName",
      "files"     : "=files",
      "stateLocalKey" : "=meta.id",
      "preview"   : "=preview",
      "dirNameTip" : null,
      "dirNameComType" : "ti-switcher",
      "dirNameOptions" : [{
          "icon"  :"fas-camera-retro",
          "text"  :"实地拍摄",
          "value" : "media"
        }, {
          "icon"  :"fas-paperclip",
          "text"  :"其他文件",
          "value" : "attachment"
        }]
    }
  }
});
//============================================================
// JOIN: wn/transfer/wn-transfer.html
//============================================================
Ti.Preload("ti/com/wn/transfer/wn-transfer.html", `<ti-transfer v-bind="this"
  
  :options="OptionsDict"
  :can-com-type="TheCanComType"
  :sel-com-type="TheSelComType"
  :display="TheDisplay"

  @change="$notify('change', $event)"/>`);
//============================================================
// JOIN: wn/transfer/wn-transfer.mjs
//============================================================
(function(){
const _M = {
  inheritAttrs : false,
  ///////////////////////////////////////////////////////
  data : ()=>({
    
  }),
  ///////////////////////////////////////////////////////
  props : {
    "itemBy" : {
      type : [String, Function],
      default : undefined
    },
    "findBy" : {
      type : [String, Function],
      default : undefined
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TheCanComType() {
      return this.canComType || "wn-list"
    },
    //---------------------------------------------------
    TheSelComType() {
      return this.selComType || "wn-list"
    },
    //------------------------------------------------
    TheDisplay() {
      return this.display || ["@<thumb>", "title", "nm"]
    },
    //---------------------------------------------------
    OptionsDict() {
      return Wn.Dict.evalOptionsDict(this)
    }
    //---------------------------------------------------
  }
  ///////////////////////////////////////////////////////
}
Ti.Preload("ti/com/wn/transfer/wn-transfer.mjs", _M);
})();
//============================================================
// JOIN: wn/transfer/_com.json
//============================================================
Ti.Preload("ti/com/wn/transfer/_com.json", {
  "name" : "wn-transfer",
  "globally" : true,
  "template" : "./wn-transfer.html",
  "props" : "@com:ti/transfer/ti-transfer-props.mjs",
  "mixins" : ["./wn-transfer.mjs"],
  "components" : ["@com:ti/transfer"]
});
//============================================================
// JOIN: wn/upload/file/wn-upload-file.html
//============================================================
Ti.Preload("ti/com/wn/upload/file/wn-upload-file.html", `<TiUploadFile
  :preview="PreviewIcon"
  :width="width"
  :height="height"
  :progress="progress"
  :upload-file="uploadFile"
  :removable="removable"
  @upload="onUpload"
  @remove="onRemove"
  @open="onOpen"/>`);
//============================================================
// JOIN: wn/upload/file/wn-upload-file.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  data : ()=>({
    "src_ts" : null,
    "oFile"     : null,
    "uploadFile" : null,
    "progress"   : -1
  }),
  /////////////////////////////////////////
  props : {
    "value" : {
      type : String,
      default : null
    },
    // raw value is WnObj
    // If declare the valueType
    // It will transform the WnObj
    // to relaitve value mode
    "valueType": {
      type: String,
      default: "obj",
      validator: v => /^(obj|path|fullPath|idPath|id)$/.test(v)
    },
    // Display width
    "width" : {
      type : [String, Number],
      default : undefined
    },
    // Display height
    "height" : {
      type : [String, Number],
      default : undefined
    },
    // support remove the objects
    "removable" : {
      type : Boolean,
      default : true
    },
    // Indicate the upload target when upload new value
    // Of cause, if the `value` exists, replace it
    // The `target` must be a path to a image object,
    // it will auto transfrom the image format by `cmd_imagic`
    "target" : {
      type : String,
      required: true,
      default : null
    },
    // which type supported to upload
    // nulll or empty array will support any types
    "supportTypes" : {
      type : [String, Array],
      default : ()=>[]
      //default : ()=>["png","jpg","jpeg","gif"]
    },
    // which mime supported to upload
    // nulll or empty array will support any mimes
    "supportMimes" : {
      type : [String, Array],
      default : ()=>[]
      //default : ()=>["image/png","image/jpeg","image/gif"]
    },
    // Image object only: it will auto apply image filter
    // just like clip the image size etc..
    // @see cmd_imagic for more detail about the filter
    "filter" : {
      type : [Array, String],
      default : null
    },
    // Image object only: if `>0 and <=1` mean output quality
    // if not match the range, will depends on the `cmd_imagic` default
    "quality" : {
      type : Number,
      default : 0
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    AcceptTypes() {
      if(_.isString(this.supportTypes))
        return this.supportTypes.split(",")
      return this.supportTypes
    },
    //--------------------------------------
    AcceptMimes() {
      if(_.isString(this.supportMimes))
        return this.supportMimes.split(",")
      return this.supportMimes
    },
    //--------------------------------------
    ImageFilter() {
      if(!this.filter)
        return []
      return [].concat(this.filter)
    },
    //--------------------------------------
    // Display image for <ti-thumb>
    PreviewIcon() {
      //....................................
      if(this.oFile) {
        //..................................
        // Image
        if(Wn.Obj.isMime(this.oFile, /^(image\/)/)) {
          let ss = ["/o/content?str=id:", this.oFile.id]
          if(this.src_ts) {
            ss.push("&_t=")
            ss.push(this.src_ts)
          }          
          return {
            type: "image", value: ss.join("")
          }
        }
        //..................................
        // Video
        if(Wn.Obj.isMime(this.oFile, /^(video\/)/)) {
          let ss = ["/o/content?str=id:", this.oFile.video_cover]
          if(this.src_ts) {
            ss.push("&_t=")
            ss.push(this.src_ts)
          }          
          return {
            type: "image", value: ss.join("")
          }
        }
        //..................................
        // Others just get the icon font
        return Wn.Util.getObjIcon(this.oFile)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    async assertListHas(list, str, invalidMsg, vars) {
      if(!_.isEmpty(list)) {
        let invalid  = true
        for(let li of list) {
          if(li == str) {
            invalid = false
            break
          }
        }
        if(invalid) {
          await Ti.Alert(invalidMsg, {type:"warn", icon:"zmdi-alert-triangle"})
          return false
        }
      }
      return true
    },
    //--------------------------------------
    async onOpen() {
      // remove the thumb file
      if(this.oFile) {
        let link = Wn.Util.getAppLink(this.oFile)
        //console.log("it will open ", link)
        await Ti.Be.Open(link.url, {params:link.params})
      }
    },
    //--------------------------------------
    async onRemove() {
      // remove the thumb file
      if(this.oFile) {
        await Wn.Sys.exec2(`rm id:${this.oFile.id}`)
      }
      // Notify the change
      this.$notify("change", null)
    },
    //--------------------------------------
    async onUpload(file) {
      //console.log("it will upload ", file)

      //................................
      // Check for support Types
      let type = Ti.Util.getSuffixName(file.name)
      if(!await this.assertListHas(
        this.AcceptTypes, type, {
          text : 'i18n:wn-invalid-types',
          vars : {current:type, supports:this.AcceptTypes.join(", ")}
        })) {
        return
      }
      if(!await this.assertListHas(
        this.AcceptMimes, file.type, {
          text : 'i18n:wn-invalid-mimes',
          vars : {current:file.type, supports:this.AcceptMimes.join(", ")}
        })) {
        return
      }

      //................................
      // Upload file to destination
      this.uploadFile = file
      this.progress = 0

      let {ok, msg, data} = await Wn.Io.uploadFile(file, {
        target : this.target,
        mode   : "r",
        progress : (pe)=> {
          this.progress = pe.loaded / pe.total
        }
      })

      //................................
      // Reset upload
      this.uploadFile = null
      this.progress = -1

      //................................
      // Fail to upload
      if(!ok) {
        await Ti.Alert(`i18n:${msg}`, {type:"warn", icon:"zmdi-alert-triangle"})
        return
      }

      //................................
      // do Filter
      if(!_.isEmpty(this.ImageFilter)) {
        let cmd = [
          "imagic", `id:${data.id}`, 
          `-filter "${this.ImageFilter.join(" ")}"`]       
        if(this.quality>0 && this.quality<=1) {
          cmd.push(`-qa ${this.quality}`)
        }
        cmd.push("-out inplace")
        let cmdText = cmd.join(" ")
        await Wn.Sys.exec2(cmdText)
      }

      //................................
      // done
      this.src_ts = Date.now()
      this.oFile = data

      //................................
      // Transform value
      let val = data
      if ("path" == this.valueType) {
        val = Wn.Io.getFormedPath(data)
      } else if ("fullPath" == this.valueType) {
        val = data.ph
      } else if ("idPath" == this.valueType) {
        val = `id:${data.id}` 
      } else if ("id" == this.valueType) {
        val = data.id
      }

      //................................
      this.$notify("change", val)
    },
    //--------------------------------------
    async reload() {
      if(this.value) {
        this.oFile = await Wn.Io.loadMeta(this.value)
      }
      // Reset
      else {
        this.oFile = null
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "value" : function() {
      this.reload()
    }
  },
  //////////////////////////////////////////
  mounted : async function(){
    await this.reload()
  }
  //////////////////////////////////////////
}
Ti.Preload("ti/com/wn/upload/file/wn-upload-file.mjs", _M);
})();
//============================================================
// JOIN: wn/upload/file/_com.json
//============================================================
Ti.Preload("ti/com/wn/upload/file/_com.json", {
  "name" : "wn-upload-file",
  "globally" : true,
  "template" : "./wn-upload-file.html",
  "mixins" : ["./wn-upload-file.mjs"],
  "components" : [
    "@com:ti/upload/file"
  ]
});
//============================================================
// JOIN: ti/viewport/ti-viewport.json
//============================================================
Ti.Preload("ti/mod/ti/viewport/ti-viewport.json", {
  "mode" : "desktop",
  "activedIds" : []
});
//============================================================
// JOIN: ti/viewport/ti-viewport.mjs
//============================================================
(function(){
const _M = {
  getters : {
    viewportMode : (state) => state.mode,
    viewportActivedComIds : (state) => state.activedIds,
    isViewportModeDesktop : (state)=> "desktop" == state.mode,
    isViewportModeTablet  : (state)=> "tablet" == state.mode,
    isViewportModePhone   : (state)=> "phone" == state.mode,
    isViewportModeDesktopOrTablet : (state)=> 
      ("desktop" == state.mode || "tablet" == state.mode),
    isViewportModePhoneOrTablet : (state)=> 
      ("phone" == state.mode || "tablet" == state.mode)
  },
  mutations : {
    setMode(state, mode="desktop") {
      state.mode = mode
    },
    setActivedIds(state, activedIds=[]) {
      //console.log("viewport setActivedIds", activedIds)
      state.activedIds = _.cloneDeep(activedIds)
    }
  }
}
Ti.Preload("ti/mod/ti/viewport/ti-viewport.mjs", _M);
})();
//============================================================
// JOIN: ti/viewport/_mod.json
//============================================================
Ti.Preload("ti/mod/ti/viewport/_mod.json", {
  "state" : "./ti-viewport.json",
  "mixins" : "./ti-viewport.mjs"
});
//============================================================
// JOIN: wn/obj-current/m-obj-current-actions.mjs
//============================================================
(function(){
const _M = {
  //----------------------------------------
  // Combin Mutations
  //----------------------------------------
  onChanged({dispatch}, payload) {
    dispatch("changeContent", payload)
  },
  //----------------------------------------
  changeContent({commit}, payload) {
    commit("setContent", payload)
    commit("syncStatusChanged");
  },
  //----------------------------------------
  changeMeta({commit}, {name, value}={}) {
    if(name) {
      let meta = _.set({}, name, value)
      commit("mergeMeta", meta)
      commit("syncStatusChanged")
    }
  },
  //----------------------------------------
  updateContent({state, commit}, content) {
    commit("setContent", content)
    if(state.meta && "FILE" == state.meta.race) {
      commit("setSavedContent", content)
    }
    commit("syncStatusChanged")
  },
  //--------------------------------------------
  // User Interactivity
  //--------------------------------------------
  async openMetaEditor({state, dispatch}) {
    // Guard
    if(!state.meta) {
      return await Ti.Toast.Open("i18n:empty-data", "warn")
    }
    // Open Editor
    let reo = await Wn.EditObjMeta(state.meta, {fields:"auto"})

    // Cancel the editing
    if(_.isUndefined(reo)) {
      return
    }

    // Update the current editing
    if(reo.saved) {
      await dispatch("reload", reo.data)
    }
  },
  //--------------------------------------------
  async openContentEditor({state, dispatch}) {
    // Guard
    if(!state.meta) {
      return await Ti.Toast.Open("i18n:empty-data", "warn")
    }
    // Open Editor
    let newContent = await Wn.EditObjContent(state.meta, {
      content : state.content
    })

    // Cancel the editing
    if(_.isUndefined(newContent)) {
      return
    }

    // Update the current editing
    await dispatch("changeContent", newContent)
  },
  //--------------------------------------------
  // Update to remote
  //----------------------------------------
  async updateMeta({commit, dispatch}, {name, value}={}) {
    //console.log("I am update", name, value)
    let data = Ti.Types.toObjByPair({name, value})

    commit("setFieldStatus", {name, type:"spinning", text:"i18n:saving"})
    await dispatch("updateMetas", data)
    commit("setFieldStatus", {name, type:"ok", text:"i18n:ok"})
    _.delay(()=>{commit("clearFieldStatus", name)}, 500)
  },
  //----------------------------------------
  async updateMetas({state, commit}, data={}) {
    // Check Necessary
    if(_.isMatchWith(state.meta, data, _.isEqual)) {
      return
    }

    // Do the update
    
    let json = JSON.stringify(data)
    let th_set = state.meta.th_set
    let th_id  = state.meta.id
    let cmdText = `thing ${th_set} update ${th_id} -fields -cqn`
    let reo = await Wn.Sys.exec2(cmdText, {input:json, as:"json"})

    commit("setMeta", reo)
  },
  //--------------------------------------------
  // Reload & Save
  //--------------------------------------------
  // async setCurrent({state, commit,dispatch}, {
  //   meta=null, force=false
  // }={}) {
  //   //console.log("setCurrent", meta, loadContent)

  //   // Not need to reload
  //   if(state.meta && meta && state.meta.id == meta.id) {
  //     if((_.isString(state.content)) && !force) {
  //       return
  //     }
  //   }

  //   // do reload
  //   await dispatch("reload", meta)

  // },
  //----------------------------------------
  async save({state, commit}) {
    if(state.status.saving || !state.status.changed){
      return
    }

    commit("setStatus", {saving:true})

    let meta = state.meta
    let content = state.content
    let newMeta = await Wn.Io.saveContentAsText(meta, content)

    commit("setStatus", {saving:false})
    commit("setMeta", newMeta)
    commit("setSavedContent", content)
    commit("syncStatusChanged")

    // return the new meta
    return newMeta
  },
  //----------------------------------------
  async reload({state, commit, dispatch}, meta) {
    if(state.status.reloading
      || state.status.saving){
      return
    }
    //......................................
    // Use the default meta
    if(_.isUndefined(meta)) {
      meta = state.meta
    }
    //......................................
    if(_.isString(meta)) {
      meta = await Wn.Io.loadMeta(meta)
    }
    //......................................
    // Guard
    if(!meta) {
      commit("setMeta", null)
      commit("setContent", null)
      return
    }
    // Init content as null
    let content = null
    commit("setStatus", {reloading:true})
    //......................................
    // For file
    if("FILE" == meta.race) {
      // need to be reload content
      content = await Wn.Io.loadContent(meta)
    }
    //......................................
    // For dir
    else if('DIR' == meta.race) {
      content = await Wn.Io.loadChildren(meta)
    }
    //......................................
    // Just update the meta
    commit("setStatus", {reloading:false})
    commit("setMeta", meta)
    // Update content and sync state
    dispatch("updateContent", content)
  }
  //----------------------------------------
}
Ti.Preload("ti/mod/wn/obj-current/m-obj-current-actions.mjs", _M);
})();
//============================================================
// JOIN: wn/obj-current/m-obj-current.json
//============================================================
Ti.Preload("ti/mod/wn/obj-current/m-obj-current.json", {
  "meta" : null,
  "content" : null,
  "data" : null,
  "__saved_content" : null,
  "status" : {
    "changed"   : false,
    "saving"    : false,
    "reloading" : false
  },
  "fieldStatus" : {}
});
//============================================================
// JOIN: wn/obj-current/m-obj-current.mjs
//============================================================
(function(){
const _M = {
  ////////////////////////////////////////////
  mutations : {
    //----------------------------------------
    setMeta(state, meta) {
      state.meta = meta
    },
    //--------------------------------------------
    assignMeta(state, meta) {
      state.meta = _.assign({}, state.meta, meta);
    },
    //--------------------------------------------
    mergeMeta(state, meta) {
      state.meta = _.merge({}, state.meta, meta);
    },
    //----------------------------------------
    setContent(state, content) {
      let meta = state.meta;
      // Guard
      if(!meta || Ti.Util.isNil(content)) {
        state.content = null
        state.data = null
        state.__saved_content = null
        state.status.changed = false
        return
      }
      //......................................
      // DIR
      if("DIR" == meta.race) {
        state.content = null
        state.__saved_content = null
        state.data = content
      }
      //......................................
      // File
      else if("FILE" == meta.race) {
        //....................................
        // String content
        if(_.isString(content)) {
          state.content = content
          // JSON
          if(Wn.Util.isMimeJson(meta.mime)) {
            try{
              state.data = JSON.parse(content)
            } catch(E) {
              state.data = null
            }
          }
          // Pure Text
          else if(Wn.Util.isMimeText(meta.mime)) {
            state.data = null
          }
        }
        //....................................
        // Take content as plain object or Array
        else {
          state.content = JSON.stringify(content, null, '  ')
          // JSON
          if(Wn.Util.isMimeJson(meta.mime)) {
            state.data = content
          }
          // Pure Text
          else if(Wn.Util.isMimeText(meta.mime)) {
            state.data = null
          }
        }
        //....................................
      }
    },
    //----------------------------------------
    setData(state, data) {
      state.data = data
    },
    //----------------------------------------
    setSavedContent(state, content) {
      state.__saved_content = content
    },
    //----------------------------------------
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    //----------------------------------------
    syncStatusChanged(state){
      if(Ti.Util.isNil(state.content) && Ti.Util.isNil(state.__saved_content)) {
        state.status.changed = false
      } else {
        state.status.changed = !_.isEqual(state.content, state.__saved_content)
      }
    },
    //----------------------------------------
    setFieldStatus(state, {name, type, text}={}) {
      if(name){
        let ukey = _.concat(name).join("-")
        Vue.set(state.fieldStatus, ukey, {type, text})
      }
    },
    //----------------------------------------
    clearFieldStatus(state, names=[]) {
      // Clean All
      if(_.isEmpty(names)) {
        state.fieldStatus = {}
      }
      // Clear one
      else {
        state.fieldStatus = _.omit(state.fieldStatus, names)
      }
    },
    //----------------------------------------
  }
  ////////////////////////////////////////////
}
Ti.Preload("ti/mod/wn/obj-current/m-obj-current.mjs", _M);
})();
//============================================================
// JOIN: wn/obj-current/_mod.json
//============================================================
Ti.Preload("ti/mod/wn/obj-current/_mod.json", {
  "name" : "wn-obj-current",
  "namespaced" : true,
  "state" : "./m-obj-current.json",
  "actions" : "./m-obj-current-actions.mjs",
  "mixins" : "./m-obj-current.mjs"
});
//============================================================
// JOIN: wn/obj-meta/m-obj-meta-actions.mjs
//============================================================
(function(){
const _M = {
  //--------------------------------------------
  async updateMeta({state, commit}, {name, value}={}) {
    //console.log("I am update", name, value)
    let data = Ti.Types.toObjByPair({name, value})

    // Check Necessary
    if(_.isMatchWith(state.meta, data, _.isEqual)) {
      return
    }

    // Do the update
    commit("setStatus", {saving:true})
    commit("setFieldStatus", {name, status:"spinning"})
    let json = JSON.stringify(data)
    let oid = state.meta.id
    let cmdText = `obj 'id:${oid}' -ocqn -u`
    let newMeta = await Wn.Sys.exec2(cmdText, {input:json, as:"json"})

    commit("setMeta", newMeta)
    commit("clearFieldStatus", name)
    commit("setStatus", {saving:false})

    return newMeta
  },
  //--------------------------------------------
  /***
   * Get obj by ID
   */
  async loadMetaById({dispatch}, id) {
    dispatch("loadMeta", `id:${id}`)
  },
  //--------------------------------------------
  /***
   * Get obj meta by path string
   */
  async loadMeta({state, commit}, str){
    // If wihtout ID reset
    if(!str) {
      commit("reset")
    }
    // Load from server
    else {
      commit("setStatus", {reloading:true})
      let meta = await Wn.Io.loadMeta(str)
      commit("setMeta", meta)
      commit("setStatus", {reloading:false})
    }
  },
  //--------------------------------------------
  /***
   * Get obj ancestors by meta
   */
  async loadAncestors({state, commit}, meta=state.meta) {
    commit("setStatus", {reloading:true})
    let ancestors = await Wn.Io.loadAncestors("id:"+meta.id)
    let parent = _.last(ancestors)
    commit("setMeta", meta)
    commit("setParent", parent)
    commit("setAncestors", ancestors)
    commit("setStatus", {reloading:false})
  },
  //--------------------------------------------
  /***
   * Load obj meta/ancestors/children/content
   * 
   * @param str{String|Object} : string as the path,
   *        object is the meta
   */
  async reload({state, dispatch}, str) {
    if(_.isString(str)) {
      await dispatch("loadMeta", str)
      await dispatch("loadAncestors")
    }
    // Object as the meta object
    else if(_.isPlainObject(str)) {
      await dispatch("loadAncestors", str)
    }
    // return the curent meta anyway
    return state.meta
  }
  //--------------------------------------------
}
Ti.Preload("ti/mod/wn/obj-meta/m-obj-meta-actions.mjs", _M);
})();
//============================================================
// JOIN: wn/obj-meta/m-obj-meta.json
//============================================================
Ti.Preload("ti/mod/wn/obj-meta/m-obj-meta.json", {
  "ancestors" : [], 
  "parent" : null, 
  "meta": null,
  "status" : {
    "changed"   : false,
    "saving"    : false,
    "reloading" : false
  },
  "fieldStatus" : {}
});
//============================================================
// JOIN: wn/obj-meta/m-obj-meta.mjs
//============================================================
(function(){
const _M = {
  ////////////////////////////////////////////////
  getters : {
    //-------------------------------------------
    get(state){return state},
    //-------------------------------------------
    getHome(state) {
      let obj = state.meta
      let ans = state.ancestors
      if(!_.isEmpty(ans)) {
        // for /home/xiaobai
        if(1 == ans.length) {
          if("home" == ans[0].nm) {
            return obj
          }
        }
        // for /home/xiaobai/path/to/file
        if("home" == ans[0].nm) {
          return ans[1]
        }
      }
      // for /root
      else if(obj && "root" == obj.nm) {
        return obj
      }
      // Dont't known how to find the home
      return null
    },
    //-------------------------------------------
    hasParent (state) {
      // console.log(state.ancestors)
      // console.log(state.parent)
      return state.parent ? true : false
    },
    //-------------------------------------------
    parentIsHome(state) {
      if(!_.isEmpty(state.ancestors) && state.parent && state.meta) {
        if(/^\/home\//.test(state.meta.ph)) {
          return state.parent.pid == state.ancestors[0].id
        }
      }
      return false
    },
    //-------------------------------------------
    isHome (state) {
      if(!_.isEmpty(state.ancestors) && state.meta) {
        if(/^\/home\//.test(state.meta.ph)) {
          return state.meta.pid == state.ancestors[0].id
        }
      }
      return false
    }
    //-------------------------------------------
  },
  ////////////////////////////////////////////////
  mutations : {
    //-------------------------------------------
    reset(state) {
      _.assign(state, {
        "ancestors" : [], 
        "parent" : null, 
        "meta": null,
        "status" : {
          "changed"   : false,
          "saving"    : false,
          "reloading" : false
        },
        "fieldStatus" : {}
      })
    },
    //-------------------------------------------
    setAncestors(state, ancestors=[]) {
      state.ancestors = _.concat(ancestors)
    },
    //-------------------------------------------
    setParent(state, parent) {
      state.parent = parent
    },
    //-------------------------------------------
    setMeta(state, meta) {
      state.meta = meta
    },
    //------------------------------------------
    setFieldStatus(state, {name, message, status}={}) {
      if(name){
        let st = status ? {status, message} : null
        let ukey = _.concat(name).join("-")
        Vue.set(state.fieldStatus, ukey, st)
      }
    },
    //------------------------------------------
    clearFieldStatus(state, names=[]) {
      // Clean All
      if(_.isEmpty(names)) {
        state.fieldStatus = {}
      }
      // Clear one
      else {
        state.fieldStatus = _.omit(state.fieldStatus, names)
      }
    },
    //------------------------------------------
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    }
    //-------------------------------------------
  }
  ////////////////////////////////////////////////
}
Ti.Preload("ti/mod/wn/obj-meta/m-obj-meta.mjs", _M);
})();
//============================================================
// JOIN: wn/obj-meta/_mod.json
//============================================================
Ti.Preload("ti/mod/wn/obj-meta/_mod.json", {
  "state" : "./m-obj-meta.json",
  "actions" : "./m-obj-meta-actions.mjs",
  "mixins" : "./m-obj-meta.mjs"
});
//============================================================
// JOIN: wn/session/m-session.json
//============================================================
Ti.Preload("ti/mod/wn/session/m-session.json", {
  "id"     : null,
  "grp"    : null,
  "du"     : -1,
  "expi"   : 0,
  "pwd"    : "~",
  "ticket" : null,
  "uid"    : null,
  "unm"    : null,
  "me"     : null,
  "envs"   : {}
});
//============================================================
// JOIN: wn/session/m-session.mjs
//============================================================
(function(){
////////////////////////////////////////////////
const _M = {
  getters : {
    get(state){return state}
  },
  ////////////////////////////////////////////////
  mutations : {
    set(state, session={}) {
      state.id     = session.id;
      state.grp    = session.grp;
      state.du     = session.du;
      state.expi   = session.expi;
      state.pwd    = session.pwd;
      state.ticket = session.ticket;
      state.uid    = session.uid;
      state.unm    = session.unm;
      state.me     = session.me;
      state.envs   = _.cloneDeep(session.envs);
    }
  },
  ////////////////////////////////////////////////
  actions : {
    reload() {
      // TODO 这里需要想想，如何刷新会话，得到新票据的问题
      _.delay(()=>{
        console.log("hahah")
      }, 1000)
    }
  }
  ////////////////////////////////////////////////
}
////////////////////////////////////////////////
Ti.Preload("ti/mod/wn/session/m-session.mjs", _M);
})();
//============================================================
// JOIN: wn/session/_mod.json
//============================================================
Ti.Preload("ti/mod/wn/session/_mod.json", {
  "state" : "./m-session.json",
  "mixins" : ["./m-session.mjs"]
});
//============================================================
// JOIN: wn/thing/m-thing-actions.mjs
//============================================================
(function(){
const _M = {
  //--------------------------------------------
  /***
   * Save current thing detail
   */
  async saveCurrent({commit, dispatch}) {
    commit("setStatus", {saving:true})
    await dispatch("current/save")
    commit("setStatus", {saving:false})
    commit("syncStatusChanged")
  },
  //--------------------------------------------
  /***
   * Update current thing meta data to search/meta
   */
  async updateCurrent({state, commit, dispatch, getters}, {name, value}={}) {
    if(getters.hasCurrent) {
      await dispatch("current/updateMeta", {name,value})
      commit("search/updateItem", state.current.meta)
    }
  },
  //--------------------------------------------
  async updateCurrentMetas({state, commit, dispatch, getters}, data={}) {
    if(getters.hasCurrent) {
      //console.log({name, value})
      await dispatch("current/updateMetas", data)
      commit("search/updateItem", state.current.meta)
    }
  },
  //--------------------------------------------
  setCurrentMeta({state, commit}, meta) {
    console.log(" -> setCurrentMeta", meta)
    commit("current/assignMeta", meta)
    commit("syncStatusChanged")
    commit("search/updateItem", state.current.meta)
  },
  //--------------------------------------------
  setCurrentContent({state, commit, dispatch}, content) {
    dispatch("current/onChanged", content)
    commit("syncStatusChanged")
    commit("search/updateItem", state.current.meta)
  },
  //--------------------------------------------
  /***
   * Files: sync the file count and update to search/meta
   */
  async autoSyncCurrentFilesCount({state, commit}) {
    let oTh = state.current.meta
    let dirName = state.currentDataDir
    // sync current media count
    if(oTh && oTh.id && dirName) {
      // run command
      let th_set = oTh.th_set
      let cmdText = `thing ${th_set} ${dirName} ${oTh.id} -ufc -cqn`
      let oNew = await Wn.Sys.exec2(cmdText, {as:"json"})
      // Set current meta
      commit("current/setMeta", oNew)
      // Set current to search list
      commit("search/updateItem", oNew)
    }
  },
  //--------------------------------------------
  /***
   * Toggle enter/outer RecycleBin
   */
  async toggleInRecycleBin({state, commit, dispatch, getters}) {
    //console.log("thing-manager-toggleInRecycleBin")
    // Update filter
    let th_live = state.search.filter.th_live == -1 ? 1 : -1
    commit("search/updateFilter", {th_live})
    // Update status
    let inRecycleBin = getters.isInRecycleBin
    commit("setStatus", {inRecycleBin, reloading:true})
    // Reload List
    await dispatch("search/reload")

    commit("setStatus", {reloading:false})
  },
  //--------------------------------------------
  /***
   * Create one new thing
   */
  async create({state, commit, dispatch}, obj={}) {
    // Prepare the command
    let json = JSON.stringify(obj)
    let th_set = state.meta.id
    let cmdText = `thing ${th_set} create -cqn -fields`

    // Do Create
    let newMeta = await Wn.Sys.exec2(cmdText, {input:json, as:"json"})

    // Set it as current
    await dispatch("current/reload", newMeta)

    // Append To Search List as the first 
    commit("search/prependToList", newMeta)
    commit("search/selectItem", newMeta.id)

    // Return the new object
    return newMeta
  },
  //--------------------------------------------
  /***
   * Search: Remove Checked Items
   */
  async removeChecked({state, commit, dispatch, getters}, hard=false) {
    //console.log("removeChecked", hard)
    let ids = state.search.checkedIds
    if(_.isEmpty(ids)) {
      return await Ti.Alert('i18n:del-none')
    }

    commit("setStatus", {deleting:true})

    // Prepare the cmds
    let th_set = state.meta.id
    let cmdText = `thing ${th_set} delete ${hard?"-hard":""} -cqn -l ${ids.join(" ")}`
    let reo = await Wn.Sys.exec2(cmdText, {as:"json"})

    // Remove it from search list
    commit("search/removeItems", state.search.checkedIds)
    let current = getters["search/currentItem"]
    //console.log("getback current", current)
    // Update current
    await dispatch("current/reload", current)

    commit("setStatus", {deleting:false})
  },
  //--------------------------------------------
  /***
   * RecycleBin: restore
   */
  async restoreRecycleBin({state, commit, dispatch, getters}) {
    // Require user to select some things at first
    let ids = state.search.checkedIds
    if(_.isEmpty(ids)) {
      return await Ti.Alert('i18n:thing-restore-none')
    }
    commit("setStatus", {restoring:true})

    // Run command
    let th_set = state.meta.id
    let cmdText = `thing ${th_set} restore -quiet -cqn -l ${ids.join(" ")}`
    let reo = await Wn.Sys.exec2(cmdText, {as:"json"})

    // Reload
    await dispatch("search/reload")

    // Get back current
    let current = getters["search/currentItem"]
    
    // Update current
    await dispatch("current/reload", current)

    commit("setStatus", {restoring:false})
  },
  //--------------------------------------------
  /***
   * RecycleBin: clean
   */
  async cleanRecycleBin({state, commit, dispatch}) {
    commit("setStatus", {cleaning:true})

    // Run command
    let th_set = state.meta.id
    let cmdText = `thing ${th_set} clean -limit 3000`
    await Wn.Sys.exec2(cmdText)

    commit("setStatus", {cleaning:false})

    await dispatch("reload")
  },
  //--------------------------------------------
  /***
   * Reload files
   */
  async reloadFiles({state,commit,dispatch, getters}, {force=false}={}) {
    //console.log("reloadFiles")
    let current = _.get(state.current, "meta")
    let thingId = _.get(current, "id")
    let dirName = state.filesName
    // No current
    if(!thingId || !dirName) {
      commit("files/reset")
    }
    // Reload the files
    else {
      let thSetId = state.meta.id
      // get the parent DIR
      let oDir = state.files.meta
      if(!oDir || !oDir.ph || !oDir.ph.endsWith(`/data/${thingId}/${dirName}`)) {
        let dataHome = `id:${thSetId}/data`
        let dirPath = `${thingId}/${dirName}`
        // Create or fetch the dir
        let newMeta = {
          race : "DIR",
          nm   : dirPath
        }
        let json = JSON.stringify(newMeta)
        let cmdText = `obj "${dataHome}" -IfNoExists -new '${json}' -cqno`
        oDir = await Wn.Sys.exec2(cmdText, {as:"json"})
        if(!oDir) {
          return 
        }
      } // ~ if(!oDir || !oDir.ph
      // Try to reload the children
      await dispatch("files/reload", oDir)
      // let cuId = getters["files/autoCurrentItemId"]
      // //commit("files/selectItem", cuId)
      // dispatch("selectCurrentPreviewItem", cuId)
    }
  },
  //--------------------------------------------
  /***
   * Reload search list
   */
  async reloadSearch({state, commit, dispatch}) {
    let meta = state.meta

    commit("setStatus", {reloading:true})

    await dispatch("search/reload", meta)

    // Sometimes, current object will not in the list
    // we need remove it
    if(state.current.meta) {
      // find new meta
      let currentId = state.current.meta.id
      let current = null
      for(let it of state.search.list) {
        if(it.id == currentId) {
          current = it
          break
        }
      }
      // Update the meta
      await dispatch("setCurrentThing", {meta : current})
    }

    commit("setStatus", {reloading:false})
  },
  //--------------------------------------------
  /***
   * Set Current Thing
   * 
   * It will load content if "content" is shown
   */
  async setCurrentThing({state, commit, dispatch}, {
    meta=null, 
    checkedIds={}
  }={}) {
    //..........................................
    // Reload Current
    await dispatch("current/reload", meta)
    //..........................................
    // Update selected item in search list
    let curId = meta ? meta.id : null
    let ckIds = Ti.Util.truthyKeys(checkedIds)
    if(!Ti.Util.isNil(curId)) {
      ckIds.push(curId)
    }
    commit("search/setCurrentId", curId)
    commit("search/setCheckedIds", ckIds)
    //..........................................
    // Update the currentDataHome
    let home = state.meta
    let dataHome = curId ? `id:${home.id}/data/${curId}` : null
    commit("setCurrentDataHome", dataHome)
    //..........................................
  },
  //--------------------------------------------
  /***
   * Do Change Block Shown:
   * 
   * If show content/files, it may check if need to be reload data
   */
  async doChangeShown({state, commit, dispatch}, shown) {
    // Just mark the shown
    dispatch("config/updateShown", shown)
  },
  //--------------------------------------------
  /***
   * Reload All
   */
  async reload({state, commit, dispatch}, meta) {
    //console.log("thing-manager.reload", state)
    // Update New Meta
    if(meta) {
      commit("setMeta", meta)
    }
    // Get meta back
    else {
      meta = state.meta
    }
    // Mark reloading
    commit("setStatus", {reloading:true})

    // Reload Config
    //console.log("reload config")
    await dispatch("config/reload", meta)

    // Reload Search
    //console.log("reload search")
    await dispatch("reloadSearch")

    // Auto Select the first item
    if(_.get(state, "meta.th_auto_select")) {
      if(!state.current.meta && !_.isEmpty(state.search.list)) {
        let current = state.search.list[0]
        await dispatch("setCurrentThing", {
          meta : current, 
          force : false
        })
      }
    }

    // All done
    commit("setStatus", {reloading:false})
  }
  //--------------------------------------------
}
Ti.Preload("ti/mod/wn/thing/m-thing-actions.mjs", _M);
})();
//============================================================
// JOIN: wn/thing/m-thing.json
//============================================================
Ti.Preload("ti/mod/wn/thing/m-thing.json", {
  "meta": null,
  "currentDataDir"  : "media",
  "currentDataHome" : null,
  "status" : {
    "reloading" : false,
    "doing"     : false,
    "saving"    : false,
    "deleting"  : false,
    "changed"   : false,
    "restoring" : false,
    "cleaning"  : false,
    "inRecycleBin" : false
  }
});
//============================================================
// JOIN: wn/thing/m-thing.mjs
//============================================================
(function(){
//---------------------------------------
const _M = {
  ////////////////////////////////////////////
  getters : {
    hasCurrent(state) {
      return state.current && state.current.meta
    },
    isInRecycleBin(state) {
      return state.search.filter.th_live == -1
    }
  },
  ////////////////////////////////////////////
  mutations : {
    setMeta(state, meta) {
      state.meta = meta
    },
    setCurrentDataDir(state, dirName) {
      state.currentDataDir = dirName
    },
    setCurrentDataHome(state, dataHome) {
      state.currentDataHome = dataHome
    },
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    syncStatusChanged(state){
      if(state.current) {
        //console.log("do sync")
        state.status.changed = state.current.status.changed
      }
    }
  }
  ////////////////////////////////////////////
}
Ti.Preload("ti/mod/wn/thing/m-thing.mjs", _M);
})();
//============================================================
// JOIN: wn/thing/mod/config/m-thing-config-actions.mjs
//============================================================
(function(){
// Ti required(Wn)
////////////////////////////////////////////////
const _M = {
  //----------------------------------------
  updateShown({commit}, shown) {
    commit("mergeShown", shown)
    commit("persistShown")
  },
  //----------------------------------------
  async reloadSchema({state, commit}) {
    //console.log("reloadSchema")
    let aph  = `id:${state.meta.id}/thing-schema.json`
    let obj  = await Wn.Io.loadMeta(aph)
    let schema = await Wn.Io.loadContent(obj, {as:"json"})

    // Load extends methods
    if(schema.methods) {
      let methods = await Ti.Load(schema.methods)
      if(!_.isArray(methods)) {
        methods = [methods]
      }
      schema.methods = methods
    }
    //console.log("setSchema", schema)
    commit("setSchema", schema)
    return schema
  },
  //----------------------------------------
  async reloadLayout({state, commit}) {
    //console.log("reloadLayout")
    let aph  = `id:${state.meta.id}/thing-layout.json`
    let obj  = await Wn.Io.loadMeta(aph)
    let json = await Wn.Io.loadContent(obj, {as:"json"})

    //console.log("setLayout", json)
    commit("setLayout", json)

    // Load shown from local before reload config
    commit("restoreShown")

    return json
  },
  //----------------------------------------
  async reloadActions({state, commit}) {
    // console.log("reloadActions")
    let aph  = `id:${state.meta.id}/thing-actions.json`
    let obj  = await Wn.Io.loadMeta(aph)
    let json = await Wn.Io.loadContent(obj, {as:"json"})
    //console.log("setActions", json)
    commit("setActions", json)
    return json
  },
  //----------------------------------------
  async reload({state, commit, dispatch}, meta) {
    //console.log("thing-manager-config.reload", state)
    // Update New Meta
    if(meta) {
      commit("setMeta", meta)
    }
    // Get meta back
    else {
      meta = state.meta
    }
    // Mark reloading
    commit("setStatus", {reloading:true})

    await dispatch("reloadSchema")
    await dispatch("reloadLayout")
    await dispatch("reloadActions")

    // All done
    commit("setStatus", {reloading:false})
  }
  //----------------------------------------
}
Ti.Preload("ti/mod/wn/thing/mod/config/m-thing-config-actions.mjs", _M);
})();
//============================================================
// JOIN: wn/thing/mod/config/m-thing-config.json
//============================================================
Ti.Preload("ti/mod/wn/thing/mod/config/m-thing-config.json", {
  "meta": null,
  "shown" : {
    "search"  : true,
    "meta"    : true,
    "content" : true,
    "files"   : false
  },
  "listOpen" : {
    "content" : true
  },
  "schema": {},
  "layout" : {
    "deskstop" : {},
    "tablet" : {},
    "phone" : {}
  },
  "actions" : [],
  "status" : {
    "reloading" : false,
    "saving"    : false
  }
});
//============================================================
// JOIN: wn/thing/mod/config/m-thing-config.mjs
//============================================================
(function(){
//---------------------------------------
const _M = {
  ////////////////////////////////////////////
  mutations : {
    setMeta(state, meta) {
      state.meta = meta
    },
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    setSchema(state, schema) {
      state.schema = schema
    },
    setLayout(state, layout) {
      state.layout = _.pick(layout, ["desktop","tablet","phone"])
      state.shown = layout.shown || {}
      state.listOpen = layout.listOpen || {}
    },
    setActions(state, actions) {
      state.actions = actions
    },
    mergeShown(state, shown) {
      if(shown && !_.isEmpty(shown)) {
        state.shown = _.assign({}, state.shown, shown)
      }
    },
    persistShown(state) {
      if(state.meta && state.meta.id) {
        Ti.Storage.session.setObject(`${state.meta.id}-shown`, state.shown)
      }
    },
    restoreShown(state) {
      if(state.meta && state.meta.id) {
        let shown = Ti.Storage.session.getObject(`${state.meta.id}-shown`)
        state.shown = _.assign({}, state.shown, shown)
      }
    }
  }
  ////////////////////////////////////////////
}
Ti.Preload("ti/mod/wn/thing/mod/config/m-thing-config.mjs", _M);
})();
//============================================================
// JOIN: wn/thing/mod/config/_mod.json
//============================================================
Ti.Preload("ti/mod/wn/thing/mod/config/_mod.json", {
  "namespaced" : true,
  "state" : "./m-thing-config.json",
  "actions" : "./m-thing-config-actions.mjs",
  "mixins" : "./m-thing-config.mjs"
});
//============================================================
// JOIN: wn/thing/mod/search/m-thing-search-actions.mjs
//============================================================
(function(){
// Ti required(Wn)
////////////////////////////////////////////////
const _M = {
  //--------------------------------------------
  async reloadPage({state, commit, dispatch}, pg) {
    commit("updatePager", pg)
    await dispatch("reload")
  },
  //--------------------------------------------
  async reload({state, commit}, meta) {
    //console.log("thing-manager-search.reload", meta)
    // Update New Meta
    if(meta) {
      commit("setMeta", meta)
    }
    // Get meta back
    else {
      meta = state.meta
    }
    // Mark reloading
    commit("setStatus", {reloading:true})

    let cmds = [`thing id:${meta.id} query -pager -cqn`]
    // Eval Sorter
    if(!_.isEmpty(state.sorter)) {
      let sort = JSON.stringify(state.sorter)
      cmds.push(`-sort '${sort}'`)
    }
    // Eval Pager
    let pg = state.pager
    if(!_.isEmpty(pg) && pg.pgsz > 0 && pg.pn > 0) {
      let limit = pg.pgsz
      let skip  = pg.pgsz * (pg.pn - 1)
      cmds.push(`-limit ${limit}`)
      cmds.push(`-skip  ${skip}`)
    }
    // Eval Filter
    let flt = {}
    if(!_.isEmpty(state.filter)) {
      _.forEach(state.filter, (val, key)=>{
        if(!_.isNull(val)) {
          flt[key] = val
        }
      })
    }
    // Run Command
    let input = _.isEmpty(flt) ? undefined : JSON.stringify(flt)
    let cmdText = cmds.join(" ")
    let reo = await Wn.Sys.exec2(cmdText, {input, as:"json"})
    
    // All done
    commit("setPager", reo.pager)
    commit("setList", reo.list)
    commit("setStatus", {reloading:false})
  }
  //--------------------------------------------
}
Ti.Preload("ti/mod/wn/thing/mod/search/m-thing-search-actions.mjs", _M);
})();
//============================================================
// JOIN: wn/thing/mod/search/m-thing-search.json
//============================================================
Ti.Preload("ti/mod/wn/thing/mod/search/m-thing-search.json", {
  "meta": null,
  "filter" : {},
  "sorter" : {
    "ct" : -1
  },
  "pager" : {
    "pn"   : 1,
    "pgsz" : 50,
    "pgc"  : 0,
    "sum"  : 0,
    "skip" : 0,
    "count": 0
  },
  "currentId" : null,
  "checkedIds" : [],
  "list" : [],
  "status" : {
    "reloading" : false,
    "saving"    : false,
    "deleting"  : false
  }
});
//============================================================
// JOIN: wn/thing/mod/search/m-thing-search.mjs
//============================================================
(function(){
//---------------------------------------
const _M = {
  ////////////////////////////////////////////
  getters : {
    //---------------------------------------------------
    currentItem(state) {
      if(state.currentId) {
        for(let it of state.list) {
          if(it.id == state.currentId) {
            return it
          }
        }
      }
      return null
    },
    //---------------------------------------------------
    checkedItems(state) {
      // Make the idsMap
      let checkedMap = {}
      for(let id of state.checkedIds) {
        checkedMap[id] = true
      }
      // Join the items
      let list = []
      for(let it of state.list) {
        if(checkedMap[it.id]) {
          list.push(it)
        }
      }
      // done
      return list
    }
    //---------------------------------------------------
  },
  ////////////////////////////////////////////
  mutations : {
    setMeta(state, meta) {
      state.meta = meta
    },
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    setFilter(state, filter={}) {
      state.filter = filter
    },
    updateFilter(state, flt={}) {
      //console.log("updateFilter", JSON.stringify(flt))
      state.filter = _.assign({}, state.filter, flt)
    },
    setSorter(state, sorter) {
      state.sorter = sorter
    },
    setPager(state, pager) {
      state.pager = pager
    },
    updatePager(state, pg) {
      state.pager = _.defaults({}, pg, state.pager)
    },
    setList(state, list) {
      state.list = list
    },
    //---------------------------------------------------
    setCurrentId(state, id) {
      state.currentId = id || null
    },
    //---------------------------------------------------
    setCheckedIds(state, ids=[]) {
      state.checkedIds = ids
    },
    //---------------------------------------------------
    selectItem(state, id) {
      if(state.currentId != id) {
        state.currentId = id
        state.checkedIds = []
        if(id) {
          state.checkedIds.push(id)
        }
      }
    },
    //---------------------------------------------------
    removeItems(state, ids=[]) {
      // Find the current item index, and take as the next Item index
      let index = -1
      if(state.currentId) {
        for(let i=0; i<state.list.length; i++) {
          let it = state.list[i]
          if(it.id == state.currentId) {
            index = i
            break
          }
        }
      }
      // Make the idsMap
      let idsMap = {}
      for(let id of ids) {
        idsMap[id] = true
      }
      // Remove the ids
      let list2 = []
      for(let it of state.list) {
        if(!idsMap[it.id]) {
          list2.push(it)
        }
      }
      // Then get back the current
      index = Math.min(index, list2.length-1)
      let nextCurrent = null
      if(index >= 0) {
        nextCurrent = list2[index]
        state.currentId = nextCurrent.id
        state.checkedIds = [nextCurrent.id]
      }
      // No currentId
      else {
        state.currentId  = null
        state.checkedIds = []
      }
      // Reset the list
      state.list = list2
      if(state.pager) {
        state.pager.count = list2.length
        state.pager.sum = state.pager.pgsz * (state.pager.pgc-1) + list2.length
      }
      // console.log("the next current", nextCurrent)
    },
    //---------------------------------------------------
    updateItem(state, it) {
      let list = []
      for(let li of state.list) {
        if(li.id == it.id) {
          list.push({...it, __updated_time:Date.now()})
        } else {
          list.push(li)
        }
      }
      state.list = list
    },
    //---------------------------------------------------
    appendToList(state, it) {
      if(it) {
        state.list = [].concat(state.list, it)
      }
    },
    //---------------------------------------------------
    prependToList(state, it) {
      if(it) {
        state.list = [].concat(it, state.list)
      }
    }
    //---------------------------------------------------
  }
  ////////////////////////////////////////////
}
Ti.Preload("ti/mod/wn/thing/mod/search/m-thing-search.mjs", _M);
})();
//============================================================
// JOIN: wn/thing/mod/search/_mod.json
//============================================================
Ti.Preload("ti/mod/wn/thing/mod/search/_mod.json", {
  "namespaced" : true,
  "state" : "./m-thing-search.json",
  "actions" : "./m-thing-search-actions.mjs",
  "mixins" : "./m-thing-search.mjs"
});
//============================================================
// JOIN: wn/thing/_mod.json
//============================================================
Ti.Preload("ti/mod/wn/thing/_mod.json", {
  "name" : "wn-thing",
  "namespaced" : true,
  "state" : "./m-thing.json",
  "actions" : "./m-thing-actions.mjs",
  "mixins" : "./m-thing.mjs",
  "modules" : {
    "config" : "./mod/config",
    "search" : "./mod/search",
    "current" : "@mod:wn/obj-current"
  }
});
//============================================================
// JOIN: com/site-main.html
//============================================================
Ti.Preload("ti/lib/www/com/site-main.html", `<div class="site-main">
  <ti-gui 
    class="site-page"
    v-bind="PageGUI"
    :loading-as="loading"
    :shown="page.shown"/>
  <!--pre>{{page}}</pre-->
</div>`);
//============================================================
// JOIN: com/site-main.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  computed : {
    ...Vuex.mapState({
        "siteId"     : state=>state.siteId,
        "logo"       : state=>state.logo,
        "utils"      : state=>state.utils,
        "page"       : state=>state.page,
        "auth"       : state=>state.auth,
        "domain"     : state=>state.domain,
        "base"       : state=>state.base,
        "apiBase"    : state=>state.apiBase,
        "cdnBase"    : state=>state.cdnBase,
        "captcha"    : state=>state.captcha,
        "schema"     : state=>state.schema,
        "blocks"     : state=>state.blocks,
        "loading"    : state=>state.loading,
        "isReady"    : state=>state.isReady
      }),
    //-------------------------------------
    // Mapp The Getters
    ...Vuex.mapGetters([
      "actions",
      "getUrl",
      "getApiUrl"
    ]),
    ...Vuex.mapGetters("page", [
      "pageLink"
    ]),
    //-------------------------------------
    SiteLogo() {
      if(this.logo && /\.(png|jpe?g)$/.test(this.logo))
        return this.getUrl(this.logo)
      return this.logo || "zmdi-globe"
    },
    //-------------------------------------
    // Page Navigation
    SiteNav() {
      let nav = {}
      _.forEach(this.$store.state.nav, (v, k)=>{
        nav[k] = Ti.WWW.explainNavigation(v, this.base)
      })
      return nav
    },
    //-------------------------------------
    // The template of captcha to prevent robot
    SiteCaptcha() {
      let path = Ti.S.renderBy(this.captcha, {site:this.siteId})
      if(path.startsWith("/"))
        return path
      return this.getApiUrl(path)
    },
    //-------------------------------------
    SiteLoginMode() {
      // Already login, then bind the phone 
      if(this.auth.me) {
        return "bind_phone"
      }
      return "login_by_passwd"
    },
    //-------------------------------------
    PageFnSet() {
      Ti.AddGlobalFuncs(this.utils)
      return Ti.GlobalFuncs()
    },
    //-------------------------------------
    // Format current pageGUI
    PageGUI() {
      let page = this.page
      //.....................................
      // Without current page
      if(!page || !page.layout) {
        return {}
      }
      //.....................................
      // Get layout be pageMode
      let layout = page.layout
      //.....................................
      // Apply "@BLOCK(xxx)" in panels and layout blocks
      if(layout) {
        // Define the methods
        const ExplainBlock = (anyValue)=>{
          // String : Check the "@BLOCK(xxx)" 
          if(_.isString(anyValue)) {
            let m = /^@BLOCK\(([^ ]+)\)$/.exec(anyValue)
            if(m) {
              let blockName = m[1]
              return _.get(this.blocks, blockName)
            }
          }
          // Array 
          else if(_.isArray(anyValue)) {
            return _.map(anyValue, ExplainBlock)  
          }
          // Object
          else if(_.isPlainObject(anyValue)) {
            return _.mapValues(anyValue, ExplainBlock)
          }
          // Others return directly
          return anyValue
        }
        // do without layout
        layout = ExplainBlock(layout)
      }
      //.....................................
      // Gen the GUI object
      let gui = {
        defaultFlex: "none",
        layout, 
        schema : {},
        canLoading : true
      }
     
      //.....................................
      // assign schema
      _.assign(gui.schema, this.schema, page.schema)
      
      //.....................................
      // explain it
      let theGUI = Ti.Util.explainObj(this, gui, {
        fnSet: this.PageFnSet
      })
      //console.log("pageGUI", formedGUI)
      return theGUI
    }
    //-------------------------------------
  },
  /////////////////////////////////////////
  methods : {
    //--------------------------------------
    async showBlock(name) {
      Ti.App(this).dispatch("page/showBlock", name)
    },
    //--------------------------------------
    async hideBlock(name) {
      Ti.App(this).dispatch("page/hideBlock", name)
    },
    //-------------------------------------
    // Handle by EventBubble
    __on_events(name, ...args) {
      console.log("site-main.__on_events", name, ...args)
      // ShowBlock
      if("block:show" == name) {
        return blockName => this.showBlock(blockName)
      }
      // HideBlock
      else if("block:hide" == name) {
        return blockName => this.hideBlock(blockName)
      }
      // Dispatch actions
      else {
        return (...args)=>{
          this.invokeAction(name, args)
        }        
      }
    },
    //-------------------------------------
    async invokeAction(name, args=[]) {
      /*
      The action should like
      {
        action : "xx/xx",
        payload : {} | [] | ...
      } 
      */
      let AT = _.get(this.actions, name)

      // Try fallback
      if(!AT) {
        let canNames = _.split(name, "::")
        while(canNames.length > 1) {
          let [, ...names] = canNames
          let aName = names.join("::")
          AT = _.get(this.actions, aName)
          if(AT){
            break
          }
          canNames = names
        }
      }

      if(!AT)
        return;
  
      // Prepare
      let app = Ti.App(this)

      // Batch call
      if(_.isArray(AT)) {
        for(let a of AT) {
          await app.dispatch("doAction", {
            action  : a.action,
            payload : a.payload,
            args
          })
        }
      }
      // Direct call : String
      else if(_.isString(AT)) {
        await app.dispatch("doAction", {
          action: AT,
          args
        })
      }
      // Direct call : Object
      else {
        await app.dispatch("doAction", {
          action  : AT.action,
          payload : AT.payload,
          args
        })
      }
    },
    //-------------------------------------
    pushBrowserHistory() {
      let his = window.history
      //...................................
      if(!his) {
        return
      }
      //...................................
      // Get current location
      let loc = window.location
      let loPath = [loc.pathname, loc.search, loc.hash].join("")
      //...................................
      let pgLink = this.getUrl(this.pageLink)
      //...................................
      if(loPath != pgLink) {
        his.pushState(this.page, this.page.title, pgLink)
      }
      //...................................
    }
    //-------------------------------------
  },
  /////////////////////////////////////////
  watch : {
    // Page changd, update document title
    "page.finger" : function() {
      let pageTitle = Ti.Util.explainObj(this, this.page.title)
      document.title = pageTitle
      this.pushBrowserHistory()
      // TODO : Maybe here to embed the BaiDu Tongji Code
    },
    "isReady" : function(current, old) {
      //console.log("isReady", old, "->", current)
      if(true === current && false === old) {
        this.invokeAction("@page:ready", {

        })
      }
    }
  },
  /////////////////////////////////////////
  mounted : function(){
    // Watch the browser "Forward/Backward"
    // The state(page) pushed by $store.dispath("navTo")
    window.onpopstate = (evt)=>{
      let page = evt.state
      if(page && page.path) {
        console.log("window.onpopstate", page)
        let app = Ti.App(this)
        app.dispatch("navTo", {
          type   : "page",
          value  : page.path,
          params : page.params,
          anchor : page.anchor
        })
      }
    }
  }
  /////////////////////////////////////////
}
Ti.Preload("ti/lib/www/com/site-main.mjs", _M);
})();
//============================================================
// JOIN: mod/auth/www-mod-auth.json
//============================================================
Ti.Preload("ti/lib/www/mod/auth/www-mod-auth.json", {
  "ticket" : null,
  "expi"   : 0,
  "me"     : null,
  "paths"  : {
    "checkme"         : "auth/checkme",
    "login_by_wxcode" : "auth/login_by_wxcode",
    "login_by_phone"  : "auth/login_by_phone",
    "login_by_passwd" : "auth/login_by_passwd",
    "bind_phone"      : "auth/bind_account",
    "bind_email"      : "auth/bind_account",
    "get_sms_vcode"   : "auth/get_sms_vcode",
    "get_email_vcode" : "auth/get_email_vcode",
    "check_name"      : "auth/check_name",
    "check_phone"     : "auth/check_phone",
    "logout"          : "auth/logout"
  }
});
//============================================================
// JOIN: mod/auth/www-mod-auth.mjs
//============================================================
(function(){
const _M = {
  ////////////////////////////////////////////////
  getters : {
    //--------------------------------------------
    hasSession(state) {
      return !_.isEmpty(state.ticket)
             && state.expi > Date.now()
             && !_.isEmpty(state.me)
    },
    //--------------------------------------------
    sessionState(state, getters) {
      return {
        ok : getters.hasSession,
        data : {
          me     : state.me     || null,
          ticket : state.ticket || null,
          expi   : state.expi   || 0
        }
      }
    },
    //--------------------------------------------
    urls(state, getters, rootState, rootGetters) {
      let map = {}
      _.forEach(state.paths, (ph, key)=>{
        map[key] = rootGetters.getApiUrl(ph)
      })
      return map
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  mutations : {
    //--------------------------------------------
    setTicket(state, ticket) {
      state.ticket = ticket
    },
    //--------------------------------------------
    setExpi(state, expi) {
      state.expi = expi
    },
    //--------------------------------------------
    setMe(state, me) {
      state.me = me
    },
    //--------------------------------------------
    setPaths(state, paths) {
      _.assign(state,paths, paths)
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  actions : {
    //--------------------------------------------
    async doCheckMe({state, commit, dispatch, getters, rootState}, {
      force = false,
      success, fail, nophone
    }={}) {
      console.log("I am doCheckMe", {force, success, fail, nophone})
      // console.log(" -urls", getters.urls)
      // Guard SiteId
      let siteId  = rootState.siteId
      if(!siteId) {
        Ti.Alert("Without siteId!!!")
        return
      }

      // Get Back the Ticket
      let ticket = Ti.Storage.local.getString(`www-ticket-${siteId}`, "")

      // Check to remote
      commit("setLoading", true, {root:true})
      // Current Session ...
      let reo = getters.sessionState
      // Need to re-checkme from remote
      if(ticket && (force || !reo.ok)) {
        reo = await Ti.Http.get(getters.urls["checkme"], {
          params : {
            site : siteId,
            ticket 
          },
          as : "json"
        })
      }
      commit("setLoading", false, {root:true})
      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      // success
      if(reo.ok) {
        console.log("checkme OK", reo)
        commit("setTicket", reo.data.ticket)
        commit("setExpi",   reo.data.expi)
        commit("setMe",     reo.data.me)

        // Check Phone
        if(nophone) {
          let me = reo.data.me
          if(!me.phone) {
            await dispatch(nophone.action, nophone.payload, {root:true})
            return
          }
        }
        // Success
        if(success) {
          await dispatch(success.action, success.payload, {root:true})
        }
      }
      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      // Fail
      else if(fail){
        await dispatch(fail.action, fail.payload, {root:true})
      }
      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    },
    //--------------------------------------------
    async autoCheckmeOrAuthByWxghCode({dispatch}, {
      codeKey = "code",
      force = false,
      fail, nophone
    }={}) {
      dispatch("doCheckMe", {
        force,
        fail : {
          action : "auth/authByWxghCode",
          payload : {
            codeKey,
            //......................................
            fail : ()=>{
              if(fail) {
                dispatch(fail.action, fail.payload, {root:true})
              }
            },
            //......................................
            ok : ({me={}}={})=>{
              if(nophone) {
                if(!me.phone) {
                  dispatch(nophone.action, nophone.payload, {root:true})
                }
              }
            }
            //......................................
          }
        }
      })
    },
    //--------------------------------------------
    async authByWxghCode({commit, getters, rootState}, {
      codeKey = "code",
      done=_.identity,
      ok=_.identity, 
      fail=_.identity, 
      invalid=_.identity, 
      others=_.identity 
    }={}) {
      // Guard code
      let code = rootState.page.params[codeKey]
      if(!code) {
        return
      }

      console.log("authByWxghCode", code)

      // Guard SiteId
      let siteId = rootState.siteId
      if(!siteId) {
        Ti.Alert("Without siteId!!!")
        return
      }
      // Eval URL
      let url = getters.urls["login_by_wxcode"]

      let params = {
        site : siteId,
        code : code
      }

      let reo = await Ti.Http.get(url, {params, as:"json"})
      console.log(reo)

      done(reo)

      // Success
      if(reo.ok && reo.data) {
        // save ticket
        Ti.Storage.local.set(
          `www-ticket-${siteId}`,
          reo.data.ticket
        )
        // Save session info
        commit("setTicket", reo.data.ticket)
        commit("setExpi",   reo.data.expi)
        commit("setMe",     reo.data.me)
        // Callback
        ok(reo.data)
      }
      // Fail 
      else {
        // Fail : invalid
        if(/^e.www.login.invalid/.test(reo.errCode)) {
          invalid(reo)
        }
        // Fail : others
        else {
          others(reo)
        }
        // Callback
        fail(reo)
      }
    },
    //--------------------------------------------
    async doAuth({commit, getters, rootState}, {
      type="login_by_passwd",
      name, passwd,
      done=_.identity,
      ok=_.identity, 
      fail=_.identity, 
      noexist=_.identity, 
      invalid=_.identity, 
      others=_.identity 
    }={}) {
      console.log("doAuth", name, passwd)

      // Guard SiteId
      let siteId = rootState.siteId
      if(!siteId) {
        Ti.Alert("Without siteId!!!")
        return
      }

      // Eval URL
      let url = getters.urls[type]

      // Prepare params
      let ticket = Ti.Storage.local.getString(`www-ticket-${siteId}`, "")
      let passKey = ({
        "login_by_passwd" : "passwd",
        "login_by_phone"  : "vcode",
        "bind_phone"      : "vcode",
        "bind_email"      : "vcode"
      })[type]

      if(!passKey) {
        throw "Unknown auth type: " + type
      }

      let params = {
        site : siteId,
        name, 
        [passKey] : passwd,
        ticket
      }

      // Call Remote
      let reo = await Ti.Http.post(url, {params, as:"json"})
      console.log(reo)

      done(reo)

      // Success
      if(reo.ok && reo.data) {
        // save ticket
        Ti.Storage.local.set(
          `www-ticket-${siteId}`,
          reo.data.ticket
        )
        // Commit session to local
        commit("setTicket", reo.data.ticket)
        commit("setExpi",   reo.data.expi)
        commit("setMe",     reo.data.me)
        // Callback
        ok(reo.data)
      }
      // Fail 
      else {
        // Fail : noexist
        if("e.www.login.noexists" == reo.errCode) {
          noexist(reo)
        }
        // Fail : invalid
        else if(/^e.www.login.invalid/.test(reo.errCode)) {
          invalid(reo)
        }
        // Fail : others
        else {
          others(reo)
        }
        // Callback
        fail(reo)
      }
    },
    //--------------------------------------------
    async doGetVcode({getters, rootState}, {
      type="login_by_phone",
      scene="auth",
      account, captcha,
      done=_.identity,
      ok=_.identity, 
      fail=_.identity
    }={}) {
      console.log("getVcode", scene, account, captcha)

      // Guard SiteId
      let siteId = rootState.siteId
      if(!siteId) {
        Ti.Alert("Without siteId!!!")
        return
      }

      // Eval URL
      let api = ({
        "login_by_phone" : "get_sms_vcode",
        "bind_phone"     : "get_sms_vcode",
        "bind_email"     : "get_email_vcode"
      })[type]
      let url = getters.urls[api]

      // Prepare params
      let params = {
        site : siteId,
        scene, account, captcha
      }

      // Call Remote
      let reo = await Ti.Http.get(url, {params, as:"json"})
      console.log(reo)

      done(reo)

      // Success
      if(reo.ok && reo.data) {
        ok(reo.data)
      }
      // Fail 
      else {
        fail(reo)
      }
    },
    //--------------------------------------------
    async doLogout({commit, getters, rootState}, {
      done=_.identity,
      ok=_.identity, 
      fail=_.identity
    }={}) {
      console.log("doLogout")
      // Guard SiteId
      let siteId = rootState.siteId
      if(!siteId) {
        Ti.Alert("Without siteId!!!")
        return
      }

      // Always force remove
      Ti.Storage.local.remove(`www-ticket-${siteId}`)

      // No Session, ignore
      if(!getters.hasSession) {
        fail(getters.sessionState)
        return
      }

      // Session
      let se = getters.sessionState

      // Eval URL
      let url = getters.urls["logout"]
      let params = {
        site   : siteId,
        ticket : se.ticket
      }

      commit("setLoading", {text:"i18n:logout-ing"}, {root:true})

      // Call Remote
      let reo = await Ti.Http.post(url, {params, as:"json"})
      console.log(reo)

      commit("setTicket", null)
      commit("setExpi",   0)
      commit("setMe",     null)

      commit("setLoading", false, {root:true})

      done(reo)

      // Success
      if(reo.ok) {
        ok(reo.data)
      }
      // Fail 
      else {
        fail(reo)
      }
    }
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}
Ti.Preload("ti/lib/www/mod/auth/www-mod-auth.mjs", _M);
})();
//============================================================
// JOIN: mod/auth/_mod.json
//============================================================
Ti.Preload("ti/lib/www/mod/auth/_mod.json", {
  "name" : "www-mod-auth",
  "namespaced" : true,
  "state" : "./www-mod-auth.json",
  "mixins" : "./www-mod-auth.mjs"
});
//============================================================
// JOIN: mod/page/www-mod-page.json
//============================================================
Ti.Preload("ti/lib/www/mod/page/www-mod-page.json", {
  "title" : null,
  "path"  : null,
  "finger" : null,
  "params" : {},
  "anchor" : null,
  "apis" : {},
  "data" : {},
  "layout" : {
    "desktop" : {},
    "tablet"  : "desktop",
    "phone"   : "desktop"
  },
  "shown" : {},
  "schema" : {},
  "actions" : {}
});
//============================================================
// JOIN: mod/page/www-mod-page.mjs
//============================================================
(function(){
const _M = {
  ////////////////////////////////////////////////
  getters : {
    //--------------------------------------------
    pageLink({path, params, anchor}) {
      let link = [path]
      // Join QueryString
      if(!_.isEmpty(params)) {
        let qs = []
        _.forEach(params, (v, k)=>{
          if(!Ti.Util.isNil(v)) {
            qs.push(`${k}=${encodeURIComponent(v)}`)
          }
        })
        if(!_.isEmpty(qs)) {
          link.push(`?${qs.join("&")}`)
        }
      }
      // Join Anchor
      if(anchor) {
        link.push(`#${anchor}`)
      }
      return link.join("")
    },
    //--------------------------------------------
    // Merget page api and the site api
    pageApis(state, getters, rootState, rootGetters) {
      let apiBase  = rootState.apiBase || "/"
      let SiteApis = rootState.apis || {}
      let PageApis = {}
      // For each api declared in current page
      _.forEach(state.apis, (pageApi, key)=>{
        //..........................................
        // Get SiteApi template
        let siteApi = _.get(SiteApis, pageApi.apiName || key)
        //..........................................
        // Marge the page api
        let api = _.cloneDeep(siteApi)
        _.defaults(api, {
          method  : "GET",
          headers : {},
          params  : {},
          vars    : {},
          as      : "json"
        })
        // API path is required
        if(!api.path) {
          console.warn(`!!!API[${key}] without defined in site!!!`, api)
          return
        }
        //..........................................
        // Merge vars
        _.assign(api.vars, pageApi.vars)
        //..........................................
        // Merge headers
        _.assign(api.headers, pageApi.headers)
        //..........................................
        // Merge params
        _.forEach(api.params, (param, name) => {
          let paramVal = _.get(pageApi.params, name)
          if(!_.isUndefined(paramVal)) {
            param.value = paramVal
          }
        })
        //console.log("params", params)
        //..........................................
        // Absolute URL
        if(/^(https?:\/\/|\/)/.test(api.path)) {
          api.url = api.path
        }
        // Join with the apiBase
        else {
          api.url = Ti.Util.appendPath(apiBase, api.path)
        }       
        //..........................................
        // Copy the Setting from page
        _.assign(api, _.pick(pageApi, "body", "preload","serializer", "dataKey"))
        //..........................................
        _.defaults(api, {
          bodyType : "form",
          dataKey  : key
        })
        //..........................................
        // Join to map
        PageApis[key] = api
        //..........................................
      })  // _.forEach(state.apis, (info, key)=>{
      // console.log("APIs", PageApis)
      // Return page api-set
      return PageApis
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  mutations : {
    //--------------------------------------------
    set(state, all) {
      _.assign(state, all)
    },
    //--------------------------------------------
    setTitle(state, title) {
      state.title = title
    },
    //--------------------------------------------
    setPath(state, path) {
      state.path = path
    },
    //--------------------------------------------
    setPath(state, path) {
      state.path = path
    },
    //--------------------------------------------
    setParams(state, params) {
      state.params = params
    },
    //--------------------------------------------
    mergeParams(state, params) {
      if(!_.isEmpty(params) && _.isPlainObject(params)) {
        state.params = _.merge({}, state.params, params)
      }
    },
    //--------------------------------------------
    setData(state, data) {
      state.data = data
    },
    //--------------------------------------------
    updateData(state, {key, value}) {
      if(_.isUndefined(value)) {
        return
      }
      // Apply Whole Data
      if(!key) {
        if(_.isPlainObject(value)) {
          state.data = _.assign({}, state.data, value)
        }
      }
      // update field
      else {
        let vobj = _.set({}, key, value)
        state.data = _.assign({}, state.data, vobj)
      }
    },
    //--------------------------------------------
    mergeData(state, data) {
      if(!_.isEmpty(data) && _.isPlainObject(data)) {
        state.data = _.merge({}, state.data, data)
      }
    },
    //--------------------------------------------
    setLayout(state, layout) {
      state.layout = layout
    },
    //--------------------------------------------
    setShown(state, shown) {
      _.assign(state.shown, shown)
    },
    //--------------------------------------------
    // Page finger to indicate the page changed
    // watch the filter can auto update document title
    updateFinger(state) {
      let ss = [state.path, state.params, state.anchor, state.data]
      let sha1 = Ti.Alg.sha1(ss)
      state.finger = sha1
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  actions : {
    //--------------------------------------------
    showBlock({commit}, name) {
      commit("setShown", {[name]:true})
    },
    //--------------------------------------------
    hideBlock({commit}, name) {
      commit("setShown", {[name]:false})
    },
    //--------------------------------------------
    /***
     * Usage:
     * 
     * - OBJ: `changeData({KEY1:VAL1, KEY2:VAL2})
     * - Array: `changeData([{KEY1:VAL1}, {KEY2:VAL2}])
     * 
     * @param key{String} : the field name in "page.data", falsy for whole data
     * @param args{Object|Array} : `{name,value}` Object or Array
     */
    changeData({commit}, args) {
      let data = Ti.Util.merge({}, args)
      commit("mergeData", data)
    },
    changeParams({commit}, args) {
      let params = Ti.Util.merge({}, args)
      commit("mergeParams", params)
      commit("updateFinger")
    },
    //--------------------------------------------
    /***
     * Mutate the data fields in params `offset`, each field
     * should be `Number`
     * 
     * @param offsets{Object} - the offset number set. "a.b.c" suppored
     */ 
    shiftData({state, commit}, offsets={}) {
      if(!_.isEmpty(offsets) && _.isPlainObject(offsets)) {
        let d2 = {}
        // Do shift
        Ti.Util.walk(offsets, {
          leaf : (off, path)=>{
            let val = _.get(state.data, path)
            // Offset
            if(_.isNumber(val) && _.isString(off) && /^[+-][0-9.]+$/.test(off)) {
              _.set(d2, path, val+off*1)
            }
            // Others Replace
            else {
              _.set(d2, path, off)
            }
          }
        })
        // Do Merge
        commit("mergeData", d2)
      }
    },
    //--------------------------------------------
    /***
     * Assert page data under a group of restrictions 
     */
    assertPage({rootState, dispatch}, {checkList=[], fail={}}={}) {
      // Prepare check result
      let assertFail = false
      // Loop the checkList
      for(let cl of checkList) {
        let val = _.get(rootState, cl.target)
        if(!Ti.Validate.checkBy(cl.assert, val)) {
          assertFail = true
          break
        }
      }
      //console.log(assertFail)
      // Do Fail
      if(assertFail && fail.action) {
        dispatch("doAction", fail, {root:true})
      }
    },
    //--------------------------------------------
    /***
     * Reload page data by given api keys
     */
    async reloadData({state, commit, getters, rootState}, keys=[]) {
      console.log("reloadData", keys)
      //.......................................
      // The api list to reload
      let isAll = _.isEmpty(keys)
      let apis = _.filter(getters.pageApis, (api, k)=>{
        return (isAll && api.preload>0) || _.indexOf(keys, k)>=0
      })
      //.......................................
      // Sort preload
      apis.sort((a1, a2)=>{
        return a1.preload - a2.preload
      })
      //.......................................
      // Prepare the Promises
      for(let api of apis) {
        // prepare http send options
        let url = api.url
        // if("/www/dataocean/cygq/mock/right-b/b-${nm}.json"==url) {
        //   console.log("haha", url)
        // }
        //.....................................
        // Eval dynamic url
        if(!_.isEmpty(api.vars)) {
          let vars = Ti.Util.explainObj(rootState, api.vars)
          url = Ti.S.renderBy(url, vars)
        }
        //.....................................
        // Gen the options
        let options = _.pick(api, ["method", "as"])
        // Eval headers
        options.headers = Ti.Util.explainObj(rootState, api.headers)
        // Eval the params
        options.params = {}
        _.forEach(api.params, (param, key)=>{
          let val = Ti.Util.explainObj(rootState, param.value)
          // Check required
          if(param.required && Ti.Util.isNil(val)) {
            let errMsg = `${url}: lack required param: ${key}`
            Ti.Toast.Open(errMsg, "error")
            throw errMsg
          }
          options.params[key] = val
        })
        //.....................................
        // Prepare the body
        if("POST" == api.method && api.body) {
          let bodyData = Ti.Util.explainObj(rootState, api.body)
          // As JSON
          if("json" == api.bodyType) {
            options.body = JSON.stringify(bodyData)
          }
          // As responseText
          else if("text" == api.bodyType) {
            options.body = Ti.Types.toStr(bodyData)
          }
          // Default is form
          else {
            options.body = Ti.Http.encodeFormData(bodyData)
          }
        }
        //.....................................
        // Join the http send Promise
        //console.log(`will send to "${url}"`, options)
        let reo = await Ti.Http.sendAndProcess(url, options) 
        let data = reo
        // Eval api serializer
        if(api.serializer) {
          let serializer = Ti.Util.genInvoking(api.serializer, {
            context: rootState,
            partialRight: true
          })
          if(_.isFunction(serializer)) {
            data = serializer(reo)
          }
        }
        commit("updateData", {
          key   : api.dataKey,
          value : data
        })
          
          // .catch(($req)=>{
          //   console.warn($req)
          //   // commit("updateData", {
          //   //   key   : api.dataKey,
          //   //   value : {
          //   //     ok : false,
          //   //     errCode : `http.${$req.status}`,
          //   //     msg : `http.${$req.status}`,
          //   //     data : _.trim($req.responseText)
          //   //   }
          //   // })
          //   // TODO maybe I should emit event here
          //   // Then handle the event in actons 
          // })
      } // for(let api of list) {
      //.......................................
      // Mark root state
      commit("setLoading", true, {root:true})
      //.......................................
      // // Only one request
      // if(ings.length == 1) {
      //   await ings[0]
      // }
      // // Join all request
      // else if(ings.length > 1) {
      //   await Promise.all(ings)
      // }
      //.......................................
      // Mark root state
      commit("setLoading", false, {root:true})
      commit("updateFinger")
      //.......................................
      // // Get return value
      // let reKeys = []
      // for(let api of apis) {
      //   reKeys.push(api.dataKey)
      // }
      // //.......................................
      // return _.pick(state.data, reKeys)
    },
    //--------------------------------------------
    /***
     * Reload whole page
     */
    async reload({commit, dispatch, rootGetters}, {
      path,
      anchor,
      params={}
    }) {
      //console.log(rootGetters.routerList)
      console.log("page.reload", {path,params,anchor})
      let pinfo;
      //.....................................
      // Apply routerList
      for(let router of rootGetters.routerList) {
        pinfo = router(path)
        if(pinfo && pinfo.path) {
          break
        }
      }
      //.....................................
      if(!pinfo || !pinfo.path) {
        return await Ti.Toast.Open("Page ${path} not found!", {
          type: "error",
          position: "center",
          vars: {path}
        })
      }
      //.....................................
      // Load the page json
      let json = await Ti.Load(`@Site:${pinfo.path}.json`)

      //.....................................
      // merge info
      if(anchor) {
        pinfo.anchor = anchor
      }
      pinfo.params = _.merge({}, pinfo.params, params)
      pinfo.path = path
      let page = _.merge({
        "title" : null,
        "apis" : {},
        "data" : {},
        "layout" : {},
        "params" : {},
        "shown" : {},
        "schema" : {},
        "actions" : {}
      }, json, pinfo)
      
      //...........................
      // Update page 
      commit("set", page)
      console.log(" -->", page)

      //.....................................
      // init: data
      await dispatch("reloadData")
    }
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}
Ti.Preload("ti/lib/www/mod/page/www-mod-page.mjs", _M);
})();
//============================================================
// JOIN: mod/page/_mod.json
//============================================================
Ti.Preload("ti/lib/www/mod/page/_mod.json", {
  "name" : "www-mod-page",
  "namespaced" : true,
  "state" : "./www-mod-page.json",
  "mixins" : "./www-mod-page.mjs"
});
//============================================================
// JOIN: mod/www-mod-site.mjs
//============================================================
(function(){
const _M = {
  /////////////////////////////////////////
  getters : {
    //-------------------------------------
    // Pre-compiled Site Routers
    routerList(state) {
      let list = []
      _.forEach(state.router, ({
        match, names=[], page={}
      }={})=>{
        let regex = new RegExp(match)
        // Pre-compiled
        let li = function(path){
          let m = regex.exec(path)
          // Match page
          if(m) {
            // Build Context
            let context = {}
            for(let i=0; i<m.length; i++) {
              let val = m[i]
              context[i] = val
              let k = _.nth(names, i)
              if(k) {
                _.set(context, key, val)
              }
            }
            // Render page info
            return Ti.Util.explainObj(context, page)        
          }
        }

        // Join to list
        list.push(li)
      })
      return list
    },
    //-------------------------------------
    // Site Action Mapping
    actions(state) {
      //console.log("www-mod-site::getters.actions")
      // Global
      let map = _.cloneDeep(state.actions)

      // Evalue the actions
      map = _.mapValues(map, (val)=>
        _.isString(val)
          ? {action:val}
          : val)
      
      // Merge action set with the defination in page
      let page = state.page
      if(page) {
        _.forEach(page.actions, (val, key)=>{
          let act = val
          // format val
          if(_.isString(val)) {
            act = {action : val}
          }

          // do merge
          let gAction = map[key]
          // Array+?
          if(_.isArray(gAction)) {
            // Array+Array
            if(_.isArray(act)) {
              if(act.length > 0) {
                // Concat Array
                if("+" == act[0]) {
                  for(let z=1;z<act.length;z++) {
                    gAction.push(act[z])
                  }
                }
                // Replace Array
                else {
                  map[key] = act      
                }
              }
            }
            // Array+Object -> append
            else {
              gAction.push(act)
            }
          }
          // Object+Any -> replace
          else {
            map[key] = act
          }
        })
      }
      return map
    },
    //-------------------------------------
    getUrl(state) {
      return (path)=>{
        return Ti.Util.appendPath(state.base, path)
      }
    },
    //-------------------------------------
    getApiUrl(state) {
      return (path)=>{
        return Ti.Util.appendPath(state.apiBase, path)
      }
    }
    //-------------------------------------
  },
  /////////////////////////////////////////
  mutations : {
    //-------------------------------------
    setSiteId(state, siteId) {
      state.siteId = siteId
    },
    //-------------------------------------
    setDomain(state, domain) {
      state.domain = domain
      state.base = Ti.S.renderBy(state.base||"/www/${domain}/", {domain})
      state.apiBase = Ti.S.renderBy(state.apiBase||"/api/${domain}/", {domain})
    },
    //-------------------------------------
    setLoading(state, loading) {
      state.loading = loading
    },
    //-------------------------------------
    setPageReady(state, isReady) {
      state.isReady = isReady
    }
    //-------------------------------------
  },
  /////////////////////////////////////////
  actions : {
    //-------------------------------------
    navBackward() {
      if(window.history) {
        window.history.back()
      }
    },
    //-------------------------------------
    // Only handle the "page|dispatch"
    async navTo({state, commit, dispatch}, {
      type="page",
      value,    // page path
      anchor,   // page anchor
      data,     // page.data
      params,   // page.params
      pushHistory = true
    }={}) {
      console.log("navToPage::", value)
      // Guarding
      if(!value)
        return
      // navTo::page
      if("page" == type) {
        commit("setPageReady", false)
        commit("setLoading", true)
        await dispatch("page/reload", {
          path   : value,
          anchor : anchor,
          params : params,
          data   : data
        })
        commit("setLoading", false)
        commit("setPageReady", true)
      }
      // navTo::dispatch
      else if("dispatch" == type) {
        await dispatch(value, params)
      }
    },
    //-------------------------------------
    /***
     * Handle the action dispatching.
     * 
     * One action should be defined in `[page].json#actions`:
     * 
     * ```js
     * {
     *    action : "xx/xx",
     *    payload : {} | [] | ...
     * }
     * ```
     * 
     * @param action{String} - action name like `page/showBlock`
     * @param payload{Object|Array} - action payload, defined in `json` file
     * @param args{Array} - the dynamic information emitted by `[Com].$emit`
     * 
     * @return {void}
     */
    async doAction({state, dispatch}, {
      action, 
      payload, 
      args=[]
    }={}){
      //....................................
      if(!action)
        return;
      //....................................
      let pld;

      // Use args directrly cause payload without defined
      if(_.isUndefined(payload) || _.isNull(payload)) {
        pld = _.cloneDeep(_.nth(args, 0))
      }
      //....................................
      // Explain payload
      else {
        let context = _.assign({}, state, {
          $args : args
        })
        pld = Ti.Util.explainObj(context, payload, {
          evalFunc : false
        })
      }
      //....................................
      console.log("invoke->", action, pld)
      await dispatch(action, pld)
    },
    //-------------------------------------
    async reload({state, dispatch}) {
      //console.log("site.reload", state.entry, state.base)
      // Merge Site FuncSet
      //console.log(state.utils)

      // Init the base/apiBase

      // Looking for the entry page
      let loc = {
        path   : window.location.pathname,
        hash   : window.location.hash,
        search : window.location.search
      }

      // tidy query string
      if(loc.search && loc.search.startsWith("?")){
        loc.search = loc.search.substring(1)
      }

      // Eval params
      let params = {}
      if(loc.search) {
        let ss = loc.search.split('&')
        for(let s of ss) {
          let pos = s.indexOf('=')
          if(pos > 0) {
            let k = s.substring(0, pos)
            let v = s.substring(pos+1)
            params[k] = v
          } else {
            params[s] = true
          }
        }
      }

      // Eval the entry page
      let entry = state.entry
      if(loc.path.startsWith(state.base)) {
        entry = loc.path.substring(state.base.length) || entry;
      }

      // nav to page
      await dispatch("navTo", {
        type   : "page",
        value  : entry,
        params : params,
        anchor : loc.hash,
        pushHistory : false
      })
    }
    //-------------------------------------
  }
  /////////////////////////////////////////
}
Ti.Preload("ti/lib/www/mod/www-mod-site.mjs", _M);
})();
//============================================================
// JOIN: zh-cn/hmaker.i18n.json
//============================================================
Ti.Preload("ti/i18n/zh-cn/hmaker.i18n.json", {
  "com-form": "表单",
  "com-label": "标签",
  "com-list": "列表",
  "hm-type-Array": "数组",
  "hm-type-Boolean": "布尔",
  "hm-type-Group": "字段分组",
  "hm-type-Integer": "整数",
  "hm-type-Number": "数字",
  "hm-type-Object": "对象",
  "hm-type-String": "文本",
  "hm-type-icons": {
    "Group": "zmdi-collection-bookmark",
    "Object": "zmdi-toys",
    "Number": "zmdi-input-svideo",
    "Integer": "zmdi-n-6-square",
    "Boolean": "zmdi-toll",
    "String": "zmdi-translate",
    "Array": "zmdi-format-list-bulleted"
  },
  "hmaker-com-conf-blank": "请选择一个控件设置其详情",
  "hmaker-com-type-blank": "选择一个控件",
  "hmaker-edit-form-del-group-all": "组以及全部字段",
  "hmaker-edit-form-del-group-confirm": "您是要删除组以及其内的全部字段，还是仅是组？",
  "hmaker-edit-form-del-group-only": "仅是组",
  "hmaker-edit-form-field-nil": "请选择一个字段编辑详情",
  "hmaker-edit-form-new-field": "新字段",
  "hmaker-edit-form-new-field-e0": "字段名不能以数字开头，内容只能为小写英文字母数字和下划线",
  "hmaker-edit-form-new-field-e1": "字段【${val}】已存在，请另选一个名称",
  "hmaker-edit-form-new-field-tip": "请输入新字段名（只能为小写英文字母数字和下划线）",
  "hmaker-edit-form-new-group": "新分组",
  "hmaker-edit-form-new-group-tip": "请输入新分组名",
  "hmaker-edit-form-nil-field": "请先选择一个字段",
  "hmaker-edit-form-not-current": "请选择一个字段或者字段组",
  "hmaker-layout-cols": "列布局",
  "hmaker-layout-rows": "行布局",
  "hmaker-layout-tabs": "标签布局",
  "hmaker-nav-blank-item": "请选择一个导航项目编辑",
  "hmaker-nav-k-display": "链接显示内容",
  "hmaker-nav-k-icon": "链接图标",
  "hmaker-nav-k-title": "链接文字",
  "hmaker-nav-k-type": "链接类型",
  "hmaker-nav-k-value": "链接目标",
  "hmaker-nav-tp-dispatch": "方法调用",
  "hmaker-nav-tp-href": "外部链接",
  "hmaker-nav-tp-page": "站点页面",
  "hmaker-site-k-apiBase": "接口路径",
  "hmaker-site-k-base": "资源路径",
  "hmaker-site-k-captcha": "验证码路径",
  "hmaker-site-k-domain": "所属域",
  "hmaker-site-k-entry": "着陆页",
  "hmaker-site-prop": "站点属性",
  "hmaker-site-state": "站点全局配置",
  "hmaker-site-state-actions": "全局动作表",
  "hmaker-site-state-apis": "接口集",
  "hmaker-site-state-blocks": "预定义布局",
  "hmaker-site-state-general": "通用配置",
  "hmaker-site-state-nav": "全局导航条",
  "hmaker-site-state-router": "页面路由",
  "hmaker-site-state-schema": "预定义控件",
  "hmaker-site-state-utils": "扩展函数",
  "hmaker-site-tree": "站点结构",
  "hmaker-site-tree-loading": "正在加载站点结构...",
  "hmk-adjustDelay": "调整延迟",
  "hmk-aspect": "外观",
  "hmk-autoI18n": "国际化",
  "hmk-behavior": "行为",
  "hmk-blankAs": "空白样式",
  "hmk-breakLine": "维持换行",
  "hmk-currentTab": "当前标签",
  "hmk-data": "数据",
  "hmk-dict": "数据字典",
  "hmk-editable": "可编辑",
  "hmk-field-checkEquals": "检查相等",
  "hmk-field-com": "编辑控件",
  "hmk-field-defaultAs": "默认值",
  "hmk-field-disabled": "失效条件",
  "hmk-field-height": "高度",
  "hmk-field-hidden": "隐藏条件",
  "hmk-field-icon": "图标",
  "hmk-field-name": "键名",
  "hmk-field-serializer": "自定义保存",
  "hmk-field-tip": "提示说明",
  "hmk-field-title": "显示名",
  "hmk-field-transformer": "自定义转换",
  "hmk-field-type": "类型",
  "hmk-field-width": "宽度",
  "hmk-fieldStatus": "字段状态",
  "hmk-fields": "字段",
  "hmk-fields-advance": "高级",
  "hmk-fields-general": "基本",
  "hmk-form-data": "数据源",
  "hmk-form-height": "表单高度",
  "hmk-form-onlyFields": "仅声明字段",
  "hmk-form-width": "表单宽度",
  "hmk-format": "格式化",
  "hmk-height": "控件高度",
  "hmk-href": "超链接",
  "hmk-icon": "表单图标",
  "hmk-measure": "尺寸",
  "hmk-mode": "显示方式",
  "hmk-mode-all": "全部",
  "hmk-mode-tab": "标签",
  "hmk-newTab": "新窗口",
  "hmk-placeholder": "占位文本",
  "hmk-prefixIcon": "前缀图标",
  "hmk-prefixText": "前缀文字",
  "hmk-spacing": "间距",
  "hmk-spacing-comfy": "舒适",
  "hmk-spacing-tiny": "紧凑",
  "hmk-suffixIcon": "后缀图标",
  "hmk-suffixText": "后缀文字",
  "hmk-tabAt": "标签位置",
  "hmk-tabAt-bottom-center": "下部居中",
  "hmk-tabAt-bottom-left": "下部居左",
  "hmk-tabAt-bottom-right": "下部居右",
  "hmk-tabAt-top-center": "上部居中",
  "hmk-tabAt-top-left": "上部居左",
  "hmk-tabAt-top-right": "上部居右",
  "hmk-title": "表单标题",
  "hmk-trimed": "修剪空白",
  "hmk-value": "输入值",
  "hmk-valueMaxWidth": "值最大宽度",
  "hmk-width": "控件宽度"
});
//============================================================
// JOIN: zh-cn/ti-datetime.i18n.json
//============================================================
Ti.Preload("ti/i18n/zh-cn/ti-datetime.i18n.json", {
  "Apr": "四月",
  "Aug": "八月",
  "Dec": "十二月",
  "Feb": "二月",
  "Fri": "周五",
  "Friday": "星期五",
  "Jan": "一月",
  "Jul": "七月",
  "Jun": "六月",
  "Mar": "三月",
  "May": "五月",
  "Mon": "周一",
  "Monday": "星期一",
  "Nov": "十一月",
  "Oct": "十月",
  "Sat": "周六",
  "Saturday": "星期六",
  "Sep": "九月",
  "Sun": "周日",
  "Sunday": "星期日",
  "Thu": "周四",
  "Thursday": "星期四",
  "Tue": "周二",
  "Tuesday": "星期二",
  "Wed": "周三",
  "Wednesday": "星期三",
  "blank-date": "请选择日期",
  "blank-date-range": "请选择日期范围",
  "blank-datetime": "请选择日期时间",
  "blank-month": "请选择月份",
  "blank-time": "请选择时间",
  "blank-time-range": "请选择时间范围",
  "cal": {
    "week": ["日", "一", "二", "三", "四", "五", "六"],
    "m-range-beyond-years": "${yy0}年${MT0}至${yy1}年${MT1}",
    "m-range-beyond-months": "${yy0}年${MT0}至${MT1}",
    "d-range-beyond-years": "${yy0}年${MM0}月${dd0}日至${yy1}年${MM1}月${dd1}日",
    "d-range-beyond-months": "${yy0}年${MM0}月${dd0}日至${MM1}月${dd1}日",
    "d-range-beyond-days": "${yy0}年${MM0}月${dd0}至${dd1}日",
    "d-range-in-same-day": "${yy0}年${MM0}月${dd0}日全天",
    "abbr": {
      "Jan": "一月",
      "Feb": "二月",
      "Mar": "三月",
      "Apr": "四月",
      "May": "五月",
      "Jun": "六月",
      "Jul": "七月",
      "Aug": "八月",
      "Sep": "九月",
      "Oct": "十月",
      "Nov": "十一",
      "Dec": "十二"
    }
  },
  "time-begin": "开始时间",
  "time-end": "结束时间",
  "today": "今天"
});
//============================================================
// JOIN: zh-cn/ti-obj-creation.i18n.json
//============================================================
Ti.Preload("ti/i18n/zh-cn/ti-obj-creation.i18n.json", {
  "toc-auto-type": "全部类型",
  "toc-free": "请输入对象完整名称，包括扩展名，譬如 `myfile.xml`",
  "toc-tip": "新对象名称"
});
//============================================================
// JOIN: zh-cn/ti-text-editor.i18n.json
//============================================================
Ti.Preload("ti/i18n/zh-cn/ti-text-editor.i18n.json", {
  "wordp-h0": "正文",
  "wordp-h1": "标题 1",
  "wordp-h2": "标题 2",
  "wordp-h3": "标题 3",
  "wordp-h4": "标题 4",
  "wordp-h5": "标题 5",
  "wordp-h6": "标题 6",
  "wordp-heading": "标题级别",
  "wordp-link": "超链接",
  "wordp-nil-sel": "请先选择一段文字"
});
//============================================================
// JOIN: zh-cn/ti-text-json.i18n.json
//============================================================
Ti.Preload("ti/i18n/zh-cn/ti-text-json.i18n.json", {
  "json-Array": "数组",
  "json-Boolean": "布尔",
  "json-Float": "小数",
  "json-Integer": "整数",
  "json-Nil": "空值",
  "json-Number": "数字",
  "json-Object": "对象",
  "json-String": "字符串",
  "json-new-key": "请输入一个新键名"
});
//============================================================
// JOIN: zh-cn/web.i18n.json
//============================================================
Ti.Preload("ti/i18n/zh-cn/web.i18n.json", {
  "auth-bind": "绑定",
  "auth-bind-email-title": "绑定邮箱",
  "auth-bind-phone-title": "绑定手机",
  "auth-blank-email": "邮箱不能为空",
  "auth-blank-name": "名称不能为空",
  "auth-blank-name-passwd": "名称或者密码不能为空",
  "auth-blank-phone": "手机号不能为空",
  "auth-doing": "正在验证",
  "auth-email-tip": "邮箱地址",
  "auth-email-title": "邮件密码登录/注册",
  "auth-email-vcode": "邮件密码",
  "auth-email-vcode-get": "获取邮件密码",
  "auth-go-email": "邮件密码登录/注册",
  "auth-go-passwd": "账号密码登录",
  "auth-go-phone": "短信密码登录/注册",
  "auth-login": "登录",
  "auth-login-or-signup": "登录/注册",
  "auth-ok": "账号验证通过",
  "auth-passwd-getback": "找回密码",
  "auth-passwd-name-phone-tip": "手机号/登录名",
  "auth-passwd-name-email-tip": "邮箱地址/登录名",
  "auth-passwd-tip": "密码",
  "auth-passwd-title": "账号密码登录",
  "auth-phone-email-get": "获取邮箱验证码",
  "auth-phone-tip": "手机号",
  "auth-phone-title": "短信密码登录/注册",
  "auth-phone-vcode": "短信密码",
  "auth-phone-vcode-get": "获取短信密码",
  "auth-reset-by-phone": "用手机号重置密码",
  "auth-reset-by-phone-sent": "已经向您的手机 ${phone} 发送了验证码",
  "auth-reset-by-phone-tip": "请输入您的账号绑定的手机号码",
  "auth-reset-next": "下一步",
  "auth-reset-passwd": "新密码（最少6位）",
  "auth-reset-retype": "再次确认",
  "auth-reset-save": "保存",
  "auth-sending-vcode": "正在发送验证码",
  "auth-sent-ok": "验证码已发出，请在${ta}查收，${min}分钟内有效",
  "auth-ta-email": "邮箱里",
  "auth-ta-phone": "手机上",
  "auth-vcode-delay": "${sec} 秒后重新发送",
  "auth-vcode-lost": "收不到验证码？",
  "e-www-invalid-captcha": "验证码错误",
  "e-www-login-invalid-passwd": "账号密码错误",
  "e-www-login-noexists": "账号不存在",
  "pay-by-nil": "请选择一个支付方式",
  "pay-by-wx-qrcode": "使用微信扫码支付",
  "pay-by-zfb-qrcode": "使用支付宝扫码支付",
  "pay-check-do": "已经支付完成",
  "pay-check-ing": "正在检查支付结果",
  "pay-re-fail": "支付失败",
  "pay-re-nil": "支付结果是一只薛定谔的猫",
  "pay-re-ok": "支付成功",
  "pay-re-wait": "等待支付中",
  "pay-tip-wx-qrcode": "请于15分钟内用微信扫一扫付款码",
  "pay-tip-zfb-qrcode": "请于15分钟内用支付宝扫一扫付款码",
  "pay-wx": "微信支付",
  "pay-zfb": "支付宝"
});
//============================================================
// JOIN: zh-cn/wn-manager.i18n.json
//============================================================
Ti.Preload("ti/i18n/zh-cn/wn-manager.i18n.json", {
  "ti-loading": "加载中...",
  "wn-adaptlist": "对象浏览器",
  "wn-create-fail": "创建失败",
  "wn-create-invalid": "新对象名称不能包括非法字符",
  "wn-create-ok": "创建成功",
  "wn-create-too-long": "新对象名称过长",
  "wn-del-item": "正在删除: \"${name}\"",
  "wn-del-no-empty-folder": "目录\"${nm}\"不是空的，您是否要全部删除？点击\"否\"跳过",
  "wn-del-none": "请选择至少一个文件进行删除!",
  "wn-del-ok": "已有 ${N} 个对象被移除",
  "wn-download-dir": "对象 \"${nm}\" 是一个目录，点击\"继续\"将跳过它并下载下一个文件，点击\"终止\"将结束本次操作!",
  "wn-download-none": "请选择至少一个文件进行下载!",
  "wn-download-too-many": "即将逐个下载 ${N} 个文件，继续吗？",
  "wn-expose-hidden-off": "不显示隐藏的对象",
  "wn-expose-hidden-on": "显示隐藏的对象",
  "wn-gui": "通用布局界面",
  "wn-obj-preview": "对象预览",
  "wn-obj-puretext": "纯文本编辑器",
  "wn-obj-single-com": "单控件测试套",
  "wn-publish-done": "发布成功",
  "wn-publish-to-nil": "未设置发布目标",
  "wn-publish-to-noexist": "发布目标不存在",
  "wn-rename": "重命名对象 \"${name}\"",
  "wn-rename-fail": "重命名失败",
  "wn-rename-invalid": "名称不能包括非法字符",
  "wn-rename-none": "请选择一个文件重命名!",
  "wn-rename-ok": "重命名成功",
  "wn-rename-suffix-changed": "您的文件后缀名发生变化，您需要自动为您补全原来的后缀吗？",
  "wn-rename-too-long": "名称过长",
  "wn-thing-manager": "数据管理器",
  "wn-view-opening": "正在加载界面..."
});
//============================================================
// JOIN: zh-cn/wn-obj-preview.i18n.json
//============================================================
Ti.Preload("ti/i18n/zh-cn/wn-obj-preview.i18n.json", {
  "wop-fullscreen-enter": "进入全屏",
  "wop-fullscreen-quit": "退出全屏"
});
//============================================================
// JOIN: zh-cn/wn-thing.i18n.json
//============================================================
Ti.Preload("ti/i18n/zh-cn/wn-thing.i18n.json", {
  "thing-clean": "清空回收站",
  "thing-cleaning": "正在清空...",
  "thing-content": "对象内容",
  "thing-content-hide": "隐藏内容",
  "thing-content-show": "显示内容",
  "thing-create": "创建新对象",
  "thing-create-in-recyclebin": "请先退出回收站，再创建新对象",
  "thing-enter-recyclebin": "打开回收站",
  "thing-files": "对象文件表",
  "thing-files-hide": "隐藏文件表",
  "thing-files-show": "显示文件表",
  "thing-filter-kwdplhd": "请输入查询条件",
  "thing-leave-recyclebin": "退出回收站",
  "thing-meta": "对象属性",
  "thing-meta-hide": "隐藏属性",
  "thing-meta-show": "显示属性",
  "thing-recycle-bin": "回收站",
  "thing-restore": "恢复选中",
  "thing-restore-none": "请先选择要恢复的数据",
  "thing-restoring": "正在恢复..."
});
//============================================================
// JOIN: zh-cn/_net.i18n.json
//============================================================
Ti.Preload("ti/i18n/zh-cn/_net.i18n.json", {
  "net-ct": "创建时间",
  "net-flt-nil": "查找视频名称",
  "net-vod-add-video": "添加视频",
  "net-vod-video-nil": "请选择一个视频查看详情"
});
//============================================================
// JOIN: zh-cn/_ti.i18n.json
//============================================================
Ti.Preload("ti/i18n/zh-cn/_ti.i18n.json", {
  "add": "添加",
  "add-item": "添加新项",
  "amount": "数量",
  "attachment": "附件",
  "blank": "空白",
  "blank-to-edit": "请选择要编辑的项目",
  "buy": "购买",
  "buy-now": "立即购买",
  "cancel": "取消",
  "cancel-all": "取消选中",
  "candidate": "备选项",
  "captcha": "验证码",
  "captcha-chagne": "换一张",
  "captcha-tip": "请输入图中的验证码",
  "checked": "已选中",
  "choose": "选择",
  "choose-file": "选择文件",
  "choose-obj": "选择对象",
  "clean": "清理",
  "clear": "清除",
  "close": "关闭",
  "confirm": "确认",
  "console": "控制台",
  "content": "内容",
  "continue": "继续",
  "create": "新建",
  "create-now": "立即创建",
  "creating": "正在创建...",
  "debug": "调试",
  "default": "默认",
  "del": "删除",
  "del-checked": "删除选中",
  "del-ing": "正在删除...",
  "del-none": "请从下面列表中选择至少一个对象进行删除",
  "desktop": "桌面",
  "detail": "详情",
  "doing": "正在执行...",
  "download": "下载",
  "download-to-local": "下载到本地",
  "drop-file-here-to-upload": "拖拽文件至此以便上传",
  "drop-here": "拖拽文件至此",
  "e-io-obj-exists": "但是对象已然存在",
  "e-io-obj-noexists": "对象其实并不存在",
  "e-io-obj-noexistsf": "对象[${nm}]其实并不存在",
  "edit": "编辑",
  "edit-com": "编辑控件",
  "empty": "空",
  "empty-data": "无数据",
  "error": "错误",
  "fail": "失败",
  "false": "否",
  "favorites": "收藏",
  "female": "女",
  "filter": "过滤",
  "home": "主目录",
  "icon": "图标",
  "icon-code-tip": "请输入图标代码，如 zmdi-case",
  "info": "信息",
  "input": "输入",
  "input-tags": "输入标签",
  "lat": "北纬",
  "lng": "东经",
  "loading": "加载中...",
  "login": "登录",
  "logout": "退出",
  "logout-ing": "正在注销...",
  "male": "男",
  "me": "我",
  "media": "媒体",
  "meta": "元数据",
  "mine": "我的",
  "modal": "模式",
  "more": "更多",
  "msg": "消息",
  "name": "名称",
  "new-item": "新项目",
  "next": "下一步",
  "nil": "无",
  "nil-obj": "请选择一个对象",
  "no": "否",
  "no-saved": "您有未保存的数据",
  "no-selected": "未选择",
  "no-title": "无标题",
  "obj": "对象",
  "off": "关",
  "ok": "确定",
  "on": "开",
  "open": "打开",
  "open-newtab": "在新标签打开",
  "others": "其他",
  "paging-change-pgsz": "当前每页有${pgsz}条记录，您想修改为：",
  "paging-change-pgsz-invalid": "页大小必须是整数数字，而且必须大于0，可您... -_-!",
  "paging-change-pn": "当前第${pn}页，您想跳转到：（请输入 1 至 ${pgc} 之间的数字）",
  "paging-change-pn-invalid": "页码必须是整数数字，而且必须为 1 至 ${pgc} 之间的数字",
  "paging-first": "首页",
  "paging-last": "尾页",
  "paging-next": "后一页",
  "paging-prev": "前一页",
  "paging-sum": "共${pgc}页${sum}条记录，当前${count}/${pgsz}",
  "passwd": "密码",
  "passwd-reset": "重置密码",
  "path": "路径",
  "phone": "手机",
  "prev": "上一步",
  "price": "价格",
  "prompt": "询问",
  "properties": "属性",
  "publish": "发布",
  "publishing": "正在发布...",
  "refresh": "刷新",
  "reloading": "重新加载数据...",
  "remove": "移除",
  "removing": "正在移除...",
  "rename": "重命名...",
  "renaming": "正在重命名...",
  "revoke": "撤销",
  "revoke-change": "撤销修改",
  "save": "保存",
  "save-change": "保存修改",
  "save-done": "保存成功",
  "save-now": "立即保存",
  "saving": "正在保存...",
  "select": "选择",
  "select-all": "全部选中",
  "settings": "设置",
  "source-code": "源代码",
  "stop": "停止",
  "structure": "结构",
  "success": "成功",
  "tablet": "平板",
  "terminal": "终端",
  "terminate": "终止",
  "text": "文字",
  "title": "标题",
  "total-count": "共 ${nb?0} ${unit?项}",
  "trace": "跟踪",
  "track": "消息",
  "true": "是",
  "type": "类型",
  "under-construction": "正在施工中",
  "unknown": "未知",
  "upload": "上传",
  "upload-done": "文件上传已完成",
  "upload-file": "上传文件...",
  "upload-nofinished": "文件上传还没有完成",
  "uploading": "正在上传",
  "value": "值",
  "view": "查看",
  "view-resource": "查看源代码",
  "warn": "警告",
  "yes": "是"
});
//============================================================
// JOIN: zh-cn/_wn.i18n.json
//============================================================
Ti.Preload("ti/i18n/zh-cn/_wn.i18n.json", {
  "wn-edit-com-nil": "默认为标签控件",
  "wn-key-c": "创建者",
  "wn-key-ct": "创建",
  "wn-key-d0": "D0",
  "wn-key-d1": "D1",
  "wn-key-data": "数据",
  "wn-key-duration": "时长",
  "wn-key-expi": "过期时间",
  "wn-key-g": "主组",
  "wn-key-grp-advance": "高级",
  "wn-key-grp-basic": "基本",
  "wn-key-grp-customized": "自定义",
  "wn-key-grp-more": "更多",
  "wn-key-grp-others": "其他",
  "wn-key-grp-privilege": "权限",
  "wn-key-grp-thumb": "缩略图",
  "wn-key-grp-timestamp": "时间戳",
  "wn-key-height": "高",
  "wn-key-icon": "图标",
  "wn-key-id": "ID",
  "wn-key-len": "大小",
  "wn-key-lm": "修改",
  "wn-key-m": "修改者",
  "wn-key-md": "基本权限",
  "wn-key-mime": "MIME",
  "wn-key-nm": "名称",
  "wn-key-ph": "路径",
  "wn-key-pid": "父对象",
  "wn-key-pvg": "定制权限",
  "wn-key-race": "族类",
  "wn-key-sha1": "SHA1",
  "wn-key-thumb": "缩略图",
  "wn-key-title": "标题",
  "wn-key-tp": "类型",
  "wn-key-width": "宽",
  "wn-obj-nosaved": "您有未保存的对象",
  "wn-race-DIR": "目录",
  "wn-race-FILE": "文件",
  "wn-th-acc-pwd-choose-none": "请选择要重置密码的账号（可多选）",
  "wn-th-acc-pwd-done": "已经为${n}名用户重置了密码",
  "wn-th-acc-pwd-invalid": "密码中不得包含单双引号星号等非法字符",
  "wn-th-acc-pwd-reset-tip": "将密码重置为",
  "wn-th-acc-pwd-too-short": "您输入的密码过短，不能少于6位，最好为数字字母以及特殊字符的组合",
  "wn-invalid-mimes": "不支持的文件内容类型 \"${current}\"，仅能支持 \"${supports}\"",
  "wn-invalid-types": "不支持的文件扩展名 \"${current}\"，仅能支持 \"${supports}\""
});
////////////////////////////////////////////////////////////
// The End
})();