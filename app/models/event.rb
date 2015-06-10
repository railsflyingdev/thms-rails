class Event < ActiveRecord::Base

  belongs_to :company

  has_many :dates, class_name: 'EventDate'
  has_many :inventories, through: :dates
  has_many :tickets, through: :inventories
  has_many :confirmed_inventory_options, through: :inventories

  scope :currently_open, -> { where( "events.status IN (?)", ['Open', 'Closing Soon']) }
  scope :reportable, -> { where( "events.status IN (?)", ['Open', 'Closing Soon', 'Closed']) }

  class << self
    def event_types
      types = self.all.select(:event_type).map{|type| {:value => type.event_type, :caption => type.event_type.upcase} }

      types << {:value => 'All Events', :caption => 'ALL EVENTS'}
      types.uniq.sort_by{ |t| t[:value]}
    end
  end
end
