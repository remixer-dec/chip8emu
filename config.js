import * as romLoader from './fileloader.js'
export var C = {
    init(){
        this.damode = parseInt(damodecfg.value)
        this.exmode = parseInt(exmodecfg.value)
        this.dbgmode = parseInt(debugcfg.value)
        this.opPerCycle = parseInt(fpscfg.value)
        this.btnSticking = parseInt(btnstcfg.value)
        this.delay = parseInt(delaycfg.value)
        this.renderer = parseInt(rendercfg.value)
        this.gameover = parseInt(gameovercfg.value)
        this.regmode = parseInt(regcfg.value)
    },
    initOnce(S){
        C.init()
        this.RL = romLoader.loader
        damodecfg.addEventListener('change', (e) => {C.damode = C.parseCfg(e)});
        exmodecfg.addEventListener('change', (e) => {C.exmode = C.parseCfg(e)});
        debugcfg.addEventListener('change', (e) => {C.dbgmode = C.parseCfg(e);regcfg.disabled = C.dbgmode==2});
        fpscfg.addEventListener('change', (e) => {C.opPerCycle = C.parseCfg(e)});
        btnstcfg.addEventListener('change', (e) => {C.btnSticking = C.parseCfg(e)});
        delaycfg.addEventListener('change', (e) => {C.delay = C.parseCfg(e)});
        rendercfg.addEventListener('change', (e) => {C.renderer = C.parseCfg(e);S.init(C.renderer)});
        gameovercfg.addEventListener('change', (e) => {C.gameover = C.parseCfg(e)});
        regcfg.addEventListener('change', (e) => {C.regmode = C.parseCfg(e)});
        romcfg.addEventListener('change', (e) => {
            if(e.target.value == "0") return
            this.RL(false,e.target.children[C.parseCfg(e)].innerHTML);
        });
    },
    parseCfg(e){
        return parseInt(e.target.value);
    }
}
