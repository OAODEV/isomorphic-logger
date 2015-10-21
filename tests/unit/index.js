/**
 * Tests
 */

define(function( require ) {
    var registerSuite = require( "intern!object" ),
        expect = require( "intern/chai!expect" ),
        Logger = require( "../../src/index" );

    registerSuite({
        "config": function() {
            expect( Logger.config() ).to.be.an( "object" );
        },
        "": function() {
            
        }
    });
});
