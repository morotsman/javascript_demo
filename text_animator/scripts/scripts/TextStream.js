define(["TextAnimation"], function(TextAnimation) {
    
    var lazy = function(fun) {
            var parameters = [].splice.call(arguments, 1);

            return function() {
                var args = parameters.concat([].slice.call(arguments, 0));
                return fun.apply(fun, args);
            };
        };
        
    var isFunction =  function(obj) {
            return !!(obj && obj.constructor && obj.call && obj.apply);
        };    
    
    function StreamImpl() {

        this.generate = function(seed, fun) {
            var loop = function(seed, index) {
                return new Cons(new TextAnimation({subject: seed}), lazy(function() {
                    return loop(fun(seed, index), index + 1);
                }));
            };

            return loop(seed, 0);
        };

        this.generateFromStream = function(stream, fun) {
            var loop = function(stream, index) {
                return new Cons(stream.head(), lazy(function() {
                    return loop(fun(stream, index), index + 1);
                }));
            };

            return loop(stream, 0);
        };


        this._map = function(fun, index) {
            if (this.isEmpty()) {
                return this;
            } else {
                var that = this;
                return new Cons(fun(this.head(), index), lazy(function() {
                    return that.tail()._map(fun, index + 1);
                }));
            }
        };

        this.take = function(number) {
            if (this.isEmpty() || number <= 0) {
                return this;
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
                return this;
            } else {
                var that = this;
                return new Cons(this.head(), lazy(function() {
                    return that.tail().takeWhile(predicate);
                }));
            }
        };

        this._filter = function(predicate, index) {
            if (this.isEmpty()) {
                return this;
            } else {
                var that = this;
                if (predicate(this.head(), index)) {
                    return new Cons(this.head(), lazy(function() {
                        return that.tail()._filter(predicate, index + 1);
                    }));
                } else {
                    return that.tail()._filter(predicate, index + 1);
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

        this._forEach = function(fun, index) {
            if (this.isEmpty()) {
                return;
            } else {
                fun(this.head(), index);
                this.tail()._forEach(fun, index + 1);
            }
        };

        this.zip = function(stream) {
            if (this.isEmpty() || stream.isEmpty()) {
                return this;
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

        var getPositions = function(letters, settings) {
            var canvas = document.createElement('canvas');
            canvas.width = 0;
            canvas.height = 0;
            var ctx = canvas.getContext("2d");
            ctx.font = Math.floor(settings.scale * settings.fontSize) + "px " + settings.font;

            var result = [0];
            var position = 0;
            for (var i = 0; i < letters.length; i++) {
                var width = ctx.measureText(letters[i]).width;
                position = position + width;
                result.push(position);
            }

            return result;
        };

        this.split = function(fun) {
            if (this.isEmpty()) {
                return this;
            }

            var that = this;
            var subject = this.head().getSettings().subject;
            var letters = fun === undefined ? subject.split('') : fun(subject);
            var positions = getPositions(letters, this.head().getSettings());
            var loop = function(head, index) {
                var settings = head.getSettings();
                settings.subject = letters[index];
                settings.x = settings.x + positions[index];
                if (letters.length - 1 === index) {
                    return new Cons(new TextAnimation(settings), lazy(function() {
                        return that.tail().split(fun);
                    }));
                }
                return new Cons(new TextAnimation(settings), lazy(function() {
                    return loop(head, index + 1);
                }));
            };
            return loop(this.head(), 0);
        };

        this.cons = function(head) {
            return new Cons(new TextAnimation({subject: head}), this);
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

        this.map = function(fun) {
            return this._map(fun, 0);
        };

        this.filter = function(predicate) {
            return this._filter(predicate, 0);
        };

        this.forEach = function(fun) {
            return this._forEach(fun, 0);
        };

        this.scrollY = function(settings) {
            return this.map(function(animation) {
                return animation
                        .scrollY(settings);
            });
        };

        this.static = function(settings) {
            return this.map(function(animation) {
                return animation.static(settings);
            });
        };

        this.scrollX = function(settings) {
            return this.map(function(animation) {
                return animation.scrollX(settings);
            });
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

        this.map = function(fun) {
            return this._map(fun, 0);
        };

        this.filter = function(predicate) {
            return this._filter(predicate, 0);
        };

        this.forEach = function(fun) {
            return this._forEach(fun, 0);
        };

        this.scrollY = function(startTime, duration, change) {
            return this;
        };

        this.static = function(startTime, duration) {
            return this;
        };

        this.scrollX = function(startTime, duration) {
            return this;
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
                return new Cons(new TextAnimation({subject: source[0]}), lazy(function() {
                    return init(source.splice(1));
                }));
            }
        };


        return init(Array.prototype.slice.call(arguments, 0));
    }
    
    return Stream;
});