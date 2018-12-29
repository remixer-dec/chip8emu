import {R} from './registers.js'
import {S} from './screen.js'
import {K} from './keyboard.js'
var pointer = 512;
var stack = [];
var damode = parseInt(damodecfg.value)
var exmode = parseInt(exmodecfg.value)
var dbgmode = parseInt(debugcfg.value)
var opPerCycle = parseInt(fpscfg.value)
var skipNext = false;
var pauseFlag = false
var rom = false
var dtimer = 0, stimer = 0;
damodecfg.addEventListener('change', (e) => {damode = parseInt(e.target.value)});
exmodecfg.addEventListener('change', (e) => {exmode = parseInt(e.target.value)});
debugcfg.addEventListener('change', (e) => {dbgmode = parseInt(e.target.value)});
fpscfg.addEventListener('change', (e) => {opPerCycle = parseInt(e.target.value)});

K.init();

export function visualize(MEMORY){
    let stopit = false
    pauseFlag = false
    stopemu.addEventListener('click', (e) => {stopit = true});
    rom = MEMORY;
    S.init();
    S.clear();
    R.reset();

    let fulloutput = "";
    let i = 0, h = 0;
    opcodeview.innerHTML = "";

    pointer = 0x200;
    stack = [];
    function* executor(){
        while(pointer < rom.length){
            let opcode = rom[pointer] << 8 | rom[pointer + 1];
            let output = '';
            if(dtimer>0){
                dtimer--;
            }
            if(stimer>0){
                stimer--;
            }
            if(dbgmode < 2){
                output = getReadableInstruction(pointer, opcode);
            } else {
                opcodeExecutor(opcode);
                if(exmode==0){
                    yield;
                    continue;
                }
            }
            i++;
            if(i == 8290 && exmode == 1){
                output += "<h1>LOOP</h1>";
                break;
            }
            if(exmode == 0) {
                if(dbgmode < 2){
                    opcodeview.innerHTML += output;
                    opwrapper.scrollTop = 9999999
                    h++
                    if(h>16){
                        opcodeview.firstChild.remove()
                    }
                }
                yield output
            } else {
                fulloutput += output;
            }
        }
        if(exmode == 1 && dbgmode < 2) opcodeview.innerHTML = fulloutput;
        return;
    }
    let e = executor()
    function rafik(){
            for(let z=0;z<opPerCycle;z++){
                if(!pauseFlag){
                    e.next()
                }
            }
            if(!e.done && !stopit){
                requestAnimationFrame(rafik)
            }
    }
    rafik()
}
function getReadableInstruction(addr, instr){
    let states = dbgmode == 0 ? `<b data-screen="${S.pixels}" onmouseover="replayPixelSate(event)">[S]</b><b data-state="${R.getState()}" onmouseover="replayRegState(event)">[R]</b>`:"";
    return `<div>0x${adrNormalizer(addr,2)} | ${instr.toString(16)} | ${opcodeExecutor(instr)[2]} ${states}</div>`;
}

function adrNormalizer(decval, zeroes){
    let q = decval.toString(16);
    while(q.length<zeroes){
        q = "0" + q;
    }
    return q.toUpperCase()
}
function reg(regID){
    return `<u t="reg${regID}" h="${R.getReg(regID)}"></u>`;
}
function jumpTo(addr, memorize){
    //console.log(`jumping from 0x${pointer.toString(16)} to 0x ${addr.toString(16)}`)
    if(damode == 1){
        if(pointer != addr){
            if(memorize){
                stack.push(pointer);
            }
            pointer = addr;
        } else {
            console.log(`END`);
        }
    } else {
        pointer+=2;
    }
}
function jumpBack(){
    pointer = stack.pop();
    pointer +=2
}
function opcodeExecutor(opcode){
    let op0 = opcode >> 12 & 0xF
    let opX = opcode >> 8 & 0xF
    let opY = opcode >> 4 & 0xF
    let opN = opcode & 0xF
    let opNN = opcode & 0xFF
    let opNNN = opcode & 0xFFF
    if(skipNext && damode > 0){
        skipNext = false;
        pointer+=2;
        return ["???","UNKN","*SKIPPED*"];
    }
    switch(opcode){
        case 0x00E0:
            S.clear()
            pointer+=2
            return ["00E0","Display","Clears the screen"]
        case 0x00EE:
            jumpBack();
            return ["00EE","Flow","Returns from a subroutine"]
        default:
            switch(op0){
                case 0x0:
                    return ["0NNN","Call","Calls RCA 1802 programm at adress 0x"+opNNN.toString(16)]
                case 0x1:
                    jumpTo(opNNN);
                    return ["1NNN","Flow","Jumps to adress 0x"+opNNN.toString(16)]
                case 0x2:
                    jumpTo(opNNN, true);
                    return ["2NNN","Flow","Calls subroutine at 0x"+opNNN.toString(16)]
                case 0x3:
                    if(R.getReg(opX) == opNN){
                        skipNext = true;
                    }
                    pointer+=2;
                    return ["3XNN","Cond",`Skips the next instruction if ${reg(opX)} == ${opNN}. `]
                case 0x4:
                    if(R.getReg(opX) != opNN){
                        skipNext = true;
                    }
                    pointer+=2;
                    return ["4XNN","Cond",`Skips the next instruction if ${reg(opX)} != ${opNN}. `]
                case 0x5:
                    if(R.getReg(opX) == R.getReg(opY)){
                        skipNext = true;
                    }
                    pointer+=2;
                    return ["5XY0","Cond",`Skips the next instruction if ${reg(opX)} == ${reg(opY)}. `]
                case 0x6:
                    R.setReg(opX,opNN);
                    pointer+=2;
                    return ["6XNN","Const",`Sets reg${opX} = ${opNN}`]
                case 0x7:
                    R.setReg(opX, R.getReg(opX) + opNN)
                    pointer+=2;
                    return ["7XNN","Const",`Sets ${reg(opX)} += ${opNN}`]
                case 0x8:
                    switch(opN){
                        case 0x0:
                            R.setReg(opX, R.getReg(opY));
                            pointer+=2;
                            return ["8XY0","Assign",`Sets ${reg(opX)} = ${reg(opY)}`]
                        case 0x1:
                            R.setReg(opX, R.getReg(opX) | R.getReg(opY));
                            pointer+=2;
                            return ["8XY1","BitOp",`Sets ${reg(opX)} to ${reg(opX)} OR ${reg(opY)}`]
                        case 0x2:
                            R.setReg(opX, R.getReg(opX) & R.getReg(opY));
                            pointer+=2;
                            return ["8XY2","BitOp",`Sets ${reg(opX)} to ${reg(opX)} AND ${reg(opY)}`]
                        case 0x3:
                            R.setReg(opX, R.getReg(opX) ^ R.getReg(opY));
                            pointer+=2;
                            return ["8XY3","BitOp",`Sets ${reg(opX)} to ${reg(opX)} XOR ${reg(opY)}`]
                        case 0x4:
                            R.setReg(15,opY>opX?1:0)
                            R.setReg(opX, R.getReg(opX) + R.getReg(opY));
                            pointer+=2;
                            return ["8XY4","Math",`Sets ${reg(opX)} += ${reg(opY)}`]
                        case 0x5:
                            R.setReg(15,opY>opX?0:1)
                            R.setReg(opX, R.getReg(opX) - R.getReg(opY));
                            pointer+=2;
                            return ["8XY5","Math",`Sets ${reg(opX)} -= ${reg(opY)}`]
                        case 0x6:
                            R.setReg(15, R.getReg(opX) & 0x1)
                            R.setReg(opX, R.getReg(opX) >> 1);
                            pointer+=2;
                            return ["8XY6","BitOp",`Shifts ${reg(opX)} to the right by 1`]
                        case 0x7:
                            R.setReg(15,opX>opY?0:1)
                            R.setReg(opX, R.getReg(opY) - R.getReg(opX));
                            pointer+=2;
                            return ["8XY7","Const",`Sets ${reg(opX)} = ${reg(opY)} - ${reg(opX)}`]
                        case 0xE:
                            R.setReg(15, R.getReg(opX) >> 7)
                            R.setReg(opX, R.getReg(opX) << 1);
                            pointer+=2;
                            return ["8XYE","BitOp",`Shifts ${reg(opX)} to the left by 1`]
                    }
                case 0x9:
                    if(R.getReg(opX) != R.getReg(opY)){
                        skipNext = true;
                    }
                    pointer+=2;
                    return ["9XY0","Cond",`Skips the next instruction if ${reg(opX)} != ${reg(opY)}.`]
                case 0xA:
                    R.setReg(16, opNNN);
                    pointer+=2;
                    return ["ANNN","MEM",`Sets regI to adress 0x${opNNN.toString(16)}`]
                case 0xB:
                    jumpTo(opNN + R.getReg(0));
                    return ["BNNN","Flow",`Jumps to the adress ${opNNN.toString(16)} + reg0`]
                case 0xC:
                    let RAND = RNG();
                    R.setReg(opX, RAND & opNN);
                    pointer+=2;
                    return ["CXNN","Rand",`Sets ${reg(opX)} = (${RAND}) e.g. random(0,255) & ${opNN}`]
                case 0xD:
                    R.setReg(15,S.drawC8(R.getReg(opX), R.getReg(opY), rom.slice(R.getReg(16),R.getReg(16)+opN)))
                    S.renderer()
                    //console.log(pointer,'x',R.getReg(opX),'y',R.getReg(opY),opN,R.getReg(16),rom.slice(R.getReg(16),R.getReg(16)+opN));
                    pointer+=2;
                    return ["DXYN","Disp",`Renders a sprite at ${reg(opX)} and ${reg(opY)} with ${opN}px of height and 8 of width from memory regI`];
                case 0xE:
                    switch(opNN){
                        case 0x9E:
                            if(K.isPressed(R.getReg(opX))){
                                skipNext = true
                            }
                            pointer+=2
                        return ["EX9E","KeyOp",`Skips the next instruction if the key stored in ${reg(opX)} is pressed. (Usually the next instruction is a jump to skip a code block) `]
                        case 0xA1:
                            if(!K.isPressed(R.getReg(opX))){
                                skipNext = true
                            }
                            pointer+=2
                        return ["EXA1","KeyOp",`Skips the next instruction if the key stored in ${reg(opX)} isn't pressed. (Usually the next instruction is a jump to skip a code block) `]
                    }
                case 0xF:
                    switch (opNN) {
                        case 0x0A:
                            K.waitForNextKey().then(nextKey=>{R.setReg(opX,nextKey);pointer+=2;pauseFlag = false})
                            pauseFlag = true
                        return ["FX0A","KeyOp",`A key press is awaited, and then stored in ${reg(opX)}. (Blocking Operation. All instruction halted until next key event) `]
                        case 0x07:
                            R.setReg(opX,dtimer)
                            pointer+=2
                            console.log(dtimer)
                        return ["FX07","Timer",`Sets ${reg(opX)} to the value of the delay timer. `]
                        case 0x15:
                            dtimer = R.getReg(opX)
                            pointer+=2
                            console.log(dtimer)
                        return ["FX07","Timer",`Sets the delay timer to ${reg(opX)}`]
                        case 0x18:
                            stimer = R.getReg(opX)
                            pointer+=2
                            console.log(dtimer)
                        return ["FX07","Timer",`Sets the sound timer to ${reg(opX)}`]
                        case 0x1E:
                            R.setReg(16,R.getReg(16) + R.getReg(opX));
                            pointer+=2
                        return ["FX1E","MEM",`Adds ${reg(opX)} to ${reg(16)}`]
                        case 0x29:
                            R.setReg(16,0x50+R.getReg(opX)*5)
                            pointer+=2
                        return ["FX1E","MEM",`Sets I to the location of the sprite for the character in VX.`]
                        case 0x33:
                            let ireg = R.getReg(16)
                            let xreg = R.getReg(opX)
                            rom[ireg] = xreg / 100 >> 0
                            rom[ireg+1] = xreg / 10 % 10 >> 0
                            rom[ireg+2] = xreg % 100 % 10 >> 0
                            //R.setReg(16,ireg+3)
                            pointer+=2
                        return ["FX1E","MEM",`Sets memory at I,I+1,i+2 to VX.`]
                        case 0x55:
                            let ptr = R.getReg(16)
                            for(let u=0;u<=opX;u++){
                                rom[ptr+u] = R.getReg(u)
                            }
                            pointer+=2
                        return ["FX55","MEM",`Dumps all registers from 0 to X to memory ${reg(16)}`]
                        case 0x65:
                            let xptr = R.getReg(16)
                            for(let u=0;u<=opX;u++){
                                R.setReg(u,rom[xptr+u])
                            }
                            pointer+=2
                        return ["FX65","MEM",`Loads all registers from 0 to x from memory ${reg(16)}`]
                        default:
                            pointer+=2
                        return ["F000","UNK","<u style='color:red'>F NOT IMPLEMENTED</u>"]

                    }
                default:
                    pointer+=2;
                    return ["F000","UNK","NOT IMPLEMENTED"]

            }
    }
}
