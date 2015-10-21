/**
 * Configures module loader.
 */

"use strict";

var Location = {}, loader = {};

/**
 * Dynamically generates path's value based on regex, removing the
 * the need to update it manually when moving between environments.
 *
 * @return {string} The path of the current environment.
 */
Location = {
    // Represent state.
    pathname: window.location.pathname,

    /**
     * Formats path.
     *
     * @param {string} The path, with or without an ending slash.
     */
    formatPath: function( path ) {
        // Determine whether path ends in slash.
        // If path does not end in slash, append slash.
        var slash = ( ( path.charAt( path.length - 1 ) === "/" ) ? "" : "/" );

        return path + slash;
    },

    /**
     * Get the page from the pathname.
     */
    getPage: function( pathname, delimiter ) {
        // Get each part of the window.location.pathname.
        var subpaths = pathname.split( delimiter ),

        // Get the page we're on.
        page = subpaths.slice( subpaths.length - 1 );

        // Get e/t from after first slash up to this page's value.
        return subpaths.slice( 0, subpaths.indexOf( page ) - 1 );
    },

    /**
     * Get file paths from current location.
     */
    getPath: function( pathname ) {
        var delimiter = "/",
            page = [],
            subpaths = "";

        // If at host's root path, return pathname.
        if ( !/\//.test( pathname ) || pathname === "/" ) {
            return this.formatPath( pathname );
        }

        page = this.getPage( pathname, delimiter );

        // Join each value of new array with a slash.
        // If array is length of 1, will not join.
        subpaths = delimiter + subpaths.join( delimiter );

        // If path does not end in slash, append slash.
        return this.formatPath( subpaths );
    },

    set: function( basepath ) {
        // Set path according to environment.
        this.basepath = basepath || this.getPath( this.pathname );
        return this.basepath;
    },

    get: function() {
        // Return path derived from window.location.pathname.
        return this.basepath || this.set();
    }
};

// Prepend basepath to scripts path.
loader.scripts = Location.get() + "src/scripts/";

/**
 * Prepare the module loader's configuration.
 */
loader.config = {};

// Set the project's root directory.
loader.config.baseUrl = Location.get();

// Sets keys for modules we'll import.
loader.config.paths = {
    index: "src/index",
    underscore: "node_modules/underscore/underscore"
};

/**
 * Configure module loader.
 */
require.config( loader.config );

/**
 * Initialize application.
 */
require( [ "underscore", "index" ], function( _, Logger ) {
    window.Logger = Logger;
});
