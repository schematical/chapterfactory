module.exports = function () {
	var config = {
		"app_name": "adam",
		"is_platform": true,
		"frameworks": {
			"angular": "angular",
			/*"sdk": {
				"node_module": {
					"name": "adam-sdk"
				},
				"sub_modules": {
					"challenges": {
						"name": "iraas-sdk",
						"repo": ""
					}
				}
			}*/
		},
		"models": {
			"title": {
				"parent": "owner",
				"uri_prefix": "/title",
				"fields": {
					"namespace": "namespace",
					"name": "string",

					"desc": "md",
					"owner": {
						"type": "ref",
						"ref": "account",
						"bootstrap_populate": "req.user"
					},
					"chapterCount":"number",
					"cover":"s3-asset",
					"archiveDate": "date"
				}
			},
			"chapter": {
				"parent": "title",
				"uri_prefix": "/chapter",
				"fields": {
					"namespace": "namespace",
					"name": "string",
					"desc": "md",
					"chapterNum":"number",
					"content":"md",
					"content_html":"string",
					"startedDate":"date",
					"publishedDate":"date",
					"title": {
						"type": "ref",
						"ref": "title",
						"bootstrap_populate": "req.title"
					},
					"dueDate":"date",
					"archiveDate": "date"
				}

			}
		},
		"bowser": {
			"dependencies": {
				"font-awesome": "*",
				"angular": "*",
				"angular-route": "*",
				"angular-cookies": "*",
				"angular-resource": "*",
				"angular-strap": "*",
				"jquery": "*"
			}
		},
		"package": {
			"dependencies": {
				"mkdirp": "*",
				"hogan.js": "*",
				"aws-sdk": "*",
				"request": "*",
				"markdown": "*",
				"passport-stripe": "*"
			}
		}
	}
	return config;


}