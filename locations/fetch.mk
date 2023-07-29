#!/usr/bin/make -f

s := $(dir $(realpath $(lastword $(MAKEFILE_LIST))))

$(s)/Locations.js: $(s)/Locations.xml
	ruby $(s)/cities.rb $< > $@
	[ `stat -c %s $@` -gt 250000 ]

$(s)/Locations.xml:
	curl -f https://gitlab.gnome.org/GNOME/libgweather/-/raw/main/data/Locations.xml > $@

.DELETE_ON_ERROR:
