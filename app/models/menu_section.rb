class MenuSection < ActiveRecord::Base
  default_scope { order('menu_sections.order ASC') }

  has_many :items, through: :menu_section_items, foreign_key: :item_id, source: :menu_item

  has_many :menu_section_items, foreign_key: :section_id

  belongs_to :menu
end
