class EventTicketSerializer < ActiveModel::Serializer
  attributes :id, :event_name, :ticket_count, :first_event_date, :inventory_id
  has_many :tickets

  def event_name
    object.name
  end

  def inventory_id
    object.tickets.first.inventory_id
  end

  def first_event_date
    object.dates.first.event_period.begin.to_i
  end

  def ticket_count
    object.tickets.size
  end

end
