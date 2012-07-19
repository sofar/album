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
<body>
  <div style="text-align: center; padding: 5px;">
<?
	echo "<div style=\"float: right; ;\">Logged in as <i>" . $_SERVER['PHP_AUTH_USER'] . "</i></div>\n";
?>
    <a href="http://album.foo-projects.org/">album.foo-projects.org</a><br />
  </div>
  <hr />
  </div>
  <div style="text-align: center;">
<?
	if (!isset($_GET['a'])) {
		echo "<h3>I need an album to upload files into...</h3>";
		exit;
	}

	$album = $_GET['a'];
	if (!is_dir($album)) {
		echo "<h3>Not a valid album</h3>";
		exit;
	}

	if (empty($_FILES['images'])) {
		# nothing uploaded - display upload forms
		echo "<form enctype=\"multipart/form-data\" action=\"/upload.php?a=" . $album . "\" method=\"POST\">\n";
    		echo "<input type=\"hidden\" name=\"MAX_FILE_SIZE\" value=\"8000000\" />\n";
    		echo "Upload files: <br />\n";
		echo "<div id=\"upload\">\n";
		echo "<input size=\"50\" name=\"images[]\" type=\"file\" /><br />\n";
		echo "<input size=\"50\" name=\"images[]\" type=\"file\" /><br />\n";
		echo "<input size=\"50\" name=\"images[]\" type=\"file\" /><br />\n";
		echo "<input size=\"50\" name=\"images[]\" type=\"file\" /><br />\n";
		echo "<input size=\"50\" name=\"images[]\" type=\"file\" /><br />\n";
		echo "</div>\n";
		echo "<br /><input type=\"submit\" value=\"Upload Files\" />\n";
		echo "</form>\n\n";
	} else {
		# handle uploaded files
		foreach ($_FILES["images"]["error"] as $key => $error) {
			if ($error == UPLOAD_ERR_OK) {
		        	$tmp_name = $_FILES["images"]["tmp_name"][$key];
			        $name = $_FILES["images"]["name"][$key];
				# don't overwrite
				if (file_exists("$album/$name")) {
					echo "<p>Upload of \"$name\" failed! That image already exists in this the album \"$album\"!</p>\n";

				} else {
					move_uploaded_file($tmp_name, "$album/$name");

					# display this image as a preview thumb
					echo "<p>Uploaded \"$name\" OK! <img src=\"image.php?r=1&amp;s=100&amp;i=$album/$name\" /></p>\n";
				}
			}
		}
		# and link back to uploading more stuff
		echo "<p><a href=\"upload.php?a=" . $album . "\">upload more images to this album...</a></p>\n";
	}
	echo "<p><a href=\"album.php?a=" . $album . "\">go back to the album view...</a></p>\n";
?>
  </div>

</body>
</html>
