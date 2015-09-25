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
				"uri_prefix": "/titles",
				"fields": {
					"namespace": "namespace",
					"name": "string",

					"desc": "md",
					"owner": {
						"type": "ref",
						"ref": "account",
						"bootstrap_populate": "user"
					},
					"chapterCount":"number",
					"cover":"s3-asset",
					"archiveDate": "date"
				}
			},
			"chapter": {
				"parent": "title",
				"uri_prefix": "/chapters",
				"fields": {
					"namespace": "namespace",
					"name": "string",
					"desc": "md",
					"chapterNum":"number",
					"content_raw":"string",
					"content_html":"string",
					"startedDate":"date",
					"publishedDate":"date",
					"title": {
						"type": "ref",
						"ref": "title",
						"bootstrap_populate": "title"
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