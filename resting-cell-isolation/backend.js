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

    // Populates the drug stock units select
    for (var i = 0; i < my_widget_script.drug_units.length; i++) {
      $('select.drug-stock-units').append(
        '<option value="' +
          i +
          '">' +
          my_widget_script.drug_units[i]['1'] +
          '</option>'
      );
    }

    this.parent_class.init(mode, json_data);

    // Recalculates the results when the page is displayed.
    // Otherwise, upon saving the widget to the page, the data will disappear
    if (my_widget_script.is_valid()) {
      // Update the default values of the inputs so that they display properly for printing
      $(':text').each(function () {
        $(this).attr('value', $(this).val());
      });

      // When user selects drug stock units, update the final units select with appropriate choices
      $('.drug-stock-units').each(function () {
        var stock_units_select = $(this);
        var final_units_select = stock_units_select
          .closest('tr')
          .find('select.drug-final-units');

        // Populate the final units with the appropriate choices based on the stock unit selection
        my_widget_script.populate_final_units(
          stock_units_select,
          final_units_select
        );
      });

      my_widget_script.cell_isolation();
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

  // Calculates the average count for all manual counts
  // Default is 8 squares counted, but this allows for removal of one or more
  // of the counts in case a number needs to be tossed
  manual_count_average: function (counts) {
    var total_count = 0;
    var num_counts = 0;
    var average_count;

    for (var i = 0; i < counts.length; i++) {
      var count = parseInt(counts.item(i).value);

      if (!isNaN(count)) {
        total_count += count;
        num_counts += 1;
      }
    }

    average_count = total_count / num_counts;

    return average_count;
  },

  // Formats a volume result depending on the magnitude of the result
  //	If the volume is 1 ml or greater, it will format it in mls
  //	If less than a ml, it will format it in µls
  //	Also displays units in mls or µls
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

  // Acceptable units for drug stocks and their corresponding final units
  // The multiplier is used to convert the stock and final concentrations to equivalent units
  drug_units: [
    //{units multiplier:stock unit, units multiplier:acceptable final units}
    { 1: 'g/ml', 1000: 'mg/ml', 1000000: 'µg/ml', 1000000000: 'ng/ml' },
    { 1: 'mg/ml', 1000: 'µg/ml', 1000000: 'ng/ml' },
    { 1: 'µg/ml', 1000: 'ng/ml' },
    { 1: 'ng/ml' },
    { 1: 'M', 1000: 'mM', 1000000: 'µM', 1000000000: 'nM' },
    { 1: 'mM', 1000: 'µM', 1000000: 'nM' },
    { 1: 'µM', 1000: 'nM' },
    { 1: 'nM' },
  ],

  // Depending on the selected drug stock units, the final units select will be
  // populated with the acceptable units to which the stock can be diluted to
  populate_final_units: function (drug_stock_units, drug_final_units) {
    var stock_units = parseFloat(drug_stock_units.val());
    var length = drug_final_units.length;

    // Resets the final units select box
    for (var i = 0; i < length; i++) {
      drug_final_units.children().remove(0);
    }

    // Populates the final units select box with acceptable units from drug_units[]
    // Value is the multiplier to convert to the same units
    drug_final_units.append('<option value="select">[Select]</option>');
    for (key in my_widget_script.drug_units[stock_units]) {
      drug_final_units.append(
        '<option value="' +
          key +
          '">' +
          my_widget_script.drug_units[stock_units][key] +
          '</option>'
      );
    }

    // If data already set from initial data entry, then keep the same information
    var final_units_hidden = drug_final_units
      .closest('tr')
      .find('.drug-final-hidden');
    if (final_units_hidden.val() != '') {
      drug_final_units.val(final_units_hidden.val());
    }
  },

  // Display the result of a calculation
  // 	If volume, format it with volume_format function
  // 	If not volume, display result directly
  // 	Otherwise display an empty string
  display_result: function (result, selector, isVolume = true) {
    if (!isNaN(result) && isVolume) {
      selector.html(my_widget_script.volume_format(result));
    } else if (!isNaN(result) && !isVolume) {
      selector.html(parseFloat(result.toFixed(3)));
    } else {
      selector.html('');
    }
  },

  // Based on the concentration of the cell stock, the amounts of cells & buffers for each
  // item are calculated.
  cell_calculations: function (concentration) {
    $('.cell-calculation').each(function () {
      var cells_needed = parseFloat($(this).find('.cells-needed').val());
      var total_volume = parseFloat($(this).find('.total-volume').val());
      var num_aliquots = parseFloat($(this).find('.num-aliquots').val());

      // Determining cell volumes & buffer volumes
      var volume_cells = cells_needed / concentration;
      var buffer_volume = total_volume - volume_cells;

      if (!isNaN(num_aliquots) || $(this).hasClass('drug-calculation')) {
        my_widget_script.display_result(
          volume_cells,
          $(this).find('.volume-cells')
        );
        my_widget_script.display_result(
          buffer_volume,
          $(this).find('.buffer-volume')
        );
      } else {
        my_widget_script.display_result(
          NaN,
          $(this).find('.volume-cells'),
          false
        );
        my_widget_script.display_result(
          NaN,
          $(this).find('.buffer-volume'),
          false
        );
      }

      // Determine cells remaining for final culture
      var rCD4_volume = parseFloat($(this).find('#rcd4-volume').val());
      var rCD4_needed = rCD4_volume * concentration;

      my_widget_script.display_result(
        rCD4_needed,
        $(this).find('#rcd4-needed'),
        false
      );
    });
  },

  freeze_calculations: function (concentration) {
    $('.freeze-calculation').each(function () {
      // Determining cell volumes
      var cells_needed = parseFloat($(this).find('.cells-needed').val());
      var volume_cells = cells_needed / concentration;

      my_widget_script.display_result(
        volume_cells,
        $(this).find('.volume-cells')
      );

      // Determining FBS/DMSO volumes for freezing
      var cells_per_tube = parseFloat($(this).find('.cells-per-tube').val());
      var vol_per_tube = parseInt($(this).find('.vol-per-tube').val());
      var num_tubes = cells_needed / cells_per_tube;
      var fbs_volume = (num_tubes * vol_per_tube) / 2;
      var dmso_volume = fbs_volume;

      my_widget_script.display_result(fbs_volume, $(this).find('.fbs-volume'));
      my_widget_script.display_result(
        dmso_volume,
        $(this).find('.dmso-volume')
      );
      my_widget_script.display_result(
        num_tubes,
        $(this).find('.num-tubes'),
        false
      );
    });
  },

  // Calculates the amounts of reagents needed for culture flasks
  drug_calculation: function () {
    $('.drug-calculation').each(function () {
      var drug_stock = parseFloat($(this).find('.drug-stock').val());
      var drug_final = parseFloat($(this).find('.drug-final').val());

      // Since there are 3 reagents associated with 1 flask, it is necessary to find to find
      // the associated volume of media required.
      // If calculating IL-2, the first query will work
      // Otherwise, media volume will be searched for based on isNaN status
      var media_volume = parseFloat($(this).find('.media-volume').val());
      if (isNaN(media_volume)) {
        media_volume = $(this)
          .prev('.drug-calculation:has(.media-volume)')
          .find('.media-volume')
          .val();

        if (isNaN(media_volume)) {
          var curr = $(this).prev('.drug-calculation');
          media_volume = curr
            .prev('.drug-calculation:has(.media-volume)')
            .find('.media-volume')
            .val();
        }
      }

      // If the drug units are in a span tag, the drug is IL-2 and no conversion is necessary
      // Therefore a multiplier of 1 is used
      // Otherwise, find the value of the select associated with the drug units
      var drug_stock_multiplier = $(this).find('.drug-final-units').is('span')
        ? 1
        : parseFloat($(this).find('.drug-final-units').val());

      var drug_volume =
        (media_volume * drug_final) / (drug_stock * drug_stock_multiplier);

      my_widget_script.display_result(
        drug_volume,
        $(this).find('.drug-volume')
      );
    });
  },

  // Main function for the widget
  cell_isolation: function () {
    // Calculate Cell Concentrations
    var volume_resuspended = parseFloat($('#volume-resuspended').val());

    // Determine Sysmex Concentration and Total Cells
    var sysmex_concentration = parseFloat($('#sysmex-concentration').val());
    var sysmex_dilution = parseInt($('#sysmex-dilution').val());
    var sysmex_final_concentration = sysmex_concentration * sysmex_dilution;
    // Concentration * volume cells resuspended in
    var sysmex_total_cells = sysmex_final_concentration * volume_resuspended;

    my_widget_script.display_result(
      sysmex_final_concentration,
      $('#sysmex-final-concentration'),
      false
    );
    my_widget_script.display_result(
      sysmex_total_cells,
      $('#sysmex-total-cells'),
      false
    );

    // Determine Manual Concentration and Total Cells
    var counts = document.getElementsByClassName('count');
    var manual_dilution = parseInt($('#manual-dilution').val());
    // Average count * volume of 1 square (10000) * dilution / 1e6
    var manual_cell_concentration =
      (my_widget_script.manual_count_average(counts) *
        10000 *
        manual_dilution) /
      1000000;
    // Concentration * volume cells resuspended in
    var manual_total_cells = manual_cell_concentration * volume_resuspended;

    my_widget_script.display_result(
      manual_cell_concentration,
      $('#manual-final-concentration'),
      false
    );
    my_widget_script.display_result(
      manual_total_cells,
      $('#manual-total-cells'),
      false
    );

    // Average Sysmex and Manual totals
    var average_cell_concentration =
      (sysmex_final_concentration + manual_cell_concentration) / 2;
    var average_cells = (sysmex_total_cells + manual_total_cells) / 2;
    my_widget_script.display_result(average_cells, $('#average-cells'), false);
    my_widget_script.display_result(
      average_cell_concentration,
      $('#average-cell-concentration'),
      false
    );

    // Calculating cell volumes and buffer volumes and freeze calculations
    my_widget_script.cell_calculations(average_cell_concentration);
    my_widget_script.freeze_calculations(average_cell_concentration);

    // Determine total cells needed and calculate remaining cells
    var total_cells_needed = 0;
    $('.cell-calculation, .freeze-calculation').each(function () {
      var cells_needed = parseFloat($(this).find('.cells-needed').val());
      var num_aliquots = parseInt($(this).find('.num-aliquots').val());

      if (!isNaN(cells_needed)) {
        // Cell calculations must have a valid number of aliquots input by the user
        if (!isNaN(num_aliquots) && $(this).hasClass('cell-calculation')) {
          total_cells_needed += cells_needed * num_aliquots;
          // Freezing cells & cells in culture do not use num_aliquots variable
        } else if (
          $(this).hasClass('freeze-calculation') ||
          $(this).hasClass('drug-calculation')
        ) {
          total_cells_needed += cells_needed;
        }
      }
    });

    var rCD4_needed = parseFloat($('#rcd4-needed').text());
    var remaining_cells = average_cells - total_cells_needed;

    if (!isNaN(rCD4_needed)) {
      remaining_cells -= rCD4_needed;
    }

    my_widget_script.display_result(
      remaining_cells,
      $('#remaining-cells'),
      false
    );

    // Warning if negative amounts of cells remaining
    var remaining_cells_cell = $('#remaining-cells').parent();
    if (remaining_cells < 0) {
      remaining_cells_cell.css('background-color', 'red');
    } else {
      remaining_cells_cell.css('background-color', '#edf2f7');
    }

    // Determine amount of FBS and 20% DMSO/FBS needed for cells
    var total_fbs = 0;
    var total_dmso = 0;

    $('.freeze-calculation').each(function () {
      var num_tubes = parseInt($(this).find('.num-tubes').text());
      var vol_per_tube = parseInt($(this).find('.vol-per-tube').val());
      var fbs_volume = (num_tubes * vol_per_tube) / 2;
      var dmso_volume = fbs_volume;

      if (!isNaN(fbs_volume)) {
        total_fbs += fbs_volume;
        total_dmso += dmso_volume;
      }
    });

    my_widget_script.display_result(total_fbs, $('#total-fbs-volume'));
    my_widget_script.display_result(total_dmso, $('#total-dmso-volume'));

    // Calulate drug stock volumes for any cells placed in culture
    my_widget_script.drug_calculation();
  },
};

$(document).ready(function () {
  // When user selects drug stock units, update the final units select with appropriate choices
  $('.drug-stock-units').on('input', function () {
    var stock_units_select = $(this);
    var final_units_select = stock_units_select
      .closest('tr')
      .find('select.drug-final-units');

    // Update the multiplier with the select option value of the stock units
    // This will let the code know which units were selected when the page is saved
    // 	allowing the final units to be re-caculated on the fly
    //stock_units_select.attr("data-multiplier", parseFloat(stock_units_select.val()));

    // Populate the final units with the appropriate choices based on the stock unit selection
    my_widget_script.populate_final_units(
      stock_units_select,
      final_units_select
    );
  });

  $('.drug-final-units').on('input', function () {
    var final_units_select = $(this);
    var final_units_hidden = final_units_select
      .closest('tr')
      .find('.drug-final-hidden');

    // Update the hidden field with the select option value of the final units
    // This will let the code know which units were selected when the page is saved
    // 	allowing the drug volume calculation to be performed on the fly
    final_units_hidden.val(parseFloat(final_units_select.val()));
  });

  // On any input/change, calculate the data for the widget
  $('.input-change').on('input', function () {
    $(this).attr('value', $(this).val());
    my_widget_script.cell_isolation();
  });
});
