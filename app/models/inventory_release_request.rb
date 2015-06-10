class InventoryReleaseRequest < ActiveRecord::Base

  belongs_to :guest
  belongs_to :inventory_release

end
