class FacilityLease < ActiveRecord::Base
  self.table_name = :companies_facilities
  belongs_to :facility
  belongs_to :company
  before_save :create_timerange

  # define accessors for our virtual attributes
  attr_accessor :start, :finish

  scope :active, ->() { where('now() <@ companies_facilities.lease_period AND companies_facilities.is_enabled = true') }

  validates_numericality_of :finish, greater_than: :start


  protected
  def create_timerange
    self.lease_period = Time.at(self.start).utc...Time.at(self.finish).utc
  end

end
