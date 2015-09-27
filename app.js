var async = require('async');
var _ = require('underscore');

var njax = require('njax');
var models = require('./lib/model');
var modules = require('./lib/modules');


var env_config = require('./env_config');
var njax_config = require('./njax_config')();
var app = njax(njax_config, env_config);
modules(app);
models(app);

app.all('/_build/*', app.njax.static_serve('_build'));
app.all('/imgs/*', app.njax.static_serve('imgs'));

var routes = require(__dirname + '/lib/routes');
routes(app);


app.start(function(err, _app, server){
	if(err) throw err;

	require('./lib/modules/socket')(app).init(server);
   /*
	app.model.Application.findOne({ namespace: app.njax.config.core.app }).exec(function(err, application){
		if(err) throw(err);
		app.default_application = application;
		if(!app.default_application){
			throw new Error("Could not find default_application");
		}
	})*/
});