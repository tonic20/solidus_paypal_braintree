module BraintreeCheckoutHelper
  def paypal_button_preference(key, store:)
    store.braintree_configuration.preferences[key]
  end

  def braintree_script(name, opts = {})
    content_tag(:script, nil, { src: "https://js.braintreegateway.com/web/3.76.2/js/#{name}.min.js" }.merge!(opts))
  end
end
