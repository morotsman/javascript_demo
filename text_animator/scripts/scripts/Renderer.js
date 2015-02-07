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
            var lastTickProperties = animation.lastTickProperties?animation.lastTickProperties:properties;
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
            return util.getOrDefault(timeFromStart, 0);//TODO fix, this will cause an error, each animation must have it's own
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
                                context.rotate(prop.angle*Math.PI/180);
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
});