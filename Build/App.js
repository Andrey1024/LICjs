define(["require", "exports", './LIC/JSlic', 'knockout', "jquery-mousewheel", "knockout-jqueryui/tooltip"], function (require, exports, JSlic_1, ko) {
    "use strict";
    var viewModel = (function () {
        function viewModel() {
            var _this = this;
            this.inputX = "pow(y,2)";
            this.inputY = "-x";
            this.top = 2;
            this.bottom = -2;
            this.left = -2;
            this.right = 2;
            this.InputX = ko.pureComputed({
                read: function () { return _this.inputX; },
                write: function (value) {
                    _this.inputX = value;
                    _this.sendMessage();
                },
                owner: this
            });
            this.InputY = ko.pureComputed({
                read: function () { return _this.inputY; },
                write: function (value) {
                    _this.inputY = value;
                    _this.sendMessage();
                },
                owner: this
            });
            this.Top = ko.pureComputed({
                read: function () { return _this.top; },
                write: function (value) {
                    _this.top = value;
                    if (_this.checkBounds(_this.errorTop))
                        _this.sendMessage();
                },
                owner: this
            });
            this.Bottom = ko.pureComputed({
                read: function () { return _this.bottom; },
                write: function (value) {
                    _this.bottom = value;
                    if (_this.checkBounds(_this.errorBottom))
                        _this.sendMessage();
                },
                owner: this
            });
            this.Left = ko.pureComputed({
                read: function () { return _this.left; },
                write: function (value) {
                    _this.left = value;
                    if (_this.checkBounds(_this.errorLeft))
                        _this.sendMessage();
                },
                owner: this
            });
            this.Right = ko.pureComputed({
                read: function () { return _this.right; },
                write: function (value) {
                    _this.right = value;
                    if (_this.checkBounds(_this.errorRight))
                        _this.sendMessage();
                },
                owner: this
            });
            this.parserWorker = new Worker("./Build/Workers/BootWorker.js");
            this.errorX = ko.observable(true);
            this.errorY = ko.observable(true);
            this.errorTop = ko.observable(true);
            this.errorBottom = ko.observable(true);
            this.errorLeft = ko.observable(true);
            this.errorRight = ko.observable(true);
            this.toolTipX = ko.observable("");
            this.toolTipY = ko.observable("");
            this.toolTipBound = ko.observable("Vertical and horizontal spaces must be the same");
            this.mousedown = function (data, event) {
                _this.isMousedown = true;
                _this.mousePos = [event.clientX, event.clientY];
                _this.model.startAnimation();
            };
            this.mouseup = function () {
                _this.isMousedown = false;
                _this.model.stopAnimation();
            };
            this.mousemove = function (data, event) {
                if (!_this.isMousedown)
                    return;
                var offX = event.clientX - _this.mousePos[0];
                var offY = _this.mousePos[1] - event.clientY;
                if (offX)
                    _this.model.moveX(offX);
                if (offY)
                    _this.model.moveY(offY);
                _this.mousePos = [event.clientX, event.clientY];
            };
            this.restoreModel = function () {
                _this.model.restore();
                _this.model.restore();
            };
            this.canvas = ($(".webglCanvas").get(0));
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            this.model = new JSlic_1.JSLIC(this.canvas);
            this.parserWorker.onmessage = function (msg) { _this.handleMessage(msg.data); };
            $(".webglCanvas").mousewheel(function (event) {
                _this.model.scale(event.deltaY);
                _this.model.render();
            });
            $.when(this.model.loadNoiseTexture()).done(function () {
                _this.sendMessage();
            });
        }
        viewModel.prototype.handleMessage = function (message) {
            var _this = this;
            switch (message.type) {
                case "error":
                    if (message.error.errorX) {
                        this.errorX(false);
                        this.toolTipX(message.error.errorX);
                    }
                    else {
                        this.errorX(true);
                    }
                    if (message.error.errorY) {
                        this.errorY(false);
                        this.toolTipY(message.error.errorY);
                    }
                    else {
                        this.errorY(true);
                    }
                    break;
                case "parsed":
                    this.errorX(true);
                    this.errorY(true);
                    break;
                case "value":
                    $.when(this.model.loadFieldTexture(message.field)).done(function () {
                        _this.model.render();
                    });
                    break;
            }
        };
        viewModel.prototype.sendMessage = function () {
            var message = {
                input: {
                    x: this.inputX,
                    y: this.inputY
                },
                bounds: {
                    left: this.left,
                    right: this.right,
                    top: this.top,
                    bottom: this.bottom,
                },
                size: 1024
            };
            this.parserWorker.postMessage(message);
        };
        viewModel.prototype.checkBounds = function (err) {
            if (this.left > this.right || this.bottom > this.top || this.right - this.left !== this.top - this.bottom) {
                err(false);
                return false;
            }
            this.errorBottom(true);
            this.errorLeft(true);
            this.errorRight(true);
            this.errorTop(true);
            return true;
        };
        return viewModel;
    }());
    ko.applyBindings(new viewModel());
});
