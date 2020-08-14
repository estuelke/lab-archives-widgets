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

  volume_format: function (volume) {
    if (!isNaN(volume)) {
      if (volume >= 1) {
        return volume.toFixed(3) + ' ml';
      } else {
        return (volume * 1000).toFixed(1) + ' µl';
      }
    } else {
      return '';
    }
  },

  cell_calculations: function (cell_type, concentration) {
    $(cell_type).each(function () {
      var cells_needed = parseFloat($(this).find('.cells-needed').val());
      var total_volume = parseFloat($(this).find('.total-volume').val());

      // Determining cell volumes for all calculations
      var volume_cells = cells_needed / concentration;
      $(this)
        .find('.volume-cells')
        .html(my_widget_script.volume_format(volume_cells));

      // Determining buffer volumes for non-freezing calculations
      var buffer_volume = total_volume - volume_cells;
      $(this)
        .find('.buffer-volume')
        .html(my_widget_script.volume_format(buffer_volume));

      // Determining FBS/DMSO volumes for freezing
      var num_tubes = parseInt($(this).find('.num-tubes').val());
      var vol_per_tube = parseInt($(this).find('.vol-per-tube').val());
      var fbs_volume = (num_tubes * vol_per_tube) / 2;
      var dmso_volume = fbs_volume;

      $(this)
        .find('.fbs-volume')
        .html(my_widget_script.volume_format(fbs_volume));
      $(this)
        .find('.dmso-volume')
        .html(my_widget_script.volume_format(dmso_volume));
    });
  },

  // Calculates the amounts of reagents needed for culture flasks
  drug_calculation: function () {
    $('.drug-calculation').each(function () {
      var drug_stock = parseFloat($(this).find('.drug-stock').val());
      var drug_final = parseFloat($(this).find('.drug-final').val());
      var drug_stock_units = $(this).find('.drug-stock-units').val();
      var drug_final_units = $(this).find('.drug-final-units').val();
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

      switch (drug_stock_units) {
        case 'mM':
          drug_final =
            drug_final_units == 'µM' ? drug_final / 1000 : drug_final / 1000000;
          break;
        case 'µM':
          drug_final = drug_final_units == 'nM' ? drug_final / 1000 : NaN;
          break;
        case 'nM':
          drug_final = drug_final_units == 'µM' ? NaN : NaN;
          break;
        default:
      }

      var drug_volume = (media_volume * drug_final) / drug_stock;

      $(this)
        .find('.drug-volume')
        .html(my_widget_script.volume_format(drug_volume));
    });
  },
};

$(document).ready(function () {
  $('.input-change').on('input', function () {
    // Determine Sysmex Concentration and Total Cells
    var sysmex_concentration = parseFloat($('#sysmex-concentration').val());
    var sysmex_dilution = parseInt($('#sysmex-dilution').val());
    var sysmex_final_concentration = sysmex_concentration * sysmex_dilution;
    var sysmex_total_pbmc = (sysmex_concentration * sysmex_dilution) / 10;

    $('#sysmex-final-concentration').html(
      sysmex_final_concentration.toFixed(2)
    );
    $('#sysmex-total-pbmc').html(sysmex_total_pbmc.toFixed(2));

    // Determine Manual Concentration and Total Cells
    var pbmc_counts = document.getElementsByClassName('pbmc');
    var manual_dilution = parseInt($('#manual-dilution').val());
    // Average count * volume of 1 square (10000) * dilution / 1e6
    var manual_pbmc_concentration =
      (my_widget_script.manual_count_average(pbmc_counts) *
        10000 *
        manual_dilution) /
      1000000;
    // Concentration * 100 ml / 1000 (to convert to 1e9)
    var manual_total_pbmc = (manual_pbmc_concentration * 100) / 1000;

    $('#manual-final-concentration').html(manual_pbmc_concentration.toFixed(2));
    $('#manual-total-pbmc').html(manual_total_pbmc.toFixed(2));

    // Average Sysmex and Manual totals
    var average_pbmc_concentration =
      (sysmex_final_concentration + manual_pbmc_concentration) / 2;
    var average_pbmc = (sysmex_total_pbmc + manual_total_pbmc) / 2;
    $('#average-pbmc').html(average_pbmc.toFixed(2));
    $('#average-pbmc-concentration').html(
      average_pbmc_concentration.toFixed(2)
    );

    // Calculating cell volumes and buffer volumes for PBMCs
    my_widget_script.cell_calculations(
      '.pbmc-cell-calculation',
      average_pbmc_concentration
    );

    // Determine total PBMCs needed and calculate remaining cells
    var total_pbmc_needed = 0;
    $('.pbmc-cell-calculation').each(function () {
      var cells_needed = parseFloat($(this).find('.cells-needed').val()) / 1000;
      var num_aliquots = parseInt($(this).find('.num-aliquots').val());

      if (!isNaN(cells_needed)) {
        if (!isNaN(num_aliquots)) {
          total_pbmc_needed += cells_needed * num_aliquots;
        } else {
          total_pbmc_needed += cells_needed;
        }
      }
    });
    var remaining_pbmc = average_pbmc - total_pbmc_needed;
    $('#remaining-pbmc').html(remaining_pbmc.toFixed(3));

    // Warning if negative amounts of PBMCs remaining
    var remaining_pbmc_cell = $('#remaining-pbmc').parent();
    if (remaining_pbmc < 0) {
      remaining_pbmc_cell.css('background-color', 'red');
    } else {
      remaining_pbmc_cell.css('background-color', '#edf2f7');
    }

    // Determine amount of FBS and 20% DMSO/FBS needed for PBMCs
    var total_fbs = 0;
    var total_dmso = 0;

    $('.pbmc-cell-calculation').each(function () {
      var num_tubes = parseInt($(this).find('.num-tubes').val());
      var vol_per_tube = parseInt($(this).find('.vol-per-tube').val());
      var fbs_volume = (num_tubes * vol_per_tube) / 2;
      var dmso_volume = fbs_volume;

      if (!isNaN(fbs_volume)) {
        total_fbs += fbs_volume;
        total_dmso += dmso_volume;
      }
    });

    $('#total-fbs-volume').html(my_widget_script.volume_format(total_fbs));
    $('#total-dmso-volume').html(my_widget_script.volume_format(total_dmso));

    my_widget_script.drug_calculation();
  });
});
