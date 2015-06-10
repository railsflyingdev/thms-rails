class Api::V1::ConfirmedInventoryOptionsController < Api::V1::ApplicationController

  def delete

    if ConfirmedInventoryOption.delete_all("inventory_id = '#{params[:inventory_id]}'")
      render json: 200
    end
  end
end
