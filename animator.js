var TextAnimator = (function() {

    var getOrDefault = function(value, defaultValue) {
        return value === undefined ? defaultValue : value;
    };

    function TextAnimator(_config) {
        var canvas = _config.canvas;
        var context = getOrDefault(_config.context, canvas.getContext("2d"));
        var animations = getOrDefault(_config.animations, new List([]));
        var started = getOrDefault(_config.started, false);
        var loop = getOrDefault(_config.loop, false);

        var copyConfig = function() {
            return {
                canvas: canvas,
                context: context,
                animations: animations,
                started: started,
                loop: loop
            };
        };

        this.loop = function() {
            var copyOfConfig = copyConfig();
            copyOfConfig.loop = true;
            return new TextAnimator(copyOfConfig);
        };

        this.animate = function(fun) {
            var animation = fun(new TextAnimation({}));
            var newAnimations = animations.Cons(animation);
            var copyOfConfig = copyConfig();
            copyOfConfig.animations = newAnimations;
            return new TextAnimator(copyOfConfig);
        };

        this.start = function() {
            var copyOfConfig = copyConfig();
            copyOfConfig.started = true;
            return new TextAnimator(copyOfConfig);
        };

        this.stop = function() {
            var copyOfConfig = copyConfig();
            copyOfConfig.started = false;
            return new TextAnimator(copyOfConfig);
        };


        this.create = function(startTime) {

            var stopTime = animations.foldLeft(0, function(acc, animation) {
                return Math.max(acc, animation.getStartTime() + animation.getDuration());
            });

            return function() {
                var now = new Date().getTime();
                var timeFromStart = now - startTime;
                context.clearRect(0, 0, canvas.width, canvas.height);

                animations
                        .filter(function(animation) {

                    return (timeFromStart > animation.getStartTime()) && (timeFromStart < (animation.getStartTime() + animation.getDuration()));
                }).forEach(function(animation) {
                    var prop = animation.apply(timeFromStart);
                    if (prop !== undefined) {


                        context.font = prop.scale + "px " + prop.font;
                        context.fillStyle = "rgba(255, 0, 0, " + prop.alpha + ")";
                        context.fillText(prop.subject, prop.x, prop.y);
                    }

                });
                if (timeFromStart > stopTime) {
                    if (loop) {
                        startTime = new Date().getTime();
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            };
        };


        var init = function() {
            if (started === true) {
                var startTime = new Date().getTime();
                var stopTime = animations.foldLeft(0, function(acc, animation) {
                    return Math.max(acc, animation.getStartTime() + animation.getDuration());
                });


                timers.add(function() {
                    var now = new Date().getTime();
                    var timeFromStart = now - startTime;
                    context.clearRect(0, 0, canvas.width, canvas.height);

                    animations
                            .filter(function(animation) {

                        return (timeFromStart > animation.getStartTime()) && (timeFromStart < (animation.getStartTime() + animation.getDuration()));
                    }).forEach(function(animation) {
                        var prop = animation.apply(timeFromStart);
                        if (prop !== undefined) {


                            context.font = prop.scale + "px " + prop.font;
                            context.fillStyle = "rgba(255, 0, 0, " + prop.alpha + ")";
                            context.fillText(prop.subject, prop.x, prop.y);
                        }

                    });
                    if (timeFromStart > stopTime) {
                        if (loop) {
                            startTime = new Date().getTime();
                        } else {
                            return false;
                        }
                    } else {
                        return true;
                    }
                });
            }

        };

        init();


    }
    ;

    function TextAnimation(_config) {

        var effects = getOrDefault(_config.effects, new List([]));
        var subject = _config.subject;
        var position = _config.position;
        var font = _config.font;
        var alpha = _config.alpha;
        var startTime = getOrDefault(_config.startTime, Number.MAX_VALUE);
        var duration = getOrDefault(_config.duration, 0);
        var maxStartTime = getOrDefault(_config.maxStartTime, 0);
        var scale = getOrDefault(_config.scale, 1);

        var copyConfig = function() {
            return {
                effects: effects,
                subject: subject,
                position: position,
                font: font,
                alpha: alpha,
                startTime: startTime,
                maxStartTime: maxStartTime,
                scale: scale,
                duration: duration
            };
        };

        this.font = function(font) {
            var copyOfConfig = copyConfig();
            copyOfConfig.font = font;
            return new TextAnimation(copyOfConfig);
        };

        this.alpha = function(alpha) {
            var copyOfConfig = copyConfig();
            copyOfConfig.alpha = alpha;
            return new TextAnimation(copyOfConfig);
        };

        this.position = function(position) {
            var copyOfConfig = copyConfig();
            copyOfConfig.position = position;
            return new TextAnimation(copyOfConfig);
        };

        this.subject = function(subject) {
            var copyOfConfig = copyConfig();
            copyOfConfig.subject = subject;
            return new TextAnimation(copyOfConfig);
        };

        var copyOfProperties = function(properties) {
            return {
                subject: properties.subject,
                x: properties.x,
                y: properties.y,
                scale: properties.scale,
                alpha: properties.alpha,
                font: properties.font
            };
        };


        var linearImpl = function(property, startTime, duration, from, to) {
            return function(properties, timeFromStart) {
                var result = copyOfProperties(properties);
                result[property] = from + (to - from) * ((timeFromStart - startTime) / (duration));
                return result;
            };
        };

        var effect = function(property, startTime, duration, from, to) {
            var newEffect = {
                effect: linearImpl(property, startTime, duration, from, to),
                startTime: startTime,
                duration: duration
            };
            var copyOfConfig = copyConfig();
            copyOfConfig.effects = effects.Cons(newEffect);
            copyOfConfig.startTime = Math.min(copyOfConfig.startTime, startTime);
            copyOfConfig.duration = Math.max(copyOfConfig.duration, duration);
            return new TextAnimation(copyOfConfig);
        };

        this.fade = function(startTime, duration, from, to) {
            return effect("alpha", startTime, duration, from, to);
        };


        this.scale = function(startTime, duration, from, to) {
            return effect("scale", startTime, duration, from, to);
        };

        this.scrollX = function(startTime, duration, from, to) {
            return effect("x", startTime, duration, from, to);
        };

        this.scrollY = function(startTime, duration, from, to) {
            return effect("y", startTime, duration, from, to);
        };

        this.getStartTime = function() {
            return startTime;
        };

        this.getDuration = function() {
            return duration;
        };


        this.apply = function(timeFromStart) {
            var originalProperties = {
                subject: subject,
                x: position.x,
                y: position.y,
                scale: scale,
                alpha: alpha,
                font: font
            };
            var inScopeEffects = effects
                    .filter(function(e) {
                return (e.startTime < timeFromStart) && (timeFromStart < (e.startTime + e.duration));
            });

            if (!inScopeEffects.isEmpty) {
                var modifiedProperties = inScopeEffects.foldLeft(originalProperties, function(acc, effect) {
                    return effect.effect(acc, timeFromStart);
                });


                return modifiedProperties;
            }

        };

    }


    return TextAnimator;
}());

