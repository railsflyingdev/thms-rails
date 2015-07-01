class EventDateReportingSerializer < ActiveModel::Serializer
  attributes :id, :confirmations, :total_inventory, :start, :event_name

  def start
    object.event_period.begin.to_i
  end

  def confirmations
    object.inventories.confirmed.size
  end

  def total_inventory
    object.inventories.size
  end

  def event_name
    object.event.name
  end

  has_many :confirmed_inventory_options
end

