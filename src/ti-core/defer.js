/**
 * A lightly defer class, providing clearness way to holding defer operation.
 */
class TiDefer {
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
    }
    /**
     * Report one or more defer keys has been finished.
     * If all finished, it will invoke callback functions
     * one by one until the current call stack has cleared.
     * 
     * @param {string|string[]} keys - report to finished
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
        // if all done, the callbacks will be cleared
        // after been invoked.
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
 * <pre>
 * let de = ti.defer(["A", "B"], ()=>console.log("I am done!"))
 * _.delay(()=>de.report("A"), 500)
 * _.delay(()=>de.report("B"), 1200)
 * 
 * // After 1200ms, the console should output:
 * //  I am done
 * </pre>
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

/**@namespace  ti.uie*/
/**@namespace  ti.uie.coll*/

/**
 * Factory method to create a new [Defer Object]{@link TiDefer}.
 * 
 * <pre>
 * let de = ti.defer(["A", "B"], ()=>console.log("I am done!"))
 * _.delay(()=>de.report("A"), 500)
 * _.delay(()=>de.report("B"), 1200)
 * 
 * // After 1200ms, the console should output:
 * //  I am done
 * </pre>
 * 
 * @param {string|string[]} keys - Keys to defer
 * @param {function} callback - invoke when all defer keys finished
 * @function table
 * @memberof ti.uie.coll
 * @class Table
 */
ti.ns('ti.coll.table', function(){

})
