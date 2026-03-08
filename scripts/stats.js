Events.on(ClientLoadEvent, e => {

    const button = new TextButton("Stats");

    button.clicked(() => {

        const dialog = new BaseDialog("Network Statistics");

        dialog.cont.add("Mod loaded successfully").row();

        dialog.addCloseButton();
        dialog.show();

    });

    Vars.ui.hudGroup.addChild(button);
    button.setSize(120,50);
    button.setPosition(20,120);

});
