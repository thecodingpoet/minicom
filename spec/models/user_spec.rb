# frozen_string_literal: true

require "rails_helper"

RSpec.describe User, type: :model do
  subject { create(:user) }

  describe "validations" do
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email) }
    it { is_expected.to validate_presence_of(:first_name) }
    it { is_expected.to validate_presence_of(:last_name) }
    it { is_expected.to validate_presence_of(:role) }
    it { is_expected.to allow_value("user@example.com").for(:email) }
    it { is_expected.not_to allow_value("invalid").for(:email) }
  end

  describe "associations" do
    it { is_expected.to have_many(:tickets).with_foreign_key(:customer_id) }
    it { is_expected.to have_many(:assigned_tickets).class_name("Ticket").with_foreign_key(:assigned_agent_id) }
    it { is_expected.to have_many(:comments) }
  end

  describe "#full_name" do
    it "returns first and last name combined" do
      user = build(:user, first_name: "Jane", last_name: "Doe")
      expect(user.full_name).to eq("Jane Doe")
    end
  end

  describe "password" do
    it "requires password on create" do
      user = User.new(
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        role: :customer
      )
      expect(user).not_to be_valid
      expect(user.errors[:password]).to include("can't be blank")
    end

    it "authenticates with correct password" do
      user = create(:user, password: "secret123", password_confirmation: "secret123")
      expect(user.authenticate("secret123")).to eq(user)
    end

    it "rejects incorrect password" do
      user = create(:user, password: "secret123", password_confirmation: "secret123")
      expect(user.authenticate("wrong")).to be false
    end
  end
end
