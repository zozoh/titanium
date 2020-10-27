"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.Wn = void 0;

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Pack At: 2020-10-27 20:55:44
//##################################################
// # import Io      from "./wn-io.mjs"
var Io = function () {
  ////////////////////////////////////////////
  function URL(actionName) {
    return "/o/" + actionName;
  } //-----------------------------------------


  function AJAX_RETURN(reo, invalid) {
    if (!reo.ok) {
      if (_.isUndefined(invalid)) throw reo;
      return invalid;
    }

    return reo.data;
  } ////////////////////////////////////////////


  var WnIo = {
    isFullObjId: function isFullObjId(id) {
      return /^[0-9a-v]{26}(:.+)?$/.test(id);
    },
    isFullObjIdPath: function isFullObjIdPath(idPath) {
      return /^id:[0-9a-v]{26}(:.+)?$/.test(idPath);
    },

    /***
     * Get object meta by id(fullobjId) or path
     */
    loadMetaBy: function loadMetaBy(idOrPath, oRefer) {
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var base, aph;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!WnIo.isFullObjId(idOrPath)) {
                  _context.next = 4;
                  break;
                }

                _context.next = 3;
                return WnIo.loadMetaById(idOrPath);

              case 3:
                return _context.abrupt("return", _context.sent);

              case 4:
                if (!/^(id:|\/|~)/.test(idOrPath)) {
                  _context.next = 8;
                  break;
                }

                _context.next = 7;
                return WnIo.loadMeta(idOrPath);

              case 7:
                return _context.abrupt("return", _context.sent);

              case 8:
                if (oRefer) {
                  // Refer by path
                  if (_.isString(oRefer)) {
                    base = Ti.Util.getParentPath(oRefer);
                  } // Refer by FILE
                  else if ("FILE" == oRefer.race) {
                      base = "id:" + oRefer.pid;
                    } // Refer by DIR
                    else {
                        base = "id:" + oRefer.id;
                      }
                } // Refer to home
                else {
                    base = "~";
                  } // Load the obj by absolute path


                aph = Ti.Util.appendPath(base, idOrPath);
                _context.next = 12;
                return WnIo.loadMeta(aph);

              case 12:
                return _context.abrupt("return", _context.sent);

              case 13:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    },

    /***
     * Get object meta by id
     */
    loadMetaById: function loadMetaById(id) {
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return WnIo.loadMeta("id:" + id);

              case 2:
                return _context2.abrupt("return", _context2.sent);

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }))();
    },

    /***
     * Get object meta by full path
     */
    loadMeta: function loadMeta(path) {
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var url, reo;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                url = URL("fetch");
                _context3.next = 3;
                return Ti.Http.get(url, {
                  params: {
                    str: path
                  },
                  as: "json"
                });

              case 3:
                reo = _context3.sent;
                return _context3.abrupt("return", AJAX_RETURN(reo, null));

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }))();
    },

    /***
     * Get object meta by refer meta
     */
    loadMetaAt: function loadMetaAt(refer, path) {
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var aph;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                // eval absolute path
                aph = path; // Relative to refer (path is not absolute)

                if (refer && !/^(~\/|\/|id:)/.test(path)) {
                  aph = "id:".concat(refer.pid, "/").concat(path);
                } // Do load


                _context4.next = 4;
                return WnIo.loadMeta(aph);

              case 4:
                return _context4.abrupt("return", _context4.sent);

              case 5:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }))();
    },

    /***
     * Get obj children by meta
     */
    loadAncestors: function loadAncestors(str) {
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var url, reo;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                url = URL("ancestors");
                _context5.next = 3;
                return Ti.Http.get(url, {
                  params: {
                    str: str
                  },
                  as: "json"
                });

              case 3:
                reo = _context5.sent;
                return _context5.abrupt("return", AJAX_RETURN(reo, []));

              case 5:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }))();
    },

    /***
     * Get obj children by meta
     */
    loadChildren: function loadChildren(meta) {
      var _arguments = arguments;
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var _ref, skip, limit, _ref$sort, sort, mine, _ref$match, match, url, _reo, reo, _iterator, _step, child;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _ref = _arguments.length > 1 && _arguments[1] !== undefined ? _arguments[1] : {}, skip = _ref.skip, limit = _ref.limit, _ref$sort = _ref.sort, sort = _ref$sort === void 0 ? {
                  nm: 1
                } : _ref$sort, mine = _ref.mine, _ref$match = _ref.match, match = _ref$match === void 0 ? {} : _ref$match;

                if (meta) {
                  _context6.next = 3;
                  break;
                }

                return _context6.abrupt("return", null);

              case 3:
                if (!('DIR' != meta.race)) {
                  _context6.next = 5;
                  break;
                }

                return _context6.abrupt("return", []);

              case 5:
                if (!(meta.mnt || meta.ln)) {
                  _context6.next = 11;
                  break;
                }

                url = URL("children");
                _context6.next = 9;
                return Ti.Http.get(url, {
                  params: {
                    "str": "id:".concat(meta.id),
                    "pg": true
                  },
                  as: "json"
                });

              case 9:
                _reo = _context6.sent;
                return _context6.abrupt("return", AJAX_RETURN(_reo));

              case 11:
                //......................................
                // Just normal query
                // parent ID
                match.pid = meta.id; // find them

                _context6.next = 14;
                return WnIo.find({
                  skip: skip,
                  limit: limit,
                  sort: sort,
                  mine: mine,
                  match: match
                });

              case 14:
                reo = _context6.sent;

                // Auto set reo path if noexists
                if (meta.ph && reo && _.isArray(reo.list)) {
                  _iterator = _createForOfIteratorHelper(reo.list);

                  try {
                    for (_iterator.s(); !(_step = _iterator.n()).done;) {
                      child = _step.value;

                      if (!child.ph) {
                        child.ph = Ti.Util.appendPath(meta.ph, child.nm);
                      }
                    }
                  } catch (err) {
                    _iterator.e(err);
                  } finally {
                    _iterator.f();
                  }
                }

                return _context6.abrupt("return", reo);

              case 17:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }))();
    },

    /***
     * Query object list
     */
    find: function find() {
      var _arguments2 = arguments;
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var _ref2, _ref2$skip, skip, _ref2$limit, limit, _ref2$sort, sort, _ref2$mine, mine, _ref2$match, match, url, reo;

        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _ref2 = _arguments2.length > 0 && _arguments2[0] !== undefined ? _arguments2[0] : {}, _ref2$skip = _ref2.skip, skip = _ref2$skip === void 0 ? 0 : _ref2$skip, _ref2$limit = _ref2.limit, limit = _ref2$limit === void 0 ? 100 : _ref2$limit, _ref2$sort = _ref2.sort, sort = _ref2$sort === void 0 ? {} : _ref2$sort, _ref2$mine = _ref2.mine, mine = _ref2$mine === void 0 ? true : _ref2$mine, _ref2$match = _ref2.match, match = _ref2$match === void 0 ? {} : _ref2$match;
                url = URL("find");
                _context7.next = 4;
                return Ti.Http.get(url, {
                  params: _.assign({}, match, {
                    _l: limit,
                    _o: skip,
                    _me: mine,
                    _s: JSON.stringify(sort)
                  }),
                  as: "json"
                });

              case 4:
                reo = _context7.sent;
                return _context7.abrupt("return", AJAX_RETURN(reo));

              case 6:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }))();
    },
    findList: function findList() {
      var _arguments3 = arguments;
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
        var query, reo;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                query = _arguments3.length > 0 && _arguments3[0] !== undefined ? _arguments3[0] : {};
                _context8.next = 3;
                return WnIo.find(query);

              case 3:
                reo = _context8.sent;

                if (!(reo && _.isArray(reo.list))) {
                  _context8.next = 6;
                  break;
                }

                return _context8.abrupt("return", reo.list);

              case 6:
                return _context8.abrupt("return", []);

              case 7:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }))();
    },

    /***
     * Query object list by value
     */
    findInBy: function findInBy(value, parent) {
      var _arguments4 = arguments;
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
        var _ref3, _ref3$skip, skip, _ref3$limit, limit, _ref3$sort, sort, _ref3$mine, mine, _ref3$match, match, _ref3$keys, keys, _ref3$dftKey, dftKey, key, _iterator2, _step2, regex, k, v, oP;

        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _ref3 = _arguments4.length > 2 && _arguments4[2] !== undefined ? _arguments4[2] : {}, _ref3$skip = _ref3.skip, skip = _ref3$skip === void 0 ? 0 : _ref3$skip, _ref3$limit = _ref3.limit, limit = _ref3$limit === void 0 ? 100 : _ref3$limit, _ref3$sort = _ref3.sort, sort = _ref3$sort === void 0 ? {} : _ref3$sort, _ref3$mine = _ref3.mine, mine = _ref3$mine === void 0 ? true : _ref3$mine, _ref3$match = _ref3.match, match = _ref3$match === void 0 ? {} : _ref3$match, _ref3$keys = _ref3.keys, keys = _ref3$keys === void 0 ? {
                  "^[0-9a-v]{26}$": ["id", "${val}"]
                } : _ref3$keys, _ref3$dftKey = _ref3.dftKey, dftKey = _ref3$dftKey === void 0 ? ["nm", "^.*${val}.*$"] : _ref3$dftKey;

                if (_.isUndefined(value)) {
                  _context9.next = 24;
                  break;
                }

                key = dftKey;
                _iterator2 = _createForOfIteratorHelper(_.keys(keys));
                _context9.prev = 4;

                _iterator2.s();

              case 6:
                if ((_step2 = _iterator2.n()).done) {
                  _context9.next = 13;
                  break;
                }

                regex = _step2.value;

                if (!new RegExp(regex).test(value)) {
                  _context9.next = 11;
                  break;
                }

                key = keys[regex];
                return _context9.abrupt("break", 13);

              case 11:
                _context9.next = 6;
                break;

              case 13:
                _context9.next = 18;
                break;

              case 15:
                _context9.prev = 15;
                _context9.t0 = _context9["catch"](4);

                _iterator2.e(_context9.t0);

              case 18:
                _context9.prev = 18;

                _iterator2.f();

                return _context9.finish(18);

              case 21:
                k = key[0];
                v = Ti.S.renderBy(key[1], {
                  val: value
                });
                match[k] = v;

              case 24:
                if (!parent) {
                  _context9.next = 29;
                  break;
                }

                _context9.next = 27;
                return WnIo.loadMeta(parent);

              case 27:
                oP = _context9.sent;
                match.pid = oP.id;

              case 29:
                _context9.next = 31;
                return WnIo.find({
                  skip: skip,
                  limit: limit,
                  sort: sort,
                  mine: mine,
                  match: match
                });

              case 31:
                return _context9.abrupt("return", _context9.sent);

              case 32:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, null, [[4, 15, 18, 21]]);
      }))();
    },
    findListInBy: function findListInBy(value, parent) {
      var _arguments5 = arguments;
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
        var query, reo;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                query = _arguments5.length > 2 && _arguments5[2] !== undefined ? _arguments5[2] : {};
                _context10.next = 3;
                return WnIo.findInBy(value, parent, query);

              case 3:
                reo = _context10.sent;

                if (!(reo && _.isArray(reo.list))) {
                  _context10.next = 6;
                  break;
                }

                return _context10.abrupt("return", reo.list);

              case 6:
                return _context10.abrupt("return", []);

              case 7:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10);
      }))();
    },

    /***
     * Get obj content by meta:
     */
    loadContent: function loadContent(meta) {
      var _arguments6 = arguments;
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
        var _ref4, _ref4$as, as, mime, url, content;

        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _ref4 = _arguments6.length > 1 && _arguments6[1] !== undefined ? _arguments6[1] : {}, _ref4$as = _ref4.as, as = _ref4$as === void 0 ? "text" : _ref4$as;

                if (!_.isString(meta)) {
                  _context11.next = 5;
                  break;
                }

                _context11.next = 4;
                return WnIo.loadMeta(meta);

              case 4:
                meta = _context11.sent;

              case 5:
                if (!(!meta || 'DIR' == meta.race)) {
                  _context11.next = 7;
                  break;
                }

                return _context11.abrupt("return", null);

              case 7:
                // Do load
                mime = meta.mime || 'application/octet-stream'; // PureText

                if (!Wn.Util.isMimeText(mime)) {
                  _context11.next = 14;
                  break;
                }

                url = URL("content");
                _context11.next = 12;
                return Ti.Http.get(url, {
                  params: {
                    str: "id:" + meta.id,
                    d: "raw"
                  },
                  as: as
                });

              case 12:
                content = _context11.sent;
                return _context11.abrupt("return", content);

              case 14:
                return _context11.abrupt("return", meta.sha1);

              case 15:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11);
      }))();
    },

    /***
     * Save obj content
     */
    saveContentAsText: function saveContentAsText(meta, content) {
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
        var params, url, reo;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                if (!(!meta || 'DIR' == meta.race)) {
                  _context12.next = 2;
                  break;
                }

                throw Ti.Err.make('e-wn-io-writeNoFile', meta.ph || meta.nm);

              case 2:
                // Prepare params
                params = {
                  str: "id:" + meta.id,
                  content: content
                }; // do send

                url = URL("/save/text");
                _context12.next = 6;
                return Ti.Http.post(url, {
                  params: params,
                  as: "json"
                });

              case 6:
                reo = _context12.sent;

                if (reo.ok) {
                  _context12.next = 9;
                  break;
                }

                throw Ti.Err.make(reo.errCode, reo.data, reo.msg);

              case 9:
                return _context12.abrupt("return", reo.data);

              case 10:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12);
      }))();
    },

    /***
     * Upload file
     */
    uploadFile: function uploadFile(file) {
      var _arguments7 = arguments;
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
        var _ref5, _ref5$target, target, _ref5$mode, mode, _ref5$tmpl, tmpl, _ref5$progress, progress, url, reo;

        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                _ref5 = _arguments7.length > 1 && _arguments7[1] !== undefined ? _arguments7[1] : {}, _ref5$target = _ref5.target, target = _ref5$target === void 0 ? "~" : _ref5$target, _ref5$mode = _ref5.mode, mode = _ref5$mode === void 0 ? "a" : _ref5$mode, _ref5$tmpl = _ref5.tmpl, tmpl = _ref5$tmpl === void 0 ? "${major}(${nb})${suffix}" : _ref5$tmpl, _ref5$progress = _ref5.progress, progress = _ref5$progress === void 0 ? _.identity : _ref5$progress;
                // do send
                url = URL("/save/stream");
                _context13.next = 4;
                return Ti.Http.post(url, {
                  file: file,
                  progress: progress,
                  params: {
                    str: target,
                    nm: file.name,
                    sz: file.size,
                    mime: file.type,
                    m: mode,
                    tmpl: tmpl
                  },
                  as: "json"
                });

              case 4:
                reo = _context13.sent;
                return _context13.abrupt("return", reo);

              case 6:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13);
      }))();
    },

    /***
     *  Get relative path of WnObj to home
     *  path will starts by "~/"
     */
    getFormedPath: function getFormedPath(meta) {
      // Make sure it is meta
      var ph = meta.ph ? meta.ph : meta;
      var homePath = Wn.Session.getHomePath();
      var rph = Ti.Util.getRelativePath(homePath, ph, "");
      return Ti.Util.appendPath("~", rph);
    },

    /***
     * @param meta{WnObj} the source object
     * @param mode{String}: 
     *  - path : relative to home like "~/xxx/xxx"
     *  - fullPath : "/home/xiaobai/xxx/xxx"
     *  - idPath : "id:67u8..98a1"
     *  - id   : "67u8..98a1"
     * @param oRefer{WnObj} - meta refer, may nil
     */
    formatObjPath: function formatObjPath(meta, mode, oRefer) {
      //console.log("formatObjPath", {meta, mode, oRefer})
      var fn = {
        path: function path() {
          if (oRefer) {
            return Ti.Util.getRelativePath(oRefer.ph, meta.ph);
          }

          return WnIo.getFormedPath(meta.ph);
        },
        fullPath: function fullPath() {
          return meta.ph;
        },
        idPath: function idPath() {
          return "id:".concat(meta.id);
        },
        id: function id() {
          return meta.id;
        },
        obj: function obj() {
          var keys = oRefer || ['id', 'nm', 'thumb', 'title', 'mime', 'tp', 'sha1', 'len'];
          return _.pick(meta, keys);
        }
      }[mode];

      if (!fn) {
        throw "Invalid mode : " + mode;
      }

      return fn();
    }
  }; ////////////////////////////////////////////

  return WnIo;
}(); //##################################################
// # import Obj     from "./wn-obj.mjs"


var Obj = function () {
  ////////////////////////////////////////////////////
  var FIELDS = {
    //---------------------------------------------
    "id": {
      title: "i18n:wn-key-id",
      name: "id"
    },
    //---------------------------------------------
    "nm": {
      title: "i18n:wn-key-nm",
      name: "nm",
      display: "<=ti-label>",
      comType: "ti-input"
    },
    //---------------------------------------------
    "title": {
      title: "i18n:wn-key-title",
      name: "title",
      display: "<=ti-label>",
      comType: "ti-input"
    },
    //---------------------------------------------
    "icon": {
      title: "i18n:wn-key-icon",
      name: "icon",
      width: "auto",
      comType: "ti-input-icon"
    },
    //---------------------------------------------
    "ph": {
      title: "i18n:wn-key-ph",
      name: "ph",
      comConf: {
        className: "is-break-word"
      }
    },
    //---------------------------------------------
    "thumb": {
      title: "i18n:wn-key-thumb",
      name: "thumb",
      checkEquals: false,
      serializer: {
        name: "Ti.Types.toStr",
        args: "id:${id}"
      },
      comType: "wn-imgfile",
      comConf: {
        target: "~/.thumbnail/gen/${id}.jpg",
        filter: "cover(256,256)",
        quality: 0.372
      }
    },
    //---------------------------------------------
    "race": {
      title: "i18n:wn-key-race",
      name: "race",
      comConf: {
        format: "i18n:wn-race-${race}"
      }
    },
    //---------------------------------------------
    "mime": {
      title: "i18n:wn-key-mime",
      name: "mime"
    },
    //---------------------------------------------
    "tp": {
      title: "i18n:wn-key-tp",
      name: "tp"
    },
    //---------------------------------------------
    "ct": {
      title: "i18n:wn-key-ct",
      name: "ct",
      type: "AMS"
    },
    //---------------------------------------------
    "lm": {
      title: "i18n:wn-key-lm",
      name: "lm",
      type: "AMS"
    },
    //---------------------------------------------
    "expi": {
      title: "i18n:wn-key-expi",
      name: "expi",
      type: "AMS"
    },
    //---------------------------------------------
    "pid": {
      title: "i18n:wn-key-pid",
      name: "pid"
    },
    //---------------------------------------------
    "d0": {
      title: "i18n:wn-key-d0",
      name: "d0"
    },
    //---------------------------------------------
    "d1": {
      title: "i18n:wn-key-d1",
      name: "d1"
    },
    //---------------------------------------------
    "c": {
      title: "i18n:wn-key-c",
      name: "c"
    },
    //---------------------------------------------
    "m": {
      title: "i18n:wn-key-m",
      name: "m"
    },
    //---------------------------------------------
    "g": {
      title: "i18n:wn-key-g",
      name: "g"
    },
    //---------------------------------------------
    "data": {
      title: "i18n:wn-key-data",
      name: "data"
    },
    //---------------------------------------------
    "sha1": {
      title: "i18n:wn-key-sha1",
      name: "sha1"
    },
    //---------------------------------------------
    "md": {
      title: "i18n:wn-key-md",
      name: "md"
    },
    //---------------------------------------------
    "pvg": {
      title: "i18n:wn-key-pvg",
      name: "pvg"
    },
    //---------------------------------------------
    "width": {
      title: "i18n:wn-key-width",
      name: "width"
    },
    //---------------------------------------------
    "height": {
      title: "i18n:wn-key-height",
      name: "height"
    },
    //---------------------------------------------
    "duration": {
      title: "i18n:wn-key-duration",
      name: "duration"
    },
    //---------------------------------------------
    "len": {
      title: "i18n:wn-key-len",
      name: "len",
      width: "auto",
      transformer: function transformer(v) {
        return Ti.S.sizeText(v, {
          bytes: true
        });
      }
    } //---------------------------------------------

  }; ////////////////////////////////////////////

  var WnObj = {
    //----------------------------------------
    isBuiltInFields: function isBuiltInFields(key) {
      return FIELDS[key] ? true : false;
    },
    //----------------------------------------
    getGroupTitle: function getGroupTitle(titleKey) {
      if (/^(basic|privilege|thumb|timestamp|more|advance|customized|others)$/.test(titleKey)) return "i18n:wn-key-grp-".concat(titleKey);
      return titleKey;
    },
    //----------------------------------------
    getField: function getField(key) {
      var fld = FIELDS[key];

      if (fld) {
        return _.cloneDeep(fld);
      }

      return {
        title: key,
        name: key,
        type: "String"
      };
    },
    //----------------------------------------
    evalFields: function evalFields() {
      var meta = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var fields = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var iteratee = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _.identity;

      //......................................
      var __join_fields = function __join_fields() {
        var flds = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var outs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var keys = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _.forEach(flds, function (fld) {
          // Remains fields
          // It will be deal with later
          if ("..." == fld) {
            outs.push(fld);
            return;
          }

          var f2;
          var quickName = false; // Quick Name

          if (_.isString(fld)) {
            quickName = true;
            f2 = Wn.Obj.getField(fld);
          } // Group
          else if (_.isArray(fld.fields)) {
              f2 = {
                title: Wn.Obj.getGroupTitle(fld.title),
                type: "Group",
                fields: []
              };

              __join_fields(fld.fields, f2.fields, keys);

              if (_.isEmpty(f2.fields)) {
                return;
              }
            } // Normal field
            else {
                f2 = fld;
              } //......................................


          var uniqKey = Ti.S.join([f2.name], "-");
          keys[uniqKey] = true;

          var value = _.get(meta, f2.name);

          outs.push(_.assign(f2, {
            quickName: quickName,
            uniqKey: uniqKey,
            value: value
          })); //......................................
        });

        return outs;
      }; //......................................


      var __deal_with_remain_fields = function __deal_with_remain_fields() {
        var flds = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var outs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var keys = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var _iterator3 = _createForOfIteratorHelper(flds),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var fld = _step3.value;

            // Group
            if (fld.type == "Group") {
              fld.fields = __deal_with_remain_fields(fld.fields, [], keys);

              if (!_.isEmpty(fld.fields)) {
                outs.push(fld);
              }

              continue;
            } // Remains


            if ("..." == fld) {
              _.forEach(meta, function (v, k) {
                // Ignore nil and built-in fields
                if (Ti.Util.isNil(v) || Wn.Obj.isBuiltInFields(k) || keys[k] || k.startsWith("_")) {
                  return;
                } // Auto com type


                var jsType = Ti.Types.getJsType(v, "String");
                var fldConf = {
                  "Integer": {
                    type: "Number",
                    display: k,
                    comType: "ti-input"
                  },
                  "Number": {
                    type: "Number",
                    display: k,
                    comType: "ti-input"
                  },
                  "Boolean": {
                    type: "Boolean",
                    comType: "ti-toggle"
                  },
                  "Array": {
                    type: "Array",
                    display: {
                      key: k
                    },
                    transformer: "JSON.stringify(null, '  ')",
                    comType: "ti-input-text",
                    comConf: {
                      height: 240
                    }
                  }
                }[jsType] || {
                  type: "String",
                  display: {
                    key: k,
                    comConf: {
                      width: "100%",
                      className: _.isString(v) && v.length > 20 ? "is-break-word" : "is-nowrap"
                    }
                  },
                  comType: "ti-input"
                }; // Join

                var f2 = iteratee(_objectSpread({
                  title: k,
                  name: k
                }, fldConf));

                if (f2) {
                  outs.push(f2);
                }
              });
            } // Normal fields
            else {
                var f2 = iteratee(fld);

                if (f2) {
                  outs.push(f2);
                }
              }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }

        return outs;
      }; //......................................


      var usedKeys = {};

      var myFormFields = __join_fields(fields, [], usedKeys);

      myFormFields = __deal_with_remain_fields(myFormFields, [], usedKeys); //......................................

      return myFormFields;
    },
    //----------------------------------------
    isAs: function isAs() {
      var meta = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var key = arguments.length > 1 ? arguments[1] : undefined;
      var match = arguments.length > 2 ? arguments[2] : undefined;

      var val = _.get(meta, key);

      if (Ti.Util.isNil(val)) {
        return false;
      } //......................................


      if (_.isArray(match)) {
        var _iterator4 = _createForOfIteratorHelper(match),
            _step4;

        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var mi = _step4.value;

            if (WnObj.isAs(meta, key, mi)) {
              return true;
            }
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }

        return false;
      } //......................................


      if (_.isString(match)) {
        if (match.startsWith("^")) {
          return new RegExp(match).test(val);
        }

        if (match.startsWith("!^")) {
          return !new RegExp(match.substring(1)).test(val);
        }

        return val == match;
      } //......................................


      if (_.isRegExp(match)) {
        return match.test(val);
      } //......................................


      return false;
    },
    //----------------------------------------
    isMime: function isMime() {
      var meta = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var mime = arguments.length > 1 ? arguments[1] : undefined;
      return WnObj.isAs(meta, "mime", mime);
    },
    //----------------------------------------
    isType: function isType() {
      var meta = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var type = arguments.length > 1 ? arguments[1] : undefined;
      return WnObj.isAs(meta, "type", type);
    },
    //----------------------------------------

    /***
     * Create the crumb data for `<ti-crumb>`
     * 
     * @param meta{Object} - WnObj to show crumb data
     * @param ancestors{Array} - parent path object(WnObj[]), top dir at first.
     * @param showSelf{Boolean} - append self at the end of path
     * @param fromIndex{Integer} - start index in ancestors to generate data
     * @param homePath{String} - another way to indicate the `fromIndex`
     * @param iteratee{Function} - customized iterator `(item, index, an)`
     *   return `null` to ignore current item
     * @param self{Function} - customized iterator for self `(item, index, an)`
     *   return `null` to ignore current item
     * 
     * @return JSON array like:
     * 
     * ```js
     * [{
     *    icon  : Wn.Util.getIconObj(self),
          text   : Wn.Util.getObjDisplayName(self),
          value  : self.id,
          href   : null,
          asterisk : _.get(this.mainStatus, "changed")
     * }]
     * ```
     */
    evalCrumbData: function evalCrumbData() {
      var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          meta = _ref6.meta,
          _ref6$ancestors = _ref6.ancestors,
          ancestors = _ref6$ancestors === void 0 ? [] : _ref6$ancestors,
          _ref6$fromIndex = _ref6.fromIndex,
          fromIndex = _ref6$fromIndex === void 0 ? 0 : _ref6$fromIndex,
          _ref6$homePath = _ref6.homePath,
          homePath = _ref6$homePath === void 0 ? null : _ref6$homePath,
          _ref6$iteratee = _ref6.iteratee,
          iteratee = _ref6$iteratee === void 0 ? _.identity : _ref6$iteratee,
          _ref6$self = _ref6.self,
          self = _ref6$self === void 0 ? _.identity : _ref6$self;

      var list = [];

      if (meta) {
        var ans = _.map(ancestors); // Find the first Index from home


        var i = fromIndex; // find by homePath

        if (homePath) {
          if (homePath.endsWith("/")) {
            homePath = homePath.substring(0, homePath.length - 1);
          }

          for (; i < ans.length; i++) {
            var an = ans[i];

            if (an.ph == homePath) {
              break;
            }
          }
        } // Show ancestors form Home


        for (; i < ans.length; i++) {
          var _an = ans[i];
          var item = {
            icon: Wn.Util.getIconObj(_an),
            text: Wn.Util.getObjDisplayName(_an),
            value: _an.id,
            href: Wn.Util.getAppLink(_an) + ""
          };
          item = iteratee(item, i, meta) || item;

          if (item) {
            list.push(item);
          }
        } // Top Item, just show title


        if (self) {
          var _item = {
            icon: Wn.Util.getIconObj(meta),
            text: Wn.Util.getObjDisplayName(meta),
            value: meta.id,
            href: null,
            asterisk: _.get(this.mainStatus, "changed")
          }; // Customized

          if (_.isFunction(self)) {
            _item = self(_item, i, meta) || _item;
          } // Join to list


          if (_item) {
            list.push(_item);
          }
        }
      }

      return list;
    } //----------------------------------------

  }; ////////////////////////////////////////////

  return WnObj;
}(); //##################################################
// # import Session from "./wn-session.mjs"


var Session = function () {
  ////////////////////////////////////////////
  var ENVS = {};
  var SESSION = {}; ////////////////////////////////////////////

  var WnSession = {
    //----------------------------------------
    setup: function setup() {
      var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          id = _ref7.id,
          uid = _ref7.uid,
          unm = _ref7.unm,
          grp = _ref7.grp,
          _ref7$envs = _ref7.envs,
          envs = _ref7$envs === void 0 ? {} : _ref7$envs;

      _.assign(SESSION, {
        id: id,
        uid: uid,
        unm: unm,
        grp: grp
      });

      WnSession.env(envs);
    },
    //----------------------------------------
    env: function env(vars) {
      // Set Env
      if (_.isPlainObject(vars)) {
        _.assign(ENVS, vars);
      } // GET one
      else if (_.isString(vars)) {
          return ENVS[vars];
        } // Pick
        else if (_.isArray(vars)) {
            return _.pick(ENVS, vars);
          } // Get Env


      return _.cloneDeep(ENVS);
    },
    //----------------------------------------
    getMyId: function getMyId() {
      return SESSION.uid;
    },
    getMyName: function getMyName() {
      return SESSION.unm;
    },
    getMyGroup: function getMyGroup() {
      return SESSION.grp;
    },
    //----------------------------------------
    getHomePath: function getHomePath() {
      return WnSession.env("HOME");
    },
    //----------------------------------------
    getCurrentPath: function getCurrentPath() {
      var dft = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "~";
      return WnSession.env("PWD") || dft;
    },
    //----------------------------------------
    // Analyze the current domain 
    getCurrentDomain: function getCurrentDomain() {
      var home = WnSession.getHomePath();

      if (!home) {
        return;
      } // For root


      if ("/root" == home) return "root"; // Others

      var m = /^\/home\/(.+)$/.exec(home);

      if (m) {
        return m[1];
      }
    },
    //----------------------------------------
    getApiPrefix: function getApiPrefix() {
      var dmn = WnSession.getCurrentDomain();
      return "/api/".concat(dmn);
    },
    //----------------------------------------
    getApiUrl: function getApiUrl(url) {
      var prefix = WnSession.getApiPrefix();
      return Ti.Util.appendPath(prefix, url);
    } //----------------------------------------

  }; ////////////////////////////////////////////

  return WnSession;
}(); //##################################################
// # import Sys     from "./wn-sys.mjs"


var Sys = function () {
  //################################################
  // # import WnSysRespParsing from "./wn-sys-resp-parsing.mjs";
  var WnSysRespParsing = function () {
    // Ti required(Ti.Util)
    ////////////////////////////////////////////
    var WnSysRespParsing = /*#__PURE__*/function () {
      function WnSysRespParsing() {
        var _ref8 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            macroObjSep = _ref8.macroObjSep,
            _ref8$eachLine = _ref8.eachLine,
            eachLine = _ref8$eachLine === void 0 ? _.identity : _ref8$eachLine,
            _ref8$macro = _ref8.macro,
            macro = _ref8$macro === void 0 ? {} : _ref8$macro;

        _classCallCheck(this, WnSysRespParsing);

        this.macroObjSep = macroObjSep;
        this.lastIndex = 0;
        this.lines = [];
        this.MACRO = {};
        this.__TO = null;
        this.eachLine = eachLine;
        this.macro = macro;
      }

      _createClass(WnSysRespParsing, [{
        key: "init",
        value: function init(content) {
          this.content = content;
        }
      }, {
        key: "done",
        value: function done() {
          var _this = this;

          this.updated({
            isLastCalled: true
          }); // for MACRO

          _.forOwn(this.MACRO, function (val, key) {
            var json = val.join("\n");
            var payload = JSON.parse(json);
            _this.MACRO[key] = payload;
            Ti.InvokeBy(_this.macro, key, [payload]);
          });
        }
      }, {
        key: "__push_line",
        value: function __push_line(line) {
          // If begine the macro
          if (line.startsWith(this.macroObjSep)) {
            var str = line.substring(this.macroObjSep.length).trim();

            var _$without = _.without(str.split(/ *: */g), ""),
                _$without2 = _slicedToArray(_$without, 2),
                key = _$without2[0],
                name = _$without2[1];

            var tag = this[key];

            if (tag) {
              tag[name] = [];
            }

            this.__TO = {
              key: key,
              name: name
            };
          } // Specially target
          else if (this.__TO) {
              var _this$__TO = this.__TO,
                  _key = _this$__TO.key,
                  _name = _this$__TO.name;

              this[_key][_name].push(line);
            } // Default dist
            else {
                this.lines.push(line); // Hook

                this.eachLine(line);
              }
        }
      }, {
        key: "updated",
        value: function updated() {
          var _ref9 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
              _ref9$isLastCalled = _ref9.isLastCalled,
              isLastCalled = _ref9$isLastCalled === void 0 ? false : _ref9$isLastCalled;

          var content = this.content(); // Looking for each line

          while (this.lastIndex < content.length) {
            var pos = content.indexOf('\n', this.lastIndex);

            if (pos >= this.lastIndex) {
              var nextIndex = pos + 1;

              if (pos > 0 && content[pos - 1] == '\r') {
                pos--;
              }

              var line = content.substring(this.lastIndex, pos);

              this.__push_line(line);

              this.lastIndex = nextIndex;
            } // force ending
            else if (isLastCalled) {
                var _line = content.substring(this.lastIndex);

                this.__push_line(_line);

                this.lastIndex = content.length;
              } // not endind line, break it
              else {
                  break;
                }
          }
        }
      }, {
        key: "getResult",
        value: function getResult() {
          return {
            lines: this.lines,
            macro: this.MACRO
          };
        }
      }]);

      return WnSysRespParsing;
    }(); ////////////////////////////////////////////


    return WnSysRespParsing;
  }(); ////////////////////////////////////////////


  var DFT_MACRO_OBJ_SEP = "%%wn.meta." + Ti.Random.str(10) + "%%"; ////////////////////////////////////////////

  var WnSys = {
    //-------------------------------------
    exec: function exec(cmdText) {
      var _arguments8 = arguments;
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
        var _ref10, _ref10$vars, vars, _ref10$input, input, _ref10$appName, appName, _ref10$eachLine, eachLine, _ref10$as, as, _ref10$blankAs, blankAs, _ref10$macroObjSep, macroObjSep, _ref10$autoRunMacro, autoRunMacro, errorBy, _ref10$PWD, PWD, url, params, ing, parsing, re, str, _str$split, _str$split2, code, datas, data, msgKey;

        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                _ref10 = _arguments8.length > 1 && _arguments8[1] !== undefined ? _arguments8[1] : {}, _ref10$vars = _ref10.vars, vars = _ref10$vars === void 0 ? {} : _ref10$vars, _ref10$input = _ref10.input, input = _ref10$input === void 0 ? "" : _ref10$input, _ref10$appName = _ref10.appName, appName = _ref10$appName === void 0 ? Ti.GetAppName() : _ref10$appName, _ref10$eachLine = _ref10.eachLine, eachLine = _ref10$eachLine === void 0 ? _.identity : _ref10$eachLine, _ref10$as = _ref10.as, as = _ref10$as === void 0 ? "text" : _ref10$as, _ref10$blankAs = _ref10.blankAs, blankAs = _ref10$blankAs === void 0 ? "" : _ref10$blankAs, _ref10$macroObjSep = _ref10.macroObjSep, macroObjSep = _ref10$macroObjSep === void 0 ? DFT_MACRO_OBJ_SEP : _ref10$macroObjSep, _ref10$autoRunMacro = _ref10.autoRunMacro, autoRunMacro = _ref10$autoRunMacro === void 0 ? true : _ref10$autoRunMacro, errorBy = _ref10.errorBy, _ref10$PWD = _ref10.PWD, PWD = _ref10$PWD === void 0 ? Wn.Session.getCurrentPath() : _ref10$PWD;
                // Eval command
                cmdText = Ti.S.renderBy(cmdText, vars); // Prepare

                url = "/a/run/".concat(appName);
                params = {
                  "mos": macroObjSep,
                  "PWD": PWD,
                  "cmd": cmdText,
                  "in": input
                }; // Prepare analyzer

                ing = {
                  eachLine: eachLine,
                  macroObjSep: macroObjSep
                };

                if (autoRunMacro) {
                  ing.macro = {
                    update_envs: function update_envs(envs) {
                      Wn.Session.env(envs);
                      Wn.doHook("update_envs", envs);
                    }
                  };
                }

                parsing = new WnSysRespParsing(ing); // Request remote

                _context14.next = 9;
                return Ti.Http.send(url, {
                  method: "POST",
                  params: params,
                  as: "text",
                  created: function created($req) {
                    parsing.init(function () {
                      return $req.responseText;
                    });
                  }
                })["catch"](function ($req) {
                  parsing.isError = true;
                })["finally"](function () {
                  parsing.done();
                });

              case 9:
                // Get result
                re = parsing.getResult(); // Then we got the result

                if (Ti.IsInfo("Wn.Sys")) {
                  console.log("Wn.Sys.exec@return", re);
                } // Handle error


                if (!parsing.isError) {
                  _context14.next = 22;
                  break;
                }

                str = re.lines.join("\n");

                if (!_.isFunction(errorBy)) {
                  _context14.next = 21;
                  break;
                }

                _str$split = str.split(/ *: */), _str$split2 = _toArray(_str$split), code = _str$split2[0], datas = _str$split2.slice(1);
                data = datas.join(" : ");
                code = _.trim(code);
                msgKey = code.replace(/[.]/g, "-");
                return _context14.abrupt("return", errorBy({
                  code: code,
                  msgKey: msgKey,
                  data: data
                }));

              case 21:
                throw str;

              case 22:
                return _context14.abrupt("return", {
                  raw: function raw() {
                    return re;
                  },
                  lines: function lines() {
                    return re.lines;
                  },
                  macro: function macro() {
                    return re.macro;
                  },
                  text: function text() {
                    return re.lines.join("\n");
                  },
                  json: function json() {
                    var json = re.lines.join("\n");

                    if (Ti.S.isBlank(json)) {
                      json = blankAs;
                    } // Try parse json


                    try {
                      return JSON.parse(json);
                    } catch (e) {
                      console.error("Error [".concat(cmdText, "] for parse JSON:"), json);
                      throw e;
                    }
                  },
                  jso: function jso() {
                    var json = re.lines.join("\n");

                    if (Ti.S.isBlank(json)) {
                      json = blankAs;
                    } // Try eval json


                    try {
                      return eval('(' + json + ')');
                    } catch (e) {
                      console.error("Error [".concat(cmdText, "] for eval JSO:"), json);
                      throw e;
                    }
                  }
                }[as]());

              case 23:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14);
      }))();
    },
    //-------------------------------------
    exec2: function exec2(cmdText) {
      var _arguments9 = arguments;
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16() {
        var options;
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                options = _arguments9.length > 1 && _arguments9[1] !== undefined ? _arguments9[1] : {};

                // Default error process
                _.defaults(options, {
                  errorBy: function () {
                    var _errorBy = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(_ref11) {
                      var code, msgKey, data, msg;
                      return regeneratorRuntime.wrap(function _callee15$(_context15) {
                        while (1) {
                          switch (_context15.prev = _context15.next) {
                            case 0:
                              code = _ref11.code, msgKey = _ref11.msgKey, data = _ref11.data;
                              //console.log(code, msgKey, data)
                              // Eval error message
                              msg = Ti.I18n.get(msgKey);

                              if (!Ti.Util.isNil(data) && (!_.isString(data) || data)) {
                                msg += " : " + Ti.Types.toStr(data);
                              } // Show it to user


                              _context15.next = 5;
                              return Ti.Alert(msg, {
                                title: "i18n:warn",
                                type: "error"
                              });

                            case 5:
                              if (!_.isFunction(options.errorAs)) {
                                _context15.next = 7;
                                break;
                              }

                              return _context15.abrupt("return", options.errorAs({
                                code: code,
                                msgKey: msgKey,
                                data: data
                              }));

                            case 7:
                              return _context15.abrupt("return", Ti.Err.make(code, data));

                            case 8:
                            case "end":
                              return _context15.stop();
                          }
                        }
                      }, _callee15);
                    }));

                    function errorBy(_x) {
                      return _errorBy.apply(this, arguments);
                    }

                    return errorBy;
                  }()
                }); // Run command


                _context16.next = 4;
                return Wn.Sys.exec(cmdText, options);

              case 4:
                return _context16.abrupt("return", _context16.sent);

              case 5:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16);
      }))();
    },
    //-------------------------------------
    execJson: function execJson(cmdText) {
      var _arguments10 = arguments;
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17() {
        var options;
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                options = _arguments10.length > 1 && _arguments10[1] !== undefined ? _arguments10[1] : {
                  as: "json"
                };
                _context17.next = 3;
                return WnSys.exec(cmdText, options);

              case 3:
                return _context17.abrupt("return", _context17.sent);

              case 4:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17);
      }))();
    },
    //-------------------------------------
    exec2Json: function exec2Json(cmdText) {
      var _arguments11 = arguments;
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18() {
        var options;
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                options = _arguments11.length > 1 && _arguments11[1] !== undefined ? _arguments11[1] : {
                  as: "json"
                };
                _context18.next = 3;
                return WnSys.exec2(cmdText, options);

              case 3:
                return _context18.abrupt("return", _context18.sent);

              case 4:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18);
      }))();
    } //-------------------------------------

  }; ////////////////////////////////////////////

  return WnSys;
}(); //##################################################
// # import Util    from "./wn-util.mjs"


var Util = function () {
  ////////////////////////////////////////////
  var WnUtil = {
    isMimeText: function isMimeText(mime) {
      return /^text\//.test(mime) || "application/x-javascript" == mime || "application/json" == mime;
    },
    isMimeJson: function isMimeJson(mime) {
      return "text/json" == mime || "application/json" == mime;
    },
    // adapt for old versiton walnut icon attribute
    getIconName: function getIconName(iconHtml) {
      var m = /^<i +class=["'] *(fa|zmdi|im) +(fa|zmdi|im)-([^" ]+) *["']> *<\/i>$/.exec(iconHtml);

      if (m) {
        return m[3];
      }

      return iconHtml;
    },

    /***
     * Gen preview object for a object
     */
    genPreviewObj: function genPreviewObj(meta) {
      // Uploaded thumb preview
      if (meta.thumb) {
        return {
          type: "image",
          value: '/o/thumbnail/id:' + meta.id
        };
      } // Customized Icon


      if (meta.icon) {
        var icon = WnUtil.getIconName(meta.icon);
        return Ti.Icons.get(icon, {
          type: "font",
          value: icon
        });
      } // Default


      return Ti.Icons.get(meta);
    },
    getIconObj: function getIconObj(meta) {
      if (meta && meta.icon) {
        // customized icon object
        if (_.isPlainObject(meta.icon)) {
          return _.assign(Ti.Icons.get(), meta.icon);
        } // customized icon name


        return {
          type: "font",
          value: WnUtil.getIconName(meta.icon)
        };
      } // return default


      return Ti.Icons.get(meta);
    },
    getObjIcon: function getObjIcon(meta, dft) {
      if (!meta) return dft;
      return meta.icon || Ti.Icons.get(meta);
    },

    /***
     * Get icon or thumb for a WnObj
     */
    getObjThumbIcon: function getObjThumbIcon() {
      var _ref12 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          icon = _ref12.icon,
          thumb = _ref12.thumb,
          mime = _ref12.mime,
          type = _ref12.type,
          race = _ref12.race,
          candidateIcon = _ref12.candidateIcon,
          _ref12$timestamp = _ref12.timestamp,
          timestamp = _ref12$timestamp === void 0 ? 0 : _ref12$timestamp;

      var dftIcon = arguments.length > 1 ? arguments[1] : undefined;

      // Thumb as image
      if (thumb) {
        var src = "/o/content?str=".concat(thumb);

        if (timestamp > 0) {
          src += "&_t=".concat(timestamp);
        }

        return {
          type: "image",
          value: src
        };
      } //.............................................
      // Icon


      if (icon) {
        return {
          type: "font",
          value: icon
        };
      } //.............................................
      // Force Default


      if (candidateIcon) {
        return candidateIcon;
      } //.............................................
      // Auto get by type


      if (type || mime || race) {
        return Ti.Icons.get({
          type: type,
          mime: mime,
          race: race
        });
      } // Default


      return dftIcon;
    },
    getObjThumbIcon2: function getObjThumbIcon2(meta, canIcon) {
      //console.log(meta, canIcon)
      if (meta.thumb) {
        var src = "/o/content?str=".concat(meta.thumb);
        return {
          type: "image",
          value: src
        };
      }

      if (meta.icon) {
        return meta.icon;
      }

      if (canIcon) return canIcon;
      return Ti.Icons.get(meta);
    },

    /***
     * return the object readable name
     */
    getObjDisplayName: function getObjDisplayName(meta) {
      var keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      return Ti.Util.getFallbackEmpty(meta, keys, "title", "nm");
    },

    /***
     * Get Object link as `String`
     * 
     * @param meta{String|Object} : Object meta or id as string
     * @param options.appName{String} : Walnut App Name, "wn.manager" as default
     * @param options.encoded{Boolean} : Encode the path or not
     */
    getAppLink: function getAppLink(meta) {
      var _ref13 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref13$appName = _ref13.appName,
          appName = _ref13$appName === void 0 ? "wn.manager" : _ref13$appName,
          _ref13$encoded = _ref13.encoded,
          encoded = _ref13$encoded === void 0 ? true : _ref13$encoded;

      return WnUtil.getLink("/a/open/".concat(appName), meta, {
        pathKey: "ph",
        encoded: true
      });
    },
    getAppLinkStr: function getAppLinkStr(meta, options) {
      return WnUtil.getAppLink(meta, options).toString();
    },
    getObjBadges: function getObjBadges() {
      var meta = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var _ref14 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref14$NW = _ref14.NW,
          NW = _ref14$NW === void 0 ? null : _ref14$NW,
          _ref14$NE = _ref14.NE,
          NE = _ref14$NE === void 0 ? ["ln", "zmdi-open-in-new"] : _ref14$NE,
          _ref14$SW = _ref14.SW,
          SW = _ref14$SW === void 0 ? null : _ref14$SW,
          _ref14$SE = _ref14.SE,
          SE = _ref14$SE === void 0 ? null : _ref14$SE;

      var bg = {};

      var badge = function badge(name, BD) {
        if (!BD) return;

        if (_.isString(BD)) {
          bg[name] = BD;
        }

        if (BD.length == 1) {
          bg[name] = BD[0];
        } else if (BD.length > 1 && meta[BD[0]]) {
          bg[name] = BD[1];
        }
      };

      badge("NW", NW);
      badge("NE", NE);
      badge("SW", SW);
      badge("SE", SE);
      return bg;
    },
    getObjThumbInfo: function getObjThumbInfo() {
      var meta = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var _ref15 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref15$exposeHidden = _ref15.exposeHidden,
          exposeHidden = _ref15$exposeHidden === void 0 ? false : _ref15$exposeHidden,
          _ref15$status = _ref15.status,
          status = _ref15$status === void 0 ? {} : _ref15$status,
          _ref15$progress = _ref15.progress,
          progress = _ref15$progress === void 0 ? {} : _ref15$progress,
          _ref15$badges = _ref15.badges,
          badges = _ref15$badges === void 0 ? undefined : _ref15$badges;

      // Guard
      if (!meta || !meta.nm) {
        return;
      } // Check the visibility


      var visibility = "show";

      if (meta.nm.startsWith(".")) {
        if (exposeHidden) {
          visibility = exposeHidden ? "weak" : "hide";
        }
      } // Generate new Thumb Item


      return {
        id: meta.id,
        nm: meta.nm,
        title: WnUtil.getObjDisplayName(meta),
        preview: WnUtil.genPreviewObj(meta),
        href: WnUtil.getAppLinkStr(meta),
        visibility: visibility,
        status: status[meta.id],
        progress: progress[meta.id],
        badges: WnUtil.getObjBadges(meta, badges)
      };
    },

    /***
     * Get object link for download
     */
    getDownloadLink: function getDownloadLink(meta) {
      var _ref16 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref16$mode = _ref16.mode,
          mode = _ref16$mode === void 0 ? "force" : _ref16$mode;

      return WnUtil.getLink("/o/content", meta, {
        pathKey: "str",
        encoded: true,
        params: {
          d: mode
        }
      });
    },

    /***
     * Get Object link as `Plain Object`
     * 
     * @param url{String} : Target URL
     * @param meta{String|Object} : Object meta or id as string
     * @param options.pathKey{String} : Which key to send object path
     * @param options.encoded{Boolean} : Encode the path or not
     * @param options.params{Object} : Init params value
     * 
     * @return `TiLinkObj`
     */
    getLink: function getLink(url, meta) {
      var _ref17 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref17$pathKey = _ref17.pathKey,
          pathKey = _ref17$pathKey === void 0 ? "ph" : _ref17$pathKey,
          _ref17$encoded = _ref17.encoded,
          encoded = _ref17$encoded === void 0 ? false : _ref17$encoded,
          _ref17$params = _ref17.params,
          params = _ref17$params === void 0 ? {} : _ref17$params;

      var params2 = _objectSpread({}, params);

      if (!meta) {
        return {
          url: url,
          params2: params2
        };
      }

      var __V = function __V(val) {
        return encoded ? encodeURIComponent(val) : val;
      }; // META: "~/path/to/obj"


      if (/^(\/|~)/.test(meta)) {
        params2[pathKey] = __V(meta);
      } // META: "478e..6ea2"
      else if (_.isString(meta)) {
          params2[pathKey] = "id:".concat(meta);
        } // META: {id:"478e..6ea2"}
        else if (meta.id) {
            params2[pathKey] = "id:".concat(meta.id);
          } // META: {ph:"/path/to/obj"}
          else if (meta.ph) {
              params2[pathKey] = __V(meta.ph);
            } // Default return


      return Ti.Util.Link({
        url: url,
        params: params2
      });
    },

    /***
     * Wrap meta to standard tree node
     * 
     * @param meta{Object} - WnObj meta data
     * 
     * @return TreeNode: {id,name,leaf,rawData,children}
     */
    wrapTreeNode: function wrapTreeNode(meta) {
      if (_.isPlainObject(meta)) {
        var node = {
          id: meta.id,
          name: meta.nm,
          leaf: 'DIR' != meta.race,
          rawData: meta
        };

        if (!node.leaf) {
          node.children = [];
        }

        if (node.id && node.name) {
          return node;
        }
      }
    },

    /***
     * @param query{String|Function}
     */
    genQuery: function genQuery(query) {
      var _ref18 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref18$vkey = _ref18.vkey,
          vkey = _ref18$vkey === void 0 ? "val" : _ref18$vkey,
          _ref18$wrapArray = _ref18.wrapArray,
          wrapArray = _ref18$wrapArray === void 0 ? false : _ref18$wrapArray,
          errorAs = _ref18.errorAs,
          _ref18$blankAs = _ref18.blankAs,
          blankAs = _ref18$blankAs === void 0 ? '[]' : _ref18$blankAs;

      // Customized query
      if (_.isFunction(query)) {
        return query;
      } // Array


      if (_.isArray(query)) {
        if (wrapArray) {
          return function () {
            return query;
          };
        }

        return query;
      } // Command template


      if (_.isString(query)) {
        // Query by value 
        if (vkey) {
          return /*#__PURE__*/function () {
            var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(v) {
              var cmdText;
              return regeneratorRuntime.wrap(function _callee19$(_context19) {
                while (1) {
                  switch (_context19.prev = _context19.next) {
                    case 0:
                      cmdText = Ti.S.renderBy(query, _defineProperty({}, vkey, v)); //console.log("exec", cmdText)

                      _context19.next = 3;
                      return Wn.Sys.exec2(cmdText, {
                        as: "json",
                        input: v,
                        errorAs: errorAs,
                        blankAs: blankAs
                      });

                    case 3:
                      return _context19.abrupt("return", _context19.sent);

                    case 4:
                    case "end":
                      return _context19.stop();
                  }
                }
              }, _callee19);
            }));

            return function (_x2) {
              return _ref19.apply(this, arguments);
            };
          }();
        } // Query directly
        else {
            return /*#__PURE__*/function () {
              var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(v) {
                return regeneratorRuntime.wrap(function _callee20$(_context20) {
                  while (1) {
                    switch (_context20.prev = _context20.next) {
                      case 0:
                        _context20.next = 2;
                        return Wn.Sys.exec2(query, {
                          as: "json",
                          errorAs: errorAs,
                          blankAs: blankAs
                        });

                      case 2:
                        return _context20.abrupt("return", _context20.sent);

                      case 3:
                      case "end":
                        return _context20.stop();
                    }
                  }
                }, _callee20);
              }));

              return function (_x3) {
                return _ref20.apply(this, arguments);
              };
            }();
          }
      }
    }
  }; ////////////////////////////////////////////

  return WnUtil;
}(); //##################################################
// # import Dict    from "./wn-dict.mjs"


var Dict = function () {
  ///////////////////////////////////////////////////////////
  var WnDict = {
    /***
     * @return {Ti.Dict}
     */
    evalOptionsDict: function evalOptionsDict(_ref21, hooks) {
      var options = _ref21.options,
          findBy = _ref21.findBy,
          itemBy = _ref21.itemBy,
          childrenBy = _ref21.childrenBy,
          valueBy = _ref21.valueBy,
          textBy = _ref21.textBy,
          iconBy = _ref21.iconBy,
          _ref21$dictShadowed = _ref21.dictShadowed,
          dictShadowed = _ref21$dictShadowed === void 0 ? true : _ref21$dictShadowed;
      // Quck Dict Name
      var dictName = Ti.DictFactory.DictReferName(options);

      if (dictName) {
        return Ti.DictFactory.CheckDict(dictName, hooks);
      } // Explaint 


      return Ti.DictFactory.CreateDict({
        //...............................................
        data: Wn.Util.genQuery(options, {
          vkey: null,
          blankAs: "[]"
        }),
        query: Wn.Util.genQuery(findBy, {
          blankAs: "[]"
        }),
        item: Wn.Util.genQuery(itemBy, {
          errorAs: null,
          blankAs: "{}"
        }),
        children: Wn.Util.genQuery(childrenBy, {
          errorAs: null,
          blankAs: "[]"
        }),
        //...............................................
        getValue: Ti.Util.genGetter(valueBy || "id|value"),
        getText: Ti.Util.genGetter(textBy || "title|text|nm"),
        getIcon: Ti.Util.genGetter(iconBy || Wn.Util.getObjThumbIcon) //...............................................

      }, {
        shadowed: dictShadowed,
        hooks: hooks
      });
    },
    //-------------------------------------------------------

    /***
     * Setup dictionary set
     */
    setup: function setup(dicts) {
      //console.log(dicts)
      _.forEach(dicts, function (dict, name) {
        var d = Ti.DictFactory.GetDict(name);

        if (!d) {
          //console.log("create", name, dict)
          Ti.DictFactory.CreateDict({
            //...............................................
            data: Wn.Util.genQuery(dict.data, {
              vkey: null
            }),
            query: Wn.Util.genQuery(dict.query),
            item: Wn.Util.genQuery(dict.item, {
              blankAs: "{}"
            }),
            children: Wn.Util.genQuery(dict.children),
            //...............................................
            getValue: Ti.Util.genGetter(dict.value),
            getText: Ti.Util.genGetter(dict.text),
            getIcon: Ti.Util.genGetter(dict.icon),
            //...............................................
            shadowed: Ti.Util.fallback(dict.shadowed, true) //...............................................

          }, {
            name: name
          });
        }
      });
    },
    //-------------------------------------------------------

    /***
     * 
     */
    hMakerComponents: function hMakerComponents() {
      return Ti.DictFactory.GetOrCreate({
        //...............................................
        data: Wn.Util.genQuery("ti coms -cqn", {
          vkey: null
        }),
        //...............................................
        getValue: function getValue(it) {
          return it.name;
        },
        getText: function getText(it) {
          return it.title || it.name;
        },
        getIcon: function getIcon(it) {
          return it.icon || "im-plugin";
        },
        //...............................................
        isMatched: function isMatched(it, v) {
          if (it.name == v || it.title == v) {
            return true;
          }

          if (it.name && it.name.indexOf(v) >= 0) {
            return true;
          }

          if (it.title) {
            if (it.title.indexOf(v) >= 0) {
              return true;
            }

            var text = Ti.I18n.text(it.title);

            if (text && text.indexOf(v) >= 0) {
              return true;
            }
          }

          return false;
        },
        //...............................................
        shadowed: true //...............................................

      }, {
        name: "hMakerComponents"
      });
    } //-------------------------------------------------------

  }; ///////////////////////////////////////////////////////////

  return WnDict;
}(); //##################################################
// # import OpenObjSelector  from "./wn-open-obj-selector.mjs"


var OpenObjSelector = function () {
  /***
   * Open Modal Dialog to explore one or multi files
   */
  function OpenObjSelector() {
    return _OpenObjSelector.apply(this, arguments);
  } ////////////////////////////////////////////


  function _OpenObjSelector() {
    _OpenObjSelector = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22() {
      var pathOrObj,
          _ref22,
          _ref22$title,
          title,
          _ref22$icon,
          icon,
          _ref22$type,
          type,
          _ref22$closer,
          closer,
          _ref22$textOk,
          textOk,
          _ref22$textCancel,
          textCancel,
          _ref22$position,
          position,
          _ref22$width,
          width,
          _ref22$height,
          height,
          spacing,
          _ref22$multi,
          multi,
          _ref22$fromIndex,
          fromIndex,
          _ref22$homePath,
          homePath,
          _ref22$fallbackPath,
          fallbackPath,
          _ref22$filter,
          filter,
          _ref22$selected,
          selected,
          meta,
          reObj,
          _args22 = arguments;

      return regeneratorRuntime.wrap(function _callee22$(_context22) {
        while (1) {
          switch (_context22.prev = _context22.next) {
            case 0:
              pathOrObj = _args22.length > 0 && _args22[0] !== undefined ? _args22[0] : "~";
              _ref22 = _args22.length > 1 && _args22[1] !== undefined ? _args22[1] : {}, _ref22$title = _ref22.title, title = _ref22$title === void 0 ? "i18n:select" : _ref22$title, _ref22$icon = _ref22.icon, icon = _ref22$icon === void 0 ? "im-folder-open" : _ref22$icon, _ref22$type = _ref22.type, type = _ref22$type === void 0 ? "info" : _ref22$type, _ref22$closer = _ref22.closer, closer = _ref22$closer === void 0 ? true : _ref22$closer, _ref22$textOk = _ref22.textOk, textOk = _ref22$textOk === void 0 ? "i18n:ok" : _ref22$textOk, _ref22$textCancel = _ref22.textCancel, textCancel = _ref22$textCancel === void 0 ? "i18n:cancel" : _ref22$textCancel, _ref22$position = _ref22.position, position = _ref22$position === void 0 ? "top" : _ref22$position, _ref22$width = _ref22.width, width = _ref22$width === void 0 ? "80%" : _ref22$width, _ref22$height = _ref22.height, height = _ref22$height === void 0 ? "90%" : _ref22$height, spacing = _ref22.spacing, _ref22$multi = _ref22.multi, multi = _ref22$multi === void 0 ? true : _ref22$multi, _ref22$fromIndex = _ref22.fromIndex, fromIndex = _ref22$fromIndex === void 0 ? 0 : _ref22$fromIndex, _ref22$homePath = _ref22.homePath, homePath = _ref22$homePath === void 0 ? Wn.Session.getHomePath() : _ref22$homePath, _ref22$fallbackPath = _ref22.fallbackPath, fallbackPath = _ref22$fallbackPath === void 0 ? Wn.Session.getHomePath() : _ref22$fallbackPath, _ref22$filter = _ref22.filter, filter = _ref22$filter === void 0 ? function (o) {
                return "FILE" == o.race;
              } : _ref22$filter, _ref22$selected = _ref22.selected, selected = _ref22$selected === void 0 ? [] : _ref22$selected;
              //................................................
              // Load the target object
              meta = pathOrObj;

              if (!_.isString(pathOrObj)) {
                _context22.next = 7;
                break;
              }

              _context22.next = 6;
              return Wn.Io.loadMeta(pathOrObj);

            case 6:
              meta = _context22.sent;

            case 7:
              if (!(!meta && fallbackPath && pathOrObj != fallbackPath)) {
                _context22.next = 11;
                break;
              }

              _context22.next = 10;
              return Wn.Io.loadMeta(fallbackPath);

            case 10:
              meta = _context22.sent;

            case 11:
              if (meta) {
                _context22.next = 15;
                break;
              }

              _context22.next = 14;
              return Ti.Toast.Open({
                content: "i18n:e-io-obj-noexistsf",
                vars: _.isString(pathOrObj) ? {
                  ph: pathOrObj,
                  nm: Ti.Util.getFileName(pathOrObj)
                } : pathOrObj.ph
              }, "warn");

            case 14:
              return _context22.abrupt("return", _context22.sent);

            case 15:
              if (!("DIR" != meta.race)) {
                _context22.next = 23;
                break;
              }

              _context22.next = 18;
              return Wn.Io.loadMetaById(meta.pid);

            case 18:
              meta = _context22.sent;

              if (meta) {
                _context22.next = 23;
                break;
              }

              _context22.next = 22;
              return Ti.Toast.Open({
                content: "i18n:e-io-obj-noexistsf",
                vars: {
                  ph: "Parent of id:".concat(meta.id, "->pid:").concat(meta.pid),
                  nm: "Parent of id:".concat(meta.nm, "->pid:").concat(meta.pid)
                }
              }, "warn");

            case 22:
              return _context22.abrupt("return", _context22.sent);

            case 23:
              _context22.next = 25;
              return Ti.App.Open({
                //------------------------------------------
                type: type,
                width: width,
                height: height,
                spacing: spacing,
                position: position,
                closer: closer,
                icon: icon,
                title: title,
                //------------------------------------------
                actions: [{
                  text: textOk,
                  handler: function handler(_ref23) {
                    var $main = _ref23.$main;
                    return $main.myChecked;
                  }
                }, {
                  text: textCancel,
                  handler: function handler() {
                    return undefined;
                  }
                }],
                //------------------------------------------
                modules: {
                  current: "@mod:wn/obj-meta",
                  main: "@mod:wn/obj-current"
                },
                //------------------------------------------
                comType: "modal-inner-body",
                //------------------------------------------
                components: [{
                  //////////////////////////////////////////
                  name: "modal-inner-body",
                  globally: false,
                  //////////////////////////////////////////
                  data: {
                    myChecked: [],
                    myShown: {}
                  },
                  //////////////////////////////////////////
                  props: {
                    "icon": undefined,
                    "text": undefined,
                    "trimed": undefined,
                    "placeholder": undefined,
                    "valueCase": undefined,
                    "value": undefined
                  },
                  //////////////////////////////////////////
                  template: "<ti-gui\n          :layout=\"theLayout\"\n          :schema=\"theSchema\"\n          :shown=\"myShown\"\n          :can-loading=\"true\"\n          :loading-as=\"status.reloading\"\n          @sky::item:active=\"OnCurrentMetaChange\"\n          @arena::open=\"OnCurrentMetaChange\"\n          @arena::select=\"OnArenaSelect\"/>",
                  //////////////////////////////////////////
                  computed: _objectSpread({}, Vuex.mapGetters("current", {
                    "obj": "get",
                    "objHome": "getHome",
                    "objIsHome": "isHome",
                    "objHasParent": "hasParent",
                    "objParentIsHome": "parentIsHome"
                  }), {}, Vuex.mapState("main", ["data", "status"]), {
                    //--------------------------------------
                    theCrumbData: function theCrumbData() {
                      var _this2 = this;

                      return Wn.Obj.evalCrumbData({
                        meta: _.get(this.obj, "meta"),
                        ancestors: _.get(this.obj, "ancestors"),
                        fromIndex: fromIndex,
                        homePath: homePath
                      }, function (item) {
                        item.asterisk = _.get(_this2.mainStatus, "changed");
                      });
                    },
                    //--------------------------------------
                    theLayout: function theLayout() {
                      return {
                        type: "rows",
                        border: true,
                        blocks: [{
                          name: "sky",
                          size: ".5rem",
                          body: "sky"
                        }, {
                          name: "arena",
                          body: "main"
                        }]
                      };
                    },
                    //--------------------------------------
                    theSchema: function theSchema() {
                      return {
                        "sky": {
                          comType: "ti-crumb",
                          comConf: {
                            "style": {
                              padding: "0 .1rem"
                            },
                            "data": this.theCrumbData
                          }
                        },
                        "main": {
                          comType: "wn-adaptlist",
                          comConf: {
                            "meta": this.obj,
                            "data": this.data,
                            "status": this.status,
                            "multi": multi,
                            "listConf": {
                              resizeDelay: 200
                            }
                          }
                        }
                      };
                    }
                  }),
                  //////////////////////////////////////////
                  methods: {
                    //--------------------------------------
                    OnCurrentMetaChange: function OnCurrentMetaChange() {
                      var _ref24 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                          id = _ref24.id,
                          path = _ref24.path,
                          value = _ref24.value;

                      this.open(id || path || value);
                    },
                    //--------------------------------------
                    OnArenaSelect: function OnArenaSelect(_ref25) {
                      var checked = _ref25.checked;
                      //console.log("OnArenaSelect", checked)
                      if (_.isFunction(filter)) this.myChecked = _.filter(checked, filter);else this.myChecked = checked;
                    },
                    //--------------------------------------
                    open: function open(obj) {
                      var _this3 = this;

                      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21() {
                        var app;
                        return regeneratorRuntime.wrap(function _callee21$(_context21) {
                          while (1) {
                            switch (_context21.prev = _context21.next) {
                              case 0:
                                if (obj) {
                                  _context21.next = 2;
                                  break;
                                }

                                return _context21.abrupt("return");

                              case 2:
                                if (!_.isString(obj)) {
                                  _context21.next = 6;
                                  break;
                                }

                                _context21.next = 5;
                                return Wn.Io.loadMetaBy(obj);

                              case 5:
                                obj = _context21.sent;

                              case 6:
                                // Only can enter DIR
                                if (obj && "DIR" == obj.race) {
                                  app = Ti.App(_this3);
                                  app.dispatch("current/reload", obj);
                                  app.dispatch("main/reload", obj);
                                }

                              case 7:
                              case "end":
                                return _context21.stop();
                            }
                          }
                        }, _callee21);
                      }))();
                    } //--------------------------------------

                  },
                  //////////////////////////////////////////
                  mounted: function mounted() {
                    this.open(meta);
                  } //////////////////////////////////////////

                }] //------------------------------------------

              });

            case 25:
              reObj = _context22.sent;
              return _context22.abrupt("return", reObj);

            case 27:
            case "end":
              return _context22.stop();
          }
        }
      }, _callee22);
    }));
    return _OpenObjSelector.apply(this, arguments);
  }

  return OpenObjSelector;
}(); //##################################################
// # import OpenThingManager from "./wn-open-thing-manager.mjs"


var OpenThingManager = function () {
  /***
   * Open Modal Dialog to manage a thing set
   */
  function OpenThingManager(_x4) {
    return _OpenThingManager.apply(this, arguments);
  } ////////////////////////////////////////////


  function _OpenThingManager() {
    _OpenThingManager = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24(pathOrObj) {
      var _ref26,
          _ref26$textOk,
          textOk,
          _ref26$icon,
          icon,
          title,
          _ref26$ok,
          ok,
          _ref26$textCancel,
          textCancel,
          _ref26$position,
          position,
          _ref26$width,
          width,
          _ref26$height,
          height,
          spacing,
          oTs,
          view,
          _args24 = arguments;

      return regeneratorRuntime.wrap(function _callee24$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
              _ref26 = _args24.length > 1 && _args24[1] !== undefined ? _args24[1] : {}, _ref26$textOk = _ref26.textOk, textOk = _ref26$textOk === void 0 ? "i18n:ok" : _ref26$textOk, _ref26$icon = _ref26.icon, icon = _ref26$icon === void 0 ? "fas-database" : _ref26$icon, title = _ref26.title, _ref26$ok = _ref26.ok, ok = _ref26$ok === void 0 ? function (_ref27) {
                var result = _ref27.result;
                return result;
              } : _ref26$ok, _ref26$textCancel = _ref26.textCancel, textCancel = _ref26$textCancel === void 0 ? "i18n:close" : _ref26$textCancel, _ref26$position = _ref26.position, position = _ref26$position === void 0 ? "top" : _ref26$position, _ref26$width = _ref26.width, width = _ref26$width === void 0 ? "96%" : _ref26$width, _ref26$height = _ref26.height, height = _ref26$height === void 0 ? "96%" : _ref26$height, spacing = _ref26.spacing;

              if (!Ti.Util.isNil(pathOrObj)) {
                _context24.next = 5;
                break;
              }

              _context24.next = 4;
              return Ti.Toast.Open("ThingSet path is nil", "warn");

            case 4:
              return _context24.abrupt("return", _context24.sent);

            case 5:
              if (!_.isString(pathOrObj)) {
                _context24.next = 11;
                break;
              }

              _context24.next = 8;
              return Wn.Io.loadMeta(pathOrObj);

            case 8:
              _context24.t0 = _context24.sent;
              _context24.next = 12;
              break;

            case 11:
              _context24.t0 = pathOrObj;

            case 12:
              oTs = _context24.t0;

              if (oTs) {
                _context24.next = 17;
                break;
              }

              _context24.next = 16;
              return Ti.Toast.Open("Fail to found ThingSet: ".concat(pathOrObj), "warn");

            case 16:
              return _context24.abrupt("return", _context24.sent);

            case 17:
              // Forbid the auto select
              oTs.th_auto_select = false; // Load default actions

              _context24.next = 20;
              return Wn.Sys.exec("ti views id:".concat(oTs.id, " -cqn"), {
                as: "json"
              });

            case 20:
              view = _context24.sent;
              _context24.next = 23;
              return Ti.App.Open({
                icon: icon,
                title: title || oTs.title || oTs.nm,
                position: position,
                width: width,
                height: height,
                escape: false,
                topActions: view.actions,
                //------------------------------------------
                textOk: textOk,
                textCancel: textCancel,
                ok: ok,
                //------------------------------------------
                modules: {
                  current: "@mod:wn/obj-current",
                  main: "@mod:wn/thing"
                },
                //------------------------------------------
                comType: "wn-thing-manager",
                comConf: {
                  "...": "=Main",
                  emitChange: true
                },
                //------------------------------------------
                components: ["@com:wn/thing/manager"],
                //------------------------------------------
                preload: function () {
                  var _preload = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(app) {
                    return regeneratorRuntime.wrap(function _callee23$(_context23) {
                      while (1) {
                        switch (_context23.prev = _context23.next) {
                          case 0:
                            app.commit("current/setMeta", oTs);
                            _context23.next = 3;
                            return app.dispatch("main/reload", oTs);

                          case 3:
                          case "end":
                            return _context23.stop();
                        }
                      }
                    }, _callee23);
                  }));

                  function preload(_x5) {
                    return _preload.apply(this, arguments);
                  }

                  return preload;
                }()
              });

            case 23:
              return _context24.abrupt("return", _context24.sent);

            case 24:
            case "end":
              return _context24.stop();
          }
        }
      }, _callee24);
    }));
    return _OpenThingManager.apply(this, arguments);
  }

  return OpenThingManager;
}(); //##################################################
// # import EditObjMeta      from "./wn-edit-obj-meta.mjs"


var EditObjMeta = function () {
  ////////////////////////////////////////////////////
  function EditObjMeta() {
    return _EditObjMeta.apply(this, arguments);
  } ////////////////////////////////////////////////////


  function _EditObjMeta() {
    _EditObjMeta = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25() {
      var pathOrObj,
          _ref28,
          icon,
          title,
          _ref28$type,
          type,
          _ref28$closer,
          closer,
          _ref28$escape,
          escape,
          _ref28$textOk,
          textOk,
          _ref28$textCancel,
          textCancel,
          _ref28$position,
          position,
          _ref28$width,
          width,
          _ref28$height,
          height,
          spacing,
          _ref28$currentTab,
          currentTab,
          _ref28$fields,
          fields,
          _ref28$fixedKeys,
          fixedKeys,
          _ref28$saveKeys,
          saveKeys,
          _ref28$autoSave,
          autoSave,
          meta,
          fixeds,
          saves,
          _reo2,
          myFormFields,
          theIcon,
          theTitle,
          reo,
          updates,
          saved,
          json,
          cmdText,
          newMeta,
          _args25 = arguments;

      return regeneratorRuntime.wrap(function _callee25$(_context25) {
        while (1) {
          switch (_context25.prev = _context25.next) {
            case 0:
              pathOrObj = _args25.length > 0 && _args25[0] !== undefined ? _args25[0] : "~";
              _ref28 = _args25.length > 1 && _args25[1] !== undefined ? _args25[1] : {}, icon = _ref28.icon, title = _ref28.title, _ref28$type = _ref28.type, type = _ref28$type === void 0 ? "info" : _ref28$type, _ref28$closer = _ref28.closer, closer = _ref28$closer === void 0 ? true : _ref28$closer, _ref28$escape = _ref28.escape, escape = _ref28$escape === void 0 ? true : _ref28$escape, _ref28$textOk = _ref28.textOk, textOk = _ref28$textOk === void 0 ? "i18n:ok" : _ref28$textOk, _ref28$textCancel = _ref28.textCancel, textCancel = _ref28$textCancel === void 0 ? "i18n:cancel" : _ref28$textCancel, _ref28$position = _ref28.position, position = _ref28$position === void 0 ? "top" : _ref28$position, _ref28$width = _ref28.width, width = _ref28$width === void 0 ? 640 : _ref28$width, _ref28$height = _ref28.height, height = _ref28$height === void 0 ? "90%" : _ref28$height, spacing = _ref28.spacing, _ref28$currentTab = _ref28.currentTab, currentTab = _ref28$currentTab === void 0 ? 0 : _ref28$currentTab, _ref28$fields = _ref28.fields, fields = _ref28$fields === void 0 ? [] : _ref28$fields, _ref28$fixedKeys = _ref28.fixedKeys, fixedKeys = _ref28$fixedKeys === void 0 ? ["thumb"] : _ref28$fixedKeys, _ref28$saveKeys = _ref28.saveKeys, saveKeys = _ref28$saveKeys === void 0 ? ["thumb"] : _ref28$saveKeys, _ref28$autoSave = _ref28.autoSave, autoSave = _ref28$autoSave === void 0 ? true : _ref28$autoSave;
              //............................................
              // Load meta
              meta = pathOrObj;

              if (!_.isString(meta)) {
                _context25.next = 7;
                break;
              }

              _context25.next = 6;
              return Wn.Io.loadMeta(pathOrObj);

            case 6:
              meta = _context25.sent;

            case 7:
              //............................................
              // Fixed key map
              fixeds = {};

              _.forEach(fixedKeys, function (k) {
                return fixeds[k] = true;
              }); //............................................
              // Save key map


              saves = {};

              _.forEach(saveKeys, function (k) {
                return saves[k] = true;
              }); //............................................
              // Auto load 


              if (!("auto" == fields)) {
                _context25.next = 16;
                break;
              }

              _context25.next = 14;
              return Wn.Sys.exec2("ti metas id:".concat(meta.id, " -cqn"), {
                as: "json"
              });

            case 14:
              _reo2 = _context25.sent;

              if (_reo2) {
                fields = _reo2.fields;
                currentTab = _reo2.currentTab || currentTab || 0;
              }

            case 16:
              //............................................
              // Default tabs
              if (_.isEmpty(fields) || !_.isArray(fields)) {
                fields = [{
                  title: "basic",
                  fields: ["id", "nm", "title", "icon", "thumb", "ph", "race", "tp", "mime", "width", "height", "len", "sha1"]
                }, {
                  title: "privilege",
                  fields: ["c", "m", "g", "md", "pvg"]
                }, {
                  title: "timestamp",
                  fields: ["ct", "lm", "expi"]
                }, {
                  title: "others",
                  fields: ["..."]
                }];
              } //............................................


              myFormFields = Wn.Obj.evalFields(meta, fields, function (fld) {
                if (fixeds[fld.uniqKey]) {
                  return fld;
                }

                if (fld.quickName && _.isUndefined(fld.value)) {
                  return;
                }

                return fld;
              }); //............................................

              theIcon = icon || Wn.Util.getObjIcon(meta, "zmdi-info-outline");
              theTitle = title || Wn.Util.getObjDisplayName(meta); //............................................

              _context25.next = 22;
              return Ti.App.Open({
                //------------------------------------------
                type: type,
                width: width,
                height: height,
                spacing: spacing,
                position: position,
                closer: closer,
                escape: escape,
                icon: theIcon,
                title: theTitle,
                //------------------------------------------
                actions: [{
                  text: textOk,
                  handler: function handler(_ref29) {
                    var $main = _ref29.$main;
                    return _.cloneDeep({
                      updates: $main.updates,
                      data: $main.meta
                    });
                  }
                }, {
                  text: textCancel,
                  handler: function handler(_ref30) {
                    var $main = _ref30.$main;

                    // Is in saveKeys
                    var ks = _.keys($main.updates);

                    var _iterator5 = _createForOfIteratorHelper(ks),
                        _step5;

                    try {
                      for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                        var k = _step5.value;

                        if (saves[k]) {
                          return _.cloneDeep({
                            updates: $main.updates,
                            data: $main.meta
                          });
                        }
                      } // Nothing be updated, just return undefined

                    } catch (err) {
                      _iterator5.e(err);
                    } finally {
                      _iterator5.f();
                    }
                  }
                }],
                //------------------------------------------
                comType: "modal-inner-body",
                //------------------------------------------
                components: [{
                  name: "modal-inner-body",
                  globally: false,
                  data: {
                    myFormFields: myFormFields,
                    currentTab: currentTab,
                    meta: meta,
                    updates: {}
                  },
                  template: "<ti-form\n          mode=\"tab\"\n          :current-tab=\"currentTab\"\n          :fields=\"myFormFields\"\n          :data=\"meta\"\n          @field:change=\"onFieldChange\"\n          @change=\"onChange\"\n          />",
                  methods: {
                    onChange: function onChange(data) {
                      this.meta = data;
                    },
                    onFieldChange: function onFieldChange() {
                      var _ref31 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                          name = _ref31.name,
                          value = _ref31.value;

                      var obj = Ti.Types.toObjByPair({
                        name: name,
                        value: value
                      });
                      this.updates = _.assign({}, this.updates, obj);
                    }
                  }
                }, "@com:ti/form", "@com:wn/imgfile"] //------------------------------------------

              });

            case 22:
              reo = _context25.sent;

              if (reo) {
                _context25.next = 25;
                break;
              }

              return _context25.abrupt("return");

            case 25:
              //............................................
              updates = reo.updates;
              saved = false;

              if (!(autoSave && !_.isEmpty(updates))) {
                _context25.next = 37;
                break;
              }

              json = JSON.stringify(updates);
              cmdText = "obj 'id:".concat(meta.id, "' -ocqn -u");
              _context25.next = 32;
              return Wn.Sys.exec2(cmdText, {
                input: json,
                as: "json"
              });

            case 32:
              newMeta = _context25.sent;
              _context25.next = 35;
              return Ti.Toast.Open("i18n:save-done", "success");

            case 35:
              saved = true;
              return _context25.abrupt("return", {
                updates: updates,
                data: newMeta,
                saved: saved
              });

            case 37:
              return _context25.abrupt("return", reo);

            case 38:
            case "end":
              return _context25.stop();
          }
        }
      }, _callee25);
    }));
    return _EditObjMeta.apply(this, arguments);
  }

  return EditObjMeta;
}(); //##################################################
// # import EditObjContent   from "./wn-edit-obj-content.mjs"


var EditObjContent = function () {
  ////////////////////////////////////////////////////
  function EditObjContent() {
    return _EditObjContent.apply(this, arguments);
  } ////////////////////////////////////////////////////


  function _EditObjContent() {
    _EditObjContent = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26() {
      var pathOrObj,
          _ref32,
          title,
          icon,
          _ref32$type,
          type,
          _ref32$closer,
          closer,
          _ref32$textOk,
          textOk,
          _ref32$textCancel,
          textCancel,
          _ref32$position,
          position,
          _ref32$width,
          width,
          _ref32$height,
          height,
          spacing,
          _ref32$readonly,
          readonly,
          _ref32$showEditorTitl,
          showEditorTitle,
          content,
          _ref32$placeholder,
          placeholder,
          meta,
          autoSave,
          theIcon,
          theTitle,
          theContent,
          newContent,
          _args26 = arguments;

      return regeneratorRuntime.wrap(function _callee26$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              pathOrObj = _args26.length > 0 && _args26[0] !== undefined ? _args26[0] : "~";
              _ref32 = _args26.length > 1 && _args26[1] !== undefined ? _args26[1] : {}, title = _ref32.title, icon = _ref32.icon, _ref32$type = _ref32.type, type = _ref32$type === void 0 ? "info" : _ref32$type, _ref32$closer = _ref32.closer, closer = _ref32$closer === void 0 ? true : _ref32$closer, _ref32$textOk = _ref32.textOk, textOk = _ref32$textOk === void 0 ? undefined : _ref32$textOk, _ref32$textCancel = _ref32.textCancel, textCancel = _ref32$textCancel === void 0 ? "i18n:cancel" : _ref32$textCancel, _ref32$position = _ref32.position, position = _ref32$position === void 0 ? "top" : _ref32$position, _ref32$width = _ref32.width, width = _ref32$width === void 0 ? 640 : _ref32$width, _ref32$height = _ref32.height, height = _ref32$height === void 0 ? "80%" : _ref32$height, spacing = _ref32.spacing, _ref32$readonly = _ref32.readonly, readonly = _ref32$readonly === void 0 ? false : _ref32$readonly, _ref32$showEditorTitl = _ref32.showEditorTitle, showEditorTitle = _ref32$showEditorTitl === void 0 ? true : _ref32$showEditorTitl, content = _ref32.content, _ref32$placeholder = _ref32.placeholder, placeholder = _ref32$placeholder === void 0 ? "i18n:blank" : _ref32$placeholder;
              //............................................
              // Load meta
              meta = pathOrObj;

              if (!_.isString(meta)) {
                _context26.next = 7;
                break;
              }

              _context26.next = 6;
              return Wn.Io.loadMeta(pathOrObj);

            case 6:
              meta = _context26.sent;

            case 7:
              //............................................
              if (_.isUndefined(textOk)) {
                textOk = this.saveBy ? 'i18n:save' : 'i18n:ok';
              } //............................................


              autoSave = Ti.Util.isNil(content); //............................................

              theIcon = icon || Wn.Util.getObjIcon(meta, "zmdi-receipt");
              theTitle = title || "i18n:edit";

              if (!autoSave) {
                _context26.next = 17;
                break;
              }

              _context26.next = 14;
              return Wn.Io.loadContent(meta);

            case 14:
              _context26.t0 = _context26.sent;
              _context26.next = 18;
              break;

            case 17:
              _context26.t0 = content;

            case 18:
              theContent = _context26.t0;
              _context26.next = 21;
              return Ti.App.Open({
                //------------------------------------------
                type: type,
                width: width,
                height: height,
                spacing: spacing,
                position: position,
                closer: closer,
                title: theTitle,
                result: theContent,
                //------------------------------------------
                comType: "ti-text-raw",
                comConf: {
                  readonly: readonly,
                  placeholder: placeholder,
                  icon: theIcon,
                  title: Wn.Util.getObjDisplayName(meta),
                  content: theContent,
                  showTitle: showEditorTitle,
                  ignoreKeyUp: true
                },
                //------------------------------------------
                components: ["@com:ti/text/raw"] //------------------------------------------

              });

            case 21:
              newContent = _context26.sent;

              if (!(autoSave && !_.isUndefined(newContent) && newContent != theContent)) {
                _context26.next = 27;
                break;
              }

              _context26.next = 25;
              return Wn.Io.saveContentAsText(meta, newContent);

            case 25:
              _context26.next = 27;
              return Ti.Toast.Open("i18n:save-done", "success");

            case 27:
              return _context26.abrupt("return", newContent);

            case 28:
            case "end":
              return _context26.stop();
          }
        }
      }, _callee26, this);
    }));
    return _EditObjContent.apply(this, arguments);
  }

  return EditObjContent;
}(); //##################################################
// # import EditTiComponent  from "./wn-edit-ti-component.mjs"


var EditTiComponent = function () {
  ////////////////////////////////////////////////////
  function EditTiComponent() {
    return _EditTiComponent.apply(this, arguments);
  } ////////////////////////////////////////////////////


  function _EditTiComponent() {
    _EditTiComponent = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27() {
      var _ref33,
          comType,
          comConf,
          _ref34,
          _ref34$icon,
          icon,
          _ref34$title,
          title,
          _ref34$type,
          type,
          _ref34$closer,
          closer,
          _ref34$textOk,
          textOk,
          _ref34$textCancel,
          textCancel,
          _ref34$position,
          position,
          _ref34$width,
          width,
          _ref34$height,
          height,
          spacing,
          _args27 = arguments;

      return regeneratorRuntime.wrap(function _callee27$(_context27) {
        while (1) {
          switch (_context27.prev = _context27.next) {
            case 0:
              _ref33 = _args27.length > 0 && _args27[0] !== undefined ? _args27[0] : {}, comType = _ref33.comType, comConf = _ref33.comConf;
              _ref34 = _args27.length > 1 && _args27[1] !== undefined ? _args27[1] : {}, _ref34$icon = _ref34.icon, icon = _ref34$icon === void 0 ? "fas-pencil-ruler" : _ref34$icon, _ref34$title = _ref34.title, title = _ref34$title === void 0 ? "i18n:edit-com" : _ref34$title, _ref34$type = _ref34.type, type = _ref34$type === void 0 ? "info" : _ref34$type, _ref34$closer = _ref34.closer, closer = _ref34$closer === void 0 ? true : _ref34$closer, _ref34$textOk = _ref34.textOk, textOk = _ref34$textOk === void 0 ? "i18n:ok" : _ref34$textOk, _ref34$textCancel = _ref34.textCancel, textCancel = _ref34$textCancel === void 0 ? "i18n:cancel" : _ref34$textCancel, _ref34$position = _ref34.position, position = _ref34$position === void 0 ? "top" : _ref34$position, _ref34$width = _ref34.width, width = _ref34$width === void 0 ? 800 : _ref34$width, _ref34$height = _ref34.height, height = _ref34$height === void 0 ? "90%" : _ref34$height, spacing = _ref34.spacing;
              _context27.next = 4;
              return Ti.App.Open({
                //------------------------------------------
                type: type,
                width: width,
                height: height,
                spacing: spacing,
                position: position,
                closer: closer,
                icon: icon,
                title: title,
                textOk: textOk,
                textCancel: textCancel,
                //------------------------------------------
                comType: "hmaker-edit-com",
                comConf: {
                  value: {
                    comType: comType,
                    comConf: comConf
                  }
                },
                //------------------------------------------
                result: {
                  comType: comType,
                  comConf: _.cloneDeep(comConf)
                },
                //------------------------------------------
                components: ["@com:hmaker/edit-com"] //------------------------------------------

              });

            case 4:
              return _context27.abrupt("return", _context27.sent);

            case 5:
            case "end":
              return _context27.stop();
          }
        }
      }, _callee27);
    }));
    return _EditTiComponent.apply(this, arguments);
  }

  return EditTiComponent;
}(); //##################################################
// # import OpenCmdPanel     from "./wn-run-cmd-panel.mjs"


var OpenCmdPanel = function () {
  /***
   * Open Modal Dialog to explore one or multi files
   */
  function OpenCmdPanel(_x6) {
    return _OpenCmdPanel.apply(this, arguments);
  } ////////////////////////////////////////////


  function _OpenCmdPanel() {
    _OpenCmdPanel = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28(cmdText) {
      var _ref35,
          _ref35$title,
          title,
          _ref35$icon,
          icon,
          _ref35$type,
          type,
          _ref35$closer,
          closer,
          _ref35$textCancel,
          textCancel,
          _ref35$position,
          position,
          _ref35$width,
          width,
          _ref35$height,
          height,
          spacing,
          vars,
          _args28 = arguments;

      return regeneratorRuntime.wrap(function _callee28$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
              _ref35 = _args28.length > 1 && _args28[1] !== undefined ? _args28[1] : {}, _ref35$title = _ref35.title, title = _ref35$title === void 0 ? "i18n:run" : _ref35$title, _ref35$icon = _ref35.icon, icon = _ref35$icon === void 0 ? "fas-running" : _ref35$icon, _ref35$type = _ref35.type, type = _ref35$type === void 0 ? "info" : _ref35$type, _ref35$closer = _ref35.closer, closer = _ref35$closer === void 0 ? true : _ref35$closer, _ref35$textCancel = _ref35.textCancel, textCancel = _ref35$textCancel === void 0 ? "i18n:close" : _ref35$textCancel, _ref35$position = _ref35.position, position = _ref35$position === void 0 ? "top" : _ref35$position, _ref35$width = _ref35.width, width = _ref35$width === void 0 ? "80%" : _ref35$width, _ref35$height = _ref35.height, height = _ref35$height === void 0 ? "90%" : _ref35$height, spacing = _ref35.spacing, vars = _ref35.vars;
              _context28.next = 3;
              return Ti.App.Open({
                //------------------------------------------
                type: type,
                width: width,
                height: height,
                spacing: spacing,
                position: position,
                closer: closer,
                icon: icon,
                title: title,
                textCancel: textCancel,
                textOk: null,
                //------------------------------------------
                model: null,
                //------------------------------------------
                comType: "WnCmdPanel",
                comConf: {
                  "value": cmdText,
                  "vars": vars
                },
                //------------------------------------------
                components: ["@com:wn/cmd/panel"] //------------------------------------------

              });

            case 3:
            case "end":
              return _context28.stop();
          }
        }
      }, _callee28);
    }));
    return _OpenCmdPanel.apply(this, arguments);
  }

  return OpenCmdPanel;
}(); //---------------------------------------


var WALNUT_VERSION = "2.1-20201027.205544"; //---------------------------------------
// For Wn.Sys.exec command result callback

var HOOKs = {}; //---------------------------------------

var Wn = {
  Version: WALNUT_VERSION,
  Io: Io,
  Obj: Obj,
  Session: Session,
  Sys: Sys,
  Util: Util,
  Dict: Dict,
  OpenObjSelector: OpenObjSelector,
  EditObjMeta: EditObjMeta,
  EditObjContent: EditObjContent,
  EditTiComponent: EditTiComponent,
  OpenThingManager: OpenThingManager,
  OpenCmdPanel: OpenCmdPanel,
  //-------------------------------------
  addHook: function addHook(key, fn) {
    Ti.Util.pushValue(HOOKs, key, fn);
  },
  //-------------------------------------
  doHook: function doHook(key, payload) {
    var fns = HOOKs[key];

    if (_.isArray(fns) && fns.length > 0) {
      var _iterator6 = _createForOfIteratorHelper(fns),
          _step6;

      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var fn = _step6.value;
          fn(payload);
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
    }
  }
}; //---------------------------------------

exports.Wn = Wn;
var _default = Wn; //---------------------------------------

exports["default"] = _default;

if (window) {
  window.Wn = Wn;
}