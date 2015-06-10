class Api::V1::SecurityController < ApplicationController
  def reset_password
    @employee = Employee.for_password_token(params[:token])
    if @employee.reset_password!(reset_password_params)
      head :ok
    else
      head :bad_request
    end
  end

  def request_password_reset
    @employee = Employee.find_by_email(params[:email].downcase)

    if @employee
      token = @employee.reset_password_token
      MailgunMailer.reset_password_request(token, @employee, {url:request.base_url, ip:request.remote_ip}).deliver
    end

    head :created
  end

  private
    def reset_password_params
      params.permit(:token ,:password, :password_confirmation)
    end
end
