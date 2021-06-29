'use strict';
const MC = new MarkovChain();
function init(){
  console.log(`${document.title} has been loaded`);
  let isFinal = true;
  MC.build(a,isFinal);
  MC.init(); // sets initial state
  
  const reInitMC = () => {
    if(MC.needsInit()){
      MC.init()
    }
  };
  const getTextBox = () => document.getElementById("textbox");
  
  document.getElementById("textButton").addEventListener("click",(e)=>{
    let tokens = MC.compose(200);
    if(tokens.length === 0){
      getTextBox().textContent = "";
      reInitMC();
      return
    }
    let str = tokens[0].replace(/^./,tokens[0][0].toUpperCase());
    let startSentence = false;
    for(let i = 1; i < tokens.length; i++){
      let token = tokens[i];
      if(!/^[\.?!,;:]$/.test(token)){
        str += " ";
      }else{
        if(/^[\.?!]$/.test(token)){
          startSentence = true;
        }
        str += token;
        continue
      }
      if(startSentence){
        str += token.replace(/^./,token[0].toUpperCase());
        startSentence = false;
      }else{
        str += token;
      }
    }
    
    getTextBox().textContent = str;
    reInitMC()
  });
  document.getElementById("sentenceButton").addEventListener("click",(e)=>{
    getTextBox().textContent = MC.makeSentence();
    reInitMC()
  });
  document.getElementById("textinputButton").addEventListener("click",(e)=>{
    let input = document.getElementById("textinput");
    let status = input.previousElementSibling;
    try{
      MC.buildFromText(input.value,true);
      MC.init();
      status.textContent = "build OK";
      status.classList.add("success");
    }catch(e){
      status.textContent = "Error: " + e;
      status.classList.add("error");
    }
    setTimeout(()=>{ status.className = "status"},300);
  })
}


document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    init();
  }
}
