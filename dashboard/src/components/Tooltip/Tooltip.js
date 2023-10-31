
import React, { useEffect } from 'react';
import * as d3 from 'd3';

import './Tooltip.scss';


/**
 * Box that follows the mouse and gives information about the hovered stage. Text inside is changed by the Graph
 * component using a reference that is passed down to it.
 */
export default function Tooltip(props) {

  useEffect(() => {
    const handleMousemove = e => {
      d3.select(props.reference.current)
        .style("top", (e.clientY + 20) + "px")
        .style("left", (e.clientX) + "px");
    }

    document.addEventListener("mousemove", handleMousemove)
    return () => {
      document.removeEventListener("mousemove", handleMousemove)
    }

  }, [props.reference])

  return (
    <div className={"Tooltip hide"} ref={props.reference} >
      <p className={"Tooltip-stageName"}/><p className={"Tooltip-state"}/>
      <p className={"Tooltip-service"}/>
      <p className={"Tooltip-numFailures"}/>
      <p className={"Tooltip-start"}/>
      <p className={"Tooltip-endTime"}/>
      <p className={"Tooltip-duration"}/>
      <p className={"Tooltip-detail"}/>
      <p className={"Tooltip-attempts"}/>
      <div className={"Tooltip-params"}>
        <p className={"Tooltip-params"}/>
        <pre className={"Tooltip-params"}/>
      </div>
    </div>
  )
}
