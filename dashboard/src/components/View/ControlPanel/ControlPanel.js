import React from "react";
import './ControlPanel.scss'


export default function ControlPanel(props) {

  const viewMode = props.viewOptions.graphViewMode;

  return (
    <div className={"ControlPanel"}>
      <div className={"ControlPanel-inner"}>

        {/*<div className={"ControlPanel-item"}>*/}
        {/*  <i className="material-icons">edit</i>*/}
        {/*  <p>edit plan</p>*/}
        {/*</div>*/}

        {/*<hr/>*/}

        <div className={"ControlPanel-item"}
             onClick={() => props.changeView("flowChart")}>
          <i className={"material-icons" + (viewMode === "flowChart" ? " selected" : "")}>linear_scale</i>
          <p>flowchart</p>
        </div>

        <div className={"ControlPanel-item"}
             onClick={() => props.changeView("pictogram")}>
          <i className={"material-icons" + (viewMode === "pictogram" ? " selected" : "")}>drag_indicator</i>
          <p>pictogram</p>
        </div>

        {props.selectedMission !== null ?
          <div className={"ControlPanel-item"}
               onClick={() => props.changeView("gantt")}>
            <i className={"material-icons" + (viewMode === "gantt" ? " selected" : "")}>sort</i>
            <p>gantt chart</p>
          </div>
          : null
        }

        {/*<div className={"ControlPanel-item"}>*/}
        {/*  <i className="material-icons">code</i>*/}
        {/*  <p>JSON</p>*/}
        {/*</div>*/}

        <hr/>

        <div className={"ControlPanel-item"} onClick={props.toggleLabels}>
          <i className={"material-icons" + (props.viewOptions.labels !== "off" ? " selected" : "")}>text_format</i>
          <p>labels</p>
        </div>

      </div>
    </div>
  )
}
