var dataset = require('../helpers/dataset');

module.exports = function (data, attributes, minPtsLB, minPtsUB) {
	// Normalize data
	var normalized = dataset.normalize(data, attributes);

	// Find MinPtsUB-nearest neighbors and their distances for each object
	dataset.getMinPtsUB_Neighbors(normalized, minPtsUB, attributes);

	// For each object,
	normalized.forEach(function(object) {
		object.minPts = {};
		for (var minPts=minPtsUB; minPts >= minPtsLB; minPts--) {
		// For values from MinPtsUB to MinPtsLB,
			object.minPts[minPts] = {};
			// Get minPts-nearest neighbors from minPtsUB-nearest neighbors
			object.minPts[minPts].neighbors = object.minptsUB_neighbors.slice(0,minPts);
			var remaining = object.minptsUB_neighbors.slice(i,object.minptsUB_neighbors.length);
			for (var i = 0; i < remaining.length && remaining[i].distance == object.minPts[minPts].neighbors[object.minPts[minPts].neighbors.length-1].distance; i++) {
				object.minPts[minPts].neighbors.push(remaining[i]);
			}
		}
	});

	// Now that the neighborhoods for each object are generated,
	// Compute local reachability density for each object
	normalized.forEach(function(object, index) {
		for (var minPts=minPtsUB; minPts >= minPtsLB; minPts--) {
			object.minPts[minPts].neighbors.forEach(function(neighbor) {
				// Calculate reachability distance between each neighbor
				// - Calculate the k-distance of the neighbor
				var kdistance = Math.max.apply(Math, normalized[neighbor.index].minPts[minPts].neighbors.map(function(o){return o.distance}));
				
				var distance = neighbor.distance;
				neighbor.reachDist = Math.max(kdistance, distance);
			});
			// Compute reachability density
			var sum_reachDist = 0;
			object.minPts[minPts].neighbors.forEach(function(neighbor) {
				sum_reachDist = sum_reachDist + neighbor.reachDist;
			});
			var num_neighbors = object.minPts[minPts].neighbors.length;
			var density = 1 / (sum_reachDist/num_neighbors);
			object.minPts[minPts].lrd = density;
		}
	});
	// Compute local outlier factor
	normalized.forEach(function(object, index) {
		for (var minPts=minPtsUB; minPts >= minPtsLB; minPts--) {
			var sum_lrd_ratio = 0;
			object.minPts[minPts].neighbors.forEach(function(neighbor) {
				var lrd_ratio = normalized[neighbor.index].minPts[minPts].lrd/object.minPts[minPts].lrd;
				sum_lrd_ratio = sum_lrd_ratio + lrd_ratio;
			});
			var num_neighbors = object.minPts[minPts].neighbors.length;
			var lof = sum_lrd_ratio/num_neighbors;
			object.minPts[minPts].lof = lof;
		}
		// For each object, select max LOF given values from ranging of MinPts
		var lof_values = Object.keys(object.minPts).map(function(key) { return object.minPts[key].lof; });
		object.max_lof = Math.max.apply(null, lof_values);
	});

	var sorted_lofs = normalized.map(function(object) {
		return {
			index: object.index,
	    		lof: object.max_lof
		};
	});

	sorted_lofs.sort(function(a,b) {
		return b.lof - a.lof;
	});
	
	return sorted_lofs;
}
