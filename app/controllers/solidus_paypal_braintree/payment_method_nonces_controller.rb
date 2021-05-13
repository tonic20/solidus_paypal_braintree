module SolidusPaypalBraintree
  class PaymentMethodNoncesController < ::Spree::Api::BaseController
    skip_before_action :authenticate_user

    def create
      result = gateway.generate_payment_method_nonce(source)

      if result.present?
        render json: { nonce: result.nonce, details: { bin: result.details[:bin] }}
      else
        render json: { error: 'Error fetching payment source nonce' }
      end
    end

    private

    def gateway
      @gateway ||= ::SolidusPaypalBraintree::Gateway.find_by!(id: params[:payment_method_id])
    end

    def source
      @source ||= ::SolidusPaypalBraintree::Source.find(params[:payment_source_id])
    end
  end
end
