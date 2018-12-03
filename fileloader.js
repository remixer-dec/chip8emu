let loadCallback = ()=>{} // global callback
export let HEXROM = false // romfile in HEX will be loaded in here
export function loader(){ // FileReader API callback
	let reader = new FileReader();
	reader.readAsArrayBuffer(romselector.files[0])
	setTimeout(function(){
        let dataView = new DataView(reader.result)
		let data = "";
		for(let i = 0, l = dataView.byteLength; i < l; i++){
			let bt = dataView.getUint8(i,false).toString(16)
		    data += bt.length < 2 ? '0' + bt : bt
		}
        HEXROM = data.toUpperCase()
        loadCallback()
	},420);
}
export function onload(c){
    loadCallback = c;
}
