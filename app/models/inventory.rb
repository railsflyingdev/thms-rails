class Inventory < ActiveRecord::Base
  self.table_name = :inventory

  belongs_to :company
  belongs_to :event_date
  belongs_to :facility
  belongs_to :client, class_name: 'Company', foreign_key: :client_id
  has_one :confirmed_inventory_option
  has_one :event, through: :event_date

  has_many :tickets
  has_many :inventory_releases

  scope :confirmed, -> { where(ConfirmedInventoryOption.where('inventory_id = inventory.id').arel.exists) }
  scope :unconfirmed, -> {where(ConfirmedInventoryOption.where('inventory_id = inventory.id').arel.exists.not)}


  def self.for_client(client)
    sql = <<-SQL
      SELECT events.name, event_dates.event_period, facilities.name AS facility_name, inventory.status, inventory.options, events.id AS event_id, inventory.id AS inventory_id,
      inventory.created_at, inventory.remaining, inventory.reserved, inventory.total, events.event_type, companies.friendly_name AS venue,
      (SELECT cast(1 as boolean) FROM confirmed_options WHERE client_id = '#{client}' AND inventory_id = inventory.id LIMIT 1) AS is_confirmed
      FROM events
      JOIN event_dates ON event_dates.event_id = events.id
      JOIN inventory ON inventory.event_date_id = event_dates.id
      JOIN companies ON inventory.company_id = companies.id
      JOIN facilities ON inventory.facility_id = facilities.id
      WHERE inventory.client_id = '#{client}'
    SQL

    self.find_by_sql(sql)
  end
end
