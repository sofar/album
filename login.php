<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<!-- saved from url=(0014)about:internet -->
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title>album.foo-projects.org</title>
<link rel="StyleSheet" href="album.css" title="default" type="text/css">
<script type="text/javascript">
<!--
function login()
{
	var user = document.getElementById('user').value;
	var password = document.getElementById('password').value;
	var action = "http://album.foo-projects.org/members.php";
	var http = new XMLHttpRequest();
	http.open("GET", action, false, user, password);
	http.send('');
	if (http.status == 200) {
		window.location = "http://album.foo-projects.org/";
		return true;
	} else {
		alert('[' + http.status + ']: Incorrect username or password specified. Please try again.');
	}
}
-->
</script>
</head>
<body>
  <div style="text-align: center; padding: 5px;">
    <a href="http://album.foo-projects.org/">album.foo-projects.org</a><br />
  </div>
  <hr />
  <div style="overflow: auto; height: 100%; text-align: center; padding: 5px;">
  <form>
    Username: <input id="user" type="text" /><br />
    Password: <input id="password" type="password" /><br />
    &nbsp;<br />
    <input type="button" value="login" onclick="login();" />
  </form>
  </div>
  <div id="message"></div>
</body>
</html>
