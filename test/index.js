'use strict';

const chai = require( 'chai' );
const expect = chai.expect;
const brinkbuild = require( '../index.js' );
const fs = require( 'bluebird' ).promisifyAll( require( 'fs-extra' ));
const R = require( 'ramda' );
chai.use( require( 'chai-as-promised' ));
chai.config.includeStack = true;

function resourceExists( path ) {
    return fs.accessAsync( path )
    .then(() => Promise.resolve( true ))
    .catch(() => Promise.resolve( false ));
}

const resourcesExist = paths => Promise.all(
    paths.map( resourceExists )
).then( res => Promise.resolve(
    R.reduce( R.and, true )( res )
));

describe( '#buildEs6', function() {
    describe( 'many to many', function() {
        const testFiles = [
            'testFiles/es6/multiple/outer.min.js',
            'testFiles/es6/multiple/outer.min.js.map',
            'testFiles/es6/multiple/deep/inner.min.js',
            'testFiles/es6/multiple/deep/inner.min.js.map',
        ];

        after( function() {
            return Promise.all( testFiles.map( path => fs.removeAsync( path )));
        });

        it( 'should preserve file structure for globs', function() {
            this.timeout( 5000 );
            return brinkbuild.buildEs6( 'testFiles/es6/multiple/**/*.js' )
            .then(() => expect( resourcesExist( testFiles )).to.eventually.be.true );
        });
    });

    describe( 'many to one', function() {
        it( 'should concat multiple files into one', function() {
            const testFiles = [
                'testFiles/es6/single.min.js',
                'testFiles/es6/single.min.js.map',
            ];

            after( function() {
                return Promise.all( testFiles.map( path => fs.removeAsync( path )));
            });

            return brinkbuild.buildEs6( 'testFiles/es6/multiple/**/*.js', 'testFiles/es6', 'single.min.js' )
            .then(() => expect( resourcesExist( testFiles )).to.eventually.be.true );
        });
    });

    describe( 'watch and rebuild', function() {
        const testFiles = [
            'testFiles/es6/watch.min.js',
            'testFiles/es6/watch.min.js.map',
        ];

        before( function() {
            return fs.copyAsync( 'testFiles/es6/watch.js', 'testFiles/temp/watch.js', {});
        });

        after( function() {
            return Promise.all(
                testFiles.map( path => fs.removeAsync( path ))
                .concat( fs.moveAsync( 'testFiles/temp/watch.js', 'testFiles/es6/watch.js', { clobber: true })
                    .then(() => fs.removeAsync( 'testFiles/temp' ))
                )
            );
        });

        it( 'should not automatically rebuild files on changes', function() {
            this.timeout( 3000 );
            return brinkbuild.buildEs6( 'testFiles/es6/watch.js', 'testFiles/es6', 'watch.min.js' )
            .then(() => expect( resourcesExist( testFiles )).to.eventually.be.true )
            .then(() => Promise.all( testFiles.map( path => fs.removeAsync( path ))))
            .then(() => new Promise( resolve => setTimeout( resolve, 1000 )))
            .then(() => fs.appendFileAsync( 'testFiles/es6/watch.js', ' ', {}))
            .then(() => new Promise( resolve => setTimeout( resolve, 1000 )))
            .then(() => expect( resourcesExist( testFiles )).to.eventually.be.false );
        });
    });
});

describe( '#watchEs6', function() {
    describe( 'many to many', function() {
        const testFiles = [
            'testFiles/es6/multiple/outer.min.js',
            'testFiles/es6/multiple/outer.min.js.map',
            'testFiles/es6/multiple/deep/inner.min.js',
            'testFiles/es6/multiple/deep/inner.min.js.map',
        ];

        after( function() {
            return Promise.all( testFiles.map( path => fs.removeAsync( path )));
        });

        it( 'should preserve file structure for globs', function() {
            this.timeout( 5000 );
            return brinkbuild.watchEs6( 'testFiles/es6/multiple/**/*.js' )
            .then(() => expect( resourcesExist( testFiles )).to.eventually.be.true );
        });
    });

    describe( 'many to one', function() {
        it( 'should concat multiple files into one', function() {
            const testFiles = [
                'testFiles/es6/single.min.js',
                'testFiles/es6/single.min.js.map',
            ];

            after( function() {
                return Promise.all( testFiles.map( path => fs.removeAsync( path )));
            });

            return brinkbuild.watchEs6( 'testFiles/es6/multiple/**/*.js', 'testFiles/es6', 'single.min.js' )
            .then(() => expect( resourcesExist( testFiles )).to.eventually.be.true );
        });
    });

    describe( 'watch and rebuild', function() {
        const testFiles = [
            'testFiles/es6/watch.min.js',
            'testFiles/es6/watch.min.js.map',
        ];

        before( function() {
            return fs.copyAsync( 'testFiles/es6/watch.js', 'testFiles/temp/watch.js', {});
        });

        after( function() {
            return Promise.all(
                testFiles.map( path => fs.removeAsync( path ))
                .concat( fs.moveAsync( 'testFiles/temp/watch.js', 'testFiles/es6/watch.js', { clobber: true })
                    .then(() => fs.removeAsync( 'testFiles/temp' ))
                )
            );
        });

        it( 'should automatically rebuild files on changes', function() {
            this.timeout( 3000 );
            return brinkbuild.watchEs6( 'testFiles/es6/watch.js', 'testFiles/es6', 'watch.min.js' )
            .then(() => expect( resourcesExist( testFiles )).to.eventually.be.true )
            .then(() => Promise.all( testFiles.map( path => fs.removeAsync( path ))))
            .then(() => new Promise( resolve => setTimeout( resolve, 1000 )))
            .then(() => fs.appendFileAsync( 'testFiles/es6/watch.js', ' ', {}))
            .then(() => new Promise( resolve => setTimeout( resolve, 1000 )))
            .then(() => expect( resourcesExist( testFiles )).to.eventually.be.true );
        });
    });
});

describe( '#buildEs5', function() {
    describe( 'many to many', function() {
        const testFiles = [
            'testFiles/es5/multiple/outer.min.js',
            'testFiles/es5/multiple/outer.min.js.map',
            'testFiles/es5/multiple/deep/inner.min.js',
            'testFiles/es5/multiple/deep/inner.min.js.map',
        ];

        after( function() {
            return Promise.all( testFiles.map( path => fs.removeAsync( path )));
        });

        it( 'should preserve file structure for globs', function() {
            this.timeout( 5000 );
            return brinkbuild.buildEs5( 'testFiles/es5/multiple/**/*.js', 'testFiles/es5/multiple' )
            .then(() => expect( resourcesExist( testFiles )).to.eventually.be.true );
        });
    });

    describe( 'many to one', function() {
        it( 'should concat multiple files into one', function() {
            const testFiles = [
                'testFiles/es5/single.min.js',
                'testFiles/es5/single.min.js.map',
            ];

            after( function() {
                return Promise.all( testFiles.map( path => fs.removeAsync( path )));
            });

            return brinkbuild.buildEs5( 'testFiles/es5/multiple/**/*.js', 'testFiles/es5', 'single.min.js' )
            .then(() => expect( resourcesExist( testFiles )).to.eventually.be.true );
        });

        it( 'should handle an array of paths', function() {
            const testFiles = [
                'testFiles/es5/single.min.js',
                'testFiles/es5/single.min.js.map',
            ];

            after( function() {
                // return Promise.all( testFiles.map( path => fs.removeAsync( path )));
            });

            return brinkbuild.buildEs5([
                'testFiles/es5/multiple/deep/inner.js',
                'testFiles/es5/multiple/outer.js',
            ], 'testFiles/es5', 'single.min.js' )
            .then(() => expect( resourcesExist( testFiles )).to.eventually.be.true );
        });
    });
});

describe( '#buildLess', function() {
    describe( 'many to many', function() {
        const testFiles = [
            'testFiles/less/multiple/outer.min.css',
            'testFiles/less/multiple/deep/inner.min.css',
        ];

        after( function() {
            return Promise.all( testFiles.map( path => fs.removeAsync( path )));
        });

        it( 'should preserve file structure for globs', function() {
            this.timeout( 5000 );
            return brinkbuild.buildLess( 'testFiles/less/multiple/**/*.less', 'testFiles/less/multiple' )
            .then(() => expect( resourcesExist( testFiles )).to.eventually.be.true );
        });
    });

    describe( 'many to one', function() {
        it( 'should concat multiple files into one', function() {
            const testFiles = [
                'testFiles/less/single.min.css',
            ];

            after( function() {
                return Promise.all( testFiles.map( path => fs.removeAsync( path )));
            });

            return brinkbuild.buildLess( 'testFiles/less/multiple/**/*.less', 'testFiles/less', 'single.min.css' )
            .then(() => expect( resourcesExist( testFiles )).to.eventually.be.true );
        });
    });
});
