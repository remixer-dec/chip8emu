let loadCallback = ()=>{} // global callback
export let MEMORY = false // romfile will be loaded in here
export function loader(e,remote){// FileReader API callback
	if(!remote){
		let reader = new FileReader()
		reader.readAsArrayBuffer(romselector.files[0])
		setTimeout(()=>{loadArrayBuffer(reader.result)},420)
	} else{
		let extsrc = 'https://mir3z.github.io/chip8-emu/roms/'
		if(remote == "[MORE]"){
			fetch(extsrc+'roms.json').then( r=>r.json().then(j=>{
				romcfg.lastElementChild.remove()
				window.ROMS = {}
				let existing = Array.from(romcfg.querySelectorAll('option')).map(x=>x.innerText)
				let extraroms = ''
				let i=24
				for(let rom of j){
					window.ROMS[rom.title] = rom
					if(existing.indexOf(rom.title.replace(/ /g,'')) == -1){
						if(rom.title == 'WIPE OFF'){
						}
						extraroms += `<option value=${i++}>[E]${rom.title}</option>`
					} else {
						if(existing.indexOf(rom.title == -1)){
							window.ROMS[rom.title] = undefined
							window.ROMS[rom.title.replace(/ /g,'')] = rom
						}
					}
				}
				romcfg.innerHTML+=extraroms;
				alert('Succesfully loaded more roms');
			}))
			return
		}
		if(remote[0] == "["){
			return fetch(extsrc+window.ROMS[remote.substr(3)].file).then(resp=>resp.arrayBuffer()).then(ab=>loadArrayBuffer(ab))
		}
		fetch("./roms/"+remote).then(resp=>resp.arrayBuffer()).then(ab=>loadArrayBuffer(ab))
	}
}
function loadArrayBuffer(ab){
    let dataView = new DataView(ab)
	window.DW = dataView;
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
