class EventDateSerializer < ActiveModel::Serializer
  attributes :id, :event_name, :event_data, :event_id

  def event_name
    object.event.name
  end

  def event_data
    object.event.data
  end
  # has_many :facilities

  def attributes
    hash = super
    hash["start"] = object.event_period.begin.to_i
    hash["finish"] = object.event_period.end.to_i
    hash
  end

end
