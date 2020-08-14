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
    if (mode == 'view') {
      $('#copy-filename').hide();
      $('#sugg-file-label').hide();
      $('#suggested-filename').hide();
      document.getElementById('grid-container').classList.add('-toggled');
    } else if (mode == 'edit') {
      $('#copy-filename').show();
      $('#sugg-file-label').show();
      $('#suggested-filename').show();
      document.getElementById('grid-container').classList.remove('-toggled');
    }
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
    // return this.parent_class.test_data();
  },

  is_valid: function (b_suppress_message) {
    //called when the user hits the save button, to allow for form validation.
    //returns an array of dom elements that are not valid - default is those elements marked as mandatory
    // that have no data in them.
    //You can modify this method, to highlight bad form elements etc...
    //LA calls this method with b_suppress_message and relies on your code to communicate issues to the user
    //Returning an empty array [] or NULL equals no error
    //TO DO write code specific to your form
    console.log(this.parent_class.is_valid(b_suppress_message));
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

  pad: function (n) {
    // Pads 1-digit values two 2-digits with 0s.
    // Used for padding 1-digit month and day values
    // Value is incremented since JS starts at 0 for day & month
    n++;
    n = n + '';
    return n.length == 2 ? n : '0' + n;
  },

  copy_filename: function () {
    // Copies the suggested filename to the clipboard for the user
    var copied_text = document.getElementById('suggested-filename');
    copied_text.select();
    document.execCommand('copy');
  },

  get_filename: function (
    project,
    researchers,
    experiment_date,
    experiment_id,
    default_msg
  ) {
    // Returns the suggested filename if all elements are valid
    // Date must not invalid and other fields must not be blank

    if (my_widget_script.is_valid_date(experiment_date)) {
      var year = '' + experiment_date.getFullYear();
      var file_date =
        '' +
        year.slice(-2) +
        my_widget_script.pad(experiment_date.getMonth()) +
        my_widget_script.pad(experiment_date.getDate());
    } else {
      return default_msg;
    }
    if (
      /^\s*$/.test(researchers) ||
      /^\s*$/.test(project) ||
      /^\s*$/.test(experiment_id)
    ) {
      return default_msg;
    }
    researchers = researchers.replace(/\s*,\s*|\s+/g, '_');
    return project + '_' + researchers + '_' + file_date + '_' + experiment_id;
  },

  is_valid_date: function (d) {
    // Checks if the parameter is a valid date object and contains correct data
    return d instanceof Date && !isNaN(d);
  },
};
$(document).ready(function () {
  // Default value for filename set
  var default_msg = 'Please fill out all information above';
  $('#suggested-filename')
    .val(default_msg)
    .css({ color: 'gray', 'font-style': 'italic' });

  // User begins inputting information
  $('input').on('input', function () {
    var experiment_date = new Date(
      document.getElementById('experiment-date').value
    );
    var project = $('#project').val();
    var researchers = $('#researchers').val();
    var experiment_id = $('#experiment-id').val();

    // Create suggested filename in form [Project]_[Researcher]_[Date]_[Exp ID]
    var filename = my_widget_script.get_filename(
      project,
      researchers,
      experiment_date,
      experiment_id,
      default_msg
    );
    if (filename != default_msg) {
      $('#suggested-filename')
        .val(filename)
        .css({ color: 'black', 'font-style': 'normal' });
    } else {
      $('#suggested-filename')
        .val(default_msg)
        .css({ color: 'gray', 'font-style': 'italic' });
    }
  });
});
