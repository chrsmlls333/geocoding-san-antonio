const UIhandling = {
  createMenu: function(ui) {
    ui.createMenu('Geocoding SA')
      .addItem('Process (Address Column)','singleColumnProcess')
      .addSeparator()
      .addItem('Help', 'UIhandling.helpDialog')
      .addItem('Set API key', 'APIhandling.setKey')
      .addItem('Delete API key', 'APIhandling.resetKey')
      // .addItem('Delete all credentials', 'deleteAll')
    .addToUi();
  },

  helpDialog: function() {
    ui.alert("Geocoding San Antonio", help, ui.ButtonSet.OK)
  }
}

const APIhandling = {
  API_KEY_ADDRESS: 'api.key',

  setKey: function() {
    var title = "Set Geocodio API Key"
    var text = 'Please provide your API key: \n(you may need to create an account)'
    var scriptValue = ui.prompt(title, text , ui.ButtonSet.OK);
    if (scriptValue.getSelectedButton() != "OK") return;
    if (!scriptValue.getResponseText()) throw 'API field was empty, value not updated.';
    userProperties.setProperty(this.API_KEY_ADDRESS, scriptValue.getResponseText());
  },

  getKey: function() {
    let key = userProperties.getProperty(this.API_KEY_ADDRESS);
    if (!key) throw 'You haven\'t set an API Key!'
    return key;
  },

  resetKey: function() {
    userProperties.deleteProperty(this.API_KEY_ADDRESS);
    ui.alert('Geocodio API key has been deleted.')
  }

  // function deleteAll(){
  //   userProperties.deleteAllProperties();
  //   ui.alert('Geocodio API key has been deleted.')
  // }
}

function onOpen() {
  UIhandling.createMenu(ui)
}
