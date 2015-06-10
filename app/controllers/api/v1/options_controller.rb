class Api::V1::OptionsController < Api::V1::ApplicationController
  def index

  end

  def create
    @confirmed_option = ConfirmedInventoryOption.new(selection: options_params)

    @confirmed_option.company = current_user.company
    @confirmed_option[:inventory_id] = params[:inventory_id]
    @confirmed_option[:host_details] = params[:host_details]
    @confirmed_option[:notes] = params[:notes]
    @confirmed_option[:is_attending] = params[:is_attending] if params[:is_attending]

    if @confirmed_option.save
      render json: params, status: :created
    else
      render json: params, status: :not_acceptable
    end

  end

  def show

  end

  private
  def options_params
    params.require(:selection).permit!
  end
end