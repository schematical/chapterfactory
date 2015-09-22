var async = require('async');
var _ = require('underscore');
module.exports = function(app){
	var njaxSocket =  {
		_io:null,
		init:function(server){
			var io = require('socket.io')(server);
			var redis = require('socket.io-redis');
			io.adapter(redis(app.njax.env_config.redis));
			io.on('connection', njaxSocket.onConnection);
			njaxSocket._io = io;
		},
		emitEvent:function(event_type, data){
			var uri = data.entity_url || data.uri;

			var response = {
				event: event_type,
				data:(data.toObject && data.toObject()) || data,
				entity_uri: uri
			}

			var parts = uri.split('/');

			var broadcast_uri = '';

			console.log("BroadcastingData:",data);
			for(var i in parts){
				if(parts[i]) {
					broadcast_uri += '/' + parts[i];
					console.log("Broadcasting::", broadcast_uri);
					njaxSocket._io.to(broadcast_uri).emit('event', response);
				}
			}

		},
		onConnection: function (socket) {
			console.log(socket.id);
			socket.emit('greeting', { hello: 'world' });
			socket.on('update_credentials', function(data){
				console.log("UpdateCredentials:", data);
			})
			socket.on('$query', function (data) {
				console.log('$query', data);
				var model_name = data.model;
				try {
					if (!app.model[model_name]) {
						throw new Error("Invalid Model Name");
					}
					data.query = data.query || {};
					data.query.archiveDate = null;

					var mongoModel = app.model[model_name];
					mongoModel.find(data.query )
						.limit( 10)
						.exec(function(err, collection){
							if(err) throw err;
							var response = [];
							for(var i in collection){
								response.push(collection[i].toObject());
							}
							console.log("Emmiting:", data._request_id);
							socket.emit('response', {
								_request_id:data._request_id,
								response:response
							});
						});
				}catch(e){
					console.error(e.message);
					return socket.emit('error', e.message);
				}
			});
			socket.on('$save', function (request) {
				console.log('$save', request);
				var model_name = request.model;
				try {
					if (!app.model[model_name]) {
						throw new Error("Invalid Model Name");
					}

					var mongoModel = app.model[model_name];
					if(!request.data._id){
						var mongoInstance = new  mongoModel(request.data);
						mongoInstance.save(function(err, newInstance){
							if(err) throw err;

							console.log("Emmiting:", request._request_id);

							njaxSocket.emitEvent('create', mongoInstance);
							socket.emit('response', {
								_request_id: request._request_id,
								response: mongoInstance.toObject()
							});
						})
					}else {
						var data = _.clone(request.data);
						delete(data._id);
						var query = {_id: request.data._id};
						mongoModel.findOne(query).exec(function(err, instance){

								if (err) throw err;
								if (!instance) throw new Error("Cannot find instance to update." + model_name + ":" + request.data._id);
								for(var i in data){
									instance[i] = data[i];
								}
								return instance.save(function(err){
									if(err) throw err;
									njaxSocket.emitEvent('update', instance);
									socket.emit('response', {
										_request_id: request._request_id,
										response: mongoModel
									});
								});

						});
					}
				}catch(e){
					console.error(e.message);
					return socket.emit('error', e.message);
				}
			});
			socket.on('$archive', function (request) {
				console.log('$archive', request);
				var model_name = request.model;
				try {
					if (!app.model[model_name]) {
						throw new Error("Invalid Model Name");
					}

					var mongoModel = app.model[model_name];
					if(!request.data._id){
						throw new Error("No valid _id to identify Archive Request")
					}
					var data = _.clone(request.data);
					delete(data._id);
					var query = {_id: request.data._id};
					mongoModel.findOne(query).exec(function(err, instance){

						if (err) throw err;
						if (!instance) throw new Error("Cannot find instance to archive." + model_name + ":" + request.data._id);

						return instance.archive(function(err){
							if(err) throw err;
							njaxSocket.emitEvent('archive', instance);
							socket.emit('response', {
								_request_id: request._request_id,
								response: mongoModel
							});
						});

					});
				}catch(e){
					console.error(e.message);
					return socket.emit('error', e.message);
				}
			});
			socket.on('$connect', function (request) {
				//Join a room
				var uri = request.uri;
				socket.join(uri);
				console.log("Successfully Joined: ", uri);
				//Your good .. prob dont need to send a response
				socket.emit('response', {
					_request_id: request._request_id,
					response: { success: true }
				});

			});

		}
	}
	return njaxSocket;

}