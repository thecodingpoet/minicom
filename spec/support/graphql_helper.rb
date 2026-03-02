# frozen_string_literal: true

module GraphqlHelper
  def execute_graphql(query:, variables: {}, context: {})
    MinicomSchema.execute(query, variables: variables, context: context)
  end

  def auth_headers(user)
    token = JsonWebToken.encode(user_id: user.id)
    { "Authorization" => "Bearer #{token}" }
  end
end

RSpec.configure do |config|
  config.include GraphqlHelper
end
