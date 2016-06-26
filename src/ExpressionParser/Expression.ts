import {LexAnalyser, Lex} from './LexAnalyser';
import {Parser} from './Parser'

let Analyser = new LexAnalyser();

export interface IField {
    buffer: ArrayBuffer;
    width: number;
    height: number;
    max?: number;
}

export interface IWorkerMessage {
    input: {
        x: string,
        y: string
    };
    size: number;
    bounds: {
        left: number,
        right: number,
        top: number,
        bottom: number
    }
}

export interface IParseError {
    errorX: string;
    errorY: string;
}


export interface IWorkerResponse {
    type: "error" | "value" | "parsed" | "progress";
    error?: IParseError;
    field?: IField;
    time?: number;
    progress?: number;
}

export interface IResult {
    progress: number;
    result: ArrayBuffer;
}

export interface IVariable {
    name: string;
    value: number;
}

export class Expression {
    private lexems: Lex[] = [];
    private poliz: Parser = new Parser();
    private input: string;
    private isValid = false;
    private error = '';
    
    public get Input() : string {
        return this.input;
    }
    
    public get IsValid() : boolean {
        return this.isValid;
    }
    
    public get Error() : string {
        return this.error;
    }
     

    private parse(): Lex[] {
        let result = new Array<Lex>();
        let lex: Lex;
        let str = this.input.replace(/\s+/g, '').concat(";").split("");
        for (let i = 0; i < str.length; i++) {
            if ((lex = Analyser.MakeStep(str[i])).type) {
                result.push(lex);
            }
        }
        return result;
    }

    public Parse(input: string) {
        this.input = input.replace(/\s+/g, '');
        try {
            this.lexems = this.parse();
            this.poliz.Parse(this.lexems);
            this.isValid = true;
        } catch (e) {
            this.isValid = false;
            this.error = e;
        }
    }

    getResult(vars: IVariable[] = []): number {
        return this.poliz.Execute(vars);
    }
}