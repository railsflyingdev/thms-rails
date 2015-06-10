class Facility < ActiveRecord::Base
  has_many :inventories
  has_many :leasees, through: :lease_periods, class_name: 'Company', source: :company
  has_many :lease_periods, class_name: 'FacilityLease'
  belongs_to :company

  has_one :current_active_lease, -> { where('now() <@ companies_facilities.lease_period AND companies_facilities.is_enabled = true') }, class_name: 'FacilityLease'



  validates_presence_of :name, :company_id, :capacity, :facility_type
  validates_numericality_of :capacity, minimum: 1

  def current_leasee
    if lease_periods.active.length > 0
      return lease_periods.active.first.company
    end
  end



  before_save :capitalize_name

  def capitalize_name
    self.name.capitalize! if self.name && !self.name.blank?
  end
end
