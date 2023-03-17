

import React from 'react'
import Graph from '../Graph/Graph';
import './Mission.scss'
import { isComplete, hasFailures, latestTimestamp } from '../../js/mission'
import { select } from 'd3'
import { duration, format } from "../../js/time";

/**
 * Stateless Component - Displays a mission in various views; when showing as graph it is rendered with d3 within the
 * container passed down by the View. Otherwise it is a div, positioned by the parent Plan element.
 * @prop planViewMode: How the plan is being displayed and therefore how the mission should be displayed
 * @prop viewMode: How the graph should be displayed
 * @prop data: How the mission should be displayed
 * @prop selected:
 * @prop idx:
 * @prop handleSelectMission:
 */
export default function Mission(props) {

  let tooltip = select(props.references.tooltip.current)

  /**
   * Event Handler
   */
  const mouseenter = () => {

    tooltip
      .attr("class", "Tooltip show")
      .select("p.Tooltip-stageName")
        .text(props.data.i);

    tooltip.select("p.Tooltip-numFailures")
      .text(props.data.numFailures ? `${props.data.numFailures} stage${props.data.numFailures === 1 ? "" : "s"} failed` : "");

    tooltip.select("p.Tooltip-start")
      .text("start: " + (props.data.t ? format(props.data.t) : "[loading]"));

    tooltip.select("p.Tooltip-endTime")
      .text(props.data.e ? "end: " + format(props.data.e) : "");

    tooltip.select("p.Tooltip-duration")
      .text(duration(props.data.t, isComplete(props.data) ? props.data.e : null));

  };

  /**
   * Event Handler
   */
  const mouseleave = () => {

    tooltip
      .attr("class", "Tooltip hide");

    // remove detail
    tooltip
      .select("div.Tooltip-detail")
        .selectAll("p, pre").text("");

  };


  const missionClass = props.data.loaded ?
    isComplete(props.data) ?
      "Mission-complete" :
      "Mission-incomplete" :
    "Mission-loading";

  const colourClass = props.selected ?
    missionClass + "-selected" :
    hasFailures(props.data) ?
      missionClass + "-hasFailures" :
      "";

  return (
    <div className={"Mission"}>
      <div className={`Mission-circle ${missionClass} ${colourClass}`}
           onClick={() => {
             props.handleSelectMission(props.data.n, props.data.i)
           } }
           onMouseEnter={mouseenter}
           onMouseLeave={mouseleave}/>
      {
        (props.planSelected && props.viewOptions.graphViewMode === "pictogram" && props.data.loaded)
          || (props.selected && props.planViewMode === "timeline" && props.data.loaded) ?
          (
            <Graph graph={props.data.s}
                   references={props.references}
                   viewMode={props.viewOptions.graphViewMode}
                   graphOrientation={props.viewOptions.graphOrientation}
                   labels={props.viewOptions.labels}
                   lastUpdate={latestTimestamp(props.data)}
                   changeView={props.changeView}
                   timelinePosition={props.timelinePosition}
                   hasTiming={true} />
          ) : null
      }
    </div>
  )

}
