	waitForBoth();
	
	function initCharts() {
		var settings = {
			width: '100%',
			height: 300,
			hAxis: {
				maxAlternation: 1
			},
			vAxis: {
				title: 'peak connections',
				baseline: 0,
				minValue: 0,
				maxValue: 15,
				format: '#'
			},
			legend: 'none',
			reverseCategories: true
		};

		if(stats.hourly.t && stats.hourly.t.length > 0){
			var chart = new google.visualization.AreaChart(document.getElementById('chart_hourly'));
			chart.draw(dataTableFor(stats.hourly), settings);
		}
		
		if(stats.daily.t && stats.daily.t.length > 0){
			var chart = new google.visualization.AreaChart(document.getElementById('chart_daily'));
			chart.draw(dataTableFor(stats.daily, 'date'), settings);
		}

		function dataTableFor(stats, time_format){
			var data = new google.visualization.DataTable();
			data.addColumn('string', 'Time');
			data.addColumn('number', 'Peak Connections');
			
			for(var i=0;i<stats.t.length; i++){
				// our timestamps are likely +- 10ms away from dead-on
				// add 5 seconds to ensure times don't round DOWN to the next minute (2:59:59 pm)
				var t = new Date(stats.t[i] + 5000); 
				data.addRow([
					Util[time_format || 'time'](t),
					stats.peak_connections[i]
				]);
			}
			return data;
		}
	}
