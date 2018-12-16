var registers = new Uint8Array(16)
var regI = new Uint16Array(1);
export var R = {
    setReg:function(regID, value){
        if(regID<16){
            registers[regID] = value
        } else {
            regI[0] = value
        }
        return value
    },
    getReg:function(regID){
        return regID<16?registers[regID]:regI[0]
    },
    getState:function(){
        return registers.toString()+'|'+regI[0]
    },
    setState:function(str){
        let rt = str.split('|')
        registers = new Uint8Array(rt[0](',').map(Number));
        regI = new Uint16Array([rt[1]])
    },
    reset:function(){
        registers = new Uint8Array(16)
        regI = new Uint16Array(1);
    },
    visualizeState:function(regState){
        regState = regState.split(/,|\|/g).map(Number);
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
