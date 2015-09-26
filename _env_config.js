module.exports = {
	app_dir: __dirname,
	port:3030,
	env:'local',//env:'prod',
	//force_https:true,
	//hide_port:true,
	create_missing_tpls:true,
	domain:'ldevelopers.schematical.com',
	cookie:{
		secret:'bandanas',
		domain:'schematical.com'
	},
	aws:{
		accessKeyId:'xx',
		secretAccessKey:'xxx',
		bucket_name:'byobob',
		associateId:'holiday_helper-20'
	},
	local_file_cache:true,
	super_admin_emails:[
		'mlea@schematical.com',
	],
	core:{
		app:"schematical",
		host:'ldevelopers.schematical.com:3030',
		api:{
			host:'api.ldevelopers.schematical.com:3030',
			protocol:'http'

		},
		asset_url:'/'
	},
	redis:{ host: 'localhost', port: 6379 },
	admin_uri:'/local-admin',

	mongo:'mongodb://localhost/schematical',//'mongodb://schematical-prod:o0ekIUek@ds059651.mongolab.com:59651/developers-schematical-com',

	google_analytics_tracking_id: 'UA-xxxx'
}

