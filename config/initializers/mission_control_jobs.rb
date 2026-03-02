Rails.application.config.after_initialize do
  MissionControl::Jobs.http_basic_auth_user = ENV["MISSION_CONTROL_JOBS_USER"]
  MissionControl::Jobs.http_basic_auth_password = ENV["MISSION_CONTROL_JOBS_PASSWORD"]
end
