var Chart = function() {
	var cContainer = '', 
		cParent = '', 
		cData = [], 
		// cColors = []
		cBindings = {}, 
		cTypes = {}, 
		cGroups = []; 

	this.cColors; 

	function factory() {
		var out = {}; 

		out.draw = function() {
			if(cData==null || cData===undefined || cData.length<=0) return factory(); 

			c3.generate({
				bindto: cContainer, 
				data: {
					xs: cBindings, 
					columns: cData, 
					types: cTypes, 
					groups: cGroups, 
					labels: true
				}, 
				color: {
					// pattern: cColors
				}, 
				axis: {
					x: {
						// show: showXAxis, 
						tick: {
							multiline: false, 
							outer: false, 
							fit: true, 
							count: cData[0].length-1, 
							culling: {
								max: 8
							}
						}, 
						padding: {
							// left:2, 
							// right:2
						}
					}, 
					y: {
						// show: showYAxis
					}
				}, 
				grid: {
					x: {
						// show: showXGrid
					}, 
					y: {
						// show: showYGrid
					}
				}, 
				legend: {
					// show: showLegend
				}, 
				point: {
					// show: showPoints 
				}, 
				tooltip: {
					// show: showTooltip
				}, 
				zoom: {
					enable: false 
				}, 
				subchart: {
					// show: showFocus 
				}
			}); 

			return factory(); 
		}; 

		out.container = function(v) {
			if(!arguments.length) return cContainer; 
			cContainer = v; 
			cParent = $(cContainer).parent().first(); 
			return factory(); 
		}; 

		out.data = function(v) {
			if(!arguments.length) return cData; 
			parseData(v); 
			return factory(); 
		}; 

		out.type = function(v) {
			if(!arguments.length) return cTypes; 
			for(var k in cData) 
				cTypes[cData[k][0]] = v; 
			return factory(); 
		}; 

		return out; 
	}

	function parseData(data) {
		var newData = []; 

		for(var key in data) {
			if("values" in data[key]) {
				var newValues = parseValues(key, data[key]["values"]); 
				for(var val in newValues) 
					newData.push(newValues[val]); 
			}
		}

		// console.log(newData); 
		cData = newData; 
	}

	function parseValues(key, data) {
		var XY = (data.length>0 && data[0].length==2); 
		var temp = {}; 
		var newValues = []; 
		var xkey = key+"_x"; 

		temp[key] = [key]; 
		temp[xkey] = [xkey]; 

		if(XY) {
			for(var coords in data) {
				temp[xkey].push(data[coords][0]); 
				temp[key].push(data[coords][1]); 
			}
		} else {
			// data.sort(function(a,b) { return a-b; }); 
			// console.log(dataAverage(data)); 
			for(var i=0;i<data.length;i++) {
				temp[xkey].push(i+1); 
				temp[key].push(data[i]); 
			}
		}

		cBindings[key] = xkey; 
		// console.log(cBindings); 

		for(var k in temp) 
			newValues.push(temp[k]); 

		// console.log(newValues); 

		return newValues; 
	}

	function dataAverage(data) {
		var total = 0; 
		// console.log(data); 
		// console.log(data["grades"]["values"]); 

		for(var d in data) 
			total += parseInt(d); 

		// console.log(total); 
		// console.log(data.length*100); 
		
		return total/data.length*100; 
	}

	return factory(); 
}