my_widget_script = {
  init: function (mode, json_data) {
    //this method is called when the form is being constructed
    // parameters
    // mode = if it equals 'view' than it should not be editable
    //        if it equals 'edit' then it will be used for entry
    //        if it equals 'view_dev' same as view,  does some additional checks that may slow things down in production
    //        if it equals 'edit_dev' same as edit,   does some additional checks that may slow things down in production

    // json_data will contain the data to populate the form with, it will be in the form of the data
    // returned from a call to to_json or empty if this is a new form.
    //By default it calls the parent_class's init.

    //TO DO write code specific to your form
    this.parent_class.init(mode, json_data);
    if (my_widget_script.is_valid()) {
      my_widget_script.calculate_setup();
    }
  },

  to_json: function () {
    //should return a json string containing the data entered into the form by the user
    //whatever is return from the method is persisted in LabArchives.  must not be binary data.
    //called when the user hits the save button, when adding or editing an entry

    //TO DO write code specific to your form
    return this.parent_class.to_json();
  },

  from_json: function (json_data) {
    //populates the form with json_data
    //TO DO write code specific to your form
    this.parent_class.from_json(json_data);
  },

  test_data: function () {
    //during development this method is called to populate your form while in preview mode
    //TO DO write code specific to your form
    //return this.parent_class.test_data();
  },

  is_valid: function (b_suppress_message) {
    //called when the user hits the save button, to allow for form validation.
    //returns an array of dom elements that are not valid - default is those elements marked as mandatory
    // that have no data in them.
    //You can modify this method, to highlight bad form elements etc...
    //LA calls this method with b_suppress_message and relies on your code to communicate issues to the user
    //Returning an empty array [] or NULL equals no error
    //TO DO write code specific to your form

    return this.parent_class.is_valid(b_suppress_message);
  },

  is_edited: function () {
    //should return true if the form has been edited since it was loaded or since reset_edited was called
    return this.parent_class.is_edited();
  },

  reset_edited: function () {
    //typically called have a save
    //TO DO write code specific to your form
    return this.parent_class.reset_edited();
  },

  reset_edited: function () {
    //typically called have a save
    //TO DO write code specific to your form
    return this.parent_class.reset_edited();
  },

  volume_format: function (volume) {
    if (!isNaN(volume)) {
      if (volume >= 1) {
        return parseFloat(volume.toFixed(3)) + ' ml';
      } else {
        return parseFloat((volume * 1000).toFixed(1)) + ' µl';
      }
    } else {
      return '';
    }
  },

  calculate_setup: function () {
    var resting_cell_stock = parseFloat($('#resting-cell-stock').val());
    var irradiated_cell_stock = parseFloat($('#irradiated-cell-stock').val());
    var pha_stock = parseFloat($('#pha-stock').val()) * 1000; // Convert stock to µg/ml
    var pha_final = parseFloat($('#pha-final').val());
    var il2_stock = parseFloat($('#il2-stock').val());
    var il2_final = parseFloat($('#il2-final').val());

    $('.setup-calculation').each(function () {
      var cell_dilution = parseFloat($(this).find('.cell-dilution').val());
      var wells = parseInt($(this).find('.wells').val());
      var vol_per_well = parseFloat($(this).find('.vol-per-well').val());

      // Calculate Results
      // All volumes in ml and converted to µl, if necessary, when displayed.
      // See volume_format:function()
      var resting_cells = (wells + 1) * cell_dilution;
      var resting_cell_volume = resting_cells / resting_cell_stock;
      var irradiated_cells = (wells + 1) * (cell_dilution * 5);
      var irradiated_cell_volume = irradiated_cells / irradiated_cell_stock;
      var total_volume = (wells + 1) * vol_per_well;
      var pha_volume = (total_volume * pha_final) / pha_stock;
      var il2_volume = (total_volume * il2_final) / il2_stock;
      var cIMDM_volume =
        total_volume -
        (resting_cell_volume +
          irradiated_cell_volume +
          pha_volume +
          il2_volume);

      // Display Results
      if (!isNaN(resting_cells)) {
        $(this)
          .find('.resting-cells')
          .html(parseFloat(resting_cells.toFixed(2)));
      }
      if (!isNaN(resting_cell_volume)) {
        $(this)
          .find('.resting-cell-volume')
          .html(my_widget_script.volume_format(resting_cell_volume));
      }
      if (!isNaN(irradiated_cells)) {
        $(this)
          .find('.irradiated-cells')
          .html(parseFloat(irradiated_cells.toFixed(2)));
      }
      if (!isNaN(irradiated_cell_volume)) {
        $(this)
          .find('.irradiated-cell-volume')
          .html(my_widget_script.volume_format(irradiated_cell_volume));
      }
      if (!isNaN(total_volume)) {
        $(this)
          .find('.total-volume')
          .html(my_widget_script.volume_format(total_volume));
      }
      if (!isNaN(pha_volume)) {
        $(this)
          .find('.pha-volume')
          .html(my_widget_script.volume_format(pha_volume));
      }
      if (!isNaN(il2_volume)) {
        $(this)
          .find('.il2-volume')
          .html(my_widget_script.volume_format(il2_volume));
      }
      if (!isNaN(cIMDM_volume)) {
        $(this)
          .find('.cIMDM-volume')
          .html(my_widget_script.volume_format(cIMDM_volume));
      }
    });
  },
};

$(document).ready(function () {
  $('.input-change').on('input', function () {
    my_widget_script.calculate_setup();
  });
});
