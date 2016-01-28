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

describe( '#buildJs', function() {
    describe( 'many to many', function() {
        const testFiles = [
            'testFiles/multiple/outer.min.js',
            'testFiles/multiple/outer.min.js.map',
            'testFiles/multiple/deep/inner.min.js',
            'testFiles/multiple/deep/inner.min.js.map',
        ];

        after( function() {
            return Promise.all( testFiles.map( path => fs.removeAsync( path )));
        });

        it( 'should preserve file structure for globs', function() {
            this.timeout( 5000 );
            return brinkbuild.buildJs( 'testFiles/multiple/**/*.js' )
            .then(() => expect( resourcesExist( testFiles )).to.eventually.be.true );
        });
    });

    describe( 'many to one', function() {
        it( 'should concat multiple files into one', function() {
            const testFiles = [
                'testFiles/single.min.js',
                'testFiles/single.min.js.map',
            ];

            after( function() {
                return Promise.all( testFiles.map( path => fs.removeAsync( path )));
            });

            return brinkbuild.buildJs( 'testFiles/multiple/**/*.js', 'testFiles', 'single.min.js' )
            .then(() => expect( resourcesExist( testFiles )).to.eventually.be.true );
        });
    });

    describe( 'watch and rebuild', function() {
        const testFiles = [
            'testFiles/watch.min.js',
            'testFiles/watch.min.js.map',
        ];

        after( function() {
            return Promise.all( testFiles.map( path => fs.removeAsync( path )));
        });

        it( 'should automatically rebuild files on changes', function() {
            return brinkbuild.buildJs( 'testFiles/watch.js', 'testFiles', 'watch.min.js' )
            .then(() => expect( resourcesExist( testFiles )).to.eventually.be.true )
            .then(() => Promise.all( testFiles.map( path => fs.removeAsync( path ))))
            // not sure why this doesn't trigger a rebuild, may be related to https://github.com/substack/watchify/issues/216
            .then(() => fs.appendFileAsync( 'testFiles/watch.js', '', {}))
            .then(() => expect( resourcesExist( testFiles )).to.eventually.be.true );
        });
    });
});
