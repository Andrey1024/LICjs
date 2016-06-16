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


class List<T> {
    next: List<T> = null;

    constructor(public value: T) {}

    Add(val: T) {
        let p: List<T> = this;
        while (p.next) {
            p = p.next;
        }
        p.next = new List<T>(val);
    }
}

export class CommandList<T> {
    private current: List<T> = null;
    private head: List<T> = null;

    Push(val: T) {
        this.head.Add(val);
    }

    GetCurrent(): T {
        return this.current ? this.current.value: undefined;
    }

    Next() {
        this.current = this.current.next;
    }

    SetStart() {
        this.current = this.head.next;
    }

    constructor() {
        this.head = new List<T>(null);
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