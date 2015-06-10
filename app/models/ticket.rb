class Ticket < ActiveRecord::Base
  belongs_to :facility
  belongs_to :inventory
  belongs_to :event_date
  belongs_to :client, foreign_key: :client_id, class_name: :Company
  has_one :event, through: :event_date

  after_create :request_ticket_from_provider

  # Created when we do something and ticketek doesn't have tickets ready yet
  scope :unavailable, -> {where(status: 'unavailable')}

  # Ordered from Ticketek, waiting for completion
  scope :transiting, -> {where(status: 'transiting')}

  # Available to the system, not the clients
  scope :available, -> {where(status: 'available')}

  # Released to the suite holder
  scope :released, -> {where(status: 'released')}

  def request_ticket_from_provider
    if client.ticket_type == 'ezyticket'
      self.reload
      Resque.enqueue(TicketekRequestWorker, {
        event_code: "ESDS31AUG2014",
        facility: self.facility.name.gsub(/\D/,''),
        client: self.client.name,
        ref: self.reference_number
      })
    end

    true
  end

  store_accessor :storage, :storage_type
  store_accessor :storage, :file_name


end
