function cities_fetch(url = "world-cities.csv") {
    if (cities_fetch.R) return cities_fetch.R

    cities_fetch.R = fetch(url).then( v => {
        if (!v.ok) throw new Error(v.statusText)
        return v.text()
    }).then( text => {
            return text.split("\n").map( (line, idx) => {
                if (idx === 0) return
                let [city, country, region] = line.split(",")
                if (!city) return
                return [city, country, region].join`, `
            }).filter(Boolean)
    })

    return cities_fetch.R
}

function debounce(fn, ms = 0) {
    let tid
    return function(...args) {
        clearTimeout(tid)
        tid = setTimeout(() => fn.apply(this, args), ms)
    }
}

async function completion(query, limit = 10) {
    let cities = await cities_fetch()
    query = query.toLowerCase()
    return cities.filter( v => v.toLowerCase().includes(query)).map( v => {
        return `<option value="${v}">` // FIXME
    }).slice(0, limit).join`\n`
}

let cities = document.querySelector("#cities")
let city = document.querySelector("#city")
let weather = document.querySelector("#weather")

city.addEventListener("input", async function(evt) {
    console.log(evt.inputType)
    if (evt.inputType === "insertReplacementText") { // firefox
        this.dispatchEvent(new Event('change'))
        cities.innerHTML = ''
        return
    } else if (! evt.inputType?.match(/^(insertText|delete|insertFromPaste)/)) {
        cities.innerHTML = ''
        return
    }

    try {
        cities.innerHTML = await completion(this.value)
    } catch (e) {
        evt = new Event('my-error')
        evt.error = e
        this.dispatchEvent(evt)
    }
})

let prev_change_value
city.addEventListener("change", function() {
    if (prev_change_value === this.value) return
    console.log("CHANGE")
    prev_change_value = this.value
})

city.addEventListener("my-error", function(evt) {
    weather.innerText = evt.error
    console.error(evt.error)
})
