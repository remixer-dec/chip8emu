import * as romLoader from './fileloader.js'
let prm = ['damode','exmode','dbgmode','opPerCycle','btnSticking','delay','renderer','gameover','regmode','antiblink','altImp','slimit']
let cfg = ['damodecfg','exmodecfg','debugcfg','fpscfg','btnstcfg','delaycfg','rendercfg','gameovercfg','regcfg','blinkcfg','altimpcfg','scrlimitcfg']
export var C = {
    init(){
        var saved = localStorage['c8-cfg'] ? 1 : 0
        let savedcfg = saved ? JSON.parse(localStorage['c8-cfg']) : new Array(20)
        let sc = []
        for(let i=0,l=prm.length;i<l;i++){
            this[prm[i]] = saved ? savedcfg[i] : parseInt(window[cfg[i]].value)
            sc.push([window[cfg[i]],this[prm[i]]])
        }
        if(localStorage['c8-cfg']){
            console.log(sc)
            C.setCfgs(sc)
        }
    },
    initOnce(S){
        C.init()
        this.RL = romLoader.load
        theme.addEventListener('click',(e)=>{
            document.body.classList.toggle('dark');
            S.init(C.renderer,C)
            let etheme = document.body.classList.contains('dark') ? 'dark' : 'light'
            localStorage['c8-theme'] = etheme;
        })
        if(localStorage['c8-theme'] && localStorage['c8-theme'] == 'dark'){
            theme.click()
        }
        savecfg.addEventListener('click', (e) => {
            let ecfg = []
            for(let i=0,l=cfg.length;i<l;i++){
                ecfg.push(parseInt(window[cfg[i]].value))
            }
            localStorage['c8-cfg'] = JSON.stringify(ecfg)
            e.target.style.backgroundColor = '#66BB6A'
            setTimeout(()=>e.target.style.backgroundColor = '',2000)
        });
        damodecfg.addEventListener('change', (e) => {C.damode = C.parseCfg(e)});
        exmodecfg.addEventListener('change', (e) => {C.exmode = C.parseCfg(e)});
        debugcfg.addEventListener('change', (e) => {C.dbgmode = C.parseCfg(e);regcfg.disabled = C.dbgmode==2});
        fpscfg.addEventListener('change', (e) => {C.opPerCycle = C.parseCfg(e)});
        btnstcfg.addEventListener('change', (e) => {C.btnSticking = C.parseCfg(e)});
        delaycfg.addEventListener('change', (e) => {C.delay = C.parseCfg(e)});
        rendercfg.addEventListener('change', (e) => {C.renderer = C.parseCfg(e);S.init(C.renderer,C)});
        gameovercfg.addEventListener('change', (e) => {C.gameover = C.parseCfg(e)});
        regcfg.addEventListener('change', (e) => {C.regmode = C.parseCfg(e)});
        altimpcfg.addEventListener('change', (e) => {C.altImp = C.parseCfg(e)});
        scrlimitcfg.addEventListener('change', (e) => {C.slimit = C.parseCfg(e)});
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
