#!/bin/bash

renice +20 -p $$

do_folder()
{
	if [ ! -d $1 ]; then
		continue
	fi

	cd $1
	mkdir -p ../.c/$1 > /dev/null 2>&1
	chmod go+rwx ../.c/$1 > /dev/null 2>&1
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

		# DT=$(jhead $f | cut -d: -f2-)
		if [ . -nt $f ]; then
			echo "touch -r $f ."
			touch -r $f .
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

		if [ ! -f $t ]; then
			echo "$1 - $t"
			set -x
			# extract frame #1
			ffmpeg -i $f -ss 0 -vframes 1 -f mjpeg -an $t.tmp > /dev/null 2>&1
			# and scale it to thumb size
			convert $t.tmp -resize 100x100 $t
			rm $t.tmp

			set +x
		fi

		# see if we need to convert the file to ogv
		v=${f//.avi/.ogv}
		v=${v//.AVI/.OGV}
		v=${v//.mp4/.ogv}
		v=${v//.MP4/.OGV}

		if [ ! -f $v ]; then
			echo "$1 - $v"
			~sofar/bin/ffmpeg2theora $f -o $v
			touch -r $f $v
			touch -r $f .
		fi
	done
	
	touch -r $(ls *.[Jj][Pp][Gg] | head -n 1 ) .

	cd ..

}

if [ -n "$1" ] ; then
	FOLDERS="$@"
else
	# might not work for other setups
	FOLDERS=`ls -ad */`
fi

if ! jhead -V > /dev/null; then
	echo "This script requires 'jhead' to be installed"
	exit
fi

for n in $FOLDERS ; do
	echo $n
	do_folder $n
done

