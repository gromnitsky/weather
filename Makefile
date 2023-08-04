out := _out
web := $(out)/web
static := $(addprefix $(web)/, web.js flags.json index.html)

all: $(out)/locations.txt $(static)

$(web)/%: %
	$(mkdir)
	cp $< $@

$(out)/locations.txt: $(out)/cities.json
	$(mkdir)
	sed "s/”/'/g" $< | uconv -f utf-8 -t utf-8 -x latin-ascii | ./mkdb.js > $@

$(out)/cities.json:
	$(mkdir)
	curl -fL https://github.com/dr5hn/countries-states-cities-database/raw/master/cities.json > $@

cmd := "`pwd`/server.js" $(web)
server: all kill; node $(cmd) &
kill:; -pkill -f "node $(cmd)"

.DELETE_ON_ERROR:
mkdir = @mkdir -p $(dir $@)
