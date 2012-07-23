<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title>album.foo-projects.org</title>
<link rel="StyleSheet" href="/album.css" title="default" type="text/css" />
<script type="text/javascript">
<!--
<?

	# build a complex hash/array structure so we can download the
	# entire album content at once into the browser.
	echo "var albums = [\n";

	$ah = opendir(getcwd());
	$album = readdir($ah);
	while ($album) {
		# FIXME: add recursive album support
		if (!is_dir($album) || ($album{0} == ".")) {
			$album = readdir($ah);
			continue;
		}
		echo "{ name: '" . $album . "', images: [\n";

		$ih = opendir(getcwd() . "/" . $album);
		$image = readdir($ih);
		while ($image) {
			if ((!is_file(getcwd() . "/" . $album . "/" . $image)) ||
			    (preg_match('/[.]avi$/', $image)) ||
			    (preg_match('/[.]AVI$/', $image)) ||
			    (preg_match('/[.]thm$/', $image)) ||
			    (preg_match('/[.]THM$/', $image)) ||
			    (preg_match('/[.]nef$/', $image)) ||
			    (preg_match('/[.]NEF$/', $image))) {
				$image = readdir($ih);
				continue;
			}
			echo "{ name: '" . $image . "' }";

			$image = readdir($ih);
			if ($image)
				echo ", ";
			else
				echo " ";
		}
		closedir($ih);
		echo " ] }\n";

		$album = readdir($ah);
		if ($album)
			echo ", ";
		else
			echo " ";
	}
	echo " ]\n";
	closedir($ah);
?>
-->
</script>
<script type="text/javascript" src="/album.js"></script>
</head>
<body onload="javascript:init()">

  <div id="title">
    <a href="/">[index]</a>
  </div>
  <hr />
  <div id="help" style="float:right;">
    <a href="javascript:do_help();">?</a>
  </div>


  <div id="content">
    (loading...)
  </div>

</body>
</html>
