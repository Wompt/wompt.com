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

		var chart = new google.visualization.AreaChart(document.getElementById('chart_hourly'));
		chart.draw(dataTableFor(stats.hourly), settings);
		
		var chart = new google.visualization.AreaChart(document.getElementById('chart_daily'));
		chart.draw(dataTableFor(stats.daily, 'date'), settings);


		function dataTableFor(stats, time_format){
			var data = new google.visualization.DataTable();
			data.addColumn('string', 'Time');
			data.addColumn('number', 'Peak Connections');
			
			for(var i=0;i<stats.t.length; i++){
				var t = new Date(stats.t[i]);
				data.addRow([
					Util[time_format || 'time'](t),
					stats.peak_connections[i]
				]);
			}
			return data;
		}
	}
