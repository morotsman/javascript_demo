define(function() {
    return {
        getOrDefault: function(value, defaultValue) {
            return value === undefined ? defaultValue : value;
        }
    };

});
