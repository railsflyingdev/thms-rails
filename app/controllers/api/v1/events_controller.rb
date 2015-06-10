class Api::V1::EventsController < Api::V1::ApplicationController
  def index
    render json: current_user.company.events
  end

  def show
    @event = current_user.company.events.find(params[:id])
    render json: @event
  end
end
