var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    var Stack = (function () {
        function Stack() {
            this.stack = [];
        }
        Stack.prototype.Push = function (val) {
            this.stack.push(val);
        };
        Stack.prototype.Pop = function () {
            return this.stack.pop();
        };
        return Stack;
    }());
    exports.Stack = Stack;
    var Variable = (function () {
        function Variable(name) {
            this.name = name;
        }
        return Variable;
    }());
    exports.Variable = Variable;
    var CommandList = (function () {
        function CommandList() {
            this.list = new Array();
        }
        CommandList.prototype.Push = function (val) {
            this.list.push(val);
        };
        CommandList.prototype.GetCurrent = function () {
            return this.list[this.current] ? this.list[this.current] : undefined;
        };
        CommandList.prototype.Next = function () {
            this.current++;
        };
        CommandList.prototype.SetStart = function () {
            this.current = 0;
        };
        CommandList.prototype.Reset = function () {
            this.list = [];
        };
        return CommandList;
    }());
    exports.CommandList = CommandList;
    var PolizConst = (function () {
        function PolizConst(value) {
            this.value = Number(value);
        }
        PolizConst.prototype.evaluate = function (stack, cmd) {
            stack.Push(this);
            cmd.Next();
        };
        return PolizConst;
    }());
    exports.PolizConst = PolizConst;
    var PolizVarAddr = (function () {
        function PolizVarAddr(value) {
            this.value = value;
        }
        PolizVarAddr.prototype.evaluate = function (stack, cmd) {
            stack.Push(this);
            cmd.Next();
        };
        return PolizVarAddr;
    }());
    exports.PolizVarAddr = PolizVarAddr;
    var PolizVar = (function () {
        function PolizVar() {
        }
        PolizVar.prototype.evaluate = function (stack, cmd) {
            var arg = (stack.Pop());
            stack.Push(new PolizConst(arg.value.value));
            cmd.Next();
        };
        return PolizVar;
    }());
    exports.PolizVar = PolizVar;
    var PolizFunction = (function () {
        function PolizFunction() {
        }
        PolizFunction.prototype.evaluate = function (stack, cmd) {
            stack.Push(this.evaluateFun(stack));
            cmd.Next();
        };
        return PolizFunction;
    }());
    exports.PolizFunction = PolizFunction;
    var PolizMul = (function (_super) {
        __extends(PolizMul, _super);
        function PolizMul() {
            _super.apply(this, arguments);
        }
        PolizMul.prototype.evaluateFun = function (stack) {
            var right = stack.Pop();
            var left = stack.Pop();
            return new PolizConst(left.value * right.value);
        };
        return PolizMul;
    }(PolizFunction));
    exports.PolizMul = PolizMul;
    var PolizDiv = (function (_super) {
        __extends(PolizDiv, _super);
        function PolizDiv() {
            _super.apply(this, arguments);
        }
        PolizDiv.prototype.evaluateFun = function (stack) {
            var right = stack.Pop();
            var left = stack.Pop();
            return new PolizConst(left.value / right.value);
        };
        return PolizDiv;
    }(PolizFunction));
    exports.PolizDiv = PolizDiv;
    var PolizAdd = (function (_super) {
        __extends(PolizAdd, _super);
        function PolizAdd() {
            _super.apply(this, arguments);
        }
        PolizAdd.prototype.evaluateFun = function (stack) {
            var right = stack.Pop();
            var left = stack.Pop();
            return new PolizConst(left.value + right.value);
        };
        return PolizAdd;
    }(PolizFunction));
    exports.PolizAdd = PolizAdd;
    var PolizMinus = (function (_super) {
        __extends(PolizMinus, _super);
        function PolizMinus() {
            _super.apply(this, arguments);
        }
        PolizMinus.prototype.evaluateFun = function (stack) {
            var right = stack.Pop();
            var left = stack.Pop();
            return new PolizConst(left.value - right.value);
        };
        return PolizMinus;
    }(PolizFunction));
    exports.PolizMinus = PolizMinus;
    var PolizSin = (function (_super) {
        __extends(PolizSin, _super);
        function PolizSin() {
            _super.apply(this, arguments);
        }
        PolizSin.prototype.evaluateFun = function (stack) {
            var arg = stack.Pop();
            return new PolizConst(Math.sin(arg.value));
        };
        return PolizSin;
    }(PolizFunction));
    exports.PolizSin = PolizSin;
    var PolizCos = (function (_super) {
        __extends(PolizCos, _super);
        function PolizCos() {
            _super.apply(this, arguments);
        }
        PolizCos.prototype.evaluateFun = function (stack) {
            var arg = stack.Pop();
            return new PolizConst(Math.cos(arg.value));
        };
        return PolizCos;
    }(PolizFunction));
    exports.PolizCos = PolizCos;
    var PolizPow = (function (_super) {
        __extends(PolizPow, _super);
        function PolizPow() {
            _super.apply(this, arguments);
        }
        PolizPow.prototype.evaluateFun = function (stack) {
            var right = stack.Pop();
            var left = stack.Pop();
            return new PolizConst(Math.pow(left.value, right.value));
        };
        return PolizPow;
    }(PolizFunction));
    exports.PolizPow = PolizPow;
    var PolizUnaryMinus = (function (_super) {
        __extends(PolizUnaryMinus, _super);
        function PolizUnaryMinus() {
            _super.apply(this, arguments);
        }
        PolizUnaryMinus.prototype.evaluateFun = function (stack) {
            var arg = stack.Pop();
            return new PolizConst(-arg.value);
        };
        return PolizUnaryMinus;
    }(PolizFunction));
    exports.PolizUnaryMinus = PolizUnaryMinus;
});
