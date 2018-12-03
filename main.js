import * as romLoader from './fileloader.js'
import * as disassembler from './disassembler.js'
window.RNG = () => Math.floor(Math.random() * 256)
romselector.addEventListener('change', romLoader.loader)
romLoader.onload(()=>{
    window.vis = disassembler.visualize(romLoader.HEXROM)
});
