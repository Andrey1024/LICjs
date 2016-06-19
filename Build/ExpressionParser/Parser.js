define(["require", "exports", './LexAnalyser', './Poliz'], function (require, exports, LexAnalyser_1, Poliz) {
    "use strict";
    var Parser = (function () {
        function Parser() {
            this.currIndex = 0;
            this.poliz = new Poliz.CommandList();
            this.varList = new Object();
            this.lexems = [];
        }
        Parser.prototype.currLex = function () {
            if (this.lexems.length <= this.currIndex)
                return { type: LexAnalyser_1.LexType.lex_null, value: "" };
            return this.lexems[this.currIndex];
        };
        Parser.prototype.Expression = function () {
            var minusFlag = false;
            if (this.currLex().type === LexAnalyser_1.LexType.lex_minus) {
                minusFlag = true;
                this.currIndex++;
            }
            this.Term();
            if (minusFlag)
                this.poliz.Push(new Poliz.PolizUnaryMinus());
            while (this.currLex().type === LexAnalyser_1.LexType.lex_plus ||
                this.currLex().type === LexAnalyser_1.LexType.lex_minus) {
                var op = this.currLex().type;
                this.currIndex++;
                this.Term();
                switch (op) {
                    case LexAnalyser_1.LexType.lex_plus:
                        this.poliz.Push(new Poliz.PolizAdd());
                        break;
                    case LexAnalyser_1.LexType.lex_minus:
                        this.poliz.Push(new Poliz.PolizMinus());
                }
            }
        };
        Parser.prototype.Term = function () {
            this.Factor();
            while (this.currLex().type === LexAnalyser_1.LexType.lex_mul ||
                this.currLex().type === LexAnalyser_1.LexType.lex_div) {
                var op = this.currLex().type;
                this.currIndex++;
                this.Factor();
                switch (op) {
                    case LexAnalyser_1.LexType.lex_mul:
                        this.poliz.Push(new Poliz.PolizMul());
                        break;
                    case LexAnalyser_1.LexType.lex_div:
                        this.poliz.Push(new Poliz.PolizDiv());
                }
            }
        };
        Parser.prototype.Factor = function () {
            switch (this.currLex().type) {
                case LexAnalyser_1.LexType.lex_number:
                    this.poliz.Push(new Poliz.PolizConst(this.currLex().value));
                    this.currIndex++;
                    break;
                case LexAnalyser_1.LexType.lex_lbracket:
                    this.currIndex++;
                    this.Expression();
                    if (this.currLex().type !== LexAnalyser_1.LexType.lex_rbracket) {
                        throw "Expected closing bracket";
                    }
                    break;
                case LexAnalyser_1.LexType.lex_func:
                    this.Function();
                    break;
                case LexAnalyser_1.LexType.lex_var:
                    this.varList[this.currLex().value] = new Poliz.Variable(this.currLex().value);
                    this.poliz.Push(new Poliz.PolizVarAddr(this.varList[this.currLex().value]));
                    this.poliz.Push(new Poliz.PolizVar());
                    this.currIndex++;
                    break;
                default:
                    throw "Bad factor";
            }
        };
        Parser.prototype.Function = function () {
            var func = this.currLex().value;
            this.currIndex++;
            if (this.currLex().type !== LexAnalyser_1.LexType.lex_lbracket) {
                throw "Expected opening bracket";
            }
            this.currIndex++;
            this.Expression();
            while (this.currLex().type === LexAnalyser_1.LexType.lex_comma) {
                this.currIndex++;
                this.Expression();
            }
            if (this.currLex().type !== LexAnalyser_1.LexType.lex_rbracket) {
                throw "Expected closing bracket";
            }
            switch (func) {
                case 'sin':
                    this.poliz.Push(new Poliz.PolizSin());
                    break;
                case 'cos':
                    this.poliz.Push(new Poliz.PolizCos());
                    break;
                case 'pow':
                    this.poliz.Push(new Poliz.PolizPow());
                    break;
            }
            this.currIndex++;
        };
        Parser.prototype.Parse = function (lexems) {
            if (this.lexems !== lexems) {
                this.lexems = lexems;
                this.poliz.Reset();
                this.varList = {};
                this.currIndex = 0;
                this.Expression();
            }
        };
        Parser.prototype.Execute = function (varList) {
            var stack = new Poliz.Stack();
            this.poliz.SetStart();
            for (var i = 0; i < varList.length; i++) {
                if (this.varList.hasOwnProperty(varList[i].name))
                    this.varList[varList[i].name].value = varList[i].value;
            }
            while (this.poliz.GetCurrent()) {
                this.poliz.GetCurrent().evaluate(stack, this.poliz);
            }
            return stack.Pop().value;
        };
        Parser.prototype.Simplify = function () {
        };
        return Parser;
    }());
    exports.Parser = Parser;
});
