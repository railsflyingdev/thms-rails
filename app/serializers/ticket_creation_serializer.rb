# This is the serializer in use with the manual tickets view on debug
class TicketCreationSerializer < ActiveModel::Serializer
  attributes :id, :event_date_id, :event_name, :event_start, :client_name, :facility_name, :ticket_count

  def client_name
    object.client.friendly_name
  end

  def facility_name
    object.facility.name
  end

  def event_date_id
    object.event_date.id
  end

  def event_name
    object.event_date.event.name
  end

  def event_start
    object.event_date.event_period.begin.to_i
  end

  def ticket_count
    object.tickets.size
  end

end
