	waitForBoth();
	
	function initCharts() {
		var data = new google.visualization.DataTable();
		data.addColumn('string', 'Time');
		data.addColumn('number', 'Connections');
		data.addColumn('number', 'Max Connections');
		stats.day.forEach(function(row){
			var t = new Date(row[0]);
			row[0] = t.toTimeString();
			data.addRow(row);
		});
		
		var chart = new google.visualization.LineChart(document.getElementById('chart'));
		chart.draw(data, {width: 800, height: 240, title: 'Last 24 Hours'});
		var table = new google.visualization.Table(document.getElementById('table'));
		table.draw(data, {showRowNumber: true});
	}
	
	
