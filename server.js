import http from 'http'
import locations from './locations/Locations.js'

function usage(res) {
    res.statusCode = 400
    res.statusMessage = 'usage: ?city=query ?l=location or /'
    res.end()
}

function cities(res, q) {
    q = q.trim().toLowerCase()
    let r = locations.filter( v => v[0].toLowerCase().includes(q))
        .slice(0, 10).map( v => v[0])
    res.end(JSON.stringify(r))
}

let server = http.createServer( (req, res) => {
    let url; try {
        url = new URL(req.url, `http://${req.headers.host}`)
    } catch (_) {
        usage(res)
        return
    }

    if (process.env.DEBUG) res.setHeader('Access-Control-Allow-Origin', '*')

    let city = url.searchParams.get('city')
    let location = url.searchParams.get('l')

    if (city) {
        cities(res, city)
    } else if (req.url === '/') {
        res.end(locations.length.toString())
    } else
        usage(res)
})

if (import.meta.url.endsWith(process.argv[1]))
    server.listen(process.env.PORT || 3000)
