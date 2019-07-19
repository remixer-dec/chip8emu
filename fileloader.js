let loadCallback = ()=>{} // global callback
export let MEMORY = false // romfile will be loaded in here
let extsrc = 'https://mir3z.github.io/chip8-emu/roms/' //external ROM mirror
export function load(e,remote){// FileReader API callback
	if(!remote){
		let reader = new FileReader()
		opcodeview.innerHTML+='<div>loading...</div>'
		insertROMDescription(romselector.files[0].name.toUpperCase().replace(/\.c8$/,''))
		reader.readAsArrayBuffer(romselector.files[0])
		setTimeout(()=>{loadArrayBuffer(reader.result)},420)
	} else{
		if(remote[0] == "["){
			remote = remote.substr(3)
			insertROMDescription(remote,1)
			return fetch(extsrc+window.ROMS[remote].file).then(resp=>resp.arrayBuffer()).then(ab=>loadArrayBuffer(ab))
		}
		insertROMDescription(remote)
		fetch("./roms/"+remote).then(resp=>resp.arrayBuffer()).then(ab=>loadArrayBuffer(ab))
	}
}
export function loadExternalData(){
	fetch(extsrc+'roms.json').then( r=>r.json().then(j=>{
		window.ROMS = {}
		let localroms = Array.from(romcfg.querySelectorAll('option')).map(x=>x.innerText)
		let extraroms = ''
		let i=24
		for(let rom of j){
			window.ROMS[rom.title] = rom
			if(localroms.indexOf(rom.title.replace(/ /g,'')) == -1){
				extraroms += `<option value=${i++}>[E]${rom.title}</option>`
				window.ROMS[rom.title].e = 1
			} else {
				if(localroms.indexOf(rom.title != -1)){
					delete window.ROMS[rom.title]
					window.ROMS[rom.title.replace(/ /g,'')] = rom
				}
			}
		}
		romcfg.innerHTML+=extraroms;
	}).catch(e=>{window.ROMS = {}}))
}
function insertROMDescription(romname,ext){
	if(romname in window.ROMS){
		ext = ext ? 'ROM and ' : ''
		romtitle.innerHTML = `<h5>About the game ${romname}</h5>`
		romtext.innerHTML = window.ROMS[romname].description+=`<br><sub>${ext}description provided by <a href="https://github.com/mir3z/chip8-emu" target="_blank">mir3z</a></sub>`
		setTimeout(()=>romdesc.classList.remove('hidden'),200)
	}
	romdesc.classList.add('hidden')
}
function loadArrayBuffer(ab){
    let dataView = new DataView(ab)
	let fontset = [
		0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
		0x20, 0x60, 0x20, 0x20, 0x70, // 1
		0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
		0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
		0x90, 0x90, 0xF0, 0x10, 0x10, // 4
		0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
		0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
		0xF0, 0x10, 0x20, 0x40, 0x40, // 7
		0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
		0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
		0xF0, 0x90, 0xF0, 0x90, 0x90, // A
		0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
		0xF0, 0x80, 0x80, 0x80, 0xF0, // C
		0xE0, 0x90, 0x90, 0x90, 0xE0, // D
		0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
		0xF0, 0x80, 0xF0, 0x80, 0x80  // F
	]
	let mem = new Array(4096).fill(0);
	mem.splice(0x50, fontset.length, ...fontset);
	mem = new Uint8Array(mem)
	for(let i = 0, l = dataView.byteLength; i < l; i++){
		let bt = dataView.getUint8(i,false)
	    mem[0x200+i] = bt;
	}
	MEMORY = mem;
    loadCallback()
}
export function setOnloadCbk(c){
    loadCallback = c;
}
