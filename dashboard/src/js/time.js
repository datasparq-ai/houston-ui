
// utils for formatting times


import * as d3 from "d3";

/**
 * Displays the duration of something given the start and end time as a human readable string with sensible units.
 * Returns nothing if the start time is null.
 * @param start: Datetime string. Can be null
 * @param end: Datetime string. Can be null
 */
export function duration(start, end) {

  start = dateParse(start);
  if (start === null) return "";

  end = dateParse(end);
  if (end === null) {
    end = new Date();
  }

  const durationMilliseconds = d3.timeMillisecond.count(start, end);

  if (durationMilliseconds < 1000) {
    return "duration: " + durationMilliseconds + "ms"
  }
  // display number of seconds until over 2 minutes
  else if (durationMilliseconds < 2 * 60 * 1000) {
    return "duration: " + d3.timeSecond.count(start, end) + "s";
  }
  // display number of minutes until over 2 hours
  else if (durationMilliseconds < 2 * 60 * 60 * 1000) {
    return "duration: " + d3.timeMinute.count(start, end) + " minutes";
  }
  // display number of hours until over 2 days
  else if (durationMilliseconds < 2 * 24 * 60 * 60 * 1000) {
    return "duration: " +  d3.timeHour.count(start, end) + " hours";
  }
  else {
    return "duration: " + d3.timeDay.count(start, end) + " days";
  }
}

/**
 * Parse date strings from the houston API. These are all UTC but lack this information.
 */
export function dateParse(stringDatetime) {
  if (stringDatetime === null || stringDatetime < "1971" || typeof(stringDatetime) === "undefined") {
    return null
  }
  return new Date(stringDatetime)
}

/**
 * Displays the local time of a date string
 */
export function format(stringDatetime) {
  if (!stringDatetime || stringDatetime < "1971") return null;

  // if datetime is from within a day of the current time, return only the time
  const date = dateParse(stringDatetime)
  if (Math.abs((now() - date) / (1000 * 60 * 60 * 24)) < 1) {
    return date.toLocaleTimeString()
  } else {
    return date.toLocaleString()
  }
}

export function now() {
  return new Date()
}
