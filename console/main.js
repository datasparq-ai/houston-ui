
var keys = localStorage.keys ? JSON.parse(localStorage.keys) : {active: {}, list: {}};

// if keys is the wrong structure then delete and recreate
if (!(keys.hasOwnProperty("active") && keys.hasOwnProperty("list"))) {
  delete localStorage.keys;
  keys = {active: {}, list: {}}
}
var METHOD = "GET"

const log = document.createElement("code")

function appendLog(item, json= false, colour = "inherit") {
  console.log(item)
  if (json) {
    item = JSON.stringify(item, null, "  ")
  }
  log.innerHTML += "<br/><span style='color:" + colour + ";'>" + item + "</span>"
}

async function get(path = "", key) {
  if (path.length > 0 && path[0] !== "/") {
    path = "/" + path
  }
  appendLog("· " + METHOD + " /api/v1" + path, false, "var(--blue)")
  const res = await fetch("/api/v1" + path, {
    method: METHOD,
    headers: {
      'Content-Type': 'application/json',
      'x-access-key': key,
    }
  })

  if (res.status > 200) {
    appendLog("! Error " + res.status + ": " + res.statusText,false, "var(--red)")
    return res.text()
  }

  return res.json()
}

async function enterNewKey() {
  const newKey = prompt("Enter your Houston key", "")
  if (newKey !== "" && newKey !== null) {
    return await get("/key", newKey).then(key => {
      console.log(key, typeof key)
      if (typeof key === "string") {
        return false
      } else {
        keys.list[key.name] = key.id
        keys.active.name = key.name
        keys.active.id = key.id
        localStorage.keys = JSON.stringify(keys);
        return true
      }
    })
  } else {
    localStorage.keys = JSON.stringify(keys);
    return false
  }
}

window.onload = function () {

  // use key from local storage if one exists
  if (!keys || !keys.list || Object.keys(keys.list).length === 0) {
    enterNewKey().then(ok => {
      if (!ok) {
        appendLog("The key you entered was not found on this server. Click '+' to try again", false, "var(--red)")
      }
      render()
    })
  } else {
    render()
  }
}

function render() {

  const keyContainer = document.createElement("div")
  keyContainer.style.position = "absolute"
  keyContainer.style.top = "5px"
  keyContainer.style.right = "5px"
  keyContainer.style.display = "flex"
  keyContainer.style.gap = "1px"
  keyContainer.style.width = "33%"

  const keySelect = document.createElement("select")
  Object.keys(keys.list).map(k => {
    const option = document.createElement("option")
    option.setAttribute("value", k)
    option.innerText = k
    keySelect.appendChild(option)
  })
  keySelect.style.width = "100%"
  keySelect.onchange = e => {
    keys.active.id = keySelect.value
    console.log(e)
    console.log(keys)
    keys.active.name = Object.entries(keys.list).filter(a => a[1] === keySelect.value)[0][0]
    initWebSocket()
  }

  const addKeyButton = document.createElement("button")
  addKeyButton.onclick = e => {
    enterNewKey().then(ok => {
      if (ok) {
        const option = document.createElement("option")
        option.setAttribute("value", keys.active.id)
        option.innerText = keys.active.name
        keySelect.appendChild(option)
        keySelect.value = keys.active.id
        initWebSocket()
      }
    })

  }
  addKeyButton.innerText = "+"

  const deleteKeyButton = document.createElement("button")
  deleteKeyButton.onclick = e => {
    document.querySelector("option[value=" + keys.active.id + "]").remove()
    delete keys.list[keys.active.name]
    if (Object.keys(keys.list).length > 0) {
      keys.active.name = Object.keys(keys.list)[0]
      keys.active.id = keys.list[Object.keys(keys.list)[0]]
      initWebSocket()
    } else {
      addKeyButton.onclick({})
    }
    localStorage.keys = JSON.stringify(keys);

  }
  deleteKeyButton.innerText = "✕"

  const logOuter = document.createElement("pre")
  logOuter.appendChild(log)

  const input = document.createElement("input")
  input.style.width = "calc(100% - 81px)"
  const parseAPIResponse = d => {
    if (typeof d.message !== "undefined") {
      return appendLog(d.message.replace("\\n", "\n"), false)
    } else {
      return appendLog(d, true)
    }
  }

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      get(input.value, keys.active.id).then(parseAPIResponse)
    }
  })

  const methodSelect = document.createElement("select");
  methodSelect.style.width = "80px";

  (["GET", "DELETE"]).map(method => {
    const option = document.createElement("option")
    option.setAttribute("value", method)
    option.innerText = method
    methodSelect.appendChild(option)
  })

  methodSelect.onchange = e => {
    METHOD = methodSelect.value;
  }

  const inputContainer = document.createElement("div")
  inputContainer.style.position = "absolute"
  inputContainer.style.display = "flex"
  inputContainer.style.gap = "1px"
  inputContainer.style.width = "calc(100% - 16px)"

  appendLog("· HOUSTON CONSOLE ·", false, "var(--blue)")

  function initWebSocket() {
    // browsers do not allow 'mixed content'. If TLS has been configured on the Houston server then we must use WSS.
    let conn
    if (window.location.protocol === "https:") {
      conn = new WebSocket("wss://" + window.location.host + "/ws?a=" + keys.active.id);
    }
    else {
      conn = new WebSocket("ws://" + window.location.host + "/ws?a=" + keys.active.id);
    }
    console.log(conn)
    conn.onclose = function (evt) {
      appendLog("! WebSocket connection closed", false, "var(--red)");
      setTimeout(() => {
        // initWebSocket()
      }, 500)
    };
    conn.onmessage = function (ev) {

      console.log(ev.data);

      const messages = ev.data.split('\n');

      messages.forEach(mData => {
        appendLog(JSON.parse(mData), true, "var(--purple)")
      })

    };
    conn.onopen = function (ev) {
      // let message = {type: "notification", data: name.value + " has entered the chat"};
      // conn.send(JSON.stringify(message));
      appendLog("! WebSocket connection opened", false, "var(--purple)");
      console.log(ev)

    }
    conn.onerror = (ev) => {
      appendLog("! WebSocket error", false, "var(--red)");
      console.log(ev)
    }
  }

  keyContainer.appendChild(addKeyButton)
  keyContainer.appendChild(keySelect)
  keyContainer.appendChild(deleteKeyButton)
  document.body.appendChild(keyContainer)
  document.body.appendChild(logOuter)
  inputContainer.appendChild(methodSelect)
  inputContainer.appendChild(input)
  document.body.appendChild(inputContainer)

  if (window["WebSocket"]) {
    initWebSocket()
  } else {
    appendLog("! Your browser does not support WebSockets.", false, "var(--red)");
  }

};