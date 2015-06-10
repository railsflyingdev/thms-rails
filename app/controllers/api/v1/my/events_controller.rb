class Api::V1::My::EventsController < Api::V1::ApplicationController                          upcomingEvents
  def index
    # @internalEvents = current_user.company.events
    @upcomingEvents = Event.where("status = 'Coming Soon' ")
    @externalEvents = Inventory.for_client(current_user.company.id)

    render json: {
        inventory: @externalEvents,
        upcoming: @upcomingEvents
    }.to_json
    # head :ok
  end



end
