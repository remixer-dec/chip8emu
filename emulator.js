import {CPU} from './cpu.js'
import {R} from './registers.js'
import {S} from './screen.js'
import {K} from './keyboard.js'
import {C} from './config.js'
import {D} from './debug.js'
import {M} from './memory.js'

C.initOnce(S);
K.init(C);
M.initOnce(R,S);
D.init(R,C,S);
export function emulate(MEMORY){
    if(!M.stopFlag){ //turn off previous process before starting a new one
        M.stopFlag = true;
        return setTimeout(emulate,512,MEMORY)
    }
    M.init(MEMORY)
    S.init(C.renderer,C);
    S.clear();
    R.reset();
    CPU.init(R,C,S,M,D,K)

    let fulloutput = "";
    let i = 0, h = 0;
    opcodeview.innerHTML = "";

    function* executor(){
        while(M.pointer < M.RAM.length){
            let opcode = M.RAM[M.pointer] << 8 | M.RAM[M.pointer + 1];
            let output = '';
            if(M.dtimer>0){
                M.dtimer--;
            }
            if(M.stimer>0){
                beep.classList.add('activated')
                M.stimer--;
                if(M.stimer == 0){
                    beep.classList.remove('activated')
                }
            }
            if(C.dbgmode < 2){
                output = D.getReadableInstruction(M.pointer, opcode,CPU.opcodeExecutor(opcode));
            } else {
                CPU.opcodeExecutor(opcode);
                if(C.exmode==0){
                    yield;
                    continue;
                }
            }
            i++;
            if(C.exmode == 1 && i == 8290){
                fulloutput += "<h4>Pre-render limit reached</h4>";
                break;
            }

            if(C.exmode == 0) {
                if(C.dbgmode < 2){
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
                if(M.stopFlag){
                    break
                }
            }
        }
        if(C.exmode == 1 && C.dbgmode < 2) opcodeview.innerHTML = fulloutput;
        return;
    }
    let e = executor()
    function rafik(){
            for(let z=0;z<C.opPerCycle;z++){
                if(!M.pauseFlag){
                    e.next()
                }
                if(M.drawFlag && C.opPerCycle/1000 == M.drawFlag){
                    M.drawFlag = 0
                    S.renderer()
                    break
                }
            }
            if(!e.done && !M.stopFlag){
                setTimeout(requestAnimationFrame,C.delay,rafik)
            }
    }
    rafik()
}
