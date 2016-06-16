import {LexAnalyser, Lex} from './lexAnalyser';
import {Parser} from './parser'

let Analyser = new LexAnalyser();

export class Expression {
    private lexems: Lex[] = [];
    private poliz: Parser;

    private Parse(input: string): Lex[] {
        let result = new Array<Lex>();
        let lex: Lex;
        let str = input.replace(/\s+/g, '').concat(";").split("");
        for (let i = 0; i < str.length; i++) {
            if ((lex = Analyser.MakeStep(str[i])).type) {
                result.push(lex);
            }
        }
        return result;
    }

    constructor (input: string) {
        this.lexems = this.Parse(input);
        this.poliz = new Parser(this.lexems);
        this.poliz.Parse();
    }

    getResult(): number {
        return this.poliz.Execute([{name: 'x', value: 5}]);
    }


}