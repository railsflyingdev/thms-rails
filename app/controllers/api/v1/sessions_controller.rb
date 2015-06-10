class Api::V1::SessionsController < Api::V1::ApplicationController

  skip_before_filter :authenticate_with_token, only: :create

  def create
    @user = Employee.find_by(email: params[:email].downcase)
    if @user && @user.authenticate(params[:password])
      token = SecureRandom.uuid

      Rails.cache.write(token, @user, expires_in: 15.hours)

      headers['X-Set-Auth-Token'] = token
      render json: @user, status: :created
    else
      head :unauthorized
    end
  end

  def destroy

  end

  def check
    render json: current_user
  end

end