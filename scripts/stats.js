let production = {};
let history = {};
let historyLength = 60;

function addProduction(item, amount){

    if(production[item.id] == null){
        production[item.id] = 0;
    }

    production[item.id] += amount;

}

function scanProduction(){

    production = {};

    const team = Vars.player.team();

    Vars.world.tiles.each(tile => {

        if(tile.build == null) return;

        const build = tile.build;

        if(build.team != team) return;

        const block = build.block;

        // DRILL
        if(block instanceof Drill){

            const item = build.dominantItem;

            if(item != null){

                addProduction(item, build.lastDrillSpeed);

            }

        }

        // FACTORY
        if(block instanceof GenericCrafter){

            const output = block.outputItem;

            if(output != null){

                addProduction(output.item, 1 / block.craftTime);

            }

        }

    });

}

// lưu history
Timer.schedule(() => {

    scanProduction();

    Vars.content.items().each(item => {

        if(history[item.id] == null){
            history[item.id] = [];
        }

        history[item.id].push(production[item.id] || 0);

        if(history[item.id].length > historyLength){
            history[item.id].shift();
        }

    });

}, 1, 1);

Events.on(ClientLoadEvent, e => {

    const button = new TextButton("Stats");

    button.clicked(() => {

        const dialog = new BaseDialog("Production Statistics");

        dialog.cont.pane(table => {

            table.update(() => {

                table.clear();

                Vars.content.items().each(item => {

                    const value = production[item.id] || 0;

                    if(value > 0){

                        table.add(item.localizedName).left().padRight(20);
                        table.add((value * 60).toFixed(1) + " /min");
                        table.row();

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
