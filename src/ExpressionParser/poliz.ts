export class Stack<T> {
    private stack: T[] = [];

    public Push(val: T) {
        this.stack.push(val);
    }

    public Pop(): T {
        return this.stack.pop();
    }
}

export class Variable {
    public value: number;
    constructor(public name: string) {}
}

export class CommandList<T> {
    private current: number;
    private list: T[];

    Push(val: T) {
        this.list.push(val);
    }

    GetCurrent(): T {
        return this.list[this.current] ? this.list[this.current] : undefined;
    }

    Next() {
        this.current++;
    }

    SetStart() {
        this.current = 0;
    }

    constructor() {
        this.list = new Array<T>();
    }
}

export interface IPolizItem {
    evaluate(stack: Stack<IPolizItem>, cmd: CommandList<IPolizItem>);
}

export class PolizConst implements IPolizItem {
    value: number
    constructor(value: any) {
        this.value = Number(value);
    }
    evaluate(stack: Stack<IPolizItem>, cmd: CommandList<IPolizItem>) {
        stack.Push(this);
        cmd.Next();
    }
}

export class PolizVarAddr implements IPolizItem {
    constructor(public value: Variable) {}
    evaluate(stack: Stack<IPolizItem>, cmd: CommandList<IPolizItem>) {
        stack.Push(this);
        cmd.Next();
    }
}

export class PolizVar implements IPolizItem {
    evaluate(stack: Stack<IPolizItem>, cmd: CommandList<IPolizItem>) {
        let arg = <PolizVarAddr>(stack.Pop());
        stack.Push(new PolizConst(arg.value.value));
        cmd.Next();
    }
}

export abstract class PolizFunction implements IPolizItem {
    evaluate(stack: Stack<IPolizItem>, cmd: CommandList<IPolizItem>) {
        stack.Push(this.evaluateFun(stack));
        cmd.Next();
    }
    abstract evaluateFun(stack: Stack<IPolizItem>): PolizConst;
}

export class PolizMul extends PolizFunction {
    evaluateFun(stack: Stack<IPolizItem>) {
        let right = <PolizConst>stack.Pop();
        let left = <PolizConst>stack.Pop();
        return new PolizConst(left.value * right.value);
    }
}

export class PolizDiv extends PolizFunction {
    evaluateFun(stack: Stack<IPolizItem>) {
        let right = <PolizConst>stack.Pop();
        let left = <PolizConst>stack.Pop();
        return new PolizConst(left.value / right.value);
    }
}

export class PolizAdd extends PolizFunction {
    evaluateFun(stack: Stack<IPolizItem>) {
        let right = <PolizConst>stack.Pop();
        let left = <PolizConst>stack.Pop();
        return new PolizConst(left.value + right.value);
    }
}

export class PolizMinus extends PolizFunction {
    evaluateFun(stack: Stack<IPolizItem>) {
        let right = <PolizConst>stack.Pop();
        let left = <PolizConst>stack.Pop();
        return new PolizConst(left.value - right.value);
    }
}

export class PolizSin extends PolizFunction {
    evaluateFun(stack: Stack<IPolizItem>) {
        let arg = <PolizConst>stack.Pop();
        return new PolizConst(Math.sin(arg.value));
    }
}

export class PolizCos extends PolizFunction {
    evaluateFun(stack: Stack<IPolizItem>) {
        let arg = <PolizConst>stack.Pop();
        return new PolizConst(Math.cos(arg.value));
    }
}

export class PolizPow extends PolizFunction {
    evaluateFun(stack: Stack<IPolizItem>) {
        let right = <PolizConst>stack.Pop();
        let left = <PolizConst>stack.Pop();
        return new PolizConst(Math.pow(left.value, right.value));
    }
}

export class PolizUnaryMinus extends PolizFunction {
    evaluateFun(stack: Stack<IPolizItem>) {
        let arg = <PolizConst>stack.Pop();
        return new PolizConst(- arg.value);
    }
}