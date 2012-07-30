#!/bin/bash

LIST=`find ./ -name '*.mpg' -o  -name '*.MPG' -o  -name '*.avi' -o  -name '*.AVI' -o -name '*.mp4' -o -name '*.MP4' -o -name '*.ogv' -o -name '*.OGV'`

for n in $LIST ; do
	B=`echo $n | sed 's/[.][a-zA-Z][a-zA-Z][a-zA-Z4]$//'`

	# thm
	if [ ! -f $B.thm -a ! -f $B.THM ]; then
		echo "+$B.thm"
		ffmpeg -i $n -ss 0 -vframes 1 -f mjpeg -an $B.thm.in > /dev/null 2>&1
		convert $B.thm.in -resize 100x100 $B.thm
		rm $B.thm.in
	fi

	# mp4
	if [ ! -f $B.mp4 -a ! -f $B.MP4 ]; then
		echo "+$B.mp4"
		ffmpeg -i $n -vcodec libx264 $B.mp4 > /dev/null 2>&1
	fi

	# ogv
	if [ ! -f $B.ogv -a ! -f $B.OGV ]; then
		echo "+$B.ogv"
		ffmpeg2theora $n -o $B.ogv > /dev/null 2>&1
	fi
done

exit 0

