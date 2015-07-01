class ConfirmedInventoryOptionSerializer < ActiveModel::Serializer
  attributes :id, :selection, :guests, :created_at, :is_attending, :data, :facility_name , :facility_number

  has_one :event_date
  has_one :company

  def facility_name
    object.facility.name
  end

  def facility_number
    object.facility.name.scan(/\d/).join('').to_i
  end

end
