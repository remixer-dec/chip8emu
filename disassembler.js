import {R} from './registers.js'
import {S} from './screen.js'
var pointer = 512;
var stack = [];
var damode = parseInt(damodecfg.value)
var exmode = parseInt(exmodecfg.value)
var skipNext = false;
var rom = false
damodecfg.addEventListener('change', (e) => {damode = parseInt(e.originalTarget.value)});
exmodecfg.addEventListener('change', (e) => {exmode = parseInt(e.originalTarget.value)});
export function visualize(MEMORY){
    let stopit = false
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
            let output = getReadableInstruction(pointer, opcode);
            i++;
            if(i == 1190){
                output += "<h1>LOOP</h1>";
                break;
            }
            if(exmode == 0) {
                opcodeview.innerHTML += output;
                opwrapper.scrollTop = 9999999
                h++
                if(h>16){
                    opcodeview.firstChild.remove()
                }
                yield output
            } else {
                fulloutput += output;
            }
        }
        if(exmode == 1) opcodeview.innerHTML = fulloutput;
        return;
    }
    let e = executor()
    function rafik(){
            e.next()
            if(!e.done && !stopit){
                requestAnimationFrame(rafik)
            }
    }
    rafik()
}
function getReadableInstruction(addr, instr){
    return `<div>0x${adrNormalizer(addr,2)} | ${instr.toString(16)} | ${opcodeExecutor(instr)[2]} <b data-screen="${S.pixels}" onmouseover="replayPixelSate(event)">[S]</b><b data-state="${R.getState()}" onmouseover="replayRegState(event)">[R]</b></div>`;
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
                            R.setReg(opX, R.getReg(opX) + R.getReg(opY));
                            pointer+=2;
                            return ["8XY4","Math",`Sets ${reg(opX)} += ${reg(opY)}`]
                        case 0x5:
                            R.setReg(opX, R.getReg(opX) - R.getReg(opY));
                            pointer+=2;
                            return ["8XY5","Math",`Sets ${reg(opX)} -= ${reg(opY)}`]
                        case 0x6:
                            R.setReg(opX, R.getReg(opX) >> 1);
                            pointer+=2;
                            return ["8XY6","BitOp",`Shifts ${reg(opX)} to the right by 1`]
                        case 0x7:
                            R.setReg(opX, R.getReg(opY) - R.getReg(opX));
                            pointer+=2;
                            return ["8XY7","Const",`Sets ${reg(opX)} = ${reg(opY)} - ${reg(opX)}`]
                        case 0xE:
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
                    S.drawC8(R.getReg(opX), R.getReg(opY), rom.slice(R.getReg(16),R.getReg(16)+opN))//.substr((R.getReg(16) - 512) * 2, 2 * opN))
                    S.renderer()
                    //console.log(pointer,'x',R.getReg(opX),'y',R.getReg(opY),opN,R.getReg(16),rom.slice(R.getReg(16),R.getReg(16)+opN));
                    pointer+=2;
                    return ["DXYN","Disp",`Renders a sprite at ${reg(opX)} and ${reg(opY)} with ${opN}px of height and 8 of width from memory regI`];
                default:
                    pointer+=2;
                    return ["F000","UNK","NOT IMPLEMENTED"]

            }
    }
}
