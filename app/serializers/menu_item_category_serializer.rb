class MenuItemCategorySerializer < ActiveModel::Serializer
  attributes :id, :name
  has_many :children
  has_many :menu_items
end
