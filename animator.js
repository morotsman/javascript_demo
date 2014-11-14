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


            return new Animator(animations, context, canvas, loop);
        };
    }
    ;


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

        var linearImpl = function(property, settings) {
            return function(properties, timeFromStart) {
                var distance = (settings.to - settings.from) * ((timeFromStart - settings.startTime) / (settings.duration));
                properties[property] = settings.from + distance;
                return properties;
            };
        };
        
        var fallingImpl = function(property, settings) {
            var gravity = settings.gravity!==undefined?settings.gravity:2 * (settings.to - settings.from) / Math.pow(settings.duration, 2);
            return function(properties, timeFromStart) {
                var distance = 0.5 * gravity * Math.pow(timeFromStart - settings.startTime, 2);
                properties[property] = settings.from + distance;
                return properties;
            };
        };
               


        var effectSelector = function(effect) {
            if (effect === "fall") {
                return fallingImpl;
            } else {
                return linearImpl;
            }
        };
        
        

        var effect = function(property, settings) {
            var selectedEffect = effectSelector(settings.effectName);
            var startTime = settings.startTime;
            var duration = settings.duration;
            var newEffect = {
                effect: selectedEffect(property, settings),
                startTime: startTime,
                duration: duration
            };
            var copyOfConfig = copyConfig();
            copyOfConfig.effects = effects.Cons(newEffect);
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

        this.scrollX = function(settings) {
            return effect("x", settings);
        };

        this.scrollY = function(settings) {
            return effect("y", settings);
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

        this.getProperties = function() {
            return {
                subject: subject,
                x: position.x,
                y: position.y,
                scale: scale,
                alpha: alpha,
                font: font,
                fontSize: fontSize
            };
        };
        
        this.copy = function(){
            var copyOfConfig = copyConfig();
            return new TextAnimation(copyOfConfig); 
        };
        


    }

    function Animator(animations, context, canvas, loop) {
        var requestAnimationFrame = window.requestAnimationFram ||
                window.mozRequestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.msRequestAnimationFrame;

        var cancelAnimationFrame = window.cancelAnimationFram ||
                window.mozCancelAnimationFrame ||
                window.webkitCancelAnimationFrame ||
                window.msCancelAnimationFrame;

        var requestId;

        this.apply = function(timeFromStart, animation) {
            var properties = animation.oldProperties!==undefined?animation.oldProperties:animation.getProperties();
            
            animation.runtimeEffects = animation.runtimeEffects.filter(function(e){
                return timeFromStart < (e.startTime + e.duration);
            });
            
            //console.log("effects: " + animation.runtimeEffects.length);
            
            var inScopeEffects = animation.runtimeEffects
                    .filter(function(e) {
                return e.startTime < timeFromStart;
            });

            if (inScopeEffects.length!==0) {
                var modifiedProperties = properties;
                for(i = 0; i < inScopeEffects.length; i++){
                    modifiedProperties = inScopeEffects[i].effect(modifiedProperties, timeFromStart);
                }
                

                animation.oldProperties = modifiedProperties;
                return modifiedProperties;
            }

        };
        
        this.createRuntimeAnimations = function(animations){
            return animations.foldLeft(new Array(), function(acc, animation){
                var copyOfAnimations = animation.copy();
                
                copyOfAnimations.runtimeEffects = animation.getEffects().foldLeft(new Array(), function(acc, effect){
                    acc.push({
                        effect: effect.effect,
                        startTime: effect.startTime,
                        duration: effect.duration
                    });
                    return acc;

                });
                
                acc.push(copyOfAnimations);
                return acc;
            });
        };

        this.stop = function() {
            cancelAnimationFrame(requestId);
            context.clearRect(0, 0, canvas.width, canvas.height);
        };
             
        this.start = function() {
            var stopTime = animations.foldLeft(0, function(acc, animation) {
                return Math.max(acc, animation.getStopTime());
            });
            var loopTime;
            var startTime;
            var that = this;
            
            var runtimeAnimationsArray = this.createRuntimeAnimations(animations);
            var runner = function(now) {
                startTime = startTime === undefined ? new Date().getTime() : startTime;
                startTime = loopTime === undefined ? startTime : loopTime;

                var timeFromStart = now - startTime;
                context.clearRect(0, 0, canvas.width, canvas.height);
                
                
                runtimeAnimationsArray = runtimeAnimationsArray.filter(function(animation){
                    return !(timeFromStart > animation.getStopTime());
                });
                
                //console.log("animations: " + runtimeAnimationsArray.length);

                runtimeAnimationsArray.filter(function(animation){
                    return (timeFromStart > animation.getStartTime());
                }).forEach(function(animation) {
                    var prop = that.apply(timeFromStart, animation);
                    if (prop !== undefined) {                    
                        context.font = prop.scale* prop.fontSize + "px " + prop.font;
                        context.fillStyle = "rgba(255, 0, 0, " + prop.alpha + ")";
                        context.fillText(prop.subject, prop.x, prop.y);
                    }

                });
                if ((timeFromStart > stopTime)) {
                    if(loop){
                        loopTime = new Date().getTime();
                        runtimeAnimationsArray = that.createRuntimeAnimations(animations);
                    }else{
                        //console.log("stop");
                        return;
                    }
                }
                
                requestId = requestAnimationFrame(runner);
            };
            requestId = requestAnimationFrame(runner);
        };
       
        

    }
    ;


    return AnimatorTemplate;
}());

