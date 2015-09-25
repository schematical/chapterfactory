'use strict';





// Declare app level module which depends on filters, and services
var cfcore = angular.module(
	'cfcore',
	[
		'ngRoute',
		'ngCookies',
		'njax',
		'ui.router',
		'yaru22.angular-timeago',
		'textAngular',
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
)
.directive('sharePanel',
	[
		function () {
			return {
				replace: true,
				scope: {
					title: '=title'
				},
				templateUrl: '/templates/model/sharePanel.html',
				link: function (scope, element, attrs) {

					scope.$watch('title._id', function(){
						if(!scope.title){
							return;
						}
						scope.encoded_url = encodeURI('http://' + scope.title.url)

					});
				}
			}
		}
	])
.directive('titleTimeline',
	['NJaxBootstrap','Title','Chapter',
		function (NJaxBootstrap, Title, Chapter) {
			return {
				replace: true,
				scope: {
					title:'=title'
				},
				templateUrl: '/templates/model/title/titleTimeline.html',
				link: function (scope, element, attrs) {

					Chapter.$query({ title: scope.title._id }).then(function(data){

						scope.chapters = data.response;
						for(var i in scope.chapters){
							scope.chapters[i].timeline = scope.getChapterClass(scope.chapters[i])
						}
					});
					scope.isOwner = function(){
						return NJaxBootstrap.user &&  (scope.title.owner == NJaxBootstrap.user._id);
					}
					scope.getChapterClass = function(chapter){
						var now = new Date();
						if(chapter.dueDate > now){
							if(!chapter.startedDate){
								//Has not been written
								return {
									icon: 'fa-calendar-minus-o',
									status: ''
								}
							}else if(!chapter.publishedDate) {

								//Has been started
								return {
									icon: 'fa-pencil',
									status: 'warn'
								}
							}else{
								//Has been written
								return {
									icon: 'fa-check',
									status: 'success'
								}
							}


						}else{
							if(!chapter.startedDate){
								//Has not been written
								return {
									icon: 'fa-times',
									status: 'danger'
								}

							}else if(!chapter.publishedDate) {

								//Has been written
								return {
									icon: 'fa-check',
									status: 'success'
								}
							}else {
								//has not been started
								return {
									icon: 'fa-bel',
									status: ''
								}
							}

						}
					}
				}
			}
		}
])
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
			if(curr_step == 4){
				$timeout(function(){
console.log($("#register").offset().top);
					$('html, body').animate({
						scrollTop: $("#register").offset().top
					}, 2000);
				}, 500)

			}
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

}])
.controller('ChapterDetailCtl', ['$scope','NJaxBootstrap',
	function($scope, NJaxBootstrap){
		$scope.$parent.$watch('chapter', function() {
			$scope.chapter = $scope.$parent.chapter;
			if(!$scope.chapter){
				return;
			}
			if(NJaxBootstrap.user){
				$scope.chapter.isOwner(NJaxBootstrap.user).then(function(is_owner){
					$scope.is_owner = is_owner;
				})
			}
		});
		$scope.$parent.$watch('title', function(){
			$scope.title = $scope.$parent.title;
		})

	}
])
.directive('chapterFancyEditor',
	['NJaxBootstrap','Title','Chapter',
		function (NJaxBootstrap, Title, Chapter) {
			return {
				replace: true,
				scope: {
					chapter: '=chapter'
				},
				templateUrl: '/templates/model/chapter/_fancy_editor.html',
				link: function (scope, element, attrs) {


					scope.markStarted = function(){
						scope.chapter.startedDate = new Date();
						scope.chapter.$save().then(function(){
							console.log("Started");
						})
					}
					scope.saveContent = function(){
						scope.saveText = 'Saving...';
						scope.saveClass = 'btn-warn';
						scope.chapter.$save().then(function(){
							scope.saveText = 'Saved!';
							scope.saveClass = 'btn-success';
						})
					}
					scope.markPublished = function(){
						scope.chapter.publishedDate = new Date();
						scope.chapter.$save().then(function(){
							console.log("Publish");
						})
					}
					scope.promptForPublish = function(){
						scope._prompt_for_publish = true;
						$('#publishModal').modal('show')
					}
					scope.$watch('chapter.content_html', function(newVal){
						scope.resetSaveBtn();
					})
					scope.resetSaveBtn = function(){
						scope.saveText = 'Save';
						scope.saveClass = 'btn-primary';
					}
					scope.$watch('chapter', function(){
						if(!scope.chapter){
							return null;
						}
						scope.chapter.parent().then(function(title){
							scope.notes = "Check out " + scope.chapter.name + ", the newest chapter of my book  " + title.name + " ";
						})
					});

					scope.resetSaveBtn();
				}
			}
		}
])
.run(['timeAgo', function(timeAgo){
	timeAgo.settings.allowFuture = true;

}])