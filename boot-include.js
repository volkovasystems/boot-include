var bootInclude = function bootInclude( configuration ){
	/*:
		@meta-configuration:
			{
				"configuration:optional": "Set"
			}
		@end-meta-configuration
	*/

	//Set default configuration and override user given configurations.
	configuration = configuration || { };
	var defaultConfiguration = {
		"repositoryURL": configuration.repositoryURL || "https://raw.githubusercontent.com",
		"repositoryAccount": configuration.repositoryAccount || "volkovasystems",
		"stableVersionTag": configuration.stableVersionTag || "develop",
		"repositoryLocalPath": configuration.repositoryLocalPath || "."
	};
	
	var rootGlobal;

	//Determine the platform using platform determinant procedures.
	if( typeof global != "undefined" &&
		typeof process != "undefined" &&
		"env" in process )
	{
		global.platform = "nodejs";
		rootGlobal = global;
	}

	if( typeof window != "undefined" &&
		typeof document != "undefined" )
	{
		window.platform = "browser";
		rootGlobal = window;
	}

	//Append the constants that will be used as flag variables.
	var defineProperty = Object.defineProperty;
	defineProperty( rootGlobal, "NODEJS_PLATFORM",
		{
			"enumerable": "false",
			"configurable": "false",
			"writable": "false",
			"value": "nodejs"
		} );

	defineProperty( rootGlobal, "BROWSER_PLATFORM",
		{
			"enumerable": "false",
			"configurable": "false",
			"writable": "false",
			"value": "browser"
		} );

	//We need to load the configure-include and the include procedure.
	var includeSourceURL = [ 
		defaultConfiguration.repositoryURL,
		defaultConfiguration.repositoryAccount,
		"include",
		defaultConfiguration.stableVersionTag,
		"include.js"
	].join( "/" );

	var configureIncludeSourceURL = [
		defaultConfiguration.repositoryURL,
		defaultConfiguration.repositoryAccount,
		"configure-include",
		defaultConfiguration.stableVersionTag,
		"configure-include.js"
	].join( "/" );

	switch( platform ){
		case NODEJS_PLATFORM:
			//Let's try to require them.
			var path = require( "path" );
			var https = require( "https" );

			var configureIncludeSourceLocalPath = [
				defaultConfiguration.repositoryLocalPath,
				"configure-include",
				"configure-include.js"
			].join( path.sep );

			try{
				var configureInclude = require( configureIncludeSourceLocalPath );
				rootGlobal.configureInclude = configureInclude;

			}catch( error ){
				console.error( error );

				if( error.code === "MODULE_NOT_FOUND" ){
					console.warn( "failed trying to load local configure-include module trying remote source instead" );

					https.get( configureIncludeSourceURL,
						function onResponse( response ){
							response.on( "data",
								function onData( data ){
									data += "";
									eval( data );
									rootGlobal.configureInclude = configureInclude;
								} );
						} )
						.on( "error",
							function onError( error ){
								console.error( error );

								throw error;
							} );	
				}else{
					throw error;
				}
			}

			var includeSourceLocalPath = [
				defaultConfiguration.repositoryLocalPath,
				"include",
				"include.js"
			].join( path.sep );

			try{
				var include = require( includeSourceLocalPath );
				rootGlobal.include = include;

			}catch( error ){
				console.error( error );
				
				if( error.code === "MODULE_NOT_FOUND" ){
					console.warn( "failed trying to load local include module trying remote source instead" );

					https.get( includeSourceURL,
						function onResponse( response ){
							response.on( "data",
								function onData( data ){
									data += "";
									eval( data );
									rootGlobal.include = include;
								} );
						} )
						.on( "error",
							function onError( error ){
								console.error( error );

								throw error;
							} );	
				}else{
					throw error;
				}
			}


			break;

		case BROWSER_PLATFORM:
			break;

		default:

	}

};

bootInclude( );