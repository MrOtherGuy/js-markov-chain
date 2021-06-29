'use strict';

class State{
  constructor(val){
    this.targets = [];
    this.hits = [];
    this.probabilities = null;
    this.modified = true;
    this.value = val;
    return Object.seal(this)
  }
  set(val){
    if(this.hits === null){
      return
    }
    this.modified = true;
    let idx = this.targets.indexOf(val);
    if(idx === -1){
      this.targets.push(val);
      this.hits.push(1);
    }else{
      this.hits[idx]++
    }
  }
  next(){
    const probabilities = (() => {
      if(this.modified){
        let c = 0;
        return this.hits.map( a => { c += a/sum; return c } )
      }
      return this.probabilities;
    })();
    if(!this.targets.length){
      // this means that the state is a dead-end. There is nothing to transition into
      return null
    }
    let rand = Math.random();
    let idx = 0;
    while(idx < probabilities.length){
      if(rand < probabilities[idx]){
        return this.targets[idx]
      }
      idx++
    }
    return this.targets[idx-1]
  }
  compile(isFinal){
    if(this.hits === null){
      throw "Can't compile already finalized state";
    }
    let sum = 0;
    for(let i of this.hits){
      sum += i;
    }
    let c = 0;
    this.probabilities = this.hits.map( a => { c += a/sum; return c } );
    this.modified = false;
    if(isFinal){
      this.hits = null;
      Object.freeze(this);
      return 
    }
    return
  }
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
   
  this.compile = (isFinal) => {
    for(let state of states.values()){
      state.compile(!!isFinal)
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
    this.needsInitilization = true;
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
  
  this.build = (arr,isFinal = false) => {
    if(!arr?.length){
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
    SM.compile(!!isFinal);
    return this
  }
  
  this.buildFromText = (str,isFinal = false) => {
    const re = /\S+/g;
    SM.clear();
    let match;
    let previous = null;
    while(match = re.exec(str)){
      let content = match[0].toLowerCase();
      let skipLast = /[\.,?!:;]$/.test(content);
      let node = SM.add( skipLast ? content.slice(0,-1) : content );
      previous && previous.set(node.value);
      if(skipLast){
        if(content.length < 2){
          continue
        }
        let next = SM.add(content.slice(-1));
        if(!(next && next.value != undefined)){
          throw "somehow next didn't have value";
        }
        node.set(next.value);
        previous = next;
      }else{
        previous = node;
      }
    }
    SM.compile(!!isFinal);
    return this
  }
  
  this.compose = (n) => {
    if(SM.needsInitilization){
      console.warn("state needs initialization");
      return "";
    }
    let i = 0;
    let v = [SM.current().value];
    if(v[0] === null){
      SM.needsInitilization = true;
      return [];
    }
    while(++i < n){
      let n = SM.next().value;
      if(n === null){
        SM.needsInitilization = true;
        break
      }
      v.push(n)
    }
    SM.next();
    return v;
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
    while(re.test(first) || first === ","){
      first = SM.next().value;
      i++;
      if(i > max || first === null){
        SM.needsInitilization = true;
        return ""
      }
    }
    
    let s = first.replace(/^./,first[0].toUpperCase());
  
    while(i++ < max){
      let val = SM.next().value;
      if(val === null){
        // this is the end of the road, system cannot transition to any node
        SM.needsInitilization = true;
        break
      }
      if(re.test(val)){
        s += val;
        break;
      }
      s += /^[\.,:;]$/.test(val) ? val : " "+val;
    }
    SM.next();
    return s
  }
  
  return this
}
