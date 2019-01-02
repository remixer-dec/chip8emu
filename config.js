export var C = {
    init:function(){
        this.damode = parseInt(damodecfg.value)
        this.exmode = parseInt(exmodecfg.value)
        this.dbgmode = parseInt(debugcfg.value)
        this.opPerCycle = parseInt(fpscfg.value)
        this.btnSticking = parseInt(btnstcfg.value)
        this.delay = parseInt(delaycfg.value)
        this.renderer = parseInt(rendercfg.value)
        this.gameover = parseInt(gameovercfg.value)
    },
    initEvents:function(S){
        damodecfg.addEventListener('change', (e) => {C.damode = C.parseCfg(e)});
        exmodecfg.addEventListener('change', (e) => {C.exmode = C.parseCfg(e)});
        debugcfg.addEventListener('change', (e) => {C.dbgmode = C.parseCfg(e)});
        fpscfg.addEventListener('change', (e) => {C.opPerCycle = C.parseCfg(e)});
        btnstcfg.addEventListener('change', (e) => {C.btnSticking = C.parseCfg(e)});
        delaycfg.addEventListener('change', (e) => {C.delay = C.parseCfg(e)});
        rendercfg.addEventListener('change', (e) => {C.renderer = C.parseCfg(e);S.init(C.renderer)});
        gameovercfg.addEventListener('change', (e) => {C.gameover = C.parseCfg(e)});
    },
    parseCfg:function(e){
        return parseInt(e.target.value);
    }
}
