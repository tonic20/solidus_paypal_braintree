shared_context 'order ready for payment' do
  let!(:country) { create :country }

  let(:user) { create :user }
  let(:line_item) { create :line_item, price: 50 }
  let(:address) { create :address, country: country }

  let(:gateway) do
    described_class.create!(
      name: 'Braintree',
      auto_capture: true
    )
  end

  before do
    create :shipping_method, cost: 5
  end

  let(:order) do
    order = Spree::Order.create!(
      line_items: [line_item],
      email: 'test@example.com',
      bill_address: address,
      ship_address: address,
      user: user
    )

    order.update_totals
    expect(order.state).to eq "cart"

    # push through cart, address and delivery
    # its sadly unsafe to use any reasonable factory here accross
    # supported solidus versions
    order.next!
    order.next!
    order.next!

    expect(order.state).to eq "payment"
    order
  end
end
