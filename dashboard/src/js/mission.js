/**
 * Mission Utils
 */

import {dateParse} from "./time";

/**
 * Look at all the stage statuses for a mission and return true if any failed.
 * @param mission
 */
export function hasFailures(mission) {

  let hasFailures = false;
  let numFailures = 0;

  if (mission.s) {

    for (let i = 0; i < mission.s.length; i++) {

      if (mission.s[i].s === 3) {
        hasFailures = true;
        numFailures += 1;
      }
    }
  }

  return hasFailures
}

/**
 * Util - determine state if a mission is complete, i.e. none of the stages are 'ready' or 'started'
 * @returns boolean
 */
export function isComplete(mission) {
  for (let i = 0; i < mission.s.length; i++) {
    if (mission.s[i].s === 0 || mission.s[i].s === 1) {
      return false
    }
  }
  return true
}

/**
 * Util - get the latest timestamp from all start and end timestamps in the mission stages list
 * @returns string
 */
export function latestTimestamp(mission) {
  return mission.s.map(d => d.t > d.e ? d.t : d.e).reduce((d, e) => d > e ? d : e)
}

/**
 * Util - get the start and end times of a mission from its stages
 * @returns $ObjMap {start: number, end: number}
 */
export function startEndTime(mission) {

  let start = Math.min(...mission.s.map(d => {
    return dateParse(d.t)
  }).filter(d => d))
  if (start === Infinity) {
    start = null
  }

  let end = Math.max(...mission.s.map(d => {
    return dateParse(d.e) ?? 0
  }))
    // .filter(d => d.s !== 0 && d.s !== 1))

  if (end === 0) {
    end = null
  }

  return [start, end]
}

/**
 * Util - determine state of a stage from its properties using defined logic defined here. It is possible for a stage to
  be both failed, ignored, and upstream failed. The following order of importance is used: failed > ignored >
  upstream failed.
 * @returns {*}
 */
export function computeStageState(stage, stages) {
  switch (stage.s) {
  case 0:
    return "ready";
  case 1:
    return "started";
  case 2:
    return "finished";
  case 3:
    return "failed";
  case 4:
    return "excluded";
  case 5:
    return "skipped";
  default:
    return "ready"
  }
}
