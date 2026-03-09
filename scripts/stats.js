let production = {};
let powerProduced = 0;
let powerUsed = 0;

function resetStats(){
    production = {};
    powerProduced = 0;
    powerUsed = 0;
}

function addProduction(item, amount){
    if(!item) return;

    if(production[item.id] == null){
        production[item.id] = 0;
    }

    production[item.id] += amount;
}

function scanBuildings(){

    if(!Vars.state || !Vars.state.isGame()) return;
    if(!Vars.player) return;

    const team = Vars.player.team();
    if(!team) return;

    const data = team.data();
    if(!data) return;

    resetStats();

    data.buildings.each(build=>{

        if(!build) return;

        const block = build.block;
        if(!block) return;

        // DRILL
        if(block instanceof Drill){

            const item = build.dominantItem;

            if(item && build.lastDrillSpeed){
                addProduction(item, build.lastDrillSpeed);
            }

        }

        // FACTORY
        if(block instanceof GenericCrafter){

            const output = block.outputItem;

            if(output){
                addProduction(output.item, 1 / block.craftTime);
            }

        }

        // POWER PRODUCED
        if(block.powerProduction > 0){
            powerProduced += block.powerProduction;
        }

        // POWER USED
        if(block.consumes){
            const power = block.consumes.getPower();

            if(power){
                powerUsed += power.usage;
            }
        }

    });
}

// quét mỗi 3 giây
Timer.schedule(()=>{
    scanBuildings();
},3,3);


// UI
Events.on(ClientLoadEvent, e=>{

    const button = new TextButton("Stats", Styles.defaultt);

    button.clicked(()=>{

        const dialog = new BaseDialog("Production Statistics");

        dialog.cont.pane(table=>{

            table.update(()=>{

                table.clear();

                table.add("[accent]Power Statistics").left().row();
                table.add("Produced: "+powerProduced.toFixed(1)).left().row();
                table.add("Used: "+powerUsed.toFixed(1)).left().row();

                table.row();

                table.add("[accent]Items / minute").left().row();

                Vars.content.items().each(item=>{

                    const value = production[item.id] || 0;

                    if(value > 0){
                        table.add(
                            item.localizedName + ": " +
                            (value*60).toFixed(1) + "/min"
                        ).left().row();
                    }

                });

            });

        }).size(520,420);

        dialog.addCloseButton();
        dialog.show();

    });

    Vars.ui.hudGroup.addChild(button);

    button.setSize(130,50);
    button.setPosition(20,120);

});
