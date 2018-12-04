if(!ti) {
    /**
     * Titanium core package namespace.
     * 
     * @namespace
     */
    var ti = {
        /**
         * Define function set or object in a namespace
         * 
         * ```js
         * //.......................................
         * // define a function set
         * ti.ns("xyz", {
         *      foo : function(){},
         *      bar : function(){}
         * });
         * // Then you can invoke `ti.xyz.foo()` anywhere
         * //.......................................
         * // define one function
         * ti.ns("abc", function(){})
         * // Then you can invoke `ti.abc()` anywhere
         * ```
         * 
         * @param {string} namespace - name path 
         * @param {Object|function} defObj - object in name path
         * 
         * @returns {undefined}
         */
        ns : function(namespace, defObj) {
            _.set(this, namespace, defObj)
        }
    }
}
