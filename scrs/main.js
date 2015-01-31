var chart = {}, 
	data = {
	"grades":{"values":[]}, 
	"curve (delta 100)":{"values":[]}, 
	"curve (100%)":{"values":[]}, 
	"curve (bell)":{"values":[]} },  
	shift = false, 
	options_sorted = false, 
	highlight_grade = false, 
	highlight_delta = false, 
	highlight_perce = false, 
	highlight_bell = false; 

$(document).ready(function() {
	resize(); 
	add_input(); 
	check_input(); 
	check_input_options(); 
	add_graph(); 
}); 

$(window).ready(function() {
	resize(); 
}).resize(function() {
	resize(); 
}); 

function resize() {
	var w = $(window).innerWidth(), 
		h = $(window).innerHeight(); 

	$('grades').height(h-60); 

	$('graph').width(w-$('grades').width()); 
	$('graph').height(h); 
}

function add_input() {
	var i = $('input.grade').length; 
	var input = '<input class="stud" type="text" id="s'+i+'" placeholder="identifier (opt)">';
		input += '<input class="grade" type="text" id="g'+i+'" placeholder="grade value">'; 
	var add_input_button = $('.add_input').remove(); 

	$('grades').append(input); 
	$('grades').append(add_input_button); 

	add_input_button.on('click',function() {
		add_input(); 
	}); 

	$('.stud#s'+i).focus(); 

	$('input.grade').on('keydown',function(e) {
		var id = parseInt($(this).attr('id').substr(1,1)); 

		if($('input.grade').length-1==id) {
			if(e.which==9) {
				if(shift) return; 
				e.preventDefault(); 
				add_input(); 
			}
		}
	}); 
}

function check_input() {
	$('body').on('keydown',function(e) {
		if(e.which==13) {
			get_data(); 
			update_plot(); 
		} else if(e.shiftKey) {
			shift = true; 
		}
	}).on('keyup', function(e) {
		if(!e.shiftKey) {
			shift = false; 
		}
	}); 
}

function check_input_options() {
	$('.option').on('click', function() {
		var id = $(this).attr('id'); 
		var bool; 

		if(id.indexOf('table_')>=0) return; 

		switch(id) {
			case 'table':
				show_modal(); 
				toggle_option_class($(this), true); 
				break; 
			case 'close':
				hide_modal(); 
				toggle_option_class($('.option#table'), false); 
				break; 
			case 'sort':
				//sort grades or not 
				options_sorted = !options_sorted; 
				toggle_option_class($(this), options_sorted); 
				console.log("sorting "+options_sorted); 
				// get_data(); 
				// update_plot(); 
				// break; 
			case 'plot':
				get_data(); 
				update_plot(); 
				break; 
			default: break; 
		}
	}); 
}

function check_table_options() {
	$('table .option').on('click', function() {
		var id = $(this).attr('id'); 
		var bool; 

		switch(id) {
			case 'table_grade':
				highlight_grade = !highlight_grade; 
				show_modal(); 
				break; 
			case 'table_delta':
				highlight_delta = !highlight_delta; 
				show_modal(); 
				break; 
			case 'table_perce':
				highlight_perce = !highlight_perce; 
				show_modal(); 
				break; 
			case 'table_bell':
				highlight_bell = !highlight_bell; 
				show_modal(); 
				break; 
			default: break; 
		}
	}); 
}

function toggle_option_class(obj, value) {
	if(value) obj.addClass("selected"); 
	else obj.removeClass("selected"); 
}

function add_graph() {
	chart = new Chart(); 
	setTimeout(function() {
		chart.container('graph')
			 .data(data)
			 .draw(); 
	}); 
}

function isValid(string) {
	return !(string=='' || string==null || string===undefined); 
}

function get_data() { 
	var users = $('input.stud'), 
		grades = $('input.grade'), 
		sample = [],
		user = '',  
		j = 1; 

	for(var i=0; i<users.length; i++) {
		user = users[i].value; 
		if(!isValid(grades[i].value)) continue; 
		if(!isValid(user)) user = $(users[i]).attr('id'); 

		sample.push([j,parseInt(grades[i].value)]); 
		j++; 
	}
	
	if(options_sorted) {
		sample.sort(function(a,b) { return a[1]-b[1]; }); 
		for(var i=0; i<sample.length; i++) 
			sample[i][0] = i+1; 
	}

	data["grades"]["values"] = sample; 
	data["curve (delta 100)"]["values"] = apply_curve_delta(sample); 
	data["curve (100%)"]["values"] = apply_curve_percent(sample); 
	data["curve (bell)"]["values"] = apply_curve_bell(sample); 
}

function update_plot() {
	resize(); 

	$('#avg').html(Math.round(getAverage(data["grades"]["values"])*100)/100); 
	$('#stddev').html(Math.round(getStandardDeviation(data["grades"]["values"])*100)/100); 

	chart.data(data)
		 .draw(); 
}


function getAverage(sample) {
	if(sample.length <= 0) return 0; 

	var total = 0, 
		possible = 0;  

	for(var i=0; i<sample.length;i++) {
		possible += 100; 
		total += sample[i][1]; 
	}

	return 100*total/possible; 
}

function getStandardDeviation(sample) {
	if(sample.length <= 0) return 0; 

	var avg = getAverage(sample), 
		N = sample.length, 
		total = 0, 
		s = 0; 

	for(var i in sample) 
		s += Math.pow(sample[i][1]-avg,2); 

	s *= 1/N; 

	return Math.sqrt(s); 
}

function getHighest(sample) {
	if(sample.length <= 0) return 0; 

	var highest = -1; 

	for(var k in sample) 
		highest = (sample[k][1]>highest) ? sample[k][1] : highest; 

	return highest; 
}

function apply_curve_delta(sample) {
	if(sample.length <= 0) return []; 

	var highest = getHighest(sample), 
		delta = 100-highest, 
		out = []; 

	for(var k in sample) 
		out.push(sample[k][1]+delta); 

	return out; 
}

function apply_curve_percent(sample) {
	if(sample.length <= 0) return []; 

	var highest = 100/getHighest(sample), 
		out = []; 

	for(var k in sample)
		out.push(Math.round(sample[k][1]*highest)); 

	return out; 
}

function apply_curve_bell(sample) {
	if(sample.length <= 0) return []; 

	var avg = getAverage(sample), 
		stddev = getStandardDeviation(sample), 
		bell_percentage = stddev/100, 
		out = [], 
		temp = 0; 

	for(var i in sample) {
		temp = sample[i][1]; 
		if(sample[i]>=90) {
			temp += sample[i][1]*(bell_percentage/8); 
		} else if(sample[i]>=80) {
			temp += sample[i][1]*(bell_percentage/2); 
		} else if(sample[i]>=60) {
			temp += sample[i][1]*bell_percentage; 
		} else if(sample[i]>=50) {
			temp += sample[i][1]*(bell_percentage/2); 
		} else {
			temp += sample[i][1]*(bell_percentage/8); 
		}

		out.push(Math.round(temp)); 
	}

	return out; 
}

function get_table_data() { 
	var users = $('input.stud'), 
		grades = $('input.grade'), 
		names = [], 
		sample = [],
		out = {}, 
		user = '', 
		j = 0; 

	for(var i=0; i<users.length; i++) {
		user = users[i].value; 
		if(!isValid(grades[i].value)) continue; 
		if(!isValid(user)) user = $(users[i]).attr('id'); 

		names.push(user); 
		sample.push([j,parseInt(grades[i].value)]); 
		j++; 
	}

	if(sample.length <= 0) return; 

	var curve_delta = apply_curve_delta(sample), 
		curve_perce = apply_curve_percent(sample), 
		curve_bell = apply_curve_bell(sample); 

	for(var i=0; i<names.length; i++) {
		user = names[i]; 

		out[user] = {}

		out[user]["name"] = user; 
		out[user]["grade"] = sample[i][1]; 
		out[user]["delta"] = curve_delta[i]; 
		out[user]["percent"] = curve_perce[i]; 
		out[user]["bell"] = curve_bell[i]; 
	}

	return out; 
}

function hide_modal() {
	$('curtain').fadeOut(); 
}

function show_modal() {
	$('curtain').fadeIn(); 
	draw_table($('modal'), get_table_data()); 
}

function draw_table(container, tdata) {
	var table = '<table width="100%" cellspacing="0">'; 

	table += '<tr><th>NAME</th>'; 
	table += '<th><span class="option" id="table_grade">GRADE</span></th>'; 
	table += '<th><span class="option" id="table_delta">DELTA</span></th>'; 
	table += '<th><span class="option" id="table_perce">PERCENT</span></th>'; 
	table += '<th><span class="option" id="table_bell">BELL</span></th></tr>'; 

	for(var k in tdata) {
		table += '<tr><td>'+tdata[k]["name"]+'</td>'; 
		table += '<td class="center'+((highlight_grade) ? ' selected' : '')+'">'+tdata[k]["grade"]+'</td>'; 
		table += '<td class="center'+((highlight_delta) ? ' selected' : '')+'">'+tdata[k]["delta"]+'</td>'; 
		table += '<td class="center'+((highlight_perce) ? ' selected' : '')+'">'+tdata[k]["percent"]+'</td>'; 
		table += '<td class="center'+((highlight_bell) ? ' selected' : '')+'">'+tdata[k]["bell"]+'</td></tr>'; 
	}

	table += '</table>'; 

	container.html(table); 
	check_table_options(); 
}