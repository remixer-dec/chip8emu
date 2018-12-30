export var D = {
    init:function(R){
        this.R = R;
    },
    adrNormalizer:function(decval, zeroes){
        let q = decval.toString(16);
        while(q.length<zeroes){
            q = "0" + q;
        }
        return q.toUpperCase()
    },
    reg:function(regID){
        return `<u t="reg${regID}" h="${this.R.getReg(regID)}"></u>`;
    }
}
