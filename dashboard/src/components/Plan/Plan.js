
import React from 'react';
import './Plan.scss';
import MissionList from "../MissionList/MissionList";
import MissionOptions from '../MissionOptions/MissionOptions'
import MissionInfo from './MissionInfo/MissionInfo'
import Graph from "../Graph/Graph";
import CloseIcon from "@material-ui/icons/Close";
import styles from "../../style-variables";

/**
 * Stateless Component - Displays a plan in various views. Potentially contains multiple missions. Holds which mission is selected as state.
 * The view also changes depending on if any missions are selected.
 * @prop data: API representation of a plan as an object
 * @prop viewMode: How the plan should be displayed.
 * @prop viewHandleSelectPlan: function that adjusts the view when a plan has been selected
 */
export default function Plan(props) {
  const ref = React.createRef();

  const handleClickPlan = () => {
    props.handleSelectMission(props.data.name, null);
  };

  const convertPlanStageToMissionStage = stage => {
    return {
      n: stage.name,
      a: stage.service,
      p: stage.params,
      u: stage.upstream,
      d: stage.downstream,
    }
  }

  const planSelected = props.selectedPlan === props.data.name;

  const planViewMode = props.selectedPlan === null ?
    "summary"
    : (props.selectedMission === null ? "focus" : "timeline");

  const missionOptions = props.selectedMission === null ? ["start new mission", "delete plan"] : ["start new mission", "delete mission"];

  return (
    <div className={`Plan Plan-${planViewMode} Plan-${planSelected ? "selectedPlan" : "nonSelectedPlan"} ${props.hidden ? "Plan-hidden" : ""}`}
         key={props.data.name} ref={ref}>
      <div className={`Plan-nameContainer`}>
        <h3 onClick={handleClickPlan}>{props.data.name}</h3>
        <MissionOptions plan={props.data}
                        selectedMission={props.selectedMission}
                        options={missionOptions}
                        deletePlan={props.deletePlan}
                        deleteMission={props.deleteMission} />
      </div>

      { planSelected ? (
        <CloseIcon className={"Plan-closeButton"} onClick={() => props.handleSelectMission(null, null)}
           style={{color: styles.link}}/>

      ) : null }

      {
        // in focus mode display the current plan's graph - time info won't exist
        // if a pictogram of missions would be empty (no missions) then display the plan as a pictogram
        planSelected && planViewMode === "focus" && props.viewOptions.graphViewMode !== "pictogram" && props.data.stages ?
          (
            <Graph graph={props.data.stages.map(convertPlanStageToMissionStage)}
                   references={props.references}
                   viewMode={props.viewOptions.graphViewMode}
                   graphOrientation={props.viewOptions.graphOrientation}
                   labels={props.viewOptions.labels}
                   end={""}
                   changeView={props.changeView}
                   hasTiming={false}/>
          )
          : null
      }

      {
        props.data.missions && Object.keys(props.data.missions).length > 0 ?
          <MissionList missions={props.data.missions ? Object.values(props.data.missions).sort((a, b) => new Date(a.t) - new Date(b.t)) : []}
                       planSelected={planSelected}
                       planName={props.data.name}
                       selectedMission={props.selectedMission}
                       handleSelectMission={props.handleSelectMission}
                       planViewMode={planViewMode}
                       viewOptions={props.viewOptions}
                       references={{...props.references, plan: ref}}
                       changeView={props.changeView}/>
          : null
      }
      {
        planSelected && props.selectedMission !== null ? (
          <MissionInfo id={props.selectedMission}
                       data={Object.values(props.data.missions).filter(d => d.i === props.selectedMission)[0]}/>
        ) : null
      }

    </div>
  )
}
