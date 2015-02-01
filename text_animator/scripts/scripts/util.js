define(function() {
    return {
        getOrDefault: function(value, defaultValue) {
            return value === undefined ? defaultValue : value;
        },
        lazy: function(fun) {
            var parameters = [].splice.call(arguments, 1);

            return function() {
                var args = parameters.concat([].slice.call(arguments, 0));
                return fun.apply(fun, args);
            };
        },
        isFunction: function(obj) {
            return !!(obj && obj.constructor && obj.call && obj.apply);
        }
    };

});
