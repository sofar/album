<?


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


$max_x = 800;
$max_y = 800;
$width = $_GET['x'];
$height = $_GET['y'];

$resample = $_GET['r'];

$image = $_GET['i'];

$album = dirname($image);

$cache_path = ".c/" . $album;
$cache_file = $cache_path . "/" . $witdh . "x" . $height . "-" . basename($image);

if (!is_dir($cache_path))
	mkdir($cache_path);

header('Last-Modified: ' . gmdate('D, d M Y H:i:s', filemtime($image)).' GMT', true, 200);
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + (80640 * 180)) . ' GMT', true, 200);

preg_match("'^(.*)\.(gif|jpe?g|png|thm)$'i", $image, $ext);

# fetch the (already rotated) cached file if present
if (file_exists($cache_file)) {
	switch (strtolower($ext[2])) {
	case 'jpg':
	case 'jpeg':
	case 'thm':
		header("Content-type: image/jpeg");
		break;
	case 'gif':
		header("Content-type: image/gif");
		break;
	case 'png':
		header("Content-type: image/png");
		break;
	default:
		exit;
		break;
	}
	$fp = fopen($cache_file, "r");
	fpassthru($fp);
	fclose($fp);
	exit;
}


# $o= shell_exec("identify -format \"%[EXIF:Orientation]\" ". escapeshellcmd($image));
#$o= shell_exec("jhead -exifmap " . escapeshellcmd($image) . " | grep ^Orientation | cut -d: -f2");
#$o = shell_exec("/usr/bin/exif-orientation.sh " . escapeshellcmd($image));
$exif = exif_read_data($image, 0, true);
$o = $exif['IFD0']['Orientation'];

switch (strtolower($ext[2])) {
case 'jpg':
case 'jpeg':
case 'thm':
	$im  = imagecreatefromjpeg($image);
	header("Content-type: image/jpeg");
	break;
case 'gif':
	$im  = imagecreatefromgif($image);
	header("Content-type: image/gif");
	break;
case 'png' :
	$im  = imagecreatefrompng($image);
	header("Content-type: image/png");
	break;
default:
	exit;
	break;
}

list($width_orig, $height_orig) = getimagesize($image);

$ratio_orig = $width_orig / $height_orig;

if ($width/$height > $ratio_orig) {
	$width = $height * $ratio_orig;
} else {
	$height = $width / $ratio_orig;
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

switch (strtolower($ext[2])) {
case 'thm' :
	imagejpeg ($save);
	break;
case 'jpg' :
case 'jpeg':
	imagejpeg ($save, $cache_file);
	imagejpeg ($save);
	break;
case 'gif' :
	imagegif ($save, $cache_file);
	imagegif ($save);
	break;
case 'png' :
	imagepng ($save, $cache_file);
	imagepng ($save);
	break;
}
 
imagedestroy($im);
imagedestroy($save);

?>
