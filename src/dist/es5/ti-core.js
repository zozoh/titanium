"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Ti = void 0;

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

//##################################################
// # import {Alert}   from "./ti-alert.mjs"
var _ref = function () {
  ////////////////////////////////////////////////
  function TiAlert() {
    return _TiAlert.apply(this, arguments);
  } ////////////////////////////////////////////////


  function _TiAlert() {
    _TiAlert = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var msg,
          _ref2,
          title,
          icon,
          _ref2$type,
          type,
          _ref2$textOk,
          textOk,
          _ref2$position,
          position,
          _ref2$width,
          width,
          height,
          _ref2$vars,
          vars,
          text,
          theIcon,
          theTitle,
          _args = arguments;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              msg = _args.length > 0 && _args[0] !== undefined ? _args[0] : "";
              _ref2 = _args.length > 1 && _args[1] !== undefined ? _args[1] : {}, title = _ref2.title, icon = _ref2.icon, _ref2$type = _ref2.type, type = _ref2$type === void 0 ? "track" : _ref2$type, _ref2$textOk = _ref2.textOk, textOk = _ref2$textOk === void 0 ? "i18n:ok" : _ref2$textOk, _ref2$position = _ref2.position, position = _ref2$position === void 0 ? "center" : _ref2$position, _ref2$width = _ref2.width, width = _ref2$width === void 0 ? 480 : _ref2$width, height = _ref2.height, _ref2$vars = _ref2.vars, vars = _ref2$vars === void 0 ? {} : _ref2$vars;
              //............................................
              text = Ti.I18n.textf(msg, vars);
              theIcon = icon || Ti.Icons.get(type, "zmdi-info");
              theTitle = title || Ti.I18n.get(type); //............................................

              _context.next = 7;
              return Ti.App.Open({
                //------------------------------------------
                type: type,
                width: width,
                height: height,
                position: position,
                title: theTitle,
                closer: false,
                actions: [{
                  text: textOk,
                  handler: function handler() {
                    return true;
                  }
                }],
                //------------------------------------------
                comType: "modal-inner-body",
                comConf: {
                  icon: theIcon,
                  text: text
                },
                //------------------------------------------
                components: {
                  name: "modal-inner-body",
                  globally: false,
                  props: {
                    "icon": undefined,
                    "text": undefined
                  },
                  template: "<div class=\"ti-msg-body as-alert\">\n          <div class=\"as-icon\"><ti-icon :value=\"icon\"/></div>\n          <div class=\"as-text\">{{text}}</div>\n        </div>"
                } //------------------------------------------

              });

            case 7:
              return _context.abrupt("return", _context.sent);

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
    return _TiAlert.apply(this, arguments);
  }

  return {
    Alert: TiAlert
  };
}(),
    Alert = _ref.Alert; //##################################################
// # import {Confirm} from "./ti-confirm.mjs"


var _ref3 = function () {
  ////////////////////////////////////////////////
  function TiConfirm() {
    return _TiConfirm.apply(this, arguments);
  } ////////////////////////////////////////////////


  function _TiConfirm() {
    _TiConfirm = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var msg,
          _ref4,
          title,
          icon,
          _ref4$closer,
          closer,
          _ref4$type,
          type,
          _ref4$position,
          position,
          _ref4$textYes,
          textYes,
          _ref4$textNo,
          textNo,
          _ref4$width,
          width,
          height,
          text,
          theIcon,
          theTitle,
          _args2 = arguments;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              msg = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : "";
              _ref4 = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : {}, title = _ref4.title, icon = _ref4.icon, _ref4$closer = _ref4.closer, closer = _ref4$closer === void 0 ? false : _ref4$closer, _ref4$type = _ref4.type, type = _ref4$type === void 0 ? "warn" : _ref4$type, _ref4$position = _ref4.position, position = _ref4$position === void 0 ? "center" : _ref4$position, _ref4$textYes = _ref4.textYes, textYes = _ref4$textYes === void 0 ? "i18n:yes" : _ref4$textYes, _ref4$textNo = _ref4.textNo, textNo = _ref4$textNo === void 0 ? "i18n:no" : _ref4$textNo, _ref4$width = _ref4.width, width = _ref4$width === void 0 ? 480 : _ref4$width, height = _ref4.height;
              //............................................
              text = Ti.I18n.text(msg);
              theIcon = icon || "zmdi-help";
              theTitle = title || "i18n:confirm"; //............................................

              _context2.next = 7;
              return Ti.App.Open({
                //------------------------------------------
                type: type,
                width: width,
                height: height,
                position: position,
                title: theTitle,
                closer: closer,
                actions: [{
                  text: textYes,
                  handler: function handler() {
                    return true;
                  }
                }, {
                  text: textNo,
                  handler: function handler() {
                    return false;
                  }
                }],
                //------------------------------------------
                comType: "modal-inner-body",
                comConf: {
                  icon: theIcon,
                  text: text
                },
                //------------------------------------------
                components: {
                  name: "modal-inner-body",
                  globally: false,
                  props: {
                    "icon": undefined,
                    "text": undefined
                  },
                  template: "<div class=\"ti-msg-body as-confirm\">\n          <div class=\"as-icon\"><ti-icon :value=\"icon\"/></div>\n          <div class=\"as-text\">{{text}}</div>\n        </div>"
                } //------------------------------------------

              });

            case 7:
              return _context2.abrupt("return", _context2.sent);

            case 8:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));
    return _TiConfirm.apply(this, arguments);
  }

  return {
    Confirm: TiConfirm
  };
}(),
    Confirm = _ref3.Confirm; //##################################################
// # import {Prompt}  from "./ti-prompt.mjs"


var _ref5 = function () {
  ////////////////////////////////////////////////
  function TiPrompt() {
    return _TiPrompt.apply(this, arguments);
  } ////////////////////////////////////////////////


  function _TiPrompt() {
    _TiPrompt = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var msg,
          _ref6,
          _ref6$title,
          title,
          icon,
          _ref6$type,
          type,
          _ref6$position,
          position,
          iconOk,
          iconCancel,
          _ref6$textOk,
          textOk,
          _ref6$textCancel,
          textCancel,
          _ref6$width,
          width,
          height,
          _ref6$trimed,
          trimed,
          _ref6$placeholder,
          placeholder,
          _ref6$valueCase,
          valueCase,
          _ref6$value,
          value,
          text,
          theIcon,
          _args3 = arguments;

      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              msg = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : "";
              _ref6 = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : {}, _ref6$title = _ref6.title, title = _ref6$title === void 0 ? "i18n:prompt" : _ref6$title, icon = _ref6.icon, _ref6$type = _ref6.type, type = _ref6$type === void 0 ? "info" : _ref6$type, _ref6$position = _ref6.position, position = _ref6$position === void 0 ? "center" : _ref6$position, iconOk = _ref6.iconOk, iconCancel = _ref6.iconCancel, _ref6$textOk = _ref6.textOk, textOk = _ref6$textOk === void 0 ? "i18n:ok" : _ref6$textOk, _ref6$textCancel = _ref6.textCancel, textCancel = _ref6$textCancel === void 0 ? "i18n:cancel" : _ref6$textCancel, _ref6$width = _ref6.width, width = _ref6$width === void 0 ? 480 : _ref6$width, height = _ref6.height, _ref6$trimed = _ref6.trimed, trimed = _ref6$trimed === void 0 ? true : _ref6$trimed, _ref6$placeholder = _ref6.placeholder, placeholder = _ref6$placeholder === void 0 ? "" : _ref6$placeholder, _ref6$valueCase = _ref6.valueCase, valueCase = _ref6$valueCase === void 0 ? null : _ref6$valueCase, _ref6$value = _ref6.value, value = _ref6$value === void 0 ? "" : _ref6$value;
              //............................................
              text = Ti.I18n.text(msg);
              theIcon = icon || "zmdi-keyboard"; //............................................

              _context3.next = 6;
              return Ti.App.Open({
                //------------------------------------------
                type: type,
                width: width,
                height: height,
                position: position,
                title: title,
                closer: false,
                result: value,
                //------------------------------------------
                textOk: textOk,
                textCancel: textCancel,
                iconOk: iconOk,
                iconCancel: iconCancel,
                //------------------------------------------
                comType: "modal-inner-body",
                //------------------------------------------
                components: [{
                  name: "modal-inner-body",
                  globally: false,
                  data: {
                    // display
                    icon: theIcon,
                    text: text,
                    // for input
                    placeholder: placeholder || value,
                    trimed: trimed,
                    valueCase: valueCase
                  },
                  props: {
                    value: null
                  },
                  template: "<div class=\"ti-msg-body as-prompt\"\n          v-ti-activable>\n          <div class=\"as-icon\"><ti-icon :value=\"icon\"/></div>\n          <div class=\"as-text\">\n            <div class=\"as-tip\" v-if=\"text\">{{text}}</div>\n            <ti-input\n              :value=\"value\"\n              :trimed=\"trimed\"\n              :placeholder=\"placeholder\"\n              :value-case=\"valueCase\"\n              :focused=\"true\"\n              :auto-select=\"true\"\n              @inputing=\"onInputing\"/>\n          </div>\n        </div>",
                  methods: {
                    onInputing: function onInputing(val) {
                      this.$emit("change", val);
                    },
                    __ti_shortcut: function __ti_shortcut(uniqKey) {
                      if ("ENTER" == uniqKey) {
                        Ti.App(this).$vm().close(this.value);
                      }
                    }
                  }
                }, "@com:ti/input"] //------------------------------------------

              });

            case 6:
              return _context3.abrupt("return", _context3.sent);

            case 7:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));
    return _TiPrompt.apply(this, arguments);
  }

  return {
    Prompt: TiPrompt
  };
}(),
    Prompt = _ref5.Prompt; //##################################################
// # import {Captcha} from "./ti-captcha.mjs"


var _ref7 = function () {
  ////////////////////////////////////////////////
  function TiCaptcha() {
    return _TiCaptcha.apply(this, arguments);
  } ////////////////////////////////////////////////


  function _TiCaptcha() {
    _TiCaptcha = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var src,
          _ref8,
          _ref8$title,
          title,
          _ref8$type,
          type,
          _ref8$position,
          position,
          iconOk,
          iconCancel,
          _ref8$textOk,
          textOk,
          _ref8$textCancel,
          textCancel,
          _ref8$width,
          width,
          height,
          imgWidth,
          _ref8$imgHeight,
          imgHeight,
          _ref8$textChange,
          textChange,
          _ref8$placeholder,
          placeholder,
          _args4 = arguments;

      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              src = _args4.length > 0 && _args4[0] !== undefined ? _args4[0] : "";
              _ref8 = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : {}, _ref8$title = _ref8.title, title = _ref8$title === void 0 ? "i18n:captcha-tip" : _ref8$title, _ref8$type = _ref8.type, type = _ref8$type === void 0 ? "info" : _ref8$type, _ref8$position = _ref8.position, position = _ref8$position === void 0 ? "center" : _ref8$position, iconOk = _ref8.iconOk, iconCancel = _ref8.iconCancel, _ref8$textOk = _ref8.textOk, textOk = _ref8$textOk === void 0 ? "i18n:ok" : _ref8$textOk, _ref8$textCancel = _ref8.textCancel, textCancel = _ref8$textCancel === void 0 ? "i18n:cancel" : _ref8$textCancel, _ref8$width = _ref8.width, width = _ref8$width === void 0 ? 420 : _ref8$width, height = _ref8.height, imgWidth = _ref8.imgWidth, _ref8$imgHeight = _ref8.imgHeight, imgHeight = _ref8$imgHeight === void 0 ? 50 : _ref8$imgHeight, _ref8$textChange = _ref8.textChange, textChange = _ref8$textChange === void 0 ? "i18n:captcha-chagne" : _ref8$textChange, _ref8$placeholder = _ref8.placeholder, placeholder = _ref8$placeholder === void 0 ? "i18n:captcha" : _ref8$placeholder;
              _context4.next = 4;
              return Ti.App.Open({
                //------------------------------------------
                type: type,
                width: width,
                height: height,
                position: position,
                title: title,
                closer: false,
                result: "",
                //------------------------------------------
                textOk: textOk,
                textCancel: textCancel,
                iconOk: iconOk,
                iconCancel: iconCancel,
                //------------------------------------------
                comType: "modal-inner-body",
                //------------------------------------------
                components: [{
                  name: "modal-inner-body",
                  globally: false,
                  data: {
                    src: src,
                    timestamp: Date.now(),
                    // display
                    imgWidth: imgWidth,
                    imgHeight: imgHeight,
                    textChange: textChange,
                    // for input
                    placeholder: placeholder || value
                  },
                  props: {
                    value: null
                  },
                  template: "<div class=\"web-simple-form\">\n          <header style=\"padding-bottom:0;\">\n            <img ref=\"pic\"\n              v-if=\"src\"\n                :style=\"CaptchaStyle\"\n                :src=\"CaptchaSrc\"\n                @load=\"OnImgLoaded\"/>\n          </header>\n          <section>\n            <div class=\"as-input\">\n              <input ref=\"input\"\n                spellcheck=\"false\"\n                :placeholder=\"placeholder|i18n\"\n                :value=\"value\"\n                @input=\"$emit('change', $refs.input.value)\">\n              <span @click=\"timestamp = Date.now()\">\n                <a>{{textChange|i18n}}</a>\n              </span>\n            </div>\n          </section>\n        </div>",
                  computed: {
                    CaptchaStyle: function CaptchaStyle() {
                      return Ti.Css.toStyle({
                        width: this.imgWidth,
                        height: this.imgHeight
                      });
                    },
                    CaptchaSrc: function CaptchaSrc() {
                      if (this.src && this.timestamp > 0) {
                        if (this.src.lastIndexOf('?') == -1) {
                          return this.src + "?_t=" + this.timestamp;
                        } else {
                          return this.src + "&_t=" + this.timestamp;
                        }
                      } else {
                        return this.src;
                      }
                    }
                  },
                  methods: {
                    OnImgLoaded: function OnImgLoaded() {
                      Ti.Be.BlinkIt(this.$refs.pic);
                    },
                    __ti_shortcut: function __ti_shortcut(uniqKey) {
                      if ("ENTER" == uniqKey) {
                        Ti.App(this).$vm().close(this.value);
                      }
                    }
                  }
                }] //------------------------------------------

              });

            case 4:
              return _context4.abrupt("return", _context4.sent);

            case 5:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));
    return _TiCaptcha.apply(this, arguments);
  }

  return {
    Captcha: TiCaptcha
  };
}(),
    Captcha = _ref7.Captcha; //##################################################
// # import {Toast}   from "./ti-toast.mjs"


var _ref9 = function () {
  //################################################
  // # import {TiRuntimeStack} from "./ti-runtime-stack.mjs"
  var _ref10 = function () {
    // TODO 
    // maybe we don't need this anymore, since we get the app.mjs#APP_STACK 
    var TiRuntimeStack = /*#__PURE__*/function () {
      //------------------------------------------
      function TiRuntimeStack() {
        var _ref11 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref11$setItemViewpor = _ref11.setItemViewportMode,
            setItemViewportMode = _ref11$setItemViewpor === void 0 ? _.identity : _ref11$setItemViewpor;

        _classCallCheck(this, TiRuntimeStack);

        this.viewportMode = "desktop";
        this.stack = [];
        this.setItemViewportMode = setItemViewportMode;
      } //------------------------------------------


      _createClass(TiRuntimeStack, [{
        key: "push",
        value: function push(item) {
          if (item) {
            this.setItemViewportMode(item, this.viewportMode);
            this.stack.push(item);
          }
        } //------------------------------------------

      }, {
        key: "remove",
        value: function remove(item) {
          var stack = [];
          var re;

          var _iterator = _createForOfIteratorHelper(this.stack),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var it = _step.value;

              if (it === item) {
                re = it;
              } else {
                stack.push(it);
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }

          this.stack = stack;
          return re;
        } //------------------------------------------

      }, {
        key: "setViewportMode",
        value: function setViewportMode(mode) {
          this.viewportMode = mode;

          var _iterator2 = _createForOfIteratorHelper(this.stack),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var it = _step2.value;
              this.setItemViewportMode(it, mode);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        } //------------------------------------------

      }, {
        key: "pop",
        value: function pop() {
          return this.stack.pop();
        } //------------------------------------------

      }]);

      return TiRuntimeStack;
    }();

    return {
      TiRuntimeStack: TiRuntimeStack
    };
  }(),
      TiRuntimeStack = _ref10.TiRuntimeStack; //////////////////////////////////////////////


  var RTSTACK = new TiRuntimeStack();
  var OPTIONS = Symbol("toa-options");

  var _APP_ = Symbol("toa-app-instance"); //-----------------------------------


  var TiToastBox = /*#__PURE__*/function () {
    //------------------------------------------
    function TiToastBox() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, TiToastBox);

      this[OPTIONS] = options;
    } //------------------------------------------
    // Open toalog


    _createClass(TiToastBox, [{
      key: "open",
      value: function () {
        var _open = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
          var _this$OPTIONS, _this$OPTIONS$positio, position, _this$OPTIONS$icon, icon, _this$OPTIONS$content, content, _this$OPTIONS$vars, vars, _this$OPTIONS$type, type, _this$OPTIONS$spacing, spacing, _this$OPTIONS$duratio, duration, _this$OPTIONS$closer, closer, $el, html, appInfo, app;

          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  // Extract vars
                  _this$OPTIONS = this[OPTIONS], _this$OPTIONS$positio = _this$OPTIONS.position, position = _this$OPTIONS$positio === void 0 ? "center" : _this$OPTIONS$positio, _this$OPTIONS$icon = _this$OPTIONS.icon, icon = _this$OPTIONS$icon === void 0 ? true : _this$OPTIONS$icon, _this$OPTIONS$content = _this$OPTIONS.content, content = _this$OPTIONS$content === void 0 ? "i18n:empty" : _this$OPTIONS$content, _this$OPTIONS$vars = _this$OPTIONS.vars, vars = _this$OPTIONS$vars === void 0 ? {} : _this$OPTIONS$vars, _this$OPTIONS$type = _this$OPTIONS.type, type = _this$OPTIONS$type === void 0 ? "info" : _this$OPTIONS$type, _this$OPTIONS$spacing = _this$OPTIONS.spacing, spacing = _this$OPTIONS$spacing === void 0 ? 0 : _this$OPTIONS$spacing, _this$OPTIONS$duratio = _this$OPTIONS.duration, duration = _this$OPTIONS$duratio === void 0 ? 3000 : _this$OPTIONS$duratio, _this$OPTIONS$closer = _this$OPTIONS.closer, closer = _this$OPTIONS$closer === void 0 ? true : _this$OPTIONS$closer; //........................................

                  $el = Ti.Dom.createElement({
                    $p: document.body,
                    className: "the-stub"
                  }); //........................................

                  if (true === icon) {
                    icon = Ti.Icons.get(type);
                  } //........................................
                  // Setup content


                  html = "<div class=\"ti-toast\"\n        :class=\"topClass\"\n        :style=\"topStyle\"\n        @click=\"onClose\">\n        <transition :name=\"transName\"\n          @after-leave=\"onAfterLeave\">\n          <div v-if=\"!hidden\"\n            class=\"toast-con\"\n            @click.stop>\n            <div v-if=\"icon\"\n              class=\"toast-icon\">\n              <ti-icon :value=\"icon\"/>\n            </div>\n            <div class=\"toast-body\">{{content|i18n(vars)}}</div>\n            <div v-if=\"closer && 'center'!=position\"\n              class=\"toast-closer\">\n              <a @click=\"onClose\">{{'close'|i18n}}</a>\n            </div>\n          </div>\n        </transition>\n      </div>"; //........................................
                  // Prepare the app info

                  appInfo = {
                    template: html,
                    data: {
                      position: position,
                      icon: icon,
                      content: content,
                      type: type,
                      closer: closer,
                      vars: vars,
                      hidden: true
                    },
                    store: {
                      modules: {
                        "viewport": "@mod:ti/viewport"
                      }
                    },
                    computed: {
                      topClass: function topClass() {
                        return Ti.Css.mergeClassName({
                          "as-bar": "center" != this.position,
                          "as-block": "center" == this.position
                        }, ["at-".concat(this.position), "is-".concat(this.type)]);
                      },
                      topStyle: function topStyle() {
                        if ('center' != this.position) {
                          return {
                            "padding": Ti.Css.toSize(spacing)
                          };
                        }
                      },
                      transName: function transName() {
                        return "toast-trans-at-".concat(this.position);
                      }
                    },
                    methods: {
                      onClose: function onClose() {
                        if (this.closer) {
                          this.hidden = true;
                        }
                      },
                      onAfterLeave: function onAfterLeave() {
                        Ti.App(this).$toast.close();
                      },
                      doOpen: function doOpen() {
                        this.hidden = false;
                      },
                      doClose: function doClose() {
                        this.hidden = true;
                      }
                    }
                  }; //........................................
                  // create TiApp
                  // console.log(appInfo)

                  _context5.next = 7;
                  return Ti.App(appInfo);

                case 7:
                  app = _context5.sent;
                  this[_APP_] = app;
                  _context5.next = 11;
                  return app.init();

                case 11:
                  //........................................
                  // Mount to body
                  app.mountTo($el);
                  app.$toast = this;
                  app.root("doOpen"); //........................................
                  // Join to runtime

                  RTSTACK.push(this); //........................................
                  // Delay to remove

                  if (duration > 0) {
                    _.delay(function () {
                      app.root("doClose");
                    }, duration);
                  } //........................................


                  return _context5.abrupt("return", this);

                case 17:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5, this);
        }));

        function open() {
          return _open.apply(this, arguments);
        }

        return open;
      }() //------------------------------------------

    }, {
      key: "$app",
      value: function $app() {
        return this[_APP_];
      } //------------------------------------------

    }, {
      key: "close",
      value: function close() {
        RTSTACK.remove(this);
        this.$app().destroy(true);
      } //------------------------------------------

    }]);

    return TiToastBox;
  }(); //////////////////////////////////////////////


  var TiToast = {
    //------------------------------------------
    Open: function Open(options) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "info";
      var position = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "top";

      if (_.isString(options)) {
        // Open("i18n:xxx", {vars})
        if (_.isPlainObject(type)) {
          options = _.assign({
            type: position || "info",
            position: "top",
            content: options,
            vars: type
          }, type);
        } // Open("i18n:xxx", "warn")
        else {
            options = {
              type: type || "info",
              position: position || "top",
              content: options
            };
          }
      } //console.log("toast", options)


      var toa = new TiToastBox(options);
      toa.open();
      return toa;
    },
    //------------------------------------------
    Close: function Close() {
      var toa = RTSTACK.pop();

      if (toa) {
        toa.close();
      }
    } //------------------------------------------

  }; //////////////////////////////////////////////

  return {
    Toast: TiToast
  };
}(),
    Toast = _ref9.Toast; //##################################################
// # import {Be}           from "./behaviors.mjs"


var _ref12 = function () {
  var TiBehaviors = {
    /***
     * Open URL, it simulate user behavior by create 
     * undocumented `form` and call its `submit` method.
     * 
     * Once the `form.sumit` has been invoked, 
     * it will be removed immdiataly
     */
    Open: function Open(url) {
      var _ref13 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref13$target = _ref13.target,
          target = _ref13$target === void 0 ? "_blank" : _ref13$target,
          _ref13$method = _ref13.method,
          method = _ref13$method === void 0 ? "GET" : _ref13$method,
          _ref13$params = _ref13.params,
          params = _ref13$params === void 0 ? {} : _ref13$params,
          _ref13$delay = _ref13.delay,
          delay = _ref13$delay === void 0 ? 100 : _ref13$delay;

      return new Promise(function (resolve) {
        // Join to DOM
        var $form = Ti.Dom.createElement({
          $p: document.body,
          tagName: 'form',
          attrs: {
            target: target,
            method: method,
            action: url
          },
          props: {
            style: "display:none;"
          }
        }); // Add params

        _.forEach(params, function (value, name) {
          var $in = Ti.Dom.createElement({
            $p: $form,
            tagName: 'input',
            attrs: {
              name: name,
              value: value,
              type: "hidden"
            }
          });
        }); // Submit it


        $form.submit(); // Remove it

        Ti.Dom.remove($form); // await for a while

        _.delay(function () {
          resolve({
            url: url,
            target: target,
            method: method,
            params: params
          });
        }, delay);
      });
    },

    /***
     * Open the url described by `TiLinkObj`
     */
    OpenLink: function OpenLink(link) {
      var _ref14 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref14$target = _ref14.target,
          target = _ref14$target === void 0 ? "_blank" : _ref14$target,
          _ref14$method = _ref14.method,
          method = _ref14$method === void 0 ? "GET" : _ref14$method,
          _ref14$delay = _ref14.delay,
          delay = _ref14$delay === void 0 ? 100 : _ref14$delay;

      return TiBehaviors.Open(link.url, {
        target: target,
        method: method,
        delay: delay,
        params: link.params
      });
    },

    /**
     * !!! jQuery here
     * jq - 要闪烁的对象
     * opt.after - 当移除完成后的操作
     * opt.html - 占位符的 HTML，默认是 DIV.z_blink_light
     * opt.speed - 闪烁的速度，默认为  500
     */
    BlinkIt: function BlinkIt(jq, opt) {
      // 格式化参数
      jq = $(jq);
      if (jq.length == 0) return;
      opt = opt || {};

      if (typeof opt == "function") {
        opt = {
          after: opt
        };
      } else if (typeof opt == "number") {
        opt = {
          speed: opt
        };
      } // 得到文档中的


      var off = jq.offset();
      var owDoc = jq[0].ownerDocument;
      var jDoc = $(owDoc); // 样式

      var css = {
        "width": jq.outerWidth(),
        "height": jq.outerHeight(),
        "border-color": "#FF0",
        "background": "#FFA",
        "opacity": 0.8,
        "position": "fixed",
        "top": off.top - jDoc.scrollTop(),
        "left": off.left - jDoc.scrollLeft(),
        "z-index": 9999999
      }; // 建立闪烁层

      var lg = $(opt.html || '<div class="z_blink_light">&nbsp;</div>');
      lg.css(css).appendTo(owDoc.body);
      lg.animate({
        opacity: 0.1
      }, opt.speed || 500, function () {
        $(this).remove();
        if (typeof opt.after == "function") opt.after.apply(jq);
      });
    },

    /**
    编辑任何元素的内容
    ele - 为任何可以有子元素的 DOM 或者 jq，本函数在该元素的位置绘制一个 input 框，让用户输入新值
    opt - 配置项目
    {
      multi : false       // 是否是多行文本
      enterAsConfirm : false  // 多行文本下，回车是否表示确认
      newLineAsBr : false // 多行文本上，新行用 BR 替换。 默认 false
      text  : null   // 初始文字，如果没有给定，采用 ele 的文本
      width : 0      // 指定宽度，没有指定则默认采用宿主元素的宽度
      height: 0      // 指定高度，没有指定则默认采用宿主元素的高度
      extendWidth  : true   // 自动延伸宽度
      extendHeight : true   // 自动延伸高度
      selectOnFocus : true   // 当显示输入框，是否全选文字（仅当非 multi 模式有效）
          // 修改之后的回调
      // 如果不指定这个项，默认实现是修改元素的 innertText
      ok : {c}F(newval, oldval, jEle){}
          // 回调的上下文，默认为 ele 的 jQuery 包裹对象
      context : jEle
    }
    * 如果 opt 为函数，相当于 {after:F()}
    */
    EditIt: function EditIt(ele) {
      var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      //.........................................
      // 处理参数
      var jEle = $(ele);
      if (jEle.length == 0 || jEle.hasClass("is-be-editing")) return; //.........................................
      // Mark

      jEle.addClass("is-be-editing"); //.........................................
      // Set default value

      _.defaults(opt, {
        text: null,
        // 初始文字，如果没有给定，采用 ele 的文本
        width: 0,
        // 指定宽度，没有指定则默认采用宿主元素的宽度
        height: 0,
        // 指定高度，没有指定则默认采用宿主元素的高度
        extendWidth: true,
        // 自动延伸宽度
        takePlace: true,
        // 是否代替宿主的位置，如果代替那么将不用绝对位置和遮罩
        selectOnFocus: true,
        // 当显示输入框，是否全选文字
        // How many css-prop should be copied
        copyStyle: ["letter-spacing", "margin", "border", "font-size", "font-family", "line-height", "text-align"],
        // 确认后回调
        ok: function ok(newVal, oldVal) {
          this.innerText = newVal;
        },
        // 回调上下文，默认$ele
        context: jEle[0]
      }); //.........................................
      // Build-in callback set
      // Each method `this` should be the `Editing` object


      var Editing = {
        //.......................................
        jEle: jEle,
        $el: jEle[0],
        options: opt,
        oldValue: Ti.Util.fallback(opt.text, jEle.text()),
        //.......................................
        onCancel: function onCancel() {
          this.jMask.remove();
          this.jDiv.remove();
          this.jEle.css({
            visibility: ""
          }).removeClass("is-be-editing");
        },
        //.......................................
        onOk: function onOk() {
          var newVal = _.trim(this.jInput.val());

          if (newVal != this.oldValue) {
            opt.ok.apply(opt.context, [newVal, opt.oldValue, opt]);
          }

          this.onCancel();
        } //.......................................

      }; //.........................................
      // Show the input

      var html = "<div class=\"ti-be-editing as-con\"><input></div>"; //.........................................
      // Count the measure

      var rect = Ti.Rects.createBy(Editing.$el); //.........................................
      // Display the input-box

      var boxW = opt.width || rect.width;
      var boxH = opt.height || rect.height; //.........................................

      var jDiv = $(html);
      var jInput = jDiv.find("input");
      var jMask = $("<div class=\"ti-be-editing as-mask\"></div>"); //.........................................

      _.assign(Editing, {
        jDiv: jDiv,
        jInput: jInput,
        jMask: jMask,
        $div: jDiv[0],
        $input: jInput[0],
        $mask: jMask[0],
        primaryWidth: boxW,
        primaryHeight: boxH
      }); //.........................................


      jMask.css({
        position: "fixed",
        zIndex: 999999,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }); //.........................................

      jDiv.css({
        position: "fixed",
        zIndex: 1000000,
        top: rect.top,
        left: rect.left,
        width: boxW,
        height: boxH
      }); //.........................................

      jInput.css({
        width: "100%",
        height: "100%",
        outline: "none",
        resize: "none",
        overflow: "hidden",
        padding: "0 .06rem",
        background: "rgba(255,255,50,0.8)",
        color: "#000",
        lineHeight: boxH
      }).attr({
        spellcheck: false
      }).val(Editing.oldValue); //.........................................
      // Copy the target style to display

      if (!_.isEmpty(opt.copyStyle)) {
        var styles = window.getComputedStyle(Editing.$el); // Prepare the css-set

        var css = _.pick(styles, opt.copyStyle);

        jInput.css(css);
      } //.........................................
      // Gen the mask and cover


      Editing.jMask.appendTo(document.body);
      Editing.jDiv.appendTo(document.body);
      Editing.jEle.css({
        visibility: "hidden"
      }); //.........................................
      // Auto focus

      if (opt.selectOnFocus) {
        Editing.$input.select();
      } else {
        Editing.$input.focus();
      } //.........................................
      // Join the events


      jInput.one("blur", function () {
        Editing.onOk();
      });
      jInput.on("keydown", function ($evt) {
        var keyCode = $evt.which; // Esc

        if (27 == keyCode) {
          Editing.onCancel();
        } // Enter
        else if (13 == keyCode) {
            Editing.onOk();
          }
      }); //.........................................

      return Editing;
    }
  }; //-----------------------------------

  return {
    Be: TiBehaviors
  };
}(),
    Be = _ref12.Be; //##################################################
// # import {Alg}          from "./algorithm.mjs"


var _ref15 = function () {
  // rquired crypto-js
  ///////////////////////////////////////////
  var TiAlg = {
    //---------------------------------------
    sha1: function sha1(str) {
      if (!_.isString(str)) {
        str = JSON.stringify(str);
      }

      return CryptoJS.SHA1(str).toString();
    },
    //---------------------------------------
    // 获取两个数的最大公约数
    // greatest common divisor(gcd)
    gcd: function gcd(a, b) {
      a = Math.round(a);
      b = Math.round(b);

      if (b) {
        return this.gcd(b, a % b);
      }

      return a;
    },
    //---------------------------------------
    gcds: function gcds() {
      var args = Array.from(arguments);

      var list = _.flatten(args); // 没数


      if (list.length == 0) return NaN; // 一个是自己

      if (list.length == 1) {
        return list[0];
      } // 两个以上


      var gcd = this.gcd(list[0], list[1]);

      for (var i = 2; i < list.length; i++) {
        gcd = this.gcd(gcd, list[i]);
      } // 返回


      return gcd;
    },
    //---------------------------------------
    // 获取两个数的最小公倍数 
    // lowest common multiple (LCM)
    lcm: function lcm(a, b) {
      a = Math.round(a);
      b = Math.round(b);
      return a * b / this.gcd(a, b);
    },
    //---------------------------------------
    lcms: function lcms() {
      var args = Array.from(arguments);

      var list = _.flatten(args); // 没数


      if (list.length == 0) return NaN; // 一个是自己

      if (list.length == 1) {
        return list[0];
      } // 两个以上


      var lcm = this.lcm(list[0], list[1]);

      for (var i = 2; i < list.length; i++) {
        lcm = this.lcm(lcm, list[i]);
      } // 返回


      return lcm;
    } //---------------------------------------

  }; ///////////////////////////////////////////

  return {
    Alg: TiAlg
  };
}(),
    Alg = _ref15.Alg; //##################################################
// # import {S}            from "./str.mjs"


var _ref16 = function () {
  var TiStr = {
    sBlank: function sBlank(str, dft) {
      return str || dft;
    },
    isBlank: function isBlank(str) {
      return !str || /^\s*$/.test(str);
    },
    renderVars: function renderVars() {
      var vars = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var fmt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

      var _ref17 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          iteratee = _ref17.iteratee,
          regex = _ref17.regex,
          safe = _ref17.safe;

      if (_.isString(vars) || _.isNumber(vars)) {
        vars = {
          val: vars
        };
      }

      if (!vars || _.isEmpty(vars)) {
        return _.isArray(vars) ? [] : "";
      }

      return TiStr.renderBy(fmt, vars, {
        iteratee: iteratee,
        regex: regex,
        safe: safe
      });
    },

    /***
     * Replace the placeholder
     */
    renderBy: function renderBy() {
      var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      var vars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var _ref18 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          iteratee = _ref18.iteratee,
          _ref18$regex = _ref18.regex,
          regex = _ref18$regex === void 0 ? /(\${1,2})\{([^}]+)\}/g : _ref18$regex,
          _ref18$safe = _ref18.safe,
          safe = _ref18$safe === void 0 ? false : _ref18$safe;

      if (!str) {
        return _.isArray(vars) ? [] : "";
      } // Make sure the `vars` empty-free


      vars = vars || {};

      if (safe) {
        var r2 = _.isRegExp(safe) ? safe : undefined;
        vars = TiStr.safeDeep(vars, r2);
      } // Normlized args


      if (_.isRegExp(iteratee)) {
        regex = iteratee;
        iteratee = undefined;
      } // Default iteratee


      if (!iteratee) {
        iteratee = function iteratee() {
          var _ref19 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
              varName = _ref19.varName,
              vars = _ref19.vars,
              matched = _ref19.matched;

          if (matched.startsWith("$$")) {
            return matched.substring(1);
          } // find default


          var dft = matched;
          var pos = varName.indexOf('?');

          if (pos > 0) {
            dft = _.trim(varName.substring(pos + 1));
            varName = _.trim(varName.substring(0, pos));
          } // pick value


          return Ti.Util.fallback(Ti.Util.getOrPick(vars, varName), dft);
        };
      } // Array


      if (_.isArray(vars)) {
        var _re = [];

        for (var _i = 0; _i < vars.length; _i++) {
          var vars2 = vars[_i];
          var s2 = TiStr.renderBy(str, vars2);

          _re.push(s2);
        }

        return _re;
      } // Looping


      var m;
      var ss = [];
      var last = 0;

      while (m = regex.exec(str)) {
        var current = m.index;

        if (current > last) {
          ss.push(str.substring(last, current));
        }

        var varValue = iteratee({
          vars: vars,
          matched: m[0],
          prefix: m[1],
          varName: m[2]
        });
        ss.push(varValue);
        last = regex.lastIndex;
      } // Add tail


      if (last < str.length) {
        ss.push(str.substring(last));
      } // Return


      return ss.join("");
    },

    /***
     * Replace the dangerous char in Object deeply.
     * 
     * @param data{Array|Object|Any} : the value to be turn to safe
     * @param regex{RegExp} : which char should be removed
     * 
     * @return data
     */
    safeDeep: function safeDeep() {
      var _this = this;

      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var regex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : /['"]/g;

      // String to replace
      if (_.isString(data)) {
        return data.replace(regex, "");
      } // Array
      else if (_.isArray(data)) {
          return _.map(data, function (v) {
            return _this.safeDeep(v, regex);
          });
        } // Object
        else if (_.isPlainObject(data)) {
            return _.mapValues(data, function (v) {
              return _this.safeDeep(v, regex);
            });
          } // Others return


      return data;
    },

    /***
     * Join without `null/undefined`
     */
    join: function join() {
      var sep = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      var list = [];

      for (var _len = arguments.length, ss = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        ss[_key - 1] = arguments[_key];
      }

      for (var _i2 = 0, _ss = ss; _i2 < _ss.length; _i2++) {
        var s = _ss[_i2];
        if (_.isUndefined(s) || _.isNull(s)) continue;

        if (_.isArray(s)) {
          list.push.apply(list, _toConsumableArray(s));
          continue;
        }

        list.push(s);
      }

      return list.join(sep);
    },

    /***
     * Convert string to Js Object automatictly
     */
    toJsValue: function toJsValue() {
      var v = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

      var _ref20 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref20$autoJson = _ref20.autoJson,
          autoJson = _ref20$autoJson === void 0 ? true : _ref20$autoJson,
          _ref20$autoDate = _ref20.autoDate,
          autoDate = _ref20$autoDate === void 0 ? true : _ref20$autoDate,
          _ref20$autoNil = _ref20.autoNil,
          autoNil = _ref20$autoNil === void 0 ? false : _ref20$autoNil,
          _ref20$trimed = _ref20.trimed,
          trimed = _ref20$trimed === void 0 ? true : _ref20$trimed,
          _ref20$context = _ref20.context,
          context = _ref20$context === void 0 ? {} : _ref20$context;

      //...............................................
      // Array 
      if (_.isArray(v)) {
        var _re2 = [];
        var opt = {
          autoJson: autoJson,
          autoDate: autoDate,
          autoNil: autoNil,
          trimed: trimed,
          context: context
        };

        var _iterator3 = _createForOfIteratorHelper(v),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var it = _step3.value;
            var v2 = TiStr.toJsValue(it, opt);

            _re2.push(v2);
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }

        return _re2;
      } //...............................................
      // Object


      if (_.isPlainObject(v)) {
        var _re3 = {};
        var _opt = {
          autoJson: autoJson,
          autoDate: autoDate,
          autoNil: autoNil,
          trimed: trimed,
          context: context
        };

        _.forEach(v, function (it, key) {
          var v2 = TiStr.toJsValue(it, _opt);
          _re3[key] = v2;
        });

        return _re3;
      } //...............................................
      // Number
      // Boolean
      // Nil


      if (Ti.Util.isNil(v) || _.isBoolean(v) || _.isNumber(v)) {
        return v;
      } //...............................................
      // Must by string


      var str = trimed ? _.trim(v) : v; //...............................................
      // autoNil

      if (autoNil) {
        if ("undefined" == str) return undefined;
        if ("null" == str) return null;
      } //...............................................
      // Number


      if (/^-?[\d.]+$/.test(str)) {
        return str * 1;
      } //...............................................
      // Try to get from context


      var re = _.get(context, str);

      if (!_.isUndefined(re)) {
        return re;
      } //...............................................
      // Boolean


      if (/^(true|false|yes|no|on|off)$/i.test(str)) {
        return /^(true|yes|on)$/i.test(str);
      } //...............................................
      // JS String


      var m = /^'([^']*)'$/.exec(str);

      if (m) {
        return m[1];
      } //...............................................
      // try JSON


      if (autoJson) {
        var _re4 = Ti.Types.safeParseJson(v);

        if (!_.isUndefined(_re4)) {
          return _re4;
        }
      } //...............................................
      // try Date


      if (autoDate) {
        try {
          return Ti.Types.toDate(v);
        } catch (E) {}
      } // Then, it is a string


      return str;
    },

    /***
     * Join "a,b,c" like string to arguments
     */
    joinArgs: function joinArgs(s) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var iteratee = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : TiStr.toJsValue;

      // String to split
      if (_.isString(s)) {
        // Maybe a json object
        if (/^\{.*\}$/.test(s)) {
          try {
            return [eval("(".concat(s, ")"))];
          } catch (E) {}
        } // Take it as comma-sep list


        var _list = s.split(",");

        var _iterator4 = _createForOfIteratorHelper(_list),
            _step4;

        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var li = _step4.value;

            var vs = _.trim(li);

            if (!vs) continue;

            var _v = iteratee(vs);

            args.push(_v);
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }

        return args;
      } // Array
      else if (_.isArray(s)) {
          var _iterator5 = _createForOfIteratorHelper(s),
              _step5;

          try {
            for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
              var _v2 = _step5.value;
              var v2 = iteratee(_v2);
              args.push(v2);
            }
          } catch (err) {
            _iterator5.e(err);
          } finally {
            _iterator5.f();
          }
        } // Others
        else if (!_.isUndefined(s)) {
            args.push(s);
          }

      return args;
    },

    /***
     * @param s{String|Array}
     * @param sep{RegExp|String}
     * @param ignoreNil{Boolean}
     */
    toArray: function toArray(s) {
      var _ref21 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref21$sep = _ref21.sep,
          sep = _ref21$sep === void 0 ? /[:,;\t\n\/]+/g : _ref21$sep,
          _ref21$ignoreNil = _ref21.ignoreNil,
          ignoreNil = _ref21$ignoreNil === void 0 ? true : _ref21$ignoreNil;

      // Nil
      if (Ti.Util.isNil(s)) {
        return [];
      } // Array


      if (_.isArray(s)) {
        return s;
      } // String to split


      if (_.isString(s) && sep) {
        var _ss2 = _.map(s.split(sep), function (v) {
          return _.trim(v);
        });

        if (ignoreNil) {
          return _.without(_ss2, "");
        }

        return _ss2;
      } // Others -> wrap


      return [s];
    },

    /***
     * Translate "XXX:A:im-pizza" or ["XXX","A","im-pizza"]
     * 
     * ```
     * {text:"XXX",value:"A",icon:"im-pizza"}
     * ```
     * 
     * @param s{String|Array}
     * @param sep{RegExp|String}
     * @param ignoreNil{Boolean}
     * @param keys{Array}
     */
    toObject: function toObject(s) {
      var _ref22 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref22$sep = _ref22.sep,
          sep = _ref22$sep === void 0 ? /[:,;\t\n\/]+/g : _ref22$sep,
          _ref22$ignoreNil = _ref22.ignoreNil,
          ignoreNil = _ref22$ignoreNil === void 0 ? true : _ref22$ignoreNil,
          _ref22$keys = _ref22.keys,
          keys = _ref22$keys === void 0 ? ["value", "text?value", "icon"] : _ref22$keys;

      // Already Object
      if (_.isPlainObject(s) || _.isNull(s) || _.isUndefined(s)) {
        return s;
      } // Split value to array


      var vs = TiStr.toArray(s, {
        sep: sep,
        ignoreNil: ignoreNil
      }); // Analyze the keys

      var a_ks = []; // assign key list

      var m_ks = []; // those keys must has value

      _.forEach(keys, function (k) {
        var ss = TiStr.toArray(k, {
          sep: "?"
        });

        if (ss.length > 1) {
          var k2 = ss[0];
          a_ks.push(k2);
          m_ks.push({
            name: k2,
            backup: ss[1]
          });
        } else {
          a_ks.push(k);
        }
      }); // translate


      var re = {};

      _.forEach(a_ks, function (k, i) {
        var v = _.nth(vs, i);

        if (_.isUndefined(v) && ignoreNil) {
          return;
        }

        re[k] = v;
      }); // Assign default


      for (var _i3 = 0, _m_ks = m_ks; _i3 < _m_ks.length; _i3++) {
        var mk = _m_ks[_i3];

        if (_.isUndefined(re[mk.name])) {
          re[mk.name] = re[mk.backup];
        }
      } // done


      return re;
    },

    /***
     * String (multi-lines) to object list
     * Translate 
     * ```
     * A : Xiaobai : im-pizza
     * B : Peter
     * C : Super Man
     * D
     * ```
     * To
     * ```
     * [
     *  {value:"A", text:"Xiaobai", icon:"im-pizza"},
     *  {value:"B", text:"Peter"},
     *  {value:"C", text:"Super Man"}
     *  {value:"D", text:"C"}
     * ]
     * ```
     * 
     * @param s{String|Array}
     * @param sep{RegExp|String}
     * @param ignoreNil{Boolean}
     * @param keys{Array}
     */
    toObjList: function toObjList(s) {
      var _ref23 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref23$sepLine = _ref23.sepLine,
          sepLine = _ref23$sepLine === void 0 ? /[,;\n]+/g : _ref23$sepLine,
          _ref23$sepPair = _ref23.sepPair,
          sepPair = _ref23$sepPair === void 0 ? /[:|\/\t]+/g : _ref23$sepPair,
          _ref23$ignoreNil = _ref23.ignoreNil,
          ignoreNil = _ref23$ignoreNil === void 0 ? true : _ref23$ignoreNil,
          _ref23$keys = _ref23.keys,
          keys = _ref23$keys === void 0 ? ["value", "text?value", "icon"] : _ref23$keys;

      var list = TiStr.toArray(s, {
        sep: sepLine,
        ignoreNil: ignoreNil
      });
      return _.map(list, function (v) {
        return TiStr.toObject(v, {
          sep: sepPair,
          ignoreNil: ignoreNil,
          keys: keys
        });
      });
    },

    /***
     * Get the display text for bytes
     */
    sizeText: function sizeText() {
      var _byte = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      var _ref24 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref24$fixed = _ref24.fixed,
          fixed = _ref24$fixed === void 0 ? 2 : _ref24$fixed,
          _ref24$M = _ref24.M,
          M = _ref24$M === void 0 ? 1024 : _ref24$M,
          _ref24$units = _ref24.units,
          units = _ref24$units === void 0 ? ["Bytes", "KB", "MB", "GB", "PB", "TB"] : _ref24$units;

      var nb = _byte;
      var i = 0;

      for (; i < units.length; i++) {
        var nb2 = nb / M;

        if (nb2 < 1) {
          break;
        }

        nb = nb2;
      }

      var unit = units[i];

      if (nb == parseInt(nb)) {
        return nb + unit;
      }

      return nb.toFixed(fixed) + unit;
    },

    /***
     * Get the display percent text for a float number
     * @param n Float number
     */
    toPercent: function toPercent(n) {
      var _ref25 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref25$fixed = _ref25.fixed,
          fixed = _ref25$fixed === void 0 ? 2 : _ref25$fixed,
          _ref25$auto = _ref25.auto,
          auto = _ref25$auto === void 0 ? true : _ref25$auto;

      if (!_.isNumber(n)) return "NaN";
      var nb = n * 100; // Round

      var str = fixed >= 0 ? nb.toFixed(fixed) : nb + "";

      if (auto) {
        var lastDot = str.lastIndexOf('.');
        var lastZero = str.lastIndexOf('0');

        if (lastDot >= 0 && lastZero > lastDot) {
          var _last = str.length - 1;

          var pos = _last;

          for (; pos >= lastDot; pos--) {
            if (str[pos] != '0') break;
          }

          if (pos == lastZero || pos == lastDot) {//pos --
          } else {
            pos++;
          }

          if (pos < str.length) str = str.substring(0, pos);
        }
      }

      return str + "%";
    },

    /***
     * switch given `str` to special case, the modes below would be supported:
     * 
     * @param str{String} - give string
     * @param mode{String} - Method of key name transformer function:
     *  - `"upper"` : to upport case
     *  - `"lower"` : to lower case
     *  - `"camel"` : to camel case
     *  - `"snake"` : to snake case
     *  - `"kebab"` : to kebab case
     *  - `"start"` : to start case
     *  - `null`  : keep orignal
     * 
     * @return string which applied the case mode
     */
    toCase: function toCase(str, mode) {
      // Guard
      if (Ti.Util.isNil(str)) return str; // Find mode

      var fn = TiStr.getCaseFunc(mode); // Apply mode

      if (_.isFunction(fn)) {
        return fn(str);
      }

      return str;
    },
    getCaseFunc: function getCaseFunc(mode) {
      return {
        upper: function upper(s) {
          return s ? s.toUpperCase() : s;
        },
        lower: function lower(s) {
          return s ? s.toLowerCase() : s;
        },
        camel: function camel(s) {
          return _.camelCase(s);
        },
        snake: function snake(s) {
          return _.snakeCase(s);
        },
        kebab: function kebab(s) {
          return _.kebabCase(s);
        },
        start: function start(s) {
          return _.startCase(s);
        }
      }[mode];
    },
    isValidCase: function isValidCase(mode) {
      return _.isFunction(TiStr.getCaseFunc(mode));
    },

    /***
     * Check given string is phone number or not
     */
    isPhoneNumber: function isPhoneNumber() {
      var s = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      return /^(\+\d{2})? *(\d{11})$/.test(s);
    }
  }; //-----------------------------------

  return {
    S: TiStr
  };
}(),
    S = _ref16.S; //##################################################
// # import {App}          from "./app.mjs"


var _ref26 = function () {
  //################################################
  // # import {LoadTiAppInfo, LoadTiLinkedObj} from "./app-info.mjs"
  var _ref27 = function () {
    //---------------------------------------
    function isTiLink(str) {
      // Remote Link @http://xxx
      if (/^@https?:\/\//.test(str)) {
        return str.substring(1);
      } // Absolute Link @/xxx


      if (/^@\/.+/.test(str)) {
        return str.substring(1);
      } // @com:xxx or @mod:xxx


      if (/^(@[A-Za-z0-9_-]+:?|\.\/)/.test(str)) {
        return str;
      } // !mjs:xxx


      if (/^(!(m?js|json|css|text):)/.test(str)) {
        return str;
      } // Then it should be normal string

    } //---------------------------------------


    function LoadTiLinkedObj() {
      return _LoadTiLinkedObj.apply(this, arguments);
    } //---------------------------------------


    function _LoadTiLinkedObj() {
      _LoadTiLinkedObj = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
        var obj,
            _ref29,
            dynamicPrefix,
            dynamicAlias,
            ps,
            _args8 = arguments;

        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                obj = _args8.length > 0 && _args8[0] !== undefined ? _args8[0] : {};
                _ref29 = _args8.length > 1 && _args8[1] !== undefined ? _args8[1] : {}, dynamicPrefix = _ref29.dynamicPrefix, dynamicAlias = _ref29.dynamicAlias;
                // Promise list
                ps = []; // walk Object Key shallowly

                _.forOwn(obj, function (val, key) {
                  // Escape "...", the syntax for MappingXXX of Vuex
                  if (/^\.{3}/.test(key)) {
                    return;
                  } // String


                  if (_.isString(val)) {
                    // only link like value should be respected
                    var linkURI = isTiLink(val);

                    if (!linkURI) {
                      return;
                    }

                    ps.push(new Promise(function (resolve, reject) {
                      Ti.Load(linkURI, {
                        dynamicPrefix: dynamicPrefix,
                        dynamicAlias: dynamicAlias
                      }).then( /*#__PURE__*/function () {
                        var _ref30 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(re) {
                          var v2, re2;
                          return regeneratorRuntime.wrap(function _callee6$(_context6) {
                            while (1) {
                              switch (_context6.prev = _context6.next) {
                                case 0:
                                  v2 = Ti.Config.url(linkURI, {
                                    dynamicPrefix: dynamicPrefix,
                                    dynamicAlias: dynamicAlias
                                  });
                                  _context6.next = 3;
                                  return LoadTiLinkedObj(re, {
                                    dynamicAlias: new Ti.Config.AliasMapping({
                                      "^\./": Ti.Util.getParentPath(v2)
                                    })
                                  });

                                case 3:
                                  re2 = _context6.sent;
                                  obj[key] = re2;
                                  resolve(re2);

                                case 6:
                                case "end":
                                  return _context6.stop();
                              }
                            }
                          }, _callee6);
                        }));

                        return function (_x) {
                          return _ref30.apply(this, arguments);
                        };
                      }());
                    }));
                  } // Array recur
                  else if (_.isArray(val)) {
                      var _loop = function _loop(_i4) {
                        var linkURI = isTiLink(val[_i4]); // only link like value should be respected

                        if (!linkURI) {
                          return "continue";
                        }

                        ps.push(new Promise(function (resolve, reject) {
                          Ti.Load(linkURI, {
                            dynamicPrefix: dynamicPrefix,
                            dynamicAlias: dynamicAlias
                          }).then( /*#__PURE__*/function () {
                            var _ref31 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(re) {
                              var v2, re2;
                              return regeneratorRuntime.wrap(function _callee7$(_context7) {
                                while (1) {
                                  switch (_context7.prev = _context7.next) {
                                    case 0:
                                      v2 = Ti.Config.url(linkURI, {
                                        dynamicPrefix: dynamicPrefix,
                                        dynamicAlias: dynamicAlias
                                      });
                                      _context7.next = 3;
                                      return LoadTiLinkedObj(re, {
                                        dynamicAlias: new Ti.Config.AliasMapping({
                                          "^\./": Ti.Util.getParentPath(v2)
                                        })
                                      });

                                    case 3:
                                      re2 = _context7.sent;
                                      val[_i4] = re2; // If modules/components, apply the default name

                                      if (!re2.name && /^(modules|components)$/.test(key)) {
                                        re2.name = Ti.Util.getLinkName(v);
                                      } // Done for loading


                                      resolve(re2);

                                    case 7:
                                    case "end":
                                      return _context7.stop();
                                  }
                                }
                              }, _callee7);
                            }));

                            return function (_x2) {
                              return _ref31.apply(this, arguments);
                            };
                          }());
                        }));
                      };

                      for (var _i4 = 0; _i4 < val.length; _i4++) {
                        var _ret = _loop(_i4);

                        if (_ret === "continue") continue;
                      }
                    } // Object recur
                    else if (_.isPlainObject(val)) {
                        {
                          ps.push(LoadTiLinkedObj(val, {
                            dynamicPrefix: dynamicPrefix,
                            dynamicAlias: dynamicAlias
                          }));
                        }
                      }
                }); // Promise obj has been returned


                if (!(ps.length > 0)) {
                  _context8.next = 7;
                  break;
                }

                _context8.next = 7;
                return Promise.all(ps);

              case 7:
                return _context8.abrupt("return", obj);

              case 8:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }));
      return _LoadTiLinkedObj.apply(this, arguments);
    }

    function RemarkCssLink(cssLink) {
      var _ref28 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref28$key = _ref28.key,
          key = _ref28$key === void 0 ? "" : _ref28$key,
          _ref28$val = _ref28.val,
          val = _ref28$val === void 0 ? "" : _ref28$val;

      var $doc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : document;
      if (!cssLink) return; // Batch

      if (_.isArray(cssLink) && cssLink.length > 0) {
        // Then remove the old
        Ti.Dom.remove('link[' + key + '="' + val + '"]', $doc.head); // Mark the new one

        var _iterator6 = _createForOfIteratorHelper(cssLink),
            _step6;

        try {
          for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
            var cl = _step6.value;
            RemarkCssLink(cl, {
              key: "",
              val: ""
            });
          }
        } catch (err) {
          _iterator6.e(err);
        } finally {
          _iterator6.f();
        }

        return;
      } // Already marked


      if (key && cssLink.getAttribute(key) == val) return; // Mark the new

      if (key && val) cssLink.setAttribute(key, val);
    }
    /***
    Load all app info for app.json  
    */


    function LoadTiAppInfo() {
      return _LoadTiAppInfo.apply(this, arguments);
    }

    function _LoadTiAppInfo() {
      _LoadTiAppInfo = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
        var info,
            $doc,
            conf,
            _args9 = arguments;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                info = _args9.length > 0 && _args9[0] !== undefined ? _args9[0] : {};
                $doc = _args9.length > 1 && _args9[1] !== undefined ? _args9[1] : document;
                // Clone info and reload its all detail
                conf = _.cloneDeep(info);
                _context9.next = 5;
                return LoadTiLinkedObj(conf);

              case 5:
                if (Ti.IsInfo("TiApp")) {
                  console.log("await LoadTiLinkedObj(conf)", conf);
                } // For Theme / CSS
                // RemarkCssLink(conf.theme, {key:"ti-theme", val:"yes"})
                // RemarkCssLink(conf.css,   {key:"ti-app-css", val:conf.name})
                // The app config object which has been loaded completely


                return _context9.abrupt("return", conf);

              case 7:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9);
      }));
      return _LoadTiAppInfo.apply(this, arguments);
    }

    return {
      LoadTiLinkedObj: LoadTiLinkedObj,
      LoadTiAppInfo: LoadTiAppInfo
    };
  }(),
      LoadTiAppInfo = _ref27.LoadTiAppInfo,
      LoadTiLinkedObj = _ref27.LoadTiLinkedObj; //################################################
  // # import {TiAppActionShortcuts} from "./app-action-shortcuts.mjs"


  var _ref32 = function () {
    var TiAppActionShortcuts = /*#__PURE__*/function () {
      //////////////////////////////////////////////
      // Attributes
      //////////////////////////////////////////////
      function TiAppActionShortcuts() {
        _classCallCheck(this, TiAppActionShortcuts);

        /***
         * ComUI can append the guard later for block one process.
         * 
         * For example, if we provide the `saving` operation in action menu
         * with `CTRL+S` shortcut, but we want to fire the action only if 
         * the `content` changed. So we will detected the content change 
         * and mark it in UI to present the status to user. When user process
         * `CTRL+S` we also want to block the action if content without changed.
         * For the reason most UI was been loaded asynchronous, so we need provide
         * a way to those UIs to append the `guard` before the action invoking.
         * 
         * - `key` : The shortcut key like `CTRL+S`
         * - `value` : synchronized function, return false to block
         * 
         * ```
         * {
         *   "CTRL+S" : [{
         *      // object scope, like $app or $com
         *      // If undefined, take it as $app
         *      scope : Any,
         *      // Guard function,
         *      func  : f():Boolean
         *   }]
         * }
         * ```
         */
        this.guards = {};
        /***
         * Save the actions shortcut mapping
         * 
         * ```
         * {
         *   "CTRL+S" : [{
         *      // object scope, like $app or $com
         *      // If undefined, take it as $app
         *      scope : Any,
         *      // Binding function to invoke the action
         *      func  : f():Boolean to quit,
         *      prevent : true,
         *      quit    : true
         *   }]
         * }
         * ```
         */

        this.actions = {};
      } //////////////////////////////////////////////
      // Methods
      //////////////////////////////////////////////
      //--------------------------------------------


      _createClass(TiAppActionShortcuts, [{
        key: "addGuard",
        value: function addGuard(scope, uniqKey, guard) {
          if (uniqKey && _.isFunction(guard)) {
            Ti.Util.pushValue(this.guards, uniqKey, {
              scope: scope,
              func: guard
            });
          }
        } //--------------------------------------------

      }, {
        key: "removeGuard",
        value: function removeGuard(scope) {
          for (var _len2 = arguments.length, uniqKeys = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            uniqKeys[_key2 - 1] = arguments[_key2];
          }

          this.guards = this.__remove_by(this.guards, scope, uniqKeys);
        } //--------------------------------------------

      }, {
        key: "isWatched",
        value: function isWatched(scope, uniqKey) {
          var as = this.actions[uniqKey];

          if (_.isArray(as)) {
            var _iterator7 = _createForOfIteratorHelper(as),
                _step7;

            try {
              for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
                var a = _step7.value;

                if (a.scope === scope) {
                  return true;
                }
              }
            } catch (err) {
              _iterator7.e(err);
            } finally {
              _iterator7.f();
            }
          }

          return false;
        } //--------------------------------------------

      }, {
        key: "watch",
        value: function watch(scope) {
          var _this2 = this;

          var actions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

          var _ref33 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
              $com = _ref33.$com,
              _ref33$argContext = _ref33.argContext,
              argContext = _ref33$argContext === void 0 ? {} : _ref33$argContext;

          var list = _.without(_.concat(actions), null);

          _.forEach(list, function (aIt) {
            // Groups, recur ...
            if (_.isArray(aIt.items) && aIt.items.length > 0) {
              _this2.watch(scope, aIt.items, {
                $com: $com,
                argContext: argContext
              });
            } // Action
            else if (aIt.action && aIt.shortcut) {
                // Guarding for duplicated watching
                if (_this2.isWatched(scope, aIt.shortcut)) {
                  return;
                } // Gen invoke function


                var func = Ti.Shortcut.genActionInvoking(aIt.action, {
                  $com: $com,
                  argContext: argContext,
                  wait: aIt.wait
                }); // Join to watch list

                Ti.Util.pushValueBefore(_this2.actions, aIt.shortcut, {
                  scope: scope,
                  func: func,
                  prevent: Ti.Util.fallback(aIt.prevent, true),
                  stop: Ti.Util.fallback(aIt.stop, true)
                });
              }
          });
        } //--------------------------------------------

      }, {
        key: "unwatch",
        value: function unwatch(scope) {
          for (var _len3 = arguments.length, uniqKeys = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
            uniqKeys[_key3 - 1] = arguments[_key3];
          }

          this.actions = this.__remove_by(this.actions, scope, uniqKeys);
        } //--------------------------------------------

      }, {
        key: "__remove_by",
        value: function __remove_by(map, scope) {
          for (var _len4 = arguments.length, uniqKeys = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
            uniqKeys[_key4 - 2] = arguments[_key4];
          }

          var keys = _.flattenDeep(uniqKeys); // Clean


          if (!scope && _.isEmpty(keys)) {
            return {};
          } // For all keys


          if (_.isEmpty(keys)) {
            keys = _.keys(map);
          } // Remove in loop


          var scopeIsNil = Ti.Util.isNil(scope);
          var map2 = {};

          _.forEach(keys, function (k) {
            var list = [];

            _.forEach(map[k], function (a) {
              if (!scopeIsNil && a.scope !== scope) {
                list.push(a);
              }
            }); // Join back


            if (!_.isEmpty(list)) {
              map2[k] = list;
            }
          });

          return map2;
        } //--------------------------------------------

        /***
         * @param scope{Any}
         * @param uniqKey{String} : like "CTRL+S"
         * @param st{OBject} : return object
         */

      }, {
        key: "fire",
        value: function fire(scope, uniqKey) {
          var st = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
            stop: false,
            prevent: false,
            quit: false
          };

          //..........................................
          // if("ALT+CTRL+P" == uniqKey)
          //    console.log("AppActionShortcuts.fired", uniqKey)
          if (st.quit) {
            return st;
          } //..........................................


          var scopeIsNil = Ti.Util.isNil(scope); //..........................................
          // Ask guards

          var guards = this.guards[uniqKey];

          if (_.isArray(guards)) {
            var _iterator8 = _createForOfIteratorHelper(guards),
                _step8;

            try {
              for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
                var g = _step8.value;

                if (scopeIsNil || g.scope === scope) {
                  if (!g.func()) {
                    st.quit = true;
                    return st;
                  }
                }
              }
            } catch (err) {
              _iterator8.e(err);
            } finally {
              _iterator8.f();
            }
          } //..........................................
          // fire the action list


          var as = this.actions[uniqKey];
          if (!_.isArray(as)) return st; //..........................................

          var _iterator9 = _createForOfIteratorHelper(as),
              _step9;

          try {
            for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
              var a = _step9.value;

              if (scopeIsNil || a.scope === scope) {
                st.quit |= a.func();
                st.stop |= a.stop;
                st.prevent |= a.prevent; // Quit not

                if (st.quit) {
                  return st;
                }
              }
            } //..........................................

          } catch (err) {
            _iterator9.e(err);
          } finally {
            _iterator9.f();
          }

          return st;
        } //--------------------------------------------

      }]);

      return TiAppActionShortcuts;
    }();

    return {
      TiAppActionShortcuts: TiAppActionShortcuts
    };
  }(),
      TiAppActionShortcuts = _ref32.TiAppActionShortcuts; //################################################
  // # import {TiVue}      from "./polyfill-ti-vue.mjs"


  var _ref34 = function () {
    //---------------------------------------
    function do_map_xxx(modPath, setting) {
      var re = {};

      _.forOwn(setting, function (val, key) {
        var methodName = "map" + _.capitalize(key); // Map namespaced module


        if (modPath) {
          _.assign(re, Vuex[methodName](modPath, val));
        } // Map general
        else {
            _.assign(re, Vuex[methodName](val));
          }
      });

      return re;
    } //---------------------------------------


    function do_extend_setting(store, obj) {
      var is_extendable = false;
      var re = {};

      _.forOwn(obj, function (val, key, obj) {
        var m = /^\.{3}(.*)$/.exec(key);

        if (m) {
          is_extendable = true;
          var modPath = m[1];

          if (store) {
            _.assign(re, do_map_xxx(modPath, val));
          }
        }
      });

      return is_extendable ? re : obj;
    } //---------------------------------------


    var TiVue = {
      /***
       * Generated a new configuration object for `Vuex.Store` to 
       * generated a new Vuex instance. 
       * It  will build sub-modules deeply by invoke self recursively.
       * 
       * @param conf{Object} : Configuration object of `app.store | app.store.modules[n]`
       * @param modName{String} : If defined, the module should `namespaced=true`
       * 
       * @return A New Configuration Object
       */
      StoreConfig: function StoreConfig() {
        var conf = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var modName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        // Build the baseline
        var sc = Ti.Util.merge({
          modules: {}
        }, conf.mixins); // Pick the necessary fields

        if (conf.state || !sc.state) {
          sc.state = Ti.Util.genObj(conf.state);
        }

        sc.getters = _.assign(sc.getters, Ti.Util.merge({}, conf.getters));
        sc.mutations = _.assign(sc.mutations, Ti.Util.merge({}, conf.mutations));
        sc.actions = _.assign(sc.actions, Ti.Util.merge({}, conf.actions)); // I18n

        Ti.I18n.put(conf.i18n); // namespaced module

        if (modName) sc.namespaced = true; // Join modules

        _.forEach(conf.modules, function (modConf, modKey) {
          var newModConf; // inline modual

          if (modKey.startsWith(".")) {
            newModConf = TiVue.StoreConfig(modConf);
          } // namespaced modual
          else {
              newModConf = TiVue.StoreConfig(modConf, modKey);
            } // Update to modules


          sc.modules[modKey] = newModConf;
        }); // Join plugins, make it force to Array


        sc.plugins = [].concat(conf.plugins || []); // Return then

        return sc;
      },
      //---------------------------------------
      CreateStore: function CreateStore(storeConf) {
        return new Vuex.Store(_objectSpread({
          strict: Ti.IsForDev()
        }, storeConf));
      },
      //---------------------------------------
      Options: function Options() {
        var _ref35 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref35$global = _ref35.global,
            global = _ref35$global === void 0 ? {} : _ref35$global,
            _ref35$conf = _ref35.conf,
            conf = _ref35$conf === void 0 ? {} : _ref35$conf,
            store = _ref35.store;

        // Install I18n
        if (_.isPlainObject(conf.i18n)) {
          Ti.I18n.put(conf.i18n);
        } //.............................
        // Pick necessary fields
        //.............................

        /*Data*/


        var Data = _.pick(conf, ["data",
        /*form like `props:[..]` would not be supported*/
        "props",
        /*computed|methods will be deal with later*/
        "watch"]); //.............................

        /*DOM*/


        var DOM = _.pick(conf, ["template", "render", "renderError"]); //.............................

        /*Lifecycle Hooks*/


        var LifecycleHooks = _.pick(conf, ["beforeCreate", "created", "beforeMount", "mounted", "beforeUpdate", "updated", "activated", "deactivated", "beforeDestroy", "destroyed", "errorCaptured"]); //.............................

        /*Assets*/
        // Find global Assets


        var Assets = _.pick(conf, ["directives", "filters", "components"]);

        var it_asset_part = function it_asset_part(val, key, obj) {
          var list = _.flattenDeep([val]);

          var remain = [];

          var _iterator10 = _createForOfIteratorHelper(list),
              _step10;

          try {
            for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
              var asset = _step10.value;

              // => global
              if (asset.globally) {
                // Special for components
                if ("components" == key) {
                  // console.log("!!!", key, val, asset)
                  asset = TiVue.Options({
                    conf: asset,
                    global: global
                  });
                } // Push it


                Ti.Util.pushValue(global, key, asset);
              } // => key
              else {
                  remain.push(asset);
                }
            }
          } catch (err) {
            _iterator10.e(err);
          } finally {
            _iterator10.f();
          }

          obj[key] = remain;
        };

        _.forOwn(Assets, it_asset_part); //.............................

        /*Composition*/


        var Composition = _.pick(conf, ["mixins", "extends"]); //.............................

        /*Misc*/


        var Misc = _.pick(conf, ["name",
        /*com only*/
        "delimiters", "functional", "model", "inheritAttrs", "comments"]); //.............................
        // create options


        var options = _objectSpread({}, _.mapValues(Data, function (v) {
          return Ti.Util.merge({}, v);
        }), {}, DOM, {}, _.mapValues(LifecycleHooks, Ti.Util.groupCall), {
          // Asserts
          directives: Ti.Util.merge({}, Assets.directives),
          filters: Ti.Util.merge({}, Assets.filters),
          // components should merge the computed/methods/watch
          components: function () {
            var coms = {};

            _.map(Assets.components, function (com) {
              coms[com.name] = TiVue.Options({
                conf: com,
                global: global
              });
            });

            return coms;
          }()
        }, Composition, {}, Misc); // thunk data


        if (!_.isFunction(options.data)) {
          options.data = Ti.Util.genObj(options.data || {});
        } //.............................
        // expend the "..." key like object for `computed/methods`
        // if without store defination, they will be dropped


        var merger = _.partial(do_extend_setting, store);

        if (_.isArray(conf.computed)) {
          var _Ti$Util;

          options.computed = (_Ti$Util = Ti.Util).mergeWith.apply(_Ti$Util, [merger, {}].concat(_toConsumableArray(conf.computed)));
        } else if (_.isObject(conf.computed)) {
          options.computed = conf.computed;
        }

        if (_.isArray(conf.methods)) {
          var _Ti$Util2;

          options.methods = (_Ti$Util2 = Ti.Util).mergeWith.apply(_Ti$Util2, [merger, {}].concat(_toConsumableArray(conf.methods)));
        } else if (_.isObject(conf.methods)) {
          options.methods = conf.methods;
        } //.............................
        // bind Vuex.store


        if (store) options.store = store; // return the options

        return options;
      },
      //---------------------------------------

      /***
      Generated a new conf object for `Vue` to generated a new Vue instance.
            @params
      - `conf{Object}` Configuration object of `app | app.components[n]`
            @return A New Configuration Object
      */
      Setup: function Setup() {
        var conf = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var store = arguments.length > 1 ? arguments[1] : undefined;
        var global = {};
        var options = TiVue.Options({
          global: global,
          conf: conf,
          store: store
        }); // return the setup object

        return {
          global: global,
          options: options
        };
      },
      //---------------------------------------
      CreateInstance: function CreateInstance(setup, decorator) {
        var _this3 = this;

        // Global Assets
        var filters = Ti.Util.merge({}, setup.global.filters);
        var directives = Ti.Util.merge({}, setup.global.directives); // filters

        _.forOwn(filters, function (val, key) {
          Vue.filter(key, val);
        }); // directives


        _.forOwn(directives, function (val, key) {
          Vue.directive(key, val);
        }); // components registration


        var defineComponent = function defineComponent(com) {
          // define sub
          _.map(com.components, defineComponent);

          delete com.components; // I18ns

          Ti.I18n.put(com.i18n); // Decorate it

          if (_.isFunction(decorator)) {
            decorator(com);
          } // define self
          //Vue.component(com.name, com)


          _this3.registerComponent(com.name, com);
        };

        _.map(setup.global.components, defineComponent); // Decorate it


        if (_.isFunction(decorator)) {
          decorator(setup.options);
        } // return new vm instance


        return new Vue(setup.options);
      },
      //---------------------------------------
      registerComponent: function registerComponent(name, config) {
        var comName = _.upperFirst(_.camelCase(name));

        Vue.component(comName, config);
      } //---------------------------------------

    };
    return {
      TiVue: TiVue
    };
  }(),
      TiVue = _ref34.TiVue; //################################################
  // # import {TiAppModal} from "./app-modal.mjs"


  var _ref36 = function () {
    var TiAppModal = /*#__PURE__*/function () {
      //////////////////////////////////////////////
      // Attributes
      //////////////////////////////////////////////
      function TiAppModal() {
        _classCallCheck(this, TiAppModal);

        this.icon = undefined;
        this.title = undefined; // info|warn|error|success|track

        this.type = "info"; //--------------------------------------------

        this.iconOk = undefined;
        this.textOk = "i18n:ok";

        this.ok = function (_ref37) {
          var result = _ref37.result;
          return result;
        }; //--------------------------------------------


        this.iconCancel = undefined;
        this.textCancel = "i18n:cancel";

        this.cancel = function () {
          return undefined;
        }; //--------------------------------------------


        this.actions = null; //--------------------------------------------
        // Modal open and close, transition duration
        // I need know the duration, then delay to mount 
        // the main component.
        // Some component will auto resize, it need a static
        // window measurement.

        this.transDelay = 300, //--------------------------------------------
        this.comType = "ti-label";
        this.comConf = {};
        this.components = []; //--------------------------------------------
        // Aspect

        this.closer = "default"; // true|false | (default|bottom|top|left|right)

        this.escape = true;
        this.mask = true; // !TODO maybe blur or something else

        this.clickMaskToClose = false;
        /*
        validator : (v)=>{
          return /^(left|right|top|bottom|center)$/.test(v)
            || /^((left|right)-top|bottom-(left|right))$/.test(v)
        }
        */

        this.position = "center"; //--------------------------------------------
        // Measure

        this.width = "6.4rem";
        this.height = undefined;
        this.spacing = undefined;
        this.overflow = undefined;
        this.adjustable = false; // true|false|"x"|"y"
        //--------------------------------------------
        // data model

        this.result = undefined; //--------------------------------------------
        // modules

        this.modules = {}; //--------------------------------------------

        this.topActions = []; //--------------------------------------------
        // callback

        this.ready = /*#__PURE__*/function () {
          var _ref38 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(app) {
            return regeneratorRuntime.wrap(function _callee10$(_context10) {
              while (1) {
                switch (_context10.prev = _context10.next) {
                  case 0:
                  case "end":
                    return _context10.stop();
                }
              }
            }, _callee10);
          }));

          return function (_x3) {
            return _ref38.apply(this, arguments);
          };
        }();

        this.preload = /*#__PURE__*/function () {
          var _ref39 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(app) {
            return regeneratorRuntime.wrap(function _callee11$(_context11) {
              while (1) {
                switch (_context11.prev = _context11.next) {
                  case 0:
                  case "end":
                    return _context11.stop();
                }
              }
            }, _callee11);
          }));

          return function (_x4) {
            return _ref39.apply(this, arguments);
          };
        }();
      } //////////////////////////////////////////////
      // Methods
      //////////////////////////////////////////////


      _createClass(TiAppModal, [{
        key: "open",
        value: function () {
          var _open2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
            var _this6 = this;

            var resolve,
                TheActions,
                html,
                appInfo,
                app,
                $stub,
                _args13 = arguments;
            return regeneratorRuntime.wrap(function _callee13$(_context13) {
              while (1) {
                switch (_context13.prev = _context13.next) {
                  case 0:
                    resolve = _args13.length > 0 && _args13[0] !== undefined ? _args13[0] : _.identity;
                    TheActions = []; // Customized actions

                    if (this.actions) {
                      TheActions = this.actions;
                    } // Use OK/Canel
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
                      } //..........................................
                    // Setup content


                    html = "<transition :name=\"TransName\" @after-leave=\"OnAfterLeave\">\n          <div class=\"ti-app-modal\"\n            v-if=\"!hidden\"\n              :class=\"TopClass\"\n              :style=\"TopStyle\"\n              @click.left=\"OnClickTop\"\n              v-ti-activable>\n    \n              <div class=\"modal-con\" \n                :class=\"ConClass\"\n                :style=\"ConStyle\"\n                @click.left.stop>\n    \n                <div class=\"modal-head\"\n                  v-if=\"isShowHead\">\n                    <div class=\"as-icon\" v-if=\"icon\"><ti-icon :value=\"icon\"/></div>\n                    <div class=\"as-title\">{{title|i18n}}</div>\n                    <div\n                      v-if=\"hasTopActionBar\"\n                        class=\"as-bar\">\n                          <ti-actionbar\n                            :items=\"topActions\"\n                            align=\"right\"\n                            :status=\"TopActionBarStatus\"/>\n                    </div>\n                </div>\n    \n                <div class=\"modal-main\">\n                  <component\n                    v-if=\"comType\"\n                      class=\"ti-fill-parent\"\n                      :class=\"MainClass\"\n                      :is=\"comType\"\n                      v-bind=\"TheComConf\"\n                      :on-init=\"OnMainInit\"\n                      :value=\"result\"\n                      @close=\"OnClose\"\n                      @ok=\"OnOk\"\n                      @change=\"OnChange\"\n                      @actions:update=\"OnActionsUpdated\"/>\n                </div>\n    \n                <div class=\"modal-actions\"\n                  v-if=\"hasActions\">\n                    <div class=\"as-action\"\n                      v-for=\"a of actions\"\n                        @click.left=\"OnClickActon(a)\">\n                        <div class=\"as-icon\" v-if=\"a.icon\">\n                          <ti-icon :value=\"a.icon\"/></div>\n                        <div class=\"as-text\">{{a.text|i18n}}</div>\n                    </div>\n                </div>\n    \n                <div class=\"modal-closer\"\n                  v-if=\"hasCloser\"\n                    :class=\"CloserClass\">\n                      <ti-icon value=\"zmdi-close\" @click.native=\"OnClose\"/>\n                </div>\n            </div>\n        </div></transition>"; //..........................................
                    // Prepare the app info

                    appInfo = {
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
                        //--------------------------------------
                        closer: this.closer,
                        escape: this.escape,
                        mask: this.mask,
                        position: this.position,
                        clickMaskToClose: this.clickMaskToClose,
                        //--------------------------------------
                        width: this.width,
                        height: this.height,
                        spacing: this.spacing,
                        overflow: this.overflow,
                        adjustable: this.adjustable,
                        //--------------------------------------
                        result: _.cloneDeep(this.result)
                      },
                      //////////////////////////////////////////
                      store: {
                        modules: _.defaults({
                          "viewport": "@mod:ti/viewport"
                        }, this.modules)
                      },
                      //////////////////////////////////////////
                      computed: {
                        //--------------------------------------
                        TopClass: function TopClass() {
                          var nilHeight = Ti.Util.isNil(this.height);
                          return this.getTopClass({
                            "show-mask": this.isShowMask,
                            "no-mask": !this.isShowMask,
                            "has-height": !nilHeight,
                            "nil-height": nilHeight
                          }, "at-".concat(this.position));
                        },
                        //--------------------------------------
                        TopStyle: function TopStyle() {
                          if ('center' != this.position) {
                            return {
                              "padding": Ti.Css.toSize(this.spacing)
                            };
                          }
                        },
                        //--------------------------------------
                        TransName: function TransName() {
                          return "app-modal-trans-at-".concat(this.position);
                        },
                        //--------------------------------------
                        isShowHead: function isShowHead() {
                          return this.icon || this.title || this.hasTopActionBar;
                        },
                        //--------------------------------------
                        hasTopActionBar: function hasTopActionBar() {
                          return !_.isEmpty(this.topActions);
                        },
                        //--------------------------------------
                        isShowMask: function isShowMask() {
                          return this.mask ? true : false;
                        },
                        //--------------------------------------
                        hasActions: function hasActions() {
                          return !_.isEmpty(this.actions);
                        },
                        //--------------------------------------
                        hasCloser: function hasCloser() {
                          return this.closer ? true : false;
                        },
                        //--------------------------------------
                        isCloserDefault: function isCloserDefault() {
                          return true === this.closer || "default" == this.closer;
                        },
                        //--------------------------------------
                        ConClass: function ConClass() {
                          return Ti.Css.mergeClassName({
                            "is-show-header": this.isShowHead,
                            "is-hide-header": !this.isShowHead,
                            "is-show-actions": this.hasActions,
                            "is-hide-actions": !this.hasActions,
                            "is-closer-default": this.isCloserDefault,
                            "has-top-action-bar": this.hasTopActionBar
                          }, "is-".concat(this.type));
                        },
                        //--------------------------------------
                        ConStyle: function ConStyle() {
                          return Ti.Css.toStyle({
                            width: this.width,
                            height: this.height
                          });
                        },
                        //--------------------------------------
                        MainClass: function MainClass() {
                          return Ti.Css.mergeClassName("modal-type-is-".concat(this.type));
                        },
                        //--------------------------------------
                        Main: function Main() {
                          return this.$store.state.main;
                        },
                        //--------------------------------------
                        TopActionBarStatus: function TopActionBarStatus() {
                          return _.get(this.Main, "status");
                        },
                        //--------------------------------------
                        CloserClass: function CloserClass() {
                          return Ti.Css.mergeClassName(_defineProperty({
                            'as-lamp-cord': !this.isCloserDefault,
                            'as-default': this.isCloserDefault
                          }, "at-".concat(this.closer), !this.isCloserDefault));
                        },
                        //--------------------------------------
                        TheComConf: function TheComConf() {
                          return Ti.Util.explainObj(this, this.comConf);
                        } //--------------------------------------

                      },
                      //////////////////////////////////////////
                      methods: {
                        //--------------------------------------
                        // Events
                        //--------------------------------------
                        OnClickTop: function OnClickTop() {
                          if (this.clickMaskToClose) {
                            this.hidden = true;
                          }
                        },
                        //--------------------------------------
                        OnClose: function OnClose() {
                          this.close();
                        },
                        //--------------------------------------
                        OnOk: function OnOk(re) {
                          if (_.isUndefined(re)) {
                            re = this.result;
                          }

                          this.close(re);
                        },
                        //--------------------------------------
                        OnChange: function OnChange(newVal) {
                          this.result = newVal;
                        },
                        //--------------------------------------
                        OnActionsUpdated: function OnActionsUpdated() {
                          var actions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
                          this.topActions = actions;
                          Ti.App(this).reWatchShortcut(actions);
                        },
                        //--------------------------------------
                        OnClickActon: function OnClickActon(a) {
                          var _this4 = this;

                          return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
                            var _app2, status, _$body, _re5;

                            return regeneratorRuntime.wrap(function _callee12$(_context12) {
                              while (1) {
                                switch (_context12.prev = _context12.next) {
                                  case 0:
                                    if (!a.handler) {
                                      _context12.next = 8;
                                      break;
                                    }

                                    _app2 = Ti.App(_this4);
                                    status = {
                                      close: true
                                    };
                                    _$body = _app2.$vm();
                                    _context12.next = 6;
                                    return a.handler({
                                      $app: _app2,
                                      $body: _$body,
                                      $main: _$body.$main,
                                      result: _.cloneDeep(_$body.result),
                                      status: status
                                    });

                                  case 6:
                                    _re5 = _context12.sent;

                                    if (status.close) {
                                      _this4.close(_re5);
                                    } else {
                                      _this4.setResult(_re5);
                                    }

                                  case 8:
                                  case "end":
                                    return _context12.stop();
                                }
                              }
                            }, _callee12);
                          }))();
                        },
                        //--------------------------------------
                        OnAfterLeave: function OnAfterLeave() {
                          Ti.App(this).destroy(true);
                          resolve(this.returnValue);
                        },
                        //--------------------------------------
                        OnMainInit: function OnMainInit($main) {
                          var app = Ti.App(this);
                          this.$main = $main;
                          app.$vmMain($main); // Watch escape

                          if (this.escape) {
                            app.watchShortcut([{
                              action: "root:close",
                              shortcut: "ESCAPE"
                            }]);
                          } // Active current


                          this.setActived(); // Report ready

                          this.ready(app);
                        },
                        //--------------------------------------
                        // Utility
                        //--------------------------------------
                        close: function close(re) {
                          if (!_.isUndefined(re)) {
                            this.returnValue = re;
                          }

                          this.hidden = true;
                        },
                        //--------------------------------------
                        setResult: function setResult(result) {
                          this.returnValue = result;
                        } //--------------------------------------

                      },
                      //////////////////////////////////////////
                      mounted: function mounted() {
                        var _this5 = this;

                        var app = Ti.App(this);
                        Ti.App.pushInstance(app);
                        this.$nextTick(function () {
                          _this5.hidden = false;
                        });
                      },
                      //////////////////////////////////////////
                      beforeDestroy: function beforeDestroy() {
                        var app = Ti.App(this);
                        Ti.App.pullInstance(app);
                      } //////////////////////////////////////////

                    }; // let appInfo = {
                    //..........................................
                    // create TiApp

                    app = Ti.App(appInfo); //..........................................

                    _context13.next = 8;
                    return app.init();

                  case 8:
                    //..........................................
                    // Mount to stub
                    $stub = Ti.Dom.createElement({
                      $p: document.body,
                      className: "the-stub"
                    }); //..........................................

                    _context13.next = 11;
                    return this.preload(app);

                  case 11:
                    //..........................................
                    app.mountTo($stub); // The set the main com

                    _.delay(function () {
                      app.$vm().comType = _this6.comType;
                    }, this.transDelay || 0); //..........................................
                    // Then it was waiting the `close()` be invoked
                    //..........................................


                  case 13:
                  case "end":
                    return _context13.stop();
                }
              }
            }, _callee13, this);
          }));

          function open() {
            return _open2.apply(this, arguments);
          }

          return open;
        }() // ~ open()
        //////////////////////////////////////////

      }]);

      return TiAppModal;
    }();

    return {
      TiAppModal: TiAppModal
    };
  }(),
      TiAppModal = _ref36.TiAppModal; //---------------------------------------


  var TI_APP = Symbol("ti-app");
  var TI_INFO = Symbol("ti-info");
  var TI_CONF = Symbol("ti-conf");
  var TI_STORE = Symbol("ti-store");
  var TI_VM = Symbol("ti-vm");
  var TI_VM_MAIN = Symbol("ti-vm-main");
  var TI_VM_ACTIVED = Symbol("ti-vm-actived"); //---------------------------------------

  /***
  Encapsulate all stuffs of Titanium Application
  */

  var OneTiApp = /*#__PURE__*/function () {
    function OneTiApp() {
      var tinfo = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, OneTiApp);

      this.$info(tinfo);
      this.$conf(null);
      this.$store(null);
      this.$vm(null);
      this.$shortcuts = new TiAppActionShortcuts(); // this.$shortcuts = new Proxy(sc, {
      //   set: function (target, propKey, value, receiver) {
      //     if("actions" == propKey) {
      //       console.log(`!!!setting ${propKey}!`, value, receiver);
      //     }
      //     return Reflect.set(target, propKey, value, receiver);
      //   }
      // })
    } //---------------------------------------


    _createClass(OneTiApp, [{
      key: "name",
      value: function name() {
        return this.$info().name;
      } //---------------------------------------

    }, {
      key: "$info",
      value: function $info(info) {
        return Ti.Util.geset(this, TI_INFO, info);
      }
    }, {
      key: "$conf",
      value: function $conf(conf) {
        return Ti.Util.geset(this, TI_CONF, conf);
      }
    }, {
      key: "$store",
      value: function $store(store) {
        return Ti.Util.geset(this, TI_STORE, store);
      }
    }, {
      key: "$vm",
      value: function $vm(vm) {
        return Ti.Util.geset(this, TI_VM, vm);
      }
    }, {
      key: "$vmMain",
      value: function $vmMain(mvm) {
        return Ti.Util.geset(this, TI_VM_MAIN, mvm);
      } //---------------------------------------

    }, {
      key: "$state",
      value: function $state() {
        return this.$store().state;
      } //---------------------------------------

    }, {
      key: "init",
      value: function () {
        var _init = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
          var info, conf, store, sc, setup, vm;
          return regeneratorRuntime.wrap(function _callee14$(_context14) {
            while (1) {
              switch (_context14.prev = _context14.next) {
                case 0:
                  // App Must has a name
                  info = this.$info(); // if(!info.name) {
                  //   throw Ti.Err.make("e-ti-app_load_info_without_name")
                  // }
                  // load each fields of info obj

                  _context14.next = 3;
                  return LoadTiAppInfo(info);

                case 3:
                  conf = _context14.sent;
                  this.$conf(conf);

                  if (Ti.IsInfo("TiApp")) {
                    console.log("Ti.$conf", this.$conf());
                  } // Store instance


                  if (conf.store) {
                    sc = TiVue.StoreConfig(conf.store);

                    if (Ti.IsInfo("TiApp")) {
                      console.log("TiVue.StoreConfig:", sc);
                    }

                    store = TiVue.CreateStore(sc);
                    this.$store(store);
                    store[TI_APP] = this;

                    if (Ti.IsInfo("TiApp")) {
                      console.log("Ti.$store", this.$store());
                    }
                  } // TODO: shoudl I put this below to LoadTiLinkedObj?
                  // It is sames a litter bit violence -_-! so put here for now...
                  //Ti.I18n.put(conf.i18n)
                  // Vue instance


                  setup = TiVue.Setup(conf, store);

                  if (Ti.IsInfo("TiApp")) {
                    console.log("TiVue.VueSetup(conf)");
                    console.log(" -- global:", setup.global);
                    console.log(" -- options:", setup.options);
                  }

                  vm = TiVue.CreateInstance(setup, function (com) {
                    Ti.Config.decorate(com);
                  });
                  vm[TI_APP] = this;
                  this.$vm(vm); // return self for chained operation

                  return _context14.abrupt("return", this);

                case 13:
                case "end":
                  return _context14.stop();
              }
            }
          }, _callee14, this);
        }));

        function init() {
          return _init.apply(this, arguments);
        }

        return init;
      }() //---------------------------------------

    }, {
      key: "mountTo",
      value: function mountTo(el) {
        this.$el = Ti.Dom.find(el); //console.log("mountTo", this.$el)
        // Mount App

        this.$vm().$mount(this.$el); // bind to Element for find back anytime

        this.$el = this.$vm().$el;
        this.$el[TI_APP] = this;
      } //---------------------------------------

    }, {
      key: "destroy",
      value: function destroy() {
        var removeDom = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        this.$vm().$destroy();
        this.$el[TI_APP] = null;

        if (removeDom) {
          Ti.Dom.remove(this.$el);
        }
      } //---------------------------------------

    }, {
      key: "setActivedVm",
      value: function setActivedVm() {
        var vm = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        this[TI_VM_ACTIVED] = vm;
        var aIds = vm.tiActivableComIdPath();
        this.$store().commit("viewport/setActivedIds", aIds);
      } //---------------------------------------

    }, {
      key: "setBlurredVm",
      value: function setBlurredVm() {
        var vm = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        if (this[TI_VM_ACTIVED] == vm) {
          var $pvm = vm.tiParentActivableCom();
          this[TI_VM_ACTIVED] = $pvm;
          var aIds = $pvm ? $pvm.tiActivableComIdPath() : [];
          this.$store().commit("viewport/setActivedIds", aIds);
        }
      } //---------------------------------------

    }, {
      key: "getActivedVm",
      value: function getActivedVm() {
        return this[TI_VM_ACTIVED];
      } //---------------------------------------

    }, {
      key: "reWatchShortcut",
      value: function reWatchShortcut() {
        var actions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        this.unwatchShortcut();
        this.watchShortcut(actions);
      } //---------------------------------------

    }, {
      key: "watchShortcut",
      value: function watchShortcut() {
        var _this7 = this;

        var actions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        this.$shortcuts.watch(this, actions, {
          $com: function $com() {
            return _this7.$vmMain();
          },
          argContext: this.$state()
        });
      } //---------------------------------------

    }, {
      key: "unwatchShortcut",
      value: function unwatchShortcut() {
        var _this$$shortcuts;

        for (var _len5 = arguments.length, uniqKeys = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          uniqKeys[_key5] = arguments[_key5];
        }

        //console.log("unwatchShortcut", uniqKeys)
        (_this$$shortcuts = this.$shortcuts).unwatch.apply(_this$$shortcuts, [this].concat(uniqKeys));
      } //---------------------------------------

    }, {
      key: "guardShortcut",
      value: function guardShortcut(scope, uniqKey, guard) {
        this.$shortcuts.addGuard(scope, uniqKey, guard);
      } //---------------------------------------

    }, {
      key: "pulloutShortcut",
      value: function pulloutShortcut(scope, uniqKey, guard) {
        this.$shortcuts.removeGuard(scope, uniqKey, guard);
      } //---------------------------------------

      /***
       * @param uniqKey{String} : like "CTRL+S"
       * @param $event{Event} : DOM Event Object, for prevent or stop 
       */

    }, {
      key: "fireShortcut",
      value: function fireShortcut(uniqKey, $event) {
        //......................................
        var st = {
          stop: false,
          prevent: false,
          quit: false
        }; //......................................
        // Actived VM shortcut

        var vm = this.getActivedVm();

        if (vm) {
          var vmPath = vm.tiActivableComPath(false);

          var _iterator11 = _createForOfIteratorHelper(vmPath),
              _step11;

          try {
            for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
              var aVm = _step11.value;

              if (_.isFunction(aVm.__ti_shortcut)) {
                var _re6 = aVm.__ti_shortcut(uniqKey) || {};

                st.stop |= _re6.stop;
                st.prevent |= _re6.prevent;
                st.quit |= _re6.quit;

                if (st.quit) {
                  break;
                }
              }
            }
          } catch (err) {
            _iterator11.e(err);
          } finally {
            _iterator11.f();
          }
        } //......................................


        this.$shortcuts.fire(this, uniqKey, st); //......................................

        if (st.prevent) {
          $event.preventDefault();
        }

        if (st.stop) {
          $event.stopPropagation();
        } //......................................


        return st;
      } //---------------------------------------

      /***
       * cmd : {String|Object}
       * payload : Any
       * 
       * ```
       * "commit:xxx"   => {method:"commit",name:"xxx"}
       * "dispatch:xxx" => {method:"dispatch",name:"xxx"}
       * "root:xxx"     => {method:"root",name:"xxx"}
       * "main:xxx"     => {method:"main",name:"xxx"}
       * ```
       */

    }, {
      key: "exec",
      value: function () {
        var _exec = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(cmd, payload) {
          var ta, _m;

          return regeneratorRuntime.wrap(function _callee15$(_context15) {
            while (1) {
              switch (_context15.prev = _context15.next) {
                case 0:
                  ta = cmd; //...................

                  if (!_.isString(ta)) {
                    _context15.next = 6;
                    break;
                  }

                  _m = /^(commit|dispatch|root|main):(.+)$/.exec(ta);

                  if (_m) {
                    _context15.next = 5;
                    break;
                  }

                  return _context15.abrupt("return");

                case 5:
                  ta = {
                    method: _m[1],
                    name: _m[2]
                  };

                case 6:
                  _context15.next = 8;
                  return this[ta.method](ta.name, payload);

                case 8:
                  return _context15.abrupt("return", _context15.sent);

                case 9:
                case "end":
                  return _context15.stop();
              }
            }
          }, _callee15, this);
        }));

        function exec(_x5, _x6) {
          return _exec.apply(this, arguments);
        }

        return exec;
      }() //---------------------------------------

    }, {
      key: "commit",
      value: function commit(nm, payload) {
        this.$store().commit(nm, payload);
      }
    }, {
      key: "dispatch",
      value: function () {
        var _dispatch = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(nm, payload) {
          return regeneratorRuntime.wrap(function _callee16$(_context16) {
            while (1) {
              switch (_context16.prev = _context16.next) {
                case 0:
                  if (Ti.IsInfo("TiApp")) {
                    console.log("TiApp.dispatch", nm, payload);
                  }

                  _context16.next = 3;
                  return this.$store().dispatch(nm, payload);

                case 3:
                  return _context16.abrupt("return", _context16.sent);

                case 4:
                case "end":
                  return _context16.stop();
              }
            }
          }, _callee16, this);
        }));

        function dispatch(_x7, _x8) {
          return _dispatch.apply(this, arguments);
        }

        return dispatch;
      }() //---------------------------------------

    }, {
      key: "root",
      value: function root(nm, payload) {
        if (Ti.IsInfo("TiApp")) {
          console.log("TiApp.self", nm, payload);
        }

        var vm = this.$vm();
        var fn = vm[nm];

        if (_.isFunction(fn)) {
          return fn(payload);
        } // Properties
        else if (!_.isUndefined(fn)) {
            return fn;
          } // report error
          else {
              throw Ti.Err.make("e-ti-app-self", {
                nm: nm,
                payload: payload
              });
            }
      } //---------------------------------------

    }, {
      key: "main",
      value: function main(nm, payload) {
        if (Ti.IsInfo("TiApp")) {
          console.log("TiApp.main", nm, payload);
        }

        var vm = this.$vmMain();
        var fn = vm[nm];

        if (_.isFunction(fn)) {
          return fn(payload);
        } // Properties
        else if (!_.isUndefined(fn)) {
            return fn;
          } // report error
          else {
              throw Ti.Err.make("e-ti-app-main", {
                nm: nm,
                payload: payload
              });
            }
      } //---------------------------------------
      // Invoke the function in window object

    }, {
      key: "global",
      value: function global(nm) {
        // Find the function in window
        var fn = _.get(window, nm); // Fire the function


        for (var _len6 = arguments.length, args = new Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
          args[_key6 - 1] = arguments[_key6];
        }

        if (_.isFunction(fn)) {
          return fn.apply(this, args);
        } // report error
        else {
            throw Ti.Err.make("e-ti-app-main", {
              nm: nm,
              args: args
            });
          }
      } //---------------------------------------

    }, {
      key: "get",
      value: function get(key) {
        if (!key) {
          return this.$vm();
        }

        return this.$vm()[key];
      } //---------------------------------------

    }, {
      key: "loadView",
      value: function () {
        var _loadView = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(view) {
          var mod, moInfo, moConf, comInfo, comConf, setup, comName;
          return regeneratorRuntime.wrap(function _callee17$(_context17) {
            while (1) {
              switch (_context17.prev = _context17.next) {
                case 0:
                  if (!view.modType) {
                    _context17.next = 9;
                    break;
                  }

                  _context17.next = 3;
                  return Ti.Load(view.modType);

                case 3:
                  moInfo = _context17.sent;
                  _context17.next = 6;
                  return LoadTiLinkedObj(moInfo, {
                    dynamicAlias: new Ti.Config.AliasMapping({
                      "^\./": view.modType + "/"
                    })
                  });

                case 6:
                  moConf = _context17.sent;

                  // Default state
                  if (!moConf.state) {
                    moConf.state = {};
                  } // Formed


                  mod = TiVue.StoreConfig(moConf, true); // this.$store().registerModule(name, mo)

                case 9:
                  _context17.next = 11;
                  return Ti.Load(view.comType);

                case 11:
                  comInfo = _context17.sent;
                  _context17.next = 14;
                  return LoadTiLinkedObj(comInfo, {
                    dynamicAlias: new Ti.Config.AliasMapping({
                      "^\./": view.comType + "/"
                    })
                  });

                case 14:
                  comConf = _context17.sent;
                  //.....................................
                  // TODO: shoudl I put this below to LoadTiLinkedObj?
                  // It is sames a litter bit violence -_-! so put here for now...
                  //Ti.I18n.put(comInfo.i18n)
                  // Setup ...
                  setup = TiVue.Setup(comConf); //.....................................
                  // Get the formed comName

                  comName = setup.options.name || Ti.Util.getLinkName(view.comType); //.....................................

                  if (Ti.IsInfo("TiApp")) {
                    console.log("TiApp.loadView:", comName);
                    console.log(" -- global:", setup.global);
                    console.log(" -- options:", setup.options);
                  } //.....................................
                  // Decorate it


                  Ti.Config.decorate(setup.options); //.....................................
                  // Define the com
                  //console.log("define com:", comName)
                  //Vue.component(comName, setup.options)

                  TiVue.registerComponent(comName, setup.options); //.....................................

                  _.map(setup.global.components, function (com) {
                    //Ti.I18n.put(com.i18n)
                    // Decorate it
                    Ti.Config.decorate(com); // Regist it
                    //console.log("define com:", com.name)
                    //Vue.component(com.name, com)

                    TiVue.registerComponent(com.name, com);
                  }); //.....................................


                  return _context17.abrupt("return", _objectSpread({}, view, {
                    comName: comName,
                    mod: mod
                  }));

                case 22:
                case "end":
                  return _context17.stop();
              }
            }
          }, _callee17);
        }));

        function loadView(_x9) {
          return _loadView.apply(this, arguments);
        }

        return loadView;
      }()
    }]);

    return OneTiApp;
  }(); //---------------------------------------


  var TiApp = function TiApp(a0) {
    // Guard it
    if (Ti.Util.isNil(a0)) {
      return null;
    } // load the app info 


    if (_.isString(a0)) {
      return Ti.Load(a0).then(function (info) {
        return new OneTiApp(info);
      });
    } // Get back App from Element


    if (_.isElement(a0)) {
      var $el = a0;
      var app = $el[TI_APP];

      while (!app && $el.parentElement) {
        $el = $el.parentElement;
        app = $el[TI_APP];
      }

      return app;
    } // for Vue or Vuex


    if (a0 instanceof Vue) {
      return a0.$root[TI_APP];
    } // for Vue or Vuex


    if (a0 instanceof Vuex.Store) {
      return a0[TI_APP];
    } // return the app instance directly


    if (_.isPlainObject(a0)) {
      return new OneTiApp(a0);
    }
  }; //---------------------------------------


  var APP_STACK = []; //---------------------------------------

  TiApp.pushInstance = function (app) {
    if (app) {
      APP_STACK.push(app);
    }
  }; //---------------------------------------


  TiApp.pullInstance = function (app) {
    if (app) {
      _.pull(APP_STACK, app);
    }
  }; //---------------------------------------


  TiApp.topInstance = function () {
    return _.last(APP_STACK);
  }; //---------------------------------------


  TiApp.hasTopInstance = function () {
    return APP_STACK.length > 0;
  }; //---------------------------------------


  TiApp.eachInstance = function () {
    var iteratee = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _.identity;

    _.forEach(APP_STACK, iteratee);
  }; //---------------------------------------


  TiApp.allInstance = function () {
    var iteratee = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _.identity;
    return APP_STACK;
  }; //---------------------------------------


  TiApp.Open = function (options) {
    return new Promise(function (resolve) {
      var $m = new TiAppModal();

      _.assign($m, options);

      $m.open(resolve);
    });
  }; //---------------------------------------


  return {
    App: TiApp
  };
}(),
    App = _ref26.App; //##################################################
// # import {Err}          from "./err.mjs"


var _ref40 = function () {
  var TiError = {
    make: function make() {
      var code = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      var data = arguments.length > 1 ? arguments[1] : undefined;
      var er = code;

      if (_.isString(code)) {
        er = {
          code: code,
          data: data
        };
      }

      var msgKey = er.code.replace(/[.]/g, "-");
      var errMsg = Ti.I18n.get(msgKey);

      if (data) {
        if (_.isPlainObject(data)) {
          errMsg += " : " + JSON.stringify(data);
        } else {
          errMsg += " : " + data;
        }
      }

      var errObj = new Error(errMsg.trim());
      return _.assign(errObj, er);
    }
  }; //-----------------------------------

  return {
    Err: TiError
  };
}(),
    Err = _ref40.Err; //##################################################
// # import {Config}       from "./config.mjs"


var _ref41 = function () {
  var CONFIG = {
    prefix: {},
    alias: {},
    suffix: {}
  }; /////////////////////////////////////////////////

  var AliasMapping = /*#__PURE__*/function () {
    function AliasMapping(alias) {
      _classCallCheck(this, AliasMapping);

      this.list = [];
      this.reset(alias);
    }

    _createClass(AliasMapping, [{
      key: "reset",
      value: function reset() {
        var _this8 = this;

        var alias = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _.forOwn(alias, function (val, key) {
          _this8.list.push({
            regex: new RegExp(key),
            newstr: val
          });
        });

        return this;
      }
    }, {
      key: "get",
      value: function get() {
        var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        var dft = arguments.length > 1 ? arguments[1] : undefined;
        var u2 = url;

        var _iterator12 = _createForOfIteratorHelper(this.list),
            _step12;

        try {
          for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
            var li = _step12.value;

            if (li.regex.test(u2)) {
              u2 = u2.replace(li.regex, li.newstr);
            }
          }
        } catch (err) {
          _iterator12.e(err);
        } finally {
          _iterator12.f();
        }

        return u2 || (_.isUndefined(dft) ? url : dft);
      }
    }]);

    return AliasMapping;
  }();

  var ALIAS = new AliasMapping().reset(); /////////////////////////////////////////////////

  var SuffixMapping = /*#__PURE__*/function () {
    function SuffixMapping(suffix) {
      _classCallCheck(this, SuffixMapping);

      this.list = [];
      this.reset(suffix);
    }

    _createClass(SuffixMapping, [{
      key: "reset",
      value: function reset() {
        var _this9 = this;

        var suffix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _.forOwn(suffix, function (val, key) {
          // console.log("suffix", key, val)
          _this9.list.push({
            regex: new RegExp(key),
            suffix: val
          });
        });

        return this;
      }
    }, {
      key: "get",
      value: function get() {
        var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        var dft = arguments.length > 1 ? arguments[1] : undefined;
        var u2 = url;

        var _iterator13 = _createForOfIteratorHelper(this.list),
            _step13;

        try {
          for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
            var li = _step13.value;

            if (li.regex.test(u2) && !u2.endsWith(li.suffix)) {
              u2 += li.suffix;
              break;
            }
          }
        } catch (err) {
          _iterator13.e(err);
        } finally {
          _iterator13.f();
        }

        return u2 || (_.isUndefined(dft) ? url : dft);
      }
    }]);

    return SuffixMapping;
  }();

  var SUFFIX = new SuffixMapping().reset(); /////////////////////////////////////////////////

  var TiConfig = {
    AliasMapping: AliasMapping,
    //.................................
    version: function version() {
      return CONFIG.version;
    },
    //.................................
    set: function set() {
      var _ref42 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          prefix = _ref42.prefix,
          alias = _ref42.alias,
          suffix = _ref42.suffix,
          lang = _ref42.lang;

      if (prefix) CONFIG.prefix = prefix;

      if (alias) {
        CONFIG.alias = alias;
        ALIAS.reset(CONFIG.alias);
      }

      if (suffix) {
        CONFIG.suffix = suffix;
        SUFFIX.reset(CONFIG.suffix);
      }

      if (lang) CONFIG.lang = lang;
    },
    //.................................
    update: function update() {
      var _ref43 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          prefix = _ref43.prefix,
          alias = _ref43.alias,
          suffix = _ref43.suffix,
          lang = _ref43.lang;

      if (prefix) _.assign(CONFIG.prefix, prefix);

      if (alias) {
        _.assign(CONFIG.alias, alias);

        ALIAS.reset(CONFIG.alias);
      }

      if (suffix) {
        _.assign(CONFIG.suffix, suffix);

        SUFFIX.reset(CONFIG.suffix);
      }

      if (lang) CONFIG.lang = lang;
    },
    //.................................
    get: function get() {
      var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (key) {
        return _.get(CONFIG, key);
      }

      return CONFIG;
    },
    //...............................
    decorate: function decorate(com) {
      //console.log("!!!decorate(com)", com)
      // push the computed prop to get the name
      var comName = com.name || "Unkown";
      Ti.Util.pushValue(com, "mixins", {
        computed: {
          tiComType: function tiComType() {
            return comName;
          }
        }
      });
    },
    //...............................
    lang: function lang() {
      return TiConfig.get("lang") || "zh-cn";
    },
    //...............................
    url: function url() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

      var _ref44 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref44$dynamicPrefix = _ref44.dynamicPrefix,
          dynamicPrefix = _ref44$dynamicPrefix === void 0 ? {} : _ref44$dynamicPrefix,
          dynamicAlias = _ref44.dynamicAlias;

      // apply alias
      var ph, m; //.........................................
      // amend the url dynamically

      if (dynamicAlias) {
        var a_map = dynamicAlias instanceof AliasMapping ? dynamicAlias : new AliasMapping().reset(dynamicAlias);
        ph = a_map.get(path, null);
      } //.........................................
      // Full-url, just return


      var loadUrl;

      if (/^((https?:)?\/\/)/.test(ph)) {
        // expend suffix
        if (!/^.+\.(css|js|mjs|json|txt|text|html|xml)$/.test(ph)) {
          loadUrl = SUFFIX.get(ph);
        } // Keep orignal
        else {
            loadUrl = ph;
          }
      } // amend the url statictly
      else {
          ph = ALIAS.get(ph || path); //.........................................
          // expend suffix

          if (!/^.+\.(css|js|mjs|json|txt|text|html|xml)$/.test(ph)) {
            ph = SUFFIX.get(ph);
          } //.........................................
          // expend prefix


          m = /^(@([^:]+):?)(.*)/.exec(ph);
          if (!m) return ph;

          var _m$slice = m.slice(2),
              _m$slice2 = _slicedToArray(_m$slice, 2),
              prefixName = _m$slice2[0],
              url = _m$slice2[1];

          var prefix = dynamicPrefix[prefixName] || CONFIG.prefix[prefixName];
          if (!prefix) throw Ti.Err.make("e-ti-config-prefix_without_defined", prefixName); //.........................................

          loadUrl = prefix + url;
        } //console.log("load::", loadUrl)


      return loadUrl; //...........................................
    }
  }; /////////////////////////////////////////////////

  return {
    Config: TiConfig
  };
}(),
    Config = _ref41.Config; //##################################################
// # import {Dom}          from "./dom.mjs"


var _ref45 = function () {
  var TiDom = {
    createElement: function createElement(_ref46) {
      var _ref46$tagName = _ref46.tagName,
          tagName = _ref46$tagName === void 0 ? "div" : _ref46$tagName,
          _ref46$attrs = _ref46.attrs,
          attrs = _ref46$attrs === void 0 ? {} : _ref46$attrs,
          _ref46$props = _ref46.props,
          props = _ref46$props === void 0 ? {} : _ref46$props,
          _ref46$className = _ref46.className,
          className = _ref46$className === void 0 ? "" : _ref46$className,
          _ref46$$p = _ref46.$p,
          $p = _ref46$$p === void 0 ? null : _ref46$$p;
      var $doc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
      var $el = $doc.createElement(tagName);
      if (className) $el.className = Ti.Css.joinClassNames(className);

      _.forOwn(attrs, function (val, key) {
        $el.setAttribute(key, val);
      });

      _.forOwn(props, function (val, key) {
        $el[key] = val;
      });

      if ($p) {
        $p.appendChild($el);
      }

      return $el;
    },
    appendToHead: function appendToHead($el) {
      var $head = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.head;

      if (_.isElement($el) && _.isElement($head)) {
        $head.appendChild($el);
      }
    },
    appendToBody: function appendToBody($el) {
      var $head = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.body;

      if (_.isElement($el) && _.isElement($body)) {
        $body.appendChild($el);
      }
    },
    appendTo: function appendTo($el, $p) {
      if (_.isElement($el) && _.isElement($p)) {
        $p.appendChild($el);
      }
    },
    prependTo: function prependTo($el, $p) {
      if ($p.firstChild) {
        $p.insertBefore($el, $p.firstChild);
      } else {
        $p.appendChild($el);
      }
    },
    // self by :scope
    findAll: function findAll() {
      var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "*";
      var $doc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
      if (!$doc) return [];
      var $ndList = $doc.querySelectorAll(selector);
      return _toConsumableArray($ndList);
    },
    find: function find() {
      var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "*";
      var $doc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
      if (!$doc) return [];
      if (_.isElement(selector)) return selector;
      return $doc.querySelector(selector);
    },
    remove: function remove(selectorOrElement, context) {
      if (_.isString(selectorOrElement)) {
        var $els = TiDom.findAll(selectorOrElement, context);

        var _iterator14 = _createForOfIteratorHelper($els),
            _step14;

        try {
          for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
            var $el = _step14.value;
            TiDom.remove($el);
          }
        } catch (err) {
          _iterator14.e(err);
        } finally {
          _iterator14.f();
        }

        return;
      } // remove single element


      if (_.isElement(selectorOrElement)) selectorOrElement.parentNode.removeChild(selectorOrElement);
    },
    ownerWindow: function ownerWindow($el) {
      if ($el.defaultView) return $el.defaultView;

      if ($el.ownerDocument) {
        return $el.ownerDocument.defaultView;
      }

      return $el;
    },
    autoRootFontSize: function autoRootFontSize() {
      var _ref47 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref47$$win = _ref47.$win,
          $win = _ref47$$win === void 0 ? window : _ref47$$win,
          _ref47$phoneMaxWidth = _ref47.phoneMaxWidth,
          phoneMaxWidth = _ref47$phoneMaxWidth === void 0 ? 540 : _ref47$phoneMaxWidth,
          _ref47$tabletMaxWidth = _ref47.tabletMaxWidth,
          tabletMaxWidth = _ref47$tabletMaxWidth === void 0 ? 768 : _ref47$tabletMaxWidth,
          _ref47$designWidth = _ref47.designWidth,
          designWidth = _ref47$designWidth === void 0 ? 1000 : _ref47$designWidth,
          _ref47$max = _ref47.max,
          max = _ref47$max === void 0 ? 100 : _ref47$max,
          _ref47$min = _ref47.min,
          min = _ref47$min === void 0 ? 80 : _ref47$min,
          callback = _ref47.callback;

      var $doc = window.document;
      var $root = document.documentElement;
      var size = $win.innerWidth / designWidth * max;
      var fontSize = Math.min(Math.max(size, min), max); // apply the mark

      if (_.isFunction(callback)) {
        var mode = $win.innerWidth > tabletMaxWidth ? "desktop" : $win.innerWidth > phoneMaxWidth ? "tablet" : "phone";
        callback({
          $win: $win,
          $doc: $doc,
          $root: $root,
          mode: mode,
          fontSize: fontSize,
          width: $win.innerWidth,
          height: $win.innerHeight
        });
      }
    },
    watchDocument: function watchDocument(event, handler) {
      document.addEventListener(event, handler);
    },
    unwatchDocument: function unwatchDocument(event, handler) {
      document.removeEventListener(event, handler);
    },
    watchAutoRootFontSize: function watchAutoRootFontSize() {
      var setup = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var callback = arguments.length > 1 ? arguments[1] : undefined;
      var $win = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window;

      if (_.isFunction(setup)) {
        $win = callback || window;
        callback = setup;
        setup = undefined;
      }

      var options = _.assign({}, setup, {
        $win: $win,
        callback: callback
      }); // Watch the window resizing


      $win.addEventListener("resize", function () {
        TiDom.autoRootFontSize(options);
      }); // auto resize firstly

      _.delay(function () {
        TiDom.autoRootFontSize(options);
      }, 1);
    },
    setStyle: function setStyle($el) {
      var css = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _.forOwn(css, function (val, key) {
        if (_.isNull(val) || _.isUndefined(val)) return;

        var pnm = _.kebabCase(key); // Empty string to remove one propperty


        if ("" === val) {
          $el.style.removeProperty(pnm);
        } // Set the property
        else {
            // integer as the px
            var v2 = _.isNumber(val) ? val + "px" : val;
            $el.style.setProperty(pnm, v2);
          }
      });
    },
    setClass: function setClass($el) {
      for (var _len7 = arguments.length, classNames = new Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
        classNames[_key7 - 1] = arguments[_key7];
      }

      var klass = _.flattenDeep(classNames);

      var className = klass.join(" ");
      $el.className = className;
    },
    addClass: function addClass($el) {
      for (var _len8 = arguments.length, classNames = new Array(_len8 > 1 ? _len8 - 1 : 0), _key8 = 1; _key8 < _len8; _key8++) {
        classNames[_key8 - 1] = arguments[_key8];
      }

      var klass = _.flattenDeep(classNames);

      var _iterator15 = _createForOfIteratorHelper(klass),
          _step15;

      try {
        for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
          var kl = _step15.value;

          var className = _.trim(kl);

          $el.classList.add(className);
        }
      } catch (err) {
        _iterator15.e(err);
      } finally {
        _iterator15.f();
      }
    },
    removeClass: function removeClass($el) {
      for (var _len9 = arguments.length, classNames = new Array(_len9 > 1 ? _len9 - 1 : 0), _key9 = 1; _key9 < _len9; _key9++) {
        classNames[_key9 - 1] = arguments[_key9];
      }

      var klass = _.flattenDeep(classNames);

      var _iterator16 = _createForOfIteratorHelper(klass),
          _step16;

      try {
        for (_iterator16.s(); !(_step16 = _iterator16.n()).done;) {
          var kl = _step16.value;

          var className = _.trim(kl);

          $el.classList.remove(className);
        }
      } catch (err) {
        _iterator16.e(err);
      } finally {
        _iterator16.f();
      }
    },
    hasClass: function hasClass($el) {
      if (!_.isElement($el)) {
        return false;
      }

      for (var _len10 = arguments.length, classNames = new Array(_len10 > 1 ? _len10 - 1 : 0), _key10 = 1; _key10 < _len10; _key10++) {
        classNames[_key10 - 1] = arguments[_key10];
      }

      for (var _i5 = 0, _classNames = classNames; _i5 < _classNames.length; _i5++) {
        var _klass = _classNames[_i5];
        if (!$el.classList.contains(_klass)) return false;
      }

      return true;
    },
    hasOneClass: function hasOneClass($el) {
      if (!_.isElement($el)) {
        return false;
      }

      for (var _len11 = arguments.length, classNames = new Array(_len11 > 1 ? _len11 - 1 : 0), _key11 = 1; _key11 < _len11; _key11++) {
        classNames[_key11 - 1] = arguments[_key11];
      }

      for (var _i6 = 0, _classNames2 = classNames; _i6 < _classNames2.length; _i6++) {
        var _klass2 = _classNames2[_i6];
        if ($el.classList.contains(_klass2)) return true;
      }

      return false;
    },
    applyRect: function applyRect($el, rect) {
      var keys = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "tlwh";
      var viewport = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var $win = $el.ownerDocument.defaultView;

      _.defaults(viewport, {
        width: $win.innerWidth,
        height: $win.innerHeight
      });

      var css = rect.toCss(viewport, keys);
      TiDom.setStyle($el, css);
    },
    dockTo: function dockTo($src, $ta) {
      var _ref48 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref48$mode = _ref48.mode,
          mode = _ref48$mode === void 0 ? "H" : _ref48$mode,
          _ref48$axis = _ref48.axis,
          axis = _ref48$axis === void 0 ? {} : _ref48$axis,
          posListX = _ref48.posListX,
          posListY = _ref48.posListY,
          space = _ref48.space,
          _ref48$viewportBorder = _ref48.viewportBorder,
          viewportBorder = _ref48$viewportBorder === void 0 ? 4 : _ref48$viewportBorder,
          position = _ref48.position;

      if (position) {
        $src.style.position = position;
      } //console.log(mode, axis, space, position)
      // Get the rect


      var rect = {
        src: Ti.Rects.createBy($src),
        ta: Ti.Rects.createBy($ta),
        win: Ti.Rects.createBy($src.ownerDocument.defaultView)
      }; // prepare [W, 2W]

      var getAxis = function getAxis(n, w, list) {
        if (n <= w) return list[0];
        if (n > w && n <= 2 * w) return list[1];
        return list[2];
      }; // Auto axis


      _.defaults(axis, {
        x: "auto",
        y: "auto"
      });

      if ("auto" == axis.x) {
        var _list2 = posListX || {
          "H": ["left", "right"],
          "V": ["right", "left"]
        }[mode];

        axis.x = getAxis(rect.ta.x, rect.win.width / _list2.length, _list2);
      }

      if ("auto" == axis.y) {
        var _list3 = posListY || {
          "H": ["bottom", "top"],
          "V": ["top", "center", "bottom"]
        }[mode];

        axis.y = getAxis(rect.ta.y, rect.win.height / _list3.length, _list3);
      } // Count the max viewport to wrapCut


      var viewport = rect.win.clone();

      if ("H" == mode) {
        if (axis.y == "bottom") {
          viewport.top = rect.ta.bottom;
        } else if (axis.y == "top") {
          viewport.bottom = rect.ta.top;
        }

        viewport.updateBy("tlbr");
      } // Dock & Apply


      var dockMode = rect.src.dockTo(rect.ta, mode, {
        axis: axis,
        space: space,
        viewport: viewport,
        viewportBorder: viewportBorder,
        wrapCut: true
      }); //console.log("do DockTo", dockedRect+"")

      _.delay(function () {
        TiDom.applyRect($src, rect.src, dockMode);
      }, 0);
    },

    /**
     * Return HTML string to present the icon/text/tip HTML segment
     */
    htmlChipITT: function htmlChipITT() {
      var _ref49 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          icon = _ref49.icon,
          text = _ref49.text,
          tip = _ref49.tip,
          more = _ref49.more;

      var _ref50 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref50$tagName = _ref50.tagName,
          tagName = _ref50$tagName === void 0 ? "div" : _ref50$tagName,
          _ref50$className = _ref50.className,
          className = _ref50$className === void 0 ? "" : _ref50$className,
          _ref50$iconTag = _ref50.iconTag,
          iconTag = _ref50$iconTag === void 0 ? "div" : _ref50$iconTag,
          _ref50$iconClass = _ref50.iconClass,
          iconClass = _ref50$iconClass === void 0 ? "" : _ref50$iconClass,
          _ref50$textTag = _ref50.textTag,
          textTag = _ref50$textTag === void 0 ? "div" : _ref50$textTag,
          _ref50$textClass = _ref50.textClass,
          textClass = _ref50$textClass === void 0 ? "" : _ref50$textClass,
          _ref50$textAsHtml = _ref50.textAsHtml,
          textAsHtml = _ref50$textAsHtml === void 0 ? false : _ref50$textAsHtml,
          _ref50$moreTag = _ref50.moreTag,
          moreTag = _ref50$moreTag === void 0 ? "div" : _ref50$moreTag,
          _ref50$moreClass = _ref50.moreClass,
          moreClass = _ref50$moreClass === void 0 ? "" : _ref50$moreClass,
          _ref50$wrapperTag = _ref50.wrapperTag,
          wrapperTag = _ref50$wrapperTag === void 0 ? "" : _ref50$wrapperTag,
          _ref50$wrapperClass = _ref50.wrapperClass,
          wrapperClass = _ref50$wrapperClass === void 0 ? "" : _ref50$wrapperClass,
          _ref50$attrs = _ref50.attrs,
          attrs = _ref50$attrs === void 0 ? {} : _ref50$attrs;

      var html = "";

      if (icon || text) {
        var iconHtml = Ti.Icons.fontIconHtml(icon); //--------------------------------

        var attr = function attr(name, value) {
          if (name && value) {
            return "".concat(name, "=\"").concat(value, "\"");
          }

          return "";
        }; //--------------------------------


        var _klass3 = function _klass3(name) {
          return attr("class", name);
        }; //--------------------------------


        var attrsHtml = [];

        _.forOwn(attrs, function (val, nm) {
          attrsHtml.push(attr(nm, val));
        });

        attrsHtml = attrsHtml.join(" "); //--------------------------------

        html += "<".concat(tagName, " ").concat(_klass3(className), " ").concat(attr("ti-tip", tip), " ").concat(attrsHtml, ">");

        if (iconHtml) {
          html += "<".concat(iconTag, " ").concat(_klass3(iconClass), "\">").concat(iconHtml, "</").concat(iconTag, ">");
        }

        if (text) {
          var textHtml = textAsHtml ? text : Ti.I18n.text(text);
          html += "<".concat(textTag, " ").concat(_klass3(textClass), ">").concat(textHtml, "</").concat(textTag, ">");
        }

        if (more) {
          var moreHtml = Ti.I18n.text(more);
          html += "<".concat(moreTag, " ").concat(_klass3(moreClass), ">").concat(moreHtml, "</").concat(moreTag, ">");
        }

        html += "</".concat(tagName, ">");
      }

      if (wrapperTag) {
        return "<".concat(wrapperTag, " ").concat(klass(wrapperClass), ">").concat(html, "</").concat(wrapperTag, ">");
      }

      return html;
    },

    /**
     * Retrive Current window scrollbar size
     */
    scrollBarSize: function scrollBarSize() {
      if (!window.SCROLL_BAR_SIZE) {
        var newDivOut = "<div id='div_out' style='position:relative;width:100px;height:100px;overflow-y:scroll;overflow-x:scroll'></div>";
        var newDivIn = "<div id='div_in' style='position:absolute;width:100%;height:100%;'></div>";
        var scrollSize = 0;
        $('body').append(newDivOut);
        $('#div_out').append(newDivIn);
        var divOutS = $('#div_out');
        var divInS = $('#div_in');
        scrollSize = divOutS.width() - divInS.width();
        $('#div_out').remove();
        $('#div_in').remove();
        window.SCROLL_BAR_SIZE = scrollSize;
      }

      return window.SCROLL_BAR_SIZE;
    }
  }; //---------------------------------------

  return {
    Dom: TiDom
  };
}(),
    Dom = _ref45.Dom; //##################################################
// # import {Rect,Rects}   from "./rect.mjs"


var _ref51 = function () {
  //--------------------------------------
  var QuickKeyMap = /*#__PURE__*/function () {
    function QuickKeyMap() {
      _classCallCheck(this, QuickKeyMap);

      _.assign(this, {
        t: "top",
        l: "left",
        w: "width",
        h: "height",
        r: "right",
        b: "bottom",
        x: "x",
        y: "y"
      });
    }

    _createClass(QuickKeyMap, [{
      key: "explainToArray",
      value: function explainToArray(keys) {
        var sorted = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var re = [];
        var ks = NormalizeQuickKeys(keys, sorted);

        var _iterator17 = _createForOfIteratorHelper(ks),
            _step17;

        try {
          for (_iterator17.s(); !(_step17 = _iterator17.n()).done;) {
            var k = _step17.value;
            var key = this[k];
            if (key) re.push(key);
          }
        } catch (err) {
          _iterator17.e(err);
        } finally {
          _iterator17.f();
        }

        return re;
      }
    }, {
      key: "getKey",
      value: function getKey(qk) {
        return this[qk];
      }
    }]);

    return QuickKeyMap;
  }();

  var QKM = new QuickKeyMap(); //--------------------------------------

  function AutoModeBy() {
    var rect = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var keys = ["bottom", "height", "left", "right", "top", "width", "x", "y"];
    var ms = [];

    for (var _i7 = 0, _keys = keys; _i7 < _keys.length; _i7++) {
      var key = _keys[_i7];

      if (!_.isUndefined(rect[key])) {
        var k = key.substring(0, 1);
        ms.push(k);
      }
    }

    return ms.join("");
  } //--------------------------------------


  function NormalizeQuickKeys(keys) {
    var sorted = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    if (!keys) return [];
    if (_.isArray(keys)) return keys;
    var list = keys.toLowerCase().split("");
    if (sorted) return list.sort();
    return list;
  } //--------------------------------------


  function PickKeys(rect, keys, dft) {
    var re = {};
    var ks = QKM.explainToArray(keys, false);

    var _iterator18 = _createForOfIteratorHelper(ks),
        _step18;

    try {
      for (_iterator18.s(); !(_step18 = _iterator18.n()).done;) {
        var key = _step18.value;
        var val = Ti.Util.fallback(rect[key], dft);

        if (!_.isUndefined(val)) {
          re[key] = val;
        }
      }
    } catch (err) {
      _iterator18.e(err);
    } finally {
      _iterator18.f();
    }

    return re;
  } //--------------------------------------


  var Rect = /*#__PURE__*/function () {
    function Rect(rect, mode) {
      _classCallCheck(this, Rect);

      this.__ti_rect__ = true;
      this.set(rect, mode);
    } //--------------------------------------


    _createClass(Rect, [{
      key: "set",
      value: function set() {
        var rect = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
          top: 0,
          left: 0,
          width: 0,
          height: 0
        };
        var mode = arguments.length > 1 ? arguments[1] : undefined;
        var keys = ["bottom", "height", "left", "right", "top", "width", "x", "y"]; // Pick keys and auto-mode

        if (_.isUndefined(mode)) {
          var _ms = [];

          var _iterator19 = _createForOfIteratorHelper(keys),
              _step19;

          try {
            for (_iterator19.s(); !(_step19 = _iterator19.n()).done;) {
              var key = _step19.value;
              var val = rect[key];

              if (_.isNumber(val)) {
                // copy value
                this[key] = val; // quick key

                var k = key.substring(0, 1);

                _ms.push(k);
              }
            } // Gen the quick mode

          } catch (err) {
            _iterator19.e(err);
          } finally {
            _iterator19.f();
          }

          mode = _ms.join("");
        } // Just pick the keys
        else {
            var _iterator20 = _createForOfIteratorHelper(keys),
                _step20;

            try {
              for (_iterator20.s(); !(_step20 = _iterator20.n()).done;) {
                var _key12 = _step20.value;
                var _val = rect[_key12];

                if (_.isNumber(_val)) {
                  this[_key12] = _val;
                }
              }
            } catch (err) {
              _iterator20.e(err);
            } finally {
              _iterator20.f();
            }
          } // Ignore 


        if ("bhlrtwxy" == mode) return this; // update

        return this.updateBy(mode);
      } //--------------------------------------

    }, {
      key: "toString",
      value: function toString() {
        var keys = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "tlwh";
        var re = PickKeys(this, keys, "NaN");
        var ss = [];

        _.forEach(re, function (val) {
          return ss.push(val);
        });

        return ss.join(",");
      }
    }, {
      key: "valueOf",
      value: function valueOf() {
        return this.toString();
      } //--------------------------------------

    }, {
      key: "updateBy",
      value: function updateBy() {
        var _this10 = this;

        var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "tlwh";
        var ary = QKM.explainToArray(mode);
        var alg = ary.join("/");
        ({
          "height/left/top/width": function heightLeftTopWidth() {
            _this10.right = _this10.left + _this10.width;
            _this10.bottom = _this10.top + _this10.height;
            _this10.x = _this10.left + _this10.width / 2;
            _this10.y = _this10.top + _this10.height / 2;
          },
          "height/right/top/width": function heightRightTopWidth() {
            _this10.left = _this10.right - _this10.width;
            _this10.bottom = _this10.top + _this10.height;
            _this10.x = _this10.left + _this10.width / 2;
            _this10.y = _this10.top + _this10.height / 2;
          },
          "bottom/height/left/width": function bottomHeightLeftWidth() {
            _this10.top = _this10.bottom - _this10.height;
            _this10.right = _this10.left + _this10.width;
            _this10.x = _this10.left + _this10.width / 2;
            _this10.y = _this10.top + _this10.height / 2;
          },
          "bottom/height/right/width": function bottomHeightRightWidth() {
            _this10.top = _this10.bottom - _this10.height;
            _this10.left = _this10.right - _this10.width;
            _this10.x = _this10.left + _this10.width / 2;
            _this10.y = _this10.top + _this10.height / 2;
          },
          "bottom/left/right/top": function bottomLeftRightTop() {
            _this10.width = _this10.right - _this10.left;
            _this10.height = _this10.bottom - _this10.top;
            _this10.x = _this10.left + _this10.width / 2;
            _this10.y = _this10.top + _this10.height / 2;
          },
          "height/width/x/y": function heightWidthXY() {
            var W2 = _this10.width / 2;
            var H2 = _this10.height / 2;
            _this10.top = _this10.y - H2;
            _this10.bottom = _this10.y + H2;
            _this10.left = _this10.x - W2;
            _this10.right = _this10.x + W2;
          },
          "height/left/width/y": function heightLeftWidthY() {
            var W2 = _this10.width / 2;
            var H2 = _this10.height / 2;
            _this10.top = _this10.y - H2;
            _this10.bottom = _this10.y + H2;
            _this10.x = _this10.left + W2;
            _this10.right = _this10.left + _this10.width;
          },
          "height/right/width/y": function heightRightWidthY() {
            var W2 = _this10.width / 2;
            var H2 = _this10.height / 2;
            _this10.top = _this10.y - H2;
            _this10.bottom = _this10.y + H2;
            _this10.x = _this10.right - W2;
            _this10.left = _this10.right - _this10.width;
          },
          "height/top/width/x": function heightTopWidthX() {
            var W2 = _this10.width / 2;
            var H2 = _this10.height / 2;
            _this10.y = _this10.top + H2;
            _this10.bottom = _this10.top + _this10.height;
            _this10.left = _this10.x - W2;
            _this10.right = _this10.x + W2;
          },
          "bottom/height/width/x": function bottomHeightWidthX() {
            var W2 = _this10.width / 2;
            var H2 = _this10.height / 2;
            _this10.y = _this10.bottom - H2;
            _this10.top = _this10.bottom - _this10.height;
            _this10.left = _this10.x - W2;
            _this10.right = _this10.x + W2;
          }
        })[alg]();
        return this;
      } //--------------------------------------

      /***
       * Pick keys and create another raw object
       */

    }, {
      key: "raw",
      value: function raw() {
        var keys = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "tlwh";
        var dft = arguments.length > 1 ? arguments[1] : undefined;
        return PickKeys(this, keys, dft);
      } //--------------------------------------
      // 将一个矩形转换为得到一个 CSS 的矩形描述
      // 即 right,bottom 是相对于视口的右边和底边的
      // keys 可选，比如 "top,left,width,height" 表示只输出这几个CSS的值
      // 如果不指定 keys，则返回的是 "top,left,width,height,right,bottom"
      // keys 也支持快捷定义:
      //   - "tlwh" : "top,left,width,height"
      //   - "tlbr" : "top,left,bottom,right"

    }, {
      key: "toCss",
      value: function toCss() {
        var viewport = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
          width: window.innerWidth,
          height: window.innerHeight
        };
        var keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "tlwh";
        var dft = arguments.length > 2 ? arguments[2] : undefined;
        // 计算
        var css = {
          top: this.top,
          left: this.left,
          width: this.width,
          height: this.height,
          right: viewport.width - this.right,
          bottom: viewport.height - this.bottom
        };

        if (Ti.IsDebug()) {
          console.log("CSS:", css);
        }

        return PickKeys(css, keys, dft);
      } //--------------------------------------
      // 得到一个新 Rect，左上顶点坐标系相对于 base (Rect)
      // 如果给定 forCss=true，则将坐标系统换成 CSS 描述
      // baseScroll 是描述 base 的滚动，可以是 Element/jQuery
      // 也可以是 {x,y} 格式的对象
      // 默认为 {x:0,y:0} 

    }, {
      key: "relative",
      value: function relative(rect) {
        var scroll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
          x: 0,
          y: 0
        };
        // 计算相对位置
        this.top = this.top - (rect.top - scroll.y);
        this.left = this.left - (rect.left - scroll.x);
        return this.updateBy("tlwh");
      } //--------------------------------------
      // 缩放矩形
      // - x : X 轴缩放
      // - y : Y 轴缩放，默认与 zoomX 相等
      // - centre : 相对的顶点 {x,y}，默认取自己的中心点
      // 返回矩形自身

    }, {
      key: "zoom",
      value: function zoom() {
        var _ref52 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref52$x = _ref52.x,
            x = _ref52$x === void 0 ? 1 : _ref52$x,
            _ref52$y = _ref52.y,
            y = _ref52$y === void 0 ? x : _ref52$y,
            _ref52$centre = _ref52.centre,
            centre = _ref52$centre === void 0 ? this : _ref52$centre;

        this.top = (this.top - centre.y) * y + centre.y;
        this.left = (this.left - centre.x) * x + centre.x;
        this.width = this.width * x;
        this.height = this.height * y;
        return this.updateBy("tlwh");
      } //--------------------------------------
      // 将给定矩形等比缩放到适合宽高
      //  - width  : 最大宽度
      //  - height : 最大高度
      //  - mode   : 缩放模式
      //      - contain : 确保包含在内
      //      - cover   : 最大限度撑满视口
      // 返回矩形自身

    }, {
      key: "zoomTo",
      value: function zoomTo() {
        var _ref53 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            width = _ref53.width,
            height = _ref53.height,
            _ref53$mode = _ref53.mode,
            mode = _ref53$mode === void 0 ? "contain" : _ref53$mode;

        // zoom scale when necessary
        if ("contain" == mode) {
          var viewport = new Rect({
            top: 0,
            left: 0,
            width: width,
            height: height
          });

          if (viewport.contains(this)) {
            return this;
          }
        } // 获得尺寸


        var w = width;
        var h = height;
        var oW = this.width;
        var oH = this.height;
        var oR = oW / oH;
        var nR = w / h;
        var nW, nH; // Too wide

        if (oR > nR) {
          // Cover
          if ("cover" == mode) {
            nH = h;
            nW = h * oR;
          } // Contain
          else {
              nW = w;
              nH = w / oR;
            }
        } // Too hight
        else if (oR < nR) {
            // Cover
            if ("cover" == mode) {
              nW = w;
              nH = w / oR;
            } // Contain
            else {
                nH = h;
                nW = h * oR;
              }
          } // Then same
          else {
              nW = w;
              nH = h;
              x = 0;
              y = 0;
            }

        this.width = nW;
        this.height = nH;
        return this.updateBy("tlwh");
      } //--------------------------------------
      // 移动自己到指定视口的中间

    }, {
      key: "centreTo",
      value: function centreTo() {
        var _ref54 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            width = _ref54.width,
            height = _ref54.height,
            _ref54$top = _ref54.top,
            top = _ref54$top === void 0 ? 0 : _ref54$top,
            _ref54$left = _ref54.left,
            left = _ref54$left === void 0 ? 0 : _ref54$left;

        var _ref55 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            _ref55$xAxis = _ref55.xAxis,
            xAxis = _ref55$xAxis === void 0 ? true : _ref55$xAxis,
            _ref55$yAxis = _ref55.yAxis,
            yAxis = _ref55$yAxis === void 0 ? true : _ref55$yAxis;

        // Translate xAxis
        if (xAxis) {
          if (width > 0) {
            var w = width - this.width;
            this.left = left + w / 2;
          }
        } // Translate yAxis


        if (yAxis) {
          if (height > 0) {
            var h = height - this.height;
            this.top = top + h / 2;
          }
        }

        return this.updateBy("tlwh");
      } //--------------------------------------
      // 移动矩形
      // - x   : X 轴位移
      // - y   : Y 周位移
      // 返回矩形自身

    }, {
      key: "translate",
      value: function translate() {
        var _ref56 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref56$x = _ref56.x,
            x = _ref56$x === void 0 ? 0 : _ref56$x,
            _ref56$y = _ref56.y,
            y = _ref56$y === void 0 ? 0 : _ref56$y;

        this.y -= y;
        this.x -= x;
        return this.updateBy("xywh");
      }
      /***
       * Move to position by one of four corners
       * 
       * @params pos : The targt position
       * @params offset : the orignal position 
       * @params mode : "tl|br|tr|bl"
       */

    }, {
      key: "moveTo",
      value: function moveTo() {
        var _this11 = this;

        var pos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var mode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "tl";

        _.defaults(pos, {
          x: 0,
          y: 0
        });

        _.defaults(offset, {
          x: 0,
          y: 0
        });

        var ary = QKM.explainToArray(mode);
        var alg = ary.join("/");
        ({
          "left/top": function leftTop() {
            _this11.left = pos.x - offset.x;
            _this11.top = pos.y - offset.y;

            _this11.updateBy("tlwh");
          },
          "right/top": function rightTop() {
            _this11.right = pos.x + offset.x;
            _this11.top = pos.y - offset.y;

            _this11.updateBy("trwh");
          },
          "bottom/left": function bottomLeft() {
            _this11.left = pos.x - offset.x;
            _this11.bottom = pos.y + offset.y;

            _this11.updateBy("blwh");
          },
          "bottom/right": function bottomRight() {
            _this11.right = pos.x + offset.x;
            _this11.bottom = pos.y + offset.y;

            _this11.updateBy("brwh");
          }
        })[alg]();
        return this;
      }
      /***
       * Dock self to target rectangle, with special 
       * docking mode, which specified by `@param axis`.
       * 
       * ```
       *                 H:center/top
       *          H:left/top          H:right:top
       *    V:left/top +----------------+ V:right/top
       *               |                |
       * V:left:center |                | V:right:center
       *               |                |
       * V:left/bottom +----------------+ V:right:bottom
       *       H:left/bottom          H:right:bottom
       *                H:center/bottom
       * ```
       * 
       * @param rect{Rect}`R` - Target rectangle
       * @param axis.x{String} - axisX dock mode:
       *  - `left`   : Dock to left side
       *  - `right`  : Dock to right side
       *  - `center` : Dock to center
       * @param axis.y{String} - axisY dock mode
       *  - `top`    : Dock to top side
       *  - `bottom` : Dock to bottom side
       *  - `center` : Dock to center
       * @param space.x{int} - spacing for vertical-side
       * @param space.y{int} - spacing for horizontal-side
       * @param viewportBorder{int}
       * @param wrapCut{Boolean}
       * 
       * @return {Self} If need to be cut
       */

    }, {
      key: "dockTo",
      value: function dockTo(rect) {
        var _this12 = this;

        var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "H";

        var _ref57 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
            _ref57$axis = _ref57.axis,
            axis = _ref57$axis === void 0 ? {} : _ref57$axis,
            _ref57$space = _ref57.space,
            space = _ref57$space === void 0 ? {} : _ref57$space,
            _ref57$viewport = _ref57.viewport,
            viewport = _ref57$viewport === void 0 ? {} : _ref57$viewport,
            _ref57$viewportBorder = _ref57.viewportBorder,
            viewportBorder = _ref57$viewportBorder === void 0 ? 4 : _ref57$viewportBorder,
            _ref57$wrapCut = _ref57.wrapCut,
            wrapCut = _ref57$wrapCut === void 0 ? false : _ref57$wrapCut;

        if (_.isNumber(space)) {
          space = {
            x: space,
            y: space
          };
        }

        _.defaults(axis, {
          x: "center",
          y: "bottom"
        });

        _.defaults(space, {
          x: 0,
          y: 0
        });

        var alg = mode + ":" + axis.x + "/" + axis.y;
        ({
          "V:left/top": function VLeftTop() {
            _this12.right = rect.left - space.x;
            _this12.top = rect.top + space.y;

            _this12.updateBy("rtwh");
          },
          "V:left/center": function VLeftCenter() {
            _this12.right = rect.left - space.x;
            _this12.y = rect.y + space.y;

            _this12.updateBy("rywh");
          },
          "V:left/bottom": function VLeftBottom() {
            _this12.right = rect.left - space.x;
            _this12.bottom = rect.bottom - space.y;

            _this12.updateBy("rbwh");
          },
          "V:right/top": function VRightTop() {
            _this12.left = rect.right + space.x;
            _this12.top = rect.top + space.y;

            _this12.updateBy("ltwh");
          },
          "V:right/center": function VRightCenter() {
            _this12.left = rect.right + space.x;
            _this12.y = rect.y + space.y;

            _this12.updateBy("lywh");
          },
          "V:right/bottom": function VRightBottom() {
            _this12.left = rect.right + space.x;
            _this12.bottom = rect.bottom - space.y;

            _this12.updateBy("lbwh");
          },
          "H:left/top": function HLeftTop() {
            _this12.left = rect.left + space.x;
            _this12.bottom = rect.top - space.y;

            _this12.updateBy("lbwh");
          },
          "H:left/bottom": function HLeftBottom() {
            _this12.left = rect.left + space.x;
            _this12.top = rect.bottom + space.y;

            _this12.updateBy("ltwh");
          },
          "H:center/top": function HCenterTop() {
            _this12.x = rect.x + space.x;
            _this12.bottom = rect.top - space.y;

            _this12.updateBy("xbwh");
          },
          "H:center/bottom": function HCenterBottom() {
            _this12.x = rect.x + space.x;
            _this12.top = rect.bottom + space.y;

            _this12.updateBy("xtwh");
          },
          "H:right/top": function HRightTop() {
            _this12.right = rect.right - space.x;
            _this12.bottom = rect.top - space.y;

            _this12.updateBy("rbwh");
          },
          "H:right/bottom": function HRightBottom() {
            _this12.right = rect.right - space.x;
            _this12.top = rect.bottom + space.y;

            _this12.updateBy("rtwh");
          }
        })[alg](); // Wrap cut

        var dockMode = "tl";

        if (wrapCut && TiRects.isRect(viewport)) {
          var viewport2 = viewport.clone(viewportBorder); // Wrap at first

          viewport2.wrap(this); // If still can not contains, overlay it

          if (!viewport2.contains(this)) {
            this.overlap(viewport2);
            dockMode = "tlwh";
          }
        } // return


        return dockMode;
      }
      /***
       * Like `dockTo` but dock to target inside
       * 
       *
       *         +------top-------+
       *         |       |        |
       *       left----center----right
       *         |       |        |
       *         +-----bottom-----+
       *
       * 
       * @see #dockTo
       */

    }, {
      key: "dockIn",
      value: function dockIn(rect) {
        var _this13 = this;

        var axis = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var space = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _.defaults(axis, {
          x: "center",
          y: "center"
        });

        _.defaults(space, {
          x: 0,
          y: 0
        });

        var alg = axis.x + "/" + axis.y;
        ({
          "left/top": function leftTop() {
            _this13.left = rect.left + space.x;
            _this13.top = rect.top + space.y;

            _this13.updateBy("ltwh");
          },
          "left/center": function leftCenter() {
            _this13.left = rect.left + space.x;
            _this13.y = rect.y + space.y;

            _this13.updateBy("lywh");
          },
          "left/bottom": function leftBottom() {
            _this13.left = rect.left + space.x;
            _this13.bottom = rect.bottom - space.y;

            _this13.updateBy("lbwh");
          },
          "right/top": function rightTop() {
            _this13.right = rect.right - space.x;
            _this13.top = rect.top + space.y;

            _this13.updateBy("rtwh");
          },
          "right/center": function rightCenter() {
            _this13.right = rect.right - space.x;
            _this13.y = rect.y + space.y;

            _this13.updateBy("rywh");
          },
          "right/bottom": function rightBottom() {
            _this13.right = rect.right - space.x;
            _this13.bottom = rect.bottom - space.y;

            _this13.updateBy("brwh");
          },
          "center/center": function centerCenter() {
            _this13.x = rect.x + space.x;
            _this13.x = rect.y + space.y;

            _this13.updateBy("xywh");
          }
        })[alg]();
        return this;
      } //--------------------------------------

      /***
       * Make given rect contained by self rect(as viewport).
       * It will auto move the given rect to suited position.
       * If still can not fail to contains it, let it be.
       * 
       * @param rect{Rect} : target rect
       * 
       * @return target rect
       * 
       */

    }, {
      key: "wrap",
      value: function wrap(rect) {
        var ms = ["w", "h"]; //....................................
        // Try X

        if (!this.containsX(rect)) {
          // [viewport]{given} or [viewport {gi]ven}
          if (rect.left > this.left && rect.right > this.right) {
            rect.right = this.right;
            ms.push("r");
          } // {given}[viewport] or { gi[ven }viewport ]
          // {giv-[viewport]-en}
          else {
              rect.left = this.left;
              ms.push("l");
            }
        } //....................................
        // Try Y


        if (!this.containsY(rect)) {
          // top:=> [viewport]{given} or [viewport {gi]ven}
          if (rect.top > this.top && rect.bottom > this.bottom) {
            rect.bottom = this.bottom;
            ms.push("b");
          } // top:=> {given}[viewport] or { gi[ven }viewport ]
          // top:=> {giv-[viewport]-en}
          else {
              rect.top = this.top;
              ms.push("t");
            }
        } // Has already X
        else if (ms.length == 3) {
            ms.push("t");
          } //....................................
        // Lack X


        if (3 == ms.length) {
          ms.push("l");
        } //....................................
        // Update it


        if (4 == ms.length) {
          return rect.updateBy(ms.join(""));
        } //....................................
        // Done


        return rect;
      } //--------------------------------------

      /***
       * Make given rect contained by self rect(as viewport).
       * It will auto move the given rect to suited position.
       * If still can not fail to contains it, do the overlap
       * 
       * @param rect{Rect} : target rect
       * 
       * @return target rect
       * 
       */

    }, {
      key: "wrapCut",
      value: function wrapCut(rect) {
        // Wrap at first
        this.wrap(rect); // If still can not contains, overlay it

        if (!this.contains(rect)) {
          rect.overlap(this);
        }

        return rect;
      } //--------------------------------------

      /***
       * Union current rectangles with another
       */

    }, {
      key: "union",
      value: function union() {
        for (var _len12 = arguments.length, rects = new Array(_len12), _key13 = 0; _key13 < _len12; _key13++) {
          rects[_key13] = arguments[_key13];
        }

        for (var _i8 = 0, _rects = rects; _i8 < _rects.length; _i8++) {
          var rect = _rects[_i8];
          this.top = Math.min(this.top, rect.top);
          this.left = Math.min(this.left, rect.left);
          this.right = Math.max(this.right, rect.right);
          this.bottom = Math.max(this.bottom, rect.bottom);
        }

        return this.updateBy("tlbr");
      } //--------------------------------------

    }, {
      key: "overlap",
      value: function overlap() {
        for (var _len13 = arguments.length, rects = new Array(_len13), _key14 = 0; _key14 < _len13; _key14++) {
          rects[_key14] = arguments[_key14];
        }

        for (var _i9 = 0, _rects2 = rects; _i9 < _rects2.length; _i9++) {
          var rect = _rects2[_i9];
          this.top = Math.max(this.top, rect.top);
          this.left = Math.max(this.left, rect.left);
          this.right = Math.min(this.right, rect.right);
          this.bottom = Math.min(this.bottom, rect.bottom);
        }

        return this.updateBy("tlbr");
      } //--------------------------------------

    }, {
      key: "contains",
      value: function contains(rect) {
        var border = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        return this.containsX(rect, border) && this.containsY(rect, border);
      } //--------------------------------------

    }, {
      key: "containsX",
      value: function containsX(rect) {
        var border = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        return this.left + border <= rect.left && this.right - border >= rect.right;
      } //--------------------------------------

    }, {
      key: "containsY",
      value: function containsY(rect) {
        var border = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        return this.top + border <= rect.top && this.bottom - border >= rect.bottom;
      } //--------------------------------------

    }, {
      key: "isOverlap",
      value: function isOverlap(rect) {
        return this.overlap(rect).area() > 0;
      } //--------------------------------------

      /***
       * @return Current rectangle area
       */

    }, {
      key: "area",
      value: function area() {
        return this.width * this.height;
      } //--------------------------------------

      /***
       * Create new rect without the border
       */

    }, {
      key: "clone",
      value: function clone() {
        var border = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return new Rect({
          left: this.left + border,
          right: this.right - border,
          top: this.top + border,
          bottom: this.bottom - border
        }, "tlbr");
      }
    }]);

    return Rect;
  }(); //--------------------------------------


  var TiRects = {
    create: function create(rect, mode) {
      return new Rect(rect, mode);
    },
    //--------------------------------------
    createBy: function createBy($el) {
      // Whole window
      if (!$el.ownerDocument) {
        var $win = Ti.Dom.ownerWindow($el);
        return new Rect({
          top: 0,
          left: 0,
          width: $win.innerWidth,
          height: $win.innerHeight
        });
      } // Element


      var rect = $el.getBoundingClientRect();
      return new Rect(rect, "tlwh");
    },
    //--------------------------------------
    union: function union() {
      for (var _len14 = arguments.length, rects = new Array(_len14), _key15 = 0; _key15 < _len14; _key15++) {
        rects[_key15] = arguments[_key15];
      }

      // empty
      if (rects.length == 0) return new Rect();
      var r0 = new Rect(rects[0]);
      r0.union.apply(r0, _toConsumableArray(rects.slice(1)));
      return r0;
    },
    //--------------------------------------
    overlap: function overlap() {
      for (var _len15 = arguments.length, rects = new Array(_len15), _key16 = 0; _key16 < _len15; _key16++) {
        rects[_key16] = arguments[_key16];
      }

      // empty
      if (rects.length == 0) return new Rect();
      var r0 = new Rect(rects[0]);
      r0.overlap.apply(r0, _toConsumableArray(rects.slice(1)));
      return r0;
    },
    //--------------------------------------
    isRect: function isRect(rect) {
      return rect && rect.__ti_rect__ && rect instanceof Rect;
    } //--------------------------------------

  }; //////////////////////////////////////////

  return {
    Rect: Rect,
    TiRects: TiRects,
    Rects: TiRects
  };
}(),
    Rect = _ref51.Rect,
    Rects = _ref51.Rects; //##################################################
// # import {Load}         from "./load.mjs"


var _ref58 = function () {
  //import {importModule} from "./polyfill-dynamic-import.mjs"
  /////////////////////////////////////////
  // One resource load only once
  var UnifyResourceLoading = /*#__PURE__*/function () {
    //-------------------------------------
    function UnifyResourceLoading() {
      var doLoad = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (url) {
        return url;
      };

      _classCallCheck(this, UnifyResourceLoading);

      this.cached = {};
      this.loading = {};
      this.doLoad = doLoad;
    } //-------------------------------------


    _createClass(UnifyResourceLoading, [{
      key: "tryLoad",
      value: function () {
        var _tryLoad = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(url, whenDone) {
          var re, ing, reo, fns, _iterator21, _step21, fn;

          return regeneratorRuntime.wrap(function _callee18$(_context18) {
            while (1) {
              switch (_context18.prev = _context18.next) {
                case 0:
                  // Is Loaded
                  re = this.cached[url];

                  if (_.isUndefined(re)) {
                    _context18.next = 4;
                    break;
                  }

                  whenDone(re);
                  return _context18.abrupt("return");

                case 4:
                  // Is Loading, just join it
                  ing = this.loading[url];

                  if (!(_.isArray(ing) && ing.length > 0)) {
                    _context18.next = 8;
                    break;
                  }

                  ing.push(whenDone);
                  return _context18.abrupt("return");

                case 8:
                  // Load it
                  this.loading[url] = [whenDone];
                  _context18.next = 11;
                  return this.doLoad(url);

                case 11:
                  reo = _context18.sent;
                  // cache it
                  this.cached[url] = reo; // Callback

                  fns = this.loading[url];
                  this.loading[url] = null;
                  _iterator21 = _createForOfIteratorHelper(fns);

                  try {
                    for (_iterator21.s(); !(_step21 = _iterator21.n()).done;) {
                      fn = _step21.value;
                      fn(reo);
                    }
                  } catch (err) {
                    _iterator21.e(err);
                  } finally {
                    _iterator21.f();
                  }

                case 17:
                case "end":
                  return _context18.stop();
              }
            }
          }, _callee18, this);
        }));

        function tryLoad(_x10, _x11) {
          return _tryLoad.apply(this, arguments);
        }

        return tryLoad;
      }() //-------------------------------------

    }]);

    return UnifyResourceLoading;
  }(); /////////////////////////////////////////


  var MjsLoading = new UnifyResourceLoading( /*#__PURE__*/function () {
    var _ref59 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(url) {
      return regeneratorRuntime.wrap(function _callee19$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              _context19.prev = 0;
              _context19.next = 3;
              return Promise.resolve().then(function () {
                return _interopRequireWildcard(require("".concat(url)));
              });

            case 3:
              return _context19.abrupt("return", _context19.sent);

            case 6:
              _context19.prev = 6;
              _context19.t0 = _context19["catch"](0);

              if (Ti.IsWarn("TiLoad")) {
                console.warn("ti.load.mjs", url, _context19.t0);
              }

              throw _context19.t0;

            case 10:
            case "end":
              return _context19.stop();
          }
        }
      }, _callee19, null, [[0, 6]]);
    }));

    return function (_x12) {
      return _ref59.apply(this, arguments);
    };
  }()); /////////////////////////////////////////

  var TextLoading = new UnifyResourceLoading( /*#__PURE__*/function () {
    var _ref60 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(url) {
      return regeneratorRuntime.wrap(function _callee20$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              _context20.prev = 0;
              _context20.next = 3;
              return Ti.Http.get(url);

            case 3:
              return _context20.abrupt("return", _context20.sent);

            case 6:
              _context20.prev = 6;
              _context20.t0 = _context20["catch"](0);

              if (Ti.IsWarn("TiLoad")) {
                console.warn("ti.load.text", url, _context20.t0);
              }

              throw _context20.t0;

            case 10:
            case "end":
              return _context20.stop();
          }
        }
      }, _callee20, null, [[0, 6]]);
    }));

    return function (_x13) {
      return _ref60.apply(this, arguments);
    };
  }()); /////////////////////////////////////////

  var LoadModes = {
    // normal js lib
    js: function js(url) {
      return new Promise(function (resolve, reject) {
        // Already Loaded
        var $script = Ti.Dom.find("script[src=\"".concat(url, "\"]"));

        if ($script) {
          _.defer(resolve, $script);
        } // Load it now
        else {
            $script = Ti.Dom.createElement({
              tagName: "script",
              props: {
                //charset : "stylesheet",
                src: url //async   : true

              }
            });
            $script.addEventListener("load", function (event) {
              resolve($script);
            }, {
              once: true
            });
            $script.addEventListener("error", function (event) {
              reject(event);
            }, {
              once: true
            });
            Ti.Dom.appendToHead($script);
          }
      }); // ~ Promise
    },
    // official js module
    mjs: function mjs(url) {
      return new Promise(function (resolve, reject) {
        MjsLoading.tryLoad(url, function (reo) {
          resolve(reo["default"]);
        });
      });
    },
    // css file
    css: function css(url) {
      return new Promise(function (resolve, reject) {
        var $link = Ti.Dom.find("link[href=\"".concat(url, "\"]")); // Already Loaded

        if ($link) {
          _.defer(resolve, $link);
        } // Load it now
        else {
            $link = Ti.Dom.createElement({
              tagName: "link",
              props: {
                rel: "stylesheet",
                type: "text/css",
                href: url
              }
            });
            $link.addEventListener("load", function (event) {
              resolve($link);
            }, {
              once: true
            });
            $link.addEventListener("error", function (event) {
              reject(event);
            }, {
              once: true
            });
            Ti.Dom.appendToHead($link);
          }
      }); // ~ Promise
    },
    // json object
    json: function json(url) {
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21() {
        var json;
        return regeneratorRuntime.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                _context21.prev = 0;
                _context21.next = 3;
                return LoadModes.text(url);

              case 3:
                json = _context21.sent;
                return _context21.abrupt("return", _.isPlainObject(json) ? json : JSON.parse(json));

              case 7:
                _context21.prev = 7;
                _context21.t0 = _context21["catch"](0);

                if (Ti.IsWarn("TiLoad")) {
                  console.warn("ti.load.json!!", url, _context21.t0);
                }

                throw _context21.t0;

              case 11:
              case "end":
                return _context21.stop();
            }
          }
        }, _callee21, null, [[0, 7]]);
      }))();
    },
    // pure text
    text: function text(url) {
      // if(url.endsWith("/ti-list.html")) {
      //   console.log("::TEXT->", url)
      // }
      // Check the CACHE
      return new Promise(function (resolve, reject) {
        TextLoading.tryLoad(url, resolve);
      });
    }
  }; //---------------------------------------

  function TiLoad() {
    return _TiLoad.apply(this, arguments);
  } //-----------------------------------


  function _TiLoad() {
    _TiLoad = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22() {
      var url,
          _ref61,
          dynamicPrefix,
          dynamicAlias,
          _u,
          ps,
          result,
          url2,
          type,
          m,
          url3,
          reObj,
          _args22 = arguments;

      return regeneratorRuntime.wrap(function _callee22$(_context22) {
        while (1) {
          switch (_context22.prev = _context22.next) {
            case 0:
              url = _args22.length > 0 && _args22[0] !== undefined ? _args22[0] : [];
              _ref61 = _args22.length > 1 && _args22[1] !== undefined ? _args22[1] : {}, dynamicPrefix = _ref61.dynamicPrefix, dynamicAlias = _ref61.dynamicAlias;

              if (!_.isFunction(url)) {
                _context22.next = 5;
                break;
              }

              _u = url();
              return _context22.abrupt("return", TiLoad(_u, {
                dynamicPrefix: dynamicPrefix
              }));

            case 5:
              if (!_.isArray(url)) {
                _context22.next = 10;
                break;
              }

              ps = [];
              result = [];
              url.forEach(function (s, index) {
                ps.push(TiLoad(s, {
                  dynamicPrefix: dynamicPrefix,
                  dynamicAlias: dynamicAlias
                }).then(function (re) {
                  return result[index] = re;
                }));
              });
              return _context22.abrupt("return", Promise.all(ps).then(function () {
                return result;
              }));

            case 10:
              if (_.isString(url)) {
                _context22.next = 12;
                break;
              }

              throw Ti.Err.make("e-ti-use-url_must_string", url);

            case 12:
              // url prefix indicate the type
              url2 = url;
              m = /^(!(m?js|json|css|text):)?(.+)$/.exec(url);

              if (m) {
                type = m[2];
                url2 = m[3];
              } // apply url prefix & alias


              url3 = Ti.Config.url(url2, {
                dynamicPrefix: dynamicPrefix,
                dynamicAlias: dynamicAlias
              }); //console.log("load URL", url3)

              if (Ti.IsInfo("TiLoad")) {
                console.log("url：", url, "\n  ::", url2, "\n  ::", url3, "\n  ::", dynamicPrefix, "\n  ::", dynamicAlias);
              } // auto type by suffix


              if (!type) {
                m = /\.(m?js|css|json)$/.exec(url3);
                type = m ? m[1] : "text";
              } // Try cache
              // if(url3.indexOf("label")>0) {
              //   console.log(url3)
              // }


              reObj = Ti.MatchCache(url3);

              if (!reObj) {
                _context22.next = 21;
                break;
              }

              return _context22.abrupt("return", reObj);

            case 21:
              _context22.prev = 21;
              _context22.next = 24;
              return LoadModes[type](url3);

            case 24:
              reObj = _context22.sent;
              return _context22.abrupt("return", reObj);

            case 28:
              _context22.prev = 28;
              _context22.t0 = _context22["catch"](21);

              if (Ti.IsWarn("TiLoad")) {
                console.warn("TiLoad Fail: [".concat(type, "]"), "\"".concat(url, "\" => \"").concat(url3, "\""));
              }

              throw _context22.t0;

            case 32:
            case "end":
              return _context22.stop();
          }
        }
      }, _callee22, null, [[21, 28]]);
    }));
    return _TiLoad.apply(this, arguments);
  }

  return {
    Load: TiLoad
  };
}(),
    Load = _ref58.Load; //##################################################
// # import {Http}         from "./http.mjs"


var _ref62 = function () {
  //-----------------------------------
  var RESP_TRANS = {
    arraybuffer: function arraybuffer($req) {
      throw "No implement yet!";
    },
    blob: function blob($req) {
      throw "No implement yet!";
    },
    document: function document($req) {
      throw "No implement yet!";
    },
    xml: function xml($req) {
      throw "No implement yet!";
    },
    ajax: function ajax($req) {
      var reo = RESP_TRANS.json($req);

      if (reo.ok) {
        return reo.data;
      }

      throw reo;
    },
    json: function json($req) {
      var content = $req.responseText;
      var str = _.trim(content) || null;

      try {
        return JSON.parse(str);
      } catch (E) {
        return Ti.Types.safeParseJson(str, str); // console.warn("fail to JSON.parse", str)
        // throw E
      }
    },
    jsonOrText: function jsonOrText($req) {
      var content = $req.responseText;

      try {
        var str = _.trim(content) || null;
        return JSON.parse(str);
      } catch (E) {}

      return content;
    },
    text: function text($req) {
      return $req.responseText;
    }
  }; //-----------------------------------

  function ProcessResponseData($req) {
    var _ref63 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref63$as = _ref63.as,
        as = _ref63$as === void 0 ? "text" : _ref63$as;

    return Ti.InvokeBy(RESP_TRANS, as, [$req]);
  } //-----------------------------------


  var TiHttp = {
    send: function send(url) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (Ti.IsInfo("TiHttp")) {
        console.log("TiHttp.send", url, options);
      }

      var _options$method = options.method,
          method = _options$method === void 0 ? "GET" : _options$method,
          _options$params = options.params,
          params = _options$params === void 0 ? {} : _options$params,
          _options$body = options.body,
          body = _options$body === void 0 ? null : _options$body,
          _options$file = options.file,
          file = _options$file === void 0 ? null : _options$file,
          _options$headers = options.headers,
          headers = _options$headers === void 0 ? {} : _options$headers,
          _options$cleanNil = options.cleanNil,
          cleanNil = _options$cleanNil === void 0 ? true : _options$cleanNil,
          _options$progress = options.progress,
          progress = _options$progress === void 0 ? _.identity : _options$progress,
          _options$created = options.created,
          created = _options$created === void 0 ? _.identity : _options$created,
          _options$beforeSend = options.beforeSend,
          beforeSend = _options$beforeSend === void 0 ? _.identity : _options$beforeSend,
          _options$finished = options.finished,
          finished = _options$finished === void 0 ? _.identity : _options$finished,
          _options$readyStateCh = options.readyStateChanged,
          readyStateChanged = _options$readyStateCh === void 0 ? _.identity : _options$readyStateCh; // normalize method

      method = _.upperCase(method); // Clean nil

      if (cleanNil) {
        var p2 = {};
        Ti.Util.walk(params, {
          leaf: function leaf(v, path) {
            if (!Ti.Util.isNil(v)) {
              _.set(p2, path, v);
            }
          }
        });
        params = p2;
      } // Add the default header to identify the TiHttpClient
      // _.defaults(headers, {
      //   "x-requested-with": "XMLHttpRequest"
      // })
      // Default header for POST


      var _ref64 = Ti.Invoke({
        "GET": function GET() {
          var sendData = TiHttp.encodeFormData(params);
          return {
            urlToSend: sendData ? url + '?' + sendData : url
          };
        },
        "POST": function POST() {
          _.defaults(headers, {
            "Content-type": "application/x-www-form-urlencoded; charset=utf-8"
          }); // Upload file, encode the params to query string


          if (file) {
            return {
              urlToSend: [url, TiHttp.encodeFormData(params)].join("?"),
              sendData: file
            };
          } // if declare body, the params -> query string
          // you can send XML/JSON by this branch
          else if (body) {
              return {
                urlToSend: [url, TiHttp.encodeFormData(params)].join("?"),
                sendData: body
              };
            } // Normal form upload
            else {
                return {
                  urlToSend: url,
                  sendData: TiHttp.encodeFormData(params)
                };
              }
        }
      }[method]) || {
        urlToSend: url
      },
          urlToSend = _ref64.urlToSend,
          sendData = _ref64.sendData; // Prepare the Request Object


      var $req = new XMLHttpRequest(); // Check upload file supporting

      if (file) {
        if (!$req.upload) {
          throw Ti.Err.make("e.ti.http.upload.NoSupported");
        }

        $req.upload.addEventListener("progress", progress);
      } // Hooking


      created($req); // Process sending

      return new Promise(function (resolve, reject) {
        // callback
        $req.onreadystatechange = function () {
          readyStateChanged($req, options); // Done

          if (4 == $req.readyState) {
            // Hooking
            finished($req);

            if (200 == $req.status) {
              resolve($req);
            } else {
              reject($req);
            }
          }
        }; // Open connection


        $req.open(method, urlToSend); // Set headers

        _.forOwn(headers, function (val, key) {
          $req.setRequestHeader(key, val);
        }); // Hooking


        beforeSend($req); // Send data

        $req.send(sendData);
      });
    },

    /***
     * @param options.method{String}="GET"
     * @param options.params{Object}={}
     * @param options.headers{Object}={}
     * @param options.readyStateChanged{Function}=_.identity
     * @param options.as{String}="text"
     */
    sendAndProcess: function sendAndProcess(url) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return TiHttp.send(url, options).then(function ($req) {
        return ProcessResponseData($req, options);
      });
    },

    /***
     * Send HTTP GET
     */
    get: function get(url) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return TiHttp.sendAndProcess(url, _.assign({}, options, {
        method: "GET"
      }));
    },

    /***
     * Send HTTP post
     */
    post: function post(url) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return TiHttp.sendAndProcess(url, _.assign({}, options, {
        method: "POST"
      }));
    },

    /***
     * encode form data
     */
    encodeFormData: function encodeFormData() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var list = [];

      _.forOwn(params, function (val, key) {
        var str = Ti.Types.toStr(val);
        list.push("".concat(key, "=").concat(encodeURIComponent(str)));
      });

      return list.join("&");
    }
  }; //-----------------------------------

  return {
    Http: TiHttp
  };
}(),
    Http = _ref62.Http; //##################################################
// # import {I18n}         from "./i18n.mjs"


var _ref65 = function () {
  //-----------------------------------
  var I18N = {}; //-----------------------------------

  function __MSG(key) {
    var re = _.get(I18N, key);

    if (re) return re;

    if (_.isString(key)) {
      var k2 = key.replace(/\./g, "-");
      return I18N[k2];
    }

    return key;
  } //-----------------------------------


  var Ti18n = {
    put: function put(msgs) {
      // Multi set
      if (_.isArray(msgs)) {
        var _iterator22 = _createForOfIteratorHelper(msgs),
            _step22;

        try {
          for (_iterator22.s(); !(_step22 = _iterator22.n()).done;) {
            var _ms2 = _step22.value;
            Ti18n.put(_ms2);
          }
        } catch (err) {
          _iterator22.e(err);
        } finally {
          _iterator22.f();
        }
      } // Single set
      else if (_.isPlainObject(msgs)) {
          if (_.isBoolean(msgs.ok)) {
            console.warn("invalid msgs", msgs);
            return;
          }

          _.assign(I18N, msgs);
        }
    },

    /***
     * @param key{String|Object}
     * @param dft{String}
     */
    get: function get(key, dft) {
      // key as `{key, vars}`
      if (key && key.key && _.isPlainObject(key)) {
        return Ti18n.getf(key.key, key.vars);
      } // Error Object


      if (key instanceof Error) {
        if (key.code) {
          return Ti.S.join(" : ", Ti18n.get(key.code), key.data);
        }

        return key.message;
      } // key as String


      var msg = __MSG(key);

      if (_.isUndefined(msg)) {
        if (_.isUndefined(dft)) return key;
        return dft;
      }

      return msg;
    },

    /***
     * @param key{String|Object}
     * @param dft{String}
     */
    text: function text(str, dft) {
      // str as `{text, vars}`
      if (str && str.text && _.isPlainObject(str)) {
        return Ti18n.textf(str.text, str.vars);
      } // Error Object


      if (str instanceof Error) {
        return Ti18n.get(str);
      } // key as String


      var m = /^i18n:(.+)$/.exec(str);

      if (m) {
        return Ti18n.get(m[1], dft);
      }

      return Ti.Util.fallback(str, dft);
    },
    getf: function getf(key) {
      var vars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (_.isString(key)) {
        var msg = __MSG(key) || key;
        return Ti.S.renderBy(msg, vars);
      }

      return key;
    },
    textf: function textf(str) {
      var vars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var m = /^i18n:(.+)$/.exec(str);

      if (m) {
        return Ti18n.getf(m[1], vars);
      }

      return Ti.S.renderBy(str, vars);
    }
  }; //---------------------------------------

  return {
    I18n: Ti18n
  };
}(),
    I18n = _ref65.I18n; //##################################################
// # import {Icons}        from "./icons.mjs"


var _ref66 = function () {
  //-----------------------------------
  var TYPES = {
    "7z": "fas-file-archive",
    "apk": "zmdi-android",
    "css": "fab-css3",
    "csv": "fas-file-csv",
    "doc": "far-file-word",
    "docx": "fas-file-word",
    "dmg": "fab-apple",
    "exe": "im-windows-o",
    "gz": "fas-file-archive",
    "hmaker_site": "zmdi-globe-alt",
    "html": "fab-html5",
    "js": "fab-node-js",
    "json": "fas-quote-right",
    "less": "fab-first-order-alt",
    "md": "fab-markdown",
    "mjs": "fab-node-js",
    "mkv": "far-file-video",
    "mp": "fas-file-signature",
    "mp3": "far-file-audio",
    "mp4": "far-file-video",
    "msi": "fab-windows",
    "pdf": "far-file-pdf",
    "py": "fab-python",
    "rar": "fas-file-archive",
    "rss": "fas-rss-square",
    "sass": "fab-first-order",
    "tar": "far-file-archive",
    "tgz": "fas-file-archive",
    "comt": "im-flask",
    "wnml": "fas-file-code",
    "xls": "far-file-excel",
    "xlsx": "fas-file-excel",
    "xml": "far-file-code",
    "zip": "fas-file-archive"
  }; //-----------------------------------

  var MIMES = {
    "audio": "far-file-audio",
    "image": "far-file-image",
    "text": "far-file-alt",
    "video": "far-file-video",
    "text/css": "fab-css3",
    "text/html": "fab-html5",
    "application/x-zip-compressed": "fas-file-archive",
    "application/x-javascript": "fab-js-square",
    "text/javascript": "fab-js-square"
  }; //-----------------------------------

  var NAMES = {
    "add": "zmdi-plus",
    "alert": "zmdi-notifications-none",
    "backward": "zmdi-chevron-left",
    "close": "zmdi-close",
    "confirm": "zmdi-help",
    "create": "zmdi-audio",
    "del": "zmdi-delete",
    "done": "fas-thumbs-up",
    "download": "zmdi-download",
    "edit": "zmdi-edit",
    "error": "zmdi-alert-octagon",
    "forward": "zmdi-chevron-right",
    "help": "zmdi-help-outline",
    "info": "zmdi-info-outline",
    "loading": "fas-spinner fa-spin",
    "processing": "zmdi-settings zmdi-hc-spin",
    "ok": "zmdi-check-circle",
    "prompt": "zmdi-keyboard",
    "refresh": "zmdi-refresh",
    "removed": "far-trash-alt",
    "setting": "zmdi-settings",
    "success": "zmdi-check-circle",
    "track": "zmdi-notifications-none",
    "warn": "zmdi-alert-triangle"
  }; //-----------------------------------

  var RACES = {
    "FILE": "far-file",
    "DIR": "fas-folder"
  }; //-----------------------------------

  var ALL = _objectSpread({}, TYPES, {}, MIMES, {}, RACES, {}, NAMES); //-----------------------------------


  var DEFAULT = "zmdi-cake"; //-----------------------------------

  var TiIcons = {
    put: function put() {
      var _ref67 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          types = _ref67.types,
          mimes = _ref67.mimes,
          races = _ref67.races,
          names = _ref67.names,
          dft = _ref67.dft;

      _.assign(TYPES, types);

      _.assign(MIMES, mimes);

      _.assign(NAMES, names);

      _.assign(RACES, races);

      _.assign(DEFAULT, dft);
    },
    get: function get(icon) {
      var dft = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT;

      // Default icon
      if (!icon) {
        return dft || DEFAULT;
      } // String: look up "ALL"


      if (_.isString(icon)) {
        return ALL[icon] || dft || DEFAULT;
      } // Base on the type


      var tp = icon.tp,
          type = icon.type,
          mime = icon.mime,
          race = icon.race,
          name = icon.name; // fallback to the mime Group Name
      // 'text/plain' will be presented as 'text'

      var mimeGroup = null;

      if (mime) {
        var _m2 = /^([a-z0-9]+)\/(.+)$/.exec(mime);

        if (_m2) {
          mimeGroup = _m2[1];
        }
      }

      return TYPES[type || tp] || MIMES[mime] || MIMES[mimeGroup] || RACES[race] || NAMES[name] || dft || DEFAULT;
    },
    getByName: function getByName(iconName) {
      var dft = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return Ti.Util.fallback(NAMES[iconName], dft, DEFAULT);
    },
    parseFontIcon: function parseFontIcon(val) {
      var dft = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (!val) return dft; // let font = TiIcons.get(val, null)
      // if(!_.isEmpty(font)) {
      //   val = font.value
      // }

      var icon = {
        className: "material-icons",
        text: val
      };
      var m = /^([a-z]+)-(.+)$/.exec(val);

      if (m) {
        // fontawsome
        if (/^fa[a-z]$/.test(m[1])) {
          icon.className = m[1] + ' fa-' + m[2];
          icon.text = null;
        } // Other font libs
        else {
            icon.className = m[1] + ' ' + val;
            icon.text = null;
          }
      }

      return icon;
    },
    fontIconHtml: function fontIconHtml(val) {
      var dft = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
      if (!val) return dft;
      var icon = TiIcons.parseFontIcon(val);
      if (_.isEmpty(icon)) return dft;
      return "<i class=\"".concat(icon.className, "\">").concat(icon.text || "", "</i>");
    }
  }; //-----------------------------------

  return {
    Icons: TiIcons
  };
}(),
    Icons = _ref66.Icons; //##################################################
// # import {Fuse}         from "./fuse.mjs"


var _ref68 = function () {
  var TiDetonator = /*#__PURE__*/function () {
    function TiDetonator() {
      var _ref69 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          key = _ref69.key,
          everythingOk = _ref69.everythingOk,
          fail = _ref69.fail,
          _ref69$once = _ref69.once,
          once = _ref69$once === void 0 ? false : _ref69$once;

      _classCallCheck(this, TiDetonator);

      _.assign(this, {
        key: key,
        everythingOk: everythingOk,
        fail: fail,
        once: once
      });
    }

    _createClass(TiDetonator, [{
      key: "explode",
      value: function () {
        var _explode = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23() {
          var ok;
          return regeneratorRuntime.wrap(function _callee23$(_context23) {
            while (1) {
              switch (_context23.prev = _context23.next) {
                case 0:
                  _context23.next = 2;
                  return this.everythingOk();

                case 2:
                  ok = _context23.sent;

                  if (ok) {
                    _context23.next = 7;
                    break;
                  }

                  _context23.next = 6;
                  return this.fail();

                case 6:
                  return _context23.abrupt("return", false);

                case 7:
                  return _context23.abrupt("return", true);

                case 8:
                case "end":
                  return _context23.stop();
              }
            }
          }, _callee23, this);
        }));

        function explode() {
          return _explode.apply(this, arguments);
        }

        return explode;
      }()
    }]);

    return TiDetonator;
  }(); //-----------------------------------


  var TiFuse = /*#__PURE__*/function () {
    function TiFuse() {
      _classCallCheck(this, TiFuse);

      this.detonators = [];
    }

    _createClass(TiFuse, [{
      key: "fire",
      value: function () {
        var _fire = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24() {
          var _iterator23, _step23, det;

          return regeneratorRuntime.wrap(function _callee24$(_context24) {
            while (1) {
              switch (_context24.prev = _context24.next) {
                case 0:
                  _iterator23 = _createForOfIteratorHelper(this.detonators);
                  _context24.prev = 1;

                  _iterator23.s();

                case 3:
                  if ((_step23 = _iterator23.n()).done) {
                    _context24.next = 12;
                    break;
                  }

                  det = _step23.value;
                  _context24.next = 7;
                  return det.explode();

                case 7:
                  if (!_context24.sent) {
                    _context24.next = 9;
                    break;
                  }

                  return _context24.abrupt("continue", 10);

                case 9:
                  return _context24.abrupt("return", false);

                case 10:
                  _context24.next = 3;
                  break;

                case 12:
                  _context24.next = 17;
                  break;

                case 14:
                  _context24.prev = 14;
                  _context24.t0 = _context24["catch"](1);

                  _iterator23.e(_context24.t0);

                case 17:
                  _context24.prev = 17;

                  _iterator23.f();

                  return _context24.finish(17);

                case 20:
                  // If all done, remove the [once Detonator]
                  _.remove(this.detonators, function (det) {
                    return det.once;
                  }); // return the result of this fire
                  // you can get this information in
                  // `.then((allBombed)=>{/*TODO*/})`


                  return _context24.abrupt("return", true);

                case 22:
                case "end":
                  return _context24.stop();
              }
            }
          }, _callee24, this, [[1, 14, 17, 20]]);
        }));

        function fire() {
          return _fire.apply(this, arguments);
        }

        return fire;
      }()
      /***
       * Add one Detonator to queue
       * @param det : @see #Detonator.constructor
       */

    }, {
      key: "add",
      value: function add() {
        var det = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        // Ensure the key 
        _.defaults(det, {
          key: "det-" + this.detonators.length
        }); // Push to queue


        if (det instanceof TiDetonator) {
          this.detonators.push(det);
        } else {
          this.detonators.push(new TiDetonator(det));
        }
      }
    }, {
      key: "remove",
      value: function remove() {
        for (var _len16 = arguments.length, keys = new Array(_len16), _key17 = 0; _key17 < _len16; _key17++) {
          keys[_key17] = arguments[_key17];
        }

        _.pullAllWith(this.detonators, keys, function (det, key) {
          return det.key == key;
        });
      }
    }, {
      key: "clear",
      value: function clear() {
        this.detonators = [];
      }
    }]);

    return TiFuse;
  }(); //-----------------------------------


  var TiFuseManager = /*#__PURE__*/function () {
    function TiFuseManager() {
      _classCallCheck(this, TiFuseManager);

      this.fuses = {};
    }

    _createClass(TiFuseManager, [{
      key: "get",
      value: function get() {
        var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "main";
        return this.fuses[key];
      }
    }, {
      key: "getOrCreate",
      value: function getOrCreate() {
        var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "main";
        var fu = this.get(key);

        if (!fu) {
          fu = new TiFuse();
          this.fuses[key] = fu;
        }

        return fu;
      }
    }, {
      key: "fire",
      value: function () {
        var _fire2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25() {
          var key,
              fu,
              _args25 = arguments;
          return regeneratorRuntime.wrap(function _callee25$(_context25) {
            while (1) {
              switch (_context25.prev = _context25.next) {
                case 0:
                  key = _args25.length > 0 && _args25[0] !== undefined ? _args25[0] : "main";
                  fu = this.get(key);

                  if (fu) {
                    _context25.next = 4;
                    break;
                  }

                  return _context25.abrupt("return", true);

                case 4:
                  _context25.next = 6;
                  return fu.fire();

                case 6:
                  return _context25.abrupt("return", _context25.sent);

                case 7:
                case "end":
                  return _context25.stop();
              }
            }
          }, _callee25, this);
        }));

        function fire() {
          return _fire2.apply(this, arguments);
        }

        return fire;
      }()
    }, {
      key: "removeFuse",
      value: function removeFuse(key) {
        var fu = this.get(key);

        if (fu) {
          delete this[key];
        }

        return fu;
      }
    }, {
      key: "clear",
      value: function clear() {
        var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "main";
        var fu = this.get(key);

        if (fu) {
          fu.clear();
        }

        return fu;
      }
    }]);

    return TiFuseManager;
  }(); //-----------------------------------


  return {
    Fuse: new TiFuseManager()
  };
}(),
    Fuse = _ref68.Fuse; //##################################################
// # import {Random}       from "./random.mjs"


var _ref70 = function () {
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split(''); //---------------------------------------

  var TiRandom = {
    /***
     * Generator `N` length random string
     */
    str: function str() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4;
      var dict = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CHARS;
      var s = '';

      for (var _i10 = 0; _i10 < n; _i10++) {
        var index = _.random(0, CHARS.length - 1);

        s += dict[index];
      }

      return s;
    },
    obj: function obj() {
      var dict = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : CHARS;

      var index = _.random(0, CHARS.length - 1);

      return dict[index];
    },
    list: function list() {
      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : input.length;
      var last = Math.min(n, input.length) - 1;

      for (; last > 0; last--) {
        var index = _.random(0, last);

        var lo = input[last];
        var li = input[index];
        input[last] = li;
        input[index] = lo;
      }

      return input;
    }
  }; //---------------------------------------

  return {
    Random: TiRandom
  };
}(),
    Random = _ref70.Random; //##################################################
// # import {Storage}      from "./storage.mjs"


var _ref71 = function () {
  //-----------------------------------
  var TiStorageWrapper = /*#__PURE__*/function () {
    function TiStorageWrapper(storage) {
      _classCallCheck(this, TiStorageWrapper);

      this.storage = storage;
    }

    _createClass(TiStorageWrapper, [{
      key: "get",
      value: function get(key, dft) {
        var fmt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _.identity;
        var str = this.storage.getItem(key);

        if (Ti.Util.isNil(str)) {
          return dft;
        }

        return fmt(str);
      }
    }, {
      key: "getString",
      value: function getString(key) {
        var dft = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        return this.get(key, dft);
      }
    }, {
      key: "getObject",
      value: function getObject(key) {
        var dft = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return this.get(key, dft, function (s) {
          return JSON.parse(s);
        });
      }
    }, {
      key: "getInt",
      value: function getInt(key) {
        var dft = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
        return this.get(key, dft, function (s) {
          return parseInt(s);
        });
      }
    }, {
      key: "getBoolean",
      value: function getBoolean(key) {
        var dft = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        return this.get(key, dft, function (s) {
          return /^(true|yes|on|ok)$/.test(s) ? true : false;
        });
      }
    }, {
      key: "getNumber",
      value: function getNumber(key) {
        var dft = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
        return this.get(key, dft, function (s) {
          return s * 1;
        });
      }
    }, {
      key: "set",
      value: function set(key, val) {
        if (_.isNull(val) || _.isUndefined(val)) {
          this.remove(key);
        } // Force to string
        else {
            var str = val + "";
            this.storage.setItem(key, str);
          }
      }
    }, {
      key: "setObject",
      value: function setObject(key) {
        var obj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (_.isNull(obj) || _.isUndefined(obj)) {
          this.remove(key);
        }

        var str = JSON.stringify(obj);
        this.storage.setItem(key, str);
      }
    }, {
      key: "mergeObject",
      value: function mergeObject(key) {
        var obj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var obj2 = this.getObject(key);

        _.merge(obj2, obj);

        this.setObject(key, obj2);
      }
    }, {
      key: "remove",
      value: function remove(key) {
        this.storage.removeItem(key);
      }
    }, {
      key: "clear",
      value: function clear() {
        this.storage.clear();
      }
    }]);

    return TiStorageWrapper;
  }(); //-----------------------------------


  var TiStorage = {
    session: new TiStorageWrapper(window.sessionStorage),
    local: new TiStorageWrapper(window.localStorage)
  }; //---------------------------------------

  return {
    Storage: TiStorage
  };
}(),
    Storage = _ref71.Storage; //##################################################
// # import {Shortcut}     from "./shortcut.mjs"


var _ref72 = function () {
  ///////////////////////////////////////
  var TiShortcut = {
    /***
     * Get the function from action
     * 
     * @param action{String|Object|Function}
     * @param $com{Vue|Function}: function for lazy get Vue instance
     * @param argContext{Object}
     * @param wait{Number} : If `>0` it will return the debounce version
     * 
     * @return {Function} the binded function call.
     */
    genActionInvoking: function genActionInvoking(action) {
      var _ref73 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          $com = _ref73.$com,
          _ref73$argContext = _ref73.argContext,
          argContext = _ref73$argContext === void 0 ? {} : _ref73$argContext,
          _ref73$wait = _ref73.wait,
          wait = _ref73$wait === void 0 ? 0 : _ref73$wait;

      // if(action.indexOf("projIssuesImport") > 0)
      //   console.log("genActionInvoking", action)
      //..........................................
      var __bind_it = function __bind_it(fn) {
        return wait > 0 ? _.debounce(fn, wait, {
          leading: true
        }) : fn;
      }; //..........................................


      var __vm = function __vm(com) {
        if (_.isFunction(com)) return com();
        return com;
      }; //..........................................
      // Command in Function


      if (_.isFunction(action)) {
        return __bind_it(action);
      } //..........................................


      var mode, name, args; //..........................................
      // Command in String

      if (_.isString(action)) {
        var _m3 = /^((global|commit|dispatch|root|main|\$\w+):|=>)([^()]+)(\((.*)\))?$/.exec(action);

        if (!_m3) {
          throw Ti.Err.make("e.action.invalid : " + action, {
            action: action
          });
        }

        mode = _m3[2] || _m3[1];
        name = _m3[3];
        args = _m3[5];
      } //..........................................
      // Command in object
      else if (_.isPlainObject(action)) {
          mode = action.mode;
          name = action.name;
          args = action.args;
        } //..........................................
      // explain args


      var __as = Ti.S.joinArgs(args, [], function (v) {
        return Ti.S.toJsValue(v, {
          context: argContext
        });
      });

      var func; //..........................................
      // Arrow invoke

      if ("=>" == mode) {
        var fn = _.get(window, name);

        if (!_.isFunction(fn)) {
          throw Ti.Err.make("e.action.invoke.NotFunc : " + action, {
            action: action
          });
        }

        func = function func() {
          var vm = __vm($com);

          fn.apply(vm, __as);
        };
      } //..........................................
      // $emit:
      else if ("$emit" == mode || "$notify" == mode) {
          func = function func() {
            var vm = __vm($com);

            if (!vm) {
              throw Ti.Err.make("e.action.emit.NoCom : " + action, {
                action: action
              });
            }

            vm[mode].apply(vm, [name].concat(_toConsumableArray(__as)));
          };
        } //..........................................
        // $parent: method
        else if ("$parent" == mode) {
            func = function func() {
              var vm = __vm($com);

              var fn = vm[name];

              if (!_.isFunction(fn)) {
                throw Ti.Err.make("e.action.call.NotFunc : " + action, {
                  action: action
                });
              }

              fn.apply(vm, __as);
            };
          } //..........................................
          // App Methods
          else {
              func = function func() {
                var vm = __vm($com);

                var app = Ti.App(vm);
                var fn = app[mode];

                var _as2 = _.concat(name, __as);

                fn.apply(app, _as2);
              };
            } //..........................................
      // Gurad


      if (!_.isFunction(func)) {
        throw Ti.Err.make("e.invalid.action : " + action, {
          action: action
        });
      } //..........................................


      return __bind_it(func); //..........................................
    },

    /***
     * Get uniquekey for a keyboard event object
     * 
     * @param $event{Event} - the Event like object with
     *  `{"key", "altKey","ctrlKey","metaKey","shiftKey"}`
     * @param sep{String} - how to join the multi-keys, `+` as default
     * @param mode{String} - Method of key name transformer function:
     *  - `"upper"` : to upport case
     *  - `"lower"` : to lower case
     *  - `"camel"` : to camel case
     *  - `"snake"` : to snake case
     *  - `"kebab"` : to kebab case
     *  - `"start"` : to start case
     *  - `null`  : keep orignal
     * 
     * @return Unique Key as string
     */
    getUniqueKey: function getUniqueKey($event) {
      var _ref74 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref74$sep = _ref74.sep,
          sep = _ref74$sep === void 0 ? "+" : _ref74$sep,
          _ref74$mode = _ref74.mode,
          mode = _ref74$mode === void 0 ? "upper" : _ref74$mode;

      var keys = [];

      if ($event.altKey) {
        keys.push("ALT");
      }

      if ($event.ctrlKey) {
        keys.push("CTRL");
      }

      if ($event.metaKey) {
        keys.push("META");
      }

      if ($event.shiftKey) {
        keys.push("SHIFT");
      }

      var k = Ti.S.toCase($event.key, mode);

      if (!/^(ALT|CTRL|CONTROL|SHIFT|META)$/.test(k)) {
        keys.push(" " === k ? "SPACE" : k);
      }

      return keys.join(sep);
    },

    /***
     * Watch the top window keyboard events
     */
    startListening: function startListening() {
      // Prevent multiple listening
      if (this.isListening) return; // Do listen

      window.addEventListener("keydown", function ($event) {
        // get the unify key code
        var uniqKey = TiShortcut.getUniqueKey($event); // Top App

        var app = Ti.App.topInstance(); // Then try to find the action

        if (app) {
          app.fireShortcut(uniqKey, $event);
        }
      }); // Mark

      this.isListening = true;
    }
  }; ///////////////////////////////////////

  return {
    Shortcut: TiShortcut
  };
}(),
    Shortcut = _ref72.Shortcut; //##################################################
// # import {TiWebsocket}  from "./websocket.mjs"


var _ref75 = function () {
  /////////////////////////////////////
  var TiWebsocket = {
    //---------------------------------

    /***
     * @param watchTo{Object} : The watch target like:
     *  `{method:"watch", user:"site0", match:{id:"45he..7r3b"}}`
     * @param watched{Function} : Avaliable when valid `watchTo`, 
     * callback after watched, the arguments like `(event="xxx", data={})`
     * @param received{Function} : Avaliable when valid `watchTo`, 
     * callback after data received, the arguments like `(event="xxx", data={})`
     * @param closed{Function} : callback for socket closed.
     * @param error{Function} : callback for socket error raised
     */
    listenRemote: function listenRemote() {
      var _ref76 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref76$watchTo = _ref76.watchTo,
          watchTo = _ref76$watchTo === void 0 ? null : _ref76$watchTo,
          _ref76$watched = _ref76.watched,
          watched = _ref76$watched === void 0 ? _.identity : _ref76$watched,
          _ref76$received = _ref76.received,
          received = _ref76$received === void 0 ? _.identity : _ref76$received,
          _ref76$closed = _ref76.closed,
          closed = _ref76$closed === void 0 ? _.identity : _ref76$closed,
          _ref76$error = _ref76.error,
          error = _ref76$error === void 0 ? _.identity : _ref76$error;

      //...............................
      // Get System Config
      var host = window.location.hostname;
      var port = window.location.port;
      var schm = {
        "http:": "ws",
        "https:": "wss"
      }[window.location.protocol];
      var hostAndPort = [host];

      if (port > 80) {
        hostAndPort.push(port);
      } //...............................
      // Prepare the URL


      var wsUrl = "".concat(schm, "://").concat(hostAndPort.join(":"), "/websocket"); //...............................
      // Then Open websocket to watch

      var ws = new WebSocket(wsUrl); //...............................
      // Watch Message from remote (walnut)

      if (_.isPlainObject(watchTo)) {
        ws.onmessage = function (wse) {
          var wsObj = JSON.parse(wse.data); // Hi

          if ("hi" == wsObj.event) {
            var json = JSON.stringify(watchTo);
            this.send(json);
          } // watched
          else if ("watched" == wsObj.event) {
              watched(wsObj);
            } // received
            else {
                received(wsObj);
              }
        };
      } //...............................


      ws.onclose = closed; //...............................

      ws.onerror = error; //...............................
      // return the object

      return ws;
    } //---------------------------------

  }; /////////////////////////////////////

  return {
    TiWebsocket: TiWebsocket
  };
}(),
    TiWebsocket = _ref75.TiWebsocket; //##################################################
// # import {Validate}     from "./validate.mjs"


var _ref77 = function () {
  ///////////////////////////////////////
  var VALIDATORS = {
    "notNil": function notNil(val) {
      return !Ti.Util.isNil(val);
    },
    "notEmpty": function notEmpty(val) {
      return !_.isEmpty(val);
    },
    "notBlank": function notBlank(val) {
      return !Ti.S.isBlank(val);
    },
    "isNil": function isNil(val) {
      return Ti.Util.isNil(val);
    },
    "isEmpty": function isEmpty(val) {
      return _.isEmpty(val);
    },
    "isBlank": function isBlank(val) {
      return Ti.S.isBlank(val);
    },
    "isPlainObject": function isPlainObject(val) {
      return _.isPlainObject(val);
    },
    "isBoolean": function isBoolean(val) {
      return _.isBoolean(val);
    },
    "isTrue": function isTrue(val) {
      return val === true;
    },
    "isFalse": function isFalse(val) {
      return val === false;
    },
    "isTruthy": function isTruthy(val) {
      return val ? true : false;
    },
    "isFalsy": function isFalsy(val) {
      return val ? false : true;
    },
    "isNumber": function isNumber(val) {
      return _.isNumber(val);
    },
    "isString": function isString(val) {
      return _.isString(val);
    },
    "isDate": function isDate(val) {
      return _.isDate(val);
    },
    "inRange": function inRange(val) {
      var _ref78;

      for (var _len17 = arguments.length, args = new Array(_len17 > 1 ? _len17 - 1 : 0), _key18 = 1; _key18 < _len17; _key18++) {
        args[_key18 - 1] = arguments[_key18];
      }

      return (_ref78 = _).inRange.apply(_ref78, [val].concat(args));
    },
    "isMatch": function isMatch(val, src) {
      return _.isMatch(val, src);
    },
    "isEqual": function isEqual(val, oth) {
      return _.isEqual(val, oth);
    },
    "isOf": function isOf(val) {
      for (var _len18 = arguments.length, args = new Array(_len18 > 1 ? _len18 - 1 : 0), _key19 = 1; _key19 < _len18; _key19++) {
        args[_key19 - 1] = arguments[_key19];
      }

      for (var _i11 = 0, _args26 = args; _i11 < _args26.length; _i11++) {
        var a = _args26[_i11];
        if (_.isEqual(a, val)) return true;
      }

      return false;
    },
    "matchRegex": function matchRegex(val, regex) {
      if (_.isRegExp(regex)) {
        return regex.test(val);
      }

      return new RegExp(regex).test(val);
    }
  }; ///////////////////////////////////////

  var TiValidate = {
    //-----------------------------------
    get: function get(name) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var not = arguments.length > 2 ? arguments[2] : undefined;

      // Dynamic name
      if (_.isFunction(name)) {
        name = name();
      } // Try get the func


      var fn = _.get(VALIDATORS, name);

      if (!_.isFunction(fn)) {
        throw "Invalid Validate: ".concat(name);
      }

      var f2;

      if (_.isEmpty(args)) {
        f2 = fn;
      } else {
        var _ref79;

        f2 = (_ref79 = _).partialRight.apply(_ref79, [fn].concat(_toConsumableArray(args)));
      }

      if (not) {
        return function (v) {
          return !f2(v);
        };
      }

      return f2;
    },
    //-----------------------------------
    evalBy: function evalBy(str) {
      var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var not = false;

      if (str.startsWith("!")) {
        not = true;
        str = _.trim(str.substring(1));
      }

      var fv = Ti.Util.genInvoking(str, {
        context: context,
        funcSet: VALIDATORS,
        partialRight: true
      });

      if (!_.isFunction(fv)) {
        throw "Invalid TiValidator: \"".concat(str, "\"");
      }

      if (not) {
        return function (v) {
          return !fv(v);
        };
      }

      return fv;
    },
    //-----------------------------------
    getBy: function getBy(fn) {
      if (_.isFunction(fn)) {
        return fn;
      }

      if (_.isString(fn)) {
        return TiValidate.evalBy(fn);
      }

      if (_.isPlainObject(fn)) {
        var name = fn.name;
        var args = _.isUndefined(fn.args) ? [] : [].concat(fn.args);
        var not = fn.not;
        return TiValidate.get(name, args, not);
      }

      if (_.isArray(fn) && fn.length > 0) {
        var _name = fn[0];

        var _args27 = fn.slice(1, fn.length);

        return TiValidate.get(_name, _args27);
      }
    },
    //-----------------------------------
    checkBy: function checkBy(fn, val) {
      var f = TiValidate.getBy(fn);

      if (_.isFunction(f)) {
        return f(val) ? true : false;
      }

      return false;
    },
    //-----------------------------------
    match: function match() {
      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var validates = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var allowEmpty = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (!obj || _.isEmpty(obj)) {
        return allowEmpty;
      } // Customized


      if (_.isFunction(validates)) {
        return validates(obj) ? true : false;
      } // Static value


      if (_.isBoolean(validates)) {
        return validates ? true : false;
      } // Check


      var keys = _.keys(validates);

      var _iterator24 = _createForOfIteratorHelper(keys),
          _step24;

      try {
        for (_iterator24.s(); !(_step24 = _iterator24.n()).done;) {
          var key = _step24.value;

          var fn = _.get(validates, key);

          var val = _.get(obj, key);

          if (!TiValidate.checkBy(fn, val)) {
            return false;
          }
        }
      } catch (err) {
        _iterator24.e(err);
      } finally {
        _iterator24.f();
      }

      return true;
    } //-----------------------------------

  }; ///////////////////////////////////////

  return {
    Validate: TiValidate
  };
}(),
    Validate = _ref77.Validate; //##################################################
// # import {Types}        from "./types.mjs"


var _ref80 = function () {
  /////////////////////////////////////
  var P_DATE = new RegExp("^((\\d{4})([/\\\\-])?(\\d{1,2})?([/\\\\-])?(\\d{1,2})?)?" + "(([ T])?" + "(\\d{1,2})(:)(\\d{1,2})((:)(\\d{1,2}))?" + "((\.)(\\d{1,3}))?)?" + "(([+-])(\\d{1,2})(:\\d{1,2})?)?" + "(Z(\\d*))?$"); //-----------------------------------

  function parseDate(d) {
    //console.log("parseDate:", d)
    // Default return today
    if (_.isUndefined(d) || "today" === d) {
      return new Date();
    } // keep null


    if (!d || _.isArray(d) && _.isEmpty(d)) {
      return null;
    } // Date


    if (_.isDate(d)) {
      return new Date(d);
    } // Number as AMS


    if (_.isNumber(d)) {
      return new Date(d);
    } // String 


    if (_.isString(d)) {
      var str = d; // MS 

      if (/\d{13,}/.test(str)) {
        return new Date(str * 1);
      } // Try to tidy string 


      var _m4 = P_DATE.exec(d);

      if (_m4) {
        var _int = function _int(m, index, dft) {
          var s = m[index];

          if (s) {
            return parseInt(s);
          }

          return dft;
        };

        var today = new Date();

        var yy = _int(_m4, 2, today.getFullYear());

        var MM = _int(_m4, 4, _m4[2] ? 1 : today.getMonth() + 1);

        var dd = _int(_m4, 6, _m4[2] ? 1 : today.getDate());

        var HH = _int(_m4, 9, 0);

        var mm = _int(_m4, 11, 0);

        var _ss3 = _int(_m4, 14, 0);

        var _ms3 = _int(_m4, 17, 0);

        var _list4 = [_.padStart(yy, 4, "0"), "-", _.padStart(MM, 2, "0"), "-", _.padStart(dd, 2, "0"), "T", _.padStart(HH, 2, "0"), ":", _.padStart(mm, 2, "0"), ":", _.padStart(_ss3, 2, "0"), ".", _.padStart(_ms3, 3, "0")];
        if (_m4[18]) _list4.push(_m4[18]);

        var dateStr = _list4.join("");

        return new Date(dateStr);
      }
    } // Invalid date


    throw 'i18n:invalid-date';
  } /////////////////////////////////////
  // Time Object


  var TiTime = /*#__PURE__*/function () {
    //--------------------------------
    function TiTime(input, unit) {
      _classCallCheck(this, TiTime);

      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
      this.milliseconds = 0;
      this.__cached = {};
      this.update(input, unit);
    } //--------------------------------


    _createClass(TiTime, [{
      key: "clone",
      value: function clone() {
        return new TiTime(this);
      } //--------------------------------
      // If move attr into constructor, TBS will be supported
      // But the setter will be invoked infinitely 

    }, {
      key: "setHours",
      value: function setHours() {
        var hours = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        this.__cached = {};
        this.hours = _.clamp(hours, 0, 23);
      }
    }, {
      key: "setMinutes",
      value: function setMinutes() {
        var minutes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        this.__cached = {};
        this.minutes = _.clamp(minutes, 0, 59);
      }
    }, {
      key: "setSeconds",
      value: function setSeconds() {
        var seconds = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        this.__cached = {};
        this.seconds = _.clamp(seconds, 0, 59);
      }
    }, {
      key: "setMilliseconds",
      value: function setMilliseconds() {
        var ms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
        this.__cached = {};
        this.milliseconds = _.clamp(ms, 0, 999);
      } //--------------------------------

    }, {
      key: "setTimes",
      value: function setTimes() {
        var _ref81 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            hours = _ref81.hours,
            minutes = _ref81.minutes,
            seconds = _ref81.seconds,
            milliseconds = _ref81.milliseconds;

        this.__cached = {};
        this.hours = _.clamp(Ti.Util.fallback(hours, this.hours), 0, 23);
        this.minutes = _.clamp(Ti.Util.fallback(minutes, this.minutes), 0, 59);
        this.seconds = _.clamp(Ti.Util.fallback(seconds, this.seconds), 0, 59);
        this.milliseconds = _.clamp(Ti.Util.fallback(milliseconds, this.milliseconds), 0, 999);
      } //--------------------------------

    }, {
      key: "update",
      value: function update(input) {
        var unit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "ms";
        this.__cached = {}; // Date

        if (_.isDate(input)) {
          this.hours = input.getHours();
          this.minutes = input.getMinutes();
          this.seconds = input.getSeconds();
          this.milliseconds = input.getMilliseconds();
        } // Time
        else if (input instanceof TiTime) {
            this.hours = input.hours;
            this.minutes = input.minutes;
            this.seconds = input.seconds;
            this.milliseconds = input.milliseconds;
          } // Number as Seconds
          else if (_.isNumber(input)) {
              var _ms4 = {
                "ms": function ms(v) {
                  return v;
                },
                "s": function s(v) {
                  return Math.round(v * 1000);
                },
                "min": function min(v) {
                  return Math.round(v * 1000 * 60);
                },
                "hr": function hr(v) {
                  return Math.round(v * 1000 * 60 * 60);
                }
              }[unit](input);

              _ms4 = _.clamp(_ms4, 0, 86400000);
              var sec = parseInt(_ms4 / 1000);
              this.milliseconds = _ms4 - sec * 1000;
              this.hours = parseInt(sec / 3600);
              sec -= this.hours * 3600;
              this.minutes = parseInt(sec / 60);
              this.seconds = sec - this.minutes * 60;
            } // String
            else if (_.isString(input)) {
                var _m5 = /^([0-9]{1,2}):?([0-9]{1,2})(:?([0-9]{1,2})([.,]([0-9]{1,3}))?)?$/.exec(input);

                if (_m5) {
                  // Min: 23:59
                  if (!_m5[3]) {
                    this.hours = _.clamp(parseInt(_m5[1]), 0, 23);
                    this.minutes = _.clamp(parseInt(_m5[2]), 0, 59);
                    this.seconds = 0;
                    this.milliseconds = 0;
                  } // Sec: 23:59:59
                  else if (!_m5[5]) {
                      this.hours = _.clamp(parseInt(_m5[1]), 0, 23);
                      this.minutes = _.clamp(parseInt(_m5[2]), 0, 59);
                      this.seconds = _.clamp(parseInt(_m5[4]), 0, 59);
                      this.milliseconds = 0;
                    } // Ms: 23:59:59.234
                    else {
                        this.hours = _.clamp(parseInt(_m5[1]), 0, 23);
                        this.minutes = _.clamp(parseInt(_m5[2]), 0, 59);
                        this.seconds = _.clamp(parseInt(_m5[4]), 0, 59);
                        this.milliseconds = _.clamp(parseInt(_m5[6]), 0, 999);
                      }
                } // if(m)

              } // _.isString(input)


        return this;
      } // update(input, unit="ms")
      //--------------------------------

    }, {
      key: "toString",
      //--------------------------------
      value: function toString() {
        var _this14 = this;

        var fmt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "auto";

        // Auto 
        if ("auto" == fmt) {
          fmt = this.milliseconds > 0 ? "HH:mm:ss.SSS" : this.seconds > 0 ? "HH:mm:ss" : "HH:mm";
        } // To Min
        else if ("min" == fmt) {
            fmt = this.hours <= 0 ? "mm:ss" : "HH:mm:ss";
          } // Formatting


        var sb = "";
        var ptn = /a|HH?|KK?|hh?|kk?|mm?|ss?|S(SS)?/g;
        var pos = 0;
        var m;

        while (m = ptn.exec(fmt)) {
          var l = m.index; // Join the prev part

          if (l > pos) {
            sb += fmt.substring(pos, l);
          }

          pos = ptn.lastIndex; // Replace

          var _s2 = m[0];
          sb += {
            "a": function a() {
              return _this14.value > 43200 ? "PM" : "AM";
            },
            // am|pm
            "H": function H() {
              return _this14.hours;
            },
            // Hour in day (0-23)
            "k": function k() {
              return _this14.hours + 1;
            },
            // Hour in day (1-24)
            "K": function K() {
              return _this14.hours % 12;
            },
            // Hour in am/pm (0-11)
            "h": function h() {
              return _this14.hours % 12 + 1;
            },
            // Hour in am/pm (1-12)
            "m": function m() {
              return _this14.minutes;
            },
            // Minute in hour
            "s": function s() {
              return _this14.seconds;
            },
            // Second in minute
            "S": function S() {
              return _this14.milliseconds;
            },
            // Millisecond Number
            "HH": function HH() {
              return _.padStart(_this14.hours, 2, '0');
            },
            "kk": function kk() {
              return _.padStart(_this14.hours + 1, 2, '0');
            },
            "KK": function KK() {
              return _.padStart(_this14.hours % 12, 2, '0');
            },
            "hh": function hh() {
              return _.padStart(_this14.hours % 12 + 1, 2, '0');
            },
            "mm": function mm() {
              return _.padStart(_this14.minutes, 2, '0');
            },
            "ss": function ss() {
              return _.padStart(_this14.seconds, 2, '0');
            },
            "SSS": function SSS() {
              return _.padStart(_this14.milliseconds, 3, '0');
            }
          }[_s2]();
        } // while (m = reg.exec(fmt))
        // Ending


        if (pos < fmt.length) {
          sb += fmt.substring(pos);
        } // Done


        return sb;
      } //--------------------------------

    }, {
      key: "value",
      get: function get() {
        if (!_.isNumber(this.__cached.value)) {
          var val = this.hours * 3600 + this.minutes * 60 + this.seconds + Math.round(this.milliseconds / 1000);
          this.__cached.value = val;
        }

        return this.__cached.value;
      } //--------------------------------

    }, {
      key: "valueInMilliseconds",
      get: function get() {
        if (!_.isNumber(this.__cached.valueInMilliseconds)) {
          var val = this.hours * 3600000 + this.minutes * 60000 + this.seconds * 1000 + this.milliseconds;
          this.__cached.valueInMilliseconds = val;
        }

        return this.__cached.valueInMilliseconds;
      }
    }]);

    return TiTime;
  }(); /////////////////////////////////////
  // Color Object


  var QUICK_COLOR_TABLE = {
    "red": [255, 0, 0, 1],
    "green": [0, 255, 0, 1],
    "blue": [0, 0, 255, 1],
    "yellow": [255, 255, 0, 1],
    "black": [0, 0, 0, 1],
    "white": [255, 255, 255, 1]
  }; //----------------------------------

  var TiColor = /*#__PURE__*/function () {
    // Default color is Black
    function TiColor(input) {
      _classCallCheck(this, TiColor);

      this.red = 0;
      this.green = 0;
      this.blue = 0;
      this.alpha = 1;
      this.__cached = {};
      this.update(input);
    }

    _createClass(TiColor, [{
      key: "clone",
      value: function clone() {
        return new TiColor([this.red, this.green, this.blue, this.alpha]);
      } // If move attr into constructor, TBS will be supported
      // But the setter will be invoked infinitely 
      // set red(r=0) {
      //   this.__cached - {}
      //   this.red = _.clamp(r, 0, 255)
      // }
      // set green(g=0) {
      //   this.__cached - {}
      //   this.green = _.clamp(g, 0, 255)
      // }
      // set blue(b=0) {
      //   this.__cached - {}
      //   this.blue = _.clamp(b, 0, 255)
      // }
      // set alpha(a=1) {
      //   this.__cached = {}
      //   this.alpha = a
      // }

    }, {
      key: "setRGBA",
      value: function setRGBA() {
        var _ref82 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            r = _ref82.r,
            g = _ref82.g,
            b = _ref82.b,
            a = _ref82.a;

        this.__cached = {};

        if (_.isNumber(r)) {
          this.red = _.clamp(r, 0, 255);
        }

        if (_.isNumber(g)) {
          this.green = _.clamp(g, 0, 255);
        }

        if (_.isNumber(b)) {
          this.blue = _.clamp(b, 0, 255);
        }

        if (_.isNumber(a)) {
          this.alpha = _.clamp(a, 0, 1);
        }
      }
      /***
       * UPdate color by input
       * 
       * @param input{String|Number|Object} - input color:
       * - `String Expression`
       * - `Color`
       * - `Integer` : Gray
       * - `Quick Name` : See the quick name table
       * 
       * 
       */

    }, {
      key: "update",
      value: function update(input) {
        this.__cached = {}; // String

        if (_.isString(input)) {
          // Quick Table?
          var qct = QUICK_COLOR_TABLE[input.toLowerCase()];

          if (qct) {
            this.red = qct[0];
            this.green = qct[1];
            this.blue = qct[2];
            this.alpha = qct[3];
          } // Explain
          else {
              var str = input.replace(/[ \t\r\n]+/g, "").toUpperCase();

              var _m6; // HEX: #FFF


              if (_m6 = /^#?([0-9A-F])([0-9A-F])([0-9A-F]);?$/.exec(str)) {
                this.red = parseInt(_m6[1] + _m6[1], 16);
                this.green = parseInt(_m6[2] + _m6[2], 16);
                this.blue = parseInt(_m6[3] + _m6[3], 16);
              } // HEX2: #F0F0F0
              else if (_m6 = /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2});?$/.exec(str)) {
                  this.red = parseInt(_m6[1], 16);
                  this.green = parseInt(_m6[2], 16);
                  this.blue = parseInt(_m6[3], 16);
                } // RGB: rgb(255,33,89)
                else if (_m6 = /^RGB\((\d+),(\d+),(\d+)\)$/.exec(str)) {
                    this.red = parseInt(_m6[1], 10);
                    this.green = parseInt(_m6[2], 10);
                    this.blue = parseInt(_m6[3], 10);
                  } // RGBA: rgba(6,6,6,0.9)
                  else if (_m6 = /^RGBA\((\d+),(\d+),(\d+),([\d.]+)\)$/.exec(str)) {
                      this.red = parseInt(_m6[1], 10);
                      this.green = parseInt(_m6[2], 10);
                      this.blue = parseInt(_m6[3], 10);
                      this.alpha = _m6[4] * 1;
                    } // AARRGGBB : 0xFF000000
                    else if (_m6 = /^0[xX]([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2});?$/.exec(str)) {
                        this.alpha = parseInt(_m6[1], 16) / 255;
                        this.red = parseInt(_m6[2], 16);
                        this.green = parseInt(_m6[3], 16);
                        this.blue = parseInt(_m6[4], 16);
                      }
            }
        } // Number 
        else if (_.isNumber(input)) {
            // Must in 0-255
            var gray = _.clamp(Math.round(input), 0, 255);

            this.red = gray;
            this.green = gray;
            this.blue = gray;
            this.alpha = 1;
          } // Array [R,G,B,A?]
          else if (_.isArray(input) && input.length >= 3) {
              this.red = _.clamp(Math.round(input[0]), 0, 255);
              this.green = _.clamp(Math.round(input[1]), 0, 255);
              this.blue = _.clamp(Math.round(input[2]), 0, 255);
              this.alpha = input.length > 3 ? input[3] : 1;
            } // Color
            else if (input instanceof TiColor) {
                this.red = input.red;
                this.green = input.green;
                this.blue = input.blue;
                this.alpha = input.alpha;
              } // Invalid input, ignore it


        return this;
      }
      /***
       * To `#FF0088`
       */

    }, {
      key: "light",

      /***
       * Make color lightly
       * 
       * @param degree{Number} - 0-255
       */
      value: function light() {
        var degree = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
        this.red = _.clamp(this.red + degree, 0, 255);
        this.green = _.clamp(this.green + degree, 0, 255);
        this.blue = _.clamp(this.blue + degree, 0, 255);
      }
      /***
       * Make color lightly
       * 
       * @param degree{Number} - 0-255
       */

    }, {
      key: "dark",
      value: function dark() {
        var degree = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
        this.red = _.clamp(this.red - degree, 0, 255);
        this.green = _.clamp(this.green - degree, 0, 255);
        this.blue = _.clamp(this.blue - degree, 0, 255);
      }
      /***
       * Create a new Color Object which between self and given color
       * 
       * @param otherColor{TiColor} - Given color
       * @param pos{Number} - position (0-1)
       * 
       * @return new TiColor
       */

    }, {
      key: "between",
      value: function between(otherColor) {
        var pos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.5;

        var _ref83 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _objectDestructuringEmpty(_ref83);

        pos = _.clamp(pos, 0, 1);
        var r0 = otherColor.red - this.red;
        var g0 = otherColor.green - this.green;
        var b0 = otherColor.blue - this.blue;
        var a0 = otherColor.alpha - this.alpha;
        var r = this.red + r0 * pos;
        var g = this.green + g0 * pos;
        var b = this.blue + b0 * pos;
        var a = this.alpha + a0 * pos;
        return new TiColor([_.clamp(Math.round(r), 0, 255), _.clamp(Math.round(g), 0, 255), _.clamp(Math.round(b), 0, 255), _.clamp(a, 0, 1)]);
      }
    }, {
      key: "adjustByHSL",
      value: function adjustByHSL() {
        var _ref84 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref84$h = _ref84.h,
            h = _ref84$h === void 0 ? 0 : _ref84$h,
            _ref84$s = _ref84.s,
            s = _ref84$s === void 0 ? 0 : _ref84$s,
            _ref84$l = _ref84.l,
            l = _ref84$l === void 0 ? 0 : _ref84$l;

        var hsl = this.toHSL();
        hsl.h = _.clamp(hsl.h + h, 0, 1);
        hsl.s = _.clamp(hsl.s + s, 0, 1);
        hsl.l = _.clamp(hsl.l + l, 0, 1);
        return this.fromHSL(hsl);
      }
    }, {
      key: "toHSL",
      value: function toHSL() {
        var r = this.red,
            g = this.green,
            b = this.blue;
        r /= 255;
        g /= 255;
        b /= 255;
        var max = Math.max(r, g, b),
            min = Math.min(r, g, b),
            h,
            s,
            l = (max + min) / 2;

        if (max === min) {
          h = s = 0; // achromatic
        } else {
          var d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

          switch (max) {
            case r:
              h = (g - b) / d + (g < b ? 6 : 0);
              break;

            case g:
              h = (b - r) / d + 2;
              break;

            case b:
              h = (r - g) / d + 4;
              break;
          }

          h /= 6;
        }

        return {
          h: h,
          s: s,
          l: l
        };
      }
    }, {
      key: "fromHSL",
      value: function fromHSL() {
        var _ref85 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            h = _ref85.h,
            s = _ref85.s,
            l = _ref85.l;

        var r,
            g,
            b,
            hue2rgb = function hue2rgb(p, q, t) {
          if (t < 0) {
            t += 1;
          }

          if (t > 1) {
            t -= 1;
          }

          if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
          }

          if (t < 1 / 2) {
            return q;
          }

          if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
          }

          return p;
        };

        if (s === 0) {
          r = g = b = l; // achromatic
        } else {
          var q = l < 0.5 ? l * (1 + s) : l + s - l * s,
              p = 2 * l - q;
          r = hue2rgb(p, q, h + 1 / 3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1 / 3);
        }

        this.red = Math.round(r * 0xFF);
        this.green = Math.round(g * 0xFF);
        this.blue = Math.round(b * 0xFF);
        return this;
      }
      /***
       * String 
       */

    }, {
      key: "toString",
      value: function toString() {
        if (this.alpha == 1) {
          return this.hex;
        }

        return this.rgba;
      }
    }, {
      key: "hex",
      get: function get() {
        if (!this.__cached.hex) {
          var hex = ["#"];
          hex.push(_.padStart(this.red.toString(16).toUpperCase(), 2, '0'));
          hex.push(_.padStart(this.green.toString(16).toUpperCase(), 2, '0'));
          hex.push(_.padStart(this.blue.toString(16).toUpperCase(), 2, '0'));
          this.__cached.hex = hex.join("");
        }

        return this.__cached.hex;
      }
      /***
       * To `RGB(0,0,0)
       */

    }, {
      key: "rgb",
      get: function get() {
        if (!this.__cached.rgb) {
          var rgb = [this.red, this.green, this.blue];
          this.__cached.rgb = "RGB(".concat(rgb.join(","), ")");
        }

        return this.__cached.rgb;
      }
      /***
       * To `RGBA(0,0,0,1)
       */

    }, {
      key: "rgba",
      get: function get() {
        if (!this.__cached.rgba) {
          var rgba = [this.red, this.green, this.blue, this.alpha];
          return "RGBA(".concat(rgba.join(","), ")");
        }

        return this.__cached.rgba;
      }
    }]);

    return TiColor;
  }(); /////////////////////////////////////


  var TiTypes = {
    toStr: function toStr(val, fmt, dft) {
      // Dynamic function call
      if (_.isFunction(fmt)) {
        return fmt(val) || dft;
      } // Nil


      if (Ti.Util.isNil(val)) {
        return Ti.Util.fallback(dft, null);
      } // Number : translate by Array/Object or directly


      if (_.isNumber(val)) {
        if (_.isArray(fmt)) {
          return Ti.Util.fallback(_.nth(fmt, val), val);
        }

        var _s3 = "" + val;

        if (_.isPlainObject(fmt)) {
          return fmt[_s3];
        }

        return _s3;
      } // String to translate


      if (_.isString(val)) {
        // Mapping
        if (_.isPlainObject(fmt)) {
          return Ti.Util.getOrPick(fmt, val);
        } // Render template val -> {val:val}
        else if (_.isString(fmt)) {
            return Ti.S.renderVars(val, fmt);
          } // TODO maybe here can do some auto-format for String/Number
        // Return directly


        return val;
      } // Array to concat


      if (_.isArray(val)) {
        return val.join(fmt || ",");
      } // Boolean to translate


      if (_.isBoolean(val)) {
        return (fmt || ["false", "true"])[val * 1];
      } // Date to human looking


      if (_.isDate(val)) {
        return TiTypes.formatDateTime(val, fmt);
      } // Time to human looking


      if (val instanceof TiTime) {
        return val.toString(fmt);
      } // Color to human looking


      if (val instanceof TiColor) {
        return val.toString();
      } // Object to render or translate or JSON


      if (_.isPlainObject(val)) {
        if (!Ti.S.isBlank(fmt)) {
          if (_.isString(fmt)) {
            return Ti.S.renderVars(val, fmt);
          }

          if (_.isPlainObject(fmt)) {
            val = Ti.Util.translate(val, fmt);
          }
        }

        return JSON.stringify(val, null, fmt);
      } // Directly translate


      return "" + val;
    },
    //.......................................
    toNumber: function toNumber(val) {
      if (_.isBoolean(val)) {
        return val ? 1 : 0;
      }

      if (_.isDate(val)) {
        return val.getTime();
      }

      var n = 1 * val;

      if (isNaN(n)) {
        // console.log("invalid number")
        // throw 'i18n:invalid-number'
        return NaN;
      }

      return n;
    },
    //.......................................
    toInteger: function toInteger(val) {
      var _ref86 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref86$mode = _ref86.mode,
          mode = _ref86$mode === void 0 ? "int" : _ref86$mode,
          _ref86$dft = _ref86.dft,
          dft = _ref86$dft === void 0 ? NaN : _ref86$dft,
          _ref86$range = _ref86.range,
          range = _ref86$range === void 0 ? [] : _ref86$range,
          _ref86$border = _ref86.border,
          border = _ref86$border === void 0 ? [true, true] : _ref86$border;

      if (_.isBoolean(val)) {
        return val ? 1 : 0;
      }

      if (_.isDate(val)) {
        return val.getTime();
      }

      var n = {
        round: function round(v) {
          return Math.round(v);
        },
        ceil: function ceil(v) {
          return Math.ceil(v);
        },
        floor: function floor(v) {
          return Math.floor(v);
        },
        "int": function int(v) {
          return parseInt(v);
        }
      }[mode](val); // Apply the default

      if (isNaN(n)) {
        //throw 'i18n:invalid-integer'
        n = dft;
      } // Apply Range


      if (_.isArray(range) && range.length == 2) {
        // Eval the border
        if (!_.isArray(border)) {
          border = [border, border];
        }

        var _border = border,
            _border2 = _slicedToArray(_border, 2),
            b_left = _border2[0],
            b_right = _border2[1];

        var _range = _slicedToArray(range, 2),
            min_left = _range[0],
            max_right = _range[1]; // Guard the NaN


        if (isNaN(n)) {
          return Math.round((min_left + max_right) / 2);
        } // Left Range


        if (!_.isNull(min_left)) {
          if (b_left && n < min_left) return min_left;
          if (!b_left && n <= min_left) return min_left + 1;
        } // Right Range


        if (!_.isNull(max_right)) {
          if (b_right && n > max_right) return max_right;
          if (!b_right && n >= max_right) return max_right - 1;
        }
      } // Return Directly


      return n;
    },
    //.......................................
    // precision: if less then 0, keep original
    toFloat: function toFloat(val) {
      var _ref87 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref87$precision = _ref87.precision,
          precision = _ref87$precision === void 0 ? 2 : _ref87$precision,
          _ref87$dft = _ref87.dft,
          dft = _ref87$dft === void 0 ? NaN : _ref87$dft;

      var n = val * 1;

      if (isNaN(n)) {
        return dft;
      }

      if (precision >= 0) {
        var _y = Math.pow(10, precision);

        return Math.round(n * _y) / _y;
      }

      return n;
    },
    //.......................................
    toPercent: function toPercent(val) {
      var _ref88 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref88$fixed = _ref88.fixed,
          fixed = _ref88$fixed === void 0 ? 2 : _ref88$fixed,
          _ref88$auto = _ref88.auto,
          auto = _ref88$auto === void 0 ? true : _ref88$auto;

      return Ti.S.toPercent(val, {
        fixed: fixed,
        auto: auto
      });
    },
    //.......................................
    toBoolean: function toBoolean(val) {
      if (false == val) return false;
      if (_.isNull(val) || _.isUndefined(val)) return false;
      if (/^(no|off|false)$/i.test(val)) return false;
      return true;
    },
    //.......................................
    toBoolStr: function toBoolStr(val) {
      var falsy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "No";
      var trusy = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "Yes";
      return val ? trusy : falsy;
    },
    //.......................................
    toObject: function toObject(val, fmt) {
      var obj = val; // Translate Object

      if (_.isPlainObject(val) && _.isPlainObject(fmt)) {
        return Ti.Util.translate(obj, fmt);
      } // Parse Array


      if (_.isArray(val)) {
        return Ti.S.toObject(val, fmt);
      } // For String


      if (_.isString(val)) {
        // Parse JSON
        if (/^\{.*\}$/.test(val) || /^\[.*\]$/.test(val)) {
          obj = JSON.parse(val);
        } // Parse String


        return Ti.S.toObject(val, fmt);
      }

      return obj;
    },
    //.......................................
    toObjByPair: function toObjByPair() {
      var pair = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var _ref89 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref89$nameBy = _ref89.nameBy,
          nameBy = _ref89$nameBy === void 0 ? "name" : _ref89$nameBy,
          _ref89$valueBy = _ref89.valueBy,
          valueBy = _ref89$valueBy === void 0 ? "value" : _ref89$valueBy,
          _ref89$dft = _ref89.dft,
          dft = _ref89$dft === void 0 ? {} : _ref89$dft;

      var name = pair[nameBy];
      var value = pair[valueBy];

      var data = _.assign({}, dft); // Normal field


      if (_.isString(name)) {
        data[name] = value;
      } // Multi fields
      else if (_.isArray(name)) {
          var _iterator25 = _createForOfIteratorHelper(name),
              _step25;

          try {
            for (_iterator25.s(); !(_step25 = _iterator25.n()).done;) {
              var nm = _step25.value;
              data[nm] = value[nm];
            }
          } catch (err) {
            _iterator25.e(err);
          } finally {
            _iterator25.f();
          }
        }

      return data;
    },
    //.......................................
    toArray: function toArray(val) {
      var _ref90 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref90$sep = _ref90.sep,
          sep = _ref90$sep === void 0 ? /[ ,;\/、，；\r\n]+/ : _ref90$sep;

      if (Ti.Util.isNil(val)) {
        return val;
      }

      if (_.isArray(val)) {
        return val;
      }

      if (_.isString(val)) {
        if (_.isRegExp(sep)) {
          var _ss4 = val.split(sep);

          for (var _i12 = 0; _i12 < _ss4.length; _i12++) {
            _ss4[_i12] = _.trim(_ss4[_i12]);
          }

          return _.without(_ss4, undefined, null, "");
        }

        return [val];
      }
    },
    //.......................................
    toDate: function toDate(val) {
      var dft = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (_.isNull(val) || _.isUndefined(val)) {
        return dft;
      }

      if (_.isArray(val)) {
        var _re7 = [];

        _.forEach(val, function (v) {
          _re7.push(parseDate(v));
        });

        return _re7;
      }

      return parseDate(val);
    },
    //.......................................
    toTime: function toTime(val) {
      var _ref91 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          dft = _ref91.dft,
          unit = _ref91.unit;

      if (_.isNull(val) || _.isUndefined(val)) {
        return dft;
      }

      return new TiTime(val, unit);
    },
    //.......................................
    toColor: function toColor(val) {
      var dft = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new TiColor();

      if (_.isNull(val) || _.isUndefined(val)) {
        return dft;
      }

      if (val instanceof TiColor) {
        return val;
      }

      return new TiColor(val);
    },
    //.......................................
    toAMS: function toAMS(val) {
      var dt = parseDate(val);
      if (_.isDate(dt)) return dt.getTime();
      return null;
    },
    //.......................................
    toJson: function toJson(obj) {
      var tabs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "  ";
      return JSON.stringify(obj, null, tabs);
    },
    //.......................................

    /***
     * parse JSON safely. It will support un-quoted key like `{x:100}`.
     * Before eval, it will replace the key-word `function` to `Function`
     * 
     * @param str{Any} - input json source to parse
     * @param dft - return value when parse failed
     * 
     * @return JS object
     */
    safeParseJson: function safeParseJson(str, dft) {
      if (Ti.Util.isNil(str)) {
        return null;
      }

      if (!_.isString(str)) {
        return str;
      }

      try {
        return JSON.parse(str);
      } // Try eval
      catch (E) {
        var json = str.replace(/(function|=>)/g, "Function");

        try {
          return eval('(' + json + ')');
        } catch (E2) {}
      } // Return string directly


      return dft;
    },
    //.......................................
    formatTime: function formatTime(time) {
      var fmt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "auto";

      if (_.isUndefined(time) || _.isNull(time)) {
        return "";
      } // Array in deep


      if (_.isArray(time)) {
        //console.log("formatDate", date, fmt)
        var _list5 = [];

        var _iterator26 = _createForOfIteratorHelper(time),
            _step26;

        try {
          for (_iterator26.s(); !(_step26 = _iterator26.n()).done;) {
            var t = _step26.value;

            _list5.push(TiTypes.formatTime(t, fmt));
          }
        } catch (err) {
          _iterator26.e(err);
        } finally {
          _iterator26.f();
        }

        return _list5;
      } // Guard time


      if (!(time instanceof TiTime)) {
        time = new TiTime(time);
      } // Format it


      return time.toString(fmt);
    },
    //.......................................
    formatDate: function formatDate(date) {
      var fmt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "yyyy-MM-dd";
      return TiTypes.formatDateTime(date, fmt);
    },
    //.......................................
    formatDateTime: function formatDateTime(date) {
      var fmt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "yyyy-MM-dd HH:mm:ss";

      // Date Range or a group of date
      if (_.isArray(date)) {
        //console.log("formatDate", date, fmt)
        var _list6 = [];

        var _iterator27 = _createForOfIteratorHelper(date),
            _step27;

        try {
          for (_iterator27.s(); !(_step27 = _iterator27.n()).done;) {
            var _d2 = _step27.value;

            _list6.push(TiTypes.formatDate(_d2, fmt));
          }
        } catch (err) {
          _iterator27.e(err);
        } finally {
          _iterator27.f();
        }

        return _list6;
      }

      if (!_.isDate(date)) {
        date = parseDate(date);
      } // Guard it


      if (!date) return null; // TODO here add another param
      // to format the datetime to "in 5min" like string
      // Maybe the param should named as "shorthand"
      // Format by pattern

      var yyyy = date.getFullYear();
      var M = date.getMonth() + 1;
      var d = date.getDate();
      var H = date.getHours();
      var m = date.getMinutes();
      var s = date.getSeconds();
      var S = date.getMilliseconds();
      var _c = {
        yyyy: yyyy,
        M: M,
        d: d,
        H: H,
        m: m,
        s: s,
        S: S,
        yyy: yyyy,
        yy: ("" + yyyy).substring(2, 4),
        MM: _.padStart(M, 2, '0'),
        dd: _.padStart(d, 2, '0'),
        HH: _.padStart(H, 2, '0'),
        mm: _.padStart(m, 2, '0'),
        ss: _.padStart(s, 2, '0'),
        SS: _.padStart(S, 3, '0'),
        SSS: _.padStart(S, 3, '0')
      };
      var regex = /(y{2,4}|M{1,2}|d{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|'([^']+)')/g;
      var ma;
      var list = [];
      var last = 0;

      while (ma = regex.exec(fmt)) {
        if (last < ma.index) {
          list.push(fmt.substring(last, ma.index));
        }

        var it = Ti.Util.fallback(ma[2], _c[ma[1]], ma[1]);
        list.push(it);
        last = regex.lastIndex;
      }

      if (last < fmt.length) {
        list.push(fmt.substring(last));
      }

      return list.join("");
    },
    //.......................................
    toAjaxReturn: function toAjaxReturn(val, dftData) {
      //console.log("toAjaxReturn", val)
      var reo = val;

      if (_.isString(val)) {
        try {
          reo = JSON.parse(val);
        } // Invalid JSON
        catch (E) {
          return {
            ok: false,
            errCode: "e.invalid.json_format",
            data: dftData
          };
        }
      }

      if (_.isBoolean(reo.ok)) {
        return reo;
      }

      return {
        ok: true,
        data: reo
      };
    },
    //.......................................
    Time: TiTime,
    Color: TiColor,
    //.......................................
    getFuncByType: function getFuncByType() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "String";
      var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "transformer";
      return _.get({
        'String': {
          transformer: "toStr",
          serializer: "toStr"
        },
        'Number': {
          transformer: "toNumber",
          serializer: "toNumber"
        },
        'Integer': {
          transformer: "toInteger",
          serializer: "toInteger"
        },
        'Float': {
          transformer: "toFloat",
          serializer: "toFloat"
        },
        'Boolean': {
          transformer: "toBoolean",
          serializer: "toBoolean"
        },
        'Object': {
          transformer: "toObject",
          serializer: "toObject"
        },
        'Array': {
          transformer: "toArray",
          serializer: "toArray"
        },
        'DateTime': {
          transformer: "toDate",
          serializer: "formatDateTime"
        },
        'AMS': {
          transformer: "toDate",
          serializer: "toAMS"
        },
        'Time': {
          transformer: "toTime",
          serializer: "formatTime"
        },
        'Date': {
          transformer: "toDate",
          serializer: "formatDate"
        },
        'Color': {
          transformer: "toColor",
          serializer: "toStr"
        } // Date
        // Color
        // PhoneNumber
        // Address
        // Currency
        // ...

      }, "".concat(type, ".").concat(name));
    },
    //.......................................
    getFuncBy: function getFuncBy() {
      var fld = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var name = arguments.length > 1 ? arguments[1] : undefined;
      var fnSet = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : TiTypes;
      //..................................
      // Eval the function
      var fn = TiTypes.evalFunc(fld[name], fnSet); //..................................
      // Function already

      if (_.isFunction(fn)) return fn; //..................................
      // If noexits, eval the function by `fld.type`

      if (!fn && fld.type) {
        fn = TiTypes.getFuncByType(fld.type, name);
      } //..................................
      // Is string


      if (_.isString(fn)) {
        return _.get(fnSet, fn);
      } //..................................
      // Plain Object 


      if (_.isPlainObject(fn) && fn.name) {
        //console.log(fnType, fnName)
        var fn2 = _.get(fnSet, fn.name); // Invalid fn.name, ignore it


        if (!_.isFunction(fn2)) return; // Partical args ...

        if (_.isArray(fn.args) && fn.args.length > 0) {
          var _ref92;

          return (_ref92 = _).partialRight.apply(_ref92, [fn2].concat(_toConsumableArray(fn.args)));
        } // Partical one arg


        if (!_.isUndefined(fn.args) && !_.isNull(fn.args)) {
          return _.partialRight(fn2, fn.args);
        } // Just return


        return fn2;
      }
    },
    //.......................................
    getFunc: function getFunc() {
      var fld = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var name = arguments.length > 1 ? arguments[1] : undefined;
      return TiTypes.getFuncBy(fld, name);
    },
    //.......................................
    evalFunc: function evalFunc(fn) {
      var fnSet = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : TiTypes;
      //..................................
      // Function already
      if (_.isFunction(fn)) return fn; //..................................
      // Is string

      if (_.isString(fn)) {
        return _.get(fnSet, fn);
      } //..................................
      // Plain Object 


      if (_.isPlainObject(fn) && fn.name) {
        //console.log(fnType, fnName)
        var fn2 = _.get(fnSet, fn.name); // Invalid fn.name, ignore it


        if (!_.isFunction(fn2)) return; // Partical args ...

        if (_.isArray(fn.args) && fn.args.length > 0) {
          var _ref93;

          return (_ref93 = _).partialRight.apply(_ref93, [fn2].concat(_toConsumableArray(fn.args)));
        } // Partical one arg


        if (!_.isUndefined(fn.args) && !_.isNull(fn.args)) {
          return _.partialRight(fn2, fn.args);
        } // Just return


        return fn2;
      }
    },
    //.......................................
    getJsType: function getJsType(val) {
      var dftType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Object";

      if (_.isUndefined(val)) {
        return dftType;
      }

      if (_.isNull(val)) {
        return "Object";
      }

      if (_.isNaN(val)) {
        return "Number";
      }

      if (_.isNumber(val)) {
        if (parseInt(val) == val) {
          return "Integer";
        }

        return "Number";
      }

      if (_.isBoolean(val)) {
        return "Boolean";
      }

      if (_.isString(val)) {
        return "String";
      }

      if (_.isArray(val)) {
        return "Array";
      } // Default is Object


      return "Object";
    } //.......................................

  }; //---------------------------------------

  return {
    TiTime: TiTime,
    TiColor: TiColor,
    Types: TiTypes
  };
}(),
    Types = _ref80.Types; //##################################################
// # import {Util}         from "./util.mjs"


var _ref94 = function () {
  //################################################
  // # import TiPaths from "./util-paths.mjs"
  var TiPaths = function () {
    var TiPaths = {
      /***
       * Get the name of a Ti linked path, such as:
       * 
       * - `@com:xxxx`
       * - `@mod:xxxx`
       * - `./mod/xxxx`
       * - `./com/xxxx`
       * 
       * @param `path{String}` The path
       * @return The major name of entity
       */
      getLinkName: function getLinkName(path) {
        var p_a = path.lastIndexOf('/');
        var p_b = path.lastIndexOf(':');
        var pos = Math.max(p_a, p_b);
        var str = pos >= 0 ? path.substring(pos + 1) : path;
        return TiPaths.getMajorName(str);
      },

      /***
       * Get the file name of a path
       * 
       * @param `path{String}` The path
       * @return The file name of entity (like file ordir) of a path
       */
      getFileName: function getFileName(path) {
        var dft = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
        if (!path) return dft;
        var pos = path.lastIndexOf("/");

        if (pos >= 0) {
          return path.substring(pos + 1);
        }

        return path;
      },

      /***
       * Get the major name of a path
       * 
       * @param `path{String}` The path
       * @return The major name of entity (like file ordir) of a path
       */
      getMajorName: function getMajorName(path) {
        var dft = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
        if (!path) return dft;
        var len = path.length;
        var l = 0;
        var r = len;

        for (var i = r - 1; i > 0; i--) {
          if (r == len) if (path[i] == '.') {
            r = i;
          }

          if (path[i] == '/' || path[i] == '\\') {
            l = i + 1;
            break;
          }
        }

        return path.substring(l, r);
      },

      /**
       * 获取文件后缀名，不包括 '.'，如 'abc.gif','，则返回 'gif'
       *
       * @param path
       *            文件路径
       * @return 文件后缀名
       */
      getSuffixName: function getSuffixName(path, forceLower) {
        if (!path) return "";
        var p0 = path.lastIndexOf('.');
        var p1 = path.lastIndexOf('/');
        if (-1 == p0 || p0 < p1) return "";
        var sfnm = path.substring(p0 + 1);
        return forceLower ? sfnm.toLowerCase() : sfnm;
      },

      /**
       * 获取文件后缀名，包括 '.'，如 'abc.gif','，则返回 '.gif'
       *
       * @param path
       *            文件路径
       * @return 文件后缀
       */
      getSuffix: function getSuffix(path, forceLower) {
        if (!path) return "";
        var p0 = path.lastIndexOf('.');
        var p1 = path.lastIndexOf('/');
        if (-1 == p0 || p0 < p1) return "";
        var sfnm = path.substring(p0);
        return forceLower ? sfnm.toLowerCase() : sfnm;
      },

      /***
       * Merge a group of string to a path.
       * 
       * @param args{...<String>} : The paths to join
       * 
       * @return Path string
       */
      appendPath: function appendPath() {
        var re = [];

        for (var _len19 = arguments.length, args = new Array(_len19), _key20 = 0; _key20 < _len19; _key20++) {
          args[_key20] = arguments[_key20];
        }

        for (var _i13 = 0, _args28 = args; _i13 < _args28.length; _i13++) {
          var ph = _args28[_i13];

          if (_.isEmpty(ph)) {
            continue;
          } // remove the last '/'


          var _m7 = /\/*$/.exec(ph);

          if (_m7) {
            ph = ph.substring(0, _m7.index);
          } // add the middle '/'


          if (re.length > 0 && !/^\//.test(ph)) {
            re.push("/");
          }

          re.push(ph);
        }

        return re.join("");
      },

      /***
       * Get the parent path
       */
      getParentPath: function getParentPath() {
        var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        if (!path || path.endsWith("/")) return path;
        var pos = path.lastIndexOf("/");
        if (pos < 0) return "";
        return path.substring(0, pos + 1);
      },

      /***
       * 将两个路径比较，得出相对路径。
       * 所谓相对路径，就是从基础路径出发，经过相对路径，即可得到目标路径
       * 
       * @param base
       *            基础路径，以 '/' 结束，表示目录
       * @param path
       *            目标路径，以 '/' 结束，表示目录
       * @param equalPath
       *            如果两个路径相等，返回什么，通常为 "./"。 
       *            你也可以用 "" 或者 "." 或者随便什么字符串来表示
       * 
       * @return 相对于基础路径对象的相对路径
       */
      getRelativePath: function getRelativePath() {
        var base = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
        var equalPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ".";

        // Guard
        if (_.isEqual(base, path)) {
          return equalPath;
        } //............................................


        var baseIsDir = base.endsWith("/");
        var pathIsDir = path.endsWith("/");

        var aryBase = _.without(base.split("/"), "");

        var aryPath = _.without(path.split("/"), ""); //............................................
        // Compare too paths


        var len = Math.min(aryBase.length, aryPath.length);
        var pos = 0;

        for (; pos < len; pos++) {
          var ba = aryBase[pos];
          var ph = aryPath[pos];

          if (ba != ph) {
            break;
          }
        } //............................................


        var rph = []; // Back

        var baseLen = aryBase.length;

        if (!baseIsDir) {
          baseLen--;
        }

        for (var _i14 = pos; _i14 < baseLen; _i14++) {
          rph.push("..");
        } // Go into


        for (var _i15 = pos; _i15 < aryPath.length; _i15++) {
          rph.push(aryPath[_i15]);
        } //............................................


        if (pathIsDir) {
          rph.push("");
        } //............................................


        return rph.join("/");
      },

      /***
       * 'arena>item:change' -> {block:"arena", event:"item:change"} 
       */
      explainEventName: function explainEventName(name) {
        var re = {};
        var m = /^(([^>]+)>)?(.+)$/.exec(name);

        if (m) {
          re.block = _.trim(m[2]);
          re.event = _.trim(m[3]);
        }

        return re;
      }
    }; //-----------------------------------

    return TiPaths;
  }(); //################################################
  // # import TiLink from "./util-link.mjs"


  var TiLink = function () {
    var TiLinkObj = /*#__PURE__*/function () {
      function TiLinkObj() {
        var _ref95 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            url = _ref95.url,
            params = _ref95.params;

        _classCallCheck(this, TiLinkObj);

        this.url = url;
        this.params = params;
        this.__S = null;
        this.set({
          url: url,
          params: params
        });
      }

      _createClass(TiLinkObj, [{
        key: "set",
        value: function set() {
          var _ref96 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
              _ref96$url = _ref96.url,
              url = _ref96$url === void 0 ? "" : _ref96$url,
              _ref96$params = _ref96.params,
              params = _ref96$params === void 0 ? {} : _ref96$params;

          this.url = url;
          this.params = params;
          this.__S = null;
          return this;
        }
      }, {
        key: "valueOf",
        value: function valueOf() {
          return this.toString();
        }
      }, {
        key: "toString",
        value: function toString() {
          if (!this.__S) {
            var _ss5 = [this.url];
            var qs = [];

            _.forEach(this.params, function (val, key) {
              qs.push("".concat(key, "=").concat(val));
            });

            if (qs.length > 0) {
              _ss5.push(qs.join("&"));
            }

            this.__S = _ss5.join("?");
          }

          return this.__S;
        }
      }]);

      return TiLinkObj;
    }(); //-----------------------------------


    var TiLink = {
      Link: function Link() {
        var _ref97 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            url = _ref97.url,
            params = _ref97.params;

        return new TiLinkObj({
          url: url,
          params: params
        });
      }
    }; //-----------------------------------

    return TiLink;
  }(); //---------------------------------------


  var TiUtil = _objectSpread({}, TiPaths, {}, TiLink, {
    /***
     * Merge an plain object by gived arguments deeply.
     * 
     * @param obj{Object} : the object to be merged with
     * @param args{...<Any>} : the value that will be merged to `obj`
     *   For each argument passed on, here is the treatment:
     *   + `Object` : merge to the result by `_.assign`
     *   + `Function` : set to result, `name` as the key
     *   + `Array` : merget to `obj` recursively
     *   + Another simple object like *Boolean|String|Number...* will be ignore
     * @return
     *  The `obj` which be passed on.
     */
    merge: function merge() {
      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      for (var _len20 = arguments.length, args = new Array(_len20 > 1 ? _len20 - 1 : 0), _key21 = 1; _key21 < _len20; _key21++) {
        args[_key21 - 1] = arguments[_key21];
      }

      return TiUtil.mergeWith.apply(TiUtil, [undefined, obj].concat(args));
    },
    mergeWith: function mergeWith() {
      var customizer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _.identity;
      var obj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      for (var _len21 = arguments.length, args = new Array(_len21 > 2 ? _len21 - 2 : 0), _key22 = 2; _key22 < _len21; _key22++) {
        args[_key22 - 2] = arguments[_key22];
      }

      var list = _.flattenDeep(args);

      var _iterator28 = _createForOfIteratorHelper(list),
          _step28;

      try {
        for (_iterator28.s(); !(_step28 = _iterator28.n()).done;) {
          var arg = _step28.value;

          if (!arg) {
            continue;
          }

          var val = customizer(arg); // Array

          if (_.isArray(val)) {
            TiUtil.merge.apply(TiUtil, [obj].concat(_toConsumableArray(val)));
          } // Function
          else if (_.isFunction(val)) {
              obj[val.name] = val;
            } // Plain Object
            else if (_.isPlainObject(val)) {
                _.merge(obj, val);
              } // Another types will be ignore

        }
      } catch (err) {
        _iterator28.e(err);
      } finally {
        _iterator28.f();
      }

      return obj;
    },

    /***
     * Unlike the `_.merge`, it will replace `Array` value
     */
    deepMergeObj: function deepMergeObj() {
      var _ref98;

      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      for (var _len22 = arguments.length, others = new Array(_len22 > 1 ? _len22 - 1 : 0), _key23 = 1; _key23 < _len22; _key23++) {
        others[_key23 - 1] = arguments[_key23];
      }

      return (_ref98 = _).mergeWith.apply(_ref98, [obj].concat(others, [function (objValue, srcValue) {
        if (_.isArray(objValue) || _.isArray(srcValue)) {
          return srcValue;
        }
      }]));
    },

    /***
     * Group a given list to map by special key
     */
    grouping: function grouping() {
      var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var groupKey = arguments.length > 1 ? arguments[1] : undefined;

      var _ref99 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref99$titles = _ref99.titles,
          titles = _ref99$titles === void 0 ? [] : _ref99$titles,
          _ref99$otherTitle = _ref99.otherTitle,
          otherTitle = _ref99$otherTitle === void 0 ? {
        value: "Others",
        text: "Others"
      } : _ref99$otherTitle,
          _ref99$asList = _ref99.asList,
          asList = _ref99$asList === void 0 ? false : _ref99$asList;

      var reMap = {}; //...............................................
      // Build title map

      var titleMap = [];

      _.forEach(titles, function (tit) {
        if (tit.text && !Ti.Util.isNil(tit.value)) {
          titleMap[tit.value] = tit;
        }
      }); //...............................................


      var others = []; //...............................................

      _.forEach(list, function (li) {
        var gk = _.get(li, groupKey);

        if (!gk) {
          others.push(li);
        } else {
          var tit = titleMap[gk] || {
            text: gk,
            value: gk
          };
          var grp = reMap[gk];

          if (!grp) {
            grp = _objectSpread({}, tit, {
              list: []
            });
            reMap[gk] = grp;
          }

          grp.list.push(li);
        }
      }); //...............................................


      if (!_.isEmpty(others)) {
        reMap[otherTitle.value] = _objectSpread({}, otherTitle, {
          list: others
        });
      } //...............................................


      if (asList) {
        return _.values(reMap);
      }

      return reMap;
    },

    /***
     * Insert one or more elements into specific position of list.
     * It will mutate the given list.
     * 
     * @param list{Array} - target list
     * @param pos{Integer} - 
     *   specific position. 
     *    `0` : the head, 
     *    `-1`: the tail, 
     *    `-2`: before the last lement
     * @param items{Array} - one or more elements
     * 
     * @return the index which to insert the items
     */
    insertToArray: function insertToArray() {
      var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var pos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;

      for (var _len23 = arguments.length, items = new Array(_len23 > 2 ? _len23 - 2 : 0), _key24 = 2; _key24 < _len23; _key24++) {
        items[_key24 - 2] = arguments[_key24];
      }

      // Guard
      if (!_.isArray(list) || _.isEmpty(items)) return -1; // Empty array

      if (_.isEmpty(list)) {
        list.push.apply(list, items);
        return 0;
      } // Find the position


      var index = Ti.Num.scrollIndex(pos, list.length + 1); // At the head

      if (0 == index) {
        list.unshift.apply(list, items);
      } // At the tail
      else if (list.length == index) {
          list.push.apply(list, items);
        } // At the middle
        else {
            var size = items.length; // More for room

            for (var _i16 = list.length - 1; _i16 >= index; _i16--) {
              list[_i16 + size] = list[_i16];
            } // Copy the items


            for (var _i17 = 0; _i17 < size; _i17++) {
              list[index + _i17] = items[_i17];
            }
          } // done


      return index;
    },

    /***
     * Insert one or more elements after specific position of object.
     * It will return new object.
     * 
     * @param list{Array} - target object
     * @param key{String} - the anchor key
     * @param items{Object} - new data to add
     * 
     * @return number or pair to add
     */
    appendToObject: function appendToObject() {
      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var stub = {};

      _.forEach(obj, function (v, k) {
        stub[k] = v;

        if (key == k) {
          _.assign(stub, data);
        }
      });

      return stub;
    },

    /***
     * @param input{Any}
     * @param iteratee{Function} - (val, path) 
     */
    walk: function walk() {
      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var _ref100 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref100$root = _ref100.root,
          root = _ref100$root === void 0 ? _.identity : _ref100$root,
          _ref100$all = _ref100.all,
          all = _ref100$all === void 0 ? _.identity : _ref100$all,
          _ref100$leaf = _ref100.leaf,
          leaf = _ref100$leaf === void 0 ? _.identity : _ref100$leaf,
          _ref100$node = _ref100.node,
          node = _ref100$node === void 0 ? _.identity : _ref100$node;

      //..............................
      var WalkAny = function WalkAny(input) {
        var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

        var isArray = _.isArray(input);

        var isPojo = _.isPlainObject(input);

        all(input, path); // For Node

        if (isArray || isPojo) {
          if (_.isEmpty(path)) {
            root(input, path);
          } else {
            node(input, path);
          }
        } // For Leaf
        else {
            leaf(input, path);
          } // Array


        if (isArray) {
          for (var _i18 = 0; _i18 < input.length; _i18++) {
            var val = input[_i18];
            var ph = path.concat(_i18);
            WalkAny(val, ph);
          }
        } // Object
        else if (isPojo) {
            var _keys2 = _.keys(input);

            var _iterator29 = _createForOfIteratorHelper(_keys2),
                _step29;

            try {
              for (_iterator29.s(); !(_step29 = _iterator29.n()).done;) {
                var k = _step29.value;
                var _val2 = input[k];

                var _ph = path.concat(k);

                WalkAny(_val2, _ph);
              }
            } catch (err) {
              _iterator29.e(err);
            } finally {
              _iterator29.f();
            }
          }
      }; //..............................


      WalkAny(input); //..............................
    },

    /***
     * Pick the object from source account the data
     */
    // pickDeep(src={}, data={}) {
    //   let keys = TiUtil.walkKeys(data)
    //   let re = {}
    //   for(let k of keys) {
    //     let val = _.get(src, k)
    //     _.set(re, k, val)
    //   }
    //   return re
    // },

    /***
     * Gen the keys deeply like `["a.b.c", "x.y.z"]` from a object
     */
    // walkKeys(input={}, predicate=()=>true) {
    //   let keys = []
    //   TiUtil.walk(input, (val, path)=>{
    //     keys.push(path)
    //   })
    //   return keys
    // },

    /***
     * Gen new Array to update the given element
     * 
     * @param list{Array} - the source Array
     * @param ele{Object} - Object to update
     * @param iteratee{Function} - match by two arguments:
     *  `function(item, ele)`, it undefined returned, the item wil be removed
     * if array returned, it will join the return array
     * @return the new Array instance
     */
    inset: function inset() {
      var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var iteratee = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _.identity;
      var list2 = [];

      var _iterator30 = _createForOfIteratorHelper(list),
          _step30;

      try {
        for (_iterator30.s(); !(_step30 = _iterator30.n()).done;) {
          var li = _step30.value;
          var li2 = iteratee(li); // Multi values returned

          if (_.isArray(li2) && !_.isEmpty(li2)) {
            var _iterator31 = _createForOfIteratorHelper(li2),
                _step31;

            try {
              for (_iterator31.s(); !(_step31 = _iterator31.n()).done;) {
                var li22 = _step31.value;
                list2.push(li22);
              }
            } catch (err) {
              _iterator31.e(err);
            } finally {
              _iterator31.f();
            }
          } // value returned


          if (!_.isUndefined(li2)) {
            list2.push(li2);
          }
        }
      } catch (err) {
        _iterator30.e(err);
      } finally {
        _iterator30.f();
      }

      return list2;
    },

    /***
     * Explain obj to a new one
     * 
     * The key `...` in obj will `_.assign` the value
     * The value `=xxxx` in obj will get the value from context
     */
    explainObj: function explainObj() {
      var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var obj = arguments.length > 1 ? arguments[1] : undefined;

      var _ref101 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref101$evalFunc = _ref101.evalFunc,
          evalFunc = _ref101$evalFunc === void 0 ? false : _ref101$evalFunc,
          _ref101$iteratee = _ref101.iteratee,
          iteratee = _ref101$iteratee === void 0 ? _.identity : _ref101$iteratee;

      //......................................
      var ExplainValue = function ExplainValue(anyValue) {
        var theValue = anyValue; //....................................
        // String : Check the "@BLOCK(xxx)" 

        if (_.isString(theValue)) {
          // Escape
          var _m8 = /^:((=|==|!=|=>|->)(.+))$/.exec(theValue);

          if (_m8) {
            return iteratee(_m8[1]);
          }

          var m_type, m_val, m_dft; // Match template

          _m8 = /^(==|!=|=>|->)(.+)$/.exec(theValue);

          if (_m8) {
            m_type = _m8[1];
            m_val = _.trim(_m8[2]);
          } // Find key in context
          else {
              _m8 = /^(=)([^?]+)(\?(.*))?$/.exec(theValue);

              if (_m8) {
                m_type = _m8[1];
                m_val = _.trim(_m8[2]);
                m_dft = _m8[4];
              }
            } // Matched


          if (m_type) {
            if (!Ti.Util.isNil(m_dft)) {
              m_dft = _.trim(m_dft);
            } //................................


            var fn = {
              // ==xxx  # Get Boolean value now
              "==": function (_2) {
                function _(_x14) {
                  return _2.apply(this, arguments);
                }

                _.toString = function () {
                  return _2.toString();
                };

                return _;
              }(function (val) {
                return _.get(context, val) ? true : false;
              }),
              // !=xxx  # Revert Boolean value now
              "!=": function (_3) {
                function _(_x15) {
                  return _3.apply(this, arguments);
                }

                _.toString = function () {
                  return _3.toString();
                };

                return _;
              }(function (val) {
                return _.get(context, val) ? false : true;
              }),
              // =xxx   # Get Value Now
              "=": function (_4) {
                function _(_x16, _x17) {
                  return _4.apply(this, arguments);
                }

                _.toString = function () {
                  return _4.toString();
                };

                return _;
              }(function (val, dft) {
                if (".." == val) {
                  return context;
                }

                var re = Ti.Util.getOrPick(context, val);

                if (Ti.Util.isNil(re) && !_.isUndefined(dft)) {
                  return dft;
                }

                return re;
              }),
              // =>Ti.Types.toStr(meta)
              "=>": function _(val) {
                var fn = Ti.Util.genInvoking(val, {
                  context: context
                });
                return fn();
              },
              // Render template
              "->": function _(val) {
                return Ti.S.renderBy(val, context);
              } // :=xxx  # Get Value Later
              // ":=" : (val, dft)=>{
              //   return (c2)=>{return _.get(c2, val)}
              // },
              // ->xxx  # Eval Template Result Now
              // :->xxx # Eval Template Result Later
              // ":->" : (val)=>{
              //   let tmpl = Ti.S.renderBy(val, context)
              //   return (c2)=>{return Ti.S.renderBy(tmpl, c2)}
              // },

            }[m_type]; //................................
            // Check Function

            if (_.isFunction(fn)) {
              return fn(m_val, m_dft);
            } //................................
            // Warn it


            throw "invalid dynamic value: " + theValue;
          } // Simple String


          return iteratee(theValue);
        } //....................................
        // Function  
        else if (_.isFunction(theValue)) {
            if (evalFunc) {
              var _re8 = theValue(context);

              return iteratee(_re8);
            }

            return theValue;
          } //....................................
          // Array 
          else if (_.isArray(theValue)) {
              var _list7 = [];

              var _iterator32 = _createForOfIteratorHelper(theValue),
                  _step32;

              try {
                for (_iterator32.s(); !(_step32 = _iterator32.n()).done;) {
                  var li = _step32.value;
                  var v2 = ExplainValue(li);

                  _list7.push(iteratee(v2));
                }
              } catch (err) {
                _iterator32.e(err);
              } finally {
                _iterator32.f();
              }

              return _list7;
            } //....................................
            // Object
            else if (_.isPlainObject(theValue)) {
                var o2 = {};

                _.forEach(theValue, function (v2, k2) {
                  var v3 = ExplainValue(v2);
                  var v4 = iteratee(v3); // key `...` -> assign o1

                  if ("..." == k2) {
                    _.assign(o2, v4);
                  } // set value
                  else {
                      o2[k2] = v4;
                    }
                });

                return o2;
              } //....................................
        // Others return directly


        return iteratee(anyValue);
      }; //......................................
      // ^---- const ExplainValue = (anyValue)=>{
      //......................................


      return ExplainValue(obj);
    },

    /***
     * Create a function to return a given object's copy.
     * It just return the simple object like (`Number|String|Boolean`) directly,
     * and deep clone complex object like `Object|Array|Date|RegExp`
     * 
     * @param obj{Object|Array} : The obj pattern to be generated.
     * 
     * @return `Function`, nil arguments and return the new copy of given object.
     */
    genObj: function genObj() {
      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return _.partial(_.cloneDeep, obj);
    },

    /***
     * Group a batch of functions as one function.
     * 
     * @param fns{Array} : Functions to be grouped
     * 
     * @return `Function` grouping the passed on function list
     */
    groupCall: function groupCall() {
      for (var _len24 = arguments.length, fns = new Array(_len24), _key25 = 0; _key25 < _len24; _key25++) {
        fns[_key25] = arguments[_key25];
      }

      var list = _.flattenDeep(fns).filter(function (fn) {
        return _.isFunction(fn);
      }); // Nothing


      if (list.length == 0) {
        return undefined;
      } // Only One


      if (list.length == 1) {
        return list[0];
      }

      return function () {
        for (var _len25 = arguments.length, args = new Array(_len25), _key26 = 0; _key26 < _len25; _key26++) {
          args[_key26] = arguments[_key26];
        }

        var _iterator33 = _createForOfIteratorHelper(list),
            _step33;

        try {
          for (_iterator33.s(); !(_step33 = _iterator33.n()).done;) {
            var fn = _step33.value;
            fn.apply(this, args);
          }
        } catch (err) {
          _iterator33.e(err);
        } finally {
          _iterator33.f();
        }
      };
    },
    pushValue: function pushValue(obj, key, val) {
      var old = _.get(obj, key) || [];

      _.set(obj, key, _.concat(old, val || []));
    },
    pushValueBefore: function pushValueBefore(obj, key, val) {
      var old = _.get(obj, key) || [];

      _.set(obj, key, _.concat(val || [], old));
    },
    pushUniqValue: function pushUniqValue(obj, key, val) {
      var old = _.get(obj, key) || [];

      _.set(obj, key, _.uniq(_.concat(old, val || [])));
    },
    pushUniqValueBefre: function pushUniqValueBefre(obj, key, val) {
      var old = _.get(obj, key) || [];

      _.set(obj, key, _.uniq(_.concat(val || [], old)));
    },

    /***
     * Set value to obj[key] if only val is not undefined
     * If value is null, use the `dft`
     * 
     * @TODO zozoh: I think this function will cause many `Hard Reading Code`, 
     * should remove it
     */
    setTo: function setTo() {
      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var key = arguments.length > 1 ? arguments[1] : undefined;
      var val = arguments.length > 2 ? arguments[2] : undefined;
      var dft = arguments.length > 3 ? arguments[3] : undefined;

      // String mode
      if (_.isString(key) && !_.isUndefined(val)) {
        obj[key] = _.isNull(val) ? dft : val;
      } // Object mode
      else if (_.isPlainObject(key)) {
          dft = val;

          _.forOwn(key, function (v, k) {
            if (!_.isUndefined(v)) {
              obj[k] = _.isNull(v) ? dft : v;
            }
          });
        }
    },

    /***
     * Get item from list by index scroll to begin:
     * 
     * @param list{Array} - source list
     * @param index{Number} - index
     *  - `<0` backword
     *  - `>=0` forword
     * 
     * @return item
     */
    nth: function nth() {
      var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var dft = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var len = list.length;
      if (len <= 0) return dft;
      var x = Ti.Num.scrollIndex(index, len);
      return list[x];
    },

    /***
     * Gen unique key for any input object
     * 
     * @param obj {Any} - input object
     * @param prefix{String} - key prefix
     * @param sep {String} - key separetor
     * 
     * @return unique key for input object
     */
    anyKey: function anyKey(obj, prefix) {
      var sep = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "-";

      // Guard
      if (TiUtil.isNil(obj)) {
        return obj;
      } // Prefix


      var ks = [];

      if (prefix) {
        ks.push(prefix);
      } // Object of Array, join values


      if (_.isArray(obj) || _.isPlainObject(obj)) {
        _.forEach(obj, function (v) {
          return ks.push(v);
        });

        return ks.join("-");
      } // Others to string
      else {
          ks.push(obj);
        }

      return ks.join(sep);
    },

    /***
     * Create new Mapping value
     * 
     * @param source{Object|Array} - Source to apply mapping
     * @param mapping{Object} - Mapping
     * @param customizer{Function} - Customized with params
     *                `(result, index, source)`
     *                only when source is `Array`
     * 
     * @return `Object|Array`
     */
    translate: function translate() {
      var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var mapping = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var customizer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _.identity;

      if (_.isEmpty(source) || _.isEmpty(mapping)) {
        return _.cloneDeep(source);
      } // Array


      if (_.isArray(source)) {
        var _list8 = [];

        for (var _i19 = 0; _i19 < source.length; _i19++) {
          var it = source[_i19];
          var result = TiUtil.translate(it, mapping, customizer);

          _list8.push(result);
        }

        return _list8;
      } // Take as plain object


      var re = {};

      _.forEach(mapping, function (val, key) {
        var v2; // Whole Context

        if (".." == val) {
          v2 = source;
        } // Get the value
        else {
            v2 = TiUtil.getOrPick(source, val);
          } // Customized and join


        v2 = customizer(v2);

        _.set(re, key, v2);
      }); // Done


      return re;
    },

    /***
     * Clone and omit all function fields
     */
    pureCloneDeep: function pureCloneDeep(obj) {
      // Array to recur
      if (_.isArray(obj)) {
        var _re9 = [];

        _.forEach(obj, function (v, i) {
          if (!_.isUndefined(v) && !_.isFunction(v)) {
            _re9[i] = TiUtil.pureCloneDeep(v);
          }
        });

        return _re9;
      } // Object to omit the function


      if (_.isPlainObject(obj)) {
        var _re10 = {};

        _.forEach(obj, function (v, k) {
          if (!_.isUndefined(v) && !_.isFunction(v)) {
            _re10[k] = TiUtil.pureCloneDeep(v);
          }
        });

        return _re10;
      } // Just clone it


      return _.cloneDeep(obj);
    },

    /***
     * Replace one object property key. Only for plaint object.
     * 
     * @param source{Object|Array} - Source to apply mapping
     * @param path{String} - dot splited path like "a.2.name"
     * @param newKey{String}
     * 
     * @return new Object or array
     */
    setKey: function setKey() {
      var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var path = arguments.length > 1 ? arguments[1] : undefined;
      var newKey = arguments.length > 2 ? arguments[2] : undefined;

      // Define the iteratee
      var set_key_by = function set_key_by(src) {
        var keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var newKey = arguments.length > 3 ? arguments[3] : undefined;

        // Guard it
        if (offset >= keys.length) {
          return src;
        } //.....................................
        // For Array : call-down


        if (_.isArray(src)) {
          var _list9 = [];
          var theIndex = parseInt(keys[offset]);

          for (var _i20 = 0; _i20 < src.length; _i20++) {
            // call-down
            if (_i20 == theIndex) {
              var val = set_key_by(src[_i20], keys, offset + 1, newKey);

              _list9.push(val);
            } // Just copy it
            else {
                _list9.push(src[_i20]);
              }
          }

          return _list9;
        } //.....................................
        // For Object


        if (_.isPlainObject(src)) {
          var _reo = {};

          var srcKeys = _.keys(src); // Find the replace key


          if (keys.length == offset + 1) {
            var theKey = keys[offset];

            var _iterator34 = _createForOfIteratorHelper(srcKeys),
                _step34;

            try {
              for (_iterator34.s(); !(_step34 = _iterator34.n()).done;) {
                var key = _step34.value;
                var _val3 = src[key]; // Now replace it

                if (theKey == key) {
                  _reo[newKey] = _val3;
                } // Just copy it
                else {
                    _reo[key] = _val3;
                  }
              }
            } catch (err) {
              _iterator34.e(err);
            } finally {
              _iterator34.f();
            }
          } // Call-down
          else {
              var _iterator35 = _createForOfIteratorHelper(srcKeys),
                  _step35;

              try {
                for (_iterator35.s(); !(_step35 = _iterator35.n()).done;) {
                  var _key27 = _step35.value;
                  var _val4 = src[_key27];
                  var v2 = set_key_by(_val4, keys, offset + 1, newKey);
                  _reo[_key27] = v2;
                }
              } catch (err) {
                _iterator35.e(err);
              } finally {
                _iterator35.f();
              }
            }

          return _reo;
        } //.....................................
        // just return


        return src;
      }; // Call in


      if (_.isString(path)) {
        path = path.split(".");
      }

      return set_key_by(source, path, 0, newKey);
    },

    /***
     * Get value from obj
     * 
     * @param key{String|Array} value key, if array will pick out a new obj
     * 
     * @return new obj or value
     */
    getOrPick: function getOrPick(obj, key, dft) {
      // Array to pick
      if (_.isArray(key)) {
        return Ti.Util.fallback(_.pick(obj, key), dft);
      } // Function to eval


      if (_.isFunction(key)) {
        return Ti.Util.fallback(key(obj), dft);
      } // String


      if (_.isString(key)) {
        // get multi candicate
        var _keys3 = key.split("|");

        if (_keys3.length > 1) {
          return Ti.Util.fallback(Ti.Util.getFallbackNil(obj, _keys3), dft);
        }
      } // Get by path


      return Ti.Util.fallback(_.get(obj, key), dft);
    },

    /***
     * @param obj{Object}
     */
    truthyKeys: function truthyKeys() {
      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var keys = [];

      _.forEach(obj, function (v, k) {
        if (v) {
          keys.push(k);
        }
      });

      return keys;
    },

    /***
     * Get value from object fallbackly
     * 
     * @param obj{Object} - source object
     * @param keys{Array} - candicate keys
     * 
     * @return `undefined` if not found
     */
    getFallback: function getFallback(obj) {
      for (var _len26 = arguments.length, keys = new Array(_len26 > 1 ? _len26 - 1 : 0), _key28 = 1; _key28 < _len26; _key28++) {
        keys[_key28 - 1] = arguments[_key28];
      }

      var ks = _.flattenDeep(keys);

      var _iterator36 = _createForOfIteratorHelper(ks),
          _step36;

      try {
        for (_iterator36.s(); !(_step36 = _iterator36.n()).done;) {
          var k = _step36.value;

          if (k) {
            var _v3 = _.get(obj, k);

            if (!_.isUndefined(_v3)) return _v3;
          }
        }
      } catch (err) {
        _iterator36.e(err);
      } finally {
        _iterator36.f();
      }
    },
    getFallbackNil: function getFallbackNil(obj) {
      for (var _len27 = arguments.length, keys = new Array(_len27 > 1 ? _len27 - 1 : 0), _key29 = 1; _key29 < _len27; _key29++) {
        keys[_key29 - 1] = arguments[_key29];
      }

      var ks = _.flattenDeep(keys);

      var _iterator37 = _createForOfIteratorHelper(ks),
          _step37;

      try {
        for (_iterator37.s(); !(_step37 = _iterator37.n()).done;) {
          var k = _step37.value;

          if (k) {
            var _v4 = _.get(obj, k);

            if (!TiUtil.isNil(_v4)) return _v4;
          }
        }
      } catch (err) {
        _iterator37.e(err);
      } finally {
        _iterator37.f();
      }
    },

    /***
     * Fallback a group value
     * 
     * @return The first one which is not undefined
     */
    fallback: function fallback() {
      for (var _len28 = arguments.length, args = new Array(_len28), _key30 = 0; _key30 < _len28; _key30++) {
        args[_key30] = arguments[_key30];
      }

      for (var _i21 = 0, _args29 = args; _i21 < _args29.length; _i21++) {
        var arg = _args29[_i21];
        if (!_.isUndefined(arg)) return arg;
      }
    },
    fallbackNil: function fallbackNil() {
      for (var _len29 = arguments.length, args = new Array(_len29), _key31 = 0; _key31 < _len29; _key31++) {
        args[_key31] = arguments[_key31];
      }

      for (var _i22 = 0, _args30 = args; _i22 < _args30.length; _i22++) {
        var arg = _args30[_i22];
        if (!TiUtil.isNil(arg)) return arg;
      }
    },
    fallbackNaN: function fallbackNaN() {
      for (var _len30 = arguments.length, args = new Array(_len30), _key32 = 0; _key32 < _len30; _key32++) {
        args[_key32] = arguments[_key32];
      }

      for (var _i23 = 0, _args31 = args; _i23 < _args31.length; _i23++) {
        var arg = _args31[_i23];
        if (!isNaN(arg)) return arg;
      }
    },

    /***
     * Test given input is `null` or `undefined`
     * 
     * @param o{Any} - any input value
     * 
     * @return `true` or `false`
     */
    isNil: function isNil(o) {
      return _.isUndefined(o) || _.isNull(o);
    },
    isBlank: function isBlank(o) {
      return _.isUndefined(o) || _.isNull(o) || "" === o || /^[ \t]*$/.test(o);
    },

    /***
     * Get or set one object value.
     * Unlike the `geset`, the param `key` is expected as `String`.
     * If it is `Object`, it will batch set values by `Object` key-value pairs.
     * 
     * @param obj{Object} - The target object, which get from or set to.
     * @param key{String|Object|Array} - The value key or pairs to set to `obj`.
     *     If `array`, it will pick and return a group of key-values from target object 
     * @param val{Any} - When key is not `Object`, it will take the param as value
     *     to set to target object. If it is `undefined`, it will get value from 
     *     target object
     * 
     * @return the value when play as `getter`, and `obj` self when play as `setter`
     */
    geset: function geset() {
      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var key = arguments.length > 1 ? arguments[1] : undefined;
      var val = arguments.length > 2 ? arguments[2] : undefined;

      // Set by pairs
      if (_.isPlainObject(key)) {
        _.assign(obj, key);

        return obj;
      } // Pick mode
      else if (_.isArray(key)) {
          return _.pick(obj, key);
        } // Set the value
        else if (!_.isUndefined(val)) {
            obj[key] = val;
            return obj;
          } // Return self
          else if (_.isUndefined(key)) {
              return obj;
            } // As general getter


      return obj[key];
    },

    /***
     * Invoke function in Object or Map
     */
    invoke: function invoke() {
      var _arguments = arguments,
          _this15 = this;

      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26() {
        var fnSet, name, args, context, fn, _as;

        return regeneratorRuntime.wrap(function _callee26$(_context26) {
          while (1) {
            switch (_context26.prev = _context26.next) {
              case 0:
                fnSet = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : {};
                name = _arguments.length > 1 ? _arguments[1] : undefined;
                args = _arguments.length > 2 && _arguments[2] !== undefined ? _arguments[2] : [];
                context = _arguments.length > 3 && _arguments[3] !== undefined ? _arguments[3] : _this15;
                fn = _.get(fnSet, name);

                if (!_.isFunction(fn)) {
                  _context26.next = 9;
                  break;
                }

                _as = _.concat(args);
                _context26.next = 9;
                return fn.apply(context, _as);

              case 9:
              case "end":
                return _context26.stop();
            }
          }
        }, _callee26);
      }))();
    },

    /***
     * @return Get first element if input is array, or input self
     */
    first: function first() {
      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      if (_.isArray(input)) return _.first(input);
      return input;
    },

    /***
     * @return Get last element if input is array, or input self
     */
    last: function last() {
      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      if (_.isArray(input)) return _.last(input);
      return input;
    },

    /***
     * @param key{Function|String|Array}
     * @param dftKeys{Array}: if key without defined, use the default keys to pick
     * @param indexPrefix{String}: for Index Mode, just like `Row-`
     * 
     * @return Function to pick value
     */
    genGetter: function genGetter(key) {
      var _ref102 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          indexPrefix = _ref102.indexPrefix,
          _ref102$dftKeys = _ref102.dftKeys,
          dftKeys = _ref102$dftKeys === void 0 ? [] : _ref102$dftKeys,
          _ref102$context = _ref102.context,
          context = _ref102$context === void 0 ? {} : _ref102$context,
          _ref102$funcSet = _ref102.funcSet,
          funcSet = _ref102$funcSet === void 0 ? window : _ref102$funcSet,
          _ref102$partialRight = _ref102.partialRight,
          partialRight = _ref102$partialRight === void 0 ? false : _ref102$partialRight;

      //.............................................
      // Customized Function
      if (_.isFunction(key)) {
        return function (it) {
          return key(it);
        };
      } //.............................................
      // String || Array


      if (key) {
        //...........................................
        // Index Mode: for `Row-0`, ti-table getRowId
        if (indexPrefix) {
          return function (it, index) {
            return Ti.Util.fallbackNil(Ti.Types.toStr(_.get(it, key)), "".concat(indexPrefix).concat(index));
          };
        } //...........................................
        // Static value


        var _m9 = /^'(.+)'$/.exec(key);

        if (_m9) {
          return function () {
            return _m9[1];
          };
        } //...........................................
        // Invoke mode


        _m9 = /^=>(.+)$/.exec(key);

        if (_m9) {
          var invoke = _m9[1];
          return TiUtil.genInvoking(invoke, {
            context: context,
            funcSet: funcSet,
            partialRight: partialRight
          });
        } //...........................................
        // Default Mode


        return function (it) {
          return Ti.Util.getOrPick(it, key);
        };
      } //.............................................
      // Default Keys


      if (!_.isEmpty(dftKeys)) {
        return function (it) {
          var _Ti$Util3;

          return (_Ti$Util3 = Ti.Util).getFallback.apply(_Ti$Util3, [it].concat(_toConsumableArray(dftKeys)));
        };
      } //.............................................

    },

    /***
     * "Ti.Types.toStr(abc)" -> Function
     * 
     * {name:"xxx", args:[..]} -> Function
     */
    genInvoking: function genInvoking(str) {
      var _ref103 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref103$context = _ref103.context,
          context = _ref103$context === void 0 ? {} : _ref103$context,
          _ref103$funcSet = _ref103.funcSet,
          funcSet = _ref103$funcSet === void 0 ? window : _ref103$funcSet,
          _ref103$partialRight = _ref103.partialRight,
          partialRight = _ref103$partialRight === void 0 ? false : _ref103$partialRight;

      //.............................................
      if (_.isFunction(str)) {
        return str;
      } //.............................................


      var callPath, callArgs; // Object mode

      if (str.name && str.args) {
        callPath = str.name;
        callArgs = _.concat(str.args);
      } // String mode
      else {
          var _m10 = /^([^()]+)(\((.+)\))?$/.exec(str);

          if (_m10) {
            callPath = _.trim(_m10[1]);
            callArgs = _.trim(_m10[3]);
          }
        } //.............................................
      //console.log(callPath, callArgs)


      var func = _.get(funcSet, callPath);

      if (_.isFunction(func)) {
        var args = Ti.S.joinArgs(callArgs, [], function (v) {
          return Ti.S.toJsValue(v, {
            context: context
          });
        });

        if (!_.isEmpty(args)) {
          var _ref105;

          if (partialRight) {
            var _ref104;

            return (_ref104 = _).partialRight.apply(_ref104, [func].concat(_toConsumableArray(args)));
          }

          return (_ref105 = _).partial.apply(_ref105, [func].concat(_toConsumableArray(args)));
        }

        return func;
      } // Not invokeing, just return str self


      return function () {
        return str;
      };
    },

    /***
     * @param matchBy{Function|String|Array}
     * @param partially {Boolean} 
     * 
     * @return Function to match value
     */
    genItemMatcher: function genItemMatcher(matchBy) {
      var partially = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (_.isFunction(matchBy)) {
        return function (it, str) {
          return matchBy(it, str);
        };
      }

      if (_.isString(matchBy)) {
        return partially ? function (it, str) {
          return _.indexOf(Ti.Util.getOrPick(it, matchBy), str) >= 0;
        } : function (it, str) {
          return _.isEqual(Ti.Util.getOrPick(it, matchBy), str);
        };
      }

      if (_.isArray(matchBy)) {
        return function (it, str) {
          var _iterator38 = _createForOfIteratorHelper(matchBy),
              _step38;

          try {
            for (_iterator38.s(); !(_step38 = _iterator38.n()).done;) {
              var k = _step38.value;

              var _v5 = Ti.Util.getOrPick(it, k);

              if (partially) {
                if (_.indexOf(_v5, str) >= 0) return true;
              } else {
                if (_.isEqual(_v5, str)) return true;
              }
            }
          } catch (err) {
            _iterator38.e(err);
          } finally {
            _iterator38.f();
          }

          return false;
        };
      }

      return function (it, str) {
        return false;
      };
    },

    /***
     * @param valueBy{Function|String|Array}
     * 
     * @return Function to pick value
     */
    genItemValueGetter: function genItemValueGetter(valueBy, dftVal) {
      if (_.isFunction(valueBy)) {
        return function (it) {
          return valueBy(it, dftVal);
        };
      }

      if (_.isString(valueBy)) {
        return function (it) {
          return Ti.Util.getOrPick(it, valueBy, dftVal);
        };
      }

      return function () {
        return dftVal;
      };
    },

    /***
     * @return Function to get row Id
     */
    genRowIdGetter: function genRowIdGetter(idBy) {
      var dftKeys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ["id", "value"];

      if (_.isFunction(idBy)) {
        return function (it, index) {
          return Ti.Types.toStr(idBy(it, index));
        };
      }

      if (_.isString(idBy)) {
        return function (it, index) {
          return Ti.Util.fallbackNil(Ti.Types.toStr(_.get(it, idBy)), "Row-".concat(index));
        };
      }

      if (!_.isEmpty(dftKeys)) {
        return function (it) {
          var _Ti$Util4;

          return (_Ti$Util4 = Ti.Util).getFallback.apply(_Ti$Util4, [it].concat(_toConsumableArray(dftKeys)));
        };
      }
    },

    /***
     * @return Function to get row data
     */
    genRowDataGetter: function genRowDataGetter(rawDataBy) {
      if (_.isFunction(rawDataBy)) {
        return function (it) {
          return rawDataBy(it);
        };
      }

      if (_.isString(rawDataBy)) {
        return function (it) {
          return _.get(it, rawDataBy);
        };
      }

      if (_.isObject(rawDataBy)) {
        return function (it) {
          return Ti.Util.translate(it, rawDataBy);
        };
      }

      return function (it) {
        return it;
      };
    }
  }); //-----------------------------------


  return {
    Util: TiUtil
  };
}(),
    Util = _ref94.Util; //##################################################
// # import {Trees}        from "./trees.mjs"


var _ref106 = function () {
  /*
  Tree Node: 
  {
    id    : ID,         // Unique in tree
    name  : "xiaobai",  // Unique in parent, root will be ignore
    children : []       // Children Node
  }
  */
  //////////////////////////////////////
  var TiTrees = {
    //---------------------------------
    path: function path() {
      var strOrArray = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (Ti.Util.isNil(strOrArray)) {
        return [];
      }

      if (_.isArray(strOrArray)) return strOrArray;
      return _.map(_.without(strOrArray.split("/"), ""), function (v) {
        return /^\d+$/.test(v) ? v * 1 : v;
      });
    },
    //---------------------------------

    /***
     * @param root{TreeNode} - tree root node
     * @param iteratee{Function} - iteratee for each node
     *   with one argument `({node, path=[], depth=0, parent, ancestors})`.
     *    - node : self node
     *    - path : self path in Array
     *    - depth     : path depth 0 base
     *    - parent    : parentNode
     *    - ancestors : root ... parentNode
     *   It can return `[stop:Boolean, data:Any]`
     *   If return `undefined`, take it as `[null,false]`
     *   Return `true` or `[true]` for break walking and return undefined.
     */
    walkDeep: function walkDeep(root) {
      var iteratee = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
        return {};
      };
      // Prepare context
      var context = {
        index: 0,
        node: root,
        path: [],
        depth: 0,
        parent: null,
        ancestors: []
      }; // Define the walking function
      // @c : {node, path, depth}

      var walking = function walking(c) {
        // Check current node
        var _$concat = _.concat(iteratee(c) || [null, false]),
            _$concat2 = _slicedToArray(_$concat, 2),
            data = _$concat2[0],
            stop = _$concat2[1];

        if (stop) return [data, stop]; // For Children

        if (_.isArray(c.node.children)) {
          var subC = {
            depth: c.depth + 1,
            parent: c,
            ancestors: _.concat(c.ancestors, c)
          };
          var index = 0;

          var _iterator39 = _createForOfIteratorHelper(c.node.children),
              _step39;

          try {
            for (_iterator39.s(); !(_step39 = _iterator39.n()).done;) {
              var child = _step39.value;

              var _walking = walking(_objectSpread({
                index: index,
                node: child,
                path: _.concat(c.path, child.name)
              }, subC));

              var _walking2 = _slicedToArray(_walking, 2);

              data = _walking2[0];
              stop = _walking2[1];
              index++;
              if (stop) return [data, stop];
            }
          } catch (err) {
            _iterator39.e(err);
          } finally {
            _iterator39.f();
          }
        } // Default return


        return [];
      }; // Do walking


      var _walking3 = walking(context),
          _walking4 = _slicedToArray(_walking3, 1),
          re = _walking4[0];

      return re;
    },
    //---------------------------------
    walkBreadth: function walkBreadth(root) {
      var iteratee = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
        return {};
      };
      // Prepare context
      var context = {
        index: 0,
        node: root,
        path: [],
        depth: 0,
        parent: null,
        ancestors: []
      }; // Check root node

      var _$concat3 = _.concat(iteratee(context) || [null, false]),
          _$concat4 = _slicedToArray(_$concat3, 2),
          data = _$concat4[0],
          stop = _$concat4[1];

      if (stop) {
        return [data, stop];
      } // Define the walking function
      // @c : {node, path, depth}


      var walking = function walking(c) {
        if (_.isArray(c.node.children)) {
          // save contexts
          var cs = [];
          var subC = {
            depth: c.depth + 1,
            parent: c,
            ancestors: _.concat(c.ancestors, c)
          };
          var index = 0; // For Children Check

          var _iterator40 = _createForOfIteratorHelper(c.node.children),
              _step40;

          try {
            for (_iterator40.s(); !(_step40 = _iterator40.n()).done;) {
              var child = _step40.value;

              var _c2 = _objectSpread({
                index: index,
                node: child,
                path: _.concat(c.path, child.name || index)
              }, subC);

              var _$concat5 = _.concat(iteratee(_c2) || [null, false]),
                  _$concat6 = _slicedToArray(_$concat5, 2),
                  _data2 = _$concat6[0],
                  _stop2 = _$concat6[1];

              index++;
              if (_stop2) return [_data2, _stop2]; // Save contexts

              cs.push(_c2);
            } // For Children Deep

          } catch (err) {
            _iterator40.e(err);
          } finally {
            _iterator40.f();
          }

          for (var _i24 = 0, _cs = cs; _i24 < _cs.length; _i24++) {
            var c2 = _cs[_i24];

            var _walking5 = walking(c2),
                _walking6 = _slicedToArray(_walking5, 2),
                _data = _walking6[0],
                _stop = _walking6[1];

            if (_stop) return [_data, _stop];
          }
        } // Default return


        return [];
      }; // Do walking


      var _walking7 = walking(context),
          _walking8 = _slicedToArray(_walking7, 1),
          re = _walking8[0];

      return re;
    },
    //---------------------------------
    getById: function getById(root, nodeId) {
      if (Ti.Util.isNil(nodeId)) {
        return;
      }

      return TiTrees.walkDeep(root, function (hie) {
        if (hie.node.id == nodeId) {
          return [hie, true];
        }
      });
    },
    //---------------------------------
    getByPath: function getByPath(root) {
      var strOrArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      // Tidy node path
      var nodePath = TiTrees.path(strOrArray); // walking to find

      return TiTrees.walkDeep(root, function (hie) {
        if (_.isEqual(nodePath, hie.path)) {
          return [hie, true];
        }
      });
    },
    //---------------------------------
    getNodeById: function getNodeById(root, nodeId) {
      var hie = TiTrees.getById(root, nodeId);

      if (hie) {
        return hie.node;
      }
    },
    //---------------------------------
    getNodeByPath: function getNodeByPath(root) {
      var strOrArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var hie = TiTrees.getByPath(root, strOrArray);

      if (hie) {
        return hie.node;
      }
    },
    //---------------------------------

    /***
     * @return Object {
     *   hierarchy : hie,
     *   children  : [],  // hie.parent.children, after changed
     *   item,   // item
     *   index   // the position of `item` in children
     * })
     */
    insertBefore: function insertBefore(hie, item) {
      // Guard
      if (!hie || _.isUndefined(item)) return;
      var pos, children; // Normal node -> sibling

      if (hie.parent) {
        children = hie.parent.node.children;
        pos = hie.index;
      } // ROOT -> children
      else {
          children = hie.node.children;
          pos = 0;
        }

      var index = Ti.Util.insertToArray(children, pos, item);
      return {
        hierarchy: hie,
        children: children,
        item: item,
        index: index
      };
    },
    //---------------------------------

    /***
     * @return Object {
     *   hierarchy : hie,
     *   children:[],  // hie.parent.children, after changed
     *   item,   // item
     *   index   // the position of `item` in children
     * })
     */
    insertAfter: function insertAfter(hie, item) {
      // Guard
      if (!hie || _.isUndefined(item)) return;
      var pos, children; // Normal node -> sibling

      if (hie.parent) {
        children = hie.parent.node.children;
        pos = hie.index + 1;
      } // ROOT -> children
      else {
          children = hie.node.children;
          pos = -1;
        }

      var index = Ti.Util.insertToArray(children, pos, item);
      return {
        hierarchy: hie,
        children: children,
        item: item,
        index: index
      };
    },
    //---------------------------------

    /***
     * @return Object {
     *   hierarchy : hie,
     *   children:[],  // hie.parent.children, after changed
     *   item,   // item
     *   index   // the position of `item` in children
     * })
     */
    prepend: function prepend(hie, item) {
      // Guard
      if (!hie || _.isUndefined(item)) return;
      var pos, children; // Leaf -> sibling

      if (!_.isArray(hie.node.children)) {
        children = hie.parent.node.children;
        pos = hie.index + 1;
      } // Node -> children
      else {
          children = hie.node.children;
          pos = 0;
        }

      var index = Ti.Util.insertToArray(children, pos, item);
      return {
        hierarchy: hie,
        children: children,
        item: item,
        index: index
      };
    },
    //---------------------------------

    /***
     * @return Object {
     *   hierarchy : hie,
     *   children:[],  // hie.parent.children, after changed
     *   item,   // item
     *   index   // the position of `item` in children
     * })
     */
    append: function append(hie, item) {
      // Guard
      if (!hie || _.isUndefined(item)) return;
      var pos, children; // Leaf -> sibling

      if (!_.isArray(hie.node.children)) {
        children = hie.parent.node.children;
        pos = hie.index;
      } // Node -> children
      else {
          children = hie.node.children;
          pos = 0;
        }

      var index = Ti.Util.insertToArray(children, pos, item);
      return {
        hierarchy: hie,
        children: children,
        item: item,
        index: index
      };
    },
    //---------------------------------

    /***
     * @return `true` for removed successfully
     */
    remove: function remove(hie) {
      // Guard
      if (!hie || !hie.parent) return;
      var nodeIndex = hie.index;

      var rms = _.remove(hie.parent.node.children, function (v, index) {
        return index == nodeIndex;
      });

      return rms.length > 0;
    },
    //---------------------------------

    /***
     * Get the next candicate node if current is removed
     * 
     * @return Object {
     *   node : {..},  // the node data
     *   path : []     // Path to node parent
     * }
     */
    nextCandidate: function nextCandidate(hie) {
      if (!hie || !hie.parent) {
        return;
      }

      var list = hie.parent.node.children;
      var node, path; // No sibing, return the parent

      if (list.length <= 1) {
        node = hie.parent.node;
        path = !_.isEmpty(hie.parent.path) ? hie.parent.path.slice(0, hie.parent.path.length - 1) : null;
      } // Try next
      else if (hie.index + 1 < list.length) {
          node = list[hie.index + 1];
          path = hie.parent.path;
        } // Must be prev
        else {
            node = list[hie.index - 1];
            path = hie.parent.path;
          } // Done


      return {
        node: node,
        path: path
      };
    } //---------------------------------

  }; //////////////////////////////////////

  return {
    Trees: TiTrees
  };
}(),
    Trees = _ref106.Trees; //##################################################
// # import {Viewport}     from "./viewport.mjs"


var _ref107 = function () {
  var TiViewport = /*#__PURE__*/function () {
    function TiViewport() {
      _classCallCheck(this, TiViewport);

      this.reset();
    }

    _createClass(TiViewport, [{
      key: "reset",
      value: function reset() {
        var $app = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        this.scrolling = [];
        this.resizing = [];
        return this;
      }
    }, {
      key: "watch",
      value: function watch(context) {
        var _ref108 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            scroll = _ref108.scroll,
            resize = _ref108.resize;

        if (_.isFunction(scroll)) {
          this.scrolling.push({
            context: context,
            handler: scroll
          });
        }

        if (_.isFunction(resize)) {
          this.resizing.push({
            context: context,
            handler: resize
          });
        }
      }
    }, {
      key: "unwatch",
      value: function unwatch(theContext) {
        _.remove(this.scrolling, function (_ref109) {
          var context = _ref109.context;
          return context === theContext;
        });

        _.remove(this.resizing, function (_ref110) {
          var context = _ref110.context;
          return context === theContext;
        });
      }
    }, {
      key: "startListening",
      value: function startListening() {
        var vp = this; // Prevent multiple listening

        if (this.isListening) return; // Do listen: resize

        window.addEventListener("resize", function (evt) {
          var _iterator41 = _createForOfIteratorHelper(vp.resizing),
              _step41;

          try {
            for (_iterator41.s(); !(_step41 = _iterator41.n()).done;) {
              var call = _step41.value;
              call.handler.apply(call.context, [evt]);
            }
          } catch (err) {
            _iterator41.e(err);
          } finally {
            _iterator41.f();
          }
        }); // Do listen: scroll

        window.addEventListener("scroll", function (evt) {
          var _iterator42 = _createForOfIteratorHelper(vp.scrolling),
              _step42;

          try {
            for (_iterator42.s(); !(_step42 = _iterator42.n()).done;) {
              var call = _step42.value;
              call.handler.apply(call.context, [evt]);
            }
          } catch (err) {
            _iterator42.e(err);
          } finally {
            _iterator42.f();
          }
        }); // Mark

        this.isListening = true;
      }
    }]);

    return TiViewport;
  }(); //-----------------------------------


  return {
    Viewport: new TiViewport()
  };
}(),
    Viewport = _ref107.Viewport; //##################################################
// # import {WWW}          from "./www.mjs"


var _ref111 = function () {
  ///////////////////////////////////////////
  var TiWWW = {
    //---------------------------------------

    /*
    Input :
    [{
      "icon"  : "xxx",
      "title" : "i18n:xxx",
      "type"  : "page",
      "value" : "page/group",
      "highlightBy" : "^page/xxx-",
      "newTab" : true
    }]
    Output : 
    [{
      "icon"  : "xxx",
      "title" : "i18n:xxx",
      "type"  : "page",
      "value" : "page/group",
      "href"  : "/base/page/group"
      "highlightBy" : Function,
      "target" : "_blank"
    }]
    */
    explainNavigation: function explainNavigation() {
      var navItems = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "/";
      var suffix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ".html";
      var list = [];

      var _iterator43 = _createForOfIteratorHelper(navItems),
          _step43;

      try {
        for (_iterator43.s(); !(_step43 = _iterator43.n()).done;) {
          var it = _step43.value;

          var li = _objectSpread({
            type: "page"
          }, _.pick(it, "icon", "title", "type", "value", "href", "target")); //..........................................
          // Link to Site Page


          if ('page' == it.type) {
            if (!li.href) {
              var path = it.value;

              if (!path.endsWith(suffix)) {
                path += suffix;
              }

              var aph = Ti.Util.appendPath(base, path);
              li.value = path;
              li.href = TiWWW.joinHrefParams(aph, it.params, it.anchor);
            }

            li.highlightBy = TiWWW.evalHighlightBy(it.highlightBy || li.value);

            if (!li.target && it.newTab) {
              li.target = "_blank";
            }
          } //..........................................
          // Link to URL
          else if ('href' == li.type) {
              li.highlightBy = function () {
                return false;
              };

              if (!li.href) li.href = TiWWW.joinHrefParams(it.value, it.params, it.anchor);
              if (!li.target && it.newTab) li.target = "_blank";
            } //..........................................
            // Dispatch action
            else {
                li.highlightBy = function () {
                  return false;
                }; // if(!li.href)
                //   li.href = "javascript:void(0)"

              } //..........................................
          // Children


          if (_.isArray(it.items)) {
            li.items = TiWWW.explainNavigation(it.items, base);
          } //..........................................
          // Join to list


          list.push(li);
        }
      } catch (err) {
        _iterator43.e(err);
      } finally {
        _iterator43.f();
      }

      return list;
    },
    //---------------------------------------
    evalHighlightBy: function evalHighlightBy() {
      var highlightBy = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      // Function ... skip
      if (_.isFunction(highlightBy)) {
        return highlightBy;
      } // Eval hight method


      if (_.isString(highlightBy)) {
        // REGEX 
        if (highlightBy.startsWith("^") || highlightBy.endsWith("$")) {
          var _regex = new RegExp(highlightBy);

          return _.bind(function (path) {
            return this.test(path);
          }, _regex);
        } // Static value


        return function (path) {
          return _.isEqual(path, highlightBy);
        };
      } // RegExp


      if (_.isRegExp(highlightBy)) {
        return _.bind(function (path) {
          return this.test(path);
        }, highlightBy);
      } // Boolean


      if (_.isBoolean(highlightBy)) {
        return function () {
          return highlightBy;
        };
      } // Default


      return function () {
        return false;
      };
    },
    //------------------------------------
    joinHrefParams: function joinHrefParams(href, params, anchor) {
      if (!href) return null; //...........................

      var query;

      if (!_.isEmpty(params)) {
        query = [];

        _.forEach(params, function (val, key) {
          if (!Ti.Util.isNil(val)) {
            var v2 = encodeURIComponent(val);
            query.push("".concat(key, "=").concat(v2));
          }
        });

        if (query.length > 0) {
          href = href + '?' + query.join("&");
        }
      } //...........................


      if (anchor) {
        if (anchor.startsWith("#")) {
          href += anchor;
        } else {
          href += "#" + anchor;
        }
      } //...........................


      return href;
    },
    //--------------------------------------

    /***
     * Evaluate the order item real fee
     */
    evalFee: function evalFee() {
      var _ref112 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref112$price = _ref112.price,
          price = _ref112$price === void 0 ? 0 : _ref112$price,
          _ref112$amount = _ref112.amount,
          amount = _ref112$amount === void 0 ? 1 : _ref112$amount;

      return price * amount;
    },
    //---------------------------------------
    getCurrencyPrefix: function getCurrencyPrefix(currency) {
      var cu = _.upperCase(currency);

      return {
        "RMB": "￥",
        "USD": "$",
        "EUR": "€",
        "GBP": "￡"
      }[cu];
    },
    //---------------------------------------

    /***
     * Display a currency
     */
    feeText: function feeText() {
      var fee = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var currency = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "RMB";

      var _ref113 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref113$autoSuffix = _ref113.autoSuffix,
          autoSuffix = _ref113$autoSuffix === void 0 ? true : _ref113$autoSuffix;

      var cu = _.upperCase(currency);

      var prefix = TiWWW.getCurrencyPrefix(cu);
      var ss = [];

      if (prefix) {
        ss.push(prefix);
      }

      ss.push(fee);

      if (!autoSuffix || !prefix) {
        ss.push(cu);
      }

      return ss.join("");
    } //---------------------------------------

  }; ///////////////////////////////////////////

  return {
    WWW: TiWWW
  };
}(),
    WWW = _ref111.WWW; //##################################################
// # import {GPS}          from "./gps.mjs"


var _ref114 = function () {
  //const BAIDU_LBS_TYPE = "bd09ll";
  var pi = 3.1415926535897932384626;
  var a = 6378245.0;
  var ee = 0.00669342162296594323; //-----------------------------------

  var TiGPS = {
    /**
     * 84 to 火星坐标系 (GCJ-02) World Geodetic System ==> Mars Geodetic System
     * @param lat
     * @param lon
     * @return Object({lat,lng})
     */
    WGS84_TO_GCJ02: function WGS84_TO_GCJ02(lat, lon) {
      if (TiGPS.outOfChina(lat, lon)) {
        return {
          lat: lat,
          lng: lon
        };
      }

      var dLat = TiGPS.transformLat(lon - 105.0, lat - 35.0);
      var dLon = TiGPS.transformLng(lon - 105.0, lat - 35.0);
      var radLat = lat / 180.0 * pi;
      var magic = Math.sin(radLat);
      magic = 1 - ee * magic * magic;
      var sqrtMagic = Math.sqrt(magic);
      dLat = dLat * 180.0 / (a * (1 - ee) / (magic * sqrtMagic) * pi);
      dLon = dLon * 180.0 / (a / sqrtMagic * Math.cos(radLat) * pi);
      var mgLat = lat + dLat;
      var mgLon = lon + dLon;
      return {
        lat: mgLat,
        lng: mgLon
      };
    },

    /**
     * (BD-09)-->84
     * @param bd_lat
     * @param bd_lon
     * @return Object({lat,lng})
     */
    WGS84_TO_BD09: function WGS84_TO_BD09(lat, lon) {
      var gcj02 = TiGPS.WGS84_TO_GCJ02(lat, lon);
      var bd09 = TiGPS.GCJ02_TO_BD09(gcj02.lat, gcj02.lng);
      return bd09;
    },

    /**
     * 火星坐标系 (GCJ-02) to 84 * 
     * @param lon 
     * @param lat
     * @return Object({lat,lng})
     */
    GCJ02_TO_WGS84: function GCJ02_TO_WGS84(lat, lon) {
      var gps = TiGPS.transform(lat, lon);
      var longitude = lon * 2 - gps.lng;
      var latitude = lat * 2 - gps.lat;
      return {
        lat: latitude,
        lng: longitude
      };
    },

    /**
     * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换算法 将 GCJ-02 坐标转换成 BD-09 坐标
     *
     * @param gg_lat
     * @param gg_lon
     * @return Object({lat,lng})
     */
    GCJ02_TO_BD09: function GCJ02_TO_BD09(gg_lat, gg_lon) {
      var x = gg_lon,
          y = gg_lat;
      var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * pi);
      var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * pi);
      var bd_lon = z * Math.cos(theta) + 0.0065;
      var bd_lat = z * Math.sin(theta) + 0.006;
      return {
        lat: bd_lat,
        lng: bd_lon
      };
    },

    /**
     * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换算法 * 
     * 将 BD-09 坐标转换成GCJ-02 坐标 
     * @param bd_lat 
     * @param bd_lon
     * @return Object({lat,lng})
     */
    BD09_TO_GCJ02: function BD09_TO_GCJ02(bd_lat, bd_lon) {
      var x = bd_lon - 0.0065,
          y = bd_lat - 0.006;
      var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * pi);
      var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * pi);
      var gg_lon = z * Math.cos(theta);
      var gg_lat = z * Math.sin(theta);
      return {
        lat: gg_lat,
        lng: gg_lon
      };
    },

    /**
     * (BD-09)-->84
     * @param bd_lat
     * @param bd_lon
     * @return Object({lat,lng})
     */
    BD09_TO_WGS84: function BD09_TO_WGS84(bd_lat, bd_lon) {
      var gcj02 = TiGPS.BD09_TO_GCJ02(bd_lat, bd_lon);
      var map84 = TiGPS.GCJ02_TO_WGS84(gcj02.lat, gcj02.lng);
      return map84;
    },

    /**
     * is or not outOfChina
     * @param lat
     * @param lon
     * @return Boolean
     */
    outOfChina: function outOfChina(lat, lon) {
      if (lon < 72.004 || lon > 137.8347) return true;
      if (lat < 0.8293 || lat > 55.8271) return true;
      return false;
    },
    transform: function transform(lat, lon) {
      if (TiGPS.outOfChina(lat, lon)) {
        return {
          lat: lat,
          lng: lon
        };
      }

      var dLat = TiGPS.transformLat(lon - 105.0, lat - 35.0);
      var dLon = TiGPS.transformLng(lon - 105.0, lat - 35.0);
      var radLat = lat / 180.0 * pi;
      var magic = Math.sin(radLat);
      magic = 1 - ee * magic * magic;
      var sqrtMagic = Math.sqrt(magic);
      dLat = dLat * 180.0 / (a * (1 - ee) / (magic * sqrtMagic) * pi);
      dLon = dLon * 180.0 / (a / sqrtMagic * Math.cos(radLat) * pi);
      var mgLat = lat + dLat;
      var mgLon = lon + dLon;
      return {
        lat: mgLat,
        lng: mgLon
      };
    },
    transformLat: function transformLat(x, y) {
      var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
      ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
      ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
      return ret;
    },
    transformLng: function transformLng(x, y) {
      var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
      ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
      ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0 * pi)) * 2.0 / 3.0;
      return ret;
    }
  }; //---------------------------------------

  return {
    GPS: TiGPS
  };
}(),
    GPS = _ref114.GPS; //##################################################
// # import {DateTime}     from "./datetime.mjs"


var _ref115 = function () {
  ///////////////////////////////////////////
  var I_DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var I_WEEK = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  var WEEK_DAYS = {
    "sun": 0,
    "mon": 1,
    "tue": 2,
    "wed": 3,
    "thu": 4,
    "fri": 5,
    "sat": 6,
    "sunday": 0,
    "monday": 1,
    "tuesday": 2,
    "wednesday": 3,
    "thursday": 4,
    "friday": 5,
    "saturday": 6
  };
  var MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]; ///////////////////////////////////////////

  var TiDateTime = {
    //---------------------------------------
    getWeekDayAbbr: function getWeekDayAbbr(day) {
      var i = _.clamp(day, 0, I_DAYS.length - 1);

      return I_DAYS[i];
    },
    //---------------------------------------
    getWeekDayName: function getWeekDayName(day) {
      var i = _.clamp(day, 0, I_WEEK.length - 1);

      return I_WEEK[i];
    },
    //---------------------------------------
    getWeekDayValue: function getWeekDayValue(name) {
      var dft = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;

      var nm = _.trim(_.lowerCase(name));

      var re = WEEK_DAYS[nm];
      if (_.isNumber(re)) return re;
      return dft;
    },
    //---------------------------------------

    /***
     * @param month{Number} - 0 base Month number
     * 
     * @return Month abbr like : "Jan" ... "Dec"
     */
    getMonthAbbr: function getMonthAbbr(month) {
      var m = _.clamp(month, 0, 11);

      return MONTH_ABBR[m];
    },
    //---------------------------------------
    setTime: function setTime(d) {
      var hours = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var minutes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var seconds = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      var milliseconds = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

      if (_.inRange(hours, 0, 24)) {
        d.setHours(hours);
      }

      if (_.inRange(minutes, 0, 60)) {
        d.setMinutes(minutes);
      }

      if (_.inRange(seconds, 0, 60)) {
        d.setSeconds(seconds);
      }

      if (_.inRange(milliseconds, 0, 1000)) {
        d.setMilliseconds(milliseconds);
      }

      return d;
    },
    //---------------------------------------
    setDayLastTime: function setDayLastTime(d) {
      return TiDateTime.setTime(d, 23, 59, 59, 999);
    },
    //---------------------------------------
    moveYear: function moveYear(d) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (_.isDate(d)) {
        d.setFullYear(d.getFullYear + offset);
      }

      return d;
    },
    //---------------------------------------
    moveMonth: function moveMonth(d) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (_.isDate(d)) {
        d.setMonth(d.getMonth() + offset);
      }

      return d;
    },
    //---------------------------------------
    moveDate: function moveDate(d) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (_.isDate(d)) {
        d.setDate(d.getDate() + offset);
      }

      return d;
    },
    //---------------------------------------
    createDate: function createDate(d) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (_.isDate(d)) {
        var d2 = new Date(d);
        d2.setDate(d2.getDate() + offset);
        return d2;
      }
    } //---------------------------------------

  }; ///////////////////////////////////////////

  return {
    DateTime: TiDateTime
  };
}(),
    DateTime = _ref115.DateTime; //##################################################
// # import {Num}          from "./num.mjs"


var _ref116 = function () {
  //-----------------------------------
  var TiNum = {
    /***
     * Fill array from given number. 
     * It will mutate the input array
     * 
     * @param startValue{Number} - The begin number to fill
     * @param len{Number} - how may items should be filled
     * @param ary{Array} - source array
     * @param step{Number} - Number increasement
     * 
     * @return the source array passed in
     */
    fillSteps: function fillSteps() {
      var startValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      var _ref117 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref117$ary = _ref117.ary,
          ary = _ref117$ary === void 0 ? [] : _ref117$ary,
          _ref117$step = _ref117.step,
          step = _ref117$step === void 0 ? 1 : _ref117$step;

      for (var _i25 = 0; _i25 < len; _i25++) {
        ary[_i25] = startValue + _i25 * step;
      }

      return ary;
    },

    /***
     * Clamp the number in range.
     * 
     * ```
     * scrollIndex( 3, 5) => 3
     * scrollIndex( 0, 5) => 0
     * scrollIndex( 4, 5) => 4
     * scrollIndex( 5, 5) => 1
     * scrollIndex( 6, 5) => 2
     * scrollIndex(-1, 5) => 4
     * scrollIndex(-5, 5) => 0
     * scrollIndex(-6, 5) => 4
     * scrollIndex(-5, 5) => 0
     * ```
     */
    scrollIndex: function scrollIndex(index) {
      var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (len > 0) {
        var md = index % len;
        return md >= 0 ? md : len + md;
      }

      return -1;
    }
  }; //---------------------------------------

  return {
    Num: TiNum
  };
}(),
    Num = _ref116.Num; //##################################################
// # import {Css}          from "./css.mjs"


var _ref118 = function () {
  ///////////////////////////////////////
  var TiCss = {
    //-----------------------------------
    toPixel: function toPixel(str) {
      var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
      var dft = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      // Number may `.23` or `300`
      if (_.isNumber(str)) {
        // Take (-1, 1) as percent
        if (str > -1 && str < 1) {
          return str * base;
        } // Fixed value


        return str;
      } // String, may `45px` or `43%`


      var m = /^([\d.]+)(px)?(%)?$/.exec(str);

      if (m) {
        // percent
        if (m[3]) {
          return m[1] * base / 100;
        } // fixed value


        return m[1] * 1;
      } // Fallback to default


      return dft;
    },
    //-----------------------------------
    toSize: function toSize(sz) {
      var _ref119 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref119$autoPercent = _ref119.autoPercent,
          autoPercent = _ref119$autoPercent === void 0 ? true : _ref119$autoPercent,
          _ref119$remBase = _ref119.remBase,
          remBase = _ref119$remBase === void 0 ? 0 : _ref119$remBase;

      if (_.isNumber(sz) || /^[0-9]+$/.test(sz)) {
        if (0 == sz) return sz;

        if (autoPercent && sz > -1 && sz < 1) {
          return sz * 100 + "%";
        }

        if (remBase > 0) {
          return sz / remBase + "rem";
        }

        return sz + "px";
      }

      return sz;
    },
    //-----------------------------------
    toSizeRem100: function toSizeRem100(sz, options) {
      var opt = _.assign({}, options, {
        remBase: 100
      });

      return TiCss.toSize(sz, opt);
    },
    //-----------------------------------
    toStyle: function toStyle(obj, options) {
      return _.mapValues(obj, function (val, key) {
        var ck = _.kebabCase(key);

        if (/^(opacity|z-index|order)$/.test(ck)) {
          return val;
        }

        return TiCss.toSize(val, options);
      });
    },
    //-----------------------------------
    toStyleRem100: function toStyleRem100(obj, options) {
      var opt = _.assign({}, options, {
        remBase: 100
      });

      return TiCss.toStyle(obj, opt);
    },
    //-----------------------------------
    toBackgroundUrl: function toBackgroundUrl(src) {
      var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
      if (!src) return;
      if (base) src = Ti.Util.appendPath(base, src);
      return "url(\"".concat(src, "\")");
    },
    //-----------------------------------
    toNumStyle: function toNumStyle(obj) {
      return TiCss.toStyle(obj, false);
    },
    //-----------------------------------
    mergeClassName: function mergeClassName() {
      var klass = {}; //.................................

      var __join_class = function __join_class(kla) {
        // Guard
        if (Ti.Util.isNil(kla)) return; // Function

        if (_.isFunction(kla)) {
          var _re11 = kla();

          __join_class(_re11);
        } // String
        else if (_.isString(kla)) {
            var _ss6 = _.without(_.split(kla, / +/g), "");

            var _iterator44 = _createForOfIteratorHelper(_ss6),
                _step44;

            try {
              for (_iterator44.s(); !(_step44 = _iterator44.n()).done;) {
                var _s4 = _step44.value;
                klass[_s4] = true;
              }
            } catch (err) {
              _iterator44.e(err);
            } finally {
              _iterator44.f();
            }
          } // Array
          else if (_.isArray(kla)) {
              var _iterator45 = _createForOfIteratorHelper(kla),
                  _step45;

              try {
                for (_iterator45.s(); !(_step45 = _iterator45.n()).done;) {
                  var a = _step45.value;

                  __join_class(a);
                }
              } catch (err) {
                _iterator45.e(err);
              } finally {
                _iterator45.f();
              }
            } // Object
            else if (_.isPlainObject(kla)) {
                _.forEach(kla, function (val, key) {
                  if (val) {
                    klass[key] = true;
                  }
                });
              }
      }; //.................................


      for (var _len31 = arguments.length, args = new Array(_len31), _key33 = 0; _key33 < _len31; _key33++) {
        args[_key33] = arguments[_key33];
      }

      __join_class(args); //.................................


      return klass;
    },
    //-----------------------------------
    joinClassNames: function joinClassNames() {
      var klass = TiCss.mergeClassName.apply(TiCss, arguments);
      var names = [];

      _.forEach(klass, function (enabled, key) {
        if (enabled) names.push(key);
      });

      return names.join(" ");
    } //-----------------------------------

  }; ///////////////////////////////////////

  return {
    Css: TiCss
  };
}(),
    Css = _ref118.Css; //##################################################
// # import {Mapping}      from "./mapping.mjs"


var _ref120 = function () {
  /////////////////////////////////////////////
  var MatchPath = /*#__PURE__*/function () {
    function MatchPath(path, data) {
      _classCallCheck(this, MatchPath);

      this.data = data;

      if (_.isString(path)) {
        this.path = _.without(path.split("/"), "");
      } // Is Array
      else if (_.isArray(path)) {
          this.path = path;
        }
    }

    _createClass(MatchPath, [{
      key: "match",
      value: function match(str) {
        var list = _.isArray(str) ? str : _.without(str.split("/"), "");

        for (var _i26 = 0; _i26 < list.length; _i26++) {
          var li = list[_i26];
          var ph = this.path[_i26]; // Wildcard

          if ("*" == ph) {
            continue;
          } // Acturally
          else if (li != ph) {
              return false;
            }
        }

        return true;
      }
    }]);

    return MatchPath;
  }(); /////////////////////////////////////////////


  var MatchRegex = /*#__PURE__*/function () {
    function MatchRegex(regex, data) {
      _classCallCheck(this, MatchRegex);

      this.data = data;
      this.regex = new RegExp(regex);
    }

    _createClass(MatchRegex, [{
      key: "match",
      value: function match(str) {
        return this.regex.test(str);
      }
    }]);

    return MatchRegex;
  }(); /////////////////////////////////////////////


  var TiMapping = /*#__PURE__*/function () {
    function TiMapping() {
      var mapping = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, TiMapping);

      this.parse(mapping);
    }

    _createClass(TiMapping, [{
      key: "parse",
      value: function parse() {
        var _this16 = this;

        var mapping = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.maps = {};
        this.regexs = [];
        this.paths = [];

        _.forEach(mapping, function (val, selector) {
          // Multi selector supported
          var ks = _.map(selector.split(","), function (v) {
            return _.trim(v);
          });

          var _iterator46 = _createForOfIteratorHelper(ks),
              _step46;

          try {
            for (_iterator46.s(); !(_step46 = _iterator46.n()).done;) {
              var key = _step46.value;

              // RegExp
              if (key.startsWith("^")) {
                _this16.regexs.push(new MatchRegex(key, val));
              } // Path
              else if (key.indexOf("/") >= 0) {
                  _this16.paths.push(new MatchPath(key, val));
                } // Normal
                else {
                    _this16.maps[key] = val;
                  }
            }
          } catch (err) {
            _iterator46.e(err);
          } finally {
            _iterator46.f();
          }
        });
      }
    }, {
      key: "get",
      value: function get(key, dft) {
        if (!Ti.Util.isNil(key)) {
          var data = this.maps[key];

          if (!_.isUndefined(data)) {
            return data;
          } // Find by path


          var _iterator47 = _createForOfIteratorHelper(this.paths),
              _step47;

          try {
            for (_iterator47.s(); !(_step47 = _iterator47.n()).done;) {
              var _m11 = _step47.value;

              var _list10 = _.without(key.split("/"), "");

              if (_m11.match(_list10)) {
                return _m11.data;
              }
            } // Find by Regexp

          } catch (err) {
            _iterator47.e(err);
          } finally {
            _iterator47.f();
          }

          var _iterator48 = _createForOfIteratorHelper(this.regexs),
              _step48;

          try {
            for (_iterator48.s(); !(_step48 = _iterator48.n()).done;) {
              var _m12 = _step48.value;

              if (_m12.match(key)) {
                return _m12.data;
              }
            }
          } catch (err) {
            _iterator48.e(err);
          } finally {
            _iterator48.f();
          }
        } // Find nothing


        return dft;
      }
    }]);

    return TiMapping;
  }(); /////////////////////////////////////////////


  return {
    Mapping: TiMapping
  };
}(),
    Mapping = _ref120.Mapping; //##################################################
// # import {Dict,DictFactory} from "./dict.mjs"


var _ref121 = function () {
  ///////////////////////////////////////////////
  var K = {
    item: Symbol("item"),
    data: Symbol("data"),
    query: Symbol("query"),
    getValue: Symbol("getValue"),
    getText: Symbol("getText"),
    getIcon: Symbol("getIcon"),
    isMatched: Symbol("isMatched"),
    itemCache: Symbol("itemCache"),
    dataCache: Symbol("dataCache"),
    hooks: Symbol("hooks"),
    shadowed: Symbol("shadowed")
  }; ///////////////////////////////////////////////

  var __item_loading = {}; ///////////////////////////////////////////////

  var Dict = /*#__PURE__*/function () {
    //-------------------------------------------
    function Dict() {
      _classCallCheck(this, Dict);

      this[K.hooks] = [];
      this[K.shadowed] = false;
      this[K.item] = _.idendity;

      this[K.data] = function () {
        return [];
      };

      this[K.query] = function (v) {
        return [];
      };

      this[K.getValue] = function (v) {
        return Ti.Util.getFallback(v, "value", "id");
      };

      this[K.getText] = function (v) {
        return Ti.Util.getFallback(v, "title", "text", "name", "nm");
      };

      this[K.getIcon] = function (v) {
        return _.get(v, "icon");
      };

      this[K.isMatched] = function (it, v, $dict) {
        //console.log("match", it, v)
        var itV = $dict.getValue(it);
        if (_.isEqual(v, itV)) return true;
        var itT = $dict.getText(it);
        if (itT && itT.indexOf(v) >= 0) return true;
        return false;
      }; //-------------------------------------------


      this[K.itemCache] = {}; // {val-item}

      this[K.dataCache] = null; // last query result for data
    } //-------------------------------------------
    // Funcs
    //-------------------------------------------


    _createClass(Dict, [{
      key: "setShadowed",
      value: function setShadowed() {
        var shadowed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        this[K.shadowed] = shadowed;
      }
    }, {
      key: "isShadowed",
      value: function isShadowed() {
        return this[K.shadowed];
      } //-------------------------------------------

    }, {
      key: "addHooks",
      value: function addHooks() {
        var _this17 = this;

        for (var _len32 = arguments.length, hooks = new Array(_len32), _key34 = 0; _key34 < _len32; _key34++) {
          hooks[_key34] = arguments[_key34];
        }

        var list = _.flattenDeep(hooks);

        _.forEach(list, function (hk) {
          if (_.isFunction(hk)) {
            _this17[K.hooks].push(hk);
          }
        });
      } //-------------------------------------------

    }, {
      key: "clearHooks",
      value: function clearHooks() {
        this[K.hooks] = [];
      } //-------------------------------------------

    }, {
      key: "doHooks",
      value: function doHooks() {
        var loading = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var _iterator49 = _createForOfIteratorHelper(this[K.hooks]),
            _step49;

        try {
          for (_iterator49.s(); !(_step49 = _iterator49.n()).done;) {
            var hk = _step49.value;
            hk({
              loading: loading
            });
          }
        } catch (err) {
          _iterator49.e(err);
        } finally {
          _iterator49.f();
        }
      } //-------------------------------------------

    }, {
      key: "invoke",
      value: function invoke(methodName) {
        var func = this[K[methodName]];

        if (_.isFunction(func)) {
          for (var _len33 = arguments.length, args = new Array(_len33 > 1 ? _len33 - 1 : 0), _key35 = 1; _key35 < _len33; _key35++) {
            args[_key35 - 1] = arguments[_key35];
          }

          return func.apply(this, [].concat(args, [this]));
        }
      } //-------------------------------------------

    }, {
      key: "invokeAsync",
      value: function () {
        var _invokeAsync = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27(methodName) {
          var func,
              _len34,
              args,
              _key36,
              are,
              _args33 = arguments;

          return regeneratorRuntime.wrap(function _callee27$(_context27) {
            while (1) {
              switch (_context27.prev = _context27.next) {
                case 0:
                  func = this[K[methodName]];

                  if (!_.isFunction(func)) {
                    _context27.next = 7;
                    break;
                  }

                  for (_len34 = _args33.length, args = new Array(_len34 > 1 ? _len34 - 1 : 0), _key36 = 1; _key36 < _len34; _key36++) {
                    args[_key36 - 1] = _args33[_key36];
                  }

                  _context27.next = 5;
                  return func.apply(this, [].concat(args, [this]));

                case 5:
                  are = _context27.sent;
                  return _context27.abrupt("return", are);

                case 7:
                case "end":
                  return _context27.stop();
              }
            }
          }, _callee27, this);
        }));

        function invokeAsync(_x18) {
          return _invokeAsync.apply(this, arguments);
        }

        return invokeAsync;
      }() //-------------------------------------------

    }, {
      key: "setFunc",
      value: function setFunc(methods) {
        var _this18 = this;

        _.forEach(methods, function (func, methodName) {
          if (_.isFunction(func)) {
            _this18[K[methodName]] = func;
          }
        });
      } //-------------------------------------------

    }, {
      key: "duplicate",
      value: function duplicate(_ref122) {
        var _this19 = this;

        var _ref122$hooks = _ref122.hooks,
            hooks = _ref122$hooks === void 0 ? false : _ref122$hooks,
            _ref122$cache = _ref122.cache,
            cache = _ref122$cache === void 0 ? true : _ref122$cache;
        var d = new Dict();

        _.forEach(K, function (s_key) {
          d[s_key] = _this19[s_key];
        });

        if (!hooks) {
          d.clearHooks();
        }

        if (!cache) {
          d.clearCache();
        }

        return d;
      } //-------------------------------------------
      // Cache
      //-------------------------------------------

    }, {
      key: "isItemCached",
      value: function isItemCached(val) {
        return !Ti.Util.isNil(this[K.itemCache][val]);
      } //-------------------------------------------

    }, {
      key: "addItemToCache",
      value: function addItemToCache(it, val) {
        it = Ti.Util.fallback(it, null);
        var itV = val;

        if (Ti.Util.isNil(itV)) {
          itV = this.getValue(it);
        }

        if (!_.isUndefined(it) && !Ti.Util.isNil(itV)) {
          this[K.itemCache][itV] = it;
        }
      } //-------------------------------------------

    }, {
      key: "clearCache",
      value: function clearCache() {
        this[K.itemCache] = {}; // {val-item}

        this[K.dataCache] = null; // last query result for data
      } //-------------------------------------------
      // Utility
      //-------------------------------------------

    }, {
      key: "findItem",
      value: function findItem(val) {
        var list = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

        var _iterator50 = _createForOfIteratorHelper(list),
            _step50;

        try {
          for (_iterator50.s(); !(_step50 = _iterator50.n()).done;) {
            var it = _step50.value;
            var itV = this.getValue(it);

            if (_.isEqual(val, itV)) {
              return it;
            }
          }
        } catch (err) {
          _iterator50.e(err);
        } finally {
          _iterator50.f();
        }
      } //-------------------------------------------
      // Core Methods
      //-------------------------------------------

    }, {
      key: "getItem",
      value: function () {
        var _getItem = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28(val) {
          var it, loading, _iterator51, _step51, resolve;

          return regeneratorRuntime.wrap(function _callee28$(_context28) {
            while (1) {
              switch (_context28.prev = _context28.next) {
                case 0:
                  if (!Ti.Util.isNil(val)) {
                    _context28.next = 2;
                    break;
                  }

                  return _context28.abrupt("return", null);

                case 2:
                  //console.log("Dict.getItem", val)
                  // Match cache
                  it = this[K.itemCache][val]; // Not in cache, try getItem

                  if (!_.isUndefined(it)) {
                    _context28.next = 20;
                    break;
                  }

                  // If is loading, return the promise
                  loading = __item_loading[val];

                  if (!loading) {
                    _context28.next = 9;
                    break;
                  }

                  _context28.next = 8;
                  return new Promise(function (resolve) {
                    loading.push(resolve);
                  });

                case 8:
                  return _context28.abrupt("return", _context28.sent);

                case 9:
                  // Setup loading
                  loading = [];
                  __item_loading[val] = loading; // Do load item ...
                  //console.log("getItem", val)

                  this.doHooks(true);
                  _context28.next = 14;
                  return this.invokeAsync("item", val);

                case 14:
                  it = _context28.sent;
                  this.doHooks(false);
                  this.addItemToCache(it, val); // Release loading

                  _iterator51 = _createForOfIteratorHelper(loading);

                  try {
                    for (_iterator51.s(); !(_step51 = _iterator51.n()).done;) {
                      resolve = _step51.value;
                      resolve(it || null);
                    }
                  } catch (err) {
                    _iterator51.e(err);
                  } finally {
                    _iterator51.f();
                  }

                  delete __item_loading[val];

                case 20:
                  if (!this.isShadowed()) {
                    _context28.next = 22;
                    break;
                  }

                  return _context28.abrupt("return", _.cloneDeep(it));

                case 22:
                  return _context28.abrupt("return", it);

                case 23:
                case "end":
                  return _context28.stop();
              }
            }
          }, _callee28, this);
        }));

        function getItem(_x19) {
          return _getItem.apply(this, arguments);
        }

        return getItem;
      }() //-------------------------------------------

    }, {
      key: "getData",
      value: function () {
        var _getData = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29() {
          var _this20 = this;

          var force,
              list,
              _args35 = arguments;
          return regeneratorRuntime.wrap(function _callee29$(_context29) {
            while (1) {
              switch (_context29.prev = _context29.next) {
                case 0:
                  force = _args35.length > 0 && _args35[0] !== undefined ? _args35[0] : false;
                  list = this[K.dataCache];

                  if (!(force || _.isEmpty(list))) {
                    _context29.next = 10;
                    break;
                  }

                  this.doHooks(true);
                  _context29.next = 6;
                  return this.invokeAsync("data");

                case 6:
                  list = _context29.sent;
                  this.doHooks(false); // Cache items

                  _.forEach(list, function (it, index) {
                    if (!_.isPlainObject(it)) {
                      it = {
                        text: it,
                        value: it
                      };
                      list[index] = it;
                    }

                    _this20.addItemToCache(it);
                  }); // Cache list


                  this[K.dataCache] = list;

                case 10:
                  if (!this.isShadowed()) {
                    _context29.next = 12;
                    break;
                  }

                  return _context29.abrupt("return", _.cloneDeep(list) || []);

                case 12:
                  return _context29.abrupt("return", list || []);

                case 13:
                case "end":
                  return _context29.stop();
              }
            }
          }, _callee29, this);
        }));

        function getData() {
          return _getData.apply(this, arguments);
        }

        return getData;
      }() //-------------------------------------------

    }, {
      key: "queryData",
      value: function () {
        var _queryData = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30(str) {
          var _this21 = this;

          var list;
          return regeneratorRuntime.wrap(function _callee30$(_context30) {
            while (1) {
              switch (_context30.prev = _context30.next) {
                case 0:
                  if (str) {
                    _context30.next = 4;
                    break;
                  }

                  _context30.next = 3;
                  return this.getData();

                case 3:
                  return _context30.abrupt("return", _context30.sent);

                case 4:
                  // Find by string
                  this.doHooks(true);
                  _context30.next = 7;
                  return this.invokeAsync("query", str);

                case 7:
                  list = _context30.sent;
                  this.doHooks(false); // Cache items

                  _.forEach(list, function (it) {
                    _this21.addItemToCache(it);
                  });

                  if (!this.isShadowed()) {
                    _context30.next = 12;
                    break;
                  }

                  return _context30.abrupt("return", _.cloneDeep(list) || []);

                case 12:
                  return _context30.abrupt("return", list || []);

                case 13:
                case "end":
                  return _context30.stop();
              }
            }
          }, _callee30, this);
        }));

        function queryData(_x20) {
          return _queryData.apply(this, arguments);
        }

        return queryData;
      }() //-------------------------------------------

    }, {
      key: "getValue",
      value: function getValue(it) {
        return this.invoke("getValue", it);
      }
    }, {
      key: "getText",
      value: function getText(it) {
        return this.invoke("getText", it);
      }
    }, {
      key: "getIcon",
      value: function getIcon(it) {
        return this.invoke("getIcon", it);
      }
    }, {
      key: "isMatched",
      value: function isMatched(it, v) {
        return this.invoke("isMatched", it, v);
      } //-------------------------------------------

    }, {
      key: "getBy",
      value: function getBy() {
        var vKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ".text";
        var it = arguments.length > 1 ? arguments[1] : undefined;
        var dft = arguments.length > 2 ? arguments[2] : undefined;

        // Text
        if (!vKey || ".text" == vKey) {
          return this.getText(it);
        } // Icon


        if (".icon" == vKey) {
          return this.getIcon(it);
        } // Value


        if (".value" == vKey) {
          return this.getValue(it);
        } // Other key


        return Ti.Util.fallback(Ti.Util.getOrPick(it, vKey), dft, this.getValue(it));
      } //-------------------------------------------

    }, {
      key: "checkItem",
      value: function () {
        var _checkItem = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31(val) {
          var it;
          return regeneratorRuntime.wrap(function _callee31$(_context31) {
            while (1) {
              switch (_context31.prev = _context31.next) {
                case 0:
                  _context31.next = 2;
                  return this.getItem(val);

                case 2:
                  it = _context31.sent;

                  if (it) {
                    _context31.next = 5;
                    break;
                  }

                  throw Ti.Err.make("e.dict.no-item", {
                    dictName: dictName,
                    val: val
                  });

                case 5:
                  return _context31.abrupt("return", it);

                case 6:
                case "end":
                  return _context31.stop();
              }
            }
          }, _callee31, this);
        }));

        function checkItem(_x21) {
          return _checkItem.apply(this, arguments);
        }

        return checkItem;
      }() //-------------------------------------------

    }, {
      key: "getItemText",
      value: function () {
        var _getItemText = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee32(val) {
          var it;
          return regeneratorRuntime.wrap(function _callee32$(_context32) {
            while (1) {
              switch (_context32.prev = _context32.next) {
                case 0:
                  _context32.next = 2;
                  return this.getItem(val);

                case 2:
                  it = _context32.sent;

                  if (!it) {
                    _context32.next = 5;
                    break;
                  }

                  return _context32.abrupt("return", this.getText(it));

                case 5:
                case "end":
                  return _context32.stop();
              }
            }
          }, _callee32, this);
        }));

        function getItemText(_x22) {
          return _getItemText.apply(this, arguments);
        }

        return getItemText;
      }() //-------------------------------------------

    }, {
      key: "getItemIcon",
      value: function () {
        var _getItemIcon = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee33(val) {
          var it;
          return regeneratorRuntime.wrap(function _callee33$(_context33) {
            while (1) {
              switch (_context33.prev = _context33.next) {
                case 0:
                  _context33.next = 2;
                  return this.getItem(val);

                case 2:
                  it = _context33.sent;

                  if (!it) {
                    _context33.next = 5;
                    break;
                  }

                  return _context33.abrupt("return", this.getIcon(it));

                case 5:
                case "end":
                  return _context33.stop();
              }
            }
          }, _callee33, this);
        }));

        function getItemIcon(_x23) {
          return _getItemIcon.apply(this, arguments);
        }

        return getItemIcon;
      }() //-------------------------------------------

    }, {
      key: "getItemAs",
      value: function () {
        var _getItemAs = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee34(vKey, val) {
          var it;
          return regeneratorRuntime.wrap(function _callee34$(_context34) {
            while (1) {
              switch (_context34.prev = _context34.next) {
                case 0:
                  _context34.next = 2;
                  return this.getItem(val);

                case 2:
                  it = _context34.sent;

                  if (!it) {
                    _context34.next = 5;
                    break;
                  }

                  return _context34.abrupt("return", this.getBy(vKey, it, val));

                case 5:
                case "end":
                  return _context34.stop();
              }
            }
          }, _callee34, this);
        }));

        function getItemAs(_x24, _x25) {
          return _getItemAs.apply(this, arguments);
        }

        return getItemAs;
      }() //-------------------------------------------

    }]);

    return Dict;
  }(); ///////////////////////////////////////////////


  var DICTS = {}; ///////////////////////////////////////////////

  var DictFactory = {
    //-------------------------------------------
    DictReferName: function DictReferName(str) {
      if (_.isString(str)) {
        var _m13 = /^(@Dict:|#)(.+)$/.exec(str);

        if (_m13) {
          return _.trim(_m13[2]);
        }
      }
    },
    //-------------------------------------------
    GetOrCreate: function GetOrCreate() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var _ref123 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          hooks = _ref123.hooks,
          name = _ref123.name;

      var d; // Aready a dict

      if (options.data instanceof Dict) {
        d = options.data;
      } // Pick by Name
      else {
          var _dictName = name || DictFactory.DictReferName(options.data);

          if (_dictName) {
            d = DICTS[_dictName];
          }
        } // Try return 


      if (d) {
        if (hooks) {
          d = d.duplicate({
            hooks: false
          });
          d.addHooks(hooks);
        }

        return d;
      } // Create New One


      return DictFactory.CreateDict(options, {
        hooks: hooks,
        name: name
      });
    },
    //-------------------------------------------
    CreateDict: function CreateDict() {
      var _ref124 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          data = _ref124.data,
          query = _ref124.query,
          item = _ref124.item,
          getValue = _ref124.getValue,
          getText = _ref124.getText,
          getIcon = _ref124.getIcon,
          isMatched = _ref124.isMatched,
          shadowed = _ref124.shadowed;

      var _ref125 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          hooks = _ref125.hooks,
          name = _ref125.name;

      //console.log("CreateDict", {data, query, item})
      //.........................................
      if (_.isString(data) || _.isArray(data)) {
        var _aryData = Ti.S.toObjList(data);

        data = function data() {
          return _aryData;
        };
      } // Default data
      else if (!data) {
          data = function data() {
            return [];
          };
        } //.........................................


      if (!item) {
        item = /*#__PURE__*/function () {
          var _ref126 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee35(val, $dict) {
            var aryData, _iterator52, _step52, it, itV;

            return regeneratorRuntime.wrap(function _callee35$(_context35) {
              while (1) {
                switch (_context35.prev = _context35.next) {
                  case 0:
                    _context35.next = 2;
                    return $dict.getData();

                  case 2:
                    aryData = _context35.sent;
                    _iterator52 = _createForOfIteratorHelper(aryData);
                    _context35.prev = 4;

                    _iterator52.s();

                  case 6:
                    if ((_step52 = _iterator52.n()).done) {
                      _context35.next = 13;
                      break;
                    }

                    it = _step52.value;
                    itV = $dict.getValue(it); //if(_.isEqual(itV, val)) {

                    if (!(itV == val || _.isEqual(itV, val))) {
                      _context35.next = 11;
                      break;
                    }

                    return _context35.abrupt("return", it);

                  case 11:
                    _context35.next = 6;
                    break;

                  case 13:
                    _context35.next = 18;
                    break;

                  case 15:
                    _context35.prev = 15;
                    _context35.t0 = _context35["catch"](4);

                    _iterator52.e(_context35.t0);

                  case 18:
                    _context35.prev = 18;

                    _iterator52.f();

                    return _context35.finish(18);

                  case 21:
                  case "end":
                    return _context35.stop();
                }
              }
            }, _callee35, null, [[4, 15, 18, 21]]);
          }));

          return function item(_x26, _x27) {
            return _ref126.apply(this, arguments);
          };
        }();
      } //.........................................


      if (!query) {
        query = /*#__PURE__*/function () {
          var _ref127 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee36(v, $dict) {
            var aryData, list, _iterator53, _step53, it;

            return regeneratorRuntime.wrap(function _callee36$(_context36) {
              while (1) {
                switch (_context36.prev = _context36.next) {
                  case 0:
                    _context36.next = 2;
                    return $dict.getData();

                  case 2:
                    aryData = _context36.sent;
                    list = [];
                    _iterator53 = _createForOfIteratorHelper(aryData);

                    try {
                      for (_iterator53.s(); !(_step53 = _iterator53.n()).done;) {
                        it = _step53.value;

                        if ($dict.isMatched(it, v)) {
                          list.push(it);
                        }
                      }
                    } catch (err) {
                      _iterator53.e(err);
                    } finally {
                      _iterator53.f();
                    }

                    return _context36.abrupt("return", list);

                  case 7:
                  case "end":
                    return _context36.stop();
                }
              }
            }, _callee36);
          }));

          return function query(_x28, _x29) {
            return _ref127.apply(this, arguments);
          };
        }();
      } //.........................................
      // if(!isMatched) {
      //   isMatched = (it, v, $dict)=>{
      //     let itV = $dict.getValue(it)
      //     return _.isEqual(itV, v)
      //   }
      // }
      //.........................................


      var d = new Dict();
      d.setFunc({
        data: data,
        query: query,
        item: item,
        getValue: getValue,
        getText: getText,
        getIcon: getIcon,
        isMatched: isMatched
      }); //.........................................

      if (name) {
        DICTS[name] = d;
      } //.........................................


      if (shadowed) {
        d.setShadowed(shadowed);
      } //.........................................


      if (hooks) {
        d.addHooks(hooks);
      }

      return d;
    },
    //-------------------------------------------

    /***
     * @param name{String} : Dict name in cache
     * @param shadowed{Boolean} : Create the shadown version
     * @param hooks{Array|Function} : add hooks for it
     * ```
     * @return {Ti.Dict}
     */
    GetDict: function GetDict(name, hooks) {
      // Try get
      var d = DICTS[name]; // Return shadowed ? 

      if (d && hooks) {
        d = d.duplicate({
          hooks: false
        });
        d.addHooks(hooks);
      }

      return d;
    },
    //-------------------------------------------
    CheckDict: function CheckDict(name, hooks) {
      var d = DictFactory.GetDict(name, hooks);

      if (d) {
        return d;
      }

      throw "e.dict.noexists : ".concat(name);
    },
    //-------------------------------------------
    explainDictName: function explainDictName(dictName) {
      var re = {};
      var m = /^([^:]+)(:(.+))?$/.exec(dictName);

      if (m) {
        re.name = m[1];
        re.vkey = m[3];
      }

      return re;
    },
    //-------------------------------------------

    /***
     * @param dName{String} : like `Sexes:.icon`
     */
    getBy: function getBy(dName, val) {
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee37() {
        var _DictFactory$explainD, name, vKey, $dict;

        return regeneratorRuntime.wrap(function _callee37$(_context37) {
          while (1) {
            switch (_context37.prev = _context37.next) {
              case 0:
                if (!Ti.Util.isNil(val)) {
                  _context37.next = 2;
                  break;
                }

                return _context37.abrupt("return", val);

              case 2:
                // Check if the name indicate the itemValueKey
                _DictFactory$explainD = DictFactory.explainDictName(dName), name = _DictFactory$explainD.name, vKey = _DictFactory$explainD.vKey;
                $dict = DictFactory.CheckDict(name);
                _context37.next = 6;
                return $dict.getItemAs(vKey, val);

              case 6:
                return _context37.abrupt("return", _context37.sent);

              case 7:
              case "end":
                return _context37.stop();
            }
          }
        }, _callee37);
      }))();
    },
    //-------------------------------------------
    getAll: function getAll(dictName) {
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee38() {
        var $dict;
        return regeneratorRuntime.wrap(function _callee38$(_context38) {
          while (1) {
            switch (_context38.prev = _context38.next) {
              case 0:
                _context38.prev = 0;
                $dict = DictFactory.CheckDict(dictName);
                _context38.next = 4;
                return $dict.getData();

              case 4:
                return _context38.abrupt("return", _context38.sent);

              case 7:
                _context38.prev = 7;
                _context38.t0 = _context38["catch"](0);
                console.error("e.dict.getAll : ".concat(dictName), _context38.t0);

              case 10:
              case "end":
                return _context38.stop();
            }
          }
        }, _callee38, null, [[0, 7]]);
      }))();
    },
    //-------------------------------------------
    getText: function getText(dictName, val) {
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee39() {
        var $dict;
        return regeneratorRuntime.wrap(function _callee39$(_context39) {
          while (1) {
            switch (_context39.prev = _context39.next) {
              case 0:
                _context39.prev = 0;
                $dict = DictFactory.CheckDict(dictName);
                _context39.next = 4;
                return $dict.getItemText(val);

              case 4:
                return _context39.abrupt("return", _context39.sent);

              case 7:
                _context39.prev = 7;
                _context39.t0 = _context39["catch"](0);
                console.error("e.dict.getText : ".concat(dictName), _context39.t0);

              case 10:
              case "end":
                return _context39.stop();
            }
          }
        }, _callee39, null, [[0, 7]]);
      }))();
    },
    //-------------------------------------------
    getIcon: function getIcon(dictName, val) {
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee40() {
        var $dict;
        return regeneratorRuntime.wrap(function _callee40$(_context40) {
          while (1) {
            switch (_context40.prev = _context40.next) {
              case 0:
                _context40.prev = 0;
                $dict = DictFactory.CheckDict(dictName);
                _context40.next = 4;
                return $dict.getItemIcon(val);

              case 4:
                return _context40.abrupt("return", _context40.sent);

              case 7:
                _context40.prev = 7;
                _context40.t0 = _context40["catch"](0);
                console.error("e.dict.getIcon : ".concat(dictName), _context40.t0);

              case 10:
              case "end":
                return _context40.stop();
            }
          }
        }, _callee40, null, [[0, 7]]);
      }))();
    } //-------------------------------------------

  }; ///////////////////////////////////////////////

  return {
    Dict: Dict,
    DictFactory: DictFactory
  };
}(),
    Dict = _ref121.Dict,
    DictFactory = _ref121.DictFactory; //##################################################
// # import {VueEventBubble} from "./vue/vue-event-bubble.mjs"


var _ref128 = function () {
  ///////////////////////////////////////////////////
  var TryBubble = function TryBubble(vm, event) {
    var stop = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    if (vm.$parent && !stop) {
      var _vm$$parent;

      // Customized bubble
      if (_.isFunction(vm.__before_bubble)) {
        event = vm.__before_bubble(event) || event;
      } // Notify parent


      (_vm$$parent = vm.$parent).$notify.apply(_vm$$parent, [event.name].concat(_toConsumableArray(event.args)));
    }
  }; ///////////////////////////////////////////////////


  var Notify = function Notify(name) {
    for (var _len35 = arguments.length, args = new Array(_len35 > 1 ? _len35 - 1 : 0), _key37 = 1; _key37 < _len35; _key37++) {
      args[_key37 - 1] = arguments[_key37];
    }

    // if(name.endsWith("select"))
    //   console.log("Notify:", 
    //   `${_.padStart(name, 30, '~')} @ <${_.padEnd(this.tiComId, 15, ' ')}>`,
    //   args)
    // Prepare the return object, if stop=true will cancel the bubble
    var event = {
      name: name,
      args: args
    };
    var stop = false;
    var handler; // Handle by customized dispatcher

    if (_.isFunction(this.__on_events)) {
      handler = this.__on_events.apply(this, [name].concat(args));
    } // Handle by Vue primary listeners


    if (!_.isFunction(handler)) {
      handler = _.get(this.$listeners, name);
    } // Then try fallback


    if (!_.isFunction(handler)) {
      var canNames = _.split(name, "::");

      while (canNames.length > 1) {
        var _canNames = canNames,
            _canNames2 = _toArray(_canNames),
            names = _canNames2.slice(1);

        var hdName = names.join("::");
        handler = _.get(this.$listeners, hdName);

        if (_.isFunction(handler)) {
          break;
        }

        canNames = names;
      }
    } // Invoke handler or bubble the event


    if (_.isFunction(handler)) {
      // If find a event handler, dont't bubble it
      // unless the handler tell me to bubble by return:
      //  - true/false
      //  - {stop:false}
      // If return undefined, treat it as {stop:true}
      var _reo2 = handler.apply(void 0, _toConsumableArray(event.args));

      stop = true; // handler indicate the stop bubble

      if (_.isBoolean(_reo2)) {
        stop = _reo2;
      } // {stop:true}
      else if (_reo2 && _.isBoolean(_reo2.stop)) {
          stop = _reo2.stop;
        } // Try bubble


      TryBubble(this, event, stop);
    } // Then bubble it
    else {
        TryBubble(this, event);
      }
  }; ///////////////////////////////////////////////////


  var VueEventBubble = {
    install: function install(Vue) {
      var _ref129 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref129$overrideEmit = _ref129.overrideEmit,
          overrideEmit = _ref129$overrideEmit === void 0 ? false : _ref129$overrideEmit;

      // Append the methods
      _.assign(Vue.prototype, {
        $notify: Notify
      }); // Override emit


      if (overrideEmit) {
        Vue.mixin({
          created: function created() {
            this.$emit = Notify;
          }
        });
      }
    }
  };
  return {
    VueEventBubble: VueEventBubble
  };
}(),
    VueEventBubble = _ref128.VueEventBubble; //##################################################
// # import {VueTiCom} from "./vue/vue-ti-com.mjs"


var _ref130 = function () {
  /////////////////////////////////////////////////////
  var TiComMixin = {
    inheritAttrs: false,
    ///////////////////////////////////////////////////
    computed: _objectSpread({}, Vuex.mapGetters("viewport", ["viewportMode", "viewportActivedComIds", "isViewportModeDesktop", "isViewportModeTablet", "isViewportModePhone", "isViewportModeDesktopOrTablet", "isViewportModePhoneOrTablet"]), {
      //-----------------------------------------------
      // Auto assign component ID
      tiComId: function tiComId() {
        return "".concat(this._uid, ":").concat(this.tiComType);
      },
      //-----------------------------------------------
      // Auto detected current com is actived or not.
      isActived: function isActived() {
        return _.indexOf(this.viewportActivedComIds, this.tiComId) >= 0;
      },
      //-----------------------------------------------
      isSelfActived: function isSelfActived() {
        return _.last(this.viewportActivedComIds) == this.tiComId;
      },
      //-----------------------------------------------
      getTopClass: function getTopClass() {
        var _this22 = this;

        return function () {
          for (var _len36 = arguments.length, klass = new Array(_len36), _key38 = 0; _key38 < _len36; _key38++) {
            klass[_key38] = arguments[_key38];
          }

          return Ti.Css.mergeClassName({
            "is-self-actived": _this22.isSelfActived,
            "is-actived": _this22.isActived
          }, klass, _this22.className);
        };
      } //-----------------------------------------------

    }),
    ///////////////////////////////////////////////////
    props: {
      "className": undefined,
      "onInit": undefined,
      "onReady": undefined
    },
    ///////////////////////////////////////////////////
    created: function () {
      var _created = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee41() {
        return regeneratorRuntime.wrap(function _callee41$(_context41) {
          while (1) {
            switch (_context41.prev = _context41.next) {
              case 0:
                //...............................................
                // Auto invoke the callback
                if (_.isFunction(this.onInit)) {
                  this.onInit(this);
                } //...............................................


              case 1:
              case "end":
                return _context41.stop();
            }
          }
        }, _callee41, this);
      }));

      function created() {
        return _created.apply(this, arguments);
      }

      return created;
    }(),
    ///////////////////////////////////////////////////
    mounted: function mounted() {
      if (_.isFunction(this.onReady)) {
        this.onReady(this);
      }
    },
    ///////////////////////////////////////////////////
    beforeDestroyed: function beforeDestroyed() {
      //console.log("destroyed", this.$el)
      Ti.App(this).setBlurredVm(this);
    } ///////////////////////////////////////////////////

  }; /////////////////////////////////////////////////////

  var TiComMethods = {
    //-----------------------------------------------
    // Auto count my useful id path array
    tiActivableComIdPath: function tiActivableComIdPath() {
      var parentFirst = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var list = this.tiActivableComPath(parentFirst);
      return _.map(list, function (vm) {
        return vm.tiComId;
      });
    },
    //-----------------------------------------------
    // Auto count my useful id path array
    tiActivableComPath: function tiActivableComPath() {
      var parentFirst = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var list = [this];
      var vm = this.$parent;

      while (vm) {
        // Only the `v-ti-actived` marked Com join the parent paths
        if (vm.__ti_activable__) {
          list.push(vm);
        } // Look up


        vm = vm.$parent;
      }

      if (parentFirst) list.reverse();
      return list;
    },
    //-----------------------------------------------
    // Auto get the parent activable component
    tiParentActivableCom: function tiParentActivableCom() {
      var $pvm = this.$parent;

      while ($pvm && !$pvm.__ti_activable__) {
        $pvm = $pvm.$parent;
      }

      return $pvm;
    },
    //-----------------------------------------------
    setActived: function setActived() {
      if (!this.isSelfActived) {
        //console.log("I am actived", this)
        Ti.App(this).setActivedVm(this); //this.$notify("com:actived", this)
      }
    } //-----------------------------------------------

  }; /////////////////////////////////////////////////////

  var VueTiCom = {
    install: function install(Vue) {
      //...............................................
      // Mixins
      Vue.mixin(TiComMixin); //...............................................
      // Methods

      _.assign(Vue.prototype, TiComMethods); //...............................................
      // Filter: i18n


      Vue.filter("i18n", function (val) {
        var vars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (/^i18n:(.+)/.test(val)) {
          return Ti.I18n.textf(val, vars);
        }

        return Ti.I18n.getf(val, vars);
      }); // Filter: percent

      Vue.filter("percent", function (val) {
        var fixed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
        var auto = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        return Ti.S.toPercent(val * 1, {
          fixed: fixed,
          auto: auto
        });
      }); // Filter: percent

      Vue.filter("float", function (val) {
        var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
        var dft = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.0;
        return Ti.Types.toFloat(val, {
          precision: precision,
          dft: dft
        });
      }); //...............................................
      // Directive: v-drop-files
      //  - value : f() | [f(), "i18n:mask-tip"]
      //  - modifiers : {
      //      mask : Auto show DIV.ti-drag-mask
      //    }

      Vue.directive("dropFiles", {
        bind: function bind($el, binding) {
          //console.log("drop-files bind", $el, binding)
          // Preparent Handler / Mask Content
          var handler = null;
          var maskHtml = null;
          var showMask = binding.modifiers.mask;

          if (_.isArray(binding.value)) {
            handler = binding.value.length > 0 ? binding.value[0] : null;
            maskHtml = binding.value.length > 1 ? binding.value[1] : null;
          } // Directly function
          else if (_.isFunction(binding.value)) {
              handler = binding.value;
            }

          if (showMask) {
            maskHtml = Ti.I18n.text(maskHtml || "i18n:drop-file-here-to-upload");
          } // Attach Events


          $el.__drag_enter_count = 0;
          $el.addEventListener("dragenter", function (evt) {
            $el.__drag_enter_count++;

            if ($el.__drag_enter_count == 1) {
              //console.log(">>>>>>>>>>>> enter")
              $el.setAttribute("ti-is-drag", "");

              if (showMask) {
                $el.$ti_drag_mask = Ti.Dom.createElement({
                  className: "ti-drag-mask",
                  $p: $el
                });
                $el.$ti_drag_mask.innerHTML = "<span>".concat(maskHtml, "</span>");
              }
            }
          });
          $el.addEventListener("dragover", function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
          });
          $el.addEventListener("dragleave", function (evt) {
            $el.__drag_enter_count--;

            if ($el.__drag_enter_count <= 0) {
              //console.log("<<<<<<<<<<<<< leave")
              $el.removeAttribute("ti-is-drag");

              if ($el.$ti_drag_mask) {
                Ti.Dom.remove($el.$ti_drag_mask);
                delete $el.$ti_drag_mask;
              }
            }
          });
          $el.addEventListener("drop", function (evt) {
            evt.preventDefault();
            evt.stopPropagation(); //console.log("drop:", evt.dataTransfer.files)
            //..........................
            // reset drag tip

            $el.__drag_enter_count = 0;
            $el.removeAttribute("ti-is-drag");

            if ($el.$ti_drag_mask) {
              Ti.Dom.remove($el.$ti_drag_mask);
              delete $el.$ti_drag_mask;
            } //..........................


            if (_.isFunction(handler)) {
              handler(evt.dataTransfer.files);
            } //..........................

          });
        }
      }); // ~ Vue.directive("dropFiles", {
      //...............................................
      // Directive: v-drop-off

      Vue.directive("dropOff", {
        bind: function bind($el, binding) {
          // console.log("drop-off bind", $el, binding)
          $el.addEventListener("dragover", function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
          });
          $el.addEventListener("drop", function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
          });
        }
      }); // ~ Vue.directive("dropOff"
      //...............................................
      // Directive: v-drag-off

      Vue.directive("dragOff", {
        bind: function bind($el, binding) {
          // console.log("drop-off bind", $el, binding)
          $el.addEventListener("dragstart", function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
          });
        }
      }); // ~ Vue.directive("dragOff"
      //...............................................
      // Directive: v-ti-on-actived="this"

      Vue.directive("tiActivable", {
        bind: function bind($el, _ref131, _ref132) {
          var value = _ref131.value;
          var context = _ref132.context;
          var vm = context;
          vm.__ti_activable__ = true;
          $el.addEventListener("click", function (evt) {
            if (!evt.__ti_activable_used__) {
              evt.__ti_activable_used__ = true; //console.log(vm.tiComId, evt)

              vm.setActived();
            }
          });
        }
      }); //...............................................
    }
  }; /////////////////////////////////////////////////////

  return {
    VueTiCom: VueTiCom
  };
}(),
    VueTiCom = _ref130.VueTiCom; //---------------------------------------
//##################################################
// # import {WalnutAppMain} from "./ti-walnut-app-main.mjs"


var _ref133 = function () {
  ///////////////////////////////////////////////
  function WalnutAppMain() {
    return _WalnutAppMain.apply(this, arguments);
  } ///////////////////////////////////////////////


  function _WalnutAppMain() {
    _WalnutAppMain = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee42() {
      var _ref134,
          _ref134$rs,
          rs,
          _ref134$appName,
          appName,
          _ref134$preloads,
          preloads,
          _ref134$debug,
          debug,
          _ref134$logging,
          logging,
          _ref134$shortcute,
          shortcute,
          _ref134$viewport,
          viewport,
          pres,
          tiConf,
          exCssList,
          _iterator54,
          _step54,
          css,
          cssPath,
          appInfo,
          _pres,
          pxs,
          _iterator55,
          _step55,
          key,
          val,
          mod,
          app,
          basePath,
          _args48 = arguments;

      return regeneratorRuntime.wrap(function _callee42$(_context42) {
        while (1) {
          switch (_context42.prev = _context42.next) {
            case 0:
              _ref134 = _args48.length > 0 && _args48[0] !== undefined ? _args48[0] : {}, _ref134$rs = _ref134.rs, rs = _ref134$rs === void 0 ? "/gu/rs/" : _ref134$rs, _ref134$appName = _ref134.appName, appName = _ref134$appName === void 0 ? "wn.manager" : _ref134$appName, _ref134$preloads = _ref134.preloads, preloads = _ref134$preloads === void 0 ? [] : _ref134$preloads, _ref134$debug = _ref134.debug, debug = _ref134$debug === void 0 ? false : _ref134$debug, _ref134$logging = _ref134.logging, logging = _ref134$logging === void 0 ? {
                root: "warn"
              } : _ref134$logging, _ref134$shortcute = _ref134.shortcute, shortcute = _ref134$shortcute === void 0 ? false : _ref134$shortcute, _ref134$viewport = _ref134.viewport, viewport = _ref134$viewport === void 0 ? {
                phoneMaxWidth: 540,
                tabletMaxWidth: 768,
                designWidth: 1000,
                max: 100,
                min: 80
              } : _ref134$viewport;
              //---------------------------------------
              Ti.AddResourcePrefix(rs); //---------------------------------------

              Vue.use(Ti.Vue.EventBubble);
              Vue.use(Ti.Vue.TiCom); //---------------------------------------

              Ti.SetForDev(debug); //---------------------------------------

              Ti.SetLogLevel(logging.root);

              _.forEach(logging.names, function (v, k) {
                return Ti.SetLogLevel(k, v);
              }); //---------------------------------------


              if (shortcute) {
                Ti.Shortcut.startListening();
              } //---------------------------------------


              if (viewport) {
                Ti.Viewport.startListening();
              } //---------------------------------------
              // Save current app name


              Ti.SetAppName(appName); //---------------------------------------
              // Set default Config Setting

              Ti.Config.set({
                prefix: {
                  "app": "/a/load/",
                  "MyApp": "/a/load/".concat(appName, "/"),
                  "theme": "".concat(rs, "ti/theme/"),
                  "lib": "".concat(rs, "ti/lib/"),
                  "deps": "".concat(rs, "ti/deps/"),
                  "dist": "".concat(rs, "ti/dist/"),
                  "mod": "".concat(rs, "ti/mod/"),
                  "com": "".concat(rs, "ti/com/"),
                  "i18n": "".concat(rs, "ti/i18n/")
                },
                alias: {
                  "^\./": "@MyApp:",
                  "^@MyApp:?$": "@MyApp:_app.json",
                  "^@i18n:(.+)$": "@i18n:zh-cn/$1",
                  "\/i18n\/": "\/i18n\/zh-cn/",
                  "^(@[A-Za-z]+):i18n/(.+)$": "$1:i18n/zh-cn/$2"
                },
                suffix: {
                  "^@theme:": ".css",
                  "^@app:": "/_app.json",
                  "(^@mod:|[\/:]mod\/)": "/_mod.json",
                  "(^@com:|[\/:]com\/)": "/_com.json",
                  "(^@i18n:|[\/:]i18n\/)": ".i18n.json"
                },
                lang: "zh-cn"
              }); //---------------------------------------
              // Preload resources

              if (_.isEmpty(preloads)) {
                _context42.next = 16;
                break;
              }

              pres = [];

              _.forEach(preloads, function (url) {
                pres.push(Ti.Load(url));
              });

              _context42.next = 16;
              return Promise.all(pres);

            case 16:
              _context42.t0 = Ti.I18n;
              _context42.next = 19;
              return Ti.Load(["@i18n:_ti", "@i18n:_wn", "@i18n:_net"]);

            case 19:
              _context42.t1 = _context42.sent;

              _context42.t0.put.call(_context42.t0, _context42.t1);

              _context42.next = 23;
              return Wn.Sys.exec("ti config -cqn", {
                appName: appName,
                as: "json"
              });

            case 23:
              tiConf = _context42.sent;

              if (!_.isEmpty(tiConf)) {
                Ti.Config.update(tiConf);
              } //---------------------------------------
              // join customized i18n


              if (!tiConf.i18n) {
                _context42.next = 31;
                break;
              }

              _context42.t2 = Ti.I18n;
              _context42.next = 29;
              return Ti.Load(tiConf.i18n);

            case 29:
              _context42.t3 = _context42.sent;

              _context42.t2.put.call(_context42.t2, _context42.t3);

            case 31:
              if (!tiConf.css) {
                _context42.next = 51;
                break;
              }

              exCssList = [].concat(tiConf.css);
              _iterator54 = _createForOfIteratorHelper(exCssList);
              _context42.prev = 34;

              _iterator54.s();

            case 36:
              if ((_step54 = _iterator54.n()).done) {
                _context42.next = 43;
                break;
              }

              css = _step54.value;
              cssPath = _.template(css)({
                theme: "${theme}"
              });
              _context42.next = 41;
              return Ti.Load(cssPath);

            case 41:
              _context42.next = 36;
              break;

            case 43:
              _context42.next = 48;
              break;

            case 45:
              _context42.prev = 45;
              _context42.t4 = _context42["catch"](34);

              _iterator54.e(_context42.t4);

            case 48:
              _context42.prev = 48;

              _iterator54.f();

              return _context42.finish(48);

            case 51:
              _context42.next = 53;
              return Ti.Load("@MyApp");

            case 53:
              appInfo = _context42.sent;

              //---------------------------------------
              // Merge customized GUI setting in "data"
              _.assign(appInfo.data, tiConf.gui); //---------------------------------------
              // Append exetend components


              if (!_.isEmpty(tiConf.components)) {
                Ti.Util.pushUniqValue(appInfo, "components", tiConf.components);
              } //---------------------------------------
              // Join the customized-deps


              if (!_.isEmpty(tiConf.deps)) {
                Ti.Util.pushUniqValue(appInfo, "deps", tiConf.deps);
              } //---------------------------------------
              // Customized preload


              if (_.isEmpty(tiConf.preloads)) {
                _context42.next = 62;
                break;
              }

              _pres = [];

              _.forEach(tiConf.preloads, function (url) {
                _pres.push(Ti.Load(url));
              });

              _context42.next = 62;
              return Promise.all(_pres);

            case 62:
              if (!_.isEmpty(tiConf.rsPrefixes)) {
                pxs = _.concat(tiConf.rsPrefixes);
                Ti.AddResourcePrefix.apply(Ti, _toConsumableArray(pxs));
              } //---------------------------------------
              // Load the global util modules


              _iterator55 = _createForOfIteratorHelper(_.keys(tiConf.global));
              _context42.prev = 64;

              _iterator55.s();

            case 66:
              if ((_step55 = _iterator55.n()).done) {
                _context42.next = 75;
                break;
              }

              key = _step55.value;
              val = tiConf.global[key];
              _context42.next = 71;
              return Ti.Load(val);

            case 71:
              mod = _context42.sent;
              window[key] = mod;

            case 73:
              _context42.next = 66;
              break;

            case 75:
              _context42.next = 80;
              break;

            case 77:
              _context42.prev = 77;
              _context42.t5 = _context42["catch"](64);

              _iterator55.e(_context42.t5);

            case 80:
              _context42.prev = 80;

              _iterator55.f();

              return _context42.finish(80);

            case 83:
              //---------------------------------------
              // Setup dictionaly
              Wn.Dict.setup(tiConf.dictionary); //---------------------------------------
              // Initialize the App

              app = Ti.App(appInfo);
              _context42.next = 87;
              return app.init();

            case 87:
              //---------------------------------------
              Ti.Dom.watchAutoRootFontSize(viewport, function (_ref135) {
                var $root = _ref135.$root,
                    mode = _ref135.mode,
                    fontSize = _ref135.fontSize;
                $root.style.fontSize = fontSize + "px";
                $root.setAttribute("as", mode);
                Ti.App.eachInstance(function (app) {
                  app.commit("viewport/setMode", mode);
                });
              }); //---------------------------------------
              // Load session

              app.commit("session/set", _app.session);
              Wn.Session.setup(_app.session); // Mount app to DOM 

              app.mountTo("#app"); // Ti.Session({
              //   "id"       : _app.session.id,
              //   "uid"      : _app.session.unm,
              //   "name"     : _app.session.unm,
              //   "group"    : _app.session.grp,
              //   "duration" : _app.session.du,
              //   "vars" : _app.session.envs
              // })
              //---------------------------------------
              // Hook the session env changing
              // It will unpdate env each time run command by Wn.Sys.exec
              // Wn.addHook("update_envs", (envs)=>{
              //   Ti.SessionVar(envs)
              // })
              //---------------------------------------

              Ti.App.pushInstance(app); //---------------------------------------
              // Load main data object

              basePath = "~";

              if (_app.obj) {
                basePath = "id:" + _app.obj.id;
              }

              _context42.next = 96;
              return app.dispatch("current/reload", basePath);

            case 96:
              return _context42.abrupt("return", app.get("obj"));

            case 97:
            case "end":
              return _context42.stop();
          }
        }
      }, _callee42, null, [[34, 45, 48, 51], [64, 77, 80, 83]]);
    }));
    return _WalnutAppMain.apply(this, arguments);
  }

  return {
    WalnutAppMain: WalnutAppMain
  };
}(),
    WalnutAppMain = _ref133.WalnutAppMain; //##################################################
// # import {WebAppMain} from "./ti-web-app-main.mjs"


var _ref136 = function () {
  ///////////////////////////////////////////////
  function WebAppMain() {
    return _WebAppMain.apply(this, arguments);
  } ///////////////////////////////////////////////


  function _WebAppMain() {
    _WebAppMain = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee43() {
      var _ref137,
          _ref137$rs,
          rs,
          _ref137$siteRs,
          siteRs,
          _ref137$lang,
          lang,
          appJson,
          siteId,
          domain,
          _ref137$preloads,
          preloads,
          _ref137$debug,
          debug,
          _ref137$logging,
          logging,
          _ref137$shortcute,
          shortcute,
          _ref137$viewport,
          viewport,
          pres,
          exCssList,
          _iterator56,
          _step56,
          css,
          app,
          _args49 = arguments;

      return regeneratorRuntime.wrap(function _callee43$(_context43) {
        while (1) {
          switch (_context43.prev = _context43.next) {
            case 0:
              _ref137 = _args49.length > 0 && _args49[0] !== undefined ? _args49[0] : {}, _ref137$rs = _ref137.rs, rs = _ref137$rs === void 0 ? "/gu/rs/" : _ref137$rs, _ref137$siteRs = _ref137.siteRs, siteRs = _ref137$siteRs === void 0 ? "/" : _ref137$siteRs, _ref137$lang = _ref137.lang, lang = _ref137$lang === void 0 ? "zh-cn" : _ref137$lang, appJson = _ref137.appJson, siteId = _ref137.siteId, domain = _ref137.domain, _ref137$preloads = _ref137.preloads, preloads = _ref137$preloads === void 0 ? [] : _ref137$preloads, _ref137$debug = _ref137.debug, debug = _ref137$debug === void 0 ? false : _ref137$debug, _ref137$logging = _ref137.logging, logging = _ref137$logging === void 0 ? {
                root: "warn"
              } : _ref137$logging, _ref137$shortcute = _ref137.shortcute, shortcute = _ref137$shortcute === void 0 ? false : _ref137$shortcute, _ref137$viewport = _ref137.viewport, viewport = _ref137$viewport === void 0 ? {
                phoneMaxWidth: 640,
                tabletMaxWidth: 900,
                designWidth: 1200,
                max: 100,
                min: 70
              } : _ref137$viewport;
              //---------------------------------------
              Ti.AddResourcePrefix(rs, siteRs); //---------------------------------------

              Vue.use(Ti.Vue.EventBubble);
              Vue.use(Ti.Vue.TiCom); //---------------------------------------

              Ti.SetForDev(debug); //---------------------------------------

              Ti.SetLogLevel(logging.root);

              _.forEach(logging.names, function (v, k) {
                return Ti.SetLogLevel(k, v);
              }); //---------------------------------------


              if (shortcute) {
                Ti.Shortcut.startListening();
              } //---------------------------------------


              if (viewport) {
                Ti.Viewport.startListening();
              } //---------------------------------------
              // Set default Config Setting


              Ti.Config.set({
                prefix: {
                  "Site": "".concat(siteRs),
                  "theme": "".concat(rs, "ti/theme/"),
                  "lib": "".concat(rs, "ti/lib/"),
                  "deps": "".concat(rs, "ti/deps/"),
                  "dist": "".concat(rs, "ti/dist/"),
                  "mod": "".concat(rs, "ti/mod/"),
                  "com": "".concat(rs, "ti/com/"),
                  "i18n": "".concat(rs, "ti/i18n/")
                },
                alias: {
                  "^\./": "@Site:",
                  "^@Site:?$": "@Site:_app.json",
                  "^@i18n:(.+)$": "@i18n:".concat(lang, "/$1"),
                  "[:\/]i18n\/": "$&".concat(lang, "/")
                },
                suffix: {
                  "^@theme:": ".css",
                  "^@app:": "/_app.json",
                  "(^@mod:|[\/:]mod\/)": "/_mod.json",
                  "(^@com:|[\/:]com\/)": "/_com.json",
                  "(^@i18n:|[\/:]i18n\/)": ".i18n.json"
                },
                lang: lang
              }); //---------------------------------------
              // Preload resources

              if (_.isEmpty(preloads)) {
                _context43.next = 15;
                break;
              }

              pres = [];

              _.forEach(preloads, function (url) {
                pres.push(Ti.Load(url));
              });

              _context43.next = 15;
              return Promise.all(pres);

            case 15:
              _context43.t0 = Ti.I18n;
              _context43.next = 18;
              return Ti.Load(["@i18n:_ti", "@i18n:web"]);

            case 18:
              _context43.t1 = _context43.sent;

              _context43.t0.put.call(_context43.t0, _context43.t1);

              if (!appJson.css) {
                _context43.next = 40;
                break;
              }

              exCssList = _.concat(appJson.css);
              _iterator56 = _createForOfIteratorHelper(exCssList);
              _context43.prev = 23;

              _iterator56.s();

            case 25:
              if ((_step56 = _iterator56.n()).done) {
                _context43.next = 32;
                break;
              }

              css = _step56.value;

              if (!css) {
                _context43.next = 30;
                break;
              }

              _context43.next = 30;
              return Ti.Load(css);

            case 30:
              _context43.next = 25;
              break;

            case 32:
              _context43.next = 37;
              break;

            case 34:
              _context43.prev = 34;
              _context43.t2 = _context43["catch"](23);

              _iterator56.e(_context43.t2);

            case 37:
              _context43.prev = 37;

              _iterator56.f();

              return _context43.finish(37);

            case 40:
              _context43.next = 42;
              return Ti.App(appJson);

            case 42:
              app = _context43.sent;
              _context43.next = 45;
              return app.init();

            case 45:
              Ti.App.pushInstance(app); // Save current app name

              Ti.SetAppName(app.name()); // set siteId

              app.commit("setSiteId", siteId);
              app.commit("setDomain", domain); //---------------------------------------

              Ti.Dom.watchAutoRootFontSize(viewport, function (_ref138) {
                var $root = _ref138.$root,
                    mode = _ref138.mode,
                    fontSize = _ref138.fontSize;
                $root.style.fontSize = fontSize + "px";
                $root.setAttribute("as", mode);
                Ti.App.eachInstance(function (app) {
                  app.commit("viewport/setMode", mode);
                });
              }); //---------------------------------------

              app.mountTo("#app"); // Reload the page data

              _context43.next = 53;
              return app.dispatch("reload");

            case 53:
              return _context43.abrupt("return", app);

            case 54:
            case "end":
              return _context43.stop();
          }
        }
      }, _callee43, null, [[23, 34, 37, 40]]);
    }));
    return _WebAppMain.apply(this, arguments);
  }

  return {
    WebAppMain: WebAppMain
  };
}(),
    WebAppMain = _ref136.WebAppMain; //---------------------------------------


var LOAD_CACHE = {};

function Preload(url, anyObj) {
  // if(url.indexOf("label")>0)
  //   console.log("Preloaded", url)
  LOAD_CACHE[url] = anyObj;
} //---------------------------------------


var RS_PREFIXs = [];

function AddResourcePrefix() {
  for (var _len37 = arguments.length, prefixes = new Array(_len37), _key39 = 0; _key39 < _len37; _key39++) {
    prefixes[_key39] = arguments[_key39];
  }

  for (var _i27 = 0, _prefixes = prefixes; _i27 < _prefixes.length; _i27++) {
    var prefix = _prefixes[_i27];

    if (prefix) {
      if (!prefix.endsWith("/")) {
        RS_PREFIXs.push(prefix + "/");
      } else {
        RS_PREFIXs.push(prefix);
      }
    }
  }
} //---------------------------------------


function MatchCache(url) {
  if (!url) {
    return;
  }

  var _iterator57 = _createForOfIteratorHelper(RS_PREFIXs),
      _step57;

  try {
    for (_iterator57.s(); !(_step57 = _iterator57.n()).done;) {
      var prefix = _step57.value;

      if (prefix && url.startsWith(prefix)) {
        url = url.substring(prefix.length);
        break;
      }
    }
  } catch (err) {
    _iterator57.e(err);
  } finally {
    _iterator57.f();
  }

  return LOAD_CACHE[url];
} //---------------------------------------


var ENV = {
  "version": "1.0",
  "dev": false,
  "appName": null,
  "session": {},
  "log": {
    "ROOT": 0
  }
};

function _IS_LOG() {
  var cate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "ROOT";
  var lv = arguments.length > 1 ? arguments[1] : undefined;
  var logc = ENV.log[cate];
  if (_.isUndefined(logc)) logc = ENV.log.ROOT;
  return logc >= lv;
} //---------------------------------------


var LOG_LEVELS = {
  "error": 0,
  "warn": 1,
  "info": 2,
  "debug": 3,
  "trace": 4
}; //---------------------------------------

var G_FUNCS = {}; //---------------------------------------

var Ti = {
  //-----------------------------------------------------
  Alg: Alg,
  Be: Be,
  S: S,
  Util: Util,
  App: App,
  Err: Err,
  Config: Config,
  Dom: Dom,
  Css: Css,
  Load: Load,
  Http: Http,
  Icons: Icons,
  I18n: I18n,
  Shortcut: Shortcut,
  Fuse: Fuse,
  Random: Random,
  Storage: Storage,
  Types: Types,
  Viewport: Viewport,
  WWW: WWW,
  GPS: GPS,
  Validate: Validate,
  DateTime: DateTime,
  Num: Num,
  Trees: Trees,
  Mapping: Mapping,
  Dict: Dict,
  DictFactory: DictFactory,
  Rects: Rects,
  Rect: Rect,
  //-----------------------------------------------------
  Websocket: TiWebsocket,
  //-----------------------------------------------------
  Preload: Preload,
  MatchCache: MatchCache,
  AddResourcePrefix: AddResourcePrefix,
  RS_PREFIXs: RS_PREFIXs,
  LOAD_CACHE: LOAD_CACHE,
  //-----------------------------------------------------
  WalnutAppMain: WalnutAppMain,
  WebAppMain: WebAppMain,
  //-----------------------------------------------------
  Vue: {
    EventBubble: VueEventBubble,
    TiCom: VueTiCom
  },
  //-----------------------------------------------------
  Alert: Alert,
  Confirm: Confirm,
  Prompt: Prompt,
  Toast: Toast,
  Captcha: Captcha,
  //-----------------------------------------------------
  Env: function Env(key, val) {
    return Ti.Util.geset(ENV, key, val);
  },
  //-----------------------------------------------------
  Version: function Version() {
    return Ti.Env("version");
  },
  //-----------------------------------------------------
  SetForDev: function SetForDev() {
    var dev = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    Ti.Env({
      dev: dev
    });
  },
  IsForDev: function IsForDev() {
    return Ti.Env("dev");
  },
  //-----------------------------------------------------
  SetAppName: function SetAppName(appName) {
    Ti.Env({
      appName: appName
    });
  },
  GetAppName: function GetAppName() {
    return Ti.Env("appName");
  },
  //-----------------------------------------------------
  // Session(session) {
  //   return Ti.Util.geset(ENV.session, session)
  // },
  // SessionVar(vars) {
  //   // Whole var set
  //   if(_.isUndefined(vars)) {
  //     return ENV.session.vars || {}
  //   }
  //   // GET
  //   if(_.isString(vars) || _.isArray(vars)){
  //     return Ti.Util.geset(ENV.session.vars, vars)
  //   }
  //   // Setter
  //   ENV.session.vars = ENV.session.vars || {}
  //   return _.assign(ENV.session.vars, vars)
  // },
  //-----------------------------------------------------
  SetLogLevel: function SetLogLevel() {
    var lv = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var cate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "ROOT";
    // Get number by name
    if (_.isString(lv)) lv = LOG_LEVELS[lv] || 0; // Set the level

    ENV.log[cate] = lv;
  },
  IsError: function IsError(cate) {
    return _IS_LOG(cate, LOG_LEVELS.error);
  },
  IsWarn: function IsWarn(cate) {
    return _IS_LOG(cate, LOG_LEVELS.warn);
  },
  IsInfo: function IsInfo(cate) {
    return _IS_LOG(cate, LOG_LEVELS.info);
  },
  IsDebug: function IsDebug(cate) {
    return _IS_LOG(cate, LOG_LEVELS.debug);
  },
  IsTrace: function IsTrace(cate) {
    return _IS_LOG(cate, LOG_LEVELS.trace);
  },
  //-----------------------------------------------------
  Invoke: function Invoke(fn) {
    var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var context = arguments.length > 2 ? arguments[2] : undefined;

    if (_.isFunction(fn)) {
      context = context || this;
      return fn.apply(context, args);
    }
  },
  //-----------------------------------------------------
  InvokeBy: function InvokeBy() {
    var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var funcName = arguments.length > 1 ? arguments[1] : undefined;
    var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    var context = arguments.length > 3 ? arguments[3] : undefined;

    if (target) {
      return Ti.Invoke(target[funcName], args, context || target);
    }
  },
  //-----------------------------------------------------
  DoInvoke: function DoInvoke(fn) {
    var _arguments2 = arguments,
        _this23 = this;

    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee44() {
      var args, context;
      return regeneratorRuntime.wrap(function _callee44$(_context44) {
        while (1) {
          switch (_context44.prev = _context44.next) {
            case 0:
              args = _arguments2.length > 1 && _arguments2[1] !== undefined ? _arguments2[1] : [];
              context = _arguments2.length > 2 ? _arguments2[2] : undefined;

              if (!_.isFunction(fn)) {
                _context44.next = 7;
                break;
              }

              context = context || _this23;
              _context44.next = 6;
              return fn.apply(context, args);

            case 6:
              return _context44.abrupt("return", _context44.sent);

            case 7:
            case "end":
              return _context44.stop();
          }
        }
      }, _callee44);
    }))();
  },
  //-----------------------------------------------------
  DoInvokeBy: function DoInvokeBy() {
    var _arguments3 = arguments;
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee45() {
      var target, funcName, args, context;
      return regeneratorRuntime.wrap(function _callee45$(_context45) {
        while (1) {
          switch (_context45.prev = _context45.next) {
            case 0:
              target = _arguments3.length > 0 && _arguments3[0] !== undefined ? _arguments3[0] : {};
              funcName = _arguments3.length > 1 ? _arguments3[1] : undefined;
              args = _arguments3.length > 2 && _arguments3[2] !== undefined ? _arguments3[2] : [];
              context = _arguments3.length > 3 ? _arguments3[3] : undefined;

              if (!target) {
                _context45.next = 8;
                break;
              }

              _context45.next = 7;
              return Ti.DoInvoke(target[funcName], args, context || target);

            case 7:
              return _context45.abrupt("return", _context45.sent);

            case 8:
            case "end":
              return _context45.stop();
          }
        }
      }, _callee45);
    }))();
  },
  //-----------------------------------------------------
  AddGlobalFuncs: function AddGlobalFuncs(funcs) {
    _.assign(G_FUNCS, funcs);
  },
  //-----------------------------------------------------
  GlobalFuncs: function GlobalFuncs() {
    return _.assign({}, Ti.Types, G_FUNCS);
  } //-----------------------------------------------------

}; //---------------------------------------

exports.Ti = Ti;
var _default = Ti; //---------------------------------------

exports["default"] = _default;

if (window) {
  window.Ti = Ti;
} //---------------------------------------
// Ti