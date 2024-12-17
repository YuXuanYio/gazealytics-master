// lens list function
notebox =
	"<div></div>" +
	'<div class="controls">' +
	'<div class="tool inner_button">' +
	'<button id="notes_#_l" onclick="toggle_note_lock(#)"> <i class="fas fa-lock-open"></i> </button>' +
	'<span class="tip">Lock the lens with current values</span></div>' +
	'<div class="tool inner_button">' +
	'<button id="notes_#_v" class="toggler toggle-on" onclick="toggle_note_visibility(#)"> <i class="fas fa-eye"></i> </button>' +
	'<span class="tip">Toggle visibility of note on spatial canvas</span></div>' +
	'<div class="tool inner_button"><button onclick="delete_note(#);"><i class="far fa-trash-alt"></i></button>' +
	'<span class="tip">Delete the note</span></div><br>' +
	'<select class="note_dataset" id="#_note_pid" onchange="change_note_pid(#, this.value)"></select>' +
	"</div>";

base_notes = [];
order_notes = [];
importedNotes = {};
selected_note = -1;
var LINE_CHAR = "\n";

function new_note(
	X,
	Y,
	content,
	noteBelongTo,
	type,
	timestamp,
	observer,
	visibleOnCanvas
) {
	v = base_notes.length;
	notePID = selected_data;
	DATASETS.forEach((d, i) => {
		if (d.name === noteBelongTo) {
			notePID = i;
		}
	});
	newnote = {
		pid: notePID,
		X: X,
		Y: Y,
		content: content,
		selected: true,
		max_width: 0,
		included: true,
		type: type,
		timestamp: timestamp,
		observer: observer,
		shownInList: true,
		locked: false,
		visibleOnCanvas: visibleOnCanvas,
	};
	base_notes.push(newnote);

	q = notebox.replace(/#/g, v);
	var node = document.createElement("li");
	node.innerHTML = q;
	node.id = "note_" + v;

	let noteContentContainer = document.createElement("div");
	noteContentContainer.className = "note_content_container";

	let typeLabel = document.createElement("label");
	typeLabel.className = "tool note_type";
	typeLabel.id = "note_" + v + "_note_type";
	typeLabel.textContent = `Type: ${type}`;

	let timestampLabel = document.createElement("label");
	timestampLabel.className = "tool note_timestamp";
	timestampLabel.id = "note_" + v + "_note_timestamp";
	timestampLabel.textContent = `Timestamp: ${timestamp}`;

	let observerLabel = document.createElement("label");
	observerLabel.className = "tool note_observer";
	observerLabel.id = "note_" + v + "_note_observer";
	observerLabel.textContent = `Observer: ${observer}`;

	noteContentContainer.appendChild(typeLabel);
	noteContentContainer.appendChild(timestampLabel);
	noteContentContainer.appendChild(observerLabel);

	let textarea = document.createElement("textarea");
	textarea.className = "tool";
	textarea.id = "note_" + v + "_content";
	textarea.value = content;
	textarea.onchange = function () {
		if (!base_notes[v].locked) {
			base_notes[v].content = this.value;
		} else {
			this.value = base_notes[v].content;
		}
	};

	noteContentContainer.appendChild(textarea);

	node.appendChild(noteContentContainer);

	node.onclick = function (e) {
		var v = parseInt(this.id.split("_")[1]);
		var e_type = e.target.id.split("_")[2];
		// Selection conditions
		if (e_type != "content" && e_type != "pid") {
			if (selected_note != v) {
				select_note(v);
			} else {
				select_note(-1);
			}
		} else {
			if (selected_note != v) {
				select_note(v);
			}
		}
	};
	node.setAttribute("class", "note_item");
	document.getElementById("notelist").appendChild(node);

	if (!visibleOnCanvas) {
		let eyeButton = document.getElementById(`notes_${v}_v`);
		eyeButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
		eyeButton.classList.remove("toggle-on");
		eyeButton.classList.add("toggle-off");
	}

	make_note_dataset_selectors();
	select_note(v);
}

function make_note_dataset_selectors() {
	selectors = document.getElementsByClassName("note_dataset");
	for (var i = 0; i < selectors.length; i++) {
		selector = selectors[i];
		id = selector.id.split("_")[0] * 1;
		selector.innerHTML = "";
		content = "";
		for (var j = 0; j < DATASETS.length; j++) {
			if (
				DATASETS[j].initialised &&
				DATASETS[j].should_save &&
				DATASETS[j].included
			) {
				content +=
					"<option value='" +
					j +
					"'>" +
					DATASETS[j].name +
					"</option>";
			}
		}
		selector.innerHTML = content;
		selector.value = base_notes[id].pid;
	}
}

function draw_notes(canvas) {
	var list = document.getElementById("notelist").children;
	order_notes = [];
	for (var i = 0; i < list.length; i++) {
		var elem = list[i];
		var id = parseInt(elem.id.split("_")[1]);
		order_notes.push(id);
		var note = base_notes[id];
		note.selected = id == selected_note;

		if (!note.visibleOnCanvas) {
			continue;
		}

		var g = note.content.split(LINE_CHAR);
		canvas.fill(white(100));
		canvas.stroke(white(100));
		note.max_width = 0;
		for (var j = 0; j < g.length; j++) {
			note.max_width = Math.max(note.max_width, canvas.textWidth(g[j]));
			canvas.strokeWeight(0);
			if (VALUED.indexOf(note.pid) != -1) {
				canvas.text(
					g[j],
					(note.X - OFFSET_X) * pos_ratio + ground_x,
					(note.Y - OFFSET_Y) * pos_ratio +
						ground_y +
						j * canvas.textAscent()
				);
			}
		}
		if (note.selected && CONTROL_STATE == "notes") {
			canvas.fill(makeColor(0, SELECTED));
			canvas.stroke(makeColor(100, SELECTED));
			canvas.strokeWeight(1);
			canvas.rect(
				(note.X - OFFSET_X) * pos_ratio +
					ground_x -
					note.max_width / 2 -
					2,
				(note.Y - OFFSET_Y) * pos_ratio +
					ground_y -
					canvas.textAscent() -
					2,
				note.max_width + 4,
				g.length * canvas.textAscent() + 4
			);
		}
	}
}

function select_note(v) {
	selected_note = v;
	var list = document.getElementById("notelist").children;
	for (var i = 0; i < list.length; i++) {
		var id = parseInt(list[i].id.split("_")[1]);
		base_notes[id].selected = id == v;
		if (
			base_notes[id].selected !=
			list[i].classList.value.includes("selected")
		) {
			list[i].classList.toggle("selected");
		}
	}
	for (var i = 0; i < list.length; i++) {
		var id = parseInt(list[i].id.split("_")[1]);
		if (base_notes[id].content == "" && !base_notes[id].selected) {
			delete_note(id);
		}
	}
}

function find_note(canvas, X, Y) {
	var selnote = -1;
	if (selected_note != -1) {
		note = base_notes[selected_note];
		var g = note.content.split(LINE_CHAR);
	}
	if (
		selected_note != -1 &&
		(note.X - OFFSET_X) * pos_ratio + ground_x - note.max_width / 2 - 2 <=
			X * pos_ratio + ground_x &&
		(note.X - OFFSET_X) * pos_ratio +
			ground_x -
			note.max_width / 2 +
			note.max_width +
			2 >=
			X * pos_ratio + ground_x &&
		(note.Y - OFFSET_Y) * pos_ratio + ground_y - canvas.textAscent() - 2 <=
			Y * pos_ratio + ground_y &&
		(note.Y - OFFSET_Y) * pos_ratio +
			ground_y -
			canvas.textAscent() -
			2 +
			g.length * canvas.textAscent() +
			4 >=
			Y * pos_ratio + ground_y &&
		VALUED.indexOf(note.pid) != -1
	) {
		selnote = selected_note;
	} else {
		selnote = -1;
		for (var i = 0; i < order_notes.length; i++) {
			note = base_notes[order_notes[i]];
			var g = note.content.split(LINE_CHAR);
			if (
				(note.X - OFFSET_X) * pos_ratio +
					ground_x -
					note.max_width / 2 -
					2 <=
					X * pos_ratio + ground_x &&
				(note.X - OFFSET_X) * pos_ratio +
					ground_x -
					note.max_width / 2 +
					note.max_width +
					2 >=
					X * pos_ratio + ground_x &&
				(note.Y - OFFSET_Y) * pos_ratio +
					ground_y -
					canvas.textAscent() -
					2 <=
					Y * pos_ratio + ground_y &&
				(note.Y - OFFSET_Y) * pos_ratio +
					ground_y -
					canvas.textAscent() -
					2 +
					g.length * canvas.textAscent() +
					4 >=
					Y * pos_ratio + ground_y &&
				VALUED.indexOf(note.pid) != -1
			) {
				selnote = order_notes[i];
			}
		}
	}
	select_note(selnote);
}

function delete_note(id) {
	if (base_notes[id].content !== "") {
		var r = confirm("Are you sure you want to delete the note?");
		if (r) {
			var elem = document.getElementById("note_" + id);
			elem.parentNode.removeChild(elem);
			base_notes[id].included = false;
			if (id == selected_note) {
				selected_note = -1;
			}
		}
	} else {
		var elem = document.getElementById("note_" + id);
		elem.parentNode.removeChild(elem);
		base_notes[id].included = false;
		if (id == selected_note) {
			selected_note = -1;
		}
	}
}

function key_note(key) {
	if (document.activeElement.className.match("tool")) {
		return;
	}
	if (selected_note == -1) {
		return;
	}
	note = base_notes[selected_note];
	if (key == "Delete") {
		note.content = "";
	} else if (key == "Backspace") {
		// doesn't work because apparently the backspace key doesn't register?
		note.content = note.content.substring(0, note.content.length - 1);
	} else if (key == "Enter") {
		// not the correct symbol for causing a line break
		note.content += LINE_CHAR;
	} else if (key.length == 1) {
		note.content += key;
	}
	if (order_notes.indexOf(selected_note) != -1) {
		document.getElementById("note_" + selected_note + "_content").value =
			note.content;
	}
}

let loadNotesFromTSV = () => {
	DATASETS.forEach((d, i) => {
		if (d.initialised && d.should_save && d.included) {
			let notes = d.notes;
			let sessionStartTimestamp = notes.startTime;
			notes.events.forEach((n, j) => {
				let eventTimestamp = n.timestamp;
				let timestampDifference = calculateTimeDifference(
					sessionStartTimestamp,
					eventTimestamp
				);
				new_note(
					200,
					200,
					n.eventDetails,
					d.name,
					n.type,
					timestampDifference,
					n.observer,
					false
				);
			});
		}
	});
	draw_time_all(TimeLine);
};

function addSamplesToNotesFilter() {
	let noteSampleDropdown = document.getElementById("note_sample_dropdown");
	noteSampleDropdown.innerHTML = "";
	DATASETS.forEach((d, _) => {
		label = `<label><input type="checkbox" name="note_sample" value="${d.name}"> ${d.name}</label>`;
		noteSampleDropdown.innerHTML += label;
	});
	document
		.querySelectorAll('#note_type_dropdown input[name="note_type"]')
		.forEach((checkbox) => {
			checkbox.addEventListener("change", filterNotes);
		});
	document
		.querySelectorAll('#note_sample_dropdown input[name="note_sample"]')
		.forEach((checkbox) => {
			checkbox.addEventListener("change", filterNotes);
		});
}

function filterNotes() {
	let selectedTypes = Array.from(
		document.querySelectorAll(
			'#note_type_dropdown input[name="note_type"]:checked'
		)
	).map((checkbox) => checkbox.value);
	let selectedSamples = Array.from(
		document.querySelectorAll(
			'#note_sample_dropdown input[name="note_sample"]:checked'
		)
	).map((checkbox) => checkbox.value);

	base_notes.forEach((note) => {
		const noteType = note.type.toLowerCase();
		const noteSample = DATASETS[note.pid]?.name;
		
		const typeMatch = (selectedTypes.length === 0) || selectedTypes.includes(noteType);
		const sampleMatch = (selectedSamples.length === 0) || selectedSamples.includes(noteSample);

		note.shownInList = typeMatch && sampleMatch;
	});

	const noteList = document.getElementById("notelist").children;
	for (let i = 0; i < noteList.length; i++) {
		const elem = noteList[i];
		const id = parseInt(elem.id.split("_")[1], 10);
		const note = base_notes[id];
		elem.style.display = note.shownInList ? "" : "none";
	}

	make_note_dataset_selectors();
}

function calculateTimeDifference(dateStr1, dateStr2) {
	const parseDate = (dateStr) => {
		const [day, month, year, time] = dateStr.split(/[\/\s]/);
		const [hours, minutes, seconds] = time.split(":");
		return new Date(year, month - 1, day, hours, minutes, seconds);
	};

	const date1 = parseDate(dateStr1);
	const date2 = parseDate(dateStr2);

	const differenceInMilliseconds = Math.abs(date2 - date1);

	const hours = Math.floor(differenceInMilliseconds / 3600000);
	const minutes = Math.floor((differenceInMilliseconds % 3600000) / 60000);
	const seconds = Math.floor((differenceInMilliseconds % 60000) / 1000);
	const milliseconds = differenceInMilliseconds % 1000;

	const formatted = [
		String(hours).padStart(2, "0"),
		String(minutes).padStart(2, "0"),
		String(seconds).padStart(2, "0"),
		String(milliseconds).padStart(3, "0"),
	].join(":");

	return formatted;
}

function calculateTimeDifferenceInMs(dateStr1, dateStr2) {
    const parseDate = (dateStr) => {
        const [day, month, year, time] = dateStr.split(/[\/\s]/);
        const [hours, minutes, seconds] = time.split(":");
        return new Date(year, month - 1, day, hours, minutes, seconds);
    };

    const date1 = parseDate(dateStr1);
    const date2 = parseDate(dateStr2);

    return Math.abs(date2 - date1);
}

function toggle_note_lock(id) {
	let note = base_notes[id];
	note.locked = !note.locked;

	let lockButton = document.getElementById(`notes_${id}_l`);
	if (note.locked) {
		lockButton.innerHTML = '<i class="fas fa-lock"></i>';
	} else {
		lockButton.innerHTML = '<i class="fas fa-lock-open"></i>';
	}

	let textarea = document.getElementById(`note_${id}_content`);
	textarea.readOnly = note.locked;
}

function toggle_note_visibility(id) {
	let note = base_notes[id];
	note.visibleOnCanvas = !note.visibleOnCanvas;

	let eyeButton = document.getElementById(`notes_${id}_v`);
	if (note.visibleOnCanvas) {
		eyeButton.innerHTML = '<i class="fas fa-eye"></i>';
		eyeButton.classList.remove("toggle-off");
		eyeButton.classList.add("toggle-on");
	} else {
		eyeButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
		eyeButton.classList.remove("toggle-on");
		eyeButton.classList.add("toggle-off");
	}

	if (typeof draw_notes === "function" && typeof canvas !== "undefined") {
		draw_notes(canvas);
	}
}

function change_note_pid(id, value) {
	let note = base_notes[id];
	if (!note.locked) {
		note.pid = parseInt(value);
	} else {
		document.getElementById(`${id}_note_pid`).value = note.pid;
	}
}
