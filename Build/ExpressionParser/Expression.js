define(["require", "exports", './LexAnalyser', './Parser'], function (require, exports, LexAnalyser_1, Parser_1) {
    "use strict";
    var Analyser = new LexAnalyser_1.LexAnalyser();
    var Expression = (function () {
        function Expression() {
            this.lexems = [];
            this.poliz = new Parser_1.Parser();
            this.isValid = false;
            this.error = '';
        }
        Object.defineProperty(Expression.prototype, "Input", {
            get: function () {
                return this.input;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "IsValid", {
            get: function () {
                return this.isValid;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "Error", {
            get: function () {
                return this.error;
            },
            enumerable: true,
            configurable: true
        });
        Expression.prototype.parse = function () {
            var result = new Array();
            var lex;
            var str = this.input.replace(/\s+/g, '').concat(";").split("");
            for (var i = 0; i < str.length; i++) {
                if ((lex = Analyser.MakeStep(str[i])).type) {
                    result.push(lex);
                }
            }
            return result;
        };
        Expression.prototype.Parse = function (input) {
            this.input = input.replace(/\s+/g, '');
            try {
                this.lexems = this.parse();
                this.poliz.Parse(this.lexems);
                this.isValid = true;
            }
            catch (e) {
                this.isValid = false;
                this.error = e;
            }
        };
        Expression.prototype.getResult = function (vars) {
            if (vars === void 0) { vars = []; }
            return this.poliz.Execute(vars);
        };
        return Expression;
    }());
    exports.Expression = Expression;
});
