class Api::V1::ApplicationController < ApplicationController
  # protect_from_forgery with: :null_session

  before_filter :authenticate_with_token

  def authenticate_with_token
    head status: :unauthorized unless (token && Rails.cache.exist?(token))
  end

  def current_user

    if request.headers['EH-Masquerading-As']
      return Employee.find(request.headers['EH-Masquerading-As'])
    end

    token && Rails.cache.fetch(token, expires_in: 15.minutes)
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

end