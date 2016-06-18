/// <reference path="../typings/requirejs/require.d.ts" />

require.config({
    baseUrl: './Build',
    paths: {
        'knockout': '../lib/knockout/knockout',
        'jquery': '../lib/jquery/jquery',
        'jquery-mousewheel': '../lib/jquery-mousewheel/jquery.mousewheel',        
        'tinycolor2': '../lib/tinycolor/tinycolor',
        'gl-matrix': '../lib/gl-matrix/gl-matrix-min',
        'jquery-ui': '../lib/jquery-ui',
        'knockout-jqueryui': '../lib/knockout-jqueryui',
    }
});