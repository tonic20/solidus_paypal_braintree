if SolidusSupport.frontend_available?
  ::Spree::CheckoutController.helper ::SolidusPaypalBraintree::BraintreeCheckoutHelper, :braintree_checkout
  ::Spree::OrdersController.helper :braintree_checkout
end

if SolidusSupport.backend_available?
  ::Spree::Admin::PaymentsController.helper :braintree_admin, ::SolidusPaypalBraintree::BraintreeCheckoutHelper
end
