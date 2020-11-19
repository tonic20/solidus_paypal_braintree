SolidusPaypalBraintree.HostedForm = function(paymentMethodId) {
  this.paymentMethodId = paymentMethodId;
  this.client = null;
};

SolidusPaypalBraintree.HostedForm.prototype.initialize = function() {
  this.client = SolidusPaypalBraintree.createClient({
    paymentMethodId: this.paymentMethodId,
    useThreeDSecure: (typeof(window.threeDSecureOptions) !== 'undefined'),
  });

  return this.client.initialize().
    then(this._createHostedFields.bind(this));
};

SolidusPaypalBraintree.HostedForm.prototype._createHostedFields = function() {
  if (!this.client) {
    throw new Error("Client not initialized, please call initialize first!");
  }

  var opts = {
    _solidusClient: this.client,
    client: this.client.getBraintreeInstance(),

    styles: {
      // styles for input fields
      //https://developers.braintreepayments.com/guides/hosted-fields/styling/javascript/v3
      input: {
        "font-size": "14px",
        "font-family": "sans-serif",
        "color": "#262626"
      },
      "input::-webkit-input-placeholder": {
        color: "#262626",
        "padding-top": "30px"
      },
      "input:-ms-input-placeholder": {
        color: "#262626",
        "padding-top": "30px"
      },
      "input::-ms-input-placeholder": {
        color: "#262626",
        "padding-top": "30px"
      },
      "input::-moz-placeholder": {
        color: "#262626",
        "padding-top": "30px"
      },
      "input::placeholder": {
        color: "#262626",
        "padding-top": "30px"
      },
      "input:not(:placeholder-shown)": {
        color: "#262626",
        "padding-top": "30px"
      }
    },

    fields: {
      number: {
        selector: "#card_number" + this.paymentMethodId,
        placeholder: "Credit Card Number"
      },

      cvv: {
        selector: "#card_code" + this.paymentMethodId,
        placeholder: "CVV"
      },

      expirationDate: {
        selector: "#card_expiry" + this.paymentMethodId,
        placeholder: "MM / YY"
      }
    }
  };

  return SolidusPaypalBraintree.PromiseShim.convertBraintreePromise(
    braintree.hostedFields.create,
    [opts]
  );
};
