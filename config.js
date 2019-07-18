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
        this.blinkcfg = parseInt(blinkcfg.value)
    },
    initOnce(S){
        C.init()
        this.RL = romLoader.loader
        theme.addEventListener('click',(e)=>{
            document.body.classList.toggle('dark');
            S.init(C.renderer,C)
            let etheme = document.body.classList.contains('dark') ? 'dark' : 'light'
            localStorage['c8-theme'] = etheme;
        })
        if(localStorage['c8-theme'] && localStorage['c8-theme'] == 'dark'){
            theme.click()
        }
        damodecfg.addEventListener('change', (e) => {C.damode = C.parseCfg(e)});
        exmodecfg.addEventListener('change', (e) => {C.exmode = C.parseCfg(e)});
        debugcfg.addEventListener('change', (e) => {C.dbgmode = C.parseCfg(e);regcfg.disabled = C.dbgmode==2});
        fpscfg.addEventListener('change', (e) => {C.opPerCycle = C.parseCfg(e)});
        btnstcfg.addEventListener('change', (e) => {C.btnSticking = C.parseCfg(e)});
        delaycfg.addEventListener('change', (e) => {C.delay = C.parseCfg(e)});
        rendercfg.addEventListener('change', (e) => {C.renderer = C.parseCfg(e);S.init(C.renderer,C)});
        gameovercfg.addEventListener('change', (e) => {C.gameover = C.parseCfg(e)});
        regcfg.addEventListener('change', (e) => {C.regmode = C.parseCfg(e)});
        regIfixcfg.addEventListener('change', (e) => {C.regIfix = C.parseCfg(e)});
        romcfg.addEventListener('change', (e) => {
        if(e.target.value == "0") return
            this.RL(false,e.target.children[C.parseCfg(e)].innerHTML);
        });
        blinkcfg.addEventListener('change', (e) => {C.antiblink = C.parseCfg(e)});
        presetcfg.addEventListener('change', (e) => {
            switch(C.parseCfg(e)){
                case 1:
                    C.setCfgs([[damodecfg,1],[exmodecfg,0],[debugcfg,2],[fpscfg,1000],[delaycfg,0]])
                break
                case 2:
                    C.setCfgs([[damodecfg,1],[exmodecfg,0],[debugcfg,2],[fpscfg,144],[delaycfg,0]])
                break
                case 3:
                    C.setCfgs([[damodecfg,1],[exmodecfg,0],[debugcfg,2],[fpscfg,10],[delaycfg,0],[blinkcfg,1]])
                break
                case 4:
                    C.setCfgs([[damodecfg,1],[exmodecfg,0],[debugcfg,1],[fpscfg,1],[delaycfg,60],[regcfg,1]])
                break
                case 5:
                    C.setCfgs([[damodecfg,1],[exmodecfg,1],[debugcfg,0],[fpscfg,1],[delaycfg,0],[regcfg,0]])
                break
            }
        });
    },
    setCfgs(arr){
        for(let el of arr){
            C.setCfg(el[0],el[1])
        }
    },
    setCfg(el,val){
        el.value = val;
        el.dispatchEvent(new Event('change'))
    },
    parseCfg(e){
        return parseInt(e.target.value);
    }
}
