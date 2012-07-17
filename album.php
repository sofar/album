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
		$title = "EXIF&nbsp;data&nbsp;from&nbsp;&quot;" . $album . "/" . $entry . "&quot;: ";
		$title .= "Filename:&nbsp;&quot;" . $exif['FILE']['FileName'] . "&quot;, ";
		$title .= "DateTime:&nbsp;&quot;" . $exif['IFD0']['DateTime'] . "&quot;, ";
		if (array_key_exists('ExifImageWidth', $exif['EXIF']))
			$title .= "ExifImageWidth:&nbsp;&quot;" . $exif['EXIF']['ExifImageWidth'] . "&quot;, ";
		if (array_key_exists('ExifImageLength', $exif['EXIF']))
			$title .= "ExifImageLength:&nbsp;&quot;" . $exif['EXIF']['ExifImageLength'] . "&quot;, ";
		$title .= "Camera&nbsp;Make:&nbsp;&quot;" . $exif['IFD0']['Make'] . "&quot;, ";
		$title .= "Camera&nbsp;Model:&nbsp;&quot;" . $exif['IFD0']['Model'] . "&quot;, ";
		$title .= "ExposureTime:&nbsp;&quot;" . $exif['EXIF']['ExposureTime'] . "&quot;, ";
		$title .= "FNumber:&nbsp;&quot;" . $exif['EXIF']['FNumber'] . "&quot;, ";
		if (array_key_exists('ISOSpeedRatings', $exif['EXIF']))
			$title .= "ISOSpeedRatings:&nbsp;&quot;" . $exif['EXIF']['ISOSpeedRatings'] . "&quot;, ";
		if (array_key_exists('Orientation', $exif['IFD0']))
			$title .= "Orientation:&nbsp;&quot;" . $exif['IFD0']['Orientation'] . "&quot;, ";
		if (array_key_exists('UserComment', $exif['EXIF']))
			$title .= "Comment:&nbsp;&quot;" . preg_replace('/[^[:print:]]/', '', $exif['EXIF']['UserComment']) . "&quot;";
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
