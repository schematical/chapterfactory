module.exports = function(app){
    /**
     * Model Routes
     */
	for(var i in app.njax.routes.model){
		app.njax.routes.model[i].init();
	}

}