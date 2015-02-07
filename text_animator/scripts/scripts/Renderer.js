define(["util"], function(util) {

    return function(context, canvas) {
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
            var lastTickProperties = animation.lastTickProperties ? animation.lastTickProperties : properties;
            var modifiedProperties = properties;
            for (var i = 0; i < animation.runtimeEffects.length; i++) {
                modifiedProperties = animation.runtimeEffects[i](modifiedProperties, timeFromStart, lastTickProperties);
            }
            animation.lastTickProperties = modifiedProperties;

            return modifiedProperties;
        };

        this.createRuntimeAnimations = function(animations) {

            var result = new Array();

            for (var i = 0; i < animations.length; i++) {
                var elements = animations[i].textStream.foldLeft(new Array(), function(acc, element) {
                    var copyOfElement = element.copy();

                    copyOfElement.runtimeEffects = element.getEffects().foldLeft(new Array(), function(acc, effect) {
                        acc.push(effect());
                        return acc;

                    });

                    acc.push(copyOfElement);
                    return acc;
                });
                result.push(elements);

            }


            return result;
        };

        this.stop = function() {
            cancelAnimationFrame(requestId);
            context.clearRect(0, 0, canvas.width, canvas.height);
            return util.getOrDefault(timeFromStart, 0);//TODO fix, this will cause an error, each animation must have it's own
        };


        var render = function(prop) {
            context.save();
            context.font = Math.floor(prop.scale * prop.fontSize) + "px " + prop.font;
            context.fillStyle = "rgba(" + prop.rgba.red + "," + prop.rgba.green + "," + prop.rgba.blue + ", " + Math.floor(prop.alpha) + ")";

            if (prop.angle !== 0) {
                context.translate(Math.floor(prop.x), Math.floor(prop.y));
                context.rotate(prop.angle * Math.PI / 180);
            } else {
                context.translate(Math.floor(prop.x), Math.floor(prop.y));
            }

            context.fillText(prop.subject, 0, 0);

            context.restore();
        };


        this.start = function(animations, startTime) {
            var that = this;
            var runtimeAnimations = this.createRuntimeAnimations(animations);
            var startTimes = {};
            var loopTimes = {};
            var timesFromStart = {};            
            var stopTimes = {};
            var loop = {};
            
            for (var i = 0; i < animations.length; i++) {
                var stopTime = animations[i].textStream.foldLeft(0, function(acc, animation) {
                    return Math.max(acc, animation.getStopTime());
                });
                console.log(stopTime);
                stopTimes[i] = stopTime;
                loop[i] = animations[i].loop;
            }

            
            
            var runner = function(now) {

                context.clearRect(0, 0, canvas.width, canvas.height);
                for (var i = 0; i < runtimeAnimations.length; i++) {
                    startTimes[i] = startTimes[i] === undefined ? new Date().getTime() : startTimes[i];
                    startTimes[i] = loopTimes[i] === undefined ? startTimes[i] : loopTimes[i];
                    timesFromStart[i] = now - startTimes[i];
                    
                    for (var j = 0; j < runtimeAnimations[i].length; j++) {
                        var animation = runtimeAnimations[i][j];
                        if ((timesFromStart[i] < animation.getStopTime()) && timesFromStart[i] > animation.getStartTime()) {
                            var prop = that.apply(timesFromStart[i], animation);
                            render(prop);
                        }
                    }
                    //handle loop
                    if ((timesFromStart[i] > stopTimes[i])) {
                        console.log("i: " + i + " loop: " + loop[i]);
                        if (loop[i]) {
                            loopTimes[i] = new Date().getTime();
                            runtimeAnimations[i] = that.createRuntimeAnimations([animations[i]])[0];//TODO fix this later
                        } else {//remove
                            runtimeAnimations.splice(i, 1);
                            console.log("Removing: " + i);
                        }

                        if (runtimeAnimations.length === 0) {
                            return;
                        }
                    }
                }

                requestId = requestAnimationFrame(runner);
            };
            requestId = requestAnimationFrame(runner);
        };


    }
});