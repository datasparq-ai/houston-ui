
import React from 'react'
import * as d3 from 'd3'
import * as sigmoid from '../../js/sigmoid'
import { duration, dateParse, now, format } from '../../js/time'

import styles from '../../style-variables'

import './Graph-standard.scss'
import { standard } from './graph-styles'
import {computeStageState, isComplete, startEndTime} from "../../js/mission";

const planWidth = parseInt(styles.planWidth);
const planHeight = parseInt(styles.planHeight);
const graphWidthPercent = parseFloat(styles.graphWidthPercent);
const viewHeightPercent = parseFloat(styles.viewHeightPercent);
const delta = parseInt(styles.delta);

const ganttIntervalFrequency = 50;  // milliseconds between gantt timeline animation schedules

/**
 * The D3 visual component of a Plan/Mission's DAG. D3 state is not controlled by React
 * @prop string viewMode: How the graph should be displayed. Has possible values: `"flowChart"`, `"pictogram"`, or `"gantt"`
 * @prop string orientation: Controls orientation of the flowchart. Has possible values: `"horizontal"` or `"vertical"`
 * @prop string labels: Controls label format. Has possible values: `"on"`, `"off"`, or `"short"`
 * @prop string lastUpdate: Used to determine if graph should re-draw based on new data
 * @prop graph: List of nodes and their upsteam/downstream dependencies.
 * @prop bool hasTiming: Does the graph have timing data.
 */
export default class Graph extends React.Component {
  constructor(props) {
    super(props);

    this.references = props.references;

    // graph keeps its own version of the view state so that it can choose not to re-render when state changes (this
    // prevents re-calculating the graph every time the labels are toggled)
    this.d3State = {
      viewMode: props.viewMode,
      orientation: props.orientation,
      labels: props.labels,
      lastUpdate: props.lastUpdate,
    }

    // compute graph shape - TODO: only do this if needed
    this.graph = sigmoid.graphify(props.graph, this.d3State.orientation);
    this.style = standard;
    this.nodes = this.graph.nodes;
    this.links = this.graph.links;
    this.domain = this.graph.domain;
  }

  /**
   * Lifecycle Method - Create graph elements within the existing SVG container and render the selected view.
   */
  componentDidMount() {
    this.svg = d3.select(this.references.svg.current);
    this.tooltip = d3.select(this.references.tooltip.current);

    this.initD3();
    if (this.props.hasTiming) {
      this.initTimeScale();
    }
    this.initView(0, this.d3State.viewMode);
  }

  /**
   * Lifecycle Method - Delete the graph from the DOM
   */
  componentWillUnmount() {
    this.g.remove()
    if (this.ganttTimeout) clearTimeout(this.ganttTimeout);
  }

  /**
   * Lifecycle Method - Always prevent re-rendering of the graph by manually handling all changes to props --> if props
   * have changed, change the d3State object and run the required functions.
   * @param nextProps
   * @param nextState
   * @param nextContext
   * @returns {boolean}
   */
  shouldComponentUpdate(nextProps, nextState, nextContext) {

    if (this.d3State.viewMode !== nextProps.viewMode || this.d3State.orientation !== nextProps.orientation) {
      this.d3State.orientation = nextProps.orientation;
      this.initView(400, nextProps.viewMode);
      this.d3State.viewMode = nextProps.viewMode;
    }

    // if graph mission has new data then update colours and view
    if (this.d3State.lastUpdate !== nextProps.lastUpdate) {
      this.d3State.lastUpdate = nextProps.lastUpdate;

      this.graph = sigmoid.graphify(nextProps.graph, this.d3State.orientation);  // TODO: this might not be needed
      this.nodes = this.graph.nodes;
      this.links = this.graph.links;
      this.domain = this.graph.domain;

      this.link
        .data(this.links)
        .attr("class", d => {
          const updatedDatum = this.links.filter(e => e.source === d.source && e.target === d.target)[0]
          return linkClass(updatedDatum)
        });

      this.node
        .selectAll("rect")
        .attr("class", d => {
          const updatedDatum = this.nodes.filter(e => e.n === d.n)[0]
          d.s = updatedDatum.s
          d.t = updatedDatum.t
          d.e = updatedDatum.e
          return `Graph-node-rect state-${computeStageState(this.nodes.filter(e => e.n === d.n)[0])}`
        });

      this.initTimeScale();
      this.initView(100, this.d3State.viewMode);
    } else {
      // console.log("Don't update, because", this.d3State.lastUpdate, "=", nextProps.lastUpdate)
    }

    if (this.d3State.labels !== nextProps.labels) {
      this.d3State.labels = nextProps.labels;
      this.fadeLabels();
    }

    // we do not want this component's rendering to be handled by React - never update
    return false
  }

  /**
   * Initialise properties related to timing information. Is only run if graph has timing information available.
   */
  initTimeScale = () => {

    // compute date range of all stage timings
    this.graph.domain.time = startEndTime({ s: this.graph.nodes})
      // [
      // Math.min(...this.graph.nodes.map(d => {
      //   return dateParse(d.t)
      // }).filter(d => d)),
      // Math.max(...this.graph.nodes.map(d => {
      //   return dateParse(d.e) ?? 0
      // }))
    // ];

    // if there is no timing information at all, fix the time axis to prevent constant animation
    if (this.graph.domain.time[0] === null) {
      this.graph.domain.time[0] = 0
    }
    // if the mission hasn't completed yet, use now as the end time, but allow a maximum length of 1 hour
    // the minimum scale length is 100 milliseconds
    if (!isComplete({ s: this.nodes })) {
      this.graph.domain.time[1] = Math.min(this.graph.domain.time[0] + 60 * 60 * 1000, ganttIntervalFrequency - -now())
    }

    this.timeScale = d3.scaleTime()
      .domain(this.graph.domain.time)
      .range([0, window.innerWidth * graphWidthPercent]);

  };

  /**
   * Create D3 selections and elements to initialise the graph.
   */
  initD3 = () => {

    this.svg.on("click", this.animate);

    this.graphWidth = graphWidthPercent * window.innerWidth;
    // note: the graphHeight is reduced to leave room for the time axis
    this.graphHeight = viewHeightPercent * 0.6 * window.innerHeight - planHeight - delta * 4;

    this.xScale = d3.scaleLinear()
      .domain(this.graph.domain.order)
      .range([0, Math.min(this.graph.domain.order[1] * this.style.M, this.graphWidth)]);

    // y scale for the flow chart
    // note: vertical distance divided by 4 afterwards because we're using dagre and is has a tendency to make the vertical distances much larger
    this.yScale = d3.scaleLinear()
      .domain(this.graph.domain.rank)
      .range([0, Math.min((this.graph.domain.rank[1] * this.style.M)/4, this.graphHeight)]);

    this.g = this.svg.append("g").attr("class", "Graph");
    window.addEventListener('resize', this.centre);

    // y scale for the pictogram and gantt
    // note: this is overridden if there aren't enough stages to fill the space
    this.yScalePictogram = d3.scaleLinear()
      .domain([0, this.nodes.length])
      .range([0, this.graphHeight - delta * 2]);

    this.link = this.g.append("g")
      .attr("class", "Graph-link")
      .selectAll("path")
      .data(this.links)
      .enter().append("path");

    this.link
      .attr("class", d => linkClass(d));

    const _this = this;

    this.node = this.g.selectAll("g.table, g.script")
      .data(this.nodes)
      .enter().append("g")
      .attr("class", "Graph-node")
      .attr("id", d => {
        d.g = this;
        return d.id
      })
      .call(d3.drag()
        .on("drag", function(e, d){ return _this.dragged(e, d, this)}));

    this.node
      .append("rect")
      .attr("class", d => `Graph-node-rect state-${computeStageState(d)}`)
      .on("click", this.handleStageClick)
      .on("mouseenter", this.mouseenter)
      .on("mouseleave", this.mouseleave);

    // add labels
    this.node
      .append("text")
      .attr("class", "Graph-node-text")
      .text(d => {
        if (this.props.labels === "short") {
          // convert IDs like 'my-long-stage-name' to 'mlsn'
          return d.n.replace("_", "-").split("-").map(d => d[0]).join("")
        } else {
          return d.n
        }
      })
      .style("opacity", this.d3State.labels === "off" ? 0 : 1);

  }

  /**
   * Transition the graph to a new view by first cancelling all in-progress animations and then running the
   * function that corresponds to the selected view mode.
   * @param duration: Duration of animated transition to the new view mode is milliseconds
   * @param mode: A chart view mode, which can be one of ['flowChart', 'gantt', 'pictogram']
   */
  initView = (duration=0, mode) => {

    // this.g.selectAll("*").interrupt();
    this.g.selectAll("*").interrupt("gantt");
    // this.node.interrupt();
    this.node.selectAll("rect").interrupt();
    this.node.selectAll("rect").interrupt("gantt");
    // this.link.interrupt();

    switch (mode) {
      case "pictogram":
        this.renderPictogram(duration);
        break
      case "gantt":
        if (this.props.hasTiming) {
          this.renderGantt(duration);
          break
        } else {
          // fall through

        }
      default:
        this.renderFlowChart(duration);
        break
    }

  }

  /**
   * Util - Move all svg elements into the centre of the view. Assumes the app is 100vwx100vh.
   */
  centre = (duration= 0, viewMode = null) => {
    if (viewMode === null) {
      viewMode = this.d3State.viewMode
    }
    if (viewMode === "gantt") {

      const ganttHeight = Math.min(this.yScalePictogram(this.nodes.length) - this.yScalePictogram(0), this.nodes.length * this.style.W * 2)

      this.g
      .transition("centre graph").duration(duration)
      .attr("transform", `translate(
          ${(window.innerWidth * 0.2)}, 
          ${(window.innerHeight - ganttHeight)/2})`);

      if (this.timeAxis) {
        this.timeAxis
          .attr("transform", "translate(0," + (ganttHeight + delta) + ")")
      }

    } else if (viewMode === "pictogram") {

      const ganttHeight = Math.min(this.yScalePictogram(this.nodes.length) - this.yScalePictogram(0), this.nodes.length * this.style.W * 2)
      // the pictogram isn't centred in x but lined up with the plan missions timeline
      this.g
        .transition("centre graph").duration(duration)
        .attr("transform", `translate(
          ${(window.innerWidth - planWidth + delta) / 2 - this.style.W/2}, 
          ${(window.innerHeight - ganttHeight)/2})`);
    }
    else {

      // should be re-positioned to centre after graph is rendered

      this.g
        .transition("centre graph").duration(duration)
        .attr("transform", `translate(
            ${(window.innerWidth - this.xScale(this.domain.order[1])) / 2}, 
            ${(window.innerHeight - this.yScale(this.domain.rank[1])) / 2 - window.innerHeight * 0.05})`);

    }
  }

  /**
   * Animation - Re-draw all the links from the first node to the last.
   * @param event: JS Event object
   * @param duration: Length of animation in milliseconds
   */
  animate = (event, duration = 350) => {

    function trackLen(path) {
      return path.node().getTotalLength();
    }

    this.link
      .attr("stroke-dasharray", function(d) {
        return trackLen(d3.select(this)) + "," + trackLen(d3.select(this))
      })
      .attr("stroke-dashoffset", function(d) {
        return trackLen(d3.select(this))
      })
      .transition("flow").duration(duration)
      // the delay of the animations depends on the link's target's order
      .delay((d) => {
        return (this.nodes.filter((e) => {
          return d.target.n === e.n
        })[0].order - 1) * duration
      })
      .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
      .transition("flow")
        .attr("stroke-dasharray", "none");
  }

  /**
   * Animation - Transform the graph into a flowchart view.
   * @param duration: Length of animation in milliseconds
   */
  renderFlowChart = (duration=400) => {
    if (this.timeAxis) {
      this.timeAxis.attr("opacity", 0)
    }
    if (this.timeAxisInterval) {
      clearInterval(this.timeAxisInterval)
    }

    this.centre(duration, "flowChart")

    this.nodes.forEach(d => {
      d.x = this.xScale(d.order);
      d.y = this.yScale(d.rank);
    });

    this.link
      .transition("flowchart").duration(duration)
      .attr('d', this.style.pathFunction)
      .delay(duration).style("opacity", 1);

    this.node
      .transition("flowchart").duration(duration)
      .attr("transform", d => "translate(" + d.x + "," + d.y + ")");

    this.node
      .selectAll("rect")
        .attr("width", d => d.s === 5 ? this.style.Ws : this.style.W)
        .attr("height", d => d.s === 5 ? this.style.Ws : this.style.W)
        .attr("x", d => d.s === 5 ? -this.style.Ws/2 : -this.style.W/2)
        .attr("y", d => d.s === 5 ? -this.style.Ws/2 : -this.style.W/2);

    this.node.selectAll("text")
      .transition("flowchart").duration(duration)
        .attr("transform", "rotate(-20)")
        .attr("text-anchor", "start")
        .attr("x", this.style.W)
        .attr("y", -this.style.W);

    this.fadeLabels()

  }

  /**
   * Animation - Transform the graph into a pictogram of all nodes.
   * @param duration: Length of animation in milliseconds
   */
  renderPictogram = (duration=400) => {
    if (this.timeAxis) {
      this.timeAxis.attr("opacity", 0)
    }
    if (this.timeAxisInterval) {
      clearInterval(this.timeAxisInterval)
    }

    this.centre(duration, "pictogram")

    // limit maximum vertical distance between nodes
    let useYScale = true;
    if (this.yScalePictogram(1) - this.yScalePictogram(0) > this.style.W * 2) {
      useYScale = false;
    }

    this.node
      .transition("pictogram").duration(duration)
      .attr("transform", (d, i) => {
        // d.x = this.xScale(0);
        d.x = this.props.timelinePosition || this.xScale(this.domain.order[1]/2);
        d.y = useYScale ? this.yScalePictogram(i) : i * this.style.W * 2;
        return "translate(" + d.x + "," + d.y + ")";
      })
      .selectAll("rect")
        .attr("width", d => d.s === 5 ? this.style.Ws : this.style.W)
        .attr("height", d => d.s === 5 ? this.style.Ws : this.style.W)
        .attr("x", d => d.s === 5 ? -this.style.Ws/2 : -this.style.W/2)
        .attr("y", d => d.s === 5 ? -this.style.Ws/2 : -this.style.W/2);

    this.node.selectAll("text")
      .transition("pictogram").duration(duration)
      .attr("transform", "")
      .attr("text-anchor", "start")
      .attr("x", d => d.s === 5 ? this.style.Ws : -this.style.W)
      .attr("y", d => (d.s === 5 ? this.style.Ws/2: -this.style.W/2) - 1)
      .style("opacity", 0);  // labels must always be hidden

    this.link
      .transition("pictogram").duration(duration/2)
      .style("opacity", 0);

  }

  /**
   * Animation - Transform the graph into a gantt chart. This is only possible
   * if timings are known for each node, therefore the user should not be
   * allowed to select this view if there are no timings.
   * @param duration: Length of animation in milliseconds
   */
  renderGantt = (duration= 100) => {

    // do not render gantt if there are stage timings (i.e. if it's a plan's graph not a mission)
    if (!this.props.hasTiming) return;

    // determine if this is the first time the gantt is rendered
    // if it isn't the first then we are updating due to new data
    const firstRender = this.d3State.viewMode !== "gantt" || (duration === 0 || duration === 400)

    const timeNow = this.graph.domain.time[1]

    const missionComplete = isComplete({ s: this.nodes })

    // console.log("first render:", firstRender, "complete:", missionComplete, "duration:", duration)

    if (this.timeAxis) {
      this.timeAxis.transition().duration(duration).ease(d3.easeLinear)
        .attr("opacity", 1)
        .call(d3.axisBottom(this.timeScale))
    } else {
      this.timeAxis = this.g.append("g")
        .call(d3.axisBottom(this.timeScale))
    }

    // stop animating when the mission completes or the view changes
    if (!missionComplete && this.d3State.viewMode === "gantt") {
      this.ganttTimeout = setTimeout(() => {
        this.initTimeScale()
        this.renderGantt(ganttIntervalFrequency)
      }, ganttIntervalFrequency)
    }

    // limit maximum vertical distance between nodes
    let useYScale = true;
    if (this.yScalePictogram(1) - this.yScalePictogram(0) > this.style.W * 2) {
      useYScale = false;
    }

    console.log(useYScale)

    if (firstRender) {
      this.centre(duration, "gantt")

      this.node.selectAll("rect")
        .attr("class", d => `Graph-node-rect state-${computeStageState(d)}`)
        // TODO: if not useYScale then smaller height
        .attr("height", d => d.s === 5 ? this.style.Ws : this.style.W);

      this.node.selectAll("rect")
        .attr("width", d => d.s === 5 ? this.style.Ws : this.style.W)

      this.node
        .transition("gantt").duration(duration)
        .attr("transform", (d, i) => {
          const w = d.s === 5 ? this.style.Ws : this.style.W
          d.y = useYScale ? this.yScalePictogram(i) : i * w * 2;
          if (dateParse(d.t) !== null) {
            d.x = this.xScale(0) + this.timeScale(dateParse(d.t));
          } else {
            d.x = this.xScale(0) + this.timeScale(this.graph.domain.time[1]);
          }
          return "translate(" + d.x + "," + d.y + ")";
        })
        .selectAll("rect")
          .transition("gantt")
          .ease(d3.easeLinear)
          .duration(d => {
            const startTime = dateParse(d.t)
            // if stage has not ended then end time of gantt bar is now
            let endTime = dateParse(d.e) ?? timeNow;
            if (startTime) {
              return (this.timeScale(endTime) - this.timeScale(startTime)) * duration/200  // default = 5 pixels per millisecond
            }
            else {
              return 0
            }
          })
          // note: pixel values from the scale are used as millisecond timings for convenience
          .delay(d => this.timeScale(dateParse(d.t)) * duration/200)
            .attr("width", d => {
              if (d.s === 5) return this.style.Ws;
              const endTime = dateParse(d.e) ?? timeNow;
              const startTime = dateParse(d.t)
              if (startTime) {
                return Math.max(this.timeScale(endTime) - this.timeScale(startTime), this.style.W)
              }
              else {
                return this.style.W
              }
            });

      this.link
        .style("opacity", 0);

      this.node.selectAll("text")
        .attr("transform", "rotate(0)")
        .attr("text-anchor", "end")
        .attr("x", - this.style.W/2)
        .attr("y", this.style.W * 0.85);

      this.fadeLabels()

    } else {
      // update gantt with new timings
      this.node
        .transition("gantt")
        .duration(duration)
        .ease(d3.easeLinear)
        .attr("transform", (d, i) => {
          const w = d.s === 5 ? this.style.Ws : this.style.W
          const startTime = dateParse(d.t) ?? timeNow
          d.y = useYScale ? this.yScalePictogram(i) : i * w * 2;
          d.x = this.xScale(0) + this.timeScale(startTime);
          return "translate(" + d.x + "," + d.y + ")";
        })
        .selectAll("rect")
          .attr("width", d => {
            if (d.s === 5) return this.style.Ws;
            const endTime = dateParse(d.e) ?? timeNow;
            const startTime = dateParse(d.t)
            if (startTime) {
              return Math.max(this.timeScale(endTime) - this.timeScale(startTime), this.style.W)
            }
            else {
              return this.style.W
            }
          });

    }

  }

  /**
   * Animation - Fade the stage labels in and out, and shorten or lengthen them depending on their state.
   */
  fadeLabels = () => {
    this.node.selectAll("text")
      .transition("fadeLabels")
      .delay(d => d.x / 5)
      .style("opacity", this.d3State.labels === "off" ? 0 : 1);

    if (this.d3State.labels !== "off") {
      this.node.selectAll("text")
        .text(d => {
          return (this.d3State.labels === "short" ?
            // convert IDs like 'my-long-stage-name' to 'mlsn'
            d.n.replaceAll(/(.)([A-Z])/g, "$1-$2").replaceAll("_", "-").toLowerCase().split("-").map(d => d[0]).join("") :
            d.n)
        });
    }
  }

  /**
   * Event Handler - Display more detail in the tooltip when a stage is clicked on
   * @param event: JavaScript event object
   * @param d: Data bound to the d3 element that was clicked.
   */
  handleStageClick = (event, d) => {
    event.stopPropagation();

    this.tooltip.select("div.Tooltip-params")
      .select("p.Tooltip-params").text(d.p ? "params: {" : "params: {}");

    this.tooltip.select("div.Tooltip-params")
      .select("pre.Tooltip-params").text(d.p ? JSON.stringify(d.p, "", "  ").slice(2): "");
  }

  /**
   * Event Handler
   * @param event: Event object.
   * @param d: Data bound to the d3 element that was moused over.
   */
  mouseenter = (event, d) => {

    if (this.d3State.viewMode === "flowChart") {
      // find links that are connected to the moused over node
      this.link.filter(function (l) {
        return l.target.n === d.n || l.source.n === d.n
      })
        .attr("class", d => linkClass(d, true));
    }

    this.tooltip
      .attr("class", "Tooltip show")
      .select("p.Tooltip-stageName")
        .text(d.n);

    this.tooltip
      .select("p.Tooltip-state")
        .attr("class", "Tooltip-state state-" + computeStageState(d) + "-color")
        .text(d.s ? " " + computeStageState(d) : "");

    this.tooltip.select("p.Tooltip-service").text(d.a ? "service: " + d.a : "");

    this.tooltip.select("p.Tooltip-start")
      .text(d.t && format(d.t) !== null ? "start: " + format(d.t) : "");

    this.tooltip.select("p.Tooltip-endTime")
      .text(d.e && format(d.e) !== null ? "end: " + format(d.e) : "");

    this.tooltip.select("p.Tooltip-duration")
      .text(duration(d.t, d.e));

    // continuously update duration (interval is removed on mouseleave)
    clearInterval(d.interval)
    d.interval = setInterval(() => {

      this.tooltip.select("p.Tooltip-duration")
        .text(duration(d.t, d.e));

    }, 1000);

  }

  /**
   * Event Handler
   * @param event: Event object
   * @param d: Data bound to the d3 element that was moused over
   */
  mouseleave = (event, d) => {
    if (this.d3State.viewMode === "flowChart") {
      this.link
        .attr("class", d => linkClass(d));
    }

    this.tooltip
      .attr("class", "Tooltip hide");

    // remove everything
    this.tooltip
      .selectAll("p, pre").text("");

    clearInterval(d.interval);
  }

  /**
   * Event Handler - Move stages when the user clicks and drags them.
   * @param event: Event object
   * @param d: Data bound to the d3 element that was moused over
   * @param element: the html element that was dragged
   */
  dragged = (event, d, element) => {
    d.x = event.x;
    d.y = event.y;
    d3.select(element).attr("transform", d => "translate(" + d.x + "," + d.y + ")");

    this.tooltip
      .attr("class", "Tooltip hide")

    this.link.attr('d', this.style.pathFunction);
  }

  render() {
    return null
  }

}

/**
 * Determine which classnames should be given to a link.
 * If a link should be highlighted then it appears as highlighted and won't be displayed as excluded
 * If a link is between one or more excluded stages then the link displays as excluded
 * If a plan is being displayed (stage state is undefined) or the target state is neither excluded nor not-started,
 * then it should have a thicker line.
 * @param datum
 * @param highlight {boolean}
 * @returns {string}
 */
const linkClass = (datum, highlight=false) => {
  return [
    "Graph-link-path",
    highlight ? "Graph-link-path-highlight" : datum.source.s === 4 || datum.target.s === 4 ? "link-state-excluded" : "",
    (typeof(datum.source.s) === "undefined" && typeof(datum.target.s) === "undefined") || (datum.target.s !== 0 && datum.target.s !== 4) ? "link-state-finished" : ""
  ].join(" ")
}