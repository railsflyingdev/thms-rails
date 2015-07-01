class MenuSectionSerializer < ActiveModel::Serializer
  embed :ids, include: true
  attributes :id, :name

  has_many :items
end
