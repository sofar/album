
var last = "";
var last_album = "";
var last_image = "";
var last_index_section = 0;
var last_album_section = 0;
var slideshow = false;
var slideshowinterval;
var slideshowspeed = 5;
var help = false;
var preloads = [];
var supports_mpeg4 = false;
var supports_h264 = false;
var supports_ogg = false;
var supports_webm = false;

// sizes
var size_i = 10;  // album lines on the index page
var size_il = 5;  // thumbs per line on the index page
var size_a = 5;   // thumblines on the album page
var size_al = 5;  // thumbs per line on the album page
var size_n = 4;   // navigation line size either way on image page

function preload(x, y, size) {
	preloads[preloads.length] = new Image();
	preloads[preloads.length - 1].src = "image.php?r=1&s=" + size + "&i=" + albums[x].name + "/" + albums[x].images[y].name;
}

function format_is_supported(name) {
	// Test compatibility for these per browser
	if (name.match(".ogv"))
		return supports_ogg;
	if (name.match(".OGV"))
		return supports_ogg;
	if (name.match(".mp4"))
		return (supports_mpeg4 || supports_h264);
	if (name.match(".MP4"))
		return (supports_mpeg4 || supports_h264);

	// Always hide these files:
	if (name.match(".mpg"))
		return false;
	if (name.match(".MPG"))
		return false;
	if (name.match(".avi"))
		return false;
	if (name.match(".AVI"))
		return false;

	// The rest is always supported
	return true;
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

function find_album(a) {
	for (x = 0; x < albums.length; x++)
		if (albums[x].name == a)
			return x;
	return -1;
}

function find_image(x, i) {
	for (y = 0; y < albums[x].images.length; y++)
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

	if (o.match(".mp4") || o.match(".MP4")) {
		// Video display
		r += "<video controls><source src=\"" + albums[x].name + "/" + o + "\" type=\"video/mp4\">Video not playing? Click the link above to download the file and play locally.</video>";
	} else if ( o.match(".ogv") || o.match(".OGV")) {
		// Video display
		r += "<video controls><source src=\"" + albums[x].name + "/" + o + "\" type=\"video/ogg\">Video not playing? Click the link above to download the file and play locally.</video>";
	} else {
		// image display
		r += "<map name=\"map-" + o + "\">\n";
		if (y > 0)
			r += "<area shape=\"rect\" coords=\"0,0,250,800\" href=\"javascript: select(&quot;" + albums[x].name + "&quot;, &quot;" + albums[x].images[y-1].name + "&quot;)\" />\n";
		if (y < albums[x].images.length - 1)
			r += "<area shape=\"rect\" coords=\"400,0,800,800\" href=\"javascript: select(&quot;" + albums[x].name + "&quot, &quot;" + albums[x].images[y+1].name + "&quot;)\" />\n";
		r += "</map>\n";

		r += "<img class=\"selected\" usemap=\"#map-" + o + "\" title=\'" + o + "\' src=\"image.php?r=1&amp;s=800&amp;i=" + albums[x].name + "/" + o + "\" />\n";
	}
	return r;
}

function select(a, i) {

	if (a == "") {
		// display album list
		var c = "";

		// calculate which section to display
		var s_start = Math.min((last_index_section * size_i), Math.min((albums.length) / size_i) * size_i);
		var s_end = Math.min(s_start + size_i, (albums.length));

		c += "<div style=\"display: inline-block;\">\n";
		if (last_index_section > 0)
			c += block("<a href=\"javascript:last_index_section--; select(&quot;&quot, &quot,&quot;)\"><img class=\"arrow\" src=\"go-previous.png\" alt=\"back\" /></a>");
		else
			c += block("&nbsp;");
		c += "<div style=\"display: inline-block; float: left; width: 620px;\">\n";
		for (x = s_start; x < s_end; x++) {
			c += "<div style=\"display: inline-block;\"><a href=\"javascript:select(&quot;" + albums[x].name + "&quot, &quot;&quot;)\">" + albums[x].name + "</a></div>\n";
			c += "<div style=\"clear: both;\"></div>\n";
			for (y = 0; y < Math.min(size_il, albums[x].images.length); y++) {
				c += thumb(x, y, 0);
			}
			c += "<div style=\"clear: both;\"></div>\n";
		}
		c += "</div>\n";
		if (last_index_section + 1 < albums.length / size_i)
			c += rblock("<a href=\"javascript:last_index_section++; select(&quot;&quot, &quot,&quot;)\"><img class=\"arrow\" src=\"go-next.png\" alt=\"forward\" /></a>");
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
	} else if (i == "") {
		// display album overview page
		var c = "";
		var x = find_album(a);

		// calculate which section to display
		if (last_album != a)
			last_album_section = 0;
		var s_start = Math.min((last_album_section * (size_a * size_al)), Math.min(albums[x].images.length / (size_a * size_al)) * (size_a * size_al));
		var s_end = Math.min(s_start + (size_a * size_al), albums[x].images.length);

		c += "<div style=\"display: inline-block;\">\n";
		if (last_album_section > 0)
			c += block("<a href=\"javascript:last_album_section--; select(&quot;" + a + "&quot, &quot&quot;)\"><img class=\"arrow\" src=\"go-previous.png\" alt=\"back\" /></a>");
		else
			c += block("&nbsp;");
		c += "<div style=\"display: inline-block; width: 620px;\">\n";
		for (y = s_start; y < s_end; y++ ) {
			if (y % size_al == 0)
				c += "<div style=\"display: inline-block; float:left; height: 120px; width: 0px; display: table-cell; line-height: 120px; vertical-align: middle;\"></div>\n";
			c += thumb(x, y, 0);
			if (y % size_al == size_al - 1)
				c += "<div style=\"clear: both;\"></div>\n";
		}
		c += "</div>";
		if (last_album_section + 1 < albums[x].images.length / (size_a * size_al))
			c += rblock("<a href=\"javascript:last_album_section++; select(&quot;" + a + "&quot, &quot&quot;)\"><img class=\"arrow\" src=\"go-next.png\" alt=\"forward\" /></a>");
		else
			c += rblock("&nbsp;");
		c += "</div>";

		document.getElementById('content').innerHTML = c;

		var t = "";
		t += "<a href=\"javascript:select(&quot;&quot;, &quot;&quot;)\">[index]</a>&nbsp;";
		t += "<a href=\"javascript:select(&quot;" + a + "&quot;, &quot;&quot;)\">[" + a + "]</a>&nbsp;";
		t += "( " + (s_start + 1) + " - " + s_end + " / " + albums[x].images.length + " )\n";

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
		if (y > size_n)
			c += block("<a href=\"javascript:select(&quot;" + a + "&quot, &quot;" + albums[x].images[y-size_n].name + "&quot;)\"><img class=\"arrow\" src=\"go-previous.png\" alt=\"back\" /></a>");
		else
			c += block("&nbsp;");
		for (z = Math.max(0, y - size_n); z <= Math.min(y + size_n, albums[x].images.length - 1); z++) {
			c += thumb(x, z, (z == y));
		}
		if (y <= albums[x].images.length - (size_n + 1)) {
			preload(x, y+size_n, 100);
			c += rblock("<a href=\"javascript:select(&quot;" + a + "&quot, &quot;" + albums[x].images[y+size_n].name + "&quot;)\"><img class=\"arrow\" src=\"go-next.png\" alt=\"forward\" /></a>");
		} else
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
		if (y < albums[x].images.length - 1) {
			preload(x, y+1, 800);
			c += rblock("<a href=\"javascript:select(&quot;" + a + "&quot, &quot;" + albums[x].images[y+1].name + "&quot;)\"><img class=\"arrow\" src=\"go-next.png\" alt=\"forward\" /></a>");
		} else
			c += rblock("&nbsp;");
		c += "<div style=\"clear: both;\"></div>\n";

		c += "</div>\n";

		document.getElementById('content').innerHTML = c;

		var t = "";
		t += "<a href=\"javascript:init()\">[index]</a>&nbsp;";
		t += "<a href=\"javascript:select(&quot;" + a + "&quot;, &quot;&quot;)\">[" + a + "]</a>&nbsp;";
		t += "<a href=\"/" + albums[x].name + "/" + albums[x].images[y].name + "\">[" + albums[x].images[y].name + "]</a>&nbsp;";
		t += "( " + (y + 1) + " / " + albums[x].images.length + " )\n";

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
	if (y < albums[x].images.length - 1)
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

	c += "Video format support detected:\n";
	c += "========\n"
	c += "mpeg4: " + (supports_mpeg4 ? "yes" : "no") + "\n";
	c += "mp4  : " + (supports_h264 ? "yes" : "no") + "\n";
	c += "ogg  : " + (supports_ogg ? "yes" : "no") + "\n";
	c += "webm : " + (supports_webm ? "yes" : "no") + "\n";

	c += "</pre>\n";
	c += "</div>\n";
	document.getElementById('content').innerHTML = c;
}

function repaint() {
	if (last == "image")
		select(last_album, last_image);
	else if (last == "album")
		select(last_album, "");
	else
		select("", "");
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
			select(last_album, albums[x].images[Math.min( y + 5, albums[x].images.length - 1)].name);
		} else if (last == "album") {
			var x = find_album(last_album);
			if (last_album_section < Math.floor((albums[x].images.length - 1) / (size_a * size_al))) {
				last_album_section++;
				select(last_album, "");
			}
		} else {
			var x = find_album(last_album);
			if (last_index_section < Math.floor(albums.length / size_i)) {
				last_index_section++;
				select("", "");
			}
		}
		break;
	case 35: // end
		if (last == "image") {
			var x = find_album(last_album);
			select(last_album, albums[x].images[albums[x].images.length - 1].name);
		} else if (last == "album") {
			var x = find_album(last_album);
			last_album_section = Math.floor((albums[x].images.length - 1) / (size_a * size_al));
			select(last_album, "");
		} else {
			last_index_section = Math.floor((albums.length - 1) / size_i);
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
			if (y < albums[x].images.length - 1)
				select(last_album, albums[x].images[y+1].name);
		} else if (last == "album") {
			var x = find_album(last_album);
			if (last_album_section < Math.floor((albums[x].images.length - 1) / (size_a * size_al))) {
				last_album_section++;
				select(last_album, "");
			}
		} else {
			var x = find_album(last_album);
			if (last_index_section < Math.floor(albums.length / size_i)) {
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
				slideshowinterval = window.setInterval(run_slideshow, slideshowspeed * 1000);
			}
		}
		break;
	case 72: // h
		do_help();
		break;
	case 49:
		size_n = (size_n == 0) ? 0 : size_n - 1;
		repaint();
		break
	case 50:
		size_n++;
		repaint();
		break
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
	// since splice removes, go backwards through the array
	for (y = albums[x].images.length - 1; y >= 0; y--) {
		if (!format_is_supported(albums[x].images[y].name))
			albums[x].images.splice(y, 1);
	}
}

// and now sort the indices.
albums.sort(function(a, b) {
	return ((a.name < b.name) ? 1 : -1);
});

for (x = 0; x < albums.length; x++) {
	albums[x].images.sort(function(a, b) {
		return ((a.name > b.name) ? 1 : -1);
	});
}

function init() {
	last_index_section = 0;
	select("", "");
}

