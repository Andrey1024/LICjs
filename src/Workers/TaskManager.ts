/// <reference path="../../bower_components/rxjs/ts/rx.all.d.ts" />


import Rx = require("rx");

export class TaskManager {
    protected worker: Worker = null;
    protected messages: Rx.Subject<any>;
    protected observer: Rx.Observer<any>;

    constructor(protected workerPath: string) {
    }

    public StartTask(task: any): Rx.Subject<any> {
        if (this.worker) this.worker.terminate();
        this.worker = new Worker(this.workerPath);
        this.worker.postMessage(task);
        this.worker.onmessage = (msg) => {this.HandleMessage(msg.data);}
        return this.messages = new Rx.Subject();
    }

    protected  HandleMessage(message) {
        this.messages.onNext(message);
    }
}

export class ParserManager extends TaskManager {
    constructor() {
        super('./Build/Workers/BootParse.js');
    }

    /*protected HandleMessage(obs: Rx.Observer<any>) {
        this.worker = new Worker(this.workerPath);
        this.worker.onerror = (e) => {
            obs.onError(e);
        };
        this.worker.onmessage = (data) => {
            obs.onNext(data.data);
        }
    }*/

    /*protected SendMessage(message) {
        this.worker.terminate();
        this.worker = new Worker(this.workerPath);
        this.worker.onerror = (e) => {
            this.observer.onError(e);
        };
        this.worker.onmessage = (data) => {
            this.observer.onNext(data.data);
        }
        this.worker.postMessage(message);
    }*/
}