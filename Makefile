l := locations
$(l)/locations.js: $(l)/cities.json $(l)/flags.json;
	NODE_NO_WARNINGS=1 $(l)/mkdb.js > $@
$(l)/cities.json:; curl -fL https://github.com/dr5hn/countries-states-cities-database/raw/master/cities.json > $@

server: kill; node "`pwd`/server.js" &
kill:; -pkill -f "node `pwd`/server.js"

.DELETE_ON_ERROR:
