import http from 'http'
import fs from 'fs'
import path from 'path'

function find(q, limit, callback) {
    let r = []
    q = (q || '').trim().toLowerCase(); if (!q) return r

    let buf = Buffer.alloc(1024*50)
    let pos = 0
    while (fs.readSync(lfd, buf, 0, buf.length, pos)) {
        let ln = buf.lastIndexOf(10)
        ln > 0 ? pos += ln+1 : pos = -1

        let lines = buf.slice(0, ln).toString().split("\n")
        for (let line of lines) {
            let match = callback(line.split("|"), q)
            if (match) {
                r.push(match)
                limit--
            }
            if (!limit) break
        }
        if (!limit) break
    }

    return r
}

function cities(res, query) {
    let r = find(query, 10, (v, q) => {
        return v[0]?.toLowerCase()?.includes(q) ? v[0] : null
    })

    res.setHeader("Expires", new Date(Date.now() + 300*1000).toUTCString())
    res.end(JSON.stringify(r))
}

function weather(res, query) {
    let co = find(query, 1, (v, q) => {
        return v[0]?.toLowerCase() === q ? {lat: v[1], lon:v[2]} : null
    })[0]
    if (!co) return err(res, 'invalid location')

    fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${co.lat}&lon=${co.lon}`).then( async v => {
        if (!v.ok) throw new Error(v.statusText)
        return { expires: v.headers.get('expires'), json: await v.json() }
    }).then( v => {
        let r = v.json?.properties?.timeseries?.[0]
        if (v.expires) res.setHeader("Expires", v.expires)
        res.end(JSON.stringify({
            time: r?.time,
            details: r?.data?.instant?.details,
            co
        }))
    }).catch( e => err(res, `MET Norway: ${e.message}`, 500))
}

let server = http.createServer( (req, res) => {
    let url; try {
        url = new URL(req.url, `http://${req.headers.host}`)
    } catch {
        return usage(res)
    }

    if (req.method === 'GET' && url.pathname === '/api') {
        let city = url.searchParams.get('city')
        let location = url.searchParams.get('l')

        if (city != null) {
            cities(res, city)
        } else if (location != null) {
            weather(res, location)
        } else
            usage(res)
    } else
        serve_static(res, url.pathname)
})

let public_root = fs.realpathSync(process.argv[2])
let lfd = fs.openSync(public_root + '/../locations.txt')

if (import.meta.url.endsWith(process.argv[1]))
    server.listen(process.env.PORT || 8080)

function err(res, msg, code = 400) {
    res.statusCode = code
    res.statusMessage = msg
    res.end()
}

function usage(res) { err(res, 'Usage: /api?city=query /api?l=location') }

function serve_static(res, file) {
    if (/^\/+$/.test(file)) file = "index.html"
    let name = path.join(public_root, path.normalize(file))
    fs.stat(name, (err, stats) => {
        if (err || !stats.isFile()) {
            res.statusCode = 404
            return res.end()
        }
        res.setHeader('Content-Length', stats.size)
        res.setHeader('Content-Type', {
            '.html': 'text/html',
            '.js': 'application/javascript'
        }[path.extname(name)] || 'application/octet-stream')

        let stream = fs.createReadStream(name)
        stream.on('error', err => {
            res.statusCode = 500
            console.error(err.message)
            res.end()
        })
        stream.pipe(res)
    })
}
