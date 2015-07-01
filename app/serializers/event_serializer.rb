class EventSerializer < ActiveModel::Serializer
  attributes :id, :name, :event_type, :status, :description, :first_event_date, :event_date_count

  def first_event_date
    object.dates.first.event_period.begin.to_i unless object.dates.empty?
  end

  def event_date_count
    object.dates.size
  end

  # Dont know why that was there
  #  # has_many :inventories
end
