
import * as d3 from 'd3'
import dagre from 'dagre'

/**
 *
 * @param graph: List of nodes with names and lists of downstream/upstream nodes
 * @param orientation:
 * @returns {dagre.graphlib.Graph}
 */
export function graphify(graph, orientation) {

  let g = new dagre.graphlib.Graph();

  g.setGraph({
    nodesep: 10,
    ranksep: 10,
    rankdir: orientation === "vertical" ? "TB" : "LR",
    marginx: 0,
    marginy: 0
  });

  graph.forEach(stage => {

    g.setNode(stage.n, {
      labelType: "none",
      label: stage.n,
      padding: 0,
    });

    if (stage.d) {
      if (typeof (stage.d) === "string") {
        stage.d = [stage.d]
      }
      stage.d.forEach(d => {
        g.setEdge(stage.n, d, {
          label: "",
          width: 0
        });
      })
    }

    if (stage.u) {
      if (typeof (stage.u) === "string") {
        stage.u = [stage.u]
      }
      stage.u.forEach(d => {
        g.setEdge(d, stage.n, {
          label: "",
          width: 0
        });
      })
    }
  });

  //compute x and y positions
  dagre.layout(g);

  // reformat nodes into a list
  g.nodes = Object.entries(g._nodes).map(d => {

    const n = {id: d[0], order: d[1].x/10, rank: d[1].y/10};

    // if the node is in the graph (it should be) assign all the values to the node
    if (graph.filter(e => e.n === d[0])[0]) {
      return Object.assign(graph.filter(e => e.n === d[0])[0], n)
    }
    else {
      console.error(n, "not found in graph");
      return n
    }
  });

  // create list of links
  g.links = Object.entries(g._edgeObjs).map(d => {
    let source = g.nodes.filter(node => node.id === d[1].v)[0];
    let target = g.nodes.filter(node => node.id === d[1].w)[0];
    return {source, target}
  });

  g.domain  = {
    order: d3.extent(g.nodes, d => d.order),
    rank: d3.extent(g.nodes, d => d.rank)
  };

  return g
}


//
// utils
//


export function sigmoidPathBasic(d) {
  return "M" + d.source.x + "," + d.source.y +
         "C" + (d.source.x + d.target.x)/2 + "," + d.source.y +
         " " + (d.source.x + d.target.x)/2 + "," + d.target.y +
         " " + d.target.x + "," + d.target.y;
}

/**
 * Uniform sigmoid from source x & y to target x & y.
 */
export function sigmoidPath(d) {
  let sigmoidLineFunction = d3.line()
    .x(e => e * (d.target.x - d.source.x) + d.source.x)
    .y(e => sigmoidCurve(e) * (d.target.y - d.source.y) + d.source.y);
  return sigmoidLineFunction(generateData())
}

export function sigmoidPathVertical(d) {
  let sigmoidLineFunction = d3.line()
    .x(e => sigmoidCurve(e) * (d.target.x - d.source.x) + d.source.x)
    .y(e => e * (d.target.y - d.source.y) + d.source.y);
  return sigmoidLineFunction(generateData())
}

export function straightPath(d) {
  let LineFunction = d3.line()
    .x(e => e * (d.target.x - d.source.x) + d.source.x)
    .y(e => e * (d.target.y - d.source.y) + d.source.y);
  return LineFunction(generateData())
}

export function sigmoidCurve(t) {
  t -= 0.5;
  t *= Math.PI * Math.PI;
  return 1/(1 + Math.pow(Math.exp(1), -t))
}

function generateData() {
  let data = d3.range(100).map(d => d/100);
  data.push(1);
  return data
}