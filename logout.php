<?
	header('WWW-Authenticate: Basic realm="album.foo-projects.org"');
	header('HTTP/1.0 401 Unauthorized');
	header('HTTP-Status: 401 Unauthorized');
	echo "<head><meta http-equiv=\"refresh\" content=\"0; URL=http://album.foo-projects.org/\"></head>\n";
	echo "You have logged out.\n";
	exit;
?>
