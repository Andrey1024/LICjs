/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
/// <amd-dependency path="jquery-mousewheel" />
/// <amd-dependency path="knockout-jqueryui/tooltip" />
/// <amd-dependency path="knockout-jqueryui/buttonset" />

import { JSLIC } from './LIC/JSlic';
import ko = require('knockout');
import { TaskManager } from './Workers/TaskManager';
import { IWorkerMessage, IWorkerResponse, IParseError } from './ExpressionParser/Expression'
import Rx = require("rx");

class viewModel {
    private parser: TaskManager;
    private progress = 0; // field computing progress
    private ready = false; // true when field computed first time
    // field expressions
    private inputX ="pow(y,2)";
    private inputY = "-x";
    // field bounds
    private top = 2;
    private bottom = -2;
    private left = -2;
    private right = 2;

    // fill field texture with expressions or data from file
    InputType = ko.observable("expression"); // "expression" or "file"

    AverageTime = ko.observable("0");
    AverageParse = ko.observable("0");

    // knockout binding properties for expressions
    InputX = ko.pureComputed<string>({
        read: () => { return this.inputX;},
        write: (value) => {
            this.inputX = value;
            this.sendMessage();
        },
        owner: this
    });
    InputY = ko.pureComputed<string>({
        read: () => { return this.inputY;},
        write: (value) => {
            this.inputY = value;
            this.sendMessage();
        },
        owner: this
    });

    // knockout binding properties for field bounds
    Top = ko.pureComputed({
        read: () => { return this.top;},
        write: (value) => {
            this.top = Number(value);
            if (this.checkBounds(this.errorTop)) this.sendMessage();
        },
        owner: this
    });
    Bottom = ko.pureComputed({
        read: () => { return this.bottom;},
        write: (value) => {
            this.bottom = Number(value);
            if (this.checkBounds(this.errorBottom)) this.sendMessage();
        },
        owner: this
    });
    Left = ko.pureComputed({
        read: () => { return this.left;},
        write: (value) => {
            this.left = Number(value);
            if (this.checkBounds(this.errorLeft)) this.sendMessage();
        },
        owner: this
    });
    Right = ko.pureComputed({
        read: () => { return this.right;},
        write: (value) => {
            this.right = Number(value);
            if (this.checkBounds(this.errorRight)) this.sendMessage();
        },
        owner: this
    });

    // canvas with webgl context
    private canvas: HTMLCanvasElement;

    // turn on animation when mouse is down
    private isMousedown: boolean;

    // enable tooltip for corresponding input elements if true
    public errorX      = ko.observable(true);
    public errorY      = ko.observable(true);
    public errorTop    = ko.observable(true);
    public errorBottom = ko.observable(true);
    public errorLeft   = ko.observable(true);
    public errorRight  = ko.observable(true);
    // tooltips for input elements
    public toolTipX      = ko.observable("");
    public toolTipY      = ko.observable("");
    public toolTipBound  = ko.observable("Vertical and horizontal spaces must be the same");

    // last mouse position
    private mousePos: number[];

    // handle message received from worker
    private handleMessage(message: IWorkerResponse) {
        switch (message.type) {
            case "error":
                if (message.error.errorX) {
                    this.errorX(false);
                    this.toolTipX(message.error.errorX);
                } else { this.errorX(true)}
                if (message.error.errorY) {
                    this.errorY(false);
                    this.toolTipY(message.error.errorY);
                } else { this.errorY(true)}
                break;
            case "progress":
                $(".progress").css('height', message.progress + '%');
                break;
            case "parsed":
                this.errorX(true);
                this.errorY(true); 
                break;
            case "value": 
                $.when(this.model.loadFieldTexture(message.field)).done(() => {
                    this.model.render();
                    this.AverageTime(this.model.AverageRenderTime.toFixed(4));
                    this.AverageParse(message.time.toFixed(4));
                });
                break;            
        }
    }
    
    // send message to worker with current values
    private sendMessage() {
        let message: IWorkerMessage = {
            input: {
                x: this.inputX,
                y: this.inputY
            },
            bounds: {
                left: this.left,
                right: this.right,
                top: this.top,
                bottom: this.bottom,
            },
            size: 1024
        };
        this.parser.StartTask(message).subscribe((e) => {this.handleMessage(e);});
    }

    // 
    private checkBounds(err: KnockoutObservable<boolean>): boolean {
        if (this.left > this.right || this.bottom > this.top || this.right - this.left !== this.top - this.bottom) {
            err(false);
            return false;
        }
        this.errorBottom(true);
        this.errorLeft(true);
        this.errorRight(true);
        this.errorTop(true);
        return true;
    }
       
    mousedown = (data, event: MouseEvent) => {
        this.isMousedown = true;
        this.mousePos = [event.clientX, event.clientY];
        this.model.startAnimation();
    }

    mouseup = () => {
        this.isMousedown = false;
        this.model.stopAnimation();
        this.AverageTime(this.model.AverageRenderTime.toFixed(4));
    }

    mousemove = (data, event: MouseEvent) => {
        if (!this.isMousedown) return;
        let offX = event.clientX - this.mousePos[0];
        let offY = this.mousePos[1] - event.clientY;
        if (offX) this.model.moveX(offX);
        if (offY) this.model.moveY(offY);
        this.mousePos = [event.clientX, event.clientY];
    }

    restoreModel = () => {
        this.model.restore();
    }

    model: JSLIC;

    constructor() {
        this.canvas = <HTMLCanvasElement>($(".webglCanvas").get(0));
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.model = new JSLIC(this.canvas);
        this.parser = new TaskManager('./Build/Workers/BootParse.js');
        // handle mouse wheel event using jquery plugin
        (<any>$(".webglCanvas")).mousewheel((event) => {
            this.model.scale(event.deltaY);
            this.model.render();
            this.AverageTime(this.model.AverageRenderTime.toFixed(4));
        })

        $.when(this.model.loadNoiseTexture()).done(() => {
            this.sendMessage();
        });
    }
}

ko.applyBindings(new viewModel());