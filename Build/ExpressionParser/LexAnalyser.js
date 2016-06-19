define(["require", "exports"], function (require, exports) {
    "use strict";
    var State;
    (function (State) {
        State[State["Home"] = 0] = "Home";
        State[State["Number"] = 1] = "Number";
        State[State["Float"] = 2] = "Float";
        State[State["Identifier"] = 3] = "Identifier";
        State[State["Delimiter"] = 4] = "Delimiter";
    })(State || (State = {}));
    (function (LexType) {
        LexType[LexType["lex_null"] = 0] = "lex_null";
        LexType[LexType["lex_number"] = 1] = "lex_number";
        LexType[LexType["lex_var"] = 2] = "lex_var";
        LexType[LexType["lex_func"] = 3] = "lex_func";
        LexType[LexType["lex_minus"] = 4] = "lex_minus";
        LexType[LexType["lex_plus"] = 5] = "lex_plus";
        LexType[LexType["lex_mul"] = 6] = "lex_mul";
        LexType[LexType["lex_div"] = 7] = "lex_div";
        LexType[LexType["lex_lbracket"] = 8] = "lex_lbracket";
        LexType[LexType["lex_rbracket"] = 9] = "lex_rbracket";
        LexType[LexType["lex_comma"] = 10] = "lex_comma";
    })(exports.LexType || (exports.LexType = {}));
    var LexType = exports.LexType;
    var tableDelim = [
        '(',
        ')',
        '*',
        '/',
        '+',
        '-',
        ','
    ];
    var lexDelim = [
        LexType.lex_lbracket,
        LexType.lex_rbracket,
        LexType.lex_mul,
        LexType.lex_div,
        LexType.lex_plus,
        LexType.lex_minus,
        LexType.lex_comma
    ];
    var LexAnalyser = (function () {
        function LexAnalyser() {
            this.CS = State.Home;
            this.buf = "";
        }
        LexAnalyser.prototype.Step = function (char) {
            switch (this.CS) {
                case State.Home:
                    if (/[0-9]/.test(char)) {
                        this.CS = State.Number;
                        this.buf = char;
                    }
                    else if (/[a-z]|[A-Z]/.test(char)) {
                        this.CS = State.Identifier;
                        this.buf = char;
                    }
                    else if (tableDelim.indexOf(char) !== -1) {
                        this.CS = State.Delimiter;
                        this.buf = char;
                    }
                    else {
                        throw "Unknown symbol";
                    }
                    break;
                case State.Number:
                    if (/[0-9]/.test(char)) {
                        this.buf += char;
                    }
                    else if (char === '.') {
                        this.buf += char;
                        this.CS = State.Float;
                    }
                    else {
                        this.CS = State.Home;
                        return { type: LexType.lex_number, value: this.buf };
                    }
                    break;
                case State.Float:
                    if (/[0-9]/.test(char)) {
                        this.buf += char;
                    }
                    else {
                        this.CS = State.Home;
                        return { type: LexType.lex_number, value: this.buf };
                    }
                    break;
                case State.Identifier:
                    if (/[a-z]|[A-Z]/.test(char)) {
                        this.buf += char;
                    }
                    else if (this.buf === 'x') {
                        this.CS = State.Home;
                        return { type: LexType.lex_var, value: 'x' };
                    }
                    else if (this.buf === 'y') {
                        this.CS = State.Home;
                        return { type: LexType.lex_var, value: 'y' };
                    }
                    else {
                        this.CS = State.Home;
                        return { type: LexType.lex_func, value: this.buf };
                    }
                    break;
                case State.Delimiter: {
                    this.CS = State.Home;
                    var i = void 0;
                    if ((i = tableDelim.indexOf(this.buf)) !== -1) {
                        this.CS = State.Home;
                        return { type: lexDelim[i], value: tableDelim[i] };
                    }
                    else
                        throw "impossible error";
                }
            }
            return { type: LexType.lex_null, value: "" };
        };
        LexAnalyser.prototype.MakeStep = function (char) {
            var result;
            if (char === ';') {
                result = this.Step(char);
                if (!result.type) {
                    throw "unknown symbol";
                }
                return result;
            }
            if ((result = this.Step(char)).type) {
                this.Step(char);
            }
            return result;
        };
        return LexAnalyser;
    }());
    exports.LexAnalyser = LexAnalyser;
});
