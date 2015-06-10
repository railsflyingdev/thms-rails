class Api::V1::InventoryController < Api::V1::ApplicationController
  def index

  end

  def show
    inventory = Inventory.where(client_id: params[:company_id]).find(params[:id])
    if inventory
      render json: inventory.event_date
    else
      head :not_found
    end
  end

  def create
    if Inventory.create(inventory_params[:data])
      render json: @inventories
    else
      head :not_implemented
    end
  end

  private
  def inventory_params
    params.permit({data:[:client_id, :company_id, :facility_id, :remaining, :total, :event_date_id]})
  end
end
