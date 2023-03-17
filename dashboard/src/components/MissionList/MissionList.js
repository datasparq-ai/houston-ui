import React, { useState } from "react";
import { animated, useTransition } from "react-spring";
import { scaleTime } from "d3";
import Mission from "../Mission/Mission";
import './MissionList.scss'
import TimeAxis from "./TimeAxis/TimeAxis";
import styles from '../../style-variables'

import { dateParse, now } from "../../js/time"


const diameter = parseInt(styles.delta);
const planWidth = parseInt(styles.planWidth);
const viewWidthPercent = parseFloat(styles.viewWidthPercent);


/**
 * Function component - Animated div that holds multiple missions and is in charge of animating into timeline positions.
 */
export default function MissionList(props) {

  const [rows, set] = useState(props.missions);

  // is an animation needed?
  if (rows.length !== props.missions.length || rows.filter(d => d.loaded).length !== props.missions.filter(d => d.loaded).length) {
    set(props.missions)
  }

  const viewWidth = window.innerWidth * viewWidthPercent;
  const maxX = Math.min(viewWidth, planWidth);  // there is padding around a plan equal to 2 diameters

  const willRenderTimeline = props.planSelected && (props.planViewMode === "timeline" || props.planViewMode === "focus")
  let timeScale;

  if (willRenderTimeline) {

    // compute date range of all stage timings
    let timeDomain = [
      new Date(Math.min(...props.missions.map(d => {
        return d.t ? dateParse(d.t) : now()
      }))),
      new Date(Math.max(...props.missions.map(d => {
        return d.t ? dateParse(d.t) : null
      })))
    ];

    if (timeDomain[1] === null) {
      timeDomain[1] = now()
    }

    //extend the range of times slightly
    const timeDomainRange = Math.max(timeDomain[1] - timeDomain[0], 1000);
    timeDomain = [new Date(timeDomain[0].getTime() - timeDomainRange * 0.05), new Date(timeDomain[1].getTime() + timeDomainRange * 0.05)];

    timeScale = scaleTime()
      .domain(timeDomain)
      .range([0, maxX]);
  }

  // calculate all transitions of all plans in the list
  const transitions = useTransition(
    (rows ? rows : []).map((data, i) => {
      let xPos,
          yPos = 0;

      if (willRenderTimeline) {

        // if mission hasn't finished loading display it above the rest
        if (!data.loaded) {

          xPos =  maxX - diameter/2;
          yPos = diameter * -1.5; // note: this assumes there is space above the timeline on the right side

        }
        // if mission hasn't finished loading display it above the rest
        else if (!data.t) {

          xPos =  maxX - diameter/2;
          yPos = diameter * 1.5; // note: this assumes there is space below the timeline on the right side

        }
        else {
          // timeline view - display on time axis at start time
          xPos = timeScale(dateParse(data.t)) - diameter/2;
        }
      }
      else {
        xPos = i * (diameter + 2)
      }
      return ({ ...data, xy: [xPos, yPos] })
    }),
    {
      from: { width: 0, opacity: 0 },
      leave: { width: 0, opacity: 0 },
      enter: ({ xy }) => ({ xy, opacity: 1 }),
      update: ({ xy }) => ({ xy }),
      keys: d => d.i,

    }
  );

  return (
    <div className={`MissionList ${willRenderTimeline ? "MissionList-timeline" : "MissionList-summary"}`}>

      {
        willRenderTimeline ?
          <TimeAxis scale={timeScale} transform={`translate(0, ${diameter/2})`}/>
          : null
      }

      {
        transitions(({xy, ...rest}, item, _, index) => {

          return (
            <animated.div
              key={item.key}
              style={{
                transform: xy.to((x, y) => `translate3d(${x}px,${y}px,0)`),
                ...rest
              }}>
                <Mission key={item.id}
                         data={props.missions[index] ?? item}
                         selected={props.planSelected && item.i === props.selectedMission}
                         planSelected={props.planSelected}
                         planViewMode={props.planViewMode}
                         viewOptions={props.viewOptions}
                         handleSelectMission={props.handleSelectMission}
                         references={props.references}
                         timelinePosition={willRenderTimeline ? timeScale(dateParse(item.t)) : null}
                         changeView={props.changeView}/>
            </animated.div>
          )
        })
      }
    </div>
  )
}
