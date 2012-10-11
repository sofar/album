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


# exif.php
#
# Get exif info for an image, and render a XML content that can be inserted
# into a webpage dynamically

include 'config.php';

$fields = array (
	"FILE.FileName" => "Filename",
	"EXIF.ExifImageWidth" => "Width",
	"EXIF.ExifImageLength" => "Height",
	"EXIF.ExposureTime" => "Exposure",
	"EXIF.FNumber" => "Aperture",
	"EXIF.DateTimeOriginal" => "Date",
	"EXIF.ISOSpeedRatings" => "ISO",
	"EXIF.Flash" => "Flash",
	"EXIF.FocalLength" => "Focal length",
	"IFD0.Make" => "Camera make",
	"IFD0.Model" => "Camera model",
	"IFD0.DateTime" => "Date",
	"EXIF.UserComment" => "Comment",
	"COMPUTED.UserComment" => "Comment"
);
$output = array ();

$image = $_GET['i'];
$user = $_GET['u'];

if (array_search($user, $users) === FALSE)
	die("-EINVAL\n");

$album = dirname($image);

$pw = posix_getpwnam($user);
$home = $pw['dir'];

$obj = $home . "/album/" . $image;

echo "Path: " . $image . "\n";
echo "Owner: " . $pw['gecos'] . "\n\n";

if (preg_match('/[.][jJ][pP][gG]$/', $obj)) {
	$exif = exif_read_data($obj, 0, true);
	foreach ($fields as $field => $name) {
		list ($f1, $f2) = explode(".", $field);
		if (isset($exif[$f1])) {
			if (isset($exif[$f1][$f2])) {
				$output[$name] = $exif[$f1][$f2];
			}
		}
	}
	foreach ($output as $key => $val)
		echo $key . ": " . $val . "\n";
} else {
	echo "The image contains no usable EXIV metadata\n";
}

?>
