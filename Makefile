server: kill
	node "`pwd`/server.js" &

kill:
	-pkill -f "node `pwd`/server.js"
