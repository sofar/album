<?

include 'config.php';

if (!isset($cache_base))
	die("\$cache_base unset, cannot continue!\n");

if (!extension_loaded('inotify'))
	die("Can't load inotify extension. Do you need to `pecl install inotify`?\n");


function do_file($path, $album, $user)
{
	global $cache_base;

	$i = pathinfo($path);
	switch (strtolower($i['extension'])) {
	case 'mp4':
	case 'mpg':
	case 'mpeg':
	case 'avi':
	case 'ogv':
		break;
	default:
		# nothing to do!
		return;
	}

	echo 'Processing "' . $path . '"' . "\n";

	# might need to mkdir first
	if (!is_dir($cache_base . "/" . $album))
		mkdir($cache_base . "/" . $album);

	# thumbnail
	$t = $cache_base . "/" . $album . "/" . $i['filename'] . ".thm";
	if (!is_file($t)) {
		echo 'ffmpeg -i "' . $path . '" -ss 0 -vframes 1 -f mjpeg -an "' . $t . '.in"' . "\n";
		system('ffmpeg -i "' . $path . '" -ss 0 -vframes 1 -f mjpeg -an "' . $t . '.in" > /dev/null 2>&1');
		echo 'convert "jpg:' . $t . '.in" -resize 100x100 "jpg:' . $t . '"';
		system('convert "jpg:' . $t . '.in" -resize 100x100 "jpg:' . $t . '"');
		unlink($t . '.in');
	}

	# mp4
	$t = $cache_base . "/" . $album . "/" . $i['filename'] . ".mp4";
	if (!is_file($t)) {
		echo 'ffmpeg -i "' . $path . '" -acodec libfaac -vcodec libx264 "' . $t . '"' . "\n";
		system('ffmpeg -i "' . $path . '" -acodec libfaac -vcodec libx264 "' . $t . '" > /dev/null 2>&1');
	}

	# ogv
	$t = $cache_base . "/" . $album . "/" . $i['filename'] . ".ogv";
	if (!is_file($t)) {
		echo 'ffmpeg -i "' . $path . '" -acodec libvorbis -ac 2 -vcodec libtheora "' . $t . '"' . "\n";
		system('ffmpeg -i "' . $path . '" -acodec libvorbis -ac 2 -vcodec libtheora "' . $t . '" > /dev/null 2>&1');
	}
}

$w = Array();
$u = Array();
$a = Array();

$i = inotify_init();

proc_nice(10);

# setup watches
for ($x = 0; $x < count($users); $x++) {
	$d = "/home/" . $users[$x] . "/album";
	if (!is_dir($d))
		continue;

	$wd = inotify_add_watch($i, $d, IN_CREATE);
	$w[$wd] = $d;
	$u[$wd] = $users[$x];
	$a[$wd] = "";

	$ah = opendir($d);
	$album = readdir($ah);
	while ($album) {
		# FIXME: add recursive album support
		if (!is_dir($d . "/" . $album) || ($album{0} == ".")) {
			$album = readdir($ah);
			continue;
		}

		$wd = inotify_add_watch($i, $d . "/" . $album, IN_CLOSE_WRITE);
		$w[$wd] = $d . "/" . $album;
		$u[$wd] = $users[$x];
		$a[$wd] = $album;

		$album = readdir($ah);
	}
	closedir($ah);
}

# scan for files that need preprocessing and run those first
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

		$cd = $cache_base . "/" . $album;

		$ih = opendir($d . "/" . $album);
		$image = readdir($ih);
		while ($image) {
			if (is_dir($d . "/" . $album . "/" . $image) || ($image{0} == ".")) {
				$image = readdir($ih);
				continue;
			}
			if (!is_file($d . "/" . $album . "/" . $image)) {
				$image = readdir($ih);
				continue;
			}

			do_file($d . "/" . $album . "/" . $image, $album, $users[x]);

			$image = readdir($ih);
		}
		closedir($ih);

		$album = readdir($ah);
	}
	closedir($ah);
}

# now process new events - we shouldn't have lost any since inotify has
# a nice queue.

while(TRUE) {
	$events = inotify_read($i);
	foreach($events as $event) {
		$p = $w[$event[wd]] . "/" . $event['name'];
		if (is_dir($p)) {
			# new folder - add to the watch list
			$wd = inotify_add_watch($i, $p, IN_CLOSE_WRITE);
			$w[$wd] = $p;
			$u[$wd] = $u[$event[wd]];
			$a[$wd] = $a[$event[wd]];
		} else {
			do_file($p, $a[$event[wd]], $u[$event[wd]]);
		}
	}
}

?>
