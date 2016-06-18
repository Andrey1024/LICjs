/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
/// <amd-dependency path="jquery-mousewheel" />
/// <amd-dependency path="knockout-jqueryui/tooltip" />

import {Expression} from './ExpressionParser/Expression';
import {JSLIC} from './LIC/jslic';
import ko = require('knockout');


class viewModel {
    inputX = ko.observable("y");
    inputY = ko.observable("-x");
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
    
    private ParserX = ko.pureComputed(() => {
        if (!this.parserX || this.parserX.input !== this.inputX() ) {
            try {
                this.parserX = new Expression(this.inputX());
                this.errorX(true);
            } catch (e) {
                this.toolTipX(e);
                this.errorX(false);
            }
        }
        return this.parserX;
    });
    
    private ParserY = ko.pureComputed(() => {
        if (!this.parserY || this.parserY.input !== this.inputY() ) {
            try {
                this.parserY = new Expression(this.inputY());
                this.errorY(true);
            } catch (e) {
                this.toolTipY(e);
                this.errorY(false);
            }
        }
        return this.parserY;
    })

    parse = () => {
        $.when(this.model.loadFieldTexture([this.ParserX(), this.ParserY()])).done(() => {
            requestAnimationFrame(() => { this.model.render(); });
        });
    }

    scroll = (data, event: MouseWheelEvent) => {
        this.model.scale(event.detail);
    }

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
        (<any>$(".webglCanvas")).mousewheel((event) => {
            this.model.scale(event.deltaY);
            this.model.render();            
        })
        $.when(this.model.loadNoiseTexture()).done( () => {
            this.enable(true);
        });
    }
}

ko.applyBindings(new viewModel());