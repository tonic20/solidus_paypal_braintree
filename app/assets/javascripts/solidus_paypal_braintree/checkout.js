//= require solidus_paypal_braintree/frontend

$(function() {
  /* This provides a default error handler for Braintree. Since we prevent
   * submission if tokenization fails, we need to manually re-enable the
   * submit button. */
  function braintreeError (err) {
    SolidusPaypalBraintree.config.braintreeErrorHandle(err);
    handleBraintreeErrors(err);
    enableSubmit();
  }

  function enableSubmit() {
    /* If we're using jquery-ujs on the frontend, it will automatically disable
     * the submit button, but do so in a setTimeout here:
     * https://github.com/rails/jquery-rails/blob/master/vendor/assets/javascripts/jquery_ujs.js#L517
     * The only way we can re-enable it is by delaying longer than that timeout
     * or stopping propagation so their submit handler doesn't run. */
    if ($.rails && typeof $.rails.enableFormElement !== 'undefined') {
      setTimeout(function () {
        $.rails.enableFormElement($submitButton);
        $submitButton.attr("disabled", false).removeClass("disabled").addClass("primary");
      }, 100);
    } else if (typeof Rails !== 'undefined' && typeof Rails.enableElement !== 'undefined') {
      /* Indicates that we have rails-ujs instead of jquery-ujs. Rails-ujs was added to rails
       * core in Rails 5.1.0 */
      setTimeout(function () {
        Rails.enableElement($submitButton[0]);
        $submitButton.attr("disabled", false).removeClass("disabled").addClass("primary");
      }, 100);
    } else {
      setTimeout(function () {
        $submitButton.attr("disabled", false).removeClass("disabled").addClass("primary");
      }, 100);
    }
  }

  function disableSubmit() {
    $submitButton.attr("disabled", true).removeClass("primary").addClass("disabled");
  }

  function addFormHook(braintreeForm, hostedField) {
    $paymentForm.on("submit",function(event) {
      var $field = $(hostedField);

      $field.find('.input').removeClass('invalid')

      if ($field.is(":visible") && !$field.data("submitting")) {
        var $nonce = $("#payment_method_nonce", $field);

        if ($nonce.length > 0 && $nonce.val() === "") {
          event.preventDefault();
          disableSubmit();

          var cardholderName = $paymentForm.find('#cardholder-name').val();
          braintreeForm.tokenize({
            cardholderName: cardholderName
          }, function(error, payload) {
            if (error) {
              braintreeError(error);
            } else {
              $nonce.val(payload.nonce);
              $paymentForm.submit();
            }
          });
        }
      }
    });

    braintreeForm.on('focus', function (event) {
      var field = event.fields[event.emittedBy];
      var label = findLabel(field);
      label.addClass('focused').siblings('.input').removeClass('invalid')
    });

    braintreeForm.on('blur', function (event) {
      var field = event.fields[event.emittedBy];
      var label = findLabel(field);
      if (field.isEmpty) {
        label.removeClass('focused');
      }
    });
    braintreeForm.on('empty', function (event) {
      var field = event.fields[event.emittedBy];
      if (!field.isFocused) {
        findLabel(field).removeClass('focused').siblings('.input').removeClass('invalid')
      }
    });
  }

  function findLabel(field) {
    return $hostedFields.find('label[for="' + field.container.id + '"]');
  }

  function handleBraintreeErrors(errors) {
    var fields = Object.values((errors.details && errors.details.invalidFields) || {});
    if (fields.length === 0) {
      fields = $hostedFields.find('.input').toArray();
    }
    fields.map(function (field) {
      $(field).addClass("invalid");
    })
  }

  var $paymentForm = $("#checkout_form_payment");
  var $hostedFields = $("[data-braintree-hosted-fields]");
  var $submitButton = $("input[type='submit']", $paymentForm);

  // If we're not using hosted fields, the form doesn't need to wait.
  if ($hostedFields.length > 0) {
    disableSubmit();

    var fieldPromises = $hostedFields.map(function(index, field) {
      var $this = $(this);
      var id = $this.data("id");

      var braintreeForm = new SolidusPaypalBraintree.createHostedForm(id);

      var formInitializationSuccess = function(formObject) {
        addFormHook(formObject, field);
      }

      return braintreeForm.initialize().then(formInitializationSuccess, braintreeError);
    });

    $.when.apply($, fieldPromises).done(enableSubmit);
  }
});
