out := _out
web := $(out)/web
static := $(addprefix $(web)/, web.js index.html)

all: $(out)/locations.txt $(static)

$(web)/%: %
	$(mkdir)
	cp $< $@

$(out)/locations.txt: $(out)/cities.json flags.json
	$(mkdir)
	./mkdb.js $^ > $@

$(out)/cities.json:
	$(mkdir)
	curl -fL https://github.com/dr5hn/countries-states-cities-database/raw/master/cities.json > $@

cmd := "`pwd`/server.js" $(web)
server: all kill; node $(cmd) &
kill:; -pkill -f "node $(cmd)"

.DELETE_ON_ERROR:
mkdir = @mkdir -p $(dir $@)
