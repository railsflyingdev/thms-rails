class Api::V2::DatesController < Api::V2::ApplicationController
  def index
      @dates = EventDate.where(event_id: params[:event_id])
      if @dates
        render json: @dates
      else
        head :not_found
      end
  end

  def show
  end

  def update
    @date = EventDate.where(event_id: params[:event_id]).find(params[:id])

    if @date
      if @date.update_attributes event_date_params
        render json: @date
      else
        render json: @date.errors, status: :unprocessable_entity
      end
    else
      head :not_found
    end
  end

  def destroy
  end

  def create
    @date = EventDate.new event_date_params
    @date.event_id = params[:event_id]

    if @date.save
      render json: @date, status: :created
    else
      render json: @date.errors, status: :unprocessable_entity
    end
  end


  ## Facilities for releasing an event date into the inventory
  def release
    release_data = EventDate.data_for_release(params[:date_id])
    render json: release_data.to_json
  end

  ## Reporting shit
  def confirmations
    confirmations = EventDate.find(params[:id]).includes(:confirmed_inventory_options)
    render json: confirmations.to_json
  end

  private

  def event_date_params
    params.permit(:start, :finish)
  end
end
