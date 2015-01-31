var Stream = (function() {

    var lazy = function(fun) {
        var parameters = [].splice.call(arguments, 1);

        return function() {
            var args = parameters.concat([].slice.call(arguments, 0));
            return fun.apply(fun, args);
        };
    };

    var isFunction = function(obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    };


    function StreamImpl() {

        this.generate = function(seed, fun) {
            var loop = function(seed) {
                return new Cons(seed, lazy(function() {
                    return loop(fun(seed));
                }));
            };

            return loop(seed);
        };

        this.generateFromStream = function(stream, fun) {
            var loop = function(stream) {
                return new Cons(stream.head(), lazy(function() {
                    return loop(fun(stream));
                }));
            };

            return loop(stream);
        };


        this.map = function(fun) {
            //console.log("map");
            if (this.isEmpty()) {
                return new Empty();
            } else {
                var that = this;
                return new Cons(fun(this.head()), lazy(function() {
                    return that.tail().map(fun);
                }));
            }
        };

        this.take = function(number) {
            //console.log("take: " + number);
            if (this.isEmpty() || number <= 0) {
                return new Empty();
            } else if (number === 1) {
                return new Cons(this.head(), lazy(function() {
                    return new Empty();
                }));
            } else {
                var that = this;
                return new Cons(this.head(), lazy(function() {
                    return that.tail().take(number - 1);
                }));
            }
        };

        this.takeWhile = function(predicate) {
            if (this.isEmpty() || !predicate(this.head())) {
                return new Empty();
            } else {
                var that = this;
                return new Cons(this.head(), lazy(function() {
                    return that.tail().takeWhile(predicate);
                }));
            }
        };

        this.filter = function(predicate) {
            if (this.isEmpty()) {
                return new Empty();
            } else {
                //console.log("filter: " + this.head());
                var that = this;
                if (predicate(this.head())) {
                    return new Cons(this.head(), lazy(function() {
                        return that.tail().filter(predicate);
                    }));
                } else {
                    return that.tail().filter(predicate);
                }
            }
        };

        this.foldLeft = function(initial, fun) {
            if (this.isEmpty()) {
                return initial;
            } else {
                return this.tail().foldLeft(fun(initial, this.head()), fun);
            }
        };

        this.foldRight = function(initial, fun) {
            if (this.isEmpty()) {
                return initial;
            } else {
                return fun(this.tail().foldRight(initial, fun), this.head());
            }
        };

        this.forEach = function(fun) {
            if (this.isEmpty()) {
                return;
            } else {
                fun(this.head());
                this.tail().forEach(fun);
            }
        };

        this.zip = function(stream) {
            if (this.isEmpty() || stream.isEmpty()) {
                return new Empty();
            } else {
                var that = this;
                return new Cons({one: this.head(), two: stream.head()}, lazy(function() {
                    return that.tail().zip(stream.tail());
                }));
            }
        };

        this.toArray = function() {
            var loop = function(s, acc) {
                if (s.isEmpty()) {
                    return acc;
                } else {
                    acc.push(s.head());
                    return loop(s.tail(), acc);
                }

            };

            return loop(this, new Array());
        };
        
        this.cons = function(head){
            return new Cons(head, this);
        };        
    }
    ;

    function Cons(_head, _tail) {
        var theHead = _head;
        var theTail = _tail;

        this.head = function() {
            return theHead;
        };
        this.tail = function() {
            if (isFunction(theTail)) {
                theTail = theTail();
            }
            return theTail;
        };

        this.isEmpty = function() {
            return false;
        };
    }
    ;
    //inherit from StreamImpl
    Cons.prototype = new StreamImpl();

    /*
     * Represents the empty Stream.
     */
    function Empty() {
        this.head = function() {
            throw "head on empty";
        };

        this.tail = function() {
            throw "tail on empty";
        };

        this.isEmpty = function() {
            return true;
        };
    }
    ;

    //inherit from StreamImpl
    Empty.prototype = new StreamImpl();

    function Stream() {

        var init = function(source) {
            if (source === undefined || source.length === 0) {
                return new Empty();
            } else {
                return new Cons(source[0], lazy(function() {
                    return init(source.splice(1));
                }));
            }
        };


        return init(Array.prototype.slice.call(arguments, 0));
    }

    return Stream;

})();


