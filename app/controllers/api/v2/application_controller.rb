class Api::V2::ApplicationController < ApplicationController
  include CanCan::ControllerAdditions

  before_filter :authenticate_with_token

  # before_filter :check_

  def authenticate_with_token
    head status: :unauthorized unless (token && Rails.cache.exist?(token))
  end

  def current_user
    loggedInUser = token && Rails.cache.fetch(token, expires_in: 15.minutes)

    if request.headers['EH-Masquerading-As']
      @employee = Employee.find(request.headers['EH-Masquerading-As'])

      return @employee if loggedInUser.can? :masquerade, @employee
    end

    loggedInUser
  end

  def token
    bearer = request.headers["HTTP_AUTHORIZATION"]
    # allows our tests to pass
    bearer ||= request.headers["rack.session"].try(:[], 'Authorization')

    if bearer.present?
      bearer.split.last
    else
      nil
    end
  end

  rescue_from CanCan::AccessDenied do |exception|
    render json: exception.message, status: :forbidden
  end

end