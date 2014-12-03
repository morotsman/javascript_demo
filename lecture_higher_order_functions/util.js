var util = {
    /**
     * Returns a function that can be partialy applied. Support wildcards "_"
     * @param {type} fun
     * @returns {Function}
     */
    partial: function (fun) {
        var wildcardMerge = function (array1, array2) {
            var isEmpty = function (array) {
                return array === undefined || array === null || array.length === 0;
            };

            var isWildCard = function (parameter) {
                return "_" === parameter;
            };

            var loop = function (array1, array2, acc) {
                if (isEmpty(array1)) {
                    return array2 ? acc.concat(array2) : acc;
                } else if (isEmpty(array2)) {
                    return acc.concat(array1);
                } else {
                    var head = array1.shift();
                    if (isWildCard(head)) {
                        var filler = array2.shift();
                        acc.push(filler);
                        return loop(array1, array2, acc);
                    }
                    acc.push(head);
                    return loop(array1, array2, acc);
                }
            };

            return loop(array1, array2, new Array());
        };




        return function (/*arguments*/) {
            var args1 = Array.prototype.slice.call(arguments, 0);
            return function (/*arguments*/) {
                var args2 = Array.prototype.slice.call(arguments, 0);
                var mergedArguments = wildcardMerge(args1.slice(0), args2);
                return fun.apply(this, mergedArguments);
            };
        };
    },
    /**
     * Returns a function that can be partialy applied. No support for wildcards.
     * @param {type} fun
     * @returns {Function}
     */    
    partial_1: function (fun) {
        return function (/*arguments*/) {
            var args1 = Array.prototype.slice.call(arguments, 0);
            return function (/*arguments*/) {
                var args2 = Array.prototype.slice.call(arguments, 0);
                return fun.apply(this, args1.concat(args2));
            };
        };

    },
    /**
     * Returns a composed function that first applies the before function to its input, and then applies the current function to the result
     * 
     * @param Function current
     * @param Function before
     * @returns {Function}
     */
    compose: function (current, before) {
        return function (/*argumants*/) {
            var args = Array.prototype.slice.call(arguments, 0);
            return current(before.apply(this, args));
        };
    },
    /**
     * 
     * @param Function current
     * @param Function after
     * @returns {Function}
     */
    andThen: function (current, after) {
        return function (/*arguments*/) {
            var args = Array.prototype.slice.call(arguments, 0);
            var result = current.apply(this, args);
            return after(result);
        };
    },
    pick: function (/*names*/) {
        var names = Array.prototype.slice.call(arguments, 0);
        return function (obj) {
            var result = {};
            return names.reduce(function (acc, name) {
                acc[name] = obj[name];
                return acc;
            }, result);
        };
    },
    /**
     * input functions
     * @returns Function
     */
    chain: function (/*functions*/) {
        var startFunction = arguments[0];
        var functions = Array.prototype.slice.call(arguments, 1);
        return functions.reduce(function (acc, fun) {
            return util.andThen(acc, fun);
        }, startFunction);
    },
    /**
     * 
     * @param Function predicate1
     * @param Function predicate2
     * @returns {Function}
     */
    and: function (predicate1, predicate2) {
        return function (subject) {
            return predicate1(subject) && predicate2(subject);
        };
    },
    /**
     * 
     * @param {type} predicate1
     * @param {type} predicate2
     * @returns {Function}
     */
    or: function (predicate1, predicate2) {
        return function (subject) {
            return predicate1(subject) || predicate2(subject);
        };
    },
    /**
     * 
     * @param {type} min
     * @param {type} max
     * @returns {Number}
     */
    random: function (min, max) {
        return Math.floor((Math.random() * (max-min)) + min);
    },
    timmedFunction: function(fun){
        return function(/*arguments*/){
            var args = Array.prototype.slice.call(arguments, 0);
            var startTime = new Date().getTime();
            var result = fun.apply(this, args);
            var endTime = new Date().getTime();
            console.log("Function was running in: " + (endTime-startTime) + " ms.");
            return result;
        };
    }
    
};
