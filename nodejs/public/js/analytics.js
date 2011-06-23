	waitForBoth();
	
	function initCharts() {
		var data = dataTableFor(stats.minute);
		
		var chart = new google.visualization.AreaChart(document.getElementById('chart'));
		chart.draw(data, {
			width: 900,
			height: 240,
			title: 'Last Hour',
			hAxis: {
				showTextEvery: 10
			},
			vAxis: {
				baseline: 0,
				minValue: 0,
				maxValue: 10,
				format: '#'
			},
			legend: 'none',
			reverseCategories: true
		});
		
		function dataTableFor(stats){
			var data = new google.visualization.DataTable();
			data.addColumn('string', 'Time');
			data.addColumn('number', 'Peak Connections');
			
			for(var i=0;i<stats.t.length; i++){
				var t = new Date(stats.t[i]);
				data.addRow([
					Util.time(t),
					stats.peak_connections[i]
				]);
			}
			return data;
		}
	}
