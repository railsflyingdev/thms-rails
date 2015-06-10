class MenuSectionItem < ActiveRecord::Base
  belongs_to :menu_item, foreign_key: :item_id
  belongs_to :menu_section, foreign_key: :section_id
end
