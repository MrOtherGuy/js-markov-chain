'use strict';

function State(val){
  let targets = [];
  let hits = [];
  let probabilities = null;
  let modified = true;
  this.value = val;
  
  this.set = (val) => {
    if(probabilities){
      modified = true;
    }
    let idx = targets.indexOf(val);
    if(idx === -1){
      targets.push(val);
      hits.push(1);
    }else{
      hits[idx]++
    }
  }
  
  this.next = () => {
    if(modified){
      return 0
    }else{
      if(!targets.length){
        // this means that the state is a dead-end. There is nothing to transition into
        return null
      }
      let rand = Math.random();
      let idx = 0;
      while(idx < probabilities.length){
        if(rand < probabilities[idx]){
          return targets[idx]
        }
        idx++
      }
      return targets[idx-1]
    }
  }
  
  this.compile = () => {
    let sum = 0;
    for(let i of hits){
      sum += i;
    }
    let c = 0;
    probabilities = hits.map( a => { c += a/sum; return c } );
    
    modified = false;
    return 
  }
  
  return this
}

function StateManager(){
  const states = new Map();
  let currentState = null;
  
  this.needsInitilization = true;
  
  this.add = (value) => {
    let state = states.get(value);
    if(state){
      return state
    }
    let n = new State(value);
    states.set(value,n);
    return n
  }
   
  this.compile = () => {
    for(let state of states.values()){
      state.compile()
    }
    return
  }
  
  this.get = (id) => (states.get(id).value);
  
  this.next = () => {
    if(!currentState){
      console.warn("states is not initialized!");
      return null
    }
    let nextId = currentState.next();
    let node = states.get(nextId);
    if(!node){
      return { value: null }
    }
    currentState = states.get(nextId);
    return currentState
  }
  
  this.initialize = (state) => {
    if(states.has(state)){
      currentState = states.get(state)
    }else{
      let keys = states.keys();
      let n = Math.floor(Math.random() * Math.min(27,states.size-2));
      while(--n > 0){
        keys.next()
      }
      currentState = states.get(keys.next().value)
    }
    this.needsInitilization = false;
  }
  
  this.current = () => currentState;
  
  this.clear = () => {
    states.clear();
    currentState = null;
  }
  
  return this
}

function MarkovChain(){
  const SM = new StateManager();
  
  this.state = () => SM.current();
  this.update = () => {
    SM.next();
  }
  this.needsInit = () => SM.needsInitilization;
  this.init = (val) => SM.initialize(val);
  
  this.build = (arr) => {
    if(!arr.length){
      return
    }
    SM.clear();
    for(let idx = 0; idx < arr.length-1;idx++){
      let node = SM.add(arr[idx]);
      let next = SM.add(arr[idx+1]);
      if(!(next && next.value != undefined)){
        throw "somehow next didn't have value";
      }
      node.set(next.value);
    }
    SM.compile();
    return this
  }
  
  this.buildFromText = (str) => this.build(str.split(" ").filter(a => !!a.trim() ));
  
  this.compose = (n) => {
    if(SM.needsInitilization){
      console.warn("state needs initialization");
      return "";
    }
    let i = 0;
    let v = [SM.current().value];
    while(++i < n){
      let n = SM.next().value;
      if(n === null){
        SM.needsInitilization = true;
        break
      }
      v.push(n)
    }
    return v.join(" ");
  }
  
  this.makeSentence = (max = 50) => {
    if(SM.needsInitilization){
      console.warn("state needs initialization");
      return "";
    }
    let i = 0;
    const re = /[\.\?\!]$/;
    let first = SM.current().value;
    if(first === null){
      SM.needsInitilization = true;
      return ""
    }
    while(re.test(first)){
      first = SM.next().value;
      i++;
      if(i > max || first === null){
        SM.needsInitilization = true;
        return ""
      }
    }
    let s = first.replace(/^./,first[0].toUpperCase()) + " ";
  
    while(i++ < max){
      let val = SM.next().value;
      if(val === null){
        // this is the end of the road, system cannot transition to any node
        SM.needsInitilization = true;
        break
      }
      s += val;
      if(re.test(val)){
        break;
      }
      s += " ";
    }
    return s
  }
  
  return this
}
