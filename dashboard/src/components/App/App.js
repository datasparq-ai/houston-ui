import React, { useState, useEffect } from "react";
import { Switch } from '@material-ui/core'  // https://material-ui.com/components/switches/
import HelpIcon from '@material-ui/icons/Help';
import { withStyles } from '@material-ui/core/styles';

import requests from '../../js/requests'
import { URLToState, stateToURL } from '../../js/url'
import { useLocalStorageKeys } from "../../js/hooks";
import { initWebSocket } from "../../js/websocket";

import './App.scss';
import styles from '../../style-variables'
import View from '../View/View'
import Help from '../Help/Help'
import KeySelect from '../KeySelect/KeySelect'

const DarkModeSwitch = withStyles({
  switchBase: {
    '&$checked': {
      color: "white",
    },
    '&$checked + $track': {
      backgroundColor: styles.link,
    },
  },
  checked: {},
  track: {},
})(Switch);


const getStateFromURL = () => {
  let URLState = URLToState();

  let darkMode = false;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    darkMode = true;
  }

  return {
    darkMode: (URLState.dark === "true" || darkMode) ?? darkMode,
    demo: URLState.demo === "true" ?? false,  // when true, app is in demo mode and does not need authentication to work
    showHelp: URLState.help === "true" ?? false,
    key: URLState.key ?? null,
  }
};

export default function App() {

  const urlState = getStateFromURL()
  const demo = urlState.demo;

  const [plans, setPlans] = useState({});
  const [darkMode, setDarkMode] = useState(urlState.darkMode);
  const [showHelp, setShowHelp] = useState(urlState.showHelp);
  const [keys, setKeys] = useLocalStorageKeys(demo, urlState.key)

  /**
   * Initialise the websocket
   */
  useEffect(() => {
    const ws = initWebSocket(keys.active.id, demo)

    ws.onmessage = (ev) => {

      const messages = ev.data.split('\n');

      messages.forEach(message => {
        const data = JSON.parse(message)
        if (data.event === "missionCreation" || data.event === "missionUpdate" || data.event === "missionCompleted") {
          const mission = data.content
          setPlans(state => {
            mission.loaded = true;
            return _updateMissions(state, mission.n, {[mission.i]: mission})
          });

        }
        else if (data.event === "planDeleted") {
          setPlans(state => {
            delete state[data.content]
            return { ...state }
          })
        }
      })
    };
  }, [keys.active.id, demo])

  /**
   * State Changer
   */
  const onDarkModeSwitch = () => {
    window.history.pushState({}, null, stateToURL([{dark: !darkMode}]));
    setDarkMode(!darkMode)
  };

  useEffect(() => {
    if (darkMode) {
      document.body.setAttribute("data-theme", "dark");
    }
    else {
      document.body.removeAttribute("data-theme");
    }
  }, [darkMode])

  /**
   * State Changer
   */
  const onClickHelpButton = () => {
    setShowHelp(!showHelp)
  };

    /**
     * API Get - Request all plans
     */
    const listPlans = async () => {
      if (keys.active.id === null) {
        return
      }

      try {

        return requests.get('/plans', keys.active.id, (res, err) => {

          if (err || res.status !== 200) {
            console.error(res, err);
            return null;
          }

          if (res.data === null) {
            return
          }

          // do not overwrite existing data - manual merge
          return setPlans(state => {

            res.data.map(newPlan => {
              if (state[newPlan]) {
                // do nothing
              } else {
                state[newPlan] = {
                  name: newPlan,
                  missions: {},
                }
              }
              return newPlan  // not used
            });

            return { ...state }

          });

        }, demo)
      }
      catch (err) {
        console.log(err)
      }

    };

    /**
     * API Get - Gets all active missions grouped by plan and updates state.
     */
    const getMissions = async () => {
      if (keys.active.id === null) {
        return
      }

      return Promise.all(Object.keys(plans).map(plan => {

        return requests.get(`/plans/${plan}/missions`, keys.active.id,(res, err) => {

          if (err || res.status !== 200) {
            console.error(res, err);
            return null;
          }

          if (!res) return new Error();

          if (!res.data) {
            return
          }

          const missions = {};
          res.data.forEach(missionId => {
            missions[missionId] = {loaded: false}
          });
          setPlans(state => {
            return _updateMissions(state, plan, missions)
          });

          return Promise.all(res.data.map(missionId => {
            return requests.get(`/missions/${missionId}`, keys.active.id, (res2, err) => {
              if (err || res.status !== 200) {
                console.error(res2, err);
                return null;
              }
              return setPlans(state => {
                res2.data.loaded = true;
                return _updateMissions(state, plan, {[missionId]: res2.data})
              });
            }, demo)
          }));

        }, demo)
      }));

    };

    const getPlans = () => {
      if (keys.active.id === null) {
        return
      }

      return Promise.all(Object.keys(plans).map(plan => {

        return requests.get(`/plans/${plan}`, keys.active.id, (res, err) => {

          if (err || res.status !== 200) {
            console.error(res, err);
            return null;
          }

          if (!res) return new Error();

          return setPlans(state => {
            state[plan] = { ...res.data, ...state[plan] }
            return { ...state }
          })

        }, demo)

      }))
    }

  /**
   * State Changer - Add a new or existing plan or mission to the state
   * @returns {state}
   */
  const _updateMissions = (state, planName, missions) => {

    // if plan is new, create new object
    if (typeof state[planName] === "undefined") {
      state[planName] = {
        name: planName,
        missions: missions,
      }
      return { ...state }
    }

    Object.keys(missions).forEach(missionId => {
      // if mission is already in the state then the new mission must be loaded
      // do not load the new mission if `loaded = false`
      if (state[planName].missions[missionId] && !missions[missionId].loaded) {
        return
      }
      state[planName].missions[missionId] = missions[missionId]
    })

    return { ...state }
  };

  const deletePlan = (planName) => {

    return requests.delete(`/plans/${planName}`, keys.active.id, () => {
      return setPlans(state => {
        delete state[planName]
        return { ...state }
      })
    }, demo)

  }

  const deleteMission = (planName, missionId) => {

    return requests.delete(`/missions/${missionId}`, keys.active.id, () => {
      return setPlans(state => {
        delete state[planName].missions[missionId]
        return { ...state }
      })
    }, demo)

  }

  const handleKeyChange = (newValue) => {
    if (newValue.label === null) {
      document.title = "Houston"
    } else {
      document.title = "Houston | " + newValue.label
    }
    setPlans({})
  }

  /**
   * Init - Call lots of async API gets and state computations to get every plan and mission.
   */
  useEffect(() => {

    // if the key has changed, delete all data
    listPlans().then(getMissions).then(getPlans).then(() => {
      console.log("finished initial load. plans:", plans)
    })

  }, [keys.active.id, demo]);


  return (

    <div className="GUIApp">

      { typeof(keys.active.id) === "undefined" || keys.active.id === null ?
        <div className={"View"} >
        <div style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>
          <p style={{marginBottom: "10px"}}>Enter your API key</p>
          <KeySelect keys={keys}
                     setKeys={setKeys}
                     demo={demo}
                     position={"center"}
                     handleKeyChange={handleKeyChange} />
        </div>
        </div> : (
          <>
          <View plans={plans}
                deletePlan={deletePlan}
                deleteMission={deleteMission} />
          <KeySelect keys={keys}
                     setKeys={setKeys}
                     demo={demo}
                     position={"corner"}
                     handleKeyChange={handleKeyChange} />
          </>
        )
      }

      { showHelp ? (<Help onClickHelpButton={onClickHelpButton} />) : null}

      <HelpIcon className={"GUIApp-helpButton"}
                onClick={onClickHelpButton}
                style={{color: styles.link}} />

      <div className={"GUIApp-darkModeSwitch"} >
        <DarkModeSwitch onChange={onDarkModeSwitch} />
      </div>

    </div>
  );

}
