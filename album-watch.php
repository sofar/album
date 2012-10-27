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

	# might need to mkdir first
	if (!is_dir($cache_base . "/" . $user))
		mkdir($cache_base . "/" . $user);
	if (!is_dir($cache_base . "/" . $user . "/" . $album))
		mkdir($cache_base . "/" . $user . "/" . $album);

	# thumbnail
	$t = $cache_base . "/" . $user . "/" . $album . "/" . $i['filename'] . ".thm";
	if (!is_file($t)) {
		echo 'ffmpeg -i "' . $path . '" -ss 0 -vframes 1 -f mjpeg -an "' . $t . '.in"' . "\n";
		system('ffmpeg -i "' . $path . '" -ss 0 -vframes 1 -f mjpeg -an "' . $t . '.in" > /dev/null 2>&1');

		$size = 100;

		$im  = imagecreatefromjpeg($t . '.in');
		list($width_orig, $height_orig) = getimagesize($t . '.in');

		$ratio_orig = $width_orig / $height_orig;

		if ($ratio_orig > 1) {
			$width = $size;
			$height = $size / $ratio_orig;
		} else {
			$width = $size * $ratio_orig;
			$height = $size;
		}

		$save = imagecreatetruecolor($width, $height);

		imagecopyresampled($save, $im, 0, 0, 0, 0, $width, $height, $width_orig, $height_orig);

		imagejpeg($save, $t);

		unlink($t . '.in');
	}

	# mp4
	$t = $cache_base . "/" . $user . "/" . $album . "/" . $i['filename'] . ".mp4";
	if (!is_file($t)) {
		# most of my stuff is in AVI or MP4 format, and doesn't need any tuning to come out OK
		# with mp4 format recoding
		echo 'ffmpeg -i "' . $path . '" -acodec libfaac -vcodec libx264 "' . $t . '"' . "\n";
		system('ffmpeg -i "' . $path . '" -acodec libfaac -vcodec libx264 "' . $t . '" > /dev/null 2>&1');
	}

	# ogv
	$t = $cache_base . "/" . $user . "/" . $album . "/" . $i['filename'] . ".ogv";
	if (!is_file($t)) {
		# with -sameq or no params, OGV's come out very pixelated and small. Instead
		# code these at -qscale 6, which is small but plenty res for the web.
		echo 'ffmpeg -i "' . $path . '" -acodec libvorbis -ac 2 -vcodec libtheora -qscale 6 "' . $t . '"' . "\n";
		system('ffmpeg -i "' . $path . '" -acodec libvorbis -ac 2 -vcodec libtheora -qscale 6 "' . $t . '" > /dev/null 2>&1');
	}
}

$w = Array();
$u = Array();
$a = Array();

$i = inotify_init();

proc_nice(10);

# setup watches
for ($x = 0; $x < count($users); $x++) {
	$pw = posix_getpwnam($users[$x]);
	$home = $pw['dir'];
	$d = $home . "/album";
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
	$pw = posix_getpwnam($users[$x]);
	$home = $pw['dir'];
	$d = $home . "/album";
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

			do_file($d . "/" . $album . "/" . $image, $album, $users[$x]);

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
		$p = $w[$event[$wd]] . "/" . $event['name'];
		if (is_dir($p)) {
			# new folder - add to the watch list
			$wd = inotify_add_watch($i, $p, IN_CLOSE_WRITE);
			$w[$wd] = $p;
			$u[$wd] = $u[$event[$wd]];
			$a[$wd] = $a[$event[$wd]];
		} else {
			do_file($p, $a[$event[$wd]], $u[$event[$wd]]);
		}
	}
}

?>
