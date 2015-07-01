class UpcomingEventSerializer < ActiveModel::Serializer
  attributes :id, :name, :first_event_date, :venue_name, :event_type, :event_dates_count

  def venue_name
    object.company.name
  end

  def first_event_date
    object.dates.first.event_period.begin.to_i
  end

  def event_dates_count
    object.dates.size
  end
end
