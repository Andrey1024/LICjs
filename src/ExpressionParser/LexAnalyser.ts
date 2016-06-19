enum State {
    Home,
    Number,
    Float,
    Identifier,
    Delimiter
}

export enum LexType {
    lex_null = 0,
    lex_number,
    lex_var,
    lex_func,
    lex_minus,
    lex_plus,
    lex_mul,
    lex_div,
    lex_lbracket,
    lex_rbracket,
    lex_comma
}

export interface Lex {
    type: LexType,
    value: string;
}

let tableDelim = [
    '(',
    ')',
    '*',
    '/',
    '+',
    '-',
    ','
]
let lexDelim = [
    LexType.lex_lbracket,
    LexType.lex_rbracket,
    LexType.lex_mul,
    LexType.lex_div,
    LexType.lex_plus,
    LexType.lex_minus,
    LexType.lex_comma
]

export class LexAnalyser {
    private CS: State = State.Home;
    private buf = ""
    private Step(char: string): Lex {
        switch(this.CS) {
            case State.Home:
                if(/[0-9]/.test(char)) {
                    this.CS = State.Number;
                    this.buf = char;
                } else if (/[a-z]|[A-Z]/.test(char)) {
                    this.CS = State.Identifier;
                    this.buf = char;
                } else if (tableDelim.indexOf(char) !== -1) {
                    this.CS = State.Delimiter;
                    this.buf = char;
                } else {
                    throw "Unknown symbol";
                }
                break;  
            case State.Number: 
                if (/[0-9]/.test(char)) {
                    this.buf += char;
                } else if (char === '.') {
                    this.buf += char;
                    this.CS = State.Float;
                } else {
                    this.CS = State.Home;
                    return {type: LexType.lex_number, value: this.buf};
                }
                break;
            case State.Float:
                if (/[0-9]/.test(char)) {
                    this.buf += char;
                } else {                    
                    this.CS = State.Home;
                    return {type: LexType.lex_number, value: this.buf};                   
                }
                break;
            case State.Identifier: 
                if (/[a-z]|[A-Z]/.test(char)) {
                    this.buf += char;
                } else if (this.buf === 'x') {
                    this.CS = State.Home;
                    return {type: LexType.lex_var, value: 'x'};
                } else if (this.buf === 'y') {
                    this.CS = State.Home;
                    return {type: LexType.lex_var, value: 'y'};
                } else {
                    this.CS = State.Home;
                    return {type: LexType.lex_func, value: this.buf};
                }
                break;
            case State.Delimiter: {
                this.CS = State.Home;
                let i: number;
                if ((i = tableDelim.indexOf(this.buf)) !== -1) {
                    this.CS = State.Home;
                    return {type: lexDelim[i], value: tableDelim[i]};
                } else
                    throw "impossible error";
            }
        }
        return {type: LexType.lex_null, value: ""};
    }

    public MakeStep(char: string): Lex {
        let result: Lex;
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
    }
}