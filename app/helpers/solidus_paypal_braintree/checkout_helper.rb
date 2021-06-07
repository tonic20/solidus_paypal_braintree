# frozen_string_literal: true

module SolidusPaypalBraintree
  module CheckoutHelper
    def braintree_3ds_options_for(object)
      ship_address = object.ship_address

      if ship_address
        additional_information = {
          shippingGivenName: ship_address.firstname,
          shippingSurname: ship_address.lastname,
          shippingPhone: ship_address.phone,
          shippingAddress: {
            streedAddress: ship_address.address1,
            extendedAddress: ship_address.address2,
            locality: ship_address.city,
            region: ship_address.state&.abbr,
            postalCode: ship_address.zipcode,
            countryCodeAlpha2: ship_address.country&.iso,
          }
        }
      else
        additional_information = {}
      end

      {
        nonce: nil, # populated after tokenization
        bin: nil, # populated after tokenization
        onLookupComplete: nil, # populated after tokenization
        amount: object.respond_to?(:total) ? object.total : '0.0',
        email: object.email,
        billingAddress: braintree_billing_address(object.bill_address),
        additionalInformation: additional_information,
        challengeRequested: true
      }
    end

    def braintree_billing_address(bill_address)
      return {} unless bill_address

      {
        givenName: bill_address.firstname,
        surname: bill_address.lastname,
        phoneNumber: bill_address.phone,
        streetAddress: bill_address.address1,
        extendedAddress: bill_address.address2,
        locality: bill_address.city,
        region: bill_address.state&.abbr,
        postalCode: bill_address.zipcode,
        countryCodeAlpha2: bill_address.country&.iso,
      }
    end

    def paypal_button_preference(key, store:)
      store.braintree_configuration.preferences[key]
    end

    def braintree_script(name, opts = {})
      content_tag(:script, nil, { src: "https://js.braintreegateway.com/web/3.76.2/js/#{name}.min.js" }.merge!(opts))
    end
  end
end
