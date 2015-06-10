class RequestAttendance < ActiveRecord::Base
  belongs_to :released_inventory_request
  belongs_to :attendee, polymorphic: true
end
