class Api::V2::My::TicketsController < Api::V2::ApplicationController
  def index

    if current_user.venue_admin?
      ids = current_user.company.inventories.map { |inv| inv.id }
      @tickets = Event.includes(tickets:[:event_date, :facility], dates:[]).where("tickets.status >= ?", 'available').references(:tickets)
    elsif current_user.client_admin?
      ids = current_user.company.client_inventories.map { |inv| inv.id }
      @tickets = Event.includes(tickets:[:event_date, :facility], dates:[]).where("tickets.inventory_id IN (?) AND tickets.client_id = ? AND now() < upper(event_dates.event_period) AND tickets.status >= ?", ids, current_user.company_id, 'released').references(:tickets, :event_date)
    end

    render json: @tickets, each_serializer: EventTicketSerializer
  end

end
