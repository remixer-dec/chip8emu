var registers = new Array(17).fill(0)
const regZeroes = registers.slice()
export var R = {
    setReg:function(regID, value){
        registers[regID] = value
        return value
    },
    getReg:function(regID){
        return registers[regID]
    },
    getState:function(){
        return registers.toString()
    },
    setState:function(str){
        registers = str.split(',').map(Number);
    },
    reset:function(){
        registers = regZeroes.slice();
    },
    visualizeState:function(regState){
        regState = regState.split(',').map(Number);
        let l = regState.length - 1;
        for(let el in regState){
            if(el != l){
                window['rv'+el].setAttribute('v', regState[el]);
            } else{
                rvI.setAttribute('v', "0x"+regState[16].toString(16).toUpperCase());
            }
        }
    }
}
window.replayRegState = (e)=>{
    R.visualizeState(e.target.getAttribute('data-state'));
}