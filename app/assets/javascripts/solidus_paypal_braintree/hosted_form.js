SolidusPaypalBraintree.HostedForm = function(paymentMethodId) {
  this.paymentMethodId = paymentMethodId;
  this.client = null;
};

SolidusPaypalBraintree.HostedForm.prototype.initialize = function() {
  this.client = SolidusPaypalBraintree.createClient({paymentMethodId: this.paymentMethodId});
  return this.client.initialize().
    then(this._createHostedFields.bind(this));
};

SolidusPaypalBraintree.HostedForm.prototype._createHostedFields = function () {
  if (!this.client) {
    throw new Error("Client not initialized, please call initialize first!");
  }

  var opts = {
    client: this.client.getBraintreeInstance(),

    styles: {
      // styles for input fields
      //https://developers.braintreepayments.com/guides/hosted-fields/styling/javascript/v3
      "input": {
        "font-size": "14px",
        "font-family": "'CentraNo2', sans-serif"
      },
      "input::-webkit-input-placeholder": {
        "color": "transparent"
      },
      "input:-ms-input-placeholder": {
        "color": "transparent"
      },
      "input::-ms-input-placeholder": {
        "color": "transparent"
      },
      "input::-moz-placeholder": {
        "color": "transparent"
      },
      "input::placeholder": {
        "color": "transparent"
      },
      ".expirationDate::-webkit-input-placeholder": {
        "color": "#80325b",
        "padding-top": "30px"
      },
      ".expirationDate:-ms-input-placeholder": {
        "color": "#80325b",
        "padding-top": "30px"
      },
      ".expirationDate::-ms-input-placeholder": {
        "color": "#80325b",
        "padding-top": "30px"
      },
      ".expirationDate::-moz-placeholder": {
        "color": "#80325b",
        "padding-top": "30px"
      },
      ".expirationDate::placeholder": {
        "color": "#80325b",
        "padding-top": "30px"
      },
      "input:not(:placeholder-shown)": {
        "color": "#80325b",
        "padding-top": "30px"
      }
    },

    fields: {
      number: {
        selector: "#card_number" + this.paymentMethodId,
        placeholder: "Card number"
      },

      cvv: {
        selector: "#card_code" + this.paymentMethodId,
        placeholder: "Card code"
      },

      expirationDate: {
        selector: "#card_expiry" + this.paymentMethodId,
        placeholder: "MM / YY",
      }
    }
  };

  return SolidusPaypalBraintree.PromiseShim.convertBraintreePromise(braintree.hostedFields.create, [opts]);
};
