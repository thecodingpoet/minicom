# frozen_string_literal: true

require "rails_helper"

RSpec.describe TicketPolicy do
  subject { described_class }

  let(:customer) { create(:user, :customer) }
  let(:other_customer) { create(:user, :customer) }
  let(:agent) { create(:user, :agent) }
  let(:ticket) { create(:ticket, customer: customer) }

  permissions :create? do
    it { is_expected.to permit(customer, Ticket) }
    it { is_expected.not_to permit(agent, Ticket) }
  end

  permissions :show? do
    it { is_expected.to permit(agent, ticket) }
    it { is_expected.to permit(customer, ticket) }
    it { is_expected.not_to permit(other_customer, ticket) }
  end

  permissions :assign? do
    it { is_expected.to permit(agent, ticket) }
    it { is_expected.not_to permit(customer, ticket) }
  end

  permissions :update_status? do
    it { is_expected.to permit(agent, ticket) }
    it { is_expected.not_to permit(customer, ticket) }
  end

  permissions :comment? do
    it { is_expected.to permit(agent, ticket) }
    it { is_expected.to permit(customer, ticket) }
    it { is_expected.not_to permit(other_customer, ticket) }
  end

  describe TicketPolicy::Scope do
    describe "#resolve" do
      it "returns an empty relation when user is nil" do
        resolved = described_class.new(nil, Ticket.all).resolve
        expect(resolved.count).to eq(0)
      end

      it "returns all tickets for an agent" do
        create_list(:ticket, 2)
        resolved = described_class.new(agent, Ticket.all).resolve
        expect(resolved.count).to eq(2)
      end

      it "returns only tickets belonging to the customer" do
        own_ticket = create(:ticket, customer: customer)
        create(:ticket)

        resolved = described_class.new(customer, Ticket.all).resolve
        expect(resolved).to contain_exactly(own_ticket)
      end
    end
  end
end
