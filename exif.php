<?

# exif.php
#
# Get exif info for an image, and render a XML content that can be inserted
# into a webpage dynamically

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

$album = dirname($image);

$obj = "/home/" . $user . "/album/" . $image;

$pw = posix_getpwnam($user);
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
