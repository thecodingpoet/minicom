# frozen_string_literal: true

require "rails_helper"

RSpec.describe UserPolicy do
  subject { described_class }

  let(:agent) { create(:user, :agent) }
  let(:customer) { create(:user, :customer) }

  permissions :agent_access? do
    it { is_expected.to permit(agent, agent) }
    it { is_expected.not_to permit(customer, customer) }
  end
end
