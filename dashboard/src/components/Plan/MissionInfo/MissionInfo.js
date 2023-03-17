import React from "react";
import './MissionInfo.scss'
import { duration, format } from '../../../js/time'
import {isComplete, startEndTime} from "../../../js/mission";

/**
 * Displays information and stats about the selected mission like the start/end times and duration.
 */
export default function MissionInfo(props) {

  // const updateDuration = () => {
  //   if (props.data) {
  //     const newDuration = duration(props.data.t, props.data.e);
  //     this.setState({duration: newDuration})
  //   }
  // }
  //
  // const interval = setInterval(updateDuration, 1000)

  // check that a mission exists (because it's possible for the user to select a non-existent mission with the url path)
  if (props.data) {

    if (props.data.loaded) {

      const startEnd = startEndTime(props.data)
      console.log(startEnd)

      const complete = isComplete(props.data)
      const start = format(props.data.t)
      const endTime = complete ? format(startEnd[1]) : "[not finished]";

      const missionDuration = complete ? duration(props.data.t, startEnd[1]) : duration(props.data.t, null)

      return (
        <div className={"MissionInfo"}>
          <p>mission: {props.id}</p>
          <p>start/finish: {start} - {endTime}</p>
          {
            missionDuration ? (
              <p>{missionDuration}</p>
            ) : null
          }
        </div>
      )
    } else {
      return (
        <div className={"MissionInfo"}>
          <p>mission: {props.id}</p>
          <p>start/finish: [loading...]</p>
          <p>duration: [loading...]</p>
        </div>
      )
    }
  } else {
    // this is impossible
    return (
      <div className={"MissionInfo"}>
        <p>mission: {props.id}</p>
        <p><span className="MissionInfo-notFound">Not found</span> - no mission exists with id='{props.id}'.</p>
      </div>
    )

  }

}
