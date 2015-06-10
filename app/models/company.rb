class Company < ActiveRecord::Base
  ## Address Accessors
  store_accessor :address, :address1
  store_accessor :address, :address2
  store_accessor :address, :postcode
  store_accessor :address, :suburb
  store_accessor :address, :state
  store_accessor :address, :city

  ## Contact Accessors
  store_accessor :contact, :phone
  store_accessor :contact, :fax

  ## Notification Accessors
  store_accessor :notifications, :notify_sms
  store_accessor :notifications, :notify_email

  ## Module Accessors
  store_accessor :modules, :guest_module

  ## Configuration Accessors
  store_accessor :config, :ticket_type



  has_many :menus
  has_many :events
  has_many :employees
  has_many :facilities
  has_many :inventories

  has_many :client_inventories, class_name: 'Inventory', foreign_key: :client_id

  has_many :inventory_tickets, class_name: 'Ticket', foreign_key: :client_id
  has_many :confirmed_inventory_options, foreign_key: :client_id
  has_many :event_dates, through: :events

  # has_many :client_companies
  has_many :facility_leases

  # has_many :clients, through: :client_companies

  has_and_belongs_to_many :clients, class_name: 'Company',
                          join_table: :clients_companies,
                          association_foreign_key: :client_id

  has_and_belongs_to_many :venues, class_name: 'Company',
                          join_table: :clients_companies,
                          association_foreign_key: :company_id,
                          foreign_key: :client_id

  belongs_to :manager, class_name: 'Employee'

  validates_presence_of :name, :friendly_name
  # validates_format_of :name, :friendly_name, with: /\A[[:alpha:]\s'"\-_&@!?()\[\]-]*\Z/u

  before_validation :set_friendly_name_from_name
  # before_validation :capitalize_names


  def self.search_with_uuids(uuids)
    self.find(uuids)
  end

  protected
  def set_friendly_name_from_name
    self.friendly_name = self[:name] if self[:name]
  end

  # def capitalize_names
  #   self.name = self.name.split.collect(&:capitalize).join(' ') if self.name && !self.name.blank?
  # end

end
