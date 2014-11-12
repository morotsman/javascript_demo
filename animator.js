var AnimatorTemplate = (function() {

    var getOrDefault = function(value, defaultValue) {
        return value === undefined ? defaultValue : value;
    };

    function AnimatorTemplate(_config) {
        var canvas = _config.canvas;
        var context = getOrDefault(_config.context, canvas.getContext("2d"));
        var animations = getOrDefault(_config.animations, new List([]));
        var loop = getOrDefault(_config.loop, false);

        var copyConfig = function() {
            return {
                canvas: canvas,
                context: context,
                animations: animations,
                loop: loop
            };
        };

        this.loop = function() {
            var copyOfConfig = copyConfig();
            copyOfConfig.loop = true;
            return new AnimatorTemplate(copyOfConfig);
        };

        this.animate = function(fun) {
            var animation = fun(new TextAnimation({}));
            var newAnimations = animations.Cons(animation);
            var copyOfConfig = copyConfig();
            copyOfConfig.animations = newAnimations;
            return new AnimatorTemplate(copyOfConfig);
        };
       

        this.create = function() {
             var stopTime = animations.foldLeft(0, function(acc, animation) {
                return Math.max(acc, animation.getStartTime() + animation.getDuration());
            });           
            
            return new Animator(stopTime, animations, context, canvas,loop);
        };
    };
    
    function Animator(stopTime, animations,context,canvas,loop){
        var requestAnimationFrame = window.requestAnimationFram ||
                                    window.mozRequestAnimationFrame ||
                                    window.webkitRequestAnimationFrame ||
                                    window.msRequestAnimationFrame;
                            
        var cancelAnimationFrame = window.cancelAnimationFram ||
                                   window.mozCancelAnimationFrame ||
                                   window.webkitCancelAnimationFrame ||
                                   window.msCancelAnimationFrame;                           
        
        var requestId;
     
        
        this.stop = function(){
            cancelAnimationFrame(requestId);
        };
        
        this.start = function(){
            var stopTime = animations.foldLeft(0, function(acc, animation) {
                return Math.max(acc, animation.getStartTime() + animation.getDuration());
            });
            var loopTime;
            var startTime;
            
            var hasStated = function(timeFromStart, startTime){
               return timeFromStart > startTime; 
            };
            
            var hasStoped = function(timeFromStart, startTime, duration){
               return timeFromStart > (startTime + duration); 
            };
            
            var runner =  function(now) {
                startTime = startTime===undefined?new Date().getTime():startTime;
                startTime = loopTime===undefined?startTime:loopTime;
                
                var timeFromStart = now - startTime;
                context.clearRect(0, 0, canvas.width, canvas.height);
               
                animations.filter(function(animation) {
                    return hasStated(timeFromStart, animation.getStartTime()) && !hasStoped(timeFromStart, animation.getStartTime(), animation.getDuration());
                }).forEach(function(animation) {
                    var prop = animation.apply(timeFromStart);
                    if (prop !== undefined) {
                        context.font = prop.scale + "px " + prop.font;
                        context.fillStyle = "rgba(255, 0, 0, " + prop.alpha + ")";
                        context.fillText(prop.subject, prop.x, prop.y);
                    }

                });
                if ((timeFromStart > stopTime) && loop) {
                    mutableAnimations = animations;
                    loopTime = new Date().getTime();
                } 
                requestId = requestAnimationFrame(runner);
            };
            requestId = requestAnimationFrame(runner);
        };
        
    };

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

        var linearImpl = function(property, startTime, duration, from, to) {
            return function(properties, timeFromStart) {
                properties[property] = from + (to - from) * ((timeFromStart - startTime) / (duration));
                return properties;
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


    return AnimatorTemplate;
}());

