import * as romLoader from './fileloader.js'
import * as emulator from './emulator.js'
import * as offline from './offline.js'
window.RNG = () => Math.floor(Math.random() * 256)
romselector.addEventListener('change', romLoader.load)
romLoader.loadExternalData()
romLoader.setOnloadCbk(()=>{
    emulator.emulate(romLoader.MEMORY)
});

//UI
window.onload = ()=>{
    setTimeout(()=>{
        /*web components imports experiment*/
        var component = document.querySelector('link[rel="import"]').import;
        var table = component.querySelector('#opcodes');
        //this has to be done to fix Firefox ID duplication bug
        var ins = table.cloneNode(true)
        table.remove()
        document.body.appendChild(ins)
        if(document.body.clientWidth<600){
            mobiletabs.firstElementChild.click();
        }
    },500);
    function show(arr){for(let i of arr){i.classList.remove('hidden')}}
    function hide(arr){for(let i of arr){i.classList.add('hidden')}}
    function tabs(e){
        e = parseInt(e.target.getAttribute('name'))
        switch(e){
            case 0:
                show([controls,dbgc])
                hide([config,dbgtools,changelog,opcodes])
            break
            case 1:
                show([config])
                hide([controls,dbgc,dbgtools,changelog,opcodes])
            break
            case 2:
                show([dbgc,dbgtools])
                hide([controls,config,changelog,opcodes])
            break
            case 3:
                show([opcodes,changelog])
                hide([config,controls,dbgc,dbgtools])
            break
        }
    }
    for(let tab of mobiletabs.children){
        tab.addEventListener('click',tabs)
    }
    offline.init()
    if(navigator.onLine) changelog.innerHTML = '<iframe src="https://ghbtns.com/github-btn.html?user=remixer-dec&repo=chip8emu&type=star&count=true" frameborder="0" scrolling="0" width="170px" height="20px"></iframe>' + changelog.innerHTML
}
