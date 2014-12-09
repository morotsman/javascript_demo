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
                var change = (settings.to - settings.from) * ((timeFromStart - settings.startTime) / (settings.duration));
                properties[property] = settings.from + change;
                return properties;
            };
        }; 
        
        var staticImpl = function(property, settings) {
            return function(properties, timeFromStart) {
                return properties;
            };
        };         
        
        var cosOrSin = function(property, settings, fun){
            return function(properties, timeFromStart){
                var scale = settings.period / (2*Math.PI);
                var time =(timeFromStart - settings.startTime); 
                var position = fun(time/scale);
                var change = (settings.to - settings.from) * position;
                properties[property] = settings.from + change;
                return properties;
            };          
        };
        
        var sinImpl = function(property, settings){
            return cosOrSin(property, settings, Math.sin);
        };
        
        var cosImpl = function(property, settings){
            return cosOrSin(property, settings, Math.cos);
        };        
        
            
        var getFallDistance = function(gravity, initialVelocity,  time){
            return initialVelocity*time + 0.5*gravity*Math.pow(time,2);    
        };
        
        var impactVelocity = function(initialHeight,gravity){
            return Math.sqrt(2*gravity*initialHeight);    
        };  
        
        var maxHeight = function(gravity, initialVelocity){
            return Math.pow(initialVelocity,2)/(2*gravity);
        }; 
        
        var getEffectId = function(){
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8); return v.toString(16);
            }); 
        }; 
                
        
        var fallImpl = function(property, settings){
            var gravity = getOrDefault(settings.gravity,9.81);
            var speed = getOrDefault(settings.speed,1);
            var cor = getOrDefault(settings.cor,0.5); 
            var initialVelocity = getOrDefault(settings.initialVelocity, 0);
            var effectId = getEffectId();
            
            return function(properties, timeFromStart){
                if(properties[effectId] !== undefined &&properties[effectId].stop){
                    return properties;
                }
                if(properties[effectId]===undefined){
                   properties[effectId] = {};
                   properties[effectId].initialVelocity = initialVelocity; 
                   properties[effectId].fallHeight = settings.to - settings.from + maxHeight(gravity, properties[effectId].initialVelocity);
                   properties[effectId].initialTime = settings.startTime; 
                   properties[effectId].intialPosition = settings.from;
                }
                var time = (timeFromStart - properties[effectId].initialTime)/1000*speed;
                var fallDistance = getFallDistance(gravity, properties[effectId].initialVelocity, time);
                properties[property] = properties[effectId].intialPosition + fallDistance;
                
                if((properties[effectId].intialPosition + fallDistance) > settings.to){                                      
                    properties[effectId].initialVelocity = -cor*impactVelocity(properties[effectId].fallHeight, gravity); 
                    if(Math.abs(properties[effectId].initialVelocity) < 1){
                       properties[effectId].stop = true; 
                       properties[property] = settings.to;
                    }
                    properties[effectId].fallHeight = maxHeight(gravity, properties[effectId].initialVelocity);
                    properties[effectId].initialTime = timeFromStart;
                    properties[effectId].intialPosition = settings.to;
                }
                
                return properties;
            };
        };        

        var effectSelector = function(effect) {
            if (effect === "fall") {
                return fallImpl;
            }else if (effect === "sin") {
                return sinImpl;
            }else if (effect === "cos") {
                return cosImpl;
            }else if (effect === "static") {
                return staticImpl;
            }else{
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

