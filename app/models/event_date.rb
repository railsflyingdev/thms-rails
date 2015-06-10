class EventDate < ActiveRecord::Base
  belongs_to :event
  has_many :facilities, through: :inventories
  has_many :inventories

  has_many :confirmed_inventory_options, through: :inventories

  attr_accessor :start, :finish

  validates_numericality_of :finish, greater_than: :start

  before_save :create_timerange

  protected
  def create_timerange
    self.event_period = Time.at(self.start).utc...Time.at(self.finish).utc
  end

  def self.data_for_release(id)
    sql = <<-SQL
      SELECT facilities.name as facility_name, companies.name AS company_name, facilities.capacity AS total, facilities.capacity AS remaining,
      companies_facilities.company_id AS client_id, companies_facilities.facility_id, facilities.company_id, (SELECT '#{id}') AS event_date_id
      FROM companies_facilities
      JOIN facilities ON facilities.id = companies_facilities.facility_id
      JOIN companies ON companies.id = companies_facilities.company_id
      WHERE NOT EXISTS (SELECT * FROM inventory WHERE inventory.event_date_id = '#{id}' AND inventory.facility_id = companies_facilities.facility_id)
      AND (SELECT event_period FROM event_dates WHERE event_dates.id = '#{id}') <@ companies_facilities.lease_period
    SQL

    find_by_sql(sql)
  end
end
