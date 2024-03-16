////setup
//get html elements
const bSubmit = document.getElementById("submit");
const iAllInputs = document.querySelectorAll("input");
const dBoard = document.getElementById("board");
const dStatus = document.getElementById("status");
const bWords = document.getElementById("words");
const iLoader = document.getElementById("loader")
//intialise variabls
let sGuess="";
let sStatus="";
let sPartBoard="";
let sFullBoard="";
let i=0;
let bLock=false;
//focus on first charcter
iAllInputs[0].focus();
//loop over all inputs and set to tab to next
iAllInputs.forEach(input => {
    input.addEventListener("keyup",
        function(){
            const j=parseInt(input.id);
            if(j<5){
                if(!bLock && input.value!=""){
                    document.getElementById(j+1).value="";
                    document.getElementById(j+1).focus();
                }  
            }             
        }
    )
});

//date tracker
const today = new Date();
const sDate=today.getDate()+"/"+(today.getMonth() + 1)+"/"+today.getFullYear();
console.log(sDate)
if(localStorage.getItem("date")!=sDate){
    //set storage to new game
    localStorage.setItem("date", sDate);
    localStorage.setItem("partBoard", "");
    localStorage.setItem("i", "0");
    localStorage.setItem("fullBoard", dBoard.innerHTML);
    localStorage.setItem("status", "");
}else{
    //set board to storage
    dBoard.innerHTML=localStorage.getItem("fullBoard");
    sPartBoard=localStorage.getItem("partBoard");
    sFullBoard=localStorage.getItem("fullBoard");
    sStatus=localStorage.getItem("status");
    i=JSON.parse(localStorage.getItem("i"));
}
dStatus.innerText=sStatus;
bWords.addEventListener("click", function() {
    bSubmit.style="display:none";
    iLoader.style="display:block";
    const data= fetchAPIWords();        
})

async function fetchAPIWords() {
    try {
        const  options = {
            method:"GET",
        }
        const response = await fetch("https://prod-23.westus.logic.azure.com:443/workflows/a9bce0768ee9437fb456857ddd7d919b/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=z6Ncm1vss08AJyhKg-A5b7GDJZvYSvdUPz29sLIYt6I&mode=words", options);
        const string = await response.text();
        iLoader.style="display:none";
        const newWindow = window.open("", "Words");
        newWindow.document.write("<h2>"+string.replaceAll(",","</h2><h2>")+"</h2>");
        iLoader.style="display:none";
        bSubmit.style="display:block";
        return data;
    } catch (error) {
        console.error('Error fetching API data:', error);
        iLoader.style="display:none";
        bSubmit.style="display:block";
    }
}

////submit guess
bSubmit.addEventListener("click", function() {

    //build guess word from inpus
    sGuess="";
    sStatus=localStorage.getItem("status");
    iAllInputs.forEach(input => {
        sGuess+= input.value;
    });
    
    if(!bLock && sGuess.length==5 && (sStatus=="" || sStatus=="Not a valid word")){
        iLoader.style="display:block";
        bLock=true;
        localStorage.setItem("guess", sGuess);

        //calls flow
        fetchAPIData("https://prod-101.westus.logic.azure.com:443/workflows/00427b3c8f084d51be85e4584a4cc753/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=y59HfLgXTLMTqROzQRq0-T2j-hUp7XtxXBjOVW0FAGs",i)
            .then(data => {
                if(data!=undefined){
                    //next row
                    sStatus=data.status;
                    
                    if(sStatus!="Not a valid word" && data.partBoard!=undefined){
                        dStatus.innerHTML=sStatus;
                    //update storage and board
                        sPartBoard=data.partBoard;
                        sFullBoard=data.fullBoard;                            
                        dBoard.innerHTML=data.fullBoard;
                        localStorage.setItem("partBoard",sPartBoard);
                        localStorage.setItem("fullBoard", sFullBoard);
                        localStorage.setItem("status", sStatus);
                        iAllInputs.forEach(input => {input.value=""});                            
                        i++;
                        localStorage.setItem("i", i);                                
                    }else{
                        dStatus.innerText="Error, please try again";
                    }
                }
                bLock=false;
                iLoader.style="display:none";
                bSubmit.style="display:block";
        })
            .catch(error => {
                bLock=false;
                console.error('Error Get Environments:', error);
                iLoader.style="display:none";
                bSubmit.style="display:block";
        });
    }else{
        if(sGuess.length==5){
            alert("Please try again tomorrow");
        }else{
            alert("Please add all 5 characters");
        }
    }
});

//// http call function
async function fetchAPIData(url,i) {
    try {
        const  options = {
            method:"POST",      
            "body":JSON.stringify({
                "date":sDate,
                "row":i,
                "guess":sGuess,
                "board":sPartBoard
            })
        }
        const response = await fetch(url, options);
        const string = await response.text();
        const data = string === "" ? string : JSON.parse(string)
        return data;
    } catch (error) {
        console.error('Error fetching API data:', error);
    }
}