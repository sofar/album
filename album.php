<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<!-- saved from url=(0014)about:internet -->
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title>album.foo-projects.org</title>
<link rel="StyleSheet" href="/album.css" title="default" type="text/css" />
<script type="text/javascript">
<!--
<?
	# store list of items in this album
	$album = $_GET['a'];
	$dh = opendir($album);
	while ($entry = readdir($dh)) {
		if (!is_file($album . "/" . $entry))
			continue;
		if (preg_match('/avi/', $entry))
			continue;
		if (preg_match('/AVI/', $entry))
			continue;
		if (preg_match('/thm/', $entry))
			continue;
		if (preg_match('/THM/', $entry))
			continue;
		if ($entry == ".p")
			continue;
		$items[] = $entry;
	}
	closedir($dh);
	sort($items);

	echo "var album = \"$album\";\n";
	echo "var entries = new Array(\n";
	foreach ($items as $entry) {
		echo "	'$entry'";
		if ($entry == $items[count($items) - 1]) {
			echo "\n";
		} else {
			echo ",\n";
		}
	}
	echo ");\n";

	echo "var titles = new Array(\n";
	foreach ($items as $entry) {
		if (preg_match('/.[jJ][pP][gG]$/', $album . "/" . $entry) == 0) {
			echo "	''";
			if ($entry != $items[count($items) - 1])
				echo ",";
			echo "\n";
			continue;
		}
		$exif = exif_read_data($album . "/" . $entry, 0, true);
		$title = "EXIF data from &quot;" . $album . "/" . $entry . "&quot;:&nbsp;";
		$title .= "Filename: &quot;" . $exif['FILE']['FileName'] . "&quot;, &nbsp;";
		$title .= "DateTime: &quot;" . $exif['IFD0']['DateTime'] . "&quot;, &nbsp;";
		#$title .= "ExifImageWidth: &quot;" . $exif['EXIF']['ExifImageWidth'] . "&quot;, &nbsp;";
		#$title .= "ExifImageLength: &quot;" . $exif['EXIF']['ExifImageLength'] . "&quot;, &nbsp;";
		$title .= "Camera Make: &quot;" . $exif['IFD0']['Make'] . "&quot;, &nbsp;";
		$title .= "Camera Model: &quot;" . $exif['IFD0']['Model'] . "&quot;, &nbsp;";
		$title .= "ExposureTime: &quot;" . $exif['EXIF']['ExposureTime'] . "&quot;, &nbsp;";
		$title .= "FNumber: &quot;" . $exif['EXIF']['FNumber'] . "&quot;, &nbsp;";
		$title .= "ISOSpeedRatings: &quot;" . $exif['EXIF']['ISOSpeedRatings'] . "&quot;, &nbsp;";
		$title .= "Comment: &quot;" . preg_replace('/[^[:print:]]/', '', $exif['EXIF']['UserComment']) . "&quot;";
		echo "	'" . $title . "'";

		if ($entry != $items[count($items) - 1])
			echo ",";
		echo "\n";
	}
	echo ");\n";

?>
-->
</script>
<script type="text/javascript" src="/album.js"></script>
</head>

<?
	if (isset($_GET['s'])) {
		$anchor = $_GET['s'];
		if ($anchor != "") {
			$select = $anchor;
		} else {
			$select = $items[0];
		}
	} else {
		$select = $items[0];
	}

	#echo "<body onload=\"javascript:select('$select')\">\n";
	echo "<body onload=\"javascript:select(anchor())\">\n";
	if (($album != "") && ($album != ".") && ($album != "..")
	    && (is_file($album))) {
		# show naviagtion and frame
		echo "<div style=\"text-align: center;\">\n";
		echo "<a href=\"/\">Back to albums</a><br />\n";
		echo "</div>\n";
		echo "<hr />\n";
	} else {
		if (isset($_SERVER['PHP_AUTH_USER'])) {
			echo "<div id=\"menu_r\">Logged in as <i>" . $_SERVER['PHP_AUTH_USER'] . "</i> (<a href=\"logout.php\">logout</a>)</div>\n";
			echo "<div id=\"menu_l\">This album is ";
			if (file_exists($album . "/.p")) {
				echo "<a href=\"private.php?p=0&a=" . $album . "\">private</a>\n";
			} else {
				echo "<a href=\"private.php?p=1&a=" . $album . "\">public</a>\n";
			}
			echo "</div>\n";
		}
		echo "<div style=\"text-align: center;\">\n";
		echo "<a href=\"/\">[album index]</a>&nbsp;&nbsp;\n";
		echo "<a href=\"/$album/\">[view all images]</a>\n";
		echo "</div>\n";
		echo "<hr />\n";

		# wrap both parts of the page into a div
		echo "<div id=\"thumbs\"></div>\n";
		echo "<div id=\"content\"></div>\n";

		# preload div
		echo "<div id=\"preload\"></div>\n";
	}
?>

</body>
</html>
