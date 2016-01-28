# brinkbit-gulp-build

*IMPORTANT DISCLAIMER!*

This a growing / ongoing collection of generalized gulp build tasks for Brinkbit.
Though they're gulp tasks, this sort of pre-configured set of tasks is decidedly not gulpy.
These are designed to be super simple plug-and-play experiences with very minimal customization.
We want consistency in our organization for how we build things,
and these are designed with consistency and minimal flexibility in mind rather than customization.

Therefore, we don't suggest you directly use these in your build setup;
however, feel free to look at and use them or parts of them as recipes.
If you do decide to use them, recognize that these are designed specifically with Brinkbit's proprietary workflow in mind
and may change at any time as our internal systems and build process evolves.

Consider this your final warning. Instructions are below.

## Installation

`npm i --save-dev brinkbit-gulp-build`

## Dependencies

Node, npm, gulp, duh.

## Usage

Transpile and uglify es6 to es5, watching for changes:

```javascript
const gulp = require( 'gulp' );
const brinkbuild = require( 'brinkbit-gulp-build' );

gulp.task( 'many to many', () => brinkbuild.buildJs([ 'src/**/*.js', 'test/**/*.js' ]));
gulp.task( 'many to one', () => brinkbuild.buildJs( 'src/**/*.js', 'dest', 'onefile.min.js' ));
```

... more tasks to come

## Testing

`npm install -g gulp`

`npm test`

## Contributing

The guide for contributing to any Brinkbit repository can be found [here](https://github.com/Brinkbit/brinkbit-style-es6#contributing).
