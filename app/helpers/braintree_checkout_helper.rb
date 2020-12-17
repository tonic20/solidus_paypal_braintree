module BraintreeCheckoutHelper
  def paypal_button_preference(key, store:)
    store.braintree_configuration.preferences[key]
  end

  def braintree_script(name, opts = {})
    content_tag(:script, nil, { src: "https://js.braintreegateway.com/web/3.69.0/js/#{name}.min.js" }.merge!(opts))
  end
end
