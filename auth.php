<?

function auth($user, $password)
{
	$lines = file(".u");
	foreach ($lines as $line) {
		list($key, $val) = explode(':', $line);

		if (substr("$val", strlen("$val") - 1, 1) == "\n")
			# chomp();
			$val = substr("$val", 0, -1);

		if (($key == $user) &&
		    (crypt($password, $val) == $val)) {
			return true;
		}
	} 

	return false;
}

?>
