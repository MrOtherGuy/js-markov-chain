'use strict';
const MC = new MarkovChain();
function init(){
  console.log(`${document.title} has been loaded`);

  MC.build(a);
  MC.init(); // sets initial state
  
  let getTextBox = () => document.getElementById("textbox");
  
  document.getElementById("textButton").addEventListener("click",(e)=>{
    getTextBox().textContent = MC.compose(200)
  });
  document.getElementById("sentenceButton").addEventListener("click",(e)=>{
    getTextBox().textContent = MC.makeSentence()
  });
  document.getElementById("textinputButton").addEventListener("click",(e)=>{
    let input = document.getElementById("textinput");
    let status = input.previousElementSibling;
    try{
      MC.buildFromText(input.value);
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