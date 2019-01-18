import {Ti} from "/gu/rs/ti/core/ti.mjs"
//---------------------------------------
Ti.Config.set({
  prefix : {
    "api" : "/api/titanium/",
    "jslib" : "/gu/rs/core/js/"
  },
  alias : {
    "@jslib:jquery" : "@jslib:jquery/2.x/jquery.min.js"
  }
})
Ti.Load(['@api:test/now', 
        '@api:test/json', 
        '@api:test/demo.css'])
  .then(([now,json,css])=> {
    console.log("--------------------- now/json/css")
    console.log("now:", now)
    console.log("json:", json)
    console.log("css:", css)
  })


Ti.Load(()=>['@jslib:jquery',
        '!mjs:@api:test/demo.js'])
  .then(([$jq, $mod]) => {
    console.log("--------------------- js")
    console.log("js loaded", $mod, $jq)
    console.log("jQuery:", window.jQuery)
    console.log("ti:", my.test())
  })