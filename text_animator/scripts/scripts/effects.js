define(function() {
    
      var Effects = function (){
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
                var gravity = util.getOrDefault(settings.gravity, 9.81);
                var speed = util.getOrDefault(settings.speed, 1);
                var cor = util.getOrDefault(settings.cor, 0.5);
                var initialVelocity = util.getOrDefault(settings.initialVelocity, 0);
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
                    intialPosition = util.getOrDefault(intialPosition, properties[property]);
                    ground = util.getOrDefault(ground, intialPosition + settings.change);
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
    };
    return new Effects();
    
});