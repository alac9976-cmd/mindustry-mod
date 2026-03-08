let production = {};
let powerProduced = 0;
let powerUsed = 0;

function resetStats(){
    production = {};
    powerProduced = 0;
    powerUsed = 0;
}

function addProduction(item,amount){
    if(production[item.id]==null){
        production[item.id]=0;
    }
    production[item.id]+=amount;
}

function scanBuildings(){

    resetStats();

    const team = Vars.player.team();

    // chỉ quét building thay vì tile
    Vars.indexer.getAll(team).each(build=>{

        const block = build.block;

        // DRILL
        if(block instanceof Drill){

            const item = build.dominantItem;

            if(item!=null){
                addProduction(item, build.lastDrillSpeed);
            }

        }

        // FACTORY
        if(block instanceof GenericCrafter){

            const output = block.outputItem;

            if(output!=null){
                addProduction(output.item,1/block.craftTime);
            }

        }

        // POWER
        if(block.powerProduction>0){
            powerProduced+=block.powerProduction;
        }

        if(block.consumesPower){
            powerUsed+=block.consumesPower.capacity;
        }

    });

}

// cập nhật mỗi 3 giây thay vì 1
Timer.schedule(()=>{
    scanBuildings();
},3,3);

Events.on(ClientLoadEvent,e=>{

    const button = new TextButton("Stats");

    button.clicked(()=>{

        const dialog = new BaseDialog("Production Statistics");

        dialog.cont.pane(table=>{

            table.update(()=>{

                table.clear();

                table.add("[accent]Power").row();
                table.add("Produced: "+powerProduced.toFixed(1)).row();
                table.add("Used: "+powerUsed.toFixed(1)).row();
                table.row();

                Vars.content.items().each(item=>{

                    const value = production[item.id] || 0;

                    if(value>0){

                        table.add(item.localizedName+" "+(value*60).toFixed(1)+"/min").left().row();

                    }

                });

            });

        }).size(500,400);

        dialog.addCloseButton();
        dialog.show();

    });

    Vars.ui.hudGroup.addChild(button);
    button.setSize(120,50);
    button.setPosition(20,120);

});
