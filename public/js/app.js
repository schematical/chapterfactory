'use strict';





// Declare app level module which depends on filters, and services
var cfcore = angular.module(
	'cfcore',
	[
		'ngRoute',
		'ngCookies',
		'njax',
		'ui.router',
		/*'njax.bootstrap',
		'njax.directives',
		'njax.application.controller',
		'njax.application.service',*/

	]
);
cfcore.config(
	[
		//'$sce',
		'$urlRouterProvider',
		'$stateProvider',
		'$httpProvider',
		'$sceDelegateProvider',
		'$compileProvider',
		'$locationProvider',
		function ($urlRouterProvider, $stateProvider, $http, $sceDelegateProvider, $compileProvider, $locationProvider) {
			window.$compileProvider = $compileProvider;
			if (history.pushState) {
				$locationProvider.html5Mode(true);
			}

		/*	var white_list = ['self',
				window.njax_bootstrap.core_www_url + '**',
				window.njax_bootstrap.core_api_url + '*//**',
			]
			for(var i in window.njax_bootstrap.super_applications){
				if(window.njax_bootstrap.super_applications[i].api_url){
					white_list.push(window.njax_bootstrap.super_applications[i].api_url + '*//**');
				}
			}

			$sceDelegateProvider.resourceUrlWhitelist(
				white_list
			);
			//$http.defaults.withCredentials = true;
			$http.defaults.headers.common.access_token = window.njax_bootstrap.access_token;*/

			NJax.Builder.buildRoutes($urlRouterProvider, $stateProvider);

		}
	]
).run([ function(){


}])
.controller('TestCtl',['$scope', 'Title', function($scope, Title){
		Title.$query().then(function(data){
			console.log("Query Success: ", data)
			$scope.titles = data.response;

		})
}]);