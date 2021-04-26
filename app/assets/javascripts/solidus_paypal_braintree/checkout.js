//= require solidus_paypal_braintree/frontend

$(function() {
  /* This provides a default error handler for Braintree. Since we prevent
   * submission if tokenization fails, we need to manually re-enable the
   * submit button. */
  function braintreeError (err) {
    SolidusPaypalBraintree.config.braintreeErrorHandle(err);
    handleBraintreeErrors(err);
    if (!(err.status && err.status >= 400)) enableSubmit();
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
        var $ccType = $("#payment_source_cc_type", $field);
        var $lastDigits = $("#payment_source_last_digits", $field);
        var $deviceData = $('#payment_source_device_data', $field);
        var $3dsAuthId = $('#payment_source_three_d_secure_authentication_id', $field);

        if ($nonce.length > 0 && $nonce.val() === "") {
          var client = braintreeForm._merchantConfigurationOptions._solidusClient;

          event.preventDefault();
          disableSubmit();

          var cardholderName = $paymentForm.find('#cardholderNameContainer');
          var cardholderValue = cardholderName.find('input').val();
          braintreeForm.tokenize({
            cardholderName: cardholderValue
          }, function(error, payload) {
            if (error) {
              if (cardholderValue.length == 0 && typeof error.details !== 'undefined') {
                error.details.invalidFieldKeys.push("cardholderName");
                error.details.invalidFields["cardholderName"] = cardholderName[0];
              }
              braintreeError(error);
              return;
            }

            if (cardholderValue.length == 0) {
              error = {
                name: "BraintreeError",
                code: "HOSTED_FIELDS_FIELDS_INVALID",
                message: BraintreeError.HOSTED_FIELDS_FIELDS_INVALID,
                type: "CUSTOMER",
                details: {
                  invalidFieldKeys: ["cardholderName"],
                  invalidFields: {
                    cardholderName: cardholderName[0]
                  }
                }
              };
              braintreeError(error);
              return
            }

            $nonce.val(payload.nonce);
            $ccType.val(payload.details.cardType);
            $lastDigits.val(payload.details.lastFour);

            if (!client.useThreeDSecure) {
              $paymentForm.submit();
              return;
            }

            client._createDataCollector().then(function(dataCollector) {
              $deviceData.val(dataCollector.deviceData);

              var checkout3DConfig = Object.assign(JSON.parse(JSON.stringify(threeDSecureOptions)), {
                nonce: payload.nonce,
                bin: payload.details.bin,
                onLookupComplete: function(data, next) {
                  next();
                }
              });

              client._threeDSecureInstance.verifyCard(checkout3DConfig, function(error, response) {
                if (error === null && (!response.liabilityShiftPossible || response.liabilityShifted)) {
                  $nonce.val(response.nonce);
                  $3dsAuthId.val(response.threeDSecureInfo.threeDSecureAuthenticationId);
                  $paymentForm.submit();
                } else {
                  $nonce.val('');
                  braintreeError(error || { code: 'THREEDS_AUTHENTICATION_FAILED' });
                }
              });
            });
          });
        }
      }
    });

    braintreeForm.on('focus', function (event) {
      var field = event.fields[event.emittedBy];
      $(field.container).removeClass('invalid')
    });

    braintreeForm.on('empty', function (event) {
      var field = event.fields[event.emittedBy];
      if (!field.isFocused) {
        $(field.container).removeClass('invalid');
      }
    });
  }

  function handleBraintreeErrors(errors) {
    var fields = Object.values((errors.details && errors.details.invalidFields) || {});
    if (fields.length === 0) {
      fields = $hostedFields.find('.input').toArray();
      fields.push($paymentForm.find('#cardholderNameContainer'));
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
