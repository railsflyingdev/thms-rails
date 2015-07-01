class FacilityLeaseSerializer < ActiveModel::Serializer
  attributes :id, :facility_id, :company_id, :is_enabled
  has_one :facility, :company

  def attributes
    hash = super
    hash["start"] = object.lease_period.begin.to_i
    hash["finish"] = object.lease_period.end.to_i
    hash
  end
end
