import {Preferences} from "@capacitor/preferences";
/*import SetupSwipe from "./swipe.js";
function handleSwipe(dir) {
    DEBUG("handleSwipe: "+dir);
    document.getElementById("duh").innerHTML=dir;
}
SetupSwipe(handleSwipe);
*/
/*NOTE: Add logos on sides to drag on and swipe*/
function DEBUG(txt) {
    console.debug(txt);
    let debug = document.getElementById("debug");
    if(debug) {
        debug.innerHTML += "<BR>" + txt;
    }
}
let $parent;
let prefkey="us_sahill_todo"
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
async function Save() {
    let results=[];
    for(let entry of entries) {
        results.push(entry.getval());
    }
    let encode = JSON.stringify(results);
    Preferences.set({key:prefkey, value:encode});
    console.debug("saved ",encode);
    console.debug(await Preferences.get({key:prefkey}));
    //now save this as a cookie
}
function AlwaysHaveOne() {
    if(entries.length === 0) {
        entries.push(new Entry());
    }
}
async function Load() {
    //load the cookie
    //loop through them and create, using SetVal
    let encode = await Preferences.get({key:prefkey});
    DEBUG("PREF:"+encode.value+"<BR>");
    console.debug(encode.value);
    let tasks = JSON.parse(encode.value)??[];
    entries = [];
    let entry = null;
    for(let task of tasks) {
        entry = new Entry();
        entry.setval(task);
        entries.push(entry);
    }
    AlwaysHaveOne();
    DEBUG("done with Load");
    PushDonesDown();
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
        this.$textwrapper = document.createElement("div");
        this.$textwrapper.classList.add("textwrapper");
        this.$text = document.createElement("input");
        this.$text.classList.add("text");
        this.$delete = document.createElement("button");
        this.$delete.innerHTML = "🗑";
        this.$w.appendChild(this.$check);
        this.$w.appendChild(this.$textwrapper);
        this.$textwrapper.appendChild(this.$text);
        this.$w.appendChild(this.$delete);
        $parent.appendChild(this.$w);
        this.$delete.addEventListener("click",(e,that=this)=> {
            that.delete();
            Save();
        });
        this.$check.addEventListener("click",(e,that=this) => {
            PushDonesDown();
            Save();
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
            Save();
            AlwaysHaveOne();
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

function GetCo(e){
    let obj;
    if (e.touches) {obj=e.touches[0];} else {obj=e;}
    return {x:obj.clientX,
            y:obj.clientY};
}
let displayswipe;
class DisplaySwipe {
    constructor() {
        this.$root = document.getElementById("display");
        this.$w = this.$root.querySelector(".swipe");
        console.debug(this.$root);
        console.debug(this.$w);
        this.start = this.start.bind(this);
        this.move = this.move.bind(this);
        this.end = this.end.bind(this);
        addEventListener("mousedown",this.start);
        addEventListener("mousemove",this.move);
        addEventListener("mouseup",this.end);
    }
    position(pct) {
    }
    start(e) {
        this.startco = GetCo(e);
        this.startbottom = -this.$root.getBoundingClientRect().y;
        this.$w.classList.add("active");
        e.preventDefault();

    }
    move(e) {
        e.preventDefault();
        if (this.startco===undefined) {return;}
        let co=GetCo(e);
        let dy = co.y-this.startco.y;
        let bottom = this.startbottom-dy;
        if(bottom<0){bottom=0;}
        
        this.$root.style.bottom=bottom+"px";
    }
    end(e) {
        this.startco = undefined;
        this.$w.classList.remove("active");
        let bot = parseInt(this.$root.style.bottom);
        if(2*bot > window.innerHeight) {//closer to top
            this.$root.style.bottom=(window.innerHeight-50)+"px";
            this.$w.classList.add("swipedown");
            this.$w.classList.remove("swipeup");
        } else {
            this.$root.style.bottom="0px";
            this.$w.classList.add("swipeup");
            this.$w.classList.remove("swipedown");
        }
        e.preventDefault();
    }
    
}

function init(){
    DEBUG("starting");
    $parent = document.getElementById("entries");
    displayswipe = new DisplaySwipe();
    Load();
}
ready(init);
