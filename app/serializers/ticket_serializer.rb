class TicketSerializer < ActiveModel::Serializer
  attributes :id, :seat, :row, :storage

  def attributes
    hash = super
    # hash['event_name'] = object.event.name
    hash['event_start']  = object.event_date.event_period.begin.to_i
    hash['facility_name'] = object.facility.name
    hash
  end
end
