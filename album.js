
var last = "";
var last_album = "";
var last_image = "";
var last_index_section = 0;
var last_album_section = 0;
var slideshow = false;
var slideshowinterval;
var help = false;

function get_thumb_of(name) {
	if (name.match(".ogv"))
		return name.replace(".ogv", ".thm");
	if (name.match(".OGV"))
		return name.replace(".OGV", ".THM");
	if (name.match(".mp4"))
		return name.replace(".mp4", ".thm");
	if (name.match(".MP4"))
		return name.replace(".MP4", ".THM");
	if (name.match(".avi"))
		return name.replace(".avi", ".thm");
	if (name.match(".AVI"))
		return name.replace(".AVI", ".THM");
	return name;
}

function find_album(a) {
	for (x = 0; x < albums.length - 1; x++)
		if (albums[x].name == a)
			return x;
	return -1;
}

function find_image(x, i) {
	for (y = 0; y < albums[x].images.length - 1; y++)
		if (albums[x].images[y].name == i)
			return y;
	return -1;
}

function block(b) {
	var r = "<div style=\"display: inline-block; float: left; height: 120px; width: 120px; line-height: 120px;\">" +
		b +
		"</div>\n";
	return r;
}

function rblock(b) {
	var r = "<div style=\"display: inline-block; float: right; height: 120px; width: 120px; line-height: 120px;\">" +
		b +
		"</div>\n";
	return r;
}

function thumb(a, i, s) {
	var r = "<a href=\"javascript:select(&quot;" + albums[a].name + "&quot;, &quot;" + albums[a].images[i].name  + "&quot;)\">" +
		"<img ";
	if (s != 0)
		r += "class=\"selected\" ";
	r += " ) + style=\"vertical-align: middle;\" src=\"image.php?r=1&amp;s=100&amp;i=" + albums[a].name + "/" + get_thumb_of(albums[a].images[i].name) +"\" /></a>";
	return block(r);
}

function object(x, y) {
	var r = "";
	var o = albums[x].images[y].name;

	if (o.match(".avi") || o.match(".AVI")) {
		r += "<embed autoplay=\"true\" autostart=\"true\" uimode=\"true\" type=\"application/x-mplayer2\" id=\"MediaPlayer\" src=\"/" + album + "/" + entry + "\" style=\"visibility: visible;\" height=\"480\" width=\"640\" pluginspage=\"http://www.microsoft.com/windows/windowsmedia/download/\">\n";
	} else if (o.match(".mp4") || o.match(".MP4")) {
		// Video display
		r += "<video controls><source src=\"" + albums[x].name + "/" + o + "\" type='video/mp4; codecs=\"avc1.42E01E, mp4a.40.2\"'></video>";
	} else if ( o.match(".ogv") || o.match(".OGV")) {
		// Video display
		r += "<embed autoplay=\"true\" autostart=\"true\" uimode=\"true\" type=\"application/x-mplayer2\" id=\"MediaPlayer\" src=\"/" + albums[x].name + "/" + o + "\" style=\"visibility: visible;\" height=\"480\" width=\"640\" pluginspage=\"http://www.microsoft.com/windows/windowsmedia/download/\">\n";
		r += "<h6>This video is Ogg/Theora encoded. You'll have to use Firefox or Chrome to watch this video</h6>";
	} else {
		// image display
		r += "<img class=\"selected\" usemap=\"#map-" + o + "\" title=\'" + o + "\' src=\"image.php?r=1&amp;s=800&amp;i=" + albums[x].name + "/" + o + "\" />\n";
	}
	return r;
}

function select(a, i) {

	if (a == "") {
		// display album list
		var c = "";

		// calculate which section to display
		var s_start = Math.min((last_index_section * 10), Math.min((albums.length - 1) / 10) * 10);
		var s_end = Math.min(s_start + 10, (albums.length - 1));

		c += "<div style=\"display: inline-block;\">\n";
		if (last_index_section > 0)
			c += block("<a href=\"javascript:last_index_section--; select(&quot;&quot, &quot,&quot;)\"><img class=\"arrow\" src=\"go-previous.png\" alt=\"back\" /></a>");
		else
			c += block("&nbsp;");
		c += "<div style=\"display: inline-block; float: left; width: 620px;\">\n";
		for (x = s_start; x < s_end; x++) {
			c += "<div style=\"display: inline-block;\"><a href=\"javascript:select(&quot;" + albums[x].name + "&quot, &quot;&quot;)\">" + albums[x].name + "</a></div>\n";
			c += "<div style=\"clear: both;\"></div>\n";
			for (y = 0; y < Math.min(5, albums[x].images.length - 1); y++) {
				c += thumb(x, y, 0);
			}
			c += "<div style=\"clear: both;\"></div>\n";
		}
		c += "</div>\n";
		if (last_index_section + 1 < (albums.length - 1) / 10)
			c += rblock("<a href=\"javascript:last_index_section++; select(&quot;&quot, &quot,&quot;)\"><img class=\"arrow\" src=\"go-next.png\" alt=\"forward\" /></a>");
		else
			c += rblock("&nbsp;");
		c += "</div>";

		document.getElementById('content').innerHTML = c;

		var t = "";
		t += "<a href=\"javascript:init()\">[index]</a>&nbsp;";
		t += "( " + (s_start + 1) + " - " + s_end + " / " + (albums.length - 1) + " )\n";

		document.getElementById('title').innerHTML = t;

		last = "index";

		return;
	} else if (i == "") {
		// display album overview page
		var c = "";
		var x = find_album(a);

		// calculate which section to display
		if (last_album != a)
			last_album_section = 0;
		var s_start = Math.min((last_album_section * 25), Math.min((albums[x].images.length - 1) / 25) * 25);
		var s_end = Math.min(s_start + 25, (albums[x].images.length - 1));

		c += "<div style=\"display: inline-block;\">\n";
		if (last_album_section > 0)
			c += block("<a href=\"javascript:last_album_section--; select(&quot;" + a + "&quot, &quot&quot;)\"><img class=\"arrow\" src=\"go-previous.png\" alt=\"back\" /></a>");
		else
			c += block("&nbsp;");
		c += "<div style=\"display: inline-block; float: middle; width: 620px;\">\n";
		for (y = s_start; y < s_end; y++ ) {
			if (y % 5 == 0)
				c += "<div style=\"display: inline-block; float:left; height: 120px; width: 0px; display: table-cell; line-height: 120px; vertical-align: middle;\"></div>\n";
			c += thumb(x, y, 0);
			if (y % 5 == 4)
				c += "<div style=\"clear: both;\"></div>\n";
		}
		c += "</div>";
		if (last_album_section + 1 < (albums[x].images.length - 1) / 25)
			c += rblock("<a href=\"javascript:last_album_section++; select(&quot;" + a + "&quot, &quot&quot;)\"><img class=\"arrow\" src=\"go-next.png\" alt=\"forward\" /></a>");
		else
			c += rblock("&nbsp;");
		c += "</div>";

		document.getElementById('content').innerHTML = c;

		var t = "";
		t += "<a href=\"javascript:init()\">[index]</a>&nbsp;";
		t += "<a href=\"javascript:select(&quot;" + a + "&quot;, &quot;&quot;)\">[" + a + "]</a>&nbsp;";
		t += "( " + (s_start + 1) + " - " + s_end + " / " + (albums[x].images.length - 1) + " )\n";

		document.getElementById('title').innerHTML = t;

		last_album = albums[x].name;
		last = "album";

		return;
	} else {
		// display image
		var c = "";
		var x = find_album(a);
		var y = find_image(x, i);

		// navigation
		c += "<div id=\"navigation\" style=\"display: inline-block;\">\n";
		if (y > 4)
			c += block("<a href=\"javascript:select(&quot;" + a + "&quot, &quot;" + albums[x].images[y-4].name + "&quot;)\"><img class=\"arrow\" src=\"go-previous.png\" alt=\"back\" /></a>");
		else
			c += block("&nbsp;");
		for (z = Math.max(0, y - 4); z <= Math.min(y + 4, albums[x].images.length - 2); z++) {
			c += thumb(x, z, (z == y));
		}
		if (y <= albums[x].images.length - 6)
			c += rblock("<a href=\"javascript:select(&quot;" + a + "&quot, &quot;" + albums[x].images[y+4].name + "&quot;)\"><img class=\"arrow\" src=\"go-next.png\" alt=\"forward\" /></a>");
		else
			c += rblock("&nbsp;");
		c += "</div>\n";
		c += "<div style=\"clear: both;\"></div>\n";

		// image
		c += "<div id=\"image\" style=\"display: inline-block;\">\n";
		if (y > 0)
			c += block("<a href=\"javascript:select(&quot;" + a + "&quot, &quot;" + albums[x].images[y-1].name + "&quot;)\"><img class=\"arrow\" src=\"go-previous.png\" alt=\"back\" /></a>");
		else
			c += block("&nbsp;");
		c += "<div style=\"display: inline-block; float: left; height: 840px; width: 840px; line-height: 120px;\">";
		c += object(x,y);
		c += "</div>\n";
		if (y < albums[x].images.length - 2)
			c += rblock("<a href=\"javascript:select(&quot;" + a + "&quot, &quot;" + albums[x].images[y+1].name + "&quot;)\"><img class=\"arrow\" src=\"go-next.png\" alt=\"forward\" /></a>");
		else
			c += rblock("&nbsp;");
		c += "<div style=\"clear: both;\"></div>\n";

		c += "</div>\n";

		document.getElementById('content').innerHTML = c;

		var t = "";
		t += "<a href=\"javascript:init()\">[index]</a>&nbsp;";
		t += "<a href=\"javascript:select(&quot;" + a + "&quot;, &quot;&quot;)\">[" + a + "]</a>&nbsp;";
		t += "<a href=\"/" + albums[x].name + "/" + albums[x].images[y].name + "\">[" + albums[x].images[y].name + "]</a>&nbsp;";
		t += "( " + (y + 1) + " / " + (albums[x].images.length - 1) + " )\n";

		document.getElementById('title').innerHTML = t;

		last_album = albums[x].name;
		last_image = albums[x].images[y].name;
		last = "image";

		return;
	}
}

function run_slideshow() {
	var x = find_album(last_album);
	var y = find_image(x, last_image);
	if (y < albums[x].images.length - 2)
		select(last_album, albums[x].images[y+1].name);
	else
		select(last_album, albums[x].images[0].name);
}

function do_help() {
	var c = "";
	if (help) {
		help = false;
		if (last == "image")
			select(last_album, last_image);
		else if (last == "album")
			select(last_album, "")
		else
			select("", "");
		return;
	}
	help = true;

	c += "<div id=\"navigation\" style=\"display: inline-block; text-align: left;\">\n";

	c += "<h2>Photo Album Help</h2>\n";
	c += "<pre>\n";
	c += "Keyboard navigation:\n\n";
	c += "Key        Action\n"
	c += "=========  ======\n"
	c += "End        Go to the last page or photo\n";
	c += "PgDn       Go to the next page\n";
	c += "Right      Go to the next page or photo\n";
	c += "n          Go to the next page or photo\n";
	c += "Space      Go to the next page or photo\n";
	c += "Down       Go back into the album or image\n\n";
	c += "Home       Go to the first page or photo\n";
	c += "PgUp       Go to the previous page\n";
	c += "Left       Go to the previous page or photo\n";
	c += "p          Go to the previous page or photo\n";
	c += "Backspace  Go to the previous page or photo\n";
	c += "Up         Go back to the album or index\n\n";
	c += "s          Start or stop the slideshow\n\n";
	c += "h          Show or leave this help screen\n";
	c += "</pre>\n";

	c += "</div>\n";
	document.getElementById('content').innerHTML = c;
}

function keypressed(e) {
	e = e || window.event;

	var k = e.keyCode || e.which;

	switch(k) {
	case 33: // pgup
		if (last == "image") {
			var x = find_album(last_album);
			var y = find_image(x, last_image);
			select(last_album, albums[x].images[Math.max(0, y - 5)].name);
		} else if (last == "album") {
			if (last_album_section > 0) {
				last_album_section--;
				select(last_album, "");
			}
		} else {
			if (last_index_section > 0) {
				last_index_section--;
				select("", "");
			}
		}
		break;
	case 34: // pgdn
		if (last == "image") {
			var x = find_album(last_album);
			var y = find_image(x, last_image);
			select(last_album, albums[x].images[Math.min( y + 5, albums[x].images.length - 2)].name);
		} else if (last == "album") {
			var x = find_album(last_album);
			if (last_album_section < Math.floor((albums[x].images.length - 2) / 25)) {
				last_album_section++;
				select(last_album, "");
			}
		} else {
			var x = find_album(last_album);
			if (last_index_section < Math.floor((albums.length - 1) / 10)) {
				last_index_section++;
				select("", "");
			}
		}
		break;
	case 35: // end
		if (last == "image") {
			var x = find_album(last_album);
			select(last_album, albums[x].images[albums[x].images.length - 2].name);
		} else if (last == "album") {
			var x = find_album(last_album);
			last_album_section = Math.floor((albums[x].images.length - 2) / 25);
			select(last_album, "");
		} else {
			last_index_section = Math.floor((albums.length - 2) / 10);
			select("", "");
		}
		break;
	case 36: // home
		if (last == "image") {
			var x = find_album(last_album);
			select(last_album, albums[x].images[0].name);
		} else if (last == "album") {
			last_album_section = 0;
			select(last_album, "");
		} else {
			last_index_section = 0;
			init();
		}
		break;
	case 78: // n
	case 32: // space
	case 39: // right
		if (last == "image") {
			var x = find_album(last_album);
			var y = find_image(x, last_image);
			if (y < albums[x].images.length - 2)
				select(last_album, albums[x].images[y+1].name);
		} else if (last == "album") {
			var x = find_album(last_album);
			if (last_album_section < Math.floor((albums[x].images.length - 2) / 25)) {
				last_album_section++;
				select(last_album, "");
			}
		} else {
			var x = find_album(last_album);
			if (last_index_section < Math.floor((albums.length - 1) / 10)) {
				last_index_section++;
				select("", "");
			}
		}
		break;
	case 80: // p
	case 8:  // backspace
	case 37: // left
		if (last == "image") {
			var x = find_album(last_album);
			var y = find_image(x, last_image);
			if (y > 0)
				select(last_album, albums[x].images[y-1].name);
		} else if (last == "album") {
			if (last_album_section > 0) {
				last_album_section--;
				select(last_album, "");
			}
		} else {
			if (last_index_section > 0) {
				last_index_section--;
				select("", "");
			}
		}
		break;
	case 85: // u
	case 38: // up
		if (last == "image") {
			last = "album";
			select(last_album, "");
		} else {
			last = "index";
			select("", "");
		}
		break;
	case 68: // d
	case 40: // down
		if (last == "index") {
			last = "album";
			select(last_album, "");
		} else {
			last = "image";
			select(last_album, last_image);
		}
		break;
	case 83: // s
		if (slideshow) {
			slideshow = false;
			window.clearInterval(slideshowinterval);
		} else {
			if (last == "image") {
				slideshow = true;
				slideshowinterval = window.setInterval(run_slideshow, 5000);
			}
		}
		break;
	case 72: // h
		do_help();
		break;
	default:
		// alert(k);
		break;
	}
	
	return true;
}

document.onkeydown = keypressed;

function init() {
	// sort albums reverse - newest ones come first
	albums.sort(function(a, b) { return ((a.name < b.name) ? 1:-1); });
	// sort images normal order
	for (x = 0; x < albums.length - 1; x++)
		albums[x].images.sort(function(a, b) { return((a.name > b.name) ? 1:-1); });
	last_index_section=0;
	select("", "");
}

