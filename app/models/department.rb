class Department < ActiveRecord::Base
  belongs_to :company
  has_many :employees
  has_many :inventory_releases
end
