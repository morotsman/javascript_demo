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
          
            
            return new Animator(animations, context, canvas,loop);
        };
    };
    
    function Animator(animations,context,canvas,loop){
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
            context.clearRect(0, 0, canvas.width, canvas.height);
        };
        
        this.start = function(){
            var stopTime = animations.foldLeft(0, function(acc, animation) {
                return Math.max(acc, animation.getStopTime());
            });
            var loopTime;
            var startTime;
            
            
            var runner =  function(now) {
                startTime = startTime===undefined?new Date().getTime():startTime;
                startTime = loopTime===undefined?startTime:loopTime;
                
                var timeFromStart = now - startTime;
                context.clearRect(0, 0, canvas.width, canvas.height);
               
                animations.filter(function(animation) {
                    return (timeFromStart > animation.getStartTime()) && !(timeFromStart > animation.getStopTime());
                }).forEach(function(animation) {
                    var prop = animation.apply(timeFromStart);
                    if (prop !== undefined) {
                        if(prop.scale === undefined || prop.fontSize === undefined || prop.font === undefined){
                            console.log("hepp");
                        }
                        context.font = prop.scale*prop.fontSize + "px " + prop.font;
                        context.fillStyle = "rgba(255, 0, 0, " + prop.alpha + ")";
                        context.fillText(prop.subject, prop.x, prop.y);
                    }

                });
                if ((timeFromStart > stopTime) && loop) {
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
        var fontSize = _config.fontSize;
        var alpha = getOrDefault(_config.alpha, 1);
        var startTime = getOrDefault(_config.startTime, Number.MAX_VALUE);
        var duration = getOrDefault(_config.duration, 0);
        var stopTime = getOrDefault(_config.stopTime, 0);
        var scale = getOrDefault(_config.scale, 1);

        var copyConfig = function() {
            return {
                effects: effects,
                subject: subject,
                position: position,
                font: font,
                fontSize: fontSize,
                alpha: alpha,
                startTime: startTime,
                stopTime: stopTime,
                scale: scale,
                duration: duration
            };
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
                var distance = (to - from) * ((timeFromStart - startTime) / (duration));
                //console.log("linear" + distance)
                properties[property] = from + distance;
                return properties;
            };
        };
        
        var fallingImpl = function(property, startTime, duration, from, to) {
            //distance formula : d = 0.5 * g * t^2
            //g = 2*d/t^2
            var gravity = 2*(to-from)/Math.pow(duration,2);
            console.log(gravity);
            return function(properties, timeFromStart) {
                var distance = 0.5*gravity*Math.pow(timeFromStart-startTime,2);
                //console.log("falling" + distance);
                properties[property] = from + distance;
                return properties;
            };
        };
        
        
        var effectSelector = function(effect){
            if(effect === "fall"){
                return fallingImpl;
            }else{
                return linearImpl;
            }
        };

        var effect = function(property, startTime, duration, from, to, effect) {
            var selectedEffect = effectSelector(effect);
            var newEffect = {
                effect: selectedEffect(property, startTime, duration, from, to),
                startTime: startTime,
                duration: duration
            };
            var copyOfConfig = copyConfig();
            copyOfConfig.effects = effects.Cons(newEffect);
            copyOfConfig.startTime = Math.min(copyOfConfig.startTime, startTime);
            copyOfConfig.stopTime = Math.max(copyOfConfig.stopTime, startTime + duration);
            return new TextAnimation(copyOfConfig);
        };

        this.fade = function(startTime, duration, from, to, effectName) {
            return effect("alpha", startTime, duration, from, to, effectName);
        };


        this.scale = function(startTime, duration, from, to, effectName) {
            return effect("scale", startTime, duration, from, to, effectName);
        };

        this.scrollX = function(startTime, duration, from, to, effectName) {
            return effect("x", startTime, duration, from, to, effectName);
        };

        this.scrollY = function(startTime, duration, from, to, effectName) {
            return effect("y", startTime, duration, from, to, effectName);
        };


        this.getStartTime = function() {
            return startTime;
        };
        
        this.getStopTime = function() {
            return stopTime;
        };



        this.apply = function(timeFromStart) {
            var originalProperties = {
                subject: subject,
                x: position.x,
                y: position.y,
                scale: scale,
                alpha: alpha,
                font: font,
                fontSize: fontSize
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

