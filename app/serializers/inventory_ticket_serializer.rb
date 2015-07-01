class InventoryTicketSerializer < ActiveModel::Serializer
  attributes :id, :event_name, :ticket_count
  has_many :tickets

  def event_name
    object.event.name
  end

  def ticket_count
    object.tickets.size
  end
end
