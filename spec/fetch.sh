#!/bin/sh

f=index.html

if [ ! -e $f ]; then
  curl -o $f https://drafts.csswg.org/selectors/
fi

s=$(grep -n '<table' $f | cut -d ':' -f 1)
t=$(grep -n '</table>' $f | cut -d ':' -f 1)
sed -n "$s,${t}p" $f > overview.html
