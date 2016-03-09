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
const newer = require( 'gulp-newer' );
const print = require( 'gulp-print' );
const concat = require( 'gulp-concat' );
const LessPluginCleanCSS = require( 'less-plugin-clean-css' );
const cleancss = new LessPluginCleanCSS({ advanced: true });
const less = require( 'gulp-less' );

/*------------------------------------
              Private API
------------------------------------*/

function generateBundle( watch, entry ) {
    const bro = browserify(
        entry,
        R.merge({}, watchify.args, { debug: true })
    );
    return ( watch ? watchify(
        bro,
        {
            ignoreWatch: true,
            poll: true,
        }
    ) : bro ).transform( babel.configure({ presets: ['es2015'] }), { global: true, sourceMaps: true });
}

function bundleToMany( bro, entry, resolve, reject ) {
    bro.bundle()
    .on( 'error', error => {
        if ( reject ) {
            reject( error );
        }
    })
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
    .on( 'end', data => {
        if ( resolve ) {
            resolve( data );
        }
    });
}

function bundleToOne( bro, dest, filename, resolve, reject ) {
    bro.bundle()
    .on( 'error', error => {
        if ( reject ) {
            reject( error );
        }
    })
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
    .on( 'end', data => {
        if ( resolve ) {
            resolve( data );
        }
    });
}

function mapEs6Js( watch, src ) {
    return globby( src ).then(
        entries => Promise.all(
            entries.map(
                entry => new Promise(( resolve, reject ) => {
                    const bro = generateBundle( watch, entry );

                    if ( watch ) {
                        bro.on( 'update', () => {
                            console.log( 'rebuilding javascript' ); // eslint-disable-line no-console
                            bundleToMany( bro, entry );
                        });
                    }

                    bundleToMany( bro, entry, resolve, reject );
                })
            )
        )
    );
}

function concatEs6Js( watch, src, dest, filename ) {
    return globby( src ).then(
        entries => new Promise(( resolve, reject ) => {
            const bro = generateBundle( watch, entries );

            if ( watch ) {
                bro.on( 'update', () => {
                    console.log( 'rebuilding javascript' ); // eslint-disable-line no-console
                    bundleToOne( bro, dest, filename );
                });
            }

            bundleToOne( bro, dest, filename, resolve, reject );
        })
    );
}

function mapEs5Js( src, dest ) {
    return new Promise(( resolve, reject ) => {
        gulp.src( src )
        .pipe( rename( path => {
            path.extname = '.min.js';
        }))
        .pipe( newer( dest ))
        .pipe( sourcemaps.init())
        .pipe( print( filepath => {
            return `building '${filepath}'`;
        }))
        .pipe( uglify())
        .pipe( sourcemaps.write( './' ))
        .pipe( gulp.dest( dest ))
        .pipe( print( filepath => {
            return `successfully built '${filepath}'`;
        }))
        .on( 'error', reject )
        .on( 'end', resolve );
    });
}

function concatEs5Js( src, dest, filename ) {
    return new Promise(( resolve, reject ) => {
        return gulp.src( src )
        .pipe( newer( `${dest}/${filename}` ))
        .pipe( sourcemaps.init())
        .pipe( concat( filename ))
        .pipe( print( filepath => {
            return `building '${filepath}'`;
        }))
        .pipe( uglify())
        .pipe( sourcemaps.write( './' ))
        .pipe( gulp.dest( dest ))
        .on( 'error', reject )
        .on( 'end', resolve );
    });
}

/*------------------------------------
             Public API
------------------------------------*/

module.exports.watchEs6 = ( src, dest, filename ) => {
    if ( dest && filename ) return concatEs6Js( true, src, dest, filename );
    return mapEs6Js( true, src );
};

module.exports.buildEs6 = ( src, dest, filename ) => {
    if ( dest && filename ) return concatEs6Js( false, src, dest, filename );
    return mapEs6Js( false, src );
};

module.exports.buildEs5 = ( src, dest, filename ) => {
    if ( filename ) return concatEs5Js( src, dest, filename );
    return mapEs5Js( src, dest );
};

module.exports.buildLess = ( src, dest, filename ) => new Promise(( resolve, reject ) => {
    let stream = gulp.src( src )
    .on( 'error', reject );

    if ( filename ) {
        stream = stream
        .pipe( newer( `${dest}/${filename}` ))
        .pipe( less({
            plugins: [cleancss],
        }))
        .pipe( concat( filename ))
        .pipe( print( filepath => {
            return `building '${filepath}'`;
        }));
    }
    else {
        stream = stream
        .pipe( rename( path => {
            path.extname = '.min.css';
        }))
        .pipe( newer( dest ))
        .pipe( print( filepath => {
            return `building '${filepath}'`;
        }))
        .pipe( less({
            plugins: [cleancss],
        }));
    }

    stream
    .pipe( gulp.dest( dest ))
    .pipe( print( filepath => {
        return `successfully built '${filepath}'`;
    }))
    .on( 'end', resolve );
});
