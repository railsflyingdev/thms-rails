class Api::V2::EventsController < Api::V2::ApplicationController

  def index
    @events = Event.includes(:dates).where(company_id: current_user.company.id).where("status < 'Closed'")
    render json: @events
  end

  def show
    @event = Event.find(params[:id])
    if @event
      render json: @event
    else
      head :not_found
    end

  end

  def update
    @event = Event.find(params[:id])
    if @event.update_attributes event_params
      render json: @event
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  def create
    @event = Event.new event_params
    #TODO Fix this
    @event.company = current_user.company
    if @event.save
      render json: @event, status: :created
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  def destroy
  end

  private
  def event_params
    params.permit(:name, :description, :event_type, :status)
  end
end