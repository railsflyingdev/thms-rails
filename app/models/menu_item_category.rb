class MenuItemCategory < ActiveRecord::Base
  belongs_to :parent, class_name: 'MenuItemCategory', foreign_key: :parent_id
  has_many :menu_items, foreign_key: :category_id
  has_many :children, class_name: 'MenuItemCategory', foreign_key: :parent_id

  scope :master_category, ->() { where('parent_id IS NULL') }
end
