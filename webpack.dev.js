//
// webpack --config .\webpack.dev.js
//
const path = require("path");

module.exports = {
  mode: "development", //打包为开发模式
  entry: {
    "ti-core" : "./src/core/ti.mjs",
    "walnut"  : "./src/lib/walnut/walnut.mjs",
  },
  output: {
      path: path.resolve(__dirname, "./src/dist"),
      filename: "[name].js"
  },
  // module:{
  //   rules:[{
  //     test:/\.mjs$/,
  //     use:{
  //       loader:'babel-loader',
  //       options:{
  //         presets:[
  //           '@babel/preset-env'
  //         ],
  //         plugins:[
  //           '@babel/plugin-syntax-dynamic-import'
  //         ]
  //       }
  //     }
  //   }]
  // }
}