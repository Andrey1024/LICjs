/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />

import {Expression} from './ExpressionParser/Expression'
import ko = require('knockout');


class viewModel {
    input = ko.observable("");
    result = ko.observable("");
    parse = () => {        
        var parser = new Expression(this.input());
        this.result(parser.getResult().toString());
    }
}

ko.applyBindings(new viewModel());