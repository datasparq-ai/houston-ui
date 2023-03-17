import React from 'react';
import CloseIcon from '@material-ui/icons/Close';
import './Help.scss';
import styles from '../../style.scss'

/**
 * Stateless Component - Help information for the GUI. Appears over the whole app and can be closed by clicking a
 * button.
 * @param props
 * @returns {*}
 * @constructor
 */
export default function Help(props) {

  return (

    <div className={"Help"}>
      <h3>Dashboard Help</h3>

      <p>
        Welcome to your mission dashboard. All of your plans are listed below. Click on a plan to view it and see
        recent missions. Click on a mission to get the status and timing information of each stage. Missions can have
        the following states:<br/>
      </p>

      <div className={"Help-missionLegend"}>

        <div className={"legendItem"}>
          <div className={"Mission-circle Mission-complete"}/>
          <p className={"Help-missionLegend-p"}>finished</p>
        </div>

        <div className={"legendItem"}>
          <div className={"Mission-circle Mission-incomplete"}/>
          <p className={"Help-missionLegend-p"}>not finished</p>
        </div>

        <div className={"legendItem"}>
          <div className={"Mission-circle Mission-incomplete Mission-incomplete-hasFailures"}/>
          <p className={"Help-missionLegend-p"}>failed</p>
        </div>

        <div className={"legendItem"}>
          <div className={"Mission-circle Mission-loading"}/>
          <p className={"Help-missionLegend-p"}>loading</p>
        </div>

      </div>

      <p>
        If you don't have any plans you can create and run them with the Houston Client or by calling the API directly. See
        the <a href={"https://github.com/datasparq-intelligent-products/houston-quickstart-python"} target="_blank" rel="noopener noreferrer">quickstart guide</a> to
        learn how to do this. Refer to
        the <a href={"https://github.com/datasparq-ai/houston/blob/main/docs.md"} target="_blank" rel="noopener noreferrer">docs</a> for
        more information on plans and missions.
        <br/>
      </p>

      <p>
        The default view for a mission is the flowchart. This shows each stage in a plan with a link to each
        upstream and downstream dependency, arranged from left to right, where the left most stage is the first
        stage in the plan. The colour of each stage represents its state in the selected mission:
      </p>

      <div className={"Help-colourLegend"}>
        {
          ["notStarted", "started", "finished", "failed", "excluded", "skipped"].map(d => {
            return (
              <div key={d} className={"legendItem"}>
                <svg><rect className={"Graph-node-rect state-" + d}/></svg>
                <p>{d}</p>
              </div>
            )
          })
        }
      </div>

      <p>
        Hover over a stage to see its state and timing information. Click on the stage to see additional
        information such as stage parameters.<br/>
      </p>

      <h3>FAQ</h3>
      <p>
        <b>Why can't I trigger my mission from the dashboard?</b><br/>
        This dashboard interfaces with the Houston API. The API can tell Houston that a mission has started, but
        does not have control over the services that run the stages of your plan. A service, such as a lambda
        function, would need to be triggered by a process that has permission to do so, and then call Houston to
        initiate the mission.<br/>
      </p>
      <CloseIcon className={"Help-closeButton"} onClick={props.onClickHelpButton}
                 style={{color: styles.icon}}/>
    </div>
  )

}
