ti.config.set({
  prefix : {
    "api" : "/api/titanium/",
    "jslib" : "/gu/rs/core/js/"
  },
  alias : {
    "@jslib:jquery" : "@jslib:jquery/2.x/jquery.min.js"
  }
})
ti.use(['@api:test/now', 
        '@api:test/json', 
        '@api:test/demo.css'])
  .then(([now,json,css])=> {
    console.log("--------------------- now/json/css")
    console.log("now:", now)
    console.log("json:", json)
    console.log("css:", css)
  })


ti.use(()=>['!lib:@jslib:jquery',
        '@api:test/demo.js'])
  .then(([$jq, $mod]) => {
    console.log("--------------------- js")
    console.log("js loaded", $mod, $jq)
    console.log("jQuery:", window.jQuery)
    console.log("ti:", my.test.x, my.test.y)
  })