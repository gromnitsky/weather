l := locations
$(l)/locations.js: $(l)/cities.json $(l)/flags.json
	$(l)/mkdb.js $^ > $@
$(l)/cities.json:; curl -fL https://github.com/dr5hn/countries-states-cities-database/raw/master/cities.json > $@

server: kill $(l)/locations.js; node "`pwd`/server.js" &
kill:; -pkill -f "node `pwd`/server.js"

.DELETE_ON_ERROR:
