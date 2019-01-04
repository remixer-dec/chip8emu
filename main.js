import * as romLoader from './fileloader.js'
import * as emulator from './emulator.js'
window.RNG = () => Math.floor(Math.random() * 256)
romselector.addEventListener('change', romLoader.loader)
romLoader.setOnloadCbk(()=>{
    emulator.emulate(romLoader.MEMORY)
});
