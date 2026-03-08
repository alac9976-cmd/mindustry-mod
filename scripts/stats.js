let production = {};
let history = {};
let powerProduced = 0;
let powerUsed = 0;
const historyLength = 60;

function resetStats(){
    production = {};
    powerProduced = 0;
    powerUsed = 0;
}

function addProduction(item, amount){
    if(production[item.id] == null){
        production[item.id] = 0;
    }
    production[item.id] += amount;
}

function scanWorld(){

    resetStats();

    const team = Vars.player.team();

    Vars.world.tiles.each(tile => {

        if(tile.build == null) return;

        const build = tile.build;

        if(build.team != team) return;

        const block = build.block;

        // DRILLS
        if(block instanceof Drill){
            const item = build.dominantItem;
            if(item != null){
                addProduction(item, build.lastDrillSpeed);
            }
        }

        // FACTORIES
        if(block instanceof GenericCrafter){
            const output = block.outputItem;
            if(output != null){
                addProduction(output.item, 1/block.craftTime);
            }
        }

        // POWER
        if(block.powerProduction > 0){
            powerProduced += block.powerProduction;
        }

        if(block.consumesPower){
            powerUsed += block.consumesPower.capacity;
        }

    });

}

Timer.schedule(()=>{

    scanWorld();

    Vars.content.items().each(item=>{

        if(history[item.id] == null){
            history[item.id] = [];
        }

        history[item.id].push(production[item.id] || 0);

        if(history[item.id].length > historyLength){
            history[item.id].shift();
        }

    });

},1,1);

function drawGraph(table,item){

    const data = history[item.id];
    if(data == null) return;

    const canvas = new Element();

    canvas.draw = ()=>{

        if(data.length < 2) return;

        Draw.color(Color.green);

        for(let i=1;i<data.length;i++){

            let x1=(i-1)*5;
            let y1=data[i-1]*3;

            let x2=i*5;
            let y2=data[i]*3;

            Lines.line(x1,y1,x2,y2);

        }

        Draw.color();

    };

    table.add(canvas).size(300,80).row();
}

function buildItemsTab(table){

    Vars.content.items().each(item=>{

        const value = production[item.id] || 0;

        if(value > 0){

            table.add(item.localizedName + "  " + (value*60).toFixed(1)+"/min").left().row();
            drawGraph(table,item);
            table.row();

        }

    });

}

function buildPowerTab(table){

    table.add("[accent]Power Statistics").row();

    table.add("Produced: " + powerProduced.toFixed(1)).row();
    table.add("Consumed: " + powerUsed.toFixed(1)).row();

    let balance = powerProduced - powerUsed;

    table.add("Balance: " + balance.toFixed(1)).row();

}

Events.on(ClientLoadEvent,e=>{

    const button = new TextButton("Stats");

    button.clicked(()=>{

        const dialog = new BaseDialog("Network Statistics");

        const tabs = new Table();

        const content = new Table();

        function showItems(){
            content.clear();
            buildItemsTab(content);
        }

        function showPower(){
            content.clear();
            buildPowerTab(content);
        }

        tabs.button("Items",showItems).size(100,40);
        tabs.button("Power",showPower).size(100,40);

        dialog.cont.add(tabs).row();

        dialog.cont.pane(content).size(600,400);

        showItems();

        dialog.addCloseButton();
        dialog.show();

    });

    Vars.ui.hudGroup.addChild(button);
    button.setSize(120,50);
    button.setPosition(20,120);

});
