SolidusPaypalBraintree = {
  APPLE_PAY_API_VERSION: 1,

  config: {
    paths: {
      clientTokens: Spree.pathFor('solidus_paypal_braintree/client_token'),
      paymentMethodNonce: Spree.pathFor('solidus_paypal_braintree/payment_method_nonce'),
      transactions: Spree.pathFor('solidus_paypal_braintree/transactions')
    },

    // Override to provide your own error messages.
    braintreeErrorHandle: function(braintreeError) {
      BraintreeError.getErrorFromSlug(braintreeError.code);
      SolidusPaypalBraintree.showError(error);
    },

    classes: {
      hostedForm: function() {
        return SolidusPaypalBraintree.HostedForm;
      },

      client: function() {
        return SolidusPaypalBraintree.Client;
      },

      paypalButton: function() {
        return SolidusPaypalBraintree.PaypalButton;
      },

      applepayButton: function() {
        return SolidusPaypalBraintree.ApplepayButton;
      }
    }
  },

  showError: function(error) {
    var $contentContainer = $(".braintree-hosted-fields");
    var $flash = $contentContainer.find('.alert');
    $flash.find('.alert-message').html(error);
    $flash.show();
  },

  createHostedForm: function() {
    return SolidusPaypalBraintree._factory(SolidusPaypalBraintree.config.classes.hostedForm(), arguments);
  },

  createClient: function() {
    return SolidusPaypalBraintree._factory(SolidusPaypalBraintree.config.classes.client(), arguments);
  },

  createPaypalButton: function() {
    return SolidusPaypalBraintree._factory(SolidusPaypalBraintree.config.classes.paypalButton(), arguments);
  },

  createApplePayButton: function() {
    return SolidusPaypalBraintree._factory(SolidusPaypalBraintree.config.classes.applepayButton(), arguments);
  },

  _factory: function(klass, args) {
    var normalizedArgs = Array.prototype.slice.call(args);
    return new (Function.prototype.bind.apply(klass, [null].concat(normalizedArgs)));
  }
};

BraintreeError = {
  DEFAULT: "Something bad happened!",

  getErrorFromSlug: function(slug) {
    error = BraintreeError.DEFAULT
    if (slug in BraintreeError)
      error = BraintreeError[slug]
    return error
  }
}
