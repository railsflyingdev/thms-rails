class Menu < ActiveRecord::Base
  has_many :sections, class_name: 'MenuSection'
  has_many :items, through: :sections
  belongs_to :company
end
