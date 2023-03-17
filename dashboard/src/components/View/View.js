
import React from 'react';
import * as d3 from 'd3';

import './View.scss';
import PlanList, { plansPerPage } from '../PlanList/PlanList.js';
import ControlPanel from './ControlPanel/ControlPanel.js';
import Tooltip from '../Tooltip/Tooltip.js';
import ArrowBack from '@material-ui/icons/ArrowBack';

import { URLToState, stateToURL } from "../../js/url";
import styles from "../../style-variables";


/**
 * Stateful Component - View container consisting of a single SVG container to display all graphs. Multiple missions (and possibly plans)
 * share the same container so that they can be displayed side by side.
 */
export default class View extends React.Component {
  constructor(props) {
    super(props);

    this.references = {
      svg: React.createRef(),
      tooltip: React.createRef(),
    };
    this.element = {};  // will be filled with pointers to the elements for each ref in this.references

    this.state = { page: 0, ...this.getStateFromURL() };
    window.addEventListener('popstate', () => this.setState(this.getStateFromURL));
  };

  getStateFromURL = () => {

    let URLState = URLToState();

    return {
      graphViewMode: URLState.view ?? "none",
      labels: URLState.labels ?? "on",
      selectedPlan: URLState.plan ?? null,
      selectedMission: URLState.mission ?? null,
    }
  };

  componentDidMount() {
    this.selectD3Elements();
    this.initControls();
  };

  pageUp = () => {
    const newPage = Math.max(this.state.page - 1, 0);
    this.setState({ page: newPage })
  };

  pageDown = () => {
    // don't allow page down if we are on the last page
    this.setState({ page: Math.min(this.state.page + 1, Math.floor(Object.keys(this.props.plans).length/plansPerPage)) })
  };

  /**
   * State changer - Used to select or deselect plans and/or missions. If mission name is null then it is being
   * de-selected. If plan name is null then it is being de-selected.
   * @param planName
   * @param missionId
   */
  handleSelectMission = (planName, missionId) => {
    window.history.pushState({}, null, stateToURL([{plan: planName, mission: missionId}]));
    this.setState({selectedPlan: planName, selectedMission: missionId});
  };

  /**
   * State Changer
   */
  changeView = (view) => {
    window.history.pushState({}, null, stateToURL([{view: view}]));
    this.setState({graphViewMode: view})
  };

  /**
   * State Changer
   */
  toggleLabels = () => {
    let newValue;
    if (this.state.labels === "on") {
      newValue = "short"
    }
    else if (this.state.labels === "short") {
      newValue = "off"
    }
    else {
      newValue = "on"
    }
    window.history.pushState({}, null, stateToURL([{labels: newValue}]));
    this.setState({labels: newValue})
  };

  /**
   * Add user controls to the document
   */
  initControls = () => {

    document.addEventListener('keydown', e => {
      if (e.srcElement !== document.body) {
        // prevent from happening when typing in an input
        return
      }

      if (e.key === "l") {
        this.toggleLabels(!this.state.showLabels);
      }
      else if (e.key === "f") {
        this.changeView("flowChart");
      }
      else if (e.key === "p") {
        this.changeView("pictogram");
      }
      // note: will do nothing for plans as they have no timing information
      else if (e.key === "g") {
        this.changeView("gantt");
      }

      // planList scroll controls
      // these should only work when viewing the plan list
      if (this.state.selectedPlan !== null) {
        return
      }
      if (e.key === "s") {
        this.pageDown()
      }
      else if (e.key === "w") {
        this.pageUp()
      }
    })
  };

  /**
   * Util - Convert refs to D3 selections.
   */
  selectD3Elements = () => {
    for(let key in this.references) {
      if (this.references.hasOwnProperty(key)) {
        this.element[key] = d3.select(this.references[key].current)
      }
    }
  };

  render() {

    let selectedPlan = this.state.selectedPlan;
    let selectedMission = this.state.selectedMission;
    // do not show non-existent or unloaded plans
    if (!this.props.plans[selectedPlan]) {
      selectedPlan = null;
    }
    // do not show non-existent or unloaded missions
    else if (!this.props.plans[selectedPlan].missions[selectedMission]) {
      selectedMission = null
    }

    // TODO (bug): if there is a plan selected (from url state), select the page that the plan is on
    //   this gives the page we should be on, but only has a value when we can't see the list. Also, props.plans will
    //   be empty when this component initialises
    const correctPage = this.props.plans ? Math.floor(Object.keys(this.props.plans).indexOf(selectedPlan) / 3) : -1

    return (
      <div className={"View"}>

        <svg className={"View-svg"} ref={this.references.svg}>
          <defs>
            <pattern id="stripe" width="2" height="2" patternUnits="userSpaceOnUse" patternTransform="rotate(45 50 50)">
              <line y1="0" y2="0" x1="0" x2="2" strokeWidth="1.5"/>
            </pattern>
            <pattern id="stripeFilled" width="2" height="2" patternUnits="userSpaceOnUse" patternTransform="rotate(45 50 50)">
              <rect y="0" x="0" width="2" height="2"/>
              <line y1="0" y2="0" x1="0" x2="2" strokeWidth="1.5"/>
            </pattern>
          </defs>
        </svg>

        {
          selectedPlan !== null ?
          <ArrowBack className={"View-backButton"} onClick={() => this.handleSelectMission(null, null)}
                     style={{color: styles.icon}}/> :
          null
        }

        {
          selectedPlan !== null ?
          <ControlPanel viewOptions={{
                          graphViewMode: this.state.graphViewMode,
                          labels: this.state.labels }}
                        selectedMission={this.state.selectedMission}
                        changeView={this.changeView}
                        toggleLabels={this.toggleLabels}/> : null
        }

        <PlanList plans={Object.values(this.props.plans).sort((a, b) => a.name.localeCompare(b.name))}
                  pollCount={this.props.pollCount}
                  selectedPlan={selectedPlan}
                  // handleSelectPlan={this.handleSelectPlan}
                  selectedMission={selectedMission}
                  handleSelectMission={this.handleSelectMission}
                  deletePlan={this.props.deletePlan}
                  deleteMission={this.props.deleteMission}
                  page={correctPage > -1 ? correctPage : this.state.page}
                  pageUp={this.pageUp}
                  pageDown={this.pageDown}
                  viewOptions={{
                    graphViewMode: this.state.graphViewMode,
                    graphOrientation: this.state.graphOrientation,
                    labels: this.state.labels }}
                  changeView={this.changeView}
                  references={this.references}/>

        <Tooltip reference={this.references.tooltip}/>

      </div>
    )
  }
}
