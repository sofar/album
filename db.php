<?

#
# (C) 2010-2012 - Auke Kok <auke@foo-projects.org>
#

# This file is part of Album.
#
#   Album is free software: you can redistribute it and/or modify
#   it under the terms of the GNU Affero General Public License as published by
#   the Free Software Foundation, either version 3 of the License, or
#   (at your option) any later version.
#
#   Album is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU General Public License for more details.
#
#   You should have received a copy of the GNU Affero General Public License
#   along with Album.  If not, see <http://www.gnu.org/licenses/>.


# config.php stores the list of users that are permitted to
# be included in the album. Edit it first.
include 'config.php';

header('Content-Type: text/html; charset=utf-8');
header('Content-Type: application/javascript');

# add list of users and their real names.
echo "var users = {\n";
for ($x = 0; $x < count($users); $x++) {
	$pw = posix_getpwnam($users[$x]);
	echo $users[$x] . ": '" . $pw['gecos'] . "'";
	if ($x < count($users) - 1)
		echo ", ";
	echo "\n";
}
echo "};\n\n";


# build a complex hash/array structure so we can download the
# entire album content at once into the browser.
echo "var albums = [\n";

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

		unset($a);
		unset($date);
		unset($albumdate);

		$cd = $cache_base . "/" . $users[$x] . "/" . $album;
		$ca = $cd . "/" . "db.js";

		# cache intercept
		if (file_exists($ca)) {
			if (filemtime($ca) > filemtime($d . "/" . $album)) {
				$fp = fopen($ca, "r");
				if ($fp) {
					$a = fread($fp, filesize($ca));
					echo $a;
					fclose($fp);
				}
				$album = readdir($ah);
				if ($album || ($x < count($users) - 1))
					echo ", ";
				continue;
			} else {
				# regen cache, discard old cache
				unlink($ca);
			}
		}

		# generate and store cache
		$a .= "{ name: '" . $album . "', owner: '" . $users[$x] . "', images: [\n";

		# assume the album's date is its mtime timestamp.
		$albumdate = filemtime($d . "/" . $album);

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

			# ignore a few filetypes.
			$pi = pathinfo($d . "/" . $album . "/" . $image);
			$pie = strtolower($pi['extension']);
			# can't use switch here since "continue" doesn't behave normally in a switch statement
			if (($pie == 'thm') || ($pie == 'nef')) {
				$image = readdir($ih);
				continue;
			}

			$a .= "{ name: '" . $image . "'";

			$date = filemtime($d . "/" . $album . "/" . $image);

			# store original date of the file
			if (exif_imagetype($d . "/" . $album . "/" . $image) != FALSE) {
				$exif = exif_read_data($d . "/" . $album . "/" . $image, 0, true);
				if (isset($exif['IFD0'])) {
					if (isset($exif['IFD0']['DateTime'])) {
						$date = strtotime($exif['IFD0']['DateTime']);
					}
				}
				if (isset($exif['EXIF'])) {
					if (isset($exif['EXIF']['DateTimeOriginal'])) {
						$date = strtotime($exif['EXIF']['DateTimeOriginal']);
					}
				}
			}

			if (isset($date)) {
				$a .= ", date: " . $date . " ";
			}

			# for video types, include web-playable versions
			switch (strtolower($pi['extension'])) {
			case 'avi':
			case 'mpg':
			case 'mpeg':
			case 'mp4':
			case 'ogv':
				$a .= ', alts: [ "' .
				      $pi['filename'] . '.mp4", "' .
				      $pi['filename'] . '.ogv" ' .
				      '] ';
				      break;
			}

			$a .= "}";

			# date tag the album based on the oldest item
			if (isset($date)) {
				if ($date < $albumdate) {
					$albumdate = $date;
				}
			}

			$image = readdir($ih);
			if ($image)
				$a .= ", ";
			else
				$a .= " ";

			$a .= "\n";
		}
		closedir($ih);

		$a .= "]" . ", date: " . $albumdate . " " . "}\n";

		# write cache entry BEFORE appending ","
		if (!is_dir($cache_base . "/" . $users[$x]))
			mkdir($cache_base . "/" . $users[$x]);
		if (!is_dir($cd))
			mkdir($cd);

		$fp = fopen($ca, "w");
		if ($fp) {
			if (fprintf($fp, "%s", $a) < strlen($a)) {
				fclose($fp);
				unlink($ca);
			}
			fclose($fp);
		}

		$album = readdir($ah);
		if ($album || ($x < count($users) - 1))
			$a .= ", ";
		else
			$a .= " ";

		echo $a;

	}
	closedir($ah);
}
echo " ];\n";

?>
