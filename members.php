<?
	if (!isset($_SERVER['PHP_AUTH_USER'])) {
		header('HTTP/1.0 401 Unauthorized');
		echo "<p>Incorrect login information provided</p>\n";
		exit;
	}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<!-- saved from url=(0014)about:internet -->
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title>album.foo-projects.org</title>
<link rel="StyleSheet" href="album.css" title="default" type="text/css">
</head>
<body style="width: 1120px;">
  <div style="text-align: center; padding: 5px;">
<?
	if (isset($_SERVER['PHP_AUTH_USER'])) {
		echo "<div style=\"float: right; ;\">Logged in as <i>" . $_SERVER['PHP_AUTH_USER'] . "</i></div>\n";
	}
?>
    <a href="http://album.foo-projects.org/">album.foo-projects.org</a><br />
  </div>
  <hr />
  <div style="overflow: auto; height: 100%; text-align: center; padding: 5px;">
<?
	echo "<h3>Logged in as <i>" . $_SERVER['PHP_AUTH_USER'] . "</i></h3>\n";

?>
  </div>
</body>
</html>
