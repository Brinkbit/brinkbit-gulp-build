'use strict';

window.outerFunction = ( function outer() {
    var outerFunction = function outerFunction() {
        return '';
    };
    return outerFunction;
})();
