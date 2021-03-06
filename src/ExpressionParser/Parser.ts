import {Lex, LexType} from './LexAnalyser';
import * as Poliz  from './Poliz'

export interface Var {
    name: string;
    value: number;
}

export class Parser {
    private currIndex: number = 0;
    private poliz = new Poliz.CommandList<Poliz.IPolizItem>();
    private varList: any = new Object();
    private lexems: Lex[] = [];

    private currLex(): Lex {
        if (this.lexems.length <= this.currIndex)
            return {type: LexType.lex_null, value: ""};
        return this.lexems[this.currIndex];
    }

    private Expression() {
        let minusFlag = false;
        if (this.currLex().type === LexType.lex_minus) {
            minusFlag = true;
            this.currIndex++;
        }
        this.Term();
        if (minusFlag) this.poliz.Push(new Poliz.PolizUnaryMinus());
        while (this.currLex().type === LexType.lex_plus ||
               this.currLex().type === LexType.lex_minus) {
            let op = this.currLex().type;
            this.currIndex++;
            this.Term();
            switch (op) {
                case LexType.lex_plus: 
                    this.poliz.Push(new Poliz.PolizAdd());
                    break;
                case LexType.lex_minus:
                    this.poliz.Push(new Poliz.PolizMinus());
            }
        }
    }

    private Term() {
        this.Factor();
        while (this.currLex().type === LexType.lex_mul ||
               this.currLex().type === LexType.lex_div) {
            let op = this.currLex().type;
            this.currIndex++;
            this.Factor();
            switch (op) {
                case LexType.lex_mul: 
                    this.poliz.Push(new Poliz.PolizMul());
                    break;
                case LexType.lex_div:
                    this.poliz.Push(new Poliz.PolizDiv());
            }
        }
    }

    private Factor() {
        switch (this.currLex().type) {
            case LexType.lex_number: 
                this.poliz.Push(new Poliz.PolizConst(this.currLex().value));
                this.currIndex++;
                break;
            case LexType.lex_lbracket:
                this.currIndex++;
                this.Expression();
                if (this.currLex().type !== LexType.lex_rbracket) {
                    throw "Expected closing bracket";
                }
                break;
            case LexType.lex_func:
                this.Function();
                break;
            case LexType.lex_var:
                this.varList[this.currLex().value] = new Poliz.Variable(this.currLex().value);
                this.poliz.Push(new Poliz.PolizVarAddr(this.varList[this.currLex().value]));
                this.poliz.Push(new Poliz.PolizVar());
                this.currIndex++;
                break;
            default:
                throw "Bad factor";
        }
    }

    private Function() {
        let func = this.currLex().value;
        this.currIndex++;
        if (this.currLex().type !== LexType.lex_lbracket) {
            throw "Expected opening bracket";            
        }
        this.currIndex++;
        this.Expression();
        while (this.currLex().type === LexType.lex_comma) {
            this.currIndex++;
            this.Expression();
        }
        if (this.currLex().type !== LexType.lex_rbracket) {
            throw "Expected closing bracket";            
        }
        switch(func) {
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
    }

    public Parse(lexems: Lex[]) {
        if (this.lexems !== lexems) {
            this.lexems = lexems;
            this.poliz.Reset();
            this.varList = {};
            this.currIndex = 0;
            this.Expression();            
        }
    }

    public Execute(varList: Var[]): number {// compute current poliz with given values of variables
        let stack = new Poliz.Stack<Poliz.IPolizItem>();
        this.poliz.SetStart();
        for (let i = 0; i < varList.length; i++) {
            if (this.varList.hasOwnProperty(varList[i].name))
                this.varList[varList[i].name].value = varList[i].value;
        }

        while (this.poliz.GetCurrent()) {
            this.poliz.GetCurrent().evaluate(stack, this.poliz);
        }

        return (<Poliz.PolizConst>stack.Pop()).value;
    }

    public Simplify() {

    }
}