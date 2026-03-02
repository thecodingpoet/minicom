# frozen_string_literal: true

require "rails_helper"

RSpec.describe JsonWebToken do
  describe ".encode" do
    it "returns a valid JWT string" do
      token = described_class.encode(user_id: 123)
      expect(token).to be_a(String)
      expect(token.split(".").size).to eq(3)
    end

    it "encodes the payload" do
      token = described_class.encode(user_id: 456)
      decoded = described_class.decode(token)
      expect(decoded[:user_id]).to eq(456)
      expect(decoded[:exp]).to be_present
    end
  end

  describe ".decode" do
    it "decodes a valid token" do
      token = described_class.encode(user_id: 789)
      result = described_class.decode(token)
      expect(result).to be_a(HashWithIndifferentAccess)
      expect(result[:user_id]).to eq(789)
    end

    it "returns nil for invalid token" do
      expect(described_class.decode("invalid.token.here")).to be_nil
    end

    it "returns nil for malformed token" do
      expect(described_class.decode("not-a-jwt")).to be_nil
    end

    it "returns nil for expired token" do
      token = described_class.encode({ user_id: 1 }, 1.hour.ago)
      expect(described_class.decode(token)).to be_nil
    end
  end
end
