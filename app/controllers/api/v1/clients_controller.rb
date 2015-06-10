class Api::V1::ClientsController < Api::V1::ApplicationController

  def index
    @clients = current_user.company.clients
    render json: @clients
  end

  def show
    @client = Company.find(params[:id])

    if @client
      render json: @client
    else
      head :not_found
    end
  end

  def leases
    @leases = FacilityLease.where(company_id: params[:id])
    render json: @leases
  end
end
