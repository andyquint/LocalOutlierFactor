var dataset = require('../helpers/dataset');
var express = require('express');
var fs = require('fs');
var lof = require('../helpers/lof');
var parse = require('csv-parse/lib/sync');
var router = express.Router();

/* GET NBA15 player analysis */
router.get('/', function(req, res, next) {
	// Open dataset
	fs.readFile('../datasets/nba15/players.csv','utf8',function (err,data) {
		if (err) {
			return console.log(err);
		}
		var playerdata = parse(data, {auto_parse: true, columns: true});

		// Specify which columns will be used for analysis
		var columnsToUse = [{'name':'MP'},{'name':'AST'},{'name':'TOV'}];

		// Remove players who didn't contribute anything in these categories
		// Remove players who didn't play a minimum of 100 minutes
		var filtered_data = playerdata.filter(function(player) {
			return player['MP'] > 200;
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
			player['Name']=filtered_data[index]['Player'];
			player['Name']=player['Name'].substring(0,player['Name'].indexOf('\\'));
			player['LOF']=lof;
			player['Minutes Played']=filtered_data[index]['MP'];
			player['Assists']=filtered_data[index]['AST'];
			player['Turnovers']=filtered_data[index]['TOV'];
			player['Ast/Tov']=player['Assists']/player['Turnovers'];
			return player;
		});
		results = results.splice(0,20);
		console.log('For Minutes Played, Assists, Turnovers:');
		console.log(results);
		res.render('results', { 
			dataset_name: 'NBA15' ,
			results: results
		});
	});
});

module.exports = router;
