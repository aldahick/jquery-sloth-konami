/**
@file jQuery plugin that rains sloths when the Konami code is entered.
@author Alex Hicks <alex@alexhicks.net>
@version 0.0.1
@requires jquery
*/
(function($) {
    // borrowed from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function buildCallback(context, callback) {
        return function(a, b, c, d, e, f) {
            callback.apply(context, [a, b, c, d, e, f]);
        };
    }

    // UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A
    function KonamiListener($element, callback) {
        this.callback = callback;
        this.count = 0;

        this.onKeyDown = function(evt) {
            if ((evt.which == 38 && this.count == 0 || this.count == 1) || // up
                (evt.which == 40 && this.count == 2 || this.count == 3) || // down
                (evt.which == 37 && this.count == 4 || this.count == 6) || // left
                (evt.which == 39 && this.count == 5 || this.count == 7) || // right
                (evt.which == 66 && this.count == 8)) { // b
                this.count++;
            } else {
                if (evt.which == 65 && this.count == 9) { // a
                    this.callback();
                }
                this.count = 0;
            }
        }

        this.listen = function() {
            $(document).on("keydown", buildCallback(this, this.onKeyDown));
        };
    }

    function SlothForest(ctx, image, settings) {
        this.ctx = ctx;
        this.image = image;
        this.settings = settings;
        this.sloths = [];
        this.width = ctx.canvas.width - settings.drawWidth;
        this.height = ctx.canvas.height - settings.drawHeight;

        this.getNewSlothCoords = function() {
            var coords = {};
            coords.x = getRandomInt(0, this.width);
            coords.y = getRandomInt(0, this.height / 3);
            var isColliding = false;
            for (var i = 0; i < this.sloths.length; i++) {
                if (this.sloths[i].x < coords.x + this.settings.drawWidth &&
                    this.sloths[i].x + this.settings.drawWidth > coords.x &&
                    this.sloths[i].y < coords.y + this.settings.drawHeight &&
                    this.sloths[i].y + this.settings.drawHeight > coords.y) {
                    // collision
                    isColliding = true;
                    break; // no point in continuing
                }
            }
            return isColliding ? null : coords;
        }

        this.addSloth = function() {
            var coords = this.getNewSlothCoords();
            if (coords == null) { // there was a collision
                return; // can't do anything, oh well
            }
            this.sloths.push(coords);
            this.ctx.drawImage(
                this.image,
                coords.x,
                coords.y,
                this.settings.drawWidth,
                this.settings.drawHeight);
        };

        this.update = function() {
            for (var i = 0; i < this.sloths.length; i++) {
                this.sloths[i].y += this.settings.waterfallSpeed;
                if (this.sloths[i].y > this.height) {
                    this.sloths.splice(i, 1);
                    i -= 1;
                    continue;
                }
                var rangeX = this.settings.drawWidth / 4;
                var newX = this.sloths[i].x + getRandomInt(-rangeX, rangeX);
                if (newX > 0 && newX < this.width) {
                    this.sloths[i].x = newX;
                }
            }
        }

        this.render = function() {
            this.update();
            // clear the canvas
            this.ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            // ALL THE SLOTHS
            for (var i = 0; i < this.sloths.length; i++) {
                this.ctx.drawImage(
                    this.image,
                    this.sloths[i].x,
                    this.sloths[i].y,
                    this.settings.drawWidth,
                    this.settings.drawHeight
                );
            }
        };
    }
    $.fn.sloth = function(options) {
        var settings = $.extend({}, $.fn.sloth.defaults, options);
        return this.each(function() {
            var $this = $(this);
            var $canvas = $("<canvas></canvas>");
            $canvas.css("position", "relative");
            $canvas.css("z-index", "-99999");
            $this.css("position", "absolute");
            // "position: absolute" changes size, need to set canvas size after that
            $canvas[0].width = $this.width();
            $canvas[0].height = $this.height();
            $this.after($canvas);
            var context = $canvas[0].getContext("2d");
            var image = new Image();
            image.onload = function() {
                var forest = new SlothForest(context, image, settings);
                $.fn.sloth.forests.push(forest);
                context.imageSmoothingEnabled = false;
                var konami = new KonamiListener($this, function() {
                    setInterval(buildCallback(forest, forest.render), settings.renderInterval);
                    setInterval(buildCallback(forest, forest.addSloth), settings.newSlothInterval);
                });
                konami.listen();
            };
            image.src = settings.imageUrl;
        });
    };
    $.fn.sloth.defaults = {
        "imageUrl": "sloth.png",
        "drawWidth": 50,
        "drawHeight": 50,
        "renderInterval": 100,
        "newSlothInterval": 200,
        "waterfallSpeed": 15
    };
    $.fn.sloth.forests = [];
})(jQuery);
