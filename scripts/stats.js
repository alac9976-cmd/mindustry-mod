let production = {};
let lastItems = {};
let powerProduced = 0;
let powerUsed = 0;
let timer = 0;

function resetStats(){
    production = {};
    lastItems = {};
    powerProduced = 0;
    powerUsed = 0;
}

Events.on(EventType.WorldLoadEvent, e=>{
    resetStats();
});

function scanCore(){
    let core = Vars.player.team().core();
    if(!core) return;

    let items = core.items;

    Vars.content.items().each(item=>{
        let amount = items.get(item);

        if(lastItems[item.name] == null){
            lastItems[item.name] = amount;
        }

        let diff = amount - lastItems[item.name];
        production[item.name] = diff;

        lastItems[item.name] = amount;
    });
}

function scanPower(){

    powerProduced = 0;
    powerUsed = 0;

    Vars.groups.build.each(b=>{
        if(b.power != null){

            if(b.block.consumesPower){
                powerUsed += b.power.graph.getPowerNeeded();
            }

            if(b.block.outputsPower){
                powerProduced += b.power.graph.getPowerProduced();
            }

        }
    });
}

function drawUI(){

    let table = new Table();
    table.top().left();

    table.add("MAP STATISTICS").row();

    table.add("Power Produced: " + Math.floor(powerProduced)).row();
    table.add("Power Used: " + Math.floor(powerUsed)).row();

    table.add("Items / sec").row();

    for(let key in production){
        table.add(key + ": " + production[key]).row();
    }

    Vars.ui.hudGroup.addChild(table);
}

Events.run(Trigger.update, ()=>{

    timer += Time.delta;

    if(timer > 60){

        timer = 0;

        scanCore();
        scanPower();
    }

});

Events.on(EventType.ClientLoadEvent, e=>{
    Time.runTask(10, ()=>{
        drawUI();
    });
});
