import React, { useState } from "react";
import { animated, useTransition } from "react-spring";
import Plan from "../Plan/Plan";
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';

import './PlanList.scss'
import styles from '../../style-variables'

const h = parseInt(styles.planHeight);
const delta = parseInt(styles.delta);
const plansPerPage = 3;
const pageHeight = plansPerPage * h;

// height of the plan list in the summary view
const listHeight = pageHeight + 66;

/**
 * Function component - Animated div that holds multiple plans and is in charge of animating them when they get added.
 * removed, or re-ordered.
 */
export default function PlanList(props) {

  const [rows, set] = useState(props.plans);
  // const [pollCount, setPollCount] = useState(props.pollCount);  // used to know when missions have updated

  // is an animation needed?
  if (props.plans.length !== rows.length) {
    set(props.plans)
  }

  const MaxPage = Math.max(Math.ceil(Object.keys(props.plans).length / plansPerPage) - 1, 0)

  // calculate all transitions of all plans in the list
  const transitions = useTransition(
    rows.map((data, i) => {
      let height;
      let opacity;
      if (props.selectedPlan === null) {

        height = i * h - props.page * pageHeight;
        opacity = (height < 0 || height >= pageHeight ? 0 : 1);

      } else if (props.selectedPlan === data.name) {

        // this can only be done after the first render, but that's ok because we probably won't select a plan before then
        let viewHeight = document.querySelector(".View") ?
          parseInt(window.getComputedStyle(document.querySelector(".View"))['height'].slice(0, -2)) :
          500;

        // if this is the selected plan display it at the bottom of the view, 25vh from the bottom
        // the height is from the top of the PlanList, which is at ((viewHeight - listHeight)/2)
        height = viewHeight - ((viewHeight - listHeight)/2) - viewHeight*0.25;

        opacity = 1;

      }
      else {

        // this can only be done after the first render, but that's ok because we probably won't select a plan before then
        let viewHeight = document.querySelector(".View") ?
          parseInt(window.getComputedStyle(document.querySelector(".View"))['height'].slice(0, -2)) :
          500;

        // all unselected missions are moved down, off-screen
        height = (i * h) + viewHeight/2 + h + 50;
        opacity = (height < 0 || height >= pageHeight ? 0 : 1);

      }
      return ({ ...data, y: height, opacity })
    }),
    {
      from: { height: 0, opacity: 0 },
      leave: { height: 0, opacity: 0 },
      enter: ({ y, opacity }) => ({ y, opacity }),
      update: ({ y, opacity }) => ({ y, opacity }),
      keys: d => d.name,
    }
  );

  return (
    <div className={`PlanList ${props.selectedPlan === null ? "PlanList-summary" : "PlanList-timeline"}`}>

      <h2 className={`PlanList-title ${props.selectedPlan === null && props.page === 0 ? "show-text" : "hide-text"}`} >plans</h2>
      {props.selectedPlan === null && props.page !== 0 ?
        <KeyboardArrowUp className={"PlanList-upArrow"}
                         style={{color: styles.link}}
                         onClick={props.pageUp}/>
        : null
      }

      { rows.length <= 0 ?
        <p className={"PlanList-noPlansMessage"}>
          no plans found... view the <a href={"https://github.com/datasparq-intelligent-products/houston-quickstart-python"} target={"_blank"} rel="noreferrer">quickstart</a> for a guide on creating plans.
        </p> :

        transitions(({ y, ...rest }, item, _, index) => {
          return (
            <animated.div
              key={item.name}
              style={{
                transform: y.to(y => `translate3d(0,${y}px,0)`),
                ...rest
              }}>
              <Plan key={item.name}
                    data={props.plans[index] ?? item}
                    selectedPlan={props.selectedPlan}
                    deletePlan={props.deletePlan}
                    deleteMission={props.deleteMission}
                    hidden={Math.floor(index/plansPerPage) !== props.page}
                    selectedMission={props.selectedMission}
                    handleSelectMission={props.handleSelectMission}
                    viewOptions={props.viewOptions}
                    changeView={props.changeView}
                    references={props.references}/>
            </animated.div>
          )
        })
      }

      {props.selectedPlan === null && props.page !== MaxPage ?
        <KeyboardArrowDown className={"PlanList-downArrow"}
                           style={{color: styles.link, top: listHeight + delta}}
                           onClick={props.pageDown} />
        : null
      }
    </div>
  )
}

export { plansPerPage }
