class FacilitySerializer < ActiveModel::Serializer
  attributes :id, :name, :facility_type, :capacity, :current_leasee_name

  # has_one :current_active_lease

  def current_leasee_name
    object.current_active_lease.company.name if object.current_active_lease
  end
  # has_many :lease_periods
end
