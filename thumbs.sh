#!/bin/bash

renice +20 -p $$

do_folder()
{
	if [ ! -d $1 ]; then
		continue
	fi

	cd $1
	mkdir -p ../.c/$1
	chmod go+rwx ../.c/$1
	for f in *.jpg *.JPG *.jpeg *.JPEG; do
		if [ ! -f $f ] ; then
			continue
		fi

		# don't need to run jhead if thumbs exist
		if [ -f ../.c/$1/x50-$f ] &&
		   [ -f ../.c/$1/x100-$f ] &&
		   [ -f ../.c/$1/x800-$f ] ; then
			continue
		fi

		# rotate if needed
		unset R
		O=$(jhead -exifmap "$f" | grep ^Orientation | cut -d: -f2)
		case "$O" in
		*90)	R="-rotate 90" ;;
		*180)	R="-rotate 180" ;;
		*270)	R="-rotate 270" ;;
		esac

		PRINT=
		if [ ! -f ../.c/$1/x50-$f ]; then
			PRINT=$f
			convert $f -resize 50x50 $R ../.c/$1/x50-$f &
		fi
		if [ ! -f .c/x100-$f ]; then
			PRINT=$f
			convert $f -resize 100x100 $R ../.c/$1/x100-$f &
		fi
		if [ ! -f .c/x800-$f ]; then
			PRINT=$f
			convert $f -resize 800x800 $R ../.c/$1/x800-$f &
		fi
		if [ -n "$PRINT" ]; then
			echo -n "$1 - $PRINT"
		fi

		wait
		if [ -n "$PRINT" ]; then
			echo
		fi
	done

	for f in *.avi *.AVI *.mpg *.MPG; do
		if [ ! -f $f ]; then
			continue
		fi
		t=${f//.avi/.thm}
		t=${t//.AVI/.THM}
		t=${t//.mpg/.thm}
		t=${t//.MPG/.THM}

		if [ -f $t ]; then
			continue
		else
			cp ../movie.jpg $t
			echo "$1 - $t"
		fi
	done

	cd ..
}

if [ -n "$1" ] ; then
	FOLDERS="$@"
else
	# might not work for other setups
	FOLDERS=200*
fi

if ! jhead -V > /dev/null; then
	echo "This script requires 'jhead' to be installed"
	exit
fi

for n in $FOLDERS ; do
	echo $n
	do_folder $n
done

