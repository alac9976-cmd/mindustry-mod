Events.on(ClientLoadEvent, e => {

    const button = new TextButton("Stats");

    button.clicked(() => {

        const dialog = new BaseDialog("Network Statistics");

        dialog.cont.pane(t => {

            const team = Vars.player.team();
            const items = team.items();

            Vars.content.items().each(item => {

                const amount = items.get(item);

                if(amount > 0){
                    t.add(item.localizedName + ": " + amount).row();
                }

            });

        }).size(400,300);

        dialog.addCloseButton();
        dialog.show();

    });

    Vars.ui.hudGroup.addChild(button);
    button.setSize(120,50);
    button.setPosition(20,120);

});
