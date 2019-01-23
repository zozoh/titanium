import {Ti} from "/gu/rs/ti/core/ti.mjs"
//---------------------------------------
Ti.Config.set({
  prefix : {
    "app"   : "/a/load/",
    "theme" : "/gu/rs/ti/theme/",
    "my"    : "/a/load/ti.uie-test/",
    "jslib" : "/gu/rs/core/js/"
  },
  alias : {
    "@jslib:jquery" : "@jslib:jquery/2.x/jquery.min.js",
    "@my:"          : "@my:app.json",
    "^@theme:.+$"   : "$&.css",
    "^@app:[^\/]+$"           : "$&/app.json",
    "^@my:module\/[^\/]+$"    : "$&/module.json",
    "^@my:component\/[^\/]+$" : "$&/component.json"
  }
})
//---------------------------------------
// Ti.Load('@my:')
//   .then(info=> {
//     console.log("app info:", info)
//     //ti.app(info).init().then(console.log)
//     Ti.App(info).init().then(console.log)
//   })
//---------------------------------------
// Ti.App("@my:").then(app=>{
//   app.init().then(console.log)
// })
//---------------------------------------
async function main(){
  let app = await Ti.App("@my:")
  await app.init()
  console.log(app)
  app.mountTo("#app")
}
main()
