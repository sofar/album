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
	while ($album = readdir($ah)) {
		# FIXME: add recursive album support
		if (!is_dir($album) || ($album{0} == ".") )
			continue;
		echo "{ name: '" . $album . "', images: [\n";

		$ih = opendir(getcwd() . "/" . $album);
		while ($image = readdir($ih)) {
			if (!is_file(getcwd() . "/" . $album . "/" . $image))
				continue;
			if (preg_match('/[.]avi$/', $image))
				continue;
			if (preg_match('/[.]AVI$/', $image))
				continue;
			if (preg_match('/[.]thm$/', $image))
				continue;
			if (preg_match('/[.]THM$/', $image))
				continue;
			if (preg_match('/[.]nef$/', $image))
				continue;
			if (preg_match('/[.]NEF$/', $image))
				continue;
			echo "{ name: '" . $image . "' }, ";
		}
		closedir($ih);
		echo " {} ] },\n";
	}
	echo " {} ]\n";
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

  <div id="content">
    (loading...)
  </div>

</body>
</html>
