
import dummyData, {newMission, dummyMissionUpdates} from '../components/App/dummyData'

export function initWebSocket(key, demo) {
  let conn;
  if (!demo) {
    // browsers do not allow 'mixed content'. If TLS has been configured on the Houston server then we must use WSS.
    if (window.location.protocol === "https:") {
      conn = new WebSocket("wss://" + window.location.host + "/ws?a=" + key);
    } else {
      conn = new WebSocket("ws://" + window.location.host + "/ws?a=" + key);
    }
  }
  else {
    conn = {}  // create an object to represent the websocket connection
    setTimeout(() => {
      conn.onmessage({data: JSON.stringify({"content": "New client connected","event":"notice"})})
    }, 1000)
    setTimeout(() => {
      newMission.t = (new Date()).toISOString()
      conn.onmessage({data: JSON.stringify({"content": newMission, "event": "missionCreation"})})
    }, 3000)

    const updatedMission = JSON.parse(JSON.stringify(dummyData["/missions/apollo-11"]))

    dummyMissionUpdates.map(([stage, state] , i) => {

      setTimeout(() => {

        updatedMission.s[stage].s = state
        if (state === 1) {
          updatedMission.s[stage].t = (new Date()).toISOString()
        } else if (state === 2) {
          updatedMission.s[stage].e = (new Date()).toISOString()
        }

        conn.onmessage({data: JSON.stringify({"content": updatedMission, "event": "missionCreation"})})

      }, 2000 + i * 200)

      // setTimeout(() => {
      //   // this tests that everything reloads correctly
      //   conn.onmessage({data: JSON.stringify({"content": "", "event": "planCreation"})})
      // }, 10000)

      return [stage, state]
    })
  }

  conn.onclose = function (ev) {
    console.log("! WebSocket connection closed");
    // TODO: how to recover from this?
    // setTimeout(() => {
    //   initWebSocket()
    // }, 1000)
  };

  conn.onopen = function (ev) {
    console.log("! WebSocket connection opened");
  }

  conn.onerror = (ev) => {
    console.log("! WebSocket error");
    console.log(ev)
  }

  return conn
}
