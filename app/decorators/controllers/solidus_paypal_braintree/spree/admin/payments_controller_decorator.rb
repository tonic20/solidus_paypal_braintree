# frozen_string_literal: true

module SolidusPaypalBraintree
  module Spree
    module Admin
      module PaymentsControllerDecorator
        def self.prepended(base)
          base.helper :braintree_admin, ::SolidusPaypalBraintree::BraintreeCheckoutHelper
        end

        ::Spree::Admin::PaymentsController.prepend self
      end
    end
  end
end
