class ApplicationController < ActionController::API
  require "new_relic/agent/instrumentation/rails4/action_controller"
  require "new_relic/agent/instrumentation/rails4/errors"

  include NewRelic::Agent::Instrumentation::ControllerInstrumentation
  include NewRelic::Agent::Instrumentation::Rails4::ActionController
  include NewRelic::Agent::Instrumentation::Rails4::Errors
end
