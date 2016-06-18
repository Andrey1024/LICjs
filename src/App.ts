/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
/// <amd-dependency path="jquery-mousewheel" />
/// <amd-dependency path="knockout-jqueryui/tooltip" />

import {Expression} from './ExpressionParser/Expression';
import {JSLIC} from './LIC/jslic';
import ko = require('knockout');


class viewModel {
    inputX ="pow(y,2)";
    inputY = "-x";
    enable = ko.observable(false);

    private canvas: HTMLCanvasElement;

    private parserX: Expression;
    private parserY: Expression;

    public isOpen = ko.observable(false);
    private isMousedown: boolean;
    public errorX = ko.observable(true);
    public errorY = ko.observable(true);
    public toolTipX = ko.observable("");
    public toolTipY = ko.observable("");
    private mousePos: number[];
    

    InputX = ko.pureComputed<string>({
        read: () => {
            return this.inputX;
        },
        write: (value) => {
            if (!this.parserX || this.parserX.input !== value) {
                try {
                    this.parserX = new Expression(value);
                    this.errorX(true);
                    this.inputX = value;
                    $.when(this.model.loadFieldTexture([this.parserX, this.parserY])).done( () => {
                        this.model.render();
                    });
                } catch (e) {
                    this.toolTipX(e);
                    this.errorX(false);
                }                    
            }
        },
        owner: this
    });

    InputY = ko.pureComputed<string>({
        read: () => {
            return this.inputY;
        },
        write: (value) => {
            if (!this.parserY || this.parserY.input !== value) {
                try {
                    this.parserY = new Expression(value);
                    this.errorY(true);
                    this.inputY = value;
                    $.when(this.model.loadFieldTexture([this.parserX, this.parserY])).done( () => {
                        this.model.render();
                    });
                } catch (e) {
                    this.toolTipY(e);
                    this.errorY(false);
                }                    
            }
        },
        owner: this
    });
       
    mousedown = (data, event: MouseEvent) => {
        this.isMousedown = true;
        this.mousePos = [event.clientX, event.clientY];
        this.model.startAnimation();
    }

    mouseup = () => {
        this.isMousedown = false;
        this.model.stopAnimation();
    }

    mousemove = (data, event: MouseEvent) => {
        if (!this.isMousedown) return;
        let offX = event.clientX - this.mousePos[0];
        let offY = this.mousePos[1] - event.clientY;
        if (offX) this.model.moveX(offX);
        if (offY) this.model.moveY(offY);
        this.mousePos = [event.clientX, event.clientY];
    }

    model: JSLIC;

    constructor() {
        this.canvas = <HTMLCanvasElement>($(".webglCanvas").get(0));
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.model = new JSLIC(this.canvas);
        this.parserX = new Expression(this.inputX);
        this.parserY = new Expression(this.inputY);

        (<any>$(".webglCanvas")).mousewheel((event) => {
            this.model.scale(event.deltaY);
            this.model.render();            
        })
        $.when(this.model.loadNoiseTexture(), this.model.loadFieldTexture()).done( () => {
            this.model.render();
        });
    }
}

ko.applyBindings(new viewModel());