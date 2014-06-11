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

# config.php includes the location of our cache folder, as well
# as some global settings.
include 'config.php';

if (!function_exists("imagerotate")) {
	function imagerotate($src_img, $angle) {
		$src_x = imagesx($src_img);
		$src_y = imagesy($src_img);
		if ($angle == 180) {
			$dest_x = $src_x;
			$dest_y = $src_y;
		}
		elseif ($src_x <= $src_y) {
			$dest_x = $src_y;
			$dest_y = $src_x;
		}
		elseif ($src_x >= $src_y) {
			$dest_x = $src_y;
			$dest_y = $src_x;
		}

		$rotate = imagecreatetruecolor($dest_x,$dest_y);
		imagealphablending($rotate, false);

		switch ($angle) {
		case 270:
			for ($y = 0; $y < ($src_y); $y++) {
				for ($x = 0; $x < ($src_x); $x++) {
					$color = imagecolorat($src_img, $x, $y);
					imagesetpixel($rotate, $dest_x - $y - 1, $x, $color);
				}
			}
			break;
		case 90:
			for ($y = 0; $y < ($src_y); $y++) {
				for ($x = 0; $x < ($src_x); $x++) {
					$color = imagecolorat($src_img, $x, $y);
					imagesetpixel($rotate, $y, $dest_y - $x - 1, $color);
				}
			}
			break;
		case 180:
			for ($y = 0; $y < ($src_y); $y++) {
				for ($x = 0; $x < ($src_x); $x++) {
					$color = imagecolorat($src_img, $x, $y);
					imagesetpixel($rotate, $dest_x - $x - 1, $dest_y - $y - 1, $color);
				}
			}
			break;
		default:
			$rotate = $src_img;
		}
		return $rotate; 
	}
}

function pass_file_and_exit($file) {
	$i = pathinfo($file);
	switch (strtolower($i['extension'])) {
	case 'jpg':
	case 'jpeg':
	case 'thm':
		header("Content-type: image/jpg");
		break;
	case 'gif':
		header("Content-type: image/gif");
		break;
	case 'png':
		header("Content-type: image/png");
		break;
	case 'ogv':
		header("Content-type: video/ogg");
		break;
	case 'mp4':
		header("Content-type: video/mp4");
		break;
	default:
		exit;
		break;
	}
	header("Content-length: ".filesize($file));
	header('Content-Disposition: attachment; filename="' . $i['basename'] . '"');
	readfile($file);
	exit;
}

$size = $_GET['s'];

$resample = $_GET['r'];

$image = utf8_decode(urldecode($_GET['i']));

if (isset($_GET['u']))
	$user = $_GET['u'];

if (array_search($user, $users) === FALSE)
	die("-EINVAL\n");

$i = pathinfo($image);
$ext = strtolower($i['extension']);

$album = dirname($image);

$pw = posix_getpwnam($user);
$home = $pw['dir'];

# passtrhru unsized?
if ($ext == 'thm')
	$obj = escapeshellcmd($cache_base . "/" . $user . "/" . $image);
else
	$obj = escapeshellcmd($home . "/album/" . $image);
if ($size == 0) {
	if (file_exists($obj))
		pass_file_and_exit($obj);
}

if ($size > $max_size)
	$size = $max_size;

#header('Last-Modified: ' . gmdate('D, d M Y H:i:s', filemtime($obj)).' GMT', true, 200);
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + (80640 * 180)) . ' GMT', true, 200);

$cache_path = $cache_base . "/" . $user . "/" . $album;

if (!is_dir($cache_path))
	mkdir($cache_path);

# fetch the (already rotated) cached file if present
$cache_file = $cache_path . "/" . basename($image);
if (file_exists($cache_file))
	pass_file_and_exit($cache_file);
$cache_file = $cache_path . "/" . "x" . $size . "-" . basename($image);
if (file_exists($cache_file))
	pass_file_and_exit($cache_file);

$o = 0;
if (exif_imagetype($obj) != false) {
	$exif = exif_read_data($obj, 0, true);
	if (is_array($exif)) {
		if (array_key_exists('IFD0', $exif)) {
			if (array_key_exists('Orientation', $exif['IFD0'])) {
				$o = $exif['IFD0']['Orientation'];
			}
		}
	}
}

switch ($ext) {
case 'jpg':
case 'jpeg':
case 'thm':
	$im  = imagecreatefromjpeg($obj);
	header("Content-type: image/jpeg");
	break;
case 'gif':
	$im  = imagecreatefromgif($obj);
	header("Content-type: image/gif");
	break;
case 'png' :
	$im  = imagecreatefrompng($obj);
	header("Content-type: image/png");
	break;
default:
	exit;
	break;
}

list($width_orig, $height_orig) = getimagesize($obj);

$ratio_orig = $width_orig / $height_orig;

if ($ratio_orig > 1) {
	$width = $size;
	$height = $size / $ratio_orig;
} else {
	$width = $size * $ratio_orig;
	$height = $size;
}

$save = imagecreatetruecolor($width, $height);

if ( $resample == 1 ) {
	imagecopyresampled($save, $im, 0, 0, 0, 0, $width, $height, $width_orig, $height_orig);
} else {
	imagecopyresized($save, $im, 0, 0, 0, 0, $width, $height, $width_orig, $height_orig);
}


switch ($o) {
case 3:
	$save = imagerotate($save, 180, 0);
	break;
case 6:
	$save = imagerotate($save, 270, 0);
	break;
case 8:
	$save = imagerotate($save, 90, 0);
	break;
}

switch ($ext) {
case 'thm' :
	imagejpeg($save);
	break;
case 'jpg' :
case 'jpeg':
	imagejpeg($save, $cache_file);
	imagejpeg($save);
	break;
case 'gif' :
	imagegif($save, $cache_file);
	imagegif($save);
	break;
case 'png' :
	imagepng($save, $cache_file);
	imagepng($save);
	break;
}
 
imagedestroy($im);
imagedestroy($save);

?>
