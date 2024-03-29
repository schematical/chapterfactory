module.exports = function (grunt) {
	require('jit-grunt')(grunt);
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-aws-s3');
	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-angular-builder');

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');


	var config = {
		aws: grunt.file.readJSON('aws-keys.json')
	};
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		bower: grunt.file.readJSON('bower.json'),
		build_base_dir:'public/_build',
		build_dir:'<%= build_base_dir %>/<%= bower.version %>',
		clean: {
			build: [
				'<%= build_dir %>/*'
			],
			js: [
				'<%= build_dir %>/js/cfcore*'
			]
		},
		copy: {
			main: {
				files: [

					// includes files within path and its sub-directories
					{expand: true,  cwd: 'public/bower_components/font-awesome/fonts', src: ['**'], dest: '<%= build_dir %>/fonts'}
				]
			}
		},
		less: {
			development: {
				options: {
					compress: true,
					yuicompress: true,
					optimization: 2
				},
				files: {
					"public/css/main.css": "public/less/main.less" // destination file and source file
				}
			}
		},
		watch: {
			styles: {
				files: ['public/less/**/*.less'], // which files to watch
				tasks: ['less', 'cssmin:local'],
				options: {
					nospawn: true
				}
			},
			js:{
				files: ['public/js/**/*.js', 'node_modules/njax/public/js/**/*.js'], // which files to watch
				tasks: [
					'clean:js',
					'ngtemplates:local',
					'angular-builder:local',
					'concat:local',
				/*	'bower:local',*/
					'uglify:local'
				],
				options: {
					nospawn: true
				}

			}
		},
		'aws_s3': {
			options: {
				accessKeyId: config.aws.accessKeyId,
				secretAccessKey: config.aws.secretAccessKey,
				uploadConcurrency: 5, // 5 simultaneous uploads
				downloadConcurrency: 5 // 5 simultaneous downloads

			},
			prod: {
				options: {
					bucket: 'prod-chapterfactory-com-assets'
					//region: 'us-west-2'
				},
				files: [
					{
						expand: true,
						cwd: '<%= build_dir %>/js/',
						src: [
							'<%= pkg.name %>.min.js',
							'vendor.js'
						],
						dest: '<%= bower.version %>/js/',
						differential: true
					},
					{
						expand: true,
						cwd: '<%= build_dir %>/css/',
						src: ['**'],
						dest: '<%= bower.version %>/css/',
						differential: true
					},
					{expand: true, cwd: 'public/imgs/', src: ['**'], dest: '<%= bower.version %>/imgs/', differential: true},
					{expand: true, cwd: '<%= build_dir %>/fonts/', src: ['**'], dest: '<%= bower.version %>/fonts/', differential: true}//,
					//{expand: true, cwd: 'public/templates/', src: ['**'], dest: 'templates/', differential:true},
				]
			}
		},
		'angular-builder': {
			options: {
				mainModule: '<%= pkg.name %>',
				// angular-builder ignores these modules
				externalModules: [
					'ngRoute',
					'ngCookies',
					'ngResource',
					'ngAnimate',
					'ngSanitize',
					'ngTable',
					'ui.router',
					'yaru22.angular-timeago',
					'textAngular'
				],
				soureMap: true
			},
			local: {
				options: {
					buildMode: 'release'
				},
				assets: {
					enabled: true,
					targetDir: '<%= build_dir %>/'
				},

				src: [
					'public/js/**/*.js',
					'node_modules/njax/public/js/**/*.js',
					'<%= build_dir %>/js/templates.js',


				],
				/*forceInclude:[
				 'node_modules/njax/public/js/services/subscription.js',
				 ],*/
				dest: '<%= build_dir %>/js/<%= pkg.name %>.js'
			},
			prod: {
				options: {
					buildMode: 'release'
				},
				assets: {
					enabled: true,
					targetDir: '<%= build_dir %>/'
				},
				src: [
					'public/js/**/*.js',
					'node_modules/njax/public/js/**/*.js',
					'node_modules/njax/public/js/services/*.js',
					'<%= build_dir %>/js/templates.js',

				],
				dest: '<%= build_dir %>/js/<%= pkg.name %>.js'
			}
		},
		ngtemplates: {
			prod: {
				src: [
					'public/templates/**/**.html',
					'node_modules/njax/public/templates/directives/**/**.html',
				],
				dest: '<%= build_dir %>/js/templates.js',
				options: {
					url: function (url) {
						var remove_prefix = 'public/';
						if (url.substr(0, remove_prefix.length) == remove_prefix) {
							url = url.substr(remove_prefix.length);
						}
						return url;
					},
					module: '<%= pkg.name %>',
					htmlmin: {collapseWhitespace: true, collapseBooleanAttributes: true},
					prefix: 'https://chapterfactory.re'// 'https://s3.amazonaws.com/townsquare-prod-assets'
				}
			},
			local: {

				src: ['public/templates/**/**.html', 'public/templates/**/**/**.html'],
				dest: '<%= build_dir %>/js/templates.js',
				options: {
					url: function (url) {
						var remove_prefix = 'public/';
						if (url.substr(0, remove_prefix.length) == remove_prefix) {
							url = url.substr(remove_prefix.length);
						}
						return url;
					},
					module: '<%= pkg.name %>',
					prefix: 'http://local.100i.com:3030'
				}
			}
		},
		concat: {
			options: {
				separator: ';'
			},
			local: {
				src: [
					'<%= build_dir %>/js/<%= pkg.name %>.js',
					'node_modules/njax/public/js/builder*.js',
					'node_modules/njax/public/js/services/*.js',
				],
				dest: '<%= build_dir %>/js/<%= pkg.name %>.concat.js'
			}
		},
	/*	bower: {
			local: {
				dest: '<%= build_dir %>/bower'
			},
			prod: {
				dest: '<%= build_dir %>/bower'
			}
		},*/
		uglify: {
			local: {
				options: {
					banner: '//*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd-hh-MM") %> *//*\n',

					sourceMap: false,
					mangle: false,
					compress: false,
					beautify: true,

					sourceMapURL: '/js/<%= pkg.name %>.js.map',
					sourceMapBasepath: 'b<%= build_dir %>/js/',
					sourceMapRootpath: '/js',
					soureMapInline: true
				},
				files: {
					'<%= build_dir %>/js/<%= pkg.name %>.min.js': ['<%= build_dir %>/js/<%= pkg.name %>.concat.js'],
					'<%= build_dir %>/js/vendor.js': [
						'public/bower_components/jquery/dist/jquery.js',
						'public/bower_components/bootstrap/dist/js/bootstrap.js',
						'public/bower_components/angular/angular.min.js',
						'public/bower_components/angular-cookies/angular-cookies.js',
						'public/bower_components/angular-route/angular-route.js',
						'public/bower_components/ng-table/dist/ng-table.min.js',
						'public/bower_components/angular-ui-router/release/angular-ui-router.js',
						'public/bower_components/angular-timeago/dist/angular-timeago.js',
						'public/bower_components/textAngular/dist/textAngular.js',
						'public/bower_components/textAngular/dist/textAngular-sanitize.js',
						'public/bower_components/textAngular/dist/textAngularSetup.js',
						'public/bower_components/rangy/rangy-core.js',
						'public/bower_components/rangy/rangy-selectionsaverestore.js'
					]
				}
				/*src: '<%= build_dir %>/js/<%= pkg.name %>.js',
				 dest: '<%= build_dir %>/js/<%= pkg.name %>.min.js'*/
			},
			prod: {
				options: {
					banner: '//*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd-hh-MM") %> *//*\n',

					sourceMap: false,
					mangle: false,
					compress: false,
					beautify: true,

					sourceMapURL: '/js/<%= pkg.name %>.js.map',
					sourceMapBasepath: 'b<%= build_dir %>/js/',
					sourceMapRootpath: '/js',
					soureMapInline: true
				},
				src: '<%= build_dir %>/js/<%= pkg.name %>.js',
				dest: '<%= build_dir %>/js/<%= pkg.name %>.min.js'
			}
		},
		cssmin: {
			local: {
				files: {
					'<%= build_dir %>/css/main.min.css': [
						'public/css/main.css',
						'public/bower_components/ng-table/dist/ng-table.min.css',
						'public/css/plugins/morris.css',
						'public/css/timeline.css',
						'public/bower_components/font-awesome/css/font-awesome.min.css',
						'public/bower_components/angular-timeago/dist/angular-timeago.css',
						'public/bower_components/textAngular/dist/textAngular.css'
					]
				}
			}
		}


	});

	grunt.registerTask('debug', ['angular-builder::debug']);
	grunt.registerTask('test',  function() {
		grunt.log.write(/*'Logging: <%= bower.version %> / <%= build_dir %>'*/JSON.stringify(grunt.config('build_dir')) ).ok();
	});
	grunt.registerTask('build-local', [
		'clean:build',
		'copy',
		'less',
		'cssmin:local',
		'ngtemplates:local',
		'angular-builder:local',
		'concat:local',
		'uglify:local'
	]);
	grunt.registerTask('deploy-prod', ['build-local', 'aws_s3:prod']);

	grunt.registerTask('default', ['less', 'watch']);
};