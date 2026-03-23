# frozen_string_literal: true

require "rails_helper"

RSpec.describe TicketExportPolicy do
  subject { described_class }

  let(:agent) { create(:user, :agent) }
  let(:customer) { create(:user, :customer) }

  permissions :create? do
    it { is_expected.to permit(agent, TicketExport) }
    it { is_expected.not_to permit(customer, TicketExport) }
  end
end
