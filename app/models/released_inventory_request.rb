class ReleasedInventoryRequest < ActiveRecord::Base
  belongs_to :inventory_release
  has_one :inventory, through: :inventory_release

  has_many :request_attendances
  belongs_to :requester, class_name: 'Employee'
  belongs_to :approval_path
  # belongs_to :strategic_reason
end
