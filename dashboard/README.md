
# Houston Dashboard 

Single page React app that displays plans and missions. 
Other technologies used are: D3.js, React Spring, and Sass.

View the dashboard [demo](https://github.com/datasparq-ai/houston-ui/blob/dashboard/public/demo.html?demo)!

## Get Started

To get started:

```bash
cd dashboard
yarn
yarn start
```

Then go to http://localhost:3000/?demo. The `demo` attribute loads dummy data to allow you to use the dashboard without 
needing to create plans and missions first.

## App Structure

The app structure is defined below. There are only two stateful components: App and View. Their state is  derived from 
the url on load, and any changes to the state update the url and add a new history state.

    App
    |  KeySelect
    |  Help
    |  View
    |  |  View-svg
    |  |  PlanList
    |  |  |  Plan
    |  |  |  |  MissionList
    |  |  |  |  |  TimeAxis
    |  |  |  |  |  Mission
    |  |  |  |  |  |  Graph*
    |  |  |  |  MissionInfo
    |  |  |  |  MissionOptions
    |  |  Tooltip
    |  |  ControlPanel
    |  |  Notification 

*The Graph is not rendered within the Mission (a div), but instead uses a reference passed down from the View to render
inside the View's SVG container with D3. Similarly, it uses a reference to the Tooltip to change its values with D3. The 
Graph component also prevents React from re-rendering it when props change, and handles changes in props manually.

