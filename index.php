<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<!-- saved from url=(0014)about:internet -->
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title>album.foo-projects.org</title>
<link rel="StyleSheet" href="album.css" title="default" type="text/css">
</head>
<body>

<?
#	if (isset($_SERVER['PHP_AUTH_USER'])) {
#		echo "<div id=\"menu_r\">Logged in as <i>" . $_SERVER['PHP_AUTH_USER'] . "</i> (<a href=\"logout.php\">logout</a></div>\n";
#	} else {
#		echo "<div id=\"menu_r\"><a href=\"login.php\">login</a></div>\n";
#	}

function ctime_cmp_rev($a, $b)
{
	if (filemtime($a) > filemtime($b))
		return -1;
	else if (filemtime($a) < filemtime($b))
		return 1;
	return 0;
}

	echo "<div id=\"title\">\n";
	echo "    <a href=\"/\">[index]</a>\n";
	echo "</div>\n";
	echo "<hr />\n";

	# show list of albums
	echo "<div id=\"content\">\n";
	$dh = opendir(getcwd());
	while ($entry = readdir($dh)) {
		if (is_dir($entry) && ($entry{0} != ".") ) {
			if ((!isset($_SERVER['PHP_AUTH_USER'])) &&
			    file_exists($entry . "/.p"))
				continue;
			$albums[] = $entry;
		}
	}
	closedir($dh);
	//rsort($albums);
	usort($albums, "ctime_cmp_rev");
	
	echo "<div style=\"display: inline-block;\">\n";
	foreach ($albums as $entry) {
		echo "<div style=\"float: left; height: 120px; width: 300px; display: table-cell; line-height: 120px; vertical-align: middle;\"><a href=\"$entry/\">$entry</a></div>\n";
		# show a few thumbnails of this album, if they exist
		$n = 0;
		$top = getcwd();
		if (is_dir(".c/" . $entry)) {
			chdir(".c/" . $entry);
			foreach (glob("x100-*") as $thumb) {
				$thumb = preg_replace('|x100-|', '', $thumb);
				echo "      <div style=\"display: inline-block; float: left; height: 120px; width: 120px; line-height: 120px;\">";
				echo "      <a href=\"$entry/#$thumb\">";
				echo "<img style=\"vertical-align: middle;\" src=\"image.php?r=1&amp;x=100&amp;y=100&amp;i=$entry/$thumb\" /></a></div>\n";
				$n++;
				if ($n >= 4)
					break;
			}
			chdir($top);
		}
		echo "<div style=\"clear: both;\"></div>\n";

	}
	echo "</div>\n";
?>

</body>
</html>
