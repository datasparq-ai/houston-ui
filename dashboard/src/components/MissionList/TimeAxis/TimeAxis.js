
import React, { useEffect } from 'react';
import { select, axisBottom } from "d3";
import './TimeAxis.scss';

/**
 * Displays a plan in various views. Potentially contains multiple missions. Holds which mission is selected as state.
 * The view also changes depending on if any missions are selected.
 * @prop data: API representation of a plan as an object
 * @prop viewMode: How the plan should be displayed.
 * @prop viewHandleSelectPlan: function that adjusts the view when a plan has been selected
 */
export default function TimeAxis(props) {

  const ref = React.createRef();

  useEffect(() => {
    let axis = axisBottom(props.scale);
    select(ref.current)
      .attr("transform", props.transform)
      .call(axis);
  })

  return (
    <svg className={"TimeAxis"}>
      <g ref={ref} />
    </svg>
  )
}