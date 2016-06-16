/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />

import {Expression} from './ExpressionParser/Expression';
import {JSLIC} from './LIC/jslic';
import ko = require('knockout');


class viewModel {
    inputX = ko.observable("y");
    inputY = ko.observable("0-x");
    result = ko.observable("");
    enable = ko.observable(false);
    parse = () => {        
        var parserX = new Expression(this.inputX());
        var parserY = new Expression(this.inputY());
        requestAnimationFrame(() => this.model.render([parserX, parserY]));
    }

    model: JSLIC;

    constructor() {
        this.model = new JSLIC(<HTMLCanvasElement>($(".webglCanvas").get(0)));
        $.when(this.model.loadTextures()).done( () => {
            this.enable(true);
        });
    }
}

ko.applyBindings(new viewModel());