(function(){
//============================================================
// JOIN: page/catebar/page-catebar.html
//============================================================
Ti.Preload("com/page/catebar/page-catebar.html", `<div class="onchina-page-catebar"
  :class="TopClass">
  <div v-for="it in ItemList"
    class="bar-item"
    :class="it.className"
    @click.left="OnClickItem(it)">
    <a>{{it.text}}</a>
  </div>
</div>`);
//============================================================
// JOIN: page/catebar/page-catebar.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////
  props : {
    "name" : {
      type: String,
      default: "cate"
    },
    "value" : {
      type : String,
      default : null
    },
    "fixed" : {
      type : [Object, Array],
      default: ()=>[]
    },
    "options" : {
      type : Array,
      default: ()=>[]
    },
    "valueBy" : {
      type : [String, Function],
      default: "value|id|nm"
    },
    "textBy" : {
      type : [String, Function],
      default: "text|title"
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    getItemValue() {
      return Ti.Util.genItemValueGetter(this.valueBy, null)
    },
    //--------------------------------------
    getItemText() {
      return Ti.Util.genItemValueGetter(this.textBy, "Nil")
    },
    //--------------------------------------
    ItemList() {
      let list = []
      // Join fixeds
      let inputs = []
      if(this.fixed) {
        inputs = _.concat(this.fixed)
      }
      // Join Options
      if(!_.isEmpty(this.options)) {
        inputs.push(... this.options)
      }
      // parse in loop
      for(let it of inputs) {
        let text  = this.getItemText(it)
        let value = this.getItemValue(it)
        let className = value == this.value ? "is-current" : null
        list.push({text, value, className})
      }
      return list
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickItem({value}={}) {
      this.$notify("change", value)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
Ti.Preload("com/page/catebar/page-catebar.mjs", _M);
})();
//============================================================
// JOIN: page/catebar/_com.json
//============================================================
Ti.Preload("com/page/catebar/_com.json", {
  "name" : "onchina-page-catebar",
  "globally" : true,
  "template" : "./page-catebar.html",
  "mixins" : ["./page-catebar.mjs"]
});
//============================================================
// JOIN: page/footer/page-footer.html
//============================================================
Ti.Preload("com/page/footer/page-footer.html", `<div class="onchina-page-footer"
  :class="TopClass">
  <!--
    links & sharebar
  -->
  <div class="as-links">
    <!--Nav columns-->
    <WebNavColumns
      :items="links"
      :paht="path"
      spacing="comfy"
      align="center"
      border="none"/>
    <!--Sharebar-->
    <WebWidgetSharebar
      title="Like it? Share it!"
      :items="['facebook','twitter','instagram','tumblr']"/>
  </div>
  <!--
    Copy right
  -->
  <div class="as-bottom page-section">
    <div class="as-copyright">
      &copy; 2018 by TVOD. ALL RIGHT RESERVED.
      TERMS & CONDITIONS | PRIVACY POLICY
    </div>
    <div class="as-gotop">
      <a>GO TO TOP <i class="zmdi zmdi-long-arrow-up"></i></i></a>
    </div>
  </div>
</div>`);
//============================================================
// JOIN: page/footer/page-footer.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////
  props : {
    "links" : {
      type : Array,
      default : ()=>[]
    },
    "path" : {
      type : String,
      default: null
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    //--------------------------------------
  }
  //////////////////////////////////////////
}
Ti.Preload("com/page/footer/page-footer.mjs", _M);
})();
//============================================================
// JOIN: page/footer/_com.json
//============================================================
Ti.Preload("com/page/footer/_com.json", {
  "name" : "onchina-page-footer",
  "globally" : true,
  "template" : "./page-footer.html",
  "mixins" : ["./page-footer.mjs"]
});
//============================================================
// JOIN: vod/head/vod-head.html
//============================================================
Ti.Preload("com/vod/head/vod-head.html", `<div class="onchina-vod-head"
  :class="TopClass"
  :style="CoverVideo.style">
  <div class="as-info">
    <h1>{{CoverVideo.title}}</h1>
    <blockquote>{{CoverVideo.brief}}</blockquote>
    <div class="as-actions">
      <div class="as-btn is-watch is-on" @click.left="OnWatchNow">WATCH NOW</div>
      <div class="as-btn is-favor is-off"><i class="far fa-heart"></i></div>
    </div>
  </div>
</div>`);
//============================================================
// JOIN: vod/head/vod-head.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////
  props : {
    "base": {
      type: String,
      default: "/"
    },
    "apiBase": {
      type: String,
      default: "/"
    },
    "video": {
      type: Object,
      default: undefined
    },
    "height": {
      type: Number,
      default: 980
    },
    "fakeImage": {
      type: String,
      default: "img/home-cover.jpg"
    },
    "fakeHeight": {
      type: Number,
      default: 1366
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass(this.CoverVideo.className)
    },
    //--------------------------------------
    CoverVideo() {
      if(!_.isEmpty(this.video)) {
        return {
          className: "as-video",
          title: this.video.title,
          brief: this.video.brief,
          style: {
            height: Ti.Css.toSize(this.height),
            backgroundImage: `url("${this.apiBase}thumb?${this.video.poster}")`
          }
        }
      }
      // Use fake
      if(_.isNull(this.video)) {
        return {
          className: "as-fake",
          title: "UNFORGETTABLE",
          brief: "Live tour continues with new international dates just added",
          style: {
            height: Ti.Css.toSize(this.fakeHeight),
            backgroundImage: `url("${Ti.Util.appendPath(this.base, this.fakeImage)}")`
          }
        }
      }
      // Use default
      return {
        className: "as-empty"
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnWatchNow() {
      let id = _.get(this.video, "id")
      if(id) {
        this.$notify("play", id)
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
Ti.Preload("com/vod/head/vod-head.mjs", _M);
})();
//============================================================
// JOIN: vod/head/_com.json
//============================================================
Ti.Preload("com/vod/head/_com.json", {
  "name" : "onchina-vod-head",
  "globally" : true,
  "template" : "./vod-head.html",
  "mixins" : ["./vod-head.mjs"]
});
//============================================================
// JOIN: vod/home/vod-home.html
//============================================================
Ti.Preload("com/vod/home/vod-home.html", `<div class="onchina-vod-home"
  :class="TopClass">
  <!--
    Cover
  -->
  <OnchinaVodHead
    :base="base"
    :api-base="apiBase"
    :video="myCover"/>
  <!--
    Topics
  -->
  <div
    v-for="top in myTopics"
      class="as-section"
      :key="top.key"
      :class="top.className">
      <!--
        Title
      -->
      <h2 :style="top.headStyle"><span>{{top.title}}::</span></h2>
      <!--
        Boxes
      -->
      <div
        v-if="!top.isEmpty"
          class="as-boxes"
          :style="top.boxStyle">
          <VodSpecialTile
            v-for="it in top.items"
              class="as-box-item"
              :class="it.className"
              :key="it.id"
              :style="it.style"
              :base="base"
              :api-base="apiBase"
              :value="it.video"
              preview-key="poster"/>
      </div>
      <!--
        Button
      -->
      <div
        v-if="!top.isEmpty"
          class="at-foot"
          :style="top.headStyle"
          @click.left="$notify('more')">
          <span class="as-btn">View all::</span></div>
  </div>
  
</div>`);
//============================================================
// JOIN: vod/home/vod-home.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////
  data: ()=>({
    myCover: undefined,
    myTopics: []
  }),
  //////////////////////////////////////////
  props : {
    "base": {
      type: String,
      default: "/"
    },
    "apiBase": {
      type: String,
      default: "/"
    },
    "videos": {
      type: Array,
      default: ()=>[]
    },
    "coverTopic": {
      type: String,
      default: "COVER"
    },
    "topics": {
      type: Object,
      default: ()=>({
        "RELEASES"  : {at:0, title:"New Releases",
            width: 1170,
            boxHeight: 800,
            boxes:[
              {top:0,   left:0,   width:420, height:196},
              {top:200, left:0,   width:420, height:196},
              {top:400, left:0,   width:420, height:196},
              {top:600, left:0,   width:420, height:196},
              {top:0,   left:440, width:730, height:645}]},
        "POPULAR"   : {at:1, title:"Most Popular",
            width: 977,
            boxHeight: 850,
            boxes:[
              {top:235, left:0,   width:288, height:286},
              {top:544, left:0,   width:288, height:286},
              {top:78,  left:312, width:357, height:361},
              {top:464, left:312, width:357, height:357},
              {top:0,   left:694, width:284, height:335},
              {top:358, left:694, width:284, height:286}]},
        "SUNSHINE"  : {at:2, title:"Summer Sunshine",
            width: 977,
            boxHeight: 847,
            boxes:[
              {top:0,   left:0,   width:288, height:286},
              {top:313, left:0,   width:288, height:286},
              {top:74,  left:310, width:357, height:361},
              {top:459, left:310, width:357, height:357},
              {top:203, left:694, width:284, height:335},
              {top:561, left:694, width:284, height:286}]},
        "SURPRISE"  : {at:3, title:"Surprise Me",
            width: 977,
            boxHeight: 850,
            boxes:[
              {top:259, left:0,   width:288, height:286},
              {top:568, left:0,   width:288, height:286},
              {top:78,  left:312, width:357, height:361},
              {top:464, left:312, width:357, height:357},
              {top:0,   left:694, width:284, height:335},
              {top:358, left:694, width:284, height:286}]},
        "RECOMMEND" : {at:4, title:"Most Recommend",
            width: 980,
            boxHeight: 688,
            boxes:[
              {top:324, left:0,   width:310, height:267},
              {top:200, left:335, width:310, height:389},
              {top:0,   left:671, width:310, height:389},
              {top:420, left:671, width:310, height:267}]}
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
    CoverVideo() {
      if(this.myCover) {
        return {
          className: "as-video",
          title: this.myCover.title,
          brief: this.myCover.brief,
          style: {
            backgroundImage: `url("${this.apiBase}thumb?${this.myCover.poster}")`
          }
        }
      }
      // Use fake
      if(_.isNull(this.myCover)) {
        return {
          className: "as-fake",
          title: "UNFORGETTABLE",
          brief: "Live tour continues with new international dates just added"
        }
      }
      // Use default
      return {
        className: "as-empty"
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    evalVideoTopics() {
      // Guard
      if(_.isEmpty(this.videos)) {
        return
      }
      let list = [];
      let cover = null;
      // Init items
      _.forEach(this.topics, (topic, tpkey) => {
        let {at} = topic
        list[at] = {
          key: tpkey,
          className: `at-${at}`,
          ..._.pick(topic, "at", "title"),
          headStyle: Ti.Css.toStyle({
            width  : topic.width
          }),
          boxStyle: Ti.Css.toStyle({
            width  : topic.width,
            height : topic.boxHeight
          }),
          pageSize: topic.boxes.length,
          items: []
        }
      })
      // Join videos
      _.forEach(this.videos, (video, index) => {
        let tpkey = video.home_topic
        // Cover
        if(tpkey == this.coverTopic) {
          cover = video
          return
        }
        // Match topic
        let topic = this.topics[tpkey]
        if(topic) {
          let {at} = topic
          let tobj = _.nth(list, at)
          let vbox = _.nth(topic.boxes, (tobj.items.length % tobj.pageSize))
          let className = vbox.height > 600
            ? "is-big-text"
            : (vbox.height > 350 ? "is-mid-text" : "is-small-text")
          tobj.items.push({
            id: video.id,
            title: video.title,
            className,
            style: Ti.Css.toStyle(_.assign({
                ...vbox
            })),
            video
          })
          list[at] = tobj
        }
      })
      // Update list
      for(let tobj of list) {
        tobj.isEmpty = _.isEmpty(tobj.items)
      }
      // Update data
      this.myCover = cover
      this.myTopics = list
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "videos": {
      handler: "evalVideoTopics",
      immediate: true
    }
  }
  //////////////////////////////////////////
}
Ti.Preload("com/vod/home/vod-home.mjs", _M);
})();
//============================================================
// JOIN: vod/home/_com.json
//============================================================
Ti.Preload("com/vod/home/_com.json", {
  "name" : "onchina-vod-home",
  "globally" : true,
  "template" : "./vod-home.html",
  "mixins" : ["./vod-home.mjs"]
});
//============================================================
// JOIN: vod/last/vod-last.html
//============================================================
Ti.Preload("com/vod/last/vod-last.html", `<div class="onchina-vod-last"
  :class="TopClass">
  <!--
    Cover
  -->
  <OnchinaVodHead
    :base="base"
    :api-base="apiBase"
    :video="HeadCover"
    :height="800"
    :fake-height="800"
    fake-image="img/last-cover.jpg"/>
  <!--
    Groups
  -->
  <div
    v-for="grp in myGroups"
      class="page-section">
      <!--Heading-->
      <WebTextHeading
        :title="grp.text"
        :icon="grp.icon"
        :value="grp.value"
        more="To view more"/>
      <!--Wall-->
      <WebShelfScroller
        :data="grp.list"
        :cols="4"
        :com-type="WallTileType"
        :com-conf="WallTileConf"/>
  </div>
  <!--
    Specials
  -->
  <OnchinaVodSpecial
    :base="base"
    :api-base="apiBase"
    :data="mySpecials"/>
</div>`);
//============================================================
// JOIN: vod/last/vod-last.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////
  data: ()=>({
    myCovers: null,
    myGroups: [],
    mySpecials: []
  }),
  //////////////////////////////////////////
  props : {
    "base": {
      type: String,
      default: "/"
    },
    "apiBase": {
      type: String,
      default: "/"
    },
    "cdnBase": {
      type: String,
      default: "/"
    },
    "videos": {
      type: Array,
      default: ()=>[]
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    HeadCover() {
      if(this.myCovers) {
        return _.nth(this.myCovers, 0) || null
      }
    },
    //--------------------------------------
    WallTileType() {
      return  "OnchinaVodTile"
    },
    //--------------------------------------
    WallTileConf() {
      return {
        "apiBase" : this.apiBase,
        "cdnBase" : this.cdnBase
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    evalVideos() {
      // Guard
      if(_.isEmpty(this.videos)) {
        return
      }
      // Prepare
      let covers = []
      let groups = []
      let specials = []

      // Search videos
      _.forEach(this.videos, vg => {
        let list = []
        for(let video of vg.list) {
          // 加入头图序列
          if("head" == video.in_last) {
            covers.push(video)
          }
          // 特别关注
          else if("special" == video.in_last) {
            specials.push(video)
          }
          // 其他的加入到组
          else {
            list.push(video)
          }
        }
        // 空组就无视咯
        if(!_.isEmpty(list)) {
          groups.push({
            icon  : vg.icon,
            sort  : vg.sort,
            text  : vg.text,
            value : vg.value,
            list
          })
        }
      })

      // 针对分组列表，排序，越小的越靠前
      groups.sort((g1, g2)=>{
        if(isNaN(g2.sort)) {
          return -1
        }
        return g1.sort - g2.sort
      })

      // Update
      this.myCovers = covers;
      this.myGroups = groups;
      this.mySpecials = specials;
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "videos": {
      handler: "evalVideos",
      immediate: true
    }
  }
  //////////////////////////////////////////
}
Ti.Preload("com/vod/last/vod-last.mjs", _M);
})();
//============================================================
// JOIN: vod/last/_com.json
//============================================================
Ti.Preload("com/vod/last/_com.json", {
  "name" : "onchina-vod-last",
  "globally" : true,
  "template" : "./vod-last.html",
  "mixins" : ["./vod-last.mjs"]
});
//============================================================
// JOIN: vod/player/vod-player.html
//============================================================
Ti.Preload("com/vod/player/vod-player.html", `<div class="onchina-vod-player"
  :class="TopClass">
  <template v-if="isReadyToPlay">
    <NetAliyunVodVideoPlayer
      class="ti-fill-parent"
      :autoplay="autoplay"
      :video-id="videoId"
      :cover-url="coverUrl"
      :play-auth="playAuth"
      :encrypt-type="encryptType"/>
  </template>
  <ti-loading 
    v-else
      icon="zmdi-refresh zmdi-hc-spin"
      :text="null"/>
</div>`);
//============================================================
// JOIN: vod/player/vod-player.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////
  props : {
    "autoplay": {
      type: Boolean,
      default: false
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
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    isReadyToPlay() {
      return this.videoId && this.playAuth && this.coverUrl
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
  }
  //////////////////////////////////////////
}
Ti.Preload("com/vod/player/vod-player.mjs", _M);
})();
//============================================================
// JOIN: vod/player/_com.json
//============================================================
Ti.Preload("com/vod/player/_com.json", {
  "name" : "onchina-vod-player",
  "globally" : true,
  "template" : "./vod-player.html",
  "mixins" : ["./vod-player.mjs"]
});
//============================================================
// JOIN: vod/scorebar/vod-scorebar.html
//============================================================
Ti.Preload("com/vod/scorebar/vod-scorebar.html", `<div class="onchina-vod-scorebar"
  :class="TopClass">
  <!--
    Title
  -->
  <div
    v-if="VideoTitle"
      class="as-title"
      >{{VideoTitle}}</div>
  <!--
    List
  -->
  <div class="as-score">
    <div class="as-count">{{ScoreCount}} scores</div>
    <div class="as-stars">
      <i v-for="ss in ScoreStars" :class="ss"></i>
    </div>
    <div>Did not score</div>
  </div>
</div>`);
//============================================================
// JOIN: vod/scorebar/vod-scorebar.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////
  props : {
    "apiBase": {
      type: String,
      default: "/"
    },
    "video": {
      type: Object,
      default: ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    VideoTitle() {
      return _.get(this.video, "title");
    },
    //--------------------------------------
    ScoreCount() {
      return _.get(this.video, "score_count") || 0
    },
    //--------------------------------------
    // 0 - 100
    ScoreValue() {
      let v =  _.get(this.video, "score_val") || 70
      if(isNaN(v)){
        return 70
      }
      return _.clamp(v, 0, 100)
    },
    //--------------------------------------
    ScoreStars() {
      let list = []
      let score = this.ScoreValue
      console.log(score)
      for(let i=1; i<=5; i++) {
        let max = i * 20
        let mid = (i-1) * 20 + 10
        // Full
        if(score>=max) {
          list.push("fas fa-star")
        }
        // Half
        else if(score>=mid) {
          list.push("fas fa-star-half-alt")
        }
        // Empty
        else {
          list.push("far fa-star")
        }
      }
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
Ti.Preload("com/vod/scorebar/vod-scorebar.mjs", _M);
})();
//============================================================
// JOIN: vod/scorebar/_com.json
//============================================================
Ti.Preload("com/vod/scorebar/_com.json", {
  "name" : "onchina-vod-scorebar",
  "globally" : true,
  "template" : "./vod-scorebar.html",
  "mixins" : ["./vod-scorebar.mjs"]
});
//============================================================
// JOIN: vod/sidelist/vod-sidelist.html
//============================================================
Ti.Preload("com/vod/sidelist/vod-sidelist.html", `<div class="onchina-vod-sidelist"
  :class="TopClass">
  <!--
    Title
  -->
  <div
    v-if="title"
      class="as-title"
      >{{title}}</div>
  <!--
    List
  -->
  <div class="as-list">
    <div
      v-for="it in items"
        class="as-item"
        @click.left="OnClickPreview(it)">
        <!--Preview-->
        <div class="as-preview">
          <!--Preview image-->
          <img :src="PreviewCover(it)"/>
          <!--Duration-->
          <div class="as-duration">
            <span>{{DurationText(it)}}</span>
          </div>
          <!--Preview icon-->
          <div class="as-btn">
            <i class="fas fa-play-circle"></i>
          </div>
        </div>
        <!--Info-->
        <div class="as-info">
          <div class="as-title">{{it.title}}</div>
          <div class="as-brief">{{it.brief}}</div>
          <div class="as-score">
            <i class="fas fa-fire-alt"></i>
            <span>{{it.score_count || 0}}</span>
          </div>
        </div>
    </div>
  </div>
</div>`);
//============================================================
// JOIN: vod/sidelist/vod-sidelist.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////
  props : {
    "apiBase": {
      type: String,
      default: "/"
    },
    "title": {
      type: String,
      default: null
    },
    "items": {
      type: Array,
      default: ()=>[]
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    PreviewCover({thumb}={}) {
      return `${this.apiBase}thumb?${thumb}`;
    },
    //--------------------------------------
    DurationText({vod_duration=0}={}) {
      return Ti.Types.formatTime(vod_duration*1000, "HH:mm:ss");
    },
    //--------------------------------------
    OnClickPreview({id}={}) {
      if(id) {
        this.$notify("play", id)
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
Ti.Preload("com/vod/sidelist/vod-sidelist.mjs", _M);
})();
//============================================================
// JOIN: vod/sidelist/_com.json
//============================================================
Ti.Preload("com/vod/sidelist/_com.json", {
  "name" : "onchina-vod-sidelist",
  "globally" : true,
  "template" : "./vod-sidelist.html",
  "mixins" : ["./vod-sidelist.mjs"]
});
//============================================================
// JOIN: vod/special/tile/special-tile.html
//============================================================
Ti.Preload("com/vod/special/tile/special-tile.html", `<div class="onchina-special-tile"
  :class="TopClass">
  <!--
    Preview
  -->
  <div class="as-preview">
    <img :src="PreviewCover"/>
  </div>
  <!--
    Play Cover
  -->
  <div class="as-mask" @click.left="OnClickPreview">
    <!--
      Play Icon
    -->
    <div class="as-play-icon"><i class="zmdi zmdi-play-circle-outline"></i></div>
    <!--Duration-->
    <div
      v-if="DurationText"
        class="as-duration"><span>{{DurationText}}</span></div>
    <!--Title-->
    <div
      v-if="TheTitle"
        class="as-title">{{TheTitle}}</div>
    <!--Brief-->
    <div
      v-if="TheBrief"
        class="as-brief">{{TheBrief}}</div>
    <!--Spacing-->
    <div class="as-spacing"></div>
    <!--
      Actions
    -->
    <div class="as-actions">
      <div class="as-btn is-on"><span>ADD TO PLAYLIST</span></div>
      <div class="as-btn is-off">
        <i class="zmdi zmdi-favorite-outline"></i>
      </div>
    </div>
  </div>
</div>`);
//============================================================
// JOIN: vod/special/tile/special-tile.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////
  props : {
    "value" : {
      type : Object,
      default : ()=>({})
    },
    "apiBase": {
      type: String,
      default: "/"
    },
    "cdnBase": {
      type: String,
      default: undefined
    },
    "previewKey": {
      type: String,
      default: "thumb"
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    PreviewCover() {
      return `${this.apiBase}thumb?${this.value[this.previewKey]}`
    },
    //--------------------------------------
    TheTitle() {
      return Ti.Util.getOrPick(this.value, "title|nm")
    },
    //--------------------------------------
    TheBrief() {
      return _.get(this.value, "brief")
    },
    //--------------------------------------
    DurationText() {
      let du = _.get(this.value, "vod_duration");
      return Ti.Types.formatTime(du*1000, "HH:mm:ss");
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickPreview(){
      //console.log(this.value)
      this.$notify("play", _.get(this.value, "id"))
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
Ti.Preload("com/vod/special/tile/special-tile.mjs", _M);
})();
//============================================================
// JOIN: vod/special/tile/_com.json
//============================================================
Ti.Preload("com/vod/special/tile/_com.json", {
  "name" : "vod-special-tile",
  "globally" : true,
  "template" : "./special-tile.html",
  "mixins" : ["./special-tile.mjs"]
});
//============================================================
// JOIN: vod/special/vod-special.html
//============================================================
Ti.Preload("com/vod/special/vod-special.html", `<div class="onchina-vod-special page-section"
  :class="TopClass">
  <!--=======================================-->
  <WebTextHeading
    title="SPECIAL FEATURES"
    icon="zmdi-star-circle"
    value="special"
    more="To view more"/>
  <!--=======================================-->
  <div class="special-wall">
    <div
      v-for="it in ItemList"
        class="wall-box"
        :key="it.key"
        :style="it.style">
        <VodSpecialTile
          v-bind="it.comConf"/>
    </div>
  </div>
  <!--=======================================-->
</div>`);
//============================================================
// JOIN: vod/special/vod-special.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////
  props : {
    "base": {
      type: String,
      default: "/"
    },
    "apiBase": {
      type: String,
      default: "/"
    },
    "data" : {
      type : Array,
      default : ()=>[]
    },
    // Item count per-row
    "cols" : {
      type : Array,
      default : ()=>[
        "25%", "50%", "25%", 
        "61.8%", "38.2%"
      ]
    },
    // Item count per-row
    "rows" : {
      type : Array,
      default : ()=>[
        388, 388, 388, 
        288, 288]
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    ItemList() {
      if(!_.isArray(this.data))
        return []
      
      let list = []      
      for(let i=0; i < this.data.length; i++) {
        let it = this.data[i]
        let w = this.cols[Ti.Num.scrollIndex(i, this.cols.length)]
        let h = this.rows[Ti.Num.scrollIndex(i, this.rows.length)]
        list.push({
          key: `It-${i}`,
          style: {
            width : Ti.Css.toSize(w),
            height: Ti.Css.toSize(h)
          },
          comConf: {
            base: this.base,
            apiBase: this.apiBase,
            value: it
          }
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
Ti.Preload("com/vod/special/vod-special.mjs", _M);
})();
//============================================================
// JOIN: vod/special/_com.json
//============================================================
Ti.Preload("com/vod/special/_com.json", {
  "name" : "onchina-vod-special",
  "globally" : true,
  "template" : "./vod-special.html",
  "mixins" : ["./vod-special.mjs"]
});
//============================================================
// JOIN: vod/tile/vod-tile.html
//============================================================
Ti.Preload("com/vod/tile/vod-tile.html", `<div class="onchina-vod-tile"
  :class="TopClass">
  <!--
    Preview Cover
  -->
  <div class="as-preview">
    <!--
      Preview img
    -->
    <img :src="PreviewCover"/>
    <!--
      Duration
    -->
    <div
      v-if="DurationText"
        class="as-duration">
          <span>{{DurationText}}</span>
    </div>
    <!--
      Play Cover
    -->
    <div class="as-btn" @click.left="OnClickPreview">
      <i class="fas fa-play-circle"></i>
    </div>
  </div>
  <!--
    Brief
  -->
  <div
    v-if="TheBrief"
      class="as-brief">{{TheBrief}}</div>
  <!--
    Title
  -->
  <div
    v-if="TheTitle"
      class="as-title">{{TheTitle}}</div>
  <!--
    Actions
  -->
  <div class="as-actions">
    <div class="as-btn is-add-playlist"><span>ADD TO PLAYLIST</span></div>
    <div class="as-btn is-like">
      <i class="zmdi zmdi-favorite-outline"></i>
    </div>
  </div>
  <!--
    Labels
  -->
</div>`);
//============================================================
// JOIN: vod/tile/vod-tile.mjs
//============================================================
(function(){
const _M = {
  //////////////////////////////////////////
  props : {
    "value" : {
      type : Object,
      default : ()=>({})
    },
    "apiBase": {
      type: String,
      default: "/"
    },
    "cdnBase": {
      type: String,
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
    PreviewCover() {
      return `${this.apiBase}thumb?${this.value.thumb}`
    },
    //--------------------------------------
    TheTitle() {
      return Ti.Util.getOrPick(this.value, "title|nm")
    },
    //--------------------------------------
    TheBrief() {
      return _.get(this.value, "brief")
    },
    //--------------------------------------
    DurationText() {
      let du = _.get(this.value, "vod_duration");
      return Ti.Types.formatTime(du*1000, "HH:mm:ss");
    },
    //--------------------------------------
    isVIP() {
      return this.price > 0
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickPreview(){
      //console.log(this.value)
      this.$notify("play", _.get(this.value, "id"))
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
Ti.Preload("com/vod/tile/vod-tile.mjs", _M);
})();
//============================================================
// JOIN: vod/tile/_com.json
//============================================================
Ti.Preload("com/vod/tile/_com.json", {
  "name" : "onchina-vod-tile",
  "globally" : true,
  "template" : "./vod-tile.html",
  "mixins" : ["./vod-tile.mjs"]
});
//============================================================
// JOIN: zh-cn/all.i18n.json
//============================================================
Ti.Preload("i18n/zh-cn/all.i18n.json", {}
{});
////////////////////////////////////////////////////////////
// The End
})();