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
.controller('HomeCtl',['$scope', '$q', '$timeout', 'Title', 'Chapter', function($scope, $q, $timeout, Title, Chapter){
		$scope.title = new Title({
			chapterCount:6
		});
		$scope.step = 0;
		$scope.titleName_action = 'Next';


		$scope.titleDesc_action = "Next"
		$scope.titleChapterCount_action = "Next";
		$scope.chapterCountOpts = [];
		for(var i = 0; i < 24; i++){
			$scope.chapterCountOpts.push(i)
		}
		$scope.next = function(curr_step){
			if(!$scope.title.name || $scope.title.name.length < 2){
				//Display an error for this
				$scope.titleNameError = 'Need a longer title for your book buddy';
				return;
			}
			$scope.titleNameError = null;
			$scope.step = 1;
			if(curr_step <= $scope.step){
				return;
			}
			//Just letting it go for now


			if(!$scope.title.desc || $scope.title.desc.length == 0){
				$scope.titleDescError = 'Common tell us a little something';
				return;
			}
			$scope.titleDescError = null;
			$scope.step = 2;

			if(!$scope.title.chapterCount || $scope.title.chapterCount == 0){
				$scope.titleChapterCountError = 'You should probably write at least one';
				return;
			}
			$scope.titleDescError = null;
			$scope.step = curr_step;



			$scope.updateChapters();

		}
		$scope.onRegisterFinish = function(user){
			$scope.user = user;
			$scope.saveTitle();

		}
		$scope.saveTitle = function(){
			$scope.title.owner = $scope.user._id;
			$scope.title.$save().then(function(){

				console.log("Saved Title");
				var promisses = [];
				for(var i in $scope.chapters){
					$scope.chapters[i].title = $scope.title._id;
					promisses.push($scope.chapters[i].$save());

				}
				$q.all(promisses).then(function(){

					$scope.step = 5;
					$timeout(function(){
						alert('//' + $scope.title.url);
						document.location = '//' + $scope.title.url;

					}, 2000);
				})
			})
		}
		$scope.updateChapters = function(){
			$scope.chapters = [];
			var startDate = new Date();
			var startMonth = startDate.getMonth();
			var startYear = startDate.getFullYear();
			for(var i = 1; i <= $scope.title.chapterCount; i++){
				var dueDate = new Date();
				var newMonth = startMonth + i;
				var newYear = startYear + Math.floor(newMonth / 12);
				newMonth -= newYear * 12;


				dueDate.setMonth(newMonth);
				dueDate.setYear(newYear);



				$scope.chapters.push(new Chapter({
					chapterNum: i,
					name:"Chapter " + i,
					notes:"",
					dueDate:dueDate
				}));

			}
		}
		$scope.$watch('title.chapterCount', function(){
			$scope.updateChapters();
		})
		$scope.updateChapters();

}]);