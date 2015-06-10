class Api::V2::ConfirmationsController < Api::V2::ApplicationController

  def index
    if params[:inventory_id]
      #TODO expand this to get more than just one confirmation, i.e: when we have a confirmation history
      #TODO anything less than status 'closed'
      @confirmation = ConfirmedInventoryOption.where(inventory_id: params[:inventory_id]).first
      render json: @confirmation
    elsif current_user.company.company_type == 'venue'
      @confirmations = ConfirmedInventoryOption.includes(:company).joins(:inventory).where(inventory: {company_id: current_user.company.id})
      render json: @confirmations
   else
     head :not_implemented
   end

  end

    def update
      @confirmation = ConfirmedInventoryOption.find(params[:id])

      if @confirmation.update_attributes confirmation_params
        render json: @confirmation
      else
        render json: @confirmation.errors, status: :unprocessable_entity
      end
    end

    def destroy
      if ConfirmedInventoryOption.destroy(params[:id])
        head :ok
      end
    end

    private
    def confirmation_params
      params.permit(guests: [:name], data: [:hardTicketsSent, :parkingAllocated])
    end
  end