class Api::V1::My::ClientsController < Api::V1::ApplicationController

  def index
    @clients = current_user.company.clients
    render json: @clients
  end

  def create
    @client = Company.new(client_params)
    @client[:company_type] = :company
    @client[:address] = address_params
    @client[:config] = config_params
    @client[:contact] = contact_params
    @client[:notifications] = notification_params
    @client[:modules] = module_params

    if @client.save
      current_user.company.clients  << @client
      render json: @client
    else
      render json: @client.errors, status: :unprocessable_entity
    end

  end

  private
  def client_params
    params.permit(:name, :friendly_name)
  end

  def address_params
    params.require(:address).permit(:address1, :address2, :city, :suburb, :postcode, :state)
  end

  def notification_params
    params.require(:notifications).permit(:sms, :email)
  end

  def config_params
    params.require(:config).permit(:ticket)
  end

  def module_params
    params.require(:modules).permit(:guest)
  end

  def contact_params
    params.require(:contact).permit(:phone, :fax, :mobile)
  end

  def company_admin_params
    params.require(:admin).permit(:email)
  end
end
