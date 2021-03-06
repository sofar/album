
//
// (C) 2010-2012 - Auke Kok <auke@foo-projects.org>
//

// This file is part of Album.
//
//   Album is free software: you can redistribute it and/or modify
//   it under the terms of the GNU Affero General Public License as published by
//   the Free Software Foundation, either version 3 of the License, or
//   (at your option) any later version.
//
//   Album is distributed in the hope that it will be useful,
//   but WITHOUT ANY WARRANTY; without even the implied warranty of
//   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//   GNU General Public License for more details.
//
//   You should have received a copy of the GNU Affero General Public License
//   along with Album.  If not, see <http://www.gnu.org/licenses/>.

var last = "";
var last_album = -1;
var last_image = -1;
var last_index_section = 0;
var last_album_section = 0;
var fullscreen = false;
var slideshow = false;
var slideshowrandom = false;
var slideshowinterval;
var slideshowspeed = 5;
var help = false;
var preloads = [];
var supports_mpeg4 = false;
var supports_h264 = false;
var supports_ogg = false;
var supports_webm = false;
var stream = [];
var stream_mode = false;

// sizes
var size_i = 10;  // album lines on the index page
var size_il = 5;  // thumbs per line on the index page
var size_a = 5;   // thumblines on the album page
var size_al = 5;  // thumbs per line on the album page
var size_n = 4;   // navigation line size either way on image page

function u(name) {
	return encodeURIComponent(name);
}

function setCookie(name, value) {
	var date = new Date();
	date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
	var expires = "; expires=" + date.toGMTString();
	document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ')
			c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0)
			return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function get_thumb_of(name) {
	if (name.match(".ogv"))
		return name.replace(".ogv", ".thm");
	if (name.match(".OGV"))
		return name.replace(".OGV", ".thm");
	if (name.match(".mp4"))
		return name.replace(".mp4", ".thm");
	if (name.match(".MP4"))
		return name.replace(".MP4", ".thm");
	if (name.match(".avi"))
		return name.replace(".avi", ".thm");
	if (name.match(".AVI"))
		return name.replace(".AVI", ".thm");
	return name;
}

function imgurl(a, i, size) {
	return "image.php?r=1&u=" + albums[a].owner + "&s=" + size + "&i=" + u(albums[a].name) + "/" + u(get_thumb_of(albums[a].images[i].name));
}

function preload(a, i, size) {
	if (preloads.length > 100)
		preloads.splice(0, 50);
	preloads[preloads.length] = new Image();
	preloads[preloads.length - 1].src = imgurl(a, i, size);
}

function format_is_supported(a, i) {
	name = albums[a].images[i].name;
	// Test compatibility for these per browser
	if ((name.match(".ogv")) && supports_ogg)
		return true;
	if ((name.match(".OGV")) && supports_ogg)
		return true;
	if ((name.match(".mp4")) && (supports_mpeg4 || supports_h264))
		return true;
	if ((name.match(".MP4")) && (supports_mpeg4 || supports_h264))
		return true;

	// try and support all non-altable formats
	if (!albums[a].images[i].alts)
		return true;

	// Check for supported alts:
	if ((name.match(".mpg")) ||
	    (name.match(".MPG")) ||
	    (name.match(".mpeg")) ||
	    (name.match(".MPEG")) ||
	    (name.match(".avi")) ||
	    (name.match(".AVI"))) {
		for (z = 0; z < albums[a].images[i].alts.length; z++) {
			alt = albums[a].images[i].alts[z];
			if ((alt.match(".ogv")) && supports_ogg)
				return true;
			if ((alt.match(".mp4")) && (supports_mpeg4 || supports_h264))
				return true;
		}
		return false;
	}

	// The rest is always supported
	return true;
}

function find_album(a) {
	for (x = 0; x < albums.length; x++)
		if (albums[x].name == a)
			return x;
	return -1;
}

function find_image(a, i) {
	for (y = 0; y < albums[a].images.length; y++)
		if (albums[a].images[y].name == i)
			return y;
	return -1;
}

function block(b) {
	return "<div id=\"block\">" + b + "</div>\n";
}

function rblock(b) {
	var r = "<div id=\"block\" style=\"float: right;\">" +
		b +
		"</div>\n";
	return r;
}

function loadexif(o, a, i) {
	if (window.XMLHttpRequest) {
		request = new XMLHttpRequest();
	} else if (window.ActiveXObject) {
		request = new ActiveXObject("Microsoft.XMLHTTP");
	}
	request.onreadystatechange = function() {
		if ((request.readyState == 4) && (request.status == 200)) {
			title = request.responseText;
			o.title = request.responseText;
		}
	};
	request.open('GET', "exif.php?u=" + albums[a].owner + "&i=" + u(albums[a].name + "/" + albums[a].images[i].name), true);
	request.send();
}

function thumb(a, i, s) {
	var t = get_thumb_of(albums[a].images[i].name);
	var r = "<a href=\"javascript:select(" + a + ", " + i + ")\">" +
		"<img ";
	if (t.match(".thm")) {
		if (s == 0)
			r += "class=\"thm\" ";
		else
			r += "class=\"thm_selected\" ";
	}
	if (s != 0)
		r += "class=\"selected\" ";
	r += "alt=\"" + albums[a].images[i].name + "\" ";
	r += "title=\"(loading image information)\" ";
	r += "onMouseOver=\"loadexif(this, " + a + ", " + i + ")\" ";
	r += "style=\"vertical-align: middle;\" src=\"" + imgurl(a, i, 100) + "\" /></a>";
	return block(r);
}

function fsz() {
	// For really large displays, display the native format
	if ((document.body.clientWidth > 1000) && (document.body.clientHeight > 1000))
		return 0;
	return 800;
}

function fs(image) {
	var p = document.body;
	var w = p.clientWidth - 20; // margin
	var h = p.clientHeight - 20 - 40; // margin + navigation
	var iw = image.naturalWidth;
	var ih = image.naturalHeight;
	var ratio = Math.min(w / iw, h / ih);
	image.width = iw * ratio;
	image.height = ih * ratio;
}

function object(a, i) {
	var r = "";
	var o = albums[a].images[i].name;

	if (o.match(".mp4") || o.match(".MP4") ||
	    o.match(".ogv") || o.match(".OGV") ||
	    o.match(".mpg") || o.match(".MPG") ||
	    o.match(".mpeg") || o.match(".MPEG") ||
	    o.match(".avi") || o.match(".AVI")) {
		if (!albums[a].images[i].alts)
			return "<p>Unsupported file format</p>\n";
		// Video display
		r += "<div style=\"display: inline-block;\">";
		r += "<video controls=\"controls\">";
		for (z = 0; z < albums[a].images[i].alts.length; z++) {
			alt = albums[a].images[i].alts[z];
			if ((alt.match(".mp4") && (supports_mpeg4 || supports_h264)))
				r += "<source src=\"image.php?s=0&r=0&u=" + albums[a].owner + "&i=" + u(albums[a].name) + "/" + alt + "\" type=\"video/mp4\" />";
			if ((alt.match(".ogv") && supports_ogg))
				r += "<source src=\"image.php?s=0&r=0&u=" + albums[a].owner + "&i=" + u(albums[a].name) + "/" + alt + "\" type=\"video/ogg\" />";
		}
		r += "Video not playing? Click the link above to download the file and play locally.";
		r += "</video controls>";
		r += "</div>\n";
	} else {
		// image display
		if (!fullscreen) {
			r += "<div style=\"display: inline-block; float: left; height: 840px; width: 840px; line-height: 120px;\">";
			r += "<map name=\"map-" + o + "\">\n";
			if ((stream_mode && (albums[a].images[i].s > 0)) || (i > 0))
				r += "<area shape=\"rect\" coords=\"0,0,250,800\" href=\"javascript: select(" + a + ", " + (stream_mode ? albums[a].images[i].s-1 : i-1) + ")\" />\n";
			if ((stream_mode && (albums[a].images[i].s < (stream.length - 1))) || (i < albums[a].images.length - 1))
				r += "<area shape=\"rect\" coords=\"400,0,800,800\" href=\"javascript: select(" + a + ", " + (stream_mode ? albums[a].images[i].s+1 : i+1) + ")\" />\n";
			r += "</map>\n";

			r += "<img class=\"selected\" alt=\"" + o + "\" usemap=\"#map-" + o + "\" title=\'" + o + "\' src=\"" + imgurl(a, i, 800) + "\" onmouseover=\"loadexif(this, " + a + ", " + i + ")\"/>\n";
			r += "</div>\n";
		} else {
			r += "<img class=\"selected\" alt=\"" + o + "\" title=\'" + o + "\' src=\"" + imgurl(a, i, fsz()) + "\" onload=\"fs(this);\" onmouseover=\"loadexif(this, " + a + ", " + i + ")\"/>\n";
		}
	}
	return r;
}

function select(a, i) {

	if (stream_mode) {
		// display image
		var c = "";

		if (i == -1)
			i = 0;

		c += "<div id=\"image\" style=\"display: inline-block;\">\n";
		// translate stream to album
		if (i > 0)
			c += block("<a href=\"javascript:select(-1, " + (i - 1) + ")\"><img class=\"arrow\" src=\"go-previous.png\" alt=\"back\" /></a>");

		sa = stream[i].a;
		si = stream[i].i;
		c += object(sa,si);

		if (i < stream.length - 1)
			c += block("<a href=\"javascript:select(-1, " + (i + 1) + ")\"><img class=\"arrow\" src=\"go-next.png\" alt=\"forward\" /></a>");

		c += "<div style=\"clear: both;\"></div>\n";

		document.getElementById('content').innerHTML = c;

		last_image = i;

		return true;
	}

	if (a == -1) {
		// display album list
		var c = "";

		// calculate which section to display
		var s_start = Math.min((last_index_section * size_i), Math.min((albums.length) / size_i) * size_i);
		var s_end = Math.min(s_start + size_i, (albums.length));

		c += "<div style=\"display: inline-block;\">\n";
		if (last_index_section > 0)
			c += block("<a href=\"javascript:last_index_section--; select(-1, -1)\"><img class=\"arrow\" src=\"go-previous.png\" alt=\"back\" /></a>");
		else
			c += block("&nbsp;");
		c += "<div style=\"display: inline-block; float: left; width: " + ((size_il * 120) + 20 ) + "px;\">\n";
		for (x = s_start; x < s_end; x++) {
			c += "<div style=\"display: inline-block;\"><a href=\"javascript:select(" + x + ", -1)\">" + u(albums[x].name) + "</a><i class=\"owner\">&nbsp;-&nbsp;" + users[albums[x].owner] + "</i></div>\n";
			c += "<div style=\"clear: both;\"></div>\n";
			for (y = 0; y < Math.min(size_il, albums[x].images.length); y++) {
				c += thumb(x, y, 0);
			}
			c += "<div style=\"clear: both;\"></div>\n";
		}
		c += "</div>\n";
		if (last_index_section + 1 < albums.length / size_i)
			c += rblock("<a href=\"javascript:last_index_section++; select(-1, -1)\"><img class=\"arrow\" src=\"go-next.png\" alt=\"forward\" /></a>");
		else
			c += rblock("&nbsp;");
		c += "</div>";

		document.getElementById('content').innerHTML = c;

		var t = "";
		t += "<a href=\"javascript:init()\">[index]</a>&nbsp;";
		t += "( " + (s_start + 1) + " - " + s_end + " / " + albums.length + " )\n";

		document.getElementById('title').innerHTML = t;

		last = "index";

		return;
	} else if (i == -1) {
		// display album overview page
		var c = "";

		// calculate which section to display
		if (last_album != a)
			last_album_section = 0;
		var s_start = Math.min((last_album_section * (size_a * size_al)), Math.min(albums[a].images.length / (size_a * size_al)) * (size_a * size_al));
		var s_end = Math.min(s_start + (size_a * size_al), albums[a].images.length);

		c += "<div style=\"display: inline-block;\">\n";
		if (last_album_section > 0)
			c += block("<a href=\"javascript:last_album_section--; select(" + a + ", -1)\"><img class=\"arrow\" src=\"go-previous.png\" alt=\"back\" /></a>");
		else
			c += block("&nbsp;");
		c += "<div style=\"display: inline-block; width: " + ((size_al * 120) + 20) + "px;\">\n";
		for (y = s_start; y < s_end; y++ ) {
			if (y % size_al == 0)
				c += "<div style=\"display: inline-block; float:left; height: 120px; width: 0px; display: table-cell; line-height: 120px; vertical-align: middle;\"></div>\n";
			c += thumb(a, y, 0);
			if (y % size_al == size_al - 1)
				c += "<div style=\"clear: both;\"></div>\n";
		}
		c += "</div>";
		if (last_album_section + 1 < albums[a].images.length / (size_a * size_al))
			c += rblock("<a href=\"javascript:last_album_section++; select(" + a + ", -1)\"><img class=\"arrow\" src=\"go-next.png\" alt=\"forward\" /></a>");
		else
			c += rblock("&nbsp;");
		c += "</div>";

		document.getElementById('content').innerHTML = c;

		var t = "";
		t += "<a href=\"javascript:select(-1, -1)\">[index]</a>&nbsp;";
		t += "<a href=\"javascript:select(" + a + ", -1)\">[" + u(albums[a].name) + "]</a>&nbsp;";
		t += "( " + (s_start + 1) + " - " + s_end + " / " + albums[a].images.length + " )\n";

		document.getElementById('title').innerHTML = t;

		last_album = a;
		last = "album";

		return;
	} else {
		// display image
		var c = "";

		if (!fullscreen) {
			// navigation
			c += "<div id=\"navigation\" style=\"display: inline-block;\">\n";
			if (i > size_n)
				c += block("<a href=\"javascript:select(" + a + ", " + (i-size_n) + ")\"><img class=\"arrow\" src=\"go-previous.png\" alt=\"back\" /></a>");
			else
				c += block("&nbsp;");
			for (z = Math.max(0, i - size_n); z <= Math.min(i + size_n, albums[a].images.length - 1); z++) {
				c += thumb(a, z, (z == i));
			}
			if (i <= albums[a].images.length - (size_n + 1)) {
				preload(a, i+size_n, 100);
				c += rblock("<a href=\"javascript:select(" + a + ", " + (i+size_n) + ")\"><img class=\"arrow\" src=\"go-next.png\" alt=\"forward\" /></a>");
			} else
				c += rblock("&nbsp;");
			c += "</div>\n";
			c += "<div style=\"clear: both;\"></div>\n";

			// image
			c += "<div id=\"image\" style=\"display: inline-block;\">\n";
			if (i > 0)
				c += block("<a href=\"javascript:select(" + a + ", " + (i-1) + ")\"><img class=\"arrow\" src=\"go-previous.png\" alt=\"back\" /></a>");
			else
				c += block("&nbsp;");
			c += object(a,i);
			if (i < albums[a].images.length - 1) {
				preload(a, i+1, fsz());
				c += rblock("<a href=\"javascript:select(" + a + ", " + (i+1) + ")\"><img class=\"arrow\" src=\"go-next.png\" alt=\"forward\" /></a>");
			} else
				c += rblock("&nbsp;");
			c += "<div style=\"clear: both;\"></div>\n";
		} else {
			if (i < albums[a].images.length - 1)
				preload(a, i+1, fsz());
			c += "<div id=\"fullscreen\">\n";
			c += object(a,i);
			c += "<div style=\"clear: both;\"></div>\n";
		}

		c += "</div>\n";

		document.getElementById('content').innerHTML = c;

		var t = "";
		t += "<a href=\"javascript:select(-1, -1)\">[index]</a>&nbsp;";
		t += "<a href=\"javascript:select(" + a + ", -1)\">[" + u(albums[a].name) + "]</a>&nbsp;";
		t += "<a href=\"/image.php?u=" + albums[a].owner + "&r=0&s=0&i=" + u(albums[a].name) + "/" + albums[a].images[i].name + "\">[" + u(albums[a].images[i].name) + "]</a>&nbsp;";
		t += "( " + (i + 1) + " / " + albums[a].images.length + " )\n";

		document.getElementById('title').innerHTML = t;

		last_album = a;
		last_image = i;
		last = "image";

		return;
	}
}

function run_slideshow() {
	if (slideshowrandom) {
		var x = Math.floor(Math.random() * albums.length);
		var y = Math.floor(Math.random() * albums[x].images.length);
		select(x, y);
	} else {
		var x = last_album;
		var y = last_image;
		if (y < albums[x].images.length - 1)
			select(x, y+1);
		else
			select(x, 0);
	}
}

function repaint() {
	if (last == "image")
		select(last_album, last_image);
	else if (last == "album")
		select(last_album, -1)
	else
		select(-1, -1);
}

function save_settings() {
	setCookie("settings", "size_i=" + size_i + ",size_il=" + size_il + ",size_a=" + size_a + ",size_al=" + size_al + ",size_n=" + size_n + ",fullscreen=" + fullscreen + ",slideshowspeed=" + slideshowspeed);
}

function load_settings() {
	var c = getCookie("settings");
	if (c) {
		var parts = c.split(",");
		for (i = 0; i < parts.length; i++)
			eval(parts[i]);
	}
}

function do_slideshow(random) {
	slideshowrandom = random;
	if (slideshow) {
		slideshow = false;
		window.clearInterval(slideshowinterval);
	} else {
		if (help) {
			help = false;
			repaint();
		}
		if (last == "image") {
			slideshow = true;
			slideshowinterval = window.setInterval(run_slideshow, slideshowspeed * 1000);
		}
	}
}

function do_fullscreen() {
	fullscreen = !fullscreen;
	save_settings();
	repaint();
}

function do_help() {
	var c = "";
	if (help) {
		help = false;
		save_settings();
		repaint();
		return;
	}
	help = true;

	c += "<div id=\"navigation\">\n";

	c += "<h2>Photo Album Help</h2>\n";
	c += "<pre>\n";

	if (last_album >= 0) {
		c += "Album owner: " + albums[last_album].owner + "\n\n";
	}

	c += "Keyboard navigation:\n\n";
	c += "Key        Action\n"
	c += "=========  ======\n"
	c += "End        Go to the last page or photo\n";
	c += "PgDn       Go to the next page\n";
	c += "Right      Go to the next page or photo\n";
	c += "n          Go to the next page or photo\n";
	c += "]          Go to the next album\n";
	c += "Space      Go to the next page or photo\n";
	c += "Down       Go back into the album or image\n\n";

	c += "Home       Go to the first page or photo\n";
	c += "PgUp       Go to the previous page\n";
	c += "Left       Go to the previous page or photo\n";
	c += "p          Go to the previous page or photo\n";
	c += "[          Go to the previous album\n";
	c += "Backspace  Go to the previous page or photo\n";
	c += "Up         Go back to the album or index\n\n";

	c += "s          Start or stop the <u><a title=\"slideshow\" href=\"#\" onclick=\"do_slideshow(false);\">slideshow</a></u>\n";
	c += "f          Toggle <u><a title=\"fullscreen\" href=\"#\" onclick=\"do_fullscreen();\">fullscreen</a></u> display\n";
	c += "h          Show or leave this help screen\n\n";

	c += "Settings\n";
	c += "========\n";

	c += "albums in the index page: ";
	c += "<a title=\"-\" href=\"#\" onclick=\"size_i = ( size_i <= 1 ) ? 1 : size_i - 1; document.getElementById('size_i').innerHTML = size_i; return false;\">-</a>";
	c += "&nbsp;<a id=\"size_i\">" + size_i + "</a>&nbsp;";
	c += "<a title=\"+\" href=\"#\" onclick=\"size_i++; document.getElementById('size_i').innerHTML = size_i; return false;\">+</a>\n";

	c += "thumbs per line in index: ";
	c += "<a title=\"-\" href=\"#\" onclick=\"size_il = ( size_il <= 1 ) ? 1 : size_il - 1; document.getElementById('size_il').innerHTML = size_il; return false;\">-</a>";
	c += "&nbsp;<a id=\"size_il\">" + size_il + "</a>&nbsp;";
	c += "<a title=\"+\" href=\"#\" onclick=\"size_il++; document.getElementById('size_il').innerHTML = size_il; return false;\">+</a>\n";

	c += "thumblines on the album:  ";
	c += "<a title=\"-\" href=\"#\" onclick=\"size_a = ( size_a <= 1 ) ? 1 : size_a - 1; document.getElementById('size_a').innerHTML = size_a; return false;\">-</a>";
	c += "&nbsp;<a id=\"size_a\">" + size_a + "</a>&nbsp;";
	c += "<a title=\"+\" href=\"#\" onclick=\"size_a++; document.getElementById('size_a').innerHTML = size_a; return false;\">+</a>\n";

	c += "thumbs per line in album: ";
	c += "<a title=\"-\" href=\"#\" onclick=\"size_al = ( size_al <= 1 ) ? 1 : size_al - 1; document.getElementById('size_al').innerHTML = size_al; return false;\">-</a>";
	c += "&nbsp;<a id=\"size_al\">" + size_al + "</a>&nbsp;";
	c += "<a title=\"+\" href=\"#\" onclick=\"size_al++; document.getElementById('size_al').innerHTML = size_al; return false;\">+</a>\n";

	c += "size of navigation line:  ";
	c += "<a title=\"-\" href=\"#\" onclick=\"size_n = ( size_n <= 1 ) ? 1 : size_n - 1; document.getElementById('size_n').innerHTML = size_n; return false;\">-</a>";
	c += "&nbsp;<a id=\"size_n\">" + size_n + "</a>&nbsp;";
	c += "<a title=\"+\" href=\"#\" onclick=\"size_n++; document.getElementById('size_n').innerHTML = size_n; return false;\">+</a>\n";

	c += "slideshow timer (s)    :  ";
	c += "<a title=\"-\" href=\"#\" onclick=\"slideshowspeed = ( slideshowspeed <= 1 ) ? 1 : slideshowspeed - 1; document.getElementById('slideshowspeed').innerHTML = slideshowspeed; return false;\">-</a>";
	c += "&nbsp;<a id=\"slideshowspeed\">" + slideshowspeed + "</a>&nbsp;";
	c += "<a title=\"+\" href=\"#\" onclick=\"slideshowspeed++; document.getElementById('slideshowspeed').innerHTML = slideshowspeed; return false;\">+</a>\n\n";

	c += "stream mode            :  " + (stream_mode ? "on" : "off") + "\n\n";

	c += "Video format support detected:\n";
	c += "========\n"
	c += "mpeg4: " + (supports_mpeg4 ? "yes" : "no") + "\n";
	c += "mp4  : " + (supports_h264 ? "yes" : "no") + "\n";
	c += "ogg  : " + (supports_ogg ? "yes" : "no") + "\n";
	c += "webm : " + (supports_webm ? "yes" : "no") + "\n";

	c += "\n\n";

	c += "<h2><a href=\"/UPLOAD.txt\">Uploading instructions</a></h2>\n";

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
			select(last_album, Math.max(0, last_image - 5));
		} else if (last == "album") {
			if (last_album_section > 0) {
				last_album_section--;
				select(last_album, -1);
			}
		} else {
			if (last_index_section > 0) {
				last_index_section--;
				select(-1, -1);
			}
		}
		break;
	case 34: // pgdn
		if (last == "image") {
			select(last_album, Math.min( last_image + 5, albums[last_album].images.length - 1));
		} else if (last == "album") {
			if (last_album_section < Math.floor((albums[last_album].images.length - 1) / (size_a * size_al))) {
				last_album_section++;
				select(last_album, -1);
			}
		} else {
			if (last_index_section < Math.floor(albums.length / size_i)) {
				last_index_section++;
				select(-1, -1);
			}
		}
		break;
	case 35: // end
		if (last == "image") {
			select(last_album, albums[last_album].images.length - 1);
		} else if (last == "album") {
			last_album_section = Math.floor((albums[last_album].images.length - 1) / (size_a * size_al));
			select(last_album, -1);
		} else {
			last_index_section = Math.floor((albums.length - 1) / size_i);
			select(-1, -1);
		}
		break;
	case 36: // home
		if (last == "image") {
			select(last_album, 0);
		} else if (last == "album") {
			last_album_section = 0;
			select(last_album, -1);
		} else {
			last_index_section = 0;
			select(-1, -1);
		}
		break;
	case 78: // n
	case 32: // space
	case 39: // right
		if (stream_mode) {
			select(-1, last_image + 1);
		} else if (last == "image") {
			if (last_image < albums[last_album].images.length - 1)
				select(last_album, last_image+1);
		} else if (last == "album") {
			if (last_album_section < Math.floor((albums[last_album].images.length - 1) / (size_a * size_al))) {
				last_album_section++;
				select(last_album, -1);
			}
		} else {
			if (last_index_section < Math.floor(albums.length / size_i)) {
				last_index_section++;
				select(-1, -1);
			}
		}
		break;
	case 80: // p
	case 8:  // backspace
	case 37: // left
		if (stream_mode) {
			select(-1, last_image - 1);
		} else if (last == "image") {
			if (last_image > 0)
				select(last_album, last_image - 1);
		} else if (last == "album") {
			if (last_album_section > 0) {
				last_album_section--;
				select(last_album, -1);
			}
		} else {
			if (last_index_section > 0) {
				last_index_section--;
				select(-1, -1);
			}
		}
		break;
	case 85: // u
	case 38: // up
		if (last == "image") {
			last = "album";
			select(last_album, -1);
		} else {
			last = "index";
			select(-1, -1);
		}
		break;
	case 68: // d
	case 40: // down
		if (last == "index") {
			last = "album";
			select(last_album, -1);
		} else {
			last = "image";
			select(last_album, last_image);
		}
		break;
	case 82: // r
		do_slideshow(true);
		break;
	case 83: // s
		do_slideshow(false);
		break;
	case 70: // f
		do_fullscreen();
		break;
	case 72: // h
		do_help();
		break;
	case 77: // m
		stream_mode = !stream_mode;
		select(-1,-1);
		break;
	case 219: // [
		if ((last != "index") && (last_album > 0))
			select(--last_album, last_image);
		break;
	case 221: // ]
		if ((last != "index") && (last_album < albums.length - 1))
			select(++last_album, last_image);
		break;
	default:
		// alert(k);
		break;
	}
	
	return true;
}

document.onkeydown = keypressed;

// Detect video format support
var testEl = document.createElement( "video" ), mpeg4, h264, ogg, webm;
if ( testEl.canPlayType ) {
	// Check for MPEG-4 support
	supports_mpeg4 = "" !== testEl.canPlayType( 'video/mp4; codecs="mp4v.20.8"' );

	// Check for h264 support
	supports_h264 = "" !== ( testEl.canPlayType( 'video/mp4; codecs="avc1.42E01E"' )
	|| testEl.canPlayType( 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"' ) );

	// Check for Ogg support, but only if mp4 is a no-go
	if (!supports_mpeg4 && !supports_h264)
		supports_ogg = "" !== testEl.canPlayType( 'video/ogg; codecs="theora"' );

	// Check for Webm support
	supports_webm = "" !== testEl.canPlayType( 'video/webm; codecs="vp8, vorbis"' );
}

// remove unplayable video format items
for (x = 0; x < albums.length; x++) {
	if (!albums[x].images)
		continue;
	// since splice removes, go backwards through the array
	for (y = albums[x].images.length - 1; y >= 0; y--) {
		if (!albums[x].images[y])
			continue;
		if (!format_is_supported(x, y))
			albums[x].images.splice(y, 1);
	}
}

// and now sort the indices.
albums.sort(function(a, b) {
	if (a.date == b.date)
		return 0;
	return ((a.date < b.date) ? 1 : -1);
});

// sort the albums internally
for (x = 0; x < albums.length; x++) {
	if (!albums[x].images)
		continue;
	albums[x].images.sort(function(a, b) {
		if (a.date == b.date)
			return 0;
		return ((a.date > b.date) ? 1 : -1);
	});
}

// construct stream
for (x = 0; x < albums.length; x++) {
	if (!albums[x].images)
		continue;
	for (y = albums[x].images.length - 1; y >= 0; y--) {
		if (!albums[x].images[y])
			continue;
		stream.push({
			album: albums[x].name,
			owner: albums[x].owner,
			date: albums[x].images[y].date,
			name: albums[x].images[y].name,
			a: x,
			i: y
			});
	}
}

// sort stream
stream.sort(function(a, b) {
	if (a.date == b.date)
		return 0;
	return ((a.date < b.date) ? 1 : -1);
});

// crosslink indices
for (x = 0; x < albums.length; x++) {
	if (!albums[x].images)
		continue;
	for (y = albums[x].images.length - 1; y >= 0; y--) {
		if (!albums[x].images[y])
			continue;
		albums[x].images[y].s = stream.length - 1;
	}
}

function init() {
	load_settings();
	last_index_section = 0;
	select(-1, -1);
}

