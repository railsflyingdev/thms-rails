class InventoryRelease < ActiveRecord::Base

  belongs_to :inventory
  belongs_to :department
  belongs_to :company


  has_many :released_inventory_requests
  belongs_to :department

end
