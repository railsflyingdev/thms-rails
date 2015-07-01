class EventConfirmationSerializer < ActiveModel::Serializer
  attributes :id
  has_many :confirmed_inventory_options
end
