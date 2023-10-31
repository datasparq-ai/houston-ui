
const dummyData = JSON.parse(`{

  "/key": {
    "name": "Houston Demo",
    "id": "demo",
    "usage": "2"
  },

  "/plans": [
    "apollo",
    "discovery",
    "gemini",
    "mercury"
  ],

  "/plans/gemini": {"name": "gemini", "services": [], "stages": [{"name": "a"}, {"name": "b", "upstream": ["a"]}]},  
  "/plans/mercury": {"name": "mercury", "services": [], "stages": [{"name": "a"}, {"name": "b", "upstream": ["a"]}]},

  "/plans/apollo/missions": ["apollo-11"],
  "/plans/discovery/missions": ["m1", "m2", "m3"],
  "/plans/gemini/missions": ["m4"],
  "/plans/mercury/missions": ["m7"],
  
  "/missions/m1": {
    "i": "m1",
    "n": "discovery",
    "s": [
      {"n": "a", "d": ["b", "c", "d"], "t": "2020-02-19T13:41:00", "e": "2020-02-19T14:41:01", "s": 2, "p": {"foo": "bar"} },
      {"n": "b", "d": ["e"], "s": 4},
      {"n": "c", "d": ["f"], "t": "2020-02-19T14:41:01", "e": "2020-02-19T14:59:02", "s": 2},
      {"n": "d", "d": ["g"], "t": "2020-02-19T14:41:01", "e": "2020-02-19T15:30:02.5", "s": 2},
      {"n": "e", "s": 4},
      {"n": "f", "t": "2020-02-19T14:59:02", "e": "2020-02-19T15:41:03", "s": 2},
      {"n": "g", "t": "2020-02-19T15:30:02.5", "e": "2020-02-19T15:41:04", "s": 2},
      {"n": "h", "u": ["f", "g"], "t": "2020-02-19T15:41:04", "e": "2020-02-19T15:46:04", "s": 2}
    ],
    "t": "2020-02-19T14:42:00"
  },
  "/missions/m2": {
    "i": "m2",
    "n": "discovery",
    "s": [
      {"n": "a", "d": ["b", "c", "d"], "t": "2020-02-19T13:41:00", "e": "2020-02-19T14:41:01", "s": 2, "p": {"foo": "bar"} },
      {"n": "b", "d": ["e"], "s": 2},
      {"n": "c", "d": ["f"], "t": "2020-02-19T14:41:01", "e": "2020-02-19T14:59:02", "s": 2},
      {"n": "d", "d": ["g"], "t": "2020-02-19T14:41:01", "e": "2020-02-19T15:30:02.5", "s": 2},
      {"n": "e", "t": "2020-02-19T14:41:01", "e": "2020-02-19T15:30:02.5", "s": 2},
      {"n": "f", "t": "2020-02-19T14:59:02", "e": "2020-02-19T15:41:03", "s": 2},
      {"n": "g", "t": "2020-02-19T15:30:02.5", "e": "2020-02-19T15:41:04", "s": 2},
      {"n": "h", "u": ["f", "g"], "t": "2020-02-19T15:41:04", "e": "2020-02-19T15:46:04", "s": 2}
    ],
    "t": "2020-02-22T14:41:00",
    "e": "2020-02-22T18:30:22"
  },
  "/missions/m3": {
    "i": "m3",
    "n": "discovery",
    "s": [
      {"n": "a", "d": ["b", "c", "d"], "t": "2020-02-19T13:41:00", "e": "2020-02-19T14:41:01", "s": 2, "p": {"foo": "bar"} },
      {"n": "b", "d": ["e"], "s": 2},
      {"n": "c", "d": ["f"], "s": 4},
      {"n": "d", "d": ["g"], "t": "2020-02-19T14:41:01", "e": "2020-02-19T15:30:02.5", "s": 2},
      {"n": "e", "t": "2020-02-19T14:41:01", "e": "2020-02-19T15:30:02.5", "s": 2},
      {"n": "f", "s": 4},
      {"n": "g", "t": "2020-02-19T15:30:02.5", "e": "2020-02-19T15:41:04", "s": 2},
      {"n": "h", "u": ["f", "g"], "s": 4}
    ],
    "t": "2020-02-24T00:01:00",
    "e": "2020-02-24T18:31:22"
  },
  
  "/missions/m4": {
    "i": "m4",
    "n": "gemini",
    "s": [
      {"n": "a", "s": 2, "t": "2020-02-19T13:41:04", "e": "2020-02-19T14:41:39"},
      {"n": "b", "u": ["a"], "s": 2, "t": "2020-02-19T14:42:00", "e": "2020-02-19T15:42:44"}
    ],
    "t": "2020-02-19T13:41:00",
    "e": "2020-02-19T15:42:44"
  },
  
  "/missions/m7": {
    "i": "m7",
    "n": "mercury",
    "s": [
      {"n": "a", "s": 2, "t": "2020-02-19T13:41:04", "e": "2020-02-19T13:41:39"},
      {"n": "b", "u": ["a"], "s": 3, "t": "2020-02-19T13:42:00", "e": "2020-02-19T13:42:44"}
    ],
    "t": "2020-02-19T13:41:00",
    "e": "2020-02-19T13:42:44"
  },

  "/plans/apollo/missions-2": {
    "plans": {
      "001": [
        {
          "id": "f9ygys46tly9ctx5yyu8iuf7",
          "plan": "001",
          "complete": true,
          "stages": [
            {"name": "a", "downstream": ["b", "c", "d"], "st": "2020-02-19T13:41:00", "e": "2020-02-19T14:41:01", "cp": true, "dt": "read 3 files"},
            {"name": "b", "downstream": ["e"], "ig": true},
            {"name": "c", "downstream": ["f"], "st": "2020-02-19T14:41:01", "e": "2020-02-19T14:59:02", "cp": true},
            {"name": "d", "downstream": ["g"], "st": "2020-02-19T14:41:01", "e": "2020-02-19T15:30:02.5", "cp": true},
            {"name": "e", "ig": true},
            {"name": "f", "st": "2020-02-19T14:59:02", "e": "2020-02-19T15:41:03", "cp": true},
            {"name": "g", "st": "2020-02-19T15:30:02.5", "e": "2020-02-19T15:41:04", "cp": true},
            {"name": "h", "upstream": ["f", "g"], "st": "2020-02-19T15:41:04", "e": "2020-02-19T15:42:04", "cp": true}
          ],
          "start": "2020-02-21T14:42:00",
          "end": "2020-02-22T18:30:22",
          "loaded": true
        }
      ],
      "222": [
        {
          "id": "f87hrfbf3ouywjmfo89sp",
          "plan": "222",
          "complete": true,
          "stages": [
            {"name": "a", "cp": true, "downstream": ["b", "h"], "st": "2020-02-19T14:41:02", "e": "2020-02-19T14:56:33"},
            {"name": "b", "cp": true, "downstream": ["c", "f", "e"], "st": "2020-02-19T14:56:52", "ed": "2020-02-19T15:05:00"},
            {"name": "c", "cp": true, "downstream": ["d"], "st": "2020-02-19T15:05:00", "ed": "2020-02-19T15:06:30"},
            {"name": "d", "cp": true, "st": "2020-02-19T15:07:09", "ed": "2020-02-19T15:08:00"},
            {"name": "e", "cp": true, "downstream": ["d", "g"], "st": "2020-02-19T15:05:00", "ed": "2020-02-19T15:07:00"},
            {"name": "f", "cp": true, "st": "2020-02-19T15:05:00", "ed": "2020-02-19T15:12:00"},
            {"name": "g", "cp": true, "downstream": ["m"], "st": "2020-02-19T15:07:09", "ed": "2020-02-19T15:08:00"},
            {"name": "h", "cp": true, "downstream": ["i"], "st": "2020-02-19T14:56:52", "ed": "2020-02-19T15:15:00"},
            {"name": "i", "cp": true, "downstream": ["j", "k", "l"], "st": "2020-02-19T15:15:00", "ed": "2020-02-19T15:18:00"},
            {"name": "j", "cp": true, "st": "2020-02-19T15:18:30", "ed": "2020-02-19T15:21:10"},
            {"name": "k", "cp": true, "st": "2020-02-19T15:18:10", "ed": "2020-02-19T15:21:00"},
            {"name": "l", "cp": true, "downstream": "m", "st": "2020-02-19T15:18:04", "ed": "2020-02-19T15:21:40"},
            {"name": "m", "cp": true, "st": "2020-02-19T15:21:40", "ed": "2020-02-19T15:27:40"}
          ],
          "start": "2020-02-19T14:41:00",
          "end": "2020-02-19T18:30:22",
          "loaded": true
        }
      ]
    }
  },
  
  "/missions/apollo-11": {
    "i": "apollo-11",
    "n": "apollo",
    "a": null,
    "s": [
      {
        "n": "engine-ignition",
        "a": "engine-relay",
        "u": null,
        "d": null,
        "p": null,
        "s": 0,
        "t": "0001-01-01",
        "e": "0001-01-01"
      },
      {
        "n": "engine-thrust-ok",
        "a": "engine-relay",
        "u": [
          "engine-ignition"
        ],
        "d": null,
        "p": null,
        "s": 0,
        "t": "0001-01-01",
        "e": "0001-01-01"
      },
      {
        "n": "release-holddown-arms",
        "a": "tower",
        "u": [
          "engine-thrust-ok"
        ],
        "d": null,
        "p": null,
        "s": 0,
        "t": "0001-01-01T00:00:00Z",
        "e": "0001-01-01T00:00:00Z"
      },
      {
        "n": "umbilical-disconnected",
        "a": "",
        "u": null,
        "d": null,
        "p": null,
        "s": 0,
        "t": "0001-01-01",
        "e": "0001-01-01"
      },
      {
        "n": "liftoff",
        "a": "",
        "u": [
          "release-holddown-arms",
          "umbilical-disconnected"
        ],
        "d": null,
        "p": null,
        "s": 0,
        "t": "0001-01-01T00:00:00Z",
        "e": "0001-01-01T00:00:00Z"
      },
      {
        "n": "yaw-maneuver",
        "a": "",
        "u": [
          "liftoff"
        ],
        "d": null,
        "p": null,
        "s": 0,
        "t": "0001-01-01T00:00:00Z",
        "e": "0001-01-01T00:00:00Z"
      }
    ],
    "p": null,
    "t": "2022-10-25T14:00:08.841063+01:00",
    "e": "0001-01-01T00:00:00Z"
  },

  "/plans/apollo": {
    "name": "apollo",
    "services": [
      {"name": "engine-relay"}
    ],
    "stages": [
      {"name": "engine-ignition", "params": {"foo": "bar"}, "service": "engine-relay"},
      {"name": "engine-thrust-ok", "upstream": ["engine-ignition"]},
      {"name": "release-holddown-arms", "upstream": ["engine-thrust-ok"]},
      {"name": "umbilical-disconnected"},
      {"name": "liftoff", "upstream": ["release-holddown-arms", "umbilical-disconnected"]},
      {"name": "yaw-maneuver", "upstream": ["liftoff"]}
    ]
  },

  "/plans/discovery": {
    "name": "discovery",
    "stages": [
      {"name": "a", "downstream": ["b", "c", "d"]},
      {"name": "b", "downstream": ["e"]},
      {"name": "c", "downstream": ["f"]},
      {"name": "d", "downstream": ["g"]},
      {"name": "e"},
      {"name": "f"},
      {"name": "g"},
      {"name": "h", "upstream": ["f", "g"]}
    ]
  }
}`)

export default dummyData

// create fake websocket updates for demo mode
export const newMission = JSON.parse(JSON.stringify(dummyData["/missions/apollo-11"]))
newMission.i = "apollo-12"
// newMission.t = "2022-10-25T14:01:00.0+01:00"
newMission.s[0].s = 2
newMission.s[0].t = "2022-10-25T14:00:09.84174+01:00"
newMission.s[0].e = "2022-10-25T14:00:10.184694+01:00"
newMission.s[1].s = 5
newMission.s[2].s = 1
newMission.s[2].t = "2022-10-25T14:00:12+01:00"
newMission.s[3].s = 1
newMission.s[3].t = "2022-10-25T14:00:09.185106+01:00"

dummyData["/missions/apollo-11"].t = (new Date()).toISOString()
export const dummyMissionUpdates = [
  [0, 1],
  [3, 1],
  [0, 2],
  [1, 1],
  [1, 2],
  [2, 1],
  [3, 2],
  [2, 2],
  [4, 1],
  [4, 2],
  [5, 1],
  [5, 2],
]
