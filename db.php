<?

$users = array (
	"sofar",
	"sserafin"
);

# build a complex hash/array structure so we can download the
# entire album content at once into the browser.
echo "var albums = [\n";

for ($x = 0; $x < count($users); $x++) {
	$d = "/home/" . $users[$x] . "/album";
	if (!is_dir($d))
		continue;
	$ah = opendir($d);
	$album = readdir($ah);
	while ($album) {
		# FIXME: add recursive album support
		if (!is_dir($d . "/" . $album) || ($album{0} == ".")) {
			$album = readdir($ah);
			continue;
		}
		echo "{ name: '" . $album . "', owner: '" . $users[$x] . "', images: [\n";

		$ih = opendir($d . "/" . $album);
		$image = readdir($ih);
		while ($image) {
			if (is_dir($d . "/" . $album . "/" . $image) || ($image{0} == ".")) {
				$image = readdir($ih);
				continue;
			}
			if ((!is_file($d . "/" . $album . "/" . $image)) ||
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
		if ($album || ($x < count($users)))
			echo ", ";
		else
			echo " ";
	}
	closedir($ah);
}
echo " ];\n";

?>
