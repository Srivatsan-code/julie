import React, { useRef } from 'react';
import { useState,useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Wave from 'react-wavify'
import useSound from 'use-sound';
import clicksnd from "./sound/blip.mp3"
import News from './News';
import { useSpeechSynthesis } from 'react-speech-kit';
const Speech1 = ({forceUpdate,data,setdata}) => {
  const [toggle,setToggle]=useState(true)
  const refdata=useRef(false)
  const { speak,voices,cancel } = useSpeechSynthesis();
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();
  const listenContinuously = () => {
     if(toggle){
      SpeechRecognition.startListening({
        continuous: true,
        language: 'en-GB',
        
      });
     }
      
 
  };
  const [play] = useSound(clicksnd);
  const stopListen=()=>{
    play()
    toggle===true?setToggle(false):setToggle(true)
    SpeechRecognition.stopListening({
      continuous:true
    })
  }
  listenContinuously()
  const [bool,setBool]=useState("false")
 
  useEffect(()=>{
    
    (bool==="false") ? setBool("true"):setBool("false")
    
    const fun=async (e) => {
        
      const todo = { transcript };
      const response = await fetch("/add", {
      method: "POST",
      headers: {
      'Content-Type' : 'application/json'
      },
      body: JSON.stringify(todo)
      })
      if (response.ok){
      console.log("it worked")
      }
    forceUpdate();
    
    }
    const timer = setTimeout(() => {
      setBool('true');
      if (transcript && transcript.includes("news")!==true){
        refdata.current=false
          fun()   
      }
      else if(transcript && transcript.includes("news")){
           refdata.current=true
           setdata({
            data: " "
            
          });
      }
    }, 2500);  
   
    return()=>clearTimeout(timer);
  },
   [transcript])
   function chunkText(text, maxLength) {
    const chunks=text.split(/[,.;:-?"&]/g);
    return chunks.filter((chunk)=>chunk.trim()!=="");
  }
  useEffect(()=>{
   if(data!=="" && transcript){
    const maxLength=20;
    const chunks=chunkText(data,maxLength);
    const rate=1;
    cancel();
    for(var c=0 ;c<chunks.length;c++){
      speak({ text: chunks[c],rate ,voice:voices[5]});
      
    }
    
    resetTranscript()
   }
  },[data])
  
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div className='body'>
    <div className='speech-body'>
      {toggle?<div class="lds-ripple"><div></div><div></div></div>:""}
      <button className={toggle?'btn1':'btn'} onClick={stopListen}><i class="fa fa-microphone" style={{"font-size":"36px"}}></i></button>
      <div className='dataContainer' id="style-1">
      <p className={bool==="false" ?'spoken':'spoken1' } 
      >{transcript}</p>
      <p className='data'>{data} <br/></p>
     
      {refdata.current?<News/>:""}
      
      <p className={(data ) ? 'load':'load1'}>{
      transcript?<div class="lds-ellipsis"><div ></div><div></div><div></div><div></div></div>:
      toggle===true?"Hearing...":"Please Switch on Mic ..."
      
      }</p> </div> 
</div>
     {(() => {
      if (bool === 'false' && listening===true){
        if(transcript){
          setdata({
            data: ""
            
          });
        }
          return (
            <div className='wave'>
            <Wave mask="url(#mask)" fill="#1277b0" paused={false}
              options={{
                height: 40,
                amplitude: 40,
                speed: 1,
                points: 3,
                width:200
              }}>
        <defs>
          <linearGradient id="gradient" gradientTransform="rotate(90)">
            <stop offset="0" stopColor="white" />
            <stop offset="1" stopColor="black" />
          </linearGradient>
          <mask id="mask">
            <rect x="0" y="0" width="2000" height="100" fill="url(#gradient)"  />
          </mask>
        </defs>
      </Wave>
      </div>
          )
      }
      
      return null;
    })()}
  </div>
  );
};
export default Speech1;