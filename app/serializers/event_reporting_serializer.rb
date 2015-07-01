class EventReportingSerializer < ActiveModel::Serializer
  attributes :id, :name, :first_event_date
             # :confirmed_inventory_count, :inventory_count
  has_many :dates, serializer: SlimEventDateReportingSerializer

  def first_event_date
    object.dates.first.event_period.begin.to_i if object.dates.first
  end

  def confirmed_inventory_count
    object.inventories.confirmed.size
  end

  def inventory_count
    object.inventories.size
  end
end
