'use strict';

window.innerFunction = ( function outer() {
    var outerFunction = function outerFunction() {
        return '';
    };
    return outerFunction;
})();
