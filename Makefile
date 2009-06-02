
CLIENT = album.css album.js
IMAGES = go-next.png go-previous.png movie.jpg
SERVER = album.php auth.php db.php image.php index.php login.php logout.php \
	 members.php private.php upload.php
TOOLS  = thumbs.sh Makefile

all: install

dist:
	tar czf album-`date -u +%Y%m%d`.tar.gz $(CLIENT) $(IMAGES) $(SERVER) $(TOOLS)

install:
	@echo Creating cache path:
	mkdir -p .c
	chmod 0777 .c
	@echo Installation complete. Make sure you have PHP installed with
	@echo EXIF support enabled. To pre-seed the cache, run `thumbs.sh`.
	@echo Add albums by uploading image folders to the root path.
