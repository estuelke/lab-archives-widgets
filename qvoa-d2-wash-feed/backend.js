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
};

$(document).ready(function () {
  $('.input-change').on('input', function () {
    var twelve_wells = parseInt($('#wells-12-num').val());
    var six_wells = parseInt($('#wells-6-num').val());

    // Media needed includes 2-well overage for each step for each well type and rounds up to the nearest 10
    var first_media = (twelve_wells + 2) * 3 + (six_wells + 2) * 6;
    var feeders_media = (twelve_wells + 2) * 2 + (six_wells + 2) * 6;
    var extra_feeders_media = twelve_wells + 2;
    var media_needed =
      Math.ceil((first_media + feeders_media + extra_feeders_media + 1) / 10) *
      10;

    if (!isNaN(media_needed)) {
      $('#media-needed').val(media_needed);
      // IL-2 values assume that the stock is 20000 and the final concentration is 5
      $('#il2-needed').val((media_needed / 4).toFixed(0));
    }

    // Calculations for first wash
    var wash_media_initial = Math.ceil(twelve_wells * 3 + six_wells * 6);
    var extra_media_initial = Math.ceil(twelve_wells);

    if (!isNaN(wash_media_initial)) {
      $('#wash-media-initial').val(wash_media_initial.toFixed(0));
      $('#extra-media-initial').val(extra_media_initial.toFixed(0));
    }

    var wash_overage = parseFloat($('#wash-overage').val());
    var wash_media_final = wash_media_initial + wash_overage;
    var wash_il2_stock_conc = parseFloat($('#wash-il2-stock-conc').val());
    var wash_il2_final_conc = parseFloat($('#wash-il2-final-conc').val());
    var wash_il2_to_add =
      ((wash_media_final * wash_il2_final_conc) / wash_il2_stock_conc) * 1000;
    var wash_media_to_add = wash_media_final - wash_il2_to_add / 1000;

    if (!isNaN(wash_media_to_add)) {
      $('#wash-media-final').val(wash_media_final.toFixed(0));
      $('#wash-media-to-add').val(wash_media_to_add.toFixed(1));
      $('#wash-il2-to-add').val(wash_il2_to_add.toFixed(2));
    }

    // Calculations for feeders
    var feeders_from_flask = parseFloat($('#feeders-from-flask').val());
    var feeders_volume = parseFloat($('#feeders-volume').val());
    var feed_final_conc = parseFloat($('#feed-final-conc').val());
    var feed_stock_conc = feeders_from_flask / feeders_volume;
    var feed_media_initial = Math.ceil(twelve_wells * 2 + six_wells * 6);
    var feed_overage = parseFloat($('#feed-overage').val());

    if (!isNaN(feed_stock_conc)) {
      $('#feed-overall-stock-conc').val(feed_stock_conc.toFixed(2));
      $('#feed-stock-conc').val(feed_stock_conc.toFixed(2));
      $('#feed-media-initial').val(feed_media_initial.toFixed(0));
    }

    var feed_media_final = feed_media_initial + feed_overage;
    var feed_feeders_to_add =
      (feed_final_conc * feed_media_final) / feed_stock_conc;
    var feed_il2_stock_conc = parseFloat($('#feed-il2-stock-conc').val());
    var feed_il2_final_conc = parseFloat($('#feed-il2-final-conc').val());
    var feed_il2_to_add =
      ((feed_media_final * feed_il2_final_conc) / feed_il2_stock_conc) * 1000;
    var feed_media_to_add =
      feed_media_final - feed_feeders_to_add - feed_il2_to_add / 1000;
    if (!isNaN(feed_media_to_add)) {
      if (feed_feeders_to_add > feeders_volume) {
        $('#feed-error-msg').css('visibility', 'visible');
        $('#feed-feeders-to-add').val('');
        $('#feed-media-to-add').val('');
        $('#feed-il2-to-add').val('');
      } else {
        $('#feed-error-msg').css('visibility', 'hidden');
        $('#feed-media-final').val(feed_media_final.toFixed(0));
        $('#feed-feeders-to-add').val(feed_feeders_to_add.toFixed(3));
        $('#feed-media-to-add').val(feed_media_to_add.toFixed(2));
        $('#feed-il2-to-add').val(feed_il2_to_add.toFixed(2));
      }
    }

    // Extra cIMDM calculations

    var extra_overage = parseFloat($('#extra-overage').val());
    var extra_media_final = extra_media_initial + extra_overage;
    var extra_il2_stock_conc = parseFloat($('#extra-il2-stock-conc').val());
    var extra_il2_final_conc = parseFloat($('#extra-il2-final-conc').val());
    var extra_il2_to_add =
      ((extra_media_final * extra_il2_final_conc) / extra_il2_stock_conc) *
      1000;
    var extra_media_to_add = extra_media_final - extra_il2_to_add / 1000;
    if (!isNaN(extra_media_to_add)) {
      $('#extra-media-final').val(extra_media_final.toFixed(0));
      $('#extra-media-to-add').val(extra_media_to_add.toFixed(1));
      $('#extra-il2-to-add').val(extra_il2_to_add.toFixed(2));
    }

    // Warnings for changing IL2 and Feeder Stock final concentrations
    if (feed_final_conc == 0.67) {
      $('#feed-final-conc').css('background-color', 'white');
    } else {
      $('#feed-final-conc').css('background-color', '#ffeb99');
    }

    var il2_stock_conc = [
      'wash-il2-stock-conc',
      'feed-il2-stock-conc',
      'extra-il2-stock-conc',
    ];
    var il2_final_conc = [
      'wash-il2-final-conc',
      'feed-il2-final-conc',
      'extra-il2-final-conc',
    ];
    var sLen = il2_stock_conc.length;
    var fLen = il2_final_conc.length;

    for (i = 0; i < sLen; i++) {
      if ($('#' + il2_stock_conc[i]).val() == 20000) {
        $('#' + il2_stock_conc[i]).css('background-color', 'white');
      } else {
        $('#' + il2_stock_conc[i]).css('background-color', '#ffeb99');
      }
    }

    for (i = 0; i < fLen; i++) {
      if ($('#' + il2_final_conc[i]).val() == 5) {
        $('#' + il2_final_conc[i]).css('background-color', 'white');
      } else {
        $('#' + il2_final_conc[i]).css('background-color', '#ffeb99');
      }
    }
  });
});
