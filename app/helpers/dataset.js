// Contains functions for transforming a dataset
var stats = require('stats-lite');

exports.normalize = function (dataset, columnsToNormalize) {
	// Returns array of objects containing index and normalized values
	var normalized = [];
	columnsToNormalize.forEach(function(column) {
		var values = dataset.map(function(row) {
			var value = row[column.name];
			if (!Number.isInteger(value)) {
				value = 0;
			}
			return value;
		});
		column.mean = stats.mean(values);
		column.variance = stats.variance(values);
	});
	dataset.forEach(function(row, index) {
		var n_row = { 'index':index };
		columnsToNormalize.forEach(function(column) {
			var colName = column.name;
			n_row[colName] = (row[column.name]-column.mean)/column.variance;
		});
		normalized.push(n_row);
	});
	return normalized;
}

exports.distance = function(object1, object2, columns) {
	var distance = 0;
	columns.forEach(function(col) {
		distance = distance + Math.pow(object2[col.name]-object1[col.name], 2);
	});
	distance = Math.pow(distance, 0.5);
	return distance;
}

exports.getMinPtsUB_Neighbors = function(dataset, minPtsUB, columns) {
	dataset.forEach(function(row1) {
		var distances = [];
		dataset.forEach(function(row2, index) {
			var val = exports.distance(row1, row2, columns);
			var distance = {
				'index':index,
				'distance': val
			};
			distances.push(distance);
		});
		distances.sort(function(row1,row2) {
			if (row1.distance > row2.distance) {
				return 1;
			}
			if (row1.distance < row2.distance) {
				return -1;
			}
			return 0;
		});
		row1.minptsUB_neighbors = distances.slice(0,minPtsUB);
		var remaining = distances.slice(minPtsUB,distances.length);
		for (var i = 0; row1.minptsUB_neighbors[row1.minptsUB_neighbors.length-1].distance == remaining[i].distance; i++) {
			row1.minptsUB_neighbors.push(remaining[i]);
		}
	});
}
