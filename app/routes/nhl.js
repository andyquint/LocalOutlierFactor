var dataset = require('../helpers/dataset');
var express = require('express');
var fs = require('fs');
var lof = require('../helpers/lof');
var parse = require('csv-parse/lib/sync');
var router = express.Router();

/* GET NHL96 player analysis */
router.get('/', function(req, res, next) {
	// Open dataset
	fs.readFile('../datasets/nhl96/players.csv','utf8',function (err,data) {
		if (err) {
			return console.log(err);
		}
		var playerdata = parse(data, {auto_parse: true, columns: true});

		// Specify which columns will be used for analysis
		var columnsToUse = [{'name':'P'},{'name':'PIM'},{'name':'+/-'}];

		// Remove players who didn't contribute anything in these categories
		var filtered_data = playerdata.filter(function(player) {
			return player['P']!=0 || player['PIM'] != 0 || player['+/-'] != 0;
		});
		filtered_data = filtered_data.map(function(player) {
			player['+/-'] = parseInt(player['+/-']);
			if (isNaN(player['+/-']))
				player['+/-'] = 0;
			return player;
		});

		// Set MinPtsLB, MinPtsUB
		var minPtsLB = 30;
		var minPtsUB = 50;

		// Get LOF values
		var lofs = lof(filtered_data, columnsToUse, minPtsLB, minPtsUB);

		// Print results
		var results = lofs.map(function(obj) {
			var index = obj.index;
			var lof = obj.lof;
			var player = {};
			player['Name']=filtered_data[index]['Name'];
			player['LOF']=lof;
			player['Points'] = filtered_data[index]['P'];
			player['Penalty Minutes'] = filtered_data[index]['PIM'];
			player['+/-'] = filtered_data[index]['+/-'];
			return player;
		});
		console.log('For Points, Penalty Minutes, +/-:');
		console.log(results.splice(0,20).reverse());
	});
	res.render('results', { dataset_name: 'NHL96' });
});

module.exports = router;
