var registers = new Uint8Array(16)
var regI = new Uint16Array(1);
export var R = {
    setReg(regID, value){
        if(regID<16){
            registers[regID] = value
        } else {
            regI[0] = value
        }
        return value
    },
    getReg(regID){
        return regID<16?registers[regID]:regI[0]
    },
    getState(){
        return registers.toString()+'|'+regI[0]
    },
    setState(str){
        let rt = str.split('|')
        registers = new Uint8Array(rt[0](',').map(Number));
        regI = new Uint16Array([rt[1]])
    },
    reset(){
        registers = new Uint8Array(16)
        regI = new Uint16Array(1);
    },
    visualizeState(regState){
        regState = regState.split(/,|\|/g).map(Number);
        let l = regState.length - 1;
        for(let el in regState){
            if(el != l){
                let r = 'rv'+el
                window[r].setAttribute('v', regState[el]);
                window[r].setAttribute('v16', regState[el].toString(16));
            } else{
                let ri = "0x"+regState[16].toString(16)
                rvI.setAttribute('v', ri);
                rvI.setAttribute('v16', ri);
            }
        }
    }
}
window.replayRegState = (e)=>{
    R.visualizeState(e.target.getAttribute('data-state'));
}
