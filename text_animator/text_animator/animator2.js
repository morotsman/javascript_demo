var Animator2 = (function() {

    var getOrDefault = function(value, defaultValue) {
        return value === undefined ? defaultValue : value;
    };

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

    var effetcImpls = new Effects();

    function Effects() {
        this.linearImpl = function(property, settings) {
            return function() {
                return function(properties, timeFromStart) {
                    if (settings.startTime > timeFromStart) {
                        return properties;
                    }
                    if (timeFromStart > (settings.startTime + settings.duration)) {
                        timeFromStart = settings.startTime + settings.duration;
                    }
                    var change = settings.change * ((timeFromStart - settings.startTime) / (settings.duration));
                    properties[property] = properties[property] + change;
                    return properties;
                };
            };

        };

        this.staticImpl = function(property, settings) {
            return function() {
                return function(properties, timeFromStart) {
                    if (settings.startTime > timeFromStart) {
                        return properties;
                    }
                    return properties;
                };
            };
        };

        var cosOrSin = function(property, settings, fun) {
            return function() {
                return function(properties, timeFromStart) {
                    if (settings.startTime > timeFromStart) {
                        return properties;
                    }
                    if (timeFromStart > (settings.startTime + settings.duration)) {
                        timeFromStart = settings.startTime + settings.duration;
                    }
                    var scale = settings.period / (2 * Math.PI);
                    var time = (timeFromStart - settings.startTime);
                    var position = fun(time / scale);
                    var change = settings.change * position;

                    properties[property] = properties[property] + change;
                    return properties;
                };
            };
        };

        this.sinImpl = function(property, settings) {
            return cosOrSin(property, settings, Math.sin);
        };

        this.cosImpl = function(property, settings) {
            return cosOrSin(property, settings, Math.cos);
        };


        var getFallDistance = function(gravity, initialVelocity, time) {
            return initialVelocity * time + 0.5 * gravity * Math.pow(time, 2);
        };

        var impactVelocity = function(initialHeight, gravity) {
            return Math.sqrt(2 * gravity * initialHeight);
        };

        var maxHeight = function(gravity, initialVelocity) {
            return Math.pow(initialVelocity, 2) / (2 * gravity);
        };


        this.fallImpl = function(property, settings) {
            return function() {
                var gravity = getOrDefault(settings.gravity, 9.81);
                var speed = getOrDefault(settings.speed, 1);
                var cor = getOrDefault(settings.cor, 0.5);
                var initialVelocity = getOrDefault(settings.initialVelocity, 0);
                var fallHeight = settings.change + maxHeight(gravity, initialVelocity);
                var initialTime = settings.startTime;
                var intialPosition;
                var stop = false;
                var ground;
                var prevFallDistance = 0;

                return function(properties, timeFromStart) {
                    if (settings.startTime > timeFromStart) {
                        return properties;
                    }
                    intialPosition = getOrDefault(intialPosition, properties[property]);
                    ground = getOrDefault(ground, intialPosition + settings.change);
                    if (stop || timeFromStart > (settings.startTime + settings.duration)) {
                        timeFromStart = settings.startTime + settings.duration;
                        properties[property] = settings.change + properties[property];
                        return properties;
                    }

                    var time = (timeFromStart - initialTime) / 1000 * speed;
                    var fallDistance = getFallDistance(gravity, initialVelocity, time);
                    properties[property] = intialPosition + fallDistance;

                    if (properties[property] > ground) {
                        initialVelocity = -cor * impactVelocity(fallHeight, gravity);
                        fallHeight = maxHeight(gravity, initialVelocity);
                        initialTime = timeFromStart;
                        intialPosition = ground;

                        if (Math.abs(initialVelocity) < 1) {//to avoid flickering
                            stop = true;
                        }

                    }

                    return properties;
                };
            };

        };
    }

    function TextAnimation(_config) {

        var effects = getOrDefault(_config.effects, new List([]));
        var subject = getOrDefault(_config.subject, "");
        var x = getOrDefault(_config.x, 0);
        var y = getOrDefault(_config.y, 0);
        var font = getOrDefault(_config.font, "Arial");
        var fontSize = getOrDefault(_config.fontSize, 25);
        var alpha = getOrDefault(_config.alpha, 1);
        var startTime = getOrDefault(_config.startTime, Number.MAX_VALUE);
        var duration = getOrDefault(_config.duration, 0);
        var stopTime = getOrDefault(_config.stopTime, 0);
        var scale = getOrDefault(_config.scale, 1);
        var angle = getOrDefault(_config.angle, 0);
        var rgba = getOrDefault(_config.rgba, {red: 0, green: 0, blue: 0});

        var copyConfig = function() {
            return {
                effects: effects,
                subject: subject,
                x: x,
                y: y,
                font: font,
                fontSize: fontSize,
                alpha: alpha,
                startTime: startTime,
                stopTime: stopTime,
                scale: scale,
                duration: duration,
                angle: angle,
                rgba: rgba
            };
        };

        //remove
        this.getSettings = function() {
            return copyConfig();
        };

        this.rgba = function(rgba) {
            var copyOfConfig = copyConfig();
            copyOfConfig.rgba = rgba;
            return new TextAnimation(copyOfConfig);
        };

        this.angle = function(angle) {
            var copyOfConfig = copyConfig();
            copyOfConfig.angle = angle;
            return new TextAnimation(copyOfConfig);
        };

        this.font = function(font) {
            var copyOfConfig = copyConfig();
            copyOfConfig.font = font;
            return new TextAnimation(copyOfConfig);
        };

        this.fontSize = function(fontSize) {
            var copyOfConfig = copyConfig();
            copyOfConfig.fontSize = fontSize;
            return new TextAnimation(copyOfConfig);
        };

        this.alpha = function(alpha) {
            var copyOfConfig = copyConfig();
            copyOfConfig.alpha = alpha;
            return new TextAnimation(copyOfConfig);
        };

        this.x = function(x) {
            var copyOfConfig = copyConfig();
            copyOfConfig.x = x;
            return new TextAnimation(copyOfConfig);
        };

        this.y = function(y) {
            var copyOfConfig = copyConfig();
            copyOfConfig.y = y;
            return new TextAnimation(copyOfConfig);
        };

        this.subject = function(subject) {
            var copyOfConfig = copyConfig();
            copyOfConfig.subject = subject;
            return new TextAnimation(copyOfConfig);
        };



        var mapImpl = function(settings, fun) {
            return function() {
                return function(properties, timeFromStart) {
                    if (settings.startTime > timeFromStart) {
                        return properties;
                    }
                    if (timeFromStart > (settings.startTime + settings.duration)) {
                        timeFromStart = settings.startTime + settings.duration;
                    }
                    return fun(properties, settings, timeFromStart);
                };
            };
        };

        var availableEffects = {
            fall: effetcImpls.fallImpl,
            sin: effetcImpls.sinImpl,
            cos: effetcImpls.cosImpl,
            static: effetcImpls.staticImpl,
            linear: effetcImpls.linearImpl
        };


        var effectSelector = function(effect) {
            return getOrDefault(availableEffects[effect], effetcImpls.linearImpl);
        };



        var effect = function(property, settings, fun) {
            var selectedEffect = effectSelector(settings.effectName);
            var startTime = settings.startTime;
            var duration = settings.duration;
            var copyOfConfig = copyConfig();
            copyOfConfig.effects = effects.Cons(selectedEffect(property, settings, fun));
            copyOfConfig.startTime = Math.min(copyOfConfig.startTime, startTime);
            copyOfConfig.stopTime = Math.max(copyOfConfig.stopTime, startTime + duration);
            return new TextAnimation(copyOfConfig);
        };



        this.fade = function(settings) {
            return effect("alpha", settings);
        };


        this.scale = function(settings) {
            return effect("scale", settings);
        };

        this.map = function(settings, fun) {
            var startTime = settings.startTime;
            var duration = settings.duration;
            var copyOfConfig = copyConfig();
            copyOfConfig.effects = effects.Cons(mapImpl(settings, fun));
            copyOfConfig.startTime = Math.min(copyOfConfig.startTime, startTime);
            copyOfConfig.stopTime = Math.max(copyOfConfig.stopTime, startTime + duration);
            return new TextAnimation(copyOfConfig);
        };

        this.scrollX = function(settings) {
            return effect("x", settings);
        };

        this.rotate = function(settings) {
            return effect("angle", settings);
        };

        this.scrollY = function(settings) {
            return effect("y", settings);
        };

        this.static = function(settings) {
            settings.effectName = "static";
            return effect(undefined, settings);
        };


        this.getStartTime = function() {
            return startTime;
        };

        this.getStopTime = function() {
            return stopTime;
        };

        this.getDuration = function() {
            return duration;
        };

        this.getEffects = function() {
            return effects;
        };

        this.copy = function() {
            var copyOfConfig = copyConfig();
            return new TextAnimation(copyOfConfig);
        };
    }

    function Animator(context, canvas) {
        var requestAnimationFrame = window.requestAnimationFram ||
                window.mozRequestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.msRequestAnimationFrame;

        var cancelAnimationFrame = window.cancelAnimationFram ||
                window.mozCancelAnimationFrame ||
                window.webkitCancelAnimationFrame ||
                window.msCancelAnimationFrame;

        var requestId;
        var timeFromStart;

        this.apply = function(timeFromStart, animation) {
            var properties = animation.getSettings();

            var modifiedProperties = properties;
            for (var i = 0; i < animation.runtimeEffects.length; i++) {
                modifiedProperties = animation.runtimeEffects[i](modifiedProperties, timeFromStart);
            }

            return modifiedProperties;
        };

        this.createRuntimeAnimations = function(animations) {

            var result = new Array();

            for (var i = 0; i < animations.length; i++) {
                var tmp = animations[i].animation.foldLeft(new Array(), function(acc, animation) {
                    var copyOfAnimations = animation.copy();

                    copyOfAnimations.runtimeEffects = animation.getEffects().foldLeft(new Array(), function(acc, effect) {
                        acc.push(effect());
                        return acc;

                    });

                    acc.push(copyOfAnimations);
                    return acc;
                });
                result.push(tmp);

            }


            return result;
        };

        this.stop = function() {
            cancelAnimationFrame(requestId);
            context.clearRect(0, 0, canvas.width, canvas.height);
            return getOrDefault(timeFromStart, 0);//TODO fix, this will cause an error, each animation must have it's own
        };



        this.start = function(animations, startTime) {
            for (var i = 0; i < animations.length; i++) {
                var stopTime = animations[i].animation.foldLeft(0, function(acc, animation) {
                    return Math.max(acc, animation.getStopTime());
                });
                console.log(stopTime);
                animations[i].animation.stopTime = stopTime;
            }
            var that = this;
            var runtimeAnimationsArray = this.createRuntimeAnimations(animations);
            var runner = function(now) {

                context.clearRect(0, 0, canvas.width, canvas.height);
                for (var i = 0; i < runtimeAnimationsArray.length; i++) {
                    animations[i].animation.startTime = animations[i].animation.startTime === undefined ? new Date().getTime() : animations[i].animation.startTime;
                    animations[i].animation.startTime = animations[i].animation.loopTime === undefined ? animations[i].animation.startTime : animations[i].animation.loopTime;
                    animations[i].animation.timeFromStart = now - animations[i].animation.startTime;
                    for (var j = 0; j < runtimeAnimationsArray[i].length; j++) {
                        var animation = runtimeAnimationsArray[i][j];
                        if ((animations[i].animation.timeFromStart < animation.getStopTime()) && animations[i].animation.timeFromStart > animation.getStartTime()) {
                            var prop = that.apply(animations[i].animation.timeFromStart, animation);
                            context.save();
                            context.font = Math.floor(prop.scale * prop.fontSize) + "px " + prop.font;
                            context.fillStyle = "rgba(" + prop.rgba.red + "," + prop.rgba.green + "," + prop.rgba.blue + ", " + Math.floor(prop.alpha) + ")";

                            if (prop.angle !== 0) {
                                context.translate(Math.floor(prop.x), Math.floor(prop.y));
                                context.rotate(prop.angle);
                            } else {
                                context.translate(Math.floor(prop.x), Math.floor(prop.y));
                            }

                            context.fillText(prop.subject, 0, 0);

                            context.restore();
                        }
                    }
                    //handle loop
                    if ((animations[i].animation.timeFromStart > animations[i].animation.stopTime)) {
                        console.log("i: " + i + " loop: " + animations[i].loop);
                        if (animations[i].loop) {
                            animations[i].animation.loopTime = new Date().getTime();
                            runtimeAnimationsArray[i] = that.createRuntimeAnimations([animations[i]])[0];//TODO fix this later
                        } else {//remove
                            runtimeAnimationsArray.splice(i, 1);
                            animations.splice(i, 1)
                            console.log("Removing: " + i);
                        }

                        if (runtimeAnimationsArray.length === 0) {
                            return;
                        }
                    }
                }

                requestId = requestAnimationFrame(runner);
            };
            requestId = requestAnimationFrame(runner);
        };


    }


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

    return {
        textStream: Stream,
        animator: Animator
    };

})();


