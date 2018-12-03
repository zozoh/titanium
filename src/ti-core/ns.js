if(!ti) {
    /**
     * Titanium core package namespace.
     * 
     * @namespace
     */
    var ti = {
        /**
         * define function set or object in a namespace
         * 
         * @param {string} namespace - name path 
         * @param {Object|function} defObj - object in name path
         */
        ns : function(namespace, defObj) {
            _.set(ti, namespace, defObj)
        }
    }
}
