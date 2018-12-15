let loadCallback = ()=>{} // global callback
export let MEMORY = false // romfile will be loaded in here
export function loader(){ // FileReader API callback
	let reader = new FileReader();
	reader.readAsArrayBuffer(romselector.files[0])
	setTimeout(function(){
        let dataView = new DataView(reader.result)
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
		let mem = new Array(2048).fill(0);
		mem.splice(0x50, fontset.length, ...fontset);
		mem = new Uint8Array(mem)
		for(let i = 0, l = dataView.byteLength; i < l; i++){
			let bt = dataView.getUint8(i,false)
		    mem[0x200+i] = bt;
		}
		MEMORY = mem;
        loadCallback()
	},420);
}
export function onload(c){
    loadCallback = c;
}
