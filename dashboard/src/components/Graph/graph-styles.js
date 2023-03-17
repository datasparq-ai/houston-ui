import * as sigmoid from "../../js/sigmoid";


export const standard = {
  M: 130,  // standard distance between nodes
  W: 11,   // node diameter
  Ws: 7,   // skipped node diameter
  pathFunction: sigmoid.sigmoidPath,
  pathFunctionVertical: sigmoid.sigmoidPathVertical,
};


export const oldSchool = {
  M: 150,  // standard distance between nodes
  W: 11,
  Ws: 7,
  pathFunction: sigmoid.straightPath,
  pathFunctionVertical: sigmoid.sigmoidPathVertical,
};

