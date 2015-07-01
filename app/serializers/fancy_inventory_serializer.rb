class FancyInventorySerializer < InventorySerializer
  attributes :id, :event_name
  has_one :event_date
end
