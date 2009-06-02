<?
	if (!isset($_SERVER['PHP_AUTH_USER'])) {
		header('HTTP/1.0 401 Unauthorized');
		echo "<p>Access denied.</p>\n";
		exit;
	}

	$p = $_GET['p'];
	$a = $_GET['a'];

	if ($p == 0) {
		if (file_exists($a . "/.p"))
			unlink($a . "/.p");
	} else if ($p == 1) {
		if (!file_exists($a . "/.p"))
			touch($a . "/.p");
	}
	header('Location: album.php?a=' . $a);
