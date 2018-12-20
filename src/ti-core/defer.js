(function(){
//=======================================================
/**
 * A directly defer pattern, provided clearness way to holding defer operation.
 * 
 * # Motivation
 * 
 * Sometimes, you want to do this:
 * 
 * ```
UI showloading ...
 
async get Data A
    async get Data B
        hideLoading
        render View by A and B
 * ```
 * 
 * In tradition way, we always used the nested callback to reach the purpose.
 * But if the previous operations are not only A and B, but A,B,C,D,E ...
 * we will fall down to the so called `callback hell`, it is so painful that
 * `ES6` offser a solution named `Promise`, it provide a grace way to group 
 * two async operations (`Promise` object) into a new one. So the logic above
 * will be present like this:
 * 
 * ```js
const p1 = new Promise(function(resolve, reject) {
  console.log("mock async operation A ...")
  setTimeout(function(){
      resolve("data A")
  }, 1000)
});

const p2 = new Promise(function(resolve, reject) {
  console.log("mock async operation B ...")
  setTimeout(function(){
      resolve("data B")
  }, 2000)
});

Promise.all([p1, p2])
  .then(function(value){
    console.log("done", value)
  })
 * ```
 * > [view full code](https://codepen.io/zozoh/pen/xmRLYJ?editors=0012)
 *
 * The `Promise Object` will be executed as soon as it be created (`new`),
 * since that, it is almost impossable if we want to mutate the chain of
 * the  `Promise Object`, and it may reasonable requirement for some case
 * like that: 
 * 
 * ```
UI showloading ...
 
async get Data A
    async get Data B
        hideLoading
        render View by A and B
    async get Data C
        async get Data D
            hideLoading
            render View by A, C and D
 * ```
 * 
 * If we write this kinds of logic by `Promise`, we will fall into another kinds of
 * "callback hell" maybe.
 * 
 * So we need another simply way to deal with this kinds situation, 
 * then we called the solution as `ti.defer`
 * 
 * # Usage
 * 
 * ```js
var value = [];
let defer = ti.defer(['A','B'], function(){
    console.log("done", value)
})
// you can control the timing of operation A now
console.log("mock async operation A ...")
setTimeout(function(){
    defer.resolve("data A")
}, 1000)
// you can control the timing of operation B also
console.log("mock async operation B ...")
setTimeout(function(){
    value.push("data B")
}, 2000)
 * ```
 * 
 */
class TiDefer {
    /**
     * You can call it without any arguments, 
     * and provide defer keys later by invoke `add` method
     * zozoh
     * 
     * ```js
     * let defer = new TiDefer(['keyA','keyB'], function(){
     *    alert('done')
     * })
     * // is same as:
     * let defer = new TiDefer()
     * defer.add(['keyA','keyB'], function(){
     *    alert('done)
     * })
     * ```
     * 
     * **Note**: for the reason `TiDefer class` has been protected from `defer.js`,
     * in realtime, you should use the factory method to create the `TiDefer` instance:
     * 
     * ```
     * let defer = ti.defer(['keyA','keyB'], function(){
     *      alert('done')
     * })
     * ```
     * 
     * @param {string|string[]} keys - Keys to defer
     * @param {function(*)} callback - invoke when all defer keys finished
     */
    constructor(keys=[], callback) {
        this.keys = {}
        this.callbacks = []
        this.add(keys, callback)
    }
    /**
     * Add more defer keys or callback functions 
     * to current defer series
     * 
     * @param {string|string[]} keys - Keys to defer
     * @param {function(*)} callback - invoke when all defer keys finished
     * 
     * @returns [Defer Object]{@link TiDefer}
     */
    add(keys=[], callback) {
        // for add(Func(){..})
        if(_.isFunction(keys)) {
            callback = keys
            keys = []
        }
        // Join the keys
        if(_.isString(keys) || _.isArray(keys)) {
            for(let k of ([].concat(keys)).flat()) {
                this.keys[k] = false
            }
        }
        // Join the callback
        if(_.isFunction(callback)){
            this.callbacks.push(callback)
        }
        // Join a batch of callbacks
        else if(_.isArray(callback)) {
            for(let fn of callback) {
                if(_.isFunction(fn)) {
                    this.callbacks.push(fn)
                }
            }
        }
        return this;
    }
    /**
     * Report one or more defer keys has been finished.
     * If all finished, it will invoke callback functions
     * one by one until the current call stack has cleared.
     * 
     * @param {string|string[]} keys - report to finished
     * @returns {undefined}
     */
    report(keys=[]) {
        var DE = this;
        for(let k of keys) {
            this.keys[k] = true
        }
        _.defer(function(){
            DE.__check_all_defer_done();
        });
    }

    __check_all_defer_done() {
        // if all done, the callbacks will be cleared after been invoked.
        // Then it would not be necessary to check them again.
        if(this.callbacks.length == 0)
            return;
        
        for(let k of this.keys)
            if(!this.keys[k])
                return
        let fns = [].concat(this.callbacks)
        this.keys = {}
        this.callbacks = []

        let context = this.context || this
        let args = this.args || []

        for(let fn of fns) {
            fn.apply(context, args);
        }
    }
}

/**
 * Factory method to create a new [Defer Object]{@link TiDefer}.
 * 
 * ```js
 * let de = ti.defer(["A", "B"], ()=>console.log("I am done!"))
 * _.delay(()=>de.report("A"), 500)
 * _.delay(()=>de.report("B"), 1200)
 * 
 * // After 1200ms, the console should output:
 * //  I am done
 * ```
 * 
 * @param {string|string[]} keys - Keys to defer
 * @param {function} callback - invoke when all defer keys finished
 * @return [Defer Object]{@link TiDefer}
 * @function defer
 * @memberof ti
  */
ti.ns('ti.defer', function(keys, callback){   
    return new TiDefer(keys, callback);
})
//=======================================================
})();