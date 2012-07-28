
global $db_file = "album.sqlite";
global $db;

function db_open() {
	if (!file_exists($db_fil)) {
		db_create();
	}
	$db = sqlite_open($db_file);
}

function db_create() {
	$db = new SQLiteDatabase($db_file);
	$db->query("BEGIN;
		CREATE TABLE users(
			id INTEGER PRIMARY KEY,
			name CHAR(255),
			password CHAR(255),
			role INTEGER);
		INSERT INTO users (name, role) VALUES('admin', '1');
	        COMMIT;");

function db_close() {
	sqlite_close($db_file);
}
