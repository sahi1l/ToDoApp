let $parent; 
let entries=[];
function PushDonesDown() {
    let unchecked=[];
    let checked=[];
    for(let entry of entries) {
        if(entry.ischecked()){
            checked.push(entry);
            $parent.appendChild(entry.$w);
        } else {
            unchecked.push(entry);
        }
    }
    entries = unchecked.concat(checked);
}
function FindFirstChecked(){
    for(let i=0; i<entries.length; i++){
        if(entries[i].ischecked()){
            return {idx: i, entry: entries[i]};
        }
    }
    return {idx: entries.length-1, entry: null};
}
function Save() {
    let results=[];
    for(let entry of entries) {
        results.push(entry.getval());
    }
    console.debug(JSON.stringify(results));
    //now save this as a cookie
}
function Load() {
    //load the cookie
    //loop through them and create, using SetVal
}
function Next(entry) {
    let idx = entries.indexOf(entry);
    if(idx==-1){idx=0;}
    else if (idx==entries.length-1){return null;}
    else {idx=idx+1;}
    return entries[idx];
}
function Prev(entry) {
    let idx = entries.indexOf(entry);
    if(idx==-1){idx=0;}
    else if (idx==0) {idx=entries.length-1;}
    else {idx=idx-1;}
    return entries[idx];
}
class Entry {
    constructor() {
        this.$w = document.createElement("div");
        this.$check = document.createElement("input");
        this.$check.type = "checkbox";
        this.$text = document.createElement("input");
        this.$delete = document.createElement("button");
        this.$delete.innerHTML = "🗑";
        this.$w.appendChild(this.$check);
        this.$w.appendChild(this.$text);
        this.$w.appendChild(this.$delete);
        $parent.appendChild(this.$w);
        this.$delete.addEventListener("click",(e,that=this)=> {
            that.delete();
        });
        this.$check.addEventListener("click",(e,that=this) => {
            Save();
            PushDonesDown();
            //move to bottom of list or checked list as relevant
        });
        this.$text.addEventListener("blur",(e,that=this)=> {
                if(that.$text.value==""){that.delete();}
        });
        this.$text.addEventListener("keypress", (e,that=this) => {
            if(e.keyCode==13){
                Save();
                let next=Next(that)??entries.push(new Entry());
                Next(that).focus();
            }
        });
    }
    ischecked() {
        return this.$check.checked;
    }
    getval() {
        let text = this.$text.value;
        let check = this.$check.checked;
        if(check){text="@"+text;}
        return text;
    }
    fade(){
        
    }
    delete() {
        this.$w.classList.add("deleting");
        setTimeout((that=this)=> {
            let idx = entries.indexOf(that);
            entries.splice(idx,1);
            that.$text.remove();
            that.$check.remove();
            that.$delete.remove();
            that.$w.remove();
        },1000);
    }
    setval(val) {
        let text = val;
        let check = (val.startsWith("@"));
        if(check) {text=text.slice(1);}
        this.$text.value = text;
        this.$check.checked = check;
    }
    focus(){
        this.$text.focus();
    }
}
function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function init(){
    $parent = document.getElementById("entries");
    entries.push(new Entry());
    entries.push(new Entry());
//    entries[1].setval("@hello");
}
ready(init);
