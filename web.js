function cities(query) {
    return fetch('?city='+query).then( v => {
        if (!v.ok) throw new Error(v.statusText)
        return v.json()
    })
}

function debounce(fn, ms = 0) {
    let tid
    return function(...args) {
        clearTimeout(tid)
        tid = setTimeout(() => fn.apply(this, args), ms)
    }
}

async function completion(query) {
    return (await cities(query)).map( v => {
        return `<option value="${v}">` // FIXME
    }).join`\n`
}

let city = document.querySelector("#form input")
let datalist = document.querySelector("#form datalist")
let weather = document.querySelector("#weather")

city.addEventListener("input", debounce(async function(evt) {
    console.log(evt.inputType)
    if (evt.inputType === "insertReplacementText") { // firefox
        this.dispatchEvent(new Event('change'))
        datalist.innerHTML = ''
        return
    } else if (!evt.inputType?.match(/^(insertText|delete|insertFromPaste)/)) {
        datalist.innerHTML = ''
        return
    }

    try {
        datalist.innerHTML = await completion(this.value)
    } catch (e) {
        evt = new Event('my-error')
        evt.error = e
        this.dispatchEvent(evt)
    }
}, 250))

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
