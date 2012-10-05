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
		if ($album || ($x < count($users) - 1))
			echo ", ";
		else
			echo " ";
	}
	closedir($ah);
}
echo " ];\n";

?>
