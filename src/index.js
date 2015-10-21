
(function() {

var Logger = function() {
    // @todo Configure with environment variables.

    return this;
};

/**
 * Configures or returns configurations.
 */
Logger.config = function( config ) {
    if ( !config ) {
        return this.configuration || {};
    }

    this.configuration = _.extend( this.configuration || {}, config );

    return this;
};

/**
 * Sets the scope back to the main Logger object.
 *
 * Useful if you"re in a child object but wish to step back while chaining.
 */
Logger.end = function() {
    return Logger;
};

/**
 * Set the noise level for logs and for errors.
 *
 * @values throw > alert > console > silent
 */
Logger.ERROR_LEVEL = "console";
Logger.LOG_LEVEL = "console";

/**
 * A utility method to execute a method over an array.
 */
Logger.loop = function( action ) {
    return function( row ) {
        this[ action ]( row );
    };
};

/**
 * Queue of events to log.
 */
Logger.queue = function( record, name ) {
    // Set queue, an array of functions to execute.
    this.registrar = this.registrar || {};

    if ( !record ) {
        // If no arguments are passed, act as a getter.
        return this.registrar;
    } else {
        return this.add( record );
    }
};

Logger.queue.empty = function() {
    this.registrar = {};
    return this;
};

/**
 * Register one or more records.
 */
Logger.queue.add = function( record ) {
    if ( record instanceof Array ) {
        record.forEach( this.loop( "add" ) );
    }

    this.registrar[ record.name ] = record;
    return this;
};

/**
 * Find a record among the registered.
 */
Logger.queue.find = function( id ) {
    this.found = _.find( this.registrar, id );
    return this;
};

/**
 * Remove a record.
 *
 * @param {str|obj} An identifier.
 */
Logger.queue.remove = function( id ) {
    this.find( id ).registrar[ this.found.name ] = undefined;
    return this;
};

/**
 * Exposes appropriate log method to the consumer.
 *
 * As a general practice, use log or error methods rather than call one of the
 * custom signal methods. This will assure your application respects the log
 * and error levels set by the configurations. Using a custom signal method is
 * equivalent to deciding to override log and error levels.
 */
Logger.log = function() {
    this[ this.LOG_LEVEL ].apply( this, Array.prototype.slice.call(arguments) );
    return this;
};

/**
 * If ERROR_LEVEL or LOG_LEVEL is silent, cancel execution of signal methods.
 */
Logger.silent = function() {
    return this.queue.empty();
};

/**
 * Logs to the console.
 */
Logger.console = function( message, data, type ) {
    console[ type || "log" ]( message, data || "" );
    return this;
};

/**
 * Logs error to designated view.
 */
Logger.error = function( message, data ) {
    this[ this.ERROR_LEVEL ]
        .apply( this, Array.prototype.slice.call(arguments) );
    return this;
};

/**
 * Stops script execution with a loud error.
 */
Logger.throw = function( error ) {
    throw error;
};

/**
 * Convenience method for this.queue.add that keeps the scope on Logger.
 */
Logger.register = function( record, name ) {
    this.queue.add( record, name );
    return this;
};

/**
 * Holds the services to which Logger is registered to log.
 */
Logger.services = function( service ) {
    if ( service ) {
        this.add( service );
    }

    return this;
};

Logger.services.add = function( service ) {
    this.queue.add( service );
    return this;
};

Logger.services.remove = function() {
    this.queue.remove( "services" );
    return this;
};

Logger.services.list = function() {
    this.queue.get( "services" );
    return this;
};

Logger.services.raygun = function( user ) {
    return this;
};

/**
 * Associates RayGun"s messages with the current user.
 *
 * @param {string} An object representing the user.
 */
Logger.services.raygun.user = function( user ) {
    // Handle errors.
    if ( !user || typeof user !== "object" ) {
        return this.error( "" );
    }

    if ( !user.email ) {
        return this.log( "" );
    }

    var email = user.email.primary,
        name = user.name;

    // Configure RayGun with the current user"s information.
    Raygun.setUser( email, false, email, name.full,
        name.first, user.device );

    return this;
};

/**
 * Associates RayGun"s messages with an application version.
 *
 * @todo Set version using API or whatever object is appropriate.
 */
Logger.services.raygun.version = function() {
    return Raygun.setVersion( Logger.version );
};

/**
 * Associates RayGun"s messages with info about the environment.
 */
Logger.services.raygun.set = function( user ) {
    // Handle errors.
    if ( !Raygun ) {
        return this.log( "Raygun is not available.", Raygun, "error"  );
    }

    // Associate errors with a user.
    this.version();

    // Associate errors with a user.
    this.user( user );

    return true;
};

/**
 * Track an event using Google Analytics.
 *
 * @note https://developers.google.com/analytics/devguides/collection/
 *       gajs/eventTrackerGuide
 */
Logger.services.ga = function( gaid ) {
    (function(i,s,o,g,r,a,m) {
        i[ "GoogleAnalyticsObject" ] = r;
        i[r] = i[r] || function() {
            ( i[r].q=i[r].q || [] ).push( arguments )
        },
        i[r].l = 1 * new Date();

        a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];

        a.async=1;
        a.src=g;
        m.parentNode.insertBefore(a,m)
    })
    ( window, document, "script", "//www.google-analytics.com/analytics.js",
        "ga" );

    if ( typeof ga === "undefined" ) {
        
        return this;
    }

    if ( typeof ga === "undefined" ) {
        this.log( "Google Analytics is not available.", this.ga, "error" );
        return this;
    }

    ga( "create", gaid, "auto" );
    ga( "send", "pageview" );

    return this;
};

Logger.services.ga.log = function( category, action, label, value ) {
    // Log event with Google Analytics.
    this.ga( "send", "event", category, action, label, value || 0 );

    return this;
};

/**
 * Tracks page view with Google Analytics.
 */
Logger.services.ga.pageView = function( path ) {
    this.ga( "send", "pageview", { page: "/" + ( path || "" ) } );
    return this;
};

/**
 * Records to Ramen the use of a given feature.
 */
Logger.services.ramen = function( feature ) {
    if ( typeof ramenq === "undefined" ) {
        return this.log( "Ramen is not available.", ramenq, "error" );
    }

    return this.log( feature );
};

Logger.services.ramen.log = function( feature ) {
    this.ramenq = ramenq;

    // Get feature from global features object.
    feature = Logger.config.features[ feature ];

    // Determine whether this is a feature to be logged.
    if ( !feature ) {
        return this;
    }

    // Report to Ramen the ID of the used feature.
    ramenq.push([ "feature", feature.ramen.id ]);

    return this;
};

/**
 * Export to environment.
 */
if ( typeof module !== "undefined" && typeof module.exports !== "undefined" ) {
    module.exports = Logger;
} else {
    if ( typeof define === "function" && define.amd ) {
        define([], function() {
            return Logger;
        });
    } else {
        window.Logger = Logger;
    }
}

}());
