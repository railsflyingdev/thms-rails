class MenuItem < ActiveRecord::Base
  has_one :menu_section, through: :menu_section_item
  belongs_to :menu_section_item
  belongs_to :menu_item_category
end
