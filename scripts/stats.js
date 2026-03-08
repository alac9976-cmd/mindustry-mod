Events.on(ClientLoadEvent, e => {

    const button = Vars.ui.hudGroup.button("Stats", () => {
        showStats();
    }).size(120, 50).get();

    button.setPosition(20, 120);

});

function showStats(){

    const dialog = new BaseDialog("Network Statistics");

    dialog.cont.pane(t => {

        const items = Vars.state.rules.defaultTeam.items();

        items.each((item, amount) => {
            t.add(item.localizedName + ": " + amount).row();
        });

    });

    dialog.addCloseButton();
    dialog.show();
}
