
function get_thumb_of(name) {
	if (name.match(".avi"))
		return name.replace(".avi", ".thm");
	if (name.match(".AVI"))
		return name.replace(".AVI", ".THM");
	return name;
}

var hash = null;

function anchor() {
	var anchor;

	if (hash != document.location.hash) {
		// store complete hash including #
		hash = document.location.hash;
		// but strip # for anchor part to pass to select()
		anchor = hash.substring(1);
		// when opening from the index, assume no anchor
		if (hash == "")
			anchor = "all"; //entries[0];
	} else {
		anchor = "all"; //entries[0];
	}

	return anchor;
}

function select(entry) {
	var selected = 0;

	for (count = 0; count < entries.length; count++)
		if (entry == entries[count])
			selected = count;
	
	// are we looking at an album index?
	if (entry == "all") {
		var thumbs = "<div style=\"display: inline-block; text-align: center; line-height: 120px;\">\n";
		// paint all the thumbnails
		for (count = 0; count < entries.length; count++) {
			var thumbnailimage = get_thumb_of(entries[count]);
			if ((count % 5) == 0)
				thumbs += "<div style=\"clear: both;\"></div>\n";
			thumbs += "<div style=\"float: left; height: 120px; width: 120px;\"><a href=\"javascript: select('" + entries[count] + "')\">";
// doesn't work because backrefs are broken atm
// thumbs += "<div style=\"float: left; height: 120px; width: 120px;\"><a href=\"/" + album + "/#" + entries[count] + "\">";
			thumbs += "<img style=\"vertical-align: middle;\" src=\"/image.php?r=1&amp;x=100&amp;y=100&amp;i=" + album + "/" + thumbnailimage + "\" /></a>&nbsp;\n</div>\n";
		}
		thumbs += "</div>\n";

		// Finished constructing the thumbs div
		document.getElementById('thumbs').innerHTML = thumbs;
		document.selected = -1; 
		return;
	}

	// determine the range over 9 images to show
	var start = Math.max(selected - 4, 0);
	start = Math.min(start, Math.max(0, entries.length - 9));
	var stop = Math.min(start + 9, entries.length);

	// links to previous 9 images in the thumbs index
	var thumbs = "";
	if (start > 0) {
		var center = Math.max(selected - 9, 0);
		thumbs += "<a href=\"javascript: select('" + entries[center] + "');\"><img class=\"arrow\" src=\"/go-previous.png\" /></a>\n";
	}

	// show images start -> stop and put "entry" in display box
	for (count = start; count < stop; count++) {
		// thumbnail this
		var thumbnailimage = get_thumb_of(entries[count]);
		thumbs += "<a href=\"javascript: select('" + entries[count] + "')\"><img style=\"vertical-align: text-top;\" ";
		if (selected == count) {
			thumbs += "class=\"selected\" ";
		}
		if (Math.abs(selected - count) <= 1) {
			thumbs += "src=\"/image.php?r=1&amp;x=100&amp;y=100&amp;i=" + album + "/" + thumbnailimage + "\" /></a>&nbsp;\n";
		} else {
			thumbs += "src=\"/image.php?r=1&amp;x=50&amp;y=50&amp;i=" + album + "/" + thumbnailimage + "\" /></a>&nbsp;\n";
		}
	}

	// fill preload div
	var preload = "";
	if (stop < entries.length) {
		var thumbnailimage = get_thumb_of(entries[stop]);
		preload += "<img src=\"/image.php?r=1&amp;x=50&amp;y=50&amp;i=" + album + "/" + thumbnailimage + "\" />\n";
	}

	if (selected + 2 < entries.length) {
		var thumbnailimage = get_thumb_of(entries[selected + 2]);
		preload += "<img src=\"/image.php?r=1&amp;x=100&amp;y=100&amp;i=" + album + "/" + thumbnailimage + "\" />\n";
	}

	if ((selected + 1) < entries.length) {
		if (!(entry.match(".avi") || entry.match(".AVI"))) {
			preload += "<img src=\"/image.php?r=1&amp;x=800&amp;y=800&amp;i=" + album + "/" + entries[selected + 1] + "\" />\n";
		}
	}
	document.getElementById('preload').innerHTML = preload;

	// links to next 9 images in the thumbs index
	if (stop < entries.length) {
		var center = Math.min(stop + 5, entries.length)
		thumbs += "<a href=\"javascript: select('" + entries[center - 1] + "');\"><img class=\"arrow\" src=\"/go-next.png\" /></a>\n";
	}

	// Finished constructing the thumbs div
	document.getElementById('thumbs').innerHTML = thumbs;

	var content = "\n";

	// construct the map
	content += "<map name=\"map-" + entry + "\">\n";
	if (selected > 0) {
		content += "<area shape=\"rect\" coords=\"0,0,250,800\" href=\"javascript: select('" + entries[selected - 1] + "')\" />\n";
	}
	if (selected < (entries.length - 1)) {
		content += "<area shape=\"rect\" coords=\"400,0,800,800\" href=\"javascript: select('" + entries[selected + 1] + "')\" />\n";
	}
	content += "</map>\n";
	
	if (selected > 0) {
		content += "<a href=\"javascript: select('" + entries[selected - 1]+ "');\"><img class=\"arrow\" src=\"/go-previous.png\" /></a>\n";
	}

	// display selected image
	if (entry.match(".avi") || entry.match(".AVI")) {
		// Video display
		content += "<embed autoplay=\"true\" autostart=\"true\" uimode=\"true\" type=\"application/x-mplayer2\" id=\"MediaPlayer\" src=\"/" + album + "/" + entry + "\" style=\"visibility: visible;\" height=\"480\" width=\"640\" pluginspage=\"http://www.microsoft.com/windows/windowsmedia/download/\">\n";
	} else {
		// image display
		content += "<img class=\"selected\" usemap=\"#map-" + entry + "\" title=\'" + titles[selected] + "\' src=\"/image.php?r=1&amp;x=800&amp;y=800&amp;i=" + album + "/" + entry + "\" />\n";
	}

	if (selected + 1 < entries.length)
		content += "<a href=\"javascript: select('" + entries[selected + 1] + "');\"><img class=\"arrow\" src=\"/go-next.png\" /></a>\n";

	content += "<br />\n" + album + " / " + "<a href=\"/" + album + "/" + entry + "\">" + entry + "</a>\n";

	// and display
	document.getElementById('content').innerHTML = content;
	document.location.hash = entry;
	document.selected = selected;
}

function keypressed(e) {
	e = e || window.event;

	var k = e.keyCode || e.which;

	switch(k) {
	case 78: //left
	case 32: // space
	case 39: // right
		if (document.selected < entries.length - 1)
			select(entries[document.selected + 1]);
		break;
	case 80: // p
	case 8:  // backspace
	case 37: // left
		if (document.selected > 0)
			select(entries[document.selected - 1]);
		break;
	case 38: // up
		select("all");
		break;
	case 40: // down
		if (document.selected > 0)
			select(entries[document.selected]);
		break;
	default:
		//alert(k);
		break;
	}
	
	return true;
}

document.onkeydown = keypressed;

