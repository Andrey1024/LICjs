/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
/// <amd-dependency path="jquery-mousewheel" />

import {Expression} from './ExpressionParser/Expression';
import {JSLIC} from './LIC/jslic';
import ko = require('knockout');


class viewModel {
    inputX = ko.observable("y");
    inputY = ko.observable("-x");
    enable = ko.observable(false);
    private parserX: Expression;
    private parserY: Expression;
    private isMousedown: boolean;
    private mousePos: number[];
    
    private ParserX = ko.pureComputed(() => {
        if (!this.parserX || this.parserX.input !== this.inputX() ) {
            this.parserX = new Expression(this.inputX());
        }
        return this.parserX;
    });
    
    private ParserY = ko.pureComputed(() => {
        if (!this.parserY || this.parserY.input !== this.inputY() ) {
            this.parserY = new Expression(this.inputY());
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
        this.model = new JSLIC(<HTMLCanvasElement>($(".webglCanvas").get(0)));
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