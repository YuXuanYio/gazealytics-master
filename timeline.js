let TimeLine;
let TIMELINE_CANVAS;
let TIMELINE_draggableRecty = 0;
let TIMELINE_draggingY = false; // Is the object being dragged?
let datname;
let canvasWidth;
let show_note_legend = false; let show_note_observer_legend = false; 

let timelinesketch = (p) => {
	//PFont  f; PFont  fb; // the font used for general text writing applications. defined in setup
	let f = {
		"fontName": "Arial",
		"fontSize": 18
	}; 

	let fb = {
		"fontName": "Arial",
		"fontSize": 18
	}; 

	p.mouseIsOver_timeline = false; 
	p.mouseIsPressed_timeline = false; 
	beginX = -1; 
	endX = -1;
	p.press_toi = 0;
	p.currentPressedX = -1;

	p.initConfig = (windowWidth, windowHeight) => {
		p.textFont(f.fontName);
		p.textSize(f.fontSize);
		timeline_height = timeline_canvas_height*0.8;
		timeline_highlight_position = timeline_canvas_height*0.82;
		timeline_text_position = timeline_canvas_height*0.9;	
		TIMELINE_draggableRecty = p.height-15;			
	};

	p.setup = () => {
		// put setup code here		
		timeline_canvas_height = p.windowHeight * (1-SPATIAL_CANVAS_HEIGHT_PERCENTAGE-0.04);		
		document.getElementById('pj2').style.height = Math.floor(timeline_canvas_height)+'px';
		TIMELINE_CANVAS = p.createCanvas(Math.floor(spatial_width), Math.floor(timeline_canvas_height));
		
		p.initConfig(p.windowWidth, p.windowHeight);
		
		TimeLine = p.createGraphics(spatial_width-300, Math.floor(timeline_height), p.P2D);
		
		p.colorMode(p.HSB, 100);
		TIMELINE = p;
		
		TIMELINE_CANVAS.mousePressed(() => {
			if (p.mouseY > 0 && p.mouseY < RESIZE_CONTROL_PADDING && p.mouseX > 0 && p.mouseX < p.width) {
				TIMELINE_draggingY = true;
				// If so, keep track of relative location of click to corner of rectangle
				p.offsetY = TIMELINE_draggableRecty-(timeline_canvas_height-p.mouseY);
			}
			p.mouseIsPressed_timeline = true; 
			beginX = p.mouseX; 
			currentPressedX = p.mouseX;
			if( selected_data != -1 ){
				data = DATASETS[selected_data];
				t = (beginX - 100)/(p.width-200) * (data.slid_vals[1] - data.slid_vals[0]) + data.slid_vals[0];
				min_id = -1; min_dist = 1;
				for(i=0; i<data.tois.length; i++){
					if(data.tois[i] != undefined && data.tois[i].included) {
						if( data.tois[i].range[0] < t && data.tois[i].range[1] > t && data.tois[i].range[1]-data.tois[i].range[0] < min_dist  ){
							min_id = i; min_dist = data.tois[i].range[1]-data.tois[i].range[0];
						}
					}						
				}
				if(min_id != data.toi_id){ press_toi = min_id; }
				else{ press_toi = -1; }				
			}	
		});

		TIMELINE_CANVAS.mouseOver(() => {
			p.mouseIsOver_timeline = true;			
		});

		TIMELINE_CANVAS.mouseOut(() => { p.mouseIsOver_timeline = false; });
	};
	
	p.mouseDragged = () => {
		// Adjust location if being dragged
		if(p.mouseIsPressed_timeline && TIMELINE_draggingY) {
			TIMELINE_draggableRecty = (timeline_height-p.mouseY) + p.offsetY;			
		}		
	}
	
	p.mouseReleased = () => {
		// Quit dragging; Resizing canvas
		if(TIMELINE_draggingY) {
			TIMELINE_draggingY = false;
			let timeline_canvas_height_new = TIMELINE_draggableRecty+15;
			SPATIAL_CANVAS_HEIGHT_PERCENTAGE = 1 - timeline_canvas_height_new / p.windowHeight - 0.1;

			SPATIAL.resizeElements(false, true);
			p.resizeElements(false, true);				
		}

		//exclude mouse release handling below outside the canvas
		if(p.mouseX < 0 || p.mouseY < 0 || p.mouseX > p.width || p.mouseY > p.height) return;

		p.mouseIsPressed_timeline = false; endX = p.mouseX; // press_toi = 0; currentPressedX = -1;
		if( beginX < 100 && endX < 100 && p.mouseY < timeline_highlight_position ){ // we clicked on the object list control part of the window
			if( TIME_DATA=="lens" && lenses.length > 0 ){
				k = Math.floor((p.mouseY*lenses.length)/timeline_highlight_position);
				selected_lens = k;
			}else if( (TIME_DATA=="data"||TIME_DATA=='all'||TIME_DATA=='group') && TIMELINE_CANVAS.num_of_rows > 0){
				k = Math.floor((p.mouseY*TIMELINE_CANVAS.num_of_rows)/timeline_highlight_position);
				select_data(k);
				// selected_data = k;
			}else{return;}
			background_changed = true; timeline_changed=true; matrix_changed = true; return;
		}
		if( selected_data == -1 ){ return; }
		data = DATASETS[selected_data];
		if( press_toi==-1 && Math.abs(Math.floor(endX)-Math.floor(beginX)) > 3 ){
			beginT = (beginX - 200)/(p.width-300) * (data.slid_vals[1] - data.slid_vals[0]) + data.slid_vals[0];
			endT = (endX - 200)/(p.width-300) * (data.slid_vals[1] - data.slid_vals[0]) + data.slid_vals[0];
			beginT = Math.max(0, Math.min(1, beginT)); endT = Math.max(0, Math.min(1, endT));
			if(endT < beginT){ [endT, beginT] = [beginT, endT]; }
			new_toi(selected_data, beginT, endT, '', '');
		}else if( data.tois.length > 1 && Math.abs(Math.floor(endX)-Math.floor(beginX)) < 3 ){
			t = (endX - 200)/(p.width-300) * (data.slid_vals[1] - data.slid_vals[0]) + data.slid_vals[0];
			min_id = 0; min_dist = 1;
			let twi_id = -1;
			for(i=0; i<data.tois.length; i++){
				if(data.tois[i] != undefined && data.tois[i].included) {
					if( data.tois[i].range[0] < t && data.tois[i].range[1] > t && data.tois[i].range[1]-data.tois[i].range[0] < min_dist  ){
						min_id = i; min_dist = data.tois[i].range[1]-data.tois[i].range[0];
						twi_id = data.tois[i].twi_id;
					}
				}				
			}
			if(min_id != 0 && twi_id > -1){
				if( mouseButton == p.LEFT ){ set_toi(selected_data, twi_id);}
				else if( mouseButton == p.RIGHT ){ delete_toi(selected_data, twi_id);}
			}
		}
	};

	p.draw = () => {
		// put drawing code here
		if( VALUED.length == 0 || order_twis.length == 0){ // initial message
			p.background(0,0,0);
			p.stroke(grey(100)); 
			p.noFill(); 
			p.strokeWeight(0);
			p.rect(0,0,p.width,p.height);
			p.fill(white(100));
			p.textFont(f); 
			p.textAlign( p.CENTER );
			p.text("Timeline Canvas, shows the chronological arrangement\nof the data", p.width/2, p.height/2);
			return;
		}

		p.textAlign( p.LEFT );
		// update dataset meta-information for the timeline
		// update longest duration variable, used by relative time option
		let longdur = 0;
		for(let v=0; v<VALUED.length; v++){
			let dat = DATASETS[VALUED[v]];

			longdur = Math.max(longdur, dat.tmax - dat.tmin);
		}
		longest_duration = longdur;
		
		TIMELINE.longest_duration = longest_duration; //assigning the value to global variable of longest_duration so that it can be accessed from all files
		
		try{
			p.background(black(100)); 
			p.textFont(f); 
			p.fill(white(100)); 
			p.stroke(white(100));

			if(timeline_changed){
				timeline_changed = false;
				TimeLine.colorMode(p.HSB, 100);
				TimeLine.background(black(100));
				if(TIME_DATA=='lens'){
					draw_time_lens(TimeLine);					
				}else if(TIME_DATA=='data'){
					draw_time_data(TimeLine);
				}else if(TIME_DATA=='all'|| TIME_DATA=='group'){
					draw_time_all(TimeLine);
				}else if(TIME_DATA=='saccades'){
					draw_time_saccades(TimeLine);
				}else if(TIME_DATA=='saccadetype'){
					draw_time_saccadetype(TimeLine);					
				}	
			}
			p.image(TimeLine, 200, 0);
			// Time Endvalue labels
			if(TIME_DATA=='lens'){
				let current_lense_mode = document.getElementsByClassName("lense_mode")[0].innerHTML;
				if( current_lense_mode.indexOf("Selected AOI Group")>-1){
					for(let l=0; l<ORDERLENSEGROUPIDARRAYINDEX.length && ORDERLENSEGROUPIDARRAYINDEX.length<100; l++){ 
						let s = "AOI G"+LENSEGROUPS[ORDERLENSEGROUPIDARRAYINDEX[l]].group;
						let d = timeline_height/ORDERLENSEGROUPIDARRAYINDEX.length;
						let h = timeline_height/ORDERLENSEGROUPIDARRAYINDEX.length*l;
						p.textFont('Arial',16);
						if(p.textAscent(s)<d){
							p.text( s, 90 - p.textWidth(s), h+p.textAscent()+(.1*d));							
							if( ORDERLENSEGROUPID.indexOf(selected_lensegroup) == l ){
								p.strokeWeight(1); 
								p.stroke( makeColor(80, SELECTED)); 
								p.fill( makeColor(2, SELECTED));
								p.rect( 2, h+2, 96, d-1);
								p.stroke( white(100) ); 
								p.fill( white(100) );
								p.strokeWeight(0);
							}
						}
					}
				}
				else {
					for(let l=0; l<lenses.length && lenses.length<100; l++){
						let s = lenses[l].name;
						// let h = (120*(l+0.5))/lenses.length;
						let d = timeline_height/lenses.length;
						let h = timeline_height/lenses.length*l;
						p.textFont('Arial',16);
						if(p.textAscent(s)<d){
							p.text( s, 90 - p.textWidth(s), h+p.textAscent()+(.1*d));
							if( order_lenses.indexOf(selected_lens) == l ){
								p.strokeWeight(1); 
								p.stroke( makeColor(80, SELECTED)); 
								p.fill( makeColor(2, SELECTED));
								p.rect( 2, h+2, 96, d-1);
								p.stroke( white(100) ); 
								p.fill( white(100) );
								p.strokeWeight(0);
							}
						}
					}
				}
				if(selected_data != -1){
					let data = DATASETS[selected_data];
					p.textFont('Arial',16);
					p.text( format_time(data.tmin/1000), 30, p.height-p.textAscent()); // draws start/end times
					p.text( format_time(data.tmax/1000), p.width-30 - p.textWidth(format_time(data.tmax/1000)), p.height-p.textAscent());
				}
			}else if(TIME_DATA=='data' || TIME_DATA=='all' || TIME_DATA=='group' || TIME_DATA=='saccades' || TIME_DATA=='saccadetype'){
				TIMELINE_CANVAS.num_of_rows = 0;
				let toi_longest_duration = 0;
				let k2 = VALUED.indexOf(selected_data);
				let k2_row_num = 0;
				let num_rows_of_selected_data = 0;
				let d = 0;
				let h = 0;
				let s = "";//data.name;

				for(let k=0; k<VALUED.length && VALUED.length < 100; k++){
					let data = DATASETS[VALUED[k]]; 

					if(data == undefined || !data.included)
						continue;
					if(DAT_MODE == 1 && data.group != selected_grp)
						continue;
					else if(DAT_MODE == 2 && VALUED[k] != selected_data)
						continue;

					for(let w=0; w<data.tois.length; w++){
						if(data.tois[w] != undefined && data.tois[w].included) {
							let twi_id = data.tois[w].twi_id;

							if(TWI_MODE == 2 && selected_twi != -1 && data.tois[w] != undefined && data.tois[w].included) {
								if(twi_id == selected_twi && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked) {
									TIMELINE_CANVAS.num_of_rows++;
								}
								if(k == k2)
									num_rows_of_selected_data++;
							}else if(TWI_MODE == 1 && selected_twigroup != -1){
								if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].group == selected_twigroup && base_twis[twi_id].included && base_twis[twi_id].checked ) {
									TIMELINE_CANVAS.num_of_rows++;
								}						
								if(k == k2)
									num_rows_of_selected_data++;
							}else if(TWI_MODE == 0){
								if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked ) {
									TIMELINE_CANVAS.num_of_rows++;
								}
								if(k == k2)
									num_rows_of_selected_data++;
							}
						}
					}

					if(TIMELINE_CANVAS.num_of_rows > 0) {
						d = timeline_height/TIMELINE_CANVAS.num_of_rows; 			
					}					
				}

				for(let k=0, row=0; k<VALUED.length && row<TIMELINE_CANVAS.num_of_rows; k++){
					let data = DATASETS[VALUED[k]]; 
					s = data.name;
					if(data == undefined || !data.included)
						continue;
					if(DAT_MODE == 1 && data.group != selected_grp)
						continue;
					else if(DAT_MODE == 2 && VALUED[k] != selected_data)
						continue;
		
					let twi_id = 0;	
					for(let w=0; w<data.tois.length && row<TIMELINE_CANVAS.num_of_rows; w++){
						let bFilteredIn = false;
						if(data.tois[w] != undefined && data.tois[w].included) {
							twi_id = data.tois[w].twi_id
							if(TWI_MODE == 2 && selected_twi != -1 && data.tois[w] != undefined && data.tois[w].included) {
								if(twi_id == selected_twi && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked) {
									bFilteredIn = true;
									
									if(k2_row_num == 0 && k2 == k)
										k2_row_num = row;
								}
							}else if(TWI_MODE == 1 && selected_twigroup != -1){
								if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].group == selected_twigroup && base_twis[twi_id].included && base_twis[twi_id].checked ) {
									bFilteredIn = true;
		
									if(k2_row_num == 0 && k2 == k)
										k2_row_num = row;
								}						
							}else if(TWI_MODE == 0){
								if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked ) {
									bFilteredIn = true;
		
									if(k2_row_num == 0 && k2 == k)
										k2_row_num = row;
								}
							}
						}
		
						if(bFilteredIn) {
							h = timeline_height/TIMELINE_CANVAS.num_of_rows*row;
							toi = data.tois[ w ];
							p.strokeWeight(0);
							p.textFont('Arial',16);
							if(p.textAscent(s)<d){
								p.text(s.substring(0,9), 4, h+p.textAscent()+(.1*d));
								// p.text(twi_id < 0 ? "" : base_twis[twi_id].name.substring(0,9), 104, h+p.textAscent()+(.1*d));
								if(p.textAscent(s)<d){p.text( format_time(data.tois[w].tmin/1000), 104, h+p.textAscent()+(.1*d));}
								
								if( VALUED.indexOf(selected_data) == k && TOGGLE_GREEN_BOX_HIGHLIGHTS){
									//green box
									p.strokeWeight(1); 
									p.stroke( makeColor(80, SELECTED)); 
									p.fill( makeColor(2, SELECTED));
									p.rect( 2, h+2, 96, d-1);
									p.stroke( white(100) ); 
									p.fill( white(100) );
								}
							}
							p.strokeWeight(0);
							if(p.textAscent(s)*2<d){p.text( format_time(data.tois[w].tmin/1000), 90-p.textWidth( format_time(data.tois[w].tmin/1000) ), h+d-(.1*d) );}
							if(p.textAscent(s)<d){p.text( format_time(data.tois[w].tmax/1000), p.width-90, h+d-(.1*d) );}
							row++;
						}	
					}
				}				
			}
			// selected toi real-time drag
			if( selected_data != -1 && p.mouseIsPressed_timeline && press_toi != -1 && currentPressedX != -1 && p.mouseX != currentPressedX ){
				let data = DATASETS[selected_data];
				let dt = (p.mouseX - p.currentPressedX)/(p.width-200); 
				p.currentPressedX = p.mouseX;
				data.tois[ press_toi ].range[0] += dt; data.tois[ press_toi ].range[1] += dt; 
			}
			// selected data TOIs
			if(selected_data != -1 && DATASETS[selected_data] != undefined){
				data = DATASETS[selected_data];		
				let number_of_active_tois = 0;
				data.tois.forEach((toi)=>{if(toi != undefined && toi.included)number_of_active_tois++;});

				for(let i=1; i < data.tois.length; i++){
					if(data.tois[i] != undefined && data.tois[i].included) {
						gmin = Math.max(0, Math.min( 1, (data.tois[i].range[0] - data.slid_vals[0])/(data.slid_vals[1] - data.slid_vals[0]) ));
						gmax = Math.max(0, Math.min( 1, (data.tois[i].range[1] - data.slid_vals[0])/(data.slid_vals[1] - data.slid_vals[0]) ));

						p.noStroke(); 
						if( i%2==0 ){ 
							p.fill( dark(100) ); 
						}
						else{ 
							p.fill( grey(100) ); 
						}
						if( HasVal && MATRIX_VIEW_STATE.indexOf('toi') != -1 ){ // check if theres a matrix mouseover to be interested in instead
							if( mat_col_val == 'toi' && xval == i && mat_row_val == 'toi' && yval == i ){ 
								p.fill( cy(100, data.group) ); 
							}
							else if( (mat_row_val == 'toi' && yval == i) ){ p.fill( makeColor(100, MATCOL[2]) ); }
							else if( (mat_col_val == 'toi' && xval == i) ){ p.fill( makeColor(100, MATCOL[1]) ); }
						}
						y =  timeline_highlight_position + (30*i)/(number_of_active_tois+2);
						
						dy = 30/(number_of_active_tois+2);
						if(gmax > gmin){
							p.rect(200 + (p.width-300)*gmin, y, (p.width-300)*(gmax-gmin), dy);
						}
					}
				}
				if( p.mouseIsPressed_timeline && press_toi == -1 ){					
					y = p.mouseY;
					dy = 30;
					p.noStroke(); 
					p.fill( makeColor(100, SELECTED) );
					p.rect( Math.min(p.width-200, Math.max(200, beginX)), y, Math.min(p.width-200, Math.max(200, p.mouseX)) - Math.min(p.width-200, Math.max(200, beginX)), dy);
				}
			}
			p.fill(white(100)); 
			p.stroke(white(100));
			// matrix mouseover
			if(HasVal){ 
				do_matrix_timeline_overlay(p); 
			}
			if(videoCurrentTimeChanged && VIDEO_LINKING){
				videoCurrentTimeChanged = false;
				draw_video_timeline_cursor(p);
			}
			else if(!VIDEO_IN_PLAY && VIDEO_LINKING) {
				draw_video_timeline_cursor(p);
			}			
			
			// mouseover time cursor
			if (p.mouseIsOver_timeline && p.mouseY > 0 && p.mouseY < RESIZE_CONTROL_PADDING && p.mouseX > 0 && p.mouseX < p.width) {
				document.getElementById("pj2").style.cursor = 'ns-resize';
			}								
			else {
				document.getElementById("pj2").style.cursor = 'default';
			}

			// mouseover time value
			TIMELINE_MOUSE = ( p.mouseIsOver_timeline && p.mouseX >= 200 && p.mouseX <= p.width-100 );
			if(TIMELINE_MOUSE && (selected_data != -1 || ((TIME_DATA=='data'||TIME_DATA=='all'||TIME_DATA=='group') && VALUED.length>0)) &&p.mouseY<TimeLine.height&&p.mouseY>4){
				let datname='';
				let toiname='';
				let row = 0;
				let k=0;				
				if( selected_data != -1 ){
					data = DATASETS[selected_data];
				}
				if( TIME_DATA=='data'||TIME_DATA=='all'||TIME_DATA=='group'){
					
					v = Math.floor( p.mouseY * TIMELINE_CANVAS.num_of_rows / timeline_highlight_position );
					if(v >= TIMELINE_CANVAS.num_of_rows)
						return;
					let w = -1;
					//get the sample and twi row number where mouse is over until it hits v
					for(k=0, row=0; k<VALUED.length && row<TIMELINE_CANVAS.num_of_rows && row <= v; k++){
						data = DATASETS[VALUED[k]]; 
						datname = data.name;
						
						if(data == undefined || !data.included) {
							continue;
						}							
						if(DAT_MODE == 1 && data.group != selected_grp) {
							continue;
						}							
						else if(DAT_MODE == 2 && VALUED[k] != selected_data) {
							continue;
						}							
			
						for(w=0; w<data.tois.length && row<TIMELINE_CANVAS.num_of_rows && row <= v; w++){
							if(data.tois[w] != undefined && data.tois[w].included) {
								let twi_id = data.tois[w].twi_id;
								toiname = base_twis[twi_id].name;
								if(TWI_MODE == 2 && selected_twi != -1 && data.tois[w] != undefined && data.tois[w].included) {
									if(twi_id == selected_twi && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked) {
										if(row > v) {
											break;
										}
										row++;
									}
									
								}else if(TWI_MODE == 1 && selected_twigroup != -1){
									if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].group == selected_twigroup && base_twis[twi_id].included && base_twis[twi_id].checked ) {
										if(row > v) {
											break;
										}
										row++;
									}						
									
								}else if(TWI_MODE == 0){
									if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked ) {
										if(row > v) {
											break;
										}
										row++;
									}									
								}
							}							
						}
						if(row > v) {
							break;
						}	
					}

				}else{
					l = Math.floor( p.mouseY * lenses.length / timeline_highlight_position );
					datname = lenses[l].name;
				}
				t = (p.mouseX - 200)/(p.width-300) * (data.tmax - data.tmin) + data.tmin;
				if(USE_RELATIVE){ t = (p.mouseX - 200)/(p.width-300) * longest_duration + data.tmin; }
				if( TIME_DATA=='data'||TIME_DATA=='all'||TIME_DATA=='group')
					tstr = format_time(t/1000) + '   (' + datname+' - '+toiname+')';
				else 
					tstr = format_time(t/1000) + '   (' + datname+')';
				if(p.mouseIsPressed_timeline){
					p.textFont(fb);
				}
				else{
					p.textFont(f);
				}
				p.strokeWeight(0); 
				p.textFont('Arial',16);
				p.text( tstr, p.mouseX - p.textWidth(tstr)/2, timeline_text_position );
				p.strokeWeight(3); 
				p.stroke( cy(90, data.group) );
				tl = Math.max(0, (p.mouseX - 200)/(p.width-300) - 0 );
				tr = Math.min(1, (p.mouseX - 200)/(p.width-300) + (TIMELINE_MOUSEOVER_WINDOW*1000)/(data.tmax-data.tmin) );
				p.line( 200 + (spatial_width-300)*tl, timeline_highlight_position, 100 + (spatial_width-200)*tr, timeline_highlight_position);
				p.strokeWeight(0); 
			}
			if(SPATIAL.mouseIsOver_spatial) { 
				p.do_spatial_overlay(); 
			 }
		}catch (error) { console.error(error); timeline_changed = true; }
	};

	// tested
	p.do_spatial_overlay = () => {
		if( selected_data == -1 || DATASETS[ selected_data ] == undefined){ return; }
		let dat = DATASETS[ selected_data ]; fixs = dat.fixs; toi = dat.tois[ dat.toi_id ];
		p.fill(cy(80, dat.group)); 
		p.noStroke();
		if(dat.toi_id == -1) return;
		for(let i= toi.j_min; i< toi.j_max; i++){			
			if(fixs[i] != undefined) {
				let dist = (fixs[i].x*(spatial_width/WIDTH) - SPATIAL.mouseX)**2 + (fixs[i].y*(spatial_height/HEIGHT) - SPATIAL.mouseY)**2;
				let size = Math.exp(FIX_SIZE) * Math.sqrt(fixs[i].dt);
				if( dist < (size/2)**2 ){
					if(fixs[i].t - dat.tmin < 0)
						ts = 0;
					else
						ts = (spatial_width-200)*(fixs[i].t - dat.tmin)/(dat.tmax-dat.tmin);
					td = ( (spatial_width-200)*fixs[i].dt )/(dat.tmax-dat.tmin);
					if(USE_RELATIVE){
						if(fixs[i].t - dat.tmin < 0)
							ts = 0;
						else
							ts = (spatial_width-200)*(fixs[i].t - dat.tmin)/longest_duration;
						td = ( (spatial_width-200)*fixs[i].dt )/longest_duration;
					}
					if( ts > 0 && ts+td < spatial_width-200 ){
						if(td > 1){
							p.noStroke(); 
							p.rect( 100 + ts, timeline_highlight_position, td, 10 );
						}else{
							p.stroke(cy(80, dat.group)); 
							p.line(100 + ts, timeline_highlight_position, 100+ts, timeline_highlight_position+10);							
						}
					}
				}
			}			
		}
	};

	p.resizeElements = (width_changed, height_changed) => {
		timeline_canvas_height = p.windowHeight * (1-SPATIAL_CANVAS_HEIGHT_PERCENTAGE-0.01);

		p.resizeCanvas(Math.floor(spatial_width), Math.floor(timeline_canvas_height));		
		p.initConfig(p.windowWidth, p.windowHeight);

		TimeLine = p.createGraphics(spatial_width-300, Math.floor(timeline_height), p.P2D);
		timeline_changed = true;
	};

	p.windowResized = () => {
		p.resizeElements(true, true);
	};
}

let draw_time_lens = (canvas) => {
	canvas.fill(black(100)); canvas.noStroke();
	canvas.rect(0, 0, canvas.width, canvas.height);
	let data = DATASETS[selected_data]; toi = data.tois[ data.toi_id ];
	if(!data.checked || !data.included || data.toi_id == -1) {
		canvas.background(0,0,0);
		canvas.stroke(grey(100)); 
		canvas.noFill(); 
		canvas.strokeWeight(0);
		canvas.rect(0,0,canvas.width,canvas.height);
		canvas.fill(white(100));
		canvas.textFont("Arial"); 
		canvas.textSize(18);
		canvas.textAlign( canvas.CENTER );
		canvas.text("There is no TWI of the selected sample. Please select\n a valid sample under 'Samples' and TWI under 'TWIs'.", canvas.width/2, canvas.height/2);
		return;
	}
	longest_duration = data.tmax - data.tmin;
	
	canvas.strokeWeight(1); canvas.stroke(white(100)); canvas.fill(white(100));
	if(lenses.length == 0){
		for(let j = toi.j_min; j < toi.j_max && (data.fixs[j].t - data.tmin)/longest_duration < TIME_ANIMATE; j++){
			let ts = 0;
			if(data.fixs[j].t > data.tmin)
				ts = (canvas.width*(data.fixs[j].t - data.tmin))/longest_duration;
			let td = (canvas.width*data.fixs[j].dt)/longest_duration;
			if(td > 1){
				canvas.fill(white(100)); canvas.noStroke();
				canvas.rect(ts, 0, td, canvas.height);
			}else{
				canvas.stroke(white(100)); canvas.noFill();
				canvas.line(ts, 0, ts, canvas.height);
			}
		}
	}else{
		let current_lense_mode = document.getElementsByClassName("lense_mode")[0].innerHTML;
		if( current_lense_mode.indexOf("Selected AOI Group")>-1){
			// green line
			canvas.strokeWeight(1); 
			canvas.stroke( makeColor(80, SELECTED)); canvas.fill( makeColor(2, SELECTED));
			let k = ORDERLENSEGROUPID.indexOf(selected_lensegroup);
			if(k != -1){
				let h2 = canvas.height/ORDERLENSEGROUPID.length; let h2top = h2*k;
				canvas.rect(1, h2top+1, canvas.width-2, h2-2);
			}
			// draw grey back
			for(let j = toi.j_min; j < toi.j_max && (data.fixs[j].t - data.tmin)/longest_duration < TIME_ANIMATE; j++){
				let ts = 0;
				if(data.fixs[j].t > data.tmin)
					ts = (canvas.width*(data.fixs[j].t - data.tmin))/longest_duration;
				let td = (canvas.width*data.fixs[j].dt)/longest_duration;
				if(td > 1){
					canvas.fill(grey(100)); canvas.noStroke();
					canvas.rect(ts, 0, td, canvas.height);
				}else{
					canvas.stroke(grey(100)); canvas.noFill();
					canvas.line(ts, 0, ts, canvas.height);
				}
			}
			// draw white for each lense grouop
			for(let k=0; k<ORDERLENSEGROUPID.length; k++){
				let h2 = canvas.height/ORDERLENSEGROUPID.length; let h2top = h2*k;
				for(let j = toi.j_min; j < toi.j_max && (data.fixs[j].t - data.tmin)/longest_duration < TIME_ANIMATE; j++){
					//iterate through lenses within the lense group
					for(let jlens = 0; jlens < lenses.length; jlens++) {
						if(ORDERLENSEGROUPID[k] == lenses[jlens].group) {
							if(lenses[jlens].inside(data.fixs[j].x, data.fixs[j].y)){
								let ts = 0;
								if(data.fixs[j].t > data.tmin)
									ts = (canvas.width*(data.fixs[j].t - data.tmin))/longest_duration;
								let td = (canvas.width*data.fixs[j].dt)/longest_duration;
								if(td > 1){
									canvas.fill(white(100)); canvas.noStroke();
									canvas.rect(ts, h2top, td, h2);
								}else{
									canvas.stroke(white(100)); canvas.noFill();
									canvas.line(ts, h2top, ts, h2top+h2);
								}
							}
						}
					}
				}
			}
			// green line
			canvas.strokeWeight(1); 
			canvas.stroke( makeColor(80, SELECTED)); canvas.fill( makeColor(2, SELECTED));
			k = ORDERLENSEGROUPID.indexOf(selected_lensegroup);
			if(k != -1){
				let h2 = canvas.height/ORDERLENSEGROUPID.length; let h2top = h2*k;
				canvas.rect(1, h2top+1, canvas.width-2, h2-2);
			}
		}
		else {
			// green line
			canvas.strokeWeight(1); 
			canvas.stroke( makeColor(80, SELECTED)); canvas.fill( makeColor(2, SELECTED));
			let k = order_lenses.indexOf(selected_lens);
			if(k != -1){
				let h2 = canvas.height/lenses.length; let h2top = h2*k;
				canvas.rect(1, h2top+1, canvas.width-2, h2-2);
			}
			// draw grey back
			for(let j = toi.j_min; j < toi.j_max && (data.fixs[j].t - data.tmin)/longest_duration < TIME_ANIMATE; j++){
				let ts = 0;
				if(data.fixs[j].t > data.tmin)
					ts = (canvas.width*(data.fixs[j].t - data.tmin))/longest_duration;
				let td = (canvas.width*data.fixs[j].dt)/longest_duration;
				if(td > 1){
					canvas.fill(grey(100)); canvas.noStroke();
					canvas.rect(ts, 0, td, canvas.height);
				}else{
					canvas.stroke(grey(100)); canvas.noFill();
					canvas.line(ts, 0, ts, canvas.height);
				}
			}
			// draw white for each lens
			for(let k=0; k<lenses.length; k++){
				let h2 = canvas.height/lenses.length; let h2top = h2*k;
				for(let j = toi.j_min; j < toi.j_max && (data.fixs[j].t - data.tmin)/longest_duration < TIME_ANIMATE; j++){
					if(lenses[k].inside(data.fixs[j].x, data.fixs[j].y)){
						let ts = 0;
						if(data.fixs[j].t > data.tmin)
							ts = (canvas.width*(data.fixs[j].t - data.tmin))/longest_duration;
						let td = (canvas.width*data.fixs[j].dt)/longest_duration;
						if(td > 1){
							canvas.fill(white(100)); canvas.noStroke();
							canvas.rect(ts, h2top, td, h2);
						}else{
							canvas.stroke(white(100)); canvas.noFill();
							canvas.line(ts, h2top, ts, h2top+h2);
						}
					}
				}
			}
			// green line
			canvas.strokeWeight(1); 
			canvas.stroke( makeColor(80, SELECTED)); canvas.fill( makeColor(2, SELECTED));
			k = order_lenses.indexOf(selected_lens);
			if(k != -1){
				let h2 = canvas.height/lenses.length; let h2top = h2*k;
				canvas.rect(1, h2top+1, canvas.width-2, h2-2);
			}
		}		
	}
};

let draw_time_data = (canvas) => {
	canvas.fill(black(100)); canvas.noStroke(); canvas.rect(0, 0, canvas.width, canvas.height); canvas.strokeWeight(1);
	let l = undefined; if(selected_lens !=-1){ l = base_lenses[selected_lens]; }
	
	if(VALUED.length == 0){
	}else{
		//if selected is TWI group, only show TWIs matching the TWI group
		//calculate total number of rows
		TIMELINE_CANVAS.num_of_rows = 0;
		let h2 = 0;
		let h2top = 0;
		let toi_longest_duration = 0;
		let k2 = VALUED.indexOf(selected_data);
		let k2_row_num = 0;
		let num_rows_of_selected_data = 0;

		for(let k=0; k<VALUED.length; k++){
			let data = DATASETS[VALUED[k]]; 

			if(data == undefined || !data.included)
				continue;
			if(DAT_MODE == 1 && data.group != selected_grp)
				continue;
			else if(DAT_MODE == 2 && VALUED[k] != selected_data)
				continue;

			for(let w=0; w<data.tois.length; w++){
				if(data.tois[w] != undefined && data.tois[w].included) {
					let twi_id = data.tois[w].twi_id;

					if(TWI_MODE == 2 && selected_twi != -1 && data.tois[w] != undefined && data.tois[w].included) {
						if(twi_id == selected_twi && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked) {
							toi_longest_duration = Math.max(toi_longest_duration, data.tois[w].tmax - data.tois[w].tmin);
							TIMELINE_CANVAS.num_of_rows++;
						}
						if(k == k2)
							num_rows_of_selected_data++;
					}else if(TWI_MODE == 1 && selected_twigroup != -1){
						if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].group == selected_twigroup && base_twis[twi_id].included && base_twis[twi_id].checked ) {
							toi_longest_duration = Math.max(toi_longest_duration, data.tois[w].tmax - data.tois[w].tmin);
							TIMELINE_CANVAS.num_of_rows++;
						}						
						if(k == k2)
							num_rows_of_selected_data++;
					}else if(TWI_MODE == 0){
						if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked ) {
							toi_longest_duration = Math.max(toi_longest_duration, data.tois[w].tmax - data.tois[w].tmin);
							TIMELINE_CANVAS.num_of_rows++;
						}
						if(k == k2)
							num_rows_of_selected_data++;
					}
				}
			}
		}
			
		if(TIMELINE_CANVAS.num_of_rows > 0) {
			h2 = canvas.height/TIMELINE_CANVAS.num_of_rows; 			

			for(let k=0, row=0; k<VALUED.length && row<TIMELINE_CANVAS.num_of_rows; k++){
				let data = DATASETS[VALUED[k]]; 
	
				if(data == undefined || !data.included)
					continue;
				if(DAT_MODE == 1 && data.group != selected_grp)
					continue;
				else if(DAT_MODE == 2 && VALUED[k] != selected_data)
					continue;
	
				for(let w=0; w<data.tois.length && row<TIMELINE_CANVAS.num_of_rows; w++){
					let bFilteredIn = false;
					if(data.tois[w] != undefined && data.tois[w].included) {
						let twi_id = data.tois[w].twi_id;					
						if(TWI_MODE == 2 && selected_twi != -1 && data.tois[w] != undefined && data.tois[w].included) {
							if(twi_id == selected_twi && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked) {
								bFilteredIn = true;
								
								if(k2_row_num == 0 && k2 == k)
									k2_row_num = row;
							}
						}else if(TWI_MODE == 1 && selected_twigroup != -1){
							if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].group == selected_twigroup && base_twis[twi_id].included && base_twis[twi_id].checked ) {
								bFilteredIn = true;
	
								if(k2_row_num == 0 && k2 == k)
									k2_row_num = row;
							}						
						}else if(TWI_MODE == 0){
							if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked ) {
								bFilteredIn = true;
	
								if(k2_row_num == 0 && k2 == k)
									k2_row_num = row;
							}
						}
					}
	
					if(bFilteredIn) {
						h2top = h2*row;		
						toi = data.tois[ w ];
						
						//find out tmax and tmin of TWIs of this sample
						if( !USE_RELATIVE ){ toi_longest_duration = (toi.tmax-toi.tmin); }
						// grey
						for(let j = toi.j_min;j < toi.j_max && (data.fixs[j].t - toi.tmin)/toi_longest_duration < TIME_ANIMATE; j++){
							if( l == undefined || !l.inside(data.fixs[j].x, data.fixs[j].y) ){
								let ts = 0;
								if(data.fixs[j].t > toi.tmin)
									ts = (canvas.width*(data.fixs[j].t - toi.tmin))/toi_longest_duration;
								let td = (canvas.width*data.fixs[j].dt)/toi_longest_duration;
								if(td > 1){
									canvas.fill(grey(100)); canvas.noStroke();
									canvas.rect(ts, h2top, td, h2);
								}else{
									canvas.stroke(grey(100)); canvas.noFill();
									canvas.line(ts, h2top, ts, h2top+h2);
								}
							}
						}

						// white
						if( l != undefined ){
							for(let j = toi.j_min;j < toi.j_max && (data.fixs[j].t - toi.tmin)/toi_longest_duration < TIME_ANIMATE; j++){
								if(l.inside(data.fixs[j].x, data.fixs[j].y) ){
									let ts = 0;
									if(data.fixs[j].t > toi.tmin)
										ts = (canvas.width*(data.fixs[j].t - toi.tmin))/toi_longest_duration;
									let td = (canvas.width*data.fixs[j].dt)/toi_longest_duration;
									if(td > 1){
										canvas.fill(white(100)); canvas.noStroke();
										canvas.rect(ts, h2top, td, h2);
									}else{
										canvas.stroke(white(100)); canvas.noFill();
										canvas.line(ts, h2top, ts, h2top+h2);
									}
								}
							}
						}
						row++;
						// }
					}	
				}
			}
		}	
		else {
			canvas.background(0,0,0);
			canvas.stroke(grey(100)); 
			canvas.noFill(); 
			canvas.strokeWeight(0);
			canvas.rect(0,0,canvas.width,canvas.height);
			canvas.fill(white(100));
			canvas.textFont("Arial"); 
			canvas.textSize(18);
			canvas.textAlign( canvas.CENTER );
			canvas.text("There is no TWI of the selected sample. Please select\n a valid sample under 'Samples' and TWI under 'TWIs'.", canvas.width/2, canvas.height/2);
			return;
		}		
	}
};

let draw_time_all = (canvas) => {
	canvas.fill(black(100)); canvas.noStroke(); canvas.rect(0, 0, canvas.width, canvas.height); canvas.strokeWeight(1);
	let l = undefined; if(selected_lens !=-1){ l = base_lenses[selected_lens]; }
	
	if(VALUED.length == 0){
	}else{
		//if selected is TWI group, only show TWIs matching the TWI group
		//calculate total number of rows
		TIMELINE_CANVAS.num_of_rows = 0;
		let h2 = 0;
		let h2top = 0;
		let toi_longest_duration = 0;
		let k2 = VALUED.indexOf(selected_data);
		let k2_row_num = 0;
		let num_rows_of_selected_data = 0;

		for(let k=0; k<VALUED.length; k++){
			let data = DATASETS[VALUED[k]]; 

			if(data == undefined || !data.included)
				continue;
			if(DAT_MODE == 1 && data.group != selected_grp)
				continue;
			else if(DAT_MODE == 2 && VALUED[k] != selected_data)
				continue;

			for(let w=0; w<data.tois.length; w++){
				if(data.tois[w] != undefined && data.tois[w].included) {
					let twi_id = data.tois[w].twi_id;

					if(TWI_MODE == 2 && selected_twi != -1 && data.tois[w] != undefined && data.tois[w].included) {
						if(twi_id == selected_twi && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked) {
							toi_longest_duration = Math.max(toi_longest_duration, data.tois[w].tmax - data.tois[w].tmin);
							TIMELINE_CANVAS.num_of_rows++;
						}
						if(k == k2)
							num_rows_of_selected_data++;
					}else if(TWI_MODE == 1 && selected_twigroup != -1){
						if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].group == selected_twigroup && base_twis[twi_id].included && base_twis[twi_id].checked ) {
							toi_longest_duration = Math.max(toi_longest_duration, data.tois[w].tmax - data.tois[w].tmin);
							TIMELINE_CANVAS.num_of_rows++;
						}						
						if(k == k2)
							num_rows_of_selected_data++;
					}else if(TWI_MODE == 0){
						if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked ) {
							toi_longest_duration = Math.max(toi_longest_duration, data.tois[w].tmax - data.tois[w].tmin);
							TIMELINE_CANVAS.num_of_rows++;
						}
						if(k == k2)
							num_rows_of_selected_data++;
					}
				}
			}
		}
		
		if(TIMELINE_CANVAS.num_of_rows > 0) {
			h2 = canvas.height/TIMELINE_CANVAS.num_of_rows;
			
			for(let k=0, row=0; k<VALUED.length && row<TIMELINE_CANVAS.num_of_rows; k++){
				let data = DATASETS[VALUED[k]]; // data.name == PID
				
				if(data == undefined || !data.included)
					continue;
				if(DAT_MODE == 1 && data.group != selected_grp)
					continue;
				else if(DAT_MODE == 2 && VALUED[k] != selected_data)
					continue;
	
				for(let w=0; w<data.tois.length && row<TIMELINE_CANVAS.num_of_rows; w++){
					let bFilteredIn = false;
					if(data.tois[w] != undefined && data.tois[w].included) {
						let twi_id = data.tois[w].twi_id;					
						if(TWI_MODE == 2 && selected_twi != -1 && data.tois[w] != undefined && data.tois[w].included) {
							if(twi_id == selected_twi && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked) {
								bFilteredIn = true;
								
								if(k2_row_num == 0 && k2 == k)
									k2_row_num = row;
							}
						}else if(TWI_MODE == 1 && selected_twigroup != -1){
							if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].group == selected_twigroup && base_twis[twi_id].included && base_twis[twi_id].checked ) {
								bFilteredIn = true;
	
								if(k2_row_num == 0 && k2 == k)
									k2_row_num = row;
							}						
						}else if(TWI_MODE == 0){
							if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked ) {
								bFilteredIn = true;
	
								if(k2_row_num == 0 && k2 == k)
									k2_row_num = row;
							}
						}
					}
	
					if(bFilteredIn) {
						h2top = h2*row;		
						toi = data.tois[ w ];
						
						//find out tmax and tmin of TWIs of this sample
						if( !USE_RELATIVE ){ toi_longest_duration = (toi.tmax-toi.tmin); }
						// grey backing layer
						if(data.fixs.length == 0){
							continue;					
						}

						if (data.notes) {
							addBookmarkButton(data, h2top, h2, canvas, toi);
						}
					
						for(let j = toi.j_min; j < toi.j_max; j++){
							if(data.fixs[j] != undefined && (data.fixs[j].t - toi.tmin)/toi_longest_duration < TIME_ANIMATE) {
								
								let ts = 0;
								if(data.fixs[j].t > toi.tmin)
									ts = (canvas.width*(data.fixs[j].t - toi.tmin))/toi_longest_duration;
								let td = (canvas.width*data.fixs[j].dt)/toi_longest_duration;
								if(td > 1){
									canvas.fill(grey(100)); canvas.noStroke(); //canvas.stroke(white(100));
									canvas.rect(ts, h2top, td, h2);
								}else{
									canvas.stroke(grey(100)); canvas.noFill(); //canvas.stroke(white(100));
									canvas.line(ts, h2top, ts, h2top+h2);
								}
							}					
						}
						
						// colours
						for(let j = toi.j_min; j < toi.j_max; j++){
							if(data.fixs[j] != undefined && (data.fixs[j].t - toi.tmin)/toi_longest_duration < TIME_ANIMATE){
								let fl = data.fixs[j].firstlens;
								if(fl<lenses.length ){
									let ts = 0;
									if(data.fixs[j].t > toi.tmin)
										ts = (canvas.width*(data.fixs[j].t - toi.tmin))/toi_longest_duration;
									let td = (canvas.width*data.fixs[j].dt)/toi_longest_duration;
									if(td > 1){
										canvas.fill(lenses[fl].col(60)); canvas.noStroke();
										canvas.rect(ts, h2top, td, h2);
									}else{
										canvas.stroke(lenses[fl].col(60)); canvas.noFill();
										canvas.line(ts, h2top, ts, h2top+h2);
									}
								}
							}					
						}
						row++;
						// }
					}	
				}
			}
		}
		else {
			canvas.background(0,0,0);
			canvas.stroke(grey(100)); 
			canvas.noFill(); 
			canvas.strokeWeight(0);
			canvas.rect(0,0,canvas.width,canvas.height);
			canvas.fill(white(100));
			canvas.textFont("Arial"); 
			canvas.textSize(18);
			canvas.textAlign( canvas.CENTER );
			canvas.text("There is no TWI of the selected sample. Please select\n a valid sample under 'Samples' and TWI under 'TWIs'.", canvas.width/2, canvas.height/2);
			return;
		}
	}
};

let draw_time_saccadetype = (canvas) => {
	canvas.fill(black(100)); canvas.noStroke(); canvas.rect(0, 0, canvas.width, canvas.height); canvas.strokeWeight(1);
	let l = undefined; if(selected_lens !=-1){ l = base_lenses[selected_lens]; }
	console.log(" @@draw_time_saccadetype");
	if(VALUED.length == 0){
	}else{
		//if selected is TWI group, only show TWIs matching the TWI group
		//calculate total number of rows
		TIMELINE_CANVAS.num_of_rows = 0;
		let h2 = 0;
		let h2top = 0;
		let toi_longest_duration = 0;
		let k2 = VALUED.indexOf(selected_data);
		let k2_row_num = 0;
		let num_rows_of_selected_data = 0;

		for(let k=0; k<VALUED.length; k++){
			let data = DATASETS[VALUED[k]]; 

			if(data == undefined || !data.included)
				continue;
			if(DAT_MODE == 1 && data.group != selected_grp)
				continue;
			else if(DAT_MODE == 2 && VALUED[k] != selected_data)
				continue;

			for(let w=0; w<data.tois.length; w++){
				if(data.tois[w] != undefined && data.tois[w].included) {
					let twi_id = data.tois[w].twi_id;

					if(TWI_MODE == 2 && selected_twi != -1 && data.tois[w] != undefined && data.tois[w].included) {
						if(twi_id == selected_twi && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked) {
							toi_longest_duration = Math.max(toi_longest_duration, data.tois[w].tmax - data.tois[w].tmin);
							TIMELINE_CANVAS.num_of_rows++;
						}
						if(k == k2)
							num_rows_of_selected_data++;
					}else if(TWI_MODE == 1 && selected_twigroup != -1){
						if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].group == selected_twigroup && base_twis[twi_id].included && base_twis[twi_id].checked ) {
							toi_longest_duration = Math.max(toi_longest_duration, data.tois[w].tmax - data.tois[w].tmin);
							TIMELINE_CANVAS.num_of_rows++;
						}						
						if(k == k2)
							num_rows_of_selected_data++;
					}else if(TWI_MODE == 0){
						// console.log("sample "+VALUED[k]+", VALUED.length: "+VALUED.length+", data.tois["+w+"].included: "+data.tois[w].included+", twi_id: "+twi_id);
						if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked ) {
							toi_longest_duration = Math.max(toi_longest_duration, data.tois[w].tmax - data.tois[w].tmin);
							TIMELINE_CANVAS.num_of_rows++;
						}
						if(k == k2)
							num_rows_of_selected_data++;
					}
				}
			}
		}
		
		if(TIMELINE_CANVAS.num_of_rows > 0) {
			h2 = canvas.height/TIMELINE_CANVAS.num_of_rows; 			

			for(let k=0, row=0; k<VALUED.length && row<TIMELINE_CANVAS.num_of_rows; k++){
				let data = DATASETS[VALUED[k]]; 
	
				if(data == undefined || !data.included)
					continue;
				if(DAT_MODE == 1 && data.group != selected_grp)
					continue;
				else if(DAT_MODE == 2 && VALUED[k] != selected_data)
					continue;
	
				for(let w=0; w<data.tois.length && row<TIMELINE_CANVAS.num_of_rows; w++){
					let bFilteredIn = false;
					if(data.tois[w] != undefined && data.tois[w].included) {
						let twi_id = data.tois[w].twi_id;					
						if(TWI_MODE == 2 && selected_twi != -1 && data.tois[w] != undefined && data.tois[w].included) {
							if(twi_id == selected_twi && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked) {
								bFilteredIn = true;
								
								if(k2_row_num == 0 && k2 == k)
									k2_row_num = row;
							}
						}else if(TWI_MODE == 1 && selected_twigroup != -1){
							if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].group == selected_twigroup && base_twis[twi_id].included && base_twis[twi_id].checked ) {
								bFilteredIn = true;
	
								if(k2_row_num == 0 && k2 == k)
									k2_row_num = row;
							}						
						}else if(TWI_MODE == 0){
							if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked ) {
								bFilteredIn = true;
	
								if(k2_row_num == 0 && k2 == k)
									k2_row_num = row;
							}
						}
					}
					if(bFilteredIn) {
						h2top = h2*row;		
						toi = data.tois[ w ];
						// if(VALUED[k]>=0 && v<DATASETS.length && DATASETS[VALUED[k]].initialised  && DATASETS[VALUED[k]].checked){
						
						//find out tmax and tmin of TWIs of this sample
						if( !USE_RELATIVE ){ toi_longest_duration = (toi.tmax-toi.tmin); }
						// grey backing layer
						if(data.fixs.length == 0){
							continue;					
						}
						for(let j = toi.j_min; j < toi.j_max; j++){
							if(data.fixs[j] != undefined && (data.fixs[j].t - toi.tmin)/toi_longest_duration < TIME_ANIMATE) {
								
								let ts = 0;
								if(data.fixs[j].t > toi.tmin)
									ts = (canvas.width*(data.fixs[j].t - toi.tmin))/toi_longest_duration;
								let td = (canvas.width*data.fixs[j].dt)/toi_longest_duration;
								if(td > 1){
									canvas.fill(grey(100)); canvas.noStroke(); //canvas.stroke(white(100));
									canvas.rect(ts, h2top, td, h2);
								}else{
									canvas.stroke(grey(100)); canvas.noFill(); //canvas.stroke(white(100));
									canvas.line(ts, h2top, ts, h2top+h2);
								}
							}					
						}
						console.log(" @@2draw_time_saccadetype");
						// colours
						for(let j = toi.j_min, seq=0; j < toi.j_max; j++, seq++){
							if(data.fixs[j] != undefined && (data.fixs[j].t - toi.tmin)/toi_longest_duration < TIME_ANIMATE){
								let ts = 0;
								if(data.fixs[j].t > toi.tmin)
									ts = (canvas.width*(data.fixs[j].t - toi.tmin))/toi_longest_duration;
								let td = (canvas.width*data.fixs[j].dt)/toi_longest_duration;
								
								if(td > 1){
									if( j > 0 && data.sacs[j-1] != undefined && data.sacs[j-1].filter ){
										for(let splat=0; splat<coef_splat.length; splat++){
											if(coef_splat[splat] > 0){
												if(data.sacs[j-1].length < SHORT_LENGTH){ canvas.fill(sacc_short(coef_weight[splat]));}
												else if(data.sacs[j-1].glance){ canvas.fill(sacc_glance(coef_weight[splat] ));}
												else{ canvas.fill( sacc_basic(coef_weight[splat] )); }

												canvas.noStroke();
												canvas.rect(ts, h2top, td, h2);
											}
										}
									}									
								}else{
									canvas.stroke(grey(100)); canvas.noFill(); //canvas.stroke(white(100));
									canvas.line(ts, h2top, ts, h2top+h2);
								}
							}					
						}
						row++;
						// }
					}	
				}
			}
		}
		else {
			canvas.background(0,0,0);
			canvas.stroke(grey(100)); 
			canvas.noFill(); 
			canvas.strokeWeight(0);
			canvas.rect(0,0,canvas.width,canvas.height);
			canvas.fill(white(100));
			canvas.textFont("Arial"); 
			canvas.textSize(18);
			canvas.textAlign( canvas.CENTER );
			canvas.text("There is no TWI of the selected sample. Please select\n a valid sample under 'Samples' and TWI under 'TWIs'.", canvas.width/2, canvas.height/2);
			return;
		}				
	}
};

let draw_time_saccades = (canvas) => {
	canvas.fill(black(100)); canvas.noStroke(); canvas.rect(0, 0, canvas.width, canvas.height); canvas.strokeWeight(1);
	let l = undefined; if(selected_lens !=-1){ l = base_lenses[selected_lens]; }
	if(VALUED.length == 0){
	}else{
		//if selected is TWI group, only show TWIs matching the TWI group
		//calculate total number of rows
		TIMELINE_CANVAS.num_of_rows = 0;
		let h2 = 0;
		let h2top = 0;
		let toi_longest_duration = 0;
		let k2 = VALUED.indexOf(selected_data);
		let k2_row_num = 0;
		let num_rows_of_selected_data = 0;

		for(let k=0; k<VALUED.length; k++){
			let data = DATASETS[VALUED[k]]; 

			if(data == undefined || !data.included)
				continue;
			if(DAT_MODE == 1 && data.group != selected_grp)
				continue;
			else if(DAT_MODE == 2 && VALUED[k] != selected_data)
				continue;

			for(let w=0; w<data.tois.length; w++){
				if(data.tois[w] != undefined && data.tois[w].included) {
					let twi_id = data.tois[w].twi_id;

					if(TWI_MODE == 2 && selected_twi != -1 && data.tois[w] != undefined && data.tois[w].included) {
						if(twi_id == selected_twi && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked) {
							toi_longest_duration = Math.max(toi_longest_duration, data.tois[w].tmax - data.tois[w].tmin);
							TIMELINE_CANVAS.num_of_rows++;
						}
						if(k == k2)
							num_rows_of_selected_data++;
					}else if(TWI_MODE == 1 && selected_twigroup != -1){
						if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].group == selected_twigroup && base_twis[twi_id].included && base_twis[twi_id].checked ) {
							toi_longest_duration = Math.max(toi_longest_duration, data.tois[w].tmax - data.tois[w].tmin);
							TIMELINE_CANVAS.num_of_rows++;
						}						
						if(k == k2)
							num_rows_of_selected_data++;
					}else if(TWI_MODE == 0){
						if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked ) {
							toi_longest_duration = Math.max(toi_longest_duration, data.tois[w].tmax - data.tois[w].tmin);
							TIMELINE_CANVAS.num_of_rows++;
						}
						if(k == k2)
							num_rows_of_selected_data++;
					}
				}
			}
		}
		
		if(TIMELINE_CANVAS.num_of_rows > 0) {
			h2 = canvas.height/TIMELINE_CANVAS.num_of_rows; 			

			for(let k=0, row=0; k<VALUED.length && row<TIMELINE_CANVAS.num_of_rows; k++){
				let data = DATASETS[VALUED[k]]; 
	
				if(data == undefined || !data.included)
					continue;
				if(DAT_MODE == 1 && data.group != selected_grp)
					continue;
				else if(DAT_MODE == 2 && VALUED[k] != selected_data)
					continue;
	
				for(let w=0; w<data.tois.length && row<TIMELINE_CANVAS.num_of_rows; w++){
					let bFilteredIn = false;
					if(data.tois[w] != undefined && data.tois[w].included) {
						let twi_id = data.tois[w].twi_id;					
						if(TWI_MODE == 2 && selected_twi != -1 && data.tois[w] != undefined && data.tois[w].included) {
							if(twi_id == selected_twi && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked) {
								bFilteredIn = true;
								
								if(k2_row_num == 0 && k2 == k)
									k2_row_num = row;
							}
						}else if(TWI_MODE == 1 && selected_twigroup != -1){
							if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].group == selected_twigroup && base_twis[twi_id].included && base_twis[twi_id].checked ) {
								bFilteredIn = true;
	
								if(k2_row_num == 0 && k2 == k)
									k2_row_num = row;
							}						
						}else if(TWI_MODE == 0){
							if(data.tois[w].included && twi_id < base_twis.length && base_twis[twi_id].included && base_twis[twi_id].checked ) {
								bFilteredIn = true;
	
								if(k2_row_num == 0 && k2 == k)
									k2_row_num = row;
							}
						}
					}
					if(bFilteredIn) {
						h2top = h2*row;		
						toi = data.tois[ w ];
						// if(VALUED[k]>=0 && v<DATASETS.length && DATASETS[VALUED[k]].initialised  && DATASETS[VALUED[k]].checked){
						
						//find out tmax and tmin of TWIs of this sample
						if( !USE_RELATIVE ){ toi_longest_duration = (toi.tmax-toi.tmin); }
						// grey backing layer
						if(data.fixs.length == 0){
							continue;					
						}
						for(let j = toi.j_min; j < toi.j_max; j++){
							if(data.fixs[j] != undefined && (data.fixs[j].t - toi.tmin)/toi_longest_duration < TIME_ANIMATE) {
								
								let ts = 0;
								if(data.fixs[j].t > toi.tmin)
									ts = (canvas.width*(data.fixs[j].t - toi.tmin))/toi_longest_duration;
								let td = (canvas.width*data.fixs[j].dt)/toi_longest_duration;
								if(td > 1){
									canvas.fill(grey(100)); canvas.noStroke(); //canvas.stroke(white(100));
									canvas.rect(ts, h2top, td, h2);
								}else{
									canvas.stroke(grey(100)); canvas.noFill(); //canvas.stroke(white(100));
									canvas.line(ts, h2top, ts, h2top+h2);
								}
							}					
						}
						
						// colours
						let max_val = toi.j_max - toi.j_min -1;
						for(let j = toi.j_min, seq=0; j < toi.j_max; j++, seq++){
							if(data.fixs[j] != undefined && (data.fixs[j].t - toi.tmin)/toi_longest_duration < TIME_ANIMATE){
								let ts = 0;
								if(data.fixs[j].t > toi.tmin)
									ts = (canvas.width*(data.fixs[j].t - toi.tmin))/toi_longest_duration;
								let td = (canvas.width*data.fixs[j].dt)/toi_longest_duration;
								let val = 75.5*seq/max_val + 30.0; //interpolation of transparency (saliency) in desired alpha range (30.0, 105.5)  
								if(td > 1){
									canvas.fill(cy(val, data.group)); canvas.noStroke();
									canvas.rect(ts, h2top, td, h2);
								}else{
									canvas.stroke(cy(val, data.group)); canvas.noFill();
									canvas.line(ts, h2top, ts, h2top+h2);
								}
							}					
						}
						row++;
						// }
					}	
				}
			}
		}
		else {
			canvas.background(0,0,0);
			canvas.stroke(grey(100)); 
			canvas.noFill(); 
			canvas.strokeWeight(0);
			canvas.rect(0,0,canvas.width,canvas.height);
			canvas.fill(white(100));
			canvas.textFont("Arial"); 
			canvas.textSize(18);
			canvas.textAlign( canvas.CENTER );
			canvas.text("There is no TWI of the selected sample. Please select\n a valid sample under 'Samples' and TWI under 'TWIs'.", canvas.width/2, canvas.height/2);
			return;
		}		
	}
};

let t0 = 0; 
let t1 = 1;
let TT = (v) => { 
	if(USE_RELATIVE){
		return 200 + (TIMELINE.width-300) * Math.max(0, Math.min( 1, (v - t0)/longest_duration ));
	}else{
		return 200 + (TIMELINE.width-300) * Math.max(0, Math.min( 1, (v - t0)/(t1 - t0) ));
	}
};

let draw_video_timeline_cursor = (p) => {
	if(selected_data == -1 || DATASETS[ selected_data ] == null || DATASETS[ selected_data ] == undefined || 
		VIDEOS[ selected_data ] == null || VIDEOS[ selected_data ] == undefined || 
		VIDEOS[ selected_data ].videoobj == null || VIDEOS[ selected_data ].videoobj == undefined){ return; }
	
	let data = DATASETS[ selected_data ];
	let fixs = data.fixs;

	t0 = data.tmin; t1 = data.tmax;
	p.fill(cy(80, data.group)); 
	p.noStroke();	

	if( (TIME_DATA=="data"||TIME_DATA=='all'||TIME_DATA=='group') && VALUED.length > 0){
		p.rect( TT(Math.floor(VIDEOS[selected_data].videoobj.time()*1000)), 0, 5, Math.floor(timeline_height));
	}
	else if( TIME_DATA=="lens" && lenses.length > 0 ){
		p.rect( TT(Math.floor(VIDEOS[selected_data].videoobj.time()*1000)), 0, 5, Math.floor(timeline_height));
	}
	else {return;}
};

let do_matrix_timeline_overlay = (p) => {
	if( mat_type == 'mat' ){
		if( MATRIX_VIEW_STATE == 'lensegroup_lensegroup'){ // first case, lensegroup_lensegroup data
			aggregate_fixation_data_across_dat_twi(p, false, null);		

		}else if( MATRIX_VIEW_STATE == 'aoi_aoi'){ // aoi_aoi data
			aggregate_fixation_data_across_dat_twi(p, false, null);	
		}else if( MATRIX_VIEW_STATE == 'lensegroup_dat' || MATRIX_VIEW_STATE == 'dat_lensegroup'){ 
			let data = null;
			let aoi = -1;
			if( mat_col_val == 'dat' ){
				if(xval == -1 || xval >= VALUED.length) return;
				if(yval == -1 || yval >= ORDERLENSEGROUPID.length) return;
				data = DATASETS[ VALUED[xval] ];
				aoi = yval;
			}else if( mat_row_val == 'dat' ){
				if(xval == -1 || xval >= ORDERLENSEGROUPID.length) return;
				if(yval == -1 || yval >= VALUED.length) return;
				data = DATASETS[ VALUED[yval] ];
				aoi = xval;
			}
			aggregate_fixation_data_across_twi(p, data, aoi, false, null);
		}else if( MATRIX_VIEW_STATE == 'aoi_dat' || MATRIX_VIEW_STATE == 'dat_aoi'){ 
			let data = null;
			let aoi = null;
			if( mat_col_val == 'dat' ){
				if(xval == -1 || xval >= VALUED.length) return;
				if(yval == -1 || yval >= lenses.length) return;
				data = DATASETS[ VALUED[xval] ];
				aoi = lenses[ yval ];
			}else if( mat_row_val == 'dat' ){
				if(xval == -1 || xval >= lenses.length) return;
				if(yval == -1 || yval >= VALUED.length) return;
				data = DATASETS[ VALUED[yval] ];
				aoi = lenses[ xval ];
			}
			aggregate_fixation_data_across_twi(p, data, aoi, false, null);


		}else if( MATRIX_VIEW_STATE == 'lensegroup_toi' || MATRIX_VIEW_STATE == 'toi_lensegroup'){ 
			let twi_id = -1;
			let aoi = -1;
			if( mat_col_val == 'toi' ){
				if(xval == -1 || xval >= order_twis.length) return;
				if(yval == -1 || yval >= ORDERLENSEGROUPID.length) return;
				twi_id = order_twis[ xval ];
				aoi = yval;
			}else if( mat_row_val == 'toi' ){
				if(xval == -1 || xval >= ORDERLENSEGROUPID.length) return;
				if(yval == -1 || yval >= order_twis.length) return;
				twi_id = order_twis[ yval ];
				aoi = xval;
			}
			aggregate_fixation_data_across_dat(p, twi_id, aoi, false, null);
		}else if( MATRIX_VIEW_STATE == 'aoi_toi' || MATRIX_VIEW_STATE == 'toi_aoi'){ 
			let twi_id = -1;
			let aoi = null;
			if( mat_col_val == 'toi' ){
				if(xval == -1 || xval >= order_twis.length) return;
				if(yval == -1 || yval >= lenses.length) return;
				twi_id = order_twis[ xval ];
				aoi = lenses[ yval ];
			}else if( mat_row_val == 'toi' ){
				if(xval == -1 || xval >= lenses.length) return;
				if(yval == -1 || yval >= order_twis.length) return;
				twi_id = order_twis[ yval ];
				aoi = lenses[ xval ];
			}
			aggregate_fixation_data_across_dat(p, twi_id, aoi, false, null);
		}else if( MATRIX_VIEW_STATE == 'lensegroup_twigroup' || MATRIX_VIEW_STATE == 'twigroup_lensegroup'){ 
			let twigroup_id = -1;
			let aoi = -1;
			if( mat_col_val == 'toi' ){
				if(xval == -1 || xval >= ORDERTWIGROUPID.length) return;
				if(yval == -1 || yval >= ORDERLENSEGROUPID.length) return;
				twigroup_id = ORDERTWIGROUPID[ xval ];
				aoi = yval;
			}else if( mat_row_val == 'toi' ){
				if(xval == -1 || xval >= ORDERLENSEGROUPID.length) return;
				if(yval == -1 || yval >= ORDERTWIGROUPID.length) return;
				twigroup_id = ORDERTWIGROUPID[ yval ];
				aoi = xval;
			}
			for(let c=0; c<order_twis.length; c++)	{
				let order_twis_group_index = ORDERTWIGROUPID.indexOf(base_twis[order_twis[c]].group);
	
				if(order_twis_group_index != -1  && twigroup_id == base_twis[order_twis[c]].group &&
					base_twis[order_twis[c]].included && base_twis[order_twis[c]].checked) {
						aggregate_fixation_data_across_dat(p, order_twis[c], aoi, false, null);
				}
			}
		}else if( MATRIX_VIEW_STATE == 'aoi_twigroup' || MATRIX_VIEW_STATE == 'twigroup_aoi'){ 
			let twigroup_id = -1;
			let aoi = null;
			if( mat_col_val == 'toi' ){
				if(xval == -1 || xval >= ORDERTWIGROUPID.length) return;
				if(yval == -1 || yval >= lenses.length) return;
				twigroup_id = ORDERTWIGROUPID[ xval ];
				aoi = lenses[ yval ];
			}else if( mat_row_val == 'toi' ){
				if(xval == -1 || xval >= lenses.length) return;
				if(yval == -1 || yval >= ORDERTWIGROUPID.length) return;
				twigroup_id = ORDERTWIGROUPID[ yval ];
				aoi = lenses[ xval ];
			}
			for(let c=0; c<order_twis.length; c++)	{
				let order_twis_group_index = ORDERTWIGROUPID.indexOf(base_twis[order_twis[c]].group);
	
				if(order_twis_group_index != -1  && twigroup_id == base_twis[order_twis[c]].group &&
					base_twis[order_twis[c]].included && base_twis[order_twis[c]].checked) {
						aggregate_fixation_data_across_dat(p, order_twis[c], aoi, false, null);
				}
			}

		}else if( MATRIX_VIEW_STATE.indexOf('lensegroup')!= -1 && MATRIX_VIEW_STATE.indexOf('grp')!=-1){ // this is an lensegroup-grp or grp-lensegroup state
			// grab the dataset, toi, and lensegroup that we are considering
			let data = null;
			let grp = -1;
			let aoi = -1;
			if( mat_col_val == 'grp' ){
				grp = xval;
				aoi = yval;
			}else if( mat_row_val == 'grp' ){
				grp = yval;
				aoi = xval;
			}			
			if(grp != -1 && aoi != -1 && grp < ORDERGROUPIDARRAYINDEX.length && aoi < ORDERLENSEGROUPID.length){
				for(let i = 0; i < VALUED.length; i++) {
					if(DATASETS[ VALUED[i] ].group == GROUPS[ORDERGROUPIDARRAYINDEX[grp]].group) {
						// draw the fixations in intersection of toi and aoi, for the dataset:						
						data = DATASETS[ VALUED[i] ];
						aggregate_fixation_data_across_twi(p, data, aoi, false, null);
					}
				}				
			}
		}
		else if( MATRIX_VIEW_STATE.indexOf('aoi')!= -1 && MATRIX_VIEW_STATE.indexOf('grp')!=-1){ // this is an aoi-grp or grp-aoi state
			// grab the dataset, toi, and lensegroup that we are considering
			let data = null;
			let grp = -1;
			let aoi = null;
			if( mat_col_val == 'grp' ){
				grp = xval;
				aoi = lenses[ yval ];
			}else if( mat_row_val == 'grp' ){
				grp = yval;
				aoi = lenses[ xval ];
			}			
			
			if(grp != -1 && aoi != -1 && grp < ORDERGROUPIDARRAYINDEX.length && aoi != undefined){
				for(let i = 0; i < VALUED.length; i++) {
					if(DATASETS[ VALUED[i] ].group == GROUPS[ORDERGROUPIDARRAYINDEX[grp]].group) {
						// draw the fixations in intersection of toi and aoi, for the dataset:						
						data = DATASETS[ VALUED[i] ];
						aggregate_fixation_data_across_twi(p, data, aoi, false, null);
					}
				}				
			}
		}
	}
	else if(mat_type == 'hist') {
		aggregate_histogram_across_dat_twi(p, data, false, null);
	}
};

let bookmarks = [];
const observers = {};
let observerColourIndex = 0;
let DATA_G;
let H2TOP_G;
let H2_G;
let CANVAS_G;
let TOI_BOOKMARK_G;
function addBookmarkButton(data, h2top, h2, canvas, toi_bookmark) {
    let start_time = toi_bookmark.tmin;
    let end_time = toi_bookmark.tmax;
    let participantData = data.notes;
    let max_duration = end_time - start_time;
    let tolerancePercentage = max_duration * 0.05;
	DATA_G = data;
	H2TOP_G = h2top;
	H2_G = h2;
	CANVAS_G = canvas;
	TOI_BOOKMARK_G = toi_bookmark;
	
    removeBookmarkButton(data, toi_bookmark);

    const grouped_events = {};
    const grouped_within_tolerance = {};

    for (let i = 0; i < participantData.events.length; i++) {
        let event = participantData.events[i];
        let ts = (canvas.width * (event.timestampMs - start_time)) / max_duration;
        if (event.visibleOnTimeline === false || event.included === false) {
            continue;
        }
        let observerName = event.observer;
        let selectedBookmark;
        event.eventId = i;
        selectedBookmark = event.eventId;

        if (!observers[observerName]) {
            observers[observerName] = OBSERVERS[observerColourIndex % OBSERVERS.length];
            observerColourIndex++;
        }

        if(!grouped_events[event.timestampMs]) {
            grouped_events[event.timestampMs] = [];
        }

        grouped_events[event.timestampMs].push(event);    
    }

    let sorted_timestamps = Object.keys(grouped_events).map(Number).sort((a, b) => a - b);

    let currentGroup = [];
    let currentStartTimestamp = sorted_timestamps[0];

    currentGroup.push(...grouped_events[currentStartTimestamp]);

    for (let i = 1; i < sorted_timestamps.length; i++) {
        let currentTimestamp = sorted_timestamps[i];
        let previousTimestamp = sorted_timestamps[i - 1];

        if((currentTimestamp - previousTimestamp) <= tolerancePercentage) {
            currentGroup.push(...grouped_events[currentTimestamp]);
        } else {
            grouped_within_tolerance[currentStartTimestamp] = currentGroup;
            currentStartTimestamp = currentTimestamp;
            currentGroup = [...grouped_events[currentTimestamp]];
        }
    }
    grouped_within_tolerance[currentStartTimestamp] = currentGroup;

    // if(Object.keys(observers).length !== 0) {
    //     colour_match_observer(observers);
    // }

    Object.entries(grouped_within_tolerance).forEach(([timestampMs, events]) => {
        let ts = (canvas.width * (timestampMs - start_time)) / max_duration;

        if (ts >= 0 && ts <= canvas.width) {
            let start_y = h2top;
            let end_y = h2top + h2;
            let center_y = start_y + (end_y - start_y) / 2;    

            events.forEach((event, i) => {
                let button = document.createElement("button");
                let line = document.createElement("div");
                let canvasRect = TIMELINE_CANVAS.elt.getBoundingClientRect();
                let diff = (TIMELINE_CANVAS.width - canvas.width) / 3;

                line.className = `timeline-line-${data.name}-toi-${toi_bookmark.twi_id}`;
                line.style.position = "absolute";    

                line.style.left = `${canvasRect.left + (diff * 2) + ts}px`;
                line.style.top = `${canvasRect.top + start_y}px`;
                line.style.width = "1px";
                line.style.height = `${end_y - start_y}px`;
                line.style.backgroundColor = "black";
                line.style.zIndex = "1";

				let start_x = ts;
				setTimeout(() => {
					canvas.line(start_x, start_y, start_x, end_y);
					canvas.stroke("black");
					canvas.strokeWeight(1);
				})

                button.className = `timeline-bookmark-${data.name}-toi-${toi_bookmark.twi_id}`;
                button.setAttribute("data-observer", event.observer);
                button.setAttribute("data-event-type", event.type);
                button.setAttribute("data-event-detail-id", event.eventId);

                button.style.position = "absolute";    
                button.style.left = `${canvasRect.left + (diff * 2) + ts - 7.5}px`;
                button.style.top = `${canvasRect.top + center_y - 7.5}px`;
                button.style.width = "15px";
                button.style.height = "15px";
                button.style.background = observers[event.observer];
                
                button.style.border = "none";
                button.style.cursor = "pointer";
                button.style.borderRadius = "5px";
                button.style.zIndex = "2";    
                
				let toggleButton;
				if(events.length > 1) {
					toggleButton = document.createElement('button');
					toggleButton.className = `timeline-toggle-${data.name}-toi-${toi_bookmark.twi_id}`;
					toggleButton.innerHTML = events.length;
					toggleButton.style.position = "absolute";
					toggleButton.style.left = `${canvasRect.left + (diff * 2) + ts - 8.5}px`;
					toggleButton.style.top = `${canvasRect.top + center_y - 35}px`;
					toggleButton.style.zIndex = "3";
					document.body.appendChild(toggleButton);
		
					let noteIndex = 0;
					toggleButton.addEventListener("click", () => {
						noteIndex = (noteIndex + 1) % events.length;
						let currentNote = events[noteIndex];
						currentNote.eventId = participantData.events.findIndex(e => e.occuredTimestamp === currentNote.occuredTimestamp && e.content === currentNote.content);
						selectedBookmark = currentNote.eventId;    
						button.style.background = observers[currentNote.observer];
						tooltip.innerHTML = `Timestamp: ${currentNote.occuredTimestamp}<br>Type: ${currentNote.type}<br>Details: ${currentNote.content}<br>Observer: ${currentNote.observer}`;
					});
				}
                
                let tooltip = document.createElement("tooltip");
                tooltip.className = "tooltip";
                tooltip.style.position = "absolute";
                tooltip.style.padding = "10px 10px";
                tooltip.style.color = "black";
                tooltip.style.borderRadius = "5px";
                tooltip.style.fontSize = "14px";
                tooltip.style.fontWeight = "bold";
                tooltip.style.fontFamily = "Calibri";
                tooltip.style.visibility = "hidden";
                tooltip.style.transition = "opacity 0.3s";
                tooltip.style.opacity = "0";
                tooltip.style.zIndex = "1000";
                tooltip.style.backgroundColor = "white";
                tooltip.innerHTML = `Timestamp: ${event.occuredTimestamp}<br>Type: ${event.type}<br>Details: ${event.content}<br>Observer: ${event.observer}`;
                
                button.addEventListener("mouseenter", () => {
                    tooltip.style.visibility = "visible";
                    tooltip.style.opacity = "1";
                    tooltip.style.left = `${parseFloat(button.style.left) + 20}px`;
                    tooltip.style.top = `${parseFloat(button.style.top) - 10}px`;
                    if(!button.classList.contains('selected_bookmark')) {
                        button.style.outline = "2px solid yellow";
                    }
                });
    
                button.addEventListener("mouseleave", () => {
                    tooltip.style.visibility = "hidden";
                    tooltip.style.opacity = "0";
                    if(!button.classList.contains('selected_bookmark')) {
                        button.style.outline = "none";
                    }
                });

                button.addEventListener("click", () => {
                    document.querySelectorAll("[class^='timeline-bookmark-']").forEach(bookmarkButton => {
                        bookmarkButton.classList.remove('selected_bookmark');
                        bookmarkButton.style.outline = "none";
                    });
                    button.classList.add("selected_bookmark");
                    button.style.outline = "2px dashed green"
                    select_note(selectedBookmark);
                });

                document.addEventListener("DOMContentLoaded", filter_observers_by_colour());
				bookmarks.push({
					timestamp: event.timestampMs,
					start_time,
					max_duration,
					button,
					line,
					toggleButton
				});
				
                document.body.appendChild(line);
                document.body.appendChild(button);
                document.body.appendChild(tooltip);
            });
        }
    });
}

function updateBookmarkButton(time_animate) {
	bookmarks.forEach(bookmark => {
		const { timestamp, start_time, max_duration, button, line, toggleButton } = bookmark; 
		let scaledTime = (timestamp - start_time) / max_duration;		
		
		if(button && line) {
			if(scaledTime >= time_animate) {
				button.style.visibility = "hidden";
				line.style.visibility = "hidden";
				if(toggleButton) {
					toggleButton.style.visibility = "hidden";
				}
			}
		}
	})
}

function removeBookmarkButton(data, toi_bookmark) {
	let datasetClass = `timeline-bookmark-${data.name}-toi-${toi_bookmark.twi_id}`;
	let lineClass = `timeline-line-${data.name}-toi-${toi_bookmark.twi_id}`;
	let toggleButtonClass = `timeline-toggle-${data.name}-toi-${toi_bookmark.twi_id}`;

	document.querySelectorAll(`.${lineClass}`).forEach((line) => line.remove());
	document.querySelectorAll(`.${datasetClass}`).forEach((btn) => btn.remove());
	document.querySelectorAll(`.${toggleButtonClass}`).forEach((btn) => btn.remove());
}

function removeAllBookmarkButtons() {
	DATASETS.forEach((data) => {
		data.tois.forEach((toi) => {
			removeBookmarkButton(data, toi);
		});
	});
}

function toggle_notes() {
	// get all the html elements starting with the following classnames
    let toggleButton = document.getElementById("observer_notes");
    let bookmarks = document.querySelectorAll("[class^='timeline-bookmark-']");
	let lines = document.querySelectorAll("[class^='timeline-line-']");
	let multiNotesButton = document.querySelectorAll("[class^='timeline-toggle-']");
    
	// to switch off the notes, lines and multiNotes functions in the timeline
    if (toggleButton.dataset.toggle === "on") {
        bookmarks.forEach((btn) => btn.style.display = "none");
		lines.forEach((line) => line.style.display = "none");
		multiNotesButton.forEach((btn) => btn.style.display = "none");
        toggleButton.dataset.toggle = "off";
        toggleButton.innerHTML = "<i class='fas fa-times-circle'></i>";
		toggleButton.classList.remove("toggle-on");
		toggleButton.classList.add("toggle-off");
    } else {
        bookmarks.forEach((btn) => btn.style.display = "block");
		lines.forEach((line) => line.style.display = "block");
		multiNotesButton.forEach((btn) => btn.style.display = "block");
        toggleButton.dataset.toggle = "on";
        toggleButton.innerHTML = "<i class='fas fa-clock'></i>";
		toggleButton.classList.remove("toggle-off");
		toggleButton.classList.add("toggle-on");
    }
}

// to match all the observers to the observer legend
function colour_match_observer(observers) {
    let container = document.getElementById('legend_container');
    container.innerHTML = "";

    let title = document.createElement('h3');
    title.textContent = "Observer Legend";
    title.style.textAlign = "center";
    title.style.marginBottom = "10px";
    container.appendChild(title);

    let legendRow = document.createElement('ul');
	legendRow.style.display = "flex";
	legendRow.style.flexDirection = "row";
	legendRow.style.gap = "15px";
    Object.entries(observers).forEach(([observerName, color]) => {
        let observerDiv = document.createElement('div');
		observerDiv.style.display = "flex";
        observerDiv.style.alignItems = "center";
        observerDiv.style.marginBottom = "5px";
		observerDiv.style.justifyContent = "center";

        let colorIndicator = document.createElement('div');
        colorIndicator.style.width = "15px";
        colorIndicator.style.height = "15px";
        colorIndicator.style.borderRadius = "5px"; 
        colorIndicator.style.background = color; 
        colorIndicator.style.marginRight = "10px";
        observerDiv.style.alignItems = "center";
		observerDiv.style.justifyContent = "center";
        let observerText = document.createElement('span');
        observerText.textContent = observerName;

        observerDiv.appendChild(colorIndicator);
        observerDiv.appendChild(observerText);
        legendRow.appendChild(observerDiv);
    });

    container.appendChild(legendRow);
}

// function to filter bookmark colours
function filter_observers_by_colour() {
	let sameCheckbox = document.querySelector('input[value="same"]');
	let differentCheckbox = document.querySelector('input[value="different"]');
	let typeCheckbox = document.querySelector('input[value="note_type_colour"]');

	sameCheckbox.addEventListener('change', () => {
		if (sameCheckbox.checked) {
			differentCheckbox.checked = false;
			typeCheckbox.checked = false;
			show_note_legend = false;
			show_note_observer_legend = false;
			change_all_bookmarks_to_grey();
		}
	})

	differentCheckbox.addEventListener('change', () => {
		if (differentCheckbox.checked) {
			sameCheckbox.checked = false;
			typeCheckbox.checked = false;
			show_note_legend = false;
			show_note_observer_legend = true;
			change_all_bookmarks_to_original();
		}
	});

	typeCheckbox.addEventListener('change', () => {
		if (typeCheckbox.checked) {
			sameCheckbox.checked = false;
			differentCheckbox.checked = false;
			show_note_legend = true;
			show_note_observer_legend = false;
			filter_by_note_type_observer();
		}
	});
}

// function to change the bookmarks to default grey
function change_all_bookmarks_to_grey() {
	let bookmarks = document.querySelectorAll("[class^='timeline-bookmark-']");
	bookmarks.forEach(bookmark => {
		bookmark.style.background = "#696b6a";
		bookmark.style.border = "1px solid black";
	});
	add_note_legend();
	updateDefaultNoteColors();
}

// function to change the bookmark colours to filter by observer 
function change_all_bookmarks_to_original() {
	let bookmarks = document.querySelectorAll("[class^='timeline-bookmark-']");
	bookmarks.forEach(bookmark => {
		let currentObserver = bookmark.getAttribute("data-observer");
		let originalColour = observers[currentObserver];
		if (originalColour) {
			bookmark.style.background = originalColour;
			bookmark.style.border = originalColour;
		}
	});
	add_note_legend();
	update_observer_colors();
}

let event_colour_map = {};

// function to change the bookmark colours to filter by note type
function filter_by_note_type_observer() {
	for(let i=0; i<noteTypes.length; i++) {
		event_colour_map[noteTypes[i]] = OBSERVERS[i];	
	}
	
	let bookmarks = document.querySelectorAll("[class^='timeline-bookmark-']");
	bookmarks.forEach(bookmark => {
		let observer = bookmark.getAttribute("data-event-type");
		let typeColour = event_colour_map[observer];
		if (typeColour) {
			bookmark.style.background = typeColour;
			bookmark.style.border = typeColour;
			add_note_legend();
		}
	})
	updateTypeColors();
}

// function to add a legend to when colour is filtered by note type
function add_note_legend() {
	let container = document.getElementById('note_legend');
	container.innerHTML = "";

	if(show_note_legend === true) {
		let legendRow = document.createElement("ul");
		legendRow.style.display = "flex";
		legendRow.style.flexDirection = "row";
		legendRow.style.gap = "15px";
	
		Object.entries(event_colour_map).forEach(([noteType, colour]) => {
			let observerDiv = document.createElement('div');
			observerDiv.style.display = "flex";
			observerDiv.style.alignItems = "center";
			observerDiv.style.marginBottom = "5px";
			observerDiv.style.justifyContent = "center";
	
			let colorIndicator = document.createElement('div');
			colorIndicator.style.width = "15px";
			colorIndicator.style.height = "15px";
			colorIndicator.style.borderRadius = "5px"; 
			colorIndicator.style.background = colour; 
			colorIndicator.style.marginRight = "10px";
			observerDiv.style.alignItems = "center";
			observerDiv.style.justifyContent = "center";
			let observerText = document.createElement('span');
			observerText.textContent = noteType;
	
			observerDiv.appendChild(colorIndicator);
			observerDiv.appendChild(observerText);
			legendRow.appendChild(observerDiv);
		});
		container.appendChild(legendRow);
	} else if (show_note_observer_legend === true) {
		let legendRow = document.createElement("ul");
		legendRow.style.display = "flex";
		legendRow.style.flexDirection = "row";
		legendRow.style.gap = "15px";
	
		Object.entries(observers).forEach(([observer, colour]) => {
			let observerDiv = document.createElement('div');
			observerDiv.style.display = "flex";
			observerDiv.style.alignItems = "center";
			observerDiv.style.marginBottom = "5px";
			observerDiv.style.justifyContent = "center";
	
			let colorIndicator = document.createElement('div');
			colorIndicator.style.width = "15px";
			colorIndicator.style.height = "15px";
			colorIndicator.style.borderRadius = "5px"; 
			colorIndicator.style.background = colour; 
			colorIndicator.style.marginRight = "10px";
			observerDiv.style.alignItems = "center";
			observerDiv.style.justifyContent = "center";
			let observerText = document.createElement('span');
			observerText.textContent = observer;
	
			observerDiv.appendChild(colorIndicator);
			observerDiv.appendChild(observerText);
			legendRow.appendChild(observerDiv);
		});
		container.appendChild(legendRow);
	}
}