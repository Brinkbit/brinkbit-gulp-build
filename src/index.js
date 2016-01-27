'use strict';

const globby = require( 'globby' );
const watchify = require( 'watchify' );
const browserify = require( 'browserify' );
const R = require( 'ramda' );
const babel = require( 'babelify' );
const source = require( 'vinyl-source-stream' );
const vBuffer = require( 'vinyl-buffer' );
const sourcemaps = require( 'gulp-sourcemaps' );
const uglify = require( 'gulp-uglify' );
const rename = require( 'gulp-rename' );
const gulp = require( 'gulp' );
const print = require( 'gulp-print' );
const concat = require( 'gulp-concat' );

function mapJs( src ) {
    return globby( src ).then(
        entries => Promise.all(
            entries.map(
                entry => new Promise(( resolve, reject ) => {
                    const b = watchify(
                        browserify(
                            entry,
                            R.merge({}, watchify.args, { debug: true })
                        )
                    ).transform( babel.configure({ presets: ['es2015'] }), { global: true });

                    function bundle() {
                        b.bundle()
                        .on( 'error', reject )
                        .pipe( source( entry ))
                        .pipe( print( filepath => {
                            return `building '${filepath}'`;
                        }))
                        .pipe( vBuffer())
                        .pipe( sourcemaps.init({ loadMaps: true }))
                        .pipe( uglify())
                        .pipe( rename( path => {
                            path.extname = '.min.js';
                        }))
                        .pipe( sourcemaps.write( './' ))
                        .pipe( gulp.dest( './' ))
                        .pipe( print( filepath => {
                            return `successfully built '${filepath}'`;
                        }))
                        .on( 'end', resolve );
                    }

                    b.on( 'update', bundle );
                    bundle();
                })
            )
        )
    );
}

function concatJs( src, dest, filename ) {
    return globby( src ).then(
        entries => new Promise(( resolve, reject ) => {
            const b = watchify(
                browserify(
                    entries,
                    R.merge({}, watchify.args, { debug: true })
                )
            ).transform( babel.configure({ presets: ['es2015'] }), { global: true });

            function bundle() {
                b.bundle()
                .on( 'error', reject )
                .pipe( source( filename ))
                .pipe( print( filepath => {
                    return `building '${dest}/${filepath}'`;
                }))
                .pipe( vBuffer())
                .pipe( sourcemaps.init({ loadMaps: true }))
                .pipe( uglify())
                .pipe( concat( filename ))
                .pipe( sourcemaps.write( './' ))
                .pipe( gulp.dest( dest ))
                .pipe( print( filepath => {
                    return `successfully built '${filepath}'`;
                }))
                .on( 'end', resolve );
            }

            b.on( 'update', bundle );
            bundle();
        })
    );
}

module.exports.buildJs = ( src, dest, filename ) => {
    if ( dest && filename ) return concatJs( src, dest, filename );
    return mapJs( src );
};
