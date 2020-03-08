class AddEmailToBraintreeSources < ActiveRecord::Migration[4.2]
  def change
    add_column :solidus_paypal_braintree_sources, :email, :string
  end
end
