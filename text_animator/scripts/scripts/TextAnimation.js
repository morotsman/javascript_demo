define(["util", "list", "effects"], function(util, List, effetcImpls) {

    var TextAnimation = function(_config) {

        var effects = util.getOrDefault(_config.effects, new List([]));
        var subject = util.getOrDefault(_config.subject, "");
        var x = util.getOrDefault(_config.x, 0);
        var y = util.getOrDefault(_config.y, 0);
        var font = util.getOrDefault(_config.font, "Arial");
        var fontSize = util.getOrDefault(_config.fontSize, 25);
        var alpha = util.getOrDefault(_config.alpha, 1);
        var startTime = util.getOrDefault(_config.startTime, Number.MAX_VALUE);
        var duration = util.getOrDefault(_config.duration, 0);
        var stopTime = util.getOrDefault(_config.stopTime, 0);
        var scale = util.getOrDefault(_config.scale, 1);
        var angle = util.getOrDefault(_config.angle, 0);
        var rgba = util.getOrDefault(_config.rgba, {red: 0, green: 0, blue: 0});

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

        var effect = function(property, settings, fun) {
            var selectedEffect = effetcImpls.getEffect(settings.effectName);
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
    };
    
    return TextAnimation;
});