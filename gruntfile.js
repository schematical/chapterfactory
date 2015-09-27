module.exports = function(grunt) {
	require('jit-grunt')(grunt);
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-aws-s3');
	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-angular-builder');
	grunt.loadNpmTasks('grunt-bower');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');

	var config = {
		aws:grunt.file.readJSON('aws-keys.json')
	};
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			build:[
				'public/_build/*'
			]
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
				tasks: ['less'],
				options: {
					nospawn: true
				}
			}
		},
		'aws_s3':{
			options:{
				accessKeyId:config.aws.accessKeyId,
				secretAccessKey:config.aws.secretAccessKey,
				uploadConcurrency: 5, // 5 simultaneous uploads
				downloadConcurrency: 5 // 5 simultaneous downloads

			},
			prod: {
				options: {
					bucket:'prod-chapterfactory-com-assets'
					//region: 'us-west-2'
				},
				files: [
					{expand: true, cwd: 'public/_build/js/', src: ['**'], dest: 'js/', differential:true},
					{expand: true, cwd: 'public/_build/css/', src: ['**'], dest: 'css/', differential:true},
					{expand: true, cwd: 'public/img/', src: ['**'], dest: 'img/', differential:true},
					{expand: true, cwd: 'public/fonts/', src: ['**'], dest: 'fonts/', differential:true},
					{expand: true, cwd: 'public/templates/', src: ['**'], dest: 'templates/', differential:true},
					{expand: true, cwd: 'public/_build/vendor/', src: ['**'], dest: 'vendor/', differential:true},
					{expand: true, cwd: 'public/js/', src: ['**'], dest: 'js/', differential:true},
					{expand: true, cwd: 'node_modules/njax/public/js/', src: ['**'], dest: 'njax/js', differential:true},
				]
			}
		},
		'angular-builder': {
			options: {
				mainModule: '<%= pkg.name %>',
				// angular-builder ignores these modules
				externalModules:[
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
					targetDir: 'public/_build/'
				},

				src:  [
					'public/js/**/*.js',
					'node_modules/njax/public/js/**/*.js',
					'public/_build/js/templates.js',


				],
				/*forceInclude:[
					'node_modules/njax/public/js/services/subscription.js',
				],*/
				dest: 'public/_build/js/<%= pkg.name %>.js'
			},
			prod: {
				options: {
					buildMode: 'release'
				},
				assets: {
					enabled: true,
					targetDir: 'public/_build/'
				},
				src:  [
					'public/js/**/*.js',
					'node_modules/njax/public/js/**/*.js',
					'node_modules/njax/public/js/services/*.js',
					'public/_build/js/templates.js',

				],
				dest: 'public/_build/js/<%= pkg.name %>.js'
			}
		},
		ngtemplates:    {
			prod: {
				src:        'public/templates/**/**.html',
				dest:       'public/_build/js/templates.js',
				options:    {
					url:    function(url) {
						var remove_prefix = 'public/';
						if(url.substr(0, remove_prefix.length) == remove_prefix){
							url = url.substr(remove_prefix.length);
						}
						return url;
					},
					module: '<%= pkg.name %>',
					htmlmin:  { collapseWhitespace: true, collapseBooleanAttributes: true },
					prefix: 'https://chapterfactory.re'// 'https://s3.amazonaws.com/townsquare-prod-assets'
				}
			},
			local: {

				src:        'public/templates/**/**.html',
				dest:       'public/_build/js/templates.js',
				options:    {
					url:    function(url) {
						var remove_prefix = 'public/';
						if(url.substr(0, remove_prefix.length) == remove_prefix){
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
					'public/_build/js/<%= pkg.name %>.js',
					'node_modules/njax/public/js/builder*.js',
					'node_modules/njax/public/js/services/*.js',
				],
				dest: 'public/_build/js/<%= pkg.name %>.concat.js'
			}
		},
		bower: {
			local: {
				dest: 'public/_build/bower'
			},
			prod: {
				dest: 'public/_build/bower'
			}
		},
		uglify: {
			local: {
				options: {
					banner: '//*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd-hh-MM") %> *//*\n',

					sourceMap: false,
					mangle: false,
					compress: false,
					beautify: true,

					sourceMapURL: '/js/<%= pkg.name %>.js.map',
					sourceMapBasepath: 'bpublic/_build/js/',
					sourceMapRootpath: '/js',
					soureMapInline: true
				},
				files: {
					'public/_build/js/<%= pkg.name %>.min.js': ['public/_build/js/<%= pkg.name %>.concat.js'],
					'public/_build/js/vendor.js': [
						'public/_build/bower/dist/jquery.js',
						'public/_build/bower/dist/js/bootstrap.js',
						'public/_build/bower/angular.js',
						'public/_build/bower/angular-cookies.js',
						'public/_build/bower/angular-route.js',
						'public/_build/bower/dist/ng-table.min.js',
						'public/_build/bower/release/angular-ui-router.js',
						'public/_build/bower/src/timeAgo.js',
						'public/_build/bower/dist/textAngular.js',
						'public/_build/bower/dist/textAngular-sanitize.js',
						'public/_build/bower/dist/textAngularSetup.js',
						'public/_build/bower/rangy-core.js',
						'public/_build/bower/rangy-selectionsaverestore.js'
					]
				}
				/*src: 'public/_build/js/<%= pkg.name %>.js',
				dest: 'public/_build/js/<%= pkg.name %>.min.js'*/
			},
			prod: {
				options: {
					banner: '//*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd-hh-MM") %> *//*\n',

					sourceMap: false,
					mangle: false,
					compress: false,
					beautify: true,

					sourceMapURL: '/js/<%= pkg.name %>.js.map',
					sourceMapBasepath: 'bpublic/_build/js/',
					sourceMapRootpath: '/js',
					soureMapInline: true
				},
				src: 'public/_build/js/<%= pkg.name %>.js',
				dest: 'public/_build/js/<%= pkg.name %>.min.js'
			}
		}
	});

	grunt.registerTask ('debug', ['angular-builder::debug']);

	grunt.registerTask('build-local', [
		'clean:build',
		'less',
		'ngtemplates:local',
		'angular-builder:local',
		'concat:local',
		'bower:local',
		'uglify:local'
	]);


	grunt.registerTask('default', ['less', 'watch']);
};